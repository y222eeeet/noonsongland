import * as T from 'three';

export function addMyungshinHall(world, obstacles, M){
  const scene=new T.Group();scene.position.set(-27,0,21);world.add(scene);
  const obstacleStart=obstacles.length;
  const campusY=10.78;
  const mat=c=>new T.MeshStandardMaterial({color:c,roughness:.85});
  const glass=mat('#8ab9ce'),roof=mat('#e7bca1'),wood=mat('#ad8875');
  glass.userData.campusWindow=true;
  const mesh=(g,m,x,y,z,parent=scene)=>{const o=new T.Mesh(g,m);o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;parent.add(o);return o;};
  function label(text,w,h,x,y,z,rotation=0){
    const c=document.createElement('canvas');c.width=1024;c.height=160;const ctx=c.getContext('2d');ctx.fillStyle='#fff8ed';ctx.fillRect(0,0,1024,160);ctx.fillStyle='#655873';ctx.font='bold 64px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,512,80);
    const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;const sign=mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map:t}),x,y,z);sign.rotation.y=rotation;sign.castShadow=sign.receiveShadow=false;
  }
  // A north-south wing, perpendicular to Jinri's east-west elevation.
  const hall=new T.Group();hall.position.set(-46,campusY,-17);scene.add(hall);
  mesh(new T.BoxGeometry(6.8,11,24),M.cream,0,5.5,0,hall);
  mesh(new T.BoxGeometry(7.6,.55,25),roof,0,11.2,0,hall);
  mesh(new T.BoxGeometry(5.4,.38,23.5),M.path,0,11.65,0,hall);
  for(const side of [-1,1]){
    mesh(new T.BoxGeometry(.12,7.9,21.8),glass,side*3.46,6,0,hall);
    for(let row=0;row<5;row++)mesh(new T.BoxGeometry(.20,.17,22.4),M.cream,side*3.51,2.1+row*1.9,0,hall);
    for(let n=0;n<10;n++)mesh(new T.BoxGeometry(.20,8.1,.18),M.cream,side*3.51,6,-10.6+n*2.35,hall);
  }
  mesh(new T.BoxGeometry(.18,2.7,3),M.dark,3.55,1.4,5,hall);
  mesh(new T.BoxGeometry(1.9,.24,5),M.pink,4,2.9,5,hall);
  mesh(new T.BoxGeometry(3,.22,5),M.cream,4.2,.11,5,hall);
  label('명신관',6,1,-42.20,campusY+9.9,-17,Math.PI/2);
  obstacles.push({x:-46,z:-17,w:3.6,h:12.3});
  // Solid upper ground also supports both routes around the ends of the wing.
  mesh(new T.BoxGeometry(30,10.92,10),M.cream,-55,5.14,-1.5);
  // Broad rear court west of the building: separate from the main courtyard.
  mesh(new T.BoxGeometry(19,.12,31),M.path,-59,campusY-.06,-17);
  mesh(new T.BoxGeometry(14,.12,7),M.path,-44,campusY-.05,-.7);
  mesh(new T.BoxGeometry(14,.12,6),M.path,-44,campusY-.05,-32.5);
  function bench(x,z,rot){
    const g=new T.Group();g.position.set(x,campusY,z);g.rotation.y=rot;scene.add(g);
    mesh(new T.BoxGeometry(2.7,.18,.65),wood,0,.72,0,g);
    mesh(new T.BoxGeometry(2.7,.72,.14),M.lav,0,1.1,-.31,g);
    for(const s of [-1,1])mesh(new T.BoxGeometry(.15,.66,.45),M.dark,s*1,.33,0,g);
    obstacles.push({x,z,w:rot? .55:1.5,h:rot?1.5:.55});
  }
  // Eight benches leave a generous clear aisle around the pavilion.
  [-28,-21,-14,-7].forEach(z=>bench(-66,z,Math.PI/2));
  [-29,-22,-15,-8].forEach(z=>bench(-52,z,-Math.PI/2));
  const pavilion=new T.Group();pavilion.position.set(-59,campusY,-19);pavilion.scale.setScalar(1.5);scene.add(pavilion);
  mesh(new T.CylinderGeometry(3.6,3.8,.2,8),M.cream,0,.1,0,pavilion);
  const canopy=mesh(new T.ConeGeometry(4.4,2.1,4),M.pink,0,4.15,0,pavilion);canopy.rotation.y=Math.PI/4;
  mesh(new T.BoxGeometry(6.1,.23,6.1),wood,0,3.12,0,pavilion);
  for(const x of [-2.7,2.7])for(const z of [-2.7,2.7]){
    mesh(new T.CylinderGeometry(.14,.17,3,8),wood,x,1.65,z,pavilion);
    obstacles.push({x:x*1.5-59,z:z*1.5-19,r:.33});
  }
  function bin(x,z){
    mesh(new T.CylinderGeometry(.40,.36,.95,12),M.dark,x,campusY+.48,z);
    mesh(new T.CylinderGeometry(.46,.46,.14,12),M.lav,x,campusY+1,z);
    obstacles.push({x,z,r:.5});
  }
  bin(-55,-3);bin(-63,-3);
  mesh(new T.CylinderGeometry(.19,.24,1,10),wood,-57,campusY+.5,-10);
  mesh(new T.CylinderGeometry(.32,.32,.12,12),M.dark,-57,campusY+1.04,-10);
  for(let i=obstacleStart;i<obstacles.length;i++){obstacles[i].x-=27;obstacles[i].z+=21;}
  return {minX:-101,maxX:47,minZ:-70,maxZ:35};
}


export function addRearGate(world,obstacles,M){
  const scene=new T.Group();
  // Rotate around the gate's own center, preserving its location beside Jinri.
  scene.rotation.y=Math.PI/2;
  scene.position.set(-78,0,-63.5);world.add(scene);
  const obstacleStart=obstacles.length;
  const base=10.78;
  const make=(g,m,x,y,z)=>{const o=new T.Mesh(g,m);o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;scene.add(o);return o;};
  // A simple open rear entrance occupies the former Myungshin site.
  make(new T.BoxGeometry(23,10.92,10),M.cream,-46,5.14,-1.5);


  for(const x of [-51,-41]){
    make(new T.BoxGeometry(1.0,4.2,1.1),M.cream,x,base+2.1,-17);
    make(new T.BoxGeometry(1.3,.24,1.4),M.lav,x,base+4.3,-17);
    obstacles.push({x,z:-17,w:.6,h:.65});
  }
  make(new T.BoxGeometry(11.5,.8,1.0),M.lav,-46,base+4.55,-17);
  // Short fence wings leave the middle completely open for walking.
  for(const side of [-1,1]){
    const x=-46+side*8;
    for(let i=0;i<5;i++)make(new T.BoxGeometry(.1,1.7,.12),M.lav,x-2+i,base+.85,-17);
    make(new T.BoxGeometry(5,.12,.12),M.lav,x,base+1.6,-17);
    obstacles.push({x,z:-17,w:2.6,h:.15});
  }
  for(let i=obstacleStart;i<obstacles.length;i++){
    const c=obstacles[i],x=c.x,z=c.z;
    c.x=z-78;c.z=-x-63.5;
    if(!c.r){const w=c.w;c.w=c.h;c.h=w;}
  }

}


export function addNorthSmokingArea(scene,obstacles,M){
  const y=10.78;
  const make=(g,m,x,h,z)=>{const o=new T.Mesh(g,m);o.position.set(x,h,z);o.castShadow=o.receiveShadow=true;scene.add(o);return o;};
  make(new T.BoxGeometry(32,.1,8),M.path,-81,y-.05,-28);
  make(new T.BoxGeometry(32,.1,4),M.path,-81,y-.05,-22);
  // Four benches run along the far edge, leaving a clear route through the area.
  for(const x of [-93,-85,-77,-69]){
    make(new T.BoxGeometry(3,.18,.7),M.cream,x,y+.7,-30);
    make(new T.BoxGeometry(3,.7,.14),M.lav,x,y+1,-30.35);
    for(const dx of [-1,1])make(new T.BoxGeometry(.16,.65,.45),M.dark,x+dx,y+.33,-30);
    obstacles.push({x,z:-30,w:1.65,h:.6});
  }
  for(const x of [-94,-67]){
    make(new T.CylinderGeometry(.4,.35,.95,12),M.dark,x,y+.48,-25);
    make(new T.CylinderGeometry(.44,.44,.12,12),M.lav,x,y+1,-25);
    obstacles.push({x,z:-25,r:.48});
  }
  for(const x of [-88,-73]){
    make(new T.CylinderGeometry(.15,.22,.9,10),M.dark,x,y+.45,-25);
    make(new T.CylinderGeometry(.29,.29,.1,10),M.cream,x,y+.95,-25);
    obstacles.push({x,z:-25,r:.3});
  }

}
