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

export function createSledMedal() {
 const medal = new T.Group();
 medal.position.set(0,1.58,.77);
 const gold = new T.MeshStandardMaterial({color:'#ffc83e',roughness:.55,metalness:.12});
 const rimGold = new T.MeshStandardMaterial({color:'#d99521',roughness:.56});
 const cream = new T.MeshStandardMaterial({color:'#fff9e8',roughness:.68});
 function add(geometry,material,x,y,z) {
  const mesh = new T.Mesh(geometry,material);
  mesh.position.set(x,y,z);
  medal.add(mesh);
  return mesh;
 }
 const stripes = ['#69b9ef','#fff8ee','#e85a59'].map(color=>new T.MeshStandardMaterial({color,roughness:.8}));
 for (const side of [-1,1]) {
  const ribbon = new T.Group();
  ribbon.position.set(side*.135,.41,-.043);
  ribbon.rotation.z = -side*.49;
  for (const [i,material] of stripes.entries()) {
   const stripe = new T.Mesh(new T.BoxGeometry(.05,.47,.025),material);
   stripe.position.x = -side*(i-1)*.05;
   ribbon.add(stripe);
  }
  medal.add(ribbon);
 }
 add(new RoundedBoxGeometry(.22,.11,.075,2,.025),gold,0,.23,0);
 add(new T.CylinderGeometry(.235,.235,.07,40),gold,0,0,0).rotation.x=Math.PI/2;
 add(new T.TorusGeometry(.191,.014,8,40),rimGold,0,0,.036);
 const one=new T.Shape();
 one.moveTo(-.065,.07);one.lineTo(-.012,.108);one.lineTo(.028,.108);
 one.lineTo(.028,-.074);one.lineTo(.072,-.074);one.lineTo(.072,-.105);
 one.lineTo(-.066,-.105);one.lineTo(-.066,-.074);one.lineTo(-.012,-.074);
 one.lineTo(-.012,.063);one.lineTo(-.049,.041);one.closePath();
 add(new T.ExtrudeGeometry(one,{depth:.007,bevelEnabled:false}),cream,0,0,.039);
 return medal;
}

const clapTarget = new T.Vector3();
const clapAxis = new T.Vector3(0,1,0);
export function clapSledRider(parts,elapsed) {
 const reach = (1-Math.cos(elapsed*Math.PI*5))*.5;
 for (const [i,arm] of [parts.arm0,parts.arm1].entries()) {
  const side = i===0?-1:1;
  const hand = arm.children[0];
  arm.rotation.set(0,0,0);
  // The rounded tips stay on the same line in front of the chest.
  clapTarget.set(side*T.MathUtils.lerp(.57,.16,reach),1.72,.76).sub(arm.position);
  const length = clapTarget.length();
  hand.position.copy(clapTarget).multiplyScalar(.5);
  hand.quaternion.setFromUnitVectors(clapAxis,clapTarget.normalize());
  hand.scale.y=(length+.22)/.68;
 }
}

export function resetSledClap(parts) {
 for (const [i,arm] of [parts.arm0,parts.arm1].entries()) {
  const side = i===0?-1:1;
  const hand = arm.children[0];
  hand.position.set(side*.17,-.27,0);
  hand.rotation.set(0,0,side*.55);
  hand.scale.y=1;
 }
}
