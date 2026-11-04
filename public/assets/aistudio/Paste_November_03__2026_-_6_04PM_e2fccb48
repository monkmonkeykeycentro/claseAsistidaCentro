Desarrollo pedagógico y visual de las unidades 1–3
De las instrucciones a los sistemas gráficos paramétricos
Asignatura: Código creativo: Programación estructurada en el diseño · Segundo semestre
Plataforma: https://clase-asistida-centro.vercel.app/
Estado del documento: propuesta curricular y especificación de actividades nuevas para revisión docente.
Alcance: únicamente las unidades 1, 2 y 3. No modifica las unidades 4–7 ni incorpora la unidad 8.
0. Alcance, fuentes y protección del trabajo existente
Fuentes y distinción entre referencia y propuesta
Este documento respeta la denominación, los temas y la progresión de las tres primeras unidades de la planeación académica «Código creativo: Programación estructurada en el diseño, segundo semestre» (2026-2):
- Unidad 1. Fundamentos de programación y código creativo: instrucciones, lenguaje y estructura; introducción al código creativo; relación con otras herramientas de diseño.
- Unidad 2. Primeros pasos con Processing: presentación e historia; interfaz y navegación; sistema de coordenadas; funciones y comentarios; primitivas 2D, relleno y trazo; RGB/HSB; consulta de referencias y proyectos externos.
- Unidad 3. Variables y personalización visual: definición y tipos; variables integradas; valores fijos y dinámicos; operadores aritméticos; Tweak Mode o retoque en vivo; variables propias e incrementación.
Los títulos creativos, proyectos articuladores, dinámicas, tiempos, preguntas, ejemplos y criterios formativos que siguen son propuestas de desarrollo; no forman parte literal del temario oficial.

La inspiración en Generative Design se basa en sus procedimientos de exploración visual, especialmente P.0 (introducción a Processing), P.1 (color), P.2 (forma: retículas y alineación) y la exploración de variaciones. No se reproducen ilustraciones ni ejercicios completos del libro. Se proponen piezas originales de Processing Java apropiadas para principiantes.

Fuentes de referencia:
- Planeación de segundo semestre proporcionada por el docente.
- https://www.generative-gestaltung.de/
- https://github.com/generative-design/Code-Package-Processing-3.x
- https://tatsu-zine.com/books/generative-design (índice de la edición de Processing; apartados P.0, P.1 y P.2).
Regla no negociable: conservar los ejercicios existentes
No modificar, reemplazar, duplicar, eliminar ni reubicar ningún ejercicio, contenido, sketch, archivo, recurso audiovisual, interacción, evaluación, ruta o dato que ya exista en la plataforma. Esto incluye de forma explícita el ejercicio audiovisual preexistente y cualquier actividad ya implementada de coordenadas o condicionales.

Antes de crear un registro nuevo, el sistema debe hacer inventario y clasificar el contenido por existente / relacionado / no existe:
Clasificación	Acción autorizada
Ya existe	Conservar sin cambios. Puede referenciarse mediante un enlace, sin moverlo ni alterar su estado.
Relacionado, pero distinto	Conservar. Proponer el nuevo ejercicio por separado, evitando duplicar el propósito didáctico sin aprobación.
No existe	Crear como borrador oculto para revisión y publicación del docente.


Precaución: una misma actividad puede tener otra denominación en la app. La equivalencia se verifica por objetivo, consigna, código e interacción, no solo por coincidencia de nombre. Si hay incertidumbre, no sobrescribir ni crear duplicados; dejarla marcada para revisión.
1. Idea pedagógica: tres unidades, un mismo proceso de diseño
Pregunta general del recorrido: ¿cómo puede una imagen dejar de ser un resultado aislado y convertirse en una familia de composiciones controladas por instrucciones?

En vez de 14 ejercicios desconectados, se proponen 14 pequeñas experiencias reunidas en tres proyectos articuladores. Cada unidad puede producir un resultado autónomo, pero también construye una comprensión que se reutiliza en la siguiente:
Unidad curricular	Proyecto articulador	Decisión creativa del estudiante	Concepto técnico que aprende
1. Fundamentos	Una imagen, múltiples posibilidades	Identificar formas, establecer instrucciones y definir una regla visual	Instrucción, orden, secuencia, estructura y algoritmo
2. Primeros pasos	Atlas de composiciones visuales	Construir un vocabulario de forma, posición y color	Processing, coordenadas, primitivas, funciones, comentarios, RGB/HSB y documentación
3. Variables	Diseñar un sistema, no una imagen	Definir parámetros y producir variaciones coherentes de una misma composición	Variables, tipos, variables integradas, expresiones, operaciones e incrementación


Hilo visual opcional: producir un sistema de pequeñas portadas o afiches abstractos. El estudiante puede elegir otro formato (textura, ícono, composición geométrica, ficha gráfica) sin perder los objetivos técnicos. No se prescribe una estética única.
La lógica de Generative Design, adaptada al nivel
1. Elemento: seleccionar formas sencillas (punto, línea, círculo, rectángulo).
2. Regla: explicitar una relación (alinear, superponer, desplazar, repetir manualmente, variar escala o tono).
3. Parámetro: identificar qué valor puede cambiar.
4. Variación: producir dos o más versiones modificando un valor por vez.
5. Comparación: describir qué permanece y qué cambia.
6. Decisión: seleccionar una variante y justificarla según una intención visual.
En estas unidades no se exige aún programar for, while, random(), if o sistemas de animación. Las variaciones pueden realizarse editando valores, ejecutando de nuevo y comparando resultados. Es una introducción al pensamiento paramétrico; los generadores más complejos corresponden a unidades posteriores.
Plantilla didáctica para cada actividad NUEVA
1. Observar → 2. Interpretar → 3. Modificar o escribir → 4. Experimentar → 5. Documentar.
- La pregunta inicial debe ser visual, no un examen de memoria de sintaxis.
- Se revela el fragmento de código después de una observación o predicción.
- Se modifica una variable o decisión a la vez, salvo cuando la actividad requiera comparar combinaciones.
- Se acepta diversidad estética si la solución demuestra comprensión técnica.
- Se privilegia la explicación del cambio sobre la obtención de una imagen idéntica.
- Si hay acompañamiento con IA, ofrecer pistas graduales y preguntas, no el sketch completo resuelto.
Formato recomendado en la plataforma: un encabezado breve, una composición exploratoria, la pregunta, un bloque pequeño de código, controles de variación si existen, y un cierre con evidencia. No ocultar la sintaxis de Processing detrás de una interfaz de sliders; la relación control ↔ valor ↔ código debe ser visible.
UNIDAD 1. Fundamentos de programación y código creativo
Proyecto articulador: Una imagen, múltiples posibilidades
Pregunta de unidad
¿Qué hace que una secuencia de instrucciones pueda convertirse en una composición visual?
Objetivo
Reconocer que los programas se construyen con instrucciones ejecutadas en un orden determinado; comenzar a formular reglas de composición y relacionar el código con procesos de diseño visual.
Temas del programa que se cubren
- Introducción a la programación.
- Instrucciones, lenguaje y estructura.
- Introducción al código creativo.
- Relación con otras herramientas de diseño.
Producto articulador
Tríptico de variaciones: tres imágenes basadas en el mismo conjunto reducido de formas. El estudiante explica qué instrucciones se conservan y qué cambios producen las distintas composiciones. Puede partir de una secuencia visual prediseñada; no se exige escribir desde cero un programa completo.
U1·01 — Un dibujo sin dibujar: la máquina de instrucciones
Problema creativo: dos imágenes usan las mismas formas, pero no producen la misma composición.
- Observar: mostrar dos dibujos que contienen un círculo y un rectángulo superpuestos en distinto orden; pedir que señale qué parece estar delante.
- Interpretar: presentar tarjetas con instrucciones de dibujo (fondo, relleno, círculo, rectángulo); el estudiante anticipa el resultado antes de ordenarlas.
- Escribir/modificar: ordenar las tarjetas y, opcionalmente, modificar el orden de dos líneas de un sketch Processing Java preexistente o de ejemplo.
- Experimentar: crear dos versiones cambiando solo el orden de las instrucciones de dibujo.
- Documentar: guardar las dos composiciones, anotar qué instrucción cambió y explicar la diferencia visual.
Pregunta guía: «Si las figuras y sus coordenadas son iguales, ¿por qué cambia la imagen?».

Conceptos: instrucción; secuencia; orden de ejecución; capas por orden de dibujo. No introducir condiciones ni ciclos todavía.

Evidencia mínima: predicción inicial + dos imágenes + explicación de 2–3 oraciones.
Criterio observable: relaciona el orden de las instrucciones con la superposición de formas.
U1·02 — La misma regla, distintas imágenes
Problema creativo: construir una familia visual sin inventar una composición completamente nueva cada vez.
- Observar: una serie de cuatro composiciones geométricas alineadas que comparten formas, pero varían en tamaño, separación o proporción.
- Interpretar: separar visualmente las propiedades fijas (cantidad/tipo de figuras en el ejemplo inicial) y las modificables (por ejemplo, distancia).
- Escribir/modificar: redactar en lenguaje cotidiano una regla breve: «Coloca tres círculos alineados, con separación constante»; vincularla con instrucciones de dibujo seleccionadas.
- Experimentar: producir tres variantes modificando un solo criterio por versión. En esta etapa, la repetición puede escribirse de manera explícita, sin for().
- Documentar: presentar la serie en una retícula y señalar qué propiedad cambió en cada imagen.
Pregunta guía: «¿Qué debe mantenerse para reconocer que todas las imágenes pertenecen al mismo sistema?».

Referencia de enfoque: los estudios de retícula y forma del apartado P.2 de Generative Design; no reproducir sketches del libro.

Evidencia mínima: serie A/B/C + regla escrita + propiedad cambiada.
Criterio observable: describe una relación entre estructura constante y variación visual.
U1·03 — Diseñar un procedimiento, no solo un resultado
Problema creativo: pensar cuándo una acción de diseño puede formularse como una regla.
- Observar: comparar una portada creada manualmente con una familia de portadas abstractas que comparten reglas.
- Interpretar: identificar decisiones que corresponden a la persona diseñadora (selección formal, intención, jerarquía) y decisiones ejecutables mediante instrucciones (posición, color, dimensión).
- Escribir/modificar: proponer cinco instrucciones en lenguaje natural para generar una composición propia; identificar cuáles podrían traducirse a Processing.
- Experimentar: intercambiar instrucciones con otra persona o reconstruir el resultado a partir de una secuencia ajena; detectar ambigüedades y precisarlas.
- Documentar: entregar instrucciones revisadas y un boceto de la composición prevista.
Pregunta guía: «¿Qué instrucción fue ambigua y cómo la harías comprobable?».

Evidencia mínima: procedimiento inicial + revisión + boceto.
Criterio observable: utiliza instrucciones claras y distingue reglas técnicas de decisiones estéticas.
Cierre de la unidad 1
El estudiante presenta su tríptico de variaciones y responde:
1. ¿Qué instrucciones produjeron el resultado?
2. ¿Qué se mantuvo entre las tres variantes?
3. ¿Qué cambió y por qué?
Evaluación formativa: secuencia comprensible (30%), identificación de invariantes y variaciones (35%), capacidad de explicar una decisión visual (35%). Ponderaciones sugeridas solo para el diagnóstico de la plataforma, no sustituyen la evaluación oficial del curso.

Condición para avanzar: reconoce que el orden de dibujo y la modificación de una regla afectan de modo predecible el resultado.
UNIDAD 2. Primeros pasos con Processing
Proyecto articulador: Atlas de composiciones visuales
Pregunta de unidad
¿Cómo traducimos una decisión de composición en instrucciones que Processing pueda ejecutar?
Objetivo
Comprender el entorno de Processing Java y representar de manera deliberada posición, forma, tamaño, relleno y color; aprender a consultar documentación y describir el código mediante comentarios.
Temas del programa que se cubren
- Presentación, historia y razón de ser de Processing.
- Interfaz, navegación y ejecución.
- Sistema de coordenadas.
- Funciones y comentarios.
- Primitivas 2D, relleno y trazo.
- Color RGB y HSB.
- Consulta de referencias y proyectos externos.
Producto articulador
Atlas visual: conjunto de pequeñas fichas que muestran cómo cambia una composición al modificar posición, tipo de forma, trazo, relleno y color. Como cierre, se reúne una composición propia con una ficha que explique sus instrucciones.
U2·01 — Un sketch es una instrucción visible
Problema creativo: reconocer las diferencias entre una imagen y el programa que la produce.
- Observar: una imagen simple obtenida con Processing y una captura del editor.
- Interpretar: identificar lienzo, editor, consola, botones para ejecutar y detener, y ubicación del archivo guardado; introducir brevemente por qué Processing fue creado para el aprendizaje de la programación visual.
- Escribir/modificar: localizar size() y background() en un sketch sencillo, modificar el tamaño del lienzo y el color de fondo.
- Experimentar: crear dos versiones del mismo sketch y comprobar que cambiar el código produce un resultado distinto.
- Documentar: guardar el .pde y rotular las principales zonas del entorno.
Pregunta guía: «¿Cuál es la diferencia entre escribir una instrucción, ejecutarla y observar su resultado?».

Evidencia mínima: archivo .pde + captura + identificación del editor, lienzo y consola.
Criterio observable: ejecuta, modifica y guarda un sketch básico y ubica las herramientas principales.
U2·02 — Cartografía del lienzo (sistema de coordenadas)
Problema creativo: una composición puede entenderse como un mapa de posiciones.
- Observar: un lienzo con origen en la esquina superior izquierda; marcar puntos y sus coordenadas.
- Interpretar: pedir predicciones sobre dónde aparecería una figura para distintas parejas (x,y); explicar la orientación particular del eje Y en Processing.
- Escribir/modificar: utilizar ellipse(x,y,...) o rect(x,y,...) para colocar elementos en posiciones solicitadas.
- Experimentar: mover una figura primero solo en X, después solo en Y y finalmente en ambos ejes.
- Documentar: mostrar tres posiciones y explicar qué parámetro cambia en cada una.
Pregunta guía: «¿Cómo sabes qué número moverá la figura horizontalmente y cuál verticalmente?».

Evidencia mínima: predicciones + tres variantes + fragmento de código.
Criterio observable: interpreta las coordenadas y ubica figuras en posiciones definidas.

Protección: este ejercicio ya fue definido anteriormente y podría estar implementado. Si existe en la plataforma, no crear otro ni editar el original. Usar el contenido existente como cobertura de este tema y crear únicamente un vínculo no destructivo si se necesita señalarlo en el plan.
U2·03 — Un alfabeto de formas
Problema creativo: crear una composición usando pocas instrucciones geométricas.
- Observar: una lámina con círculos, rectángulos, líneas y puntos, en diferentes combinaciones de trazo y relleno.
- Interpretar: identificar qué primitiva corresponde a cada elemento y cuál propiedad corresponde al contorno o al interior.
- Escribir/modificar: completar una composición con line(), rect(), ellipse(), fill(), stroke(), noFill() y strokeWeight().
- Experimentar: diseñar dos versiones de una figura abstracta, una basada en contorno y otra en superficies llenas.
- Documentar: construir una ficha visual con instrucciones usadas y dos capturas.
Pregunta guía: «¿Cuándo la misma geometría cambia de carácter por modificar su trazo o relleno?».

Evidencia mínima: dos fichas de una misma estructura formal.
Criterio observable: distingue primitivas, relleno y trazo y aplica esas instrucciones de forma intencional.
U2·04 — Orden, comentarios y lectura de un programa
Problema creativo: poder explicar cómo está construida una composición a otra persona.
- Observar: dos versiones del mismo código: una sin organización y otra con comentarios breves y agrupaciones lógicas.
- Interpretar: identificar llamadas a funciones y argumentos; distinguir el nombre de una función de los valores que recibe.
- Escribir/modificar: añadir comentarios útiles a un sketch; agrupar instrucciones del fondo, formas y detalles; no introducir todavía funciones propias si no se han explicado.
- Experimentar: cambiar el orden de una instrucción y explicar si el resultado visual cambia o si el comentario solo mejora la lectura.
- Documentar: entregar el mismo sketch con tres comentarios funcionales y una explicación breve de size(), fill() o ellipse().
Pregunta guía: «¿Qué información necesita una persona para modificar el sketch sin empezar desde cero?».

Evidencia mínima: sketch comentado + explicación de una llamada a función.
Criterio observable: identifica funciones, argumentos y comentarios; produce anotaciones legibles.
U2·05 — Laboratorio de color: de RGB a HSB
Problema creativo: encontrar una familia cromática coherente mediante números.
- Observar: cinco variaciones de una misma composición con cambios de matiz, saturación o luminosidad.
- Interpretar: comparar cómo se representa un color en RGB y HSB; explicar que son modelos distintos para describir el color.
- Escribir/modificar: ajustar valores de fill() y stroke() con RGB, después cambiar a colorMode(HSB, 360, 100, 100) en un ejemplo guiado.
- Experimentar: producir una paleta de cinco colores, variando una dimensión por vez; comparar el efecto visual de disminuir saturación frente a disminuir brillo.
- Documentar: entregar lámina cromática y registrar valores utilizados.
Pregunta guía: «¿Qué cambia cuando modificas el matiz sin cambiar la saturación ni el brillo?».

Referencia conceptual: exploraciones de espectros y paletas del capítulo P.1 de Generative Design. La actividad y su código deben ser originales.

Evidencia mínima: cinco muestras + valores + explicación de dos variaciones.
Criterio observable: utiliza colorMode() de forma consistente y diferencia RGB de HSB.
U2·06 — Anatomía de un sketch de referencia
Problema creativo: aprender a consultar ejemplos ajenos sin limitarse a copiar.
- Observar: un sketch público sencillo de Processing Java y su resultado visual. Puede utilizarse la referencia oficial o un recurso externo acreditado.
- Interpretar: encontrar una función poco familiar, localizar su página de referencia y distinguir propósito, parámetros y ejemplo.
- Escribir/modificar: realizar una modificación pequeña y verificable en una copia de práctica, conservando atribución al original.
- Experimentar: comparar el resultado inicial con el adaptado.
- Documentar: registrar fuente, instrucción consultada, cambio realizado y explicación.
Pregunta guía: «¿Qué entendiste del ejemplo que te permitió cambiarlo de forma consciente?».

Evidencia mínima: enlace, modificación, comparación, nota de atribución.
Criterio observable: utiliza una referencia técnica y explica su adaptación.
Cierre de la unidad 2
Entrega propuesta: un atlas de al menos cuatro fichas visuales (posición, forma, trazo/relleno y color), más una composición final comentada. El docente decide la cantidad efectiva según el tiempo del curso; el objetivo no es producir volumen sin reflexión.

Criterios formativos: control de coordenadas (25%), uso de primitivas y propiedades (25%), comprensión de color (20%), organización/comentarios y consulta de referencia (15%), explicación de decisiones visuales (15%). Pesos orientativos para práctica, no equivalentes a los porcentajes oficiales del curso.

Condición para avanzar: realiza cambios intencionales en un sketch y explica la relación entre el parámetro o instrucción y el resultado observado.
UNIDAD 3. Variables y personalización visual
Proyecto articulador: Diseñar un sistema, no una imagen
Pregunta de unidad
¿Qué sucede cuando las decisiones de diseño dejan de depender de números aislados y se convierten en parámetros relacionados entre sí?
Objetivo
Distinguir constantes, datos y variables; utilizar variables propias e integradas de Processing; emplear expresiones aritméticas para conservar proporciones; y reconocer el incremento como cambio de estado que preparará el aprendizaje de animación.
Temas del programa que se cubren
- Definición, utilidad y tipos básicos de variables.
- Variables integradas (built-in variables).
- Valores constantes frente a valores dinámicos.
- Operadores aritméticos.
- Tweak Mode / retoque en vivo, si está disponible en la instalación real.
- Creación, uso e incrementación de variables propias.
Producto articulador
Sistema de identidad paramétrica: a partir de un sketch sencillo (círculos, líneas o módulos), el estudiante define parámetros de tamaño, posición, separación y color, y produce cuatro variantes reconocibles como parte de una misma familia gráfica.
U3·01 — De un número a una decisión editable
Problema creativo: editar una composición sin tener que buscar y cambiar muchos números dispersos.
- Observar: comparar dos códigos que producen una imagen equivalente: uno con valores escritos directamente en varias funciones y otro con una variable compartida.
- Interpretar: identificar los valores repetidos y anticipar qué figuras dependen de la misma propiedad.
- Escribir/modificar: declarar una variable como float tamano = 80; y sustituir números pertinentes por su nombre.
- Experimentar: producir variantes cambiando solo esa declaración.
- Documentar: comparar antes/después y señalar las instrucciones afectadas.
Pregunta guía: «¿Qué cambios se vuelven más sencillos cuando una propiedad tiene un nombre?».

Evidencia mínima: fragmento inicial y parametrizado + dos variantes.
Criterio observable: declara, utiliza y modifica una variable propia con efecto predecible.
U3·02 — Composiciones que se adaptan al formato
Problema creativo: mantener el diseño centrado al cambiar el tamaño del lienzo.
- Observar: comparar una figura colocada en coordenadas absolutas con una posición calculada mediante width/2 y height/2.
- Interpretar: diferenciar el dato fijo 200 de las variables integradas width y height.
- Escribir/modificar: reemplazar posiciones absolutas por expresiones derivadas de width y height; reconocer int, float y boolean en ejemplos guiados (el uso de decisiones con booleanos se desarrollará en la unidad 6).
- Experimentar: probar al menos dos tamaños de lienzo y comparar alineación y proporción.
- Documentar: capturas y explicación de cuál versión se adapta y por qué.
Pregunta guía: «¿Cómo logras que una figura permanezca centrada cuando el lienzo cambia de tamaño?».

Evidencia mínima: dos formatos y una explicación.
Criterio observable: utiliza variables integradas y expresiones apropiadas para una composición adaptable.
U3·03 — Diseñar relaciones, no valores aislados
Problema creativo: conservar proporciones al cambiar una dimensión principal.
- Observar: una serie de composiciones donde el tamaño de círculos, la separación y la distancia al borde mantienen una relación.
- Interpretar: identificar qué magnitud puede funcionar como parámetro base.
- Escribir/modificar: usar suma, resta, multiplicación y división en relaciones como tamano * 0.5, centroX + separacion o width / 4.
- Experimentar: crear tres versiones variando el parámetro base y comprobar qué relaciones permanecen.
- Documentar: mostrar las expresiones que controlan las dimensiones y explicar una proporción.
Pregunta guía: «Si duplicas el tamaño principal, ¿qué otras propiedades deberían cambiar para conservar la estructura?».

Evidencia mínima: tres variantes + relaciones escritas.
Criterio observable: explica y aplica una relación aritmética entre propiedades visuales.
U3·04 — Mesa de control: personalizar una composición
Problema creativo: generar una familia gráfica a partir de un pequeño conjunto de decisiones editables.
- Observar: cuatro imágenes de una misma estructura con diferencias de tamaño, separación y color.
- Interpretar: identificar un parámetro por cada tipo de cambio.
- Escribir/modificar: definir al menos tres variables propias con nombres claros y utilizarlas en distintas instrucciones de dibujo.
- Experimentar: modificar un parámetro por vez y después explorar una combinación deliberada. Utilizar Tweak Mode solo si la versión real de Processing lo soporta; en otro caso, editar y ejecutar normalmente.
- Documentar: presentar una matriz de cuatro variantes, sus valores principales y una justificación de selección.
Pregunta guía: «¿Qué combinación de parámetros produce una diferencia expresiva sin perder la identidad de la serie?».

Evidencia mínima: cuatro variaciones + valores + una elección argumentada.
Criterio observable: controla un sistema sencillo mediante variables reutilizables.
U3·05 — Tres fotogramas de una variable: introducir el incremento
Problema creativo: pensar el movimiento como una secuencia de estados sin introducir aún todo el flujo de animación.
- Observar: tres imágenes fijas de una misma figura desplazada a intervalos regulares.
- Interpretar: predecir cómo cambia una coordenada si se le añade el mismo incremento en cada paso.
- Escribir/modificar: completar operaciones como x = x + paso;, x += paso; o x++; en un contexto guiado; discutir la diferencia entre incremento unitario y un incremento configurado.
- Experimentar: crear una secuencia de tres posiciones y contrastar incrementos positivos y negativos; no exigir todavía draw() animado.
- Documentar: tabla paso/posición y representación de los tres estados.
Pregunta guía: «¿Cómo describirías una trayectoria utilizando una posición inicial y una cantidad que se suma cada vez?».

Evidencia mínima: predicción de tres valores + secuencia visual + fragmento de incremento.
Criterio observable: explica dirección y magnitud de un desplazamiento a partir de una actualización numérica.
Cierre de la unidad 3
Entrega propuesta: serie de cuatro composiciones paramétricas acompañadas por un sketch original en Processing Java, una pequeña tabla de valores y un párrafo que explique qué se conserva y qué se transforma.

Criterios formativos: uso correcto de variables propias (25%), relaciones aritméticas (25%), uso de variables integradas/adaptabilidad (20%), análisis de variaciones (20%), documentación de decisiones (10%). Ponderaciones orientativas para retroalimentación, no para sustituir la evaluación oficial.

Condición para avanzar: identifica un conjunto de parámetros que gobiernan una composición y puede anticipar un resultado al modificar uno de ellos.
2. Tres fragmentos originales de apoyo en Processing Java
Estos ejemplos son material original de apoyo para guiar el desarrollo. No son copias de Generative Design, ni se deben insertar automáticamente como solución final de las actividades. Deben quedar visibles para el docente o convertirse en material explicativo gradual según el nivel y la actividad.
Ejemplo A: orden de dibujo (unidad 1)
void setup() {
  size(480, 320);
  background(246, 248, 255);
  noStroke();
  fill(49, 105, 216);
  ellipse(220, 150, 180, 180);
  fill(167, 139, 232);
  rect(175, 90, 170, 100);
}
Variación sugerida: intercambiar el orden de ellipse() y rect() conservando sus propiedades de relleno por separado. Preguntar qué figura se superpone; no dar la respuesta de antemano.
Ejemplo B: forma y propiedades (unidad 2)
void setup() {
  size(480, 320);
  background(246, 248, 255);
  stroke(36, 71, 164);
  strokeWeight(4);
  fill(184, 208, 255);
  ellipse(120, 160, 120, 120);
  noFill();
  rect(260, 100, 140, 120);
}
Variación sugerida: cambiar el color del relleno, eliminar el trazo o desplazar una primitiva. Explicar qué argumento afecta cada propiedad.
Ejemplo C: parámetros relacionados (unidad 3)
float escala = 1.0;
float separacion = 80;

void setup() {
  size(480, 320);
  noLoop();
}

void draw() {
  background(246, 248, 255);
  noStroke();
  fill(49, 105, 216);
  ellipse(width/2 - separacion, height/2, 80 * escala, 80 * escala);
  ellipse(width/2 + separacion, height/2, 80 * escala, 80 * escala);
}
Variación sugerida: producir tres versiones cambiando escala o separacion, pero no ambos a la vez al principio. noLoop() permite trabajar con una composición estática mientras se utilizan las funciones habituales de Processing.
3. Diseño de interacción recomendado para la plataforma
Pantalla de unidad
- Título curricular de la unidad y subtítulo creativo del proyecto.
- Pregunta de unidad, en una frase.
- Una serie gráfica original que muestre tres variantes de una misma regla, como invitación visual.
- Lista breve de ejercicios con etiquetas claras de estado, sin imponer desbloqueos si la plataforma no los tiene.
- Progreso real únicamente si existe registro persistente verificable.
Pantalla de ejercicio NUEVO
1. Descubre: representación visual e interrogante observacional.
2. Piensa: predicción o lectura breve del comportamiento.
3. Prueba: pequeño fragmento de Processing Java, claramente identificable.
4. Varía: una o dos modificaciones guiadas, con comparación A/B cuando sea posible.
5. Explica: texto breve sobre la regla, el cambio y el resultado.
No mostrar todos los controles simultáneamente; usar divulgación progresiva cuando la longitud lo justifique. Mantener accesibilidad de teclado, contraste y alternativa sin cursor para interacciones visuales.
Seguimiento docente
Para cada ejercicio nuevo, si la arquitectura ya lo permite:
- Predicción inicial.
- Código o modificación relevante.
- Evidencia visual.
- Explicación final.
- Número de intentos y pistas consultadas.
- Estado: sin comenzar / en proceso / completado / pendiente de revisión (según el sistema existente).
No inventar registros de ejecución si el navegador solo muestra una demostración y el sketch debe ejecutarse en Processing de escritorio.
Identidad visual
Usar la identidad educativa acordada, sin convertir las actividades en un catálogo ornamental:
- Interfaz: Nunito; código: IBM Plex Mono u otra monoespaciada existente de buena legibilidad.
- Fondo: #F6F8FF; superficie: #FFFFFF; azul de acción: #3169D8; texto: #27365A.
- Acentos visuales en composiciones: #B8D0FF, #A78BE8, #F3D9EA.
- Los gráficos deben utilizar puntos, líneas, círculos, variación y retículas: no agregar animaciones decorativas sin relación con el contenido.
4. Matriz curricular de cobertura y secuencia
Tema original	Experiencia que lo aborda	Nivel de exigencia
Instrucciones, lenguaje y estructura	U1·01; U1·03	Reconocer, ordenar y formular
Introducción al código creativo	U1·02; U1·03	Distinguir sistema y variación
Relación con herramientas de diseño	U1·03	Identificar oportunidades y límites
Historia, contexto e interfaz de Processing	U2·01	Reconocer y utilizar el entorno
Sistema de coordenadas	U2·02	Predecir y posicionar
Funciones y comentarios	U2·04	Leer, identificar y comentar
Primitivas 2D, relleno y trazo	U2·03	Componer y diferenciar propiedades
RGB/HSB	U2·05	Producir y justificar una paleta
Consulta de referencias y proyectos externos	U2·06	Buscar, citar y adaptar con comprensión
Definición, tipos y utilidad de variables	U3·01; U3·02	Nombrar, declarar y utilizar
Variables integradas	U3·02	Crear relaciones adaptables
Valores absolutos y dinámicos	U3·01; U3·02	Comparar y sustituir
Operadores aritméticos	U3·03	Mantener proporciones
Tweak Mode / retoque en vivo	U3·04	Utilizar solo si está disponible
Variables propias	U3·01; U3·04	Controlar múltiples propiedades
Incrementación	U3·05	Interpretar actualización de estados


Total propuesto en estas unidades: 14 experiencias (3 + 6 + 5). No significa autorizar 14 creaciones nuevas: cada una se verifica contra el inventario de la aplicación y se omite si ya existe una actividad equivalente.
5. Evaluación y administración del contenido
Respecto a la planeación oficial
Las evidencias del laboratorio son formativas y complementarias. La planeación conserva sus criterios oficiales (actividades 30%, parcial de coordenadas y funciones 25%, proyecto final 40%, participación 5%). La entrega formal se realiza mediante Brightspace y los ejercicios que requieren sketch deben respetar el uso de .pde o carpetas comprimidas, según corresponda. La aplicación no debe sustituir esos procedimientos por defecto.
Respecto al uso de IA
La planeación permite utilizar herramientas de IA para generar código únicamente a partir de la novena sesión, con declaración de su procedencia y comprensión del resultado. Por ello, las actividades de las unidades 1–3 deben funcionar sin requerir código generado por IA; cualquier agente tutor debe limitarse a preguntas, orientaciones y pistas según la configuración docente y las reglas vigentes. Google AI Studio se utiliza aquí para desarrollar la plataforma, no para autorizar al estudiantado a utilizar IA antes del momento establecido.
Reglas para Google AI Studio / equipo de implementación
Objetivo: implementar únicamente los contenidos nuevos aprobados de U1–U3, aprovechando el sistema de lecciones existente.
1. Inspecciona el repositorio, el CMS y el inventario de ejercicios publicados y en borrador.
2. Para cada U1·xx, U2·xx y U3·xx, determina equivalencia con actividades existentes.
3. No cambies, dupliques, migres, ocultes, renombres ni muevas ejercicios existentes. Incluye el audiovisual existente y cualquier actividad de coordenadas o condicionales.
4. Si existe una actividad equivalente, deja el registro original como está y marca el ejercicio de este plan como cubierto por contenido existente.
5. Si no existe, crea un borrador no visible al estudiante, con título, objetivo, pasos, consigna, evidencias, criterios y recursos necesarios.
6. Conserva títulos curriculares de las unidades; utiliza los subtítulos creativos solo como recurso didáctico opcional.
7. No incorpores contenidos técnicos de unidades posteriores como prerrequisitos. No usar for, while, if o random() como exigencia para resolver U1–U3.
8. No sustituyas ejemplos de Processing Java por p5.js. Una visualización web introductoria puede hacerse con Canvas/SVG si se identifica como demostración y no se presenta como ejecución real del sketch Java.
9. Preserva autenticación, persistencia, progreso, permisos, rutas y evaluaciones.
10. Permite al docente gestionar solo las actividades nuevas desde el panel administrativo, con revisión, orden y publicación manual; no modifiques metadatos de registros originales.
11. No publiques automáticamente. Reporta por separado: ya existía, creado como borrador, requiere decisión docente.
12. Comprueba que las actividades nuevas funcionen, que el código proporcionado sea válido y que ninguna prueba altere el contenido anterior.
Criterios de aceptación: cobertura curricular comprobable; ejercicios visuales breves y claros; modificaciones limitadas al alcance; todas las actividades existentes intactas; actividades nuevas ocultas hasta aprobación; seguimiento y evidencias compatibles con la arquitectura real.
6. Decisiones para validar con estudiantes
Al probar este recorrido en clase, observar:
- Si el grupo entiende una regla visual antes de comprender la sintaxis.
- Si puede explicar diferencias entre orden de instrucciones, coordenadas, propiedades y variables.
- Si la matriz de variaciones ayuda a comparar resultados o añade carga cognitiva.
- Si las actividades tienen suficientes decisiones creativas sin adelantar conceptos técnicos.
- Si las preguntas generan explicaciones verificables y no respuestas de una sola palabra.
- Si la plataforma permite conservar predicciones y compararlas con el resultado real.
Criterio final de diseño: el estudiante no debería terminar estas unidades solo con una imagen. Debería poder decir qué instrucciones la producen, qué puede cambiar y por qué su variación conserva o transforma una intención de diseño.