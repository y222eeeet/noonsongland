import * as T from 'three';
import { supabase } from '../lib/supabase.js';
import { createSongi } from '../models/songi.js';
import { createRemoteActions } from './remote-actions.js';

// Ephemeral movement is broadcast, never written to the database.
export function createMultiplayer(scene, readState, surfaceHeight, bounds, localAvatar) {
 const peers=new Map(), connectionId=crypto.randomUUID();
 let ownLabel, ownName;
 let lastAction='';
 let channel, identity, ready=false, lastSend=0, sequence=0, retryAt=0;
 function remove(id){const peer=peers.get(id);if(!peer)return;peer.effects.dispose();scene.remove(peer.mesh);const geometries=new Set(),materials=new Set();peer.mesh.traverse(o=>{if(o.geometry)geometries.add(o.geometry);if(o.material)(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>materials.add(m))});geometries.forEach(g=>g.dispose());materials.forEach(m=>{m.map?.dispose();m.dispose()});peers.delete(id)}
 function createPeer(id){if(peers.has(id)||peers.size>=100)return peers.get(id);const mesh=createSongi();mesh.visible=false;scene.add(mesh);const peer={mesh,effects:createRemoteActions(mesh,scene),seq:-1,last:0,state:null,missingSince:0};peers.set(id,peer);return peer}
 function label(name){const canvas=document.createElement('canvas');canvas.width=512;canvas.height=128;const ctx=canvas.getContext('2d');ctx.font='bold 30px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.lineJoin='round';ctx.lineWidth=9;ctx.strokeStyle='#fffaf4';ctx.strokeText(name,256,64);ctx.fillStyle='#5f5473';ctx.fillText(name,256,64);const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;const sprite=new T.Sprite(new T.SpriteMaterial({map:texture,transparent:true,depthTest:false}));sprite.position.y=5.45;sprite.scale.set(3.5,.875,1);return sprite}
 function sync(){if(!channel||!ready)return;const members=new Map();for(const entries of Object.values(channel.presenceState()))for(const m of entries)if(typeof m.connectionId==='string'&&typeof m.userId==='string'&&typeof m.name==='string')members.set(m.connectionId,m);
  const now=performance.now();for(const [id,peer] of peers)if(!members.has(id)){peer.missingSince??=now;if(now-peer.missingSince>60000)remove(id)}else peer.missingSince=0;
  for(const [id] of members)if(id!==connectionId)createPeer(id)
  for(const [id,m] of members)if(id!==connectionId&&m.state)receive(m.state);

 }
 function receive(s){if(!ready||!s||s.connectionId===connectionId)return;
  if(![s.x,s.z,s.rotation,s.held].every(Number.isFinite)||s.x<bounds.minX||s.x>bounds.maxX||s.z<bounds.minZ||s.z>bounds.maxZ||!['idle','inhale','exhale'].includes(s.action))return;const peer=createPeer(s.connectionId);if(!peer||!Number.isSafeInteger(s.seq)||s.seq<=peer.seq)return;
  peer.seq=s.seq;peer.last=performance.now();peer.state={...s,held:Math.max(0,Math.min(s.held,120))};if(!peer.mesh.visible)peer.mesh.position.set(s.x,surfaceHeight(s.x,s.z)+.07,s.z);peer.mesh.visible=true;
 }
 async function connect(player){identity=player;ready=false;const old=channel;channel=null;if(old)await supabase.removeChannel(old);if(identity!==player)return;
  const current=supabase.channel('campus:main:v1',{config:{private:true,presence:{key:connectionId},broadcast:{self:false}}});channel=current;
  current.on('presence',{event:'sync'},sync).on('broadcast',{event:'state'},({payload})=>receive(payload));
  current.subscribe(async state=>{if(channel!==current)return;if(state==='SUBSCRIBED'){ready=true;const result=await current.track({connectionId,userId:player.id,name:player.displayName,state:{...readState(),connectionId,seq:++sequence}});if(result!=='ok'){ready=false;retryAt=performance.now()+5000;return}sync();lastSend=0;}else if(['CHANNEL_ERROR','TIMED_OUT','CLOSED'].includes(state)){ready=false;retryAt=performance.now()+5000;}});
 }
 function update(dt,now){const player=window.noonsongPlayer;
  if(localAvatar&&player&&ownName!==player.displayName){if(ownLabel){localAvatar.remove(ownLabel);ownLabel.material.map.dispose();ownLabel.material.dispose()}ownName=player.displayName;ownLabel=label(ownName.slice(0,24));localAvatar.add(ownLabel);}
if(supabase&&player&&(!identity||player.id!==identity.id))void connect(player);
  if(identity&&!ready&&retryAt&&now>=retryAt){retryAt=0;void connect(identity)}
  if(ready&&!document.hidden){const state=readState();const action=JSON.stringify([state.action,state.sighEvent,state.smoking,state.smokePhase,state.smokeEvent]);if(now-lastSend>=100||action!==lastAction){lastSend=now;lastAction=action;void channel.send({type:'broadcast',event:'state',payload:{...state,connectionId,seq:++sequence}})}}
  for(const peer of peers.values()){if(!peer.state){peer.mesh.visible=false;continue}const s=peer.state,m=peer.mesh,alpha=1-Math.exp(-dt*14);m.position.x+=(s.x-m.position.x)*alpha;m.position.z+=(s.z-m.position.z)*alpha;m.position.y=surfaceHeight(m.position.x,m.position.z)+.07;m.rotation.y+=Math.atan2(Math.sin(s.rotation-m.rotation.y),Math.cos(s.rotation-m.rotation.y))*alpha;const held=s.held+(s.action==='inhale'?(now-peer.last)/1000:0);m.scale.setScalar(1+(s.action==='inhale'?Math.min(held/20,.22):s.action==='exhale'?.15:0));const swing=s.walking&&now-peer.last<2000?Math.sin(now/100)*.7:0;const parts=m.userData.parts;parts.arm0.rotation.x=parts.leg1.rotation.x=swing;parts.arm1.rotation.x=parts.leg0.rotation.x=-swing;peer.effects.update(s,now,(now-peer.last)/1000,dt);}
 }
 // Keep a snapshot available even when another tab is in the background.
 const heartbeat=setInterval(()=>{if(!ready||!channel)return;const state={...readState(),connectionId,seq:++sequence};void channel.send({type:'broadcast',event:'state',payload:state});void channel.track({connectionId,userId:identity.id,name:identity.displayName,state});},1000);
 function dispose(){if(ownLabel){localAvatar.remove(ownLabel);ownLabel.material.map.dispose();ownLabel.material.dispose()}identity=null;ready=false;if(channel)void supabase.removeChannel(channel);channel=null;for(const id of peers.keys())remove(id);clearInterval(heartbeat);window.removeEventListener('pagehide',dispose)}
 window.addEventListener('pagehide',dispose,{once:true});
 return {update,dispose};
}
