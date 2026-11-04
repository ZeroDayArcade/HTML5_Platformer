/* Opening screen menu and instructions. */

const TITLE_MENU_HOTSPOTS = {
    start: { left: 0.39, top: 0.54, right: 0.61, bottom: 0.67 },
    instructions: { left: 0.39, top: 0.675, right: 0.61, bottom: 0.81 },
};
const TITLE_MENU_POINTER_POSITIONS = [
    { x: 300, y: 278 },
    { x: 300, y: 338 },
];
const TITLE_MENU_POINTER_SOURCE = {
    x: 627,
    y: 198,
    width: 508,
    height: 516,
};

let titleInstructionsVisible = false;
let selectedTitleMenuIndex = 0;
let previousTitleUpPressed = false;
let previousTitleDownPressed = false;
let beyondTitleScreen = false;

const titleMenuPointerImage = new Image();
titleMenuPointerImage.onerror = function() {
    console.error("Failed to load menu pointer image: assets/props/poiter.png");
};
titleMenuPointerImage.src = "assets/props/poiter.png";

var getTitleScreenPoint = function(event) {
    const bounds = canvas.getBoundingClientRect();
    return {
        x: (event.clientX - bounds.left) / bounds.width,
        y: (event.clientY - bounds.top) / bounds.height,
    };
}

var isInsideTitleHotspot = function(point, hotspot) {
    return point.x >= hotspot.left &&
        point.x <= hotspot.right &&
        point.y >= hotspot.top &&
        point.y <= hotspot.bottom;
}

var startGameFromTitle = function() {
    titleInstructionsVisible = false;
    gameStarted = true;
    beyondTitleScreen = true;
    enterPressedInitially = true;
}

var activateSelectedTitleOption = function() {
    if (selectedTitleMenuIndex === 0) {
        startGameFromTitle();
    } else {
        titleInstructionsVisible = true;
    }
}

canvas.addEventListener("click", function(event) {
    if (gameStarted) {
        return;
    }
    if (titleInstructionsVisible) {
        titleInstructionsVisible = false;
        return;
    }
    const point = getTitleScreenPoint(event);
    if (isInsideTitleHotspot(point, TITLE_MENU_HOTSPOTS.start)) {
        selectedTitleMenuIndex = 0;
        activateSelectedTitleOption();
    } else if (isInsideTitleHotspot(point, TITLE_MENU_HOTSPOTS.instructions)) {
        selectedTitleMenuIndex = 1;
        activateSelectedTitleOption();
    }
});

canvas.addEventListener("mousemove", function(event) {
    if (gameStarted) {
        canvas.style.cursor = "default";
        return;
    }
    if (titleInstructionsVisible) {
        canvas.style.cursor = "pointer";
        return;
    }
    const point = getTitleScreenPoint(event);
    canvas.style.cursor =
        isInsideTitleHotspot(point, TITLE_MENU_HOTSPOTS.start) ||
        isInsideTitleHotspot(point, TITLE_MENU_HOTSPOTS.instructions)
            ? "pointer"
            : "default";
});

var updateTitleMenuSelection = function() {
    const upPressed = Boolean(pressedKeys["87"]);
    const downPressed = Boolean(pressedKeys["83"]);
    if (!titleInstructionsVisible) {
        if (downPressed && !previousTitleDownPressed) {
            selectedTitleMenuIndex =
                (selectedTitleMenuIndex + 1) % TITLE_MENU_POINTER_POSITIONS.length;
        } else if (upPressed && !previousTitleUpPressed) {
            selectedTitleMenuIndex =
                (selectedTitleMenuIndex - 1 +
                    TITLE_MENU_POINTER_POSITIONS.length) %
                TITLE_MENU_POINTER_POSITIONS.length;
        }
    }
    previousTitleUpPressed = upPressed;
    previousTitleDownPressed = downPressed;
}

var drawTitleMenuPointer = function() {
    if (!titleMenuPointerImage.complete ||
        titleMenuPointerImage.naturalWidth === 0) {
        return;
    }
    const position = TITLE_MENU_POINTER_POSITIONS[selectedTitleMenuIndex];
    const source = TITLE_MENU_POINTER_SOURCE;
    context.drawImage(
        titleMenuPointerImage,
        source.x,
        source.y,
        source.width,
        source.height,
        position.x,
        position.y,
        32,
        32
    );
}

var drawTitleInstructions = function() {
    context.fillStyle = "rgba(12, 24, 53, 0.9)";
    context.fillRect(190, 90, 436, 300);
    context.strokeStyle = "#fff4b8";
    context.lineWidth = 4;
    context.strokeRect(190, 90, 436, 300);
    context.textAlign = "center";
    context.fillStyle = "#fff4b8";
    context.font = "32px sans-serif";
    context.fillText("操作說明", SCREEN_WIDTH / 2, 145);
    context.fillStyle = "#ffffff";
    context.font = "23px sans-serif";
    context.fillText("A / D：左右移動", SCREEN_WIDTH / 2, 205);
    context.fillText("W：跳躍", SCREEN_WIDTH / 2, 252);
    context.fillText("S：攻擊", SCREEN_WIDTH / 2, 299);
    context.font = "18px sans-serif";
    context.fillStyle = "#fff4b8";
    context.fillText("按 Esc 或點擊返回", SCREEN_WIDTH / 2, 355);
    context.textAlign = "start";
}

var titleScreenLoop = function(now, oldTime) {
    updateTitleMenuSelection();
    context.drawImage(titleScreen, 0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
    if (titleInstructionsVisible) {
        drawTitleInstructions();
        if (pressedKeys["27"]) {
            titleInstructionsVisible = false;
            pressedKeys["27"] = false;
        }
        return;
    }
    drawTitleMenuPointer();
    if (pressedKeys["13"] || (enterPressedInitially && !beyondTitleScreen)) {
        activateSelectedTitleOption();
    }
}

var onInitialEnterPress = function(event) {
    if (event.key === "Enter" &&
        !titleInstructionsVisible &&
        selectedTitleMenuIndex === 0) {
        enterPressedInitially = true;
        audioElement.play();
    }
}
document.addEventListener("keypress", onInitialEnterPress);
