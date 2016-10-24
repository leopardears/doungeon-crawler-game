var canvas = document.getElementById("gameCanvas");
var context = canvas.getContext("2d");

var startFrameMillis = Date.now();
var endFrameMillis = Date.now();


//variables||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||
//drawmap----------------------------------------
var LAYER_COUNT = 5;
var LAYER_FLOOR = 0;
var LAYER_WALLS = 1;

var LAYER_OBJECT_DOORS = 2;
var LAYER_OBJECT_STAIRS = 3;
var LAYER_OBJECT_TREASURE = 4;

var LAYER_OBJECT_ENEMIES = 5;

var MAP = { tw: 60, th: 45 };
var TILE = 32;
var TILESET_TILE = TILE;
var TILESET_PADDING = 0;
var TILESET_SPACING = 0;
var TILESET_COUNT_X = 64;
var TILESET_COUNT_Y = 64;

var cells = [];


//canvas-----------------------------------------
var SCREEN_WIDTH = canvas.width;
var SCREEN_HEIGHT = canvas.height;


//lives------------------------------------------
var lives = 100;


// GameState Levels-------------------------------------
var LEVEL_ONE = 1;
var LEVEL_TWO = 2;
var LEVEL_THREE = 3;
var LEVEL_FOUR = 4;
var LEVEL_FIVE = 5;
var LEVEL_SIX = 6;
var LEVEL_SEVEN = 7;
var LEVEL_EIGHT = 8;
var LEVEL_NINE = 9;
var LEVEL_TEN = 10;

var STATE_SPLASH = 0;
var STATE_INTRO = 11;
var STATE_GAMEOVER = 12;
var STATE_WIN = 13;
var gameState = STATE_SPLASH;

var gameOverTimer = 7.3;
var gameOverReload = 20;
var enterTimer = 2;
var introTimer = 119;
var gameWon = false;
var gameOver = false;


// Audio-----------------------------------------
var MainTheme = new Audio("MainTheme.mp3");
MainTheme.loop = true;


// Video-----------------------------------------
var IntroVideo = document.getElementById("IntroVideo");
context.drawImage(IntroVideo, 0, 0);


//new objects||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||
var player = new Player();
var keyboard = new Keyboard();
var enemy = new Enemy();
var enemies = [];
var turn = new Turn();
//var test = document.createElement("img");
//test.src = "hero.png";

var test2 = document.createElement("img");
test2.src = "enemy.png";

var z = 0;

var move = false;


//functions||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||
//deltaTime==========================================================
function getDeltaTime() {
    endFrameMillis = startFrameMillis;
    startFrameMillis = Date.now();

    var deltaTime = (startFrameMillis - endFrameMillis) * 0.001;

    if (deltaTime > 1)
        deltaTime = 1;


    return deltaTime;
}


//drawmap============================================================
var tileset = document.createElement("img");
tileset.src = "tileset.png";


function cellAtPixelCoord(layer, x, y) {
    if (x < 0 || x > SCREEN_WIDTH || y < 0) // remove ‘|| y<0’
        return 1;
    // let the player drop of the bottom of the screen
    // (this means death)
    if (y > SCREEN_HEIGHT)
        return 0;
    return cellAtTileCoord(layer, p2t(x), p2t(y));
};

function cellAtTileCoord(layer, tx, ty) // remove ‘|| y<0’
{
    if (tx < 0 || tx >= MAP.tw || ty < 0)
        return 1;
    // let the player drop of the bottom of the screen
    // (this means death)
    if (ty >= MAP.th)
        return 0;
    return cells[layer][ty][tx];
};

function tileToPixel(tile) {
    return tile * TILE;
};

function pixelToTile(pixel) {
    return Math.floor(pixel / TILE);
};

function bound(value, min, max) {
    if (value < min)
        return min;
    if (value > max)
        return max;
    return value;
}


var worldOffsetX = 0;
var worldOffsetY = 0;

function drawMap() {
    var startX = -1;
    var maxTiles = Math.floor(SCREEN_WIDTH / TILE) + 2;
    var maxTilesY = Math.floor(SCREEN_HEIGHT / TILE) + 2;
    var tileX = pixelToTile(player.position.x);
    var offsetX = TILE + Math.floor(player.position.x % TILE);
    var startY = -1;
    var tileY = pixelToTile(player.position.y);
    var offsetY = TILE + Math.floor(player.position.y % TILE);

    startX = tileX - Math.floor(maxTiles / 2);
    startY = tileY - Math.floor(maxTilesY / 2);

    if (startX < -1) {
        startX = 0;
        offsetX = 0;
    }
    if (startX > MAP.tw - maxTiles) {
        startX = MAP.tw - maxTiles + 1;
        offsetX = TILE;
    }
    if (startY < -1) {
        startY = 0;
        offsetY = 0;
    }
    if (startY > MAP.th - maxTilesY) {
        startY = MAP.th - maxTilesY + 1;
        offsetY = TILE;
    }
    
    worldOffsetX = startX * TILE + offsetX;
    worldOffsetY = startY * TILE + offsetY;

    for (var layerIdx = 1; layerIdx < LAYER_COUNT; layerIdx++) {
        for (var y = 0; y < level1.layers[layerIdx].height; y++) {
            var idx = y * level1.layers[layerIdx].width + startX;
            for (var x = startX; x < startX + maxTiles; x++) {
                if (level1.layers[layerIdx].data[idx] != 0) {
                    // the tiles in the Tiled map are base 1 (meaning a value of 0 means no tile),
                    // so subtract one from the tileset id to get the correct tile
                    var tileIndex = level1.layers[layerIdx].data[idx] - 1;
                    var sx = TILESET_PADDING + (tileIndex % TILESET_COUNT_X) *
                        (TILESET_TILE + TILESET_SPACING);
                    var sy = TILESET_PADDING + (Math.floor(tileIndex / TILESET_COUNT_Y)) *
                        (TILESET_TILE + TILESET_SPACING);
                    context.drawImage(tileset, sx, sy, TILESET_TILE, TILESET_TILE,
                        (x - startX) * TILE - offsetX, (y - startY) * TILE - offsetY, TILESET_TILE, TILESET_TILE);
                }
                idx++;
            }
        }
    }
}


function initialize() {
    for (var layerIdx = 0; layerIdx < LAYER_COUNT; layerIdx++) { // initialize the collision map
        cells[layerIdx] = [];
        var idx = 0;
        for (var y = 0; y < level1.layers[layerIdx].height; y++) {
            cells[layerIdx][y] = [];
            for (var x = 0; x < level1.layers[layerIdx].width; x++) {
                if (level1.layers[layerIdx].data[idx] != 0) {
                    cells[layerIdx][y][x] = 1;
                }
                else if (cells[layerIdx][y][x] != 1) {
                    // if we haven't set this cell's value, then set it to 0 now
                    cells[layerIdx][y][x] = 0;
                }
                idx++;
            }
        }

    }
    idx = 0;
    while (z == 0) {
        for (var y = 0; y < level1.layers[LAYER_OBJECT_ENEMIES].height; y++) {
            for (var x = 0; x < level1.layers[LAYER_OBJECT_ENEMIES].width; x++) {
                if (level1.layers[LAYER_OBJECT_ENEMIES].data[idx] != 0) {
                    var px = tileToPixel(x);
                    var py = tileToPixel(y);
                    var e = new Enemy(px, py);
                    enemies.push(e);
                }
                idx++;
            }
        }
        z++;
    }

}
//hub--------------------------------------------
var hub = document.createElement("img");
hub.src = "hub.png";

//function Hub() {
//    context.drawImage(hub, 1, 1);
//}

//game states|||||||||||||||||||||||

function runSplash(deltaTime) {
    if (keyboard.isKeyDown(keyboard.KEY_ENTER) == true) {
        gameState = STATE_INTRO;
        //lives = 2;
        //ENEMY_MAXDX = ENEMY_MAXDX + 3000;
        //timer = timer - 20;
        //handiCap = 100;
    }
    //else if (keyboard.isKeyDown(keyboard.KEY_N) == true) {
    //gameState = STATE_GAME;
    //lives = 3;
    //ENEMY_MAXDX = ENEMY_MAXDX + 1000;
    //timer = timer - 10;
    //handiCap = 50;
    //}
    //else if (keyboard.isKeyDown(keyboard.KEY_E) == true) {
    //gameState = STATE_GAME;
    //lives = 4;
    //timer = 45;
    //handiCap = 0;
    //ENEMY_MAXDX = METER * 5;
    //}

    //musicWin.pause();
    //audioGameOver.pause();
    //musicBackground.load();
    //audioGameOver.load();
    MainTheme.play();
    IntroVideo.currentTime = 0;
    //gameOverTimer = 7.3;



    var Splash_Screen = document.createElement("img");
    Splash_Screen.src = "DungeonHeroSplash.png";
    context.drawImage(Splash_Screen, 0, 0)

    gameWon = false;
    return;

}

function runIntro(deltaTime) {

    enterTimer -= deltaTime;
    introTimer -= deltaTime;

    if (keyboard.isKeyDown(keyboard.KEY_ENTER) && enterTimer <= 0 == true) {
        gameState = LEVEL_ONE;

    }

    if (introTimer <= 0) {
        gameState = LEVEL_ONE;
    }

    context.clearRect(0, 0, canvas.width, canvas.height);
    MainTheme.pause();
    IntroVideo.play();

    context.font = "18px Times New Roman";
    context.fillStyle = "red";
    var Intro = "Press Enter To Skip Intro";
    context.fillText(Intro, 10, 400);


}

// Levels 

function Level1(deltaTime) {
    IntroVideo.pause();
 
    for (var i = 0; i < enemies.length; i++) {
        enemies[i].update(deltaTime);
        enemies[i].action(deltaTime);
        context.drawImage(test2, enemies[i].position.x - worldOffsetX, enemies[i].position.y - worldOffsetY);
    }

    context.fillStyle = "#ccc";
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    drawMap();
    initialize();
    //Hub();
    context.drawImage(hub, 1, 1);
    player.update(deltaTime, turn.player);
    player.draw();
}


function Level2(deltaTime) {

}


function Level3(deltaTime) {

}


function Level4(deltaTime) {

}


function Level5(deltaTime) {

}


function Level6(deltaTime) {

}


function Level7(deltaTime) {

}


function Level8(deltaTime) {

}


function Level9(deltaTime) {

}


function Level10(deltaTime) {

}

// Levels ^^

function runGameOver(deltaTime) {
    if (keyboard.isKeyDown(keyboard.KEY_ENTER) == true) {
        gameState = STATE_SPLASH;
        lives = 4;
        timer = 45;
    }

    var Game_over = document.createElement("img");
    Game_over.src = "SNAKE!.png";
    context.drawImage(Game_over, 0, 0)
    lives = 0

    //musicBackground.pause();
    //audioGameOver.play();
    //audioDeathGrunt.play();
    //musicIntro.currentTime = 20;

    gameOverTimer -= deltaTime;
    deathGruntTimer -= deltaTime;
    if (gameOverTimer == 0) {
        gameOverTimer = 0
        return;

    }
    if (gameOverTimer <= 0) {
        audioGameOver.pause();
    }

    if (deathGruntTimer <= 0) {
        audioDeathGrunt.pause();
    }
}

function runGameWon(deltaTime) {

    //musicWin.play();
    //musicIntro.currentTime = 20;

    if (keyboard.isKeyDown(keyboard.KEY_ENTER) == true) {
        gameState = STATE_SPLASH;
        lives = 4;
        timer = 45;
    }

    context.fillStyle = "#ccc";
    context.fillRect(0, 0, canvas.width, canvas.height);

    var gameWon = document.createElement("img");
    gameWon.src = "winScreen.png";
    context.drawImage(gameWon, 0, 0);

    musicBackground.pause();

    context.font = "42px Times New Roman";
    context.fillStyle = "red"
    scoreLeft = "Score:" + (timer + handiCap + (lives * 5)).toFixed(2);
    context.fillText(scoreLeft, SCREEN_WIDTH / 2 - 100, SCREEN_HEIGHT / 2 + 30);
}


//run function|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||
function run() {


    //deltatime--------------------------------------

    var deltaTime = getDeltaTime();


    //background-------------------------------------

    context.fillStyle = "#ccc";
    context.fillRect(0, 0, canvas.width, canvas.height);


    //gamestate==========================================================
    switch (gameState) {
        case STATE_SPLASH:
            runSplash(deltaTime);
            break;
        case STATE_INTRO:
            runIntro(deltaTime);
            break;
        // Levels
        case LEVEL_ONE:
            Level1(deltaTime);
            break;
        case LEVEL_TWO:
            gamestate_level2(deltaTime);
            break;
        case LEVEL_THREE:
            gamestate_level3(deltaTime);
            break;
        case LEVEL_FOUR:
            gamestate_level4(deltaTime);
            break;
        case LEVEL_FIVE:
            gamestate_level5(deltaTime);
            break;
        case LEVEL_SIX:
            gamestate_level6(deltaTime);
            break;
        case LEVEL_SEVEN:
            gamestate_level7(deltaTime);
            break;
        case LEVEL_EIGHT:
            gamestate_level8(deltaTime);
            break;
        case LEVEL_NINE:
            gamestate_level9(deltaTime);
            break;
        case LEVEL_TEN:
            gamestate_level10(deltaTime);
            break;
        // Levels ^^
        // Game won/Game over
        case STATE_GAMEOVER:
            runGameOver(deltaTime);
            break;
        case STATE_WIN:
            runGameWon(deltaTime);
            break;
    }

}



//screen refresh=====================================================
//-------------------- Don't modify anything below here

(function () {
    var onEachFrame;
    if (window.requestAnimationFrame) {
        onEachFrame = function (cb) {
            var _cb = function () { cb(); window.requestAnimationFrame(_cb); }
            _cb();
        };
    } else if (window.mozRequestAnimationFrame) {
        onEachFrame = function (cb) {
            var _cb = function () { cb(); window.mozRequestAnimationFrame(_cb); }
            _cb();
        };
    } else {
        onEachFrame = function (cb) {
            setInterval(cb, 1000 / 60);
        }
    }

    window.onEachFrame = onEachFrame;
})();

window.onEachFrame(run);
