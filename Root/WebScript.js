// Check if auth token is already stored
let discordAccountAuth = sessionStorage.getItem("discordAuth");

if (!discordAccountAuth) {
    // Prompt user to enter their Discord auth token
    discordAccountAuth = prompt("Enter your Discord account auth token:");

    // Validate and store it temporarily
    if (discordAccountAuth && discordAccountAuth.startsWith("OD")) {
        sessionStorage.setItem("discordAuth", discordAccountAuth);
    } else {
        alert("Invalid or missing token. Please try again.");
        // Optionally redirect or disable features here
    }
}

const originalLog = console.log;
const originalError = console.error;
const originalWarn = console.warn;

console.log = function (...args) {
    originalLog.apply(console, args);
    const logContent = document.createElement("div");
    logContent.className = "zycord-ConsoleContent zycord-LogConsole";
    logContent.textContent = args.join(' ')
    document.querySelector('.zycord-ConsoleWindow').appendChild(logContent)
};
console.error = function (...args) {
    originalError.apply(console, args);
    const logContent = document.createElement("div");
    logContent.className = "zycord-ConsoleContent zycord-ErrorConsole";
    logContent.textContent = args.join(' ')
    document.querySelector('.zycord-ConsoleWindow').appendChild(logContent)
};
console.warn = function (...args) {
    originalWarn.apply(console, args);
    const logContent = document.createElement("div");
    logContent.className = "zycord-ConsoleContent zycord-WarnConsole";
    logContent.textContent = args.join(' ')
    document.querySelector('.zycord-ConsoleWindow').appendChild(logContent)
};

const requiredObjects = ['channelList', 'websocketConnection', 'websocketHeartbeat', 'websocketReady']; // Customize as needed
const loadStatus = {};

// Initialize all objects as not loaded
requiredObjects.forEach(obj => loadStatus[obj] = false);

function updateLoadStatus(objectName, isLoaded) {
    loadStatus[objectName] = isLoaded;

    const statusLabel = isLoaded ? "Ready" : "Error or Unloaded";
    console.log(`[${objectName}] - ${statusLabel}`);

    checkAllLoaded();
}

function checkAllLoaded() {
    const allLoaded = requiredObjects.every(obj => loadStatus[obj]);
    if (allLoaded) {
        hideLoad();
    } else {
        showLoad();
    }
}

let focusMenuStartY = 0;
let focusMenuDeltaY = 0;
let isDragging = false;
let gestureLocked = null;
let dragBuffer = 0;
let scrollLocked = false;


function createFocusContainer(messageId) {
    // Create container structure
    const focusContainer = document.createElement("div");
    focusContainer.className = "zycord-FocusContainer";

    focusContainer.addEventListener("click", (e) => {
        const clickedInsideMenu = bottomFocusContainer.contains(e.target);
        if (!clickedInsideMenu) {
            hideSelf(); // 📦 Removes the menu entirely after transition
        }

    });

    const bottomFocusContainer = document.createElement("div");
    bottomFocusContainer.className = "zycord-BottomFocusContainer";

    const dragContainer = document.createElement("div");
    dragContainer.className = "zycord-MenuDragContainer";
    const dragIcon = document.createElement("div");
    dragIcon.className = "zycord-MenuDragIcon";
    dragContainer.appendChild(dragIcon);

    const menuContainer = document.createElement("div");
    menuContainer.className = "zycord-BottomMenuContainer";

    const menuItems = [{
        text: "Delete",
        icon: "https://cdn3.emoji.gg/emojis/4151-delete-guild.png"
    }, {
        text: "Edit",
        icon: "https://cdn3.emoji.gg/emojis/3639-edit.png"
    }, {
        text: "Reply",
        icon: "https://cdn3.emoji.gg/emojis/8758-reply-msg.png"
    }, {
        text: "Share",
        icon: "https://cdn3.emoji.gg/emojis/6344-communication-requests.png"
    }, {
        text: "Copy",
        icon: "https://cdn3.emoji.gg/emojis/2716-utilities.png"
    }, {
        text: "Pin",
        icon: "https://cdn3.emoji.gg/emojis/7896-pinned.png"
    }, {
        text: "Report",
        icon: "https://cdn3.emoji.gg/emojis/4645-report-message.png"
    }, {
        text: "Block",
        icon: "https://cdn3.emoji.gg/emojis/4811-report-raid.png"
    }];
    const actionMap = {
        "Delete": () => deleteMessage(messageId),
        "Edit": () => editMessageAction(messageId),
        "Reply": () => replyMessageAction(messageId)
    };

    menuItems.forEach(menuData => {
        const button = document.createElement("div");
        button.className = "zycord-BottomMenuButton";

        const icon = document.createElement("div");
        icon.className = "zycord-BottomMenuIcon";
        icon.style.maskImage = `url(${menuData.icon})`;
        icon.style.webkitMaskImage = `url(${menuData.icon})`;

        const label = document.createElement("div");
        label.className = "zycord-BottomMenuText";
        label.textContent = menuData.text;

        button.appendChild(icon);
        button.appendChild(label);
        menuContainer.appendChild(button);

        button.addEventListener("click", () => {
            const action = actionMap[menuData.text];
            if (action) action();
            hideSelf(); // Close the menu after action
        });
    });


    bottomFocusContainer.appendChild(dragContainer);
    bottomFocusContainer.appendChild(menuContainer);
    focusContainer.appendChild(bottomFocusContainer);

    focusContainer.style.opacity = "0";
    focusContainer.style.transform = "translateY(20px)";
    focusContainer.style.transition = "opacity 0.4s ease, transform 0.4s ease";



    // Inject into container list
    const list = document.querySelector(".zycord-FocusContainerList");
    if (list) {
        list.appendChild(focusContainer);
        requestAnimationFrame(() => {
            focusContainer.style.opacity = "1";
            focusContainer.style.transform = "translateY(0)";
        });
    }

    const scrollContainer = menuContainer; // Adjust this if your scroll target is nested differently
    const bottomMenu = bottomFocusContainer;

    function hideSelf() {
        bottomMenu.style.transition = "transform 0.25s ease";
        bottomMenu.style.transform = "translateY(100%)";
        focusContainer.style.transition = "opacity 0.3s ease";
        focusContainer.style.opacity = "0";
        setTimeout(() => {
            focusContainer.remove(); // 🔥 Full teardown
        }, 300);
    }


    bottomMenu.addEventListener("touchstart", (e) => {
        if (e.touches.length === 1) {
            focusMenuStartY = e.touches[0].clientY;
            dragBuffer = 0;
            focusMenuDeltaY = 0;
            isDragging = true;
            gestureLocked = null;
            scrollLocked = false;
            bottomMenu.style.transition = "none";
            bottomMenu.style.willChange = "transform";
        }
    });

    bottomMenu.addEventListener("touchmove", (e) => {
        if (!isDragging) return;
        const y = e.touches[0].clientY;
        focusMenuDeltaY = y - focusMenuStartY;

        if (gestureLocked === null && Math.abs(focusMenuDeltaY) > 10) {
            gestureLocked = "drag";
        }

        if (gestureLocked === "drag") {
            const isAtTop = scrollContainer.scrollTop <= 0;

            if (!isAtTop) {
                dragBuffer += focusMenuDeltaY;
                focusMenuStartY = y;
                return;
            }

            const totalDrag = focusMenuDeltaY + dragBuffer;
            if (totalDrag > 0) {
                const dragPercent = Math.min((totalDrag / window.innerHeight) * 100, 100);
                bottomMenu.style.transform = `translateY(${dragPercent}vh)`;
                e.preventDefault();
            }
        }
    });

    bottomMenu.addEventListener("touchend", () => {
        if (!isDragging) return;
        isDragging = false;

        const totalDrag = focusMenuDeltaY + dragBuffer;
        bottomMenu.style.transition = "transform 0.25s ease";
        focusContainer.style.transition = "opacity 0.3s ease";
        bottomMenu.style.willChange = "auto";

        if (gestureLocked === "drag" && totalDrag > window.innerHeight * 0.25) {
            hideSelf();
        } else {
            bottomMenu.style.transform = "translateY(0)";
        }


        gestureLocked = null;
        dragBuffer = 0;
    });

    return focusContainer;
}
async function fetchCachedUserProfile(userId, forceRefresh = false) {
    const storeKey = `users-${userId}-profile`;

    try {
        // Fetch from API if not cached or if forceRefresh is true
        if (forceRefresh || !zycordDataStore.has(storeKey)) {
            const response = await fetch(
                `https://discord.com/api/v9/users/${userId}/profile?type=popout&with_mutual_guilds=true&with_mutual_friends=true&with_mutual_friends_count=false`,
                {
                    headers: {
                        Authorization: discordAccountAuth,
                        "Content-Type": "application/json"
                    }
                }
            );

            if (!response.ok) {
                console.error(`Failed to fetch user profile. Status: ${response.status}`);
                return null;
            }



            const data = await response.json();
            zycordDataStore.set(storeKey, data);

            console.log(JSON.stringify(data));
        }

        const jsonResponse = zycordDataStore.get(storeKey);

        if (!jsonResponse || !jsonResponse.user) {
            console.warn("User data missing from response.");
            return null;
        }

        // Optional normalization for UI rendering
        return jsonResponse
    } catch (err) {
        console.error("Error fetching or parsing user profile:", err);
        return null;
    }
}

function formatElapsedTime(timestamp) {
    const now = Date.now();
    const elapsedMs = Math.max(0, now - timestamp);
    const seconds = Math.floor(elapsedMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours >= 1) return `${hours} hr${hours > 1 ? "s" : ""}`;
    if (minutes >= 1) return `${minutes} min${minutes > 1 ? "s" : ""}`;
    return `${seconds} sec${seconds !== 1 ? "s" : ""}`;
}

function resolveActivityTimestamp(act) {
    return act.created_at ?? act?.timestamps?.start ?? Date.now();
}

function resolveActivityIconUrl(act) {
    const rawImage = act?.assets?.large_image;
    if (!rawImage) return "https://cdn.discordapp.com/embed/avatars/0.png";

    if (rawImage.startsWith("mp:external/")) {
        const externalPath = rawImage.slice("mp:external/".length);
        return `https://media.discordapp.net/external/${externalPath}`;
    }

    return `https://cdn.discordapp.com/app-assets/${act.application_id}/${rawImage}`;
}

function createActivityElement(act) {
    const profileContent = document.createElement("div");
    profileContent.className = "ProfileContent";
    profileContent.dataset.activityId = act.application_id;

    const activityContainer = document.createElement("div");
    activityContainer.className = "ProfileActivityContainer";
    activityContainer.dataset.activityId = act.application_id;

    const activityType = document.createElement("div");
    activityType.className = "ProfileActivityType";
    activityType.textContent = `Playing ${act.name}`;

    const activityDetails = document.createElement("div");
    activityDetails.className = "ProfileActivityDetails";

    const activityIcon = document.createElement("div");
    activityIcon.className = "ProfileActivityIcon";
    const activityImg = document.createElement("img");
    activityImg.src = resolveActivityIconUrl(act);
    activityImg.className = "ProfileActivityDisplay";
    activityIcon.appendChild(activityImg);

    const activityContent = document.createElement("div");
    activityContent.className = "ProfileActivityContent";

    const activityHeader = document.createElement("div");
    activityHeader.className = "ProfileActivityHeader";
    activityHeader.textContent = act.name;

    const activityStartTimestamp = resolveActivityTimestamp(act);
    const activityTime = document.createElement("div");
    activityTime.className = "ProfileActivityTime";

    function updateActivityTime() {
        activityTime.textContent = formatElapsedTime(activityStartTimestamp);
    }

    updateActivityTime();
    setInterval(updateActivityTime, 1000);

    activityContent.appendChild(activityHeader);

    if (act?.details?.trim()) {
        const activityState = document.createElement("div");
        activityState.className = "ProfileActivityInfoDetails";
        activityState.textContent = act.details;
        activityContent.appendChild(activityState);
    }

    if (act?.state?.trim()) {
        const activityState = document.createElement("div");
        activityState.className = "ProfileActivityState";
        activityState.textContent = act.state;
        activityContent.appendChild(activityState);
    }

    activityContent.appendChild(activityTime);
    activityDetails.appendChild(activityIcon);
    activityDetails.appendChild(activityContent);
    activityContainer.appendChild(activityType);
    activityContainer.appendChild(activityDetails);
    profileContent.appendChild(activityContainer);

    return profileContent;
}

function renderActivities(activity, profileContainer) {
    const acts = activity?.activities ?? [];
    acts.forEach((act) => {
        if (act.type === 0) {
            const activityElement = createActivityElement(act);
            profileContainer.appendChild(activityElement);
        }
    });
}

function upsertActivityElement(act) {
    if (act?.application_id) {
        const activityId = act.application_id;
        const container = document.querySelector(`.ProfileContent[data-activity-id="${activityId}"]`);
        if (container) {
            const existing = container.querySelector(`.ProfileActivityContainer[data-activity-id="${activityId}"]`);
            const newElement = createActivityElement(act);
            const toReplace = newElement?.querySelector(`.ProfileActivityContainer[data-activity-id="${activityId}"]`);

            if (toReplace) {
                container.replaceChild(toReplace, existing);
            } else {
                container.appendChild(newElement);
            }
        }
    }
}

async function showDiscordUserProfileOverlay(userId) {
    const jsonResponse = await fetchCachedUserProfile(userId);
    const user = jsonResponse.user

    const avatarUrl = user.avatar
        ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=2048`
        : "https://cdn.discordapp.com/embed/avatars/0.png";

    const bannerUrl = user.banner
        ? `https://cdn.discordapp.com/banners/${user.id}/${user.banner}.png?size=2048`
        : "";

    const activity = zycordDataStore.get(`activities-${userId}`);
    console.log(JSON.stringify(activity));
    const status = activity?.status || "offline";
    const statusClass = getStatusClassFromPresence(status);

    const focusContainer = document.createElement("div");
    focusContainer.className = "zycord-FocusContainer";

    const popout = document.createElement("div");
    popout.className = "ProfilePopout";

    const dragContainer = document.createElement("div");
    dragContainer.className = "zycord-MenuDragContainer";
    const dragIcon = document.createElement("div");
    dragIcon.className = "zycord-MenuDragIcon";
    dragContainer.appendChild(dragIcon);
    popout.appendChild(dragContainer);

    const banner = document.createElement("div");
    banner.className = "ProfileBanner";
    banner.style.backgroundColor = user.banner_color;

    if (bannerUrl) {
        const bannerImg = document.createElement("img");
        bannerImg.src = bannerUrl;
        bannerImg.className = "ProfileBannerDisplay";
        banner.appendChild(bannerImg);
    }

    const avatarContainer = document.createElement("div");
    avatarContainer.className = "ProfileAvatar";

    const avatarImg = document.createElement("img");
    avatarImg.src = avatarUrl;
    avatarImg.className = "ProfileAvatarDisplay";

    const statusDiv = document.createElement("div");
    statusDiv.className = "ProfileStatus";

    const statusIcon = document.createElement("div");
    statusIcon.className = `ProfileStatusDisplay ${statusClass}`;
    statusDiv.appendChild(statusIcon);

    avatarContainer.appendChild(avatarImg);
    avatarContainer.appendChild(statusDiv);

    const header = document.createElement("div");
    header.className = "ProfileHeader";
    header.appendChild(banner);
    header.appendChild(avatarContainer);

    const nameDiv = document.createElement("div");
    nameDiv.className = "ProfileName";
    nameDiv.textContent = user.global_name || user.username;

    //zycord-UsernameContainer
    const UsernameContainer = document.createElement("div");
    UsernameContainer.className = "zycord-UsernameContainer";

    const usernameDiv = document.createElement("div");
    usernameDiv.className = "ProfileUsername";
    usernameDiv.textContent = `@${user.username}${user.discriminator !== "0" ? "#" + user.discriminator : ""}`;

    const detailsDiv = document.createElement("div");
    detailsDiv.className = "ProfileDetails";

    UsernameContainer.appendChild(usernameDiv);
    detailsDiv.append(nameDiv, UsernameContainer);

    if (jsonResponse.user_profile.pronouns !== "") {
        const MutedDotSpacer = document.createElement("div");
        MutedDotSpacer.className = "zycord-MutedDotSpacer";

        const pronounsDiv = document.createElement("div");
        pronounsDiv.className = "ProfileUsername";
        pronounsDiv.textContent = jsonResponse.user_profile.pronouns;

        UsernameContainer.append(MutedDotSpacer, pronounsDiv)
    }

    if (jsonResponse.badges.length > 0) {
        const ProfileBadgeContainer = document.createElement("div");
        ProfileBadgeContainer.className = "zycord-ProfileBadgeContainer";

        jsonResponse.badges.forEach((badge) => {
            const ProfileBadgeImage = document.createElement("img");
            ProfileBadgeImage.className = "zycord-ProfileBadgeImage";
            ProfileBadgeImage.src = `https://cdn.discordapp.com/badge-icons/${badge.icon}.png`
            ProfileBadgeContainer.appendChild(ProfileBadgeImage);
        });

        detailsDiv.appendChild(ProfileBadgeContainer)
    }

    const bioContainer = document.createElement("div");
    bioContainer.className = "ProfileContentContainer";

    const bioHeader = document.createElement("div");
    bioHeader.className = "ProfileContentHeader";
    bioHeader.textContent = "About Me";

    const bioText = document.createElement("div");
    bioText.className = "ProfileContentText";

    if (user.bio) {
        user.bio.split("\n").forEach(line => {
            const span = document.createElement("span");
            span.textContent = line;
            bioText.appendChild(span);
            bioText.appendChild(document.createElement("br"));
        });
    }

    bioContainer.appendChild(bioHeader);
    bioContainer.appendChild(bioText);

    const dateContainer = document.createElement("div");
    dateContainer.className = "ProfileContentContainer";

    const dateHeader = document.createElement("div");
    dateHeader.className = "ProfileContentHeader";
    dateHeader.textContent = "Member Since";

    const dateText = document.createElement("div");
    dateText.className = "ProfileContentText";
    dateText.textContent = new Date().toLocaleDateString(); // You could swap in `user.created_at` or similar

    dateContainer.appendChild(dateHeader);
    dateContainer.appendChild(dateText);

    const content = document.createElement("div");
    content.className = "ProfileContent";
    content.appendChild(bioContainer);
    content.appendChild(dateContainer);

    const profileContainer = document.createElement("div");
    profileContainer.className = "ProfileContainer";
    profileContainer.appendChild(detailsDiv);
    profileContainer.appendChild(content);

    if (activity?.activities?.length > 0) {
        renderActivities(activity, profileContainer);
    }

    popout.appendChild(header);
    popout.appendChild(profileContainer);

    focusContainer.style.opacity = "0";
    focusContainer.style.transform = "translateY(20px)";
    focusContainer.style.transition = "opacity 0.4s ease, transform 0.4s ease";

    focusContainer.appendChild(popout);
    focusContainer.addEventListener("click", e => {
        if (!popout.contains(e.target)) {
            bottomMenu.style.transition = "transform 0.3s ease";
            bottomMenu.style.transform = "translateY(100%) translateX(-50%)";
            focusContainer.style.transition = "opacity 0.3s ease";
            focusContainer.style.opacity = "0";
            setTimeout(() => {
                focusContainer.remove();
            }, 300);
        }
    });

    const focusContainerList = document.querySelector(".zycord-FocusContainerList");
    if (focusContainerList) {
        focusContainerList.appendChild(focusContainer);
        requestAnimationFrame(() => {
            focusContainer.style.opacity = "1";
            focusContainer.style.transform = "translateY(0)";
        });
    }

    let isDragging = false;
    let gestureLocked = null;
    let dragStartY = 0;
    let dragDeltaY = 0;
    let dragBuffer = 0;

    const scrollContainer = popout;
    const bottomMenu = popout; // ProfilePopout is the draggable target

    bottomMenu.addEventListener("touchstart", (e) => {
        if (e.touches.length === 1) {
            dragStartY = e.touches[0].clientY;
            dragDeltaY = 0;
            dragBuffer = 0;
            isDragging = true;
            gestureLocked = null;
            bottomMenu.style.transition = "none";
            bottomMenu.style.willChange = "transform";
        }
    });

    bottomMenu.addEventListener("touchmove", (e) => {
        if (!isDragging) return;
        const y = e.touches[0].clientY;
        dragDeltaY = y - dragStartY;

        if (gestureLocked === null && Math.abs(dragDeltaY) > 10) {
            gestureLocked = "profileDrag";
        }

        if (gestureLocked === "profileDrag") {
            const isAtTop = scrollContainer?.scrollTop <= 0;

            if (!isAtTop) {
                dragBuffer += dragDeltaY;
                dragStartY = y;
                return;
            }

            const totalDrag = dragDeltaY + dragBuffer;
            if (totalDrag > 0) {
                const dragPercent = Math.min((totalDrag / window.innerHeight) * 100, 100);
                bottomMenu.style.transform = `translateY(${dragPercent}vh) translateX(-50%)`;
                scrollContainer.style.overflow = "hidden";
                e.preventDefault();
            }
        }
    });

    bottomMenu.addEventListener("touchend", () => {
        if (!isDragging) return;
        isDragging = false;

        const totalDrag = dragDeltaY + dragBuffer;
        bottomMenu.style.transition = "transform 0.25s ease";
        bottomMenu.style.willChange = "auto";

        if (gestureLocked === "profileDrag" && totalDrag > window.innerHeight * 0.25) {
            bottomMenu.style.transition = "transform 0.3s ease";
            bottomMenu.style.transform = "translateY(100%) translateX(-50%)";
            focusContainer.style.transition = "opacity 0.3s ease";
            focusContainer.style.opacity = "0";
            setTimeout(() => {
                focusContainer.remove();
            }, 300);
        } else {
            scrollContainer.style.overflow = "auto";
            bottomMenu.style.transform = "translateY(0) translateX(-50%)";
        }

        gestureLocked = null;
        dragBuffer = 0;
    });
}

function createFocusConfirmMenu({ title, description, onConfirm, onCancel }) {
    // Create a fresh container just for this menu
    const focusContainer = document.createElement('div');
    focusContainer.className = 'zycord-FocusContainer';

    const menu = document.createElement('div');
    menu.className = 'zycord-FocusConfirmMenu';

    const content = document.createElement('div');
    content.className = 'zycord-ConfirmMenuContent';

    const titleEl = document.createElement('div');
    titleEl.className = 'zycord-ConfirmMenuTitle';
    titleEl.textContent = title || 'Delete Message';

    const descriptionEl = document.createElement('div');
    descriptionEl.className = 'zycord-ConfirmMenuDescription';
    descriptionEl.textContent = description || 'Are you sure you want to delete this message?';

    content.appendChild(titleEl);
    content.appendChild(descriptionEl);

    const actions = document.createElement('div');
    actions.className = 'zycord-ConfirmMenuActions';

    const cancelBtn = document.createElement('div');
    cancelBtn.className = 'zycord-ConfirmMenuActionButton';
    cancelBtn.textContent = 'Cancel';
    cancelBtn.addEventListener('click', () => {
        if (typeof onCancel === 'function') onCancel();
        focusContainer.remove();
    });

    const confirmBtn = document.createElement('div');
    confirmBtn.className = 'zycord-ConfirmMenuActionButton';
    confirmBtn.textContent = 'Confirm';
    confirmBtn.addEventListener('click', () => {
        if (typeof onConfirm === 'function') onConfirm();
        focusContainer.remove();
    });

    actions.appendChild(cancelBtn);
    actions.appendChild(confirmBtn);

    menu.appendChild(content);
    menu.appendChild(actions);

    focusContainer.appendChild(menu);

    // Inject directly into body for true isolation
    const focusContainerList = document.querySelector('.zycord-FocusContainerList');
    if (focusContainerList) focusContainerList.appendChild(focusContainer);

    return menu;
}




function attachSwipeToElement(element, onSwipeConfirmed) {
    let startX, startY, currentX, deltaX;
    const gestureName = "dismiss-right-to-left";
    let customGestureLocked = null;

    // Suggested tweak
    function updateGestureLock(gesture) {
        if (gesture === gestureName) {
            gestureLocked = gestureName;
            customGestureLocked = gestureName;
        } else if (gesture === null) {
            gestureLocked = null;
            customGestureLocked = null;
        } else {
            customGestureLocked = gestureName;
        }
    }

    function fetchGestureLock() {
        return gestureLocked || customGestureLocked;
    }

    let gesturePrimed = false;
    let bufferFrame = 0;

    const onTouchStart = (t) => {
        if (t.touches.length !== 1) return;
        startX = t.touches[0].clientX;
        startY = t.touches[0].clientY;
        isDragging = true;
        gesturePrimed = false;
        bufferFrame = 0;
        updateGestureLock(null);
        element.style.transition = "none";
        element.style.willChange = "transform";
        element.style.transform = "translateZ(0)";
    };



    const onTouchMove = (t) => {
        if (!isDragging) return;

        const e = t.touches[0];
        currentX = e.clientX;
        const deltaY = e.clientY - startY;
        const deltaXRaw = startX - currentX;
        const absX = Math.abs(deltaXRaw);
        const absY = Math.abs(deltaY);
        const swipeThreshold = 10;
        const YMaxThreshold = 5;

        if (!fetchGestureLock()) {
            if (absY > YMaxThreshold) {
                updateGestureLock("scroll");
            } else if (absX < swipeThreshold || absX < absY) {
                updateGestureLock("scroll");
            } else {
                const direction = deltaXRaw > 0 ? "left" : "right"; // 🧭 add directional nuance
                if (direction === "left") {
                    updateGestureLock(gestureName);
                } else {
                    updateGestureLock("scroll");
                }
            }
        }


        if (fetchGestureLock() === gestureName) {
            // Exit early if Y exceeds threshold to preserve horizontal intent


            if (!gesturePrimed) {
                bufferFrame++;
                if (bufferFrame > 2) gesturePrimed = true;
            }

            if (gesturePrimed && deltaXRaw > 0) {
                deltaX = deltaXRaw;
                const progress = Math.min(deltaX / window.innerWidth * 100, 100);
                element.style.transform = `translateX(-${progress}vw)`;
                t.preventDefault();
            }
        }
    };



    const onTouchEnd = () => {
        if (!isDragging || fetchGestureLock() !== gestureName) return;

        isDragging = false;
        updateGestureLock(null);

        if (deltaX > 0.25 * window.innerWidth) {
            if (typeof onSwipeConfirmed === "function") onSwipeConfirmed(element);
        }

        element.style.transition = "transform 0.25s ease";
        element.style.transform = "translateX(0)";
        element.style.willChange = "auto";
    };

    element.addEventListener("touchstart", onTouchStart);
    element.addEventListener("touchmove", onTouchMove);
    element.addEventListener("touchend", onTouchEnd);
}

document.getElementById("closeMessagesButton").addEventListener("click", () => swipeMessageContainer(false));
document.getElementById('fileInput').addEventListener('change', function (event) {
    const previewContainer = document.getElementById('zycord-MediaPreviewContainer');
    const files = Array.from(event.target.files);

    files.forEach(file => {
        zycordMediaStore.addFile(file);

        const mediaWrapper = document.createElement('div');
        mediaWrapper.className = 'zycord-MediaPreviewItemWrapper';
        mediaWrapper.style.position = 'relative';
        mediaWrapper.style.display = 'inline-block';

        const removeBtn = document.createElement('span');
        removeBtn.textContent = 'X';
        removeBtn.className = 'zycord-RemoveBtn';

        removeBtn.addEventListener('click', () => {
            zycordMediaStore.removeFile(file);
            mediaWrapper.remove();
            previewContainer.style.display = zycordMediaStore.hasFiles() ? 'flex' : 'none';
        });

        if (file.type.startsWith('image/')) {
            const img = document.createElement('img');
            img.src = URL.createObjectURL(file);
            img.className = 'zycord-MediaPreviewItem';
            mediaWrapper.appendChild(img);
        } else {
            const fileLabel = document.createElement('div');
            fileLabel.textContent = file.name;
            fileLabel.className = 'zycord-MediaPreviewItem';
            fileLabel.style.cssText = `
                display: flex;
                align-items: center;
                justify-content: center;
                height: 80px;
                padding: 10px;
                background: #222;
                color: #fff;
            `;
            mediaWrapper.appendChild(fileLabel);
        }

        mediaWrapper.appendChild(removeBtn);
        previewContainer.appendChild(mediaWrapper);
    });

    previewContainer.style.display = zycordMediaStore.hasFiles() ? 'flex' : 'none';
});



function formatUnixTimestamp(unixTimestamp) {
    const now = new Date();
    const inputDate = new Date(unixTimestamp * 1000);

    // Strip time for comparison
    const nowDayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const inputDayStart = new Date(inputDate.getFullYear(), inputDate.getMonth(), inputDate.getDate());

    // Calculate difference in days
    const msPerDay = 86400000;
    const diffInDays = (nowDayStart - inputDayStart) / msPerDay;

    // Format time part
    const hours = inputDate.getHours();
    const minutes = inputDate.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 === 0 ? 12 : hours % 12;
    const formattedMinutes = minutes.toString().padStart(2, '0');
    const timePart = `${formattedHours}:${formattedMinutes} ${ampm}`;

    // Determine label
    if (diffInDays === 0) {
        return `${timePart}`;
    } else if (diffInDays === 1) {
        return `Yesterday at ${timePart}`;
    } else {
        const mm = (inputDate.getMonth() + 1).toString().padStart(2, '0');
        const dd = inputDate.getDate().toString().padStart(2, '0');
        const yyyy = inputDate.getFullYear();
        return `${mm}/${dd}/${yyyy} ${timePart}`;
    }
}

function removeMessage(messageId) {
    const container = document.querySelector('.zycord-MessageContainerList');
    const messageEl = container.querySelector(`[data-message-id="${messageId}"]`);

    if (messageEl) {
        container.removeChild(messageEl);
        console.log(`🗑️ Message removed from UI: ${messageId}`);
    } else {
        console.warn(`No message found to remove: ${messageId}`);
    }
}

function getFileExtension(url) {
    const cleanUrl = url.split('?')[0];
    return cleanUrl.split('.').pop().toLowerCase();
}

function createCustomAudioPlayer(filename, src) {
    const icons = {
        play: 'https://cdn3.emoji.gg/emojis/5134-resume.png',
        pause: 'https://cdn3.emoji.gg/emojis/6148-pause.png',
        back: 'https://cdn3.emoji.gg/emojis/5134-backward.png',
        forward: 'https://cdn3.emoji.gg/emojis/5134-forward.png',
        replay: 'https://cdn3.emoji.gg/emojis/8562-replay.png'
    };

    const container = document.createElement('div');
    container.className = 'zycord-CustomAudioAttachment';

    const title = document.createElement('div');
    title.className = 'zycord-CustomAudioTitle';
    title.textContent = filename;

    const audio = document.createElement('audio');
    audio.src = src;
    audio.preload = 'metadata';

    const progressBar = document.createElement('div');
    progressBar.className = 'zycord-CustomAudioBar';

    const progressFill = document.createElement('div');
    progressFill.className = 'zycord-CustomAudioBarFill';
    progressBar.appendChild(progressFill);

    const btnContainer = document.createElement('div');
    btnContainer.className = 'zycord-CustomAudioButtonsContainer';

    // 🛠️ Helper to build icon buttons
    function createIconBtn(type) {
        const btn = document.createElement('div');
        btn.className = 'zycord-CustomAudioButton';

        const icon = document.createElement('div');
        icon.className = 'zycord-CustomAudioIcon';
        icon.style.maskImage = `url("${icons[type]}")`;
        icon.style.webkitMaskImage = icon.style.maskImage;

        btn.appendChild(icon);
        return { btn, icon };
    }

    const { btn: backBtn } = createIconBtn('back');
    const { btn: playBtn, icon: playIcon } = createIconBtn('play');
    const { btn: forwardBtn } = createIconBtn('forward');
    btnContainer.append(backBtn, playBtn, forwardBtn);

    let isPlaying = false;
    let isEnded = false;

    // 🎧 Progress bar logic
    function updateProgress() {
        const percent = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
        progressFill.style.width = `${percent}%`;
    }

    audio.addEventListener('loadedmetadata', updateProgress);
    audio.addEventListener('timeupdate', updateProgress);

    audio.addEventListener('ended', () => {
        isPlaying = false;
        isEnded = true;
        playIcon.style.maskImage = `url("${icons.replay}")`;
        playIcon.style.webkitMaskImage = playIcon.style.maskImage;
    });

    backBtn.addEventListener('click', () => {
        audio.currentTime = Math.max(0, audio.currentTime - 10);
    });

    forwardBtn.addEventListener('click', () => {
        audio.currentTime = Math.min(audio.duration, audio.currentTime + 10);
    });

    playBtn.addEventListener('click', () => {
        if (isEnded || audio.currentTime === audio.duration) {
            audio.currentTime = 0;
            isEnded = false;
        }

        if (audio.paused) {
            audio.play();
            isPlaying = true;
            playIcon.style.maskImage = `url("${icons.pause}")`;
            playIcon.style.webkitMaskImage = playIcon.style.maskImage;
        } else {
            audio.pause();
            isPlaying = false;
            playIcon.style.maskImage = `url("${icons.play}")`;
            playIcon.style.webkitMaskImage = playIcon.style.maskImage;
        }
    });

    container.append(title, audio, progressBar, btnContainer);
    return container;
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function createMessageElement({
    messageReference = {},
    edited,
    messageId,
    username,
    tag,
    timestamp,
    content,
    attachments = [],
    embed = null,
    reactions = [],
    avatarSrc = ''
}) {
    // Exit early if there's nothing to render
    const hasContent = Boolean(content && content.trim() && content !== "" && content.trim() !== "");
    const hasAttachments = Array.isArray(attachments) && attachments.length > 0;
    const hasEmbed = Array.isArray(embed) && embed.length > 0

    if (!hasContent && !hasAttachments && !hasEmbed) {
        return;
    }

    const messageEl = document.createElement('div');
    messageEl.className = 'zycord-ChannelMessage';
    if (messageReference.message_id) {
        messageEl.classList.add('zycord-MessageReplyActive');
    }
    messageEl.setAttribute('data-message-id', messageId);
    messageEl.setAttribute('data-message-timestamp', timestamp);

    const directMessageReplyDisplayEl = document.createElement('div');
    directMessageReplyDisplayEl.className = 'zycord-DirectMessageReplyDisplay';

    const directMessageContentDisplayEl = document.createElement('div');
    directMessageContentDisplayEl.className = 'zycord-DirectMessageContentDisplay';

    if (messageReference && messageReference.message_id) {
        const replyMessageData = zycordDataStore.get(`channel-${messageReference.channel_id}-messages`)?.find(msg => msg.id === messageReference.message_id);
        if (replyMessageData) {
            const replyUsername = `@${replyMessageData.author.global_name || 'Unknown User'}`;
            const replyContent = replyMessageData.content || 'No content available';

            const zycordDMreplyUsername = document.createElement('div');
            zycordDMreplyUsername.className = 'zycord-DM-replyUsername';
            zycordDMreplyUsername.textContent = replyUsername;

            const zycordDMreplyContent = document.createElement('div');
            zycordDMreplyContent.className = 'zycord-DM-replyContent';
            zycordDMreplyContent.textContent = replyContent;

            directMessageReplyDisplayEl.append(zycordDMreplyUsername, zycordDMreplyContent);
        }
    }

    // Avatar
    const avatarEl = document.createElement('div');
    avatarEl.className = 'zycord-ChannelMessageAvatarContainer';
    if (avatarSrc) {
        const img = document.createElement('img');
        img.src = avatarSrc;
        img.className = 'zycord-AvatarImage';
        avatarEl.appendChild(img);
    }

    // Text container
    const textEl = document.createElement('div');
    textEl.className = 'zycord-ChannelMessageTextContainer';

    // Header
    const headerEl = document.createElement('div');
    headerEl.className = 'zycord-ChannelMessageHeaderContainer';

    const usernameEl = document.createElement('div');
    usernameEl.className = 'zycord-ChannelMessageUsername';
    usernameEl.textContent = username;
    if (tag) {
        const tagEl = document.createElement('div');
        tagEl.className = 'zycord-ApplicationTag';
        tagEl.textContent = tag;
        usernameEl.appendChild(tagEl);
    }

    const timestampEl = document.createElement('div');
    timestampEl.className = 'zycord-ChannelMessageTimestamp';
    timestampEl.textContent = formatUnixTimestamp(timestamp);

    headerEl.append(usernameEl, timestampEl);

    // Content container
    const contentEl = document.createElement('div');
    contentEl.className = 'zycord-ChannelMessageContentContainer';

    const mainContentEl = document.createElement('div');
    mainContentEl.className = 'zycord-ChannelMessageContent';
    mainContentEl.innerHTML = parseDiscordEmojis(content);

    contentEl.appendChild(mainContentEl);

    if (edited) {
        const editedTagEl = document.createElement('span');
        editedTagEl.className = 'zycord-ChannelMessageEdited';
        editedTagEl.textContent = ' (edited)';
        mainContentEl.appendChild(editedTagEl);
    }

    // Attachments
    if (attachments.length) {
        const attachmentsContainer = document.createElement('div');
        attachmentsContainer.className = 'zycord-ChannelAttachmentContent';

        attachments.forEach(file => {
            const ext = getFileExtension(file.url);
            let attachmentEl;

            if (ext === 'mp3' || ext === 'wav' || ext === 'ogg' || ext === 'flac') {
                attachmentEl = createCustomAudioPlayer(file.filename, file.url);
            } else {
                attachmentEl = document.createElement('img');
                attachmentEl.src = file.url;
                attachmentEl.className = 'zycord-MessageAttachment';
            }

            attachmentsContainer.appendChild(attachmentEl);
        });

        contentEl.appendChild(attachmentsContainer);
    }

    // Embed block
    if (embed.length) {
        const embedList = document.createElement('div');
        embedList.className = 'zycord-ChannelEmbedContainer';

        embed.forEach(({
            title,
            details
        }) => {
            if (title || details) {
                const embedContainer = document.createElement('div');
                embedContainer.className = 'zycord-ChannelEmbedContent';

                const embedTitle = document.createElement('div');
                embedTitle.className = 'zycord-EmbedTitle';
                embedTitle.textContent = title || '';

                const embedDetails = document.createElement('div');
                embedDetails.className = 'zycord-EmbedDetails';
                embedDetails.textContent = details || '';

                embedContainer.append(embedTitle, embedDetails);
                embedList.appendChild(embedContainer);
            }
        });

        contentEl.appendChild(embedList);
    }

    if (reactions.length) {
        const reactionList = document.createElement('div');
        reactionList.className = 'zycord-ChannelReactionList';

        reactions.forEach(({
            emoji,
            count
        }) => {
            const reactionEl = document.createElement('div');
            reactionEl.className = 'zycord-MessageReaction';

            const iconEl = createEmojiNode(emoji);

            const numberEl = document.createElement('div');
            numberEl.className = 'zycord-MessageReactionNumber';
            numberEl.textContent = count;

            reactionEl.append(iconEl, numberEl);
            reactionList.appendChild(reactionEl);
        });

        contentEl.appendChild(reactionList);
    }

    function createEmojiNode(emoji) {
        if (emoji.id) {
            const ext = emoji.animated ? 'gif' : 'png';
            const img = document.createElement('img');
            img.src = `https://cdn.discordapp.com/emojis/${emoji.id}.${ext}`;
            img.alt = emoji.name || '';
            img.className = 'zycord-MessageReactionIcon';
            img.loading = 'lazy';
            img.onerror = () => {
                img.src = ''; // optional fallback!
            };
            return img;
        } else {
            const native = document.createElement('div');
            native.textContent = emoji.name;
            native.className = 'zycord-MessageReactionIcon zycord-NativeEmoji';
            return native;
        }
    }

    textEl.append(headerEl, contentEl);
    directMessageContentDisplayEl.append(avatarEl, textEl);
    messageEl.append(directMessageReplyDisplayEl, directMessageContentDisplayEl);

    document.querySelector('.zycord-MessageContainerList').prepend(messageEl);

    attachSwipeToElement(messageEl, () => {
        createFocusContainer(messageId);
    });

    [usernameEl, avatarEl].forEach(el => {
        el.style.cursor = "pointer";
        el.addEventListener("click", () => {
            const messageAuthorId = zycordDataStore.get(`channel-${currentChannelId}-messages`)?.find(msg => msg.id === messageId)?.author?.id;
            showDiscordUserProfileOverlay(messageAuthorId);
        });
    });

    return messageEl;
}

function upsertMessage(messageData) {
    const { messageId, newMessageId } = messageData;

    const resolvedId = newMessageId || messageId;
    const existing = document.querySelector(`[data-message-id="${messageId}"]`);

    // Update the ID inside the original element before replacing
    if (existing && newMessageId) {
        existing.dataset.messageId = newMessageId;
    }

    // Overwrite messageId with newMessageId for rendering
    const updatedMessageData = {
        ...messageData,
        messageId: resolvedId
    };

    const newMessageEl = createMessageElement(updatedMessageData);

    if (existing) {
        existing.replaceWith(newMessageEl); // updates in place
    } else {
        const container = document.querySelector('.zycord-ChannelMessageList');
        if (container) {
            container.prepend(newMessageEl);
        } else {
            console.warn('Message container not found. Delaying render or aborting...');
        }
    }
}

// Now you can use discordAccountAuth safely
console.log("Authenticated with token:", discordAccountAuth);

discordAccountAuth || console.error("Account authorization token is not set.");

const zycordDataStore = (() => { const e = new Map; return { set: (t, a) => { e.set(t, a) }, get: t => e.get(t), has: t => e.has(t), delete: t => { e.delete(t) }, clear: () => { e.clear() } } })();
const zycordWebsocketEndpoint = 'wss://gateway.discord.gg/?v=10&encoding=json';
const zycordStateStore = (() => {
    let currentState = null;

    const replyContainer = document.querySelector('.zycord-MessageCreationReply');
    replyContainer.style.display = 'none';
    const removeButton = replyContainer?.querySelector('.zycord-ReplyRemoveBtn');

    const applyStateToUI = () => {
        if (currentState) {
            replyContainer.style.display = '';
            console.log(`Applying state: ${JSON.stringify(currentState)}`);
            replyContainer.querySelector('.zycord-CreationReplyContent').textContent = currentState.type === 1 ? `Replying to a message` : `Editing message`;
        } else {
            replyContainer.style.display = 'none';
        }
    };

    if (removeButton) {
        removeButton.addEventListener('click', () => {
            currentState = null;
            applyStateToUI();
        });
    }

    return {
        setState: (stateObj) => {
            currentState = stateObj;
            applyStateToUI();
        },
        clearState: () => {
            currentState = null;
            applyStateToUI();
        },
        getState: () => currentState
    };
})();

const zycordMediaStore = (() => {
    let mediaFiles = [];

    return {
        addFile: (file) => {
            mediaFiles.push(file);
        },
        removeFile: (targetFile) => {
            mediaFiles = mediaFiles.filter(file => file !== targetFile);
        },
        getFiles: () => mediaFiles,
        clearFiles: () => {
            mediaFiles = [];
        },
        hasFiles: () => mediaFiles.length > 0
    };
})();

let currentChannelId = "1259952741569269913";
let heartbeatInterval;
let zycordWebsocket;

const buttons = document.querySelectorAll('.zycord-NavigationButton');
const windows = document.querySelectorAll('.zycord-AppWindow > div');
const threadWindow = document.querySelector('.zycord-ThreadWindow');
const messageContainer = document.querySelector('.zycord-MessageContainer');

buttons.forEach(((s, a) => { s.addEventListener("click", (() => { buttons.forEach((s => s.classList.remove("active"))), s.classList.add("active"), windows.forEach((s => s.classList.remove("active-window"))), windows[a].classList.add("active-window") })) }));
buttons[0].classList.add('active');
windows[0].classList.add('active-window');

function hideLoad() {
    const loader = document.querySelector(".zycord-LoadContainer");
    if (!loader) return;

    // Fade out
    loader.style.transition = "opacity 1s ease";
    loader.style.opacity = "0";

    // Once faded, hide completely
    setTimeout(() => {
        loader.style.display = "none";
    }, 1000);
}

function showLoad() {
    const loader = document.querySelector(".zycord-LoadContainer");
    if (!loader) return;

    // Prepare for reveal
    loader.style.display = ""; // or "block", depending on your layout
    loader.style.opacity = "0";
    loader.style.transition = "opacity 1s ease";

    // Trigger fade-in
    requestAnimationFrame(() => {
        loader.style.opacity = "1";
    });
}

let startX = 0;
let startY = 0;
let currentX = 0;
let deltaX = 0;

threadWindow.addEventListener("touchstart", (t => { 1 === t.touches.length && (startX = t.touches[0].clientX, startY = t.touches[0].clientY, isDragging = !0, gestureLocked = null, messageContainer.style.transition = "none") }));
threadWindow.addEventListener("touchmove", (t => { if (!isDragging) return; const e = t.touches[0]; currentX = e.clientX; const r = e.clientY, a = currentX - startX, n = r - startY; if (gestureLocked || (Math.abs(a) > Math.abs(n) ? gestureLocked = "drag" : gestureLocked = "scroll"), "drag" === gestureLocked && (deltaX = startX - currentX, deltaX > 0)) { const e = Math.min(deltaX / window.innerWidth * 100, 100); messageContainer.style.transform = `translateX(${100 - e}vw)`, t.preventDefault() } }));
threadWindow.addEventListener("touchend", (() => { isDragging && "drag" === gestureLocked && (isDragging = !1, deltaX > .25 * window.innerWidth ? swipeMessageContainer(!0) : swipeMessageContainer(!1), gestureLocked = null) }));

messageContainer.addEventListener("touchstart", (t => { 1 === t.touches.length && (startX = t.touches[0].clientX, startY = t.touches[0].clientY, isDragging = !0, gestureLocked = null, messageContainer.style.transition = "none") }));
messageContainer.addEventListener("touchmove", (e => { if (!isDragging) return; const t = e.touches[0]; currentX = t.clientX; const r = t.clientY, n = currentX - startX, a = r - startY; if (gestureLocked || (gestureLocked = Math.abs(n) > Math.abs(a) ? "drag" : "scroll"), "drag" === gestureLocked && n > 0) { deltaX = n; const t = Math.min(deltaX / window.innerWidth * 100, 100); messageContainer.style.transform = `translateX(${t}vw)`, e.preventDefault() } }));
messageContainer.addEventListener("touchend", (() => { isDragging && "drag" === gestureLocked && (isDragging = !1, deltaX > .25 * window.innerWidth ? swipeMessageContainer(!1) : swipeMessageContainer(!0), gestureLocked = null) }));

let typingInterval = null;

function sendTypingNotification() { currentChannelId && discordAccountAuth && fetch(`https://discord.com/api/v9/channels/${currentChannelId}/typing`, { method: "POST", headers: { Authorization: discordAccountAuth } }).catch((n => console.error("Typing notification failed:", n))) }
function startTypingLoop() { !typingInterval && currentChannelId && discordAccountAuth && (sendTypingNotification(), typingInterval = setInterval((() => { document.getElementById("messageInput").value.trim() ? sendTypingNotification() : stopTypingLoop() }), 8e3)) }
function stopTypingLoop() { typingInterval && (clearInterval(typingInterval), typingInterval = null) }
document.getElementById("messageInput").addEventListener("input", (() => { document.getElementById("messageInput").value.trim().length > 0 ? startTypingLoop() : stopTypingLoop() }));

function replyMessageAction(specifiedMessageId) {
    const replyState = {
        type: 1,
        reference: specifiedMessageId
    };
    zycordStateStore.setState(replyState);
    const inputField = document.getElementById('messageInput');
    if (inputField) {
        inputField.value = '';
        inputField.focus();
    }
}
function editMessageAction(specifiedMessageId) {
    const replyState = {
        type: 2,
        reference: specifiedMessageId
    };
    zycordStateStore.setState(replyState);
    const inputField = document.getElementById('messageInput');
    const messageData = zycordDataStore.get(`channel-${currentChannelId}-messages`)?.find(msg => msg.id === specifiedMessageId);
    if (messageData) {
        if (inputField) {
            inputField.value = messageData.content || '';
            inputField.focus();
        }
    } else {
        console.warn(`No message data found for ID: ${specifiedMessageId}`);
    }
}
async function deleteMessage(specifiedMessageId) {
    if (!currentChannelId || !discordAccountAuth) {
        console.error("Missing currentChannelId or discordAccountAuth");
        return;
    }

    const focusContainer = document.querySelector('.zycord-FocusContainer');
    if (!focusContainer) {
        console.error("Focus container not found in DOM");
        return;
    }

    createFocusConfirmMenu({
        title: "Delete Message",
        description: "Are you sure you want to delete this message?",
        onConfirm: async () => {
            try {
                const response = await fetch(`https://discord.com/api/v9/channels/${currentChannelId}/messages/${specifiedMessageId}`, {
                    method: "DELETE",
                    headers: {
                        "Authorization": discordAccountAuth,
                        "Content-Type": "application/json"
                    }
                });

                if (!response.ok) {
                    console.error("Failed to delete message:", await response.text());
                } else {
                    console.log("Message deleted successfully");
                }
            } catch (error) {
                console.error("Error deleting message:", error);
            }
        },
        onCancel: () => console.log("Delete cancelled")
    });
}

async function sendMessage() {
    try {
        const inputField = document.getElementById('messageInput');
        const messageText = inputField.value.trim();
        const fileInput = document.getElementById('fileInput');
        const mediaFiles = zycordMediaStore.getFiles();
        const currentMessageState = zycordStateStore.getState();

        if (!messageText && mediaFiles.length === 0) return;
        if (!currentChannelId || !discordAccountAuth) return;

        let messageFetchMethod = currentMessageState && currentMessageState.type === 2 ? 'PATCH' : 'POST';
        let messageFetchUrl = currentMessageState && currentMessageState.type === 2
            ? `https://discord.com/api/v9/channels/${currentChannelId}/messages/${currentMessageState.reference}`
            : `https://discord.com/api/v9/channels/${currentChannelId}/messages`;

        const formData = new FormData();

        const payload = {
            content: messageText,
            tts: false
        };

        if (currentMessageState && currentMessageState.type === 1) {
            payload.message_reference = {
                message_id: currentMessageState.reference,
                channel_id: currentChannelId,
                fail_if_not_exists: false
            };
        }

        formData.append('payload_json', JSON.stringify(payload));

        if (!currentMessageState || (currentMessageState.type !== 2)) {
            mediaFiles.forEach((file, index) => {
                formData.append(`files[${index}]`, file);
            });
        }

        // Optional local message ID, used for client-side rendering
        let localMessageId;

        try {
            localMessageId = crypto.randomUUID();
        } catch (error) {
            const unixTs = Math.floor(Date.now() / 1000); // UNIX timestamp in seconds
            const tsBuffer = new Uint8Array(4); // 32-bit timestamp
            new DataView(tsBuffer.buffer).setUint32(0, unixTs, false); // big-endian
            localMessageId = btoa(String.fromCharCode(...tsBuffer));
        }

        const pendingMessage = createMessageElement({
            messageReference: currentMessageState && currentMessageState.type === 1 ? {
                message_id: currentMessageState.reference,
                channel_id: currentChannelId
            } : {},
            edited: false,
            messageId: localMessageId,
            username: 'You',
            tag: '',
            timestamp: Math.floor(Date.now() / 1000),
            content: messageText,
            attachments: mediaFiles.map(file => ({
                url: URL.createObjectURL(file),
                filename: file.name
            })),
            embed: [],
            reactions: [],
            avatarSrc: 'https://cdn.discordapp.com/embed/avatars/0.png'
        }).classList.add('zycord-ChannelMessagePending');

        zycordStateStore.clearState();
        inputField.value = '';
        fileInput.value = ''; // Clear file input
        zycordMediaStore.clearFiles();
        document.getElementById('zycord-MediaPreviewContainer').innerHTML = '';
        document.getElementById('zycord-MediaPreviewContainer').style.display = 'none';

        try {
            const response = await fetch(messageFetchUrl, {
                method: messageFetchMethod,
                headers: {
                    'Authorization': discordAccountAuth
                },
                body: formData
            });

            const result = await response.json();

            if (response.ok) {
                const messageAlreadyExists = !!document.querySelector(`[data-message-id="${result.id}"]`);
                if (!messageAlreadyExists) {
                    upsertMessage({
                        messageReference: currentMessageState && currentMessageState.type === 1 ? {
                            message_id: currentMessageState.reference,
                            channel_id: currentChannelId
                        } : {},
                        edited: false,
                        messageId: localMessageId,
                        newMessageId: result.id,
                        username: result.author.global_name || 'Unknown',
                        tag: result.author.bot ? 'app' : '',
                        timestamp: Math.floor(new Date(result.timestamp).getTime() / 1000),
                        content: result.content || '',
                        attachments: result.attachments || [],
                        embed: result.embeds || [],
                        reactions: result.reactions || [],
                        avatarSrc: result.author.avatar
                            ? `https://cdn.discordapp.com/avatars/${result.author.id}/${result.author.avatar}.png?size=512`
                            : 'https://cdn.discordapp.com/embed/avatars/0.png'
                    });
                } else {
                    if (pendingMessage) {
                        pendingMessage.remove();
                    } else {
                        const pendingMessageDocument = document.querySelector(`[data-message-id="${localMessageId}"]`);
                        if (pendingMessageDocument) {
                            pendingMessageDocument.remove();
                        }
                    }
                }
            } else {
                console.error('Discord API error:', result);
            }
        } catch (error) {
            console.error('Message send failed:', error);
        }
    } catch (error) {
        console.error(JSON.stringify(error));
    }
}
async function fetchAndRenderMessages() { const e = `channel-${currentChannelId}-messages`; if (zycordDataStore.has(e)) { const s = zycordDataStore.get(e); renderMessages(s) } else try { const s = await fetch(`https://discord.com/api/v9/channels/${currentChannelId}/messages?limit=50`, { method: "GET", headers: { Authorization: discordAccountAuth, "Content-Type": "application/json" } }); if (!s.ok) throw new Error("Failed to fetch messages"); const t = await s.json(); zycordDataStore.set(e, t), t.reverse(), renderMessages(t) } catch (e) { console.error("Error loading messages:", e) } }
async function listDMChannels() { const t = await fetch("https://discord.com/api/v10/users/@me/channels", { method: "GET", headers: { Authorization: discordAccountAuth, "Content-Type": "application/json" } }); if (!t.ok) throw new Error(`HTTP error ${t.status}`); return await t.json() }
async function renderDmListFromAPI() {
    try {
        const threadWindow = document.querySelector(".zycord-ThreadWindow");
        if (threadWindow) {
            threadWindow.innerHTML = ""; // Clear previous DM components
        }

        const channels = await listDMChannels();

        channels.sort((a, b) => {
            if (!a.last_message_id) return 1;
            if (!b.last_message_id) return -1;

            const aMsgId = BigInt(a.last_message_id);
            const bMsgId = BigInt(b.last_message_id);

            if (aMsgId > bMsgId) return -1;
            if (aMsgId < bMsgId) return 1;
            return 0;
        });

        channels.forEach(channel => {
            if (channel.type !== 1) return;

            const recipient = channel.recipients?.[0];
            if (!recipient) return;

            const avatarUrl = recipient.avatar
                ? `https://cdn.discordapp.com/avatars/${recipient.id}/${recipient.avatar}.png?size=512`
                : "https://cdn.discordapp.com/embed/avatars/0.png";

            createDirectMessage({
                userId: recipient.id,
                channelId: channel.id,
                avatarUrl: avatarUrl,
                username: recipient.global_name || recipient.username,
                status: "",
                accountType: recipient.bot ? "app" : "user"
            });
        });
    } catch (error) {
        console.error("Failed to fetch DM list:", error);
    }
}
function parseDiscordEmojis(text) {
    // Step 1: Escape all HTML to prevent injection
    const escapedText = text
        .replace(/&/g, "&amp;") // Must go first!
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

    // Step 2: Emoji size class logic
    const hasText = escapedText.replace(/&lt;a?:[\w]+:\d+&gt;/g, "").trim().length > 0;
    const sizeClass = hasText ? "inline-emoji" : "inline-emoji inline-emoji-no-text";

    // Step 3: Parse Discord emoji markup
    let parsed = escapedText
        .replace(/&lt;a:([\w]+):(\d+)&gt;/g, (_, name, id) => {
            return `<img src="https://cdn.discordapp.com/emojis/${id}.gif" alt="${name}" class="zycord-emoji ${sizeClass}">`;
        })
        .replace(/&lt;:([\w]+):(\d+)&gt;/g, (_, name, id) => {
            return `<img src="https://cdn.discordapp.com/emojis/${id}.png" alt="${name}" class="zycord-emoji ${sizeClass}">`;
        });

    // Step 4: Parse markdown-style Discord formatting
    parsed = parsed
        .replace(/\*\*(.*?)\*\*/g, `<span class="zycord-bold">$1</span>`)
        .replace(/\*(.*?)\*/g, `<span class="zycord-italic">$1</span>`)
        .replace(/__(.*?)__/g, `<span class="zycord-underline">$1</span>`)
        .replace(/~~(.*?)~~/g, `<span class="zycord-strikethrough">$1</span>`)
        .replace(/`([^`]+?)`/g, `<span class="zycord-code">$1</span>`)
        .replace(/([\u{1F300}-\u{1FAFF}])/gu, '<span class="zycord-emoji zycord-unicode-emoji">$1</span>');

    return parsed;
}
function renderMessages(messages) {
    const container = document.querySelector(".zycord-MessageContainerList");
    if (!container) {
        console.warn("ThreadWindow element not found");
        return;
    }

    container.innerHTML = "";

    const messageMap = new Map();
    messages.forEach(message => {
        messageMap.set(message.id, message);
    });

    messages.forEach(message => {
        const isRenderableType = message.type === 0 || message.type === 19;
        if (!isRenderableType || !message.author) return;

        if (message.message_snapshots && message.message_snapshots.length > 0) {
            message.message_snapshots.forEach(snapshot => {
                if (snapshot.message.type === 19) {
                    createMessageElement({
                        messageReference: message.message_reference || {},
                        edited: !!message.edited_timestamp,
                        messageId: message.id,
                        username: message.author?.global_name || "Unknown",
                        tag: message.author?.bot ? "app" : "",
                        timestamp: snapshot.message.timestamp
                            ? Math.floor(new Date(message.timestamp).getTime() / 1000)
                            : Math.floor(Date.now() / 1000),
                        content: snapshot.message.content || "",
                        attachments: snapshot.message.attachments || [],
                        embed: snapshot.message.embeds || [],
                        reactions: message.reactions || [],
                        avatarSrc: message.author.avatar
                            ? `https://cdn.discordapp.com/avatars/${message.author.id}/${message.author.avatar}.png?size=512`
                            : "https://cdn.discordapp.com/embed/avatars/0.png"
                    });
                }
            });
        } else {
            createMessageElement({
                messageReference: message.message_reference || {},
                edited: !!message.edited_timestamp,
                messageId: message.id,
                username: message.author?.global_name || "Unknown",
                tag: message.author?.bot ? "app" : "",
                timestamp: message.timestamp
                    ? Math.floor(new Date(message.timestamp).getTime() / 1000)
                    : Math.floor(Date.now() / 1000),
                content: message.content || "",
                attachments: message.attachments || [],
                embed: message.embeds || [],
                reactions: message.reactions || [],
                avatarSrc: message.author.avatar
                    ? `https://cdn.discordapp.com/avatars/${message.author.id}/${message.author.avatar}.png?size=512`
                    : "https://cdn.discordapp.com/embed/avatars/0.png"
            });
        }
    });
}
function swipeMessageContainer(e) { const t = document.querySelector(".zycord-MessageContainer"); t.style.transition = "transform 0.3s ease", t.style.transform = e ? "translateX(0)" : "translateX(100vw)" }
function setDirectMessageUnread(channelId, isUnread) {
    // Update unread styling on matching direct message containers
    document.querySelectorAll(`.zycord-directMessageContainer[data-channel-id="${channelId}"]`)
        .forEach(container => {
            if (isUnread) {
                container.classList.add("zycord-directMessageTypeUnread");
            } else {
                container.classList.remove("zycord-directMessageTypeUnread");
            }
        });

    // Check if there are any unread messages present
    const hasUnread = document.querySelector(".zycord-directMessageTypeUnread") !== null;

    // Update visibility on all navigation indicators
    document.querySelectorAll(".zycord-NavigationNew")
        .forEach(indicator => {
            indicator.style.display = hasUnread ? "block" : "none";
        });
}
function createDirectMessage({
    userId,
    channelId,
    avatarUrl,
    username,
    status,
    accountType = "user"
}) {
    const container = document.createElement("div");
    container.className = "zycord-directMessageContainer";
    container.dataset.channelId = channelId;
    container.dataset.userId = userId;
    container.style.cursor = "pointer";
    container.addEventListener("click", () => {
        currentChannelId = channelId;
        document.querySelector(".zycord-directNavigationUsername").textContent = username;
        fetchAndRenderMessages();
        setDirectMessageUnread(channelId, false);
        swipeMessageContainer(true);
        updateStatusMessageDebounced(`Reading message from ${username}`, zycordWebsocket);
    });

    const avatarWrapper = document.createElement("div");
    avatarWrapper.className = "zycord-directMessageAvatar";

    const avatarImage = document.createElement("img");
    avatarImage.className = "zycord-directMessageAvatarDisplay";
    avatarImage.src = avatarUrl;

    if (accountType && accountType !== "user") {
        avatarWrapper.appendChild(avatarImage);
    } else {
        const statusContainer = document.createElement("div");
        statusContainer.className = "zycord-StatusDM";

        const statusDisplay = document.createElement("div");
        statusDisplay.className = "zycord-StatusDisplayDM zycord-StatusTypeOffline";
        statusDisplay.dataset.userId = userId;

        statusContainer.appendChild(statusDisplay);
        avatarWrapper.appendChild(avatarImage);
        avatarWrapper.appendChild(statusContainer);
    }

    const contentWrapper = document.createElement("div");
    contentWrapper.className = "zycord-directMessageContent";

    const usernameDisplay = document.createElement("div");
    usernameDisplay.className = "zycord-directMessageUsername";
    usernameDisplay.textContent = username;

    const statusText = document.createElement("div");
    statusText.className = "zycord-directMessageStatus";
    statusText.textContent = status;
    statusText.dataset.userId = userId;

    contentWrapper.appendChild(usernameDisplay);

    if (accountType && accountType !== "user") {
        const tag = document.createElement("div");
        tag.className = "zycord-ApplicationTag";
        tag.textContent = accountType;
        usernameDisplay.appendChild(tag);
    }

    contentWrapper.appendChild(statusText);
    container.appendChild(avatarWrapper);
    container.appendChild(contentWrapper);

    const threadWindow = document.querySelector(".zycord-ThreadWindow");
    if (threadWindow) {
        threadWindow.appendChild(container);
    } else {
        console.warn("ThreadWindow element not found");
    }
}
function getStatusClassFromPresence(status) {
    const statusMap = {
        online: "zycord-StatusTypeOnline",
        offline: "zycord-StatusTypeOffline",
        idle: "zycord-StatusTypeIdle",
        dnd: "zycord-StatusTypeDnd"
    };

    const statusKey = status?.toLowerCase?.();
    const className = statusMap[statusKey];

    if (!className) {
        console.warn(`Unknown status: ${status}`);
        return null;
    }

    return className;
}

let currentStatusDebounce = false;
let currentStatusMessage = "";

function updateStatusMessageDebounced(newStatus, currentWebSocket) {
    currentStatusMessage = newStatus;

    if (currentStatusDebounce) {
        return;
    }
    resetIdleTimer(newStatus, currentWebSocket);
    currentStatusDebounce = true;
    setTimeout(() => {
        currentStatusDebounce = false;
        if (newStatus !== currentStatusMessage) {
            updateStatusMessageDebounced(currentStatusMessage, currentWebSocket);
        }
    }, 10000);
}

let idleTimer;

const idleStateLabel = "Idling...";

function resetIdleTimer(currentState, currentWebSocket) {
    clearTimeout(idleTimer);
    updateStatusMessage(currentState, currentWebSocket);

    idleTimer = setTimeout(() => {
        updateStatusMessage(idleStateLabel, currentWebSocket);
    }, 120000);
}

let firstUsedTimestamp;

function updateStatusMessage(currentState, currentWebSocket) {
    if (
        currentWebSocket &&
        typeof currentWebSocket.send === "function" &&
        currentWebSocket.readyState === WebSocket.OPEN
    ) {
        // Set start timestamp if not already set
        if (!firstUsedTimestamp) {
            firstUsedTimestamp = Math.floor(Date.now()); // Unix timestamp in seconds
        }

        const activities = [{
            application_id: "1396981585932455936",
            name: "Zycord",
            type: 0,
            state: currentState || "Unknown",
            timestamps: {
                start: firstUsedTimestamp
            }
        }];

        const status = 'idle';

        currentWebSocket.send(JSON.stringify({
            op: 3,
            d: {
                since: null,
                activities,
                status,
                afk: true
            }
        }));

        updateActivityData({
            user: { id: "827356967688339458", activities },
            status
        });
    } else {
        console.warn("WebSocket not ready for sending status message.");
    }
}

function updateStatusIcons(userId, status, statusText = "") {
    const activity = zycordDataStore.get(`activities-${userId}`);

    // Map status string to corresponding class name
    const statusClass = {
        online: "zycord-StatusTypeOnline",
        offline: "zycord-StatusTypeOffline",
        idle: "zycord-StatusTypeIdle",
        dnd: "zycord-StatusTypeDnd"
    }[status.toLowerCase()];

    // Warn if status is unknown
    if (!statusClass) {
        console.warn(`Unknown status: ${status}`);
        return;
    }

    // Update status icon classes for matching elements
    document.querySelectorAll(`.zycord-StatusDisplayDM[data-user-id="${userId}"]`)
        .forEach(element => {
            element.classList.forEach(cls => {
                if (cls.startsWith("zycord-StatusType")) {
                    element.classList.remove(cls);
                }
            });
            element.classList.add(statusClass);
        });

    // Update direct message status text
    document.querySelectorAll(`.zycord-directMessageStatus[data-user-id="${userId}"]`)
        .forEach(element => {
            element.textContent = statusText;
        });

    if (Array.isArray(activity?.activities) && activity.activities.length > 0) {
        activity.activities.forEach(act => {
            upsertActivityElement(act);
        });
    }
}
function updateActivityData(t) { const i = t?.user?.id; if (!i) return; const s = t?.status ?? "offline", a = Array.isArray(t?.user?.activities) ? t.user.activities : []; zycordDataStore.set(`activities-${i}`, { status: s, activities: a }); let e = ""; a.forEach((t => { 4 === t.type && "custom" === t.id && (e = t.state || t.name || "") })), updateStatusIcons(i, s, e) }
function initializeWebSocket() {
    const socket = new WebSocket(zycordWebsocketEndpoint);

    // When connection opens, authenticate and begin heartbeat logic
    socket.addEventListener("open", () => {
        currentlyReconnecting = false;

        socket.send(JSON.stringify({
            op: 2,
            d: {
                token: discordAccountAuth,
                properties: {
                    os: "Linux",
                    browser: "Chrome",
                    device: "web"
                }
            }
        }));

        updateLoadStatus('websocketConnection', true);
    });

    // Handle incoming WebSocket messages
    socket.addEventListener("message", (event) => {
        try {
            const { op, t: type, d: data } = JSON.parse(event.data);
            const userId = data?.user?.id;

            // Start heartbeat interval when server sends HELLO
            if (!currentlyReconnecting && op === 10) {
                startHeartbeat(socket, data.heartbeat_interval);
                updateLoadStatus('websocketHeartbeat', true);
                return;
            }

            // Handle READY: update user status and unread messages
            if (type === "READY") {
                if (userId) {
                    updateActivityData({ user: { id: userId, activities: [] }, status: "online" });
                }

                data?.presences?.forEach(({ user, status = "offline", activities }) => {
                    updateActivityData({
                        user: { id: user.id, activities },
                        status
                    });
                });

                const readState = data?.read_state;
                const unreadChannels = readState ? Object.values(readState).filter(({ mention_count, id, last_message_id }) =>
                    typeof mention_count === "number" && mention_count > 0 &&
                    typeof id === "string" && typeof last_message_id === "string"
                ) : [];
                unreadChannels.forEach(({ id: channelId, last_message_id: messageId }) => {
                    setDirectMessageUnread(channelId, true);
                });
                updateLoadStatus('websocketReady', true);
            }
            if (type === "PRESENCE_UPDATE") {
                const presenceUserId = data?.user?.id;
                const status = data?.status ?? "offline";
                const activities = Array.isArray(data?.activities) ? data.activities : [];
                if (presenceUserId) {
                    updateActivityData({
                        user: { id: presenceUserId, activities },
                        status
                    });
                }
            }
            // Handle MESSAGE_CREATE: mark message as unread if not current channel
            if (type === "MESSAGE_CREATE" && data?.channel_id && data?.id && currentChannelId !== data.channel_id) {
                setDirectMessageUnread(data.channel_id, true);
            }
            if (type === "MESSAGE_ACK") {
                console.log("Received MESSAGE_ACK:", data);
                const { channel_id, mention_count, message_id } = data || {};
                if (!channel_id) return;
                console.log(`Message ACK received for channel ${channel_id} with mention count ${mention_count}`);
                if (typeof mention_count === "number" && mention_count > 0) {
                    console.log(`Unread messages for channel ${channel_id}: ${mention_count}`);
                    setDirectMessageUnread(channel_id, true);
                } else {
                    console.log(`No unread messages for channel ${channel_id}, clearing state.`);
                    setDirectMessageUnread(channel_id, false);
                }
            }

            if (type === "MESSAGE_CREATE" && data?.channel_id && data?.id) {
                const container = document.querySelector(
                    `.zycord-directMessageContainer[data-channel-id="${data.channel_id}"]`
                );

                if (container) {
                    const parent = container.parentElement;
                    if (parent) {
                        parent.prepend(container);
                    }
                }
            }

            if (type === "MESSAGE_CREATE" && data?.channel_id && data?.id) {
                const storeKey = `channel-${data.channel_id}-messages`;
                if (zycordDataStore.has(storeKey)) {
                    const cachedMessages = zycordDataStore.get(storeKey);
                    if (!cachedMessages.some(msg => msg.id === data.id)) {
                        cachedMessages.push(data);
                        zycordDataStore.set(storeKey, cachedMessages);
                    }
                }
            }

            if (
                type === "MESSAGE_DELETE" &&
                data?.channel_id &&
                data?.id
            ) {
                const storeKey = `channel-${data.channel_id}-messages`;

                if (zycordDataStore.has(storeKey)) {
                    const cachedMessages = zycordDataStore.get(storeKey) || [];
                    const updatedCache = cachedMessages.filter(msg => msg.id !== data.id);

                    // Update the data store
                    zycordDataStore.set(storeKey, updatedCache);

                    // Optionally remove from UI if it's visible
                    if (currentChannelId === data.channel_id) {
                        removeMessage(data.id); // assumes you have a UI handler like upsertMessage()
                    }

                    console.log(`🗑️ Message deleted: ${data.id}`);
                }
            }

            if (
                type === "MESSAGE_UPDATE" &&
                data?.channel_id &&
                data?.id
            ) {
                const storeKey = `channel-${data.channel_id}-messages`;
                if (zycordDataStore.has(storeKey)) {
                    let existingMsg = null;

                    // Get existing message from store
                    const cachedMessages = zycordDataStore.get(storeKey) || [];
                    existingMsg = cachedMessages.find(msg => msg.id === data.id);
                    console.log("Cached messages:", JSON.stringify(existingMsg, null, 2));

                    // Merge updated fields with fallbacks
                    const mergedData = {
                        messageReference: data.message_reference,
                        edited: !!data.edited_timestamp || existingMsg?.edited_timestamp || false,
                        messageId: data.id,
                        username: data.author?.global_name ?? existingMsg?.username ?? 'Unknown',
                        tag: data.author?.bot ? 'app' : existingMsg?.tag ?? '',
                        timestamp: data.timestamp
                            ? Math.floor(new Date(data.timestamp).getTime() / 1000)
                            : existingMsg?.timestamp ?? Math.floor(Date.now() / 1000),
                        content:
                            data.hasOwnProperty('content') && data.content !== null
                                ? data.content
                                : existingMsg?.content ?? '',
                        attachments: Array.isArray(data.attachments)
                            ? data.attachments.map(att => att.url)
                            : existingMsg?.attachments ?? [],
                        embed: Array.isArray(data.embeds)
                            ? data.embeds
                            : existingMsg?.embed ?? [],
                        reactions: Array.isArray(data.reactions)
                            ? data.reactions
                            : existingMsg?.reactions ?? [],
                        avatarSrc: data.author?.avatar
                            ? `https://cdn.discordapp.com/avatars/${data.author.id}/${data.author.avatar}.png?size=512`
                            : existingMsg?.avatarSrc ?? 'https://cdn.discordapp.com/embed/avatars/0.png'
                    };

                    // Update the visible UI
                    if (currentChannelId === data.channel_id) {
                        upsertMessage(mergedData);
                    }

                    const normalizedContent = JSON.parse(JSON.stringify(existingMsg));

                    normalizedContent.embeds = mergedData.embed;
                    normalizedContent.attachments = mergedData.attachments;
                    normalizedContent.content = mergedData.content;
                    normalizedContent.edited = mergedData.edited;
                    normalizedContent.messageId = mergedData.messageId;
                    normalizedContent.username = mergedData.username;
                    normalizedContent.reactions = mergedData.reactions;

                    // Replace message in datastore using a new array reference
                    const updatedCache = [...cachedMessages];
                    const index = updatedCache.findIndex(msg => msg.id === data.id);

                    if (index !== -1) {
                        updatedCache[index] = normalizedContent;
                    } else {
                        updatedCache.push(normalizedContent);
                    }

                    zycordDataStore.set(storeKey, updatedCache);
                }
            }

            if (type === "MESSAGE_CREATE" && data?.channel_id && data?.id && currentChannelId === data.channel_id) {
                const messageAlreadyExists = !!document.querySelector(`[data-message-id="${data.id}"]`);
                if (!messageAlreadyExists) {
                    createMessageElement({
                        messageReference: data.message_reference,
                        edited: data.edited_timestamp ? true : false,
                        messageId: data.id,
                        username: data.author?.global_name || 'Unknown',
                        tag: data.author?.bot ? 'app' : '',
                        timestamp: data.timestamp ? Math.floor(new Date(data.timestamp).getTime() / 1000) : Math.floor(Date.now() / 1000),
                        content: data.content || '',
                        attachments: data.attachments || [],
                        embed: data.embeds || [],
                        reactions: data.reactions || [],
                        avatarSrc: `https://cdn.discordapp.com/avatars/${data.author.id}/${data.author.avatar}.png?size=512` || 'https://cdn.discordapp.com/embed/avatars/0.png'
                    });
                }
            }
        } catch (error) {
            console.error("WebSocket message error:", error.message);
        }
    });
    socket.addEventListener("close", () => {
        if (!currentlyReconnecting) {
            currentlyReconnecting = true;
            updateLoadStatus('channelList', false);
            updateLoadStatus('websocketConnection', false);
            updateLoadStatus('websocketHeartbeat', false);
            updateLoadStatus('websocketReady', false);
            zycordDataStore.clear();
            stopHeartbeat();
            reconnect();
        }
    });
    socket.addEventListener("error", () => {
        if (!currentlyReconnecting) {
            currentlyReconnecting = true;
            updateLoadStatus('channelList', false);
            updateLoadStatus('websocketConnection', false);
            updateLoadStatus('websocketHeartbeat', false);
            updateLoadStatus('websocketReady', false);
            zycordDataStore.clear();
            stopHeartbeat();
            reconnect();
        }
    });

    return socket;
}
function startHeartbeat(t, e) { heartbeatInterval && clearInterval(heartbeatInterval), heartbeatInterval = setInterval((() => { t.send(JSON.stringify({ op: 1, d: null })) }), e) }
function stopHeartbeat() { heartbeatInterval && clearInterval(heartbeatInterval) }
async function reconnect() {
    await new Promise(resolve => setTimeout(resolve, 5000));
    await renderDmListFromAPI();
    updateLoadStatus('channelList', true);
    zycordWebsocket = initializeWebSocket();
}
async function start() {
    await new Promise(resolve => setTimeout(resolve, 5000));
    await renderDmListFromAPI();
    updateLoadStatus('channelList', true);
    zycordWebsocket = initializeWebSocket();
}
start();
