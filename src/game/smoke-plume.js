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
 puff.scale.setScalar(size * (.38 + spread * .86));
}

export function prepareSmokeExhale(group, seconds) {
 const held = Number.isFinite(seconds) ? Math.max(0, Math.min(6, seconds)) : 2;
 const amount = held / 6;
 while (group.children.length < 24) group.add(group.children[0].clone());
 const count = 3 + Math.round(amount * 21);
 const emission = .15 + amount * 1.8;
 group.children.forEach((puff, index) => {
  if (!puff.userData.ownSmokeMaterial) {
   puff.material = puff.material.clone();
   puff.userData.ownSmokeMaterial = true;
  }
  puff.visible = false;
  puff.userData.delay = index / (count - 1) * emission;
 });
 const profile = { held, count, duration: emission + 1.6, radius: .16 + amount * .22 };
 group.userData.exhale = profile;
 return profile;
}

export function updateSmokeExhale(group, age) {
 const { count, radius } = group.userData.exhale;
 group.scale.setScalar(1);
 group.children.forEach((puff, index) => {
  const life = age - puff.userData.delay;
  puff.visible = index < count && life >= 0 && life < 1.6;
  if (!puff.visible) return;
  placeSmokePuff(puff, index, life / 1.6, radius / .23);
  puff.material.opacity = (.25 + .18 * (count / 24)) * (1 - life / 1.6);
 });
}
