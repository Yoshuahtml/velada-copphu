# Verificación

## Comprobado
- Build Vite de ambas rutas, JavaScript vanilla sin framework UI.
- Pruebas de validación y CSV con BOM, ñ/tildes, comillas y prevención de fórmulas.
- PostgreSQL real local/PGlite: anonimato sin lectura, RPC atómica, límites, hijo mínimo, honeypot, normalización/orden y ventana de 10 minutos, coordinador único verificado, otras cuentas sin acceso y cascada.
- DOM/jsdom: agregar/quitar hijos, máximo 12, envío deshabilitado, confirmación, error conservando datos, XSS tratado como texto, totales y búsqueda.
- SQL en Supabase real: envío como anon y reintento normalizado crean una familia/un hijo; SELECT anon denegado. Todos los fixtures se revierten con ROLLBACK.
- Migración remota `20261124164753_velada_familias`, proyecto `clbvawvddlybjdzmbpse` separado de NOZZIOLA.
- Asesor de seguridad: solo aviso informativo de RLS sin políticas en tabla privada coordinador. Intencional: ningún cliente tiene acceso; el trigger y funciones privadas autorizadas administran esa fila.

- QR PNG decodificado con ZXing: contiene exactamente https://velada-navidad-copphu.limitlessmyrrh.chatgpt.site/.

## Límites
- No se pudo realizar inspección visual en navegador: este entorno no ofrece la herramienta de navegador requerida para la vista previa administrada. No se presentan capturas inventadas ni se afirma validación visual.
- La creación del usuario Auth con contraseña elegida por el propietario queda como paso del README. La asignación del único rol autorizado ocurre después de confirmar el correo.
- Falta prueba de login real con esa cuenta, carga visual en teléfonos físicos y escaneo impreso del QR.
- Honeypot es protección básica, no protección completa contra abuso automatizado.
- El QR contiene la URL pública final. Sus versiones PNG/SVG no incluyen datos de familias.

## Revisión editorial y boleta — 24 noviembre 2026
- Pruebas de formulario, XSS, CSV, RLS, duplicados y borrado: pasan.
- Build de producción: pasa. Landing sin enlaces admin ni QR: comprobado con DOM.
- WOFF2 oficiales válidos; Tanker y Bespoke Serif contienen 379/381 caracteres Unicode.
- PDF renderizado e inspeccionado: QR no tapa fecha, lugar ni aporte. QR del render decodificado con ZXing a la URL pública correcta.
- No hubo herramienta de navegador disponible para capturas reales; no se afirma verificación visual en navegador ni login real del coordinador aún no creado.
