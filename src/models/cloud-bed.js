import * as T from 'three';

// Rounded cloud furniture; local +Z is the foot of the bed.
export function createCloudBed(starColors){
 const bed=new T.Group();bed.name='cloud-bed';
 const material=color=>new T.MeshStandardMaterial({color,roughness:.94});
 const white=material('#fff8f4'),lavender=material('#ddd0f4'),duvet=material('#f4eaf9');
 const accents=starColors.map(material);
 function sphere(parent,mat,x,y,z,sx,sy,sz){const m=new T.Mesh(new T.SphereGeometry(1,20,14),mat);m.position.set(x,y,z);m.scale.set(sx,sy,sz);parent.add(m);return m;}
 function cushion(mat,w,length,height,y,z){
  const r=.42,shape=new T.Shape(),x=-w/2,b=-length/2;
  shape.moveTo(x+r,b);shape.lineTo(x+w-r,b);shape.quadraticCurveTo(x+w,b,x+w,b+r);shape.lineTo(x+w,b+length-r);shape.quadraticCurveTo(x+w,b+length,x+w-r,b+length);shape.lineTo(x+r,b+length);shape.quadraticCurveTo(x,b+length,x,b+length-r);shape.lineTo(x,b+r);shape.quadraticCurveTo(x,b,x+r,b);
  const geometry=new T.ExtrudeGeometry(shape,{depth:height,bevelEnabled:true,bevelThickness:.16,bevelSize:.16,bevelSegments:4,steps:1,curveSegments:10});
  const mesh=new T.Mesh(geometry,mat);mesh.rotation.x=-Math.PI/2;mesh.position.set(0,y,z);bed.add(mesh);return mesh;
 }
 cushion(lavender,3.25,5.3,.3,0,0);
 // Scalloped mattress edge and thick tucked duvet.
 for(const x of [-1.15,-.58,0,.58,1.15])sphere(bed,lavender,x,.12,2.48,.52,.37,.52);
 cushion(duvet,3.2,3.8,.22,.40,.65);
 for(const x of [-1.1,-.55,0,.55,1.1])sphere(bed,duvet,x,.56,2.43,.52,.27,.42);
 cushion(lavender,3.12,.55,.13,.64,-1.08);
 // A single cloud silhouette replaces the rainbow headboard.
 const head=new T.Group();head.position.set(0,.65,-2.4);bed.add(head);
 [[-1.25,.35,.55,.65],[-.75,.85,.65,.8],[0,1.12,.78,.88],[.75,.85,.65,.8],[1.25,.35,.55,.65],[0,.28,1.2,.65]].forEach(([x,y,sx,sy])=>sphere(head,white,x,y,0,sx,sy,.33));
 const pillow=new T.Group();pillow.position.set(0,.68,-1.8);bed.add(pillow);
 [[0,0,.72,.23],[-.58,0,.38,.2],[.58,0,.38,.2],[-.28,-.22,.4,.2],[.28,-.22,.4,.2]].forEach(([x,z,sx,sz])=>sphere(pillow,white,x,.08,z,sx,.22,sz));
 const starShape=new T.Shape();for(let i=0;i<10;i++){const a=Math.PI/2+i*Math.PI/5,r=i%2?.48:1;const x=Math.cos(a)*r,y=Math.sin(a)*r;i?starShape.lineTo(x,y):starShape.moveTo(x,y)}starShape.closePath();
 const starGeometry=new T.ExtrudeGeometry(starShape,{depth:.04,bevelEnabled:true,bevelSize:.045,bevelThickness:.025,bevelSegments:3,steps:1});
 [[-.94,-.30,.22],[.62,-.20,.27],[-.25,.30,.23],[1.04,.75,.18],[-.98,1.17,.27],[.35,1.40,.24],[-.25,1.98,.18],[1.0,1.92,.21]].forEach(([x,z,s],i)=>{const star=new T.Mesh(starGeometry,accents[i%2]);star.rotation.set(-Math.PI/2,0,i*.67);star.position.set(x,.83,z);star.scale.setScalar(s);bed.add(star)});
 bed.traverse(o=>{o.castShadow=false;o.receiveShadow=false});
 return bed;
}
