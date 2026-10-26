// A shorter, simple test map. Tile 1 is solid ground/platform terrain.
var level2Width = 40;
var level2Map = Array.from({ length: 15 }, function() {
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

window.gameLevelEnemies = window.gameLevelEnemies || [];
window.gameLevelEnemies[window.gameLevels.length - 1] = [
    { type: "armored_pig", x: 20 * 32, direction: -1 },
];
