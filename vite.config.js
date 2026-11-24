import {defineConfig,loadEnv} from 'vite';
import {resolve} from 'node:path';
export default defineConfig(({mode})=>{const env=loadEnv(mode,process.cwd(),'SUPABASE_');const key=env.SUPABASE_ANON_KEY||'';
if(key.startsWith('sb_secret_'))throw Error('No uses claves secretas en el frontend.');
if(key.startsWith('eyJ')){let payload;try{payload=JSON.parse(Buffer.from(key.split('.')[1],'base64url').toString())}catch{throw Error('Clave anon JWT inválida.')}if(payload.role!=='anon')throw Error('La clave pública debe tener rol anon.');}
return {define:{__SUPABASE_URL__:JSON.stringify(env.SUPABASE_URL||''),__SUPABASE_ANON_KEY__:JSON.stringify(key)},build:{rollupOptions:{input:{main:resolve('index.html'),admin:resolve('admin/index.html')}}}}});
