# Our Little Adventure — Project Plan

## Confirmed direction

- **Working title:** *Our Little Adventure: A 10,000 Days Special Edition*.
- **Purpose:** A proposal game for December 3, 2026, played offline on a laptop in a private hotel space in San Francisco.
- **Style:** 2D retro Nintendo / GBA-inspired pixel platformer.
- **Target length:** About 5–8 minutes across 4–5 short levels.
- **Gameplay balance:** Roughly 70% platforming/action and 30% light puzzles, interactions, and memory collecting.
- **Technical constraints:** Native JavaScript, HTML5 Canvas, and CSS; no large framework, bundler, or unnecessary dependency. Preserve the original movement and physics wherever possible, and prefer small reversible changes.
- **Death behavior:** Death from enemies, falling, or lethal hazards restarts the current level. No checkpoints and no full-game reset on death.
- **Ending direction:** Complete the game, show a completion message, play a locally stored friends' video, then show a final romantic message. Video integration is a later, loosely coupled feature.
- **Conditional hidden ending:** In the final regular level, the player can find a hidden route before finishing. Finding it leads to a special proposal level; otherwise, finishing the level leads to the normal ending.

## Current prototype

- The project is a plain HTML/CSS/JavaScript game with assets loaded locally from `index.html`.
- `main.js` contains the main loop, movement, physics, collision, rendering, and game-state screens.
- Level tilemaps live in separate files under `levels/` and register in load order through `window.gameLevels`.
- There are currently two levels. Reaching the end of the first automatically loads the second; completing the last loaded level shows the completion screen.
- Level 1 has a continuous bottom floor to make the current test easier.
- The movement, collision, and rendering systems have not yet been redesigned. Collectible locations and behavior are still partly hard-coded in `main.js`.

## Story outline (tentative)

These names and themes are placeholders and can change:

1. **The Beginning** — meeting and getting to know each other; tutorial.
2. **Little Things** — everyday life, small switches, and simple mechanisms.
3. **Our Adventures** — travel memories, moving platforms, and harder jumps.
4. **Memory Puzzle** — a small puzzle using clues from earlier levels.
5. **The Next Adventure** — a gentler, warm finale.

## Puzzle direction under consideration

The player could find short clues while platforming, then use them to solve a simple code or ordering puzzle near a level exit. Keep puzzles brief and optional to the platforming rhythm. The exact puzzle, clues, answer, and interaction controls are **not finalized**.

Possible first prototype: collect or inspect three memory clues, infer a three-part code, and enter it at a door. Store puzzle data with the level rather than embedding each puzzle's answer and coordinates in the core game code.

## Hidden proposal route

The hidden proposal level is an optional branch from the final regular level, not a required part of the normal route. The player should have a fair chance to notice and reach the secret route during platforming. If discovered before taking the normal exit, it routes to the proposal level; otherwise, the normal ending plays.

Still to design: how the secret entrance is hinted at, its exact location and trigger, what the normal ending contains, and how the friends' video fits each ending path.

## Suggested next steps

1. Play through the current two-level prototype and tune the platform spacing and difficulty.
2. Move collectible definitions out of hard-coded coordinates in `main.js` into level data.
3. Add a small reusable interaction prompt and clue display.
4. Prototype one short code puzzle in a test level.
5. Only after the core game flow is stable, plan the local video handoff and final screen.

## Working rule

Keep confirmed decisions in **Confirmed direction**. Keep brainstorms in a tentative or under-consideration section until they are explicitly chosen.
