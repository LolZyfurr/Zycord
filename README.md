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
// @version      0.0.0
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
            PRIMARY: 0.75,
            SECONDARY: 0.5,
            TERTIARY: 0.45,
            QUATERNARY: 0.4,
            QUINARY: 0.35,
            SENARY: 0.3,
            SEPTENARY: 0.25,
        },
    }
    let url = 'https://raw.githubusercontent.com/Zy1ux/Zycord/main/MainClient.js';
    fetch(url)
        .then(response => response.text())
        .then(data => {eval(data);})
        .catch(error => {
        console.error('Error:', error);
        setTimeout(() => {
            location.reload();
        }, 5000);
    });
})();
```

---
## Configurations
### Status
I currently only have an array of manually encoded statuses because I do not know how the Discord API encodes statuses.
### App
A list of each app configuration and what it does.
- `AUTO_UPDATE_STATUS` - Whether your status is automatically changed.
- `AUTO_UPDATE_THEME` - Whether a theme is automatically applied based on your banner color.
- `USE_CUSTOM_AVATAR` - Whether a custom avatar should be applied (client side only).
- `INITIAL_OPACITY` - The startup opacity of the website shade.
- `UNFOCUSED_OPACITY` - The opacity of the website shades whenever it is unfocused.
- `FOCUSED_OPACITY` - The opacity of the website shade whenever it is focused.
- `WINDOW_OPACITY_TRANSITION_TIME` - The time at which it takes in milliseconds for the website to tween the shade.
- `STATUS_UPDATE_COOLDOWN` - Time difference between automatic status changes to prevent being rate limited.
- `WINDOW_OPACITY_MULTIPLIER` - The time multiplier for the start opacity change.
- `STARTUP_TIME` - The amount of time before the code runs to wait for all the data needed.
- `USE_LIGHT_THEME` - Whether the theme should use a light theme.
- `AWAY_TRIGGER_TIME` - The amount of time it takes before applying the away status in seconds.
- `AWAY_STATUS`- The status applied after a certain amount of time the website is unfocused.
- `UNFOCUSED_STATUS` - The status is applied when the website is unfocused.
- `FOCUSED_STATUS` - The status applied whenever the website is focused.
- `AVATAR_SHAPE` - The roundness of the avatar shape.
### Theme
This code is optional. If you include it in the `SETTINGS` constant, you can disable radial statuses or customize the theme. The default value is true.
```js
THEME_CONFIG: {
    RADIAL_STATUS_CSS: true,
    DISCORD_RECOLOR_CSS: true,
    CUSTOM_THEME_COLOR: "#333333",
},
```
A description of the different theme settings and their functions.
- `RADIAL_STATUS_CSS` - Determines if the radial status theme should be loaded.
- `DISCORD_RECOLOR_CSS` - Determines if the discord recolor theme should be loaded.
- `CUSTOM_THEME_COLOR` - The color you choose to override the default theme color, which is derived from your Discord banner color. (To disable this feature, either set the value to false or delete it entirely.)
### Interactive Menu
You can use this code to customize the menu's position and size. It is not required. Add it to the `SETTINGS` constant if you want to use it.
```js
UI_CONFIG: {
    INTERACTIVE_MENU_SIZE: 30,
    INTERACTIVE_MENU_LOCATION: "right",
},
```
A description of the different menu options and their functions.
- `INTERACTIVE_MENU_SIZE` - Adjusts the interactive menu to the desired size. (Icons may not display properly if the size is too small.)
- `INTERACTIVE_MENU_LOCATION` - Adjusts the location of the interactive menu on the screen. (Only left and right options are available now. Top and bottom options will be added later.)

---
## Disclaimer
Discord is a trademark of Discord Inc. and is solely mentioned for the sake of descriptivity. Mention of it does not imply any affiliation with or endorsement by Discord Inc. Using Zycord violates Discord's terms of service
