<<<<<<< Updated upstream
# Diseñador POO y Firebase local

## Modificar la herramienta desde el CMS

Abre el panel administrativo y selecciona **Diseñador POO** en la barra lateral.
Ahí puedes editar la presentación, las instrucciones de las etapas, las preguntas
guía y las plantillas iniciales o de ejemplo, incluyendo sus campos, constructor
y métodos. Pulsa **Guardar contenido** para aplicar los cambios a la herramienta.
El documento se almacena en `cms_site_content/class_designer_config` del emulador.
La presentación y cada etapa también admiten bloques de texto, imagen, video,
iframe, código, aviso, recurso o actividad, con orden y visibilidad configurables.
Los diseños personales continúan separados, bajo `users/<UID>/class_designs`.

`npm run dev:local` inicia Authentication y Firestore en el proyecto de demostración
`demo-clase-asistida`, abre el panel en `http://127.0.0.1:4000` y sirve la aplicación
en `http://127.0.0.1:3000`. Usa Java 21 o posterior desde `JAVA_HOME`, la instalación
del sistema o el runtime ya descargado en `.firebase/java`.

Si los emuladores y la aplicación ya están abiertos, recarga la página. No inicies
otra instancia en los mismos puertos. Para iniciar únicamente Vite con los
emuladores ya activos, utiliza `npm run dev:app`.

## Guardar y recuperar diseños

1. Inicia sesión en el acceso simulado del emulador. La cuenta local existente
   el usuario ficticio del emulador usa un UID de prueba. Los administradores locales se autorizan mediante la colección `admins`.
2. Abre el Diseñador de Clases POO y edita o importa tu estructura JSON.
3. Pulsa **Guardar en Firebase local**. También se guarda automáticamente
   1,5 segundos después de la última edición.
4. Espera a que aparezca **Guardado en Firebase local**. Si falla, se muestra el
   error y puedes reintentar desde el mismo botón.
5. Pulsa **Mis diseños** y después **Abrir** para recuperar un proyecto completo.

Los diseños se almacenan por usuario en:

```text
users/<UID>/class_designs/<ID-del-proyecto>
```

Con el administrador local, busca `users/local-admin/class_designs` en el panel
del emulador. Se guardan el nombre del proyecto y de la clase, la descripción,
las preguntas guía, campos, parámetros del constructor, métodos y sus relaciones,
además del propietario y las fechas. La carga respeta el orden de última edición.

El borrador también se conserva en el navegador. **Exportar JSON** descarga la
estructura editable y **Importar JSON** permite recuperarla después. Los diseños
son proyectos personales: no se publican automáticamente como contenido del CMS.

## Persistencia y producción

Al cerrar el proceso con Ctrl+C, espera a que termine la exportación. Los datos y
las cuentas locales se guardan en `.firebase/local-data` y se restauran al reiniciar.
La carpeta `.firebase` está excluida de Git.

`npm run build` conserva la configuración de producción. Para usar la base real
durante desarrollo está disponible `npm run dev:production` en el puerto 3001;
sus escrituras sí afectan a producción. El flujo local utiliza la base `(default)`
y la configuración de producción conserva su base con nombre.

## Transferir el CMS a producción

Usa **Exportar Respaldo** en el CMS local y **Restaurar Respaldo** en el CMS de
producción actualizado. El formato v2 incluye categorías y contenido composable,
además del contenido de la herramienta y el temario. No transfiere cuentas del
emulador ni diseños personales. El diálogo de importación identifica la base de
origen y la de destino antes de modificar datos.

Consulta el procedimiento completo y la revisión de archivos para Git en
[SECURITY_AND_PUBLISHING.md](SECURITY_AND_PUBLISHING.md).

## Verificación

```sh
npm test
=======
# Firebase local y producción

El desarrollo usa Firebase Local Emulator Suite: Authentication en `127.0.0.1:9099`,
Firestore en `127.0.0.1:8080` y su panel en `http://127.0.0.1:4000`.
El proyecto local es `demo-clase-asistida` y su base es `(default)`, con las mismas
reglas de `firestore.rules`. Se configura explícitamente para que el emulador
aplique las reglas; no se usa una base creada implícitamente con reglas abiertas.

Producción conserva el proyecto `rugged-precept-406017` y su base con nombre
`ai-studio-estructuradeunac-271cf9fa-0600-48d9-85d5-b75dad4b646f`, configurados en
`firebase-applet-config.json` y `firebase.json`.

## Primer inicio

Necesitas Node.js 24.12 o posterior, npm y Java 21 o posterior. Desde el repositorio:

```sh
npm ci
npm run firebase:setup
npm run dev:local
```

`firebase:setup` reutiliza Java 21 si está disponible. Si no lo encuentra, descarga
Eclipse Temurin desde Adoptium, verifica el SHA-256 e instala el runtime únicamente
en `.firebase/java`. No modifica la instalación de Java del sistema.
El primer arranque también descarga los emuladores y su panel.
No se necesita una cuenta de Google ni ejecutar `firebase login` para usarlos.

Abre `http://127.0.0.1:3000`. `npm run dev` es equivalente a `npm run dev:local`:
inicia los dos emuladores, crea un administrador de prueba y levanta Vite.

## Entrar al CMS local

1. Pulsa **Continuar con Google** en la aplicación.
2. El emulador abre una ventana de acceso simulada; selecciona
   `jmartineza@centro.edu.mx`, precreado con UID `local-admin` y correo verificado.
3. Abre **CMS**. La primera apertura inicializa el temario de ejemplo existente.
4. Consulta o edita las colecciones desde `http://127.0.0.1:4000`.

Ese usuario pertenece al emulador y no necesita la contraseña de la cuenta real.
Su autorización también queda registrada en `admins/local-admin`. Para crear
estudiantes de prueba, utiliza otro correo en la ventana de acceso simulada.
`npm run firebase:seed` repone el administrador si todavía no existe, sin borrar
cuentas ni sobrescribir documentos existentes.

La aplicación muestra **Entorno local** arriba de la página. Las conexiones a
Auth y Firestore se redirigen juntas antes de hacer consultas. Si un emulador se
detiene, la aplicación falla contra ese servicio local; no cambia a producción.
Los usuarios y sus sesiones están separados por proyecto Firebase.

## Guardar y recuperar los datos

Detén el proceso con **Ctrl+C** y espera a que termine la exportación. Los datos de
Firestore y las cuentas de Authentication se guardan en `.firebase/local-data` y
se importan automáticamente al siguiente arranque. Esa carpeta y las herramientas
descargadas están ignoradas por Git. Un cierre forzado puede perder los cambios
que aún no se hayan exportado.

Para iniciar los procesos por separado, ejecuta `npm run firebase:local` en una
terminal y `npm run dev:app` en otra. La segunda orden requiere que los emuladores
ya estén listos. No ejecutes ambas opciones de arranque a la vez: comparten puertos.

## Verificar antes de publicar

```sh
npm test
npm run test:firebase
>>>>>>> Stashed changes
npm run lint
npm run build
```

<<<<<<< Updated upstream
La prueba de integración se ejecuta contra emuladores ya activos y borra únicamente
la cuenta y el diseño temporales que ella misma crea:

```sh
FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099 \
  node --experimental-test-module-mocks --import tsx --test tests/classDesignerPersistence.emulator.test.mjs
```
=======
Detén el entorno local antes de `test:firebase`. Esa orden inicia emuladores vacíos,
prueba Auth, inicialización del CMS, lectura del historial y restricciones para
estudiantes con las reglas reales, y los detiene al terminar. No importa ni
sobrescribe `.firebase/local-data`.

## Copiar el contenido actual de producción al entorno local

Mantén `npm run dev:local` ejecutándose. En otra terminal del repositorio:

```sh
npx firebase login
npm run firebase:pull
```

La primera orden solo es necesaria si no tienes una sesión autorizada para leer
el proyecto de producción. `firebase:pull` usa esa sesión internamente sin mostrar
credenciales. Lee todas las colecciones que empiezan por `cms_`, incluyendo sus
subcolecciones, categorías, nodos, configuración e historial. Los documentos
conservan sus IDs y tipos de Firestore; las referencias internas pasan a apuntar
a la base del emulador.

Antes de escribir, guarda los datos actuales del emulador y sus cuentas en
`.firebase/backups/before-pull-<fecha>/`. Después agrega o actualiza los documentos
recibidos, comprueba los campos devueltos por cada escritura y guarda el nuevo
estado en `.firebase/local-data`. No borra documentos locales que no estén en
producción. Recarga la aplicación o vuelve a abrir el CMS al terminar.

La copia descargada queda en `.firebase/snapshots/production-<fecha>.firestore.json`,
con los tipos originales y las fechas de actualización del origen. También se
genera `production-<fecha>.cms.json`, compatible con el importador del CMS.
La operación solo lee producción. Las cuentas de Auth, el directorio `admins` y
los perfiles y avances de `users` permanecen separados; el administrador local
sigue siendo `local-admin`.

Para exportar después tu contenido local sin abrir el CMS:

```sh
npm run firebase:export:local
```

Esta orden genera `local-<fecha>.cms.json` y `local-<fecha>.firestore.json` en
`.firebase/snapshots/`, y actualiza el respaldo nativo del emulador. Puedes importar
el archivo `.cms.json` desde **Historial y Respaldos** del CMS de producción cuando
decidas publicar los datos. El CMS publicado debe incluir la versión 1.1.0 del
exportador/importador de este repositorio para conservar categorías y contenido
composable. Ninguna de estas dos órdenes publica automáticamente cambios en la nube.

## Pasar los cambios a producción

El código, las reglas y los documentos tienen pasos de publicación distintos:

1. **Código:** `npm run build` produce `dist/` para el alojamiento actual. Las
   compilaciones siempre usan la configuración de producción, incluso si se
   ejecuta `vite build --mode emulator`. Publica `dist/` por el flujo habitual.
2. **Reglas:** inicia sesión con `npx firebase login` usando una cuenta autorizada
   del proyecto y ejecuta `npm run firebase:deploy:rules`. Esta orden usa
   `firebase.json`, que apunta a la base con nombre de producción.
3. **Contenido:** en el CMS local, abre **Historial y Respaldos** y descarga el
   respaldo JSON. En el CMS publicado, descarga primero otro respaldo de sus
   datos actuales y luego importa el archivo local desde esa misma sección.

Los respaldos 1.1.0 incluyen módulos, lecciones, secciones, bloques, textos y
configuración del sitio, recursos, categorías, nodos composables, relaciones y
bloques de nodos. Los respaldos antiguos 1.0.0 siguen siendo importables.
La importación actualiza documentos con el mismo ID y agrega los nuevos; no
elimina documentos del destino ausentes en el archivo. Antes de importar se
guarda también una revisión del contenido actual.

El respaldo del CMS no transfiere usuarios de Auth, permisos `admins`, avances de
estudiantes, archivos externos ni el historial anterior. Esos datos permanecen
en cada entorno. Las imágenes y otros recursos se conservan mediante sus URLs;
asegúrate de que puedan abrirse desde el sitio publicado.

Para abrir la aplicación desde este equipo usando la base real, existe
`npm run dev:production` en `http://127.0.0.1:3001`. Sus escrituras afectan a
producción y requieren una cuenta real. Este origen debe estar autorizado en
Firebase Authentication. El puerto distinto mantiene separado el almacenamiento
del navegador respecto del entorno local.

## Referencias

- [Conectar Firestore al emulador](https://firebase.google.com/docs/emulator-suite/connect_firestore)
- [Conectar Authentication al emulador](https://firebase.google.com/docs/emulator-suite/connect_auth)
- [Exportar e importar datos de los emuladores](https://firebase.google.com/docs/emulator-suite/install_and_configure#export_and_import_emulator_data)
>>>>>>> Stashed changes
