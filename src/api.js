import {createClient} from '@supabase/supabase-js';
const url=__SUPABASE_URL__,key=__SUPABASE_ANON_KEY__;
export const configurado=/^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(url)&&!!key&&!key.startsWith('TU_');
export const db=configurado?createClient(url,key,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}}):null;
export function mensajeError(error){if(!navigator.onLine)return 'No hay conexión. Revisa tu internet y vuelve a intentarlo.';if(error?.code==='22023')return error.message;if(error?.status===429)return 'Hay demasiados intentos. Espera un momento y vuelve a intentarlo.';return 'No pudimos guardar los cambios. Inténtalo de nuevo; tus datos siguen en el formulario.';}
