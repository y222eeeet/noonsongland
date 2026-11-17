import * as T from 'three';

export function createClassroomWallMarks(){
 const canvas=document.createElement('canvas');
 canvas.width=canvas.height=128;
 const ctx=canvas.getContext('2d');
 const chips=[[43,48],[61,39],[79,43],[90,58],[83,80],[69,90],[50,84],[37,70]];
 function polygon(points,color){
  ctx.beginPath();
  points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));
  ctx.closePath();ctx.fillStyle=color;ctx.fill();
 }
 polygon(chips,'#9b8271');
 polygon([[45,49],[61,44],[76,47],[69,63],[52,68],[42,60]],'#ded0be');
 polygon([[78,47],[86,58],[80,77],[66,83],[69,65]],'#bdab95');
 polygon([[41,66],[52,72],[65,66],[64,85],[50,80]],'#eddfcb');
 ctx.strokeStyle='#6a5145';
 ctx.lineJoin='round';
 for(const points of [
  [[64,66],[53,62],[48,51],[40,45],[31,47],[19,36]],
  [[65,66],[72,56],[79,47],[79,35],[85,26],[84,14]],
  [[65,66],[74,70],[87,66],[98,71],[109,65]],
  [[64,66],[57,75],[58,86],[49,97],[51,110]],
  [[78,77],[84,86],[97,90],[101,101]]
 ]){
  ctx.lineWidth=2;
  ctx.beginPath();
  points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));
  ctx.stroke();
 }
 const texture=new T.CanvasTexture(canvas);
 texture.colorSpace=T.SRGBColorSpace;
 const geometry=new T.PlaneGeometry(1,1);
 const marks=[];
 const front=new T.Vector3(0,0,1);
 function add(hit){
  const wall=hit.object;
  const normal=hit.face.normal;
  const point=wall.worldToLocal(hit.point.clone());
  if(marks.some(mark=>mark.parent===wall&&mark.position.distanceTo(point)<.55))return;
  const dimensions=wall.geometry.parameters;
  const along=normal.x?dimensions.depth/2-Math.abs(point.z):dimensions.width/2-Math.abs(point.x);
  const size=Math.min(1.65,along*1.7);
  if(size<.18)return;
  const material=new T.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false,opacity:.92});
  const mark=new T.Mesh(geometry,material);
  mark.position.copy(point).addScaledVector(normal,.008);
  mark.quaternion.setFromUnitVectors(front,normal);
  mark.rotateZ((Math.random()-.5)*.65);
  mark.scale.setScalar(size);
  wall.add(mark);marks.push(mark);
  if(marks.length>80){
   const oldest=marks.shift();
   oldest.removeFromParent();oldest.material.dispose();
  }
 }
 function syncOpacity(){
  for(const mark of marks)mark.material.opacity=.92*mark.parent.material.opacity;
 }
 return {add,syncOpacity};
}
