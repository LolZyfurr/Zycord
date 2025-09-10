(function (global) {
    'use strict';
    class ZycordUI {
        constructor() {
            this.EnumTypes = {
                ActivityType: {
                    Music: { id: "act-music", className: "music", label: "Listening to" },
                    Game: { id: "act-game", className: "game", label: "Playing" },
                    Stream: { id: "act-stream", className: "stream", label: "Streaming" },
                    Watch: { id: "act-watch", className: "watch", label: "Watching" }
                },
                StatusType: {
                    online: { className: "online" },
                    idle: { className: "idle" },
                    dnd: { className: "dnd" },
                    offline: { className: "offline" }
                }
            };
        }

        /* ---------- Utility Methods ---------- */

        createEl(tag, attrs = {}, children = []) {
            const el = document.createElement(tag);
            for (const [key, val] of Object.entries(attrs)) {
                if (val === false || val == null) continue;
                if (key === "style" && typeof val === "object") {
                    for (const [prop, styleVal] of Object.entries(val)) {
                        el.style.setProperty(prop, styleVal);
                    }
                } else if (key === "class" || key === "className") {
                    el.className = val;
                } else if (typeof val === "boolean") {
                    if (val) el.setAttribute(key, "");
                } else {
                    el.setAttribute(key, val);
                }
            }
            (Array.isArray(children) ? children : [children]).forEach(child => {
                if (child != null) {
                    el.appendChild(typeof child === "string" ? document.createTextNode(child) : child);
                }
            });
            return el;
        }

        matchEnum(value, enumObj) {
            if (!value) return null;
            if (typeof value === "object" && value.className) return value;
            if (typeof value === "string") {
                const key = Object.keys(enumObj).find(k => k.toLowerCase() === value.toLowerCase());
                return key ? enumObj[key] : null;
            }
            return null;
        }

        createUid(prefix = 'id') {
            if (typeof crypto !== 'undefined' && crypto.randomUUID) return `${prefix}-${crypto.randomUUID()}`;
            return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
        }

        loadImage(el, { src, alt = "", fallback, width, height }) {
            if (width) el.setAttribute("width", String(width));
            if (height) el.setAttribute("height", String(height));
            el.loading = "lazy";
            el.decoding = "async";
            el.referrerPolicy = "no-referrer";
            el.alt = alt;
            el.src = src || fallback || "";
            if (fallback) {
                el.onerror = () => {
                    if (el.src !== fallback) el.src = fallback;
                };
            }
            return el;
        }

        /* ---------- Core Features ---------- */

        async executeSearchFlow(el) {
            const target = document.querySelector('.zc-window-scroller');
            if (!target) return;
            if (getComputedStyle(el).position === 'static') {
                el.style.position = 'relative';
            }
            const getControl = (root) => {
                if (root.matches('input, textarea, [contenteditable="true"]')) return root;
                return root.querySelector('input, textarea, [contenteditable="true"]');
            };
            const control = getControl(el);
            if (!control) return;
            const getValue = () =>
                control.matches('[contenteditable="true"]') ? (control.textContent || '') : (control.value || '');
            const setValue = (s) => {
                if (control.matches('[contenteditable="true"]')) {
                    control.textContent = s;
                } else {
                    control.value = s;
                }
            };
            const placeCaretEnd = () => {
                if (!control.matches('[contenteditable="true"]')) {
                    const len = control.value.length;
                    control.setSelectionRange(len, len);
                    return;
                }
                const range = document.createRange();
                range.selectNodeContents(control);
                range.collapse(false);
                const sel = window.getSelection();
                sel.removeAllRanges();
                sel.addRange(range);
            };
            const normalize = (s) =>
                (s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
            const capitalize = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);
            const nameKey = 'search-name';
            let items = Array.from(target.querySelectorAll(`[data-${nameKey}]`));
            if (items.length === 0) {
                items = Array.from(target.children).filter((n) => n.nodeType === 1);
            }
            items.forEach((child) => {
                if (!child.dataset.prevDisplay) {
                    const computed = getComputedStyle(child).display;
                    child.dataset.prevDisplay = computed === 'none' ? '' : computed;
                }
            });
            const validPrefixes = [
                'has:',
                'status:',
                'activity:',
                'badge:',
                'text:',
                'user:',
                'nameplate:',
                'username:'
            ];
            const explicitMap = {
                status: 'searchStatus',
                activity: 'searchActivity',
                badge: 'searchBadge',
                text: 'searchActivityText',
                user: 'searchUserId',
                nameplate: 'hasNameplate',
                username: 'searchUsername'
            };
            const datasetValueForKey = (child, keyNoColon) => {
                const mapped = explicitMap[keyNoColon];
                if (mapped && child.dataset[mapped] != null) {
                    return normalize(child.dataset[mapped]);
                }
                const cap = capitalize(keyNoColon);
                const a = child.dataset[`search${cap}`];
                const b = child.dataset[`has${cap}`];
                return normalize(a || b || '');
            };
            const levenshtein = (a, b) => {
                const m = a.length;
                const n = b.length;
                const dp = Array.from({
                    length: m + 1
                }, () => new Array(n + 1).fill(0));
                for (let i = 0; i <= m; i++) dp[i][0] = i;
                for (let j = 0; j <= n; j++) dp[0][j] = j;
                for (let i = 1; i <= m; i++) {
                    for (let j = 1; j <= n; j++) {
                        if (a[i - 1] === b[j - 1]) dp[i][j] = dp[i - 1][j - 1];
                        else dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
                    }
                }
                return dp[m][n];
            };
            const getClosestPrefixes = (inputPrefix) => {
                const norm = normalize(inputPrefix);
                return validPrefixes
                    .map((p) => ({
                        prefix: p,
                        score: p.startsWith(norm) ? 0 : levenshtein(norm, p)
                    }))
                    .sort((a, b) => a.score - b.score)
                    .slice(0, 5)
                    .map((x) => x.prefix);
            };
            let suggestEl = null;
            let activeIndex = -1;
            let currentOptions = [];
            const ensureSuggestEl = () => {
                if (suggestEl) return suggestEl;
                suggestEl = document.createElement('div');
                suggestEl.className = 'zc-suggest-pop';
                suggestEl.setAttribute('role', 'listbox');
                suggestEl.id = `zc-suggest-${Math.random().toString(36).slice(2)}`;
                const ul = document.createElement('ul');
                ul.className = 'zc-suggest-list';
                suggestEl.appendChild(ul);
                el.appendChild(suggestEl);
                control.setAttribute('aria-controls', suggestEl.id);
                control.setAttribute('aria-expanded', 'false');
                control.setAttribute('aria-autocomplete', 'list');
                return suggestEl;
            };
            const hideSuggestions = () => {
                if (suggestEl) {
                    suggestEl.remove();
                    suggestEl = null;
                }
                control.setAttribute('aria-expanded', 'false');
                activeIndex = -1;
                currentOptions = [];
                control.removeAttribute('aria-activedescendant');
            };
            const renderSuggestions = (list) => {
                const host = ensureSuggestEl();
                const ul = host.querySelector('.zc-suggest-list');
                ul.innerHTML = '';
                currentOptions = list.slice();
                list.forEach((p, i) => {
                    const li = document.createElement('li');
                    li.className = 'zc-suggest-opt';
                    li.setAttribute('role', 'option');
                    li.id = `${host.id}-opt-${i}`;
                    li.textContent = p;
                    li.setAttribute('aria-selected', i === activeIndex ? 'true' : 'false');
                    li.addEventListener('mousedown', (e) => {
                        e.preventDefault();
                        applySuggestion(p);
                    });
                    ul.appendChild(li);
                });
                control.setAttribute('aria-expanded', 'true');
            };
            const updateActive = (nextIndex) => {
                if (!suggestEl) return;
                const ul = suggestEl.querySelector('.zc-suggest-list');
                const opts = Array.from(ul.children);
                activeIndex = Math.max(0, Math.min(nextIndex, opts.length - 1));
                opts.forEach((li, i) => li.setAttribute('aria-selected', i === activeIndex ? 'true' : 'false'));
                const activeId = opts[activeIndex]?.id;
                if (activeId) control.setAttribute('aria-activedescendant', activeId);
                opts[activeIndex]?.scrollIntoView({
                    block: 'nearest'
                });
            };
            const showSuggestions = (suggestions) => {
                if (!suggestions.length) {
                    hideSuggestions();
                    return;
                }
                if (activeIndex >= suggestions.length) activeIndex = -1;
                renderSuggestions(suggestions);
            };
            const applySuggestion = (chosenPrefix) => {
                const raw = getValue();
                const rest = raw.replace(/^\s*\w*:?\s*/, '');
                const next = `${chosenPrefix}${rest ? rest : ''}`;
                setValue(next);
                placeCaretEnd();
                hideSuggestions();
                applyFilter();
            };
            const applyFilter = () => {
                const rawQuery = getValue();
                const query = normalize(rawQuery);
                const showAll = query === '';
                let prefix = '';
                let value = query;
                const prefixMatch = query.match(/^(\w+):\s*(.*)$/);
                if (prefixMatch) {
                    prefix = normalize(prefixMatch[1]) + ':';
                    value = normalize(prefixMatch[2] || '');
                }
                if (prefix && !validPrefixes.includes(prefix)) {
                    const suggestions = getClosestPrefixes(prefix);
                    showSuggestions(suggestions);
                } else {
                    hideSuggestions();
                }
                items.forEach((child) => {
                    let match = false;
                    if (showAll) {
                        match = true;
                    } else if (prefix && validPrefixes.includes(prefix)) {
                        const keyNoColon = prefix.slice(0, -1);
                        const dataVal = datasetValueForKey(child, keyNoColon);
                        match = value ? dataVal.includes(value) : dataVal !== '';
                    } else {
                        const username = normalize(child.dataset.searchUsername || '');
                        match = username.includes(query);
                    }
                    child.style.display = match ? child.dataset.prevDisplay : 'none';
                    child.setAttribute('aria-hidden', match ? 'false' : 'true');
                });
            };
            const onKeyDown = (e) => {
                if (!suggestEl) return;
                if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    updateActive(activeIndex < 0 ? 0 : activeIndex + 1);
                } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    updateActive(activeIndex <= 0 ? 0 : activeIndex - 1);
                } else if (e.key === 'Enter' || e.key === 'Tab') {
                    if (activeIndex >= 0 && currentOptions[activeIndex]) {
                        e.preventDefault();
                        applySuggestion(currentOptions[activeIndex]);
                    }
                } else if (e.key === 'Escape') {
                    hideSuggestions();
                }
            };
            const onOutsidePointerDown = (e) => {
                if (!suggestEl) return;
                if (!el.contains(e.target)) hideSuggestions();
            };
            ['input', 'change', 'keyup', 'compositionend'].forEach((evt) =>
                control.addEventListener(evt, applyFilter)
            );
            control.addEventListener('keydown', onKeyDown);
            document.addEventListener('pointerdown', onOutsidePointerDown);
            const cleanup = () => {
                control.removeEventListener('keydown', onKeyDown);
                document.removeEventListener('pointerdown', onOutsidePointerDown);
                hideSuggestions();
            };
            el.addEventListener('DOMNodeRemoved', cleanup, {
                once: true
            });
            applyFilter();
        }

        createBottomOverlay({
            classNames = [],
            closeOnBackdrop = false,
            enablePullToClose = true,
            dragThreshold = 90,
            velocityThreshold = 0.45,
            resistance = 0.5,
            lockChildOverflowsDuringDrag = true,
            onDestroy = () => { }
        } = {}) {
            function el(tag, cls = [], txt = '') {
                const e = document.createElement(tag);
                const list = Array.isArray(cls) ? cls : [cls];
                list.filter(Boolean).forEach(c => e.classList.add(c));
                if (txt) e.textContent = txt;
                return e;
            }
            const overlay = el('div', ['zc-screen-overlay', ...classNames]);
            const windowEl = el('div', 'zc-bottom-overlay-window');
            overlay.appendChild(windowEl);
            if (closeOnBackdrop) {
                overlay.addEventListener('click', evt => {
                    if (evt.target === overlay) api.destroy();
                });
            }
            function isScrollableY(node) {
                const cs = getComputedStyle(node);
                const oy = cs.overflowY;
                if (oy === 'hidden' || oy === 'visible') return false;
                return node.scrollHeight - node.clientHeight > 1;
            }
            function findDominantScroller(root) {
                const marked = root.querySelector('[data-sheet-scroll]');
                if (marked && isScrollableY(marked)) return marked;
                const candidates = Array.from(root.querySelectorAll('*')).filter(isScrollableY);
                if (!candidates.length) return null;
                candidates.sort((a, b) => {
                    const dh = b.scrollHeight - a.scrollHeight;
                    return dh !== 0 ? dh : (b.clientHeight - a.clientHeight);
                });
                return candidates[0] || null;
            }
            function createOverflowLocker() {
                const changed = [];
                return {
                    lock(root) {
                        if (!lockChildOverflowsDuringDrag) return;
                        const nodes = root.querySelectorAll('*');
                        for (const node of nodes) {
                            const cs = getComputedStyle(node);
                            if (cs.overflowY !== 'hidden') {
                                const prevOverflow = node.style.overflow;
                                const prevOverflowY = node.style.overflowY;
                                changed.push([node, prevOverflow, prevOverflowY]);
                                node.style.overflow = node.style.overflow || '';
                                node.style.overflowY = 'hidden';
                            }
                        }
                    },
                    unlock() {
                        for (const [node, prevOverflow, prevOverflowY] of changed) {
                            node.style.overflow = prevOverflow || '';
                            node.style.overflowY = prevOverflowY || '';
                        }
                        changed.length = 0;
                    }
                };
            }
            let dominantScroller = null;
            const overflowLocker = createOverflowLocker();
            let dragging = false;
            let eligible = false;
            let startY = 0;
            let startT = 0;
            let lastY = 0;
            let lastT = 0;
            let dy = 0;
            let raf = 0;
            function scrollerAtTop() {
                if (!dominantScroller) dominantScroller = findDominantScroller(windowEl);
                if (!dominantScroller) return true;
                return (dominantScroller.scrollTop || 0) <= 0;
            }
            function setTranslate(y) {
                windowEl.style.transform = `translateY(${y}px)`;
                const alpha = Math.max(0, 1 - Math.min(1, y / 240));
                overlay.style.opacity = String(alpha);
            }
            function rubberband(dist) {
                return dist * resistance;
            }
            function onPointerDown(e) {
                if (e.pointerType && e.pointerType !== 'touch' && e.pointerType !== 'pen') return;
                if (e.button !== undefined && e.button !== 0) return;
                startY = (e.touches ? e.touches[0].clientY : e.clientY);
                startT = performance.now();
                lastY = startY;
                lastT = startT;
                dy = 0;
                dragging = false;
                eligible = enablePullToClose && scrollerAtTop();
                if (e.target.setPointerCapture && e.pointerId !== undefined) {
                    try {
                        e.target.setPointerCapture(e.pointerId);
                    } catch { }
                }
            }
            function onPointerMove(e) {
                if (!enablePullToClose) return;
                const y = (e.touches ? e.touches[0].clientY : e.clientY);
                const t = performance.now();
                const deltaY = y - startY;
                if (deltaY <= 0) {
                    lastY = y;
                    lastT = t;
                    return;
                }
                if (!eligible) {
                    if (scrollerAtTop() && deltaY > 4) eligible = true;
                    else {
                        lastY = y;
                        lastT = t;
                        return;
                    }
                }
                if (e.cancelable) e.preventDefault();
                if (!dragging) {
                    dragging = true;
                    overlay.classList.add('dragging');
                    overflowLocker.lock(windowEl);
                }
                dy = rubberband(deltaY);
                if (!raf) {
                    raf = requestAnimationFrame(() => {
                        setTranslate(dy);
                        raf = 0;
                    });
                }
                lastY = y;
                lastT = t;
            }
            function finishDrag(completeClose) {
                overlay.classList.remove('dragging');
                overlay.style.removeProperty('opacity');
                windowEl.style.transition = '';
                overlay.style.transition = '';
                overflowLocker.unlock();
                if (completeClose) {
                    api.destroy();
                } else {
                    windowEl.style.transform = 'translateY(0)';
                }
                dragging = false;
                eligible = false;
                dy = 0;
            }
            function onPointerUpOrCancel() {
                if (!dragging) {
                    eligible = false;
                    return;
                }
                const totalDy = lastY - startY;
                const totalDt = Math.max(1, lastT - startT);
                const v = totalDy / totalDt;
                const shouldClose = dy > dragThreshold || v > velocityThreshold;
                finishDrag(shouldClose);
            }
            windowEl.addEventListener('touchstart', onPointerDown, {
                passive: true
            });
            windowEl.addEventListener('touchmove', onPointerMove, {
                passive: false
            });
            windowEl.addEventListener('touchend', onPointerUpOrCancel, {
                passive: true
            });
            windowEl.addEventListener('touchcancel', onPointerUpOrCancel, {
                passive: true
            });
            windowEl.addEventListener('pointerdown', onPointerDown);
            windowEl.addEventListener('pointermove', onPointerMove);
            windowEl.addEventListener('pointerup', onPointerUpOrCancel);
            windowEl.addEventListener('pointercancel', onPointerUpOrCancel);
            const api = {
                root: overlay,
                open() {
                    overlay.classList.remove('close');
                    overlay.classList.add('open');
                    windowEl.style.transform = 'translateY(0)';
                    overlay.style.removeProperty('opacity');
                    dominantScroller = findDominantScroller(windowEl);
                },
                close() {
                    overlay.classList.remove('open');
                    overlay.classList.add('close');
                },
                destroy() {
                    this.close();
                    const cleanup = () => {
                        overflowLocker.unlock();
                        overlay.remove();
                        onDestroy();
                    };
                    const timeout = setTimeout(cleanup, 500);
                    overlay.addEventListener('transitionend', () => {
                        clearTimeout(timeout);
                        cleanup();
                    }, {
                        once: true
                    });
                    windowEl.removeEventListener('touchstart', onPointerDown);
                    windowEl.removeEventListener('touchmove', onPointerMove);
                    windowEl.removeEventListener('touchend', onPointerUpOrCancel);
                    windowEl.removeEventListener('touchcancel', onPointerUpOrCancel);
                    windowEl.removeEventListener('pointerdown', onPointerDown);
                    windowEl.removeEventListener('pointermove', onPointerMove);
                    windowEl.removeEventListener('pointerup', onPointerUpOrCancel);
                    windowEl.removeEventListener('pointercancel', onPointerUpOrCancel);
                    if (raf) cancelAnimationFrame(raf);
                },
                setContent(node) {
                    windowEl.innerHTML = '';
                    windowEl.appendChild(node);
                    dominantScroller = findDominantScroller(windowEl);
                }
            };
            return api;
        }

        createLeaderboardOverlay(options = {}) {
            const {
                title = 'Leaderboard',
                topListings: initialTop = [],
                listings: initialList = [],
                periods = ['Daily', 'Weekly', 'Monthly', 'Yearly', 'All Time'],
                activePeriod: initialPeriod = 'Daily',
                onPeriodChange = () => { },
                closeOnBackdrop = false
            } = options;
            const overlay = this.createBottomOverlay({
                classNames: [],
                closeOnBackdrop
            });
            function el(tag, cls = [], txt = '') {
                const e = document.createElement(tag);
                const list = Array.isArray(cls) ? cls : [cls];
                list.filter(c => Boolean(c)).forEach(c => e.classList.add(c));
                if (txt) e.textContent = txt;
                return e;
            }
            const state = {
                topListings: Array.isArray(initialTop) ? initialTop.slice() : [],
                listings: Array.isArray(initialList) ? initialList.slice() : [],
                periods: periods.slice(),
                activePeriod: initialPeriod,
                loading: false
            };
            function randInt(min, max) {
                return Math.floor(Math.random() * (max - min + 1)) + min;
            }
            function skelText(len) {
                const span = el('span', 'zc-skel-text');
                span.textContent = '\u00A0'.repeat(len);
                return span;
            }
            function skelBar(minLen = 6, maxLen = 14) {
                return skelText(randInt(minLen, maxLen));
            }
            function skelCircle(size = 40) {
                const d = el('div', 'zc-skel-circle');
                return d;
            }
            function createListingDisplay({
                rank,
                username,
                amountLabel,
                avatarUrl
            }, idx) {
                const badge = rank ?? idx + 1;
                const medal =
                    badge === 1 ? 'gold' :
                        badge === 2 ? 'silver' :
                            badge === 3 ? 'bronze' : '';
                const container = el('div', ['listing-display', medal]);
                const rankEl = el('div', 'listing-rank', `#${badge}`);
                const avatarWrap = el('div', 'listing-avatar-container');
                const img = el('img', 'listing-avatar');
                img.src = avatarUrl;
                img.alt = `${username} avatar`;
                avatarWrap.appendChild(img);
                const details = el('div', 'listing-details');
                details.append(
                    el('div', 'listing-username', username),
                    el('div', 'listing-amount', amountLabel)
                );
                container.append(rankEl, avatarWrap, details);
                return container;
            }
            function createSkeletonListing(isTop = false, idx = 0, total = 3) {
                const middle = Math.floor(total / 2);
                let medal = '';
                if (idx === middle) medal = 'gold';
                else if (idx < middle) medal = 'silver';
                else if (idx > middle) medal = 'bronze';
                const container = el('div', ['listing-display', 'zc-skeleton', medal]);
                const rankEl = el('div', 'listing-rank');
                rankEl.appendChild(skelText(randInt(2, 3)));
                const avatarWrap = el('div', 'listing-avatar-container');
                avatarWrap.appendChild(skelCircle(isTop ? 56 : 40));
                const details = el('div', 'listing-details');
                const username = el('div', 'listing-username');
                username.appendChild(skelBar(8, 16));
                const amount = el('div', 'listing-amount');
                amount.appendChild(skelBar(4, 8));
                details.append(username, amount);
                container.append(rankEl, avatarWrap, details);
                return container;
            }
            function renderSkeletons(root, count, isTop = false) {
                root.innerHTML = '';
                for (let i = 0; i < count; i++) root.appendChild(createSkeletonListing(isTop, i));
            }
            function buildSwitcher(keys, activeKey, changeCb) {
                const sw = el('div', 'zc-leaderboard-switcher');
                const inner = el('div', 'switcher-inner');
                const buttons = new Map();
                function setActive(key) {
                    buttons.forEach((btn, k) => {
                        btn.classList.toggle('active-button', k === key);
                    });
                }
                keys.forEach(key => {
                    const btn = el('div', 'switcher-button', key);
                    btn.tabIndex = 0;
                    btn.setAttribute('role', 'button');
                    if (key === activeKey) btn.classList.add('active-button');
                    const trigger = () => {
                        setActive(key);
                        changeCb(key);
                    };
                    btn.addEventListener('click', trigger);
                    btn.addEventListener('keydown', e => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            trigger();
                        }
                    });
                    buttons.set(key, btn);
                    inner.appendChild(btn);
                });
                sw.appendChild(inner);
                return {
                    root: sw,
                    setActive
                };
            }
            function updateListings(root, rows) {
                root.innerHTML = '';
                rows.forEach((row, idx) => {
                    root.appendChild(createListingDisplay(row, idx));
                });
            }
            const container = el('div', 'zc-leaderboard-container');
            container.setAttribute('aria-busy', 'false');
            const header = el('div', 'title-display', title);
            const topRow = el('div', 'zc-leaderboard-top-listings');
            state.topListings.forEach((item, i) => {
                topRow.appendChild(createListingDisplay(item, i));
            });
            const {
                root: switcherRoot,
                setActive: setSwitcherActive
            } =
                buildSwitcher(state.periods, state.activePeriod, (key) => {
                    state.activePeriod = key;
                    onPeriodChange(key);
                });
            const mainList = el('div', 'zc-leaderboard-listings');
            updateListings(mainList, state.listings);
            container.append(header, topRow, switcherRoot, mainList);
            overlay.setContent(container);
            function renderData() {
                container.setAttribute('aria-busy', 'false');
                state.loading = false;
                topRow.innerHTML = '';
                (state.topListings || []).forEach((itm, i) =>
                    topRow.appendChild(createListingDisplay(itm, i))
                );
                updateListings(mainList, state.listings || []);
                setSwitcherActive(state.activePeriod);
            }
            function renderSkeleton(opts = {}) {
                const {
                    topCount = Math.max(3, (state.topListings && state.topListings.length) || 3),
                    listCount = Math.max(8, (state.listings && state.listings.length) || 8)
                } = opts;
                container.setAttribute('aria-busy', 'true');
                state.loading = true;
                renderSkeletons(topRow, topCount, true);
                renderSkeletons(mainList, listCount, false);
            }
            function openSkeleton(opts = {}) {
                renderSkeleton(opts);
                if (typeof overlay.open === 'function') overlay.open();
            }
            function upsertData(payload = {}, options = {}) {
                const {
                    topListings,
                    listings,
                    period
                } = payload;
                const {
                    mode = 'replace', key = 'username'
                } = options;
                const getKey = (item, idx) =>
                    typeof key === 'function' ? key(item, idx) :
                        key in (item || {}) ? item[key] :
                            (item && item.rank) ?? idx;
                function merge(oldArr = [], newArr = []) {
                    if (!Array.isArray(newArr) || newArr.length === 0) return oldArr.slice();
                    if (mode === 'replace') return newArr.slice();
                    const seen = new Set();
                    const mapOld = new Map(oldArr.map((o, i) => [getKey(o, i), o]));
                    const merged = [];
                    newArr.forEach((n, i) => {
                        const k = getKey(n, i);
                        seen.add(k);
                        merged.push(n);
                    });
                    oldArr.forEach((o, i) => {
                        const k = getKey(o, i);
                        if (!seen.has(k)) merged.push(o);
                    });
                    return merged;
                }
                if (period && period !== state.activePeriod) {
                    state.activePeriod = period;
                    setSwitcherActive(state.activePeriod);
                }
                if (topListings) state.topListings = merge(state.topListings, topListings);
                if (listings) state.listings = merge(state.listings, listings);
                renderData();
            }
            function setData({
                topListings: t = null,
                listings: l = null
            } = {}) {
                return upsertData({
                    topListings: t || undefined,
                    listings: l || undefined
                }, {
                    mode: 'replace'
                });
            }
            return {
                ...overlay,
                openSkeleton,
                upsertData,
                setData
            };
        }

        renderZcOverlayPrompt(opts = {}) {
            const {
                parent = document.body,
                title = "Title",
                description = "Description",
                includeInput = false,
                inputProps = {},
                buttons = [],
                closeOnBackdrop = true,
                closeOnEscape = true,
                idPrefix = "zc-prompt",
            } = opts;
            const el = (tag, {
                className,
                attrs = {},
                props = {},
                text
            } = {}) => {
                const node = document.createElement(tag);
                if (className) node.className = className;
                Object.entries(attrs).forEach(([k, v]) => node.setAttribute(k, v));
                Object.assign(node, props);
                if (text != null) node.textContent = text;
                return node;
            };
            const uid = Math.random().toString(36).slice(2);
            const titleId = `${idPrefix}-title-${uid}`;
            const descId = `${idPrefix}-desc-${uid}`;
            const overlay = el("div", {
                className: "zc-screen-overlay",
                attrs: {
                    "data-component": "zc-prompt",
                    "data-state": "closed",
                },
            });
            const prompt = el("div", {
                className: "zc-prompt",
                attrs: {
                    role: "dialog",
                    "aria-modal": "true",
                    "aria-labelledby": titleId,
                    "aria-describedby": descId,
                    "data-gesture-scope": "prompt",
                },
            });
            const titleNode = el("div", {
                className: "title",
                attrs: {
                    id: titleId
                },
                text: title,
            });
            const descNode = el("div", {
                className: "description",
                attrs: {
                    id: descId
                },
                text: description,
            });
            let inputNode = null;
            if (includeInput) {
                const {
                    placeholder = "Input",
                    value = "",
                    type = "text",
                    name,
                    id,
                    ariaLabel,
                } = inputProps || {};
                inputNode = el("input", {
                    className: "input",
                    attrs: {
                        placeholder,
                        type,
                        ...(name ? {
                            name
                        } : {}),
                        ...(id ? {
                            id
                        } : {}),
                        ...(ariaLabel ? {
                            "aria-label": ariaLabel
                        } : {}),
                    },
                    props: {
                        value
                    },
                });
            }
            const listNode = el("div", {
                className: "zc-prompt-button-list"
            });
            const btnDefs = (Array.isArray(buttons) ? buttons : []).slice(0, 2);
            if (btnDefs.length === 0) {
                btnDefs.push({
                    label: "Close"
                });
            }
            let isClosing = false;
            const close = () => {
                if (isClosing) return;
                isClosing = true;
                overlay.setAttribute("data-state", "closing");
                overlay.dispatchEvent(new CustomEvent("zc:prompt:close", {
                    bubbles: true
                }));
                requestAnimationFrame(() => {
                    overlay.classList.remove('open');
                    overlay.classList.add('close');
                    overlay.setAttribute("data-state", "closing");
                    setTimeout(() => {
                        overlay.remove();
                        overlay.setAttribute("data-state", "closed");
                    }, 400);
                });
                detachGlobal();
            };
            const attachButtonA11y = (node, activate) => {
                node.setAttribute("role", "button");
                node.setAttribute("tabindex", "0");
                node.addEventListener("keydown", (e) => {
                    if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        activate(e);
                    }
                });
            };
            const buttonNodes = btnDefs.map(({
                label,
                onClick,
                ariaLabel
            }, idx) => {
                const node = el("div", {
                    className: "button",
                    attrs: ariaLabel ? {
                        "aria-label": ariaLabel
                    } : {},
                    text: label ?? `Button ${idx + 1}`,
                });
                const activate = (evt) => {
                    try {
                        onClick && onClick({
                            event: evt,
                            close,
                            input: inputNode,
                            value: inputNode ? inputNode.value : undefined,
                            index: idx,
                        });
                    } finally {
                        close();
                    }
                };
                node.addEventListener("click", activate);
                attachButtonA11y(node, activate);
                return node;
            });
            buttonNodes.forEach((btn) => listNode.appendChild(btn));
            prompt.appendChild(titleNode);
            prompt.appendChild(descNode);
            if (inputNode) prompt.appendChild(inputNode);
            prompt.appendChild(listNode);
            overlay.appendChild(prompt);
            if (closeOnBackdrop) {
                overlay.addEventListener("pointerdown", (e) => {
                    if (e.target === overlay) close();
                });
            }
            const onKeydown = (e) => {
                if (closeOnEscape && e.key === "Escape") {
                    e.preventDefault();
                    close();
                }
            };
            const attachGlobal = () => document.addEventListener("keydown", onKeydown);
            const detachGlobal = () => document.removeEventListener("keydown", onKeydown);
            const focusFirst = () => {
                if (inputNode) {
                    inputNode.focus();
                    inputNode.select?.();
                } else {
                    buttonNodes[0]?.focus();
                }
            };
            const open = () => {
                parent.appendChild(overlay);
                overlay.setAttribute("data-state", "open");
                overlay.dispatchEvent(new CustomEvent("zc:prompt:open", {
                    bubbles: true
                }));
                attachGlobal();
                requestAnimationFrame(() => {
                    focusFirst()
                    overlay.classList.remove('close');
                    overlay.classList.add('open');
                });
            };
            const destroy = () => {
                detachGlobal();
                overlay.remove();
            };
            return {
                root: overlay,
                prompt,
                input: inputNode,
                buttons: buttonNodes,
                open,
                close,
                destroy,
            };
        }

        buildDMChannelComponent({
            parent,
            avatarSrc = 'fallback-avatar.png',
            statusType = '',
            username = 'Unknown User',
            badgeIcon = 'fallback-badge.png',
            badgeLabel = '',
            statusText = '',
            nameplateSrc = '',
            activityType = '',
            activityText = '',
            userId,
            onClick = null
        } = {}) {
            if (!parent || !(parent instanceof Element)) {
                throw new Error('Invalid parent element provided.');
            }
            const resolvedStatus = this.matchEnum(statusType, this.EnumTypes.StatusType);
            const resolvedActivity = this.matchEnum(activityType, this.EnumTypes.ActivityType);
            const frag = document.createDocumentFragment();
            const channel = document.createElement('div');
            const instanceId = this.createUid('zc-dm');
            const usernameId = `${instanceId}-username`;
            const maskId = `${instanceId}-mask`;
            channel.classList.add('zc-dm-channel');
            channel.dataset.unread = 'false';
            channel.dataset.active = 'false';
            channel.dataset.instanceId = instanceId;
            channel.setAttribute('role', 'listitem');
            channel.setAttribute('data-gesture-target', 'dm-channel');
            channel.dataset.searchUserId = (userId || '').trim();
            channel.dataset.searchUsername = (username || '').trim();
            channel.dataset.searchStatus = (resolvedStatus?.className || '').trim();
            channel.dataset.searchActivity = (resolvedActivity?.label || '').trim();
            channel.dataset.searchActivityText = (activityText || '').trim();
            channel.dataset.searchBadge = (badgeLabel || '').trim();
            channel.dataset.hasAvatar = avatarSrc ? '1' : '';
            channel.dataset.hasBadge = (badgeLabel || badgeIcon) ? '1' : '';
            channel.dataset.hasNameplate = nameplateSrc ? '1' : '';
            channel.dataset.hasActivity = (resolvedActivity || activityText) ? '1' : '';
            channel.dataset.hasStatus = resolvedStatus ? '1' : '';
            channel.dataset.hasText = (statusText || '').trim() ? '1' : '';
            channel.dataset.searchName = ([
                userId, username, avatarSrc, badgeIcon, badgeLabel,
                statusText, nameplateSrc, activityText
            ].filter(s => typeof s === 'string' && s.trim()).join(' '));
            const interactive = document.createElement('div');
            interactive.classList.add('zc-dm-interactive');
            const link = document.createElement('a');
            link.classList.add('zc-dm-link');
            link.setAttribute('aria-labelledby', usernameId);
            link.setAttribute('aria-describedby', `${instanceId}-status`);
            link.setAttribute('aria-label', `${username}${statusText ? ` — ${statusText}` : ''}`);
            if (typeof onClick === 'function') {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    onClick(e);
                });
            }
            const layout = document.createElement('div');
            layout.classList.add('zc-dm-layout');
            const avatarZone = document.createElement('div');
            avatarZone.classList.add('zc-dm-avatar-zone');
            const avatarWrapper = document.createElement('div');
            avatarWrapper.classList.add('zc-dm-avatar-wrapper');
            const svgNS = 'http://www.w3.org/2000/svg';
            const xlinkNS = 'http://www.w3.org/1999/xlink';
            const svg = document.createElementNS(svgNS, 'svg');
            svg.setAttribute('width', '40');
            svg.setAttribute('height', '40');
            svg.setAttribute('viewBox', '0 0 40 40');
            svg.classList.add('zc-dm-avatar-mask');
            const defs = document.createElementNS(svgNS, 'defs');
            const mask = document.createElementNS(svgNS, 'mask');
            mask.setAttribute('id', maskId);
            mask.setAttribute('maskUnits', 'userSpaceOnUse');
            const rect = document.createElementNS(svgNS, 'rect');
            rect.setAttribute('x', '0');
            rect.setAttribute('y', '0');
            rect.setAttribute('width', '40');
            rect.setAttribute('height', '40');
            rect.setAttribute('fill', 'white');
            const circle = document.createElementNS(svgNS, 'circle');
            circle.setAttribute('cx', '33');
            circle.setAttribute('cy', '33');
            circle.setAttribute('r', '10');
            circle.setAttribute('fill', 'black');
            mask.appendChild(rect);
            mask.appendChild(circle);
            defs.appendChild(mask);
            svg.appendChild(defs);
            const g = document.createElementNS(svgNS, 'g');
            g.setAttribute('mask', `url(#${maskId})`);
            const avatarImg = document.createElementNS(svgNS, 'image');
            if (avatarImg.href) {
                avatarImg.href.baseVal = avatarSrc;
            } else {
                avatarImg.setAttributeNS(xlinkNS, 'xlink:href', avatarSrc);
            }
            avatarImg.setAttribute('x', '0');
            avatarImg.setAttribute('y', '0');
            avatarImg.setAttribute('width', '40');
            avatarImg.setAttribute('height', '40');
            avatarImg.setAttribute('preserveAspectRatio', 'xMidYMid slice');
            g.appendChild(avatarImg);
            svg.appendChild(g);
            const statusIcon = document.createElement('div');
            statusIcon.classList.add('zc-dm-status-icon');
            statusIcon.setAttribute('aria-hidden', 'true');
            if (resolvedStatus) {
                statusIcon.classList.add(resolvedStatus.className);
            }
            avatarWrapper.appendChild(svg);
            avatarWrapper.appendChild(statusIcon);
            avatarZone.appendChild(avatarWrapper);
            const contentZone = document.createElement('div');
            contentZone.classList.add('zc-dm-content-zone');
            const userMeta = document.createElement('div');
            userMeta.classList.add('zc-dm-user-meta');
            const usernameWrapper = document.createElement('div');
            usernameWrapper.classList.add('zc-dm-username-wrapper');
            const tooltipContainer = document.createElement('div');
            tooltipContainer.classList.add('zc-dm-tooltip-container');
            tooltipContainer.id = usernameId;
            tooltipContainer.textContent = username;
            if (badgeIcon.trim() !== '' && badgeLabel.trim !== '') {
                const badgeWrapper = document.createElement('span');
                badgeWrapper.classList.add('zc-dm-badge-wrapper');
                const lineClamp = document.createElement('span');
                lineClamp.classList.add('zc-dm-line-clamp');
                const badgeIconImg = this.loadImage(
                    document.createElement('img'), {
                    src: badgeIcon,
                    fallback: 'fallback-badge.png',
                    alt: ''
                }
                );
                badgeIconImg.classList.add('zc-dm-badge-icon');
                badgeIconImg.setAttribute('aria-hidden', 'true');
                const badgeLabelSpan = document.createElement('span');
                badgeLabelSpan.classList.add('zc-dm-badge-label');
                badgeLabelSpan.textContent = badgeLabel;
                lineClamp.appendChild(badgeIconImg);
                lineClamp.appendChild(badgeLabelSpan);
                badgeWrapper.appendChild(lineClamp);
                tooltipContainer.appendChild(badgeWrapper);
            }
            usernameWrapper.appendChild(tooltipContainer);
            userMeta.appendChild(usernameWrapper);
            const trimmedStatus = (statusText || '').trim();
            const trimmedActivityText = (activityText || '').trim();
            const hasResolvedActivity = !!resolvedActivity;
            const useActivityAsText = !trimmedStatus && hasResolvedActivity && trimmedActivityText;
            if (trimmedStatus !== '' || hasResolvedActivity) {
                const statusTextDiv = document.createElement('div');
                statusTextDiv.classList.add('zc-dm-status-text');
                statusTextDiv.id = `${instanceId}-status`;
                if (hasResolvedActivity) {
                    const statusActivity = document.createElement('div');
                    statusActivity.classList.add('zc-dm-status-activity', resolvedActivity.className);
                    statusActivity.dataset.activityId = resolvedActivity.id;
                    statusActivity.setAttribute('aria-label', resolvedActivity.label);
                    statusTextDiv.appendChild(statusActivity);
                    if (!useActivityAsText) {
                        const statusSpacer = document.createElement('div');
                        statusSpacer.classList.add('zc-dot-spacer');
                        statusSpacer.style.backgroundColor = 'var(--text-muted)';
                        statusTextDiv.appendChild(statusSpacer);
                    }
                }
                const statusOverflow = document.createElement('div');
                statusOverflow.classList.add('zc-dm-status-overflow');
                statusOverflow.textContent = useActivityAsText ?
                    (`${resolvedActivity.label} ${trimmedActivityText}`)
                    :
                    trimmedStatus;
                statusTextDiv.appendChild(statusOverflow);
                userMeta.appendChild(statusTextDiv);
            }
            contentZone.appendChild(userMeta);
            layout.appendChild(avatarZone);
            layout.appendChild(contentZone);
            link.appendChild(layout);
            if (nameplateSrc.trim() !== '') {
                const mediaContainer = document.createElement('div');
                mediaContainer.classList.add('zc-dm-media-container');
                const videoFrame = document.createElement('div');
                videoFrame.classList.add('zc-dm-video-frame');
                const staticImage = this.loadImage(
                    document.createElement('img'), {
                    src: nameplateSrc,
                    fallback: 'fallback-nameplate.png',
                    alt: ''
                }
                );
                staticImage.classList.add('zc-dm-static-image');
                staticImage.setAttribute('aria-hidden', 'true');
                videoFrame.appendChild(staticImage);
                mediaContainer.appendChild(videoFrame);
                interactive.appendChild(mediaContainer);
            }
            interactive.appendChild(link);
            channel.appendChild(interactive);
            frag.appendChild(channel);
            parent.appendChild(frag);
            return channel;
        }

        generateInteractiveButtonSet({
            containerSelector,
            buttonsData,
            inputSelector,
            onButtonCreate,
            onReady,
            onClick
        }) {
            const container = document.querySelector(containerSelector);
            if (!container) {
                throw new Error(`Container not found for selector: ${containerSelector}`);
            }
            const buttons = [];
            let currentPrimary = null;
            function setPrimary(button) {
                container.querySelectorAll('.zc-round-button').forEach(btn => {
                    btn.classList.replace('zc-button-cover', 'zc-button-fit');
                    btn.setAttribute('aria-pressed', 'false');
                });
                button.classList.replace('zc-button-fit', 'zc-button-cover');
                button.setAttribute('aria-pressed', 'true');
                currentPrimary = button;
            }
            buttonsData.forEach((btn, index) => {
                const isPrimary = index === buttonsData.length - 1;
                let inputElement = null;
                const button = this.createEl('div', {
                    class: `zc-round-button ${isPrimary ? 'zc-button-cover' : 'zc-button-fit'}`,
                    role: 'button',
                    tabindex: 0,
                    'aria-pressed': isPrimary ? 'true' : 'false',
                    'data-index': index,
                    'data-type': btn.type || 'button'
                }, [
                    this.createEl('div', {
                        class: 'zc-button-icon',
                        style: {
                            '-webkit-mask-image': `url('${btn.icon}')`,
                            'mask-image': `url('${btn.icon}')`
                        }
                    }),
                    btn.type === 'input' ?
                        (inputElement = this.createEl('input', {
                            class: 'zc-button-text',
                            type: 'text',
                            placeholder: btn.label
                        })) :
                        this.createEl('div', {
                            class: 'zc-button-text'
                        }, btn.label)
                ]);
                if (btn.type === 'input') {
                    button.addEventListener('click', () => {
                        const wasPrimary = currentPrimary;
                        setPrimary(button);
                        inputElement.focus();
                        const onBlur = () => {
                            const hasContent = inputElement.value.trim();
                            if (!hasContent && wasPrimary) {
                                setPrimary(wasPrimary);
                            } else {
                                setPrimary(button);
                            }
                            inputElement.removeEventListener('blur', onBlur);
                        };
                        inputElement.addEventListener('blur', onBlur);
                    });
                } else if (typeof btn.onClick === 'function') {
                    button.addEventListener('click', (e) => {
                        btn.onClick(e, {
                            button,
                            index,
                            isPrimary,
                            container
                        });
                    });
                }
                container.appendChild(button);
                buttons.push(button);
                if (isPrimary) currentPrimary = button;
                if (typeof btn.onCreate === 'function') {
                    btn.onCreate(button, {
                        index,
                        isPrimary,
                        container
                    });
                }
                if (typeof onButtonCreate === 'function') {
                    onButtonCreate(button, btn, {
                        index,
                        isPrimary,
                        container
                    });
                }
            });
            if (typeof onReady === 'function') {
                onReady({
                    container,
                    buttons,
                    currentPrimary,
                    setPrimary
                });
            }
            return {
                container,
                buttons,
                get currentPrimary() {
                    return currentPrimary;
                },
                setPrimary
            };
        }

        showEphemeralMessage(parent, text, opts = {}) {
            const {
                duration = 2500,
                variant = 'info',
                live = 'polite',
                extraClasses = []
            } = opts;
            const root = typeof parent === 'string' ? document.querySelector(parent) : parent;
            if (!root) throw new Error('showEphemeralMessage: parent not found');
            const existing = root.querySelector(':scope > .zc-overlay-details-screen');
            if (existing) existing.remove();
            const screen = document.createElement('div');
            screen.className = 'zc-overlay-details-screen';
            screen.setAttribute('aria-hidden', 'true');
            const msg = document.createElement('div');
            msg.className = 'zc-overlay-details-message';
            msg.textContent = text;
            msg.setAttribute('role', live === 'assertive' ? 'alert' : 'status');
            msg.setAttribute('aria-live', live);
            msg.setAttribute('aria-atomic', 'true');
            msg.dataset.state = variant;
            screen.appendChild(msg);
            root.appendChild(screen);
            requestAnimationFrame(() => {
                msg.classList.add('is-enter');
            });
            msg.offsetWidth;
            let removed = false;
            let exitTimer = setTimeout(beginExit, duration);
            function beginExit() {
                if (removed) return;
                msg.classList.remove('is-enter');
                msg.classList.add('is-exit');
                const onEnd = () => cleanup();
                msg.addEventListener('transitionend', onEnd, {
                    once: true
                });
                setTimeout(() => cleanup(), 400);
            }
            function cleanup() {
                if (removed) return;
                removed = true;
                clearTimeout(exitTimer);
                screen.remove();
            }
            return {
                dismiss: beginExit,
                element: msg
            };
        }

        createAccountListing({
            avatarUrl = '',
            nickname,
            username,
            isManage = false
        }) {
            const listing = document.createElement('div');
            listing.className = 'zc-accounts-listing' + (isManage ? ' manage' : '');
            const left = document.createElement('div');
            left.className = 'zc-accounts-left';
            if (avatarUrl) {
                const img = document.createElement('img');
                img.className = 'zc-accounts-avatar';
                img.src = avatarUrl;
                left.appendChild(img);
            } else {
                const avatarPlaceholder = document.createElement('div');
                avatarPlaceholder.className = 'zc-accounts-avatar';
                left.appendChild(avatarPlaceholder);
            }
            const right = document.createElement('div');
            right.className = 'zc-accounts-right';
            const nicknameDiv = document.createElement('div');
            nicknameDiv.className = 'zc-accounts-nickname';
            nicknameDiv.textContent = nickname;
            const usernameDiv = document.createElement('div');
            usernameDiv.className = 'zc-accounts-username';
            usernameDiv.textContent = username;
            right.appendChild(nicknameDiv);
            right.appendChild(usernameDiv);
            listing.appendChild(left);
            listing.appendChild(right);
            return listing;
        }

        buildMessageElement(discordMessage) {
            const {
                id: messageId,
                content,
                attachments = [],
                sticker_items = [],
                author = {},
                member = {}
            } = discordMessage || {};
            const username = member.nick || author.global_name || author.username || 'Unknown User';
            const authorId = author.id || null;
            const avatarUrl = author.avatar ?
                `https://cdn.discordapp.com/avatars/${authorId}/${author.avatar}.png` :
                null;
            const safeClan = author.clan || {};
            const hasBadge = typeof safeClan.identity_guild_id === 'string' && typeof safeClan.badge === 'string';
            const badgeIcon = hasBadge ?
                `https://cdn.discordapp.com/clan-badges/${safeClan.identity_guild_id}/${safeClan.badge}` :
                '';
            const badgeLabel = typeof safeClan.tag === 'string' ? safeClan.tag : '';
            const imageAttachments = [];
            const fileAttachments = [];
            attachments.forEach(att => {
                const type = att.content_type || att.original_content_type || '';
                if (type.startsWith('image/')) {
                    imageAttachments.push(att);
                } else {
                    fileAttachments.push({
                        url: att.url,
                        title: att.title || att.filename || 'Unknown File',
                        name: att.filename || 'unnamed'
                    });
                }
            });
            const wrapper = document.createElement('div');
            wrapper.className = 'zc-message-display list-start';
            if (author?.isSelf) {
                wrapper.classList.add('list-self')
            }
            wrapper.dataset.authorId = author.id || '';
            wrapper.dataset.messageId = messageId || '';
            const avatarContainer = document.createElement('div');
            avatarContainer.className = 'avatar-container';
            const avatarImg = document.createElement('img');
            avatarImg.className = 'avatar-display';
            avatarImg.src = avatarUrl || '';
            avatarContainer.appendChild(avatarImg);
            const details = document.createElement('div');
            details.className = 'message-details';
            const usernameDiv = document.createElement('div');
            usernameDiv.className = 'message-username';
            usernameDiv.textContent = username;
            if (badgeIcon) {
                const badgeWrapper = document.createElement('span');
                badgeWrapper.className = 'zc-dm-badge-wrapper';
                const badgeClamp = document.createElement('span');
                badgeClamp.className = 'zc-dm-line-clamp';
                const badgeImg = document.createElement('img');
                badgeImg.src = badgeIcon;
                badgeImg.className = 'zc-dm-badge-icon';
                badgeImg.setAttribute('aria-hidden', 'true');
                const badgeSpan = document.createElement('span');
                badgeSpan.className = 'zc-dm-badge-label';
                badgeSpan.textContent = badgeLabel;
                badgeClamp.appendChild(badgeImg);
                badgeClamp.appendChild(badgeSpan);
                badgeWrapper.appendChild(badgeClamp);
                usernameDiv.appendChild(document.createTextNode(' '));
                usernameDiv.appendChild(badgeWrapper);
            }
            const msgContainer = document.createElement('div');
            msgContainer.className = 'message-container';
            if (content.trim() !== '') {
                const msgContent = document.createElement('div');
                msgContent.className = 'message-content';
                msgContent.textContent = content || '';
                msgContainer.appendChild(msgContent);
            }
            const reactions = discordMessage.reactions || [];
            const reaction = reactions.reduce((max, current) => {
                return current.count > (max?.count ?? 0) ? current : max;
            }, null);
            if (reaction) {
                const reactionDiv = document.createElement('div');
                reactionDiv.className = 'message-reaction';
                const { id, name } = reaction.emoji || {};
                if (id) {
                    const emojiImg = document.createElement('img');
                    emojiImg.alt = name || '';
                    emojiImg.className = 'message-reaction-img';
                    emojiImg.src = `https://cdn.discordapp.com/emojis/${id}.png`;
                    reactionDiv.appendChild(emojiImg);
                } else if (name) {
                    reactionDiv.textContent = name;
                }
                msgContainer.appendChild(reactionDiv);
            }
            if (imageAttachments.length) {
                const attachmentDiv = document.createElement('div');
                attachmentDiv.className = 'message-image-attachments';
                imageAttachments.forEach(a => {
                    const img = document.createElement('img');
                    img.src = a.url;
                    attachmentDiv.appendChild(img);
                });
                details.appendChild(attachmentDiv);
            }
            if (sticker_items.length) {
                const stickerDiv = document.createElement('div');
                stickerDiv.className = 'message-sticker-attachments';
                const createStickerImage = ({ id, name = 'sticker', format = 'png' }) => {
                    const img = document.createElement('img');
                    img.className = 'message-sticker-attachment';
                    img.src = `https://media.discordapp.net/stickers/${id}.${format}`;
                    img.alt = name;
                    return img;
                };

                sticker_items.forEach(sticker => {
                    const img = createStickerImage(sticker);
                    stickerDiv.appendChild(img);
                });
                details.appendChild(stickerDiv);
            }
            if (fileAttachments.length) {
                const fileAttachmentsDiv = document.createElement('div');
                fileAttachmentsDiv.className = 'message-file-attachments';
                fileAttachments.forEach(f => {
                    const fileAttachment = document.createElement('div');
                    fileAttachment.className = 'message-file-attachment';
                    const btnsDiv = document.createElement('div');
                    btnsDiv.className = 'message-file-btns';
                    const downloadBtn = document.createElement('div');
                    downloadBtn.className = 'message-file-btn';
                    const downloadIcon = document.createElement('div');
                    downloadIcon.className = 'icon';
                    downloadIcon.style.webkitMaskImage =
                        'url(https://cdn3.emoji.gg/emojis/8719-download-apps.png)';
                    downloadIcon.style.maskImage =
                        'url(https://cdn3.emoji.gg/emojis/8719-download-apps.png)';
                    downloadBtn.appendChild(downloadIcon);
                    const uploadBtn = document.createElement('div');
                    uploadBtn.className = 'message-file-btn';
                    const uploadIcon = document.createElement('div');
                    uploadIcon.className = 'icon';
                    uploadIcon.style.webkitMaskImage =
                        'url(https://cdn3.emoji.gg/emojis/7458-upload.png)';
                    uploadIcon.style.maskImage =
                        'url(https://cdn3.emoji.gg/emojis/7458-upload.png)';
                    uploadBtn.appendChild(uploadIcon);
                    btnsDiv.append(downloadBtn, uploadBtn);
                    const titleDiv = document.createElement('div');
                    titleDiv.className = 'message-file-title';
                    titleDiv.textContent = f.title;
                    const detailsDiv = document.createElement('div');
                    detailsDiv.className = 'message-file-details';
                    detailsDiv.textContent = f.name;
                    fileAttachment.append(btnsDiv, titleDiv, detailsDiv);
                    fileAttachmentsDiv.appendChild(fileAttachment);
                });
                details.appendChild(fileAttachmentsDiv);
            }
            details.prepend(usernameDiv, msgContainer);
            wrapper.append(avatarContainer, details);
            return wrapper;
        }

        sendTyping(parentEl, discordData) {
            if (!(parentEl instanceof Element)) {
                console.error('sendTyping: parentEl is not a valid DOM element.');
                return null;
            }
            const safeUser = (discordData && discordData.user) || {};
            const safeClan = safeUser.clan || {};
            const hasAvatar = typeof safeUser.id === 'string' && typeof safeUser.avatar === 'string';
            const avatarUrl = hasAvatar ?
                `https://cdn.discordapp.com/avatars/${safeUser.id}/${safeUser.avatar}.png` :
                '';
            const hasBadge = typeof safeClan.identity_guild_id === 'string' && typeof safeClan.badge === 'string';
            const badgeIcon = hasBadge ?
                `https://cdn.discordapp.com/clan-badges/${safeClan.identity_guild_id}/${safeClan.badge}` :
                '';
            const badgeLabel = typeof safeClan.tag === 'string' ? safeClan.tag : '';
            const displayName =
                typeof safeUser.global_name === 'string' ?
                    safeUser.global_name :
                    typeof safeUser.username === 'string' ?
                        safeUser.username :
                        'Unknown User';
            const typingEl = document.createElement('div');
            typingEl.className = 'zc-message-display list-start typing-message';
            const avatarContainer = document.createElement('div');
            avatarContainer.className = 'avatar-container';
            const avatarImg = document.createElement('img');
            avatarImg.className = 'avatar-display';
            avatarImg.src = avatarUrl;
            avatarImg.alt = '';
            avatarContainer.appendChild(avatarImg);
            const messageDetails = document.createElement('div');
            messageDetails.className = 'message-details';
            const usernameDiv = document.createElement('div');
            usernameDiv.className = 'message-username';
            usernameDiv.textContent = displayName;
            if (badgeIcon) {
                const badgeWrapper = document.createElement('span');
                badgeWrapper.className = 'zc-dm-badge-wrapper';
                const badgeClamp = document.createElement('span');
                badgeClamp.className = 'zc-dm-line-clamp';
                const badgeImg = document.createElement('img');
                badgeImg.src = badgeIcon;
                badgeImg.className = 'zc-dm-badge-icon';
                badgeImg.setAttribute('aria-hidden', 'true');
                const badgeSpan = document.createElement('span');
                badgeSpan.className = 'zc-dm-badge-label';
                badgeSpan.textContent = badgeLabel;
                badgeClamp.appendChild(badgeImg);
                badgeClamp.appendChild(badgeSpan);
                badgeWrapper.appendChild(badgeClamp);
                usernameDiv.appendChild(document.createTextNode(' '));
                usernameDiv.appendChild(badgeWrapper);
            }
            const messageContainer = document.createElement('div');
            messageContainer.className = 'message-container';
            messageContainer.dataset.typing = 'true';
            const messageContent = document.createElement('div');
            messageContent.className = 'message-content';
            const typingIndicator = document.createElement('span');
            typingIndicator.className = 'typing-indicator';
            for (let i = 0; i < 3; i++) {
                const dot = document.createElement('span');
                dot.className = 'dot';
                typingIndicator.appendChild(dot);
            }
            messageContent.appendChild(typingIndicator);
            messageContainer.appendChild(messageContent);
            messageDetails.appendChild(usernameDiv);
            messageDetails.appendChild(messageContainer);
            typingEl.appendChild(avatarContainer);
            typingEl.appendChild(messageDetails);
            parentEl.appendChild(typingEl);
            parentEl.appendChild(typingEl);
            requestAnimationFrame(() => {
                typingEl.classList.add('appear');
            });
            return typingEl;
        }

        createMessage(parentEl, params) {
            const el = this.buildMessageElement(params);
            el.classList.add('is-entering');
            const lastMessage = parentEl.querySelector('.zc-message-display');
            if (lastMessage && lastMessage.dataset.authorId === params.author.id) {
                el.classList.add('list-partial');
            }
            parentEl.prepend(el);
            void el.offsetWidth;
            el.classList.add('is-visible');
            return el;
        }

        massMessages(parentEl, messages) {
            if (!Array.isArray(messages)) {
                console.warn("Expected an array of messages, got:", messages);
                return;
            }
            messages.slice().reverse().forEach(msg => {
                if (!msg || typeof msg !== 'object') return;
                this.createMessage(parentEl, msg);
            });
        }

        clearMessages(parentEl) {
            if (!(parentEl instanceof Element)) {
                console.error('clearMessages: parentEl is not a valid DOM element.');
                return;
            }
            while (parentEl.firstChild) {
                parentEl.removeChild(parentEl.firstChild);
            }
        }

        upsertMessage(parentEl, params) {
            let existing = parentEl.querySelector(`[data-message-id="${params.messageId}"]`);
            if (existing) {
                const newEl = buildMessageElement(params);
                parentEl.replaceChild(newEl, existing);
                return newEl;
            } else {
                return createMessage(parentEl, params);
            }
        }

        createZCDisplay(parentSelector) {
            const parent = document.querySelector(parentSelector);
            if (!parent) {
                console.error(`Parent container not found: ${parentSelector}`);
                return;
            }
            const el = (tag, className, text) => {
                const element = document.createElement(tag);
                if (className) element.className = className;
                if (text) element.textContent = text;
                return element;
            };
            const zcDisplay = el('div', 'zc-display');
            Object.assign(zcDisplay.style, {
                position: 'absolute',
                top: '0',
                right: '0',
                transform: 'translateX(100%)',
                transition: 'transform 0.3s ease',
                zIndex: '9999'
            });
            const zcMessagesTop = el('div', 'zc-messages-top');
            const topNav = el('div', 'zc-msg-top-nav');
            const navIcon = el('div', 'zc-btn-icon');
            navIcon.style.webkitMaskImage = "url('https://cdn3.emoji.gg/emojis/8864https://cdn3.emoji.gg/emojis/8864-discord-clear-search.png')";
            topNav.appendChild(navIcon);
            topNav.addEventListener('click', () => {
                close();
            });
            const topProfile = el('div', 'zc-msg-top-profile');
            const profileUsername = el('div', 'username', 'User Placeholder');
            const profileStatus = el('div', 'status', 'Status Placeholder');
            topProfile.appendChild(profileUsername);
            topProfile.appendChild(profileStatus);
            zcMessagesTop.append(topNav, topProfile);
            const zcMessagesFill = el('div', 'zc-messages-fill');
            const zcMessagesBottom = el('div', 'zc-messages-bottom');
            const composer = el('div', 'zc-composer');
            composer.setAttribute('role', 'form');
            composer.setAttribute('aria-label', 'Message composer');
            const composerLeft = el('div', 'zc-composer__left');
            const mkBtn = (iconUrl) => {
                const btn = el('div', 'zc-btn');
                const icon = el('div', 'zc-btn-icon');
                icon.style.webkitMaskImage = `url('${iconUrl}')`;
                icon.style.maskImage = `url('${iconUrl}')`;
                btn.appendChild(icon);
                return btn;
            };
            composerLeft.append(
                mkBtn('https://cdn3.emoji.gg/emojis/6513-choose-role-icon.png'),
                mkBtn('https://cdn3.emoji.gg/emojis/4165-bot.png')
            );
            const composerInput = el('div', 'zc-composer__input');
            const textarea = document.createElement('textarea');
            textarea.id = 'zc-message-input';
            textarea.className = 'zc-textarea';
            textarea.setAttribute('aria-label', 'Message input');
            textarea.placeholder = 'Message';
            textarea.rows = 1;
            textarea.inputMode = 'text';
            composerInput.appendChild(textarea);
            const composerRight = el('div', 'zc-composer__right');
            const sendBtn = mkBtn('https://cdn3.emoji.gg/emojis/8312-active-threads.png');
            composerRight.appendChild(sendBtn);
            composer.append(composerLeft, composerInput, composerRight);
            zcMessagesBottom.appendChild(composer);
            zcDisplay.append(zcMessagesTop, zcMessagesFill, zcMessagesBottom);
            parent.appendChild(zcDisplay);
            function setUsername(textContent) {
                profileUsername.textContent = textContent;
            }
            function setStatus(textContent) {
                profileStatus.textContent = textContent;
            }
            function open() {
                zcDisplay.style.transform = 'translateX(0)';
            }
            function close() {
                zcDisplay.style.transform = 'translateX(100%)';
            }
            return {
                element: zcDisplay,
                setUsername,
                setStatus,
                open,
                close,
                composer: {
                    textInput: textarea,
                    sendButton: sendBtn
                }
            };
        }

        createNavButtons(container, items, windowsRoot = '.zc-windows') {
            const parent = typeof container === 'string' ? document.querySelector(container) : container;
            if (!parent) return;

            const frag = document.createDocumentFragment();

            for (const item of items) {
                const btn = this.createEl('div', {
                    class: `zc-nav-button${item.active ? ' active' : ''}`,
                    role: 'button',
                    tabindex: 0,
                    'data-target': item.target,
                    'aria-controls': item.target,
                    'aria-selected': String(!!item.active)
                }, this.createEl('div', {
                    class: 'zc-nav-button-inner'
                }, [
                    this.createEl('div', {
                        class: 'zc-nav-icon',
                        style: {
                            '-webkit-mask-image': `url('${item.icon}')`,
                            'mask-image': `url('${item.icon}')`
                        }
                    }),
                    this.createEl('div', {
                        class: 'zc-nav-label',
                        hidden: true
                    }, item.label)
                ]));
                const activate = () => {
                    const root = document.querySelector(windowsRoot);
                    if (!root) return;

                    const targetKey = btn.dataset.target;
                    const targetWin =
                        document.getElementById(targetKey) ||
                        root.querySelector(`.zc-window[data-window-id="${targetKey}"]`);

                    if (!targetWin) return;
                    root.querySelectorAll('.zc-window').forEach(w => {
                        w.hidden = true;
                        w.setAttribute('aria-hidden', 'true');
                    });
                    targetWin.hidden = false;
                    targetWin.setAttribute('aria-hidden', 'false');
                    parent.querySelectorAll('.zc-nav-button').forEach(b => {
                        const isActive = b === btn;
                        b.classList.toggle('active', isActive);
                        b.setAttribute('aria-selected', String(isActive));
                    });
                    targetWin.dispatchEvent(new CustomEvent('zc:window:activated', {
                        bubbles: true,
                        detail: {
                            target: targetKey
                        }
                    }));
                };
                btn.addEventListener('click', activate);
                btn.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        activate();
                    }
                });
                frag.appendChild(btn);
            }
            parent.appendChild(frag);
            const initial = parent.querySelector('.zc-nav-button.active') || parent.querySelector('.zc-nav-button');
            if (initial) initial.click();
        }
    }

    const api = { ZycordUI };
    if (global) {
        global.MiniDiscordishUI = global.MiniDiscordishUI || api;
    }
})(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : this));
