// A longer, three-screen course that teaches short jumps before combining
// gaps, raised platforms, and the armored pig encounter.
var level2Width = 72;
var level2Height = 15;
var level2Map = Array.from({ length: level2Height }, function() {
    return Array(level2Width).fill(0);
});

level2Map[14].fill(1);

// The first two pits teach the jump rhythm; later pits combine it with
// stepping stones and the armored-pig encounter.
var level2Pits = [
    { start: 12, end: 13 },
    { start: 24, end: 26 },
    { start: 35, end: 36 },
    { start: 47, end: 49 },
    { start: 60, end: 61 },
];
level2Pits.forEach(function(pit) {
    for (var column = pit.start; column <= pit.end; column++) {
        level2Map[14][column] = 0;
    }
});

// A low opening obstacle and a final pair of blocks make the safe sections
// require short, deliberate jumps.
level2Map[13][9] = 1;
level2Map[12][9] = 1;
level2Map[12][10] = 1;
level2Map[13][53] = 1;
level2Map[12][57] = 1;

var level2Platforms = [
    { row: 12, start: 13, end: 13 },
    { row: 12, start: 25, end: 25 },
    { row: 11, start: 26, end: 26 },
    { row: 12, start: 28, end: 29 },
    { row: 10, start: 30, end: 32 },
    { row: 12, start: 48, end: 48 },
    { row: 12, start: 54, end: 55 },
    { row: 11, start: 56, end: 56 },
    { row: 12, start: 60, end: 60 },
];
level2Platforms.forEach(function(platform) {
    for (var column = platform.start; column <= platform.end; column++) {
        level2Map[platform.row][column] = 1;
    }
});

level2Map[14][64] = -1; // James spawn marker

window.gameLevels = window.gameLevels || [];
window.gameLevels.push(level2Map);

window.gameLevelConfigs = window.gameLevelConfigs || [];
window.gameLevelConfigs[window.gameLevels.length - 1] = {
    size: {
        width: level2Width,
        height: level2Height,
    },
    // The raised route is the riskier way to acquire the powder before the pig.
    items: [
        {
            type: "sleep_powder",
            x: 30 * 32 + 8,
            y: 10 * 32 - 32,
            width: 48,
            height: 32,
        },
    ],
};

window.gameLevelOneWayPlatforms = window.gameLevelOneWayPlatforms || [];
window.gameLevelOneWayPlatforms[window.gameLevels.length - 1] =
    level2Platforms;

window.gameLevelEnemies = window.gameLevelEnemies || [];
window.gameLevelEnemies[window.gameLevels.length - 1] = [
    {
        type: "armored_pig",
        tilePosition: { column: 39, floorRow: 14 },
        direction: -1,
    },
];
