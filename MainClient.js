(async function() {
    let CONFIG_DATA = {
        USER_TOKEN: zycordGetUserToken(),
        USER_THEME_COLOR: SETTINGS.THEME_CONFIG ? (SETTINGS.THEME_CONFIG.CUSTOM_THEME_COLOR !== false ? SETTINGS.THEME_CONFIG.CUSTOM_THEME_COLOR : null) : null,
        USER_USE_BLUR: SETTINGS ? (SETTINGS.THEME_CONFIG ? (SETTINGS.THEME_CONFIG.USE_BLUR_INSTEAD === true ? true : false) : false) : false,
        USER_BLUR_AMOUNT: SETTINGS ? (SETTINGS.THEME_CONFIG ? (SETTINGS.THEME_CONFIG.BLUR_AMOUNT ? SETTINGS.THEME_CONFIG.BLUR_AMOUNT : 10) : 10) : 10,
        USER_AUTO_STATUS: SETTINGS.APP_CONFIG.AUTO_UPDATE_STATUS,
        USER_AVATAR_SHAPE: SETTINGS.APP_CONFIG.AVATAR_SHAPE,
        USER_LIGHT_THEME: SETTINGS.APP_CONFIG.USE_LIGHT_THEME,
    };
    let UPDATED_DATA = {
        YEAR: 24,
        MONTH: 7,
        DAY: 30,
        HOUR: 10,
        AFTERNOON: 0,
        MINUTES: 11,
    };
    let VERSION_DATA = {
        VERSION_ALPHA_YEAR: UPDATED_DATA.YEAR.toString(36),
        VERSION_ALPHA_MONTH: String.fromCharCode(UPDATED_DATA.MONTH + 64),
        VERSION_ALPHA_DAY: UPDATED_DATA.DAY.toString(36),
        VERSION_ALPHA_HOUR: (UPDATED_DATA.HOUR + UPDATED_DATA.AFTERNOON).toString(36),
        VERSION_ALPHA_MINUTES: UPDATED_DATA.MINUTES.toString(36),
        VERSION_LABEL: "WIP",
    };
    let CHANGELOG_DATA = [{
        DATA_MESSAGE: "Fixed modal size visual.",
        DATA_TIME: "24.7.30.10.0.11"
    }, {
        DATA_MESSAGE: "Fixed errors, updated code, faster leaderboard waiting time.",
        DATA_TIME: "24.7.25.12.7.28"
    }, {
        DATA_MESSAGE: "Rewrote the watermark script.",
        DATA_TIME: "24.5.10.10.0.30"
    }, {
        DATA_MESSAGE: "Fixed the position of the status message.",
        DATA_TIME: "24.5.8.11.0.10"
    }, {
        DATA_MESSAGE: "Fixed some things and added a status message.",
        DATA_TIME: "24.5.8.11.0.10"
    }, {
        DATA_MESSAGE: "More errors?!",
        DATA_TIME: "24.5.7.12.2.50"
    }, {
        DATA_MESSAGE: "Updated code for easier and future updates.",
        DATA_TIME: "24.5.7.12.1.40"
    }, {
        DATA_MESSAGE: "Fixed some errors.",
        DATA_TIME: "24.5.7.12.0.50"
    }, {
        DATA_MESSAGE: "Removed error handling as it is already handled and doesn't do anything.",
        DATA_TIME: "24.5.7.12.0.50"
    }, {
        DATA_MESSAGE: "Fixed the 'strict' error.",
        DATA_TIME: "24.5.7.11.0.40"
    }, {
        DATA_MESSAGE: "Attempted to fix the 'strict' error.",
        DATA_TIME: "24.5.7.11.0.5"
    }, {
        DATA_MESSAGE: "Added even more functions.",
        DATA_TIME: "24.5.7.11.0.5"
    }, {
        DATA_MESSAGE: "Added more functions.",
        DATA_TIME: "24.5.3.9.0.25"
    }, ];
    let SAVED_VALUES_DATA = {
        SAVED_LEADERBOARD_DEBOUNCE: false,
        SAVED_UPDATE_DEBOUNCE: false,
        SAVED_UPDATE_RECALL: false,
        SAVED_LAST_THEME_VALUE: CONFIG_DATA.USER_LIGHT_THEME,
        SAVED_LAST_STATUS_VALUE: "",
        SAVED_UPDATE_STATUS: "",
        SAVED_APP_VERSION: `${VERSION_DATA.VERSION_LABEL} ${VERSION_DATA.VERSION_ALPHA_MONTH}${VERSION_DATA.VERSION_ALPHA_DAY}${VERSION_DATA.VERSION_ALPHA_YEAR}${VERSION_DATA.VERSION_ALPHA_MINUTES}${VERSION_DATA.VERSION_ALPHA_HOUR}`,
        SAVED_TIMEOUT_ID: null,
        SAVED_WATERMARK: null,
    };
    let DATA_API_URLS = {
        DISCORD_STATUS_API_URL: "https://discord.com/api/v9/users/@me/settings-proto/1",
        DISCORD_USER_API_URL: "https://discord.com/api/v9/users/@me",
    }
    let DATA_LIST_NOTIFICATIONS = ["Test01", "Test02"];

    ShadeWeb(false, false, CONFIG_DATA.USER_USE_BLUR ? (CONFIG_DATA.USER_BLUR_AMOUNT / (1 - SETTINGS.APP_CONFIG.INITIAL_OPACITY)) : (SETTINGS.APP_CONFIG.INITIAL_OPACITY), false);
    const DELAY = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    await DELAY((SETTINGS.APP_CONFIG.STARTUP_TIME * (3 / 5)) * 1000);
    const USER_AVATAR_URL = await fetchUserAvatarURL(CONFIG_DATA.USER_TOKEN, "1132521952238637117");
    const invisibleChar = await unicodeToString('U+200B');
    document.addEventListener("keydown", (updateEventAvatar));
    document.addEventListener("click", (updateEventAvatar));
    if (!(SETTINGS.THEME_CONFIG ? (SETTINGS.THEME_CONFIG.RADIAL_STATUS_CSS === true ? (true) : (false)) : (true))) {
        CONFIG_DATA.USER_AVATAR_SHAPE = '50%';
    }

    // ZYCORD FUNCTIONS //
    function zycordCreateFetchOptions(zycordBodyData, zycordFetchMethod) {
        let zycordConfigDataToken = CONFIG_DATA.USER_TOKEN;
        let zycordConfigAcceptType = "*/*";
        let zycordConfigAcceptLanguage = "en-US,en;q=0.9";
        let zycordConfigContentType = "application/json";
        console.log(zycordConfigDataToken);
        return {
            headers: {
                "accept": zycordConfigAcceptType,
                "accept-language": zycordConfigAcceptLanguage,
                "authorization": zycordConfigDataToken,
                "content-type": zycordConfigContentType
            },
            body: zycordBodyData ? JSON.stringify({
                settings: zycordBodyData
            }) : null,
            method: zycordFetchMethod
        }
    }
    async function zycordFetchUserProfile(zycordSelectedUserIdentification) {
        let zycordApiVersion = "v9";
        let zycordApiUrl = `https://discord.com/api/${zycordApiVersion}`;
        let zycordUsersUrl = `${zycordApiUrl}/users/`;
        let zycordUserDataToFetch = zycordSelectedUserIdentification;
        let zycordConfigDataToken = CONFIG_DATA.USER_TOKEN;
        let zycordUserFetchOptions = zycordCreateFetchOptions(null, "GET");
        try {
            let zycordUserFetchData = await fetch(zycordUsersUrl + zycordUserDataToFetch, zycordUserFetchOptions);
            let zycordFetchDataJson = await zycordUserFetchData.json();
            return "You are being rate limited." === zycordFetchDataJson.message ? new Promise(zycordRetryFunction => {
                setTimeout(async () => {
                    zycordRetryFunction(await zycordFetchUserProfile(userToFetch))
                }, 1e3 * zycordFetchDataJson.retry_after)
            }) : zycordFetchDataJson
        } catch (zycordErrorMessage) {
            console.error(zycordErrorMessage)
        }
    }
    function zycordGenerateRandomIdentifier(identifierLength) {
        const zycordIdentifierPossibleCharacters = 'AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz1234567890';
        let zycordCustomIdentifierCode = '';
        for (let i = 0; i < identifierLength; i++) {
            const zycordRandomCodeIndex = Math.floor(Math.random() * zycordIdentifierPossibleCharacters.length);
            zycordCustomIdentifierCode += zycordIdentifierPossibleCharacters[zycordRandomCodeIndex];
        }
        return zycordCustomIdentifierCode;
    }
    async function zycordGetUserThemeColor() {
        let zycordCustomUserThemeColorCheck = (CONFIG_DATA.USER_THEME_COLOR == null);
        let zycordFetchUserSelfProfile = await clientGetSelfUserZycord();
        if (zycordCustomUserThemeColorCheck) {
            let zycordUserBannerColor = zycordFetchUserSelfProfile.banner_color;
            let zycordUserBannerExists = zycordUserBannerColor ? (true) : (false);
            if (zycordUserBannerExists) {
                CONFIG_DATA.USER_THEME_COLOR = zycordUserBannerColor;
                changeElementColor(CONFIG_DATA.USER_THEME_COLOR);
            }
        } else {
            changeElementColor(CONFIG_DATA.USER_THEME_COLOR);
        }
    }
    function zycordGetUserToken() {
        let moduleList;
        return (window.webpackChunkdiscord_app.push([
            [''], {},
            (module) => {
                moduleList = [];
                for (let moduleName in module.c) moduleList.push(module.c[moduleName])
            }
        ]), moduleList).find(module => module?.exports?.default?.getToken !== void 0).exports.default.getToken();
    }
    // END OF ZYCORD FUNCTIONS //

    // CLIENT FUNCTIONS //
    async function clientDeleteMessageZycord(zycordChannelId, zycordMessageId) {
        let zycordApiVersion = "v9";
        let zycordApiUrl = `https://discord.com/api/${zycordApiVersion}`;
        let zycordChannelsUrl = `${zycordApiUrl}/channels`;
        let zycordChannelAction = `${zycordChannelsUrl}/${zycordChannelId}/messages/${zycordMessageId}`;
        let zycordMessageOptions = zycordCreateFetchOptions(null, "DELETE");
        fetch(zycordChannelAction, zycordMessageOptions);
    }
    async function clientChannelTypingZycord(zycordSelectedChannel) {
        let zycordApiVersion = "v9";
        let zycordApiUrl = `https://discord.com/api/${zycordApiVersion}`;
        let zycordChannelsUrl = `${zycordApiUrl}/channels`;
        let zycordChannelsAction = "typing";
        let zycordActionApiUrl = `${zycordChannelsUrl}/${zycordSelectedChannel}/${zycordChannelsAction}`;
        let actionFetchOptions = zycordCreateFetchOptions(null, "POST");
        fetch(zycordActionApiUrl, actionFetchOptions);
    }
    async function clientChannelSendZycord(zycordSelectedChannel, zycordMessageContent) {
        let zycordApiVersion = "v9";
        let zycordApiUrl = `https://discord.com/api/${zycordApiVersion}`;
        let zycordChannelsUrl = `${zycordApiUrl}/channels`;
        let zycordChannelsAction = "messages";
        let zycordMessageApiUrl = `${zycordChannelsUrl}/${zycordSelectedChannel}/${zycordChannelsAction}`;
        let zycordMessageActions = {"content": zycordMessageContent};
        let zycordMessageBody = JSON.stringify(zycordMessageActions);
        let zycordMessageFetchOptions = zycordCreateFetchOptions(zycordMessageBody, "POST");
        fetch(zycordMessageApiUrl, zycordMessageFetchOptions);
    }
    async function clientGetUserProfileZycord(zycordSelectedUserIdentification) {
        let zycordUserToFetchData = zycordSelectedUserIdentification;
        let zycordDataToReturn = await zycordFetchUserProfile(zycordUserToFetchData);
        return zycordDataToReturn;
    }
    async function clientGetSelfUserZycord() {
        let zycordUserToFetchData = "@me";
        let zycordDataToReturn = await zycordFetchUserProfile(zycordUserToFetchData);
        return zycordDataToReturn;
    }
    async function clientGetUserAvatarZycord(zycordSelectedUser, zycordFileType, zycordImageSize) {
        let zycordUserAvatar = zycordSelectedUser.avatar;
        let zycordUserIdentification = zycordSelectedUser.id;
        let zycordAvatarUrl = "https://cdn.discordapp.com/avatars";
        let zycordAvatarSize = (zycordImageSize) ? (`?size=${zycordImageSize}`) : ("");
        let zycordUserAvatarUrl = `${zycordAvatarUrl}/${zycordUserIdentification}/${zycordUserAvatar}.${zycordFileType}${zycordAvatarSize}`;
        return zycordUserAvatarUrl;
    }
    function clientUpdateStatusZycord(zycordNewStatus) {
        let zycordApiVersion = "v9";
        let zycordApiUrl = `https://discord.com/api/${zycordApiVersion}`;
        let zycordStatusFetchOptions = zycordCreateFetchOptions(zycordNewStatus, "PATCH");
        let zycordStatusFetchUrl = `${zycordApiUrl}/users/@me/settings-proto/1`;
        fetch(zycordStatusFetchUrl, zycordStatusFetchOptions);
    }
    // END OF CLIENT FUNCTIONS //

    function formatChangelogTimeData(V_timeValue) {
        let V_splitStr = V_timeValue.split(".");
        let V_UPDATED_DATA = {
            V_YEAR: parseInt(V_splitStr[0]),
            V_MONTH: parseInt(V_splitStr[1]),
            V_DAY: parseInt(V_splitStr[2]),
            V_HOUR: parseInt(V_splitStr[3]),
            V_AFTERNOON: parseInt(V_splitStr[4]),
            V_MINUTES: parseInt(V_splitStr[5]),
        };
        let V_VERSION_DATA = {
            V_ALPHA_YEAR: V_UPDATED_DATA.V_YEAR.toString(36),
            V_ALPHA_MONTH: String.fromCharCode(V_UPDATED_DATA.V_MONTH + 64),
            V_ALPHA_DAY: V_UPDATED_DATA.V_DAY.toString(36),
            V_ALPHA_HOUR: (V_UPDATED_DATA.V_HOUR + V_UPDATED_DATA.V_AFTERNOON).toString(36),
            V_ALPHA_MINUTES: V_UPDATED_DATA.V_MINUTES.toString(36),
        };
        let V_newString = `${V_VERSION_DATA.V_ALPHA_MONTH}${V_VERSION_DATA.V_ALPHA_DAY}${V_VERSION_DATA.V_ALPHA_YEAR}${V_VERSION_DATA.V_ALPHA_MINUTES}${V_VERSION_DATA.V_ALPHA_HOUR}`;
        return V_newString;
    }

    function createNotification(notificationMessage, notificationType) {
        let isClickDebounced = false;
        let notificationTypeColors = {
            "Error": "var(--red-400)",
            "Warning": "var(--yellow-360)",
            "Neutral": "var(--brand-experiment)",
        };
        let notificationCode = zycordGenerateRandomIdentifier(5);
        let notificationMainId = `zycord-MainNotification-${notificationCode}`;
        let notificationCloseId = `zycord-NotificationClose-${notificationCode}`;
        let notificationDismissId = `zycord-NotificationDismiss-${notificationCode}`;
        let notificationColor = notificationTypeColors[notificationType] ? (notificationTypeColors[notificationType]) : (notificationTypeColors["Neutral"]);
        let closeIconSvgPath = `M18.4 4L12 10.4L5.6 4L4 5.6L10.4 12L4 18.4L5.6 20L12 13.6L18.4 20L20 18.4L13.6 12L20 5.6L18.4 4Z`;
        let notificationContainer = document.querySelector('div.base_c0676e');
        let newNotification = document.createElement('div');
        let notificationHTML = `<div class="notice__5fd4c" style="background-color: ${notificationColor}; color: var(--white-500);"> <div id="${notificationCloseId}" class="closeButton__90904" aria-label="Dismiss" role="button" tabindex="0"><svg aria-hidden="true" role="img" class="closeIcon__967e7" width="18" height="18" viewBox="0 0 24 24"> <path fill="currentColor" d="${closeIconSvgPath}"> </path> </svg> </div>${notificationMessage}<button id="${notificationDismissId}" class="button__33db6">Dismiss</button> </div>`
        notificationContainer.prepend(newNotification);
        newNotification.id = notificationMainId;
        newNotification.innerHTML = notificationHTML;
        const notificationElements = {
            notificationCode: notificationCode,
            notificationMain: document.getElementById(notificationMainId),
            notificationClose: document.getElementById(notificationCloseId),
            notificationDismiss: document.getElementById(notificationDismissId),
        }
        const handleNotificationClick = async function() {
            if (!isClickDebounced) {
                isClickDebounced = true
                notificationElements.notificationMain.innerHTML = "";
                await DELAY(1 * 1000);
            }
        };
        notificationElements.notificationClose.addEventListener('click', handleNotificationClick);
        notificationElements.notificationDismiss.addEventListener('click', handleNotificationClick);
        return notificationElements;
    }

    function createModal(Title, Body) {
        let clickDebounce = false;
        let elementCode = zycordGenerateRandomIdentifier(5);
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
        const cssModal = `.layerContainer_a2fcaa{background:none !important;position:absolute;top:0;left:0;right:0;right:var(--devtools-sidebar-width,0);bottom:0;pointer-events:none;z-index:1002}.backdrop__1a911.withLayer__29ace{pointer-events:all}.backdrop__1a911{position:fixed;top:0;right:0;right:var(--devtools-sidebar-width,0);bottom:0;left:0;transform:translatez(0)}.layer_c14d31{position:absolute;top:0;bottom:0;left:0;right:0;align-items:center;display:flex;justify-content:center;flex-direction:column;min-height:0;padding-top:40px;padding-bottom:40px}.zycord-text-strong{font-weight:600}.zycord-text-20{font-size:20px;line-height:24px}.zycord-header-primary{color:var(--header-primary)}.zycord-button-filled.zycord-button-color-brand{color:var(--white-500);background-color:var(--brand-experiment)}.zycord-button-filled{-webkit-transition:background-color .17s ease,color .17s ease;transition:background-color .17s ease,color .17s ease}.zycord-button-grow,.zycord-button-icon{width:auto}.zycord-button-medium{width:96px;height:38px;min-width:96px;min-height:38px}.zycord-button{position:relative;display:flex;justify-content:center;align-items:center;box-sizing:border-box;background:0;border:0;border-radius:3px;font-size:14px;font-weight:500;line-height:16px;padding:2px 16px;user-select:none}a,div,span,strong,button,input,textarea,select,label{outline:0}body,textarea,input,button,select,::placeholder{font-family:var(--font-primary);text-rendering:optimizeLegibility}button{font-family:var(--font-primary);font-weight:500;border:0;cursor:pointer}user agent stylesheet button{appearance:auto;font-style:;font-variant-ligatures:;font-variant-caps:;font-variant-numeric:;font-variant-east-asian:;font-variant-alternates:;font-variant-position:;font-weight:;font-stretch:;font-size:;font-family:;font-optical-sizing:;font-kerning:;font-feature-settings:;font-variation-settings:;text-rendering:auto;color:buttontext;letter-spacing:normal;word-spacing:normal;line-height:normal;text-transform:none;text-indent:0;text-shadow:none;display:inline-block;text-align:center;align-items:flex-start;cursor:default;box-sizing:border-box;background-color:buttonface;margin:0;padding-block:1px;padding-inline:6px;border-width:2px;border-style:outset;border-color:buttonborder;border-image:initial}html,body,div,span,applet,object,iframe,h1,h2,h3,h4,h5,h6,p,blockquote,pre,a,abbr,acronym,address,big,cite,code,del,dfn,em,img,ins,kzycord,q,s,samp,small,strike,strong,tt,var,dl,dt,dd,ol,ul,li,fieldset,form,label,legend,table,caption,tbody,tfoot,thead,tr,th,td{margin:0;padding:0;border:0;font-weight:inherit;font-style:inherit;font-family:inherit;font-size:100%;vertical-align:baseline}user agent stylesheet h1{display:block;font-size:2em;margin-block-start:.67em;margin-block-end:.67em;margin-inline-start:0;margin-inline-end:0;font-weight:bold}.zycord-addon-modal{min-height:unset}.zycord-modal-medium{width:600px;max-height:800px;min-height:400px}.zycord-modal-root{display:flex;flex-direction:column;background-color:var(--modal-background);border-radius:4px;margin:0 auto;pointer-events:all;position:relative;max-height:100%}.zycord-addon-modal{min-height:0}.zycord-modal-header{border-radius:4px 4px 0 0;transition:box-shadow .1s ease-out;word-wrap:break-word}.zycord-modal-header,.zycord-modal-footer{position:relative;flex:0 0 auto;padding:16px;z-index:1;overflow-x:hidden}.zycord-flex-horizontal{flex-direction:row}.zycord-flex-no-wrap{flex-wrap:nowrap}.zycord-flex-justify-start{justify-content:flex-start}.zycord-flex-align-center{align-items:center}.zycord-flex{display:flex}.zycord-scroller-thin{scrollbar-width:thin;scrollbar-color:var(--scrollbar-thin-thumb) var(--scrollbar-thin-track)}.zycord-scroller-base{position:relative;box-sizing:border-box;min-height:0;flex:1 1 auto}.zycord-modal-content{position:relative;z-index:0;border-radius:5px 5px 0 0;padding-left:16px;overflow-x:hidden;font-size:16px;line-height:20px;padding-bottom:20px;overflow:hidden scroll;padding-right:8px}.zycord-modal-footer{border-radius:0 0 5px 5px;background-color:var(--modal-footer-background);overflow:hidden;box-shadow:inset 0 1px 0 hsl(var(--primary-630-hsl)/.6)}.zycord-modal-header,.zycord-modal-footer{position:relative;flex:0 0 auto;padding:16px;z-index:1;overflow-x:hidden}.zycord-flex-reverse{flex-direction:row-reverse}.zycord-flex-no-wrap{flex-wrap:nowrap}.zycord-flex-justify-start{justify-content:flex-start}.zycord-flex-align-stretch{align-items:stretch}.zycord-flex{display:flex}`;
        const htmlModal = `<style> ${cssModal} </style> <div class="layerContainer_a2fcaa" id="${layerContainerID}"> <div class="backdrop__1a911 withLayer__29ace" id="${backdropID}" style="background: rgba(0, 0, 0, 0.7); backdrop-filter: blur(0px);"></div> <div class="layer_c14d31"> <div role="dialog" tabindex="-1" aria-modal="true" id="${dialogID}"> <div class="zycord-modal-root zycord-modal-medium zycord-addon-modal" style="opacity: 1; transform: scale(1);" id="${modalRootID}"> <div class="zycord-flex zycord-flex-horizontal zycord-flex-justify-start zycord-flex-align-center zycord-flex-no-wrap zycord-modal-header" style="flex: 0 0 auto;" id="${modalHeaderID}"> <h1 class="zycord-header-primary zycord-text-20 zycord-text-strong">${Title}</h1> </div> <div class="zycord-modal-content zycord-scroller-base zycord-scroller-thin" id="${modalContentID}" style="max-height: 400px;"> <div class="zycord-addon-settings-wrap"> <div id="${modalBodyID}"> ${Body} </div> </div> </div> <div class="zycord-flex zycord-flex-reverse zycord-flex-justify-start zycord-flex-align-stretch zycord-flex-no-wrap zycord-modal-footer" style="flex: 0 0 auto;" id="${modalFooterID}"> <button id="${modalButtonID}" class="zycord-button zycord-button-filled zycord-button-color-brand zycord-button-medium zycord-button-grow" type="submit"> <div class="zycord-button-content">Done</div> </button> </div> </div> </div> </div> </div>`;
        var modal = document.createElement('div');
        modal.id = mainContainerID;
        modal.innerHTML = htmlModal;
        let tweenValues001 = {
            timeValue: 250,
            valueStart: 0.75,
            endValue: 1,
        };
        let tweenValues002 = {
            timeValue: 125,
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
                    timeValue: 250,
                    valueStart: 1,
                    endValue: 0.75,
                };
                let tweenValues02 = {
                    timeValue: 125,
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

    function fetchJsonAndProcess(url, interval) {
        function activateProcess() {
            fetch(url).then(response => response.json()).then(data => {
                if (Array.isArray(data) && data.length > 0) {
                    data.forEach(item => {
                        if (item.hasOwnProperty('message') && item.hasOwnProperty('type') && item.hasOwnProperty('code')) {
                            if (!DATA_LIST_NOTIFICATIONS.includes(item.code)) {
                                DATA_LIST_NOTIFICATIONS.push(item.code);
                                createNotification(item.message, item.type);
                            }
                        }
                    });
                }
            }).catch(error => console.error('Error:', error));
        }
        activateProcess();
        setInterval(() => {
            activateProcess();
        }, interval);
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

    function webpageWatermark(watermarkText) {
        let watermarkCss = `
        .zycord_textStyle_9f02k {
            position: fixed;
            bottom: 5px;
            right: 5px;
            font-size: 25px;
            font-weight: 900;
            opacity: 1;
            z-index: 999999;
            color: var(--header-primary);
        }
        .zycord_textStyle_9f02k:hover {
            opacity: 0.5;
        }
        `;
        let elementCode = SAVED_VALUES_DATA.SAVED_WATERMARK ? (SAVED_VALUES_DATA.SAVED_WATERMARK) : (zycordGenerateRandomIdentifier(20));
        let watermarkHtml = `<style>${watermarkCss}</style><span class="zycord_textStyle_9f02k">${watermarkText}</span>`;
        let currentElement = document.getElementById(elementCode);
        let watermarkElement = currentElement ? (currentElement) : (document.createElement('div'));
        watermarkElement.id = elementCode;
        SAVED_VALUES_DATA.SAVED_WATERMARK = elementCode;
        watermarkElement.innerHTML = watermarkHtml;
        let watermarkContainer = document.querySelector('body');
        watermarkContainer.appendChild(watermarkElement);
    }

    function ShadeWeb(tweenType, originalValue, goalValue, timeValue) {
        if (tweenType) {
            const valueGoalMultiplied = goalValue * 100
            const valueOriginalMultiplied = originalValue * 100
            const valueOriginalShade = CONFIG_DATA.USER_USE_BLUR ? (CONFIG_DATA.USER_BLUR_AMOUNT * valueOriginalMultiplied) : valueOriginalMultiplied;
            const valueGoalShade = CONFIG_DATA.USER_USE_BLUR ? (CONFIG_DATA.USER_BLUR_AMOUNT * valueGoalMultiplied) : valueGoalMultiplied;
            tween(valueOriginalShade, valueGoalShade, timeValue, T => ShadeWeb(false, false, (T/100), false));
        } else {
            webpageWatermark(`ZYCORD ${SAVED_VALUES_DATA.SAVED_APP_VERSION}`);
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
                    ${CONFIG_DATA.USER_USE_BLUR ? `backdrop-filter: blur(${goalValue}px);` : `background-color: rgba(0,0,0,${goalValue});`}
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
            let s = await fetch(t, zycordCreateFetchOptions(null, "GET")),
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
        let t = zycordCreateFetchOptions(null, "GET");
        return (await fetch("https://discord.com/api/v9/users/@me/channels", t)).json()
    }
    async function fetchLeaderboard(button, today) {
        if (!SAVED_VALUES_DATA.SAVED_LEADERBOARD_DEBOUNCE) {
            SAVED_VALUES_DATA.SAVED_LEADERBOARD_DEBOUNCE = true;
            const loadingHtml = `<div style="display: grid;"> <img src="https://github.com/LolZyfurr/Zycord/blob/main/Images/9237-loading.gif?raw=true" style="height: 25%; max-height: 250px; justify-self: center; align-self: center;"></div>`;
            const channels = await fetchUserDMs(CONFIG_DATA.USER_TOKEN);
            const fetchedSelfUser = await clientGetSelfUserZycord();
            const selfUser = fetchedSelfUser.id;
            let modalLeaderboard = createModal(`${today ? (today === true ? ("Todays") : ("")) : ("")} Leaderboard`, loadingHtml);
            let interactionCounts = [];
            for (const channel of channels.reverse().values()) {
                if (!modalLeaderboard.modalBody || modalLeaderboard.mainContainer.innerHTML === "") {
                    SAVED_VALUES_DATA.SAVED_LEADERBOARD_DEBOUNCE = false;
                    leaderboardButtonPress(button, true);
                    return
                }
                let lastCheckedAuthor = 0;
                let interactions = 0;
                let dmChannelName = channel.id;
                let messageAuthor = null;
                let messages = await fetchMessages(CONFIG_DATA.USER_TOKEN, channel.id, today ? (today === true ? (500) : (50000)) : (50000));
                for (const message of messages.reverse().values()) {
                    if (!modalLeaderboard.modalBody || modalLeaderboard.mainContainer.innerHTML === "") {
                        SAVED_VALUES_DATA.SAVED_LEADERBOARD_DEBOUNCE = false;
                        leaderboardButtonPress(button, true);
                        return
                    }
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
                    const dmChannelAuthor = await clientGetUserProfileZycord(dmChannelName);
                    dmChannelName = dmChannelAuthor.global_name;
                    const dmChannelUserID = dmChannelAuthor.id;
                    const profilePicUrl = await clientGetUserAvatarZycord(messageAuthor, "png", "4096");
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
            SAVED_VALUES_DATA.SAVED_LEADERBOARD_DEBOUNCE = false;
            leaderboardButtonPress(button, true);
        }
    }

    function ApplyTheme() {
        webpageWatermark(`ZYCORD ${SAVED_VALUES_DATA.SAVED_APP_VERSION}`);
        if (SETTINGS.THEME_CONFIG ? (SETTINGS.THEME_CONFIG.DISCORD_RECOLOR_CSS === true ? (true) : (false)) : (true)) {
            loadCSS("https://mwittrien.github.io/BetterDiscordAddons/Themes/DiscordRecolor/DiscordRecolor.css");
        }
        if (SETTINGS.THEME_CONFIG ? (SETTINGS.THEME_CONFIG.RADIAL_STATUS_CSS === true ? (true) : (false)) : (true)) {
            loadCSS("https://discordstyles.github.io/RadialStatus/dist/RadialStatus.css");
        }
    }
    async function fetchUserAvatarURL(t, a) {
        let s = null;
        return await fetch("https://discord.com/api/v9/users/" + a, zycordCreateFetchOptions(null, "GET")).then(t => t.json()).then(t => {
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
            e = CONFIG_DATA.USER_LIGHT_THEME ? 155 : 0,
            o = (CONFIG_DATA.USER_LIGHT_THEME, SETTINGS.THEME_COLORS.PRIMARY),
            s = CONFIG_DATA.USER_LIGHT_THEME ? SETTINGS.THEME_COLORS.SENARY : SETTINGS.THEME_COLORS.SECONDARY,
            l = CONFIG_DATA.USER_LIGHT_THEME ? SETTINGS.THEME_COLORS.QUINARY : SETTINGS.THEME_COLORS.TERTIARY,
            p = (CONFIG_DATA.USER_LIGHT_THEME, SETTINGS.THEME_COLORS.QUATERNARY),
            a = CONFIG_DATA.USER_LIGHT_THEME ? SETTINGS.THEME_COLORS.TERTIARY : SETTINGS.THEME_COLORS.QUINARY,
            i = CONFIG_DATA.USER_LIGHT_THEME ? SETTINGS.THEME_COLORS.SECONDARY : SETTINGS.THEME_COLORS.SENARY,
            n = CONFIG_DATA.USER_LIGHT_THEME ? SETTINGS.THEME_COLORS.PRIMARY : SETTINGS.THEME_COLORS.SEPTENARY,
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
            if (CONFIG_DATA.USER_LIGHT_THEME !== SAVED_VALUES_DATA.SAVED_LAST_THEME_VALUE) {
                r = hexToRgb(t);
                e = CONFIG_DATA.USER_LIGHT_THEME ? 155 : 0;
                o = (CONFIG_DATA.USER_LIGHT_THEME, SETTINGS.THEME_COLORS.PRIMARY);
                s = CONFIG_DATA.USER_LIGHT_THEME ? SETTINGS.THEME_COLORS.SENARY : SETTINGS.THEME_COLORS.SECONDARY;
                l = CONFIG_DATA.USER_LIGHT_THEME ? SETTINGS.THEME_COLORS.QUINARY : SETTINGS.THEME_COLORS.TERTIARY;
                p = (CONFIG_DATA.USER_LIGHT_THEME, SETTINGS.THEME_COLORS.QUATERNARY);
                a = CONFIG_DATA.USER_LIGHT_THEME ? SETTINGS.THEME_COLORS.TERTIARY : SETTINGS.THEME_COLORS.QUINARY;
                i = CONFIG_DATA.USER_LIGHT_THEME ? SETTINGS.THEME_COLORS.SECONDARY : SETTINGS.THEME_COLORS.SENARY;
                n = CONFIG_DATA.USER_LIGHT_THEME ? SETTINGS.THEME_COLORS.PRIMARY : SETTINGS.THEME_COLORS.SEPTENARY;
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
                SAVED_VALUES_DATA.SAVED_LAST_THEME_VALUE = CONFIG_DATA.USER_LIGHT_THEME;
            }
            $ ? u = !0 : ($ = !0, webpageWatermark(`ZYCORD ${SAVED_VALUES_DATA.SAVED_APP_VERSION}`), E.style.setProperty("--mainaccentcolor", y, "important"), E.style.setProperty("--accentcolor", m, "important"), E.style.setProperty("--accentcolor2", m, "important"), E.style.setProperty("--linkcolor", m, "important"), E.style.setProperty("--mentioncolor", m, "important"), E.style.setProperty("--backgroundaccent", c, "important"), E.style.setProperty("--backgroundprimary", P, "important"), E.style.setProperty("--backgroundsecondary", g, "important"), E.style.setProperty("--backgroundsecondaryalt", b, "important"), E.style.setProperty("--backgroundtertiary", h, "important"), E.style.setProperty("--backgroundfloating", d, "important"), E.style.setProperty("--rs-small-spacing", "2px", "important"), E.style.setProperty("--rs-small-spacing", "2px", "important"), E.style.setProperty("--rs-medium-spacing", "3px", "important"), E.style.setProperty("--rs-large-spacing", "4px", "important"), E.style.setProperty("--rs-small-width", "2px", "important"), E.style.setProperty("--rs-medium-width", "3px", "important"), E.style.setProperty("--rs-large-width", "4px", "important"), E.style.setProperty("--rs-avatar-shape", CONFIG_DATA.USER_AVATAR_SHAPE, "important"), E.style.setProperty("--rs-online-color", "#43b581", "important"), E.style.setProperty("--rs-idle-color", "#faa61a", "important"), E.style.setProperty("--rs-dnd-color", "#f04747", "important"), E.style.setProperty("--rs-offline-color", "#636b75", "important"), E.style.setProperty("--rs-streaming-color", "#643da7", "important"), E.style.setProperty("--rs-invisible-color", "#747f8d", "important"), E.style.setProperty("--rs-phone-color", "var(--rs-online-color)", "important"), E.style.setProperty("--rs-phone-visible", "none", "important"), _ ? (E.style.setProperty("--textbrightest", "100,100,100", "important"), E.style.setProperty("--embed-title", "100,100,100", "important"), E.style.setProperty("--textbrighter", "90,90,90", "important"), E.style.setProperty("--textbright", "80,80,80", "important"), E.style.setProperty("--textdark", "70,70,70", "important"), E.style.setProperty("--textdarker", "60,60,60", "important"), E.style.setProperty("--textdarkest", "50,50,50", "important")) : (E.style.setProperty("--textbrightest", "250,250,250", "important"), E.style.setProperty("--textbrighter", "240,240,240", "important"), E.style.setProperty("--textbright", "230,230,230", "important"), E.style.setProperty("--textdark", "220,220,220", "important"), E.style.setProperty("--textdarker", "210,210,210", "important"), E.style.setProperty("--textdarkest", "200,200,200", "important")), ApplyTheme(), await DELAY(500), $ = !1, u && (u = !1, k()))
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
        if (SAVED_VALUES_DATA.SAVED_UPDATE_DEBOUNCE) SAVED_VALUES_DATA.SAVED_UPDATE_RECALL || (SAVED_VALUES_DATA.SAVED_UPDATE_RECALL = !0), SAVED_VALUES_DATA.SAVED_UPDATE_STATUS = t;
        else {
            if (SAVED_VALUES_DATA.SAVED_UPDATE_DEBOUNCE = !0, CONFIG_DATA.USER_AUTO_STATUS) {
                if (SAVED_VALUES_DATA.SAVED_LAST_STATUS_VALUE === t) return void(SAVED_VALUES_DATA.SAVED_UPDATE_DEBOUNCE = !1);
                clientUpdateStatusZycord(t), SAVED_VALUES_DATA.SAVED_LAST_STATUS_VALUE = t
            }
            await DELAY(SETTINGS.APP_CONFIG.STATUS_UPDATE_COOLDOWN), SAVED_VALUES_DATA.SAVED_UPDATE_DEBOUNCE = !1, SAVED_VALUES_DATA.SAVED_UPDATE_RECALL && (SAVED_VALUES_DATA.SAVED_UPDATE_RECALL = !1, updateUserStatus(SAVED_VALUES_DATA.SAVED_UPDATE_STATUS))
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
            let settingsModalBody = `<div style="display: grid;"> <img src="https://github.com/LolZyfurr/Zycord/blob/main/Images/9237-loading.gif?raw=true" style="height: 25%; max-height: 250px; justify-self: center; align-self: center;"></div>`;
            createModal(settingsModalTitle, settingsModalBody)
        }
        const buttonSettings = '0,0,0,0';
        button.style.backgroundColor = `rgba(${buttonSettings})`;
    }

    function toggleAutoStatus(button, startup) {
        if (!startup) {
            CONFIG_DATA.USER_AUTO_STATUS = !CONFIG_DATA.USER_AUTO_STATUS;
        }
        const buttonSettings = CONFIG_DATA.USER_AUTO_STATUS ? '128,128,128,1' : '0,0,0,0';
        button.style.backgroundColor = `rgba(${buttonSettings})`;
    }

    function toggleLightTheme(button, startup) {
        if (!startup) {
            CONFIG_DATA.USER_LIGHT_THEME = !CONFIG_DATA.USER_LIGHT_THEME;
        }
        const buttonSettings = CONFIG_DATA.USER_LIGHT_THEME ? '128,128,128,1' : '0,0,0,0';
        button.style.backgroundColor = `rgba(${buttonSettings})`;
    }

    function leaderboardButtonPress(button, startup) {
        if (!startup) {
            fetchLeaderboard(button, false);
        }
        const buttonSettings = SAVED_VALUES_DATA.SAVED_LEADERBOARD_DEBOUNCE ? '128,128,128,1' : '0,0,0,0';
        button.style.backgroundColor = `rgba(${buttonSettings})`;
    }

    function leaderboardTodayButtonPress(button, startup) {
        if (!startup) {
            fetchLeaderboard(button, true);
        }
        const buttonSettings = SAVED_VALUES_DATA.SAVED_LEADERBOARD_DEBOUNCE ? '128,128,128,1' : '0,0,0,0';
        button.style.backgroundColor = `rgba(${buttonSettings})`;
    }

    function changelogButtonPress(button, startup) {
        if (!startup) {
            let changelogModalTitle = `Changelog`;
            let changelogModalBodyText = ``;
            CHANGELOG_DATA.forEach((changelogData, index) => {
                if (index <= 10) {
                    let changelogMessageData = changelogData.DATA_MESSAGE;
                    let changelogVersionData = formatChangelogTimeData(changelogData.DATA_TIME);
                    changelogModalBodyText += `<div><span style="color: var(--header-secondary);">${changelogVersionData} </span><span style="color: var(--header-primary); position: fixed; left: 75px;">- ${changelogMessageData}</span></div>`;
                }
            });
            let changelogModalBody = `<div style="display: grid;">${changelogModalBodyText}</div>`
            createModal(changelogModalTitle, changelogModalBody)
        }
        const buttonSettings = '0,0,0,0';
        button.style.backgroundColor = `rgba(${buttonSettings})`;
    }

    function createNewSidebarMenu(sidebarSize, buttonHtml, uniqueIdentifier, buttonIcon) {
        return `
<style>
    .sidebar-zycord-sidebar-div-holder {
        height: 100%;
        display: grid;
        right: 5px;
        justify-content: right;
        align-content: center;
        position: fixed;
        z-index: 1000;
    }

    .sidebar-zycord-button,
    .sidebar-zycord-main-button {
        background-color: var(--brand-experiment);
        width: ${sidebarSize}px;
        height: ${sidebarSize}px;
        content: "";
        border-radius: 9999px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .sidebar-zycord-buttons-holder {
        background-color: var(--brand-experiment);
        margin-top: 5px;
        width: ${sidebarSize}px;
        border-radius: 9999px;
        visibility: hidden;
    }

    .sidebar-zycord-button-icon {
        width: 95%;
        filter: brightness(1000);
    }
</style>
<div class="sidebar-zycord-sidebar-div-holder" id="zycord-sidebar-div-holder-${uniqueIdentifier}">
    <button class="sidebar-zycord-main-button" id="zycord-main-button-${uniqueIdentifier}">
        <img src="${buttonIcon}" class="sidebar-zycord-button-icon" id="zycord-button-icon-${uniqueIdentifier}">
    </button>
    <div class="sidebar-zycord-buttons-holder" id="zycord-button-holder-${uniqueIdentifier}"> ${buttonHtml} </div>
</div>
`;
    }

    function createNewSidebarButton(buttonImage, uniqueIdentifier, buttonName) {
        const buttonCustomIdentifier = `zycord-button-${buttonName}-${uniqueIdentifier}`;
        const buttonHtmlValue = `<button class="sidebar-zycord-button" id="${buttonCustomIdentifier}"> <img src="${buttonImage}" class="sidebar-zycord-button-icon" id="zycord-button-icon-${uniqueIdentifier}"> </button>`;
        const returnValue = {
            buttonHtmlValue: buttonHtmlValue,
            buttonCustomIdentifier: buttonCustomIdentifier,
        };
        return returnValue;
    }

    function setupSidebarMenu() {
        const elementCode = zycordGenerateRandomIdentifier(5);
        const TOPBAR_SIZE = SETTINGS.UI_CONFIG?.INTERACTIVE_MENU_SIZE || 35;
        const MAIN_ICON_URL = "https://github.com/LolZyfurr/Zycord/blob/main/Images/8895-more-options.png?raw=true";
        const ICONS = {
            "SETTINGS": 'https://github.com/LolZyfurr/Zycord/blob/main/Images/2888-settings.png?raw=true',
            "LIGHT-THEME": 'https://github.com/LolZyfurr/Zycord/blob/main/Images/8410-appearance-mobile-white.png?raw=true',
            "LEADERBOARD": 'https://github.com/LolZyfurr/Zycord/blob/main/Images/5971-forum.png?raw=true',
            "AUTO-STATUS": 'https://github.com/LolZyfurr/Zycord/blob/main/Images/1731-discord-profile-activity-white.png?raw=true',
            "LEADERBOARD-TODAY": 'https://github.com/LolZyfurr/Zycord/blob/main/Images/8312-active-threads.png?raw=true',
            "CHANGELOG": ''
        };
        const buttonNames = ["settings", "light-theme", "leaderboard", "auto-status", "leaderboard-today", "changelog"];
        const buttonActions = [toggleSettingsMenu, toggleLightTheme, leaderboardButtonPress, toggleAutoStatus, leaderboardTodayButtonPress, changelogButtonPress];
        let buttonsHtmlValue = "";
        buttonNames.forEach((name, index) => {
            const buttonSidebar = createNewSidebarButton(ICONS[name.toUpperCase()], elementCode, name);
            buttonsHtmlValue += buttonSidebar.buttonHtmlValue;
        });
        const sidebarMenu = createNewSidebarMenu(TOPBAR_SIZE, buttonsHtmlValue, elementCode, MAIN_ICON_URL);
        const sidebarMenuElement = document.createElement('div');
        sidebarMenuElement.style.zIndex = "1000";
        sidebarMenuElement.style.position = "fixed";
        sidebarMenuElement.style.display = "contents";
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
        var mainButton = document.getElementById(`zycord-main-button-${elementCode}`);
        var buttonsHolder = document.getElementById(`zycord-button-holder-${elementCode}`);
        mainButton.style.visibility = 'visible';
        mainButton.addEventListener('click', function() {
            if (buttonsHolder.style.visibility === 'visible') {
                buttonsHolder.style.visibility = 'hidden';
            } else {
                buttonsHolder.style.visibility = 'visible';
            }
        });
    }
    fetchJsonAndProcess('https://raw.githubusercontent.com/LolZyfurr/Zycord/main/Data/ZycordStatus.json', 5*60*1000);
    setupSidebarMenu()
    window.addEventListener("blur", (function() {
        ShadeWeb(true, SETTINGS.APP_CONFIG.FOCUSED_OPACITY, SETTINGS.APP_CONFIG.UNFOCUSED_OPACITY, SETTINGS.APP_CONFIG.WINDOW_OPACITY_TRANSITION_TIME);
        updateUserStatus(SETTINGS.APP_CONFIG.UNFOCUSED_STATUS), SAVED_VALUES_DATA.SAVED_TIMEOUT_ID = setTimeout((function() {
            updateUserStatus(SETTINGS.APP_CONFIG.AWAY_STATUS);
        }), 1e3 * SETTINGS.APP_CONFIG.AWAY_TRIGGER_TIME);
    }));
    window.addEventListener("focus", (function() {
        null !== SAVED_VALUES_DATA.SAVED_TIMEOUT_ID && (clearTimeout(SAVED_VALUES_DATA.SAVED_TIMEOUT_ID), SAVED_VALUES_DATA.SAVED_TIMEOUT_ID = null);
        ShadeWeb(true, SETTINGS.APP_CONFIG.UNFOCUSED_OPACITY, SETTINGS.APP_CONFIG.FOCUSED_OPACITY, SETTINGS.APP_CONFIG.WINDOW_OPACITY_TRANSITION_TIME);
        updateUserStatus(SETTINGS.APP_CONFIG.FOCUSED_STATUS);
    }));
    SETTINGS.APP_CONFIG.AUTO_UPDATE_THEME && zycordGetUserThemeColor();
    autoUpdateAvatar();
    await DELAY((SETTINGS.APP_CONFIG.STARTUP_TIME * (2 / 5)) * 1000);
    ShadeWeb(true, SETTINGS.APP_CONFIG.INITIAL_OPACITY, SETTINGS.APP_CONFIG.FOCUSED_OPACITY, SETTINGS.APP_CONFIG.WINDOW_OPACITY_TRANSITION_TIME * SETTINGS.APP_CONFIG.WINDOW_OPACITY_MULTIPLIER);
})();
