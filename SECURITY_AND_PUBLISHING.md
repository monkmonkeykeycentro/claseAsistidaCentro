# Revisión de privacidad y preparación de producción

Revisión del 6 de noviembre de 2026 sobre el código y la compilación locales. Los informes redactados se guardan en `.firebase/security-audit/`, excluido de Git y del despliegue.

## Correcciones aplicadas

- La URI y contraseña de MongoDB, el proyecto de autenticación del servidor y la lista `CMS_ADMIN_UIDS` se configuran mediante `.env.local`. En Vercel se deben configurar como variables del servidor. No se copiaron valores reales a `.env.example`.
- Se eliminó el archivo con la configuración Firebase del proyecto y las cuentas personales incrustadas en código, pruebas y documentación operativa. Los permisos administrativos se resuelven en el servidor por UID configurado o por la colección protegida `admins`; el navegador no tiene una lista de administradores.
- La API filtra identidades y credenciales de los documentos públicos, incluidos los metadatos anidados y las plantillas almacenadas como JSON. También rechaza filtros públicos que intenten consultar esos campos. Los administradores conservan acceso al historial privado para trabajar.
- Los perfiles, avances, evidencias, diseños, directorio de administradores y revisiones requieren la identidad verificada y los permisos correspondientes. Un `role`, correo o UID enviado por el cliente no autentica una petición.
- Las miniaturas p5.js se ejecutan con `sandbox="allow-scripts"`, sin el permiso de mismo origen. La prueba en Chrome verificó que el sketch dibuja su canvas y no puede leer el documento ni localStorage de la aplicación principal.
- Los mensajes de autenticación y los registros de errores dejan de mostrar objetos completos del SDK que puedan incluir respuestas OAuth. El error boundary no imprime mensajes internos en producción.
- Vite publica únicamente una lista explícita de variables públicas. Una prueba con una variable VITE desconocida confirmó que no se publica. El build exige MongoDB y configuración Firebase coherente, y no genera sourcemaps.
- `.gitignore`, `.vercelignore` y las exclusiones de las funciones protegen archivos de entorno, respaldos, cuentas locales, claves y credenciales. El documento curricular interno se movió fuera de `public/`.
- Se retiró el SDK de Gemini que no utilizaba la aplicación y se actualizaron dependencias vulnerables. Las actualizaciones incluyen versiones corregidas de gRPC, glob y UUID; se probaron los consumidores de glob y el archivado ZIP.

## Qué es público y qué es privado

`MONGODB_URI` y `CMS_ADMIN_UIDS` son privados. No deben llevar prefijo `VITE_`. Los UID reales siguen existiendo en la base de datos y en la sesión de su propietario: son necesarios para asociar sus trabajos. No son contraseñas, y conocer uno no permite acceder a otro usuario sin un token válido.

La configuración web `VITE_FIREBASE_*` y el identificador OAuth `VITE_GOOGLE_CLIENT_ID` son públicos por diseño y estarán en el navegador. Moverlos a un archivo de entorno evita incrustar la configuración de una persona en el repositorio, pero no los convierte en secretos. La clave web de Firebase debe limitarse a las APIs de Firebase que se utilizan; no debe reutilizarse como clave de Gemini u otros servicios de pago.

Referencias: [Firebase y sus claves web](https://firebase.google.com/docs/projects/api-keys), [variables públicas de Vite](https://vite.dev/guide/env-and-mode), [aislamiento de iframes](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/iframe#sandbox).

Los contenidos y enlaces que un administrador publica en el CMS siguen siendo públicos. El filtro elimina campos de identidad y credenciales; no pretende censurar textos, código o imágenes que un administrador publique deliberadamente.

## Resultados y límites

- Gitleaks no detectó secretos en los 157 archivos publicables revisados. La comprobación de los valores privados configurados tampoco encontró coincidencias en el código, los seis archivos compilados ni el historial de diferencias de Git. Los recuentos corresponden al estado revisado.
- El historial alcanzable revisado contiene dos detecciones de claves web públicas de Firebase en versiones antiguas del archivo de configuración. No se encontraron credenciales privadas mediante Gitleaks. El historial conserva versiones anteriores de textos personales; borrar el archivo actual no reescribe Git.
- `npm audit --omit=dev` terminó sin vulnerabilidades conocidas. La auditoría completa conserva tres avisos moderados en la cadena de desarrollo de Firebase CLI (`firebase-tools → @google-cloud/pubsub → @opentelemetry/core`). Esa cadena no forma parte de la API desplegada. No se forzó una migración incompatible de OpenTelemetry ni una degradación de Firebase CLI.
- Pasaron 108 pruebas unitarias y de servicios, la prueba de integración con MongoDB y las verificaciones de tipos y compilación. La API real se comprobó con las diez colecciones públicas y 484 documentos accesibles: no expuso los valores privados configurados ni los campos de identidad filtrados, y rechazó sesiones falsas y las colecciones privadas.
- La compilación de producción cargó correctamente en Chrome sin errores de inicialización. Las solicitudes de archivos privados devolvieron únicamente la página pública de la SPA. El servidor Vite también bloquea por configuración las carpetas privadas y los respaldos.
- El archivo MP4 no mostró etiquetas de autor, propietario, ubicación o comentario en la inspección de metadatos.

Esta revisión no garantiza ausencia absoluta de vulnerabilidades. No valida las restricciones de claves en Google Cloud, las reglas ya desplegadas en el proyecto Firebase antiguo, la lista de IP de Atlas, las políticas de la cuenta Vercel ni cambios posteriores a la revisión. Se revisó y probó el código local; no se publicó un despliegue automáticamente.

## Publicar

1. Usa Node 24.12 o posterior dentro de la rama 24.x, requerido por las dependencias instaladas.
2. Configura en Vercel las variables de `.env.example` con los valores correctos. `MONGODB_URI`, `MONGODB_DB`, `FIREBASE_PROJECT_ID` y `CMS_ADMIN_UIDS` son del servidor. Las variables `VITE_*` de la lista permitida son públicas. El proyecto de autenticación debe coincidir en ambos lados.
3. Configura el dominio de producción en Firebase Auth y en el cliente OAuth de Google. Confirma las restricciones de la clave web y el acceso de red a Atlas para el servidor.
4. Ejecuta `npm run lint`, `npm test`, `npm run build` y `npm run security:check`. Revisa `npm audit --omit=dev` antes de publicar, porque los avisos pueden cambiar.
5. Despliega un preview y comprueba como visitante el catálogo, como alumno sus propios trabajos y como administrador el CMS. Comprueba que las rutas privadas rechacen visitantes.

No subas `.env.local`, `.firebase/`, `backups/`, `exports/` ni cuentas de servicio. Las instrucciones de datos y recuperación están en [mongodb-migration.md](docs/mongodb-migration.md).
