import * as T from 'three';

export function createDizzySpirals(scene) {
 const points = Array.from({length: 41}, (_, index) => {
  const progress = index / 40;
  const angle = progress * Math.PI * 3.2;
  const radius = .06 + .37 * progress;
  return new T.Vector3(Math.cos(angle) * radius, Math.sin(angle) * radius, 0);
 });
 const tube = new T.TubeGeometry(new T.CatmullRomCurve3(points), 48, .055, 8, false);
 const cap = new T.SphereGeometry(.055, 8, 6);
 const material = new T.MeshStandardMaterial({
  color: '#d96e79', roughness: .75, emissive: '#b84457', emissiveIntensity: .45,
  depthTest: false, depthWrite: false
 });
 const root = new T.Group();
 root.name = 'chug-dizzy-spirals';
 root.visible = false;
 scene.add(root);
 const placements = [[-.70,.57,34],[.62,.43,27],[-.47,-.38,31],[.49,-.49,25]];
 placements.forEach(() => {
  const spiral = new T.Group();
  const stroke = new T.Mesh(tube, material);
  const start = new T.Mesh(cap, material);
  const end = new T.Mesh(cap, material);
  start.position.copy(points[0]);
  end.position.copy(points.at(-1));
  spiral.add(stroke, start, end);
  spiral.traverse(part => {part.renderOrder = 20;});
  root.add(spiral);
 });
 return {
  hide() {root.visible = false;},
  update(camera, now, viewportHeight) {
   root.visible = true;
   root.position.copy(camera.position);
   root.quaternion.copy(camera.quaternion);
   const halfHeight = Math.tan(T.MathUtils.degToRad(camera.getEffectiveFOV()) / 2);
   const pixel = 2 * halfHeight / Math.max(viewportHeight, 1);
   root.children.forEach((spiral, index) => {
    const [x, y, size] = placements[index];
    const phase = now * .0024 + index * 1.71;
    spiral.position.set(x * halfHeight * camera.aspect + Math.sin(phase) * 14 * pixel,
     y * halfHeight + Math.cos(phase * 1.37) * 10 * pixel, -1);
    spiral.rotation.set(.24 * Math.sin(phase), .33 * Math.cos(phase), phase);
    spiral.scale.setScalar(size * pixel * (1 + .10 * Math.sin(phase * 1.8)));
   });
  }
 };
}
