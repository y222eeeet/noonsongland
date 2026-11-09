import * as T from 'three';
import { createCloudBed } from '../models/cloud-bed.js';

const isDaytime=timestamp=>{const hour=new Date(timestamp).getHours();return hour>=6&&hour<18};

export function createSkyRealm(scene){
 const root=new T.Group();root.position.y=52;scene.add(root);
 const cloudMaterial=new T.MeshStandardMaterial({color:'#fff8f3',roughness:.9});
 const shadeMaterial=new T.MeshStandardMaterial({color:'#ded5f5',roughness:.88});
 const lavender=new T.MeshStandardMaterial({color:'#bda7e3',roughness:.88});
 const worldBaseMaterial=new T.MeshBasicMaterial({color:'#e7edf8'});
 // The sky realm is intentionally soft and weightless: no ground or object shadows.
 const add=(parent,geometry,material,position)=>{const mesh=new T.Mesh(geometry,material);mesh.position.set(...position);mesh.castShadow=false;mesh.receiveShadow=false;parent.add(mesh);return mesh};
 function puff(parent,x,y,z,scale=1,material=cloudMaterial){const mesh=add(parent,new T.SphereGeometry(.9,16,12),material,[x,y,z]);mesh.scale.set(1.25*scale,.7*scale,scale);return mesh}

 // A sealed, oversized cloud layer keeps the campus below from ever showing
 // through gaps in the decorative cloud puffs: this is a separate sky world.
 const worldBase=new T.Mesh(new T.CircleGeometry(180,64),worldBaseMaterial);
 worldBase.rotation.x=-Math.PI/2;worldBase.position.y=-3.1;worldBase.castShadow=worldBase.receiveShadow=false;root.add(worldBase);

 // Overlapping round lobes: staggered, varied and deep enough to hide all gaps.
 // Instancing keeps the denser cloud carpet to two draw calls.
 const cloudGeometry=new T.SphereGeometry(1,20,14),cloudTransform=new T.Object3D();
 for(const layer of [{step:2.5,y:-1.30,r:2.05},{step:1.55,y:-.65,r:1.35}]){
  const lobes=[];
  for(let row=0,z=-12;z<=12;row++,z+=layer.step)for(let col=0,x=-14;x<=14;col++,x+=layer.step){
   const seed=row*19.17+col*7.31,v=(Math.sin(seed)+1)/2;
   lobes.push({x:x+(row%2)*layer.step*.5+Math.sin(seed*2.3)*.28,z:z+Math.cos(seed*1.7)*.26,y:layer.y+Math.sin(seed*1.3)*.08,r:layer.r*(.88+v*.22),v});
  }
  const carpet=new T.InstancedMesh(cloudGeometry,cloudMaterial,lobes.length);carpet.name='cloud-carpet';
  const color=new T.Color();
  lobes.forEach((lobe,i)=>{cloudTransform.position.set(lobe.x,lobe.y,lobe.z);cloudTransform.scale.set(lobe.r,lobe.r*(.78+lobe.v*.08),lobe.r*(.92+lobe.v*.12));cloudTransform.updateMatrix();carpet.setMatrixAt(i,cloudTransform.matrix);color.copy(cloudMaterial.color).lerp(shadeMaterial.color,lobe.v*.12);carpet.setColorAt(i,color)});
  carpet.castShadow=carpet.receiveShadow=false;root.add(carpet);
 }
 const rim=new T.Mesh(new T.TorusGeometry(15.2,.18,10,48),lavender);rim.rotation.x=Math.PI/2;rim.position.y=-.15;root.add(rim);

 const beds=[];
 const starPalettes=[['#efaccd','#f6dc8e'],['#efaccd','#baa0e4'],['#87ace5','#b4e3f6'],['#b4ddcd','#f6dc8e'],['#baa0e4','#b4e3f6']];
 starPalettes.forEach((colors,i)=>{const x=(i-2)*5.1,z=-2;const bed=createCloudBed(colors);bed.position.set(x,.65,z);root.add(bed);beds.push({x,z,worldY:root.position.y+.65})});

 const sun=new T.Group();sun.position.set(-13,15,-19);root.add(sun);add(sun,new T.SphereGeometry(2.2,20,16),new T.MeshStandardMaterial({color:'#ffe6a1',emissive:'#ffd36a',emissiveIntensity:1}),[0,0,0]);const sunLight=new T.PointLight('#ffe4a1',8,40,2);sun.add(sunLight);
 const starGroup=new T.Group();root.add(starGroup);for(let i=0;i<90;i++){const x=-25+(i*37%50),y=5+(i*17%23),z=-28+(i*29%20);const star=add(starGroup,new T.SphereGeometry(.045+(i%3)*.025,7,6),new T.MeshBasicMaterial({color:'#fff5cb'}),[x,y,z]);star.userData.phase=i*.71}
 const moon=add(starGroup,new T.SphereGeometry(1.35,16,12),new T.MeshBasicMaterial({color:'#fff3dc'}),[13,16,-22]);

 const portal=new T.Group();portal.position.set(0,12.45,-16.8);scene.add(portal);
 const portalGlow=new T.MeshStandardMaterial({color:'#fff8f3',emissive:'#d8c8ff',emissiveIntensity:.52,roughness:.75});
 [[0,0,0,1.35],[-1.05,-.08,.1,.9],[1.05,-.08,.1,.9],[-.35,.65,.06,.78],[.45,.64,.04,.83]].forEach(([x,y,z,s])=>puff(portal,x,y,z,s,portalGlow));
 const ring=add(portal,new T.TorusGeometry(1.65,.075,10,32),lavender,[0,.25,-.15]);ring.rotation.x=Math.PI/2;const beacon=new T.PointLight('#e9ddff',4,8,2);beacon.position.y=1.2;portal.add(beacon);
 portal.traverse(object=>object.userData.skyPortal=true);

 let lastTheme='';
 function update(timestamp){const day=isDaytime(timestamp);const theme=day?'day':'night';if(theme!==lastTheme){lastTheme=theme;sun.visible=day;starGroup.visible=!day;worldBaseMaterial.color.set(day?'#e7edf8':'#151a35')}if(starGroup.visible)starGroup.children.forEach(star=>{if(star.userData.phase!==undefined)star.scale.setScalar(.72+.45*Math.sin(timestamp*.002+star.userData.phase))});ring.rotation.z+=.004;portal.position.y=12.45+Math.sin(timestamp*.0014)*.12}
 return {root,portal,beds,floorY:52.18,update,enter(){portal.visible=false},leave(){portal.visible=true}};
}
