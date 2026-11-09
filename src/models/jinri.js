import * as T from 'three';

// Register each landmark's footprint so later buildings grow the same world.
export function addJinriHall(scene, obstacles, materials) {
  const group=new T.Group(); group.position.set(-51,10.6,-27);group.scale.set(2.05,1,1.2);scene.add(group);
  const make=(geometry,material,x,y,z)=>{const m=new T.Mesh(geometry,material);m.position.set(x,y,z);m.castShadow=m.receiveShadow=true;group.add(m);return m;};
  const wall=materials.cream, blue=new T.MeshStandardMaterial({color:'#82b5cf',roughness:.6});
  const glass=new T.MeshStandardMaterial({color:'#83bed5',roughness:.4,metalness:.08});
  glass.userData.campusWindow=true;
  // Map 04: a taller central blue glass elevation with cream framing and roof block.
  make(new T.BoxGeometry(13.6,.4,6.8),materials.path,0,.18,0);
  make(new T.BoxGeometry(12,12,5.2),wall,0,6.4,0);
  make(new T.BoxGeometry(13,.45,6),materials.lav,0,12.65,0);
  make(new T.BoxGeometry(8.7,9.3,.14),glass,-.5,7.05,2.68);
  for(let col=0;col<7;col++)make(new T.BoxGeometry(.11,9.4,.12),wall,-4.85+col*1.45,7.05,2.8);
  for(let floor=0;floor<6;floor++)make(new T.BoxGeometry(8.85,.12,.12),wall,-.5,2.42+floor*1.85,2.81);
  [-5.65,5.65].forEach(x=>make(new T.BoxGeometry(.55,12.2,.4),wall,x,6.5,2.78));
  make(new T.BoxGeometry(4,2.4,3.2),wall,2.7,13.5,-.35);
  make(new T.BoxGeometry(2.5,1.3,.12),glass,2.7,13.55,1.32);
  make(new T.BoxGeometry(3.1,2.4,.22),materials.dark,0,1.65,2.78);
  make(new T.BoxGeometry(.10,2.4,.15),wall,0,1.65,2.94);
  make(new T.BoxGeometry(5,.25,1.7),materials.pink,0,3.02,3.25);
  for(let i=0;i<3;i++)make(new T.BoxGeometry(5.8+i*.4,.16, .55),wall,0,.40-i*.12,3.1+i*.5);
  for(let side of [-1,1])for(let floor=0;floor<6;floor++)for(let col=0;col<3;col++)make(new T.BoxGeometry(.12,.95,.9),blue,side*6.06,1.9+floor*1.8,-1.65+col*1.6);
  const canvas=document.createElement('canvas');canvas.width=768;canvas.height=160;
  const ctx=canvas.getContext('2d');ctx.fillStyle='#fff8ed';ctx.fillRect(0,0,768,160);ctx.fillStyle='#655873';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='bold 65px sans-serif';ctx.fillText('진리관',384,80);
  const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;
  // Facade mullions reach z=2.87. Keep the entire sign in front of them.
  const sign=make(new T.PlaneGeometry(5.4,1.12),new T.MeshBasicMaterial({map:texture}),0,11.65,3.02);sign.castShadow=false;sign.receiveShadow=false;
  obstacles.push({x:-51,z:-27,w:14,h:4.1});
  return {minX:-44,maxX:24,minZ:-36,maxZ:18};
}
