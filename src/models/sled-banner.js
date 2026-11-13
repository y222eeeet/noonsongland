import * as T from 'three';
import { ROUTES } from '../game/campus-routes-layout.js';

import bannerUrl from '../assets/sled-banner.webp';

export function addSledBanner(parent,obstacles) {
 const {sledHill,upper}=ROUTES;
 const width=sledHill.z1-sledHill.z0;
 const poleHeight=7.65,bannerHeight=2.18;
 const gate=new T.Group();
 gate.name='sled-summit-banner';
 gate.position.set(sledHill.x0-.16,upper,(sledHill.z0+sledHill.z1)/2);
 parent.add(gate);
 const poleMaterial=new T.MeshStandardMaterial({color:'#8880a7',roughness:.68});
 const capMaterial=new T.MeshStandardMaterial({color:'#e1d6f0',roughness:.64});
 function place(geometry,material,y,z){
  const mesh=new T.Mesh(geometry,material);
  mesh.position.set(0,y,z);gate.add(mesh);
  return mesh;
 }
 for(const z of [-width/2,width/2]){
  place(new T.CylinderGeometry(.115,.15,poleHeight,12),poleMaterial,poleHeight/2,z);
  place(new T.CylinderGeometry(.27,.31,.22,12),capMaterial,.11,z);
  place(new T.SphereGeometry(.20,12,8),capMaterial,poleHeight,z);
  obstacles.push({x:gate.position.x,z:gate.position.z+z,r:.15});
 }
 const support=place(new T.CylinderGeometry(.035,.035,width,8),poleMaterial,poleHeight-.18,0);
 support.rotation.x=Math.PI/2;

 const texture=new T.TextureLoader().load(bannerUrl);
 texture.colorSpace=T.SRGBColorSpace;
 texture.anisotropy=4;
 const material=new T.MeshBasicMaterial({map:texture});
 material.color.setScalar(.96);
 const cloth=new T.PlaneGeometry(width,bannerHeight,24,1);
 const vertices=cloth.attributes.position;
 for(let i=0;i<vertices.count;i++){
  const u=vertices.getX(i)/(width/2);
  vertices.setY(i,vertices.getY(i)-.22*(1-u*u));
 }
 cloth.computeBoundingSphere();
 for(const side of [-1,1]){
  const face=place(cloth,material,poleHeight-.18-bannerHeight/2,0);
  face.position.x=side*.008;
  face.rotation.y=side*Math.PI/2;
 }
}
