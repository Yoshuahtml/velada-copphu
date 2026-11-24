from pathlib import Path
from zipfile import ZipFile,ZIP_DEFLATED
Path('dist/entrega').mkdir(parents=True,exist_ok=True)
with ZipFile('dist/entrega/VELADA-COPPHU-codigo.zip','w',ZIP_DEFLATED) as z:
 for name in ['assets','index.html','admin','src','public','supabase','scripts','tests','package.json','package-lock.json','vite.config.js','.env.example','.gitignore','README.md','PRODUCT.md','DESIGN.md','QA.md']:
  p=Path(name)
  for f in p.rglob('*') if p.is_dir() else [p]:
   if f.is_file() and '.temp' not in f.parts:z.write(f,Path('VELADA-COPPHU')/f)
print('ZIP creado: sin .env.local, dependencias ni claves administrativas.')
