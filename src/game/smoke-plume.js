// Each puff starts at the mouth, then drifts within one overlapping plume.
export function placeSmokePuff(puff, index, progress, size = 1) {
 const spread = progress * (2 - progress);
 const variation = .75 + (index * 7 % 11) * .055;
 const drift = Math.sin(index * 2.4 + progress * 1.7) * .29;
 puff.position.set(
  spread * drift * variation,
  progress * (.75 + .65 * variation),
  progress * (.52 + .33 * variation),
 );
 puff.scale.set(size * (.38 + spread * .94), size * (.34 + spread * .76), size * (.38 + spread * .86));
}
