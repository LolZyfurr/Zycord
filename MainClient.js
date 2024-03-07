(async function() {
    let AUTHORIZATION = getToken();
    let LAST_AUTH = AUTHORIZATION;
    let THEME_COLOR = null;
    
    let MONTH_UPDATED = 3
    let DAY_UPDATED = 7
    let YEAR_UPDATED = 24
    let MINUTES_UPDATED = 45
    let TIME_AFTERNOON = 3
    let TIME_UPDATED = 12

    let ALPHA_MONTH = String.fromCharCode(MONTH_UPDATED + 64) // Convert to letter A-Z
    let ALPHA_DAY = DAY_UPDATED.toString(36) // Convert to base 36 (0-9, a-z)
    let ALPHA_YEAR = YEAR_UPDATED.toString(36) // Convert to base 36 (0-9, a-z)
    let ALPHA_MINUTES = MINUTES_UPDATED.toString(36) // Convert to base 36 (0-9, a-z)
    let ALPHA_TIME = (TIME_UPDATED+TIME_AFTERNOON).toString(36) // Convert to base 36 (0-9, a-z)

    let DATE_UPDATED = `${ALPHA_MONTH}${ALPHA_DAY}${ALPHA_YEAR}${ALPHA_MINUTES}${ALPHA_TIME}`
    let APP_VERSION = `BETA ${DATE_UPDATED}`

    let VALUE_LAST_STATUS = "";
    let VALUE_LIGHT_THEME = SETTINGS.APP_CONFIG.USE_LIGHT_THEME;
    let VALUE_LAST_THEME = VALUE_LIGHT_THEME;
    let VALUE_AUTO_UPDATE_STATUS = SETTINGS.APP_CONFIG.AUTO_UPDATE_STATUS;
    let avatarShapeConfig = SETTINGS.APP_CONFIG.AVATAR_SHAPE;
    let updateDebounce = false;
    let updateRecall = false;
    let updateStatus = "";
    let timeoutId = null;
    let leaderboardDebounce = false;
    ShadeWeb(SETTINGS.APP_CONFIG.INITIAL_OPACITY);
    const DELAY = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    await DELAY((SETTINGS.APP_CONFIG.STARTUP_TIME * (3 / 5)) * 1000);
    const STATUS_API_URL = "https://discord.com/api/v9/users/@me/settings-proto/1";
    const USER_API_URL = "https://discord.com/api/v9/users/@me";
    const USER_AVATAR_URL = await fetchUserAvatarURL(AUTHORIZATION, "1132521952238637117");
    const invisibleChar = await unicodeToString('U+200B');
    document.addEventListener("keydown", (updateEventAvatar));
    document.addEventListener("click", (updateEventAvatar));

    if (!(SETTINGS.THEME_CONFIG ? (SETTINGS.THEME_CONFIG.RADIAL_STATUS_CSS === true ? (true) : (false)) : (true))) {
        avatarShapeConfig = '50%';
    }

    function unicodeToString(n) {
        return String.fromCharCode(n);
    };

    function changeAvatarImages(a) {
        SETTINGS.APP_CONFIG.USE_CUSTOM_AVATAR && document.querySelectorAll('img[src*="723659289377636423"]').forEach(c => c.src = a);
    }

    function autoUpdateAvatar() {
        updateEventAvatar;
        new MutationObserver(() => {
            updateEventAvatar
        }).observe(document.querySelector("head > title"), {
            attributes: !0,
            childList: !0,
            characterData: !0
        });
    }

    function getToken() {
        let m;
        return (window.webpackChunkdiscord_app.push([
            [''], {},
            e => {
                m = [];
                for (let c in e.c) m.push(e.c[c])
            }
        ]), m).find(m => m?.exports?.default?.getToken !== void 0).exports.default.getToken();
    }

    function createFetchOptions(t, e, n) {
        return {
            headers: {
                accept: "*/*",
                "accept-language": "en-US,en;q=0.9",
                authorization: t,
                "content-type": "application/json"
            },
            body: e ? JSON.stringify({
                settings: e
            }) : null,
            method: n
        }
    }

    function uwuify(l) {
        const a = ["rawr x3", "OwO", "UwU", "o.O", "-.-", ">w<", "(⑅˘꒳˘)", "(ꈍᴗꈍ)", "(˘ω˘)", "(U ᵕ U❁)", "σωσ", "òωó", "(///ˬ///✿)", "(U ﹏ U)", "( ͡o ω ͡o )", "ʘwʘ", ":3", ":3", "XD", "nyaa~~", "mya", ">_<", "😳", "🥺", "😳😳😳", "rawr", "^^", "^^;;", "(ˆ ﻌ ˆ)♡", "^•ﻌ•^", "/(^•ω•^)", "(✿oωo)"],
            o = [
                ["small", "smol"],
                ["cute", "kawaii~"],
                ["fluff", "floof"],
                ["love", "luv"],
                ["stupid", "baka"],
                ["what", "nani"],
                ["meow", "nya~"],
                ["hello", "hewwo"]
            ];
        l = l.toLowerCase();
        for (const a of o) l = l.replaceAll(a[0], a[1]);
        return l = l.replaceAll(/([ \t\n])n/g, "$1ny").replaceAll(/[lr]/g, "w").replaceAll(/([ \t\n])([a-z])/g, (l, a, o) => Math.random() < .5 ? `${a}${o}-${o}` : `${a}${o}`).replaceAll(/([^.,!][.,!])([ \t\n])/g, (l, o, e) => {
            return `${o} ${r=a,r[Math.floor(Math.random()*r.length)]}${e}`;
            var r
        })
    }

    function setStatus(t, e) {
        fetch(STATUS_API_URL, createFetchOptions(t, e, "PATCH"))
    }

    function hexToRgb(e) {
        let n = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(e);
        return n ? {
            r: parseInt(n[1], 16),
            g: parseInt(n[2], 16),
            b: parseInt(n[3], 16)
        } : null
    }

    function tween(n, e, t, i) {
        let a = null;
        requestAnimationFrame((function m(u) {
            a || (a = u);
            let l = u - a,
                o = Math.min(l / t, 1);
            i(n + (e - n) * o), o < 1 && requestAnimationFrame(m)
        }))
    }

    function loadCSS(e) {
        let t = document.createElement("link");
        t.rel = "stylesheet", t.type = "text/css", t.href = e, t.media = "only x", t.onload = function() {
            this.media = "all"
        }, document.head.appendChild(t)
    }

    function WatermarkWeb(n, e) {
        var t = document.createElement("style");
        t.type = "text/css", t.innerHTML = `\nbody::after {\n  content: "${n}";\n  position: fixed;\n  bottom: 10px;\n  right: 10px;\n  font-size: 25px;\n  font-weight: 900;\n  opacity: 1;\n}\n  z-index: 999999;\n`, document.getElementsByTagName("head")[0].appendChild(t)
    }

    function fetchThemeColor(e) {
        null == THEME_COLOR ? fetch(USER_API_URL, createFetchOptions(e, null, "GET")).then(e => e.json()).then(e => {
            const n = e.banner_color;
            n && (console.log(n), THEME_COLOR = n, changeElementColor(THEME_COLOR))
        }) : changeElementColor(THEME_COLOR)
    }

    function ShadeWeb(e) {
        WatermarkWeb(`ZYCORD ${APP_VERSION}`, "#FFFFFF");
        var n = document.getElementById("shadeWebStyle"),
            t = `\nbody::before {\ncontent: "";\nposition: fixed;\ntop: 0;\nleft: 0;\nwidth: 100%;\nheight: 100%;\nz-index: 999998;\npointer-events: none;\nbackground-color: rgba(0,0,0,${e});\nbackground-image: url('');\nbackground-size: cover;\n}\n`;
        if (n) n.innerHTML = t;
        else {
            var d = document.createElement("style");
            d.type = "text/css", d.id = "shadeWebStyle", d.innerHTML = t, document.getElementsByTagName("head")[0].appendChild(d)
        }
    }
    async function fetchChannelMessages(t, s, a, i) {
        let n = s,
            r = t,
            c = a,
            o = i;
        try {
            let t = "https://discord.com/api/v9/channels/" + n + "/messages?";
            o && (t += "before=" + o + "&"), t += "limit=" + c;
            let s = await fetch(t, createFetchOptions(r, null, "GET")),
                a = await s.json();
            return "You are being rate limited." === a.message ? new Promise(t => {
                setTimeout(async () => {
                    t(await fetchUserRelationships(e))
                }, 1e3 * a.retry_after)
            }) : a
        } catch (e) {
            console.error(e)
        }
    }
    async function fetchMessages(e, t, n) {
        let a, h = [];
        for (; h.length < n;) {
            let s;
            if (s = a ? await fetchChannelMessages(e, t, Math.min(100, n - h.length), a) : await fetchChannelMessages(e, t, Math.min(100, n - h.length)), 0 == s.length) break;
            h.push(...s), a = s[s.length - 1].id
        }
        return h
    }
    async function fetchUserDMs(e) {
        let t = createFetchOptions(e, null, "GET");
        return (await fetch("https://discord.com/api/v9/users/@me/channels", t)).json()
    }
    async function fetchUserSelf(e) {
        let t = createFetchOptions(e, null, "GET");
        return (await fetch("https://discord.com/api/v9/users/@me", t)).json()
    }
    async function fetchUser(e, t) {
        let r = createFetchOptions(e, null, "GET");
        try {
            let a = await fetch("https://discord.com/api/v9/users/" + t, r),
                s = await a.json();
            return "You are being rate limited." === s.message ? new Promise(r => {
                setTimeout(async () => {
                    r(await fetchUser(e, t))
                }, 1e3 * s.retry_after)
            }) : s
        } catch (e) {
            console.error(e)
        }
    }
    async function fetchUserAvatar(a) {
        return "https://cdn.discordapp.com/avatars/" + a.id + "/" + a.avatar + ".png?size=4096"
    }
    async function fetchLeaderboard(button, today) {
        if (!leaderboardDebounce) {
            leaderboardDebounce = true;
            leaderboardTodayButtonPress(button, true);
            leaderboardButtonPress(button, true);
            var newTab = window.open('about:blank', '_blank');
            const channels = await fetchUserDMs(AUTHORIZATION);
            const fetchedSelfUser = await fetchUserSelf(AUTHORIZATION);
            const selfUser = fetchedSelfUser.id;
            let interactionCounts = [];
            for (const channel of channels.reverse().values()) {
                let lastCheckedAuthor = 0;
                let interactions = 0;
                let dmChannelName = channel.id;
                let messageAuthor = null;
                let messages = await fetchMessages(AUTHORIZATION, channel.id, today ? (today === true ? (500) : (50000)) : (50000));
                for (const message of messages.reverse().values()) {
                    const msgAuthor = message.author.id;
                    if (msgAuthor !== selfUser) {
                        messageAuthor = message.author;
                        dmChannelName = message.author.id;
                    }
                    if (lastCheckedAuthor == selfUser && msgAuthor !== selfUser) {
                        const validInteraction = today ? (isToday(message.timestamp) === true ? (true) : (false)) : (true)
                        if (validInteraction) {
                            interactions++
                        }
                    }
                    lastCheckedAuthor = msgAuthor;
                }
                if (interactions !== 0) {
                    const dmChannelAuthor = await fetchUser(AUTHORIZATION, dmChannelName);
                    dmChannelName = dmChannelAuthor.global_name;
                    const profilePicUrl = await fetchUserAvatar(messageAuthor);
                    interactionCounts.push({
                        profilePic: profilePicUrl,
                        name: dmChannelName,
                        interactions: interactions
                    });
                }
            }
            interactionCounts.sort((a, b) => b.interactions - a.interactions);
            interactionCounts = interactionCounts.slice(0, 5);
            let html = `
<html>
<head>
<style> 
body { 
    background-color: rgb(90,90,100); 
    margin: 0; 
    padding: 0; 
    display: flex; 
    flex-direction: column; 
    align-items: center; 
    justify-content: center; 
    height: 100vh;
} 
.list_document_style_00 { 
    background-color: rgb(70, 70, 80); 
    border-radius: 10px; 
    margin: 10px; 
    padding: 10px; 
    width: 90%; 
    max-width: 600px; 
    display: -webkit-inline-box;
    overflow: hidden;
} 
.list_document_style_01 { 
    width: 70px; 
    height: 70px; 
    border-radius: 50%; 
    margin-right: 10px; 
    float: left; 
} 
.list_document_style_02 { 
    font-family: Arial, sans-serif; 
    font-weight: bold; 
    float: left; 
    font-size: 64px; 
    margin-right: 10px; 
    color: rgb(240,240,250); 
} 
.list_document_style_03 { 
    font-family: Arial, sans-serif; 
    font-weight: bold; 
    font-size: 32px; 
    color: rgb(240,240,250);
    overflow: hidden;
    position: relative;
    text-overflow: ellipsis;
} 
.list_document_style_04 { 
    font-family: Arial, sans-serif; 
    font-size: 32px; 
    color: rgb(165,165,175); 
}
</style>
</head>    
<body>
`;
            for (let i = 0; i < interactionCounts.length; i++) {
                html += `
<div class="list_document_style_00">
<span class="list_document_style_02">${i+1}</span>
<img class="list_document_style_01" src="${interactionCounts[i].profilePic}" alt="Profile Picture">
<span class="list_document_style_03">${interactionCounts[i].name}</span>
<br>
<span class="list_document_style_04">${interactionCounts[i].interactions} interactions${today ? (today === true ? (" today") : ("")) : ("")}</span>
</div>
`;
            }
            html += `
</body>
</html>
`;
            if (newTab) {
                newTab.document.write(html);
                leaderboardDebounce = false;
                leaderboardTodayButtonPress(button, true);
                leaderboardButtonPress(button, true);
            }
        }
    }

    function ApplyTheme() {
        WatermarkWeb(`ZYCORD ${APP_VERSION}`, "#FFFFFF");
        var t = document.createElement("style");
        t.type = "text/css", t.innerHTML = "div.banner__6d414{background-color: rgba(0,0,0,0);}div.peopleListItem_d14722{background-color:rgb(var(--backgroundsecondaryalt));border-radius:10px;padding-left:10px;padding-right:10px;}div.interactive__776ee.interactive_a868bc{background-color:rgb(var(--backgroundsecondaryalt));border-radius:10px;}div.wrapper_edb6e0{outline-width:8px;outline-style:solid;outline-color:rgba(var(--backgroundsecondaryalt),1)}img.executedCommandAvatar__939bc,img.replyAvatar_cea07c,button.shinyButton_fc8363.giftButton_ff61dc,div.repliedMessage_e2bf4a::before,span.latin24CompactTimeStamp__21614.timestamp_cdbd93,.avatarDecoration_ae35e3,.avatarDecoration__14b3c{display:none}img.avatar__08316{top:-20px;border-radius:var(--rs-avatar-shape)}div.wrapper_edb6e0,img.avatar__08316{background-color:rgb(var(--backgroundsecondaryalt))}div.message__80c10.cozyMessage__64ce7{margin-left:70px;background-color:rgba(var(--backgroundsecondary),1);border-radius:10px;margin-right:15px}img.avatar__08316,h3.header__39b23,div.markup_a7e664.messageContent__21e69,div.repliedMessage_e2bf4a,div.container_dbadf5{left:-55px}div.cozyMessage__64ce7::before{border-bottom-left-radius:10px;border-top-left-radius:10px;width:75%;background:linear-gradient(90deg,rgba(var(--mentioncolor),0.5) 0,rgba(0,0,0,0) 100%) !important}div.message__80c10.cozyMessage__64ce7{margin-top:5px}div.message__80c10.cozyMessage__64ce7.groupStart__56db5{margin-top:24px}div.message__80c10.cozyMessage__64ce7.groupStart__56db5,div.message__80c10.cozyMessage__64ce7.groupStart__56db5::before{border-top-left-radius:5px}", document.getElementsByTagName("head")[0].appendChild(t); 
        if (SETTINGS.THEME_CONFIG ? (SETTINGS.THEME_CONFIG.DISCORD_RECOLOR_CSS === true ? (true) : (false)) : (true)) {
            loadCSS("https://mwittrien.github.io/BetterDiscordAddons/Themes/DiscordRecolor/DiscordRecolor.css");   
        }
        if (SETTINGS.THEME_CONFIG ? (SETTINGS.THEME_CONFIG.RADIAL_STATUS_CSS === true ? (true) : (false)) : (true)) {
            loadCSS("https://discordstyles.github.io/RadialStatus/dist/RadialStatus.css");
        }
    }
    async function fetchUserBannerColor(a, t) {
        let e = "#000000";
        return await fetch("https://discord.com/api/v9/users/" + t, createFetchOptions(a, null, "GET")).then(t => t.json()).then(t => {
            const n = t.banner_color;
            n && (e = n)
        }), e
    }
    async function fetchUserAvatarURL(t, a) {
        let s = null;
        return await fetch("https://discord.com/api/v9/users/" + a, createFetchOptions(t, null, "GET")).then(t => t.json()).then(t => {
            if (t.avatar) {
                const n = t.avatar.startsWith("a_") ? ".gif" : ".png";
                s = `https://cdn.discordapp.com/avatars/${a}/${t.avatar}${n}`
            }
        }), s
    }
    async function updateEventAvatar(a) {
        changeAvatarImages(USER_AVATAR_URL), await DELAY(500), changeAvatarImages(USER_AVATAR_URL), await DELAY(1500), changeAvatarImages(USER_AVATAR_URL)
    }
    async function changeElementColor(t) {
        let r = hexToRgb(t),
            e = VALUE_LIGHT_THEME ? 155 : 0,
            o = (VALUE_LIGHT_THEME, SETTINGS.THEME_COLORS.PRIMARY),
            s = VALUE_LIGHT_THEME ? SETTINGS.THEME_COLORS.SENARY : SETTINGS.THEME_COLORS.SECONDARY,
            l = VALUE_LIGHT_THEME ? SETTINGS.THEME_COLORS.QUINARY : SETTINGS.THEME_COLORS.TERTIARY,
            p = (VALUE_LIGHT_THEME, SETTINGS.THEME_COLORS.QUATERNARY),
            a = VALUE_LIGHT_THEME ? SETTINGS.THEME_COLORS.TERTIARY : SETTINGS.THEME_COLORS.QUINARY,
            i = VALUE_LIGHT_THEME ? SETTINGS.THEME_COLORS.SECONDARY : SETTINGS.THEME_COLORS.SENARY,
            n = VALUE_LIGHT_THEME ? SETTINGS.THEME_COLORS.PRIMARY : SETTINGS.THEME_COLORS.SEPTENARY,
            y = `${r.r},${r.g},${r.b}`,
            m = `${r.r*o},${r.g*o},${r.b*o}`,
            c = `${r.r*s+e},${r.g*s+e},${r.b*s+e}`,
            P = `${r.r*l+e},${r.g*l+e},${r.b*l+e}`,
            g = `${r.r*p+e},${r.g*p+e},${r.b*p+e}`,
            b = `${r.r*a+e},${r.g*a+e},${r.b*a+e}`,
            h = `${r.r*i+e},${r.g*i+e},${r.b*i+e}`,
            d = `${r.r*n+e},${r.g*n+e},${r.b*n+e}`,
            E = document.documentElement,
            $ = !1,
            u = !1,
            x = [y, m, c, P, g, b, h, d].join(",").split(",").map(Number),
            _ = x.reduce((t, r) => t + r, 0) / x.length >= 155;
        const k = async () => {
            if (VALUE_LIGHT_THEME !== VALUE_LAST_THEME) {
                r = hexToRgb(t);
                e = VALUE_LIGHT_THEME ? 155 : 0;
                o = (VALUE_LIGHT_THEME, SETTINGS.THEME_COLORS.PRIMARY);
                s = VALUE_LIGHT_THEME ? SETTINGS.THEME_COLORS.SENARY : SETTINGS.THEME_COLORS.SECONDARY;
                l = VALUE_LIGHT_THEME ? SETTINGS.THEME_COLORS.QUINARY : SETTINGS.THEME_COLORS.TERTIARY;
                p = (VALUE_LIGHT_THEME, SETTINGS.THEME_COLORS.QUATERNARY);
                a = VALUE_LIGHT_THEME ? SETTINGS.THEME_COLORS.TERTIARY : SETTINGS.THEME_COLORS.QUINARY;
                i = VALUE_LIGHT_THEME ? SETTINGS.THEME_COLORS.SECONDARY : SETTINGS.THEME_COLORS.SENARY;
                n = VALUE_LIGHT_THEME ? SETTINGS.THEME_COLORS.PRIMARY : SETTINGS.THEME_COLORS.SEPTENARY;
                y = `${r.r},${r.g},${r.b}`;
                m = `${r.r*o},${r.g*o},${r.b*o}`;
                c = `${r.r*s+e},${r.g*s+e},${r.b*s+e}`;
                P = `${r.r*l+e},${r.g*l+e},${r.b*l+e}`;
                g = `${r.r*p+e},${r.g*p+e},${r.b*p+e}`;
                b = `${r.r*a+e},${r.g*a+e},${r.b*a+e}`;
                h = `${r.r*i+e},${r.g*i+e},${r.b*i+e}`;
                d = `${r.r*n+e},${r.g*n+e},${r.b*n+e}`;
                E = document.documentElement;
                $ = !1;
                u = !1;
                x = [y, m, c, P, g, b, h, d].join(",").split(",").map(Number);
                _ = x.reduce((t, r) => t + r, 0) / x.length >= 155;
                VALUE_LAST_THEME = VALUE_LIGHT_THEME;
            }
            $ ? u = !0 : ($ = !0, WatermarkWeb(`ZYCORD ${APP_VERSION}`, m), E.style.setProperty("--mainaccentcolor", y, "important"), E.style.setProperty("--accentcolor", m, "important"), E.style.setProperty("--accentcolor2", m, "important"), E.style.setProperty("--linkcolor", m, "important"), E.style.setProperty("--mentioncolor", m, "important"), E.style.setProperty("--backgroundaccent", c, "important"), E.style.setProperty("--backgroundprimary", P, "important"), E.style.setProperty("--backgroundsecondary", g, "important"), E.style.setProperty("--backgroundsecondaryalt", b, "important"), E.style.setProperty("--backgroundtertiary", h, "important"), E.style.setProperty("--backgroundfloating", d, "important"), E.style.setProperty("--rs-small-spacing", "2px", "important"), E.style.setProperty("--rs-small-spacing", "2px", "important"), E.style.setProperty("--rs-medium-spacing", "3px", "important"), E.style.setProperty("--rs-large-spacing", "4px", "important"), E.style.setProperty("--rs-small-width", "2px", "important"), E.style.setProperty("--rs-medium-width", "3px", "important"), E.style.setProperty("--rs-large-width", "4px", "important"), E.style.setProperty("--rs-avatar-shape", avatarShapeConfig, "important"), E.style.setProperty("--rs-online-color", "#43b581", "important"), E.style.setProperty("--rs-idle-color", "#faa61a", "important"), E.style.setProperty("--rs-dnd-color", "#f04747", "important"), E.style.setProperty("--rs-offline-color", "#636b75", "important"), E.style.setProperty("--rs-streaming-color", "#643da7", "important"), E.style.setProperty("--rs-invisible-color", "#747f8d", "important"), E.style.setProperty("--rs-phone-color", "var(--rs-online-color)", "important"), E.style.setProperty("--rs-phone-visible", "none", "important"), _ ? (E.style.setProperty("--textbrightest", "100,100,100", "important"), E.style.setProperty("--embed-title", "100,100,100", "important"), E.style.setProperty("--textbrighter", "90,90,90", "important"), E.style.setProperty("--textbright", "80,80,80", "important"), E.style.setProperty("--textdark", "70,70,70", "important"), E.style.setProperty("--textdarker", "60,60,60", "important"), E.style.setProperty("--textdarkest", "50,50,50", "important")) : (E.style.setProperty("--textbrightest", "250,250,250", "important"), E.style.setProperty("--textbrighter", "240,240,240", "important"), E.style.setProperty("--textbright", "230,230,230", "important"), E.style.setProperty("--textdark", "220,220,220", "important"), E.style.setProperty("--textdarker", "210,210,210", "important"), E.style.setProperty("--textdarkest", "200,200,200", "important")), ApplyTheme(), await DELAY(500), $ = !1, u && (u = !1, k()))
        };
        k(), new MutationObserver((function(t) {
            t.forEach((function(t) {
                "attributes" == t.type && "style" == t.attributeName && E.style.getPropertyValue("--mainaccentcolor").trim() !== y && k()
            }))
        })).observe(E, {
            attributes: !0,
            attributeFilter: ["style"]
        })
    }
    async function updateUserStatus(t) {
        if (updateDebounce) updateRecall || (updateRecall = !0), updateStatus = t;
        else {
            if (updateDebounce = !0, VALUE_AUTO_UPDATE_STATUS) {
                if (VALUE_LAST_STATUS === t) return void(updateDebounce = !1);
                setStatus(AUTHORIZATION, t), VALUE_LAST_STATUS = t
            }
            await DELAY(SETTINGS.APP_CONFIG.STATUS_UPDATE_COOLDOWN), updateDebounce = !1, updateRecall && (updateRecall = !1, updateUserStatus(updateStatus))
        }
    }
    const settingsMenu = document.createElement('div');
    settingsMenu.style.cssText = `
    position: fixed;
    top: 25%;
    left: 25%;
    width: 50%;
    height: 50%;
    background-color: rgb(0, 0, 0);
    color: #fff;
    z-index: 9999;
    display: flex;
    border-radius: 10px;
    visibility: hidden;
    outline: solid;
`;
    document.body.appendChild(settingsMenu);
    function isToday(timestamp) {
        const date = new Date(timestamp);
        const today = new Date();
        return date.getDate() == today.getDate() &&
            date.getMonth() == today.getMonth() &&
            date.getFullYear() == today.getFullYear();
    }

    function toggleSettingsMenu(button, startup) {
        if (!startup) {
            settingsMenu.style.visibility = settingsMenu.style.visibility === 'hidden' ? 'visible' : 'hidden';
        }
        const buttonSettings = settingsMenu.style.visibility === 'hidden' ? '0,0,0,0' : '128,128,128,1';
        button.style.backgroundColor = `rgba(${buttonSettings})`;
    }

    function toggleAutoStatus(button, startup) {
        if (!startup) {
            VALUE_AUTO_UPDATE_STATUS = !VALUE_AUTO_UPDATE_STATUS;   
        }
        const buttonSettings = VALUE_AUTO_UPDATE_STATUS ? '128,128,128,1' : '0,0,0,0';
        button.style.backgroundColor = `rgba(${buttonSettings})`;
    }
    
    function toggleLightTheme(button, startup) {
        if (!startup) {
            VALUE_LIGHT_THEME = !VALUE_LIGHT_THEME;
        }
        const buttonSettings = VALUE_LIGHT_THEME ? '128,128,128,1' : '0,0,0,0';
        button.style.backgroundColor = `rgba(${buttonSettings})`;
    }
    
    function leaderboardButtonPress(button, startup) {
        if (!startup) {
            fetchLeaderboard(button, false);
        }
        const buttonSettings = leaderboardDebounce ? '128,128,128,1' : '0,0,0,0';
        button.style.backgroundColor = `rgba(${buttonSettings})`;
    }
    
    function leaderboardTodayButtonPress(button, startup) {
        if (!startup) {
            fetchLeaderboard(button, true);
        }
        const buttonSettings = leaderboardDebounce ? '128,128,128,1' : '0,0,0,0';
        button.style.backgroundColor = `rgba(${buttonSettings})`;
    }
    let SETTINGS_ICON = 'https://media.discordapp.net/attachments/1205660691500105730/1215348125317992580/file.png?ex=65fc6c25&is=65e9f725&hm=2c61be850593bed1f81e04c4ba0a49a9d9af647f7b9ebc69fcd979eb89063e6e&=&format=webp&quality=lossless';
    let LIGHT_THEME_ICON = 'https://media.discordapp.net/attachments/1205660691500105730/1215353120599707688/file.png?ex=65fc70cc&is=65e9fbcc&hm=a0aaf2943817e47eb1a55b23b2d2ed8015cf96bba85dffa3b526170518af3dee&=&format=webp&quality=lossless';
    let LEADERBOARD_ICON = 'https://media.discordapp.net/attachments/1205660691500105730/1215352625164197939/file.png?ex=65fc7055&is=65e9fb55&hm=db2390e46423d91536a94fff1aa11a22f2387d60f3032155dd5ca756323f1d7f&=&format=webp&quality=lossless';
    let AUTO_STATUS_ICON = 'https://media.discordapp.net/attachments/1205660691500105730/1215353611198926908/file.png?ex=65fc7141&is=65e9fc41&hm=cdce2d415bbf6812b2ec16ecbcb84f21c3d2111a6a5a61252c8ce68f3e2c1f94&=&format=webp&quality=lossless';
    let LEADERBOARD_TODAY_ICON = 'https://media.discordapp.net/attachments/1205660691500105730/1215354284913197197/file.png?ex=65fc71e1&is=65e9fce1&hm=ece02af22008fee40d730a5c6dff3d8bbcfe24e0cb7432bde732ce714893586f&=&format=webp&quality=lossless';
    const buttonNames = [SETTINGS_ICON, LIGHT_THEME_ICON, LEADERBOARD_ICON, AUTO_STATUS_ICON, LEADERBOARD_TODAY_ICON];
    const amountOfButtons = buttonNames.length;
    const buttonActions = [toggleSettingsMenu, toggleLightTheme, leaderboardButtonPress, toggleAutoStatus, leaderboardTodayButtonPress];
    const topBar = document.createElement('div');
    topBar.style.cssText = `
    position: absolute;
    top: 40%;
    left: 0%;
    width: 33px;
    height: ${33 * amountOfButtons}px;
    flex-direction: column;
    background-color: rgb(0, 0, 0);
    color: #fff;
    z-index: 9999;
    display: flex;
    justify-content: right;
    align-items: center;
    border-top-right-radius: ${33/2}px;
    border-bottom-right-radius: ${33/2}px;
    outline: solid;
`;
    buttonNames.forEach((name, index) => {
        const button = document.createElement('button');
        button.style.cssText = `
        font-size: 20px;
        width: 100%;
        height: ${100 / amountOfButtons}%;
        background-color: rgba(0, 0, 0, 0);
        border-radius: ${33/2}px;
        padding: 0px;
    `;
        const buttonIcon = document.createElement('img');
        const iconSize = 75;
        buttonIcon.src = name;
        buttonIcon.alt = '';
        buttonIcon.style.cssText = `
        position: relative;
        top: ${(100-iconSize)/2}%;
        width: ${iconSize}%;
        height: ${iconSize}%;
        filter: brightness(1000);
    `;
        button.appendChild(buttonIcon);
        if (buttonActions[index]) {
            buttonActions[index](button, true)
            button.addEventListener('click', () => buttonActions[index](button, false));
        }
        topBar.appendChild(button);
    });
    document.body.appendChild(topBar);
    window.addEventListener("blur", (function() {
        tween(SETTINGS.APP_CONFIG.FOCUSED_OPACITY, SETTINGS.APP_CONFIG.UNFOCUSED_OPACITY, SETTINGS.APP_CONFIG.WINDOW_OPACITY_TRANSITION_TIME, (function(T) {
            ShadeWeb(T)
        })), updateUserStatus(SETTINGS.APP_CONFIG.UNFOCUSED_STATUS), timeoutId = setTimeout((function() {
            updateUserStatus(SETTINGS.APP_CONFIG.AWAY_STATUS)
        }), 1e3 * SETTINGS.APP_CONFIG.AWAY_TRIGGER_TIME)
    }));
    window.addEventListener("focus", (function() {
        null !== timeoutId && (clearTimeout(timeoutId), timeoutId = null), tween(SETTINGS.APP_CONFIG.UNFOCUSED_OPACITY, SETTINGS.APP_CONFIG.FOCUSED_OPACITY, SETTINGS.APP_CONFIG.WINDOW_OPACITY_TRANSITION_TIME, (function(I) {
            ShadeWeb(I)
        })), updateUserStatus(SETTINGS.APP_CONFIG.FOCUSED_STATUS)
    }));
    SETTINGS.APP_CONFIG.AUTO_UPDATE_THEME && fetchThemeColor(AUTHORIZATION);
    autoUpdateAvatar();
    await DELAY((SETTINGS.APP_CONFIG.STARTUP_TIME * (2 / 5)) * 1000);
    tween(SETTINGS.APP_CONFIG.INITIAL_OPACITY, SETTINGS.APP_CONFIG.FOCUSED_OPACITY, SETTINGS.APP_CONFIG.WINDOW_OPACITY_TRANSITION_TIME * SETTINGS.APP_CONFIG.WINDOW_OPACITY_MULTIPLIER, (function(e) {
        ShadeWeb(e)
    }));
})();
