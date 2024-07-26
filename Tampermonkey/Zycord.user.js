// ==UserScript==
// @name         Zycord
// @namespace    http://tampermonkey.net/
// @version      0.0.1
// @description  An experimental discord client modification.
// @author       Zyfurr
// @match        *://*.discord.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=discord.com
// @grant        none
// ==/UserScript==
(async function() {
    "use strict";
    let USER_ACTIVITY_STATUS = {
        ONLINE: "Wg4KCAoGb25saW5lGgIIAQ==",
        IDLE: "WgwKBgoEaWRsZRoCCAE=",
        DO_NOT_DISTURB: "WgsKBQoDZG5kGgIIAQ==",
        INVISIBLE: "WhEKCwoJaW52aXNpYmxlGgIIAQ==",
    }
    const USER_STATUS= {
        ONLINE: "WgwKCAoGb25saW5lGgA=",
        IDLE: "WgoKBgoEaWRsZRoA",
        DO_NOT_DISTURB: "WgkKBQoDZG5kGgA=",
        INVISIBLE: "Wg8KCwoJaW52aXNpYmxlGgA=",
    }
    const SETTINGS = {
        APP_CONFIG: {
            AUTO_UPDATE_STATUS: false,
            AUTO_UPDATE_THEME: false,
            USE_CUSTOM_AVATAR: false,
            INITIAL_OPACITY: 1,
            UNFOCUSED_OPACITY: 0.667,
            FOCUSED_OPACITY: 0.333,
            WINDOW_OPACITY_TRANSITION_TIME: 250,
            STATUS_UPDATE_COOLDOWN: 10 * 1000,
            WINDOW_OPACITY_MULTIPLIER: 4,
            STARTUP_TIME: 5,
            USE_LIGHT_THEME: false,
            AWAY_TRIGGER_TIME: 60 * 60,
            AWAY_STATUS: USER_STATUS.INVISIBLE,
            UNFOCUSED_STATUS: USER_STATUS.IDLE,
            FOCUSED_STATUS: USER_STATUS.ONLINE,
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
        GM_setValue(key, value);
    }

    function getValue(key) {
        return GM_getValue(key);
    }

    let url = 'https://raw.githubusercontent.com/LolZyfurr/Zycord/main/MainClient.js';
    fetch(url).then(response => response.text()).then(data => {
        try {
            eval(data);
        } catch (error) {
            console.error('Error:', error);
            console.error('Stack:', error.stack);
        }
    }).catch(error => {
        console.error('Fetch Error:', error);
        setTimeout(() => {
            location.reload();
        }, 5000);
    });
})();
