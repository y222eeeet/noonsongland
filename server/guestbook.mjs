import { existsSync, mkdirSync, readFileSync, writeFileSync, renameSync } from 'node:fs'
import { resolve } from 'node:path'
import { randomUUID } from 'node:crypto'
export function guestbook() {
 const dir=resolve('data'),file=resolve(dir,'guestbook.json')
 const handler=(req,res,next)=>{
  if(req.url?.split('?')[0]!=='/api/guestbook')return next()
  res.setHeader('Content-Type','application/json; charset=utf-8');res.setHeader('Cache-Control','no-store')
  const read=()=>existsSync(file)?JSON.parse(readFileSync(file,'utf8')):[]
  if(req.method==='GET'){try{res.end(JSON.stringify(read()))}catch{res.statusCode=500;res.end('{"error":"읽지 못했어요"}')}return}
  if(req.method!=='POST'){res.statusCode=405;res.end('{}');return}
  let body='',large=false
  req.on('data',chunk=>{body+=chunk;if(Buffer.byteLength(body)>350000){large=true;body=''}})
  req.on('end',()=>{try{
   if(large)throw Error('그림 용량이 너무 커요')
   const input=JSON.parse(body),text=String(input.text||'').trim(),name=String(input.name||'익명 눈송이').trim().slice(0,24),drawing=input.drawing||''
   if(text.length>500||(!text&&!drawing))throw Error('글이나 그림을 남겨주세요 (글 500자 이내)')
   if(drawing&&!/^data:image\/png;base64,[A-Za-z0-9+/=]+$/.test(drawing))throw Error('그림 형식을 확인해주세요')
   const entries=read();if(entries.length>=5000){res.statusCode=507;res.end('{"error":"게시판 저장 공간이 가득 찼어요"}');return}
   const entry={id:randomUUID(),name,text,drawing,createdAt:new Date().toISOString()};entries.unshift(entry)
   mkdirSync(dir,{recursive:true});writeFileSync(file+'.tmp',JSON.stringify(entries));renameSync(file+'.tmp',file)
   res.statusCode=201;res.end(JSON.stringify(entry))
  }catch(e){res.statusCode=400;res.end(JSON.stringify({error:e instanceof Error?e.message:'저장하지 못했어요'}))}})
 }
 return {name:'campus-guestbook',configureServer(s){s.middlewares.use(handler)},configurePreviewServer(s){s.middlewares.use(handler)}}
}
