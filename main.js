const canvas = document.getElementById('main_screen');
const context = canvas.getContext("2d");
context.imageSmoothingEnabled = false;
var pressedKeys = {};
window.onkeyup   = function(e) { pressedKeys[e.keyCode] = false; }
window.onkeydown = function(e) { pressedKeys[e.keyCode] = true;  }

const titleScreen = document.getElementById("title-screen");

const layers = [
    document.getElementById("parallax-mountain-bg"),
    document.getElementById("parallax-mountain-montain-far"),
    document.getElementById("parallax-mountain-mountains"),
    document.getElementById("parallax-mountain-trees"),
    document.getElementById("parallax-mountain-foreground-trees")
];

const tiles = document.getElementById("tiles");

const heroJumpAnimationLeft     =    document.getElementById("hero-jump-left");
const heroJumpAnimationRight    =    document.getElementById("hero-jump-right");
const heroAttackAnimationLeft   =    document.getElementById("hero-attack-left");
const heroAttackAnimationRight  =    document.getElementById("hero-attack-right");
const heroCrouchAnimationLeft   =    document.getElementById("hero-crouch-left");
const heroCrouchAnimationRight  =    document.getElementById("hero-crouch-right");
const heroHurtAnimationLeft     =    document.getElementById("hero-hurt-left");
const heroHurtAnimationRight    =    document.getElementById("hero-hurt-right");

var getFrameImages = function(prefix, frameCount) {
    return Array.from({ length: frameCount }, function(_, index) {
        return document.getElementById(prefix + "-" + String(index).padStart(2, "0"));
    });
}

let heroAnimations = [
    { frames: getFrameImages("hero-idle-left", 2), fps: 3 },
    { frames: getFrameImages("hero-idle-right", 2), fps: 3 },
    { frames: getFrameImages("hero-run-left", 6), fps: 10 },
    { frames: getFrameImages("hero-run-right", 6), fps: 10 },
    { sheet: heroJumpAnimationLeft, frameCount: 4, frameWidth: 100, frameHeight: 59, fps: 10, reverseFrameOrder: true },
    { sheet: heroJumpAnimationRight, frameCount: 4, frameWidth: 100, frameHeight: 59, fps: 10 },
    { sheet: heroAttackAnimationLeft, frameCount: 5, frameWidth: 100, frameHeight: 59, fps: 10, reverseFrameOrder: true },
    { sheet: heroAttackAnimationRight, frameCount: 5, frameWidth: 100, frameHeight: 59, fps: 10 },
    { sheet: heroCrouchAnimationLeft, frameCount: 1, frameWidth: 100, frameHeight: 59, fps: 10, reverseFrameOrder: true },
    { sheet: heroCrouchAnimationRight, frameCount: 1, frameWidth: 100, frameHeight: 59, fps: 10 },
    { sheet: heroHurtAnimationLeft, frameCount: 1, frameWidth: 100, frameHeight: 59, fps: 10, reverseFrameOrder: true },
    { sheet: heroHurtAnimationRight, frameCount: 1, frameWidth: 100, frameHeight: 59, fps: 10 },
]

var getAnimationFrame = function(animationIndex, elapsedMs) {
    let animation = heroAnimations[animationIndex];
    let frameCount = animation.frames ? animation.frames.length : animation.frameCount;
    return Math.floor(elapsedMs * animation.fps / 1000) % frameCount;
}

var drawHeroFrame = function(animationIndex, frameIndex, x, y, width, height) {
    let animation = heroAnimations[animationIndex];
    if (animation.frames) {
        let frame = animation.frames[frameIndex];
        if (frame.complete && frame.naturalWidth > 0) {
            context.drawImage(frame, x, y, width, height);
        }
        return;
    }

    if (animation.reverseFrameOrder) {
        frameIndex = animation.frameCount - frameIndex - 1;
    }
    context.drawImage(animation.sheet, frameIndex * animation.frameWidth, 0,
        animation.frameWidth, animation.frameHeight, x, y, width, height);
}

let heroAnimationIndex = 1;
let heroDirection = 1;
let heroJumping = false;
let heroPeakJumping = false;
let jumpPressedLastFrame = false;
let hoverjump = false;

var scrollX = 0;

var resetAnimationTime = Date.now();
var previousHeroAnimationIndex = 1;
let currentLevel = [];

let points = 0;

let gameStarted = false;
let gameOver = false;

let demoComplete = false;

var levels = window.gameLevels || [];
let currentLevelIndex = 0;

if (levels.length === 0) {
    throw new Error("No levels loaded. Check the level script tags in index.html.");
}

var loadLevel = function(levelIndex) {
    if (!levels[levelIndex]) {
        throw new Error("Level " + levelIndex + " does not exist.");
    }
    currentLevel = JSON.parse(JSON.stringify(levels[levelIndex]));
}

const SCREEN_WIDTH = 816;
const SCREEN_HEIGHT = 480;
const TILE_SIZE = 32;
const HERO_WIDTH = 128;
const HERO_HEIGHT = 96;
const HERO_HITBOX_WIDTH = 50;
let distanceFromFloor = 0;
let nearestFloorHeight = -HERO_HEIGHT;
let newJumpPress = false;
let attackCompleted = false;

let hero = {
    spriteWidth: HERO_WIDTH,
    spriteHeight: HERO_HEIGHT,
    levelX: 140,
    levelY: SCREEN_HEIGHT-TILE_SIZE-HERO_HEIGHT,
    renderX: 100,
    renderY: SCREEN_HEIGHT-TILE_SIZE-HERO_HEIGHT,
    velocityY: 0,
}

/* Load Game Music */
var audioElement = document.getElementById("theAudio");
audioElement.load();
audioElement.volume = 0.6;
var audioPlaying = false;

/* For Safari Audio Compatibility */
var enterPressedInitially = false;
var beyondTitleScreen = false;
onInitialEnterPress = function(e) {
    if (e.key == "Enter") {
        enterPressedInitially = true;
        audioElement.play();
    }
}
document.addEventListener('keypress', onInitialEnterPress);

/* Draw Single Level Tile, 32x32 pixels */
var drawTile = function(x, y, tileIndex) {
    var sx = (tileIndex*32) - (64*Math.floor(tileIndex/64)*32);
    var sy = Math.floor(tileIndex/64)*32;
    context.drawImage(tiles, sx, sy, 32, 32, x, y, 32, 32);
}

/* Render Level Tiles */
var drawLevelTiles = function(level, hTiles, vTiles, scrollX) {
    for (var i=0; i<hTiles; i++) {
        for (var j=0; j<vTiles; j++) {
            if (level[j][i] == 1) {
                drawTile(32*i-scrollX, j*32, 18+64*3);
            }
            else if (level[j][i] == 10) {
                drawTile(32*i-scrollX, j*32, 49+64*9);
            }
            else if (level[j][i] == 12) {
                drawTile(32*i-scrollX, j*32, 23+64*1);
            }
            else if (level[j][i] != 0) {
                drawTile(32*i-scrollX, j*32, (41+level[j][i])+64*6);
            }
        }
    }
}

/* Check Single Tile for Collision with Player or other Sprite */
var checkSpriteTileCollision = function(sprite, tileX, tileY, tileIndex, collisions) {
    if ((sprite.levelX + sprite.spriteWidth >= tileX &&
        sprite.levelX <= tileX + TILE_SIZE) && 
        (sprite.levelY + sprite.spriteHeight >= tileY &&
            sprite.levelY <= tileY + TILE_SIZE)) {
                let intersect = {
                    x: Math.max(sprite.levelX,tileX),
                    y: Math.max(sprite.levelY,tileY),
                }
                intersect.width = Math.min(sprite.levelX + sprite.spriteWidth, 
                    tileX + TILE_SIZE) - intersect.x;
                intersect.height = Math.min(sprite.levelY + sprite.spriteHeight, 
                    tileY + TILE_SIZE) - intersect.y;
                if (sprite.levelX+sprite.spriteWidth/2 > tileX+TILE_SIZE/2 && 
                    intersect.height > intersect.width) collisions.left = true;
                if (sprite.levelX+sprite.spriteWidth/2 < tileX+TILE_SIZE/2 && 
                    intersect.height > intersect.width) collisions.right = true;
                if (sprite.levelY+sprite.spriteHeight/2 < tileY+TILE_SIZE/2 && 
                    intersect.width > intersect.height && intersect.width > 4) {
                    collisions.top = true;
                    collisions.topY = tileY;
                }
                if (sprite.levelY+sprite.spriteHeight/2 > tileY+TILE_SIZE/2 && 
                    intersect.width > intersect.height && intersect.width > 4) {
                        collisions.bottom = true;
                }
        }
}

/* Check for Collision Between Hero and Level Tiles */
var checkSpriteTileCollisions = function(sprite, level) {
    let levelWidth = level[0].length;
    let levelHeight = level.length;
    let collisions = {
        left: false,
        right: false,
        top: false,
        bottom: false,
        topY: null,
    }
    for (let i=0; i<levelWidth; i++) {
        for (let j=0; j<levelHeight; j++) {
            if (level[j][i] != 0) {
                checkSpriteTileCollision(sprite, i*TILE_SIZE, 
                    j*TILE_SIZE, level[j][i], collisions);
            }
        }
    }
    return collisions;
}

/* Reset Game and Level */
var resetGame = function() {
    hero = {
        spriteWidth: HERO_WIDTH,
        spriteHeight: HERO_HEIGHT,
        levelX: 140,
        levelY: SCREEN_HEIGHT-TILE_SIZE-HERO_HEIGHT,
        renderX: 100,
        renderY: SCREEN_HEIGHT-TILE_SIZE-HERO_HEIGHT,
        velocityY: 0,
    };
    loadLevel(currentLevelIndex);
    scrollX = 0;
    points = 0;
    hoverjump = false;
    heroAnimationIndex = 1;
    heroDirection = 1;
    heroJumping = false;
    heroPeakJumping = false;
    jumpPressedLastFrame = false;
    hoverjump = false;
    scrollX = 0;
    resetAnimationTime = Date.now();
    previousHeroAnimationIndex = 1;
    points = 0;
    distanceFromFloor = 0;
    nearestFloorHeight = -HERO_HEIGHT;
    newJumpPress = false;
    attackCompleted = false;
}

/* Title / Menu Screen */
var titleScreenLoop = function(now, oldTime) {
    var sx=0;
    var sy=0;
    var swidth=384;
    var sheight=224;
    context.drawImage(titleScreen, sx, sy, swidth, sheight, 0, 0, 816, 480);
    context.font = "90px Luminari, fantasy";
    context.fillStyle = "rgb(242,131,28)";
    context.fillText("Platform Pillage", 75, 140);
    context.font = "60px Luminari, fantasy";
    context.fillStyle = "rgb(255, 247, 227, " + 
        (0.75+0.15*Math.cos(2*3.1415*(Math.round(now - oldTime)/1000))) + ")";
    context.fillText("Press Enter", 240, 260);
    let currentFrame = getAnimationFrame(heroAnimationIndex, Date.now());
    drawHeroFrame(heroAnimationIndex, currentFrame, SCREEN_WIDTH/2-100, 280,
        200, 150);
    if (pressedKeys["13"] || (enterPressedInitially && !beyondTitleScreen)) {
        gameStarted = true;
        beyondTitleScreen = true;
    }
}

/* Game Over Screen */
var gameOverScreen = function(now, oldTime) {
    context.fillStyle = "black";
    context.fillRect(0, 0, 816, 480);
    context.font = "90px Luminari, fantasy";
    context.fillStyle = "red";
    context.fillText("Game Over", 170, 140);
    context.font = "60px Luminari, fantasy";
    context.fillStyle = "rgb(255, 247, 227, " + 
        (0.50+0.10*Math.cos(2*3.1415*(Math.round(now - oldTime)/1000))) + ")";
    context.fillText("Press ESC to Exit", 170, 260);
    let currentFrame = getAnimationFrame(11, Date.now());
    drawHeroFrame(11, currentFrame, SCREEN_WIDTH/2-100, 280, 200, 150);
    if (pressedKeys["27"]) {
        resetGame();
        gameOver = false;
    }
}

/* Level / Demo Complete Screen */
var demoCompleteScreen = function(now, oldTime) {
    context.fillStyle = "rgb(67, 67, 67)";
    context.fillRect(0, 0, 816, 480);
    context.font = "90px Luminari, fantasy";
    context.fillStyle = "#4BB543";
    context.fillText("Level Complete", 90, 140);
    context.font = "60px Luminari, fantasy";
    context.fillStyle = "white";
    const zeroPad = (num, places) => String(num).padStart(places, '0');
    context.fillText("Score: " + zeroPad(points, 5) + " Pts", 180, 220);
    context.font = "50px Luminari, fantasy";
    context.fillStyle = "rgb(255, 247, 227, " + 
        (0.50+0.10*Math.cos(2*3.1415*(Math.round(now - oldTime)/1000))) + ")";
    context.fillText("Press ESC to Exit", 200, 290);
    let currentFrame = getAnimationFrame(3, Date.now());
    drawHeroFrame(3, currentFrame, SCREEN_WIDTH/2-100, 280, 200, 150);
    if (pressedKeys["27"]) {
        resetGame();
        demoComplete = false;
    }
}

/* Main Game Loop */
var gameLoop = function(interval) {

    /* Clear Screen */
	context.clearRect(0, 0, canvas.width, canvas.height);

    /* Update scroll position */
    if (hero.levelX + hero.spriteWidth/2 >= SCREEN_WIDTH/2 && 
        scrollX+SCREEN_WIDTH < currentLevel[0].length*TILE_SIZE ||
        (hero.levelX + SCREEN_WIDTH/2 + hero.spriteWidth/2 <= 
        currentLevel[0].length*TILE_SIZE && scrollX > 0)) {
        scrollX = hero.levelX - SCREEN_WIDTH/2 + hero.spriteWidth/2;
    }
    hero.renderX = hero.levelX - scrollX;
    hero.renderY = hero.levelY;

    /* Draw Parallax Layers */
    for (var i=0; i<layers.length; i++) {
        if (i==0) {
            context.drawImage(layers[i], 0, 0, 816, 480);
        } else {
            var sx=0.0050*scrollX*Math.pow(2, i);
            if (i==1) sx-=0;
            else if (i==4) sx-=Math.floor(sx/263)*263;
            else sx-=Math.floor(sx/272)*272;
            var sy=0;
            var swidth=272;
            var sheight=160;
            context.drawImage(layers[i], sx, sy, swidth, sheight, 0, 0, 816, 480);
        }
    }

    drawLevelTiles(currentLevel, currentLevel[0].length, currentLevel.length, scrollX);

    /* Draw Hero */
    let animation = heroAnimations[heroAnimationIndex];
    let currentFrame = getAnimationFrame(heroAnimationIndex,
        Date.now()-resetAnimationTime);
    let frameCount = animation.frames ? animation.frames.length : animation.frameCount;
    if ((heroAnimationIndex==4 || heroAnimationIndex==5) && heroJumping && 
        currentFrame == frameCount - 1) {
        heroPeakJumping = true;
    }
    if ((heroAnimationIndex==4 || heroAnimationIndex==5) && heroPeakJumping) {
        currentFrame = frameCount - 1;
    }
    drawHeroFrame(heroAnimationIndex, currentFrame, hero.renderX, hero.renderY,
        hero.spriteWidth, hero.spriteHeight);

    let collisions = checkSpriteTileCollisions({
        levelX: hero.levelX+(hero.spriteWidth-HERO_HITBOX_WIDTH)/2,
        levelY: hero.levelY,
        spriteWidth: HERO_HITBOX_WIDTH,
        spriteHeight: hero.spriteHeight
    }, currentLevel);

    /* A */
    if (pressedKeys["65"]) {
        if (hero.levelX > -(hero.spriteWidth-HERO_HITBOX_WIDTH)/2 && !collisions.left) {
            hero.levelX -= 240*interval;
        }
        heroAnimationIndex = 2;
        heroDirection = 0;
    }

    /* D */
    if (pressedKeys["68"]) {
        if (hero.levelX + (hero.spriteWidth+HERO_HITBOX_WIDTH)/2 - 30 <
            currentLevel[0].length*TILE_SIZE && !collisions.right) {
            hero.levelX += 240*interval;
        }
        heroAnimationIndex = 3;
        heroDirection = 1;
    }

    if (!(pressedKeys[65] || pressedKeys[68])) {
        if (heroDirection) heroAnimationIndex = 1;
        else heroAnimationIndex = 0;
    }

    /* S */
    if (pressedKeys["83"]) {
        if (heroDirection) {
            heroAnimationIndex = 9;
        } else {
            heroAnimationIndex = 8;
        }
    }

    /* K */
    if (pressedKeys["75"]) {
        if (heroDirection) {
            if (currentFrame == 4 && previousHeroAnimationIndex == 7) {
                attackCompleted = true;
            }
            if (attackCompleted && pressedKeys["68"]) {
                heroAnimationIndex = 3;
            }  else if (attackCompleted && 
                !(pressedKeys[65] || pressedKeys[68])) {
                heroAnimationIndex = 1;
            } else {
                heroAnimationIndex = 7;
            }
        }
        else {
            if (currentFrame == 0 && previousHeroAnimationIndex == 6) {
                attackCompleted = true;
            }
            if (attackCompleted && pressedKeys["65"]) {    
                heroAnimationIndex = 2;
            } else if (attackCompleted && 
                !(pressedKeys[65] || pressedKeys[68])) {
                heroAnimationIndex = 0;
            } else {
                heroAnimationIndex = 6;
            }
        }
    } else {
        attackCompleted = false;
    }

    /* W */
    if (pressedKeys["87"]) {
        if (distanceFromFloor > 0 || hoverjump) {
            if (heroDirection) heroAnimationIndex = 5;
            else heroAnimationIndex = 4;
        }
        heroJumping = true;
    } else {
        heroJumping = false;
        heroPeakJumping = false;
    }
    

    if (previousHeroAnimationIndex != heroAnimationIndex) {
        resetAnimationTime = Date.now();
    }

    /* Physics */
    if ((hero.velocityY >= 0 && collisions.top)) {
        nearestFloorHeight = SCREEN_HEIGHT-collisions.topY;
    } else nearestFloorHeight = -hero.spriteHeight;

    distanceFromFloor = SCREEN_HEIGHT - 
        nearestFloorHeight - (hero.levelY + hero.spriteHeight);
    if (distanceFromFloor > 0 && !(hoverjump && heroJumping)) {
        hero.velocityY += 0.5;      /* Gravity */
    } else {
        hero.velocityY = 0;
    }
    if (distanceFromFloor <= 0) {
        hero.levelY = SCREEN_HEIGHT - nearestFloorHeight - 
            hero.spriteHeight;
    }

    /* Hover Jump */
    if (hoverjump) {
        if (heroJumping && !newJumpPress) {
            newJumpPress = true;
        } else newJumpPress = false;
        if (newJumpPress) {
            // hero.levelY -= 1;
            hero.velocityY = -4;
        }
    } else {
        /* Traditional Jump */
        if (heroJumping && !newJumpPress && 
            distanceFromFloor <= 0 && !jumpPressedLastFrame) {
            newJumpPress = true;
        } else newJumpPress = false;
        if (newJumpPress) {
            hero.levelY -= 1;
            hero.velocityY = -10;
        }
    }

    if ((hero.velocityY > 0 && collisions.top) || 
        (hero.velocityY < 0 && hero.levelY <= -10) ||
        (hero.velocityY < 0 && collisions.bottom)) {
        hero.velocityY = 0;
    }
    hero.levelY += hero.velocityY;

    /* Wings */
    let touchedWings = {top: false, topY:null, 
        bottom:false, left: false, right: false};
    checkSpriteTileCollision({
        levelX: hero.levelX+(hero.spriteWidth-HERO_HITBOX_WIDTH)/2,
        levelY: hero.levelY,
        spriteWidth: HERO_HITBOX_WIDTH,
        spriteHeight: hero.spriteHeight
    }, 82*TILE_SIZE, 13*TILE_SIZE, 10, touchedWings);
    if (touchedWings.top || touchedWings.bottom || 
        touchedWings.left || touchedWings.right) {
        if (currentLevel[13][82] == 10) {
            points += 800;
            currentLevel[13][82] = 0;
        }
        hoverjump = true;
    }

    /* Golden Cross */
    let touchedCross = {top: false, topY:null, 
        bottom:false, left: false, right: false};
    checkSpriteTileCollision({
        levelX: hero.levelX+(hero.spriteWidth-HERO_HITBOX_WIDTH)/2,
        levelY: hero.levelY,
        spriteWidth: HERO_HITBOX_WIDTH,
        spriteHeight: hero.spriteHeight
    }, 102*TILE_SIZE, 2*TILE_SIZE, 10, touchedCross);
    if (touchedCross.top || touchedCross.bottom || 
        touchedCross.left || touchedCross.right) {
        if (currentLevel[2][102] == 12) {
            points += 10000;
            currentLevel[2][102] = 0;
        }
    }

    jumpPressedLastFrame = pressedKeys["87"];
    previousHeroAnimationIndex = heroAnimationIndex;

    if (hero.levelX + hero.spriteWidth/2 >= 
        TILE_SIZE*currentLevel[0].length) {
        if (currentLevelIndex < levels.length - 1) {
            // Keep the run score while resetGame prepares the next level.
            let score = points;
            currentLevelIndex++;
            resetGame();
            points = score;
        } else {
            demoComplete = true;
            gameStarted = false;
        }
    }

    if (hero.levelY >= SCREEN_HEIGHT) {
        gameOver = true;
        gameStarted = false;
    }
}

/* Set FPS */
let FPS = 60;
let interval = 1 / FPS;
let frameCounter = 0;
let oldTime = Date.now();
let previousFrameTime = oldTime;

/* Load Current Level */
loadLevel(currentLevelIndex);

/* Game States */
setInterval(function() {
    let now = Date.now();
    if (!gameStarted) {
        if (gameOver) {
            if (audioPlaying) {
                audioElement.pause();
                audioPlaying = false;
            }
            gameOverScreen(now, oldTime);
        } else if (demoComplete){
            demoCompleteScreen(now, oldTime);
        } else {
            if (audioPlaying) {
                audioElement.pause();
                audioPlaying = false;
            }
            titleScreenLoop(now, oldTime);
        }
    } else {
        if (!audioPlaying) {
            audioElement.currentTime = 0;
            if (enterPressedInitially) {
                audioElement.play();
                document.removeEventListener('keypress', 
                    onInitialEnterPress);
            }
            audioPlaying = true;
        }
        gameLoop(interval);
        context.font = "28px Luminari, fantasy";
        context.fillStyle = "rgb(255, 247, 227)";
        context.fillText(points + " Pts", 10, 50);
    }
    previousFrameTime = now;
    frameCounter++;
    if (now - oldTime > 1000) {
        frameCounter = 0;
        oldTime = Date.now();
    }
}, interval * 1000);
