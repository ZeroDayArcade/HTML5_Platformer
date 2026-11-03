// A shorter, simple test map. Tile 1 is solid ground/platform terrain.
var level2Width = 40;
var level2Height = 15;
var level2Map = Array.from({ length: level2Height }, function() {
    return Array(level2Width).fill(0);
});

// Continuous ground at the bottom of the screen.
level2Map[14].fill(1);

// A few low platforms to make the second level feel different.
level2Map[11][8] = 1;
level2Map[11][9] = 1;
level2Map[11][10] = 1;
level2Map[9][17] = 1;
level2Map[9][18] = 1;
level2Map[9][19] = 1;
level2Map[11][27] = 1;
level2Map[11][28] = 1;
level2Map[11][29] = 1;

window.gameLevels = window.gameLevels || [];
window.gameLevels.push(level2Map);

window.gameLevelConfigs = window.gameLevelConfigs || [];
window.gameLevelConfigs[window.gameLevels.length - 1] = {
    size: {
        width: level2Width,
        height: level2Height,
    },
    jamesPosition: {
        tileX: 32,
        supportRow: 14,
    },
};

window.gameLevelEnemies = window.gameLevelEnemies || [];
window.gameLevelEnemies[window.gameLevels.length - 1] = [
    { type: "armored_pig", x: 20 * 32, direction: -1 },
];
