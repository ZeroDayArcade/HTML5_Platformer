/* Canvas rendering helpers. */

var drawLevelBackground = function(background, backgroundScrollX) {
    if (background &&
        background.complete &&
        background.naturalWidth > 0) {
        const scale = Math.max(
            SCREEN_WIDTH / background.naturalWidth,
            SCREEN_HEIGHT / background.naturalHeight
        );
        const width = background.naturalWidth * scale;
        const height = background.naturalHeight * scale;
        context.drawImage(
            background,
            (SCREEN_WIDTH - width) / 2,
            (SCREEN_HEIGHT - height) / 2,
            width,
            height
        );
        return;
    }

    /* Draw parallax until this level's background image is ready. */
    for (var i = 0; i < layers.length; i++) {
        if (i === 0) {
            context.drawImage(layers[i], 0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
        } else {
            var sx = 0.0050 * backgroundScrollX * Math.pow(2, i);
            if (i === 1) sx -= 0;
            else if (i === 4) sx -= Math.floor(sx / 263) * 263;
            else sx -= Math.floor(sx / 272) * 272;
            context.drawImage(
                layers[i],
                sx,
                0,
                272,
                160,
                0,
                0,
                SCREEN_WIDTH,
                SCREEN_HEIGHT
            );
        }
    }
}

var drawJamesFrame = function(frame, x, y, width, scale) {
    if (!frame || !frame.complete || frame.naturalWidth === 0) {
        return;
    }
    scale = scale || 1;
    context.save();
    context.translate(x + width, y);
    context.scale(-scale, scale);
    context.drawImage(frame, 0, 0);
    context.restore();
}

var drawJamesLevelEndPreview = function(position, elapsedMs) {
    const screenX = position.x - scrollX;
    if (screenX + position.width < 0 || screenX > SCREEN_WIDTH) {
        return;
    }
    const frameIndex = Math.floor(elapsedMs * 3 / 1000) % 2;
    const frame = jamesIdleRightFrames[frameIndex];
    drawJamesFrame(frame, screenX, position.y, position.width);
}

var drawHugHeart = function(x, y, elapsedMs) {
    context.save();
    const pulse = 1 + 0.12 * Math.sin(elapsedMs / 110);
    context.translate(x, y);
    context.scale(pulse, pulse);
    context.fillStyle = "#f06b86";
    context.beginPath();
    context.moveTo(0, 5);
    context.bezierCurveTo(-13, -3, -8, -13, 0, -6);
    context.bezierCurveTo(8, -13, 13, -3, 0, 5);
    context.fill();
    context.restore();
}

var drawReunionAnimation = function(centerX, y, elapsedMs, scale) {
    scale = scale || 1;
    const frameIndex = Math.floor(elapsedMs * 3 / 1000) % 2;
    const characterWidth = HERO_WIDTH * scale;
    const reunionDistance = HERO_JAMES_REUNION_DISTANCE * scale;
    const soniaX = centerX - (characterWidth + reunionDistance) / 2;
    const jamesX = soniaX + reunionDistance;
    drawJamesFrame(
        jamesIdleRightFrames[frameIndex],
        jamesX,
        y,
        characterWidth,
        scale
    );
    context.save();
    context.translate(soniaX, y);
    context.scale(scale, scale);
    drawHeroFrame(
        HERO_ANIMATION.IDLE_RIGHT,
        frameIndex,
        0,
        0,
        HERO_WIDTH,
        HERO_HEIGHT
    );
    context.restore();
    drawHugHeart(centerX, y - 8, elapsedMs);
}

var drawHeroFrame = function(animationIndex, frameIndex, x, y, width, height) {
    let animation = heroAnimations[animationIndex];
    if (animation.frames) {
        let frame = animation.frames[frameIndex];
        if (frame && frame.complete && frame.naturalWidth > 0) {
            if (animation.mirrorX) {
                context.save();
                context.translate(x + frame.naturalWidth, y);
                context.scale(-1, 1);
                context.drawImage(frame, 0, 0);
                context.restore();
            } else {
                context.drawImage(frame, x, y);
            }
        }
        return;
    }

    if (animation.reverseFrameOrder) {
        frameIndex = animation.frameCount - frameIndex - 1;
    }
    if (animation.mirrorX) {
        context.save();
        context.translate(x + width, y);
        context.scale(-1, 1);
        context.drawImage(animation.sheet, frameIndex * animation.frameWidth, 0,
            animation.frameWidth, animation.frameHeight, 0, 0, width, height);
        context.restore();
    } else {
        context.drawImage(animation.sheet, frameIndex * animation.frameWidth, 0,
            animation.frameWidth, animation.frameHeight, x, y, width, height);
    }
}


var drawLevelEnemies = function(now) {
    levelEnemies.forEach(function(enemy) {
        const isArmoredPig = enemy.type === "armored_pig";
        const frames = isArmoredPig
            ? enemy.state === "sleeping"
                ? armoredPigDieFrames
                : enemy.direction > 0
                    ? armoredPigRunRightFrames
                    : armoredPigRunLeftFrames
            : enemy.state === "dying"
                ? ribbonPigDieFrames
                : enemy.state === "death_effect"
                    ? ribbonPigDeathEffectFrames
                    : enemy.direction > 0
                        ? ribbonPigRunRightFrames
                        : ribbonPigRunLeftFrames;
        const frameIndex = isArmoredPig && enemy.state === "sleeping"
            ? Math.min(
                frames.length - 1,
                Math.floor(
                    (now - enemy.asleepAt) *
                        RIBBON_PIG_ANIMATION_FPS / 1000
                )
            )
            : !isArmoredPig && enemy.state === "dying"
            ? Math.min(
                frames.length - 1,
                Math.floor(
                    (now - enemy.diedAt) * RIBBON_PIG_ANIMATION_FPS / 1000
                )
            )
            : !isArmoredPig && enemy.state === "death_effect"
                ? Math.min(
                    frames.length - 1,
                    Math.floor(
                        (now - enemy.deathEffectStartedAt) *
                            RIBBON_PIG_ANIMATION_FPS / 1000
                    )
                )
                : Math.floor(
                    (now - enemy.startedAt) * RIBBON_PIG_ANIMATION_FPS / 1000
                ) % frames.length;
        const frame = frames[frameIndex];
        if (frame && frame.complete && frame.naturalWidth > 0) {
            if (isArmoredPig) {
                const scale = Math.min(
                    RIBBON_PIG_WIDTH / frame.naturalWidth,
                    RIBBON_PIG_HEIGHT / frame.naturalHeight
                );
                const width = frame.naturalWidth * scale;
                const height = frame.naturalHeight * scale;
                context.drawImage(
                    frame,
                    enemy.levelX - scrollX + (RIBBON_PIG_WIDTH - width) / 2,
                    enemy.levelY + RIBBON_PIG_HEIGHT - height,
                    width,
                    height
                );
            } else {
                context.drawImage(frame, enemy.levelX - scrollX, enemy.levelY);
            }
            if (isArmoredPig &&
                enemy.state === "sleeping" &&
                frameIndex === armoredPigDieFrames.length - 1) {
                const sleepTextX = enemy.levelX - scrollX + RIBBON_PIG_WIDTH / 2;
                const sleepTextY = enemy.levelY - 4;
                context.font = "16px monospace";
                context.textAlign = "center";
                context.lineWidth = 3;
                context.strokeStyle = "#342b56";
                context.fillStyle = "#fff4b8";
                context.strokeText("Zzz", sleepTextX, sleepTextY);
                context.fillText("Zzz", sleepTextX, sleepTextY);
                context.textAlign = "start";
            }
        }
    });
}

var drawLevelItems = function() {
    levelItems.forEach(function(item) {
        if (item.collected) {
            return;
        }
        const image = LEVEL_ITEM_IMAGES[item.type];
        if (!image) {
            throw new Error("No image configured for level item: " + item.type);
        }
        if (!image.complete || image.naturalWidth === 0) {
            return;
        }
        context.drawImage(
            image,
            item.x - scrollX,
            item.y,
            item.width,
            item.height
        );
    });
}

var collectLevelItems = function() {
    const heroBox = {
        left: hero.levelX + (hero.spriteWidth - HERO_HITBOX_WIDTH) / 2,
        right: hero.levelX + (hero.spriteWidth + HERO_HITBOX_WIDTH) / 2,
        top: hero.levelY + 18,
        bottom: hero.levelY + hero.spriteHeight - 8,
    };
    levelItems.forEach(function(item) {
        if (item.collected || heroBox.left >= item.x + item.width ||
            heroBox.right <= item.x ||
            heroBox.top >= item.y + item.height ||
            heroBox.bottom <= item.y) {
            return;
        }
        item.collected = true;
        addInventoryItem(item.type);
    });
}
