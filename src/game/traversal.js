// One source of truth for floors that players may occupy.
// Visual terrain can be larger for scenery/support, but it never grants movement.
const upperWalkways=[
 {id:'soonheongwan-terrace',minX:-66,maxX:20,minZ:-22,maxZ:-5},
 {id:'myungshin-courtyard',minX:-70,maxX:-47,minZ:-10,maxZ:32},
 {id:'jinri-court',minX:-66,maxX:-36,minZ:-36,maxZ:-20},
 {id:'smoking-deck',minX:-97,maxX:-65,minZ:-32,maxZ:-20},
 {id:'smoking-connector',minX:-70,maxX:-64,minZ:-30,maxZ:-8}
];

const inside=(x,z,area)=>x>=area.minX&&x<=area.maxX&&z>=area.minZ&&z<=area.maxZ;
const onMainStair=(x,z)=>Math.abs(x)<=6.7&&z>=-5.2&&z<=6.25;

export function createTraversal(){
 function upperAreaAt(x,z){return upperWalkways.find(area=>inside(x,z,area));}
 function heightAt(x,z){
  if(upperAreaAt(x,z))return 10.78;
  if(onMainStair(x,z)){
   if(z<=-1.095)return 6.24+(-1.095-z)/4.055*4.54;
   if(z<=.08)return 5.76;
   return Math.max(0,(6.2-z)/6.12*5.76);
  }
  return 0;
 }
 function canOccupy(x,z,bounds){return x>=bounds.minX&&x<=bounds.maxX&&z>=bounds.minZ&&z<=bounds.maxZ;}
 function canStep(fromX,fromZ,toX,toZ,bounds){
  if(!canOccupy(toX,toZ,bounds))return false;
  const from=heightAt(fromX,fromZ),to=heightAt(toX,toZ);
  // Crossing from an approved upper deck into unregistered scenery is a cliff.
  if(from>2&&to<2)return false;
  return Math.abs(to-from)<=1.12;
 }
 return {upperWalkways,heightAt,canStep,canOccupy};
}
