// chrome.contextMenus.onClicked.addListener(openURL); // deprecated
chrome.commands.onCommand.addListener(openShortcut)

function openURL(info) { // deprecated
    let link = info.linkUrl;
    checkValidity(link, info.menuItemId)
};

async function openShortcut(command) {
    let queryOptions = {active: true, lastFocusedWindow: true};
    let [tab] = await chrome.tabs.query(queryOptions); // returns a namedtuple-esque thing called an object
    
    checkValidity(command, tab.url, tab.id)
};

function checkValidity(event, link, id) {
    if (!returnErrors(link)) {
        switch(event) {
            case "open-embed":
                openEmbed(link, id);
                break;
            case "open-cookie":
                openCookie(link, id);
                break;
        }
    }
};

function openEmbed(link, id) {
    if (link.includes("&t=")) {
        link = link.substring(0, link.length - 1)
        link = link.replace("&t=", "?start=")
    }

    replaceVideo(link.replace("watch?v=", "embed/"), id)
};

function openCookie(link, id) {
    replaceVideo(link.replace("youtube.com", "yout-ube.com"), id)
};

function replaceVideo(newLink, id) {
    chrome.scripting.executeScript({
        target: {tabId: id},
        func: (videoLink) => {
            const blockedVideo = document.getElementsByTagName("ytd-enforcement-message-view-model")[0];

            if (blockedVideo) { // checks if blockedVideo is truthy, in this case blockedVideo either exists or equals undefined
                const newVid = document.createElement("iframe");
                newVid.id = "replaced-video";
                newVid.src = videoLink;
                newVid.width = blockedVideo.offsetWidth;
                newVid.height = blockedVideo.offsetHeight;

                blockedVideo.replaceWith(newVid)

                window.resizeVideo = function() { // creates a resizeVideo function within the scope of the webpage
                    const container = newVid.parentElement;

                    newVid.width = container.offsetWidth;
                    newVid.height = container.offsetHeight;
                }

                // ResizeObservers check for resizing within an html document/webpage, not just the entire window/tab
                const resizeObserver = new ResizeObserver(window.resizeVideo);
                resizeObserver.observe(newVid.parentElement)
            }
        },
        args: [newLink] // must pass link as a argument to script function because 
                        // you arent supposed to pass variables directly into scriptijng
    });
}

function returnErrors(link) {
    if (link.indexOf("youtube") == -1) {
        console.log("Error. \"" + link + "\" is not a youtube link. Try again");
        return null;
    }

    if (link.indexOf("shorts") != -1) {
        console.log("Error. Youtube Shorts are not supproted.");
        return null;
    }

    if (link == "https://www.youtube.com/") {
        console.log("Error. Youtube homepage is not a video");
        return null;
    }

    if (link.indexOf("https://www.youtube.com/@") != -1) {
        console.log("Error. Youtube channel homepages are not videos");
        return null;
    }

    if (link.indexOf("-nocookie") != -1) {
        console.log("Error. Video is already a no-cookie embed");
        return null;
    }

    if (link.indexOf("/embed/") != -1) {
        console.log("Error. Video is already an embed");
        return null;
    }

    if (link.indexOf("watch?v=") == -1) {
        console.log("Error. URL is not a Youtube video");
        return null;
    }
}

// onInstalled makes it so creating elements only happens when
//  you initially open a page or reload a page, removing the
//  need to use remove or removeAll functions of contextMenus

// REMOVED FOR NOW AS I HAVE NO NEED FOR A CONTEXTMENU OPTION
// DEPRECATED UNTIL FURTHER NOTICE
// chrome.runtime.onInstalled.addListener(function() {
//     chrome.contextMenus.create({
//         title: "Yt-emb",
//         contexts: ["link"],
//         id: "contextTitle"
//     });

//     chrome.contextMenus.create({
//         title: "Open as Embed",
//         contexts: ["link"],
//         parentId: "contextTitle",
//         id: "embed"
//     });

//     chrome.contextMenus.create({
//         title: "Open as No-Cookie",
//         contexts: ["link"],
//         parentId: "contextTitle",
//         id: "cookie"
//     });
// });