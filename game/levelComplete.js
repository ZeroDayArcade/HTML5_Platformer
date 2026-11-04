/* Level-complete screen. */

const LEVEL_COMPLETE_TITLE_SOURCE = {
    x: 76,
    y: 122,
    width: 1508,
    height: 641,
};

var demoCompleteScreen = function(now, oldTime) {
    const hasNextLevel = currentLevelIndex < levels.length - 1;
    drawLevelBackground(levelBackgrounds[currentLevelIndex], 0);

    if (levelCompleteTitleImage.complete &&
        levelCompleteTitleImage.naturalWidth > 0) {
        const titleSource = LEVEL_COMPLETE_TITLE_SOURCE;
        context.drawImage(
            levelCompleteTitleImage,
            titleSource.x,
            titleSource.y,
            titleSource.width,
            titleSource.height,
            168,
            12,
            480,
            204
        );
    }

    context.textAlign = "center";
    context.font = "bold 22px sans-serif";
    context.lineWidth = 4;
    context.strokeStyle = "rgba(35, 22, 53, 0.9)";
    context.fillStyle = "rgba(255, 247, 227, " +
        (0.75 + 0.25 * Math.cos(now / 500)) + ")";
    const prompt = hasNextLevel
        ? "Press ESC to Continue"
        : "Press ESC to Return to Title";
    context.strokeText(prompt, SCREEN_WIDTH / 2, 274);
    context.fillText(prompt, SCREEN_WIDTH / 2, 274);
    context.textAlign = "start";

    drawReunionAnimation(SCREEN_WIDTH / 2, 326, now, 1.5);
    if (pressedKeys["27"]) {
        pressedKeys["27"] = false;
        demoComplete = false;
        if (hasNextLevel) {
            currentLevelIndex++;
            resetGame();
            gameStarted = true;
        } else {
            currentLevelIndex = 0;
            resetGame();
            gameStarted = false;
        }
    }
}
