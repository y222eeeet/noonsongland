// A single safe current lane, kept well inside the rectangular part of the pond.
// All clients derive positions from the same timestamp, so swimmers glide around
// the water like a conveyor belt without drifting into banks.
export const SWIM_ORBIT={x:15,z:10.5,rx:3.45,rz:9.15,speed:.062,slots:8};

export function orbitFrame(state,now=Date.now()){
 const started=Number.isFinite(state?.swimEnteredAt)?state.swimEnteredAt:now;
 const start=Number.isFinite(state?.swimOrbitAngle)?state.swimOrbitAngle:0;
 const direction=state?.swimDirection===-1?-1:1;
 const angle=start+(now-started)/1000*SWIM_ORBIT.speed*direction;
 const x=SWIM_ORBIT.x+Math.cos(angle)*SWIM_ORBIT.rx;
 const z=SWIM_ORBIT.z+Math.sin(angle)*SWIM_ORBIT.rz;
 // Local +Y is Song-i's head.  Once tilted back, this roll keeps that head
 // pointing along the instantaneous tangent of the lane.
 const dx=-Math.sin(angle)*SWIM_ORBIT.rx*direction;
 const dz=Math.cos(angle)*SWIM_ORBIT.rz*direction;
 const roll=Math.atan2(-dx,-dz);
 return {x,z,roll,angle,direction};
}

export function chooseOrbitAngle(swimmers,now=Date.now()){
 const candidates=Array.from({length:SWIM_ORBIT.slots},(_,slot)=>slot*Math.PI*2/SWIM_ORBIT.slots);
 if(!swimmers.length)return candidates[0];
 let best=candidates[0],bestClearance=-Infinity;
 for(const candidate of candidates){
  const point=orbitFrame({swimEnteredAt:now,swimOrbitAngle:candidate},now);
  const clearance=Math.min(...swimmers.map(swimmer=>{
   const other=orbitFrame(swimmer,now);
   return Math.hypot(point.x-other.x,point.z-other.z);
  }));
  if(clearance>bestClearance){best=candidate;bestClearance=clearance}
 }
 return best;
}
