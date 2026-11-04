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

Level map values use numbered tile images: `0` is empty, and a positive value `N` draws `assets/props/N.png`. The sleep-powder pickup uses `assets/props/10.png`.

## Code layout

`index.html` loads classic scripts in dependency order: level data, `game/assets.js`, `game/level.js`, `game/enemies.js`, `game/rendering.js`, `game/opening.js`, then `main.js`. The opening menu has its own module, while `main.js` owns shared game state, game-over/completion screens, and the main loop. Classic scripts preserve support for opening `index.html` directly from disk.

# <a href="https://zerodayarcade.com/demos/platformer">Live Demo</a>


### Controls
<ul>
    <li>A: Run/Move Left</li>
    <li>D: Run/Move Right</li>
    <li>W: Jump / Hold to Hover if Wing Amulet has been collected</li>
    <li>S: Attack</li>
</ul>

Level 2 is a longer platforming course with increasingly wide pits, stepping platforms, and an elevated sleep-powder pickup. Its armored pig patrols like the Ribbon Pig but cannot be defeated by ordinary attacks. Collect the powder and land a successful S attack to put it to sleep; a missed attack does not consume the powder. The other collectable items are the Wing Amulet, which lets Sonia hover by holding W, and the Golden Cross, which gives 10,000 points. I may build out this game at some point in the future into a full game, but for now it serves as an example for anyone interested in building an HTML5 platformer without a pre-made engine.


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
