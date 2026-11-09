export function exhaleProfile(seconds){
 const amount=Math.max(0,Math.min(1,seconds/20));
 return {count:4+Math.round(amount*12),scale:1+amount*.85,opacity:.42+amount*.22};
}
export function prepareExhale(group,seconds){
 if(group.children.length===4){
  const template=group.children[0];
  for(let i=4;i<16;i++){
   const puff=template.clone();puff.position.set(Math.sin(i*2.4)*.24,.15+(i%6)*.18,Math.cos(i*1.7)*.16);puff.scale.setScalar(1+(i%3)*.2);group.add(puff);
  }
 }
 const profile=exhaleProfile(seconds);group.userData.exhale=profile;
 group.children.forEach((puff,i)=>puff.visible=i<profile.count);
 return profile;
}
