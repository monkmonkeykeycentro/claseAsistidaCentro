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
| `database-busy` | La conexión está en recuperación o el pool está ocupado. Respeta `Retry-After` y consulta el [diagnóstico de conexiones](mongodb-connections.md). |
| `api-initialization-failed` o `dependency-missing` | Revisa que el despliegue contenga los archivos del servidor y sus dependencias. `vercel.json` incluye explícitamente `server/**`. |

Una respuesta correcta de health comprueba conectividad, no la existencia de todas las colecciones ni el rol de una sesión particular. Si el catálogo está vacío, comprueba que `MONGODB_DB` sea la base a la que se importaron los documentos. Si Google inicia sesión pero falta el CMS, comprueba el UID de esa cuenta contra el directorio privado de administradores o la variable privada correspondiente.

Puedes compartir la respuesta JSON de health para diagnosticar el despliegue. No incluye contraseñas, URI, correos, UID, tokens ni mensajes completos de los SDK. Las respuestas no se almacenan en caché y los registros del servidor conservan únicamente códigos de diagnóstico.

## Google inicia sesión pero no aparece el CMS

`/api/health` comprueba MongoDB, pero no carga Firebase Admin. Por eso puede responder correctamente aunque fallen todas las peticiones con `Authorization` y no se pueda consultar el permiso de administrador.

La combinación de Firebase Admin 14, `jwks-rsa` 4 y `jose` 6 puede lanzar `ERR_REQUIRE_ESM` al cargar la autenticación en un servidor sin interoperabilidad `require(ESM)`. Se reprodujo en este proyecto ejecutando Node con `--no-experimental-require-module`. Firebase mantiene [el reporte y la solución provisional](https://github.com/firebase/firebase-admin-node/issues/3181). `package.json` aplica `jose` 5.10 mediante un override limitado a `jwks-rsa`; las otras dependencias conservan su versión. La prueba `tests/auth.test.mjs` carga el SDK real con ese modo de Node, convierte una clave JWKS, verifica una firma y comprueba que un token inválido reciba 401.

Para publicar esta corrección, incluye **`package.json`, `package-lock.json` y `server/auth.mjs`**. Conserva `installCommand` de Vercel con npm, que aplica ese override y lockfile. Realiza un nuevo despliegue; reintentar la sesión en un despliegue anterior no cambia sus dependencias.

Antes y después de desplegar, ejecuta:

```sh
npm run production:check -- https://clase-asistida-centro.vercel.app
```

La comprobación solo lee la API y envía un token de prueba deliberadamente inválido. Debe mostrar HTTP **200** para MongoDB y **401** para autenticación. Ese 401 confirma que el SDK cargó y rechazó la sesión de prueba; no comprueba la firma de una sesión real ni los permisos de una cuenta. Si usas un dominio de preview protegido, su protección debe permitir estas peticiones para que los resultados correspondan a la API.

Si todavía devuelve 503, los registros de `/api/data` y la respuesta JSON distinguen:

| Código | Comprobar |
| --- | --- |
| `auth-dependency-incompatible` | Que el despliegue instaló el override de `jose` para `jwks-rsa`. |
| `auth-dependency-missing` | Que las dependencias de producción incluyan Firebase Admin y sus módulos. |
| `auth-initialization-failed` | La configuración e inicialización de Firebase Admin en el servidor. |

Tras obtener 200/401, vuelve a iniciar sesión con tu cuenta real y confirma que aparece el CMS. Si la consulta `POST /api/data` con `action: get` y `path: admins/<UID de tu sesión>` devuelve HTTP 200 y `data: null`, falta el permiso para ese UID en el entorno usado. Si devuelve `data` con un objeto, la API reconoce el permiso. El UID del usuario ficticio del emulador no sustituye al UID de Firebase Authentication de producción. No compartas tokens de sesión ni cabeceras Authorization.
