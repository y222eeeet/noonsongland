// Landmarks traced onto the illustrated map (1620 × 971).
// Piecewise projection keeps paths and floors aligned despite illustration spacing.
const xLandmarks=[[-101,80],[-76.5,272],[-70,369],[-47,577],[0,1060],[32,1517],[47,1595]];
const zLandmarks=[[-71,16],[-38,60],[-28.6,102],[-25.4,154],[-24,180],[-5.15,326],[-2,373],[4.5,470],[10.9,543],[27.2,708],[32,785],[37,830],[51,909],[53,954]];

function project(value,landmarks) {
 const bounded=Math.max(landmarks[0][0],Math.min(landmarks.at(-1)[0],value));
 for(let i=1;i<landmarks.length;i++){
  const [end,pixelEnd]=landmarks[i];
  if(bounded<=end){
   const [start,pixelStart]=landmarks[i-1];
   return pixelStart+(pixelEnd-pixelStart)*(bounded-start)/(end-start);
  }
 }
 return landmarks.at(-1)[1];
}
export function minimapPosition(x,z) {
 return {left:project(x,xLandmarks)/1620*100,top:project(z,zLandmarks)/971*100};
}
