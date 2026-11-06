# Administración de contenidos

## Selección de contenidos para el inicio

En **CMS → Textos Generales → Configuración visible de la portada**, el apartado
**Selección para presentar** permite activar un recorrido de lecciones y del
Diseñador POO. Añade contenidos desde el selector, cambia su orden con las flechas
y quita elementos cuando quieras preparar otra presentación. Puedes editar el
título y la descripción. Usa **Guardar portada** para publicar la configuración.

La opción **Mostrar barra de filtros del laboratorio** controla la fila de
pestañas y sus contadores. La selección aparece antes de las demás secciones que
estén activadas. Las lecciones se resuelven desde el catálogo disponible: una
lección ausente no se sustituye por contenidos ajenos a la selección.

Estos ajustes se guardan en `cms_site_content/home_config` y se incluyen en los
respaldos del CMS. `content/home/presentacion.json` documenta la selección inicial
de coordenadas, random, noise y Diseñador POO; no se importa automáticamente.

## Editar el contenido del Diseñador POO

Entra en **CMS → Diseñador POO**. Este apartado permite editar el título y la
introducción de la herramienta, los nombres e instrucciones de las seis etapas,
las preguntas guía, la explicación de las estrategias de inicialización y las
plantillas que se ofrecen a los estudiantes.

En **Plantilla inicial y ejemplos**, selecciona la plantilla que quieras cambiar.
Puedes editar visualmente sus campos, parámetros, métodos y relaciones, importar
un diseño JSON o agregar otros ejemplos. Usa **Guardar contenido** para confirmar
la actualización en Firebase y **Abrir herramienta** para revisarla.

La presentación y cada etapa admiten bloques como las lecciones. En **Bloques de
presentación** o **Bloques de etapa N**, elige Texto, Imagen, Video, Iframe, Código,
Aviso, Recurso o enlace, o Actividad, y pulsa **Agregar bloque**. Puedes editar el
contenido, mover los bloques con las flechas, ocultarlos con **Mostrar bloque**,
eliminarlos y activar **Vista previa de bloques** antes de guardar. Los bloques
de una etapa aparecen junto a sus instrucciones, antes de los controles de diseño.
Para video se admiten enlaces de YouTube o archivos MP4, WebM y OGG; los iframes
aceptan una URL o el código de inserción, con título y altura configurables.

La configuración se guarda en `cms_site_content/class_designer_config`, con el
mismo formato de contenido JSON que otras configuraciones del sitio, y se incluye
en los respaldos del CMS. Las instrucciones se actualizan en la herramienta al
guardar; la plantilla inicial se aplica a **Nuevo Proyecto** y los ejemplos al
cargarlos. Los proyectos personales ya creados conservan sus datos.

En desarrollo local estos cambios se guardan en el emulador. Para pasarlos a
producción, publica primero esta versión de la aplicación y después importa el
respaldo del CMS que contiene la configuración de la herramienta.

## Acceso al panel

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

### Categorías

En **CMS → Categorías** se pueden crear, editar y eliminar categorías curriculares.
Después de guardar una categoría, aparece como opción al crear o editar módulos. Las
cuatro categorías históricas se muestran como valores iniciales cuando todavía no
existe la colección `cms_categories`, por lo que el contenido existente conserva sus
nombres. No se puede eliminar una categoría que todavía tenga módulos asignados.

Si la colección todavía no tiene las reglas desplegadas en Firebase, el CMS conserva
las cuatro categorías históricas como respaldo y no bloquea la carga de módulos y
lecciones. Para habilitar persistencia de categorías, publica `firestore.rules` en
la base `ai-studio-estructuradeunac-271cf9fa-0600-48d9-85d5-b75dad4b646f` del
proyecto `rugged-precept-406017`.

### Configuración del Home

En **CMS → Textos Generales**, el bloque **Configuración visible de la portada**
permite activar o desactivar el hero, la continuidad, las unidades, el módulo
piloto, el temario, las herramientas y la filosofía didáctica. También permite
seleccionar lecciones destacadas: si no se selecciona ninguna, el Home muestra
todo el temario; si se seleccionan, muestra únicamente esas lecciones en la
sección pública. Ocultar un bloque no elimina contenido ni cambia sus rutas
internas. La configuración se guarda en `cms_site_content/home_config`.

La misma configuración permite editar el título y la descripción editorial de
cada pilar: Unidades, Módulo piloto, Temario, Herramientas y Filosofía. Estos
campos cambian directamente la presentación del Home sin modificar las rutas ni
el contenido interno de las herramientas.

Cada pilar también admite bloques composables. Se pueden agregar bloques de
texto, módulos educativos, categorías, lecciones o herramientas; seleccionar
elementos concretos dentro de cada fuente, mantener el orden y ocultar el
contenido predeterminado del pilar para dejar únicamente la composición creada
por el administrador.

El Footer también se configura desde este bloque: se puede ocultar, cambiar la
marca, la tecnología/versión, el texto descriptivo y la visibilidad de cada
enlace de navegación.

El Home consume el contenido publicado del modelo composable
(`cms_nodes`, `cms_node_relations` y `cms_node_blocks`) y conserva el modelo
legacy como respaldo. Después de actualizar las reglas de lectura pública,
despliégalas para que las ediciones del CMS puedan reflejarse fuera del panel:

```bash
firebase deploy --only firestore:rules --project rugged-precept-406017
```

Al abrir el panel administrativo se ejecuta una sincronización idempotente:
restaura en `cms_categories` cualquier categoría histórica que falte, conserva
las categorías personalizadas y vincula módulos, lecciones, secciones, bloques,
recursos y nodos composables mediante `categoryId`. El nombre `category` se
mantiene para compatibilidad con el contenido legacy. Las actividades de las
unidades reciben la categoría de su unidad.

Los cambios de campos se guardan juntos al guardar o publicar; las operaciones de estructura conservan primero las ediciones pendientes. Un fallo de Firebase se muestra como error y no como un guardado correcto. Los antiguos datos `cms_*_cache` de localStorage ya no sustituyen los documentos de Firebase.

La primera apertura autorizada inicializa el temario original y completa documentos faltantes de instalaciones parciales, sin sobrescribir documentos existentes. La marca `cms_site_content/curriculum_initialized` evita volver a importar contenido que después se retire deliberadamente.

## Contenido composable

El CMS también admite el modelo extensible `cms_nodes`. Un nodo puede representar una unidad, lección, actividad, herramienta, recurso, evaluación o contenedor. Sus capacidades (`content`, `activity`, `interactive`, `assessment`, `tool`, `resource`, `container` y `navigation`) son independientes del tipo, por lo que un administrador puede combinar funciones sin crear una jerarquía nueva por cada caso.

Las relaciones se almacenan en `cms_node_relations` y los bloques genéricos en `cms_node_blocks`. El modelo anterior (`cms_modules`, `cms_lessons`, `cms_sections` y `cms_blocks`) se conserva para compatibilidad y migración gradual; no se migra ni elimina automáticamente ningún documento existente.

## Arquitectura educativa y navegación

La aplicación se organiza alrededor de una progresión educativa:

```text
Unidad → Lección → Sección → Bloque de contenido → Actividad o herramienta
```

Los bloques son la unidad composable de presentación: una sección puede combinar
explicación, código, ejecución p5.js, recursos, iframe, actividad y avisos sin crear
un componente específico para cada tipo de lección. El CMS legacy se mantiene como
compatibilidad; el modelo composable (`cms_nodes` y sus relaciones) es la dirección
para contenido nuevo y futuras unidades.

La navegación se reconstruye desde el hash de la URL para que el estado educativo
sea compartible y sobreviva a una recarga:

```text
#/                         Inicio
#/lecciones/<id>           Lección o taller
#/unidades/<u1|u2|u3>      Unidad
#/unidades/<u1>/<ejercicio> Actividad de unidad
#/herramientas             Herramientas
#/admin                    Administración
```

La resolución está centralizada en `src/app/routeState.ts`. Las vistas no deben
modificar directamente `window.location.hash` al añadir nuevas funciones; deben
usar el helper de navegación para conservar el historial del navegador y permitir
evolucionar posteriormente hacia rutas limpias del servidor.

La composición de la aplicación usa hooks de responsabilidad única:

- `useAppNavigation`: estado de vista, rutas, historial y selección de unidad/lección.
- `useCurriculumContent`: carga del currículo publicado o de la vista previa administrativa.
- `useLearningProgress`: progreso local, sincronización con Firebase y estado del taller.

`App.tsx` coordina estas capacidades y compone las vistas; las reglas de persistencia
o resolución de rutas no deben volver a colocarse directamente en el componente raíz.

El contrato de dominio para las vistas educativas está definido en
`src/types/learning.ts`:

```text
LearningLesson
  └── sections: LearningSection[]
        └── blocks: CmsBlock[]
```

`normalizeTopic` adapta el formato histórico `TopicItem.concepts` a
`LearningLesson.sections`. De esta forma, el contenido estático y el contenido
proveniente de Firebase pueden evolucionar hacia el mismo modelo sin exigir que
cada componente conozca el origen de los datos. Las nuevas vistas deben consumir
`LearningLesson` y `LearningSection`; `TopicItem` queda como formato de
compatibilidad durante la migración.

La lectura pública intenta primero el modelo composable. Si todavía no hay lecciones
composables publicadas, conserva el fallback al modelo legacy para evitar una pantalla
vacía durante la transición. La vista previa administrativa también puede leer nodos
en borrador, siempre que la cuenta tenga permisos de administrador.

Las lecciones creadas desde el CMS conservan su relación con la unidad al convertirse
al contrato de aprendizaje. Si una lección no tiene `unitId` explícito pero pertenece
a la categoría **Fundamentos**, se asigna a la Unidad 1 como compatibilidad editorial.
Por eso una lección como “Puntillismo” aparece tanto en el catálogo principal como en
la lista de Fundamentos después de estar publicada y visible.

Para activar la migración de contenido existente, usa **Migrar contenido existente**
en **Arquitectura composable** dentro del CMS. La operación es idempotente, no elimina
ni modifica las colecciones legacy y copia módulos, lecciones, secciones y bloques a
`cms_nodes`, `cms_node_relations` y `cms_node_blocks`. Después de la migración, el
contenido composable publicado pasa a ser la fuente preferente para las vistas.

## Progreso y prerrequisitos

El currículo mantiene dos niveles complementarios:

- `LearningLesson` registra las secciones de una lección.
- `LearningUnit` registra las lecciones de una unidad y sus unidades requeridas.

Las unidades 2 y 3 declaran actualmente las unidades anteriores como prerrequisito.
La función `areUnitPrerequisitesComplete` concentra la regla para que una futura
interfaz pueda bloquear o recomendar contenido sin duplicar la lógica.

Al visitar una sección de una lección, `useLearningProgress` guarda:

```text
lessonProgress[lessonId]
  completedSections
  currentSectionId
  lastVisitedAt
```

El avance se conserva localmente y se incluye de forma compatible en el progreso
existente del taller. La barra de avance de la lección se calcula a partir de las
secciones visitadas. Todavía no se presenta como calificación: visitar contenido
indica avance de estudio, mientras que completar una actividad evaluable será una
capacidad posterior separada.

Home muestra una acción de continuidad basada en la última lección visitada. Dentro
de una lección se puede avanzar o retroceder entre secciones, y al volver a abrirla
se restaura la última sección registrada. La navegación entre lecciones usa el orden
del currículo publicado y conserva las URLs persistentes.

Cada lección expone un estado derivado para la interfaz:

- **No iniciada:** no tiene secciones visitadas.
- **En progreso:** tiene al menos una sección visitada, pero no todas.
- **Completada:** todas sus secciones fueron visitadas.
- **Bloqueada:** el contrato admite este estado para prerrequisitos, aunque la
  interfaz ya lo aplica a las lecciones relacionadas con unidades cuyos requisitos
  no están completos.

Estos estados no se guardan como una segunda fuente de verdad: se calculan desde
`lessonProgress`, con un porcentaje limitado a 100 %. Así se evita que el estado
visual se desincronice del progreso persistido.

La relación actual de lecciones con unidades es explícita: `canvas` pertenece a la
Unidad 1; `variables` y `functions` a la Unidad 2; y `conditionals`, `loops`,
`classes` y `object-arrays` a la Unidad 3. Una unidad se considera completada cuando
todas sus lecciones relacionadas están completadas. Con esa regla, las lecciones de
las Unidades 2 y 3 se muestran bloqueadas hasta cumplir sus prerrequisitos.

## Auditoría arquitectónica: resumen y checklist

La auditoría se ha orientado a una herramienta educativa escalable, composable y
replicable. Se conservaron los datos legacy y se priorizó una migración gradual para
no romper el contenido existente.

### Completado

- [x] Navegación persistente mediante hash, recarga, historial y enlaces compartibles.
- [x] Extracción de navegación, currículo y progreso desde `App.tsx` hacia hooks.
- [x] Contrato normalizado `LearningLesson`, `LearningSection` y `LearningUnit`.
- [x] CMS composable con nodos, relaciones y bloques genéricos.
- [x] Lectura preferente de contenido composable publicado con fallback legacy.
- [x] Migración legacy idempotente sin borrar colecciones existentes.
- [x] Bloques de código independiente, GitHub e iframe con validaciones.
- [x] Ejecución p5.js separada de la miniatura y configurable por lección/sección.
- [x] Integración de recursos mediante Google Drive sin almacenar secretos.
- [x] Progreso por sección, sincronización local/remota y continuidad.
- [x] Navegación anterior/siguiente entre lecciones y secciones.
- [x] Estados visibles de lección: no iniciada, en progreso y completada.
- [x] Soporte de contrato para estado bloqueado sin activar bloqueos prematuros.
- [x] Registro separado de intentos, resultado y retroalimentación de actividades.
- [x] Progreso evaluable agregado por unidad.

### Siguiente trabajo recomendado

- [x] Relacionar explícitamente cada lección con una unidad.
- [x] Activar bloqueos reales a partir de prerrequisitos visibles.
- [x] Mostrar estados y avance agregados por unidad.
- [x] Separar avance de lectura de actividades evaluables.
- [x] Añadir intentos, resultados y retroalimentación para actividades.
- [ ] Cubrir con pruebas de interfaz el panel de continuidad y los estados.
- [ ] Completar la eliminación de escrituras directas de `window.location.hash`.
- [ ] Dividir o cargar bajo demanda los módulos que producen el chunk principal grande.
- [ ] Validar reglas de Firestore en emulador y autenticación en dominio publicado.

## Google Drive

El CMS puede subir recursos del administrador a Google Drive mediante Google Identity Services. Configura `VITE_GOOGLE_CLIENT_ID` con el Client ID OAuth de la aplicación web y agrega los orígenes autorizados de desarrollo y producción en Google Cloud. La integración usa únicamente `drive.file`, crea la carpeta `Clase Asistida Centro` automáticamente y guarda la metadata del archivo en `cms_media`; no se almacenan Client Secrets ni tokens en Firestore.

En **Recursos Multimedia**, usa **Consultar** para abrir una vista previa o **Abrir**
para consultar el archivo en Drive. **Copiar URL** copia un enlace permanente al
archivo. Para insertarlo en una lección o en el diseñador de POO, crea un bloque
de imagen, video, iframe o recurso y pulsa **Elegir de la biblioteca multimedia**.
Busca el archivo, pulsa **Usar este recurso** y guarda el contenido del editor.
También puedes pegar el enlace de Drive que ya tenías: el renderizador adapta
los enlaces `/file/d/…/view`, `/open?id=…` y `/uc?id=…`, conservando `resourcekey`.

Las imágenes públicas se muestran directamente mediante URLs de imagen, sin
conectar Drive, iniciar sesión ni abrir el visor externo. Los enlaces de Drive
se convierten al formato de imagen pública; si ese servicio falla, se intenta
una segunda URL de imagen. Si ninguna carga, se muestra un mensaje y el botón
**Reintentar imagen**, sin insertar una pantalla de acceso de Google.

**Conectar Drive** solo es necesario para subir archivos desde el CMS. Los
videos y documentos usan el visor `/preview` de Drive; los archivos de audio o
descarga pueden insertarse como **Recurso**. Las imágenes nuevas se comparten
automáticamente como **Públicas por enlace · Lector**; los demás archivos conservan
sus permisos. Para imágenes anteriores usa **Hacer pública (lector)** en la
biblioteca. La acción verifica el permiso de lectura y no modifica la carpeta. Las miniaturas temporales de la API no se
usan como enlaces persistentes del contenido.

## Verificación

Con Node.js 24 y las dependencias instaladas:

```sh
node --experimental-test-module-mocks --import tsx --test tests/cms.test.mjs
npm run lint
npm run build
```

Las pruebas usan un SDK de Firebase simulado y renderizado estático de React. Cubren autorización, revocación, errores de persistencia, guardado completo, inicialización y lecciones públicas. No sustituyen las pruebas de `firestore.rules` en el emulador ni una comprobación de Google Sign-In en el dominio publicado. Para esa comprobación, el dominio debe estar autorizado en Firebase Authentication.

## Formato de texto

Los bloques **Texto**, **Aviso** e **Instrucciones de la actividad** tienen un editor
visual, tanto en las lecciones como en el diseñador de POO. Selecciona una parte
del texto y utiliza la barra para aplicar negritas, cursivas, subrayado, tachado o
color. También puedes insertar títulos, listas y enlaces, alinear párrafos,
deshacer cambios o limpiar el formato. Usa **Guardar Borrador** o **Publicar Lección** en la lección, o
**Guardar contenido** en el diseñador para conservarlo. La vista del alumno y
las vistas previas muestran el mismo formato.

Los textos anteriores se abren como texto literal; al editarlos se guardan como
HTML con `contentFormat: "html"`. Esa marca se conserva en las copias de seguridad
y en los bloques composables. El renderizador solo admite etiquetas y estilos
de texto autorizados; los iframes y el código continúan usando sus propios bloques.

## Proyectos p5.js desde GitHub

Las lecciones y los bloques de código pueden utilizar un repositorio público de GitHub
o una carpeta de ese repositorio. En el editor se completa el enlace; la ruta manual
del archivo `.js` es opcional. El botón **Cargar código desde GitHub** de la lección
o **Cargar p5.js y Processing Java desde GitHub** del bloque importa ambos lenguajes;
hay que guardar los cambios para conservar esa copia en el CMS. Los bloques con
fuente GitHub consultan el repositorio para mostrar el Java y ejecutar el p5 actual.

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
- **Carpeta GitHub:** `https://github.com/usuario/repositorio/tree/main/a1`
- **Archivo de entrada:** opcional; si se omite, se detecta el único `.js` de la carpeta `*_p5`.
  Si se indica, puede ser relativo a la carpeta seleccionada (`Ejemplo_p5/sketch.js`)
  o al repositorio (`a1/Ejemplo_p5/sketch.js`). Siempre debe estar dentro de `*_p5`.

Los enlaces a la raíz usan la rama predeterminada. Los enlaces `/tree/rama/carpeta`
usan la rama y el directorio indicados, incluidas carpetas anidadas. Se carga el código desde
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
y `data/video.mp4`. La plataforma busca las carpetas Java y `*_p5` directamente
dentro de la ubicación indicada, sin mezclar otros ejercicios. Por ejemplo,
`/tree/main/a1` busca `a1/Ejemplo/` y `a1/Ejemplo_p5/`; el enlace a la raíz sigue
buscando el par situado en la raíz, aunque haya otras carpetas como `a1` o `docs`.
Se prefiere la carpeta Java cuyo nombre coincide con el de `*_p5` sin el sufijo;
si los nombres difieren, debe existir una única carpeta con archivos `.pde`.
Las pestañas `.pde` se muestran juntas, primero el archivo principal del sketch.
Si hay varias carpetas `*_p5`, indica el archivo de entrada para elegir una.
Si hay varios `.js` en ella, también debes indicar cuál ejecutar; no se concatenan
automáticamente sus dependencias. Por ahora solo se admiten repositorios públicos;
no se deben introducir tokens de GitHub en el navegador.
