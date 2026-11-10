// Shared visual and movement dimensions for the new campus connections.
export const ROUTES={
 stairs:{x0:-39,x1:-33,z0:-8,z1:1.4,steps:28},
 smokingWalk:{x0:-95,x1:-65,z0:-24,z1:-9},
 southCourt:{x0:-70,x1:-47,z0:17,z1:46},
 ramp:{x0:-47,x1:0,z0:38,z1:46},
 groundWalk:{x0:-2,x1:2,z0:18,z1:46},
 upper:10.78,lower:.05
};
export const inRect=(x,z,r)=>x>=r.x0&&x<=r.x1&&z>=r.z0&&z<=r.z1;
export function routeHeight(x,z){
 const {stairs:s,ramp:r}=ROUTES;
 if(inRect(x,z,s)){const step=Math.min(s.steps-1,Math.floor((z-s.z0)/(s.z1-s.z0)*s.steps));return ROUTES.lower+(ROUTES.upper-ROUTES.lower)*(1-step/s.steps)}
 if(inRect(x,z,r))return ROUTES.upper+(ROUTES.lower-ROUTES.upper)*(x-r.x0)/(r.x1-r.x0);
 if(inRect(x,z,ROUTES.smokingWalk)||inRect(x,z,ROUTES.southCourt))return ROUTES.upper;
 if(inRect(x,z,ROUTES.groundWalk))return ROUTES.lower;
 return null;
}
