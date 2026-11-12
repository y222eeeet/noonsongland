import * as T from 'three';

// Positions traced from the user's annotated ground-plan-simple.png.
const map=(x,y)=>[(x-95)/8.65-103,(y-165)/8-38];
export const TREE_SPOTS=[[720,392],[761,394],[805,394],[859,399],[907,397],[1041,388],[1075,391],[1107,391],[1152,388],[1179,393]].map(p=>map(...p));
export const LAMP_SPOTS=[
 [200,250,10.78],[369,245,10.78],[185,383,10.78],[298,381,10.78],[185,630,10.78],[301,625,10.78],
 [486,299,10.78],[599,299,10.78],[678,299,10.78],[778,295,10.78],[871,299,10.78],
 [588,435,.05],[649,435,.05],[716,438,.05],[791,435,.05],[867,435,.05],[920,516,.05],[1057,510,.05]
].map(([x,z,y])=>{const [wx,wz]=map(x,z);return [wx,y,wz]});
export const BENCH_SPOTS=[[615,434],[750,434],[824,434]].map(p=>map(...p));

// Three trees on each bank of the long river stretch west of the bridge.
const RIVERSIDE_CONIFERS=[
 [-15,10.4,.92],[-26,11.25,1.06],[-37,11.5,.96],
 [-15,28.65,1.04],[-26,28.4,.94],[-37,29.0,1.1]
];

export function addCampusFurniture(scene,obstacles,M){
 const root=new T.Group();root.name='marked-campus-furniture';scene.add(root);
 const leaves=new T.MeshStandardMaterial({color:'#b6d97a',roughness:.95});
 const leafLight=new T.MeshStandardMaterial({color:'#c5e58f',roughness:.95});
 const trunk=new T.MeshStandardMaterial({color:'#a4876d',roughness:1});
 function mesh(parent,geometry,material,x,y,z){const m=new T.Mesh(geometry,material);m.position.set(x,y,z);m.castShadow=m.receiveShadow=true;parent.add(m);return m}
 TREE_SPOTS.forEach(([x,z],i)=>{
  const tree=new T.Group();tree.name='lime-tree';tree.position.set(x,10.78,z);root.add(tree);
  mesh(tree,new T.CylinderGeometry(.27,.43,4.5,10),trunk,0,2.25,0);
  [[0,7.3,0,2.55,3.05,2.35],[-1.1,6.5,.15,1.8,2.3,1.8],[1.0,6.8,-.12,1.8,2.4,1.8],[.15,8.1,.1,1.85,2.45,1.8]].forEach(([a,b,c,sx,sy,sz],j)=>{const leaf=mesh(tree,new T.SphereGeometry(1,16,12),j===3?leafLight:leaves,a,b,c);leaf.scale.set(sx,sy,sz)});
  obstacles.push({x,z,r:.5});
 });
 const pineTrunk=new T.CylinderGeometry(.13,.23,1.35,8);
 const pineTiers=[
  {y:1.75,geometry:new T.ConeGeometry(1.25,1.85,9),color:'#567f68'},
  {y:2.54,geometry:new T.ConeGeometry(1.02,1.75,9),color:'#689777'},
  {y:3.27,geometry:new T.ConeGeometry(.76,1.60,9),color:'#7daa85'}
 ].map(tier=>({...tier,material:new T.MeshStandardMaterial({color:tier.color,roughness:.94})}));
 RIVERSIDE_CONIFERS.forEach(([x,z,scale],index)=>{
  const tree=new T.Group();
  tree.name='riverside-conifer';
  tree.position.set(x,0,z);
  tree.rotation.y=index*.39;
  tree.scale.setScalar(scale);
  root.add(tree);
  mesh(tree,pineTrunk,trunk,0,.675,0);
  for(const tier of pineTiers)mesh(tree,tier.geometry,tier.material,0,tier.y,0);
  obstacles.push({x,z,r:.23*scale});
 });
 BENCH_SPOTS.forEach(([x,z],index)=>{
  const bench=new T.Group();bench.name='lower-road-bench';bench.position.set(x,.05,z+.25);root.add(bench);
  const seat={id:`campus-bench-${index}`,x,z:z+.25,y:.93,rotation:0};bench.userData.benchSeat=seat;
  mesh(bench,new T.BoxGeometry(3.8,.20,.8),M.pink,0,.78,0);
  mesh(bench,new T.BoxGeometry(3.8,.8,.16),M.lav,0,1.20,-.35);
  for(const side of [-1,1])mesh(bench,new T.BoxGeometry(.18,.7,.6),trunk,side*1.4,.35,0);
  bench.traverse(part=>part.userData.benchSeat=seat);
  obstacles.push({x,z:z+.25,w:2.0,h:.6});
 });
 LAMP_SPOTS.forEach(([x,y,z])=>{
  const pole=new T.Group();pole.name='marked-streetlamp';pole.position.set(x,y,z);root.add(pole);
  mesh(pole,new T.CylinderGeometry(.08,.13,6.4,10),M.dark,0,3.2,0);
  mesh(pole,new T.SphereGeometry(.27,12,8),new T.MeshStandardMaterial({color:'#fff4bd',emissive:'#ffd977',emissiveIntensity:.55}),0,6.5,0);
  const light=new T.PointLight('#ffdc9b',0,17,2);light.position.y=6.5;light.userData.campusLamp=true;pole.add(light);
  obstacles.push({x,z,r:.22});
 });
 return root;
}
