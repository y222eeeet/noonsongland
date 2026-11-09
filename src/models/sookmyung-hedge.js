import * as T from 'three';

export function createSookmyungHedge(){
  // Shift the planter toward the lower landing so the top '숙' character clears the upper stair edge.
  const group=new T.Group();group.position.set(0,8.05,-2.25);
  const slope=1.0, width=2.7, length=4.2;
  const mat=c=>new T.MeshStandardMaterial({color:c,roughness:1});
  function ramp(w,h,d,material,y=0){
    const geometry=new T.BoxGeometry(w,h,d,1,1,12),p=geometry.attributes.position;
    for(let i=0;i<p.count;i++)p.setY(i,p.getY(i)-p.getZ(i)*slope);
    geometry.computeVertexNormals();const m=new T.Mesh(geometry,material);m.position.y=y;m.castShadow=m.receiveShadow=true;group.add(m);return m;
  }
  ramp(width,.22,length,mat('#c8bea7'));
  ramp(width-.2,.08,length-.15,mat('#9ca979'),.15);
  // Pale stone borders follow the exact same incline as the planting surface.
  for(const side of [-1,1]){const rim=ramp(.12,.16,length+.12,mat('#f3e7d5'),.20);rim.position.x=side*(width/2-.04);}
  for(const end of [-1,1]){const m=new T.Mesh(new T.BoxGeometry(width,.17,.13),mat('#f3e7d5'));m.position.set(0,.2-end*length/2*slope,end*length/2);m.castShadow=true;group.add(m);}
  // Custom round, heavy Korean lettering; each syllable fills its planting cell.
  const canvas=document.createElement('canvas');canvas.width=160;canvas.height=320;
  const ctx=canvas.getContext('2d');ctx.fillStyle='black';ctx.fillRect(0,0,160,320);
  ctx.strokeStyle='white';ctx.lineWidth=22;ctx.lineCap='round';ctx.lineJoin='round';
  function stroke(points){ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.stroke();}
  // 숙: broad rounded ㅅ / ㅜ / ㄱ, stacked without the font's outer bearings.
  stroke([[22,48],[80,17],[138,48]]);
  stroke([[19,77],[141,77]]);stroke([[80,77],[80,98]]);
  stroke([[25,119],[133,119],[133,145]]);
  // 명: rounded ㅁ and ㅕ, then a broad oval ㅇ.
  ctx.beginPath();ctx.roundRect(20,177,52,59,10);ctx.stroke();
  stroke([[135,173],[135,238]]);stroke([[100,188],[135,188]]);stroke([[100,218],[135,218]]);
  ctx.beginPath();ctx.ellipse(80,282,53,24,0,0,Math.PI*2);ctx.stroke();
  const pixels=ctx.getImageData(0,0,160,320).data,points=[];
  for(let row=3;row<317;row+=3)for(let col=3;col<157;col+=3)if(pixels[(row*160+col)*4]>100){
    const x=(col/160-.5)*2.43,z=(row/320-.5)*3.94;
    points.push([x,.31-z*slope,z]);
  }
  // Overlapping rounded crowns form thick continuous topiary strokes.
  const foliage=new T.InstancedMesh(new T.SphereGeometry(.044,7,5),mat('#51843d'),points.length);
  const dummy=new T.Object3D();points.forEach(([x,y,z],i)=>{dummy.position.set(x,y,z);dummy.scale.set(1,2.0,1);dummy.updateMatrix();foliage.setMatrixAt(i,dummy.matrix);foliage.setColorAt(i,new T.Color(i%3===0?'#689b49':'#4c803c'));});foliage.castShadow=foliage.receiveShadow=true;group.add(foliage);
  return group;
}
