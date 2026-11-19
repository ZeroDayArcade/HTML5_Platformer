# Building an HTML5 Platformer from Scratch

This is a simple example of building a 2D side-scrolling platform game in HTML5 from scratch. No engine, frameworks or third-party libraries are used, just vanilla javascript. 
<br/><br/>
<p align="center">
<img width="814" alt="pf-ss2" src="https://github.com/ZeroDayArcade/HTML5_Platformer/assets/141867962/b197ab0e-021f-4f25-b317-5fb995b587f8">
</p><br/>

It could use a bit of performance optimization and variable consolidation, but provides an example of the features you see in many 2D platformers:
<ul>
  <li>Sprite Animation</li>
  <li>Parallax Scrolling</li>
  <li>Audio / Music</li>
  <li>Collectable Items</li>
  <li>Title / Menu Screens</li>
  <li>Collision Detection</li>
  <li>Controls / Input</li>
  <li>Tilemap / Easy Level Creation</li>
</ul>

This demo contains one small level but illustrates the concepts above. The way it is written makes it easy to add and edit levels using 2D level arrays.

Level backgrounds are loaded by level order from `assets/backgrounds/levelN.png` (for example, Level 1 uses `level1.png`).
The opening and game-over screens use `assets/backgrounds/begining.png` and `assets/backgrounds/game_over.png`.
The level-complete screen layers `assets/backgrounds/level complete.png` over the current level background. It appears after every level; press Enter to continue to the next level or return to the title after the last level.
Press Ctrl+Shift+L and enter a level number to jump directly to that level for testing.
Level 3 is a 25x200 map. Its original 15-row area is shown first; the view scrolls upward to reveal the ten rows above it when Sonia reaches the original area's top edge.

Level map values use numeric tile IDs mapped to named images by `LEVEL_TILE_IMAGE_PATHS` in `game/level.js`. `0` is empty, `1` is a normal brick, `2` is a hidden brick, and `10` draws the sleep-powder image. Normal and hidden bricks remain solid; wearing the sunglasses swaps which brick type is visible.
Collectible items are defined in `LEVEL_ITEM_DEFINITIONS` in `game/level.js`, including their image, size, and inventory text. The `-4` map marker places sleep powder, and `-5` places the sunglasses.

## Code layout

`index.html` loads classic scripts in dependency order: level data, `game/assets.js`, `game/level.js`, `game/enemies.js`, `game/rendering.js`, `game/inventory.js`, `game/opening.js`, `game/levelComplete.js`, then `main.js`. The opening menu, inventory, and level-complete screen have their own modules, while `main.js` owns shared game state, the game-over screen, and the main loop. Classic scripts preserve support for opening `index.html` directly from disk.

# <a href="https://zerodayarcade.com/demos/platformer">Live Demo</a>


### Controls
<ul>
    <li>A: Run/Move Left</li>
    <li>D: Run/Move Right</li>
    <li>W: Jump / Hold to Hover if Wing Amulet has been collected</li>
    <li>S: Attack</li>
    <li>B: Open/close backpack</li>
    <li>WASD: Select items while the backpack is open</li>
    <li>Enter: Confirm the selected item and close the backpack (sunglasses are worn automatically); toggle sunglasses in-game</li>
    <li>Esc: Close the backpack</li>
</ul>

Level 2 is a longer platforming course with increasingly wide pits, stepping platforms, and an elevated sleep-powder pickup. Its armored pig patrols like the Ribbon Pig but cannot be defeated by ordinary attacks. Collect the powder, select it in the backpack, and land an S attack to put the pig to sleep. The powder is not consumed. Collect the sunglasses, select them in the backpack, and press Enter to wear them and close the backpack. In-game, press Enter to toggle them on or off. The backpack pauses gameplay and displays the selected item's name and use. The Wing Amulet lets Sonia hover by holding W. I may build out this game at some point in the future into a full game, but for now it serves as an example for anyone interested in building an HTML5 platformer without a pre-made engine.


# Running Locally
In most cases you can just download the repo and double-click the index.html file. Note that if you add in features that load assets in the javascript code (rather than the HTML), you may need to instead serve the game locally:

You can serve the game locally by cloning the project and running a local server: <br/><br/>
Clone repo:
```
git clone https://github.com/ZeroDayArcade/HTML5_Platformer.git
```

cd into project directory:
```
cd HTML5_Platformer
```

Run server with python:
```
python -m http.server 8080
```

Then navigate to localhost:8080 in your browser.<br/><br/>

<p align="center">
<img width="815" alt="pf-ss3" src="https://github.com/ZeroDayArcade/HTML5_Platformer/assets/141867962/5b62b27b-904e-4442-9e5d-e9cf844a9098">
</p><br/>

# Game art 

The game art used in this demo was created by Luis Zuno (@ansimuz) and other wonderful contributors to opengameart.org

Hero Sprite: <a href="https://opengameart.org/content/gothicvania-cemetery-pack">opengameart.org/content/gothicvania-cemetery-pack</a><br/>
Backgrounds: <a href="https://opengameart.org/content/mountain-at-dusk-background">opengameart.org/content/mountain-at-dusk-background</a><br/>
Tiles: <a href="https://opengameart.org/content/dungeon-crawl-32x32-tiles">opengameart.org/content/dungeon-crawl-32x32-tiles</a><br/>

![hero-run](https://github.com/ZeroDayArcade/HTML5_Platformer/assets/141867962/578997c2-3c0a-4784-96d2-ac5360384853)
![hero-idle](https://github.com/ZeroDayArcade/HTML5_Platformer/assets/141867962/0f79115a-f60c-4021-a1d3-9a0cc3d9c7a0)
![hero-attack](https://github.com/ZeroDayArcade/HTML5_Platformer/assets/141867962/7c575625-7ede-45e9-b3eb-d19a4e928855)
<br/>
<br/>
![Tileset](https://github.com/ZeroDayArcade/HTML5_Platformer/assets/141867962/bb8f6803-a8d1-4f75-bc6d-a9ba148ad2e9)
<br/>
![parallax-mountain-mountains](https://github.com/ZeroDayArcade/HTML5_Platformer/assets/141867962/19adc93e-2ff9-4c6d-a53c-77fca09aa6fd)

Music by Joth (@Joth_Music) <br/>
<a href="https://opengameart.org/content/cyberpunk-moonlight-sonata">opengameart.org/content/cyberpunk-moonlight-sonata</a>
