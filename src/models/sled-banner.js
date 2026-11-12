import * as T from 'three';
import { ROUTES } from '../game/campus-routes-layout.js';

function bannerImage() {
 const canvas=document.createElement('canvas');
 canvas.width=2048;canvas.height=320;
 const ctx=canvas.getContext('2d');
 const background=ctx.createLinearGradient(0,0,0,320);
 background.addColorStop(0,'#f7f3ff');
 background.addColorStop(1,'#dcefff');
 ctx.fillStyle=background;ctx.fillRect(0,0,2048,320);
 ctx.fillStyle='#ffffff55';
 for(let x=0;x<2048;x+=64)ctx.fillRect(x,0,32,320);

 for(const [x,side] of [[0,1],[2048,-1]]){
  ctx.save();ctx.translate(x,0);ctx.scale(side,1);
  ctx.fillStyle='#716db0';
  ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(245,0);ctx.lineTo(176,320);ctx.lineTo(0,320);ctx.fill();
  ctx.strokeStyle='#f6f5ff';ctx.lineWidth=7;ctx.lineCap='round';
  for(const [cx,cy,r] of [[90,89,53],[146,227,34],[40,269,20]]){
   ctx.save();ctx.translate(cx,cy);
   for(let i=0;i<6;i++){
    ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(0,-r);
    ctx.moveTo(-r*.22,-r*.66);ctx.lineTo(0,-r*.46);ctx.lineTo(r*.22,-r*.66);
    ctx.stroke();ctx.rotate(Math.PI/3);
   }
   ctx.restore();
  }
  ctx.restore();
 }

 const title='명신언덕 눈썰매장';
 const colors=['#5c54a3','#43789f','#5c54a3','#43789f','#4776b2','#b96243','#42837c','#80529b'];
 ctx.font='900 168px "Apple SD Gothic Neo","Malgun Gothic",sans-serif';
 ctx.textAlign='center';ctx.textBaseline='middle';ctx.lineJoin='round';
 const glyphs=[...title];
 const widths=glyphs.map(glyph=>glyph===' '?65:Math.max(176,ctx.measureText(glyph).width));
 let x=(canvas.width-widths.reduce((sum,width)=>sum+width,0))/2,color=0;
 glyphs.forEach((glyph,index)=>{
  const center=x+widths[index]/2;
  x+=widths[index];
  if(glyph===' ')return;
  ctx.strokeStyle='#857bad';ctx.lineWidth=16;ctx.strokeText(glyph,center+6,176);
  ctx.strokeStyle='#fff9f6';ctx.lineWidth=16;ctx.strokeText(glyph,center,163);
  ctx.fillStyle=colors[color++];ctx.fillText(glyph,center,163);
 });
 ctx.fillStyle='#8f80be';ctx.fillRect(0,0,2048,7);ctx.fillRect(0,313,2048,7);
 const texture=new T.CanvasTexture(canvas);
 texture.colorSpace=T.SRGBColorSpace;
 return texture;
}

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

 const material=new T.MeshBasicMaterial({map:bannerImage()});
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
