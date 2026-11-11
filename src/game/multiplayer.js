import * as T from 'three';
import { supabase } from '../lib/supabase.js';
import { createSongi, applyBenchPose } from '../models/songi.js';
import { createRemoteActions } from './remote-actions.js';
import { SKY_ROLL_ZONE, getSkyRollFrame } from './sky-realm.js';
import { orbitFrame } from './swim-orbit.js';

// Ephemeral movement and social interactions are broadcast, never written to the database.
export function createMultiplayer(scene, readState, surfaceHeight, bounds, localAvatar, canStartSocial=()=>true, canPlace=()=>true) {
 const sourceReadState=readState;
 readState=()=>({...sourceReadState(),skyMotion:localAvatar.userData.skyMotion,skyPose:localAvatar.userData.skyPose||'idle',skyBedIndex:Number.isInteger(localAvatar.userData.skyBedIndex)?localAvatar.userData.skyBedIndex:-1,skyRollStartedAt:Number.isFinite(localAvatar.userData.skyRollStartedAt)?localAvatar.userData.skyRollStartedAt:0});
 const peers=new Map(),connectionId=crypto.randomUUID(),selfMatchActions=createRemoteActions(localAvatar,scene);
 const runtime=scene.userData.matchRuntime||{},renderer=runtime.renderer,camera=runtime.camera,game=runtime.game;
 const raycaster=new T.Raycaster(),pointer=new T.Vector2(),midpoint=new T.Vector3(),toward=new T.Vector3(),cameraOffset=new T.Vector3(),rollCenter=new T.Vector3(),rollOffset=new T.Vector3();
 let ownLabel,ownName,localMatchTag,remoteMatchTag,taggedPartnerId,lastAction='',lastPosition,sending=false,disposed=false,lastSentSighEvent=-1;
 let channel,channelRealm='',identity,ready=false,lastSend=0,sequence=0,retryAt=0;
 let selectedPeerId='',pendingRequest=null,matdam=null,endSent=false;
 const queued=[];

 const requestButton=document.createElement('button');
 requestButton.type='button';requestButton.hidden=true;requestButton.textContent='맞담 신청';
 requestButton.style.cssText="position:absolute;z-index:12;left:50%;bottom:max(26px,env(safe-area-inset-bottom));transform:translateX(-50%);padding:13px 19px;border:2px solid #fff;border-radius:999px;background:#9a7dac;color:#fff;font:800 15px ui-rounded,'Apple SD Gothic Neo',sans-serif;box-shadow:0 8px 24px #392e4444";
 const modal=document.createElement('div');
 modal.style.cssText='position:absolute;z-index:13;inset:0;display:none;place-items:center;padding:24px;background:#443b5755;backdrop-filter:blur(3px)';
 const dialog=document.createElement('div');
 dialog.style.cssText="width:min(100%,310px);padding:25px 22px;border:1px solid #fff;border-radius:24px;background:#fffaf8;color:#5f5473;box-shadow:0 16px 44px #29203555;text-align:center;font-family:ui-rounded,'Apple SD Gothic Neo',sans-serif";
 modal.append(dialog);game?.append(requestButton,modal);
 const toast=document.createElement('div');
 toast.hidden=true;toast.style.cssText="position:absolute;z-index:14;left:50%;bottom:max(95px,calc(env(safe-area-inset-bottom) + 74px));transform:translateX(-50%);padding:11px 15px;border-radius:999px;background:#55515bcc;color:#fff;font:700 13px ui-rounded,'Apple SD Gothic Neo',sans-serif;white-space:nowrap";game?.append(toast);
 let toastTimer;
 function showToast(message){toast.textContent=message;toast.hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.hidden=true,2600)}
 function closeModal(){modal.style.display='none';pendingRequest=null}

 function reconnect(current){if(disposed||channel!==current)return;ready=false;retryAt=performance.now()+5000}
 async function broadcast(event='state',payload,important=false,fullState=false){
  const current=channel;if(!ready||!current)return false;
  if(sending){if(important)queued.push({event,payload});return false}
  sending=true;lastSend=performance.now();
  const state=payload??{...readState(),connectionId,seq:++sequence};
  // Origin/profile data remains constant throughout one sigh. Send it with the
  // event (and when a newly joined peer asks for a full snapshot), not in every
  // 30Hz movement packet.
  if(event==='state'&&!fullState&&state.sighEvent===lastSentSighEvent)delete state.sighVisual;
  else if(event==='state')lastSentSighEvent=state.sighEvent;
  try{const result=await current.send({type:'broadcast',event,payload:state});if(result!=='ok')reconnect(current);return result==='ok'}catch{reconnect(current);return false}finally{sending=false;const next=queued.shift();if(next)void broadcast(next.event,next.payload,true)}
 }
 function sendTargeted(event,to,extra={}){return broadcast(event,{to,from:connectionId,...extra},true)}
 function remove(id){const peer=peers.get(id);if(!peer)return;peer.effects.dispose();scene.remove(peer.mesh);const geometries=new Set(),materials=new Set();peer.mesh.traverse(o=>{if(o.geometry)geometries.add(o.geometry);if(o.material)(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>materials.add(m))});geometries.forEach(g=>{if(!g.userData.sharedSongiGeometry)g.dispose()});materials.forEach(m=>{m.map?.dispose();m.dispose()});peers.delete(id);if(selectedPeerId===id){selectedPeerId='';requestButton.hidden=true}if(matdam?.partnerId===id)endMatdamView()}
 function createPeer(id){
  if(peers.has(id)||peers.size>=100)return peers.get(id);
  const mesh=createSongi();mesh.visible=false;
  // Only the local Song-i needs a dynamic shadow. Remote shadows multiply the
  // directional-light pass for every connected player without helping gameplay.
  mesh.traverse(part=>{if(part.isMesh){part.castShadow=false;part.receiveShadow=false}});
  scene.add(mesh);
  const peer={mesh,effects:createRemoteActions(mesh,scene),seq:-1,last:0,state:null,groundX:NaN,groundZ:NaN,groundY:0,groundRealm:''};
  const applyPose=()=>{
   const state=peer.state;
   if(state?.realm==='sky'&&state.skyPose==='roll'){
    const frame=getSkyRollFrame(state.skyRollStartedAt),travel=4.6,direction=[1,-1,-1,1][frame.leg],start=[0,travel,0,-travel][frame.leg],end=[travel,0,-travel,0][frame.leg],progress=frame.progress;
    mesh.rotation.set(-Math.PI/2,0,0);mesh.rotateY(direction*progress*Math.PI*2);
    rollCenter.set(SKY_ROLL_ZONE.x+start+(end-start)*progress,surfaceHeight(SKY_ROLL_ZONE.x,SKY_ROLL_ZONE.z,'sky')+.72,SKY_ROLL_ZONE.z);
    mesh.position.copy(rollCenter).sub(rollOffset.set(0,2.25,0).applyQuaternion(mesh.quaternion))
   }else if(state?.realm==='sky'&&state.skyPose==='transition'&&Number.isFinite(state.skyMotion?.y)&&Number.isFinite(state.skyMotion?.pitch)){
    mesh.position.y=Math.max(50,Math.min(58,state.skyMotion.y));mesh.rotation.x=Math.max(-Math.PI/2,Math.min(0,state.skyMotion.pitch));mesh.rotation.z=0
   }else if(state?.realm==='sky'&&state.skyPose==='sleep'){
    mesh.position.y=Number.isFinite(state.skyMotion?.y)?Math.max(50,Math.min(58,state.skyMotion.y)):surfaceHeight(mesh.position.x,mesh.position.z,'sky')+.84;mesh.rotation.x=-Math.PI/2;mesh.rotation.z=0
   }else if(state?.swimming){
    const enteredAt=Number.isFinite(state.swimEnteredAt)?state.swimEnteredAt:Date.now();
    const dive=Math.min(1,Math.max(0,(Date.now()-enteredAt)/620)),ease=dive*dive*(3-2*dive);
    const frame=orbitFrame(state);
    mesh.position.set(frame.x,.18-.38*ease,frame.z);
    mesh.rotation.set(-Math.PI/2*(.30+.70*ease),0,frame.roll);
    const parts=mesh.userData.parts;parts.arm0.rotation.x=.34;parts.arm1.rotation.x=-.34;parts.leg0.rotation.x=.72;parts.leg1.rotation.x=.72;
   }else{mesh.rotation.x=0;mesh.rotation.z=0}
  };
  peer.applyPose=applyPose;peers.set(id,peer);return peer
 }
 function label(name){const canvas=document.createElement('canvas');canvas.width=768;canvas.height=192;const ctx=canvas.getContext('2d');ctx.font='bold 44px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.lineJoin='round';ctx.lineWidth=12;ctx.strokeStyle='#fffaf4';ctx.strokeText(name,384,96);ctx.fillStyle='#5f5473';ctx.fillText(name,384,96);const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;const sprite=new T.Sprite(new T.SpriteMaterial({map:texture,transparent:true,depthTest:false}));sprite.center.set(.5,0);sprite.position.y=5.45;sprite.scale.set(4.8,1.2,1);return sprite}
 function matchTag(text,fill){const canvas=document.createElement('canvas');canvas.width=768;canvas.height=192;const ctx=canvas.getContext('2d');ctx.font='800 48px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.lineJoin='round';ctx.lineWidth=13;ctx.strokeStyle='#fffaf4';ctx.strokeText(text,384,96);ctx.fillStyle=fill;ctx.fillText(text,384,96);const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;const sprite=new T.Sprite(new T.SpriteMaterial({map:texture,transparent:true,depthTest:false}));sprite.center.set(.5,1);sprite.position.y=.42;sprite.scale.set(3.9,.98,1);return sprite}
 function disposeTag(parent,tag){if(!tag)return;parent.remove(tag);tag.material.map.dispose();tag.material.dispose()}
 function clearMatchTags(){disposeTag(localAvatar,localMatchTag);const peer=taggedPartnerId&&peers.get(taggedPartnerId);if(peer)disposeTag(peer.mesh,remoteMatchTag);localMatchTag=remoteMatchTag=undefined;taggedPartnerId=undefined;if(ownLabel)ownLabel.visible=true}
 function endMatdamView(){matdam=null;clearMatchTags();selfMatchActions.hide();localAvatar.visible=!readState().smoking}
 function updateMatchTags(){if(!matdam){clearMatchTags();return}const peer=peers.get(matdam.partnerId);if(!peer?.mesh)return;if(taggedPartnerId!==matdam.partnerId){clearMatchTags();taggedPartnerId=matdam.partnerId;localMatchTag=matchTag('나','#8f6db0');remoteMatchTag=matchTag(peer.name||'상대','#5f5473');localAvatar.add(localMatchTag);peer.mesh.add(remoteMatchTag)}if(ownLabel)ownLabel.visible=false}
 function sync(){if(!channel||!ready)return;const members=new Map();for(const entries of Object.values(channel.presenceState()))for(const m of entries)if(typeof m.connectionId==='string'&&typeof m.userId==='string'&&typeof m.name==='string')members.set(m.connectionId,m);const now=performance.now();for(const [id,peer] of peers)if(!members.has(id)&&peer.last>0&&now-peer.last>120000)remove(id);for(const [id,m] of members)if(id!==connectionId){const peer=createPeer(id);if(peer)peer.name=m.name}for(const [id,m] of members)if(id!==connectionId&&m.state)receive(m.state)}
 function receive(s){if(!ready||!s||s.connectionId===connectionId)return;if(![s.x,s.z,s.rotation,s.held].every(Number.isFinite)||s.x<bounds.minX||s.x>bounds.maxX||s.z<bounds.minZ||s.z>bounds.maxZ||!['idle','inhale','exhale'].includes(s.action))return;const peer=createPeer(s.connectionId);if(!peer||!Number.isSafeInteger(s.seq)||s.seq<=peer.seq)return;peer.seq=s.seq;peer.last=performance.now();peer.state={...peer.state,...s,realm:s.realm==='sky'?'sky':'campus',held:Math.max(0,Math.min(s.held,120))};if(!peer.mesh.visible)peer.mesh.position.set(s.x,surfaceHeight(s.x,s.z,s.realm)+.07,s.z);peer.mesh.visible=true}
 function beginMatdam(partnerId){matdam={partnerId};endSent=false;requestButton.hidden=true;localAvatar.visible=true;updateMatchTags()}
 function isLevelMatchPosition(anchor,position){if(!anchor||!position||![anchor.x,anchor.z,position.x,position.z].every(Number.isFinite))return false;if(position.x<bounds.minX||position.x>bounds.maxX||position.z<bounds.minZ||position.z>bounds.maxZ)return false;return Math.abs(surfaceHeight(anchor.x,anchor.z)-surfaceHeight(position.x,position.z))<=1.12}
 function findMatchPosition(anchor,forward){const side={x:-forward.z,z:forward.x},directions=[forward,side,{x:-side.x,z:-side.z},{x:-forward.x,z:-forward.z}];for(const direction of directions)for(const distance of [3.25,2.7,2.15]){const target={x:anchor.x+direction.x*distance,z:anchor.z+direction.z*distance};if(isLevelMatchPosition(anchor,target)&&canPlace(target.x,target.z,anchor))return target}return null}
 function alignLocal(position,rotation,anchor){if(!isLevelMatchPosition(anchor,position))return false;localAvatar.position.set(position.x,surfaceHeight(position.x,position.z)+.07,position.z);localAvatar.rotation.y=rotation;localAvatar.userData.groundY=localAvatar.position.y;return true}
 function face(from,to){return Math.atan2(to.x-from.x,to.z-from.z)}
 function receiveRequest(payload){if(payload?.to!==connectionId||!payload.from||!canStartSocial())return;pendingRequest=payload;const peer=peers.get(payload.from);const name=peer?.name||'다른 송이';dialog.innerHTML=`<div style="font-size:27px">🚬</div><h2 style="margin:10px 0 7px;font-size:20px">누군가 맞담을 신청했어요</h2><p style="margin:0 0 19px;font-size:14px;line-height:1.5">${name}님과 함께 담타할까요?</p><div style="display:flex;gap:9px"><button data-action="decline" style="flex:1;padding:11px;border:0;border-radius:13px;background:#e5e1e8;color:#625b68;font:800 14px inherit">거절</button><button data-action="accept" style="flex:1;padding:11px;border:0;border-radius:13px;background:#a98ad0;color:#fff;font:800 14px inherit">수락</button></div>`;modal.style.display='grid'}
 function acceptRequest(){if(!pendingRequest||!canStartSocial())return;const from=pendingRequest.from;const forward=new T.Vector3(Math.sin(localAvatar.rotation.y),0,Math.cos(localAvatar.rotation.y));const anchor={x:localAvatar.position.x,z:localAvatar.position.z},target=findMatchPosition(anchor,forward);if(!target){closeModal();showToast('여기서는 맞담을 할 수 없어요.');return}const targetRotation=face(target,anchor);const peer=peers.get(from);if(peer){peer.mesh.position.set(target.x,surfaceHeight(target.x,target.z)+.07,target.z);peer.mesh.rotation.y=targetRotation}window.startSongiMatdam?.();beginMatdam(from);void sendTargeted('matdam-accept',from,{anchor,target,rotation:targetRotation});closeModal()}
 dialog.addEventListener('click',event=>{const action=event.target.closest('button')?.dataset.action;if(action==='decline'&&pendingRequest){void sendTargeted('matdam-decline',pendingRequest.from);closeModal()}if(action==='accept')acceptRequest()});
 function handleAccept(payload){if(payload?.to!==connectionId||!payload.from||!payload.target||!payload.anchor||!canStartSocial())return;const target=payload.target,anchor=payload.anchor;if(!isLevelMatchPosition(anchor,target))return;if(!alignLocal(target,Number.isFinite(payload.rotation)?payload.rotation:face(target,anchor),anchor))return;window.startSongiMatdam?.();beginMatdam(payload.from);void broadcast()}
 function handleEnd(payload){if(payload?.to===connectionId&&matdam?.partnerId===payload.from){endMatdamView();showToast('맞담이 끝났어요.')}}
 function selectPeer(event){if(!canStartSocial()||!camera||!renderer||modal.style.display!=='none'){requestButton.hidden=true;return}const rect=renderer.domElement.getBoundingClientRect();pointer.x=((event.clientX-rect.left)/rect.width)*2-1;pointer.y=-((event.clientY-rect.top)/rect.height)*2+1;raycaster.setFromCamera(pointer,camera);let best;for(const [id,peer] of peers){if(!peer.mesh.visible||!peer.state?.smoking)continue;const hit=raycaster.intersectObject(peer.mesh,true)[0];if(hit&&(!best||hit.distance<best.distance))best={id,distance:hit.distance}}if(best){selectedPeerId=best.id;requestButton.hidden=false}else{selectedPeerId='';requestButton.hidden=true}}
 renderer?.domElement.addEventListener('pointerup',selectPeer);
 requestButton.addEventListener('click',()=>{const peer=peers.get(selectedPeerId);if(!peer?.state?.smoking){requestButton.hidden=true;return}void sendTargeted('matdam-request',selectedPeerId);requestButton.hidden=true;showToast('맞담 신청을 보냈어요.')});
 if(renderer&&camera){const baseRender=renderer.render.bind(renderer);renderer.render=(activeScene,activeCamera)=>{const peer=matdam&&peers.get(matdam.partnerId);const matched=Boolean(peer?.mesh?.visible&&readState().smoking);scene.userData.matdamCamera=matched;if(matched){midpoint.copy(localAvatar.position).add(peer.mesh.position).multiplyScalar(.5);toward.copy(peer.mesh.position).sub(localAvatar.position);toward.y=0;if(toward.lengthSq()>.01){toward.normalize();cameraOffset.set(toward.z,0,-toward.x).multiplyScalar(8.7);activeCamera.position.copy(midpoint).add(cameraOffset);activeCamera.position.y=midpoint.y+4.1;activeCamera.lookAt(midpoint.x,midpoint.y+2.15,midpoint.z)}}baseRender(activeScene,activeCamera);scene.userData.matdamCamera=false}}
 async function connect(player){identity=player;ready=false;const old=channel;channel=null;channelRealm='';if(old)await supabase.removeChannel(old);if(identity!==player)return;const current=supabase.channel('campus:main:v1',{config:{private:true,presence:{key:connectionId},broadcast:{self:false,ack:false}}});channel=current;channelRealm='main';current.on('presence',{event:'sync'},sync).on('broadcast',{event:'state'},({payload})=>receive(payload)).on('broadcast',{event:'request-state'},()=>{lastSend=0;void broadcast('state',undefined,false,true)}).on('broadcast',{event:'matdam-request'},({payload})=>receiveRequest(payload)).on('broadcast',{event:'matdam-accept'},({payload})=>handleAccept(payload)).on('broadcast',{event:'matdam-decline'},({payload})=>{if(payload?.to===connectionId)showToast('혼자 있고 싶대요.')}).on('broadcast',{event:'matdam-end'},({payload})=>handleEnd(payload)).on('system',{},message=>{if(message.status==='error')reconnect(current)});current.subscribe(async state=>{if(channel!==current||disposed)return;if(state==='SUBSCRIBED'){retryAt=0;ready=true;const result=await current.track({connectionId,userId:player.id,name:player.displayName,state:{...readState(),connectionId,seq:++sequence}});if(channel!==current)return;if(result!=='ok'){reconnect(current);return}sync();lastSend=0;void broadcast('request-state',{connectionId});}else if(['CHANNEL_ERROR','TIMED_OUT','CLOSED'].includes(state))reconnect(current)})}
 function update(dt,now){
  const player=window.noonsongPlayer;
  if(localAvatar&&player&&ownName!==player.displayName){if(ownLabel){scene.remove(ownLabel);ownLabel.material.map.dispose();ownLabel.material.dispose()}ownName=player.displayName;ownLabel=label(ownName.slice(0,24));scene.add(ownLabel)}
  if(supabase&&player&&(!identity||player.id!==identity.id))void connect(player);
  if(identity&&!ready&&retryAt&&now>=retryAt){retryAt=0;void connect(identity)}
  const state=readState();
  // The shared channel keeps currently-open production clients compatible.
  // Realm filtering below still ensures campus and sky avatars never render
  // into each other's world.
  if(ownLabel){ownLabel.scale.set(4.8,1.2,1);ownLabel.position.copy(localAvatar.position);ownLabel.position.y+=5.45}
  if(matdam&&!state.smoking){if(!endSent){endSent=true;void sendTargeted('matdam-end',matdam.partnerId)}endMatdamView();localAvatar.visible=true}
  if(matdam&&state.smoking)selfMatchActions.update(state,now,0,dt);else selfMatchActions.hide();
  updateMatchTags();
  if(ready&&!document.hidden){
   const action=JSON.stringify([state.realm,state.walking,state.action,state.sighEvent,state.smoking,state.smokePhase,state.smokeEvent,state.swimming,state.swimEnteredAt,state.swimOrbitAngle,state.swimDirection]);
   const moving=!lastPosition||Math.hypot(state.x-lastPosition.x,state.z-lastPosition.z)>.001||Math.abs(state.rotation-lastPosition.rotation)>.001;
   // Keep the original 30Hz movement stream: this is the quality floor for
   // nearby Song-i movement and interaction animation.
   const interval=moving||state.walking||state.action!=='idle'||state.smoking||state.swimming?(1000/30):500;
   if(!sending&&(now-lastSend>=interval||action!==lastAction)){lastAction=action;lastPosition={x:state.x,z:state.z,rotation:state.rotation};void broadcast()}
  }
  const alpha=1-Math.exp(-dt*60);
  for(const peer of peers.values()){
   if(!peer.state){peer.mesh.visible=false;peer.effects.hide();continue}
   const s=now-peer.last>2000?{...peer.state,walking:false,action:'idle',smoking:false,swimming:false,held:0}:peer.state,m=peer.mesh;
   const matched=matdam?.partnerId===s.connectionId,dx=s.x-localAvatar.position.x,dz=s.z-localAvatar.position.z,distanceSq=dx*dx+dz*dz;
   // Keep remote state, but do not draw avatars from another world or beyond
   // the local visual neighbourhood. They restore immediately on approach.
   if((s.realm!==state.realm&&!matched)||distanceSq>68*68&&!matched){m.visible=false;peer.effects.hide();continue}
   m.visible=true;
   m.position.x+=(s.x-m.position.x)*alpha;m.position.z+=(s.z-m.position.z)*alpha;
   if(peer.groundRealm!==s.realm||Math.abs(m.position.x-peer.groundX)>.025||Math.abs(m.position.z-peer.groundZ)>.025){peer.groundX=m.position.x;peer.groundZ=m.position.z;peer.groundRealm=s.realm;peer.groundY=surfaceHeight(m.position.x,m.position.z,s.realm)+.07}
   m.position.y=peer.groundY;
   m.rotation.y+=Math.atan2(Math.sin(s.rotation-m.rotation.y),Math.cos(s.rotation-m.rotation.y))*alpha;
   const held=s.held+(s.action==='inhale'?(now-peer.last)/1000:0);
   m.scale.setScalar(1+(s.action==='inhale'?Math.min(held/20,.22):s.action==='exhale'?.15:0));
   const swing=(s.walking||s.skyMotion?.walk===true)&&now-peer.last<2000?Math.sin(now/100)*.7:0,parts=m.userData.parts;
   parts.arm0.rotation.x=parts.leg1.rotation.x=swing;parts.arm1.rotation.x=parts.leg0.rotation.x=-swing;
   peer.effects.update(s,now,(now-peer.last)/1000,dt);peer.applyPose();
  }
 }
 function updateBenchAvatars(){for(const peer of peers.values()){const seatY=peer.state?.seatedY;if(peer.mesh.visible&&peer.state?.seatedBench&&Number.isFinite(seatY))applyBenchPose(peer.mesh,seatY)}}
 function occupiedSkyBeds(count=Infinity){const occupied=new Set();for(const peer of peers.values()){const state=peer.state;if(state?.realm==='sky'&&['sleep','transition'].includes(state.skyPose)&&Number.isInteger(state.skyBedIndex)&&state.skyBedIndex>=0&&state.skyBedIndex<count)occupied.add(state.skyBedIndex)}return occupied}
 function occupiedBenches(){const occupied=new Set();for(const peer of peers.values()){const id=peer.state?.seatedBench;if(typeof id==='string'&&id)occupied.add(id)}return occupied}
 function activeSwimmers(){const now=performance.now();return [...peers.values()].filter(peer=>peer.state?.swimming&&now-peer.last<5000).map(peer=>peer.state)}
 const heartbeat=setInterval(()=>{const now=performance.now();if(identity&&!ready&&retryAt&&now>=retryAt){retryAt=0;void connect(identity)}else if(ready&&now-lastSend>=1000)void broadcast()},1000);
 function dispose(){disposed=true;requestButton.remove();modal.remove();toast.remove();clearMatchTags();selfMatchActions.dispose();if(ownLabel){scene.remove(ownLabel);ownLabel.material.map.dispose();ownLabel.material.dispose()}identity=null;ready=false;if(channel)void supabase.removeChannel(channel);channel=null;for(const id of peers.keys())remove(id);clearInterval(heartbeat);window.removeEventListener('pagehide',dispose)}
 window.addEventListener('pagehide',dispose,{once:true});
 return {update:(dt,now)=>{update(dt,now);updateBenchAvatars()},dispose,occupiedSkyBeds,occupiedBenches,activeSwimmers,toast:showToast,flush:()=>{lastAction='';void broadcast()}};
}
