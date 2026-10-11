# Characters — independently drawn skeleton-based frames

Idle animations use frames 000-001; running animations use frames 000-005.
Left-facing character animations reuse the corresponding right-facing frames and
mirror them horizontally; the game does this for Sonia's animations and legacy
hurt sheet. Sonia's eight-frame jump sequence uses frame 003 on ascent, frames
004-005 on descent (005 holds until landing), and frames 006-007 on landing.
Attack artwork is scaled to 80% inside the original 128x96 canvas, anchored to the
same ground line. `animations.json` lists frame paths, playback rates, and
mirroring metadata.
`animations.json` lists frame paths and playback rates.

Size: 128x96 RGBA PNG; all images have genuine transparent backgrounds. Draw full frame without cropping. Foot sole baseline y=92 (last opaque pixel y=92 or y=93 depending nearest-neighbor).

Run frames 0-5: anatomical leg A forward full, half, closed, anatomical leg B forward full, half, closed. Arms counter-swing.

James: dark brown cap with orange `lttt`; Sonia: bright orange cap with white `lttt`.

These are newly drawn minimalist pixel-art interpretations; not extracted from the earlier illustrated reference.
