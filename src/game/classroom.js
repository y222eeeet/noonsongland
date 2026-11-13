import * as T from 'three';
import { createProfessor } from '../models/professor.js';
import { createSongi } from '../models/songi.js';

const isMobile=matchMedia('(hover:none) and (pointer:coarse)').matches;

export function startClassroom(game){
 game.replaceChildren();
 const canvas=document.createElement('canvas'),back=document.createElement('button'),hint=document.createElement('div'),status=document.createElement('div'),joy=document.createElement('div'),stick=document.createElement('div');
 canvas.style.cssText='display:block;width:100%;height:100%;touch-action:none';
 back.textContent='← 캠퍼스로 돌아가기';back.style.cssText="position:absolute;z-index:2;top:max(16px,env(safe-area-inset-top));left:14px;padding:10px 14px;border:1px solid #ffffffcc;border-radius:999px;background:#fffaf8e8;color:#5f5473;font:800 13px ui-rounded,'Apple SD Gothic Neo',sans-serif";
 hint.textContent=isMobile?'조이스틱으로 이동 · 가구를 눌러 배트 휘두르기':'방향키 · WASD로 이동 / Space로 배트 휘두르기';hint.style.cssText="position:absolute;z-index:2;right:14px;bottom:max(18px,env(safe-area-inset-bottom));left:14px;padding:10px 13px;border-radius:14px;background:#fffaf8d9;color:#5f5473;font:800 12px ui-rounded,'Apple SD Gothic Neo',sans-serif;text-align:center;pointer-events:none";
 status.hidden=true;status.style.cssText="position:absolute;z-index:2;top:23%;right:14px;left:14px;color:#76538f;font:900 25px/1.35 ui-rounded,'Apple SD Gothic Neo',sans-serif;text-align:center;text-shadow:0 2px 0 #fff";joy.style.cssText='position:absolute;z-index:2;bottom:max(28px,calc(env(safe-area-inset-bottom) + 12px));left:23px;width:104px;height:104px;border:2px solid #ffffff88;border-radius:50%;background:#ffffff36;touch-action:none;display:none';stick.style.cssText='position:absolute;top:27px;left:27px;width:46px;height:46px;border:2px solid #ffffffaa;border-radius:50%;background:#b596d4aa';joy.append(stick);if(isMobile)joy.style.display='block';game.append(canvas,back,hint,status,joy);
 back.addEventListener('click',()=>location.assign('/'));

 const scene=new T.Scene();scene.background=new T.Color('#eee8f2');scene.fog=new T.Fog('#eee8f2',32,90);
 const camera=new T.PerspectiveCamera(48,1,.1,120),renderer=new T.WebGLRenderer({canvas,antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.outputColorSpace=T.SRGBColorSpace;
 scene.add(new T.HemisphereLight('#fff8ed','#887a9c',2.3));const sun=new T.DirectionalLight('#fff2d7',2.7);sun.position.set(-12,20,10);scene.add(sun);
 const mat=(color,roughness=.82)=>new T.MeshStandardMaterial({color,roughness});
 const cream=mat('#fff8ed'),wall=mat('#e7dced'),floorMat=mat('#cdbba7'),wood=mat('#b5896d'),chairMat=mat('#b99ddd'),boardMat=mat('#496f61');
 const add=(geometry,material,x,y,z,parent=scene)=>{const mesh=new T.Mesh(geometry,material);mesh.position.set(x,y,z);parent.add(mesh);return mesh};
 const dustGeometry=new T.SphereGeometry(.13,8,6),impactBursts=[];let shakeUntil=0,shakeStrength=0;
 function impact(position,color='#d7ad8c'){
  const burst=new T.Group(),material=new T.MeshBasicMaterial({color,transparent:true,opacity:.78,depthWrite:false});burst.position.copy(position);burst.position.y+=1;scene.add(burst);
  for(let i=0;i<11;i++){const puff=new T.Mesh(dustGeometry,material);const angle=i/11*Math.PI*2+Math.random()*.35,speed=1.4+Math.random()*2.3;puff.userData.velocity=new T.Vector3(Math.cos(angle)*speed,.7+Math.random()*2.1,Math.sin(angle)*speed);puff.scale.setScalar(.55+Math.random()*.8);burst.add(puff)}
  impactBursts.push({burst,material,started:performance.now()});
 }
 function updateImpacts(now,dt){for(let i=impactBursts.length-1;i>=0;i--){const item=impactBursts[i],age=(now-item.started)/1000;if(age>.72){scene.remove(item.burst);item.material.dispose();impactBursts.splice(i,1);continue}item.material.opacity=.78*(1-age/.72);item.burst.children.forEach(puff=>{puff.position.addScaledVector(puff.userData.velocity,dt);puff.userData.velocity.y-=dt*5.5;puff.scale.multiplyScalar(1+dt*.7)})}}
 const halfX=22,halfZ=17;
 add(new T.BoxGeometry(halfX*2+1,.35,halfZ*2+1),floorMat,0,-.2,0);add(new T.BoxGeometry(halfX*2+1,9,.35),cream,0,4.3,halfZ);add(new T.BoxGeometry(.35,9,halfZ*2+1),wall,-halfX,4.3,0);add(new T.BoxGeometry(.35,9,halfZ*2+1),wall,halfX,4.3,0);
 add(new T.BoxGeometry(2.3,5.2,.18),wood,17.8,2.45,-halfZ+.24);
 const destructibles=[],victoryTargets=[],obstacles=[];
 function destructible(group,bounds,color='#d7ad8c',required=true){group.userData.destroyed=false;group.userData.debrisColor=color;destructibles.push(group);if(required)victoryTargets.push(group);obstacles.push({group,...bounds});return group}
 function wallPanel(x,z,width){const panel=destructible(new T.Group(),{x,z,w:width/2,d:.35},'#eee0ea',false);panel.position.set(x,0,z);scene.add(panel);add(new T.BoxGeometry(width,9,.35),cream,0,4.3,0,panel);return panel}
 wallPanel(-14,-halfZ,12);wallPanel(0,-halfZ,12);wallPanel(14,-halfZ,12);wallPanel(0,halfZ,halfX*2+1);
 const board=destructible(new T.Group(),{x:0,z:-halfZ+.42,w:5.3,d:.4},'#6f9686');board.position.set(0,0,-halfZ+.24);scene.add(board);add(new T.BoxGeometry(10.2,3.4,.16),boardMat,0,5.35,0,board);add(new T.BoxGeometry(10.8,.22,.45),wood,0,3.62,-.31,board);
 function desk(x,z){
  const table=destructible(new T.Group(),{x,z,w:1.45,d:1.0},'#c78f68');table.position.set(x,0,z);scene.add(table);add(new T.BoxGeometry(2.25,.22,1.35),wood,0,1.52,0,table);for(const sx of [-.86,.86])for(const sz of [-.48,.48])add(new T.BoxGeometry(.15,1.45,.15),wood,sx,.73,sz,table);
  const chair=destructible(new T.Group(),{x,z:z+2.0,w:.72,d:.72},'#b99ddd');chair.position.set(x,0,z+2);scene.add(chair);add(new T.BoxGeometry(.95,.18,.78),chairMat,0,.83,0,chair);add(new T.BoxGeometry(.95,.95,.13),chairMat,0,1.28,.34,chair);for(const sx of [-.32,.32])for(const sz of [-.25,.25])add(new T.BoxGeometry(.12,.78,.12),wood,sx,.4,sz,chair);
 }
 // Four-by-four desk blocks: rows remain separated by a walkable gap after
 // each chair, and the generous column spacing leaves routes between blocks.
 for(const z of [-10,-4,2,8])for(const x of [-15,-5,5,15])desk(x,z);
 const podium=destructible(new T.Group(),{x:0,z:-13.4,w:2.25,d:1.25});podium.position.set(0,0,-13.4);scene.add(podium);add(new T.BoxGeometry(4.1,1.65,1.85),wood,0,.82,0,podium);add(new T.BoxGeometry(4.35,.2,2.05),cream,0,1.73,0,podium);
 const professor=createProfessor(Math.random()<.5?'woman':'man');
 professor.position.set(podium.position.x,0,(podium.position.z+board.position.z)/2);
 scene.add(professor);
 const professorTarget=new T.Vector3(17.25,0,-15.3);
 let swingCount=0,professorPhase='waiting',won=false;
 // Start in the centre aisle: between desk columns 2/3 and chair rows 2/3.
 const songi=createSongi();songi.position.set(0,.05,1);songi.rotation.y=Math.PI;scene.add(songi);songi.userData.animate?.(0,'idle',0);
 const swingDuration=310;
 const swingArm=songi.userData.parts.arm1;
 const hand=swingArm.children[0];
 const bat=new T.Group(),batWood=mat('#a77558'),batGrip=mat('#765046');
 // Put the grip at the pivot so rotating the bat keeps it in Song-i's hand.
 add(new T.CylinderGeometry(.30,.16,2.6,10),batWood,0,1.52,0,bat);
 add(new T.CylinderGeometry(.12,.15,.5,10),batGrip,0,0,0,bat);
 bat.position.set(0,-.14,.04).applyQuaternion(hand.quaternion).add(hand.position);
 bat.rotation.set(.18,0,-1.05);
 swingArm.add(bat);
 const swingArc=1.08,trailSegments=40;
 const trailGeometry=new T.BufferGeometry();
 const trailColors=new T.Float32BufferAttribute(new Float32Array((trailSegments+1)*8),4);
 const trailPoints=[],trailIndices=[];
 for(let i=0;i<=trailSegments;i++){
  const angle=T.MathUtils.lerp(swingArc,-swingArc,i/trailSegments);
  for(const radius of [1.55,3.9])trailPoints.push(Math.sin(angle)*radius,0,Math.cos(angle)*radius);
  if(i<trailSegments){
   const j=i*2;
   trailIndices.push(j,j+1,j+2,j+1,j+3,j+2);
  }
 }
 trailGeometry.setAttribute('position',new T.Float32BufferAttribute(trailPoints,3));
 trailGeometry.setAttribute('color',trailColors.setUsage(T.DynamicDrawUsage));
 trailGeometry.setIndex(trailIndices);
 const sweepMaterial=new T.MeshBasicMaterial({vertexColors:true,transparent:true,depthWrite:false,side:T.DoubleSide});
 const swingSweep=new T.Mesh(trailGeometry,sweepMaterial);
 swingSweep.position.y=1.61;
 swingSweep.visible=false;
 songi.add(swingSweep);
 const keys={},moveVector=new T.Vector2(),forward=new T.Vector3(),candidate=new T.Vector3(),raycaster=new T.Raycaster(),pointer=new T.Vector2(),cameraForward=new T.Vector3();let swingingUntil=0,joyPointer=null,canvasPress=null,mobileYaw=songi.rotation.y,mobilePitch=0;
 function resize(){const rect=game.getBoundingClientRect();renderer.setSize(rect.width,rect.height,false);camera.aspect=rect.width/rect.height;camera.updateProjectionMatrix()}addEventListener('resize',resize);resize();
 function canOccupy(x,z){if(Math.abs(x)>halfX-1.1||Math.abs(z)>halfZ-1.1)return false;return !obstacles.some(obstacle=>!obstacle.group.userData.destroyed&&Math.abs(x-obstacle.x)<obstacle.w+.78&&Math.abs(z-obstacle.z)<obstacle.d+.78)}
 function swing(target){
  const now=performance.now();if(now<swingingUntil)return;swingingUntil=now+swingDuration;
  if(won)return;
  swingCount++;
  if(swingCount===1)professorPhase='shaking';else if(swingCount>=3)professorPhase='running';
  if(target){const dx=target.x-songi.position.x,dz=target.z-songi.position.z;if(Math.hypot(dx,dz)>.2)songi.rotation.y=Math.atan2(dx,dz)}
  const facing=new T.Vector3(Math.sin(songi.rotation.y),0,Math.cos(songi.rotation.y));
  let broken=0;for(const object of destructibles){if(object.userData.destroyed)continue;const delta=object.position.clone().sub(songi.position);delta.y=0;const distance=delta.length();if(distance>4.4)continue;delta.normalize();if(facing.dot(delta)<Math.cos(.72))continue;object.userData.destroyed=true;object.userData.destroyedAt=now;impact(object.getWorldPosition(new T.Vector3()),object.userData.debrisColor);broken++;}
  if(broken){shakeStrength=Math.min(.38,.14+broken*.07);shakeUntil=now+260;}
 }
 const professorDirection=new T.Vector3();
 function updateProfessor(now,dt){
  if(professorPhase==='waiting'||professorPhase==='gone')return;
  if(professorPhase==='shaking'){
   professor.rotation.z=Math.sin(now*.035)*.075;
   return;
  }
  professor.rotation.z=0;
  professorDirection.subVectors(professorTarget,professor.position).setY(0);
  if(professorDirection.length()<.45){
   professor.visible=false;
   professorPhase='gone';
   return;
  }
  professorDirection.normalize();
  professor.position.addScaledVector(professorDirection,dt*7.5);
  professor.rotation.y=Math.atan2(professorDirection.x,professorDirection.z);
 }
 function checkVictory(){if(won||!victoryTargets.every(object=>object.userData.destroyed))return;won=true;status.hidden=false;status.textContent='강의실 파괴 성공!';hint.textContent='송이가 신나게 환호하고 있어요!'}
 addEventListener('keydown',event=>{if(event.code==='Space'){event.preventDefault();swing()}if(/Arrow|Key[WASD]/.test(event.code)){keys[event.code]=true;event.preventDefault()}});addEventListener('keyup',event=>keys[event.code]=false);
 canvas.addEventListener('pointerdown',event=>{canvasPress={x:event.clientX,y:event.clientY,lastX:event.clientX,lastY:event.clientY,dragged:false}});
 canvas.addEventListener('pointermove',event=>{if(!isMobile||!canvasPress)return;const dx=event.clientX-canvasPress.lastX,dy=event.clientY-canvasPress.lastY;if(Math.hypot(event.clientX-canvasPress.x,event.clientY-canvasPress.y)>8)canvasPress.dragged=true;if(canvasPress.dragged){mobileYaw-=dx*.008;mobilePitch=Math.max(-.28,Math.min(.45,mobilePitch-dy*.006));canvasPress.lastX=event.clientX;canvasPress.lastY=event.clientY}});
 canvas.addEventListener('pointerup',event=>{if(!isMobile||!canvasPress||canvasPress.dragged){canvasPress=null;return}const rect=canvas.getBoundingClientRect();pointer.set((event.clientX-rect.left)/rect.width*2-1,-(event.clientY-rect.top)/rect.height*2+1);raycaster.setFromCamera(pointer,camera);const hit=raycaster.intersectObjects(destructibles,true)[0];swing(hit?.point);canvasPress=null});
 joy.addEventListener('pointerdown',event=>{joyPointer=event.pointerId;joy.setPointerCapture(event.pointerId)});joy.addEventListener('pointermove',event=>{if(event.pointerId!==joyPointer)return;const rect=joy.getBoundingClientRect();let x=(event.clientX-(rect.left+rect.width/2))/42,z=(event.clientY-(rect.top+rect.height/2))/42;const length=Math.hypot(x,z);if(length>1){x/=length;z/=length}moveVector.set(x,z);stick.style.transform=`translate(${x*27}px,${z*27}px)`});['pointerup','pointercancel'].forEach(type=>joy.addEventListener(type,event=>{if(event.pointerId===joyPointer){joyPointer=null;moveVector.set(0,0);stick.style.transform=''}}));
 const clock=new T.Clock();function frame(){requestAnimationFrame(frame);const dt=Math.min(clock.getDelta(),.04),now=performance.now();
  let walking=false;
  if(isMobile&&moveVector.lengthSq()>.006){const dx=-Math.cos(mobileYaw)*moveVector.x-Math.sin(mobileYaw)*moveVector.y,dz=Math.sin(mobileYaw)*moveVector.x-Math.cos(mobileYaw)*moveVector.y;forward.set(dx,0,dz).normalize();songi.rotation.y=Math.atan2(forward.x,forward.z);candidate.copy(songi.position).addScaledVector(forward,dt*4.2);if(canOccupy(candidate.x,candidate.z)){songi.position.copy(candidate);walking=true}}
  if(!isMobile){const turn=(keys.KeyA||keys.ArrowLeft?1:0)-(keys.KeyD||keys.ArrowRight?1:0),drive=(keys.KeyW||keys.ArrowUp?1:0)-(keys.KeyS||keys.ArrowDown?1:0);songi.rotation.y+=turn*dt*2.5;if(Math.abs(drive)>.01){forward.set(Math.sin(songi.rotation.y),0,Math.cos(songi.rotation.y));candidate.copy(songi.position).addScaledVector(forward,drive*dt*4.2);if(canOccupy(candidate.x,candidate.z)){songi.position.copy(candidate);walking=true}}}
  checkVictory();songi.userData.animate?.(now/1000,won?'win':'idle',0);const parts=songi.userData.parts,walkSwing=walking?Math.sin(now*.011)*.55:0;parts.arm0.rotation.x=parts.leg1.rotation.x=walkSwing;parts.arm1.rotation.x=parts.leg0.rotation.x=-walkSwing;
  const progress=T.MathUtils.clamp(1-(swingingUntil-now)/swingDuration,0,1);
  const swingActive=now<swingingUntil;
  swingSweep.visible=swingActive;
  if(swingActive){
   const sweep=T.MathUtils.smoothstep(progress,.04,.73);
   swingArm.rotation.x=0;
   swingArm.rotation.y=T.MathUtils.lerp(swingArc,-swingArc,sweep);
   bat.rotation.set(Math.PI/2,0,0);
   const fade=1-T.MathUtils.smoothstep(progress,.68,1);
   for(let i=0;i<=trailSegments;i++){
    const behind=sweep-i/trailSegments;
    const alpha=T.MathUtils.smoothstep(behind,0,.075)*(1-T.MathUtils.smoothstep(behind,.09,.47))*fade;
    trailColors.setXYZW(i*2,1,1,1,alpha*.12);
    trailColors.setXYZW(i*2+1,1,1,1,alpha*.76);
   }
   trailColors.needsUpdate=true;
  }else{
   swingArm.rotation.y=0;
   bat.rotation.set(.18,0,-1.05);
  }
  for(const object of destructibles)if(object.userData.destroyed){const age=(now-object.userData.destroyedAt)/1000;object.rotation.z+=dt*7;object.position.y=Math.max(-1.4,object.position.y-dt*5);object.scale.setScalar(Math.max(.1,1-age*.7));}updateProfessor(now,dt);updateImpacts(now,dt);
  const yaw=isMobile?mobileYaw:songi.rotation.y;cameraForward.set(Math.sin(yaw),0,Math.cos(yaw));camera.position.copy(songi.position).addScaledVector(cameraForward,-17);camera.position.y+=21;const shake=Math.max(0,(shakeUntil-now)/260)*shakeStrength;if(shake){camera.position.x+=Math.sin(now*.19)*shake;camera.position.y+=Math.cos(now*.27)*shake*.7;camera.position.z+=Math.sin(now*.31)*shake*.5}camera.lookAt(songi.position.x,songi.position.y+6.2+mobilePitch*14,songi.position.z);renderer.render(scene,camera);
 }frame();
}
