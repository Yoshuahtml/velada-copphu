# Velada Navideña COPPHU
HTML, CSS y JavaScript vanilla con Vite y Supabase. No usa React. La familia completa el registro; ese envío cuenta como asistencia, sin verificar entrada física.

## Evento y enlaces
Circular COPPHU-SD-024/2026-2027: **lunes 14 de diciembre de 2026, 9:00 a. m., Auditorio Horacio Álvarez Saviñón de la UNPHU**. Datos editables en `src/config.js`. La circular también solicita RD$300 por familia en la caja del colegio antes del 4 de diciembre: esta aplicación NO cobra ni verifica aportes.

- Bienvenida: https://velada-copphu-2026.vercel.app/
- Panel: https://velada-copphu-2026.vercel.app/admin/
- Supabase dedicado: https://supabase.com/dashboard/project/clbvawvddlybjdzmbpse

## Abrir localmente en VS Code (Linux/Fish)
Abre la carpeta que contiene `package.json`, no su carpeta contenedora. Node.js 24 LTS recomendado.

```fish
cp -n .env.example .env.local
npm ci
npm run dev
```
Abre la URL de Vite, normalmente http://localhost:5173/ y http://localhost:5173/admin/. Mantén la terminal abierta. No usar Live Server ni abrir el HTML como archivo. `.env.example` incluye únicamente la URL y clave publicable del proyecto creado. El entorno local usa la MISMA base; no registra datos de prueba sin intención.

## Crear un proyecto Supabase desde cero
1. Crea un proyecto Free en https://supabase.com/dashboard (revisa las cuotas y costos vigentes).
2. En SQL Editor ejecuta UNA vez `supabase/migrations/20261124164753_velada_familias.sql`. En el proyecto conectado ya está aplicado: NO repetir.
3. Cambia el correo autorizado en esa migración antes de aplicarla si el coordinador será otro.
4. Copia Project URL y la clave **anon o publishable** a `.env.local`: `SUPABASE_URL` y `SUPABASE_ANON_KEY`.
5. Nunca uses `service_role` ni `sb_secret_`: el build rechaza estas claves. El frontend necesita solo la clave pública, protegida por RLS.

## Crear el único coordinador
La cuenta de NOZZIOLA no se comparte entre proyectos Supabase. No se guardan contraseñas en el código.

1. Abre el proyecto **Velada COPPHU**, Authentication → Users → Add user → Create new user.
2. Usa `25-0881@copphu.unphu.edu.do` y una contraseña única que tú elijas. Como propietario, confirma el correo solo si has verificado que te pertenece; alternativamente usa la invitación de Supabase y completa la verificación.
3. Al quedar confirmado ese correo, el trigger asigna automáticamente el único puesto de coordinador. Ningún otro correo se activa. No hace falta editar JavaScript ni insertar roles desde el navegador.
4. Entra en `/admin/` con ese correo y contraseña. Si ya creaste una cuenta sin confirmar, confírmala desde Auth antes de probar.
5. En Auth → URL Configuration configura Site URL con la URL desplegada y agrega las URLs autorizadas de producción/local si utilizas invitaciones o recuperación. Desactiva nuevas inscripciones en Authentication → Sign In / Providers después de crear tu coordinador: las familias no necesitan cuentas.

El correo público de contacto está en `src/config.js`; cambiarlo NO cambia la autorización. Para sustituir al coordinador, un administrador de la base debe hacerlo en SQL Editor después de verificar el nuevo usuario:

```sql
-- Sustituye el correo por el nuevo correo VERIFICADO. Solo puede existir una fila.
update velada_privada.coordinador
set usuario_id = (
  select id from auth.users
  where lower(email) = lower('nuevo-coordinador@colegio.edu.do')
    and email_confirmed_at is not null
)
where unico = true;
```
El trigger de alta sigue configurado con el correo original; actualízalo si también deseas cambiar el mecanismo de alta futura.

## Seguridad e integridad
- Público anon: únicamente RPC `registrar_familia`. Sin SELECT/UPDATE/DELETE ni INSERT directo. Esta restricción adicional evita saltarse validación, deduplicación y transacción de familia+hijos.
- Usuario autenticado cualquiera: sin acceso a datos; solo el UUID del coordinador puede leer/borrar mediante RLS.
- Definidores privados con `search_path=''`, permisos explícitos y wrapper público invoker. La excepción anónima solo registra; no devuelve filas, UUID ni si existía la familia.
- Un solo coordinador con correo verificado; la tabla privada no tiene políticas cliente deliberadamente (deny-all).
- Longitudes: apellidos/representante 120, nombre de hijo 100, curso 60. De 1 a 12 hijos. Validación en JS y PostgreSQL.
- Misma familia y mismos nombres de hijos durante 10 minutos: una sola fila. Mayúsculas, espacios y orden de hijos no importan. Grado y representante no distinguen duplicados. Usa bloqueo transaccional para envíos simultáneos. Los registros de homónimos pueden coincidir: es el criterio solicitado, no identificación oficial.
- Honeypot también validado en servidor. Es una barrera básica, NO un CAPTCHA ni límite por IP. Para abuso deliberado añade Turnstile y una Edge Function que valide el token antes de permitir la RPC.
- Render con `textContent`, sin interpolar datos de familias en HTML. CSV UTF-8 con BOM, separador `;`, comillas escapadas y protección contra fórmulas de Excel.
- Los datos de menores no se muestran públicamente, ni se guardan en localStorage ni en analítica. Auth sí conserva la sesión del coordinador; cerrar sesión en equipos compartidos.
- Define con el colegio el tiempo de conservación; exporta con cuidado y elimina los registros cuando ya no sean necesarios. No se afirma cumplimiento legal automático.

## Panel
Totales de todas las familias e hijos; paginación interna por UUID de 500 en 500; búsqueda por apellido sin distinguir tildes; exportación de resultados filtrados; borrado con diálogo de confirmación y cascada. «Actualizar» consulta nuevos envíos. No pretende verificar asistencia física. Las fechas se presentan en America/Santo_Domingo.

## QR funcional
El QR aparece exclusivamente en la boleta, nunca en la landing. Apunta a la bienvenida pública. El panel no tiene enlace visible desde la landing. Boleta lista: `/boletas/Boleta-COPPHU-con-QR.pdf`. Archivos para imprenta:
- `/qr/velada.png`: 1000px, blanco/negro, margen de cuatro módulos.
- `/qr/velada.svg`: vector para imprenta.

Si despliegas en otro dominio:
```fish
npm run qr -- https://TU-DOMINIO/
npm run build
```
Regenera la boleta: `python3 scripts/boleta.py` (requiere PyMuPDF). Imprime con margen blanco y tamaño de al menos 2,5cm (la boleta original usa 2,54cm); prueba con dos celulares antes de imprimir boletas. No uses una URL localhost ni un sitio que requiera login para la bienvenida.

## Desplegar gratis
Conserva Supabase como backend; límites gratuitos sujetos al proveedor. No requiere servidor Node en producción.

### Netlify
Importa el repositorio; build `npm run build`, carpeta `dist`; variables `SUPABASE_URL` y `SUPABASE_ANON_KEY`. `/admin/` es un archivo real. `_headers` añade encabezados de seguridad.

### Cloudflare Pages
Conecta el repositorio; framework Vite, build `npm run build`, salida `dist`, Node 24 y las dos variables públicas. Alternativamente usa Direct Upload con el contenido de `dist`. El archivo `_headers` se procesa en Pages.

### Vercel
Importa el repo como Vite; build `npm run build`, output `dist`, variables públicas. No hace falta reescribir todo al index porque `/admin/index.html` existe. Configura encabezados equivalentes en vercel.json si usas Vercel: `_headers` es específico de Netlify/Pages.

Después actualiza Auth URL Configuration, regenera el QR con el dominio final, recompila y prueba registro y login desde móvil.

## Comandos y archivos
```fish
npm test
npm run build
npm run package
```
`npm test` valida dominio y PostgreSQL real local mediante PGlite. El ZIP `dist/entrega/VELADA-COPPHU-codigo.zip` excluye .env.local, node_modules y credenciales privadas. `QA.md` distingue pruebas locales y alojadas.

`src/main.js`: formulario; `src/admin.js`: panel; `src/domain.js`: límites/CSV; `src/api.js`: cliente; `src/styles.css`: diseño; `supabase/migrations`: SQL completo.

Tipografías oficiales Fontshare: Tanker Regular y Bespoke Serif Regular. Referencias y licencia en `public/fonts/FONTS-LICENSE.txt`.

Repositorio: https://github.com/Yoshuahtml/velada-copphu

```fish
git clone https://github.com/Yoshuahtml/velada-copphu.git
cd velada-copphu
code .
cp -n .env.example .env.local
npm ci
npm run dev
```
