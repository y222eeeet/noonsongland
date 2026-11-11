import * as T from 'three';

// Keep a high-resolution local shadow volume around the player, independent
// of world size. Cover the camera's surroundings plus off-screen casters.
export function createWorldShadows(scene,sun){
  // The camera never resolves the difference at this scale; halving the map
  // leaves substantially more frame time for a busy multiplayer scene.
  const radius=56,resolution=1024,texel=radius*2/resolution;
  const offset=new T.Vector3(-42,70,31);
  scene.add(sun.target);
  sun.shadow.mapSize.set(resolution,resolution);
  Object.assign(sun.shadow.camera,{left:-radius,right:radius,top:radius,bottom:-radius,near:1,far:220});
  sun.shadow.camera.updateProjectionMatrix();
  sun.shadow.normalBias=.035;sun.shadow.bias=-.00008;sun.shadow.radius=2;
  return focus=>{
    const x=Math.round(focus.x/texel)*texel,z=Math.round(focus.z/texel)*texel;
    sun.target.position.set(x,focus.y+2,z);
    sun.position.copy(sun.target.position).add(offset);
    sun.target.updateMatrixWorld();sun.updateMatrixWorld();
  };
}
