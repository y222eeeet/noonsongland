import * as T from 'three';
import {ROUTES} from '../game/campus-routes-layout.js';

export function addSaehimAndRoutes(scene,obstacles,M){
 const group=new T.Group();group.name='saehim-and-connections';scene.add(group);
 function mesh(g,m,x,y,z,parent=group){const o=new T.Mesh(g,m);o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;parent.add(o);return o;}
 // Remove the existing terrace's support only beneath the new stair opening.
 const cut=ROUTES.stairs;
 for(const old of [...scene.children]){
  const p=old.geometry?.parameters;if(!old.isMesh||old.material!==M.cream||old.geometry.type!=='BoxGeometry'||Math.abs(p.height-10.74)>.01)continue;
  const x0=old.position.x-p.width/2,x1=old.position.x+p.width/2,z0=old.position.z-p.depth/2,z1=old.position.z+p.depth/2;
  const a=Math.max(x0,cut.x0),b=Math.min(x1,cut.x1),c=Math.max(z0,cut.z0),d=Math.min(z1,cut.z1);if(a>=b||c>=d)continue;
  for(const [l,r,t,u] of [[x0,a,z0,z1],[b,x1,z0,z1],[a,b,z0,c],[a,b,d,z1]])if(r-l>.001&&u-t>.001)mesh(new T.BoxGeometry(r-l,p.height,u-t),old.material,(l+r)/2,old.position.y,(t+u)/2);
  old.removeFromParent();old.geometry.dispose();
 }
 function upperPatch(r){mesh(new T.BoxGeometry(r.x1-r.x0,.10,r.z1-r.z0),M.path,(r.x0+r.x1)/2,ROUTES.upper-.05,(r.z0+r.z1)/2)}
 upperPatch(ROUTES.smokingWalk);upperPatch(ROUTES.southCourt);
 mesh(new T.BoxGeometry(30,10.74,29),M.cream,-62,5.23,31.5);
 const hall=new T.Group();hall.name='saehim-hall';hall.position.set(-73,ROUTES.upper,33);group.add(hall);
 const glass=new T.MeshStandardMaterial({color:'#8ebbc9',roughness:.5,metalness:.05});glass.userData.campusWindow=true;
 mesh(new T.BoxGeometry(6.8,10.8,25),M.cream,0,5.4,0,hall);
 mesh(new T.BoxGeometry(7.6,.45,25.8),M.lav,0,11.0,0,hall);
 mesh(new T.BoxGeometry(6.8,.16,24.8),M.pink,0,11.30,0,hall);
 for(const side of [-1,1]){
  mesh(new T.BoxGeometry(.12,8.0,22.5),glass,side*3.46,6.0,0,hall);
  for(let i=0;i<10;i++)mesh(new T.BoxGeometry(.16,8.2,.16),M.cream,side*3.54,6,-10.5+i*2.35,hall);
  for(let i=0;i<5;i++)mesh(new T.BoxGeometry(.16,.14,22.8),M.cream,side*3.54,2.0+i*2.0,0,hall);
 }
 mesh(new T.BoxGeometry(.2,2.5,3.2),M.dark,3.55,1.25,-1,hall);
 mesh(new T.BoxGeometry(1.7,.23,5.1),M.pink,3.95,2.65,-1,hall);
 mesh(new T.BoxGeometry(1.8,.16,4.6),M.cream,4.1,.08,-1,hall);
 const canvas=document.createElement('canvas');canvas.width=768;canvas.height=128;const ctx=canvas.getContext('2d');ctx.fillStyle='#fff8ed';ctx.fillRect(0,0,768,128);ctx.fillStyle='#655873';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='bold 58px sans-serif';ctx.fillText('새힘관',384,64);const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;
 const sign=mesh(new T.PlaneGeometry(5.8,.95),new T.MeshBasicMaterial({map:texture}),3.78,9.8,0,hall);sign.rotation.y=Math.PI/2;sign.castShadow=sign.receiveShadow=false;
 obstacles.push({x:-73,z:33,w:3.6,h:12.7});
 // Solid treads share the exact heights used by traversal.
 const s=ROUTES.stairs,depth=(s.z1-s.z0)/s.steps;
 for(let i=0;i<s.steps;i++){const h=ROUTES.lower+(ROUTES.upper-ROUTES.lower)*(1-i/s.steps);mesh(new T.BoxGeometry(s.x1-s.x0,h-ROUTES.lower,depth),i%2?M.cream:M.path,(s.x0+s.x1)/2,(h+ROUTES.lower)/2,s.z0+(i+.5)*depth)}
 // One continuous sloping surface, with support underneath, not stacked floor patches.
 const r=ROUTES.ramp,vertices=[r.x0,ROUTES.upper,r.z0,r.x0,ROUTES.upper,r.z1,r.x1,ROUTES.lower,r.z1,r.x1,ROUTES.lower,r.z0,r.x0,ROUTES.lower,r.z0,r.x0,ROUTES.lower,r.z1];
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(vertices,3));g.setIndex([0,1,2,0,2,3,0,4,5,0,5,1,0,3,4,1,5,2]);g.computeVertexNormals();mesh(g,M.path,0,0,0);
 const w=ROUTES.groundWalk;mesh(new T.BoxGeometry(w.x1-w.x0,.10,w.z1-w.z0),M.path,(w.x0+w.x1)/2,0,(w.z0+w.z1)/2);
 return {minX:-101,maxX:47,minZ:-70,maxZ:50};
}
