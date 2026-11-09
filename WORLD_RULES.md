# World rendering rules

- All directional shadows use `src/game/shadows.js`. Never restore an origin-centered, fixed sun/shadow camera in a building module.
- Call the shadow updater with the player's world position before every render. It follows horizontal movement and upper/lower terrain levels; map bounds do not control shadow coverage.
- Keep a 56-unit shadow guard region around the player and a 220-unit depth range. If camera distance or maximum building height increases, re-evaluate both coverage and depth; do not just enlarge the entire world shadow map and reduce resolution.
- Keep directional-light direction constant while moving its position and target together. Snap tracking to shadow texels to reduce movement shimmer.
- Ground foundations must end at or below Y=10.60, grass at or below 10.68, and upper walkable pavement at 10.78. Never overlay two coplanar visible floors. A new floor patch must either join an existing surface without overlap or use the shared continuous surface.
- Register new building footprint collisions and world bounds together. Keep lower-road surfaces at their actual lower level.
- After expansions inspect a shadow while standing and moving near Soonheon, Jinri, Myungshin, the rear gate, stairs, and both terrain levels. Check shadow clipping, flickering floor surfaces, and daylight/nightlight separately. A successful build alone is not visual verification.

## Mandatory shared floor pipeline
- `src/game/floors.js` owns `FLOOR` level constants and the final visible upper floor surfaces.
- Call `unifyWorldFloors` after all landmark floor patches are registered and before gameplay starts. It converts overlapping pavement/grass rectangles to disjoint cells, with pavement priority. Do not add visible upper floor patches after this pass.
- Register new floor outlines through this pipeline; support blocks must remain below the visible floor. Never use polygon offsets as a substitute for removing duplicate surfaces.
- Walkability must query the same zone registry (`worldFloor.isUpper`) used by rendering. Entrance paths must connect to that registry, not stop at an isolated apron or lawn gap.
