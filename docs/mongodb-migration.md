# Migración a MongoDB Atlas

El proyecto puede usar MongoDB Atlas para los datos del CMS, el directorio de administradores, perfiles, avances, evidencias y diseños. Firebase Auth conserva el inicio de sesión con Google y sus UID. La API valida los tokens y decide los permisos en el servidor; el campo `role` enviado por el navegador no concede acceso.

La conexión es `React → /api/data → MongoDB Atlas`. `MONGODB_URI` nunca llega al navegador. La opción predeterminada sigue siendo Firestore hasta activar `VITE_DATA_BACKEND=mongodb`.

## 1. Preparar Atlas

1. Crea un proyecto y un clúster en [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Crea un **usuario de base de datos** con `readWrite` únicamente para `clase_asistida`. Es distinto de tu usuario de la consola de Atlas.
3. En **Network Access**, permite la IP de esta computadora y, al desplegar, las IP de salida de tu servidor. No abras todo Internet como configuración predeterminada.
4. En **Connect → Drivers → Node.js**, copia la URI. Sustituye la contraseña con su codificación URL si contiene caracteres especiales.
5. Añade a `.env.local`, que Git ignora:

```dotenv
MONGODB_URI="mongodb+srv://USUARIO:CONTRASEÑA@TU-CLUSTER.mongodb.net/?retryWrites=true&w=majority"
MONGODB_DB="clase_asistida"
```

No uses un prefijo `VITE_` para las credenciales. No las pegues en el chat. Consulta los [requisitos oficiales de conexión](https://www.mongodb.com/docs/atlas/driver-connection/).

Comprueba el acceso:

```sh
npm run mongo:check
```

## 2. Exportar los datos locales actuales

Los archivos `.firebase/snapshots/*.firestore.json` son snapshots anteriores del CMS. Pueden omitir usuarios y subcolecciones y no reflejan necesariamente las ediciones más recientes. Los `.cms.json` contienen solo contenido editorial y no sirven como respaldo completo.

Para tomar un respaldo actual, inicia el emulador en una terminal:

```sh
npm run firebase:local
```

Pausa las ediciones y, en otra terminal, ejecuta:

```sh
npm run firebase:export-local
```

El comando consulta únicamente el emulador de Firestore en `127.0.0.1`, recorre todas las colecciones y subcolecciones, incluso si el documento padre no existe, y guarda `backups/firebase-local-FECHA.json`. La exportación no tiene aislamiento de snapshot: mantén las escrituras detenidas hasta terminar. El archivo es privado y está excluido de Git.

Si aparecen colecciones que la aplicación no contempla, el plan falla para poder revisarlas antes de importar. No se descartan documentos silenciosamente.

Firebase Auth es un servicio aparte: este comando no exporta contraseñas ni migra identidades. Los usuarios ficticios del emulador no son cuentas de producción. Comprueba que los UID propietarios de avances y diseños correspondan a los usuarios reales antes de habilitar el sitio público. Si no coinciden, hay que preparar un mapeo explícito de UID; no se reasignan por correo automáticamente.

Después de importar, puedes copiar los documentos personales de un usuario ficticio a un UID real indicado por su propietario:

```sh
npm run mongo:transfer-user -- local-admin UID_REAL
npm run mongo:transfer-user -- local-admin UID_REAL --apply
```

El primer comando solo muestra el plan. El segundo crea un respaldo, copia avances, evidencias y diseños en una transacción, actualiza `userId` y verifica el resultado. Conserva los originales y rechaza sobrescribir documentos diferentes. No copia el perfil ficticio ni concede roles de administrador: el perfil real se crea al iniciar sesión con Google.

## 3. Planificar, importar y verificar

Sustituye `backups/firebase-local-FECHA.json` por la ruta generada:

```sh
npm run mongo:plan -- backups/firebase-local-FECHA.json
npm run mongo:import -- backups/firebase-local-FECHA.json
npm run mongo:verify -- backups/firebase-local-FECHA.json
```

El plan no conecta con Atlas ni escribe datos. Valida rutas y tipos, cuenta documentos por colección y calcula un SHA-256. La importación crea un respaldo EJSON del destino en `backups/`, prepara índices y escribe en una transacción; después verifica cada documento contra el origen decodificado. Conserva todos los documentos adicionales del destino.

Repetir el mismo archivo es idempotente. Si un documento del destino ya tiene contenido diferente, el comando cancela antes de escribir. Solo después de revisar el conflicto, puedes ejecutar `npm run mongo:import -- ARCHIVO --overwrite`; también se crea respaldo antes de sobrescribir. Mantén detenidas las escrituras del destino mientras importas. Una importación muy grande puede necesitar otro procedimiento por los límites de duración de las transacciones.

Las colecciones raíz conservan sus nombres (`cms_modules`, `cms_nodes`, `users`, etc.). Las subcolecciones se guardan en `users_progress`, `users_pilot_evidences`, `users_curriculum_evidences` y `users_class_designs`. Cada documento tiene `_id` con su ruta original, `parentPath` y `data` con sus campos originales; el campo original `data.id`, si existe, se conserva. Las relaciones entre documentos mantienen sus identificadores.

Los enteros fuera del rango seguro de JavaScript se guardan como BSON Long, los bytes como BSON Binary, los timestamps como cadenas ISO completas para conservar nanosegundos, las referencias como sus rutas y las coordenadas como objetos. Los tipos desconocidos cancelan el plan. El snapshot original sigue siendo el respaldo de los tipos de Firestore.

## 4. Probar la aplicación con Atlas

```sh
npm run dev:mongo
```

Este comando inicia Vite en `http://127.0.0.1:3000` y la API en `http://127.0.0.1:3002`. Usa el inicio de sesión real de Firebase Google; conserva la configuración de dominios autorizados. Los emuladores no son necesarios para esta modalidad. `GET /api/health` comprueba la conexión sin revelar la URI.

Para usar MongoDB por defecto en esta computadora, añade `VITE_DATA_BACKEND=mongodb` a `.env.local`. Con esa opción, `npm run dev` también inicia Vite y la API de MongoDB. `npm run dev:local` inicia explícitamente el modo Firebase con emuladores.

Comprueba el catálogo público, la portada, imágenes y videos, el acceso a borradores solo como administrador, la edición del CMS, y guardar/reabrir avances, evidencias y diseños con un usuario real. Las suscripciones de contenido se actualizan mediante consultas cada 15 segundos y al guardar en la misma pestaña. No tienen la sincronización instantánea ni la caché sin conexión de Firestore. Los servicios que ya guardaban borradores en localStorage conservan ese comportamiento.

Los archivos de imagen y video siguen en su proveedor actual (por ejemplo, Google Drive); esta migración conserva sus URL. No mueve los archivos binarios a Atlas.

## 5. Desplegar en Vercel

El repositorio incluye funciones `api/data.mjs` y `api/health.mjs`; la regla SPA deja pasar `/api`. Configura en el entorno del servidor:

```dotenv
MONGODB_URI=...
MONGODB_DB=clase_asistida
VITE_DATA_BACKEND=mongodb
```

Si necesitas otro proyecto de autenticación, configura `FIREBASE_PROJECT_ID` y asegúrate de que coincida con el proyecto usado por el cliente. No configures `FIREBASE_AUTH_EMULATOR_HOST` en producción: la API lo rechaza. Usa una versión de Node compatible con las dependencias del proyecto y permite en Atlas la salida de red del despliegue. `VITE_DATA_BACKEND` se lee durante la compilación, por lo que cambiarlo exige reconstruir el frontend.

Despliega primero en preview y valida los flujos anteriores. No se ha publicado ni cambiado el destino de producción automáticamente.

## Volver a Firestore

Quita `VITE_DATA_BACKEND=mongodb`, reconstruye el sitio y vuelve a desplegar. En local, `npm run dev` vuelve al flujo de emuladores habitual. La migración no borra ni modifica el origen Firestore.

Esta vuelta cambia la conexión: **las escrituras nuevas hechas en MongoDB no aparecen automáticamente en Firestore**. Si ya hubo actividad en Atlas, detén escrituras y concilia los cambios antes de volver. El archivo `mongodb-before-*.ejson` contiene el estado anterior del destino para una restauración administrativa; no existe una restauración destructiva automática.
