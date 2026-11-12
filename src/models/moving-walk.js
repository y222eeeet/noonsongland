import * as T from 'three';
import { MOVING_WALK_SPEED, ROUTES, routeHeight } from '../game/campus-routes-layout.js';

export function addMovingWalkArrows(scene) {
 const { ramp, upper, lower } = ROUTES;
 const length = ramp.x1 - ramp.x0;
 const slopeAngle = Math.atan2(lower - upper, length);
 const shape = new T.Shape();
 shape.moveTo(-.92, 0);
 shape.lineTo(-.12, .63);
 shape.lineTo(.70, .63);
 shape.lineTo(-.05, 0);
 shape.lineTo(.70, -.63);
 shape.lineTo(-.12, -.63);
 shape.closePath();
 const geometry = new T.ShapeGeometry(shape);
 geometry.rotateX(-Math.PI / 2);
 const material = new T.MeshBasicMaterial({
  color: '#a47ac4', transparent: true, opacity: .58, depthWrite: false
 });
 const count = Math.ceil(length / 5.4);
 const arrows = Array.from({ length: count }, () => {
  const arrow = new T.Mesh(geometry, material);
  arrow.rotation.z = slopeAngle;
  scene.add(arrow);
  return arrow;
 });
 let distance = 0;
 function update(dt) {
  distance = (distance + MOVING_WALK_SPEED * dt) % length;
  arrows.forEach((arrow, index) => {
   const along = (index * length / count + distance) % length;
   const x = ramp.x1 - along;
   const z = (ramp.z0 + ramp.z1) / 2;
   arrow.position.set(x, routeHeight(x, z) + .026, z);
   arrow.scale.setScalar(T.MathUtils.smoothstep(Math.min(along, length - along), .9, 1.8));
  });
 }
 update(0);
 return update;
}
