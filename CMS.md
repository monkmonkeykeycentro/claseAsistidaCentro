# Administración de contenidos

El botón **CMS** aparece después de iniciar sesión con una cuenta administradora. Las rutas `#admin`, `#cms`, `/admin`, `/cms` y el atajo Ctrl/Cmd + Shift + A también requieren ese permiso. Al cerrar sesión o revocar el permiso, el panel deja de estar disponible.

La cuenta inicial es **jmartineza@centro.edu.mx**, con correo verificado en Firebase Authentication. Para autorizar otras cuentas, un administrador del proyecto puede crear un documento `admins/<UID de Firebase Authentication>` en Firestore. La existencia de ese documento concede acceso; eliminarlo revoca el permiso. El campo `role` del perfil del usuario y los correos que empiezan por `admin@` no conceden acceso.

## Aplicar las reglas en Firebase

Los cambios del repositorio necesitan las reglas actualizadas en la base de producción. `firebase.json` apunta a la base con nombre que usa `firebase-applet-config.json`:

```text
ai-studio-estructuradeunac-271cf9fa-0600-48d9-85d5-b75dad4b646f
```

Con Firebase CLI instalada y una sesión autorizada en el proyecto:

```sh
firebase deploy --only firestore:rules --project rugged-precept-406017
```

Para esta base con nombre, utiliza Firebase CLI con la configuración del repositorio. Publicar las reglas de `(default)` no actualiza esta base; la [documentación de Firebase](https://firebase.google.com/docs/rules/manage-deploy) indica que la consola de Firebase solo admite desplegar reglas de Firestore en la base predeterminada.

Las reglas permiten modificaciones del CMS solo a administradores. Las consultas públicas filtran publicaciones y visibilidad, y las reglas comprueban también el módulo, la lección y la sección correspondientes. Los borradores, contenidos archivados, secciones ocultas e historiales administrativos requieren permisos. Este diseño sigue las [condiciones de seguridad de Firestore](https://firebase.google.com/docs/firestore/security/rules-conditions) y sus [requisitos para consultas](https://firebase.google.com/docs/firestore/security/rules-query).

## Agregar contenido

Si el panel no carga, el mensaje indica la operación que falló y conserva el código de Firebase. `permission-denied` requiere revisar la cuenta y las reglas publicadas en la base indicada; `unauthenticated` requiere renovar la sesión; `unavailable` o `deadline-exceeded` indican un problema de disponibilidad o conexión. Después de corregirlo, usa **Reintentar carga**. El mensaje anterior «Revisa tu conexión y las reglas de Firebase» era genérico y no permitía distinguir estas causas.

Si falla **cargar el historial administrativo**, comprueba la regla de `cms_revisions`: el listado debe permitir `list` con `isAdmin()`, sin exigir `isValidId(revisionId)` para la consulta completa. La validación del ID se conserva en `get` y `write`. Una condición sobre todos los IDs posibles puede rechazar el listado aunque la cuenta sea administradora. Publica las reglas corregidas en la base con nombre indicada arriba y vuelve a cargar el panel.

1. Inicia sesión con la cuenta administradora y abre **CMS**.
2. Crea un módulo o selecciona uno existente. Los módulos nuevos empiezan como borrador; cambia su estado a **Publicado** cuando corresponda.
3. Agrega una lección, sus secciones y los bloques de texto, código, notas, imágenes, videos, iframes, recursos o actividades.
4. Usa **Guardar Borrador** para guardar sin publicar o **Publicar Lección** para mostrarla. El módulo y la lección deben estar publicados y visibles.
5. Comprueba el resultado en el temario. **Vista Estudiante** permite al administrador revisar también borradores.

Los cambios de campos se guardan juntos al guardar o publicar; las operaciones de estructura conservan primero las ediciones pendientes. Un fallo de Firebase se muestra como error y no como un guardado correcto. Los antiguos datos `cms_*_cache` de localStorage ya no sustituyen los documentos de Firebase.

La primera apertura autorizada inicializa el temario original y completa documentos faltantes de instalaciones parciales, sin sobrescribir documentos existentes. La marca `cms_site_content/curriculum_initialized` evita volver a importar contenido que después se retire deliberadamente.

## Contenido composable

El CMS también admite el modelo extensible `cms_nodes`. Un nodo puede representar una unidad, lección, actividad, herramienta, recurso, evaluación o contenedor. Sus capacidades (`content`, `activity`, `interactive`, `assessment`, `tool`, `resource`, `container` y `navigation`) son independientes del tipo, por lo que un administrador puede combinar funciones sin crear una jerarquía nueva por cada caso.

Las relaciones se almacenan en `cms_node_relations` y los bloques genéricos en `cms_node_blocks`. El modelo anterior (`cms_modules`, `cms_lessons`, `cms_sections` y `cms_blocks`) se conserva para compatibilidad y migración gradual; no se migra ni elimina automáticamente ningún documento existente.

## Google Drive

El CMS puede subir recursos del administrador a Google Drive mediante Google Identity Services. Configura `VITE_GOOGLE_CLIENT_ID` con el Client ID OAuth de la aplicación web y agrega los orígenes autorizados de desarrollo y producción en Google Cloud. La integración usa únicamente `drive.file`, crea la carpeta `Clase Asistida Centro` automáticamente y guarda la metadata del archivo en `cms_media`; no se almacenan Client Secrets ni tokens en Firestore.

## Verificación

Con Node.js 24 y las dependencias instaladas:

```sh
node --experimental-test-module-mocks --import tsx --test tests/cms.test.mjs
npm run lint
npm run build
```

Las pruebas usan un SDK de Firebase simulado y renderizado estático de React. Cubren autorización, revocación, errores de persistencia, guardado completo, inicialización y lecciones públicas. No sustituyen las pruebas de `firestore.rules` en el emulador ni una comprobación de Google Sign-In en el dominio publicado. Para esa comprobación, el dominio debe estar autorizado en Firebase Authentication.

## Proyectos p5.js desde GitHub

Las lecciones y los bloques de código pueden utilizar un repositorio público de GitHub
como fuente de ejecución. En el editor se completa el enlace; la ruta manual es opcional.

Cada bloque de código permite elegir entre **Código independiente** (los campos escritos
en el bloque) y **Repositorio GitHub**. La ejecución interactiva solo usa la fuente
seleccionada; la casilla **Mostrar ejecución interactiva dentro del tema** la mantiene
oculta hasta que el administrador la active. La vista previa del editor no cambia lo
que verá el estudiante.

El botón **+ Iframe** crea un bloque para contenido web externo. Se configura con URL,
título accesible, altura y pie; solo se aceptan URLs `http` o `https` y el contenido
se carga con `sandbox`. También se puede pegar directamente el código `<iframe>`
proporcionado por Miro; el CMS extrae su atributo `src` sin insertar HTML arbitrario.
Los tableros de Miro deben estar compartidos con los permisos necesarios para que
usuarios autenticados puedan verlos; el CMS no puede evitar las restricciones de
privacidad o de inserción definidas por Miro.

- **Repositorio GitHub:** `https://github.com/usuario/repositorio`
- **Archivo de entrada:** opcional; si se omite, se detecta el único `.js` de la carpeta `*_p5`

El sistema detecta la rama predeterminada del repositorio y carga el archivo desde
`raw.githubusercontent.com`. Las rutas relativas se conservan mediante una base URL,
por lo que un sketch puede usar recursos organizados así:

```text
proyecto/
├── Puntillismo/
│   ├── Puntillismo.pde
│   └── data/
│       └── imagen.png
└── Puntillismo_p5/
    ├── Puntillismo.js
    └── data/
        └── imagen.png
```

En el código p5.js se pueden referenciar como `data/imagen.png`, `data/audio.mp3`
y `data/video.mp4`. La plataforma exige una carpeta Java y una carpeta con sufijo
`_p5` en la raíz; si no se proporciona una ruta manual, debe existir un único `.js`
dentro de `*_p5`. Por ahora solo se admiten repositorios públicos; no se deben
introducir tokens de GitHub en el navegador.
