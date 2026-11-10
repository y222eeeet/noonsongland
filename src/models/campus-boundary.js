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
 return group;
}
