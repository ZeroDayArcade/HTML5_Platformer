/* Enemy, item, and attack behavior. */

var resetLevelEnemies = function(levelIndex) {
    const definitions = (window.gameLevelEnemies || [])[levelIndex] || [];
    levelEnemies = definitions.map(function(definition) {
        if (definition.type !== "ribbon_pig" &&
            definition.type !== "armored_pig") {
            throw new Error("Unknown level enemy type: " + definition.type);
        }
        const tilePosition = definition.tilePosition;
        if (!tilePosition ||
            !Number.isInteger(tilePosition.column) ||
            tilePosition.column < 0 ||
            !Number.isInteger(tilePosition.floorRow) ||
            tilePosition.floorRow < 0 ||
            tilePosition.column +
                RIBBON_PIG_WIDTH / TILE_SIZE > currentLevelConfig.size.width) {
            throw new Error("Level enemy has an invalid tile position.");
        }
        const levelX = tilePosition.column * TILE_SIZE;
        const centerColumn = Math.floor(
            (levelX + RIBBON_PIG_WIDTH / 2) / TILE_SIZE
        );
        const floorRow = tilePosition.floorRow;
        if (!currentLevel[floorRow] ||
            currentLevel[floorRow][centerColumn] === 0) {
            throw new Error("Level enemy spawn has no supporting floor.");
        }
        return {
            type: definition.type,
            levelX: levelX,
            levelY: floorRow * TILE_SIZE - RIBBON_PIG_HEIGHT,
            direction: definition.direction < 0 ? -1 : 1,
            startedAt: Date.now(),
            state: "alive",
        };
    });
}

var updateLevelEnemies = function(deltaSeconds, now) {
    levelEnemies.forEach(function(enemy) {
        if (enemy.state === "sleeping") {
            return;
        }
        if (enemy.type === "ribbon_pig" && enemy.state === "dying") {
            if (now - enemy.diedAt >=
                ribbonPigDieFrames.length * 1000 / RIBBON_PIG_ANIMATION_FPS) {
                enemy.state = "death_effect";
                enemy.deathEffectStartedAt = enemy.diedAt +
                    ribbonPigDieFrames.length * 1000 / RIBBON_PIG_ANIMATION_FPS;
            }
            if (enemy.state === "dying") {
                return;
            }
        }
        if (enemy.state === "death_effect") {
            return;
        }
        const feetRow = Math.floor((enemy.levelY + RIBBON_PIG_HEIGHT) / TILE_SIZE);
        const nextX = enemy.levelX +
            enemy.direction * RIBBON_PIG_SPEED * deltaSeconds;
        const leadingEdgeX = nextX +
            (enemy.direction > 0 ? RIBBON_PIG_WIDTH : 0);
        const supportProbeX = nextX +
            (enemy.direction > 0 ? RIBBON_PIG_WIDTH - 8 : 8);
        const supportColumn = Math.floor(supportProbeX / TILE_SIZE);
        const hasGroundAhead = currentLevel[feetRow] &&
            currentLevel[feetRow][supportColumn] !== 0;
        const obstacleColumn = Math.floor(
            (leadingEdgeX - (enemy.direction < 0 ? 1 : 0)) / TILE_SIZE
        );
        const firstBodyRow = Math.floor(
            (enemy.levelY + 16) / TILE_SIZE
        );
        const lastBodyRow = Math.floor(
            (enemy.levelY + RIBBON_PIG_HEIGHT - 8) / TILE_SIZE
        );
        let obstacleAhead = false;
        for (let row = firstBodyRow; row <= lastBodyRow; row++) {
            if (currentLevel[row] && currentLevel[row][obstacleColumn] !== 0) {
                obstacleAhead = true;
                break;
            }
        }
        if (!hasGroundAhead || obstacleAhead) {
            enemy.direction *= -1;
            return;
        }
        enemy.levelX = nextX;
    });
    levelEnemies = levelEnemies.filter(function(enemy) {
        return enemy.state !== "death_effect" ||
            now - enemy.deathEffectStartedAt <
                ribbonPigDeathEffectFrames.length * 1000 / RIBBON_PIG_ANIMATION_FPS;
    });
}


var heroTouchesLevelEnemy = function(enemy) {
    const isArmoredPig = enemy.type === "armored_pig";
    const horizontalInset = isArmoredPig ? 3 : 7;
    const heroBox = {
        left: hero.levelX + (hero.spriteWidth - HERO_HITBOX_WIDTH) / 2,
        right: hero.levelX + (hero.spriteWidth + HERO_HITBOX_WIDTH) / 2,
        top: hero.levelY + 18,
        bottom: hero.levelY + hero.spriteHeight - 8,
    };
    const pigBox = {
        left: enemy.levelX + horizontalInset,
        right: enemy.levelX + RIBBON_PIG_WIDTH - horizontalInset,
        top: enemy.levelY + (isArmoredPig ? 2 : 10),
        bottom: enemy.levelY + RIBBON_PIG_HEIGHT - (isArmoredPig ? 2 : 6),
    };
    return heroBox.left < pigBox.right &&
        heroBox.right > pigBox.left &&
        heroBox.top < pigBox.bottom &&
        heroBox.bottom > pigBox.top;
}

var checkLevelEnemyCollisions = function() {
    if (attackState) {
        return false;
    }
    return levelEnemies.some(function(enemy) {
        return (enemy.type === "ribbon_pig" ||
            enemy.type === "armored_pig") &&
            enemy.state === "alive" &&
            heroTouchesLevelEnemy(enemy);
    });
}

var startHeroAttack = function(now) {
    const isGrounded = distanceFromFloor <= 0 &&
        hero.velocityY === 0 &&
        jumpAnimationPhase === "normal";
    if (!isGrounded || attackState || !pressedKeys["83"] || attackKeyWasDown) {
        return;
    }
    attackState = {
        direction: heroDirection,
        startedAt: now,
        hitEnemies: new Set(),
    };
    resetAnimationTime = now;
}

var tryHitLevelEnemies = function(frameIndex, now) {
    if (!attackState || frameIndex < 3 || frameIndex > 6) {
        return;
    }
    const heroCenterX = hero.levelX + hero.spriteWidth / 2;
    const attackReach = 84;
    const attackBox = {
        left: attackState.direction === HERO_DIRECTION.RIGHT
            ? heroCenterX
            : heroCenterX - attackReach,
        right: attackState.direction === HERO_DIRECTION.RIGHT
            ? heroCenterX + attackReach
            : heroCenterX,
        top: hero.levelY + 24,
        bottom: hero.levelY + 78,
    };
    levelEnemies.forEach(function(enemy) {
        const canDefeatRibbonPig = enemy.type === "ribbon_pig";
        const canPutArmoredPigToSleep =
            enemy.type === "armored_pig" &&
            getSelectedInventoryItem() === "sleep_powder";
        if ((!canDefeatRibbonPig && !canPutArmoredPigToSleep) ||
            enemy.state !== "alive" ||
            attackState.hitEnemies.has(enemy)) {
            return;
        }
        const pigBox = {
            left: enemy.levelX + 7,
            right: enemy.levelX + RIBBON_PIG_WIDTH - 7,
            top: enemy.levelY + 10,
            bottom: enemy.levelY + RIBBON_PIG_HEIGHT - 6,
        };
        const intersects = attackBox.left < pigBox.right &&
            attackBox.right > pigBox.left &&
            attackBox.top < pigBox.bottom &&
            attackBox.bottom > pigBox.top;
        if (intersects) {
            if (canDefeatRibbonPig) {
                enemy.state = "dying";
                enemy.diedAt = now;
            } else {
                enemy.state = "sleeping";
                enemy.asleepAt = now;
            }
            attackState.hitEnemies.add(enemy);
        }
    });
}
