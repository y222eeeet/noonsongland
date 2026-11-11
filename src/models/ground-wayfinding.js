import * as T from 'three';

// Ground lettering is built from the same kind of rounded, raised geometry as
// Song-i's dress emblem.  Keeping it as meshes (instead of a canvas decal)
// means it catches the campus light and stays readable from every camera.
const V3_UP=new T.Vector3(0,1,0);
const syllables={
 '흡':['ㅎ','ㅡ','ㅂ'],'연':['ㅇ','ㅕ','ㄴ'],'구':['ㄱ','ㅜ',''],'역':['ㅇ','ㅕ','ㄱ'],
 '방':['ㅂ','ㅏ','ㅇ'],'명':['ㅁ','ㅕ','ㅇ'],'록':['ㄹ','ㅗ','ㄱ'],
 '클':['ㅋ','ㅡ','ㄹ'],'릭':['ㄹ','ㅣ','ㄱ'],'!':null
};

function roundedStroke(parent,material,x,z,length,angle=0,width=.095){
 const cylinder=Math.max(.012,length-width*2);
 const mesh=new T.Mesh(new T.CapsuleGeometry(width,cylinder,4,8),material);
 mesh.position.set(x,.085,z);
 mesh.quaternion.setFromUnitVectors(V3_UP,new T.Vector3(Math.cos(angle),0,Math.sin(angle)));
 mesh.castShadow=mesh.receiveShadow=true;
 parent.add(mesh);
 return mesh;
}
function circle(parent,material,x,z,r=.31){
 const mesh=new T.Mesh(new T.TorusGeometry(r,.09,6,16),material);
 mesh.position.set(x,.085,z);mesh.rotation.x=Math.PI/2;
 mesh.castShadow=mesh.receiveShadow=true;parent.add(mesh);return mesh;
}
function strokes(parent,material,jamo,x,z,scale=1){
 const h=(dx,dz,l=.55)=>roundedStroke(parent,material,x+dx*scale,z+dz*scale,l*scale,0,.085*scale);
 const v=(dx,dz,l=.55)=>roundedStroke(parent,material,x+dx*scale,z+dz*scale,l*scale,Math.PI/2,.085*scale);
 const o=(dx,dz,r=.29)=>circle(parent,material,x+dx*scale,z+dz*scale,r*scale);
 switch(jamo){
  case 'ㄱ':h(-.15,-.28,.57);v(-.43,0,.62);break;
  case 'ㄴ':v(-.43,0,.62);h(-.15,.30,.57);break;
  case 'ㄹ':h(0,-.31,.68);v(-.34,-.08,.45);h(0,.00,.68);v(.34,.18,.45);h(0,.31,.68);break;
  case 'ㅁ':h(0,-.31,.68);h(0,.31,.68);v(-.34,0,.62);v(.34,0,.62);break;
  case 'ㅂ':h(0,-.31,.68);h(0,.0,.68);h(0,.31,.68);v(-.34,0,.62);v(.34,0,.62);break;
  case 'ㅇ':o(0,0,.31);break;
  case 'ㅈ':h(0,-.29,.68);h(0,.02,.68);v(0,.18,.35);break;
  case 'ㅊ':h(0,-.30,.68);h(0,.02,.68);v(0,.18,.34);h(0,-.55,.33);break;
  // Give ㅋ a full-height spine and two long arms. At a low camera angle the
  // shorter former strokes read like broken dots rather than the consonant.
  case 'ㅋ':v(-.34,0,.70);h(0,-.27,.68);h(0,.27,.68);break;
  case 'ㅎ':o(0,-.10,.23);h(0,-.43,.64);h(0,.32,.64);break;
  case 'ㅏ':v(-.08,0,.72);h(.16,-.12,.38);break;
  case 'ㅣ':v(0,0,.72);break;
  case 'ㅓ':v(.08,0,.72);h(-.16,-.12,.38);break;
  case 'ㅕ':v(.08,0,.72);h(-.16,-.23,.38);h(-.16,.14,.38);break;
  case 'ㅡ':h(0,0,.72);break;
  case 'ㅗ':h(0,.18,.72);v(0,-.08,.52);break;
  case 'ㅜ':h(0,-.18,.72);v(0,.08,.52);break;
 }
}
function makeSyllable(char,material,scale=1){
 const group=new T.Group(),parts=syllables[char];
 if(char==='!'){
  roundedStroke(group,material,0,-.14,.42,Math.PI/2,.095*scale);
  circle(group,material,0,.35,.10*scale);
  return group;
 }
 if(!parts)return group;
 const [initial,vowel,final]=parts;
 // Initial and vowel occupy the upper half; a final consonant sits across the
 // lower half. This keeps the Hangul blocks legible from directly above.
 strokes(group,material,initial,-.36,final?-.23:0,final?.78:1);
 strokes(group,material,vowel,.38,final?-.23:0,final?.78:1);
 if(final)strokes(group,material,final,0,.46,.76);
 return group;
}
function makeText(text,color,scale=1){
 const group=new T.Group();
 const material=new T.MeshStandardMaterial({color,roughness:.72,metalness:.02});
 let cursor=0;
 for(const char of text){
  const glyph=makeSyllable(char,material,scale);
  glyph.position.x=cursor;
  group.add(glyph);
  cursor+=(char==='!'?.52:1.48)*scale;
 }
 group.position.x=-cursor/2;
 group.userData.width=cursor;
 return group;
}
function addText(scene,{text,x,y,z,rotation=0,color='#8065aa',scale=1,name}){
 const group=new T.Group();group.name=name||`ground-text-${text}`;
 group.position.set(x,y,z);group.rotation.y=rotation;
 group.add(makeText(text,color,scale));scene.add(group);
 return group;
}
function addArrow(scene,{x,y,z,rotation=0,color='#a47ac4',scale=1}){
 const group=new T.Group();group.name='smoking-wayfinding-arrow';group.position.set(x,y,z);group.rotation.y=rotation;
 const material=new T.MeshStandardMaterial({color,roughness:.7});
 roundedStroke(group,material,-.20,0,1.2*scale,0,.14*scale);
 const head=new T.Mesh(new T.ConeGeometry(.43*scale,.82*scale,4),material);
 head.position.set(.62*scale,.10,0);
 head.quaternion.setFromUnitVectors(V3_UP,new T.Vector3(1,0,0));
 head.castShadow=head.receiveShadow=true;group.add(head);scene.add(group);
 return group;
}

export function addGroundWayfinding(scene){
 // The route deliberately follows the first walkable route from the spawn:
 // lower court → stair landing → upper Myungshin walk → smoking court.
 const lowerY=.06,upperY=10.84;
 [
  [-7,6,Math.PI],[-18,4,Math.PI],[-29,1.6,Math.PI*-.78],
  // Keep markers off the stepped surface itself: the landing markers make
  // the climb obvious without floating between stair heights.
  [-44,-10,Math.PI],[-51,-11,Math.PI],[-63,-16,Math.PI],[-73,-21,Math.PI]
 ].forEach(([x,z,rotation])=>addArrow(scene,{x,y:x<-39?upperY:lowerY,z,rotation}));
 addText(scene,{text:'흡연구역',x:-81,y:upperY,z:-23.3,rotation:0,color:'#9a6bb4',scale:.9,name:'smoking-area-ground-label'});

 // Board faces west, so turn the lettering across its front approach.
 addText(scene,{text:'방명록',x:-48.25,y:upperY,z:7,rotation:Math.PI/2,color:'#8065aa',scale:.82,name:'guestbook-ground-label'});
 // This sits immediately below the cloud portal, on the same upper terrace.
 // The portal is approached from the stair side (+Z), so keep the reading
 // direction facing that approach rather than reversing it across the floor.
 addText(scene,{text:'클릭!',x:0,y:upperY,z:-14.25,rotation:0,color:'#9c7ec8',scale:1,name:'sky-portal-ground-label'});
}
