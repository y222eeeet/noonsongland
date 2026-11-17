import * as T from 'three';

const notes=[
 [
  'Fourier series', 'f(x) ∼ a₀/2 + Σ(aₙ cos nx + bₙ sin nx)',
  'aₙ = (1/π) ∫₋π^π f(x) cos(nx) dx',
  'bₙ = (1/π) ∫₋π^π f(x) sin(nx) dx',
  '⟨sin mx, sin nx⟩ = πδₘₙ',
  'f(x) = x  ⇒  aₙ = 0',
  'bₙ = 2(−1)ⁿ⁺¹/n',
  'x ∼ 2 Σ (−1)ⁿ⁺¹ sin(nx)/n'
 ],
 [
  'Eigenvalues & diagonalization', 'A = [ 2  1 ;  1  2 ]',
  'det(A − λI) = (2 − λ)² − 1',
  'λ₁ = 3,  λ₂ = 1',
  'v₁ = (1, 1)ᵀ,  v₂ = (1, −1)ᵀ',
  'QᵀAQ = diag(3, 1)',
  'Aᵏ = Q diag(3ᵏ, 1) Qᵀ',
  'eᵗᴬ = Q diag(e³ᵗ, eᵗ) Qᵀ',
  'tr A = 4,   det A = 3'
 ],
 [
  'Multivariable calculus', 'f(x,y) = x² + xy + y²',
  '∇f = (2x + y, x + 2y)',
  'H = [ 2  1 ;  1  2 ]',
  'det H = 3 > 0,   H₁₁ > 0',
  '(0, 0) is a strict minimum.',
  '∮∂Ω P dx + Q dy',
  '= ∬Ω (∂Q/∂x − ∂P/∂y) dA'
 ]
];

export function createClassroomChalk() {
 const canvas=document.createElement('canvas');
 canvas.width=1536;canvas.height=512;
 const ctx=canvas.getContext('2d');
 ctx.lineCap='round';ctx.lineJoin='round';
 const chalk='#f4eddf',accent='#f3d6a1';
 function line(points,color=chalk,width=2){
  ctx.strokeStyle=color;ctx.lineWidth=width;ctx.beginPath();
  points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));
  ctx.stroke();
 }
 notes.forEach((column,i)=>{
  const x=34+i*508;
  column.forEach((text,j)=>{
   ctx.save();
   ctx.translate(x+(j%3)*4,49+j*42);
   ctx.rotate((j%4-1.5)*.007);
   ctx.fillStyle=j===0?accent:chalk;
   ctx.font=j===0?'italic 34px Georgia, serif':'italic 26px Georgia, serif';
   ctx.fillText(text,0,0,449);
   ctx.restore();
  });
  line([[x,61],[x+215,57],[x+314,60]],accent);
  if(i<2)line([[x+468,33],[x+465,253],[x+469,470]],'#cedfd0',1.8);
 });
 const x=252,y=432;
 line([[65,y],[442,y],[432,y-6]]);
 line([[x,484],[x,376],[x+6,386]]);
 const wave=[];
 for(let i=0;i<=72;i++)wave.push([74+i*5,y-Math.sin(i/7)*31]);
 line(wave,'#aee4d4',3);
 for(const radius of [18,32,47])ctxStrokeEllipse(radius);
 function ctxStrokeEllipse(radius){
  ctx.beginPath();ctx.strokeStyle=chalk;ctx.lineWidth=1.7;
  ctx.ellipse(1268,432,radius*2.2,radius*.72,-.29,0,Math.PI*2);ctx.stroke();
 }
 line([[1148,460],[1387,400]],'#aee4d4');
 const pixels=ctx.getImageData(0,0,canvas.width,canvas.height);
 let seed=9349;
 for(let i=3;i<pixels.data.length;i+=4){
  if(!pixels.data[i])continue;
  seed=(Math.imul(seed,1664525)+1013904223)>>>0;
  const grain=seed/4294967296;
  pixels.data[i]*=grain<.15?.2:.58+grain*.42;
 }
 ctx.putImageData(pixels,0,0);
 const texture=new T.CanvasTexture(canvas);
 texture.colorSpace=T.SRGBColorSpace;
 return texture;
}
