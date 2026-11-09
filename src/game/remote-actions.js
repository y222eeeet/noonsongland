import * as T from 'three';

// Each remote avatar owns its props and materials so teardown stays local.
export function createRemoteActions(avatar, scene) {
 const cigarette=new T.Group();
 const paper=new T.MeshStandardMaterial({color:'#f7eee2'});
 const ember=new T.MeshStandardMaterial({color:'#ff8d5c',emissive:'#ff4f37'});
 const stick=new T.Mesh(new T.CylinderGeometry(.045,.045,.55,10),paper);
 stick.rotation.x=Math.PI/2;cigarette.add(stick);
 const tip=new T.Mesh(new T.SphereGeometry(.048,8,6),ember);tip.position.z=.28;cigarette.add(tip);
 avatar.add(cigarette);cigarette.visible=false;
 const cloud=new T.Group();scene.add(cloud);cloud.visible=false;
 const material=new T.MeshStandardMaterial({color:'#f8efff',transparent:true,opacity:0,depthWrite:false});
 for(let i=0;i<16;i++){const puff=new T.Mesh(new T.SphereGeometry(.22+(i%3)*.05,10,8),material);cloud.add(puff)}
 let event=null,started=0,duration=0,smoking=false;
 const sigh=new T.Group(),sighMaterial=new T.MeshStandardMaterial({color:'#f8efff',transparent:true,opacity:.58,roughness:.35,depthWrite:false});
 const initial=[[0,0,0,.24],[.13,.22,.02,.3],[-.08,.48,0,.36],[.12,.73,.01,.28]];
 for(let i=0;i<16;i++){const [x,y,z,r]=initial[i%4];const puff=new T.Mesh(new T.SphereGeometry(i<4?r:.24,16,12),sighMaterial);if(i<4)puff.position.set(x,y,z);else{puff.position.set(Math.sin(i*2.4)*.24,.15+(i%6)*.18,Math.cos(i*1.7)*.16);puff.scale.setScalar(1+(i%3)*.2)}sigh.add(puff)}
 scene.add(sigh);sigh.visible=false;
 let sighEvent=-1,sighStarted=0,sighData;
 function update(s,now,elapsed,dt){
  const smoke=s.smoking===true,phase=smoke?s.smokePhase:s.action;
  cigarette.visible=smoke;
  const lift=smoke&&phase==='inhale';
  cigarette.position.set(lift?.26:.8,lift?2.62:1.65,.95);
  stick.scale.y=Math.max(.2,Math.min(1,s.smokeBurn??1));
  ember.emissiveIntensity=lift?1.8:.1;
  if(smoke){avatar.userData.parts.arm0.rotation.x=lift?-1.3:-.5;avatar.userData.parts.arm0.rotation.z=-.25;}
  else if(smoking)avatar.userData.parts.arm0.rotation.z=0;
  smoking=smoke;
  const action=phase==='inhale'?'inhale':phase==='exhale'?'exhale':'idle';
  const held=Math.max(0,Math.min(120,s.held+(action==='inhale'?elapsed:0)));
  avatar.userData.animate(now/1000,action,held);
  // Retain the release timeline across idle packets and animate every frame.
  if(s.sighEvent>0&&Number.isFinite(s.sighAge)&&s.sighVisual?.origin?.length===3&&s.sighVisual.origin.every(Number.isFinite)){
   if(s.sighEvent!==sighEvent){sighEvent=s.sighEvent;sighStarted=now-(Math.max(0,s.sighAge)+elapsed)*1000;}
   sighData=s.sighVisual;
  }
  const sighAge=(now-sighStarted)/1000;
  sigh.visible=!!sighData&&s.sighEvent>0&&sighAge>=0&&sighAge<5;
  if(sigh.visible){const profile=sighData.profile;const angle=sighData.rotation;
   sigh.position.fromArray(sighData.origin);sigh.position.x+=Math.sin(angle)*sighAge*.18+Math.sin(sighAge*4)*.06;sigh.position.z+=Math.cos(angle)*sighAge*.18;sigh.position.y+=sighAge*1.7;
   sigh.scale.setScalar(profile.scale*(1+sighAge*.42));sigh.rotation.y=sighAge*.24;sighMaterial.opacity=profile.opacity*(1-sighAge/5);sigh.children.forEach((p,i)=>p.visible=i<profile.count);
  }
  if(!smoke){const puff=action==='inhale'?Math.min(held/20,.22):sighData&&s.sighEvent>0?sighData.puff*Math.max(0,1-sighAge/.7):0;avatar.scale.setScalar(1+puff);avatar.rotation.z=action==='inhale'&&held>=20?Math.sin(now/1000*76)*.028:0;}
  const id=smoke?s.smokeEvent:undefined;
  const age=smoke?s.smokeAge:undefined;
  if(Number.isFinite(id)&&id>0&&Number.isFinite(age)&&id!==event){
   event=id;started=now-Math.max(0,age)*1000;duration=smoke?4:5;
   cloud.position.copy(avatar.position);cloud.position.y+=2.65;
   cloud.position.x+=Math.sin(s.rotation)*.95;cloud.position.z+=Math.cos(s.rotation)*.95;
   cloud.userData.smoke=smoke;cloud.userData.rotation=s.rotation;
  }
  const life=(now-started)/1000;cloud.visible=event!==null&&life>=0&&life<duration;
  if(cloud.visible){const smokeCloud=cloud.userData.smoke;cloud.position.y+=dt*(smokeCloud?.65:1.3);cloud.position.x+=Math.sin(cloud.userData.rotation)*dt*.25;cloud.position.z+=Math.cos(cloud.userData.rotation)*dt*.25;material.color.set(smokeCloud?'#ece7f5':'#f8efff');material.opacity=.5*(1-life/duration);cloud.children.forEach((p,i)=>{p.position.set(Math.sin(i*2.4)*(.15+life*.15),(i%5)*.13,Math.cos(i*1.7)*.18);p.scale.setScalar(.6+life*.45)});}
 }
 function dispose(){scene.remove(cloud,sigh);sigh.children.forEach(p=>p.geometry.dispose());sighMaterial.dispose();cloud.children.forEach(p=>p.geometry.dispose());material.dispose();}
 return {update,dispose};
}
