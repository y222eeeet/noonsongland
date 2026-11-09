import * as T from 'three';

// Sculptural bronze group: three women, led by a torch bearer. Front is +Z.
export function createBronzeWomen(){
 const root=new T.Group();root.name='three-women-bronze';
 const bronze=new T.MeshStandardMaterial({vertexColors:true,metalness:.45,roughness:.69,emissive:'#63503b',emissiveIntensity:0});
 bronze.userData.nightBronze=true;
 const dark=new T.MeshStandardMaterial({color:'#263c36',metalness:.65,roughness:.76});
 function sculpt(parent,geometry,position=[0,0,0],scale=[1,1,1],material=bronze){
  if(material===bronze){const p=geometry.attributes.position,colors=[],c=new T.Color(),warm=new T.Color('#96745a'),green=new T.Color('#588b7d');for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i);const n=Math.sin(x*17+y*11+z*23)*.15+Math.sin(x*5-y*7+z*9)*.25+Math.sin(x*41+y*27)*.07;const mix=T.MathUtils.clamp(.42+n,.08,.86);c.copy(warm).lerp(green,mix).multiplyScalar(.8+.22*Math.sin(y*13+x*7)**2);colors.push(c.r,c.g,c.b)}geometry.setAttribute('color',new T.Float32BufferAttribute(colors,3));}
  const mesh=new T.Mesh(geometry,material);mesh.position.set(...position);mesh.scale.set(...scale);mesh.castShadow=mesh.receiveShadow=true;parent.add(mesh);return mesh;
 }
 const ellipsoid=(parent,p,s,mat)=>sculpt(parent,new T.SphereGeometry(1,24,18),p,s,mat);
 function limb(parent,points,radii){
  const curve=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p)));const frames=curve.computeFrenetFrames(32,false),vertices=[],indices=[];
  for(let i=0;i<=32;i++){const t=i/32,p=curve.getPointAt(t),f=t*(radii.length-1),k=Math.min(radii.length-2,Math.floor(f)),r=T.MathUtils.lerp(radii[k],radii[k+1],f-k);for(let j=0;j<=12;j++){const a=j/12*Math.PI*2,v=p.clone().addScaledVector(frames.normals[i],Math.cos(a)*r).addScaledVector(frames.binormals[i],Math.sin(a)*r);vertices.push(v.x,v.y,v.z);if(i<32&&j<12){const q=i*13+j;indices.push(q,q+1,q+13,q+1,q+14,q+13)}}}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(vertices,3));g.setIndex(indices);g.computeVertexNormals();return sculpt(parent,g);
 }
 function drape(parent,rings,folds=15,hemLift=0){
  const vertices=[],indices=[],rows=42,segments=72;
  for(let i=0;i<=rows;i++){const t=i/rows,f=t*(rings.length-1),k=Math.min(rings.length-2,Math.floor(f)),v=f-k,a=rings[k],b=rings[k+1];const mix=n=>T.MathUtils.lerp(a[n],b[n],v);
   for(let j=0;j<=segments;j++){const angle=j/segments*Math.PI*2,fold=(.025+.045*t)*Math.sin(angle*folds+t*2)+.018*Math.sin(angle*folds*2-t*3),r=mix(1)+fold;const front=Math.max(0,Math.cos(angle));vertices.push(mix(3)+Math.sin(angle)*r,mix(0)+hemLift*front**4*t**3,mix(4)+Math.cos(angle)*(mix(2)+fold));if(i<rows&&j<segments){const q=i*(segments+1)+j;indices.push(q,q+segments+1,q+1,q+1,q+segments+1,q+segments+2)}}
  }
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(vertices,3));g.setIndex(indices);g.computeVertexNormals();return sculpt(parent,g);
 }
 function head(parent,x,y,z,turn=0){
  const h=new T.Group();h.position.set(x,y,z);h.rotation.y=turn;parent.add(h);
  const g=new T.SphereGeometry(1,40,32),p=g.attributes.position;
  // Cheekbones, chin and brow are part of the head surface, not cartoon features.
  for(let i=0;i<p.count;i++){let px=p.getX(i)*.235,py=p.getY(i)*.325,pz=p.getZ(i)*.225;const front=Math.max(0,p.getZ(i));pz+=front*(.018*Math.exp(-(((py+.08)/.11)**2))-.018*Math.exp(-(((py-.045)/.05)**2)));px*=py<-.13?.86:1;p.setXYZ(i,px,py,pz)}g.computeVertexNormals();sculpt(h,g);
  ellipsoid(h,[0,-.005,.231],[.041,.088,.063]);ellipsoid(h,[0,-.05,.266],[.052,.033,.032]);
  for(const side of [-1,1]){ellipsoid(h,[side*.105,.065,.197],[.066,.024,.023],dark);limb(h,[[side*.05,.112,.211],[side*.10,.126,.216],[side*.16,.109,.19]],[.017,.019,.012]);ellipsoid(h,[side*.232,-.01,0],[.043,.075,.045]);}
  limb(h,[[-.075,-.124,.196],[0,-.113,.226],[.073,-.124,.196]],[.014,.017,.012]);limb(h,[[-.065,-.128,.199],[0,-.145,.215],[.06,-.129,.20]],[.01,.016,.01]);
  const cap=sculpt(h,new T.SphereGeometry(1,32,18,0,Math.PI*2,0,1.48),[0,.025,-.018],[.254,.326,.245]);
  ellipsoid(h,[0,-.025,-.125],[.25,.29,.18]);
  for(let i=0;i<5;i++)limb(h,[[-.22,.16+i*.025,.10],[-.10,.23+i*.018,.20],[.08,.26+i*.012,.18],[.21,.17+i*.015,.08]],[.018,.026,.022,.015]);
  for(let i=0;i<13;i++){const a=-1.5+i*.25;limb(h,[[Math.sin(a)*.23,.17,Math.cos(a)*.10-.02],[Math.sin(a)*.25,.05,-.04],[Math.sin(a)*.22,-.18,-.17]],[.018,.024,.02]);}
  return h;
 }
 function hand(parent,point,raised=false){const h=new T.Group();h.position.set(...point);parent.add(h);ellipsoid(h,[0,0,0],[.085,.12,.065]);for(let i=0;i<4;i++){const x=(i-1.5)*.035;limb(h,[[x,.04,.025],[x,.12,raised?.055:.04],[x,.16,raised?.095:.02]],[.023,.021,.017]);}limb(h,[[.07,-.02,.02],[.11,.04,.07],[.06,.07,.11]],[.032,.028,.02]);return h;}
 function woman(position,scale,leader=false,seated=false){
  const w=new T.Group();w.position.set(...position);w.scale.setScalar(scale);root.add(w);
  const hip=seated?1.72:2.12,shoulder=hip+1.14;
  ellipsoid(w,[0,shoulder-.06,0],[.40,.15,.23]);
  drape(w,[[shoulder,.38,.23,0,0],[hip+.83,.36,.29,0,.015],[hip+.45,.255,.20,0,0],[hip-.10,.37,.28,0,0]],8);

  limb(w,[[0,shoulder-.03,0],[0,shoulder+.15,0]],[.12,.115]);head(w,0,shoulder+.43,.015,leader?.1:seated?.2:-.14);
  const footY=.23;
  if(leader){
   limb(w,[[.22,hip,.06],[.62,1.27,.64],[.73,.37,.83]],[.235,.19,.10]);ellipsoid(w,[.76,footY,.98],[.14,.10,.32]);
   limb(w,[[-.22,hip,-.08],[-.38,1.13,-.18],[-.48,.28,-.28]],[.23,.16,.09]);ellipsoid(w,[-.45,.18,-.12],[.13,.09,.29]);
   drape(w,[[hip,.37,.29,0,0],[hip-.5,.45,.35,-.03,.05],[.78,.58,.40,-.12,.0],[.38,.65,.48,-.15,-.07]],17,.82);
   limb(w,[[.35,shoulder-.06,0],[.65,shoulder+.46,.035],[.79,shoulder+1.17,.10]],[.145,.115,.08]);hand(w,[.79,shoulder+1.22,.10],true);
   const torch=limb(w,[[.79,shoulder+1.15,.16],[.79,shoulder+1.75,.16]],[.065,.10]);
   sculpt(w,new T.CylinderGeometry(.15,.09,.16,16),[.79,shoulder+1.73,.16]);
   for(let i=0;i<4;i++){const flame=ellipsoid(w,[.79+Math.sin(i*2)*.06,shoulder+1.92+i*.015,.16+Math.cos(i*2)*.04],[.065,.20+i*.025,.07]);flame.rotation.z=(i-1.5)*.25;}
   limb(w,[[-.34,shoulder-.07,0],[-.63,hip+.53,.12],[-.49,hip-.10,.27]],[.15,.12,.08]);hand(w,[-.49,hip-.16,.27]);
  }else{
   const knees=seated?[[.22,1.05,.57],[-.22,1.1,.15]]:[[.2,1.15,0],[-.2,1.16,-.12]];
   for(const [i,side] of [-1,1].entries()){const k=knees[i],ankle=[side*.24,.28,seated?.38:0];limb(w,[[side*.21,hip,0],k,ankle],[.21,.16,.09]);ellipsoid(w,[ankle[0],.18,ankle[2]+.15],[.12,.08,.26]);}
   drape(w,[[hip,.37,.28,0,0],[hip-.45,.45,.34,0,seated?.18:0],[.53,.46,.36,0,seated?.15:0],[.22,.53,.42,0,.03]],16,seated?.45:0);
   limb(w,[[.33,shoulder-.06,0],[.51,hip+.57,.04],[.36,hip+.12,.30]],[.145,.11,.075]);hand(w,[.35,hip+.08,.30]);
   limb(w,[[-.33,shoulder-.06,0],[-.52,hip+.56,.08],[-.38,hip+.12,.32]],[.145,.11,.075]);hand(w,[-.36,hip+.08,.32]);
   if(!seated){const book=sculpt(w,new T.BoxGeometry(.56,.18,.34),[0,hip+.12,.37]);book.rotation.z=-.06;}
   else{const book=sculpt(w,new T.BoxGeometry(.12,.70,.40),[-.53,hip+.59,.20]);book.rotation.z=.18;}
  }
  return w;
 }
 sculpt(root,new T.CylinderGeometry(1.65,1.8,.25,64),[0,.125,0],[1.1,1,.77]);
 sculpt(root,new T.CylinderGeometry(1.62,1.64,.09,64),[0,.295,0],[1.1,1,.77]);
 woman([-.22,.32,-.42],.94,false,false);
 woman([-1.02,.32,.12],.88,false,true);
 woman([.46,.32,.42],1,true,false);
 return root;
}

export function addBronzeWomen(scene,obstacles){
 const statue=createBronzeWomen();statue.position.set(14,10.78,-21.7);statue.scale.setScalar(1.35);scene.add(statue);
 obstacles.push({x:14,z:-21.7,r:2.45});
 return statue;
}
