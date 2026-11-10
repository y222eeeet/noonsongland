import * as T from 'three';
import {ROUTES} from '../game/campus-routes-layout.js';

export function extendSmokingBoundary(scene,obstacles,M){
 const group=new T.Group();group.name='extended-smoking-court-and-boundary';scene.add(group);
 function mesh(geometry,material,x,y,z){const o=new T.Mesh(geometry,material);o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;group.add(o);return o;}
 const deck=ROUTES.smokingRear;
 // Continue the existing rear court to the far end of Saehim, at the same level.
 mesh(new T.BoxGeometry(deck.x1-deck.x0,.10,deck.z1-deck.z0),M.path,(deck.x0+deck.x1)/2,ROUTES.upper-.05,(deck.z0+deck.z1)/2);
 // The old rear court already has a support block as far as z=24.5.
 mesh(new T.BoxGeometry(deck.x1-deck.x0,10.74,deck.z1-24.5),M.cream,(deck.x0+deck.x1)/2,5.23,(24.5+deck.z1)/2);
 // Match the rear gate's existing lavender railing. Preserve its open entrance
 // (z=-22.5 to -12.5) and its short wings, extending only beyond their ends.
 for(const [z0,z1] of [[-32,-28],[-7,46]]){
  const x=-95,length=z1-z0,posts=Math.ceil(length);
  for(let i=0;i<=posts;i++)mesh(new T.BoxGeometry(.12,1.7,.10),M.lav,x,ROUTES.upper+.85,z0+length*i/posts);
  mesh(new T.BoxGeometry(.12,.12,length),M.lav,x,ROUTES.upper+1.6,(z0+z1)/2);
  obstacles.push({x,z:(z0+z1)/2,w:.15,h:length/2});
 }
 const wood=new T.MeshStandardMaterial({color:'#ad8875',roughness:.85});
 for(const z of [26,33,40])for(const [x,rotation] of [[-92,Math.PI/2],[-79,-Math.PI/2]]){
  const bench=new T.Group();bench.name='saehim-smoking-bench';bench.position.set(x,ROUTES.upper,z);bench.rotation.y=rotation;group.add(bench);
  for(const [geometry,material,position] of [
   [new T.BoxGeometry(2.7,.18,.65),wood,[0,.72,0]],
   [new T.BoxGeometry(2.7,.72,.14),M.lav,[0,1.1,-.31]],
   ...[-1,1].map(side=>[new T.BoxGeometry(.15,.66,.45),M.dark,[side,.33,0]])
  ]){const part=new T.Mesh(geometry,material);part.position.set(...position);part.castShadow=part.receiveShadow=true;bench.add(part)}
  obstacles.push({x,z,w:.55,h:1.5});
 }
 // Six existing benches frame a second pavilion without closing the side aisles.
 const pavilion=new T.Group();pavilion.name='saehim-smoking-pavilion';
 pavilion.position.set(-85.5,ROUTES.upper,33);pavilion.scale.setScalar(1.3);group.add(pavilion);
 function pavilionPart(geometry,material,x,y,z){const part=new T.Mesh(geometry,material);part.position.set(x,y,z);part.castShadow=part.receiveShadow=true;pavilion.add(part);return part;}
 pavilionPart(new T.CylinderGeometry(3.6,3.8,.2,8),M.cream,0,.1,0);
 const roof=pavilionPart(new T.ConeGeometry(4.4,2.1,4),M.pink,0,4.15,0);roof.rotation.y=Math.PI/4;
 pavilionPart(new T.BoxGeometry(6.1,.23,6.1),wood,0,3.12,0);
 for(const x of [-2.7,2.7])for(const z of [-2.7,2.7]){
  pavilionPart(new T.CylinderGeometry(.14,.17,3,8),wood,x,1.65,z);
  obstacles.push({x:-85.5+x*1.3,z:33+z*1.3,r:.28});
 }
 // Keep the six benches and their side aisles around the second pavilion.
 const pavilion=new T.Group();pavilion.name='saehim-smoking-pavilion';
 pavilion.position.set(-85.5,ROUTES.upper,33);pavilion.scale.setScalar(1.3);group.add(pavilion);
 function pavilionPart(geometry,material,x,y,z){const part=new T.Mesh(geometry,material);part.position.set(x,y,z);part.castShadow=part.receiveShadow=true;pavilion.add(part);return part;}
 pavilionPart(new T.CylinderGeometry(3.6,3.8,.2,8),M.cream,0,.1,0);
 const roof=pavilionPart(new T.ConeGeometry(4.4,2.1,4),M.pink,0,4.15,0);roof.rotation.y=Math.PI/4;
 pavilionPart(new T.BoxGeometry(6.1,.23,6.1),wood,0,3.12,0);
 for(const x of [-2.7,2.7])for(const z of [-2.7,2.7]){
  pavilionPart(new T.CylinderGeometry(.14,.17,3,8),wood,x,1.65,z);
  obstacles.push({x:-85.5+x*1.3,z:33+z*1.3,r:.28});
 }
 return group;
}
