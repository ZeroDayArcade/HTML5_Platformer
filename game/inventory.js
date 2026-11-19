/* Backpack state, input, and rendering. */

const INVENTORY_COLUMNS = 4;
const INVENTORY_ROWS = 2;
const INVENTORY_SLOT_COUNT = INVENTORY_COLUMNS * INVENTORY_ROWS;
const INVENTORY_SLOT_SIZE = 76;
const INVENTORY_NAVIGATION_KEYS = ["87", "65", "83", "68"];
const INVENTORY_COLORS = Object.freeze({
    overlay: "rgba(255, 224, 237, 0.42)",
    panel: "#fff3e7",
    panelBorder: "#f28eae",
    heading: "#a84d76",
    controls: "#876b8a",
    slot: "#fffaf4",
    selectedSlot: "#fff0cb",
    slotBorder: "#d7b4cb",
    selectedBorder: "#f28eae",
    details: "#f4e8f5",
    detailsBorder: "#d5add3",
    text: "#5b4b62",
    footer: "#8f6682",
});
let inventoryItems = [];
let selectedInventorySlot = 0;
let inventoryOpen = false;
let inventoryOpenedAt = null;
let inventoryOverlayDrawn = false;
let inventoryNavigationKeyStates = {};
let inventoryToggleWasDown = false;
let inventoryEnterWasDown = false;
let sunglassesWorn = false;

var addInventoryItem = function(itemType) {
    if (!Object.prototype.hasOwnProperty.call(
        LEVEL_ITEM_DEFINITIONS, itemType
    )) {
        throw new Error("Unknown inventory item type: " + itemType);
    }
    if (!inventoryItems.includes(itemType)) {
        const isFirstItem = inventoryItems.length === 0;
        inventoryItems.push(itemType);
        if (isFirstItem) {
            selectedInventorySlot = 0;
        }
    }
}

var ownsInventoryItem = function(itemType) {
    return inventoryItems.includes(itemType);
}

var getSelectedInventoryItem = function() {
    return inventoryItems[selectedInventorySlot] || null;
}

var resetInventoryForLevel = function() {
    inventoryItems = [];
    selectedInventorySlot = 0;
    inventoryOpen = false;
    inventoryOpenedAt = null;
    inventoryOverlayDrawn = false;
    inventoryNavigationKeyStates = {};
    inventoryToggleWasDown = false;
    inventoryEnterWasDown = false;
    sunglassesWorn = false;
}

var clearInventoryGameplayInput = function() {
    ["65", "68", "83", "87"].forEach(function(keyCode) {
        pressedKeys[keyCode] = false;
    });
    heroJumping = false;
    newJumpPress = false;
    attackKeyWasDown = false;
}

var shiftPausedGameTimestamps = function(pausedDuration) {
    resetAnimationTime += pausedDuration;
    if (jumpPhaseStartedAt > 0) {
        jumpPhaseStartedAt += pausedDuration;
    }
    if (attackState) {
        attackState.startedAt += pausedDuration;
    }
    if (jamesHug) {
        jamesHug.startedAt += pausedDuration;
    }
    levelEnemies.forEach(function(enemy) {
        ["startedAt", "diedAt", "deathEffectStartedAt", "asleepAt"]
            .forEach(function(key) {
                if (Number.isFinite(enemy[key])) {
                    enemy[key] += pausedDuration;
                }
            });
    });
}

var openInventory = function() {
    inventoryOpen = true;
    inventoryOpenedAt = Date.now();
    inventoryOverlayDrawn = false;
    inventoryNavigationKeyStates = {};
    INVENTORY_NAVIGATION_KEYS.forEach(function(keyCode) {
        inventoryNavigationKeyStates[keyCode] =
            Boolean(pressedKeys[keyCode]);
    });
    clearInventoryGameplayInput();
}

var closeInventory = function() {
    if (!inventoryOpen) {
        return;
    }
    shiftPausedGameTimestamps(Date.now() - inventoryOpenedAt);
    inventoryOpen = false;
    inventoryOpenedAt = null;
    inventoryOverlayDrawn = false;
    inventoryNavigationKeyStates = {};
    clearInventoryGameplayInput();
}

var inventoryKeyPressed = function(keyCode) {
    const isDown = Boolean(pressedKeys[keyCode]);
    const wasDown = Boolean(inventoryNavigationKeyStates[keyCode]);
    inventoryNavigationKeyStates[keyCode] = isDown;
    return isDown && !wasDown;
}

var updateInventoryInput = function() {
    if (!pressedKeys["13"]) {
        inventoryEnterWasDown = false;
    }
    const enterPressed = Boolean(pressedKeys["13"]) &&
        !inventoryEnterWasDown;
    if (enterPressed) {
        inventoryEnterWasDown = true;
    }
    if (!gameStarted) {
        inventoryToggleWasDown = Boolean(pressedKeys["66"]);
        return;
    }
    if (!pressedKeys["66"]) {
        inventoryToggleWasDown = false;
    }
    if (pressedKeys["66"] && !inventoryToggleWasDown) {
        inventoryToggleWasDown = true;
        if (inventoryOpen) {
            closeInventory();
        } else {
            openInventory();
        }
        return;
    }
    if (enterPressed) {
        if (inventoryOpen) {
            if (getSelectedInventoryItem() === "cool_sunglasses") {
                sunglassesWorn = true;
            }
            closeInventory();
        } else if (sunglassesWorn ||
            getSelectedInventoryItem() === "cool_sunglasses") {
            sunglassesWorn = !sunglassesWorn;
        }
        return;
    }
    if (!inventoryOpen) {
        return;
    }
    if (pressedKeys["27"]) {
        pressedKeys["27"] = false;
        closeInventory();
        return;
    }

    const column = selectedInventorySlot % INVENTORY_COLUMNS;
    const row = Math.floor(selectedInventorySlot / INVENTORY_COLUMNS);
    const moveUp = inventoryKeyPressed("87");
    const moveLeft = inventoryKeyPressed("65");
    const moveDown = inventoryKeyPressed("83");
    const moveRight = inventoryKeyPressed("68");
    if (moveUp && row > 0) {
        selectedInventorySlot -= INVENTORY_COLUMNS;
    }
    if (moveDown && row < INVENTORY_ROWS - 1) {
        selectedInventorySlot += INVENTORY_COLUMNS;
    }
    if (moveLeft && column > 0) {
        selectedInventorySlot--;
    }
    if (moveRight && column < INVENTORY_COLUMNS - 1) {
        selectedInventorySlot++;
    }
}

var drawInventoryWrappedText = function(text, x, y, maxWidth, lineHeight) {
    let line = "";
    Array.from(text).forEach(function(character) {
        const nextLine = line + character;
        if (line && context.measureText(nextLine).width > maxWidth) {
            context.fillText(line.trimEnd(), x, y);
            y += lineHeight;
            line = character.trim() ? character : "";
        } else {
            line = nextLine;
        }
    });
    if (line) {
        context.fillText(line.trimEnd(), x, y);
        y += lineHeight;
    }
    return y;
}

var drawInventoryScreen = function() {
    if (!inventoryOverlayDrawn) {
        context.fillStyle = INVENTORY_COLORS.overlay;
        context.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
        inventoryOverlayDrawn = true;
    }

    context.save();
    const panel = { x: 54, y: 40, width: 708, height: 400 };
    context.fillStyle = INVENTORY_COLORS.panel;
    context.fillRect(panel.x, panel.y, panel.width, panel.height);
    context.lineWidth = 4;
    context.strokeStyle = INVENTORY_COLORS.panelBorder;
    context.strokeRect(panel.x, panel.y, panel.width, panel.height);

    context.textAlign = "left";
    context.font = "bold 24px monospace";
    context.fillStyle = INVENTORY_COLORS.heading;
    context.fillText("背包", 86, 82);
    context.font = "14px monospace";
    context.fillStyle = INVENTORY_COLORS.controls;
    context.fillText(
        "WASD：選道具 Enter：選中並關閉",
        440,
        80
    );

    for (let slot = 0; slot < INVENTORY_SLOT_COUNT; slot++) {
        const column = slot % INVENTORY_COLUMNS;
        const row = Math.floor(slot / INVENTORY_COLUMNS);
        const x = 86 + column * 86;
        const y = 112 + row * 86;
        const itemType = inventoryItems[slot];
        const item = itemType ? LEVEL_ITEM_DEFINITIONS[itemType] : null;
        const itemImage = itemType ? LEVEL_ITEM_IMAGES[itemType] : null;

        context.fillStyle = slot === selectedInventorySlot
            ? INVENTORY_COLORS.selectedSlot
            : INVENTORY_COLORS.slot;
        context.fillRect(x, y, INVENTORY_SLOT_SIZE, INVENTORY_SLOT_SIZE);
        if (item && itemImage && itemImage.complete &&
            itemImage.naturalWidth > 0) {
            context.drawImage(
                itemImage,
                x + (INVENTORY_SLOT_SIZE - INVENTORY_SLOT_SIZE) / 2,
                y + (INVENTORY_SLOT_SIZE - INVENTORY_SLOT_SIZE) / 2,
                INVENTORY_SLOT_SIZE,
                INVENTORY_SLOT_SIZE
            );
        }
        context.lineWidth = slot === selectedInventorySlot ? 4 : 2;
        context.strokeStyle = slot === selectedInventorySlot
            ? INVENTORY_COLORS.selectedBorder
            : INVENTORY_COLORS.slotBorder;
        context.strokeRect(x, y, INVENTORY_SLOT_SIZE, INVENTORY_SLOT_SIZE);
    }

    const details = {
        x: 448,
        y: 112,
        width: 282,
        height: 248,
    };
    context.fillStyle = INVENTORY_COLORS.details;
    context.fillRect(details.x, details.y, details.width, details.height);
    context.lineWidth = 2;
    context.strokeStyle = INVENTORY_COLORS.detailsBorder;
    context.strokeRect(details.x, details.y, details.width, details.height);

    const selectedType = getSelectedInventoryItem();
    const selectedItem = selectedType
        ? LEVEL_ITEM_DEFINITIONS[selectedType]
        : null;
    context.font = "bold 18px monospace";
    context.fillStyle = INVENTORY_COLORS.heading;
    context.fillText(
        selectedItem ? selectedItem.name : "空道具欄",
        details.x + 16,
        details.y + 32
    );
    context.strokeStyle = INVENTORY_COLORS.detailsBorder;
    context.beginPath();
    context.moveTo(details.x + 16, details.y + 48);
    context.lineTo(details.x + details.width - 16, details.y + 48);
    context.stroke();

    context.font = "14px monospace";
    context.fillStyle = INVENTORY_COLORS.text;
    let detailY = details.y + 78;
    if (selectedItem) {
        detailY = drawInventoryWrappedText(
            "使用方式：" + selectedItem.usage,
            details.x + 16,
            detailY,
            details.width - 32,
            20
        );
        detailY += 8;
        if (selectedType === "cool_sunglasses") {
            detailY = drawInventoryWrappedText(
                "目前狀態：" + (sunglassesWorn ? "已戴上" : "未戴上"),
                details.x + 16,
                detailY,
                details.width - 32,
                20
            );
            detailY += 8;
        }
        drawInventoryWrappedText(
            selectedItem.note,
            details.x + 16,
            detailY,
            details.width - 32,
            20
        );
    } else {
        drawInventoryWrappedText(
            inventoryItems.length === 0
                ? "沒有道具！"
                : "選擇道具以查看說明。",
            details.x + 16,
            detailY,
            details.width - 32,
            20
        );
    }

    context.textAlign = "center";
    context.font = "14px monospace";
    context.fillStyle = INVENTORY_COLORS.footer;
    context.fillText(
        "Enter 確認並關閉（眼鏡會戴上）；遊戲中按 Enter 切換。",
        SCREEN_WIDTH / 2,
        394
    );
    context.restore();
}
