import * as T from 'three';
import { createCloudBed } from '../models/cloud-bed.js';

const isDaytime=timestamp=>{const hour=new Date(timestamp).getHours();return hour>=6&&hour<18};

export function createSkyRealm(scene){
 const root=new T.Group();root.position.y=52;scene.add(root);
 const cloudMaterial=new T.MeshStandardMaterial({color:'#fff8f3',roughness:.9});
 const shadeMaterial=new T.MeshStandardMaterial({color:'#ded5f5',roughness:.88});
 const lavender=new T.MeshStandardMaterial({color:'#bda7e3',roughness:.88});
 const worldBaseMaterial=new T.MeshBasicMaterial({color:'#e7edf8'});
 const skyMaterial=new T.MeshBasicMaterial({color:'#aee2ff',side:T.BackSide});
 // The sky realm is intentionally soft and weightless: no ground or object shadows.
 const add=(parent,geometry,material,position)=>{const mesh=new T.Mesh(geometry,material);mesh.position.set(...position);mesh.castShadow=false;mesh.receiveShadow=false;parent.add(mesh);return mesh};
 function puff(parent,x,y,z,scale=1,material=cloudMaterial){const mesh=add(parent,new T.SphereGeometry(.9,16,12),material,[x,y,z]);mesh.scale.set(1.25*scale,.7*scale,scale);return mesh}

 // A sealed, oversized cloud layer keeps the campus below from ever showing
 // through gaps in the decorative cloud puffs: this is a separate sky world.
 const worldBase=new T.Mesh(new T.CircleGeometry(180,64),worldBaseMaterial);
 worldBase.rotation.x=-Math.PI/2;worldBase.position.y=-3.1;worldBase.castShadow=worldBase.receiveShadow=false;root.add(worldBase);
 // A separate sky dome makes this feel like its own world, rather than a view
 // onto the campus sky. It changes independently with the sky-realm theme.
 const skyDome=new T.Mesh(new T.SphereGeometry(82,32,20),skyMaterial);
 skyDome.position.y=24;skyDome.castShadow=skyDome.receiveShadow=false;root.add(skyDome);

 // Overlapping round lobes: staggered, varied and deep enough to hide all gaps.
 // Instancing keeps the denser cloud carpet to two draw calls.
 const cloudGeometry=new T.SphereGeometry(1,20,14),cloudTransform=new T.Object3D();
 for(const layer of [{step:2.7,y:-1.30,r:2.18},{step:1.7,y:-.65,r:1.42}]){
  const lobes=[];
  for(let row=0,z=-24;z<=24;row++,z+=layer.step)for(let col=0,x=-27;x<=27;col++,x+=layer.step){
   const seed=row*19.17+col*7.31,v=(Math.sin(seed)+1)/2;
   lobes.push({x:x+(row%2)*layer.step*.5+Math.sin(seed*2.3)*.28,z:z+Math.cos(seed*1.7)*.26,y:layer.y+Math.sin(seed*1.3)*.08,r:layer.r*(.88+v*.22),v});
  }
  const carpet=new T.InstancedMesh(cloudGeometry,cloudMaterial,lobes.length);carpet.name='cloud-carpet';
  const color=new T.Color();
  lobes.forEach((lobe,i)=>{cloudTransform.position.set(lobe.x,lobe.y,lobe.z);cloudTransform.scale.set(lobe.r,lobe.r*(.78+lobe.v*.08),lobe.r*(.92+lobe.v*.12));cloudTransform.updateMatrix();carpet.setMatrixAt(i,cloudTransform.matrix);color.copy(cloudMaterial.color).lerp(shadeMaterial.color,lobe.v*.12);carpet.setColorAt(i,color)});
  carpet.castShadow=carpet.receiveShadow=false;root.add(carpet);
 }
 const rim=new T.Mesh(new T.TorusGeometry(30,.18,10,64),lavender);rim.rotation.x=Math.PI/2;rim.position.y=-.15;root.add(rim);

 const beds=[];
 const starPalettes=[['#efaccd','#f6dc8e'],['#efaccd','#baa0e4'],['#87ace5','#b4e3f6'],['#b4ddcd','#f6dc8e'],['#baa0e4','#b4e3f6']];
 for(let row=0;row<5;row++)for(let col=0;col<6;col++){
  const i=row*6+col,seed=i*5.713+row*2.19,x=(col-2.5)*4.35+Math.sin(seed)*.34,z=(row-2)*4.85+Math.cos(seed*1.37)*.38;
  const bed=createCloudBed(starPalettes[i%starPalettes.length]);
  // A small deterministic offset removes the rigid grid, while keeping every
  // pillow generally pointed toward the same calm, northern direction.
  bed.position.set(x,.65,z);bed.rotation.y=Math.sin(seed*1.91)*.10;root.add(bed);
  beds.push({x,z,worldY:root.position.y+.65,rotationY:bed.rotation.y});
 }
 const bedOrder=[];for(let row=0;row<5;row++)bedOrder.push(...[2,1,3,0,4,5].map(column=>row*6+column));

 const dayGroup=new T.Group();root.add(dayGroup);
 const sun=new T.Group();sun.position.set(-13,15,-19);dayGroup.add(sun);add(sun,new T.SphereGeometry(2.2,20,16),new T.MeshStandardMaterial({color:'#fff0ac',emissive:'#ffd36a',emissiveIntensity:1.25}),[0,0,0]);const sunLight=new T.PointLight('#ffe7a5',15,58,2);sun.add(sunLight);
 const rainbow=new T.Group();rainbow.position.set(0,4,-31);dayGroup.add(rainbow);
 const rainbowColors=['#f5a9b9','#f6ca91','#f7e9a0','#b9dfa9','#acd9ee','#c7b4e8'];
 rainbowColors.forEach((color,index)=>{const radius=15.2-index*.58,points=[];for(let step=0;step<=24;step++){const angle=Math.PI*.14+(Math.PI*.72*step/24);points.push(new T.Vector3(Math.cos(angle)*radius,Math.sin(angle)*radius,0))}const arc=new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(points),24,.105,6,false),new T.MeshBasicMaterial({color,transparent:true,opacity:.33}));arc.castShadow=arc.receiveShadow=false;rainbow.add(arc)});
 const starGroup=new T.Group();root.add(starGroup);for(let i=0;i<90;i++){const x=-25+(i*37%50),y=5+(i*17%23),z=-28+(i*29%20);const star=add(starGroup,new T.SphereGeometry(.045+(i%3)*.025,7,6),new T.MeshBasicMaterial({color:'#fff5cb'}),[x,y,z]);star.userData.phase=i*.71}
 const moon=add(starGroup,new T.SphereGeometry(1.35,16,12),new T.MeshBasicMaterial({color:'#fff3dc'}),[13,16,-22]);

 const portal=new T.Group();portal.position.set(0,12.45,-16.8);scene.add(portal);
 const portalGlow=new T.MeshStandardMaterial({color:'#fff8f3',emissive:'#d8c8ff',emissiveIntensity:.52,roughness:.75});
 [[0,0,0,1.35],[-1.05,-.08,.1,.9],[1.05,-.08,.1,.9],[-.35,.65,.06,.78],[.45,.64,.04,.83]].forEach(([x,y,z,s])=>puff(portal,x,y,z,s,portalGlow));
 const ring=add(portal,new T.TorusGeometry(1.65,.075,10,32),lavender,[0,.25,-.15]);ring.rotation.x=Math.PI/2;const beacon=new T.PointLight('#e9ddff',4,8,2);beacon.position.y=1.2;portal.add(beacon);
 portal.traverse(object=>object.userData.skyPortal=true);

 let lastTheme='';
 function update(timestamp){const day=isDaytime(timestamp);const theme=day?'day':'night';if(theme!==lastTheme){lastTheme=theme;dayGroup.visible=day;starGroup.visible=!day;worldBaseMaterial.color.set(day?'#f2f7ff':'#151a35');skyMaterial.color.set(day?'#aee2ff':'#10162f')}if(starGroup.visible)starGroup.children.forEach(star=>{if(star.userData.phase!==undefined)star.scale.setScalar(.72+.45*Math.sin(timestamp*.002+star.userData.phase))});ring.rotation.z+=.004;portal.position.y=12.45+Math.sin(timestamp*.0014)*.12}
 return {root,portal,beds,bedOrder,floorY:52.18,update,enter(){portal.visible=false},leave(){portal.visible=true}};
}
