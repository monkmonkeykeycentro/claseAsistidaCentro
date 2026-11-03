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

También puedes copiar `firestore.rules` en Firebase Console → Firestore Database → seleccionar la base indicada → Rules → Publish. No basta con actualizar las reglas de la base `(default)`.

Las reglas permiten modificaciones del CMS solo a administradores. Las consultas públicas filtran publicaciones y visibilidad, y las reglas comprueban también el módulo, la lección y la sección correspondientes. Los borradores, contenidos archivados, secciones ocultas e historiales administrativos requieren permisos. Este diseño sigue las [condiciones de seguridad de Firestore](https://firebase.google.com/docs/firestore/security/rules-conditions) y sus [requisitos para consultas](https://firebase.google.com/docs/firestore/security/rules-query).

## Agregar contenido

1. Inicia sesión con la cuenta administradora y abre **CMS**.
2. Crea un módulo o selecciona uno existente. Los módulos nuevos empiezan como borrador; cambia su estado a **Publicado** cuando corresponda.
3. Agrega una lección, sus secciones y los bloques de texto, código, notas, imágenes, videos, recursos o actividades.
4. Usa **Guardar Borrador** para guardar sin publicar o **Publicar Lección** para mostrarla. El módulo y la lección deben estar publicados y visibles.
5. Comprueba el resultado en el temario. **Vista Estudiante** permite al administrador revisar también borradores.

Los cambios de campos se guardan juntos al guardar o publicar; las operaciones de estructura conservan primero las ediciones pendientes. Un fallo de Firebase se muestra como error y no como un guardado correcto. Los antiguos datos `cms_*_cache` de localStorage ya no sustituyen los documentos de Firebase.

La primera apertura autorizada inicializa el temario original y completa documentos faltantes de instalaciones parciales, sin sobrescribir documentos existentes. La marca `cms_site_content/curriculum_initialized` evita volver a importar contenido que después se retire deliberadamente.

## Verificación

Con Node.js 24 y las dependencias instaladas:

```sh
node --experimental-test-module-mocks --import tsx --test tests/cms.test.mjs
npm run lint
npm run build
```

Las pruebas usan un SDK de Firebase simulado y renderizado estático de React. Cubren autorización, revocación, errores de persistencia, guardado completo, inicialización y lecciones públicas. No sustituyen las pruebas de `firestore.rules` en el emulador ni una comprobación de Google Sign-In en el dominio publicado. Para esa comprobación, el dominio debe estar autorizado en Firebase Authentication.
