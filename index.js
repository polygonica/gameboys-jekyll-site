// get the button to top
var btnTop;
// the length of the website
// timer for detecting section-scrolling
var scrollTimer;
// minimum amount to scroll by before navbar and top button trigger
var minScrollTrigger = 20;
// list of nav links for each section
var sectionNavLinks = [];
// list of section scroll positions
var sectionScrollPos = [];
var topbar;
var toast_box; // the toast box
var version = 2.0;
var twitchPlayer; // the twitch embedded player
var streamers;

var once = false;

/*
 *  Functions that need to be called on initialization
 */
$(document).ready(function () {
    startUp();
});
/*
 *  Functions called on scroll
 */
$(window).scroll(function () {
    scrollFunction();
    if (topbar) {
        highlightSection();
    }

});

var resizeTimeout;

$(window).resize(function () {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(function () {
        setupScrollPos();
    }, 1000);
});

/* 
 *  Start up functions
 */
function startUp() {
    streamers = ["monstercat", "onscreen", "esl_csgo", "fierceone", "shroud", "kratFOZ"];
    btnTop = document.getElementById("btnTop");
    topbar = document.getElementById("topnav");
    toast_box = document.getElementsByClassName("toast_box")[0];

    setupScrollPos();
    // get all links in navbar
    if (topbar) {
        temp_sectionElements = topbar.getElementsByTagName("a");

        // from links, get only the section links (first x)
        for (var i = 0; i < sectionScrollPos.length; i++) {
            // first links are guaranteed to be hash links (section links)
            if (temp_sectionElements[i].hash) {
                sectionNavLinks.push(temp_sectionElements[i]);
            }
        }
        highlightSection(); // highlight the correct section if fresh load
    }
    scrollFunction(); // evaluate the cond for top button


    displayArticle(); // display article if exists
    // pull up toast for server message
    if (toast_box) {
        pullupToast(3000);
    }

    setFooter();

    setupStreamPage();

    // show cover page initially
    showBlockA();

    // animations for cover page characters
    $('.game_list_item').mouseover(function (what) {
        $('#' + what.currentTarget.innerHTML.toLowerCase().replace(/ /g, "")).css('transform', "translateY(-10px)");
    });

    $('.game_list_item').mouseleave(function (what) {
        $('#' + what.currentTarget.innerHTML.toLowerCase().replace(/ /g, "")).css('transform', "translateY(0)");
    });
}

function setupStreamPage() {
    var client_id = "foqei49l7ynm0699ra18fgjf2e3dgg";
    var xmlhttp = new XMLHttpRequest();
    var url = "https://api.twitch.tv/kraken/streams/?client_id=" + client_id + "&channel=";

    for (var i = 0; i < streamers.length; i++) {
        // build the URL to request
        url += streamers[i] + ",";
    }
    // response handler
    xmlhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            // response received

            // read json
            var res_json = JSON.parse(this.responseText);
            if (res_json.streams.length > 0) {
                // at least one streamer live

                $('.block2 .streaming').css('display', 'block');
                $('.block2 .not_streaming').css('display', 'none');

                for (var i = 0; i < res_json.streams.length; i++) {
                    this.res_json = res_json;
                    this.twitchPlayer = twitchPlayer;
                    (function () {

                        var name = res_json.streams[i].channel.name;
                        var game = res_json.streams[i].game;

                        if (i == 0) {
                            // the first streamer gets the preview
                            this.firstStream = res_json.streams[i];
                            setTimeout(() => {
                                showTwitchBox(this.firstStream);
                            }, 000, setTimeout(function () {
                                hideTwitchBox();
                            }, 4000));
                            // the first streamer also gets the big box
                            $('.block2 #streamer_title').html(name + " streaming " + game);

                            var options = {
                                width: "100%",
                                height: "100%",
                                channel: name,
                            };
                            twitchPlayer = new Twitch.Player("video_box", options);
                            twitchPlayer.setVolume(0.2);
                            twitchPlayer.addEventListener(Twitch.Player.READY, () => {
                                twitchPlayer.pause();
                            });

                            twitchPlayer.addEventListener(Twitch.Player.PLAY, () => {
                                if (!once) {
                                    twitchPlayer.pause();
                                    once = true;
                                }
                            });
                        }
                        // all other streamers get in list
                        var streamer_element = document.createElement("div");

                        streamer_element.addEventListener("click", () => {
                            twitchPlayer.setChannel(name);
                            $('#streamer_title').html(name + " streaming " + game);
                        });
                        streamer_element.appendChild(document.createElement("h1"));
                        var preview_element = document.createElement("div");
                        preview_element.classList.add("preview");
                        streamer_element.appendChild(preview_element);
                        streamer_element.classList.add("streamer");
                        // set channel preview image

                        streamer_element.getElementsByClassName("preview")[0].style.backgroundImage = "url('" + res_json.streams[i].preview.medium + "')";
                        streamer_element.getElementsByTagName("h1")[0].innerHTML = name;
                        document.getElementsByClassName("more_streamers")[0].appendChild(streamer_element);
                    }());
                }

                if (res_json.streams.length == 1) {
                    // if only one element
                    $('.more_streamers').css('display', 'none');
                }

            } else {
                // no streamers live
                $('.block2 .streaming').css('display', 'none');
                $('.block2 .not_streaming').css('display', 'block');
                return false;
            }
        }
    };
    xmlhttp.open("GET", url, true);
    xmlhttp.send();
}



function setupScrollPos() {
    temp_sections = document.getElementsByTagName("section");
    for (var i = 1; i < temp_sections.length; i++) {
        // get section scroll top positions
        var val = $(temp_sections[i]).offset().top;
        // store the positions
        sectionScrollPos.push(val);
    }

}

function showTwitchBox(stream) {
    // set the preview to streamers
    var name = stream.channel.name;
    var preview_url = stream.preview.medium;

    var twitchBox = $('.twitch_box');
    twitchBox.animate({
        right: '60px'
    });
    twitchBox.children('.video').css('background-image', "url('" + preview_url + "')")
    twitchBox.children('.button_area').animate({
        left: '0px'
    });

}

function hideTwitchBox() {
    var twitchBox = $('.twitch_box');
    twitchBox.animate({
        right: '-266px'
    });
    twitchBox.children('.button_area').animate({
        left: '-60px'
    });
}

function showBlockA() {
    if (twitchPlayer) {
        twitchPlayer.pause();
    }
    document.getElementsByClassName('block1')[0].style.left = "0px";
    document.getElementsByClassName('block2')[0].style.left = screen.width.toString() + "px";
}

function showBlockB() {
    if (twitchPlayer) {
        twitchPlayer.play();
    }
    document.getElementsByClassName('block1')[0].style.left = "-" + screen.width.toString() + "px";
    document.getElementsByClassName('block2')[0].style.left = "0px";
}


/*
 *  Smooth scroll to a hashed section, and set to update
 *  the hash location in URL
 */
function moveToSection(event) {
    event.preventDefault();
    hash = event.path[0].hash;
    // scroll to it
    $("html, body").animate({
        scrollTop: $(hash).offset().top
    }, 400);

    window.location.hash = hash;
}

/*
 *  highlight the section automatically in nav bar
 */
function highlightSection() {
    var currScrollPos = $('body').scrollTop();

    if (currScrollPos == 0) {
        // if scroll to top
        sectionNavLinks[0].classList.remove("selected_nav");
        return;
    }

    // loop through all section heights, find closest
    for (var i = 0; i < sectionScrollPos
        .length; i++) {
        if (Math.abs(currScrollPos - sectionScrollPos[i]) <= 100) {
            for (var j = 0; j < sectionScrollPos
                .length; j++) {
                // remove all highlights
                sectionNavLinks[j].classList.remove("selected_nav");
            }
            // set the correct highlight
            sectionNavLinks[i].classList.add("selected_nav");
            // set the hash
            return;
        }
    }
}

/* Given a date, get the time past */
function getTimeSince(date) {
    var pastTime = new Date(date);
    var today = new Date();
    // get the difference
    var distance = Math.abs(today.getTime() - pastTime.getTime());
    if (distance > 31536000000) {
        // more than a year
        return Math.round(distance / 31536000000) + " years ago";
    } else if (distance > 2592000000) {
        // more than a month
        return Math.round(distance / 2592000000) + " months ago";
    } else if (distance > 604800000) {
        // more than a week
        return Math.round(distance / 604800000) + " weeks ago";
    } else if (distance > 86400000) {
        // more than a day ago
        return Math.round(distance / 86400000) + " days ago";
    } else {
        return "just now";
    }
}


function setFooter() {
    if ($(window).height() > $('.curr_article').height()) {
        document.getElementsByTagName("footer")[0].style.position = "absolute";
    } else {
        document.getElementsByTagName("footer")[0].style.position = "none";
    }

}

/* Display a toast notification message for a given duration. */
function toast(message, duration) {
    toast_box.children[0].innerText = message;
    pullupToast(duration);
}

/* Pull up the toast box */
function pullupToast(duration) {
    // pull up only if there is content
    if (toast_box.children[0].innerText != "") {
        toast_box.style.bottom = "0px";
        setTimeout(() => {
            toast_box.style.bottom = "-" + toast_box.clientHeight + "px";
            toast_box.children[0].innerText = ""; // reset the message
        }, duration);
    }
}

function copyToClipboard(element) {
    var text = document.getElementById(element);
    var selection = window.getSelection();
    var range = document.createRange();
    range.selectNodeContents(text);
    selection.removeAllRanges();
    selection.addRange(range);
    document.execCommand("Copy");
    selection.removeAllRanges();
}

function copyLink(event) {
    copyToClipboard('discord_link');

    var duplicate = $('#clone');
    duplicate.animate({
        top: '-1px',
        opacity: 0
    }, 100, () => {
        duplicate.css("top", "8px");
        duplicate.css("opacity", "1");
    })
}

function displayArticle() {
    // check if article exists
    if ($('.curr_article').length) {
        // article exists, hide all other sections
        $('.site_wrapper').hide();
    } else {
        // article does not exist, show the content
        $('.site_wrapper').show();
    }
}

/*
 *  Function for displaying and removing scroll to top button.
 */
function scrollFunction() {
    if (document.body.scrollTop > minScrollTrigger || document.documentElement.scrollTop > minScrollTrigger) {
        $("#btnTop").show();
    } else {
        // hide the button if already at top 
        $("#btnTop").hide();
    }
}

/*
 *  Scroll button to top of website.
 */
function topFunction() {
    $("html, body").animate({
        scrollTop: 0
    }, 400);
    // scroll to top takes you to home
    hashVal = "home";
}
