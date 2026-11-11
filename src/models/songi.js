import * as T from 'three';
import { mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';

// The snowflake shell, cranium and curved face are expensive to tessellate.
// They never change shape, so all Song-i instances share one immutable set.
let sharedCoreGeometry;

// A continuous beveled snowflake shell; front is +Z, Y remains upright.
export function createSongi() {
  const root = new T.Group(), parts = {};
  const material = color => new T.MeshStandardMaterial({color, roughness:.88,side:T.FrontSide,transparent:false,opacity:1});
  const lavender=material('#bab1e6'), cream=material('#fff5e7'), purple=material('#8065aa'), pink=material('#efb2c3'), gold=material('#f5ce6b');
  function mesh(geometry, mat, position, parent=root) {
    const m=new T.Mesh(geometry,mat); m.position.set(...position);
    m.castShadow=true; m.receiveShadow=true; parent.add(m); return m;
  }
  function plate(points, depth, bevel) {
    const shape=new T.Shape(); points.forEach(([x,y],i)=>i?shape.lineTo(x,y):shape.moveTo(x,y)); shape.closePath();
    const g=new T.ExtrudeGeometry(shape,{depth,bevelEnabled:true,bevelThickness:bevel,bevelSize:bevel,bevelSegments:5,steps:12,curveSegments:8});
    g.translate(0,0,-depth/2); return g;
  }
  const faceSurface=(x,y)=>-.25+1.10*Math.sqrt(Math.max(0,1-(x/1.36)**2-((y-2.99)/1.22)**2))+.028;
  let shell,cranium,fg;
  if(sharedCoreGeometry){({shell,cranium,fg}=sharedCoreGeometry)}else{
  // Open notches retain a visible gap after beveling, rather than thin slits.
  const right=[
    [0,1.64],[.26,1.44],[.36,1.25],
    [.12,1.07],[.43,1.09],[.51,.91],
    [.22,.69],[.57,.73],[.73,.49],
    [1.07,.25],[1.24,.40],[1.22,.69],
    [1.39,.76],[1.39,.46],[1.61,.52],
    [1.61,.81],[1.78,.87],[1.82,.57],
    [1.70,.31],[1.35,.16],[1.66,.08],
    [1.53,-.12],[1.17,-.18],[1.43,-.32],
    [1.20,-.51],[.87,-.74],[.45,-.88],[0,-.94]
  ];
  const outline=[...right,...right.slice(1,-1).reverse().map(([x,y])=>[-x,y])];
  // Keep the front surface at its original Z so the face never moves.
  // The additional volume grows backwards; the rear tapers into the bevel.
  // The branches have substantial rounded thickness; the cranium supplies
  // the domed front/back volume rather than stretching every branch into a slab.
  shell=plate(outline,.58,.14);
  shell.translate(0,0,-.055);
  cranium=new T.SphereGeometry(1,32,20);
  const cp=cranium.attributes.position;
  for(let i=0;i<cp.count;i++) {
    const x=cp.getX(i),y=cp.getY(i),z=cp.getZ(i);
    // Extend the lavender front cranium toward the existing facial dome.
    // The rear keeps its original volume; the front surrounds the white inset
    // with a continuous rounded brow/chin instead of a flat supporting plate.
    const front=z>0;
    cp.setXYZ(i,x*1.36,y*(front?1.22:1.10),z*(front?1.10:.76));
  }
  cranium.computeVertexNormals();
  const faceShape=new T.Shape();
  faceShape.moveTo(0,.65);faceShape.bezierCurveTo(-.15,.60,-.16,.84,-.34,.74);
  faceShape.bezierCurveTo(-.68,.59,-.99,.24,-1,.03);
  faceShape.bezierCurveTo(-1,-.10,-.85,-.15,-.92,-.23);
  faceShape.bezierCurveTo(-1.08,-.34,-.61,-.77,0,-.77);
  faceShape.bezierCurveTo(.61,-.77,1.08,-.34,.92,-.23);
  faceShape.bezierCurveTo(.85,-.15,1,-.10,1,.03);
  faceShape.bezierCurveTo(.99,.24,.68,.59,.34,.74);
  faceShape.bezierCurveTo(.16,.84,.15,.60,0,.65);
  fg=new T.ExtrudeGeometry(faceShape,{depth:.045,bevelEnabled:true,bevelThickness:.045,bevelSize:.035,bevelSegments:3,curveSegments:12});
  // Subdivide the cap as well as its rim so the face is truly curved.
  let triangles=fg.toNonIndexed ? (fg.index?fg.toNonIndexed():fg) : fg;
  for(let pass=0;pass<3;pass++) {
    const src=triangles.attributes.position, out=[];
    const emit=(a,b,c)=>out.push(...a,...b,...c);
    for(let i=0;i<src.count;i+=3) {
      const a=[src.getX(i),src.getY(i),src.getZ(i)],b=[src.getX(i+1),src.getY(i+1),src.getZ(i+1)],c=[src.getX(i+2),src.getY(i+2),src.getZ(i+2)];
      const mid=(u,v)=>u.map((n,j)=>(n+v[j])/2),ab=mid(a,b),bc=mid(b,c),ca=mid(c,a);
      emit(a,ab,ca);emit(ab,b,bc);emit(ca,bc,c);emit(ab,bc,ca);
    }
    const next=new T.BufferGeometry();next.setAttribute('position',new T.Float32BufferAttribute(out,3));
    triangles.dispose();triangles=next;
  }
  fg=triangles;
  // White inset follows the restored lavender cranium, with only a thin skin offset.
  const fp=fg.attributes.position;
  for(let i=0;i<fp.count;i++) {
    const z=fp.getZ(i), bulge=faceSurface(fp.getX(i),fp.getY(i)+2.99)-.46;
    const frontWeight=T.MathUtils.smoothstep(z,-.045,.045);
    fp.setZ(i,z+bulge*frontWeight-.22*(1-frontWeight));
  }
  fg=mergeVertices(fg, .0001);
  fg.computeVertexNormals();
  [shell,cranium,fg].forEach(geometry=>geometry.userData.sharedSongiGeometry=true);
  sharedCoreGeometry={shell,cranium,fg};
  }
  // Geometry may be shared, but every Song-i owns its meshes and materials.
  // These attachments must therefore happen for both the first and later
  // instances, not just while the shared geometry is being built.
  parts.head=mesh(shell,lavender,[0,3.12,0]);
  mesh(cranium,lavender,[0,2.99,-.25]);
  const faceMaterial=cream.clone();
  parts.face=mesh(fg,faceMaterial,[0,2.99,.46]);
  for (let i=0;i<2;i++) {
    const x=i? .38:-.38, eye=new T.Group();eye.position.set(x,3.05,.69);root.add(eye); parts['eye'+i]=eye;
    mesh(new T.CapsuleGeometry(.085,.25,4,10),purple,[0,0,0],eye).scale.z=.48;
    const lash=mesh(new T.CapsuleGeometry(.028,.09,4,8),purple,[-.062,.205,0],eye);lash.rotation.z=.50;lash.scale.z=.5;
    mesh(new T.SphereGeometry(.14,12,8),pink,[x*2,2.77,.60]).scale.set(1,.62,.22);
  }
  const smile=new T.CatmullRomCurve3([new T.Vector3(-.27,.035,0),new T.Vector3(-.16,-.07,0),new T.Vector3(0,-.10,0),new T.Vector3(.16,-.07,0),new T.Vector3(.27,.035,0)]);
  parts.mouth=mesh(new T.TubeGeometry(smile,20,.032,8,false),purple,[0,2.65,.70]);
  parts.body=mesh(new T.CylinderGeometry(.49,.84,1.10,16,1),lavender,[0,1.65,0]);
  const hem=mesh(new T.TorusGeometry(.78,.065,4,24),lavender,[0,1.10,0]);hem.rotation.x=Math.PI/2;
  for(let i=0;i<2;i++) {
    const sign=i?1:-1;
    const arm=new T.Group();arm.position.set(sign*.57,2.03,0);root.add(arm);parts['arm'+i]=arm;
    const hand=mesh(new T.CapsuleGeometry(.16,.36,5,10),cream,[sign*.17,-.27,0],arm);hand.rotation.z=sign*.55;
    const leg=new T.Group();leg.position.set(sign*.29,.94,0);root.add(leg);parts['leg'+i]=leg;
    mesh(new T.CapsuleGeometry(.155,.34,4,10),cream,[0,-.28,0],leg);
    mesh(new T.SphereGeometry(.235,12,8),pink,[0,-.72,.095],leg).scale.set(1,.62,1.28);
    mesh(new T.SphereGeometry(.24,12,8),cream,[sign*.23,2.12,.43]).scale.set(1,.55,.32);
  }
  const sCurve=new T.CatmullRomCurve3([[.15,.27],[-.02,.32],[-.20,.20],[-.13,.07],[.12,-.04],[.18,-.19],[.02,-.30],[-.18,-.25]].map(([x,y])=>new T.Vector3(x,y,0)));
  const emblemGeometry=new T.TubeGeometry(sCurve,28,.065,8,false);
  const emblemVertices=emblemGeometry.attributes.position,sector=Math.PI*2/16;
  for(let i=0;i<emblemVertices.count;i++){
    const x=emblemVertices.getX(i),y=emblemVertices.getY(i)-.04;
    // Follow the actual tapered, 16-sided dress surface, including its slope.
    const radius=.665-y*(.35/1.10),theta=Math.asin(T.MathUtils.clamp(x/radius,-1,1));
    const faceAngle=(Math.floor(theta/sector)+.5)*sector;
    const surface=(radius*Math.cos(sector/2)-x*Math.sin(faceAngle))/Math.cos(faceAngle);
    emblemVertices.setXYZ(i,x,y,surface+.025+emblemVertices.getZ(i)*.55);
  }
  emblemGeometry.computeVertexNormals();
  parts.emblem=mesh(emblemGeometry,gold,[0,0,0],parts.body);
  const breathFeatures=[];
  function expressionCurve(points,radius){
    const curve=new T.CatmullRomCurve3(points.map(([x,y])=>new T.Vector3(x,y,0)));
    const o=mesh(new T.TubeGeometry(curve,20,radius,8,false),purple,[0,0,.7]);
    breathFeatures.push(o);return o;
  }
  const smallEyes=[],closedEyes=[],brows=[];
  for(const sign of [-1,1]){
    const x=sign*.38;
    const small=mesh(new T.CapsuleGeometry(.075,.13,4,10),purple,[x,3.04,.7]);small.scale.z=.48;smallEyes.push(small);breathFeatures.push(small);
    closedEyes.push(expressionCurve([[x-.12,3.015],[x,2.995],[x+.12,3.015]],.025));
    // Raised inner ends, lowered outer ends: the relaxed sigh in the reference.
    brows.push(expressionCurve([[sign*.23,3.40],[sign*.33,3.32],[sign*.50,3.29]],.027));
  }
  const openMouth=mesh(new T.CircleGeometry(.135,32),purple,[0,2.65,.7]);openMouth.scale.y=1.2;breathFeatures.push(openMouth);
  const mouthRim=mesh(new T.TorusGeometry(.135,.023,8,32),purple,[0,2.65,.705]);mouthRim.scale.y=1.2;breathFeatures.push(mouthRim);
  const exhaleMouth=mesh(new T.CircleGeometry(.075,24),purple,[0,2.65,.7]);exhaleMouth.scale.set(1.25,.65,1);breathFeatures.push(exhaleMouth);
  const exhaleLip=mesh(new T.TorusGeometry(.075,.025,8,24),purple,[0,2.65,.705]);exhaleLip.scale.set(1.25,.65,1);breathFeatures.push(exhaleLip);
  breathFeatures.forEach(o=>o.visible=false);
  // Every face state owns one mutually-exclusive eye layer and one
  // mutually-exclusive mouth layer. New expressions belong in this table;
  // setFaceState always clears every facial layer before revealing a state.
  const faceStates={
    normal:{eyes:[parts.eye0,parts.eye1],mouth:[parts.mouth]},
    blink:{eyes:closedEyes,mouth:[parts.mouth]},
    inhale:{eyes:smallEyes,mouth:[openMouth,mouthRim]},
    exhale:{eyes:closedEyes,mouth:[exhaleMouth,exhaleLip],brows},
    sleep:{eyes:closedEyes,mouth:[parts.mouth]}
  };
  const allFaceLayers=[parts.eye0,parts.eye1,...smallEyes,...closedEyes,...brows,parts.mouth,openMouth,mouthRim,exhaleMouth,exhaleLip];
  function setFaceState(name){
    const state=faceStates[name]||faceStates.normal;
    allFaceLayers.forEach(layer=>layer.visible=false);
    [...state.eyes,...state.mouth,...(state.brows||[])].forEach(layer=>layer.visible=true);
    root.userData.faceState=name;
  }
  // Wrap every expression mesh onto the very same surface used by the face.
  // Bury each mesh's rear half into the face to avoid any visible air gap.
  root.updateMatrixWorld(true);
  const attached=[...breathFeatures,...parts.eye0.children,...parts.eye1.children,parts.mouth,
    ...root.children.filter(o=>o.isMesh&&o.material===pink&&o.position.y===2.77)];
  for(const feature of attached) {
    const attr=feature.geometry.attributes.position;
    const inverse=feature.matrixWorld.clone().invert();
    for(let i=0;i<attr.count;i++) {
      const v=new T.Vector3().fromBufferAttribute(attr,i).applyMatrix4(feature.matrixWorld);
      const center=new T.Vector3(0,0,0).applyMatrix4(feature.matrixWorld);
      const relief=v.z-center.z;
      v.z=faceSurface(v.x,v.y)+.100+relief;
      v.applyMatrix4(inverse);attr.setXYZ(i,v.x,v.y,v.z);
    }
    attr.needsUpdate=true;feature.geometry.computeVertexNormals();
    feature.geometry.computeBoundingSphere();
  }
  root.userData.parts=parts;
  const sleepBubbles=new T.Group();sleepBubbles.name='sleep-bubbles';root.add(sleepBubbles);sleepBubbles.visible=false;
  for(let i=0;i<5;i++){
    const bubble=new T.Mesh(new T.SphereGeometry(1,12,8),new T.MeshStandardMaterial({color:'#e6e2ff',transparent:true,opacity:0,roughness:.22,metalness:.08,depthWrite:false}));
    bubble.castShadow=bubble.receiveShadow=false;sleepBubbles.add(bubble);
  }
  const normalFace=new T.Color('#fff5e7'),pinkFace=new T.Color('#f3bdca'),grayFace=new T.Color('#a6a5ad');
  const targetFace=new T.Color();let lastExpressionTime=0;
  root.userData.animate=(elapsed,state='idle',heldSeconds=0)=>{
    if(root.userData.skyPose==='sleep')state='sleep';
    const sleeping=state==='sleep';
    sleepBubbles.visible=sleeping;
    const belly=sleeping?(1-Math.cos(elapsed*Math.PI/2))*.5:0;
    parts.body.scale.z=1+belly*.075;parts.body.position.z=belly*.025;
    if(sleeping)sleepBubbles.children.forEach((bubble,i)=>{
      const age=(elapsed+i*.78)%3.9,t=age/3.9;
      // The resting avatar lies on its back: local +Z points up into the sky.
      bubble.position.set(Math.sin(age*1.8+i)*(.025+t*.10),2.91+Math.sin(age+i)*.035,1.02+t*1.35);
      bubble.scale.setScalar(.035+t*.045);bubble.material.opacity=.42*Math.sin(Math.PI*t);
    });
    const dt=Math.max(0,Math.min(.1,elapsed-lastExpressionTime));lastExpressionTime=elapsed;
    // Expression changes affect only face meshes and its dedicated material.
    parts.body.visible=true;
    lavender.transparent=false;lavender.opacity=1;
    targetFace.copy(normalFace);
    if(state==='inhale'&&heldSeconds>=10){
      targetFace.copy(pinkFace).lerp(grayFace,T.MathUtils.smoothstep(heldSeconds,10,12));
    }else if(state==='inhale'&&heldSeconds>=5){
      targetFace.lerp(pinkFace,T.MathUtils.smoothstep(heldSeconds,5,10));
    }
    faceMaterial.color.lerp(targetFace,1-Math.exp(-dt*5));
    const inhale=state==='inhale',exhale=state==='exhale';
    const cycle=elapsed%4.8,blinking=!inhale&&!exhale&&!sleeping&&cycle>4.42&&cycle<4.70;
    const faceState=sleeping?'sleep':inhale?'inhale':exhale?'exhale':blinking?'blink':'normal';
    setFaceState(faceState);
    // Reset the base eye scale every frame; blink uses its own closed-eye
    // layer, so an open and closed eye can never be rendered together.
    parts.eye0.scale.y=parts.eye1.scale.y=1;
    parts.mouth.scale.y=.82+.18*Math.sin(elapsed*2.4);
  };
  return root;
}

// Seat height describes the cushion surface, rather than the avatar's feet.
export function applyBenchPose(avatar,seatY){
 avatar.position.y=seatY-1.02;
 const parts=avatar.userData.parts;
 parts.leg0.rotation.x=parts.leg1.rotation.x=-Math.PI/2;
 parts.arm0.rotation.x=parts.arm1.rotation.x=-.22;
}
