# Diagnóstico de la API en producción

El error `FUNCTION_INVOCATION_FAILED` indica que Vercel no pudo completar la función. Los errores 500 que muestra el navegador son la consecuencia y no identifican por sí solos la causa del servidor.

Las funciones `/api/data` y `/api/health` tienen manejadores nativos de Vercel. Cargan sus dependencias dentro de la petición, esperan la respuesta y devuelven JSON seguro si falla el arranque. La lectura pública no necesita cargar Firebase Admin. El desarrollo local con Express usa los mismos manejadores.

## Publicar este cambio

1. Sube los cambios de `api/`, `server/`, `scripts/public-environment.mjs` y `vercel.json` al repositorio que despliega Vercel. Añade también las pruebas y esta documentación.
2. En las variables de entorno del proyecto, para **Production**, configura `MONGODB_URI`, `MONGODB_DB` y `FIREBASE_PROJECT_ID` con los valores de tu configuración privada. No incluyas comillas exteriores al pegar valores en la interfaz de Vercel.
3. Conserva las variables públicas `VITE_FIREBASE_*`, `VITE_GOOGLE_CLIENT_ID` y `VITE_DATA_BACKEND=mongodb`. El proyecto de Firebase debe coincidir en cliente y servidor.
4. Los administradores pueden estar en `CMS_ADMIN_UIDS` (solo servidor) o en la colección protegida `admins`. El UID no se debe publicar ni llevar prefijo `VITE_`.
5. Vuelve a desplegar y abre `https://TU_DOMINIO/api/health`. Los cambios de variables no actualizan los despliegues anteriores.

Configura las variables también en **Preview** si quieres generar despliegues de prueba, usando la base adecuada para ese entorno.

El build de Vercel cancela si faltan variables privadas obligatorias. Informa únicamente sus nombres. No conecta con Atlas durante la compilación, porque las IP de salida de la compilación y de las funciones pueden diferir.

## Interpretar `/api/health`

| Respuesta | Comprobar |
| --- | --- |
| `ok: true`, `backend: mongodb` | La función arrancó y pudo ejecutar un ping a Atlas. |
| `server-configuration-missing` | Configura en ese entorno las variables cuyos nombres aparecen en `missing` y vuelve a desplegar. |
| `firebase-project-mismatch` | `FIREBASE_PROJECT_ID` debe coincidir con `VITE_FIREBASE_PROJECT_ID`. |
| `auth-emulator-not-allowed` | Quita `FIREBASE_AUTH_EMULATOR_HOST` de producción. |
| `database-configuration-invalid` | Revisa el formato de la URI, las comillas exteriores y el nombre de base de datos. |
| `database-unreachable` | Revisa DNS, disponibilidad del clúster y las IP de salida del servidor autorizadas en Atlas. |
| `database-authentication-failed` | Revisa el usuario de base de datos y su contraseña codificada para la URI. |
| `database-permission-denied` | Revisa los roles del usuario de base de datos sobre la base configurada. |
| `api-initialization-failed` o `dependency-missing` | Revisa que el despliegue contenga los archivos del servidor y sus dependencias. `vercel.json` incluye explícitamente `server/**`. |

Una respuesta correcta de health comprueba conectividad, no la existencia de todas las colecciones ni el rol de una sesión particular. Si el catálogo está vacío, comprueba que `MONGODB_DB` sea la base a la que se importaron los documentos. Si Google inicia sesión pero falta el CMS, comprueba el UID de esa cuenta contra el directorio privado de administradores o la variable privada correspondiente.

Puedes compartir la respuesta JSON de health para diagnosticar el despliegue. No incluye contraseñas, URI, correos, UID, tokens ni mensajes completos de los SDK. Las respuestas no se almacenan en caché y los registros del servidor conservan únicamente códigos de diagnóstico.
