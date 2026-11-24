"""Requiere: pip install PyMuPDF. Ejecuta npm run qr primero."""
from pathlib import Path
try:
	import pymupdf as fitz
except ModuleNotFoundError:
	import fitz
root=Path(__file__).resolve().parent.parent
doc=fitz.open(root/'assets/boleta-original.pdf')
page=doc[0]
rect=fitz.Rect(510,29,582,101)
page.draw_rect(rect,color=(1,1,1),fill=(1,1,1),overlay=True)
page.insert_image(rect,filename=str(root/'public/qr/velada.png'),overlay=True)
url=(root/'public/qr/destino.txt').read_text().strip()
page.insert_link({'kind':fitz.LINK_URI,'from':rect,'uri':url})
out=root/'public/boletas/Boleta-COPPHU-con-QR.pdf'
out.parent.mkdir(parents=True,exist_ok=True)
doc.save(out,garbage=4,deflate=True)
print(out)
