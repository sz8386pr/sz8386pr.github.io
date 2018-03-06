// iframe contents
var mainFrameContents;
var menuFrameContents;

// Base player stats
var playerHP = 100;
var playerAtt = 10;
var playerDef = 10;
var xp = 0;
var currentGold = 0;

var stage = 1;

//https://stackoverflow.com/questions/8093297/jquery-can-i-detect-once-all-content-is-loaded
$(window).on('load', function() {

    // default number setup
    setup();

    menuFrameContents.find("#attackButton").click(function(){attackEnemy()});

    // var testval = mainFrameContents.find("#stageNumber").text();
    // console.log(testval);
    // console.log(menuFrameContents.find('#gold').text());




    //HP bar test
    // var current_progress = 100;
    // var health = 100;
    //
    // var interval = setInterval(function () {
    //     current_progress -= 10;
    //     var currentHealth = health - current_progress
    //     console.log(currentHealth)
    //     if (current_progress <= 0)
    //         clearInterval(interval);
    //     mainFrameContents.find('#test')
    //         .css("width", currentHealth + '%')
    //         .attr("aria-valuenow", currentHealth);
    //     mainFrameContents.find('#enemyHP')
    //         .text(currentHealth);
    //  }, 1000);





});


function setup() {
    resize();
    // iframe contents
    mainFrameContents = $('iframe#mainFrame').contents();
    menuFrameContents = $('iframe#menuFrame').contents();

    // player stats
    menuFrameContents.find('#hp').text(playerHP);
    menuFrameContents.find('#att').text(playerAtt);
    menuFrameContents.find('#def').text(playerDef);
    menuFrameContents.find('#xp').text(xp);
    menuFrameContents.find('#gold').text(currentGold);

    // st
    mainFrameContents.find('#stageNumber').text(stage);
}





// adjust the game size keeping the aspect ratio
function resize() {
    var windowWidth = window.innerWidth;
    var windowHeight = window.innerHeight;

    var  height = windowHeight-10;
    var  width = height *0.9;

    if (width >= windowWidth-10) {
         width = windowWidth-10;
         height = width / 0.9;
    }

    $("#mainFrame")
        .css('height', height + "px")
        .css('width', width*.75 + 'px');
    $("#menuFrame")
        .css('height', height + "px")
        .css('width', width *.25 + 'px');
}


function attackEnemy() {

    var ee = menuFrameContents.find('#hp').text();
    console.log(ee);

}

window.addEventListener("resize", resize);