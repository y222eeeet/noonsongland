import { routeHeight } from './campus-routes-layout.js';
// One source of truth for floors that players may occupy.
// Visual terrain can be larger for scenery/support, but it never grants movement.
const upperWalkways=[
 // The terrace starts beyond the top landing. Keeping the stair crest out of
 // this rectangle prevents it from being mistaken for a 10.78m vertical wall.
 {id:'soonheongwan-terrace',minX:-66,maxX:32,minZ:-22,maxZ:-5.92},
 {id:'myungshin-courtyard',minX:-70,maxX:-47,minZ:-10,maxZ:32},
 {id:'jinri-court',minX:-66,maxX:-36,minZ:-36,maxZ:-20},
 {id:'smoking-deck',minX:-97,maxX:-65,minZ:-32,maxZ:-20},
 {id:'smoking-connector',minX:-70,maxX:-64,minZ:-30,maxZ:-8}
];

const inside=(x,z,area)=>x>=area.minX&&x<=area.maxX&&z>=area.minZ&&z<=area.maxZ;
const onLowerFlight=(x,z)=>Math.abs(x)<=7.15&&z>=.08&&z<=5.72;
const onMiddleLanding=(x,z)=>Math.abs(x)<=6.4&&z>=-1.52&&z<=.08;
const onUpperFlight=(x,z)=>(x>=-5.85&&x<=-1.05||x>=1.05&&x<=5.85)&&z>=-4.87&&z<=-1.095;
const onTopLanding=(x,z)=>Math.abs(x)<=5.8&&z>=-5.92&&z<=-4.32;
const stairZoneAt=(x,z)=>onLowerFlight(x,z)?'lower':onMiddleLanding(x,z)?'middle':onUpperFlight(x,z)?'upper':onTopLanding(x,z)?'top':'';

export function createTraversal(){
 function upperAreaAt(x,z){return upperWalkways.find(area=>inside(x,z,area));}
 function heightAt(x,z){
  const connection=routeHeight(x,z);if(connection!==null)return connection;
  // Match the visible two-flight stair construction: pink lower flight,
  // central landing, then two lavender upper flights around the hedge.
  if(onTopLanding(x,z))return 10.60;
  if(onUpperFlight(x,z))return 6.24+(-1.095-z)/3.77*4.32;
  if(onMiddleLanding(x,z))return 5.76;
  if(onLowerFlight(x,z))return .46+(5.2-z)/5.12*4.80;
  if(upperAreaAt(x,z))return 10.78;
  return 0;
 }
 function canOccupy(x,z,bounds){return x>=bounds.minX&&x<=bounds.maxX&&z>=bounds.minZ&&z<=bounds.maxZ;}
 function canStep(fromX,fromZ,toX,toZ,bounds){
  if(!canOccupy(toX,toZ,bounds))return false;
  const fromStair=stairZoneAt(fromX,fromZ),toStair=stairZoneAt(toX,toZ);
  // Stairs are a continuous traversal lane, not a sequence of tiny cliffs.
  // Once on a tread, players may freely move up, down, or sideways within
  // the registered flights and landings. Leaving is allowed only at the
  // bottom road or through the top terrace; every lateral edge stays closed.
  if(fromStair&&toStair)return true;
  if(fromStair&&!toStair){
   const leavesAtBottom=fromStair==='lower'&&toZ>5.72;
   const leavesAtTop=fromStair==='top'&&Boolean(upperAreaAt(toX,toZ));
   if(!leavesAtBottom&&!leavesAtTop)return false;
  }
  if(!fromStair&&toStair){
   const entersAtBottom=toStair==='lower'&&fromZ>5.72;
   const entersFromTerrace=toStair==='top'&&Boolean(upperAreaAt(fromX,fromZ));
   if(!entersAtBottom&&!entersFromTerrace)return false;
  }
  const from=heightAt(fromX,fromZ),to=heightAt(toX,toZ);
  // Registered connections remain continuous across the generic cliff cutoff.
  if(routeHeight(fromX,fromZ)!==null&&routeHeight(toX,toZ)!==null)return Math.abs(to-from)<=1.12;
  // Crossing from an approved upper deck into unregistered scenery is a cliff.
  if(from>2&&to<2)return false;
  return Math.abs(to-from)<=1.12;
 }
 return {upperWalkways,heightAt,canStep,canOccupy};
}
