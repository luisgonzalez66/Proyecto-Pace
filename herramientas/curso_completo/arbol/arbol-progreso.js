/* PACE UACh · Árbol de progreso · componente sin dependencias
 * v1.0 (Henry, 24-11-2026): reglas, estados, API (montar/actualizar/crearSVG) y animación.
 * v2.0 (24-11-2026): nueva ilustración con la misma API y las mismas reglas.
 *   - El árbol crece hacia arriba: los bloques 1 y 2 son las ramas bajas, y los bloques 3 y 4, las altas.
 *   - Ramas y tronco que se afinan, ramitas para cada estación, copa de fondo y suelo con pasto.
 *   - Colores de unidad de la paleta del curso (I azul, II ciruela, III ocre).
 *   - Flor en la punta de la rama cuando el bloque está terminado (bloque.florece); frutos en las cuatro ramas al finalizar la unidad. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.PaceArbol = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  /* ramas: [x0,y0, c1x,c1y, c2x,c2y, x1,y1] (curva cúbica desde el tronco hasta la punta), en el orden de los bloques 1-4 */
  const UNIDADES = Object.freeze({
    U1: { nombre:'Números', cantidades:[4,4,4,2], color:'#2F6DB0', claro:'#e6eff8', oscuro:'#1f4f84', forma:'robusto', vaiven:0,
      ramas:[[204,216,172,206,112,204,44,182],[216,210,250,200,310,196,378,172],[206,158,182,134,130,116,70,86],[214,152,240,126,290,108,352,76]] },
    U2: { nombre:'Factorizaciones', cantidades:[3,4,2,3], color:'#9C3D7A', claro:'#f6e8f1', oscuro:'#742b5a', forma:'esbelto', vaiven:-10,
      ramas:[[204,222,160,224,98,214,48,176],[214,214,262,216,322,202,376,162],[202,160,170,150,120,126,82,78],[208,152,244,142,296,116,338,68]] },
    U3: { nombre:'Ecuaciones', cantidades:[4,2,4,1], color:'#A8741F', claro:'#f8efdf', oscuro:'#7c5414', forma:'asimétrico', vaiven:12,
      ramas:[[206,220,166,216,108,218,46,198],[218,198,260,182,320,172,382,140],[214,162,186,142,136,130,74,100],[222,138,244,106,286,82,336,54]] }
  });
  const HOJAS = Object.freeze({ pendiente:{color:'#C9CBC2',borde:'#8F948A'}, en_progreso:{color:'#B5CA80',borde:'#7E9550'}, completada:{color:'#4F9A4A',borde:'#2F6B33'} });
  const ESTADOS = Object.keys(HOJAS);
  const ETIQUETAS = {pendiente:'Pendiente',en_progreso:'En progreso',completada:'Completada'};
  const esc = value => String(value).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const round = n => Number(n.toFixed(1));
  function punto(r,t){const a=1-t;return [a*a*a*r[0]+3*a*a*t*r[2]+3*a*t*t*r[4]+t*t*t*r[6],a*a*a*r[1]+3*a*a*t*r[3]+3*a*t*t*r[5]+t*t*t*r[7]];}
  function tangente(r,t){const a=1-t;const dx=3*a*a*(r[2]-r[0])+6*a*t*(r[4]-r[2])+3*t*t*(r[6]-r[4]),dy=3*a*a*(r[3]-r[1])+6*a*t*(r[5]-r[3])+3*t*t*(r[7]-r[5]);const n=Math.hypot(dx,dy)||1;return [dx/n,dy/n];}
  /* polígono de una curva que se afina de w0 a w1 (ancho total) */
  function afinada(r,w0,w1){const N=22,L=[],R=[];for(let i=0;i<=N;i++){const t=i/N,[x,y]=punto(r,t),[tx,ty]=tangente(r,t),w=(w0+(w1-w0)*t)/2;L.push([x-ty*w,y+tx*w]);R.push([x+ty*w,y-tx*w]);}
    const [ex,ey]=punto(r,1),[tx,ty]=tangente(r,1),w=w1/2;
    return 'M'+L.map(p=>round(p[0])+' '+round(p[1])).join('L')+`Q${round(ex+tx*w*1.6)} ${round(ey+ty*w*1.6)} `+R.reverse().map(p=>round(p[0])+' '+round(p[1])).join('L')+'Z';}
  function posiciones(n){return Array.from({length:n},(_,i)=>n===1?.62:.3+.5*i/(n-1));}
  function normalizar(data){
    if(!data || !Object.hasOwn(UNIDADES,data.unidad)) throw new Error('Unidad desconocida: use U1, U2 o U3.');
    const config=UNIDADES[data.unidad];
    if(!Array.isArray(data.bloques)||data.bloques.length!==4) throw new Error('El diseño actual requiere exactamente cuatro bloques.');
    const ids=new Set(); const blockIds=new Set();
    const bloques=data.bloques.map((b,i)=>{
      if(!b || typeof b.id!=='string'||!b.id||blockIds.has(b.id)) throw new Error('ID de bloque ausente o repetido.');blockIds.add(b.id);
      if(!Array.isArray(b.estaciones)||!b.estaciones.length) throw new Error('Cada bloque debe tener al menos una estación.');
      const estaciones=b.estaciones.map(s=>{
        if(!s||typeof s.id!=='string'||!s.id||ids.has(s.id))throw new Error('ID de estación ausente o repetido.');ids.add(s.id);
        if(!ESTADOS.includes(s.estado))throw new Error('Estado de estación inválido: '+s.estado);
        return {id:s.id,nombre:s.nombre||s.id,estado:s.estado};
      });
      const completo=estaciones.every(s=>s.estado==='completada');
      return {id:b.id,nombre:b.nombre||`Bloque ${i+1}`,estaciones,completo,florece:completo&&b.florece!==false};
    });
    const todas=bloques.flatMap(b=>b.estaciones),completadas=todas.filter(s=>s.estado==='completada').length;
    const todasCompletadas=completadas===todas.length;
    return {unidad:data.unidad,config,bloques,total:todas.length,completadas,enProgreso:todas.filter(s=>s.estado==='en_progreso').length,pendientes:todas.filter(s=>s.estado==='pendiente').length,todasCompletadas,finalizada:data.unidadFinalizada===true&&todasCompletadas,inconsistente:data.unidadFinalizada===true&&!todasCompletadas};
  }
  /* hojas dibujadas hacia arriba desde (0,0) */
  function hoja(estado,G){
    const h=HOJAS[estado];
    if(estado==='pendiente')return `<path d="M0 -2 C-6 -7 -6 -15 0 -20 C6 -15 6 -7 0 -2Z" fill="${h.color}" stroke="${h.borde}" stroke-width="1.5"/><path d="M-2 -8 Q-2 -14 0 -17" stroke="#fff" stroke-width="1.4" fill="none" opacity=".55" stroke-linecap="round"/>`;
    if(estado==='en_progreso')return `<path d="M0 -2 C-11 -9 -13 -22 -3 -30 C5 -21 6 -10 0 -2Z" fill="${h.color}" stroke="${h.borde}" stroke-width="1.5"/><path d="M1 -3 C3 -12 9 -18 15 -19 C13 -10 8 -5 1 -3Z" fill="#D3E2A8" stroke="${h.borde}" stroke-width="1.3"/><path d="M-1 -5 Q-3 -15 -3 -25" stroke="${h.borde}" stroke-width="1" fill="none" opacity=".8"/>`;
    return `<path d="M0 -2 C-17 -10 -19 -30 -2 -44 C16 -32 15 -11 0 -2Z" fill="url(#${G}h)" stroke="${h.borde}" stroke-width="1.6"/><path d="M-1 -4 Q-1 -24 -2 -40" stroke="#D8EBB8" stroke-width="1.4" fill="none" stroke-linecap="round"/><path d="M-1 -14 L-9 -21 M-1 -22 L7 -29 M-1 -29 L-8 -35" stroke="#D8EBB8" stroke-width="1.1" fill="none" stroke-linecap="round" opacity=".9"/>`;
  }
  function hito(c,fruto){
    if(fruto)return `<path d="M0 -14 Q1 -22 7 -25" stroke="#6E4A30" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M5 -22 C10 -28 18 -26 19 -21 C13 -19 9 -19 5 -22Z" fill="#4F9A4A" stroke="#2F6B33" stroke-width="1"/><circle cx="0" cy="-3" r="11.5" fill="${c.color}" stroke="${c.oscuro}" stroke-width="1.8"/><ellipse cx="-4" cy="-7" rx="3.2" ry="4.4" fill="#fff" opacity=".45"/>`;
    return Array.from({length:5},(_,i)=>`<ellipse cx="0" cy="-8.5" rx="6" ry="8.5" transform="rotate(${72*i})" fill="${c.color}" stroke="${c.oscuro}" stroke-width="1.1"/>`).join('')+`<circle r="4.6" fill="#F3C24A" stroke="${c.oscuro}" stroke-width="1"/>`;
  }
  let UID=0;
  function crearSVG(data,options={}){
    const k=++UID,G='ar'+k;
    const m=normalizar(data),c=m.config,animar=new Set(options.animarIds||[]),animarHitos=new Set(options.animarHitos||[]);
    const sw=c.vaiven,tronco=[210,298,206+sw*.2,250,214-sw*.4,190,210+sw,104];
    const parts=[`<svg class="pace-arbol__svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 320" role="img" aria-label="${esc(`${c.nombre}: ${m.completadas} de ${m.total} estaciones completadas.${m.finalizada?' Unidad finalizada.':''}`)}"><title>${esc(c.nombre)} · árbol de progreso</title><desc>${esc(m.bloques.map((b,i)=>`Bloque ${i+1}: ${b.estaciones.map(s=>ETIQUETAS[s.estado]).join(', ')}${b.florece?' (florecido)':''}`).join('. '))}</desc>`,
      `<defs><linearGradient id="${G}m" x1="0" x2="1"><stop offset="0" stop-color="#A9764D"/><stop offset=".55" stop-color="#8C5D3C"/><stop offset="1" stop-color="#6E4A30"/></linearGradient><linearGradient id="${G}h" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#3F8A3E"/><stop offset="1" stop-color="#6DB25E"/></linearGradient></defs>`,
      `<circle cx="210" cy="150" r="138" fill="${c.color}" fill-opacity=".1"/><circle cx="210" cy="150" r="138" fill="none" stroke="${c.color}" stroke-opacity=".18" stroke-width="2" stroke-dasharray="2 7" stroke-linecap="round"/>`,
      `<path d="M48 306 Q210 262 372 306 Z" fill="#CFE2B4"/><path d="M92 304 Q210 280 328 304" fill="none" stroke="#A9C98A" stroke-width="2"/>`,
      `<g stroke="#8DB46C" stroke-width="1.8" stroke-linecap="round" fill="none"><path d="M118 296 l-3 -8 M122 295 l1 -9 M126 296 l4 -7"/><path d="M292 296 l-3 -8 M296 295 l1 -9 M300 296 l4 -7"/><path d="M168 288 l-2 -6 M172 288 l2 -6"/></g>`];
    c.ramas.forEach((r,i)=>parts.push(`<path class="pace-arbol__rama" data-bloque="${esc(m.bloques[i].id)}" d="${afinada(r,i<2?18:14,3.4)}" fill="url(#${G}m)" stroke="#5E3F28" stroke-width="1.4" stroke-linejoin="round"/>`));
    parts.push(`<path d="${afinada(tronco,44,13)}" fill="url(#${G}m)" stroke="#5E3F28" stroke-width="1.6" stroke-linejoin="round"/>`,
      `<path d="M197 268 q4 -6 2 -12 M222 236 q-4 -6 -1 -13 M200 206 q3 -5 1 -10" fill="none" stroke="#5E3F28" stroke-width="1.3" stroke-linecap="round" opacity=".7"/>`,
      `<path d="M203 290 Q208 250 205 214 Q203 186 207 160" fill="none" stroke="#C99A6B" stroke-width="3" stroke-linecap="round" opacity=".65"/>`,
      `<path d="M217 276 Q222 262 219 250" fill="none" stroke="${c.color}" stroke-width="3" stroke-linecap="round"/>`);
    m.bloques.forEach((b,j)=>{
      const r=c.ramas[j],n=b.estaciones.length,ts=posiciones(n),lp=punto(r,.17),lt=tangente(r,.17),lsg=-lt[0]>0?1:-1,label=[lp[0],lp[1]+13];
      b.estaciones.forEach((s,i)=>{
        const t=ts[i],[x,y]=punto(r,t),[tx,ty]=tangente(r,t);
        let nx=ty,ny=-tx;if(ny>0){nx=-nx;ny=-ny;}           /* normal hacia arriba */
        const lado=i%2===0?1:-1,ang=Math.atan2(ny,nx)+lado*0.42,L=9,bx=x+Math.cos(ang)*L,by=y+Math.sin(ang)*L;
        const rot=ang*180/Math.PI+90,esc2=(n>3?.92:1)*(s.estado==='completada'?(i%2?1.08:.96):1);
        parts.push(`<g class="pace-arbol__estacion" data-estacion="${esc(s.id)}" data-estado="${s.estado}"><title>${esc(s.nombre)} — ${ETIQUETAS[s.estado]}</title><path d="M${round(x)} ${round(y)} L${round(bx)} ${round(by)}" stroke="#6E4A30" stroke-width="2.4" stroke-linecap="round"/><g transform="translate(${round(bx)} ${round(by)}) rotate(${round(rot)}) scale(${esc2})"><g class="pace-arbol__crecimiento${animar.has(s.id)?' pace-arbol__crecimiento--animar':''}">${hoja(s.estado,G)}</g></g></g>`);
      });
      parts.push(`<g class="pace-arbol__numero"><circle cx="${round(label[0])}" cy="${round(label[1])}" r="9.5" fill="#fff" stroke="${c.oscuro}" stroke-width="1.4"/><text x="${round(label[0])}" y="${round(label[1]+4)}" text-anchor="middle" font-size="11" font-weight="800" fill="${c.oscuro}">${j+1}</text></g>`);
      if(b.florece||m.finalizada){
        const type=m.finalizada?'fruto':'flor',[ex,ey]=punto(r,1),[tx,ty]=tangente(r,1),hx=ex+tx*7,hy=ey+ty*7+(type==='fruto'?16:0);
        parts.push(`<g class="pace-arbol__hito" data-hito="${type}" data-bloque="${esc(b.id)}" transform="translate(${round(hx)} ${round(hy)})"><title>${m.finalizada?'Unidad finalizada: fruto':'Bloque terminado: flor'}</title><g class="pace-arbol__crecimiento${animarHitos.has(b.id)?' pace-arbol__crecimiento--animar':''}">${hito(c,type==='fruto')}</g></g>`);
      }
    });
    return parts.join('')+'</svg>';
  }
  function montar(container,data,options={}){
    if(!container||typeof container.replaceChildren!=='function')throw new Error('Contenedor DOM requerido.');
    let prev=null,actual=null;
    function actualizar(next,{animar=true}={}){
      const m=normalizar(next),ids=[],hitos=[];
      if(animar&&prev&&prev.unidad===m.unidad){
        const old=new Map(prev.bloques.flatMap(b=>b.estaciones).map(s=>[s.id,s.estado]));
        m.bloques.forEach(b=>{b.estaciones.forEach(s=>{if(old.has(s.id)&&old.get(s.id)!==s.estado&&s.estado!=='pendiente')ids.push(s.id);});
          const before=prev.bloques.find(x=>x.id===b.id),antes=!!before&&(before.florece||prev.finalizada),ahora=b.florece||m.finalizada;
          if(ahora&&(!antes||prev.finalizada!==m.finalizada))hitos.push(b.id);});
      }
      const svg=crearSVG(next,{animarIds:ids,animarHitos:hitos});
      const doc=container.ownerDocument,template=doc.createElement('template');template.innerHTML=svg;
      const wrapper=doc.createElement('div');wrapper.className='pace-arbol';wrapper.style.setProperty('--pace-unidad',m.config.color);wrapper.append(template.content);
      if(options.resumen!==false){
        if(options.resumen!=='estado'){const p=doc.createElement('p');p.className='pace-arbol__resumen';p.textContent=`${m.completadas} de ${m.total} estaciones completadas`;wrapper.append(p);}
        const status=doc.createElement('p');status.className='pace-arbol__estado';
        status.textContent=m.finalizada?'Unidad finalizada: tu árbol dio frutos':m.todasCompletadas?'Todas las estaciones completadas · falta finalizar la unidad':[m.enProgreso?`${m.enProgreso} en progreso`:'',m.pendientes?`${m.pendientes} ${m.pendientes===1?'pendiente':'pendientes'}`:''].filter(Boolean).join(' · ');
        wrapper.append(status);}
      container.replaceChildren(wrapper);prev=m;actual=m;
      return m;
    }
    actualizar(data,{animar:false});
    return {actualizar,obtenerResumen:()=>({unidad:actual.unidad,total:actual.total,completadas:actual.completadas,enProgreso:actual.enProgreso,pendientes:actual.pendientes,todasCompletadas:actual.todasCompletadas,finalizada:actual.finalizada,inconsistente:actual.inconsistente}),destruir:()=>{container.replaceChildren();prev=null;actual=null;}};
  }
  function datosDemo(unidad){const c=UNIDADES[unidad];return {unidad,unidadFinalizada:false,bloques:c.cantidades.map((n,i)=>({id:`${unidad}-b${i+1}`,nombre:`Bloque ${i+1}`,estaciones:Array.from({length:n},(_,j)=>({id:`${unidad}-b${i+1}-e${j+1}`,nombre:`Bloque ${i+1}, estación ${j+1}`,estado:'pendiente'}))}))};}
  return {UNIDADES,HOJAS,ESTADOS,ETIQUETAS,normalizar,crearSVG,montar,datosDemo};
});
