# Material editorial de las sesiones

`puntillismo.json` contiene la propuesta de una sesión de 90 minutos, con siete
etapas y 32 bloques de texto, código, imagen, actividades y recursos.

La sesión se encuentra en el CMS local, dentro del módulo **Puntillismo**, como
**Puntillismo: pintar con código**. Allí puedes modificar sus secciones y bloques.
La aplicación lee el contenido de Firestore; este archivo es una referencia
editorial versionada y no se importa automáticamente al iniciar la aplicación.

`caminata-aleatoria.json` contiene una sesión de 60 minutos, con seis etapas y
24 bloques. Está en **Control y Lógica → Lógica y estructuras de decisión →
Caminata aleatoria: decisiones que dibujan** dentro del CMS local. Incluye el
programa completo en Processing Java y p5.js y una ejecución con código inline.
El repositorio y su archivo de entrada quedaron vacíos para configurarlos después.
Al vincular el bloque del ejemplo, selecciona **Repositorio GitHub** como fuente.

`noise-movimiento.json` contiene una sesión de 60 minutos, con seis etapas y
24 bloques. Está en **Modularidad → Funciones específicas aplicadas al diseño
visual → Noise: movimiento orgánico y vuelo de un ave** dentro del CMS local.
Incluye un modelo ejecutable sin imágenes y el programa con fondo y ave en Java
y p5.js. Este último necesita los archivos `back.png` y `bird.png` en `data`;
su ejecución queda desactivada hasta disponer de esos recursos. El repositorio
queda pendiente. Ambos ejemplos se pueden editar como bloques desde el CMS.

`random-puntillismo.json` desarrolla una sesión de 60 minutos, con seis etapas y
24 bloques, en **Funciones específicas aplicadas al diseño visual → Random:
puntillismo y muestreo de imágenes**. Retoma el repositorio y la imagen del
puntillismo actual y profundiza en intervalos, coordenadas enteras, muestreo,
repetición y `randomSeed()`. Es una lección adicional; la lección original conserva
su contenido y estado editorial. El código principal mantiene la fuente GitHub.

Para trasladar las ediciones a otro entorno, utiliza **Exportar Respaldo** desde
el CMS local y sigue [la guía de publicación](../../SECURITY_AND_PUBLISHING.md).
El JSON de esta carpeta no tiene el formato de un respaldo completo del CMS.

La actualización local conservó los identificadores de la sección inicial, del
ejemplo de GitHub y del tablero de Miro, y actualizó sus representaciones legacy
y composable. Los respaldos previos están en `.firebase/content-backups/`, fuera
de Git.
