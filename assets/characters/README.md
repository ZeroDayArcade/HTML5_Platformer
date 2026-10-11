# Characters — independently drawn skeleton-based frames

Idle animations use frames 000-001 (two PNGs per direction); running animations
use frames 000-005. Sonia's left- and right-facing jumps each use eight transparent
PNG frames centered in the original 128x96 canvas with transparent padding. Both
directions use the same progression: frame 003 holds on ascent, frames 004-005
play on descent (005 holds until landing), and frames 006-007 play on landing.
`animations.json` lists frame paths and playback rates.

Size: 128x96 RGBA PNG; all images have genuine transparent backgrounds. Draw full frame without cropping. Foot sole baseline y=92 (last opaque pixel y=92 or y=93 depending nearest-neighbor).

Run frames 0-5: anatomical leg A forward full, half, closed, anatomical leg B forward full, half, closed. Arms counter-swing.

James: dark brown cap with orange `lttt`; Sonia: bright orange cap with white `lttt`.

These are newly drawn minimalist pixel-art interpretations; not extracted from the earlier illustrated reference.
