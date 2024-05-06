(async function() {
    if (!SAVED_VALUES_DATA.SAVED_LEADERBOARD_DEBOUNCE) {
        SAVED_VALUES_DATA.SAVED_LEADERBOARD_DEBOUNCE = true;
        const loadingHtml = `<div style="display: grid;"> <img src="https://github.com/Zy1ux/Zycord/blob/main/Images/9237-loading.gif?raw=true" style="height: 25%; max-height: 250px; justify-self: center; align-self: center;"></div>`;
        const channels = await fetchUserDMs(CONFIG_DATA.USER_TOKEN);
        console.log(channels)
        const fetchedSelfUser = await fetchUserSelf(CONFIG_DATA.USER_TOKEN);
        const selfUser = fetchedSelfUser.id;
        let modalLeaderboard = createModal(`${today ? (today === true ? ("Todays") : ("")) : ("")} Leaderboard`, loadingHtml);
        let interactionCounts = [];
        for (const channel of channels.reverse().values()) {
            let lastCheckedAuthor = 0;
            let interactions = 0;
            let dmChannelName = channel.id;
            let messageAuthor = null;
            let messages = await channel.zycord_fetchMassChannelMessages(today ? (today === true ? (500) : (50000)) : (50000));
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
                const dmChannelAuthor = await fetchUser(CONFIG_DATA.USER_TOKEN, dmChannelName);
                dmChannelName = dmChannelAuthor.global_name;
                const dmChannelUserID = dmChannelAuthor.id;
                const profilePicUrl = await messageAuthor.zycord_fetchUserAvatar("png", "4096");
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
        leaderboardButtonPress(button, true)
    }
});
