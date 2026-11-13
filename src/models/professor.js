import * as T from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

export function createProfessor(variant) {
 const woman=variant==='woman';
 const root=new T.Group();
 root.name=woman?'professor-woman':'professor-man';
 const material=color=>new T.MeshStandardMaterial({color,roughness:.88,flatShading:true});
 const skin=material('#dfab8a'),hair=material('#51352f'),cardigan=material('#92966c');
 const shirt=material('#fff1dc'),plum=material('#795063'),shoe=material('#503a48');
 const glasses=material('#9a79a8'),ink=material('#422d30'),buttons=material('#c6bb91');
 function mesh(geometry,mat,x,y,z){
  const part=new T.Mesh(geometry,mat);
  part.position.set(x,y,z);root.add(part);
  return part;
 }
 function oval(mat,x,y,z,w,h,d){
  const part=mesh(new T.SphereGeometry(1,12,8),mat,x,y,z);
  part.scale.set(w,h,d);
  return part;
 }
 function box(mat,x,y,z,w,h,d,r=.08){
  return mesh(new RoundedBoxGeometry(w,h,d,1,r),mat,x,y,z);
 }
 function stroke(mat,points,r){
  const curve=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p)));
  return mesh(new T.TubeGeometry(curve,16,r,5,false),mat,0,0,0);
 }
 oval(hair,0,3.23,-.18,woman?.91:.84,woman?.91:.78,.67);
 oval(skin,0,3.16,.13,.76,.75,.60);
 for(const side of [-1,1]){
  oval(skin,side*.72,3.06,.12,.17,.23,.18);
  if(woman){
   oval(hair,side*.73,3.11,-.10,.24,.70,.43);
   oval(shirt,side*.75,2.92,.30,.055,.055,.055);
  }
  const x=side*.335;
  oval(ink,x,3.18,.678,.09,.125,.035);
  stroke(hair,[[x-.115,3.41,.665],[x,3.445,.685],[x+.115,3.415,.665]],.029);
  const frame=mesh(new T.TorusGeometry(.246,.033,6,woman?20:4),glasses,x,3.17,.711);
  if(!woman){frame.rotation.z=Math.PI/4;frame.scale.set(1.38,1.12,1);}
  else frame.scale.y=.88;
  box(glasses,side*.655,3.19,.51,.09,.058,.39,.025);
 }
 box(glasses,0,3.18,.718,.19,.056,.08,.025);
 oval(skin,0,3.025,.711,.087,.079,.096);
 stroke(ink,[[-.15,2.91,.661],[0,2.875,.685],[.15,2.91,.661]],.023);
 const fringe=oval(hair,-.27,3.70,.43,.60,.25,.36);
 fringe.rotation.z=.39;
 oval(hair,.44,3.65,.34,.38,.26,.36).rotation.z=-.43;
 oval(skin,0,2.48,0,.23,.32,.21);
 box(cardigan,0,1.91,0,1.16,1.18,.67,.19);
 box(shirt,0,2.04,.33,.46,.94,.10);
 for(const side of [-1,1])box(shirt,side*.132,2.38,.41,.20,.23,.08).rotation.z=side*.34;
 for(const y of [1.65,1.87,2.09])oval(buttons,.30,y,.356,.05,.05,.027);
 box(cardigan,.39,1.60,.345,.24,.21,.075);
 oval(cardigan,.66,1.93,0,.18,.49,.22).rotation.z=.21;
 oval(skin,.75,1.49,0,.145,.18,.145);
 oval(cardigan,-.62,1.99,.17,.18,.42,.20).rotation.z=-.23;
 box(plum,-.49,1.95,.44,.44,.61,.115,.035).rotation.z=-.20;
 box(shirt,-.46,2.24,.45,.36,.055,.09,.015).rotation.z=-.20;
 oval(skin,-.60,1.81,.47,.15,.16,.16);
 if(woman)mesh(new T.CylinderGeometry(.49,.66,.89,12),plum,0,.96,0).scale.z=.66;
 for(const side of [-1,1]){
  box(woman?skin:plum,side*.245,woman?.47:.79,0,woman?.27:.43,woman?.56:1.22,.36,.095);
  box(shoe,side*.245,.15,.13,.39,.30,.68,.12);
  box(shoe,side*.245,.268,.21,.33,.08,.17,.035);
 }
 return root;
}
