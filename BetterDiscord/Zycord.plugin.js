/**
 * @name Zycord
 * @author Zy1ux
 * @description An experimental discord client modification.
 * @version 0.0.7
 * @authorId 723659289377636423
 * @authorLink https://github.com/Zy1ux
 * @source https://github.com/LolZyfurr/Zycord/blob/main/BetterDiscord/Zycord.plugin.js
 * @updateUrl https://raw.githubusercontent.com/LolZyfurr/Zycord/main/BetterDiscord/Zycord.plugin.js
 */
module.exports = meta => {
    let USER_ACTIVITY_STATUS = {
        ONLINE: "Wg4KCAoGb25saW5lGgIIAQ==",
        IDLE: "WgwKBgoEaWRsZRoCCAE=",
        DO_NOT_DISTURB: "WgsKBQoDZG5kGgIIAQ==",
        INVISIBLE: "WhEKCwoJaW52aXNpYmxlGgIIAQ==",
    }
    const USER_STATUS = {
        ONLINE: "WgwKCAoGb25saW5lGgA=",
        IDLE: "WgoKBgoEaWRsZRoA",
        DO_NOT_DISTURB: "WgkKBQoDZG5kGgA=",
        INVISIBLE: "Wg8KCwoJaW52aXNpYmxlGgA=",
    }
    let SETTINGS = {
        APP_CONFIG: {
            AUTO_UPDATE_STATUS: true,
            AUTO_UPDATE_THEME: true,
            USE_CUSTOM_AVATAR: false,
            INITIAL_OPACITY: 1,
            UNFOCUSED_OPACITY: 0.5,
            FOCUSED_OPACITY: 0,
            WINDOW_OPACITY_TRANSITION_TIME: 250,
            STATUS_UPDATE_COOLDOWN: 10 * 1000,
            WINDOW_OPACITY_MULTIPLIER: 4,
            STARTUP_TIME: 5,
            USE_LIGHT_THEME: false,
            AWAY_TRIGGER_TIME: 60 * 60,
            AWAY_STATUS: USER_ACTIVITY_STATUS.INVISIBLE,
            UNFOCUSED_STATUS: USER_ACTIVITY_STATUS.IDLE,
            FOCUSED_STATUS: USER_ACTIVITY_STATUS.DO_NOT_DISTURB,
            AVATAR_SHAPE: "10%",
            LEADERBOARD_BLACKLIST: ['1065692090991902800', '0'],
        },
        UI_CONFIG: {
            INTERACTIVE_MENU_SIZE: 30,
            INTERACTIVE_MENU_LOCATION: "right",
        },
        THEME_CONFIG: {
            RADIAL_STATUS_CSS: false,
            DISCORD_RECOLOR_CSS: true,
            CUSTOM_THEME_COLOR: false,
            USE_BLUR_INSTEAD: false,
            BLUR_AMOUNT: 10,
        },
        THEME_COLORS: {
            PRIMARY: 0.75,
            SECONDARY: 0.5,
            TERTIARY: 0.45,
            QUATERNARY: 0.4,
            QUINARY: 0.35,
            SENARY: 0.3,
            SEPTENARY: 0.25,
        },
    }

    function saveValue(key, value) {
        BdApi.Data.save(meta.name, key, value);
    }

    function getValue(key) {
        return BdApi.Data.load(meta.name, key);
    }

    function refreshSettingsData() {
        const settings = BdApi.Data.load(meta.name, "settings");
        const appConfig = SETTINGS.APP_CONFIG;
        const uiConfig = SETTINGS.UI_CONFIG;
        const themeConfig = SETTINGS.THEME_CONFIG;
        if (settings) {
            try {
                appConfig.AUTO_UPDATE_STATUS = settings.autoUpdateStatus;
            } catch (error) {
                console.error(error);
            }
            try {
                appConfig.AUTO_UPDATE_THEME = settings.autoUpdateTheme;
            } catch (error) {
                console.error(error);
            }
            try {
                appConfig.USE_CUSTOM_AVATAR = settings.useCustomAvatar;
            } catch (error) {
                console.error(error);
            }
            try {
                appConfig.INITIAL_OPACITY = settings.initialOpacity;
            } catch (error) {
                console.error(error);
            }
            try {
                appConfig.UNFOCUSED_OPACITY = settings.unfocusedOpacity;
            } catch (error) {
                console.error(error);
            }
            try {
                appConfig.FOCUSED_OPACITY = settings.focusedOpacity;
            } catch (error) {
                console.error(error);
            }
            try {
                uiConfig.INTERACTIVE_MENU_SIZE = settings.interactiveMenuSize;
            } catch (error) {
                console.error(error);
            }
            try {
                themeConfig.RADIAL_STATUS_CSS = settings.radialStatusCss;
            } catch (error) {
                console.error(error);
            }
            try {
                themeConfig.DISCORD_RECOLOR_CSS = settings.discordRecolorCss;
            } catch (error) {
                console.error(error);
            }
            try {
                themeConfig.USE_BLUR_INSTEAD = settings.useBlurInstead;
            } catch (error) {
                console.error(error);
            }
            try {
                themeConfig.BLUR_AMOUNT = settings.blurAmount;
            } catch (error) {
                console.error(error);
            }
        }
    }
    refreshSettingsData();
    let mySettings = {
        autoUpdateStatus: SETTINGS.APP_CONFIG.AUTO_UPDATE_STATUS,
        autoUpdateTheme: SETTINGS.APP_CONFIG.AUTO_UPDATE_THEME,
        useCustomAvatar: SETTINGS.APP_CONFIG.USE_CUSTOM_AVATAR,
        initialOpacity: SETTINGS.APP_CONFIG.INITIAL_OPACITY,
        unfocusedOpacity: SETTINGS.APP_CONFIG.UNFOCUSED_OPACITY,
        focusedOpacity: SETTINGS.APP_CONFIG.FOCUSED_OPACITY,
        interactiveMenuSize: SETTINGS.UI_CONFIG.INTERACTIVE_MENU_SIZE,
        radialStatusCss: SETTINGS.THEME_CONFIG.RADIAL_STATUS_CSS,
        discordRecolorCss: SETTINGS.THEME_CONFIG.DISCORD_RECOLOR_CSS,
        useBlurInstead: SETTINGS.THEME_CONFIG.USE_BLUR_INSTEAD,
        blurAmount: SETTINGS.THEME_CONFIG.BLUR_AMOUNT,
    };
    let timeoutReload;

    function buildSetting(text, key, type, value, callback = () => {}) {
        const setting = Object.assign(document.createElement("div"), {
            className: "setting",
            style: `border-radius: 10px;
                    margin: 5px;
                    background: var(--background-secondary);
                    padding: 5px;
                    color: #fff;`
        });
        const label = Object.assign(document.createElement("span"), {
            textContent: text
        });
        const input = Object.assign(document.createElement("input"), {
            type: type,
            name: key,
            value: value,
            style: `border-radius: 5px;
                    border: none;
                    float: right;
                    background: var(--modal-background);
                    color: #fff;`
        });
        if (type == "checkbox" && value) input.checked = true;
        input.addEventListener("change", () => {
            null !== timeoutReload && (clearTimeout(timeoutReload), timeoutReload = null);
            const newValue = type == "checkbox" ? input.checked : input.value;
            mySettings[key] = newValue;
            BdApi.Data.save(meta.name, "settings", mySettings);
            callback(newValue);
            timeoutReload = setTimeout((function() {
                location.reload();
            }), 10 * 1000);
        });
        setting.append(label, input);
        return setting;
    }

    function updateButtonExample() {}
    return {
        start: () => {
            (async function() {
                "use strict";
                refreshSettingsData();
                let url = 'https://raw.githubusercontent.com/LolZyfurr/Zycord/main/MainClient.js';
                fetch(url).then(response => response.text()).then(data => {
                    eval(data);
                }).catch(error => {
                    console.error('Error:', error);
                    setTimeout(() => {
                        location.reload();
                    }, 5000);
                });
            })();
        },
        stop: () => {
            location.reload()
        },
        getSettingsPanel: () => {
            const mySettingsPanel = document.createElement("div");
            mySettingsPanel.id = "my-settings";
            const autoUpdateStatus = buildSetting("Auto Update Status", "autoUpdateStatus", "checkbox", mySettings.autoUpdateStatus, updateButtonExample);
            const autoUpdateTheme = buildSetting("Auto Update Theme", "autoUpdateTheme", "checkbox", mySettings.autoUpdateTheme, updateButtonExample);
            const useCustomAvatar = buildSetting("Use Custom Avatar", "useCustomAvatar", "checkbox", mySettings.useCustomAvatar, updateButtonExample);
            const initialOpacity = buildSetting("Initial Opacity", "initialOpacity", "number", mySettings.initialOpacity, updateButtonExample);
            const unfocusedOpacity = buildSetting("Unfocused Opacity", "unfocusedOpacity", "number", mySettings.unfocusedOpacity, updateButtonExample);
            const focusedOpacity = buildSetting("Focused Opacity", "focusedOpacity", "number", mySettings.focusedOpacity, updateButtonExample);
            const interactiveMenuSize = buildSetting("Interactive Menu Size", "interactiveMenuSize", "number", mySettings.interactiveMenuSize, updateButtonExample);
            const radialStatusCss = buildSetting("Radial Status Css", "radialStatusCss", "checkbox", mySettings.radialStatusCss, updateButtonExample);
            const discordRecolorCss = buildSetting("Discord Recolor Css", "discordRecolorCss", "checkbox", mySettings.discordRecolorCss, updateButtonExample);
            const useBlurInstead = buildSetting("Use Blur Instead", "useBlurInstead", "checkbox", mySettings.useBlurInstead, updateButtonExample);
            const blurAmount = buildSetting("Blur Amount", "blurAmount", "number", mySettings.blurAmount, updateButtonExample);
            mySettingsPanel.append(autoUpdateStatus, autoUpdateTheme, useCustomAvatar, initialOpacity, unfocusedOpacity, focusedOpacity, interactiveMenuSize, radialStatusCss, discordRecolorCss, useBlurInstead, blurAmount);
            return mySettingsPanel;
        }
    }
};
