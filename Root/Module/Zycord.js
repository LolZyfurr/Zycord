(function (global) {
    'use strict';
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
    class ChannelsManager {
        constructor(client) {
            this.client = client;
            this._dmIndexKey = 'dm:index';
        }
        async fetch(id, { force = false } = {}) {
            if (id) {
                const key = `channel:${id}`;
                if (!force && this.client._store.has(key)) {
                    return this.client._store.get(key);
                }
                await this._hydrateAllDMs({ force });
                return this.client._store.get(key);
            }
            if (!force && this.client._store.has(this._dmIndexKey)) {
                const ids = this.client._store.get(this._dmIndexKey);
                return ids.map(cid => this.client._store.get(`channel:${cid}`)).filter(Boolean);
            }
            return this._hydrateAllDMs({ force });
        }
        async _hydrateAllDMs({ force = false } = {}) {
            const list = await this.client._api('users/@me/channels');
            const ids = [];
            for (const data of list) {
                if (data.type !== 1) continue;
                const recipient = data.recipients?.[0];
                if (!recipient || recipient.bot) continue;
                const key = `channel:${data.id}`;
                if (force || !this.client._store.has(key)) {
                    const channel = new TextLikeChannel(this.client, data);
                    this.client._store.set(key, channel);
                }
                ids.push(data.id);
            }
            this.client._store.set(this._dmIndexKey, ids);
            return ids.map(cid => this.client._store.get(`channel:${cid}`)).filter(Boolean);
        }
    }
    class MessageManager {
        constructor(client, channel) {
            this.client = client;
            this.channel = channel;
        }
        async fetch(options = {}) {
            const { limit = 50, before, after, around } = options;
            const query = {};
            if (limit != null) query.limit = String(Math.max(1, Math.min(100, Number(limit))));
            if (before) query.before = String(before);
            if (after) query.after = String(after);
            if (around) query.around = String(around);
            const messages = await this.client._api(`channels/${this.channel.id}/messages`, { query });
            const list = Array.isArray(messages) ? messages : [];
            for (const m of list) {
                if (m && m.author) this.client._attachPresenceHelpers(m.author);
            }
            return list;
        }
        async search({
            authorId,
            content,
            minId,
            maxId,
            offset = 0,
            sortBy = 'timestamp',
            sortOrder = 'desc'
        } = {}) {
            const query = new URLSearchParams();
            if (authorId) query.append('author_id', String(authorId));
            if (content) query.append('content', content);
            if (minId) query.append('min_id', String(minId));
            if (maxId) query.append('max_id', String(maxId));
            query.append('sort_by', sortBy);
            query.append('sort_order', sortOrder);
            query.append('offset', String(offset));
            const endpoint = `channels/${this.channel.id}/messages/search?${query.toString()}`;
            const result = await this.client._api(endpoint);
            const messages = result?.messages?.flat() || [];
            for (const m of messages) {
                if (m?.author) this.client._attachPresenceHelpers(m.author);
            }
            return {
                total_results: Number(result?.total_results ?? 0),
                messages
            };
        }
    }
    class TextLikeChannel {
        constructor(client, data) {
            this.client = client;
            this.patch(data);
            this.messages = new MessageManager(client, this);
        }
        patch(data) {
            if (!data || typeof data !== 'object') return this;
            Object.assign(this, data);
            if (Array.isArray(this.recipients)) {
                for (const r of this.recipients) this.client._attachPresenceHelpers(r);
            }
            return this;
        }
        get user() {
            if (Array.isArray(this.recipients) && this.recipients.length) {
                const u = this.recipients.find(r => !r?.bot) || this.recipients[0] || null;
                if (u) this.client._attachPresenceHelpers(u);
                return u || null;
            }
            return null;
        }
    }
    class Client extends Emitter {
        constructor(options = {}) {
            super();
            const {
                properties,
                autoReconnect = true,
                reconnectDelay = 5000,
                apiBase = 'https://discord.com/api/v10/'
            } = options;
            this.properties = properties || this._defaultProperties();
            this.autoReconnect = !!autoReconnect;
            this.reconnectDelay = Math.max(0, Number(reconnectDelay) || 0);
            this.apiBase = apiBase;
            this._isBot = null;
            this._token = null;
            this._ws = null;
            this._heartbeatIntervalId = null;
            this._heartbeatIntervalMs = null;
            this._seq = null;
            this._sessionId = null;
            this._currentlyReconnecting = false;
            this._store = new Map();
            this._presence = null;
            this._lastPresenceAt = 0;
            this.user = null;
            this._attachPresenceHelpers = this._attachPresenceHelpers.bind(this);
            this.channels = new ChannelsManager(this);
        }
        login(token, loginBot = false) {
            if (!token) {
                throw new Error('login(token) requires a token');
            }
            this._isBot = Boolean(loginBot);
            this._token = this._isBot ? `Bot ${token.trim()}` : token.trim();
            this._connect();
            return Promise.resolve(token);
        }
        destroy() {
            this.autoReconnect = false;
            this._stopHeartbeat();
            if (this._ws && this._ws.readyState === WebSocket.OPEN) {
                try { this._ws.close(1000, 'Client destroy'); } catch { }
            }
            this._ws = null;
            this._currentlyReconnecting = false;
            return Promise.resolve();
        }
        _defaultProperties() {
            const nav = typeof navigator !== 'undefined' ? navigator : null;
            return {
                os: (nav && (nav.platform || 'web')) || 'web',
                browser: (nav && (nav.userAgentData?.brands?.[0]?.brand || nav.userAgent || 'browser')) || 'browser',
                device: 'web'
            };
        }
        _presenceKey(userId) { return `presences:${userId}`; }
        _storePresence(presence) {
            const user = presence?.user;
            if (!user || !user.id) return null;
            this._store.set(this._presenceKey(user.id), presence);
            this.emit('presenceUpdate', { user, presence });
        }
        getPresence(userId) {
            return this._store.get(this._presenceKey(userId)) || null;
        }
        _attachPresenceHelpers(obj) {
            if (!obj || typeof obj !== 'object') return;
            const client = this;
            const defineHelper = (target) => {
                if (!target || typeof target !== 'object') return;
                if (!Object.prototype.hasOwnProperty.call(target, 'getPrescence')) {
                    Object.defineProperty(target, 'getPrescence', {
                        value: function () {
                            const id = this?.id ?? this?.user?.id ?? this?.author?.id ?? null;
                            return id ? client.getPresence(id) : null;
                        },
                        enumerable: false,
                        configurable: true,
                        writable: false
                    });
                }
                if (!Object.prototype.hasOwnProperty.call(target, 'getPresence')) {
                    Object.defineProperty(target, 'getPresence', {
                        value: target.getPrescence,
                        enumerable: false,
                        configurable: true,
                        writable: false
                    });
                }
            };
            defineHelper(obj);
            if (obj.user && typeof obj.user === 'object') defineHelper(obj.user);
            if (obj.author && typeof obj.author === 'object') defineHelper(obj.author);
        }
        _normalizeActivity(a = {}) {
            const typeMap = {
                PLAYING: 0,
                STREAMING: 1,
                LISTENING: 2,
                WATCHING: 3,
                CUSTOM: 4,
                COMPETING: 5
            };
            let type = a.type;
            if (typeof type === 'string') type = typeMap[type.toUpperCase()] ?? 0;
            if (typeof type !== 'number') type = 0;
            const out = {
                name: String(a.name || ''),
                type,
                id: a.id,
                application_id: a.application_id,
                assets: a.assets,
                details: a.details,
                timestamps: a.timestamps,
                buttons: a.buttons,
                party: a.party,
                created_at: a.created_at ? Number(a.created_at) : null,
                metadata: a.metadata || {},
                session_id: a.session_id || null,
                state: a.state || '',
                sync_id: a.sync_id || null,
                flags: a.flags || 0,
                emoji: a.emoji || null
            };
            if (type === 1 && a.url) {
                out.url = String(a.url);
            }
            if (type === 4 && typeof a.state === 'string') {
                out.state = a.state;
            }
            return out;
        }
        _normalizePresence(p = {}) {
            const status = (p.status || 'online').toLowerCase();
            const activities = Array.isArray(p.activities)
                ? p.activities.map(a => this._normalizeActivity(a)).filter(a => a.name)
                : [];
            const since = Number.isFinite(p.since) ? Number(p.since) : null;
            const afk = !!p.afk;
            return { since, activities, status, afk };
        }
        _canSendPresence() {
            const now = Date.now();
            if (!this._lastPresenceAt || (now - this._lastPresenceAt) >= 10000) { // 10s
                this._lastPresenceAt = now;
                return true;
            }
            return false;
        }
        setPresence(presence = {}) {
            const d = this._normalizePresence(presence);
            this._presence = d;
            if (this._ws && this._ws.readyState === WebSocket.OPEN) {
                try {
                    this._ws.send(JSON.stringify({ op: 3, d }));
                    this.emit('debug', 'Presence sent', d);
                    this.emit('presenceSelfUpdate', d);
                } catch (e) {
                    this.emit('error', new Error('Failed to send presence: ' + (e?.message || e)));
                }
            } else {
                this.emit('debug', 'WebSocket not open, presence not sent', d);
            }
            return d;
        }
        _connect() {
            this.emit('debug', 'Connecting');
            const ws = new WebSocket('wss://gateway.discord.gg/?v=10&encoding=json');
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
                    case 10:
                        this._startHeartbeat(data?.heartbeat_interval);
                        break;
                    case 11:
                        this.emit('debug', 'Heartbeat ACK');
                        break;
                    default:
                        break;
                }
                if (type === 'READY') {
                    this._sessionId = data?.session_id || null;
                    if (Array.isArray(data?.presences)) {
                        for (const presence of data.presences) {
                            this._storePresence(presence);
                        }
                    }
                    if (data?.user) {
                        this.user = Object.assign(this.user || {}, data.user);
                        if (!Object.prototype.hasOwnProperty.call(this.user, 'setPresence')) {
                            Object.defineProperty(this.user, 'setPresence', {
                                value: (p) => this.setPresence(p),
                                enumerable: false
                            });
                        }
                        this._attachPresenceHelpers(this.user);
                    }
                    if (data?.user) this._attachPresenceHelpers(data.user);
                    if (data?.user_settings && this.user) {
                        const { custom_status, status } = data.user_settings;
                        const presence = {
                            status: status || 'online',
                            since: null,
                            afk: false
                        };
                        if (custom_status?.text) {
                            const activity = {
                                id: 'custom',
                                type: 4,
                                name: 'Custom Status',
                                state: custom_status.text || ''
                            };
                            presence.activities = [activity];
                        }
                        this.user.setPresence(presence);
                    }
                    this.emit('ready', { sessionId: this._sessionId, user: data?.user || null });
                    if (this._presence && this._ws && this._ws.readyState === WebSocket.OPEN) {
                        try {
                            this._ws.send(JSON.stringify({ op: 3, d: this._presence }));
                            this.emit('debug', 'Presence flushed post-READY', this._presence);
                        } catch { /* ignore */ }
                    }
                } else if (type === 'PRESENCE_UPDATE') {
                    if (data) this._storePresence(data);
                } else if (type === 'INTERACTION_CREATE' && data?.type === 2) {
                    const client = this;

                    const interaction = {
                        ...data,

                        // Matches discord.js-style: returns name of first subcommand, or null
                        getSubcommand(required = true) {
                            try {
                                const opts = data.data?.options;
                                if (!opts || !Array.isArray(opts)) {
                                    if (required) throw new Error('No subcommand provided');
                                    return null;
                                }
                                // Look for type 1 = SUB_COMMAND
                                const sub = opts.find(o => o.type === 1);
                                if (!sub) {
                                    if (required) throw new Error('No subcommand found');
                                    return null;
                                }
                                return sub.name;
                            } catch (err) {
                                throw err;
                            }
                        },

                        // Immediately acknowledge and send final reply
                        reply: async (content) => {
                            const body = typeof content === 'string' ? { content } : content;
                            return client._api(
                                `interactions/${data.id}/${data.token}/callback`,
                                {
                                    method: 'POST',
                                    auth: false,
                                    body: {
                                        type: 4, // CHANNEL_MESSAGE_WITH_SOURCE
                                        data: body
                                    }
                                }
                            );
                        },

                        // Acknowledge without content so you can reply later
                        deferReply: async () => {
                            return client._api(
                                `interactions/${data.id}/${data.token}/callback`,
                                {
                                    method: 'POST',
                                    auth: false,
                                    body: { type: 5 } // DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE
                                }
                            );
                        },

                        editReply: async (content) => {
                            const body = typeof content === 'string' ? { content } : content;
                            return client._api(
                                `webhooks/${data.application_id}/${data.token}/messages/@original`,
                                {
                                    method: 'PATCH',
                                    auth: false,
                                    body
                                }
                            );
                        },

                        followUp: async (content) => {
                            const body = typeof content === 'string' ? { content } : content;
                            return client._api(
                                `webhooks/${data.application_id}/${data.token}`,
                                {
                                    method: 'POST',
                                    auth: false,
                                    body
                                }
                            );
                        }
                    };

                    this.emit('slashCommand', interaction);
                } else if (type === 'SESSIONS_REPLACE') {
                    this.emit('debug', 'Session replace called', data);
                    if (Array.isArray(data)) {
                        const allSession = data.find(session => session?.session_id === 'all');
                        if (allSession) {
                            const sessionWithUser = {
                                ...allSession,
                                user: this.user
                            };
                            this.emit('debug', 'Session replace data', sessionWithUser);
                            this._storePresence(sessionWithUser);
                        }
                    }
                } else if (type) {
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
                    properties: this.properties,
                    ...(this._presence ? { presence: this._presence } : {}),
                    ...(this._isBot
                        ? {
                            intents:
                                (1 << 0)
                                | (1 << 1)
                                | (1 << 2)
                                | (1 << 3)
                                | (1 << 4)
                                | (1 << 5)
                                | (1 << 6)
                                | (1 << 7)
                                | (1 << 8)
                                | (1 << 9)
                                | (1 << 10)
                                | (1 << 11)
                                | (1 << 12)
                                | (1 << 13)
                                | (1 << 14)
                                | (1 << 15)
                                | (1 << 16)
                                | (1 << 20)
                                | (1 << 21)
                                | (1 << 24)
                                | (1 << 25)
                        }
                        : {})
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
                try { this._ws.close(); } catch { }
                this._ws = null;
            }
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
            }
        }
        _sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
        _authHeader() {
            if (!this._token) throw new Error('No token set. Call client.login(token) first.');
            return /^(\s*Bot\s+|\s*Bearer\s+)/i.test(this._token) ? this._token : `${this._token}`;
        }
        async _api(path, opts = {}) {
            const {
                method = 'GET',
                query,
                body,
                headers = {},
                auth = true
            } = opts;
            const url = new URL(path, this.apiBase);
            if (query) {
                for (const [k, v] of Object.entries(query)) {
                    url.searchParams.append(k, v);
                }
            }
            const finalHeaders = {
                'Content-Type': 'application/json',
                ...headers
            };
            if (auth) {
                finalHeaders['Authorization'] = this._authHeader();
            }
            const res = await fetch(url.toString(), {
                method,
                headers: finalHeaders,
                body: body == null ? undefined : JSON.stringify(body)
            });
            if (res.status === 204) return null;
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
                } catch { /* ignore parse errors */ }
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
    function createClient(options) {
        return new Client(options);
    }
    const api = { Client, createClient };
    if (global) {
        global.MiniDiscordish = global.MiniDiscordish || api;
    }
})(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : this));
