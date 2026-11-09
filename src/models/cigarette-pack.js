import * as T from 'three';
import packImage from '../../public/assets/cigarette-pack.png?url';
export function createCigarettePack(scene){
 const root=new T.Group();scene.add(root);root.visible=false;
 const red=new T.MeshStandardMaterial({color:'#c82c23',roughness:.8});
 const cream=new T.MeshStandardMaterial({color:'#fff5e9',roughness:.9});
 const add=(g,m,x,y,z,parent=root)=>{const o=new T.Mesh(g,m);o.position.set(x,y,z);parent.add(o);return o;};
 add(new T.BoxGeometry(.36,.48,.15),cream,0,0,0);
 const tex=new T.TextureLoader().load(packImage);tex.colorSpace=T.SRGBColorSpace;
 add(new T.PlaneGeometry(.36,.59),new T.MeshBasicMaterial({map:tex}),0,.055,.078);
 const hinge=new T.Group();hinge.position.set(0,.24,-.075);root.add(hinge);
 add(new T.BoxGeometry(.37,.11,.16),red,0,.055,.075,hinge);
 add(new T.CapsuleGeometry(.12,.22,5,10),cream,-.10,-.30,-.04);
 const fresh=add(new T.CylinderGeometry(.022,.022,.40,10),cream,.06,.18,0);
 const filter=add(new T.CylinderGeometry(.022,.022,.10,10),new T.MeshStandardMaterial({color:'#d7b18a'}),.06,.43,0);
 return {root,update(camera,t){
   root.visible=t<3.8;root.quaternion.copy(camera.quaternion);
   root.position.copy(camera.position);root.translateZ(-1.4);root.translateX(-.08);
   const enter=T.MathUtils.smoothstep(t,0,.65),exit=T.MathUtils.smoothstep(t,3.0,3.8);
   root.translateY(-.65+.48*enter-.65*exit);
   hinge.rotation.x=-1.8*T.MathUtils.smoothstep(t,.65,1.2)*(1-T.MathUtils.smoothstep(t,2.7,3.2));
   const lift=T.MathUtils.smoothstep(t,1.3,2.4);
   fresh.position.y=.18+.48*lift;filter.position.y=.43+.48*lift;
   fresh.visible=filter.visible=t<2.6;
 }};
}
