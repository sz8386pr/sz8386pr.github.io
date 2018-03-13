// iframe contents
var mainFrameContents;
var menuFrameContents;


var stage = 1;

let gameOver = false;
let pause = false;


// pause/resume reference from https://stackoverflow.com/questions/24724852/pause-and-resume-setinterval
function IntervalTimer(callback, interval) {
    let timerId, startTime, remaining = 0;
    let state = 0; //  0 = idle, 1 = running, 2 = paused, 3= resumed

    this.pause = function () {
        if (state !== 1) return;

        pause = true;
        remaining = interval - (new Date() - startTime);
        window.clearInterval(timerId);
        state = 2;

    };

    this.resume = function () {
        if (state !== 2) return;

        pause = false;
        state = 3;
        window.setTimeout(this.timeoutCallback, remaining);

    };

    this.timeoutCallback = function () {
        if (state !== 3) return;

        callback();

        startTime = new Date();
        timerId = window.setInterval(callback, interval);
        state = 1;
    };

    // this.clearInterval = function () {
    //     return;
    // };

    startTime = new Date();
    timerId = window.setInterval(callback, interval);
    state = 1;
}

//https://stackoverflow.com/questions/8093297/jquery-can-i-detect-once-all-content-is-loaded
$(window).on('load', function() {

    // default number setup
    let playerData = setup();

    statsSetup(playerData);

    beginStage(playerData);

    // checks if player hp falls below 0
    let playerLife = setInterval(function () {
        if ( (playerData.playerHP <= 0) && !gameOver) {
            clearInterval(playerLife);
            endGame();
        }
    }, 0);


});


// for stats plus menu
function statsSetup(playerData) {
    let interval = setInterval(function() {
        if (playerData.sp > 0) {
            addStatPlus()
        }
        else if (playerData.sp <= 0) {
            removeStatPlus();
        }

        if (gameOver) {
            clearInterval(interval);
        }
    }, 0);


    menuFrameContents.find("#hpPlus").click(function(){
        addHP(playerData);
    });
    menuFrameContents.find("#attPlus").click(function(){
        addAtt(playerData);
    });
    menuFrameContents.find("#defPlus").click(function(){
        addDef(playerData);
    });
}


// initial stats/number display
function setup() {
    // Base player stats
    let playerHP = 100;
    let playerAtt = 5;
    let playerDef = 5;
    let sp = 0;
    let currentGold = 0;
    resize();
    // iframe contents
    mainFrameContents = $('iframe#mainFrame').contents();
    menuFrameContents = $('iframe#menuFrame').contents();

    // player stats
    menuFrameContents.find('#hp').text(playerHP);
    menuFrameContents.find('#att').text(playerAtt);
    menuFrameContents.find('#def').text(playerDef);
    menuFrameContents.find('#sp').text(sp);
    menuFrameContents.find('#gold').text(currentGold);

    return {playerHP: playerHP, playerAtt: playerAtt, playerDef: playerDef, sp: sp, currentGold: currentGold};
}



// enemy stats referenced from http://yanfly.moe/tools/enemylevelcalculator/
function enemySetup() {
    let suffixList = ['Beautiful', 'Pretty', 'Charming', 'Handsome', 'Sexy', 'Alluring', 'Gorgeous', 'Graceful', 'Divine', 'Elegant'];
    let suffix = 'The ' + suffixList[Math.floor(Math.random() * suffixList.length)];

    let baseEnemyHP = 50, baseEnemyAtt = 5, baseEnemyDef = 5, baseEnemyGold = 10;
    let rateHP =  .3, rateAtt = .05, rateDef = .05, rateGold = 1;
    let flatHP = 50, flatAtt = 2.5, flatDef = 2.5, flatGold = 10;

    let enemyHP = enemyCalc(baseEnemyHP, rateHP, flatHP);
    let enemyAtt = enemyCalc(baseEnemyAtt, rateAtt, flatAtt);
    let enemyDef = enemyCalc(baseEnemyDef, rateDef, flatDef);
    let enemyGold = Math.round(enemyCalc(baseEnemyGold, rateGold, flatGold));

    // console.log(enemyDef + 'eDef');

    //https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript

    // random alphanumeric string. https://stackoverflow.com/questions/10726909/random-alpha-numeric-string-in-javascript
    // needs better algorithm later on
    let enemyName = (Math.random().toString(36).substr(2, 7)).toUpperCase();

    // update stage number
    mainFrameContents.find('#stageNumber').text(stage);
    mainFrameContents.find('#enemyHPBar')
            .attr("aria-valuemax", enemyHP)
            .attr("aria-valuenow", enemyHP)
            .css("width", '100' + '%');
    mainFrameContents.find('#enemyHP').text('100');

    // change enemy image based on randomly generated name. Powered by robohash.org
    // robohash.org generates random images based on the text sting.
    mainFrameContents.find('#monsterNameDisplay').text(enemyName);
    mainFrameContents.find('#monsterNameSuffix').text(suffix);
    mainFrameContents.find('#monsterImage')
        .attr("src", "https://robohash.org/" + enemyName + "?set=set2")
        .attr("alt", "Lovely portrait of " + enemyName)
        .fadeIn('slow');

    return {enemyHP: enemyHP, enemyAtt: enemyAtt, enemyDef: enemyDef, enemyGold: enemyGold, enemyName: enemyName};
}

// enemy stats calculation referenced from http://yanfly.moe/tools/enemylevelcalculator/
function enemyCalc(base, rate, flat) {
    return base * (1 + (stage - 1) * rate) + (flat * (stage - 1));
}



function beginStage(playerData) {
    let enemyAttackRate = 5000; //default enemy attackrate of 5000 ms
    let enemyData = enemySetup();

    let enemyCurrentHP = enemyData.enemyHP;

    enemyData.enemyCurrentHP = enemyCurrentHP;
    let gold = enemyData.enemyGold;

    // enemy attacks player
    let enemyAttack = new IntervalTimer(function () {
        if (enemyData.enemyCurrentHP <= 0 || playerData.playerHP <= 0) {
            clearInterval(enemyAttack);
        }
        else {
            enemyAtt(playerData, enemyData);
        }
    }, enemyAttackRate);

    // checks if player have defeated the enemy
    let interval = setInterval(function () {
        if (enemyData.enemyCurrentHP <= 0) {
            clearInterval(interval);
            endStage(playerData, gold);
        }
    }, 0);

    // attack button onclick
    // unbind() reference from https://stackoverflow.com/questions/14969960/jquery-click-events-firing-multiple-times
    menuFrameContents.find("#attackButton").unbind().click(function () {
        if (!gameOver && !pause) {
            attackEnemy(playerData, enemyData)
        }
        else if (!gameOver && pause) {
            alert('Game is paused.\nPress play to continue the game')
        }
        else if (gameOver) {
            alert("Game is over.\nRefresh the page to play again")
        }
    });

    //pause button pauses enemy attack and player attack (gives player time to shop/upgrade stats)
    menuFrameContents.find("#pause").unbind().click(function () {
        pauseOrPlay(enemyAttack)
    });

    menuFrameContents.find("#shop").unbind().click(function () {
        pause = false;
        pauseOrPlay(enemyAttack);
        $("#popup").css("display", "block");
        $("#shopDiv").css("display", "block");
    });

    menuFrameContents.find("#help").unbind().click(function() {
        pause = false;
        pauseOrPlay(enemyAttack);
        $("#popup").css("display", "block");
        $("#helpDiv").css("display", "block");
    });


    $("#purchaseButton").click(function(){
        purchase(playerData);
        pauseOrPlay(enemyAttack);
    });

    $(".closeIcon").click(function(){
        popupClose();
        pauseOrPlay(enemyAttack);
    })


}


function pauseOrPlay(enemyAttack) {
    if (!pause) {
        enemyAttack.pause();
        menuFrameContents.find('#pause').html("<img src=\"images/play.png\" class=\"icon\">PLAY");
    }
    else if (pause) {
        enemyAttack.resume();
        menuFrameContents.find('#pause').html("<img src=\"images/pause.png\" class=\"icon\">PAUSE");
    }
}

// when the player defeats the enemy of the stage
function endStage(playerData, gold) {
    let spGain = 5; // stat point gain

    alert('Stage' + stage + ' clear!\nOnto the next stage!');
    playerData.sp += spGain;
    playerData.currentGold += gold;

    menuFrameContents.find('#sp').text(playerData.sp);
    menuFrameContents.find('#gold').text(gold);

    stage++;
    beginStage(playerData)
}






// combat damage calculation. Returns the dmg value based on the attacker
function combat(playerData, enemyData, attacker) {
    let enemyDMG = (playerData.playerAtt * playerData.playerAtt) / (playerData.playerAtt + enemyData.enemyDef);
    let playerDMG = (enemyData.enemyAtt * enemyData.enemyAtt) / (enemyData.enemyAtt + playerData.playerDef);

    if (attacker === 'player') {
        return enemyDMG
    }
    else if (attacker === 'enemy') {
        return playerDMG
    }
}

// enemy attack phase
function enemyAtt(playerData, enemyData) {
    // sound by Hybrid_V https://freesound.org/people/Hybrid_V/sounds/319590/
    let audio = new Audio('sounds/bash.wav');
    audio.play();

    let playerDMG = combat(playerData, enemyData, 'enemy');

    playerData.playerHP -= playerDMG;
    let playerHP = playerData.playerHP;

    if (playerHP <= 0) {
        menuFrameContents.find('#hp').text("0");
    }
    else if (playerHP.toFixed(0) === '0') {
        menuFrameContents.find('#hp').text("1");
    }
    else {
        menuFrameContents.find('#hp').text(playerHP.toFixed(0));
    }
}

// player attack on click
function attackEnemy(playerData, enemyData) {
    // sound by LiamG_SFX https://freesound.org/people/LiamG_SFX/sounds/322150/
    let audio = new Audio('sounds/slash.wav');
//     // sound by XxChr0nosxX https://freesound.org/people/XxChr0nosxX/sounds/268227/
//     let audio = new Audio('sounds/swing.mp3');
    audio.play();
    let enemyDMG = combat(playerData, enemyData, 'player');

    enemyData.enemyCurrentHP -= enemyDMG;
    // console.log(enemyDMG);
    let enemyHPPerc = enemyData.enemyCurrentHP / enemyData.enemyHP * 100;
    // console.log(enemyHPPerc);

    mainFrameContents.find('#enemyHPBar')
        .attr("aria-valuenow", enemyData.enemyCurrentHP)
        .css("width", enemyHPPerc + '%');
    if (enemyHPPerc <= 0) {
        mainFrameContents.find('#enemyHP').text('0');
    }
    else if (enemyHPPerc.toFixed(0) === '0') {
        mainFrameContents.find('#enemyHP').text('1');
    }
    else {
        mainFrameContents.find('#enemyHP').text(enemyHPPerc.toFixed(0));
    }
}



function addStatPlus() {
    menuFrameContents.find(".statPlus").css("display", "block")
}

function removeStatPlus() {
    menuFrameContents.find(".statPlus").css("display", "none")
}


function addHP(playerData){
    // sound by goldendiaphragm https://freesound.org/people/goldendiaphragm/sounds/321288/
    let audio = new Audio('sounds/plus.wav');
    audio.play();

    playerData.playerHP += 5;
    playerData.sp --;

    menuFrameContents.find('#hp').text(playerData.playerHP.toFixed(0));
    menuFrameContents.find('#sp').text(playerData.sp);
}

function addAtt(playerData){
    // sound by goldendiaphragm https://freesound.org/people/goldendiaphragm/sounds/321288/
    let audio = new Audio('sounds/plus.wav');
    audio.play();
    playerData.playerAtt ++;
    playerData.sp --;

    menuFrameContents.find('#att').text(playerData.playerAtt);
    menuFrameContents.find('#sp').text(playerData.sp);
    }

function addDef(playerData){
    // sound by goldendiaphragm https://freesound.org/people/goldendiaphragm/sounds/321288/
    let audio = new Audio('sounds/plus.wav');
    audio.play();
    playerData.playerDef ++;
    playerData.sp --;

    menuFrameContents.find('#def').text(playerData.playerDef);
    menuFrameContents.find('#sp').text(playerData.sp);
}


function purchase(playerData){
    alert('test');
    popupClose();
}

function popupClose(){
    $("#popup").css("display", "none");
    $("#shopDiv").css("display", "none");
    $("#helpDiv").css("display", 'none');
}




// when player hp goes equal to or below 0
function endGame() {
    // sound by TheSubber13 https://freesound.org/people/TheSubber13/sounds/239900/
    let audio = new Audio('sounds/scream.ogg');
    audio.play();
    alert('You died');
    gameOver = true;

}


// adjust the game size keeping the aspect ratio
function resize() {
    let windowWidth = window.innerWidth;
    let windowHeight = window.innerHeight;

    let  height = windowHeight-10;
    let  width = height *0.9;

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

// whenever player resize one's window, trigger resize() function
window.addEventListener("resize", resize);