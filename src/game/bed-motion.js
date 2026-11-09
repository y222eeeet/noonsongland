import * as T from 'three';

// Owns only the short approach / lie-down / get-up sequence, not normal movement.
export function createBedMotion(avatar,floorY,onComplete){
 let stages=[],started=0,index=0;
 const parts=avatar.userData.parts;
 const snapshot=()=>({position:avatar.position.clone(),pitch:avatar.rotation.x,yaw:avatar.rotation.y});
 function stage(to,seconds,walk=false,arc=0){const from=stages.length?stages.at(-1).to:snapshot();stages.push({from,to,seconds,walk,arc})}
 const pose=(x,y,z,pitch=0,yaw=0)=>({position:new T.Vector3(x,y,z),pitch,yaw});
 function begin(now){started=now;index=0;avatar.userData.skyPose='transition';}
 function enter(bed,now){
  stages=[];
  // Approach from the foot, then walk up the bed's left-hand aisle.
  const x=bed.x-2.3,footZ=Math.max(bed.z+4.2,avatar.position.z),leftZ=bed.z+2.25;
  const route=[new T.Vector3(x,floorY,footZ),new T.Vector3(x,floorY,leftZ)];
  let last=avatar.position.clone();
  for(const point of route){const dx=point.x-last.x,dz=point.z-last.z;stage({position:point,pitch:0,yaw:Math.atan2(dx,dz)},Math.max(.35,point.distanceTo(last)/3.1),true);last=point;}
  stage(pose(bed.x,bed.worldY+.84,leftZ,0,0),1.15,false,.25);
  stage(pose(bed.x,bed.worldY+.84,leftZ,-Math.PI/2,0),1.35);
  begin(now);
 }
 function leave(bed,now){
  stages=[];
  stage(pose(bed.x,bed.worldY+.84,bed.z+2.25,0,0),1.35);
  stage(pose(bed.x+2.3,floorY,bed.z+2.25,0,Math.PI/2),1.25,true,.18);
  stage(pose(bed.x+2.6,floorY,bed.z+2.65,0,Math.PI),.5,true);
  begin(now);
 }
 function update(now){
  if(!stages.length)return;
  while(index<stages.length-1&&now-started>=stages[index].seconds*1000){started+=stages[index].seconds*1000;index++;}
  const s=stages[index],t=T.MathUtils.clamp((now-started)/(s.seconds*1000),0,1),e=t*t*(3-2*t);
  avatar.position.lerpVectors(s.from.position,s.to.position,s.walk?t:e);
  avatar.position.y+=Math.sin(Math.PI*t)*s.arc;
  avatar.rotation.set(T.MathUtils.lerp(s.from.pitch,s.to.pitch,e),s.from.yaw+Math.atan2(Math.sin(s.to.yaw-s.from.yaw),Math.cos(s.to.yaw-s.from.yaw))*e,0);
  const swing=s.walk?Math.sin((now/1000)*9)*.48*Math.sin(Math.PI*t):0;
  parts.arm0.rotation.x=parts.leg1.rotation.x=swing;parts.arm1.rotation.x=parts.leg0.rotation.x=-swing;
  avatar.userData.skyMotion={y:avatar.position.y,pitch:avatar.rotation.x,walk:s.walk};
  if(t===1&&index===stages.length-1){const sleeping=s.to.pitch<-.1;stages=[];if(sleeping)avatar.userData.skyMotion={y:s.to.position.y,pitch:-Math.PI/2,walk:false};else delete avatar.userData.skyMotion;avatar.userData.skyPose=sleeping?'sleep':'idle';onComplete(sleeping?'sleep':'idle');}
 }
 return {enter,leave,update,get active(){return stages.length>0}};
}
