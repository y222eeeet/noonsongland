import * as T from 'three';
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
 const halfX=22,halfZ=17;
 add(new T.BoxGeometry(halfX*2+1,.35,halfZ*2+1),floorMat,0,-.2,0);add(new T.BoxGeometry(halfX*2+1,9,.35),cream,0,4.3,halfZ);add(new T.BoxGeometry(.35,9,halfZ*2+1),wall,-halfX,4.3,0);add(new T.BoxGeometry(.35,9,halfZ*2+1),wall,halfX,4.3,0);
 add(new T.BoxGeometry(2.3,5.2,.18),wood,17.8,2.45,-halfZ+.24);
 const destructibles=[],obstacles=[];
 function destructible(group,bounds){group.userData.destroyed=false;destructibles.push(group);obstacles.push({group,...bounds});return group}
 function wallPanel(x,z,width){const panel=destructible(new T.Group(),{x,z,w:width/2,d:.35});panel.position.set(x,0,z);scene.add(panel);add(new T.BoxGeometry(width,9,.35),cream,0,4.3,0,panel);return panel}
 wallPanel(-14,-halfZ,12);wallPanel(0,-halfZ,12);wallPanel(14,-halfZ,12);wallPanel(0,halfZ,halfX*2+1);
 const board=destructible(new T.Group(),{x:0,z:-halfZ+.42,w:5.3,d:.4});board.position.set(0,0,-halfZ+.24);scene.add(board);add(new T.BoxGeometry(10.2,3.4,.16),boardMat,0,5.35,0,board);add(new T.BoxGeometry(10.8,.22,.45),wood,0,3.62,-.31,board);
 function desk(x,z){
  const table=destructible(new T.Group(),{x,z,w:1.45,d:1.0});table.position.set(x,0,z);scene.add(table);add(new T.BoxGeometry(2.25,.22,1.35),wood,0,1.52,0,table);for(const sx of [-.86,.86])for(const sz of [-.48,.48])add(new T.BoxGeometry(.15,1.45,.15),wood,sx,.73,sz,table);
  const chair=destructible(new T.Group(),{x,z:z+2.0,w:.72,d:.72});chair.position.set(x,0,z+2);scene.add(chair);add(new T.BoxGeometry(.95,.18,.78),chairMat,0,.83,0,chair);add(new T.BoxGeometry(.95,.95,.13),chairMat,0,1.28,.34,chair);for(const sx of [-.32,.32])for(const sz of [-.25,.25])add(new T.BoxGeometry(.12,.78,.12),wood,sx,.4,sz,chair);
 }
 // Two wide columns keep the centre aisle open. A chair belongs to its desk's
 // blocked footprint, while the gap before the next row stays walkable.
 for(const z of [-9,0,9])for(const x of [-11,11])desk(x,z);
 const podium=destructible(new T.Group(),{x:0,z:-13.4,w:2.25,d:1.25});podium.position.set(0,0,-13.4);scene.add(podium);add(new T.BoxGeometry(4.1,1.65,1.85),wood,0,.82,0,podium);add(new T.BoxGeometry(4.35,.2,2.05),cream,0,1.73,0,podium);
 const professor=new T.Group(),professorTarget=new T.Vector3(17.25,0,-15.3);professor.position.set(0,.05,-11.35);professor.rotation.y=Math.PI;scene.add(professor);add(new T.CylinderGeometry(.42,.58,1.75,12),mat('#655873'),0,1.1,0,professor);add(new T.SphereGeometry(.52,14,10),mat('#fff0df'),0,2.28,.05,professor);add(new T.SphereGeometry(.10,8,6),mat('#57486f'),-.18,2.34,.48,professor);add(new T.SphereGeometry(.10,8,6),mat('#57486f'),.18,2.34,.48,professor);add(new T.BoxGeometry(.78,.13,.12),mat('#45394f'),0,2.28,.54,professor);for(const side of [-1,1])add(new T.CapsuleGeometry(.12,.62,5,8),mat('#fff0df'),side*.53,1.35,0,professor).rotation.z=side*.18;
 let swingCount=0,professorPhase='waiting',won=false;
 const songi=createSongi();songi.position.set(0,.05,14);songi.rotation.y=Math.PI;scene.add(songi);songi.userData.animate?.(0,'idle',0);
 // The bat's pivot is attached to Song-i's right arm, so walking and swing
 // poses move the hand and bat as a single object.
 const bat=new T.Group(),batWood=mat('#a77558'),batGrip=mat('#765046');add(new T.CylinderGeometry(.16,.30,2.6,10),batWood,0,1.1,0,bat);add(new T.CylinderGeometry(.12,.15,.5,10),batGrip,0,-.42,0,bat);bat.rotation.set(.18,0,-1.05);bat.position.set(.26,-.30,.06);songi.userData.parts.arm1.add(bat);
 const keys={},moveVector=new T.Vector2(),forward=new T.Vector3(),candidate=new T.Vector3(),raycaster=new T.Raycaster(),pointer=new T.Vector2(),cameraForward=new T.Vector3();let swingingUntil=0,joyPointer=null,canvasPress=null,mobileYaw=songi.rotation.y,mobilePitch=0;
 function resize(){const rect=game.getBoundingClientRect();renderer.setSize(rect.width,rect.height,false);camera.aspect=rect.width/rect.height;camera.updateProjectionMatrix()}addEventListener('resize',resize);resize();
 function canOccupy(x,z){if(Math.abs(x)>halfX-1.1||Math.abs(z)>halfZ-1.1)return false;return !obstacles.some(obstacle=>!obstacle.group.userData.destroyed&&Math.abs(x-obstacle.x)<obstacle.w+.78&&Math.abs(z-obstacle.z)<obstacle.d+.78)}
 function swing(target){
  const now=performance.now();if(now<swingingUntil||won)return;swingingUntil=now+310;swingCount++;
  if(swingCount===1)professorPhase='shaking';else if(swingCount>=3)professorPhase='running';
  if(target){const dx=target.x-songi.position.x,dz=target.z-songi.position.z;if(Math.hypot(dx,dz)>.2)songi.rotation.y=Math.atan2(dx,dz)}
  const facing=new T.Vector3(Math.sin(songi.rotation.y),0,Math.cos(songi.rotation.y));
  for(const object of destructibles){if(object.userData.destroyed)continue;const delta=object.position.clone().sub(songi.position);delta.y=0;const distance=delta.length();if(distance>4.4)continue;delta.normalize();if(facing.dot(delta)<Math.cos(.72))continue;object.userData.destroyed=true;object.userData.destroyedAt=now;}
 }
 function updateProfessor(now,dt){
  if(professorPhase==='waiting')return;
  if(professorPhase==='shaking'){professor.rotation.z=Math.sin(now*.035)*.075;return}
  professor.rotation.z=0;const delta=professorTarget.clone().sub(professor.position);delta.y=0;if(delta.length()<.45){professor.visible=false;professorPhase='gone';return}delta.normalize();professor.position.addScaledVector(delta,dt*7.5);professor.rotation.y=Math.atan2(delta.x,delta.z);
 }
 function checkVictory(){if(won||!destructibles.every(object=>object.userData.destroyed))return;won=true;status.hidden=false;status.textContent='강의실 파괴 성공!';hint.textContent='송이가 신나게 환호하고 있어요!'}
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
  const phase=Math.max(0,Math.min(1,(swingingUntil-now+310)/310)),swingAmount=Math.sin((1-phase)*Math.PI);if(swingAmount>0){parts.arm1.rotation.x=-1.45*swingAmount;parts.arm1.rotation.z=-.62*swingAmount;bat.rotation.set(.18+.34*swingAmount,0,-1.05+.32*swingAmount)}else{parts.arm1.rotation.z=0;bat.rotation.set(.18,0,-1.05)}
  for(const object of destructibles)if(object.userData.destroyed){const age=(now-object.userData.destroyedAt)/1000;object.rotation.z+=dt*7;object.position.y=Math.max(-1.4,object.position.y-dt*5);object.scale.setScalar(Math.max(.1,1-age*.7));}updateProfessor(now,dt);
  const yaw=isMobile?mobileYaw:songi.rotation.y;cameraForward.set(Math.sin(yaw),0,Math.cos(yaw));camera.position.copy(songi.position).addScaledVector(cameraForward,-17);camera.position.y+=21;camera.lookAt(songi.position.x,songi.position.y+6.2+mobilePitch*14,songi.position.z);renderer.render(scene,camera);
 }frame();
}
