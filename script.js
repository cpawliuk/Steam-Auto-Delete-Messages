// ==UserScript==
// @name         Steam Auto Message Deleter
// @website      https://github.com/cpawliuk/Steam-Auto-Message-Deleter
// @version      1.0
// @description  Simple script to auto delete messages on Steam.
// @author       Christopher Pawliuk
// @match        *://steamcommunity.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=steamcommunity.com
// @grant        none
// ==/UserScript==

window.setTimeout = window.setTimeout.bind(window);
window.setInterval = window.setInterval.bind(window);

// VARS STORED
let savedInfo = {
    currentpage : null,
    lastpage : null,
    scriptstarted : false,
    scriptdone : false,
    readytodelete: false,
    urllist : [],
    postsfound: 0,
    deletedposts : 0
};

window.ResetScript = () => {
    localStorage.clear();
    window.location.reload();
}

function SaveToLocalStorage() {
    localStorage.setItem("savedinfo", JSON.stringify(savedInfo));
}

function GetCurrentPageFromURL() {
    try {
        let param = "p";
        param.replace(/[\[\]]/g, '\\$&');

        const regex = new RegExp('[?&]' + param + '(=([^&#]*)|&|#|$)');
        const pulledPageNumber = regex.exec(window.location.href);

        return Number(pulledPageNumber[2]);
    } catch (e) {
        console.log(e);

        return Number(1);
    }
}

function GetLastPageNumber() {
    let lastPageCheck = document.querySelectorAll(".pagelink");
    lastPageCheck = Number(lastPageCheck[lastPageCheck.length - 1].textContent);

    try {
        const lastPageExtraCheck = document.querySelector(".pagebtn.disabled").textContent;

        if (lastPageExtraCheck === ">") {
            lastPageCheck = lastPageCheck + 1;
        }
    } catch (e) {
        console.log(e);
    }

    return Number(lastPageCheck);
}

function SetMaxPageNumber() {
    const minPageNumber = GetCurrentPageFromURL();
    let maxPageNumber = minPageNumber + 9;
    const lastPageNumber = GetLastPageNumber();

    if (maxPageNumber < minPageNumber) {
        maxPageNumber = minPageNumber;
    }

    if (maxPageNumber > lastPageNumber) {
        maxPageNumber = lastPageNumber;
    }

    return maxPageNumber;
}

window.StartScript = () => {
    if (savedInfo.scriptstarted === false) {
        localStorage.clear();
        savedInfo.scriptstarted = true;

        // --- dont repeat will fix (put code in a function if using over and over) ---
        if (savedInfo.scriptstarted === true && savedInfo.readytodelete === false) {
            GrabPostURLsProcess();
        } else if (savedInfo.scriptstarted === true && savedInfo.readytodelete === true) {
            DeletePostsProcess();
        }
    }
};

window.CheckBeforeStarting = () => {
    let goodToStart = true; // Set to true, then do a few checks, if one fails this will be set to false, otherwise run the script.
    const firstPage = Number(document.querySelector("#first-page").value);
    const lastPage = Number(document. querySelector("#last-page").value);

    const lastPageCheck = GetLastPageNumber();

    if (lastPage > lastPageCheck) {
        goodToStart = false;
    }
    if (lastPage < 1 || lastPage < firstPage)
    {
        goodToStart = false;
    } else if (firstPage < 1 || firstPage > lastPage) {
        goodToStart = false;
    }


    if (goodToStart === false) {
        alert("Please correct your first and/or last page values.");
        return;
    }


    // Set current and last page
    savedInfo.currentpage = firstPage;
    savedInfo.lastpage = lastPage;

    window.StartScript();
};

const newElement = document.createElement("div");
newElement.id = "script-ui";
newElement.style.color = "white";
newElement.style.backgroundColor = "black";
newElement.innerHTML = `<span>Running Steam Message Delete Script -> Please Wait . . .</span>`;
document.querySelector("body").prepend(newElement);
window.scrollTo(0, 0);

addEventListener("load", function() { setTimeout(RunScript, 3000); }); // Set the timeout higher if needed due to the client side delay in loading the components.

function GrabURLsOnPage() {
    const tempList = Array.from(document.querySelectorAll(".post_searchresult_simplereply"));
    const linkList = tempList.map((item) => item.getAttribute("onclick").substring(17, item.getAttribute("onclick").length - 1));

    // Filter so we only get posts and not topics created.
    const filteredLinkList = linkList.filter(url => url.includes("#"));

    return filteredLinkList;
}

function GrabPostURLsProcess() {
    // Get all the URLs on this page
    savedInfo.urllist.push(...GrabURLsOnPage());
    savedInfo.postsfound = savedInfo.postsfound + savedInfo.urllist.length;

    // If not on the last page, move to the next page
    if (savedInfo.currentpage != savedInfo.lastpage) {
        savedInfo.currentpage = savedInfo.currentpage + 1;

        SaveToLocalStorage();

        let nextPageButton = Array.from(document.querySelectorAll(".pagebtn"));
        nextPageButton = nextPageButton[nextPageButton.length - 1];
        nextPageButton.click();
    } else {
        savedInfo.readytodelete = true;

        SaveToLocalStorage();

        window.location.href = savedInfo.urllist[savedInfo.urllist.length - 1];
    }
}

function DeletePostsProcess() {
    // Skip Deleting if the thread is locked.
    let skipDelete = false;

    try {
        if (document.querySelector(".forum_topic_locked_notice").textContent.includes("locked") == true) {
            skipDelete = true;
        }
    } catch (e) {
        console.log(e);
    }

    newElement.innerHTML = `<span>Running Steam Message Delete Script -> Deleting Posts . . . -> <button onclick="window.ResetScript()">Reset</button></span>`;

    if (skipDelete === false) {
        setTimeout(() => {

            // This will avoid deleting threads, only posts.
            if (document.querySelectorAll(".tooltip.delete.forum_comment_action").length > 1) {
                document.querySelectorAll(".tooltip.delete.forum_comment_action")[document.querySelectorAll(".tooltip.delete.forum_comment_action").length - 1].click();
            } else {
                document.querySelector(".tooltip.delete.forum_comment_action").click();
            }

            setTimeout(() => {
                try {
                    document.querySelector(".btn_medium.btn_green_steamui").click();

                    savedInfo.deletedposts = savedInfo.deletedposts + 1;
                    savedInfo.urllist.pop();

                    if (savedInfo.urllist.length < 1) {
                        savedInfo.readytodelete = false;
                        savedInfo.scriptdone = true;
                    }

                    SaveToLocalStorage();

                    if (savedInfo.urllist.length > 0) {
                        window.location.href = savedInfo.urllist[savedInfo.urllist.length - 1];
                    } else {
                        window.location.reload();
                    }
                } catch (e) {
                    console.log(e);
                }
            }, 1000);
        }, 2000);
    } else {
        try {
            savedInfo.urllist.pop();

            if (savedInfo.urllist.length < 1) {
                savedInfo.readytodelete = false;
                savedInfo.scriptdone = true;
            }

            SaveToLocalStorage();

            if (savedInfo.urllist.length > 0) {
                window.location.href = savedInfo.urllist[savedInfo.urllist.length - 1];
            } else {
                window.location.reload();
            }

        } catch (e) {
            console.log(e);
        }
    }
}

function ScriptFinished() {
    alert(`Script done! Deleted a total of: ${savedInfo.deletedposts} posts!`);
    newElement.innerHTML = `<span>Running Steam Message Delete Script -> Completed . . .</span>`;

    localStorage.clear();
}

function RunScript() {
    // Make sure the page is at least on one with a number
    if (window.location.href.includes("?p=") === false) {
        window.location.href = window.location.href + "?p=1";
    }

    // Check current status of operation
    // Get Saved Info from Local Storage
    try {
        let pullSavedInfo = JSON.parse(localStorage.getItem("savedinfo"));

        console.log("Saved info -> ", pullSavedInfo);

        if (pullSavedInfo != null) {
            savedInfo.currentpage = Number(pullSavedInfo.currentpage);
            savedInfo.lastpage = Number(pullSavedInfo.lastpage);
            savedInfo.scriptstarted = Boolean(pullSavedInfo.scriptstarted);
            savedInfo.scriptdone = Boolean(pullSavedInfo.scriptdone);
            savedInfo.readytodelete = Boolean(pullSavedInfo.readytodelete);
            savedInfo.urllist = pullSavedInfo.urllist;
            savedInfo.postsfound = Number(pullSavedInfo.postsfound);
            savedInfo.deletedposts = Number(pullSavedInfo.deletedposts);
        }
    } catch (e) {
        console.log(e);
    }

    if (savedInfo.scriptstarted === false) {
        newElement.innerHTML = `<span>Running Steam Message Delete Script -> <button onClick="window.CheckBeforeStarting()">Start</button><label> -> Starting Page -> <input  id="first-page" style="background: rgb(255, 255, 255, 1)" type="text" value="${GetCurrentPageFromURL()}" disabled /></label><label>Last Page -> <input id="last-page" style="background: rgb(255, 255, 255, 1)" type="text" value="${SetMaxPageNumber()}"/></label></span>`;
    } else {
        newElement.innerHTML = `<span>Running Steam Message Delete Script -> Running . . . -> <button onclick="window.ResetScript()">Reset</button></span>`;
    }

    //
    if (savedInfo.scriptstarted === true && savedInfo.readytodelete === false && savedInfo.scriptdone === false) {
        GrabPostURLsProcess();
    } else if (savedInfo.scriptstarted === true && savedInfo.readytodelete === true && savedInfo.scriptdone === false) {
        DeletePostsProcess();
    } else if (savedInfo.scriptdone === true) {
        ScriptFinished();
    }
}