# Revisión de Git y publicación del CMS

Revisión realizada el 6 de noviembre de 2026.

## Qué puede ir al repositorio

Se revisaron los archivos que Git incluiría y el historial alcanzable, incluidas las diferencias de fusiones, mediante
Gitleaks 8.30.1, además de comprobar nombres de credenciales, tokens, claves
privadas y archivos de entorno. No se encontraron contraseñas, tokens de acceso,
claves privadas ni cuentas de servicio en esos archivos. Gitleaks detectó claves
de API de Google únicamente en `firebase-applet-config.json`: corresponden a la
configuración web pública de Firebase, también presente en el historial.

La configuración web identifica el proyecto y se incluye en el navegador;
no concede acceso administrativo. Las reglas de Firestore y Firebase Auth son
las que autorizan las operaciones. Conviene comprobar en Google Cloud que esta
clave solo tenga habilitadas las APIs que utiliza Firebase. No se inspeccionaron
ni modificaron las restricciones del proyecto de producción.

Fuentes: [claves de API de Firebase](https://firebase.google.com/docs/projects/api-keys)
y [Gitleaks](https://github.com/gitleaks/gitleaks).

El correo de administración, los identificadores del proyecto y la propuesta
pedagógica en `public/assets/aistudio` siguen visibles: son parte del contenido y
la configuración existentes, no contraseñas. No se reescribió el historial.
Los informes de la revisión están redactados y viven en
`.firebase/security-audit`, que está excluido de Git.

`.gitignore` excluye los datos y cuentas del emulador, `.env.local`, logs,
respaldos descargados del CMS, exportaciones y formatos habituales de credenciales
OAuth, cuentas de servicio y claves privadas. Conserva `.env.example` con valores
de ejemplo. Guarda cualquier respaldo en `backups/`, nunca en `public/`.

Antes de hacer commit, revisa los nombres con `git status --short` y confirma
que ningún respaldo, `.env.local` o cuenta de servicio aparece entre los archivos
por agregar. GitHub y Vercel necesitan el código; los documentos de Firestore
se transfieren por separado.

## Qué contiene el respaldo CMS v2

Incluye las diez colecciones editoriales: `cms_modules`, `cms_lessons`,
`cms_sections`, `cms_blocks`, `cms_categories`, `cms_site_content`, `cms_media`,
`cms_nodes`, `cms_node_relations` y `cms_node_blocks`. Conserva los textos con
formato, el contenido y las plantillas del diseñador de POO, la portada, el menú,
los estados curriculares, los borradores y los marcadores de inicialización.
El JSON identifica el proyecto y la base de origen.

No incluye cuentas de Authentication, `admins`, progresos o diseños personales
bajo `users`, ni el historial de revisiones. Los archivos de Drive permanecen en
Drive; se transfieren sus referencias y metadatos. Los permisos de esos archivos
se gestionan por separado.

## Pasar del entorno local a producción

1. Guarda los cambios de cada editor local. Si una lección debe ser pública,
   usa **Publicar Lección**, no **Guardar Borrador**.
2. En `http://127.0.0.1:3000/#/admin`, pulsa **Exportar Respaldo**. Conserva el
   JSON en `backups/`. Debe tener `version: "2.0.0"` y origen
   `demo-clase-asistida / (default)`.
3. Sube el código revisado a Git y despliega esta versión de la aplicación.
   En Vercel utiliza `npm run build` y el directorio `dist`. Si se usará Drive
   para subir imágenes, configura `VITE_GOOGLE_CLIENT_ID` en el entorno del
   despliegue y autoriza el dominio de la aplicación en el cliente OAuth de Google.
4. Comprueba la configuración de Firebase Auth: Google habilitado y el dominio
   publicado autorizado. Para abrir producción desde tu computadora, autoriza
   también el dominio local correspondiente en Firebase Authentication.
5. Publica las reglas de Firestore en el proyecto real. Este comando modifica
   las reglas de producción, usando la base con nombre de `firebase.json`:

   ```sh
   npx firebase login
   npx firebase deploy --only firestore:rules --project rugged-precept-406017
   ```

   El destino esperado es
   `ai-studio-estructuradeunac-271cf9fa-0600-48d9-85d5-b75dad4b646f`, no `(default)`.
6. Abre el CMS desplegado e inicia sesión con una cuenta administradora real.
   También puedes utilizar el código local actualizado contra producción:

   ```sh
   npm run dev:production
   ```

   Esa instancia usa el puerto 3001 y escribe en Firebase real. No es el emulador.
7. Descarga primero un **Exportar Respaldo** del destino y guárdalo aparte,
   por ejemplo `backups/produccion-antes-de-importar.json`. Después usa
   **Restaurar Respaldo** y selecciona el JSON exportado desde el entorno local.
   El diálogo muestra origen, destino, cantidad de documentos y si el destino es
   LOCAL o PRODUCCIÓN. Confirma solo el proyecto y la base esperados.
8. Verifica las lecciones publicadas, sus secciones, el diseñador de POO, la
   portada y las imágenes desde una ventana sin sesión.

La importación valida el archivo completo antes de escribir, crea un respaldo
automático del destino y escribe en lotes de hasta 400 documentos. Añade registros
nuevos y actualiza los que tienen el mismo ID. No elimina registros adicionales:
si borraste contenidos en local y quieres quitarlos de producción, revisa esa
lista de eliminaciones por separado antes de aplicarla. Conserva la copia del
destino para recuperar los valores anteriores si fuera necesario.

`firebase deploy` no sube los documentos del CMS. Tampoco hay que importar las
cuentas simuladas ni publicar `.firebase/local-data`. El respaldo CMS es el
mecanismo preparado para transferir el contenido editorial.

## Imágenes públicas de solo lectura

Las imágenes nuevas subidas mediante el CMS reciben acceso `anyone / reader`
con `allowFileDiscovery: false`: cualquiera con el enlace puede verlas, sin
conceder edición pública ni convertir toda la carpeta en pública. La aplicación
mantiene el alcance OAuth `drive.file`, necesario para subir y administrar los
archivos que crea; ese alcance no se solicita a los alumnos para ver las imágenes.

Para imágenes anteriores: **Recursos Multimedia → Conectar Drive → Hacer pública
(lector)**. La acción afecta únicamente a la imagen elegida. **Comprobar lectura
pública** permite verificar de nuevo el permiso y actualizar su enlace. El CMS
comprueba el permiso resultante; si Google lo rechaza, mantiene el recurso en la
biblioteca y muestra el error en lugar de afirmar que la imagen es pública.
