import {JSDOM} from 'jsdom';import {readFileSync} from 'node:fs';import assert from 'node:assert/strict';import {validarFamilia,LIMITES,buscarTexto,csvFamilias} from '../src/domain.js';
const pause=()=>new Promise(r=>setTimeout(r,20));
const html=readFileSync('index.html','utf8');const dom=new JSDOM(html,{url:'https://test.invalid/'});const document=dom.window.document;const calls=[];let fail=false;
assert.equal(document.querySelector('a[href*=admin], .qr-share, img[src*=qr]'),null);
const source=readFileSync('src/main.js','utf8').replace(/^import .*;\n/gm,'');
const fn=new Function('document','configurarPagina','db','configurado','mensajeError','validarFamilia','LIMITES',source);
fn(document,()=>{},{rpc:async(name,payload)=>{calls.push({name,payload});return fail?{error:{}}:{data:{registrado:true}};}},true,()=> 'Error temporal',validarFamilia,LIMITES);
const form=document.querySelector('form'); // Browser form named properties are supplied explicitly for jsdom.
for(const name of ['apellidos','representante','website'])Object.defineProperty(form,name,{value:form.elements.namedItem(name)});
form.apellidos.value='<img src=x onerror=alert(1)> Peña';document.querySelector('[data-field=nombre]').value='Ana';document.querySelector('#add-child').click();assert.equal(document.querySelectorAll('.child').length,2);document.querySelectorAll('[data-field=nombre]')[1].value='José';
form.dispatchEvent(new dom.window.Event('submit',{cancelable:true}));assert.equal(document.querySelector('#submit').disabled,true);await pause();assert.equal(calls.length,1);assert.equal(calls[0].payload.p_hijos.length,2);assert.equal(document.querySelector('#confirmation img'),null);assert(document.querySelector('#confirmation-title').textContent.includes('<img'));assert.equal(form.hidden,true);
// Reinicia los campos únicamente para probar otro escenario.
form.reset();
while (document.querySelectorAll('.child').length > 1) {
  document.querySelector('.child button').click();
}
form.hidden = false;
document.querySelector('#confirmation').hidden = true;
document.querySelector('.form-intro').hidden = false;assert.equal(document.querySelectorAll('.child').length,1);form.apellidos.value='Peña';document.querySelector('[data-field=nombre]').value='Ana';fail=true;form.dispatchEvent(new dom.window.Event('submit',{cancelable:true}));await pause();assert.equal(form.hidden,false);assert.equal(form.apellidos.value,'Peña');assert.equal(document.querySelector('#form-error').hidden,false);
for(let i=0;i<15;i++)document.querySelector('#add-child').click();assert.equal(document.querySelectorAll('.child').length,12);assert.equal(document.querySelector('#add-child').disabled,true);
const admin=new JSDOM(readFileSync('admin/index.html','utf8'),{url:'https://test.invalid/admin/'});const d=admin.window.document;const family={id:'a',apellidos:'Peña <script>alert(1)</script>',representante:'Tutor',creado_en:'2026-12-14T13:00:00Z',hijos:[{nombre:'Ana',grado:'1º'}]};
const query={select(){return this},order(){return this},limit(){return Promise.resolve({data:[family],error:null})}};
const db={auth:{getSession:async()=>({data:{session:{user:{id:'coordinator'}}}}),onAuthStateChange(){},signOut:async()=>({})},rpc:async()=>({data:true}),from:()=>query};
const adminSource=readFileSync('src/admin.js','utf8').replace(/^import .*;\n/gm,'');const AsyncFunction=Object.getPrototypeOf(async function(){}).constructor;
await new AsyncFunction('document','configurarPagina','db','buscarTexto','csvFamilias','Blob','URL',adminSource)(d,()=>{},db,buscarTexto,csvFamilias,Blob,URL);
assert.equal(d.querySelector('#total-families').textContent,'1');assert.equal(d.querySelector('#total-children').textContent,'1');assert.equal(d.querySelector('#families script'),null);d.querySelector('#search').value='pena';d.querySelector('#search').dispatchEvent(new admin.window.Event('input'));assert.equal(d.querySelectorAll('#families tr').length,1);d.querySelector('#search').value='otro';d.querySelector('#search').dispatchEvent(new admin.window.Event('input'));assert.equal(d.querySelectorAll('#families tr').length,0);
console.log('PASS DOM/jsdom: lista dinámica, límite, envío bloqueado, éxito, XSS como texto, error conserva datos, totales y buscador del panel. No prueba visual de navegador.');
