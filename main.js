const canvas = document.getElementById('main_screen');
const context = canvas.getContext("2d");
var pressedKeys = {};
window.onkeyup = function(e) { pressedKeys[e.keyCode] = false; }
window.onkeydown = function(e) { pressedKeys[e.keyCode] = true; }

const layers = [
    document.getElementById("parallax-mountain-bg"),
    document.getElementById("parallax-mountain-montain-far"),
    document.getElementById("parallax-mountain-mountains"),
    document.getElementById("parallax-mountain-trees"),
    document.getElementById("parallax-mountain-foreground-trees")
];

const tiles = document.getElementById("tiles");

const heroIdleAnimationLeft = document.getElementById("hero-idle-left");
const heroIdleAnimationRight = document.getElementById("hero-idle-right");
const heroRunAnimationLeft = document.getElementById("hero-run-left");
const heroRunAnimationRight = document.getElementById("hero-run-right");
const heroJumpAnimationLeft = document.getElementById("hero-jump-left");
const heroJumpAnimationRight = document.getElementById("hero-jump-right");
const heroAttackAnimationLeft = document.getElementById("hero-attack-left");
const heroAttackAnimationRight = document.getElementById("hero-attack-right");
const heroCrouchAnimationLeft = document.getElementById("hero-crouch-left");
const heroCrouchAnimationRight = document.getElementById("hero-crouch-right");
const heroHurtAnimationLeft = document.getElementById("hero-hurt-left");
const heroHurtAnimationRight = document.getElementById("hero-hurt-right");

let heroAnimations = [
    [heroIdleAnimationLeft, 4],
    [heroIdleAnimationRight, 4],
    [heroRunAnimationLeft, 6],
    [heroRunAnimationRight, 6],
    [heroJumpAnimationLeft, 4],
    [heroJumpAnimationRight, 4],
    [heroAttackAnimationLeft, 5],
    [heroAttackAnimationRight, 5],
    [heroCrouchAnimationLeft, 1],
    [heroCrouchAnimationRight, 1],
    [heroHurtAnimationLeft, 1],
    [heroHurtAnimationRight, 1],
]

let heroAnimationIndex = 1;
let heroDirection = 1;
let heroJumping = false;
let heroPeakJumping = false;
let jumpPressedLastFrame = false;

var scrollX = 0;

var resetAnimationTime = Date.now();
var previousHeroAnimationIndex = 1;

var levels = [
    [
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,2,2,2,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    ],
];

const SCREEN_WIDTH = 816;
const SCREEN_HEIGHT = 480;
const TILE_SIZE = 32;
let distanceFromFloor = 0;
let nearestFloorHeight = TILE_SIZE;
let newJumpPress = false;

let hero = {
    spriteWidth: 100,
    spriteHeight: 59,
    levelX: 100,
    levelY: 480-32-59,
    renderX: 100,
    renderY: 480-32-59,
    velocityY: 0,
}

/* 64x10 tiles, each 32x32 pixels */
var drawTile = function(x, y, tileIndex) {
    var sx = (tileIndex*32) - (64*Math.floor(tileIndex/64)*32);
    var sy = Math.floor(tileIndex/64)*32;
    context.drawImage(tiles, sx, sy, 32, 32, x, y, 32, 32);
}

var drawLevelTiles = function(level, hTiles, vTiles, scrollX) {
    // console.log(level)
    for (var i=0; i<hTiles; i++) {
        for (var j=0; j<vTiles; j++) {
            if (level[j][i] != 0) {
                drawTile(32*i-scrollX, j*32, 0x1BF);
            }
        }
    }
}

var checkSpriteTileCollision = function(sprite, tileX, tileY, tileIndex, collisions) {
    if ((sprite.levelX + sprite.spriteWidth >= tileX &&
        sprite.levelX <= tileX + TILE_SIZE) && 
        (sprite.levelY + sprite.spriteHeight >= tileY &&
            sprite.levelY <= tileY + TILE_SIZE)) {
                let intersect = {
                    x: Math.max(sprite.levelX,tileX),
                    y: Math.max(sprite.levelY,tileY),
                }
                intersect.width = Math.min(sprite.levelX + sprite.spriteWidth, tileX + TILE_SIZE) - intersect.x;
                intersect.height = Math.min(sprite.levelY + sprite.spriteHeight, tileY + TILE_SIZE) - intersect.y;
                if (sprite.levelX+sprite.spriteWidth/2 > tileX+TILE_SIZE/2 && intersect.height > intersect.width) collisions.left = true;
                if (sprite.levelX+sprite.spriteWidth/2 < tileX+TILE_SIZE/2 && intersect.height > intersect.width) collisions.right = true;
                if (sprite.levelY+sprite.spriteHeight/2 < tileY+TILE_SIZE/2 && intersect.width > intersect.height && intersect.width > 4) {
                    collisions.top = true;
                    collisions.topY = tileY;
                }
                if (sprite.levelY+sprite.spriteHeight/2 > tileY+TILE_SIZE/2 && intersect.width > intersect.height && intersect.width > 4) collisions.bottom = true;
        }
}

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
                checkSpriteTileCollision(sprite, i*TILE_SIZE, j*TILE_SIZE, level[j][i], collisions);
            }
        }
    }
    return collisions;
}

var gameLoop = function(interval) {
    

    /* Clear Screen */
	context.clearRect(0, 0, canvas.width, canvas.height);

    /* Update scroll position */
    if (hero.levelX + hero.spriteWidth/2 >= SCREEN_WIDTH/2 && scrollX+SCREEN_WIDTH < levels[0][0].length*TILE_SIZE ||
        (hero.levelX + SCREEN_WIDTH/2 + hero.spriteWidth/2 <= levels[0][0].length*TILE_SIZE && scrollX > 0)) {
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

    drawLevelTiles(levels[0], 51, 15, scrollX);

    /* Draw Hero */
    let currentFrame = Math.floor((((Date.now()-resetAnimationTime)/100) % heroAnimations[heroAnimationIndex][1]));
    if ((heroAnimationIndex==4 || heroAnimationIndex==5) && heroJumping && currentFrame == heroAnimations[heroAnimationIndex][1] - 1) {
        heroPeakJumping = true;
    }
    if ((heroAnimationIndex==4 || heroAnimationIndex==5) && heroPeakJumping) currentFrame = heroAnimations[heroAnimationIndex][1] - 1;
    // Left facing, reverse order of frames since images are flipped
    if (heroDirection == 0) currentFrame = heroAnimations[heroAnimationIndex][1] - currentFrame - 1; 
    context.drawImage(heroAnimations[heroAnimationIndex][0], currentFrame*hero.spriteWidth, 0, hero.spriteWidth, hero.spriteHeight, hero.renderX, hero.renderY, hero.spriteWidth, hero.spriteHeight);

    let collisions = checkSpriteTileCollisions({
        levelX: hero.levelX+25,
        levelY: hero.levelY,
        spriteWidth: 50,
        spriteHeight: hero.spriteHeight
    }, levels[0]);

    let hoverjump = true;

    /* A */
    if (pressedKeys["65"]) {
        if (hero.levelX > -25 && !collisions.left) {
            hero.levelX -= 240*interval;
        }
        heroAnimationIndex = 2;
        heroDirection = 0;
    }

    /* D */
    if (pressedKeys["68"]) {
        if (hero.levelX + hero.spriteWidth - 25 < levels[0][0].length*TILE_SIZE && !collisions.right) {
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
            heroAnimationIndex = 7;
        }
        else {
            heroAnimationIndex = 6;
        }
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
    if ((hero.velocityY >= 0 && collisions.top)) nearestFloorHeight = SCREEN_HEIGHT-collisions.topY;
    else nearestFloorHeight = TILE_SIZE;

    distanceFromFloor = SCREEN_HEIGHT - nearestFloorHeight - (hero.levelY + hero.spriteHeight);
    if (distanceFromFloor > 0 && !(hoverjump && heroJumping)) {
        hero.velocityY += 0.5;      /* Gravity */
    } else {
        hero.velocityY = 0;
    }
    if (distanceFromFloor <= 0) {
        hero.levelY = SCREEN_HEIGHT - nearestFloorHeight - hero.spriteHeight;
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
        if (heroJumping && !newJumpPress && distanceFromFloor <= 0 && !jumpPressedLastFrame) {
            newJumpPress = true;
        } else newJumpPress = false;
        if (newJumpPress) {
            hero.levelY -= 1;
            hero.velocityY = -10;
        }
    }

    if ((hero.velocityY > 0 && collisions.top) || (hero.velocityY < 0 && collisions.bottom)) {
        hero.velocityY = 0;
    }
    hero.levelY += hero.velocityY;

    console.log(collisions);

    jumpPressedLastFrame = pressedKeys["87"];
    previousHeroAnimationIndex = heroAnimationIndex;
}

let FPS = 60;
let interval = 1 / FPS;
let frameCounter = 0;
let oldTime = Date.now();
let previousFrameTime = oldTime;
setInterval(function() {
    let now = Date.now();
    gameLoop(interval);
    previousFrameTime = now;
    frameCounter++;
    if (now - oldTime > 1000) {
        document.getElementById('fps').innerHTML = frameCounter;
        frameCounter = 0;
        oldTime = Date.now();
    }
}, interval * 1000);