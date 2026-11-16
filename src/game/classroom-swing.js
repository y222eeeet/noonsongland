import * as T from 'three';

// Each row gives time, grip position, bat yaw, and bat elevation.
const frames=[
 [0,   .90,2.36,1.04,  1.27,.81],
 [.34, 1.14,2.79,1.10,  1.53,1.03],
 [.47, 1.02,2.64,1.19,  1.18,.78],
 [.58, -.18,1.97,1.32, -.98,-.36],
 [.69, -.91,1.82,1.11,-1.49,-.36]
];
function velocity(index,component){
 if(index===0||index===frames.length-1)return 0;
 const a=frames[index-1],b=frames[index],c=frames[index+1];
 const before=(b[component]-a[component])/(b[0]-a[0]);
 const after=(c[component]-b[component])/(c[0]-b[0]);
 // Keep momentum through the strike while easing at actual reversals.
 return before*after>0?2*before*after/(before+after):0;
}
export function sampleClassroomSwing(time,gripPoint,direction){
 const downEnd=frames[frames.length-1][0];
 time=time<=downEnd?time:downEnd*(1-time)/(1-downEnd);
 const end=frames.findIndex((frame,index)=>index>0&&frame[0]>=time);
 const a=frames[end-1],b=frames[end],duration=b[0]-a[0];
 const t=(time-a[0])/duration,t2=t*t,t3=t2*t;
 const mix=i=>(2*t3-3*t2+1)*a[i]+(t3-2*t2+t)*duration*velocity(end-1,i)
  +(-2*t3+3*t2)*b[i]+(t3-t2)*duration*velocity(end,i);
 gripPoint.set(mix(1),mix(2),mix(3));
 const yaw=mix(4),pitch=mix(5),horizontal=Math.cos(pitch);
 direction.set(Math.sin(yaw)*horizontal,Math.sin(pitch),Math.cos(yaw)*horizontal);
}
