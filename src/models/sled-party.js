import * as T from 'three';

const colors = ['#ffca52','#ef759f','#63c9bf','#9a83ef','#76baf0','#f78c58'];
export const SLED_PARTY_DURATION = 2.8;
const piecesPerPopper = 28;
const launchPoints = [-1,1].map(side=>new T.Vector3(side*2.15,5.05,.32));
const up = new T.Vector3(0,1,0);
const aim = [-1,1].map(side=>new T.Vector3(-side*.53,1,.10).normalize());

export function createSledParty(avatar) {
 const group = new T.Group();
 group.visible = false;
 avatar.add(group);

 const gold = new T.MeshStandardMaterial({color:'#ffbc43',roughness:.68});
 const mint = new T.MeshStandardMaterial({color:'#65aa8b',roughness:.72});
 const inside = new T.MeshStandardMaterial({color:'#865529',roughness:.86});
 const poppers = launchPoints.map((point,index)=>{
  const popper = new T.Group();
  popper.quaternion.setFromUnitVectors(up,aim[index]);
  for(let i=0;i<7;i++){
   const radius = t=>T.MathUtils.lerp(.035,.27,t);
   const band = new T.Mesh(new T.CylinderGeometry(radius((i+1)/7),radius(i/7),.12,16,1,true),i%2?mint:gold);
   band.position.y=(i+.5)*.12-.84;
   popper.add(band);
  }
  const opening = new T.Mesh(new T.CircleGeometry(.264,16),inside);
  opening.rotation.x=-Math.PI/2;
  opening.position.y=-.02;
  popper.add(opening);
  group.add(popper);
  return popper;
 });

 const paper = new T.InstancedMesh(new T.PlaneGeometry(.16,.24),new T.MeshBasicMaterial({side:T.DoubleSide}),piecesPerPopper*2);
 paper.frustumCulled=false;
 paper.instanceMatrix.setUsage(T.DynamicDrawUsage);
 group.add(paper);
 const pose = new T.Object3D();
 const particles = Array.from({length:paper.count},(_,i)=>{
  paper.setColorAt(i,new T.Color(colors[i%colors.length]));
  const index = i<piecesPerPopper?0:1;
  const angle = i*2.399963;
  const inward = index===0?1:-1;
  const spread = .45+(i%7)*.18;
  const drift = inward*(.85+((i*13)%19)*.065);
  const lift = 2.55+((i*7)%23)*.14;
  const gravity = 1.9+((i*5)%13)*.095;
  return {index,drift,lift,gravity,spread,spin:2+(i%8)*.83,angle,delay:((i*11)%19)*.012};
 });
 function update(age) {
  group.visible=Number.isFinite(age)&&age>=0&&age<SLED_PARTY_DURATION;
  if(!group.visible)return;
  poppers.forEach((popper,index)=>{
   popper.visible=age<.82;
   const scale=T.MathUtils.smoothstep(age,0,.12)*(1-T.MathUtils.smoothstep(age,.49,.82));
   popper.scale.setScalar(scale*(1+.18*Math.sin(Math.min(1,age/.30)*Math.PI)));
   popper.position.copy(launchPoints[index]).addScaledVector(aim[index],-.12*Math.sin(Math.min(1,age/.26)*Math.PI));
  });
  particles.forEach((particle,i)=>{
   const t=Math.max(0,age-.12-particle.delay);
   const {drift,lift,gravity,spread,spin,angle,index}=particle;
   const bloom=1-Math.exp(-2.1*t);
   pose.position.copy(launchPoints[index]);
   pose.position.x+=bloom*(drift+Math.cos(angle)*spread)+Math.sin(angle+t*5)*t*.13;
   pose.position.y+=lift*t-gravity*t*t;
   pose.position.z+=Math.sin(angle)*spread*bloom+Math.cos(angle+t*4)*t*.14;
   pose.rotation.set(angle+spin*t,angle*.31-t*3,angle*.7+t*4);
   const scale=T.MathUtils.smoothstep(t,0,.07)*(1-T.MathUtils.smoothstep(age,2,SLED_PARTY_DURATION));
   pose.scale.set(scale*(i%3===0?.5:1),scale,scale);
   pose.updateMatrix();
   paper.setMatrixAt(i,pose.matrix);
  });
  paper.instanceMatrix.needsUpdate=true;
 }
 return {update};
}
