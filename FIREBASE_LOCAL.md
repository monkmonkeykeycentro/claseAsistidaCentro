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
   `jmartineza@centro.edu.mx` tiene UID `local-admin`.
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

## Verificación

```sh
npm test
npm run lint
npm run build
```

La prueba de integración se ejecuta contra emuladores ya activos y borra únicamente
la cuenta y el diseño temporales que ella misma crea:

```sh
FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099 \
  node --experimental-test-module-mocks --import tsx --test tests/classDesignerPersistence.emulator.test.mjs
```
