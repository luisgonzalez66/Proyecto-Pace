"""Genera chucao5_img.js (imágenes del chucao en 5 etapas, en WebP incrustado) desde las láminas de Henry.
Uso: python3 herramientas/curso_completo/chucao5/generar_imagenes.py
Fuente: «Propuestas de mejoras/Chucao_5_Etapas_Recursos» (PNG 680×850, base del tronco en y≈823).
Todas las imágenes de un mismo tipo se recortan con el MISMO recuadro (no por imagen), así se conserva el crecimiento entre etapas."""
import os,glob,io,base64,json
from PIL import Image
HERE=os.path.dirname(os.path.abspath(__file__))
SRC=os.path.join(HERE,'..','..','..','Propuestas de mejoras','Chucao_5_Etapas_Recursos')
VAR={'learn':'Aprende','practice':'Practica','check':'Aplica','explore':'Explora'}
def carga(st,v):return Image.open(glob.glob(os.path.join(SRC,f'Etapa_{st}_*',f'Chucao_Etapa_{st}_{v}.png'))[0]).convert('RGBA')
def union(ims):
    bb=[im.getchannel('A').getbbox() for im in ims]
    return min(b[0] for b in bb),min(b[1] for b in bb),max(b[2] for b in bb),max(b[3] for b in bb)
def webp(im,h,q):
    w=round(im.width*h/im.height);b=io.BytesIO();im.resize((w,h),Image.LANCZOS).save(b,'WEBP',quality=q,method=6)
    return 'data:image/webp;base64,'+base64.b64encode(b.getvalue()).decode(),b.tell()
out={'n':[],'v':{k:[] for k in VAR}};tot=0
N=[carga(s,'Normal') for s in range(1,6)];x0,y0,x1,y1=union(N);pad=8
box=(max(0,x0-pad),max(0,y0-pad),min(680,x1+pad),min(850,y1+pad))
for im in N:
    d,n=webp(im.crop(box),400,80);out['n'].append(d);tot+=n
A={k:[carga(s,v) for s in range(1,6)] for k,v in VAR.items()}
x0,y0,x1,y1=union([im for L in A.values() for im in L])
boxA=(max(0,x0-pad),max(0,y0-pad),min(680,x1+pad),min(850,y1+pad))
for k,L in A.items():
    for im in L:
        d,n=webp(im.crop(boxA),180,82);out['v'][k].append(d);tot+=n
open(os.path.join(HERE,'chucao5_img.js'),'w').write('/* Generado por generar_imagenes.py: no editar a mano. */\nvar CHU5_IMG='+json.dumps(out,separators=(',',':'))+';\n')
print('recuadro normal',box,'recuadro APAE',boxA,'total KB',tot//1024)
