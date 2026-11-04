/* Level-complete screen. */

const LEVEL_COMPLETE_TITLE_SOURCE = {
    x: 76,
    y: 122,
    width: 1508,
    height: 641,
};

var demoCompleteScreen = function(now, oldTime) {
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
            148,
            8,
            520,
            221
        );
    }

    context.textAlign = "center";
    context.font = "bold 24px sans-serif";
    context.lineWidth = 4;
    context.strokeStyle = "rgba(35, 22, 53, 0.9)";
    context.fillStyle = "#ffffff";
    const zeroPad = function(score, places) {
        return String(score).padStart(places, "0");
    };
    const scoreText = "Score: " + zeroPad(points, 5) + " Pts";
    context.strokeText(scoreText, SCREEN_WIDTH / 2, 268);
    context.fillText(scoreText, SCREEN_WIDTH / 2, 268);

    context.font = "bold 22px sans-serif";
    context.fillStyle = "rgba(255, 247, 227, " +
        (0.75 + 0.25 * Math.cos(now / 500)) + ")";
    context.strokeText("Press ESC to Exit", SCREEN_WIDTH / 2, 307);
    context.fillText("Press ESC to Exit", SCREEN_WIDTH / 2, 307);
    context.textAlign = "start";

    drawReunionAnimation(SCREEN_WIDTH / 2, 350, now);
    if (pressedKeys["27"]) {
        resetGame();
        demoComplete = false;
    }
}
