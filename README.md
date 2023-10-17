# Building an HTML5 Platformer from Scratch

This is a simple example of building a 2D side-scrolling platform game in HTML5 from scratch. No engine, frameworks or third-party libraries are used, just vanilla javascript. 

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

# <a href="https://zerodayarcade.com/demos/platformer">Live Demo</a>


### Controls
<ul>
    <li>A: Run/Move Left</li>
    <li>D: Run/Move Right</li>
    <li>W: Jump / Hold to Hover if Wing Amulet has been collected</li>
    <li>S: Crouch</li>
    <li>K: Attack</li>
</ul>

There are two collectable items in the demo: (1) The Wing Amulet and (2) The Golden Cross. The Wing Amulet will let you hover/fly by holding W once you collect it, and the Golden Cross gives you 10,000 points. I may build out this game at some point in the future into a full game, but for now it serves as an example for anyone interested in building an HTML5 platformer without a pre-made engine.

## Running Locally
In most cases you can just download the repo and double-click the index.html file. Note that if you add in features that load assets in the javascript code (rather than the HTML), you may need to instead serve the game locally:

You can serve the game locally by cloning the project and running a local server: <br/><br/>
Clone repo:
```
git clone https://github.com/ZeroDayArcade/HTML5_Platformer
```

Run server with python:

```
python -m http.server 8080
```

Then navigate to localhost:8080 in your browser.<br/><br/>


## Game art 

The game art used in this demo was created by Luis Zuno (@ansimuz) and other wonderful contributors to opengameart.org

Hero Sprite: <a href="https://opengameart.org/content/gothicvania-cemetery-pack">opengameart.org/content/gothicvania-cemetery-pack</a><br/>
Backgrounds: <a href="https://opengameart.org/content/mountain-at-dusk-background">opengameart.org/content/mountain-at-dusk-background</a><br/>
Tiles: <a href="https://opengameart.org/content/dungeon-crawl-32x32-tiles">opengameart.org/content/dungeon-crawl-32x32-tiles</a><br/>

Music by Joth (@Joth_Music) <br/>
<a href="https://opengameart.org/content/cyberpunk-moonlight-sonata">opengameart.org/content/cyberpunk-moonlight-sonata</a>

