// mini-discordish-client.js
// Exported API: { Client, createClient }
// - No intents
// - Familiar events: ready, message, raw, debug, error, reconnect
// - Heartbeat (op 10 hello -> op 1 heartbeats), identify (op 2), ACK (op 11)
// - Auto-reconnect with delay
// - No undefined functions; all hooks are via events

// --- Minimal EventEmitter ---
class Emitter {
  constructor() { this._events = new Map(); }
  on(event, listener) {
    const list = this._events.get(event) || [];
    list.push(listener);
    this._events.set(event, list);
    return this;
  }
  once(event, listener) {
    const wrap = (...args) => { this.off(event, wrap); listener(...args); };
    return this.on(event, wrap);
  }
  off(event, listener) {
    const list = this._events.get(event);
    if (!list) return this;
    const i = list.indexOf(listener);
    if (i > -1) list.splice(i, 1);
    if (list.length === 0) this._events.delete(event);
    else this._events.set(event, list);
    return this;
  }
  emit(event, ...args) {
    const list = this._events.get(event);
    if (!list) return false;
    for (const l of [...list]) {
      try { l(...args); } catch (e) { console.error('Listener error:', e); }
    }
    return true;
  }
}

// --- Client ---
export class Client extends Emitter {
  /**
   * @param {Object} options
   * @param {string} options.wsEndpoint Gateway URL (wss://…)
   * @param {Object} [options.properties] Identify properties { os, browser, device }
   * @param {boolean} [options.autoReconnect=true]
   * @param {number} [options.reconnectDelay=5000]
   */
  constructor(options = {}) {
    super();
    const {
      wsEndpoint,
      properties,
      autoReconnect = true,
      reconnectDelay = 5000
    } = options;

    if (!wsEndpoint) {
      throw new Error('wsEndpoint is required (e.g., wss://gateway.example/ws)');
    }

    this.wsEndpoint = wsEndpoint;
    this.properties = properties || this._defaultProperties();
    this.autoReconnect = !!autoReconnect;
    this.reconnectDelay = Math.max(0, Number(reconnectDelay) || 0);

    // Internal state
    this._token = null;
    this._ws = null;
    this._heartbeatIntervalId = null;
    this._heartbeatIntervalMs = null;
    this._seq = null;
    this._sessionId = null;
    this._currentlyReconnecting = false;
    this._store = new Map();
  }

  // Public API
  login(token) {
    if (!token) throw new Error('login(token) requires a token');
    this._token = token;
    this._connect();
    return Promise.resolve(token);
  }

  destroy() {
    this.autoReconnect = false;
    this._stopHeartbeat();
    if (this._ws && this._ws.readyState === WebSocket.OPEN) {
      try { this._ws.close(1000, 'Client destroy'); } catch {}
    }
    this._ws = null;
    this._currentlyReconnecting = false;
    return Promise.resolve();
  }

  // ——— Subfunctions (internal helpers) ———

  _defaultProperties() {
    const nav = typeof navigator !== 'undefined' ? navigator : null;
    return {
      os: (nav && (nav.platform || 'web')) || 'web',
      browser: (nav && (nav.userAgentData?.brands?.[0]?.brand || nav.userAgent || 'browser')) || 'browser',
      device: 'web'
    };
  }

  _connect() {
    this.emit('debug', 'Connecting', { endpoint: this.wsEndpoint });
    const ws = new WebSocket(this.wsEndpoint);
    this._ws = ws;

    ws.addEventListener('open', () => {
      this.emit('debug', 'Socket open');
      this._currentlyReconnecting = false;
      this._identify();
    });

    ws.addEventListener('message', (event) => {
      let payload;
      try { payload = JSON.parse(event.data); }
      catch (err) {
        this.emit('error', new Error(`Invalid JSON from gateway: ${err?.message || err}`));
        return;
      }

      const { op, t: type, s: seq, d: data } = payload;
      if (seq != null) this._seq = seq;

      this.emit('raw', payload);

      switch (op) {
        case 10: // Hello
          this._startHeartbeat(data?.heartbeat_interval);
          break;
        case 11: // Heartbeat ACK
          this.emit('debug', 'Heartbeat ACK');
          break;
        default:
          break;
      }

      // Dispatch handling
      if (type === 'READY') {
        this._sessionId = data?.session_id || null;
        this.emit('ready', { sessionId: this._sessionId, user: data?.user || null });
      } else if (type) {
        // Relay other gateway dispatches
        this.emit('message', { op, t: type, s: seq, d: data });
      }
    });

    ws.addEventListener('close', (ev) => {
      this.emit('debug', 'Socket close', { code: ev.code, reason: ev.reason });
      this._handleDisconnect('close', ev);
    });

    ws.addEventListener('error', (err) => {
      this.emit('error', err);
      this._handleDisconnect('error', err);
    });
  }

  _identify() {
    if (!this._ws || this._ws.readyState !== WebSocket.OPEN) return;
    const identify = {
      op: 2,
      d: {
        token: this._token,
        properties: this.properties
      }
    };
    this._ws.send(JSON.stringify(identify));
    this.emit('debug', 'Identify sent');
  }

  _startHeartbeat(intervalMs) {
    this._stopHeartbeat();
    if (!intervalMs || typeof intervalMs !== 'number') {
      this.emit('debug', 'No heartbeat interval provided by gateway');
      return;
    }
    this._heartbeatIntervalMs = intervalMs;
    this._heartbeatIntervalId = setInterval(() => {
      if (!this._ws || this._ws.readyState !== WebSocket.OPEN) return;
      const payload = { op: 1, d: this._seq ?? null };
      this._ws.send(JSON.stringify(payload));
      this.emit('debug', 'Heartbeat sent', { seq: this._seq ?? null });
    }, intervalMs);
    this.emit('debug', 'Heartbeat started', { intervalMs });
  }

  _stopHeartbeat() {
    if (this._heartbeatIntervalId) {
      clearInterval(this._heartbeatIntervalId);
      this._heartbeatIntervalId = null;
      this.emit('debug', 'Heartbeat stopped');
    }
  }

  async _handleDisconnect(kind, detail) {
    this._stopHeartbeat();
    if (this._ws) {
      try { this._ws.close(); } catch {}
      this._ws = null;
    }

    // Clear internal store on disconnect
    this._store.clear();

    if (!this.autoReconnect) return;
    if (this._currentlyReconnecting) return;

    this._currentlyReconnecting = true;
    this.emit('debug', 'Reconnecting soon…', { delay: this.reconnectDelay, kind, detail });

    await this._sleep(this.reconnectDelay);

    try {
      this._connect();
      this.emit('debug', 'Reconnect attempted');
      this._currentlyReconnecting = false;
      this.emit('reconnect');
    } catch (err) {
      this.emit('error', err);
      // Will try again on next close/error; you can add exponential backoff if desired.
    }
  }

  _sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
}

// Optional factory if you prefer a function API
export function createClient(options) {
  return new Client(options);
}

// Optional global attachment for <script type="module"> + window usage
if (typeof window !== 'undefined') {
  window.MiniDiscordish = window.MiniDiscordish || { Client, createClient };
}

/*
Usage example:

import { Client } from './mini-discordish-client.js';

const client = new Client({
  wsEndpoint: 'wss://your-gateway.example/ws',
  properties: { os: 'Linux', browser: 'Chrome', device: 'web' },
  autoReconnect: true,
  reconnectDelay: 5000
});

client.on('ready', ({ sessionId, user }) => {
  console.log('Ready:', sessionId, user);
});

client.on('message', (payload) => {
  // payload = { op, t, s, d }
  console.log('Dispatch:', payload.t, payload.d);
});

client.on('debug', (msg, ctx) => console.debug('[debug]', msg, ctx));
client.on('error', (err) => console.error('[error]', err));
client.on('reconnect', () => console.log('Reconnected'));

client.login('YOUR_AUTH_TOKEN');
*/
