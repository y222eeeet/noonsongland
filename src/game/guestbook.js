import * as T from 'three';
import { supabase } from '../lib/supabase.js';
export function createGuestbook(scene,camera,renderer,obstacles){
 const board=new T.Group();board.position.set(-46.9,10.78,7);scene.add(board);
 const add=(g,c,x,y,z)=>{const m=new T.Mesh(g,new T.MeshStandardMaterial({color:c,roughness:.85}));m.position.set(x,y,z);m.castShadow=m.receiveShadow=true;board.add(m);return m;};
 add(new T.BoxGeometry(.30,6,24),'#a78cc0',0,3.8,0);
 for(const z of [-10,0,10])add(new T.BoxGeometry(.22,1,.22),'#766477',0,.5,z);
 const art=document.createElement('canvas');art.width=4096;art.height=1024;
 const a=art.getContext('2d');a.fillStyle='#cda988';a.fillRect(0,0,4096,1024);
 // Cork speckles and varied overlapping paper, fixed seeds for a stable design.
 for(let i=0;i<5000;i++){a.fillStyle=i%2?'#b88f6b55':'#ead0ad66';a.fillRect((i*197)%4096,(i*83)%1024,3+i%4,2+i%3);}
 const colors=['#fff0a8','#f7c4d6','#cce8d4','#d8d0f2','#fdf8e9','#c7e2f1'];

 function paper(x,y,w,h,angle,index){
  a.save();a.translate(x,y);a.rotate(angle);a.shadowColor='#5d3b424d';a.shadowBlur=12;a.shadowOffsetX=6;a.shadowOffsetY=9;
  a.fillStyle=colors[index%colors.length];a.fillRect(-w/2,-h/2,w,h);a.shadowColor='transparent';
  a.fillStyle='#ffffff88';a.fillRect(-w*.19,-h/2-7,w*.38,28);
  a.fillStyle='#8f7079';a.beginPath();a.arc(0,-h/2+18,5,0,Math.PI*2);a.fill();
  if(index%4===1){a.fillStyle='#9a859b66';for(let n=0;n<3;n++)a.fillRect(-w*.30,-h*.12+n*24,w*(.60-n*.07),5);}
  a.fillStyle='#ffffff88';a.beginPath();a.moveTo(w/2-26,h/2);a.lineTo(w/2-26,h/2-26);a.lineTo(w/2,h/2-26);a.fill();a.restore();
 }
 const papers=[
  [220,200,240,210,-.05],[640,280,360,430,.035],[1180,180,210,190,-.08],
  [1720,330,410,470,-.025],[2290,190,260,230,.06],[2860,280,330,390,-.055],
  [3540,210,420,300,.03],[3900,580,210,250,-.06],
  [220,760,300,330,.04],[1050,740,370,260,.065],[1510,850,220,190,-.04],
  [2220,770,410,320,-.035],[3070,810,250,210,.055],[3560,790,320,290,-.03]
 ];
 papers.forEach(([x,y,w,h,angle],i)=>paper(x,y,w,h,angle,i));
 const texture=new T.CanvasTexture(art);texture.colorSpace=T.SRGBColorSpace;
 // Front faces Myungshin (west); the east-facing back is plain cork.
 const front=new T.Mesh(new T.PlaneGeometry(23.5,5.5),new T.MeshBasicMaterial({map:texture}));front.rotation.y=-Math.PI/2;front.position.set(-.16,3.8,0);board.add(front);
 const back=new T.Mesh(new T.PlaneGeometry(23.5,5.5),new T.MeshStandardMaterial({color:'#cda988',roughness:.95}));back.rotation.y=Math.PI/2;back.position.set(.16,3.8,0);board.add(back);
 obstacles.push({x:-46.9,z:7,w:.25,h:12.2});
 const style=document.createElement('style');style.textContent=`.guestbook{width:min(92vw,600px);max-height:88dvh;border:0;border-radius:24px;padding:24px;background:#fffaf4;color:#554661;box-shadow:0 20px 80px #20132a66}.guestbook::backdrop{background:#24203799}.guestbook header{display:flex;align-items:center;justify-content:space-between}.guestbook button{border:0;border-radius:12px;background:#e9dff2;color:#51405e;padding:10px 16px;font:inherit;cursor:pointer}.guestbook input,.guestbook textarea{box-sizing:border-box;width:100%;border:1px solid #d8ccdf;border-radius:12px;padding:10px;margin:6px 0;font:inherit;background:white;color:#493c53}.guestbook canvas{width:100%;background:white;border:1px solid #d8ccdf;border-radius:12px;touch-action:none}.guestbook article{border-top:1px solid #e6dce9;padding:16px 0}.guestbook article p{white-space:pre-wrap;overflow-wrap:anywhere}.guestbook article img{max-width:100%;border-radius:12px}.guestbook .tools{display:flex;gap:8px;flex-wrap:wrap;margin:8px 0}.guestbook [role=status]{min-height:24px}.guestbook h2{margin:0}.guestbook h3{margin-bottom:8px}`;document.head.append(style);
 const dialog=document.createElement('dialog');dialog.className='guestbook';dialog.innerHTML=`<header><h2>방명록을 남겨주세요</h2><button type="button" data-close aria-label="방명록 닫기">닫기</button></header><div role="status" aria-live="polite"></div><h3>방명록 남기기</h3><form><input name="name" maxlength="24" placeholder="닉네임 (선택)" aria-label="닉네임"><textarea name="text" maxlength="500" rows="3" placeholder="오늘의 한마디를 적어주세요 (500자 이내)" aria-label="방명록 내용"></textarea><canvas width="480" height="240" aria-label="그림 방명록 그리기"></canvas><div class="tools"><label>펜 색 <input type="color" value="#8065aa" aria-label="펜 색" style="width:44px;padding:2px"></label><button type="button" data-clear>그림 지우기</button><button type="submit">남기기</button></div></form><section data-list></section>`;document.body.append(dialog);
 const toast=document.createElement('div');toast.setAttribute('role','status');toast.setAttribute('aria-live','polite');toast.hidden=true;
 toast.style.cssText='position:fixed;top:12%;left:50%;transform:translateX(-50%);z-index:10;padding:10px 18px;border-radius:14px;color:white;font-size:14px;box-shadow:0 5px 20px #0002;backdrop-filter:blur(6px);pointer-events:none';dialog.append(toast);
 let toastTimer;
 function showToast(message,error=false){clearTimeout(toastTimer);toast.textContent=message;toast.style.background=error?'rgba(184,48,60,.78)':'rgba(42,139,85,.78)';toast.hidden=false;toastTimer=setTimeout(()=>toast.hidden=true,1000);}
 const list=dialog.querySelector('[data-list]'),status=dialog.querySelector('[role=status]'),form=dialog.querySelector('form'),canvas=dialog.querySelector('canvas'),ctx=canvas.getContext('2d');let dirty=false,down=false,last=null;
 const clear=()=>{ctx.clearRect(0,0,480,240);dirty=false};
 const point=e=>{const r=canvas.getBoundingClientRect();return [(e.clientX-r.left)*480/r.width,(e.clientY-r.top)*240/r.height]};
 canvas.addEventListener('pointerdown',e=>{down=true;last=point(e);canvas.setPointerCapture(e.pointerId);dirty=true;ctx.fillStyle=dialog.querySelector('[type=color]').value;ctx.beginPath();ctx.arc(...last,2,0,Math.PI*2);ctx.fill()});
 canvas.addEventListener('pointermove',e=>{if(!down)return;const p=point(e);ctx.strokeStyle=dialog.querySelector('[type=color]').value;ctx.lineWidth=4;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(...last);ctx.lineTo(...p);ctx.stroke();last=p});
 for(const type of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(type,()=>down=false);
 dialog.querySelector('[data-clear]').onclick=clear;dialog.querySelector('[data-close]').onclick=()=>dialog.close();
 function render(entries){list.replaceChildren();if(!entries.length){list.textContent='첫 방명록을 남겨주세요.';return}for(const entry of entries){const article=document.createElement('article'),title=document.createElement('strong'),time=document.createElement('small'),text=document.createElement('p');title.textContent=entry.display_name;time.textContent=' · '+new Date(entry.created_at).toLocaleString('ko-KR',{timeZone:'Asia/Seoul',year:'numeric',month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit',hour12:false});text.textContent=entry.message;article.append(title,time,text);if(entry.drawing){const img=document.createElement('img');img.src=entry.drawing;img.alt=entry.display_name+'의 그림 방명록';article.append(img)}list.append(article)}}
 async function load(){if(!supabase)throw Error('방명록 연결 설정을 찾지 못했어요.');const {data,error}=await supabase.from('guestbook_entries').select('display_name,message,drawing,created_at').order('created_at',{ascending:false}).limit(100);if(error)throw Error('방명록을 불러오지 못했어요.');render(data||[])}
 async function open(){if(dialog.open)return;dialog.showModal();status.textContent='불러오는 중…';try{await load();status.textContent=''}catch(e){status.textContent=e.message}}
 form.onsubmit=async e=>{e.preventDefault();const submit=form.querySelector('[type=submit]');if(!form.elements.text.value.trim()&&!dirty){showToast('글이나 그림을 남겨주세요',true);return}if(!supabase){showToast('방명록 연결 설정을 찾지 못했어요.',true);return}submit.disabled=true;status.textContent='저장 중…';try{const fields=new FormData(form),{data:{user}}=await supabase.auth.getUser();if(!user)throw Error('입장 정보를 확인하지 못했어요. 다시 입장해주세요.');const {error}=await supabase.from('guestbook_entries').insert({user_id:user.id,display_name:(fields.get('name')||window.noonsongPlayer?.displayName||'익명 송이').trim().slice(0,24),message:fields.get('text').trim().slice(0,500),drawing:dirty?canvas.toDataURL('image/png'):null});if(error)throw Error('저장하지 못했어요.');form.reset();clear();await load();status.textContent='';showToast('작성완료')}catch(err){status.textContent='';showToast(err.message,true)}finally{submit.disabled=false}};
 const ray=new T.Raycaster(),mouse=new T.Vector2();let press=null;
 renderer.domElement.addEventListener('pointerdown',e=>press=[e.clientX,e.clientY]);
 renderer.domElement.addEventListener('pointerup',e=>{if(!press||Math.hypot(e.clientX-press[0],e.clientY-press[1])>8)return;const r=renderer.domElement.getBoundingClientRect();mouse.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(mouse,camera);const hit=ray.intersectObjects(scene.children,true)[0];if(hit&&board.getObjectById(hit.object.id))open();});
 return {isOpen:()=>dialog.open,open};
}
