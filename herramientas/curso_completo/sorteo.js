/* Sorteo estratificado por modalidad (23-11-2026, propuesta de Henry):
   · Practica: se mantienen las cuotas por nivel (p. ej. 2·2·1). Dentro de cada nivel, mitad alternativas (A) y mitad escritas (E).
     Si la cuota de un nivel es impar, la pregunta extra alterna de modalidad entre rondas: 3A+2E en la ronda 1, 2A+3E en la ronda 2, etc.
   · Aplica: 1 A + 1 E cuando se sortean 2.
   · Cada subbanco (nivel, modalidad) se baraja con la semilla del estudiante y se recorre sin repetir hasta agotarse,
     con desplazamientos acumulados por ronda. Si una modalidad ya dio una vuelta completa y la otra no, se usa la otra
     antes de repetir (así un subbanco pequeño no se repite antes de tiempo).
   · Si falta una modalidad, se completa con la otra del mismo nivel. Nunca bloquea. */
function stratDraw(s,items,gOf,quota,salt,round){
 const G=quota.length,sub={};
 items.forEach((q,i)=>{const g=gOf(q),m=q&&q.type==='input'?'E':'A';(sub[g+m]=sub[g+m]||[]).push(i);});
 if(Number.isInteger(state.seed))for(const k in sub){const L=sub[k],r=rng((state.seed^hashStr(s.id+salt+k))>>>0);for(let i=L.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[L[i],L[j]]=[L[j],L[i]];}}
 const n={},u={};for(let g=0;g<G;g++){n[g+'A']=(sub[g+'A']||[]).length;n[g+'E']=(sub[g+'E']||[]).length;u[g+'A']=0;u[g+'E']=0;}
 let out=[];
 for(let rd=0;rd<=round;rd++){out=[];let odd=0;
  for(let g=0;g<G;g++){const k=quota[g]||0,h=Math.floor(k/2);let a=h,e=h;if(k%2){((rd+odd)%2===0)?a++:e++;odd++;}
   const want=[];const first=rd%2?'E':'A',second=first==='A'?'E':'A';const cnt={A:a,E:e};
   for(let t=0;t<k;t++){const m=(t%2===0?first:second);if(cnt[m]>0){want.push(m);cnt[m]--;}else{const o=m==='A'?'E':'A';want.push(o);cnt[o]--;}}
   const inRound={A:0,E:0};
   for(const m0 of want){const o0=m0==='A'?'E':'A';let m=m0;const K=x=>g+x,pass=x=>n[K(x)]?Math.floor(u[K(x)]/n[K(x)]):1e9;
    if(!n[K(m)]||inRound[m]>=n[K(m)]||(n[K(o0)]&&inRound[o0]<n[K(o0)]&&pass(m)>pass(o0)))m=o0;
    if(!n[K(m)]||inRound[m]>=n[K(m)])continue;
    out.push(sub[K(m)][u[K(m)]%n[K(m)]]);u[K(m)]++;inRound[m]++;}
  }}
 return out;}
function drawnIndices(s){
 const n=s.practice.length,d=drawCount(s);
 if(!hasLevels(s)){if(d>=n)return [...Array(n).keys()];return stratDraw(s,s.practice,()=>0,[d],'N',roundOf(s));}
 const by=[[],[],[]];s.practice.forEach((q,i)=>by[lvlOf(q)-1].push(i));
 if(d>=n)return by[0].concat(by[1],by[2]);
 return stratDraw(s,s.practice,q=>lvlOf(q)-1,levelQuota(d,by.map(x=>x.length)),'L',roundOf(s));}
