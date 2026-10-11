# Characters — independently drawn skeleton-based frames

Idle animations use frames 000-001; running animations use frames 000-005.
Left-facing character animations reuse the corresponding right-facing frames and
mirror them horizontally; the game does this for Sonia's animations and legacy
hurt sheet. Sonia's eight-frame jump sequence uses frame 003 on ascent, frames
004-005 on descent (005 holds until landing), and frames 006-007 on landing.
Attack artwork is scaled to 80% and stored on a 128x106 transparent canvas with
10 pixels of top padding to lower it without a render-time offset.
`animations.json` lists frame paths, playback rates, and mirroring metadata.

Standard frame size: 128x96 RGBA PNG; attack frames are 128x106. All images have
genuine transparent backgrounds. Draw full frame without cropping. The standard
foot sole baseline is y=92 (last opaque pixel y=92 or y=93 depending nearest-neighbor).

Run frames 0-5: anatomical leg A forward full, half, closed, anatomical leg B forward full, half, closed. Arms counter-swing.

James: dark brown cap with orange `lttt`; Sonia: bright orange cap with white `lttt`.

These are newly drawn minimalist pixel-art interpretations; not extracted from the earlier illustrated reference.
