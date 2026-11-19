/* Level markers, positioning, tile rendering, and collision helpers. */

const LEVEL_MAP_JAMES_MARKER = -1;
const LEVEL_MAP_ENEMY_MARKERS = Object.freeze({
    "-2": Object.freeze({ type: "ribbon_pig", direction: 1 }),
    "-3": Object.freeze({ type: "armored_pig", direction: -1 }),
});
const LEVEL_ITEM_DEFINITIONS = Object.freeze({
    sleep_powder: Object.freeze({
        marker: -4,
        imagePath: "assets/props/sleep-powder.png",
        width: 48,
        height: 48,
        name: "懶豬豬睡睡粉",
        usage: "按 S 攻擊命中豬豬時可使牠睡著。",
        note: "小心不要讓自己睡著囉。",
    }),
    cool_sunglasses: Object.freeze({
        marker: -5,
        imagePath: "assets/props/sunglasses.png",
        width: 48,
        height: 48,
        name: "酷炫太陽眼鏡",
        usage: "在背包選中後按 Enter 確認並戴上；遊戲中按 Enter 戴上或摘下。",
        note: "讓你酷炫甜美 潮到出水。",
    }),
});
const LEVEL_MAP_ITEM_MARKERS = Object.freeze({
    [LEVEL_ITEM_DEFINITIONS.sleep_powder.marker]: "sleep_powder",
    [LEVEL_ITEM_DEFINITIONS.cool_sunglasses.marker]: "cool_sunglasses",
});
const LEVEL_TILE_IMAGE_PATHS = Object.freeze({
    1: "assets/props/brick-tile.png",
    10: LEVEL_ITEM_DEFINITIONS.sleep_powder.imagePath,
});
const LEVEL_ITEM_IMAGES = Object.freeze(
    Object.keys(LEVEL_ITEM_DEFINITIONS).reduce(function(images, itemType) {
        const definition = LEVEL_ITEM_DEFINITIONS[itemType];
        const image = new Image();
        image.onerror = function() {
            console.error(
                "Failed to load level item image (" + itemType + "): " +
                    definition.imagePath
            );
        };
        image.src = definition.imagePath;
        images[itemType] = image;
        return images;
    }, {})
);

/* Character markers in empty cells anchor to the next row; bottom-row markers use their own row. */
var extractLevelMapEntities = function(level, levelIndex) {
    let jamesPosition = null;
    const enemyDefinitions = [];
    const itemDefinitions = [];
    level.forEach(function(row, rowIndex) {
        row.forEach(function(tile, column) {
            if (tile === LEVEL_MAP_JAMES_MARKER) {
                if (jamesPosition) {
                    throw new Error("Level " + levelIndex + " has multiple James markers.");
                }
                const anchorRow = Math.min(rowIndex + 1, level.length - 1);
                jamesPosition = { column: column, floorRow: anchorRow };
                row[column] = anchorRow === rowIndex ? 1 : 0;
                return;
            }
            const enemyMarker = LEVEL_MAP_ENEMY_MARKERS[tile];
            if (enemyMarker) {
                const anchorRow = Math.min(rowIndex + 1, level.length - 1);
                enemyDefinitions.push({
                    type: enemyMarker.type,
                    tilePosition: {
                        column: column,
                        floorRow: anchorRow,
                    },
                    direction: enemyMarker.direction,
                });
                row[column] = anchorRow === rowIndex ? 1 : 0;
                return;
            }
            const itemType = LEVEL_MAP_ITEM_MARKERS[tile];
            if (itemType) {
                const itemDefinition = LEVEL_ITEM_DEFINITIONS[itemType];
                itemDefinitions.push({
                    type: itemType,
                    x: column * TILE_SIZE - itemDefinition.width / 2,
                    y: (rowIndex + 0.5) * TILE_SIZE -
                        itemDefinition.height / 2,
                    width: itemDefinition.width,
                    height: itemDefinition.height,
                });
                row[column] = 0;
                return;
            }
            if (tile < 0) {
                throw new Error(
                    "Unknown level map marker " + tile + " in level " + levelIndex + "."
                );
            }
        });
    });
    if (!jamesPosition) {
        throw new Error("Level " + levelIndex + " is missing its James marker.");
    }
    return {
        jamesPosition: jamesPosition,
        enemyDefinitions: enemyDefinitions,
        itemDefinitions: itemDefinitions,
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
    const floorRow = tilePosition.floorRow;
    if (!Number.isInteger(floorRow) ||
        floorRow < 1 ||
        floorRow > level.length) {
        throw new Error("James position is outside level " + currentLevelIndex);
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
var drawLevelTiles = function(level, hTiles, vTiles, scrollX, scrollY) {
    for (var i=0; i<hTiles; i++) {
        for (var j=0; j<vTiles; j++) {
            const tile = level[j][i];
            if (isLevelTileVisible(tile)) {
                drawTile(
                    TILE_SIZE * i - scrollX,
                    j * TILE_SIZE - scrollY,
                    tile === 2 ? 1 : tile
                );
            }
        }
    }
}

var isLevelTileVisible = function(tile) {
    if (tile === 1) {
        return !sunglassesWorn;
    }
    if (tile === 2) {
        return sunglassesWorn;
    }
    return tile > 0;
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
