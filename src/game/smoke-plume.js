// Each puff starts at the mouth, then drifts into an overlapping lobe.
export function placeSmokePuff(puff, index, progress, size = 1) {
 const spread = progress * (2 - progress);
 const side = index % 3 === 0 ? 0 : index % 3 === 1 ? -1 : 1;
 const variation = .75 + (index * 7 % 11) * .055;
 const curl = Math.sin(index * 2.4 + spread * 3) * .16;
 puff.position.set(
  spread * (side * .68 * variation + curl),
  progress * (.75 + .65 * variation),
  progress * (.52 + .33 * variation),
 );
 puff.scale.set(size * (.38 + spread * .94), size * (.34 + spread * .76), size * (.38 + spread * .86));
}
