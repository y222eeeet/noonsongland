import * as T from 'three';

export const RUG_TOP=1.04; // Above the tallest cloud lobes (less than 0.85).
const SCALE=3.2,CENTER=.35;
// Broad crystal lobes with open, distinct notches between each branch.
const right=[
 [0,1.82],[.20,1.70],[.39,1.48],[.45,1.32],
 [.23,1.21],[.27,1.12],[.52,1.20],[.64,.98],
 [.34,.85],[.38,.75],[.73,.84],[.88,.56],
 [1.12,.38],[1.25,.52],[1.24,.81],[1.44,.89],
 [1.49,.63],[1.57,.65],[1.62,.95],[1.88,1.02],
 [1.96,.71],[1.84,.45],[1.53,.30],[1.57,.21],
 [1.86,.20],[1.73,-.04],[1.43,-.10],[1.43,-.20],
 [1.69,-.27],[1.42,-.54],[1.09,-.79],[.56,-1.04],[0,-1.12]
];
const outline=[...right,...right.slice(1,-1).reverse().map(([x,y])=>[-x,y])];
export function rugContains(x,z){
 const px=x/SCALE,py=-z/SCALE+CENTER;let inside=false;
 for(let i=0,j=outline.length-1;i<outline.length;j=i++){const [xi,yi]=outline[i],[xj,yj]=outline[j];if((yi>py)!==(yj>py)&&px<(xj-xi)*(py-yi)/(yj-yi)+xi)inside=!inside}return inside;
}
export function createSongiRug(){
 const rug=new T.Group();rug.name='flat-songi-rug';
 const purple=new T.MeshStandardMaterial({color:'#bca5df',roughness:1}),cream=new T.MeshStandardMaterial({color:'#fff5e9',roughness:1}),ink=new T.MeshStandardMaterial({color:'#65507d',roughness:1}),pink=new T.MeshStandardMaterial({color:'#f2aebb',roughness:1});
 function layer(shape,material,y,depth=0){const g=depth?new T.ExtrudeGeometry(shape,{depth,bevelEnabled:false,steps:1,curveSegments:20}):new T.ShapeGeometry(shape,24);g.scale(SCALE,SCALE,1);g.translate(0,-CENTER*SCALE,0);const mesh=new T.Mesh(g,material);mesh.rotation.x=-Math.PI/2;mesh.position.y=y;mesh.castShadow=mesh.receiveShadow=false;rug.add(mesh);return mesh;}
 const outer=new T.Shape();outline.forEach(([x,y],i)=>i?outer.lineTo(x,y):outer.moveTo(x,y));outer.closePath();layer(outer,purple,RUG_TOP-.08,.08);
 const face=new T.Shape();face.moveTo(0,.52);face.bezierCurveTo(-.15,.47,-.16,.71,-.34,.61);face.bezierCurveTo(-.68,.46,-.99,.11,-1,-.10);face.bezierCurveTo(-1,-.23,-.85,-.28,-.92,-.36);face.bezierCurveTo(-1.08,-.47,-.61,-.90,0,-.90);face.bezierCurveTo(.61,-.90,1.08,-.47,.92,-.36);face.bezierCurveTo(.85,-.28,1,-.23,1,-.10);face.bezierCurveTo(.99,.11,.68,.46,.34,.61);face.bezierCurveTo(.16,.71,.15,.47,0,.52);layer(face,cream,RUG_TOP+.004);
 function disc(x,y,rx,ry,mat){const shape=new T.Shape();shape.absellipse(x,y,rx,ry,0,Math.PI*2,false,0);layer(shape,mat,RUG_TOP+.008)}
 function stroke(points,width){const path=new T.CatmullRomCurve3(points.map(([x,y])=>new T.Vector3(x,y,0))).getPoints(32);const shape=new T.Shape();const edges=path.map((p,i)=>{const tangent=path[Math.min(32,i+1)].clone().sub(path[Math.max(0,i-1)]).normalize();return [p.x-tangent.y*width/2,p.y+tangent.x*width/2,p.x+tangent.y*width/2,p.y-tangent.x*width/2]});edges.forEach((p,i)=>i?shape.lineTo(p[0],p[1]):shape.moveTo(p[0],p[1]));edges.reverse().forEach(p=>shape.lineTo(p[2],p[3]));shape.closePath();layer(shape,ink,RUG_TOP+.012);for(const [x,y] of [points[0],points.at(-1)])disc(x,y,width/2,width/2,ink);}
 for(const x of [-.38,.38]){const eye=new T.Shape();eye.moveTo(x-.085,-.195);eye.absarc(x,-.195,.085,Math.PI,Math.PI*2,false);eye.lineTo(x+.085,.055);eye.absarc(x,.055,.085,0,Math.PI,false);eye.closePath();layer(eye,ink,RUG_TOP+.012);stroke([[x-.04,.08],[x-.085,.16]],.035);disc(x*2,-.35,.14,.075,pink)}
 stroke([[-.27,-.435],[-.16,-.54],[0,-.57],[.16,-.54],[.27,-.435]],.055);
 return rug;
}
