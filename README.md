# Zycord
An experimental discord client modification.

## Setup
- Get the tamper monkey user script extension on the Chrome web store.
- Once the extension is installed create a new workspace.
- In the new workspace, copy the code below and paste it into it.
- Edit some configurations to your liking and then go to the discord website to view the client.
```js
// ==UserScript==
// @name         Zycord
// @namespace    http://tampermonkey.net/
// @version      2024.02.28
// @description  An experimental discord client modification.
// @author       Zy1ux
// @match        *://*.discord.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=discord.com
// @grant        none
// ==/UserScript==

(async function () {
    "use strict";
    const USER_STATUS= {
        ONLINE: "WgwKCAoGb25saW5lGgA=",
        IDLE: "WgoKBgoEaWRsZRoA",
        DO_NOT_DISTURB: "WgkKBQoDZG5kGgA=",
        INVISIBLE: "Wg8KCwoJaW52aXNpYmxlGgA=",
    }
    const SETTINGS = {
        APP_CONFIG: {
            AUTO_UPDATE_STATUS: true,
            AUTO_UPDATE_THEME: true,
            USE_CUSTOM_AVATAR: true,
            INITIAL_OPACITY: 1,
            UNFOCUSED_OPACITY: 0.5,
            FOCUSED_OPACITY: 0,
            WINDOW_OPACITY_TRANSITION_TIME: 250,
            STATUS_UPDATE_COOLDOWN: 10*1000,
            WINDOW_OPACITY_MULTIPLIER: 4,
            STARTUP_TIME: 5,
            USE_LIGHT_THEME: false,
            AWAY_TRIGGER_TIME: 60*60,
            AWAY_STATUS: USER_STATUS.INVISIBLE,
            UNFOCUSED_STATUS: USER_STATUS.IDLE,
            FOCUSED_STATUS: USER_STATUS.ONLINE,
            AVATAR_SHAPE: "10%",
        },
        THEME_COLORS: {
            PRIMARY: 0.55,
            SECONDARY: 0.5,
            TERTIARY: 0.45,
            QUATERNARY: 0.4,
            QUINARY: 0.35,
            SENARY: 0.3,
            SEPTENARY: 0.25,
        },
    }
    const url = 'https://raw.githubusercontent.com/Zy1ux/Zycord/main/MainClient.js';
    fetch(url).then(response => response.text()).then(data => {eval(data);});
})();
```

## Configurations
- `AUTO_UPDATE_STATUS` - Whether your status is automatically changed.
- `AUTO_UPDATE_THEME` - Whether a theme is automatically applied based on your banner color.
- `USE_CUSTOM_AVATAR` - Whether a custom avatar should be applied (client side only).
- `INITIAL_OPACITY` - The startup opacity of the website shade.
- `UNFOCUSED_OPACITY` - The opacity of the website shade whenever it is unfocused
