// Shared visual and movement dimensions for the new campus connections.
export const ROUTES={
 stairs:{x0:-39,x1:-33,z0:-8,z1:1.4,steps:28},
 smokingWalk:{x0:-95,x1:-65,z0:-24,z1:-9},
 smokingRear:{x0:-95.5,x1:-76.5,z0:-11.5,z1:51},
 // The decorative rear gate spans this lane but must never block its center.
 rearGatePassage:{x0:-96.7,x1:-93.3,z0:-28,z1:-7},
 southCourt:{x0:-70,x1:-47,z0:17,z1:51},
 southCourtExtension:{x0:-76.5,x1:-70,z0:46,z1:51},
 // The new path joins the old snow slope along its south edge.
 ramp:{x0:-47,x1:2,z0:46,z1:51},
 sledHill:{x0:-47,x1:2,z0:38,z1:46},
 groundWalk:{x0:-2,x1:2,z0:18,z1:38},
 upper:10.78,lower:.05
};
export const inRect=(x,z,r)=>x>=r.x0&&x<=r.x1&&z>=r.z0&&z<=r.z1;
export const insideSledHill=(x,z)=>inRect(x,z,ROUTES.sledHill)&&z<ROUTES.ramp.z0;
export function routeHeight(x,z){
 const {stairs:s,ramp,sledHill}=ROUTES;
 if(inRect(x,z,s)){const step=Math.min(s.steps-1,Math.floor((z-s.z0)/(s.z1-s.z0)*s.steps));return ROUTES.lower+(ROUTES.upper-ROUTES.lower)*(1-step/s.steps)}
 if(inRect(x,z,ramp)||insideSledHill(x,z))return ROUTES.upper+(ROUTES.lower-ROUTES.upper)*(x-ramp.x0)/(ramp.x1-ramp.x0);
 if(inRect(x,z,ROUTES.smokingWalk)||inRect(x,z,ROUTES.smokingRear)||inRect(x,z,ROUTES.rearGatePassage)||inRect(x,z,ROUTES.southCourt)||inRect(x,z,ROUTES.southCourtExtension))return ROUTES.upper;
 if(inRect(x,z,ROUTES.groundWalk))return ROUTES.lower;
 return null;
}
