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

const heroAttackAnimationRight  =    Array.from({ length: 8 }, function(_, index) {
    return document.getElementById("hero-attack-right-" + String(index).padStart(2, "0"));
});
const heroHurtAnimationRight    =    document.getElementById("hero-hurt-right");

var getFrameImages = function(prefix, frameCount) {
    return Array.from({ length: frameCount }, function(_, index) {
        return document.getElementById(prefix + "-" + String(index).padStart(2, "0"));
    });
}

const jamesIdleRightFrames = getFrameImages("james-idle-right", 2);
const ribbonPigRunRightFrames = getFrameImages("ribbon-pig-run-right", 6);
const ribbonPigRunLeftFrames = getFrameImages("ribbon-pig-run-left", 6);
const ribbonPigDieFrames = getFrameImages("ribbon-pig-die", 6);
const ribbonPigDeathEffectFrames = getFrameImages("ribbon-pig-death-effect", 4);
const RIBBON_PIG_ANIMATION_FPS = 9;

const HERO_DIRECTION = Object.freeze({
    LEFT: "left",
    RIGHT: "right",
});

const HERO_ANIMATION = Object.freeze({
    IDLE_LEFT: 0,
    IDLE_RIGHT: 1,
    RUN_LEFT: 2,
    RUN_RIGHT: 3,
    JUMP_LEFT: 4,
    JUMP_RIGHT: 5,
    ATTACK_LEFT: 6,
    ATTACK_RIGHT: 7,
    HURT_LEFT: 8,
    HURT_RIGHT: 9,
});

let heroAnimations = [
    { frames: getFrameImages("hero-idle-right", 2), fps: 3, mirrorX: true },
    { frames: getFrameImages("hero-idle-right", 2), fps: 3 },
    { frames: getFrameImages("hero-run-right", 6), fps: 10, mirrorX: true },
    { frames: getFrameImages("hero-run-right", 6), fps: 10 },
    { frames: getFrameImages("hero-jump-right", 8), fps: 10, mirrorX: true },
    { frames: getFrameImages("hero-jump-right", 8), fps: 10 },
    { frames: heroAttackAnimationRight, fps: 10, mirrorX: true },
    { frames: heroAttackAnimationRight, fps: 10 },
    { sheet: heroHurtAnimationRight, frameCount: 1, frameWidth: 100, frameHeight: 59, fps: 10, mirrorX: true },
    { sheet: heroHurtAnimationRight, frameCount: 1, frameWidth: 100, frameHeight: 59, fps: 10 },
]

var getAnimationFrame = function(animationIndex, elapsedMs) {
    let animation = heroAnimations[animationIndex];
    let frameCount = animation.frames ? animation.frames.length : animation.frameCount;
    return Math.floor(elapsedMs * animation.fps / 1000) % frameCount;
}

var getJamesLevelEndPosition = function(level) {
    const jamesWidth = 128;
    const jamesHeight = 96;
    const endMargin = TILE_SIZE * 4;
    const levelWidth = level[0].length * TILE_SIZE;
    const jamesLevelX = Math.max(0, levelWidth - endMargin - jamesWidth);
    const centerTile = Math.min(
        level[0].length - 1,
        Math.floor((jamesLevelX + jamesWidth / 2) / TILE_SIZE)
    );
    let floorRow = -1;
    for (let row = level.length - 1; row >= 0; row--) {
        if (level[row][centerTile] !== 0) {
            floorRow = row;
            break;
        }
    }
    if (floorRow < 0) {
        throw new Error("James preview has no floor in level " + currentLevelIndex);
    }
    return {
        x: jamesLevelX,
        y: floorRow * TILE_SIZE - jamesHeight,
        width: jamesWidth,
        height: jamesHeight,
    };
}

var drawJamesFrame = function(frame, x, y, width) {
    if (!frame || !frame.complete || frame.naturalWidth === 0) {
        return;
    }
    context.save();
    context.translate(x + width, y);
    context.scale(-1, 1);
    context.drawImage(frame, 0, 0);
    context.restore();
}

var drawJamesLevelEndPreview = function(position, elapsedMs) {
    const screenX = position.x - scrollX;
    if (screenX + position.width < 0 || screenX > SCREEN_WIDTH) {
        return;
    }
    const frameIndex = Math.floor(elapsedMs * 3 / 1000) % 2;
    const frame = jamesIdleRightFrames[frameIndex];
    drawJamesFrame(frame, screenX, position.y, position.width);
}

var drawHugHeart = function(x, y, elapsedMs) {
    context.save();
    const pulse = 1 + 0.12 * Math.sin(elapsedMs / 110);
    context.translate(x, y);
    context.scale(pulse, pulse);
    context.fillStyle = "#f06b86";
    context.beginPath();
    context.moveTo(0, 5);
    context.bezierCurveTo(-13, -3, -8, -13, 0, -6);
    context.bezierCurveTo(8, -13, 13, -3, 0, 5);
    context.fill();
    context.restore();
}

var drawReunionAnimation = function(centerX, y, elapsedMs) {
    const frameIndex = Math.floor(elapsedMs * 3 / 1000) % 2;
    const soniaX = centerX - (HERO_WIDTH + HERO_JAMES_REUNION_DISTANCE) / 2;
    const jamesX = soniaX + HERO_JAMES_REUNION_DISTANCE;
    drawJamesFrame(jamesIdleRightFrames[frameIndex], jamesX, y, HERO_WIDTH);
    drawHeroFrame(
        HERO_ANIMATION.IDLE_RIGHT,
        frameIndex,
        soniaX,
        y,
        HERO_WIDTH,
        HERO_HEIGHT
    );
    drawHugHeart(centerX, y - 8, elapsedMs);
}

var drawHeroFrame = function(animationIndex, frameIndex, x, y, width, height) {
    let animation = heroAnimations[animationIndex];
    if (animation.frames) {
        let frame = animation.frames[frameIndex];
        if (frame && frame.complete && frame.naturalWidth > 0) {
            if (animation.mirrorX) {
                context.save();
                context.translate(x + frame.naturalWidth, y);
                context.scale(-1, 1);
                context.drawImage(frame, 0, 0);
                context.restore();
            } else {
                context.drawImage(frame, x, y);
            }
        }
        return;
    }

    if (animation.reverseFrameOrder) {
        frameIndex = animation.frameCount - frameIndex - 1;
    }
    if (animation.mirrorX) {
        context.save();
        context.translate(x + width, y);
        context.scale(-1, 1);
        context.drawImage(animation.sheet, frameIndex * animation.frameWidth, 0,
            animation.frameWidth, animation.frameHeight, 0, 0, width, height);
        context.restore();
    } else {
        context.drawImage(animation.sheet, frameIndex * animation.frameWidth, 0,
            animation.frameWidth, animation.frameHeight, x, y, width, height);
    }
}

let heroAnimationIndex = HERO_ANIMATION.IDLE_RIGHT;
let heroDirection = HERO_DIRECTION.RIGHT;
let heroJumping = false;
let heroPeakJumping = false;
let jumpPressedLastFrame = false;
let hoverjump = false;
let jumpAnimationPhase = "normal";
let jumpPhaseStartedAt = 0;

var scrollX = 0;

var resetAnimationTime = Date.now();
var previousHeroAnimationIndex = HERO_ANIMATION.IDLE_RIGHT;
let currentLevel = [];

let points = 0;

let gameStarted = false;
let gameOver = false;

let demoComplete = false;
let jamesHug = null;

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
    resetLevelEnemies(levelIndex);
}

const SCREEN_WIDTH = 816;
const SCREEN_HEIGHT = 480;
const TILE_SIZE = 32;
const HERO_WIDTH = 128;
const HERO_HEIGHT = 96;
const HERO_HITBOX_WIDTH = 50;
const HERO_JAMES_REUNION_DISTANCE = 72;
const RIBBON_PIG_WIDTH = 64;
const RIBBON_PIG_HEIGHT = 48;
const RIBBON_PIG_SPEED = 72;
let distanceFromFloor = 0;
let nearestFloorHeight = -HERO_HEIGHT;
let newJumpPress = false;
let attackState = null;
let attackKeyWasDown = false;

let hero = {
    spriteWidth: HERO_WIDTH,
    spriteHeight: HERO_HEIGHT,
    levelX: 140,
    levelY: SCREEN_HEIGHT-TILE_SIZE-HERO_HEIGHT,
    renderX: 100,
    renderY: SCREEN_HEIGHT-TILE_SIZE-HERO_HEIGHT,
    velocityY: 0,
}

let levelEnemies = [];

var resetLevelEnemies = function(levelIndex) {
    const definitions = (window.gameLevelEnemies || [])[levelIndex] || [];
    levelEnemies = definitions.map(function(definition) {
        if (definition.type !== "ribbon_pig") {
            throw new Error("Unknown level enemy type: " + definition.type);
        }
        const centerColumn = Math.floor(
            (definition.x + RIBBON_PIG_WIDTH / 2) / TILE_SIZE
        );
        let floorRow = -1;
        for (let row = currentLevel.length - 1; row >= 0; row--) {
            if (currentLevel[row][centerColumn] !== 0) {
                floorRow = row;
                break;
            }
        }
        if (floorRow < 0) {
            throw new Error("Ribbon pig spawn has no supporting floor.");
        }
        return {
            type: definition.type,
            levelX: definition.x,
            levelY: floorRow * TILE_SIZE - RIBBON_PIG_HEIGHT,
            direction: definition.direction < 0 ? -1 : 1,
            startedAt: Date.now(),
            state: "alive",
        };
    });
}

var updateLevelEnemies = function(deltaSeconds, now) {
    levelEnemies.forEach(function(enemy) {
        if (enemy.type !== "ribbon_pig") {
            return;
        }
        if (enemy.state === "dying") {
            if (now - enemy.diedAt >=
                ribbonPigDieFrames.length * 1000 / RIBBON_PIG_ANIMATION_FPS) {
                enemy.state = "death_effect";
                enemy.deathEffectStartedAt = enemy.diedAt +
                    ribbonPigDieFrames.length * 1000 / RIBBON_PIG_ANIMATION_FPS;
            }
            if (enemy.state === "dying") {
                return;
            }
        }
        if (enemy.state === "death_effect") {
            return;
        }
        const feetRow = Math.floor((enemy.levelY + RIBBON_PIG_HEIGHT) / TILE_SIZE);
        const nextX = enemy.levelX +
            enemy.direction * RIBBON_PIG_SPEED * deltaSeconds;
        const leadingEdgeX = nextX +
            (enemy.direction > 0 ? RIBBON_PIG_WIDTH : 0);
        const supportProbeX = nextX +
            (enemy.direction > 0 ? RIBBON_PIG_WIDTH - 8 : 8);
        const supportColumn = Math.floor(supportProbeX / TILE_SIZE);
        const hasGroundAhead = currentLevel[feetRow] &&
            currentLevel[feetRow][supportColumn] !== 0;
        const obstacleColumn = Math.floor(
            (leadingEdgeX - (enemy.direction < 0 ? 1 : 0)) / TILE_SIZE
        );
        const firstBodyRow = Math.floor(
            (enemy.levelY + 16) / TILE_SIZE
        );
        const lastBodyRow = Math.floor(
            (enemy.levelY + RIBBON_PIG_HEIGHT - 8) / TILE_SIZE
        );
        let obstacleAhead = false;
        for (let row = firstBodyRow; row <= lastBodyRow; row++) {
            if (currentLevel[row] && currentLevel[row][obstacleColumn] !== 0) {
                obstacleAhead = true;
                break;
            }
        }
        if (!hasGroundAhead || obstacleAhead) {
            enemy.direction *= -1;
            return;
        }
        enemy.levelX = nextX;
    });
    levelEnemies = levelEnemies.filter(function(enemy) {
        return enemy.state !== "death_effect" ||
            now - enemy.deathEffectStartedAt <
                ribbonPigDeathEffectFrames.length * 1000 / RIBBON_PIG_ANIMATION_FPS;
    });
}

var drawLevelEnemies = function(now) {
    levelEnemies.forEach(function(enemy) {
        if (enemy.type !== "ribbon_pig") {
            return;
        }
        const frames = enemy.state === "dying"
            ? ribbonPigDieFrames
            : enemy.state === "death_effect"
                ? ribbonPigDeathEffectFrames
                : enemy.direction > 0
                    ? ribbonPigRunRightFrames
                    : ribbonPigRunLeftFrames;
        const frameIndex = enemy.state === "dying"
            ? Math.min(
                frames.length - 1,
                Math.floor(
                    (now - enemy.diedAt) * RIBBON_PIG_ANIMATION_FPS / 1000
                )
            )
            : enemy.state === "death_effect"
                ? Math.min(
                    frames.length - 1,
                    Math.floor(
                        (now - enemy.deathEffectStartedAt) *
                            RIBBON_PIG_ANIMATION_FPS / 1000
                    )
                )
                : Math.floor(
                    (now - enemy.startedAt) * RIBBON_PIG_ANIMATION_FPS / 1000
                ) % frames.length;
        const frame = frames[frameIndex];
        if (frame && frame.complete && frame.naturalWidth > 0) {
            context.drawImage(frame, enemy.levelX - scrollX, enemy.levelY);
        }
    });
}

var heroTouchesLevelEnemy = function(enemy) {
    const heroBox = {
        left: hero.levelX + (hero.spriteWidth - HERO_HITBOX_WIDTH) / 2,
        right: hero.levelX + (hero.spriteWidth + HERO_HITBOX_WIDTH) / 2,
        top: hero.levelY + 18,
        bottom: hero.levelY + hero.spriteHeight - 8,
    };
    const pigBox = {
        left: enemy.levelX + 7,
        right: enemy.levelX + RIBBON_PIG_WIDTH - 7,
        top: enemy.levelY + 10,
        bottom: enemy.levelY + RIBBON_PIG_HEIGHT - 6,
    };
    return heroBox.left < pigBox.right &&
        heroBox.right > pigBox.left &&
        heroBox.top < pigBox.bottom &&
        heroBox.bottom > pigBox.top;
}

var checkLevelEnemyCollisions = function() {
    if (attackState) {
        return false;
    }
    return levelEnemies.some(function(enemy) {
        return enemy.type === "ribbon_pig" &&
            enemy.state === "alive" &&
            heroTouchesLevelEnemy(enemy);
    });
}

var startHeroAttack = function(now) {
    const isGrounded = distanceFromFloor <= 0 &&
        hero.velocityY === 0 &&
        jumpAnimationPhase === "normal";
    if (!isGrounded || attackState || !pressedKeys["83"] || attackKeyWasDown) {
        return;
    }
    attackState = {
        direction: heroDirection,
        startedAt: now,
        hitEnemies: new Set(),
    };
    resetAnimationTime = now;
}

var tryHitLevelEnemies = function(frameIndex, now) {
    if (!attackState || frameIndex < 3 || frameIndex > 6) {
        return;
    }
    const heroCenterX = hero.levelX + hero.spriteWidth / 2;
    const attackReach = 84;
    const attackBox = {
        left: attackState.direction === HERO_DIRECTION.RIGHT
            ? heroCenterX
            : heroCenterX - attackReach,
        right: attackState.direction === HERO_DIRECTION.RIGHT
            ? heroCenterX + attackReach
            : heroCenterX,
        top: hero.levelY + 24,
        bottom: hero.levelY + 78,
    };
    levelEnemies.forEach(function(enemy) {
        if (enemy.type !== "ribbon_pig" ||
            enemy.state !== "alive" ||
            attackState.hitEnemies.has(enemy)) {
            return;
        }
        const pigBox = {
            left: enemy.levelX + 7,
            right: enemy.levelX + RIBBON_PIG_WIDTH - 7,
            top: enemy.levelY + 10,
            bottom: enemy.levelY + RIBBON_PIG_HEIGHT - 6,
        };
        const intersects = attackBox.left < pigBox.right &&
            attackBox.right > pigBox.left &&
            attackBox.top < pigBox.bottom &&
            attackBox.bottom > pigBox.top;
        if (intersects) {
            enemy.state = "dying";
            enemy.diedAt = now;
            attackState.hitEnemies.add(enemy);
        }
    });
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
    heroAnimationIndex = HERO_ANIMATION.IDLE_RIGHT;
    heroDirection = HERO_DIRECTION.RIGHT;
    heroJumping = false;
    heroPeakJumping = false;
    jumpPressedLastFrame = false;
    jumpAnimationPhase = "normal";
    jumpPhaseStartedAt = 0;
    hoverjump = false;
    scrollX = 0;
    resetAnimationTime = Date.now();
    previousHeroAnimationIndex = HERO_ANIMATION.IDLE_RIGHT;
    points = 0;
    distanceFromFloor = 0;
    nearestFloorHeight = -HERO_HEIGHT;
    newJumpPress = false;
    attackState = null;
    attackKeyWasDown = Boolean(pressedKeys["83"]);
    jamesHug = null;
}

var finishLevelAfterHug = function() {
    if (currentLevelIndex < levels.length - 1) {
        const score = points;
        currentLevelIndex++;
        resetGame();
        points = score;
    } else {
        jamesHug = null;
        demoComplete = true;
        gameStarted = false;
    }
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
    drawReunionAnimation(SCREEN_WIDTH / 2, 300, now);
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
    context.fillText("Press ESC to Restart", 170, 260);
    let currentFrame = getAnimationFrame(HERO_ANIMATION.HURT_RIGHT, Date.now());
    drawHeroFrame(
        HERO_ANIMATION.HURT_RIGHT,
        currentFrame,
        SCREEN_WIDTH / 2 - 100,
        280,
        200,
        150
    );
    if (pressedKeys["27"]) {
        resetGame();
        gameOver = false;
        gameStarted = true;
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
    drawReunionAnimation(SCREEN_WIDTH / 2, 340, now);
    if (pressedKeys["27"]) {
        resetGame();
        demoComplete = false;
    }
}

/* Main Game Loop */
var gameLoop = function(interval) {

    /* Clear Screen */
	context.clearRect(0, 0, canvas.width, canvas.height);

    const animationTime = Date.now();
    startHeroAttack(animationTime);
    attackKeyWasDown = Boolean(pressedKeys["83"]);
    if (attackState &&
        animationTime - attackState.startedAt >=
            heroAnimations[attackState.direction === HERO_DIRECTION.RIGHT
                ? HERO_ANIMATION.ATTACK_RIGHT
                : HERO_ANIMATION.ATTACK_LEFT].frames.length * 1000 /
                heroAnimations[HERO_ANIMATION.ATTACK_RIGHT].fps) {
        attackState = null;
        heroAnimationIndex = heroDirection === HERO_DIRECTION.RIGHT
            ? HERO_ANIMATION.IDLE_RIGHT
            : HERO_ANIMATION.IDLE_LEFT;
        resetAnimationTime = animationTime;
    }
    const jamesPosition = getJamesLevelEndPosition(currentLevel);
    if (jamesHug) {
        const elapsed = animationTime - jamesHug.startedAt;
        const progress = Math.min(1, elapsed / 350);
        const easedProgress = progress * progress * (3 - 2 * progress);
        hero.levelX = jamesHug.startX +
            (jamesHug.targetX - jamesHug.startX) * easedProgress;
        hero.levelY = jamesPosition.y;
        hero.velocityY = 0;
        heroDirection = HERO_DIRECTION.RIGHT;
        heroAnimationIndex = HERO_ANIMATION.IDLE_RIGHT;
    }

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
    updateLevelEnemies(interval, animationTime);

    drawJamesLevelEndPreview(jamesPosition, animationTime - resetAnimationTime);
    if (jamesHug) {
        hero.renderX = hero.levelX - scrollX;
        hero.renderY = hero.levelY;
        const elapsed = animationTime - jamesHug.startedAt;
        const hugFrame = getAnimationFrame(HERO_ANIMATION.IDLE_RIGHT, elapsed);
        drawHeroFrame(HERO_ANIMATION.IDLE_RIGHT, hugFrame, hero.renderX, hero.renderY,
            hero.spriteWidth, hero.spriteHeight);
        drawHugHeart(
            (hero.renderX + jamesPosition.x - scrollX + jamesPosition.width) / 2,
            jamesPosition.y - 4,
            elapsed
        );
        if (elapsed >= 3000) {
            finishLevelAfterHug();
        }
        return;
    }

    /* Draw Hero */
    if (jumpAnimationPhase === "flight" && hero.velocityY > 0) {
        jumpAnimationPhase = "falling";
        jumpPhaseStartedAt = animationTime;
    }
    if ((jumpAnimationPhase === "flight" ||
            jumpAnimationPhase === "falling") &&
        distanceFromFloor <= 0 && hero.velocityY >= 0) {
        jumpAnimationPhase = "landing";
        jumpPhaseStartedAt = animationTime;
    }
    if (!attackState && jumpAnimationPhase !== "normal") {
        heroAnimationIndex = heroDirection === HERO_DIRECTION.RIGHT
            ? HERO_ANIMATION.JUMP_RIGHT
            : HERO_ANIMATION.JUMP_LEFT;
    }
    if (attackState) {
        heroAnimationIndex = attackState.direction === HERO_DIRECTION.RIGHT
            ? HERO_ANIMATION.ATTACK_RIGHT
            : HERO_ANIMATION.ATTACK_LEFT;
    }
    let animation = heroAnimations[heroAnimationIndex];
    let currentFrame = attackState
        ? Math.min(
            animation.frames.length - 1,
            Math.floor((animationTime - attackState.startedAt) * animation.fps / 1000)
        )
        : getAnimationFrame(heroAnimationIndex, animationTime-resetAnimationTime);
    let frameCount = animation.frames ? animation.frames.length : animation.frameCount;
    if (!attackState && jumpAnimationPhase === "flight") {
        currentFrame = Math.min(3, frameCount - 1);
    } else if (!attackState && jumpAnimationPhase === "falling") {
        currentFrame = 4 + Math.min(
            1,
            Math.floor(
                (animationTime - jumpPhaseStartedAt) * animation.fps / 1000
            )
        );
    } else if (!attackState && jumpAnimationPhase === "landing") {
        currentFrame = 6 + Math.floor(
            (animationTime - jumpPhaseStartedAt) * animation.fps / 1000
        );
        if (currentFrame >= frameCount) {
            jumpAnimationPhase = "normal";
            jumpPhaseStartedAt = 0;
            heroAnimationIndex = pressedKeys["65"] ? HERO_ANIMATION.RUN_LEFT :
                pressedKeys["68"] ? HERO_ANIMATION.RUN_RIGHT :
                    heroDirection === HERO_DIRECTION.RIGHT
                        ? HERO_ANIMATION.IDLE_RIGHT
                        : HERO_ANIMATION.IDLE_LEFT;
            animation = heroAnimations[heroAnimationIndex];
            frameCount = animation.frames ? animation.frames.length : animation.frameCount;
            currentFrame = getAnimationFrame(
                heroAnimationIndex, animationTime - resetAnimationTime
            );
        }
    }
    if (!attackState && jumpAnimationPhase === "normal" &&
        (heroAnimationIndex === HERO_ANIMATION.JUMP_LEFT ||
            heroAnimationIndex === HERO_ANIMATION.JUMP_RIGHT) && heroJumping &&
        currentFrame == frameCount - 1) {
        heroPeakJumping = true;
    }
    if (!attackState && jumpAnimationPhase === "normal" &&
        (heroAnimationIndex === HERO_ANIMATION.JUMP_LEFT ||
            heroAnimationIndex === HERO_ANIMATION.JUMP_RIGHT) && heroPeakJumping) {
        currentFrame = frameCount - 1;
    }
    tryHitLevelEnemies(currentFrame, animationTime);
    drawLevelEnemies(animationTime);
    drawHeroFrame(heroAnimationIndex, currentFrame, hero.renderX, hero.renderY,
        hero.spriteWidth, hero.spriteHeight);

    let collisions = checkSpriteTileCollisions({
        levelX: hero.levelX+(hero.spriteWidth-HERO_HITBOX_WIDTH)/2,
        levelY: hero.levelY,
        spriteWidth: HERO_HITBOX_WIDTH,
        spriteHeight: hero.spriteHeight
    }, currentLevel);

    if (attackState) {
        heroAnimationIndex = attackState.direction === HERO_DIRECTION.RIGHT
            ? HERO_ANIMATION.ATTACK_RIGHT
            : HERO_ANIMATION.ATTACK_LEFT;
        heroJumping = false;
        heroPeakJumping = false;
        newJumpPress = false;
    } else {
    /* A */
    if (pressedKeys["65"]) {
        if (hero.levelX > -(hero.spriteWidth-HERO_HITBOX_WIDTH)/2 && !collisions.left) {
            hero.levelX -= 240*interval;
        }
        heroAnimationIndex = HERO_ANIMATION.RUN_LEFT;
        heroDirection = HERO_DIRECTION.LEFT;
    }

    /* D */
    if (pressedKeys["68"]) {
        if (hero.levelX + (hero.spriteWidth+HERO_HITBOX_WIDTH)/2 - 30 <
            currentLevel[0].length*TILE_SIZE && !collisions.right) {
            hero.levelX += 240*interval;
        }
        heroAnimationIndex = HERO_ANIMATION.RUN_RIGHT;
        heroDirection = HERO_DIRECTION.RIGHT;
    }

    if (!(pressedKeys[65] || pressedKeys[68])) {
        if (heroDirection === HERO_DIRECTION.RIGHT) {
            heroAnimationIndex = HERO_ANIMATION.IDLE_RIGHT;
        } else {
            heroAnimationIndex = HERO_ANIMATION.IDLE_LEFT;
        }
    }

    /* W */
    if (pressedKeys["87"]) {
        if (distanceFromFloor > 0 || hoverjump) {
            if (heroDirection === HERO_DIRECTION.RIGHT) {
                heroAnimationIndex = HERO_ANIMATION.JUMP_RIGHT;
            } else {
                heroAnimationIndex = HERO_ANIMATION.JUMP_LEFT;
            }
            if (jumpAnimationPhase === "normal") {
                jumpAnimationPhase = "flight";
                jumpPhaseStartedAt = animationTime;
            }
        }
        heroJumping = true;
    } else {
        heroJumping = false;
        heroPeakJumping = false;
    }
    }
    

    if (previousHeroAnimationIndex !== heroAnimationIndex) {
        resetAnimationTime = Date.now();
    }

    /* Physics */
    if ((hero.velocityY >= 0 && collisions.top)) {
        nearestFloorHeight = SCREEN_HEIGHT-collisions.topY;
    } else nearestFloorHeight = -hero.spriteHeight;

    distanceFromFloor = SCREEN_HEIGHT -
        nearestFloorHeight - (hero.levelY + hero.spriteHeight);
    if (attackState) {
        hero.velocityY = 0;
        heroJumping = false;
        newJumpPress = false;
    } else {
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
                heroAnimationIndex = heroDirection === HERO_DIRECTION.RIGHT
                    ? HERO_ANIMATION.JUMP_RIGHT
                    : HERO_ANIMATION.JUMP_LEFT;
                jumpAnimationPhase = "flight";
                jumpPhaseStartedAt = Date.now();
            }
        }

        if ((hero.velocityY > 0 && collisions.top) ||
            (hero.velocityY < 0 && hero.levelY <= -10) ||
            (hero.velocityY < 0 && collisions.bottom)) {
            hero.velocityY = 0;
        }
        hero.levelY += hero.velocityY;
    }

    if (checkLevelEnemyCollisions()) {
        gameOver = true;
        gameStarted = false;
        return;
    }

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
        if (distanceFromFloor > 0 &&
            jumpAnimationPhase === "normal") {
            jumpAnimationPhase = "flight";
            jumpPhaseStartedAt = animationTime;
        }
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

    const heroCenterX = hero.levelX + hero.spriteWidth / 2;
    const jamesCenterX = jamesPosition.x + jamesPosition.width / 2;
    if (heroCenterX <= jamesCenterX &&
        jamesCenterX - heroCenterX <= HERO_JAMES_REUNION_DISTANCE &&
        Math.abs(hero.levelY - jamesPosition.y) <= 5) {
        jamesHug = {
            startedAt: animationTime,
            startX: hero.levelX,
            targetX: jamesPosition.x - HERO_JAMES_REUNION_DISTANCE,
        };
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
