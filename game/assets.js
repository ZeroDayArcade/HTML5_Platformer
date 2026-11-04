/* DOM assets and animation definitions. */

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
const armoredPigRunRightFrames = getFrameImages("armored-pig-run-right", 6);
const armoredPigRunLeftFrames = getFrameImages("armored-pig-run-left", 6);
const armoredPigDieFrames = getFrameImages("armored-pig-die", 6);
const RIBBON_PIG_ANIMATION_FPS = 9;
const sleepPowderImage = new Image();
sleepPowderImage.onerror = function() {
    console.error("Failed to load sleep powder image: assets/props/piggy_sleepy.png");
};
sleepPowderImage.src = "assets/props/piggy_sleepy.png";

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
