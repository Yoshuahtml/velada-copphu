import QRCode from 'qrcode';import {mkdir,writeFile} from 'node:fs/promises';
const value=process.argv[2]||'https://velada-navidad-copphu.limitlessmyrrh.chatgpt.site/';
const url=new URL(value);if(!['https:','http:'].includes(url.protocol))throw Error('Usa una URL http(s).');
await mkdir('public/qr',{recursive:true});const options={errorCorrectionLevel:'M',margin:4,color:{dark:'#000000',light:'#FFFFFF'}};
await QRCode.toFile('public/qr/velada.png',url.href,{...options,width:1000});await writeFile('public/qr/velada.svg',await QRCode.toString(url.href,{...options,type:'svg'}));await writeFile('public/qr/destino.txt',url.href+'\n');console.log('QR PNG + SVG: '+url.href);
