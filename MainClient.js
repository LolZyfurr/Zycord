(async function() {
    let AUTHORIZATION = getToken();
    let LAST_AUTH = AUTHORIZATION;
    let THEME_COLOR = SETTINGS.THEME_CONFIG ? (SETTINGS.THEME_CONFIG.CUSTOM_THEME_COLOR !== false ? (SETTINGS.THEME_CONFIG.CUSTOM_THEME_COLOR) : (null)) : (null);
    let BLUR_WEB = SETTINGS ? (SETTINGS.THEME_CONFIG ? (SETTINGS.THEME_CONFIG.USE_BLUR_INSTEAD ? (SETTINGS.THEME_CONFIG.USE_BLUR_INSTEAD === true ? (true) : (false)) : (false)) : (false)) : (false);
    let BLUR_WEB_AMOUNT = SETTINGS ? (SETTINGS.THEME_CONFIG ? (SETTINGS.THEME_CONFIG.BLUR_AMOUNT ? (SETTINGS.THEME_CONFIG.BLUR_AMOUNT) : (10)) : (10)) : (10);
    let MONTH_UPDATED = 4
    let DAY_UPDATED = 8
    let YEAR_UPDATED = 24
    let MINUTES_UPDATED = 15
    let TIME_AFTERNOON = 1
    let TIME_UPDATED = 12
    let ALPHA_MONTH = String.fromCharCode(MONTH_UPDATED + 64)
    let ALPHA_DAY = DAY_UPDATED.toString(36)
    let ALPHA_YEAR = YEAR_UPDATED.toString(36)
    let ALPHA_MINUTES = MINUTES_UPDATED.toString(36)
    let ALPHA_TIME = (TIME_UPDATED + TIME_AFTERNOON).toString(36)
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
    let changelogTextData = await uwuify(await getChangelog());
    ShadeWeb(false, false, BLUR_WEB ? (BLUR_WEB_AMOUNT / (1 - SETTINGS.APP_CONFIG.INITIAL_OPACITY)) : (SETTINGS.APP_CONFIG.INITIAL_OPACITY), false);
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

    function generateRandomCode() {
        const characters = 'AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz1234567890';
        let code = '';
        for (let i = 0; i < 5; i++) {
            const randomIndex = Math.floor(Math.random() * characters.length);
            code += characters[randomIndex];
        }
        return code;
    }

    function createModal(Title, Body) {
        let clickDebounce = false;
        let elementCode = generateRandomCode();
        let mainContainerID = `${elementCode}-mainContainer`
        let layerContainerID = `${elementCode}-layerContainer`;
        let backdropID = `${elementCode}-backdrop`;
        let dialogID = `${elementCode}-dialog`;
        let modalBodyID = `${elementCode}-body`;
        let modalRootID = `${elementCode}-modalRoot`;
        let modalHeaderID = `${elementCode}-modalHeader`;
        let modalContentID = `${elementCode}-modalContent`;
        let modalFooterID = `${elementCode}-modalFooter`;
        let modalButtonID = `${elementCode}-modalButton`;
        const cssModal = `.layerContainer_a2fcaa{background:none !important;position:absolute;top:0;left:0;right:0;right:var(--devtools-sidebar-width,0);bottom:0;pointer-events:none;z-index:1002}.backdrop__1a911.withLayer__29ace{pointer-events:all}.backdrop__1a911{position:fixed;top:0;right:0;right:var(--devtools-sidebar-width,0);bottom:0;left:0;transform:translatez(0)}.layer_c14d31{position:absolute;top:0;bottom:0;left:0;right:0;align-items:center;display:flex;justify-content:center;flex-direction:column;min-height:0;padding-top:40px;padding-bottom:40px}.zycord-text-strong{font-weight:600}.zycord-text-20{font-size:20px;line-height:24px}.zycord-header-primary{color:var(--header-primary)}.zycord-button-filled.zycord-button-color-brand{color:var(--white-500);background-color:#3e82e5}.zycord-button-filled{-webkit-transition:background-color .17s ease,color .17s ease;transition:background-color .17s ease,color .17s ease}.zycord-button-grow,.zycord-button-icon{width:auto}.zycord-button-medium{width:96px;height:38px;min-width:96px;min-height:38px}.zycord-button{position:relative;display:flex;justify-content:center;align-items:center;box-sizing:border-box;background:0;border:0;border-radius:3px;font-size:14px;font-weight:500;line-height:16px;padding:2px 16px;user-select:none}a,div,span,strong,button,input,textarea,select,label{outline:0}body,textarea,input,button,select,::placeholder{font-family:var(--font-primary);text-rendering:optimizeLegibility}button{font-family:var(--font-primary);font-weight:500;border:0;cursor:pointer}user agent stylesheet button{appearance:auto;font-style:;font-variant-ligatures:;font-variant-caps:;font-variant-numeric:;font-variant-east-asian:;font-variant-alternates:;font-variant-position:;font-weight:;font-stretch:;font-size:;font-family:;font-optical-sizing:;font-kerning:;font-feature-settings:;font-variation-settings:;text-rendering:auto;color:buttontext;letter-spacing:normal;word-spacing:normal;line-height:normal;text-transform:none;text-indent:0;text-shadow:none;display:inline-block;text-align:center;align-items:flex-start;cursor:default;box-sizing:border-box;background-color:buttonface;margin:0;padding-block:1px;padding-inline:6px;border-width:2px;border-style:outset;border-color:buttonborder;border-image:initial}html,body,div,span,applet,object,iframe,h1,h2,h3,h4,h5,h6,p,blockquote,pre,a,abbr,acronym,address,big,cite,code,del,dfn,em,img,ins,kzycord,q,s,samp,small,strike,strong,tt,var,dl,dt,dd,ol,ul,li,fieldset,form,label,legend,table,caption,tbody,tfoot,thead,tr,th,td{margin:0;padding:0;border:0;font-weight:inherit;font-style:inherit;font-family:inherit;font-size:100%;vertical-align:baseline}user agent stylesheet h1{display:block;font-size:2em;margin-block-start:.67em;margin-block-end:.67em;margin-inline-start:0;margin-inline-end:0;font-weight:bold}.zycord-addon-modal{min-height:unset}.zycord-modal-medium{width:600px;max-height:800px;min-height:400px}.zycord-modal-root{display:flex;flex-direction:column;background-color:var(--modal-background);border-radius:4px;margin:0 auto;pointer-events:all;position:relative;max-height:100%}.zycord-addon-modal{min-height:0}.zycord-modal-header{border-radius:4px 4px 0 0;transition:box-shadow .1s ease-out;word-wrap:break-word}.zycord-modal-header,.zycord-modal-footer{position:relative;flex:0 0 auto;padding:16px;z-index:1;overflow-x:hidden}.zycord-flex-horizontal{flex-direction:row}.zycord-flex-no-wrap{flex-wrap:nowrap}.zycord-flex-justify-start{justify-content:flex-start}.zycord-flex-align-center{align-items:center}.zycord-flex{display:flex}.zycord-scroller-thin{scrollbar-width:thin;scrollbar-color:var(--scrollbar-thin-thumb) var(--scrollbar-thin-track)}.zycord-scroller-base{position:relative;box-sizing:border-box;min-height:0;flex:1 1 auto}.zycord-modal-content{position:relative;z-index:0;border-radius:5px 5px 0 0;padding-left:16px;overflow-x:hidden;font-size:16px;line-height:20px;padding-bottom:20px;overflow:hidden scroll;padding-right:8px}.zycord-modal-footer{border-radius:0 0 5px 5px;background-color:var(--modal-footer-background);overflow:hidden;box-shadow:inset 0 1px 0 hsl(var(--primary-630-hsl)/.6)}.zycord-modal-header,.zycord-modal-footer{position:relative;flex:0 0 auto;padding:16px;z-index:1;overflow-x:hidden}.zycord-flex-reverse{flex-direction:row-reverse}.zycord-flex-no-wrap{flex-wrap:nowrap}.zycord-flex-justify-start{justify-content:flex-start}.zycord-flex-align-stretch{align-items:stretch}.zycord-flex{display:flex}`;
        const htmlModal = `<style> ${cssModal} </style> <div class="layerContainer_a2fcaa" id="${layerContainerID}"> <div class="backdrop__1a911 withLayer__29ace" id="${backdropID}" style="background: rgba(0, 0, 0, 0.7); backdrop-filter: blur(0px);"></div> <div class="layer_c14d31"> <div role="dialog" tabindex="-1" aria-modal="true" id="${dialogID}"> <div class="zycord-modal-root zycord-modal-medium zycord-addon-modal" style="opacity: 1; transform: scale(1);" id="${modalRootID}"> <div class="zycord-flex zycord-flex-horizontal zycord-flex-justify-start zycord-flex-align-center zycord-flex-no-wrap zycord-modal-header" style="flex: 0 0 auto;" id="${modalHeaderID}"> <h1 class="zycord-header-primary zycord-text-20 zycord-text-strong">${Title}</h1> </div> <div class="zycord-modal-content zycord-scroller-base zycord-scroller-thin" id="${modalContentID}"> <div class="zycord-addon-settings-wrap"> <div id="${modalBodyID}"> ${Body} </div> </div> </div> <div class="zycord-flex zycord-flex-reverse zycord-flex-justify-start zycord-flex-align-stretch zycord-flex-no-wrap zycord-modal-footer" style="flex: 0 0 auto;" id="${modalFooterID}"> <button id="${modalButtonID}" class="zycord-button zycord-button-filled zycord-button-color-brand zycord-button-medium zycord-button-grow" type="submit"> <div class="zycord-button-content">Done</div> </button> </div> </div> </div> </div> </div>`;
        var modal = document.createElement('div');
        modal.id = mainContainerID;
        modal.innerHTML = htmlModal;
        let tweenValues001 = {
            timeValue: 500,
            valueStart: 0.75,
            endValue: 1,
        };
        let tweenValues002 = {
            timeValue: 250,
            valueStart: 0,
            endValue: 1,
        };
        tween(tweenValues001.valueStart, tweenValues001.endValue, tweenValues001.timeValue, returnedValue => (modalElements.modalRoot.style.transform = `scale(${returnedValue})`));
        tween(tweenValues002.valueStart, tweenValues002.endValue, tweenValues002.timeValue * 2, returnedValue => (modalElements.backdrop.style.opacity = returnedValue));
        tween(tweenValues002.valueStart, tweenValues002.endValue, tweenValues002.timeValue, returnedValue => (modalElements.modalRoot.style.opacity = returnedValue));
        document.getElementById('app-mount').appendChild(modal);
        const modalElements = {
            uniqueIdentifier: elementCode,
            mainContainer: document.getElementById(mainContainerID),
            layerContainer: document.getElementById(layerContainerID),
            backdrop: document.getElementById(backdropID),
            dialog: document.getElementById(dialogID),
            modalBody: document.getElementById(modalBodyID),
            modalRoot: document.getElementById(modalRootID),
            modalHeader: document.getElementById(modalHeaderID),
            modalContent: document.getElementById(modalContentID),
            modalFooter: document.getElementById(modalFooterID),
            modalButton: document.getElementById(modalButtonID),
        }
        const handleClick = async function() {
            if (!clickDebounce) {
                clickDebounce = true
                let tweenValues01 = {
                    timeValue: 500,
                    valueStart: 1,
                    endValue: 0.75,
                };
                let tweenValues02 = {
                    timeValue: 250,
                    valueStart: 1,
                    endValue: 0,
                };
                tween(tweenValues01.valueStart, tweenValues01.endValue, tweenValues01.timeValue, returnedValue => (modalElements.modalRoot.style.transform = `scale(${returnedValue})`));
                tween(tweenValues02.valueStart, tweenValues02.endValue, tweenValues02.timeValue * 2, returnedValue => (modalElements.backdrop.style.opacity = returnedValue));
                tween(tweenValues02.valueStart, tweenValues02.endValue, tweenValues02.timeValue, returnedValue => (modalElements.modalRoot.style.opacity = returnedValue));
                await DELAY(1 * 1000);
                modalElements.mainContainer.innerHTML = "";
            }
        };
        modalElements.backdrop.addEventListener('click', handleClick);
        modalElements.modalButton.addEventListener('click', handleClick);
        return modalElements;
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
    async function getChangelog() {
        const CHANGELOG_API_URL = "https://github.com/Zy1ux/Zycord/latest-commit/main/MainClient.js";
        try {
            const response = await fetch("https://github.com/Zy1ux/Zycord/latest-commit/main/MainClient.js", {
                "headers": {
                    "accept": "application/json",
                    "accept-language": "en-US,en;q=0.9",
                    "content-type": "application/json",
                },
                "body": null,
                "method": "GET"
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const changelogData = await response.json();
            const parser = new DOMParser();
            const doc = parser.parseFromString(changelogData.shortMessageHtmlLink, 'text/html');
            return doc.body.textContent;
        } catch (error) {
            return error.toString();
        }
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
        t.type = "text/css", t.innerHTML = `\nbody::after {\n color: ${e};\n content: "${n}";\n  position: fixed;\n  bottom: 10px;\n  right: 10px;\n  font-size: 25px;\n  font-weight: 900;\n  opacity: 1;\n}\n  z-index: 999999;\n`, document.getElementsByTagName("head")[0].appendChild(t)
    }

    function fetchThemeColor(e) {
        null == THEME_COLOR ? fetch(USER_API_URL, createFetchOptions(e, null, "GET")).then(e => e.json()).then(e => {
            const n = e.banner_color;
            n && (console.log(n), THEME_COLOR = n, changeElementColor(THEME_COLOR))
        }) : changeElementColor(THEME_COLOR)
    }

    function ShadeWeb(tweenType, originalValue, goalValue, timeValue) {
        if (tweenType) {
            const valueOriginalShade = BLUR_WEB ? (BLUR_WEB_AMOUNT * originalValue) : originalValue;
            const valueGoalShade = BLUR_WEB ? (BLUR_WEB_AMOUNT * goalValue) : goalValue;
            tween(valueOriginalShade, valueGoalShade, timeValue, T => ShadeWeb(false, false, T, false));
        } else {
            WatermarkWeb(`ZYCORD ${APP_VERSION}`, "#FFFFFF");
            const styleElement = document.getElementById("shadeWebStyle") || document.createElement("style");
            styleElement.type = "text/css";
            styleElement.id = "shadeWebStyle";
            styleElement.innerHTML = `
                body::before {
                    content: "";
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    z-index: 999998;
                    pointer-events: none;
                    ${BLUR_WEB ? `backdrop-filter: blur(${goalValue}px);` : `background-color: rgba(0,0,0,${goalValue});`}
                    background-image: url('');
                    background-size: cover;
                }
            `;
            if (!document.getElementById("shadeWebStyle")) {
                document.getElementsByTagName("head")[0].appendChild(styleElement);
            }
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
            const loadingHtml = `<div style="display: grid;"> <img src="https://github.com/Zy1ux/Zycord/blob/main/Images/9237-loading.gif?raw=true" style="height: 25%; max-height: 250px; justify-self: center; align-self: center;"></div>`;
            const channels = await fetchUserDMs(AUTHORIZATION);
            const fetchedSelfUser = await fetchUserSelf(AUTHORIZATION);
            const selfUser = fetchedSelfUser.id;
            let modalLeaderboard = createModal(`${today ? (today === true ? ("Todays") : ("")) : ("")} Leaderboard`, loadingHtml);
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
                    const interactionBlacklist = SETTINGS.APP_CONFIG ? (SETTINGS.APP_CONFIG.LEADERBOARD_BLACKLIST ? (SETTINGS.APP_CONFIG.LEADERBOARD_BLACKLIST) : (['0'])) : (['0']);
                    const dmChannelAuthor = await fetchUser(AUTHORIZATION, dmChannelName);
                    dmChannelName = dmChannelAuthor.global_name;
                    const dmChannelUserID = dmChannelAuthor.id;
                    const profilePicUrl = await fetchUserAvatar(messageAuthor);
                    if (!interactionBlacklist.includes(dmChannelUserID)) {
                        interactionCounts.push({
                            profilePic: profilePicUrl,
                            name: dmChannelName,
                            interactions: interactions
                        });
                    }
                }
            }
            interactionCounts.sort((a, b) => b.interactions - a.interactions);
            interactionCounts = interactionCounts.slice(0, 5);
            let html = `
<div>
    <style>
    .leaderboard-div-style-main-zycord {
        display: flex;
        width: 100%;
        padding: 5px;
    }
    .leaderboard-div-style-position-zycord {
        display: grid;
        width: 50px;
        align-content: center;
        justify-content: center;
    }
    .leaderboard-div-style-avatarholder-zycord {
        align-content: center;
    }
    .leaderboard-div-style-avatar-zycord {
        width: 50px;
        border-radius: 50%;
    }
    .leaderboard-div-style-textholder-zycord {
        margin-left: 20px;
        display: grid;
        align-content: center;
    }
    .leaderboard-div-style-title-zycord {
        font-weight: bold;
        overflow: hidden;
        text-overflow: ellipsis;
        font-size: 22px;
        color: var(--header-primary);
    }
    .leaderboard-div-style-subtitle-zycord {
        overflow: hidden;
        text-overflow: ellipsis;
        font-size: 18px;
        color: var(--header-secondary);
    }
    .leaderboard-div-style-number-zycord {
        font-weight: bold;
        color: var(--header-primary);
        font-size: 40px;
    }
    </style>
    <div>
`;
            for (let i = 0; i < interactionCounts.length; i++) {
                html += `
    <div class="leaderboard-div-style-main-zycord">
        <div class="leaderboard-div-style-position-zycord">
            <span class="leaderboard-div-style-number-zycord">${i+1}</span>
        </div>
        <div class="leaderboard-div-style-avatarholder-zycord">
            <img src="${interactionCounts[i].profilePic}" alt="User Avatar" class="leaderboard-div-style-avatar-zycord">
        </div>
        <div class="leaderboard-div-style-textholder-zycord">
            <span class="leaderboard-div-style-title-zycord">${interactionCounts[i].name}</span>
            <span class="leaderboard-div-style-subtitle-zycord">${interactionCounts[i].interactions} interactions${today ? (today === true ? (" today") : ("")) : ("")}</span>
        </div>
    </div>
`;
            }
            html += `
    </div>
</div>
`;
            modalLeaderboard.modalBody.innerHTML = html;
            leaderboardDebounce = false;
            leaderboardButtonPress(button, true)
        }
    }

    function ApplyTheme() {
        WatermarkWeb(`ZYCORD ${APP_VERSION}`, "#FFFFFF");
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

    function isToday(timestamp) {
        const date = new Date(timestamp);
        const today = new Date();
        return date.getDate() == today.getDate() && date.getMonth() == today.getMonth() && date.getFullYear() == today.getFullYear();
    }

    function toggleSettingsMenu(button, startup) {
        if (!startup) {
            let settingsModalTitle = `Settings`;
            let settingsModalBody = `<div style="display: grid;"> <img src="https://github.com/Zy1ux/Zycord/blob/main/Images/9237-loading.gif?raw=true" style="height: 25%; max-height: 250px; justify-self: center; align-self: center;"></div>`;
            createModal(settingsModalTitle, settingsModalBody)
        }
        const buttonSettings = '0,0,0,0';
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

    function changelogButtonPress(button, startup) {
        if (!startup) {
            let changelogModalTitle = `Changelog`;
            let changelogModalBody = `<span style="color: var(--header-primary);">${changelogTextData}</span>`;
            createModal(changelogModalTitle, changelogModalBody)
        }
        const buttonSettings = '0,0,0,0';
        button.style.backgroundColor = `rgba(${buttonSettings})`;
    }

    function createNewSidebarMenu(sidebarSize, buttonHtml, uniqueIdentifier) {
        return `
<div>
    <style>
        .zycord-sidebar-div-holder {
            height: 100%;
            width: 100%;
            display: grid;
            justify-content: right;
            align-content: center;
        }

        .zycord-button, .zycord-main-button {
            background-color: #000;
            width: ${sidebarSize}px;
            height: ${sidebarSize}px;
            content: "";
            border-radius: 9999px;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .zycord-button:hover, .zycord-main-button:hover {
            background-color: #666;
        }

        .zycord-buttons-holder {
            background-color: #000;
            margin-top: 5px;
            width: ${sidebarSize}px;
            border-radius: 9999px;
            visibility: collapse;
        }

        .zycord-button-icon {
            width: 95%;
            filter: brightness(1000);
        }
    </style>
    <div class="zycord-sidebar-div-holder" id="zycord-sidebar-div-holder-${uniqueIdentifier}">
        <button class="zycord-main-button" id="zycord-main-button-${uniqueIdentifier}">
            <img src="https://github.com/Zy1ux/Zycord/blob/main/Images/2888-settings.png?raw=true" class="zycord-button-icon" id="zycord-button-icon-${uniqueIdentifier}">
        </button>
        <script>
            window.onload = function() {
                var mainButton = document.getElementById('zycord-main-button-${uniqueIdentifier}');
                var buttonsHolder = document.getElementById('zycord-button-holder-${uniqueIdentifier}');
                mainButton.style.visibility = 'visible';
                mainButton.addEventListener('click', function() {
                    if (buttonsHolder.style.visibility === 'visible') {
                        buttonsHolder.style.visibility = 'collapse';
                    } else {
                        buttonsHolder.style.visibility = 'visible';
                    }
                });
            };
        </script>
        <div class="zycord-buttons-holder" id="zycord-button-holder-${uniqueIdentifier}">
            ${buttonHtml}
        </div>
    </div>
</div>
`;
    }

    function createNewSidebarButton(buttonImage, uniqueIdentifier, buttonName) {
        const buttonCustomIdentifier = `zycord-button-${buttonName}-${uniqueIdentifier}`;
        const buttonHtmlValue = `<button class="zycord-button" id="${buttonCustomIdentifier}"> <img src="${buttonImage}" class="zycord-button-icon" id="zycord-button-icon-${uniqueIdentifier}"> </button>`;
        const returnValue = {
            buttonHtmlValue: buttonHtmlValue,
            buttonCustomIdentifier: buttonCustomIdentifier,
        };
        return returnValue;
    }

    function setupSidebarMenu() {
        const elementCode = generateRandomCode();
        const TOPBAR_SIZE = SETTINGS.UI_CONFIG?.INTERACTIVE_MENU_SIZE || 33;
        const ICONS = {
            "SETTINGS": 'https://github.com/Zy1ux/Zycord/blob/main/Images/2888-settings.png?raw=true',
            "LIGHT-THEME": 'https://github.com/Zy1ux/Zycord/blob/main/Images/8410-appearance-mobile-white.png?raw=true',
            "LEADERBOARD": 'https://github.com/Zy1ux/Zycord/blob/main/Images/5971-forum.png?raw=true',
            "AUTO-STATUS": 'https://github.com/Zy1ux/Zycord/blob/main/Images/1731-discord-profile-activity-white.png?raw=true',
            "LEADERBOARD-TODAY": 'https://github.com/Zy1ux/Zycord/blob/main/Images/8312-active-threads.png?raw=true',
            "CHANGELOG": ''
        };
        const buttonNames = ["settings", "light-theme", "leaderboard", "auto-status", "leaderboard-today", "changelog"];
        const buttonActions = [toggleSettingsMenu, toggleLightTheme, leaderboardButtonPress, toggleAutoStatus, leaderboardTodayButtonPress, changelogButtonPress];
        let buttonsHtmlValue = "";
        buttonNames.forEach((name, index) => {
            const buttonSidebar = createNewSidebarButton(ICONS[name.toUpperCase()], elementCode, name);
            buttonsHtmlValue += buttonSidebar.buttonHtmlValue;
        });
        const sidebarMenu = createNewSidebarMenu(TOPBAR_SIZE, buttonsHtmlValue, elementCode);
        const sidebarMenuElement = document.createElement('div');
        sidebarMenuElement.innerHTML = sidebarMenu;
        document.body.appendChild(sidebarMenuElement);
        buttonNames.forEach((name, index) => {
            const buttonIdentifier = createNewSidebarButton(ICONS[name.toUpperCase()], elementCode, name);
            const buttonElement = document.getElementById(buttonIdentifier.buttonCustomIdentifier);
            if (buttonActions[index]) {
                buttonActions[index](buttonElement, true)
                buttonElement.addEventListener('click', () => buttonActions[index](buttonElement, false));
            }
        });
    }
    setupSidebarMenu()
    window.addEventListener("blur", (function() {
        ShadeWeb(true, SETTINGS.APP_CONFIG.FOCUSED_OPACITY, SETTINGS.APP_CONFIG.UNFOCUSED_OPACITY, SETTINGS.APP_CONFIG.WINDOW_OPACITY_TRANSITION_TIME);
        updateUserStatus(SETTINGS.APP_CONFIG.UNFOCUSED_STATUS), timeoutId = setTimeout((function() {
            updateUserStatus(SETTINGS.APP_CONFIG.AWAY_STATUS);
        }), 1e3 * SETTINGS.APP_CONFIG.AWAY_TRIGGER_TIME);
    }));
    window.addEventListener("focus", (function() {
        null !== timeoutId && (clearTimeout(timeoutId), timeoutId = null);
        ShadeWeb(true, SETTINGS.APP_CONFIG.UNFOCUSED_OPACITY, SETTINGS.APP_CONFIG.FOCUSED_OPACITY, SETTINGS.APP_CONFIG.WINDOW_OPACITY_TRANSITION_TIME);
        updateUserStatus(SETTINGS.APP_CONFIG.FOCUSED_STATUS);
    }));
    SETTINGS.APP_CONFIG.AUTO_UPDATE_THEME && fetchThemeColor(AUTHORIZATION);
    autoUpdateAvatar();
    await DELAY((SETTINGS.APP_CONFIG.STARTUP_TIME * (2 / 5)) * 1000);
    ShadeWeb(true, SETTINGS.APP_CONFIG.INITIAL_OPACITY, SETTINGS.APP_CONFIG.FOCUSED_OPACITY, SETTINGS.APP_CONFIG.WINDOW_OPACITY_TRANSITION_TIME * SETTINGS.APP_CONFIG.WINDOW_OPACITY_MULTIPLIER);
})();
