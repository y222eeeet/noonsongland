import * as T from 'three';

const isDaytime=timestamp=>{const hour=new Date(timestamp).getHours();return hour>=6&&hour<18};

export function createSkyRealm(scene){
 const root=new T.Group();root.position.y=52;scene.add(root);
 const cloudMaterial=new T.MeshStandardMaterial({color:'#fff8f3',roughness:.9});
 const shadeMaterial=new T.MeshStandardMaterial({color:'#ded5f5',roughness:.88});
 const lavender=new T.MeshStandardMaterial({color:'#bda7e3',roughness:.88});
 const add=(parent,geometry,material,position)=>{const mesh=new T.Mesh(geometry,material);mesh.position.set(...position);mesh.castShadow=mesh.receiveShadow=true;parent.add(mesh);return mesh};
 function puff(parent,x,y,z,scale=1,material=cloudMaterial){const mesh=add(parent,new T.SphereGeometry(.9,16,12),material,[x,y,z]);mesh.scale.set(1.25*scale,.7*scale,scale);return mesh}

 // Soft, continuous cloud floor that reads as a place to lie down rather than a platform.
 for(let x=-14;x<=14;x+=2.2)for(let z=-12;z<=12;z+=2.1){const edge=Math.max(Math.abs(x)/14,Math.abs(z)/12);puff(root,x,.05+Math.sin(x*2+z)*.08,z,1.25-edge*.22,edge>.78?shadeMaterial:cloudMaterial)}
 const rim=new T.Mesh(new T.TorusGeometry(15.2,.18,10,48),lavender);rim.rotation.x=Math.PI/2;rim.position.y=-.15;root.add(rim);

 const beds=[];
 function makeBed(x,z){const bed=new T.Group();bed.position.set(x,.65,z);root.add(bed);add(bed,new T.CapsuleGeometry(1.15,2.25,8,16),cloudMaterial,[0,0,0]).rotation.z=Math.PI/2;[-1.3,-.55,.2,.95,1.55].forEach((n,i)=>puff(bed,n,.1+(i%2)*.18,(i%2?-.25:.22),.62,i===0?shadeMaterial:cloudMaterial));const tag=add(bed,new T.TorusGeometry(.72,.055,8,24),lavender,[0,.18,0]);tag.rotation.x=Math.PI/2;beds.push({x,z,worldY:root.position.y+.65})}
 makeBed(-8,-3);makeBed(0,5);makeBed(8,-2);

 const sun=new T.Group();sun.position.set(-13,15,-19);root.add(sun);add(sun,new T.SphereGeometry(2.2,20,16),new T.MeshStandardMaterial({color:'#ffe6a1',emissive:'#ffd36a',emissiveIntensity:1}),[0,0,0]);const sunLight=new T.PointLight('#ffe4a1',8,40,2);sun.add(sunLight);
 const starGroup=new T.Group();root.add(starGroup);for(let i=0;i<90;i++){const x=-25+(i*37%50),y=5+(i*17%23),z=-28+(i*29%20);const star=add(starGroup,new T.SphereGeometry(.045+(i%3)*.025,7,6),new T.MeshBasicMaterial({color:'#fff5cb'}),[x,y,z]);star.userData.phase=i*.71}
 const moon=add(starGroup,new T.SphereGeometry(1.35,16,12),new T.MeshBasicMaterial({color:'#fff3dc'}),[13,16,-22]);

 const portal=new T.Group();portal.position.set(0,12.45,-16.8);scene.add(portal);
 const portalGlow=new T.MeshStandardMaterial({color:'#fff8f3',emissive:'#d8c8ff',emissiveIntensity:.52,roughness:.75});
 [[0,0,0,1.35],[-1.05,-.08,.1,.9],[1.05,-.08,.1,.9],[-.35,.65,.06,.78],[.45,.64,.04,.83]].forEach(([x,y,z,s])=>puff(portal,x,y,z,s,portalGlow));
 const ring=add(portal,new T.TorusGeometry(1.65,.075,10,32),lavender,[0,.25,-.15]);ring.rotation.x=Math.PI/2;const beacon=new T.PointLight('#e9ddff',4,8,2);beacon.position.y=1.2;portal.add(beacon);
 portal.traverse(object=>object.userData.skyPortal=true);

 let lastTheme='';
 function update(timestamp){const day=isDaytime(timestamp);const theme=day?'day':'night';if(theme!==lastTheme){lastTheme=theme;sun.visible=day;starGroup.visible=!day}if(starGroup.visible)starGroup.children.forEach(star=>{if(star.userData.phase!==undefined)star.scale.setScalar(.72+.45*Math.sin(timestamp*.002+star.userData.phase))});ring.rotation.z+=.004;portal.position.y=12.45+Math.sin(timestamp*.0014)*.12}
 return {root,portal,beds,floorY:52.18,update,enter(){portal.visible=false},leave(){portal.visible=true}};
}
