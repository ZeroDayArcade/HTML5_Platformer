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
- Level tilemaps live in separate files under `levels/` and register in load order through `window.gameLevels`. A `-1` tile marks James's spawn; enemy positions use `{ column, floorRow }` tile coordinates, where `column` is the pig's left edge and `floorRow` is its supporting row. `main.js` validates and converts these positions to pixels.
- There are currently two levels. Completing a level shows its completion screen; press Enter to continue to the next level or return to the title after the last level.
- Level 1 now has two bottom-floor pits around a ground patrol area for the
  ribbon pig enemy.
- The ribbon pig is level-one-only, patrols left and right, turns around when
  the ground ahead ends or a solid obstacle blocks its path, and restarts the
  current level when it touches Sonia. Its animation PNGs are 64x48 RGBA
  (resized in place from the original 128x96 frames); the game draws them at
  their native dimensions.
- Pressing S commits Sonia to the complete attack animation; movement and jump
  inputs are ignored until it finishes. Attacks can only start while Sonia is
  grounded. A correctly timed attack hit plays the pig's death animation
  followed by its death effect without moving the pig, then removes it from
  collision and patrol.
- The game-over screen uses the existing hurt animation and labels Escape as
  the restart control.
- Level 2 is a longer, three-screen route with progressively wider pits,
  stepping platforms, and an elevated sleep-powder pickup. Ordinary attacks
  cannot defeat its armored pig; a successful attack with the powder puts it
  to sleep, and the powder remains in the backpack.
- The movement, collision, and rendering systems have not yet been redesigned.
  The wing collectible still uses a hard-coded coordinate;
  level-specific items such as sleep powder are stored with their level data.

## Three-level progression (latest proposal; details to confirm)

The latest design proposal focuses the playable story on three increasingly
challenging platforming levels. It replaces the earlier tentative five-part
story outline below as the current narrative direction, but whether the whole
game should now be exactly three levels (rather than the previously confirmed
4–5 short levels) remains an open scope decision.

1. **Learn the moves** — A familiar, classic side-scrolling platforming
   introduction. Give the player safe opportunities to learn movement, jumping,
   and attacking before combining those actions. The first enemy is a
   particularly fierce pig creature. Teach its threat and attack timing before
   asking the player to handle multiple hazards at once.
2. **Find another way** — Introduce armored enemies that cannot be defeated by
   ordinary attacks. The player finds sleep powder on a raised platform route;
   a successful attack makes the pig sleep, and the powder remains in the
   backpack. Reinforce that attacking is not the solution to every obstacle.
3. **The way to space** — Reuse the armored-enemy/item lesson with harder
   platforming and more demanding encounters. James is not waiting at the
   expected destination. A hidden wing item lets the player fly much higher,
   reach space, and finally meet James there. The wing's location, discovery
   hint, flight controls, and whether this is the required ending or a hidden
   route are still to be designed.

The phrase "最後中點沒有 James" in the proposal is interpreted here as James
not being at the expected final destination; confirm if it instead means a
specific midpoint. The third-level and hidden-route beats remain design
proposals, not implemented game behavior.

### Open decisions

- Confirm whether the game is now three levels total or retains the earlier
  4–5-level target, with these three as the main progression.
- Decide how the wing is hinted at and whether the space meeting is required or
  an optional hidden ending.
- Decide whether the pig and armored enemies recur in later levels or are
  level-specific.

The previous story concepts (everyday-life switches, travel memories, and a
memory puzzle) remain optional material and are not part of the latest
three-level proposal unless brought back deliberately.

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
