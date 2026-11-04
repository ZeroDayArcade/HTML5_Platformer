/* Game state, screens, and the primary loop. */

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
var levelConfigs = window.gameLevelConfigs || [];
let currentLevelIndex = 0;
let currentLevelConfig = null;
let currentLevelJamesTilePosition = null;

if (levels.length === 0) {
    throw new Error("No levels loaded. Check the level script tags in index.html.");
}

const levelBackgrounds = levels.map(function(_, levelIndex) {
    const background = new Image();
    const source = "assets/backgrounds/level" + (levelIndex + 1) + ".png";
    background.onerror = function() {
        console.error("Failed to load level background: " + source);
    };
    background.src = source;
    return background;
});

var loadLevel = function(levelIndex) {
    const level = levels[levelIndex];
    const levelConfig = levelConfigs[levelIndex];
    if (!level) {
        throw new Error("Level " + levelIndex + " does not exist.");
    }
    if (!levelConfig || !levelConfig.size) {
        throw new Error("Level " + levelIndex + " is missing its configuration.");
    }
    const { width, height } = levelConfig.size;
    if (!Number.isInteger(width) || width < 1 ||
        !Number.isInteger(height) || height < 1 ||
        level.length !== height ||
        level.some(function(row) { return row.length !== width; })) {
        throw new Error("Level " + levelIndex + " map dimensions do not match its configuration.");
    }
    currentLevel = JSON.parse(JSON.stringify(level));
    currentLevelConfig = levelConfig;
    currentLevelJamesTilePosition =
        extractJamesTilePosition(currentLevel, levelIndex);
    levelItems = (levelConfig.items || []).map(function(item) {
        if (item.type !== "sleep_powder" ||
            !Number.isFinite(item.x) ||
            !Number.isFinite(item.y) ||
            !Number.isFinite(item.width) ||
            !Number.isFinite(item.height) ||
            item.width <= 0 ||
            item.height <= 0) {
            throw new Error("Level " + levelIndex + " has an invalid item definition.");
        }
        return Object.assign({ collected: false }, item);
    });
    hasSleepPowder = false;
    getJamesLevelEndPosition(currentLevel, currentLevelJamesTilePosition);
    resetLevelEnemies(levelIndex);
}

const SCREEN_WIDTH = 816;
const SCREEN_HEIGHT = 480;
const TILE_SIZE = 32;
const HERO_WIDTH = 128;
const HERO_HEIGHT = 96;
const HERO_HITBOX_WIDTH = 50;
const HERO_JAMES_REUNION_DISTANCE = 72;
const HERO_JUMP_VELOCITY = -12;
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
let levelItems = [];
let hasSleepPowder = false;

/* Load Game Music */
var audioElement = document.getElementById("theAudio");
audioElement.load();
audioElement.volume = 0.6;
var audioPlaying = false;

/* For Safari Audio Compatibility */
var enterPressedInitially = false;

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

/* Game Over Screen */
var gameOverScreen = function(now, oldTime) {
    context.drawImage(
        gameOverScreenBackground,
        0,
        0,
        SCREEN_WIDTH,
        SCREEN_HEIGHT
    );
    context.font = "bold 28px sans-serif";
    context.textAlign = "center";
    context.lineWidth = 4;
    context.strokeStyle = "rgba(35, 22, 53, 0.9)";
    context.fillStyle = "rgba(255, 247, 227, " +
        (0.75 + 0.25 * Math.cos(now / 500)) + ")";
    context.strokeText("Press ESC to Restart", SCREEN_WIDTH / 2, 275);
    context.fillText("Press ESC to Restart", SCREEN_WIDTH / 2, 275);
    context.textAlign = "start";
    if (pressedKeys["27"]) {
        resetGame();
        gameOver = false;
        gameStarted = true;
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
    const jamesPosition = getJamesLevelEndPosition(
        currentLevel,
        currentLevelJamesTilePosition
    );
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
        scrollX+SCREEN_WIDTH < currentLevelConfig.size.width*TILE_SIZE ||
        (hero.levelX + SCREEN_WIDTH/2 + hero.spriteWidth/2 <= 
        currentLevelConfig.size.width*TILE_SIZE && scrollX > 0)) {
        scrollX = hero.levelX - SCREEN_WIDTH/2 + hero.spriteWidth/2;
    }
    hero.renderX = hero.levelX - scrollX;
    hero.renderY = hero.levelY;

    drawLevelBackground(levelBackgrounds[currentLevelIndex], scrollX);

    drawLevelTiles(
        currentLevel,
        currentLevelConfig.size.width,
        currentLevelConfig.size.height,
        scrollX
    );
    drawLevelItems();
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
            currentLevelConfig.size.width*TILE_SIZE && !collisions.right) {
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
                hero.velocityY = HERO_JUMP_VELOCITY;
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

    collectLevelItems();

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
        drawLevelItemStatus();
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
