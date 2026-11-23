"""Arma PACE_CURSO_COMPLETO.html (un solo archivo, sin carpetas) a partir de SCORM_CURSO_COMPLETO.zip.
Uso: python3 html_unico.py SCORM_CURSO_COMPLETO.zip PACE_CURSO_COMPLETO.html"""
import sys,zipfile,re
z=zipfile.ZipFile(sys.argv[1]);R=lambda n:z.read(n).decode('utf8')
s=R('index.html')
def inline_css(m):return '<style>'+R(m.group(1))+'</style>'
def inline_js(m):return '<script>'+R(m.group(1)).replace('</script','<\\/script')+'</script>'
s=re.sub(r'<link rel="stylesheet" href="([^"?]+)(\?[^"]*)?">',inline_css,s)
s=re.sub(r'<script(?: defer)? src="([^"?]+)(\?[^"]*)?"></script>',inline_js,s)
assert not re.search(r'<script[^>]* src="(?!https?:)',s),'quedó un script externo'
open(sys.argv[2],'w',encoding='utf8').write(s)
print('Listo:',sys.argv[2],round(len(s)/1e6,1),'MB')
