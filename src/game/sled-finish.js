// The finish pose faces +X, so Songi's left is +Z.
const spacing = 3.5;
const edgeInset = 1.8;
const playerClearance = 3.2;

export function isSledFinishOccupied(x,z,players) {
 return players.some(player=>Math.hypot(x-player.x,z-player.z)<playerClearance);
}

export function findSledFinishSpot(exit,bounds,players,canCelebrateAt) {
 for(let x=exit.x;x<=bounds.maxX-edgeInset;x+=spacing){
  for(let z=exit.z;z<=bounds.maxZ-edgeInset;z+=spacing){
   if(x<bounds.minX+edgeInset||z<bounds.minZ+edgeInset)continue;
   if(canCelebrateAt(x,z)&&!isSledFinishOccupied(x,z,players))return {x,z};
  }
 }
 return null;
}
