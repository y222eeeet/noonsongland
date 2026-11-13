import * as T from 'three';
import { ROUTES, routeHeight } from '../game/campus-routes-layout.js';

const fallHeight=9;

export function addSledSnow(scene) {
 const {ramp,sledHill}=ROUTES;
 const flakes=[ramp,sledHill].flatMap(({x0,x1,z0,z1})=>
  Array.from({length:Math.round((x1-x0)*(z1-z0)*.45)},()=>{
   const drift=.24;
   const x=T.MathUtils.randFloat(x0+drift,x1-drift);
   const z=T.MathUtils.randFloat(z0+drift,z1-drift);
   return {x,z,floor:routeHeight(x,z),height:Math.random()*fallHeight,
    phase:Math.random()*Math.PI*2,speed:T.MathUtils.randFloat(.65,1.5),drift};
  })
 );
 const canvas=document.createElement('canvas');
 canvas.width=canvas.height=32;
 const ctx=canvas.getContext('2d');
 const glow=ctx.createRadialGradient(16,16,3,16,16,16);
 glow.addColorStop(0,'#fff');
 glow.addColorStop(.48,'#fff');
 glow.addColorStop(.73,'#b7c7e6b0');
 glow.addColorStop(1,'#b7c7e600');
 ctx.fillStyle=glow;
 ctx.fillRect(0,0,32,32);
 const texture=new T.CanvasTexture(canvas);
 texture.colorSpace=T.SRGBColorSpace;
 const positions=new T.BufferAttribute(new Float32Array(flakes.length*3),3);
 positions.setUsage(T.DynamicDrawUsage);
 const geometry=new T.BufferGeometry();
 geometry.setAttribute('position',positions);
 const material=new T.PointsMaterial({map:texture,size:.20,transparent:true,depthWrite:false,opacity:.86});
 const snow=new T.Points(geometry,material);
 snow.name='sled-route-snow';
 snow.frustumCulled=false;
 scene.add(snow);

 function update(dt,visible=true) {
  snow.visible=visible;
  if(!visible)return;
  flakes.forEach((flake,i)=>{
   flake.height=(flake.height+fallHeight-dt*flake.speed)%fallHeight;
   flake.phase+=dt*.9;
   positions.setXYZ(i,flake.x+Math.sin(flake.phase)*flake.drift,
    flake.floor+flake.height+.10,flake.z+Math.cos(flake.phase)*flake.drift);
  });
  positions.needsUpdate=true;
 }
 update(0);
 return update;
}
