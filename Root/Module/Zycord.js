// mini-discordish-client.js
// Exported API: { Client, createClient }
// - No intents
// - Familiar events: ready, message, raw, debug, error, reconnect
// - Heartbeat (op 10 hello -> op 1 heartbeats), identify (op 2), ACK (op 11)
// - Auto-reconnect with delay
// - Adds: client.channels.fetch(id), channel.messages.fetch({ ... })
// - Minimal REST with simple 429 retry, configurable apiBase

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

// --- Channels + Messages managers (NEW) ---
class ChannelsManager {
  /** @param {Client} client */
  constructor(client) { this.client = client; }

  /**
   * Fetch a channel by ID from REST (cached unless force=true).
   * @param {string} id
   * @param {{force?: boolean}} [options]
   * @returns {Promise<TextLikeChannel>}
   */
  async fetch(id, { force = false } = {}) {
    const key = `channel:${id}`;
    if (!force && this.client._store.has(key)) {
      return this.client._store.get(key);
    }
    const data = await this.client._api(`/channels/${id}`);
    const channel = new TextLikeChannel(this.client, data);
    this.client._store.set(key, channel);
    return channel;
  }
}

class MessageManager {
  /** @param {Client} client @param {TextLikeChannel} channel */
  constructor(client, channel) {
    this.client = client;
    this.channel = channel;
  }

  /**
   * Fetch messages for channel.
   * @param {{ limit?: number, before?: string, after?: string, around?: string }} [options]
   * @returns {Promise<Array<object>>}
   */
  async fetch(options = {}) {
    const { limit = 50, before, after, around } = options;
    const query = {};
    if (limit != null) query.limit = String(Math.max(1, Math.min(100, Number(limit))));
    if (before) query.before = String(before);
    if (after) query.after = String(after);
    if (around) query.around = String(around);
    const messages = await this.client._api(`/channels/${this.channel.id}/messages`, { query });
    return Array.isArray(messages) ? messages : [];
  }
}

class TextLikeChannel {
  /** @param {Client} client @param {object} data */
  constructor(client, data) {
    this.client = client;
    this.patch(data);
    this.messages = new MessageManager(client, this);
  }
  patch(data) {
    if (!data || typeof data !== 'object') return this;
    // Shallow-assign the REST payload. You can pick fields if you prefer.
    Object.assign(this, data);
    return this;
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
   * @param {string} [options.apiBase='https://discord.com/api/v10'] REST base
   */
  constructor(options = {}) {
    super();
    const {
      wsEndpoint,
      properties,
      autoReconnect = true,
      reconnectDelay = 5000,
      apiBase = 'https://discord.com/api/v10' // NEW
    } = options;

    if (!wsEndpoint) {
      throw new Error('wsEndpoint is required (e.g., wss://gateway.example/ws)');
    }

    this.wsEndpoint = wsEndpoint;
    this.properties = properties || this._defaultProperties();
    this.autoReconnect = !!autoReconnect;
    this.reconnectDelay = Math.max(0, Number(reconnectDelay) || 0);
    this.apiBase = apiBase;

    // Internal state
    this._token = null;
    this._ws = null;
    this._heartbeatIntervalId = null;
    this._heartbeatIntervalMs = null;
    this._seq = null;
    this._sessionId = null;
    this._currentlyReconnecting = false;
    this._store = new Map();

    // Managers (NEW)
    this.channels = new ChannelsManager(this);
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

  // --- Minimal REST helpers (NEW) ---
  _authHeader() {
    if (!this._token) throw new Error('No token set. Call client.login(token) first.');
    // Respect pre-prefixed tokens ("Bot " / "Bearer "), otherwise default to "Bot "
    return /^(\s*Bot\s+|\s*Bearer\s+)/i.test(this._token) ? this._token : `Bot ${this._token}`;
  }

  /**
   * Perform a REST call to apiBase + path with simple 429 retry.
   * @param {string} path e.g. "/channels/123"
   * @param {{ method?: string, query?: Record<string,string>, body?: any, headers?: Record<string,string> }} [opts]
   */
  async _api(path, opts = {}) {
    const { method = 'GET', query, body, headers } = opts;
    const url = new URL(path, this.apiBase);
    if (query) for (const [k, v] of Object.entries(query)) url.searchParams.append(k, v);

    const res = await fetch(url.toString(), {
      method,
      headers: {
        'Authorization': this._authHeader(),
        'Content-Type': 'application/json',
        ...headers
      },
      body: body == null ? undefined : JSON.stringify(body)
    });

    // Handle 204 (no content)
    if (res.status === 204) return null;

    // Simple 429 handling with retry_after
    if (res.status === 429) {
      let retryAfterMs = 1000;
      try {
        const j = await res.json();
        if (j?.retry_after != null) {
          retryAfterMs = Number(j.retry_after) * 1000;
        } else {
          const ra = res.headers.get('Retry-After');
          if (ra) retryAfterMs = Number(ra) * 1000;
        }
      } catch { /* ignore */ }
      await this._sleep(retryAfterMs);
      return this._api(path, opts);
    }

    if (!res.ok) {
      const text = await res.text().catch(() => String(res.status));
      throw new Error(`API ${res.status} ${res.statusText}: ${text}`);
    }

    return res.json().catch(() => null);
  }
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
  reconnectDelay: 5000,

  // Optional: point to Discord REST (default shown)
  apiBase: 'https://discord.com/api/v10'
});

client.on('ready', ({ sessionId, user }) => {
  console.log('Ready:', sessionId, user);
});

// REST usage (requires token set; gateway connection not required to be READY)
(async () => {
  await client.login('YOUR_BOT_TOKEN'); // Can be "Bot xxx" or plain "xxx"

  // Fetch a channel
  const channel = await client.channels.fetch('YOUR_CHANNEL_ID');

  // Fetch last 10 messages
  const messages = await channel.messages.fetch({ limit: 10 });
  for (const m of messages) {
    console.log(`[${m.author?.username ?? m.author?.id}]: ${m.content}`);
  }
})().catch(console.error);

client.on('message', (payload) => {
  // payload = { op, t, s, d }
  console.log('Dispatch:', payload.t, payload.d);
});

client.on('debug', (msg, ctx) => console.debug('[debug]', msg, ctx));
client.on('error', (err) => console.error('[error]', err));
client.on('reconnect', () => console.log('Reconnected'));
*/
