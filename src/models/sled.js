import * as T from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { ROUTES, routeHeight } from '../game/campus-routes-layout.js';

const seatTop = .575;
export const SLED_RIDER_OFFSET = seatTop - 1.075;
const grade = (ROUTES.lower - ROUTES.upper) / (ROUTES.sledHill.x1 - ROUTES.sledHill.x0);
const normal = new T.Vector3(-grade, 1, 0).normalize();
const heading = new T.Vector3(), right = new T.Vector3();
const basis = new T.Matrix4();

export function placeSled(sled, x, z, yaw) {
 heading.set(Math.sin(yaw), grade * Math.sin(yaw), Math.cos(yaw)).normalize();
 right.crossVectors(normal, heading).normalize();
 sled.quaternion.setFromRotationMatrix(basis.makeBasis(right, normal, heading));
 sled.position.set(x, routeHeight(x, z) + .015, z);
}

export function createSled() {
 const sled = new T.Group();
 const wood = new T.MeshStandardMaterial({color:'#bb875f',roughness:.76});
 const seatWood = new T.MeshStandardMaterial({color:'#d3a177',roughness:.76});
 const runners = new T.MeshStandardMaterial({color:'#88644e',roughness:.68});
 function add(geometry, material, x, y, z) {
  const mesh = new T.Mesh(geometry, material);
  mesh.position.set(x, y, z);
  mesh.castShadow = mesh.receiveShadow = true;
  sled.add(mesh);
  return mesh;
 }
 function box(width, height, depth, material, x, y, z) {
  return add(new RoundedBoxGeometry(width, height, depth, 2, .045), material, x, y, z);
 }
 const runnerPath = new T.CatmullRomCurve3([
  [0,.085,-1.59],[0,.085,-.8],[0,.085,.3],[0,.085,1.02],[0,.15,1.45],[0,.36,1.73]
 ].map(point=>new T.Vector3(...point)),false,'catmullrom',0);
 const rail = new T.TubeGeometry(runnerPath,32,.085,10,false);
 for(const x of [-1.04,1.04]){
  add(rail,runners,x,0,0);
  add(new T.SphereGeometry(.085,10,8),runners,x,.36,1.73);
  for(const z of [-1.14,.73])box(.19,.19,.30,wood,x,.18,z);
 }
 box(2.43,.14,3.10,wood,0,.245,.015);
 for(const x of [-.69,.69])box(.26,.22,1.28,wood,x,.38,-.35);
 box(1.84,.16,1.37,seatWood,0,seatTop-.08,-.35);
 box(1.86,.55,.15,wood,0,.76,-1.03);
 return sled;
}
