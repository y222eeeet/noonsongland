import * as T from 'three';
import {POND_OUTLINE,STONE_BRIDGE as B,POND_COURT as C,pondWalkHeight} from '../game/pond-layout.js';

export function addCampusPond(scene,M){
 const root=new T.Group();root.name='flowing-campus-pond';scene.add(root);
 const shape=new T.Shape();POND_OUTLINE.forEach(([x,z],i)=>i?shape.lineTo(x,-z):shape.moveTo(x,-z));shape.closePath();
 const waterMaterial=new T.MeshStandardMaterial({color:'#83c4ca',roughness:.34,metalness:.05});
 const time={value:0};
 waterMaterial.onBeforeCompile=shader=>{
  shader.uniforms.uPondTime=time;
  shader.vertexShader='varying vec2 vPondPosition;\n'+shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvPondPosition=position.xy;');
  shader.fragmentShader='uniform float uPondTime;varying vec2 vPondPosition;\n'+shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
   float ripple=sin(vPondPosition.x*.85+vPondPosition.y*1.8-uPondTime*.48)*sin(vPondPosition.y*.72-uPondTime*.24);
   float glint=smoothstep(.94,1.,sin(vPondPosition.x*.58+vPondPosition.y*2.7-uPondTime*.42));
   diffuseColor.rgb*=.96+ripple*.045;diffuseColor.rgb+=vec3(.035,.050,.050)*glint;`);
 };
 waterMaterial.customProgramCacheKey=()=> 'slow-campus-pond-v1';
 const water=new T.Mesh(new T.ShapeGeometry(shape,16),waterMaterial);water.rotation.x=-Math.PI/2;water.position.y=.11;water.receiveShadow=true;root.add(water);
 const stone=new T.MeshStandardMaterial({color:'#d5cec0',roughness:.95}),stoneAlt=new T.MeshStandardMaterial({color:'#c6beb1',roughness:.97});
 function box(w,h,d,mat,x,y,z){const m=new T.Mesh(new T.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);m.castShadow=m.receiveShadow=true;root.add(m);return m;}
 // A connected, gently arched stone deck, laid in staggered masonry courses.
 const columns=9,rows=14,depth=(B.z1-B.z0)/rows;
 for(let i=0;i<rows;i++){
  const z=B.z0+(i+.5)*depth,top=pondWalkHeight(0,z);
  for(let j=0;j<columns;j++)box((B.x1-B.x0)/columns-.025,.24,depth-.025,(i+j)%3?stone:stoneAlt,B.x0+(j+.5)*(B.x1-B.x0)/columns,top-.12,z);
  for(const side of [-1,1])box(.25,.24,depth-.045,stoneAlt,side*(B.x1+.10),top+.02,z);
 }
 box(C.x1-C.x0,.12,C.z1-C.z0,M.path,(C.x0+C.x1)/2,0,(C.z0+C.z1)/2);
 // Low banks outline the pond but leave both bridge approaches open.
 for(let i=0;i<POND_OUTLINE.length;i++){
  const a=POND_OUTLINE[i],b=POND_OUTLINE[(i+1)%POND_OUTLINE.length],length=Math.hypot(b[0]-a[0],b[1]-a[1]),count=Math.ceil(length/1.7);
  for(let n=0;n<count;n++){const t=(n+.5)/count,x=a[0]+(b[0]-a[0])*t,z=a[1]+(b[1]-a[1])*t;if(x>B.x0-.45&&x<B.x1+.45)continue;const bank=new T.Mesh(new T.DodecahedronGeometry(.55,1),n%3?stone:stoneAlt);bank.position.set(x,.08,z);bank.scale.set(1.55,.35,.65);bank.rotation.y=-Math.atan2(b[1]-a[1],b[0]-a[0]);bank.castShadow=bank.receiveShadow=true;root.add(bank)}
 }
 return {root,update:seconds=>{time.value=seconds}};
}
