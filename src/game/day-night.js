import * as T from 'three';

// Korean local time, independent of the browser's configured timezone.
export function daylightAt(timestamp){
  const seconds=((timestamp/1000+9*3600)%86400+86400)%86400;
  const smooth=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t);};
  if(seconds<21600||seconds>=64860)return 0;
  if(seconds<21660)return smooth((seconds-21600)/60);
  if(seconds<64800)return 1;
  return 1-smooth((seconds-64800)/60);
}

export function createDayNight(scene,sun,windowMaterial){
  const hemi=scene.children.find(o=>o.isHemisphereLight);
  const skyNight=new T.Color('#181d3b'),skyDay=new T.Color('#cdeaff');
  const lightNight=new T.Color('#9daee8'),lightDay=new T.Color('#fff3d9');
  const ambientNight=new T.Color('#a3b2e5'),ambientDay=new T.Color('#fff8ee');
  const floorNight=new T.Color('#45546a'),floorDay=new T.Color('#8ab998');
  const windows=new Set([windowMaterial]),bronzes=new Set();
  scene.traverse(o=>{if(o.isMesh){const mats=Array.isArray(o.material)?o.material:[o.material];for(const m of mats){if(m.userData?.campusWindow)windows.add(m);if(m.userData?.nightBronze)bronzes.add(m);}}});
  const bulbs=[];scene.traverse(o=>{if(o.isMesh&&o.material?.emissiveIntensity>.1)bulbs.push(o.material);});
  const lamps=[];
  scene.traverse(o=>{if(o.isPointLight&&o.userData.campusLamp)lamps.push(o)});
  const vertices=[];
  for(let i=0;i<160;i++)vertices.push(-110+(i*73%170),44+(i*17%31),-100+(i*47%150));
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(vertices,3));
  const stars=new T.Points(g,new T.PointsMaterial({color:'#eee8ff',size:.13,transparent:true,opacity:0,depthWrite:false}));scene.add(stars);
  const status=document.querySelector('#sigh-status');
  const labelNight=new T.Color('#fff1db'),labelDay=new T.Color('#5f5473');
  const labelColor=new T.Color();
  return timestamp=>{
    const day=daylightAt(timestamp),night=1-day;
    if(status){
      labelColor.copy(labelNight).lerp(labelDay,day);
      status.style.color='#'+labelColor.getHexString();
      status.style.textShadow=night>.2?'0 2px 5px #000, 0 0 12px #000b':'none';
    }
    scene.background.copy(skyNight).lerp(skyDay,day);
    if(scene.fog)scene.fog.color.copy(scene.background);
    sun.color.copy(lightNight).lerp(lightDay,day);sun.intensity=.25+2.55*day;
    if(hemi){hemi.color.copy(ambientNight).lerp(ambientDay,day);hemi.groundColor.copy(floorNight).lerp(floorDay,day);hemi.intensity=.65+1.55*day;}
    for(const m of windows){m.emissive.set('#ffd49b');m.emissiveIntensity=night*.55;}
    for(const m of bronzes){m.emissiveIntensity=night*.28;m.metalness=.45-night*.15;}
    bulbs.forEach(m=>m.emissiveIntensity=.08+.8*night);
    lamps.forEach(l=>l.intensity=night*13);
    stars.material.opacity=night*.8;stars.visible=night>.01;
  };
}
