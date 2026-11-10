// The blue annotated lower garden, with a north/south stone crossing.
export const POND_OUTLINE=[[-46.5,14],[-24,13.6],[-2.6,11.5],[7.5,11.5],[7.5,-5.05],[22.5,-5.05],[22.5,26.5],[4,26.1],[-5,26.6],[-25,26],[-46.5,27]];
export const STONE_BRIDGE={x0:-7.15,x1:7.15,z0:10.9,z1:27.2};
export const POND_COURT={x0:-7.15,x1:7.15,z0:5.72,z1:10.9};
export function insidePond(x,z){let inside=false;for(let i=0,j=POND_OUTLINE.length-1;i<POND_OUTLINE.length;j=i++){const [a,b]=POND_OUTLINE[i],[c,d]=POND_OUTLINE[j];if((b>z)!==(d>z)&&x<(c-a)*(z-b)/(d-b)+a)inside=!inside}return inside;}
export const onStoneBridge=(x,z)=>x>=STONE_BRIDGE.x0&&x<=STONE_BRIDGE.x1&&z>=STONE_BRIDGE.z0&&z<=STONE_BRIDGE.z1;
export function pondWalkHeight(x,z){
 if(onStoneBridge(x,z)){const t=(z-STONE_BRIDGE.z0)/(STONE_BRIDGE.z1-STONE_BRIDGE.z0);return .27+.32*Math.sin(Math.PI*t)}
 if(x>=POND_COURT.x0&&x<=POND_COURT.x1&&z>=POND_COURT.z0&&z<=POND_COURT.z1)return .06;
 return null;
}
