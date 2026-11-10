import * as T from 'three';
import {mergeVertices} from 'three/addons/utils/BufferGeometryUtils.js';
import { ROUTES, inRect } from './campus-routes-layout.js';
export const FLOOR={upper:10.78,grass:10.68,foundation:10.60,lower:.05};

// Resolve all overlapping floor patches into a disjoint planar subdivision.
// Pavement wins over grass. Every cell has exactly one visible surface.
export function unifyWorldFloors(scene,materials){
 const zones=[
  {x0:-66,x1:32,z0:-22,z1:-8,paved:true},
  {x0:-65,x1:-47,z0:-8,z1:32,paved:true},
  // Connect Myungshin's entrance apron directly to the main walk.
  {x0:-70,x1:-64,z0:-10,z1:17,paved:true}
 ];
 scene.updateMatrixWorld(true);const remove=[];
 scene.traverse(o=>{
  if(!o.isMesh)return;
  if(o.geometry.type==='ShapeGeometry'&&Math.abs(o.position.y-FLOOR.upper)<.001){remove.push(o);return;}
  const p=o.geometry.parameters;
  if(o.geometry.type!=='BoxGeometry'||p.height>.17)return;
  const box=new T.Box3().setFromObject(o),top=box.max.y;
  const paved=o.material===materials.path&&Math.abs(top-FLOOR.upper)<.04;
  const grass=o.material===materials.grass2&&Math.abs(top-FLOOR.grass)<.04;
  if(!paved&&!grass)return;
  zones.push({x0:box.min.x,x1:box.max.x,z0:box.min.z,z1:box.max.z,paved});remove.push(o);
 });
 remove.forEach(o=>{o.removeFromParent();o.geometry.dispose();});
 const cut=ROUTES.stairs;
 const xs=[...new Set([...zones.flatMap(r=>[r.x0,r.x1]),cut.x0,cut.x1])].sort((a,b)=>a-b);
 const zs=[...new Set([...zones.flatMap(r=>[r.z0,r.z1]),cut.z0,cut.z1])].sort((a,b)=>a-b);
 const vertices=[[],[]];let count=0;
 for(let i=0;i<xs.length-1;i++)for(let j=0;j<zs.length-1;j++){
  const x0=xs[i],x1=xs[i+1],z0=zs[j],z1=zs[j+1],x=(x0+x1)/2,z=(z0+z1)/2;
  if(inRect(x,z,cut))continue;
  const covering=zones.filter(r=>x>r.x0&&x<r.x1&&z>r.z0&&z<r.z1);
  if(!covering.length)continue;
  const paved=covering.some(r=>r.paved),y=paved?FLOOR.upper:FLOOR.grass;
  vertices[+paved].push(x0,y,z0,x0,y,z1,x1,y,z1,x0,y,z0,x1,y,z1,x1,y,z0);count++;
 }
 vertices.forEach((v,i)=>{const raw=new T.BufferGeometry();raw.setAttribute('position',new T.Float32BufferAttribute(v,3));const g=mergeVertices(raw);g.computeVertexNormals();const m=new T.Mesh(g,i?materials.path:materials.grass2);m.receiveShadow=true;m.castShadow=false;scene.add(m);raw.dispose();});
 return {zones,cells:count,isUpper(x,z){return !inRect(x,z,cut)&&zones.some(r=>x>=r.x0&&x<=r.x1&&z>=r.z0&&z<=r.z1);}};
}
