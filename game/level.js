/* Level markers, positioning, tile rendering, and collision helpers. */

const LEVEL_MAP_JAMES_MARKER = -1;
const LEVEL_MAP_ENEMY_MARKERS = Object.freeze({
    "-2": Object.freeze({ type: "ribbon_pig", direction: 1 }),
    "-3": Object.freeze({ type: "armored_pig", direction: -1 }),
});

var extractLevelMapEntities = function(level, levelIndex) {
    let jamesPosition = null;
    const enemyDefinitions = [];
    level.forEach(function(row, rowIndex) {
        row.forEach(function(tile, column) {
            if (tile === LEVEL_MAP_JAMES_MARKER) {
                if (jamesPosition) {
                    throw new Error("Level " + levelIndex + " has multiple James markers.");
                }
                jamesPosition = { column: column, floorRow: rowIndex };
                row[column] = 1;
                return;
            }
            const enemyMarker = LEVEL_MAP_ENEMY_MARKERS[tile];
            if (!enemyMarker) {
                return;
            }
            enemyDefinitions.push({
                type: enemyMarker.type,
                tilePosition: { column: column, floorRow: rowIndex },
                direction: enemyMarker.direction,
            });
            row[column] = 1;
        });
    });
    if (!jamesPosition) {
        throw new Error("Level " + levelIndex + " is missing its James marker.");
    }
    return {
        jamesPosition: jamesPosition,
        enemyDefinitions: enemyDefinitions,
    };
}

var getJamesLevelEndPosition = function(level, tilePosition) {
    const jamesWidth = 128;
    const jamesHeight = 96;
    if (!tilePosition ||
        !Number.isInteger(tilePosition.column) ||
        tilePosition.column < 0 ||
        (tilePosition.column + jamesWidth / TILE_SIZE) > level[0].length) {
        throw new Error("James position is outside level " + currentLevelIndex);
    }
    const jamesLevelX = tilePosition.column * TILE_SIZE;
    const centerTile = Math.floor(
        (jamesLevelX + jamesWidth / 2) / TILE_SIZE
    );
    const floorRow = tilePosition.floorRow;
    if (!Number.isInteger(floorRow) ||
        floorRow < 0 ||
        !level[floorRow] ||
        level[floorRow][centerTile] === 0) {
        throw new Error("James has no supporting floor in level " + currentLevelIndex);
    }
    return {
        x: jamesLevelX,
        y: floorRow * TILE_SIZE - jamesHeight,
        width: jamesWidth,
        height: jamesHeight,
    };
}


/* Draw a tile using the image named by its map value. */
var drawTile = function(x, y, tileNumber) {
    const image = getTileImage(tileNumber);
    if (image.complete && image.naturalWidth > 0) {
        context.drawImage(image, x, y, TILE_SIZE, TILE_SIZE);
    }
}

/* Render Level Tiles */
var drawLevelTiles = function(level, hTiles, vTiles, scrollX) {
    for (var i=0; i<hTiles; i++) {
        for (var j=0; j<vTiles; j++) {
            if (level[j][i] > 0) {
                drawTile(TILE_SIZE*i-scrollX, j*TILE_SIZE, level[j][i]);
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
