// First-person smoke needs a stream of separate puffs, not one enlarged blob.
export function prepareSmokeExhale(group,seconds){
 const amount=Math.min(1,Math.max(0,seconds/6));
 while(group.children.length<24)group.add(group.children[0].clone());
 const count=3+Math.round(amount*21),emission=.15+amount*1.8;
 group.children.forEach((puff,i)=>{
  if(!puff.userData.ownSmokeMaterial){puff.material=puff.material.clone();puff.userData.ownSmokeMaterial=true;}
  puff.visible=false;puff.userData.delay=i/(count-1)*emission;
 });
 group.userData.exhale={count,emission,duration:emission+1.6,radius:.16+amount*.22};
 return group.userData.exhale;
}
export function updateSmokeExhale(group,age){
 const p=group.userData.exhale;group.scale.setScalar(1);
 group.children.forEach((puff,i)=>{
  const life=age-puff.userData.delay;puff.visible=i<p.count&&life>=0&&life<1.6;
  if(!puff.visible)return;
  puff.position.set(Math.sin(i*2.4)*(.12+life*.16),life*.75,life*.45);
  puff.scale.setScalar(p.radius/.23*(.45+life*.7));
  puff.material.opacity=(.25+.18*(p.count/24))*(1-life/1.6);
 });
}
