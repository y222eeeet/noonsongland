import { sampleClassroomSwing } from './classroom-swing.js';
import * as T from 'three';
import { createProfessor } from '../models/professor.js';
import { createSongi } from '../models/songi.js';

const isMobile=matchMedia('(hover:none) and (pointer:coarse)').matches;

export function startClassroom(game){
 game.replaceChildren();
 const canvas=document.createElement('canvas'),back=document.createElement('button'),hint=document.createElement('div'),status=document.createElement('div'),joy=document.createElement('div'),stick=document.createElement('div'),resultActions=document.createElement('div');
 canvas.style.cssText='display:block;width:100%;height:100%;touch-action:none';
 back.textContent='← 캠퍼스로 돌아가기';back.style.cssText="position:absolute;z-index:2;top:max(16px,env(safe-area-inset-top));left:14px;padding:10px 14px;border:1px solid #ffffffcc;border-radius:999px;background:#fffaf8e8;color:#5f5473;font:800 13px ui-rounded,'Apple SD Gothic Neo',sans-serif";
 hint.textContent=isMobile?'조이스틱으로 이동 · 가구를 눌러 배트 휘두르기':'방향키 · WASD로 이동 / Space로 배트 휘두르기';hint.style.cssText="position:absolute;z-index:2;right:14px;bottom:max(18px,env(safe-area-inset-bottom));left:14px;padding:10px 13px;border-radius:14px;background:#fffaf8d9;color:#5f5473;font:800 12px ui-rounded,'Apple SD Gothic Neo',sans-serif;text-align:center;pointer-events:none";
 status.hidden=true;status.style.cssText="position:absolute;z-index:2;top:23%;right:14px;left:14px;color:#76538f;font:900 25px/1.35 ui-rounded,'Apple SD Gothic Neo',sans-serif;text-align:center;text-shadow:0 2px 0 #fff";joy.style.cssText='position:absolute;z-index:2;bottom:max(28px,calc(env(safe-area-inset-bottom) + 12px));left:23px;width:104px;height:104px;border:2px solid #ffffff88;border-radius:50%;background:#ffffff36;touch-action:none;display:none';stick.style.cssText='position:absolute;top:27px;left:27px;width:46px;height:46px;border:2px solid #ffffffaa;border-radius:50%;background:#b596d4aa';joy.append(stick);if(isMobile)joy.style.display='block';
 // Keep this out of layout from the first frame. The inline display value is
 // toggled only after the two-second victory celebration has completed.
 resultActions.style.cssText="position:absolute;z-index:3;right:14px;bottom:max(24px,env(safe-area-inset-bottom));left:14px;display:none;gap:10px";resultActions.innerHTML=`<button data-result="campus" style="flex:1;padding:14px 10px;border:2px solid #fff;border-radius:16px;background:#fffaf8;color:#5f5473;font:800 14px ui-rounded,'Apple SD Gothic Neo',sans-serif;box-shadow:0 8px 20px #5c477733">캠퍼스로 돌아가기</button><button data-result="retry" style="flex:1;padding:14px 10px;border:2px solid #fff;border-radius:16px;background:#a98ad0;color:#fff;font:800 14px ui-rounded,'Apple SD Gothic Neo',sans-serif;box-shadow:0 8px 20px #5c477744">강의실 다시 부수기</button>`;
 game.append(canvas,back,hint,status,joy,resultActions);
 back.addEventListener('click',()=>location.assign('/'));
 resultActions.addEventListener('click',event=>{const action=event.target.closest('button')?.dataset.result;if(action==='campus')location.assign('/');if(action==='retry')location.reload()});

 const scene=new T.Scene();scene.background=new T.Color('#eee8f2');scene.fog=new T.Fog('#eee8f2',32,90);
 const camera=new T.PerspectiveCamera(48,1,.1,120),renderer=new T.WebGLRenderer({canvas,antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.outputColorSpace=T.SRGBColorSpace;
 scene.add(new T.HemisphereLight('#fff8ed','#887a9c',2.3));const sun=new T.DirectionalLight('#fff2d7',2.7);sun.position.set(-12,20,10);scene.add(sun);
 const mat=(color,roughness=.82)=>new T.MeshStandardMaterial({color,roughness});
 const cream=mat('#fff8ed'),wall=mat('#e7dced'),floorMat=mat('#cdbba7'),wood=mat('#b5896d'),chairMat=mat('#b99ddd'),boardMat=mat('#496f61');
 const add=(geometry,material,x,y,z,parent=scene)=>{const mesh=new T.Mesh(geometry,material);mesh.position.set(x,y,z);parent.add(mesh);return mesh};
 const dustGeometry=new T.SphereGeometry(.13,8,6),impactBursts=[];let shakeUntil=0,shakeStrength=0;
 function impact(position,color,now){
  const burst=new T.Group(),material=new T.MeshBasicMaterial({color,transparent:true,opacity:.78,depthWrite:false});burst.position.copy(position);burst.position.y+=1;scene.add(burst);
  for(let i=0;i<11;i++){const puff=new T.Mesh(dustGeometry,material);const angle=i/11*Math.PI*2+Math.random()*.35,speed=1.4+Math.random()*2.3;puff.userData.velocity=new T.Vector3(Math.cos(angle)*speed,.7+Math.random()*2.1,Math.sin(angle)*speed);puff.scale.setScalar(.55+Math.random()*.8);burst.add(puff)}
  const flashMaterial=new T.SpriteMaterial({map:glintTexture,color:'#fff8ff',transparent:true,depthWrite:false});
  const flash=new T.Sprite(flashMaterial);
  flash.scale.setScalar(1.35);burst.add(flash);
  impactBursts.push({burst,material,flash,started:now});
 }
 function updateImpacts(now,dt){
  for(let i=impactBursts.length-1;i>=0;i--){
   const {burst,material,flash,started}=impactBursts[i],age=(now-started)/1000;
   if(age>.72){
    scene.remove(burst);material.dispose();flash.material.dispose();impactBursts.splice(i,1);continue;
   }
   material.opacity=.78*(1-age/.72);
   flash.material.opacity=Math.max(0,1-age/.12);
   flash.scale.setScalar(1.35+Math.min(age,.12)*4);
   for(const puff of burst.children){
    if(puff===flash)continue;
    puff.position.addScaledVector(puff.userData.velocity,dt);
    puff.userData.velocity.y-=dt*5.5;puff.scale.multiplyScalar(1+dt*.7);
   }
  }
 }
 const halfX=22,halfZ=17;
 const wallMaterials=[cream.clone(),cream.clone(),wall.clone(),wall.clone()];
 wallMaterials.forEach(material=>{material.side=T.DoubleSide;material.transparent=false;material.opacity=1});
 add(new T.BoxGeometry(halfX*2+1,.35,halfZ*2+1),floorMat,0,-.2,0);
 const classroomWalls=[
  add(new T.BoxGeometry(halfX*2+1,9,.35),wallMaterials[0],0,4.3,-halfZ),
  add(new T.BoxGeometry(halfX*2+1,9,.35),wallMaterials[1],0,4.3,halfZ),
  add(new T.BoxGeometry(.35,9,halfZ*2+1),wallMaterials[2],-halfX,4.3,0),
  add(new T.BoxGeometry(.35,9,halfZ*2+1),wallMaterials[3],halfX,4.3,0)
 ];
 const victoryWallRay=new T.Raycaster(),victoryLookTarget=new T.Vector3();
 function revealOnlyBlockingWall(cameraPosition,target){
  // Restore every wall first, then fade only the closest wall between the
  // victory camera and Song-i. All walls behind it remain fully opaque.
  wallMaterials.forEach(material=>{material.transparent=false;material.opacity=1;material.depthWrite=true});
  victoryLookTarget.copy(target).sub(cameraPosition);const distance=victoryLookTarget.length();
  if(distance<.01)return;
  victoryWallRay.set(cameraPosition,victoryLookTarget.multiplyScalar(1/distance));
  const blocking=victoryWallRay.intersectObjects(classroomWalls,false).find(hit=>hit.distance<distance-.05);
  if(!blocking)return;
  const material=blocking.object.material;material.transparent=true;material.opacity=.18;material.depthWrite=false;
 }
 add(new T.BoxGeometry(2.3,5.2,.18),wood,17.8,2.45,-halfZ+.24);
 const destructibles=[],victoryTargets=[],obstacles=[];
 function destructible(group,bounds,color='#d7ad8c',required=true){group.userData.destroyed=false;group.userData.debrisColor=color;destructibles.push(group);if(required)victoryTargets.push(group);obstacles.push({group,...bounds});return group}
 // Walls and the board define the room; only the furniture is breakable.
 const board=new T.Group();board.position.set(0,0,-halfZ+.24);scene.add(board);add(new T.BoxGeometry(10.2,3.4,.16),boardMat,0,5.35,0,board);add(new T.BoxGeometry(10.8,.22,.45),wood,0,3.62,-.31,board);
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
 const professorStart=professor.position.clone();
 const professorTarget=new T.Vector3(17.25,0,-15.3);
 let swingCount=0,professorPhase='waiting',won=false,victoryStartedAt=0,resultShown=false;
 // Start in the centre aisle: between desk columns 2/3 and chair rows 2/3.
 const songi=createSongi();songi.position.set(0,.05,1);songi.rotation.y=Math.PI;scene.add(songi);songi.userData.animate?.(0,'idle',0);
 const downLength=200,returnLength=500,joinLength=70,batTip=3.645;
 const swingLength=downLength+returnLength,downEnd=.69;
 const swingArm=songi.userData.parts.arm1,beltArm=songi.userData.parts.arm0;
 const hand=swingArm.children[0],palm=beltArm.children[0];
 const restHand=hand.position.clone(),restPalm=palm.position.clone();
 const restHandRotation=hand.quaternion.clone(),restPalmRotation=palm.quaternion.clone();
 const restGrip=new T.Vector3(0,-.14,.04).applyQuaternion(hand.quaternion).add(hand.position);
 const bat=new T.Group();
 add(new T.CylinderGeometry(.115,.135,.54,12),mat('#705043'),0,0,0,bat);
 add(new T.CylinderGeometry(.25,.125,batTip-.26,12),mat('#c99361'),0,(batTip+.26)/2,0,bat);
 songi.add(bat);
 const axis=new T.Vector3(0,1,0),gripPoint=new T.Vector3(),direction=new T.Vector3();
 const reach=new T.Vector3(),handCenter=new T.Vector3();
 const idleGrip=new T.Vector3(.97,1.9,1.19),idleDirection=new T.Vector3(),idlePalm=new T.Vector3(-.94,1.74,1.24);
 const fromGrip=new T.Vector3(),fromDirection=new T.Vector3();
 let leftGrip=0,fromLeftGrip=0,transitionLength=joinLength,swingStartedAt=0,recoveringAt=null,queuedSwing=null;
 function sampleIdle(now){
  const beat=(now%1000)/1000;
  const lift=.38*T.MathUtils.smoothstep(beat,.48,.80)*(1-T.MathUtils.smoothstep(beat,.82,1));
  idleDirection.set(-Math.cos(lift),Math.sin(lift)+.045,.025).normalize();
 }
 function aimHand(arm,mesh,target){
  reach.subVectors(target,arm.position);
  mesh.position.copy(reach).multiplyScalar(.56);
  mesh.scale.y=reach.length()*.88/.68;
  mesh.quaternion.setFromUnitVectors(axis,reach.normalize());
 }
 function renderBatPose(){
  swingArm.rotation.set(0,0,0);beltArm.rotation.set(0,0,0);
  bat.position.copy(gripPoint);
  bat.quaternion.setFromUnitVectors(axis,direction);
  handCenter.copy(gripPoint).addScaledVector(direction,.13);
  aimHand(swingArm,hand,handCenter);
  handCenter.copy(gripPoint).addScaledVector(direction,-.13).lerp(idlePalm,1-leftGrip);
  aimHand(beltArm,palm,handCenter);
 }
 const championBelt=new T.Group(),beltStrap=mat('#24222d',.55),beltGold=mat('#f5cf58',.38),beltSilver=mat('#fff4c8',.32);
 add(new T.BoxGeometry(1.72,.42,.10),beltStrap,0,0,0,championBelt);
 add(new T.CylinderGeometry(.34,.34,.10,8),beltGold,0,0,.10,championBelt).rotation.x=Math.PI/2;
 add(new T.CylinderGeometry(.20,.20,.115,8),beltSilver,0,0,.16,championBelt).rotation.x=Math.PI/2;
 for(const x of [-.60,.60])add(new T.CylinderGeometry(.08,.08,.11,8),beltGold,x,0,.11,championBelt).rotation.x=Math.PI/2;
 championBelt.position.set(-.40,-.13,.31);championBelt.rotation.set(.08,0,-.28);championBelt.visible=false;beltArm.add(championBelt);
 const swingReach=6.6,trailSegments=40;
 const swingGrip=new T.Vector3(),swingDirection=new T.Vector3();
 function trailPoint(sweep,reach){
  sampleClassroomSwing(T.MathUtils.lerp(.34,.69,sweep),swingGrip,swingDirection);
  return swingGrip.addScaledVector(swingDirection,reach);
 }
 const trailGeometry=new T.BufferGeometry();
 const trailColors=new T.Float32BufferAttribute(new Float32Array((trailSegments+1)*8),4);
 const trailPoints=[],trailIndices=[];
 for(let i=0;i<=trailSegments;i++){
  for(const reach of [1.55,batTip])trailPoints.push(...trailPoint(i/trailSegments,reach).toArray());
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
 swingSweep.visible=false;
 songi.add(swingSweep);
 const glintCanvas=document.createElement('canvas');
 glintCanvas.width=glintCanvas.height=64;
 const glintContext=glintCanvas.getContext('2d');
 glintContext.fillStyle='#fff';
 glintContext.beginPath();
 for(const [x,y] of [[32,1],[39,25],[63,32],[39,39],[32,63],[25,39],[1,32],[25,25]])glintContext.lineTo(x,y);
 glintContext.closePath();glintContext.fill();
 const glintTexture=new T.CanvasTexture(glintCanvas);
 const glints=['#ffffff','#e5caff','#ffffff'].map(color=>{
  const glint=new T.Sprite(new T.SpriteMaterial({map:glintTexture,color,transparent:true,depthWrite:false}));
  glint.visible=false;songi.add(glint);
  return glint;
 });
 const tipGeometry=trailGeometry.clone();
 const tipPoints=tipGeometry.attributes.position,tipColors=tipGeometry.attributes.color;
 for(let i=0;i<=trailSegments;i++){
  for(const [edge,reach] of [batTip-.12,batTip].entries()){
   const point=trailPoint(i/trailSegments,reach);
   tipPoints.setXYZ(i*2+edge,point.x,point.y+.025,point.z);
  }
 }
 const tipTrail=new T.Mesh(tipGeometry,sweepMaterial);
 tipTrail.visible=false;songi.add(tipTrail);
 const hitStop=35,hitProgress=.58;
 let pendingHits=[],hitAt=0,releaseAt=0;
 const keys={},moveVector=new T.Vector2(),forward=new T.Vector3(),candidate=new T.Vector3(),raycaster=new T.Raycaster(),pointer=new T.Vector2(),cameraForward=new T.Vector3();let swingingUntil=0,joyPointer=null,canvasPress=null,mobileYaw=songi.rotation.y,mobilePitch=0;
 function resize(){const rect=game.getBoundingClientRect();renderer.setSize(rect.width,rect.height,false);camera.aspect=rect.width/rect.height;camera.updateProjectionMatrix()}addEventListener('resize',resize);resize();
 function canOccupy(x,z){if(Math.abs(x)>halfX-1.1||Math.abs(z)>halfZ-1.1)return false;return !obstacles.some(obstacle=>!obstacle.group.userData.destroyed&&Math.abs(x-obstacle.x)<obstacle.w+.78&&Math.abs(z-obstacle.z)<obstacle.d+.78)}
 function swing(target){
  if(won)return;
  const now=performance.now();
  if(now<swingingUntil){queuedSwing={target};return;}
  startSwing(target,now,joinLength);
 }
 function startSwing(target,now,join){
  fromGrip.copy(gripPoint);fromDirection.copy(direction);fromLeftGrip=leftGrip;
  transitionLength=join;swingStartedAt=now;recoveringAt=null;queuedSwing=null;
  swingingUntil=now+swingLength;releaseAt=0;
  swingCount++;
  if(swingCount===1)professorPhase='shaking';else if(swingCount>=3)professorPhase='running';
  if(target){const dx=target.x-songi.position.x,dz=target.z-songi.position.z;if(Math.hypot(dx,dz)>.2)songi.rotation.y=Math.atan2(dx,dz)}
  const facing=new T.Vector3(Math.sin(songi.rotation.y),0,Math.cos(songi.rotation.y));
  pendingHits=destructibles.filter(object=>{
   if(object.userData.destroyed)return false;
   const delta=object.position.clone().sub(songi.position);delta.y=0;
   return delta.length()<=swingReach&&facing.dot(delta.normalize())>=Math.cos(.72);
  });
  hitAt=now+downLength*hitProgress/downEnd;
  releaseAt=pendingHits.length?hitAt+hitStop:0;
  if(releaseAt)swingingUntil+=hitStop;
 }
 const professorDirection=new T.Vector3();
 function updateProfessor(now,dt){
  if(professorPhase==='waiting'||professorPhase==='gone')return;
  if(professorPhase==='shaking'){
   // Keep the professor upright: a tiny sideways shuffle and fine tremor read
   // as fear without the wide, fan-like body rotation.
   professor.position.x=professorStart.x+Math.sin(now*.022)*.06+Math.sin(now*.081)*.009;
   professor.position.z=professorStart.z+Math.cos(now*.067)*.006;
   return;
  }
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
 function checkVictory(now){
  if(won||!victoryTargets.every(object=>object.userData.destroyed))return;
  won=true;victoryStartedAt=now;status.hidden=false;status.textContent='강의실 파괴 성공!';hint.textContent='송이가 신나게 환호하고 있어요!';
  songi.rotation.y=0;back.hidden=true;
  const {x,y,z}=songi.position;
  camera.position.set(x,y+6.4,z+12);
  victoryLookTarget.set(x,y+2.05,z);camera.lookAt(victoryLookTarget);
  revealOnlyBlockingWall(camera.position,victoryLookTarget);
 }
 addEventListener('keydown',event=>{if(event.code==='Space'){event.preventDefault();if(!event.repeat)swing()}if(/Arrow|Key[WASD]/.test(event.code)){keys[event.code]=true;event.preventDefault()}});addEventListener('keyup',event=>keys[event.code]=false);
 canvas.addEventListener('pointerdown',event=>{canvasPress={x:event.clientX,y:event.clientY,lastX:event.clientX,lastY:event.clientY,dragged:false}});
 canvas.addEventListener('pointermove',event=>{if(!isMobile||!canvasPress)return;const dx=event.clientX-canvasPress.lastX,dy=event.clientY-canvasPress.lastY;if(Math.hypot(event.clientX-canvasPress.x,event.clientY-canvasPress.y)>8)canvasPress.dragged=true;if(canvasPress.dragged){mobileYaw-=dx*.008;mobilePitch=Math.max(-.28,Math.min(.45,mobilePitch-dy*.006));canvasPress.lastX=event.clientX;canvasPress.lastY=event.clientY}});
 canvas.addEventListener('pointerup',event=>{if(!isMobile||!canvasPress||canvasPress.dragged){canvasPress=null;return}const rect=canvas.getBoundingClientRect();pointer.set((event.clientX-rect.left)/rect.width*2-1,-(event.clientY-rect.top)/rect.height*2+1);raycaster.setFromCamera(pointer,camera);const hit=raycaster.intersectObjects(destructibles,true)[0];swing(hit?.point);canvasPress=null});
 joy.addEventListener('pointerdown',event=>{joyPointer=event.pointerId;joy.setPointerCapture(event.pointerId)});joy.addEventListener('pointermove',event=>{if(event.pointerId!==joyPointer)return;const rect=joy.getBoundingClientRect();let x=(event.clientX-(rect.left+rect.width/2))/42,z=(event.clientY-(rect.top+rect.height/2))/42;const length=Math.hypot(x,z);if(length>1){x/=length;z/=length}moveVector.set(x,z);stick.style.transform=`translate(${x*27}px,${z*27}px)`});['pointerup','pointercancel'].forEach(type=>joy.addEventListener(type,event=>{if(event.pointerId===joyPointer){joyPointer=null;moveVector.set(0,0);stick.style.transform=''}}));
 const clock=new T.Clock();function frame(){requestAnimationFrame(frame);const dt=Math.min(clock.getDelta(),.04),now=performance.now();
  const paused=releaseAt>now&&now>=hitAt;
  if(pendingHits.length&&now>=releaseAt){
   for(const object of pendingHits){
    object.userData.destroyed=true;object.userData.destroyedAt=now;
    impact(object.getWorldPosition(new T.Vector3()),object.userData.debrisColor,now);
   }
   shakeStrength=Math.min(.38,.14+pendingHits.length*.07);shakeUntil=now+260;
   pendingHits=[];
  }
  checkVictory(now);
  if(!won&&swingingUntil>0&&now>=swingingUntil&&queuedSwing){
   const {target}=queuedSwing;queuedSwing=null;
   startSwing(target,now,0);
  }
  const swingActive=!won&&now<swingingUntil;
  const celebrating=won&&now-victoryStartedAt<2000;
  if(won&&!celebrating&&!resultShown){resultShown=true;resultActions.style.display='flex';hint.hidden=true;joy.hidden=true;}
  let walking=false;
  if(!won&&!paused&&!swingActive&&isMobile&&moveVector.lengthSq()>.006){const dx=-Math.cos(mobileYaw)*moveVector.x-Math.sin(mobileYaw)*moveVector.y,dz=Math.sin(mobileYaw)*moveVector.x-Math.cos(mobileYaw)*moveVector.y;forward.set(dx,0,dz).normalize();songi.rotation.y=Math.atan2(forward.x,forward.z);candidate.copy(songi.position).addScaledVector(forward,dt*4.2);if(canOccupy(candidate.x,candidate.z)){songi.position.copy(candidate);walking=true}}
  if(!won&&!paused&&!swingActive&&!isMobile){const turn=(keys.KeyA||keys.ArrowLeft?1:0)-(keys.KeyD||keys.ArrowRight?1:0),drive=(keys.KeyW||keys.ArrowUp?1:0)-(keys.KeyS||keys.ArrowDown?1:0);songi.rotation.y+=turn*dt*2.5;if(Math.abs(drive)>.01){forward.set(Math.sin(songi.rotation.y),0,Math.cos(songi.rotation.y));candidate.copy(songi.position).addScaledVector(forward,drive*dt*4.2);if(canOccupy(candidate.x,candidate.z)){songi.position.copy(candidate);walking=true}}}
  songi.userData.animate?.(now/1000,celebrating?'win':'idle',0);const parts=songi.userData.parts,walkSwing=walking?Math.sin(now*.011)*.55:0;parts.arm0.rotation.x=parts.leg1.rotation.x=walkSwing;parts.arm1.rotation.x=parts.leg0.rotation.x=-walkSwing;
  const remainingPause=releaseAt?T.MathUtils.clamp(releaseAt-now,0,hitStop):0;
  const swingElapsed=T.MathUtils.clamp(swingLength-(swingingUntil-now-remainingPause),0,swingLength);
  const progress=swingElapsed<=downLength
   ?downEnd*swingElapsed/downLength
   :T.MathUtils.lerp(downEnd,1,(swingElapsed-downLength)/returnLength);
  const trailActive=swingActive&&progress>=.34&&progress<.80;
  swingSweep.visible=tipTrail.visible=trailActive;
  sampleIdle(now);
  if(swingActive){
   sampleClassroomSwing(progress,gripPoint,direction);
   const enter=transitionLength?T.MathUtils.smoothstep(now-swingStartedAt,0,transitionLength):1;
   gripPoint.lerp(fromGrip,1-enter);
   direction.lerp(fromDirection,1-enter).normalize();
   leftGrip=T.MathUtils.lerp(fromLeftGrip,1,enter);
   renderBatPose();
  }else if(!won){
   if(leftGrip===1&&recoveringAt===null)recoveringAt=now;
   const recovery=recoveringAt===null?1:T.MathUtils.smoothstep(now-recoveringAt,0,joinLength);
   sampleClassroomSwing(1,gripPoint,direction);
   gripPoint.lerp(idleGrip,recovery);
   direction.lerp(idleDirection,recovery).normalize();
   leftGrip=1-recovery;
   if(recovery>=1)recoveringAt=null;
   renderBatPose();
  }
  if(trailActive){
   const sweep=T.MathUtils.clamp((progress-.34)/.35,0,1);
   const fade=1-T.MathUtils.smoothstep(progress,.69,.80);
   for(let i=0;i<=trailSegments;i++){
    const behind=sweep-i/trailSegments;
    const alpha=T.MathUtils.smoothstep(behind,0,.075)*(1-T.MathUtils.smoothstep(behind,.09,.47))*fade;
    trailColors.setXYZW(i*2,1,1,1,alpha*.12);
    trailColors.setXYZW(i*2+1,1,1,1,alpha*.76);
    const tipAlpha=T.MathUtils.smoothstep(behind,0,.025)*(1-T.MathUtils.smoothstep(behind,.04,.21))*fade;
    tipColors.setXYZW(i*2,1,1,1,0);
    tipColors.setXYZW(i*2+1,1,1,1,tipAlpha);
   }
   trailColors.needsUpdate=tipColors.needsUpdate=true;
  }
  if(celebrating){
   const celebrationAge=now-victoryStartedAt,bounce=Math.max(0,Math.sin(celebrationAge*.022))*.62;
   songi.position.y=.05+bounce;championBelt.visible=true;
   swingArm.rotation.set(-.46,0,.78);beltArm.rotation.set(-.52,0,-.72);
   parts.leg0.rotation.x=.14;parts.leg1.rotation.x=-.14;

  }else{
   songi.position.y=.05;championBelt.visible=false;parts.arm0.rotation.z=parts.arm1.rotation.z=0;
  }
  if(won){
   hand.position.copy(restHand);palm.position.copy(restPalm);
   hand.quaternion.copy(restHandRotation);palm.quaternion.copy(restPalmRotation);
   hand.scale.y=palm.scale.y=1;
   bat.position.copy(restGrip).applyQuaternion(swingArm.quaternion).add(swingArm.position);
   bat.quaternion.setFromUnitVectors(axis,direction.set(1,.35,.24).normalize());
  }
  const glintAge=(now-swingingUntil+returnLength)/1000;
  glints.forEach((glint,i)=>{
   const age=glintAge-i*.024;
   glint.visible=swingingUntil>0&&age>0&&age<.21;
   if(!glint.visible)return;
   const fade=Math.sin(Math.PI*age/.21);
   glint.material.opacity=fade;
   glint.material.rotation=i*.45+age*4;
   glint.position.set(-1.8-i*.29-age*1.3,1.7+i*.18+age*.8,1.7+i*.22);
   glint.scale.setScalar((.32-i*.055)*fade);
  });
  for(const object of destructibles)if(object.userData.destroyed){const age=(now-object.userData.destroyedAt)/1000;object.rotation.z+=dt*7;object.position.y=Math.max(-1.4,object.position.y-dt*5);object.scale.setScalar(Math.max(.1,1-age*.7));}updateProfessor(now,dt);updateImpacts(now,dt);
  if(!won){
   if(camera.fov!==48){camera.fov=48;camera.updateProjectionMatrix()}
   const yaw=isMobile?mobileYaw:songi.rotation.y;cameraForward.set(Math.sin(yaw),0,Math.cos(yaw));camera.position.copy(songi.position).addScaledVector(cameraForward,-17);camera.position.y+=21;const shake=Math.max(0,(shakeUntil-now)/260)*shakeStrength;if(shake){camera.position.x+=Math.sin(now*.19)*shake;camera.position.y+=Math.cos(now*.27)*shake*.7;camera.position.z+=Math.sin(now*.31)*shake*.5}camera.lookAt(songi.position.x,songi.position.y+6.2+mobilePitch*14,songi.position.z);
  }
  renderer.render(scene,camera);
 }frame();
}
