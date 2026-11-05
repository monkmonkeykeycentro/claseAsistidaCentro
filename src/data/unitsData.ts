/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type InventoryClassification = 'ya_existia' | 'creado_borrador' | 'decision_docente';
export type UnitPublicationStatus = 'draft' | 'published';

export interface ExerciseDefinition {
  id: string;
  code: string; // e.g. "U1·01", "U2·02"
  unitId: 'u1' | 'u2' | 'u3';
  unitTitle: string;
  title: string;
  subtitle: string;
  creativeProblem: string;
  pedagogicalSteps: {
    observe: string;
    interpret: string;
    modify: string;
    experiment: string;
    document: string;
  };
  guidingQuestion: string;
  minimumEvidence: string;
  observableCriteria: string;
  technicalScope: string;
  supportExampleCode?: string;

  inventoryStatus: InventoryClassification;
  status: UnitPublicationStatus;
  existingReference?: string;

  // Interactive runner data
  objective: string;
  visualStartDescription: string;
  activityDescription: string;
  interpretationQuestion: string;
  interpretationOptions: Array<{
    id: string;
    text: string;
    isCorrect: boolean;
    feedback: string;
  }>;
  evidenceRequirement: string;
  achievementCriteria: string;
  defaultProcessingCode: string;
  badge?: string;
  estimatedTime?: string;
}

export interface UnitDefinition {
  id: 'u1' | 'u2' | 'u3';
  number: number;
  title: string;
  creativeSubtitle: string;
  summary: string;
  contents: string[];
  purpose: string;
  unitQuestion: string;
  project: {
    title: string;
    creativeDecision: string;
    technicalConcept: string;
    deliverable: string;
    rubric: { concept: string; percentage: number }[];
    conditionToAdvance: string;
  };
  prerequisiteUnitIds?: Array<'u1' | 'u2' | 'u3'>;
  exercises: ExerciseDefinition[];
}

export const CURRICULUM_UNITS: UnitDefinition[] = [
  // ==========================================================================
  // UNIDAD 1: FUNDAMENTOS DE PROGRAMACIÓN Y CÓDIGO CREATIVO
  // ==========================================================================
  {
    id: 'u1',
    number: 1,
    title: 'Fundamentos de programación y código creativo',
    creativeSubtitle: 'Una imagen, múltiples posibilidades',
    unitQuestion: '¿Qué hace que una secuencia de instrucciones pueda convertirse en una composición visual?',
    summary:
      'Introducción a la programación, instrucciones, lenguaje, estructura y relación del código con los procesos de diseño visual contemporáneo.',
    contents: [
      'Introducción a la programación',
      'Instrucciones, lenguaje y estructura',
      'Introducción al código creativo',
      'Relación con otras herramientas de diseño',
    ],
    purpose:
      'Reconocer que los programas se construyen con instrucciones ejecutadas en un orden determinado; comenzar a formular reglas de composición y relacionar el código con procesos de diseño visual.',
    project: {
      title: 'Tríptico de variaciones',
      creativeDecision: 'Identificar formas, establecer instrucciones y definir una regla visual.',
      technicalConcept: 'Instrucción, orden, secuencia, estructura y algoritmo.',
      deliverable:
        'Tres imágenes basadas en el mismo conjunto reducido de formas. El estudiante explica qué instrucciones se conservan y qué cambios producen las distintas composiciones.',
      rubric: [
        { concept: 'Secuencia comprensible de instrucciones', percentage: 30 },
        { concept: 'Identificación de invariantes y variaciones', percentage: 35 },
        { concept: 'Capacidad de justificar una decisión visual', percentage: 35 },
      ],
      conditionToAdvance:
        'Reconoce que el orden de dibujo y la modificación de una regla afectan de modo predecible el resultado.',
    },
    exercises: [
      {
        id: 'u1-e1',
        code: 'U1·01',
        unitId: 'u1',
        unitTitle: 'Unidad 1. Fundamentos de programación y código creativo',
        title: 'Una imagen como secuencia de instrucciones',
        subtitle: 'Un dibujo sin dibujar: la máquina de instrucciones',
        creativeProblem: 'Dos imágenes usan las mismas formas, pero no producen la misma composición.',
        pedagogicalSteps: {
          observe:
            'Mostrar dos dibujos que contienen un círculo y un rectángulo superpuestos en distinto orden; pedir que señale qué parece estar delante.',
          interpret:
            'Presentar tarjetas con instrucciones de dibujo (fondo, relleno, círculo, rectángulo); el estudiante anticipa el resultado antes de ordenarlas.',
          modify:
            'Ordenar las tarjetas y, opcionalmente, modificar el orden de dos líneas de un sketch Processing Java preexistente o de ejemplo.',
          experiment:
            'Crear dos versiones cambiando solo el orden de las instrucciones de dibujo.',
          document:
            'Guardar las dos composiciones, anotar qué instrucción cambió y explicar la diferencia visual.',
        },
        guidingQuestion: 'Si las figuras y sus coordenadas son iguales, ¿por qué cambia la imagen?',
        minimumEvidence: 'Predicción inicial + dos imágenes + explicación de 2–3 oraciones.',
        observableCriteria: 'Relaciona el orden de las instrucciones con la superposición de formas.',
        technicalScope:
          'Instrucción; secuencia; orden de ejecución; capas por orden de dibujo. No introducir condiciones ni ciclos todavía. background(), rect(), ellipse().',
        supportExampleCode: `// Ejemplo A: orden de dibujo (unidad 1)
void setup() {
  size(480, 320);
  background(246, 248, 255);
  noStroke();
  fill(49, 105, 216);
  ellipse(220, 150, 180, 180);
  fill(167, 139, 232);
  rect(175, 90, 170, 100);
}
// Variación: intercambiar el orden de ellipse() y rect() conservando su fill()`,
        inventoryStatus: 'creado_borrador',
        status: 'draft',
        objective:
          'Identificar la relación entre una secuencia ordenada de instrucciones y el resultado visual en pantalla.',
        visualStartDescription:
          'Presentar dos composiciones construidas exactamente con las mismas figuras (un fondo, un círculo y un rectángulo), pero con distinto orden de dibujo.',
        activityDescription:
          'Ordenar instrucciones sencillas para construir una imagen; anticipar qué elemento quedará encima; comprobar y corregir el orden de las capas.',
        interpretationQuestion:
          'Si dibujo primero el círculo y después el rectángulo en las mismas coordenadas, ¿qué parte de la imagen cambia y por qué?',
        interpretationOptions: [
          {
            id: 'opt1',
            text: 'El rectángulo queda superpuesto tapando parcialmente al círculo, porque en Processing las instrucciones se pintan secuencialmente como capas de pintura fresca.',
            isCorrect: true,
            feedback:
              '¡Correcto! En Processing la computadora lee de arriba hacia abajo: lo que se dibuja después se estampa sobre lo anterior.',
          },
          {
            id: 'opt2',
            text: 'No cambia nada porque ambas figuras tienen coordenadas distintas.',
            isCorrect: false,
            feedback:
              'Incorrecto. Si las figuras comparten zona espacial, la figura invocada al final se superpone sobre la anterior.',
          },
          {
            id: 'opt3',
            text: 'El círculo se hace transparente automáticamente.',
            isCorrect: false,
            feedback:
              'Incorrecto. Las figuras son opacas a menos que se especifique un canal alfa en fill().',
          },
        ],
        evidenceRequirement:
          'Predicción inicial, secuencia ordenada de instrucciones, imagen resultante y explicación del orden.',
        achievementCriteria:
          'Reconoce que las instrucciones tienen un orden temporal de ejecución y justifica la diferencia visual.',
        defaultProcessingCode: `void setup() {
  size(480, 320);
}

void draw() {
  // Capa 1: Fondo
  background(246, 248, 255);

  // Capa 2: Círculo azul
  noStroke();
  fill(49, 105, 216);
  ellipse(220, 150, 180, 180);

  // Capa 3: Rectángulo violeta superpuesto
  fill(167, 139, 232);
  rect(175, 90, 170, 100);
}`,
        badge: 'Secuencia & Capas',
        estimatedTime: '20 min',
      },
      {
        id: 'u1-e2',
        code: 'U1·02',
        unitId: 'u1',
        unitTitle: 'Unidad 1. Fundamentos de programación y código creativo',
        title: 'Una regla, múltiples variaciones',
        subtitle: 'La misma regla, distintas imágenes',
        creativeProblem: 'Construir una familia visual sin inventar una composición completamente nueva cada vez.',
        pedagogicalSteps: {
          observe:
            'Una serie de cuatro composiciones geométricas alineadas que comparten formas, pero varían en tamaño, separación o proporción.',
          interpret:
            'Separar visualmente las propiedades fijas (cantidad/tipo de figuras) y las modificables (distancia, escala).',
          modify:
            'Redactar en lenguaje cotidiano una regla breve: «Coloca tres círculos alineados, con separación constante»; vincularla con instrucciones de dibujo seleccionadas.',
          experiment:
            'Producir tres variantes modificando un solo criterio por versión. En esta etapa, la repetición puede escribirse de manera explícita, sin for().',
          document:
            'Presentar la serie en una retícula y señalar qué propiedad cambió en cada imagen.',
        },
        guidingQuestion: '¿Qué debe mantenerse para reconocer que todas las imágenes pertenecen al mismo sistema?',
        minimumEvidence: 'Serie A/B/C + regla escrita + propiedad cambiada.',
        observableCriteria: 'Describe una relación entre estructura constante y variación visual.',
        technicalScope:
          'Estructura constante vs. parámetros modificables. Repetición manual sin bucles for() ni while(). Referencia a estudios de retícula de Generative Design P.2.',
        supportExampleCode: `// Variación paramétrica manual sin for()
void setup() {
  size(480, 320);
  background(246, 248, 255);
  noStroke();
  fill(49, 105, 216);
  
  // Regla: 3 círculos alineados con separación fija de 100px
  ellipse(140, 160, 60, 60);
  ellipse(240, 160, 60, 60);
  ellipse(340, 160, 60, 60);
}`,
        inventoryStatus: 'creado_borrador',
        status: 'draft',
        objective:
          'Distinguir entre dibujar manualmente una composición y definir reglas paramétricas que permiten transformarla sistemáticamente.',
        visualStartDescription:
          'Tres imágenes compuestas por un mismo conjunto de formas con diferente separación, tamaño o número de elementos generadas por una regla.',
        activityDescription:
          'Identificar la propiedad que cambia entre las tres composiciones, formular la regla en lenguaje cotidiano y escoger un parámetro para producir una nueva variación.',
        interpretationQuestion:
          '¿Qué se conserva entre las tres imágenes y qué parámetro genera la diferencia visual?',
        interpretationOptions: [
          {
            id: 'opt1',
            text: 'Se conserva el tipo de forma geométrica y su alineación horizontal; lo que genera la variación es el parámetro numérico de separación o escala.',
            isCorrect: true,
            feedback:
              '¡Exacto! El sistema mantiene su identidad estructural mientras los parámetros numéricos exploran posibilidades.',
          },
          {
            id: 'opt2',
            text: 'Cada imagen es completamente independiente y no comparte ninguna propiedad.',
            isCorrect: false,
            feedback:
              'Incorrecto: observa cómo las tres figuras comparten tipo geométrico y alineación.',
          },
        ],
        evidenceRequirement:
          'Serie A/B/C, regla formulada en lenguaje cotidiano y nombre del parámetro modificado.',
        achievementCriteria:
          'Diferencia la estructura constante de los parámetros modificables en un sistema visual.',
        defaultProcessingCode: `void setup() {
  size(480, 320);
}

void draw() {
  background(246, 248, 255);
  noStroke();
  fill(49, 105, 216);

  // Parámetro de separación constante:
  int centroX = 240;
  int paso = 80; // Modifica este valor (40, 80, 120)

  ellipse(centroX - paso, 160, 50, 50);
  ellipse(centroX, 160, 50, 50);
  ellipse(centroX + paso, 160, 50, 50);
}`,
        badge: 'Regla & Variación',
        estimatedTime: '25 min',
      },
      {
        id: 'u1-e3',
        code: 'U1·03',
        unitId: 'u1',
        unitTitle: 'Unidad 1. Fundamentos de programación y código creativo',
        title: 'Del boceto a un procedimiento de diseño',
        subtitle: 'Diseñar un procedimiento, no solo un resultado',
        creativeProblem: 'Pensar cuándo una acción de diseño puede formularse como una regla.',
        pedagogicalSteps: {
          observe:
            'Comparar una portada creada manualmente con una familia de portadas abstractas que comparten reglas.',
          interpret:
            'Identificar decisiones que corresponden a la persona diseñadora (selección formal, intención, jerarquía) y decisiones ejecutables mediante instrucciones (posición, color, dimensión).',
          modify:
            'Proponer cinco instrucciones en lenguaje natural para generar una composición propia; identificar cuáles podrían traducirse a Processing.',
          experiment:
            'Intercambiar instrucciones con otra persona o reconstruir el resultado a partir de una secuencia ajena; detectar ambigüedades y precisarlas.',
          document:
            'Entregar instrucciones revisadas y un boceto de la composición prevista.',
        },
        guidingQuestion: '¿Qué instrucción fue ambigua y cómo la harías comprobable?',
        minimumEvidence: 'Procedimiento inicial + revisión + boceto.',
        observableCriteria: 'Utiliza instrucciones claras y distingue reglas técnicas de decisiones estéticas.',
        technicalScope:
          'Delimitación entre decisiones humanas de autoría y automatización algorítmica. Traducción de intenciones a pseudocódigo comprobable.',
        inventoryStatus: 'creado_borrador',
        status: 'draft',
        objective:
          'Reconocer cuándo el código aporta a un proceso creativo y traducir una intención de diseño en un procedimiento explícito de tres instrucciones.',
        visualStartDescription:
          'Comparativa entre un afiche dibujado a mano de manera estática y una familia de afiches abstractos generados mediante un procedimiento con reglas claras.',
        activityDescription:
          'Elegir un caso de diseño; describir qué partes serían fijas y cuáles convendría parametrizar; redactar tres instrucciones no ambiguas.',
        interpretationQuestion:
          '¿Qué decisión de diseño sigue tomando la persona diseñadora y qué tarea resuelve el programa en este afiche paramétrico?',
        interpretationOptions: [
          {
            id: 'opt1',
            text: 'La persona diseñadora define las proporciones, la paleta y la regla de armonía; el programa calcula posiciones, repeticiones y variaciones numéricas exactas.',
            isCorrect: true,
            feedback:
              '¡Brillante! El código no reemplaza la creatividad: la potencia como una herramienta de amplificación formal.',
          },
          {
            id: 'opt2',
            text: 'El programa toma todas las decisiones estéticas de forma autónoma sin intervención humana.',
            isCorrect: false,
            feedback:
              'Falso: el programa ejecuta instrucciones mecánicas; el criterio y la intención pertenecen a la persona diseñadora.',
          },
        ],
        evidenceRequirement:
          'Procedimiento formal de tres instrucciones explícitas, boceto esquemático y justificación de partes fijas vs. dinámicas.',
        achievementCriteria:
          'Propone un uso pertinente del código creativo sin equiparar automatización con creatividad espontánea.',
        defaultProcessingCode: `void setup() {
  size(400, 500); // Proporción afiche vertical
}

void draw() {
  // Instrucción 1: Fondo neutro institucional
  background(240, 240, 245);
  
  // Instrucción 2: Gran contenedor geométrico de cabecera
  fill(40, 123, 93);
  noStroke();
  rect(40, 40, 320, 200);
  
  // Instrucción 3: Acento visual de contraste descentrado
  fill(230, 182, 90);
  ellipse(280, 240, 90, 90);
}`,
        badge: 'Procedimiento & Diseño',
        estimatedTime: '25 min',
      },
    ],
  },

  // ==========================================================================
  // UNIDAD 2: PRIMEROS PASOS CON PROCESSING
  // ==========================================================================
  {
    id: 'u2',
    prerequisiteUnitIds: ['u1'],
    number: 2,
    title: 'Primeros pasos con Processing',
    creativeSubtitle: 'Atlas de composiciones visuales',
    unitQuestion: '¿Cómo traducimos una decisión de composición en instrucciones que Processing pueda ejecutar?',
    summary:
      'Entorno de Processing Java, sistema cartesiano en pantalla, primitivas 2D, trazo, relleno, espacios de color RGB/HSB y consulta de referencias oficiales.',
    contents: [
      'Presentación, historia y razón de ser de Processing',
      'Interfaz, navegación y ejecución',
      'Sistema de coordenadas',
      'Funciones y comentarios',
      'Primitivas 2D, relleno y trazo',
      'Color RGB y HSB',
      'Consulta de referencias y proyectos externos',
    ],
    purpose:
      'Comprender el entorno de Processing Java y representar de manera deliberada posición, forma, tamaño, relleno y color; aprender a consultar documentación y describir el código mediante comentarios.',
    project: {
      title: 'Atlas de composiciones visuales',
      creativeDecision: 'Construir un vocabulario de forma, posición y color.',
      technicalConcept: 'Processing, coordenadas, primitivas, funciones, comentarios, RGB/HSB y documentación.',
      deliverable:
        'Conjunto de pequeñas fichas que muestran cómo cambia una composición al modificar posición, forma, trazo, relleno y color, más una composición propia comentada.',
      rubric: [
        { concept: 'Control riguroso de coordenadas (X, Y)', percentage: 25 },
        { concept: 'Uso de primitivas 2D, trazo y relleno', percentage: 25 },
        { concept: 'Comprensión y aplicación de color RGB/HSB', percentage: 20 },
        { concept: 'Comentarios legibles y consulta de referencia', percentage: 15 },
        { concept: 'Explicación fundamentada de decisiones visuales', percentage: 15 },
      ],
      conditionToAdvance:
        'Realiza cambios intencionales en un sketch y explica la relación entre el parámetro o instrucción y el resultado observado.',
    },
    exercises: [
      {
        id: 'u2-e1',
        code: 'U2·01',
        unitId: 'u2',
        unitTitle: 'Unidad 2. Primeros pasos con Processing',
        title: 'Un sketch es una instrucción visible',
        subtitle: 'Interfaz, navegación, ventana de ejecución y consola',
        creativeProblem: 'Reconocer las diferencias entre una imagen estática y el programa que la produce.',
        pedagogicalSteps: {
          observe:
            'Una imagen simple obtenida con Processing y una captura del editor.',
          interpret:
            'Identificar lienzo, editor, consola, botones para ejecutar y detener, y ubicación del archivo guardado; introducir brevemente por qué Processing fue creado para el aprendizaje de la programación visual.',
          modify:
            'Localizar size() y background() en un sketch sencillo, modificar el tamaño del lienzo y el color de fondo.',
          experiment:
            'Crear dos versiones del mismo sketch y comprobar que cambiar el código produce un resultado distinto.',
          document:
            'Guardar el .pde y rotular las principales zonas del entorno.',
        },
        guidingQuestion: '¿Cuál es la diferencia entre escribir una instrucción, ejecutarla y observar su resultado?',
        minimumEvidence: 'Archivo .pde + captura + identificación del editor, lienzo y consola.',
        observableCriteria: 'Ejecuta, modifica y guarda un sketch básico y ubica las herramientas principales.',
        technicalScope: 'Ventana gráfica, consola de texto, size(ancho, alto), background(r, g, b) y guardado .pde.',
        inventoryStatus: 'creado_borrador',
        status: 'draft',
        objective:
          'Identificar las partes del entorno de Processing (editor, ventana gráfica, consola) y comprender el ciclo escribir → ejecutar → observar.',
        visualStartDescription:
          'Captura del IDE de Processing con sus 4 zonas señaladas: Barra de botones (Play/Stop), Editor de código, Lienzo de salida gráfica y Consola de depuración.',
        activityDescription:
          'Localizar size() y background() en un sketch simple, modificar el tamaño del lienzo y verificar cómo impacta la salida gráfica y los mensajes en consola.',
        interpretationQuestion:
          '¿Cuál es la función específica de la consola de texto en comparación con la ventana del lienzo gráfico en Processing?',
        interpretationOptions: [
          {
            id: 'opt1',
            text: 'La consola imprime mensajes de texto, variables de depuración y errores técnicos para la persona programadora, mientras que el lienzo renderiza las formas visuales.',
            isCorrect: true,
            feedback:
              '¡Correcto! La consola es tu canal de diagnóstico íntimo con la computadora.',
          },
          {
            id: 'opt2',
            text: 'La consola dibuja las imágenes en baja resolución.',
            isCorrect: false,
            feedback:
              'Incorrecto: la consola solo imprime texto alfanumérico.',
          },
        ],
        evidenceRequirement:
          'Archivo .pde rotulado con las 4 zonas de la interfaz y sketch ejecutado con tamaño modificado.',
        achievementCriteria:
          'Ejecuta, modifica y guarda un sketch básico y ubica las herramientas principales.',
        defaultProcessingCode: `void setup() {
  size(500, 350);
}

void draw() {
  background(246, 248, 255);
  
  fill(49, 105, 216);
  noStroke();
  rect(100, 80, 300, 180);
  
  println("Fotograma renderizado en lienzo 500x350.");
}`,
        badge: 'Entorno & Ejecución',
        estimatedTime: '20 min',
      },
      {
        id: 'u2-e2',
        code: 'U2·02',
        unitId: 'u2',
        unitTitle: 'Unidad 2. Primeros pasos con Processing',
        title: 'Cartografía del lienzo (sistema de coordenadas)',
        subtitle: 'Del espacio a la forma: retícula cartesiana, origen (0,0) y ejes X / Y',
        creativeProblem: 'Una composición puede entenderse como un mapa de posiciones numéricas precisas.',
        pedagogicalSteps: {
          observe:
            'Un lienzo con origen en la esquina superior izquierda; marcar puntos y sus coordenadas.',
          interpret:
            'Pedir predicciones sobre dónde aparecería una figura para distintas parejas (x, y); explicar la orientación particular del eje Y en Processing (crece hacia abajo).',
          modify:
            'Utilizar ellipse(x, y, ...) o rect(x, y, ...) para colocar elementos en posiciones solicitadas.',
          experiment:
            'Mover una figura primero solo en X, después solo en Y y finalmente en ambos ejes.',
          document:
            'Mostrar tres posiciones y explicar qué parámetro cambia en cada una.',
        },
        guidingQuestion: '¿Cómo sabes qué número moverá la figura horizontalmente y cuál verticalmente?',
        minimumEvidence: 'Predicciones + tres variantes + fragmento de código.',
        observableCriteria: 'Interpreta las coordenadas y ubica figuras en posiciones definidas.',
        technicalScope:
          'Protegido: Se conserva íntegramente la experiencia interactiva preexistente CoordinateSystemExercise.tsx.',
        inventoryStatus: 'ya_existia',
        status: 'published',
        existingReference: 'pilot-coordinates',
        objective:
          'Comprender el sistema cartesiano de Processing Java, el origen (0, 0) y posicionar elementos con precisión.',
        visualStartDescription:
          'Retícula cartesiana interactiva con origen (0, 0) en la esquina superior izquierda, visualización de ejes X e Y, y telemetría de coordenadas.',
        activityDescription:
          'Explora la retícula interactiva, predice la posición de las figuras y completa el código para posicionar 3 elementos en metas dadas.',
        interpretationQuestion:
          'Si incrementas el valor numérico de la coordenada Y en Processing, ¿hacia qué dirección física se desplaza la figura en el monitor?',
        interpretationOptions: [
          {
            id: 'opt1',
            text: 'Desciende hacia abajo en la pantalla, porque en los sistemas gráficos por píxeles el eje Y comienza en 0 en la parte superior y aumenta hacia el borde inferior.',
            isCorrect: true,
            feedback:
              '¡Exacto! El eje Y digital crece hacia abajo, a diferencia de la geometría matemática tradicional.',
          },
          {
            id: 'opt2',
            text: 'Sube hacia arriba hacia el techo de la pantalla.',
            isCorrect: false,
            feedback:
              'Cuidado: en pantallas de computadora el eje Y está invertido respecto al plano cartesiano escolar.',
          },
        ],
        evidenceRequirement:
          'Predicción inicial, validación de las 3 metas en la retícula cartesiana y código Processing Java final.',
        achievementCriteria:
          'Interpreta las coordenadas y ubica figuras en posiciones definidas.',
        defaultProcessingCode: `void setup() {
  size(600, 400);
}

void draw() {
  background(246, 248, 255);
  
  // Figura 1: Círculo en (300, 200)
  fill(49, 105, 216);
  noStroke();
  ellipse(300, 200, 60, 60);
  
  // Figura 2: Rectángulo en (150, 100)
  fill(167, 139, 232);
  rect(150, 100, 80, 80);
}`,
        badge: 'Coordenadas Cartesiano',
        estimatedTime: '25 min',
      },
      {
        id: 'u2-e3',
        code: 'U2·03',
        unitId: 'u2',
        unitTitle: 'Unidad 2. Primeros pasos con Processing',
        title: 'Un alfabeto de formas',
        subtitle: 'Primitivas 2D, contorno, relleno y grosor de trazo',
        creativeProblem: 'Crear una composición usando pocas instrucciones geométricas básicas.',
        pedagogicalSteps: {
          observe:
            'Una lámina con círculos, rectángulos, líneas y puntos, en diferentes combinaciones de trazo y relleno.',
          interpret:
            'Identificar qué primitiva corresponde a cada elemento y cuál propiedad corresponde al contorno o al interior.',
          modify:
            'Completar una composición con line(), rect(), ellipse(), fill(), stroke(), noFill() y strokeWeight().',
          experiment:
            'Diseñar dos versiones de una figura abstracta, una basada en contorno y otra en superficies llenas.',
          document:
            'Construir una ficha visual con instrucciones usadas y dos capturas.',
        },
        guidingQuestion: '¿Cuándo la misma geometría cambia de carácter por modificar su trazo o relleno?',
        minimumEvidence: 'Dos fichas de una misma estructura formal.',
        observableCriteria: 'Distingue primitivas, relleno y trazo y aplica esas instrucciones de forma intencional.',
        technicalScope: 'rect(), ellipse(), line(), point(), fill(), noFill(), stroke(), noStroke(), strokeWeight().',
        supportExampleCode: `// Ejemplo B: forma y propiedades (unidad 2)
void setup() {
  size(480, 320);
  background(246, 248, 255);
  stroke(36, 71, 164);
  strokeWeight(4);
  fill(184, 208, 255);
  ellipse(120, 160, 120, 120);
  noFill();
  rect(260, 100, 140, 120);
}`,
        inventoryStatus: 'creado_borrador',
        status: 'draft',
        objective:
          'Dominar las primitivas geométricas 2D y sus propiedades de masa y línea para crear composiciones equilibradas.',
        visualStartDescription:
          'Lámina visual comparando dos versiones de una misma estructura: versión A con masas planas de color y versión B con líneas de contorno y transparencias.',
        activityDescription:
          'Utilizar rect(), ellipse(), line(), strokeWeight(), stroke() y fill() para construir una ficha visual en dos variaciones de estilo.',
        interpretationQuestion:
          'Si aplicas noFill() antes de rect(), ¿qué parte de la figura se dibuja y qué parte queda transparente?',
        interpretationOptions: [
          {
            id: 'opt1',
            text: 'El interior del rectángulo queda completamente transparente (mostrando lo que está detrás), y solo se dibuja la línea de su contorno.',
            isCorrect: true,
            feedback:
              '¡Correcto! noFill() desactiva el relleno, dejando visible únicamente el trazo especificado con stroke().',
          },
          {
            id: 'opt2',
            text: 'La figura completa se borra y no se ve nada.',
            isCorrect: false,
            feedback:
              'Incorrecto: mientras stroke() esté activo, el contorno se sigue pintando.',
          },
        ],
        evidenceRequirement:
          'Ficha visual con dos capturas (estilo masa vs. estilo contorno) y listado de primitivas empleadas.',
        achievementCriteria:
          'Distingue primitivas, relleno y trazo y aplica esas instrucciones de forma intencional.',
        defaultProcessingCode: `void setup() {
  size(480, 320);
}

void draw() {
  background(246, 248, 255);

  // Figura 1: Relleno sólido suave con contorno grueso
  stroke(36, 71, 164);
  strokeWeight(4);
  fill(184, 208, 255);
  ellipse(140, 160, 120, 120);

  // Figura 2: Hueco transparente con contorno
  noFill();
  rect(260, 100, 140, 120);

  // Figura 3: Línea de tensión diagonal
  stroke(230, 100, 80);
  strokeWeight(2);
  line(140, 160, 330, 160);
}`,
        badge: 'Primitivas & Trazo',
        estimatedTime: '25 min',
      },
      {
        id: 'u2-e4',
        code: 'U2·04',
        unitId: 'u2',
        unitTitle: 'Unidad 2. Primeros pasos con Processing',
        title: 'Orden, comentarios y lectura de un programa',
        subtitle: 'Funciones, argumentos, semántica y comentarios con //',
        creativeProblem: 'Poder explicar cómo está construida una composición a otra persona sin ambigüedades.',
        pedagogicalSteps: {
          observe:
            'Dos versiones del mismo código: una sin organización y otra con comentarios breves y agrupaciones lógicas.',
          interpret:
            'Identificar llamadas a funciones y argumentos; distinguir el nombre de una función de los valores que recibe.',
          modify:
            'Añadir comentarios útiles a un sketch; agrupar instrucciones del fondo, formas y detalles; no introducir todavía funciones propias si no se han explicado.',
          experiment:
            'Cambiar el orden de una instrucción y explicar si el resultado visual cambia o si el comentario solo mejora la lectura.',
          document:
            'Entregar el mismo sketch con tres comentarios funcionales y una explicación breve de size(), fill() o ellipse().',
        },
        guidingQuestion: '¿Qué información necesita una persona para modificar el sketch sin empezar desde cero?',
        minimumEvidence: 'Sketch comentado + explicación de una llamada a función.',
        observableCriteria: 'Identifica funciones, argumentos y comentarios; produce anotaciones legibles.',
        technicalScope: 'Anatomía de llamada a función nombre(arg1, arg2); comentarios de línea // y legibilidad.',
        inventoryStatus: 'creado_borrador',
        status: 'draft',
        objective:
          'Leer un programa identificando llamadas a funciones, listas de argumentos y redactar comentarios que faciliten el trabajo colaborativo.',
        visualStartDescription:
          'Comparativa lado a lado entre un código plano sin indentar y un sketch estructurado en bloques lógicos con comentarios útiles.',
        activityDescription:
          'Agrupar instrucciones por zonas semánticas (Fondo, Estructura principal, Detalles) y añadir al menos 3 comentarios con //.',
        interpretationQuestion:
          '¿Cuál es la función pedagógica y técnica principal de los comentarios con // en un sketch de Processing?',
        interpretationOptions: [
          {
            id: 'opt1',
            text: 'Son notas ignoradas por la máquina que documentan el propósito de las instrucciones para personas humanas, facilitando la colaboración y el mantenimiento.',
            isCorrect: true,
            feedback:
              '¡Exacto! El código se escribe una vez, pero se lee decenas de veces.',
          },
          {
            id: 'opt2',
            text: 'Hacen que el programa corra más rápido en memoria.',
            isCorrect: false,
            feedback:
              'Falso: la computadora descarta los comentarios antes de compilar.',
          },
        ],
        evidenceRequirement:
          'Sketch estructurado con comentarios de intención de diseño y explicación sintáctica de una función.',
        achievementCriteria:
          'Identifica funciones, argumentos y comentarios; produce anotaciones legibles.',
        defaultProcessingCode: `void setup() {
  size(480, 320); // 1. Configuración de dimensiones
}

void draw() {
  // --- ZONA 1: FONDO ---
  background(246, 248, 255);

  // --- ZONA 2: ESTRUCTURA PRINCIPAL ---
  // Rectángulo base centrado
  noStroke();
  fill(49, 105, 216);
  rect(140, 80, 200, 160);

  // --- ZONA 3: DETALLE DE CONTRASTE ---
  // Círculo concéntrico focal
  fill(255);
  ellipse(240, 160, 70, 70);
}`,
        badge: 'Funciones & Comentarios',
        estimatedTime: '20 min',
      },
      {
        id: 'u2-e5',
        code: 'U2·05',
        unitId: 'u2',
        unitTitle: 'Unidad 2. Primeros pasos con Processing',
        title: 'Laboratorio de color: de RGB a HSB',
        subtitle: 'Modelos cromáticos numéricos, matiz, saturación y brillo',
        creativeProblem: 'Encontrar una familia cromática coherente y armónica mediante números.',
        pedagogicalSteps: {
          observe:
            'Cinco variaciones de una misma composición con cambios de matiz, saturación o luminosidad.',
          interpret:
            'Comparar cómo se representa un color en RGB y HSB; explicar que son modelos distintos para describir el color.',
          modify:
            'Ajustar valores de fill() y stroke() con RGB, después cambiar a colorMode(HSB, 360, 100, 100) en un ejemplo guiado.',
          experiment:
            'Producir una paleta de cinco colores, variando una dimensión por vez; comparar el efecto visual de disminuir saturación frente a disminuir brillo.',
          document:
            'Entregar lámina cromática y registrar valores utilizados.',
        },
        guidingQuestion: '¿Qué cambia cuando modificas el matiz sin cambiar la saturación ni el brillo?',
        minimumEvidence: 'Cinco muestras + valores + explicación de dos variaciones.',
        observableCriteria: 'Utiliza colorMode() de forma consistente y diferencia RGB de HSB.',
        technicalScope: 'colorMode(RGB, 255) vs colorMode(HSB, 360, 100, 100). Referencia al capítulo P.1 de Generative Design.',
        inventoryStatus: 'creado_borrador',
        status: 'draft',
        objective:
          'Comprender la diferencia matemática y perceptual entre el modelo aditivo RGB y el modelo cilíndrico HSB para diseñar paletas cromáticas armónicas.',
        visualStartDescription:
          'Selector interactivo con doble modo (RGB vs HSB) y visualizador de 5 muestras tonales armónicas con variación sistemática.',
        activityDescription:
          'Experimentar con colorMode(HSB, 360, 100, 100), generar una paleta armónica fijando saturación y brillo mientras se modula el matiz (Hue).',
        interpretationQuestion:
          '¿Por qué el modelo HSB resulta más intuitivo para diseñar familias cromáticas armónicas en comparación con RGB?',
        interpretationOptions: [
          {
            id: 'opt1',
            text: 'Porque separa el tono o matiz (H) de la pureza/intensidad (S) y de la luminosidad (B), permitiendo variar el color sin alterar su brillo.',
            isCorrect: true,
            feedback:
              '¡Preciso! En HSB mantienes B=90, S=70 y al cambiar H (0° a 360°) obtienes colores con idéntico peso tonal.',
          },
          {
            id: 'opt2',
            text: 'Porque RGB solo permite colores oscuros y HSB permite colores claros.',
            isCorrect: false,
            feedback:
              'Incorrecto: ambos modelos pueden describir el mismo espacio de color; cambia la forma geométrica de parametrizarlo.',
          },
        ],
        evidenceRequirement:
          'Paleta de 5 muestras tonales, valores numéricos en HSB y justificación del contraste.',
        achievementCriteria:
          'Utiliza colorMode() de forma consistente y diferencia RGB de HSB.',
        defaultProcessingCode: `void setup() {
  size(500, 250);
  // Cambiamos a modelo HSB: Matiz (0-360), Saturación (0-100), Brillo (0-100)
  colorMode(HSB, 360, 100, 100);
}

void draw() {
  background(0, 0, 96); // Fondo casi blanco en HSB
  noStroke();

  // 5 muestras armónicas con matiz escalonado (+30°):
  int matizBase = 210; // Azul base
  for (int i = 0; i < 5; i++) {
    fill((matizBase + i * 25) % 360, 75, 85);
    rect(40 + i * 85, 60, 75, 130, 8);
  }
}`,
        badge: 'Laboratorio de Color',
        estimatedTime: '25 min',
      },
      {
        id: 'u2-e6',
        code: 'U2·06',
        unitId: 'u2',
        unitTitle: 'Unidad 2. Primeros pasos con Processing',
        title: 'Anatomía de un sketch de referencia',
        subtitle: 'Consulta de referencias técnicas oficiales, sintaxis y adaptación ética',
        creativeProblem: 'Aprender a consultar ejemplos técnicos ajenos sin limitarse a copiar y pegar mecánicamente.',
        pedagogicalSteps: {
          observe:
            'Un sketch público sencillo de Processing Java y su resultado visual. Puede utilizarse la referencia oficial o un recurso externo acreditado.',
          interpret:
            'Encontrar una función poco familiar, localizar su página de referencia y distinguir propósito, parámetros y ejemplo.',
          modify:
            'Realizar una modificación pequeña y verificable en una copia de práctica, conservando atribución al original.',
          experiment:
            'Comparar el resultado inicial con el adaptado.',
          document:
            'Registrar fuente, instrucción consultada, cambio realizado y explicación.',
        },
        guidingQuestion: '¿Qué entendiste del ejemplo que te permitió cambiarlo de forma consciente?',
        minimumEvidence: 'Enlace, modificación, comparación, nota de atribución.',
        observableCriteria: 'Utiliza una referencia técnica y explica su adaptación.',
        technicalScope: 'Lectura de documentación oficial processing.org/reference, sintaxis de funciones y atribución.',
        inventoryStatus: 'creado_borrador',
        status: 'draft',
        objective:
          'Consultar la documentación oficial de Processing, identificar parámetros y adaptar un ejemplo acreditando la fuente.',
        visualStartDescription:
          'Ventana con extracto de la referencia oficial de processing.org (ej. arc() o triangle()), mostrando nombre, descripción, sintaxis y ejemplo.',
        activityDescription:
          'Consultar la documentación de arc() o triangle(), comprender sus argumentos, adaptarla en un sketch propio y citar la referencia.',
        interpretationQuestion:
          'Al consultar la documentación oficial de una función desconocida, ¿qué tres datos debes verificar antes de usarla en tu sketch?',
        interpretationOptions: [
          {
            id: 'opt1',
            text: 'El número de parámetros que recibe, el tipo de dato de cada uno (int, float) y el orden estricto en que deben escribirse.',
            isCorrect: true,
            feedback:
              '¡Totalmente correcto! La firma de la función define qué espera la computadora.',
          },
          {
            id: 'opt2',
            text: 'El autor del lenguaje y el año en que se inventó.',
            isCorrect: false,
            feedback:
              'Eso es contexto histórico, pero para compilar necesitas parámetros, tipos y orden.',
          },
        ],
        evidenceRequirement:
          'Enlace de la referencia consultada, nota de atribución y sketch con la función adaptada intencionalmente.',
        achievementCriteria:
          'Utiliza una referencia técnica y explica su adaptación.',
        defaultProcessingCode: `// Referencia consultada: processing.org/reference/arc_.html
// Adaptado por: Estudiante de Código Creativo

void setup() {
  size(480, 320);
}

void draw() {
  background(246, 248, 255);

  fill(49, 105, 216);
  noStroke();
  
  // arc(x, y, w, h, inicioRad, finRad, MODO)
  arc(240, 160, 180, 180, 0, PI + HALF_PI, PIE);
}`,
        badge: 'Referencias & Documentación',
        estimatedTime: '20 min',
      },
    ],
  },

  // ==========================================================================
  // UNIDAD 3: VARIABLES Y PERSONALIZACIÓN VISUAL
  // ==========================================================================
  {
    id: 'u3',
    prerequisiteUnitIds: ['u2'],
    number: 3,
    title: 'Variables y personalización visual',
    creativeSubtitle: 'Diseñar un sistema, no una imagen',
    unitQuestion: '¿Qué sucede cuando las decisiones de diseño dejan de depender de números aislados y se convierten en parámetros relacionados entre sí?',
    summary:
      'Constantes, datos, variables integradas (width, height, mouseX), variables propias, expresiones aritméticas de proporción y cambio de estado por incrementación.',
    contents: [
      'Definición, utilidad y tipos básicos de variables',
      'Variables integradas (built-in variables)',
      'Valores constantes frente a valores dinámicos',
      'Operadores aritméticos',
      'Tweak Mode / retoque en vivo',
      'Creación, uso e incrementación de variables propias',
    ],
    purpose:
      'Distinguir constantes, datos y variables; utilizar variables propias e integradas de Processing; emplear expresiones aritméticas para conservar proporciones; y reconocer el incremento como cambio de estado que preparará el aprendizaje de animación.',
    project: {
      title: 'Sistema de identidad paramétrica',
      creativeDecision: 'Definir parámetros y producir variaciones coherentes de una misma composición.',
      technicalConcept: 'Variables, tipos, variables integradas, expresiones, operaciones e incrementación.',
      deliverable:
        'A partir de un sketch sencillo (círculos, líneas o módulos), el estudiante define parámetros de tamaño, posición, separación y color, y produce cuatro variantes reconocibles como parte de una misma familia gráfica.',
      rubric: [
        { concept: 'Uso correcto de variables propias (declaración y asignación)', percentage: 25 },
        { concept: 'Relaciones aritméticas coherentes de proporción', percentage: 25 },
        { concept: 'Uso de variables integradas y diseño adaptable', percentage: 20 },
        { concept: 'Análisis de variaciones dentro del sistema', percentage: 20 },
        { concept: 'Documentación fundamentada de decisiones', percentage: 10 },
      ],
      conditionToAdvance:
        'Identifica un conjunto de parámetros que gobiernan una composición y puede anticipar un resultado al modificar uno de ellos.',
    },
    exercises: [
      {
        id: 'u3-e1',
        code: 'U3·01',
        unitId: 'u3',
        unitTitle: 'Unidad 3. Variables y personalización visual',
        title: 'De un número a una decisión editable',
        subtitle: 'Variables propias vs. valores numéricos fijos repetidos',
        creativeProblem: 'Editar una composición sin tener que buscar y cambiar muchos números dispersos en el código.',
        pedagogicalSteps: {
          observe:
            'Comparar dos códigos que producen una imagen equivalente: uno con valores escritos directamente en varias funciones y otro con una variable compartida.',
          interpret:
            'Identificar los valores repetidos y anticipar qué figuras dependen de la misma propiedad.',
          modify:
            'Declarar una variable como float tamano = 80; y sustituir números pertinentes por su nombre.',
          experiment:
            'Producir variantes cambiando solo esa declaración.',
          document:
            'Comparar antes/después y señalar las instrucciones afectadas.',
        },
        guidingQuestion: '¿Qué cambios se vuelven más sencillos cuando una propiedad tiene un nombre?',
        minimumEvidence: 'Fragmento inicial y parametrizado + dos variantes.',
        observableCriteria: 'Declara, utiliza y modifica una variable propia con efecto predecible.',
        technicalScope: 'Declaración: tipo nombre = valor; int vs float; reutilización en múltiples argumentos gráficos.',
        inventoryStatus: 'creado_borrador',
        status: 'draft',
        objective:
          'Declarar, inicializar y utilizar variables propias en Processing Java para controlar múltiples elementos visuales desde un solo punto.',
        visualStartDescription:
          'Comparador interactivo con un deslizador de "tamañoBase": cambiar un solo control transforma simultáneamente 4 elementos vinculados.',
        activityDescription:
          'Sustituir los números literales repetidos por una variable float dimension = 60;, y probar tres variantes cambiando solo esa línea.',
        interpretationQuestion:
          '¿Cuál es la ventaja de declarar "float diametro = 80;" en lugar de escribir el número 80 dentro de 5 funciones ellipse() distintas?',
        interpretationOptions: [
          {
            id: 'opt1',
            text: 'Permite modificar la escala de todas las figuras alterando un solo valor al inicio del código, asegurando consistencia y reduciendo errores humanos.',
            isCorrect: true,
            feedback:
              '¡Exacto! Convertiste un número aislado en un parámetro gobernante.',
          },
          {
            id: 'opt2',
            text: 'Evita que la computadora gaste electricidad.',
            isCorrect: false,
            feedback:
              'No tiene relación con consumo energético, sino con arquitectura de software y legibilidad.',
          },
        ],
        evidenceRequirement:
          'Fragmento de código inicial no parametrizado vs. parametrizado, tabla de 2 variantes y explicación.',
        achievementCriteria:
          'Declara, utiliza y modifica una variable propia con efecto predecible.',
        defaultProcessingCode: `// Decisión centralizada en variables gobernantes:
float diametro = 70;
int margen = 100;

void setup() {
  size(480, 320);
}

void draw() {
  background(246, 248, 255);
  fill(49, 105, 216);
  noStroke();

  // Los 3 círculos heredan el mismo diámetro:
  ellipse(margen, 160, diametro, diametro);
  ellipse(width/2, 160, diametro, diametro);
  ellipse(width - margen, 160, diametro, diametro);
}`,
        badge: 'Variables Propias',
        estimatedTime: '20 min',
      },
      {
        id: 'u3-e2',
        code: 'U3·02',
        unitId: 'u3',
        unitTitle: 'Unidad 3. Variables y personalización visual',
        title: 'Composiciones que se adaptan al formato',
        subtitle: 'Variables integradas del sistema: width, height y adaptabilidad responsiva',
        creativeProblem: 'Mantener el diseño centrado y equilibrado al cambiar el tamaño del lienzo con size().',
        pedagogicalSteps: {
          observe:
            'Comparar una figura colocada en coordenadas absolutas con una posición calculada mediante width/2 y height/2.',
          interpret:
            'Diferenciar el dato fijo 200 de las variables integradas width y height. Reconocer int, float y boolean en ejemplos guiados.',
          modify:
            'Reemplazar posiciones absolutas por expresiones derivadas de width y height.',
          experiment:
            'Probar al menos dos tamaños de lienzo y comparar alineación y proporción.',
          document:
            'Capturas y explicación de cuál versión se adapta y por qué.',
        },
        guidingQuestion: '¿Cómo logras que una figura permanezca centrada cuando el lienzo cambia de tamaño?',
        minimumEvidence: 'Dos formatos de lienzo distintos y una explicación de la adaptación.',
        observableCriteria: 'Utiliza variables integradas y expresiones apropiadas para una composición adaptable.',
        technicalScope: 'Variables del sistema: width, height. Tipos de datos: int, float, boolean.',
        inventoryStatus: 'creado_borrador',
        status: 'draft',
        objective:
          'Diseñar gráficos adaptables que recalculen sus posiciones y proporciones relativas mediante las variables del sistema width y height.',
        visualStartDescription:
          'Lienzo interactivo con control de anchura y altura: observa cómo una figura con coordenadas fijas queda desfasada mientras que la calculada con width/2 permanece en el centro.',
        activityDescription:
          'Convertir un diseño con coordenadas absolutas en un diseño responsivo utilizando width, height y fracciones (width/2, height/2). Probar con dos size() distintos.',
        interpretationQuestion:
          'Si el tamaño del lienzo se define como size(800, 400), ¿cuánto valen automáticamente width y width/2?',
        interpretationOptions: [
          {
            id: 'opt1',
            text: 'width vale 800 y width/2 vale 400, colocando cualquier elemento centrado horizontalmente sin importar el tamaño del sketch.',
            isCorrect: true,
            feedback:
              '¡Correcto! Processing asigna width y height en cuanto invocas size().',
          },
          {
            id: 'opt2',
            text: 'width vale 0 hasta que el usuario mueva el mouse.',
            isCorrect: false,
            feedback:
              'Falso: width refleja el ancho configurado en size() desde el primer fotograma.',
          },
        ],
        evidenceRequirement:
          'Dos capturas con diferentes formatos de lienzo (apaisado y cuadrado) demostrando que la composición se adapta.',
        achievementCriteria:
          'Utiliza variables integradas y expresiones apropiadas para una composición adaptable.',
        defaultProcessingCode: `void setup() {
  size(600, 360); // Prueba cambiar a size(400, 400) o size(700, 300)
}

void draw() {
  background(246, 248, 255);

  // Figura centrada dinámicamente con variables integradas:
  fill(49, 105, 216);
  noStroke();
  ellipse(width / 2, height / 2, width * 0.2, width * 0.2);

  // Línea de referencia en los cuadrantes:
  stroke(167, 139, 232);
  line(0, height / 2, width, height / 2);
  line(width / 2, 0, width / 2, height);
}`,
        badge: 'Variables Integradas',
        estimatedTime: '25 min',
      },
      {
        id: 'u3-e3',
        code: 'U3·03',
        unitId: 'u3',
        unitTitle: 'Unidad 3. Variables y personalización visual',
        title: 'Diseñar relaciones, no valores aislados',
        subtitle: 'Operadores aritméticos, proporciones y sistemas geométricos coherentes',
        creativeProblem: 'Conservar proporciones visuales armónicas al cambiar una dimensión principal.',
        pedagogicalSteps: {
          observe:
            'Una serie de composiciones donde el tamaño de círculos, la separación y la distancia al borde mantienen una relación armónica.',
          interpret:
            'Identificar qué magnitud puede funcionar como parámetro base o módulo.',
          modify:
            'Usar suma (+), resta (-), multiplicación (*) y división (/) en relaciones como tamano * 0.5, centroX + separacion o width / 4.',
          experiment:
            'Crear tres versiones variando el parámetro base y comprobar qué relaciones permanecen constantes.',
          document:
            'Mostrar las expresiones que controlan las dimensiones y explicar una proporción.',
        },
        guidingQuestion: 'Si duplicas el tamaño principal, ¿qué otras propiedades deberían cambiar para conservar la estructura?',
        minimumEvidence: 'Tres variantes + relaciones escritas.',
        observableCriteria: 'Explica y aplica una relación aritmética entre propiedades visuales.',
        technicalScope: 'Operadores +, -, *, /. Jerarquía de operaciones y cálculo de proporciones relativas.',
        supportExampleCode: `// Ejemplo C: parámetros relacionados (unidad 3)
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
}`,
        inventoryStatus: 'creado_borrador',
        status: 'draft',
        objective:
          'Utilizar operadores aritméticos (+, -, *, /) para vincular parámetros en proporciones relativas que mantengan la coherencia estructural.',
        visualStartDescription:
          'Composición con un módulo base: al modificar el radio del círculo mayor, los círculos secundarios y su separación se recalculan proporcionalmente.',
        activityDescription:
          'Vincular el radio secundario como radioBase * 0.5 y la distancia como radioBase * 1.5. Experimentar con 3 valores del parámetro base.',
        interpretationQuestion:
          'Si defines float radioMenor = radioMayor * 0.5;, ¿qué sucede visualmente cuando duplicas el valor de radioMayor?',
        interpretationOptions: [
          {
            id: 'opt1',
            text: 'radioMenor se duplica automáticamente manteniendo la proporción visual de 1 a 2 respecto a radioMayor.',
            isCorrect: true,
            feedback:
              '¡Exacto! Acabas de programar una relación proporcional resistente al cambio de escala.',
          },
          {
            id: 'opt2',
            text: 'radioMenor se queda congelado en su valor anterior.',
            isCorrect: false,
            feedback:
              'Incorrecto: dado que es una expresión matemática calculada, se actualiza en consecuencia.',
          },
        ],
        evidenceRequirement:
          'Tres variantes visuales con diferente escala base y las fórmulas matemáticas utilizadas en el código.',
        achievementCriteria:
          'Explica y aplica una relación aritmética entre propiedades visuales.',
        defaultProcessingCode: `float escala = 1.0;
float separacion = 80;

void setup() {
  size(480, 320);
  noLoop();
}

void draw() {
  background(246, 248, 255);
  noStroke();

  // Módulo base vinculado por operaciones:
  float radioPrincipal = 80 * escala;
  float radioSecundario = radioPrincipal * 0.5;

  fill(49, 105, 216);
  ellipse(width/2 - separacion * escala, height/2, radioPrincipal, radioPrincipal);
  
  fill(167, 139, 232);
  ellipse(width/2 + separacion * escala, height/2, radioSecundario, radioSecundario);
}`,
        badge: 'Operaciones Aritméticas',
        estimatedTime: '25 min',
      },
      {
        id: 'u3-e4',
        code: 'U3·04',
        unitId: 'u3',
        unitTitle: 'Unidad 3. Variables y personalización visual',
        title: 'Mesa de control: personalizar una composición',
        subtitle: 'Tweak Mode, parámetros gobernantes y familias gráficas',
        creativeProblem: 'Generar una familia gráfica coherente a partir de un pequeño conjunto de decisiones editables.',
        pedagogicalSteps: {
          observe:
            'Cuatro imágenes de una misma estructura con diferencias de tamaño, separación y color.',
          interpret:
            'Identificar un parámetro por cada tipo de cambio observado en la serie.',
          modify:
            'Definir al menos tres variables propias con nombres claros y utilizarlas en distintas instrucciones de dibujo.',
          experiment:
            'Modificar un parámetro por vez y después explorar una combinación deliberada.',
          document:
            'Presentar una matriz de cuatro variantes, sus valores principales y una justificación de selección.',
        },
        guidingQuestion: '¿Qué combinación de parámetros produce una diferencia expresiva sin perder la identidad de la serie?',
        minimumEvidence: 'Cuatro variaciones + valores numéricos + una elección argumentada.',
        observableCriteria: 'Controla un sistema sencillo mediante variables reutilizables.',
        technicalScope: 'Tablero de variables de cabecera; Tweak Mode en Processing de escritorio; matriz de 4 variaciones.',
        inventoryStatus: 'creado_borrador',
        status: 'draft',
        objective:
          'Organizar una cabecera de control con múltiples variables que permita generar una matriz de 4 variantes gráficas coherentes.',
        visualStartDescription:
          'Mesa de control con 3 deslizadores (separación, escala, color) y previsualización de 4 variantes generadas por la misma matriz.',
        activityDescription:
          'Definir 3 variables clave en la cabecera del sketch, ajustar sus valores metódicamente y registrar una matriz de 4 estados visuales.',
        interpretationQuestion:
          '¿Cuál es la estrategia metodológica recomendada antes de alterar varios parámetros al mismo tiempo en un sistema visual?',
        interpretationOptions: [
          {
            id: 'opt1',
            text: 'Modificar un solo parámetro a la vez para comprender su impacto visual específico, antes de ensayar combinaciones complejas.',
            isCorrect: true,
            feedback:
              '¡Fundamental en diseño paramétrico! Aislar variables te permite entender la causa de cada transformación visual.',
          },
          {
            id: 'opt2',
            text: 'Cambiar números al azar sin mirar cuáles se modifican.',
            isCorrect: false,
            feedback:
              'La experimentación al azar no produce comprensión sistemática de la regla.',
          },
        ],
        evidenceRequirement:
          'Matriz de 4 composiciones con sus respectivos valores de variables y justificación de la variante más armónica.',
        achievementCriteria:
          'Controla un sistema sencillo mediante variables reutilizables.',
        defaultProcessingCode: `// Mesa de Control de Parámetros:
float escalaGeneral = 1.2;
int numElementos = 4;
int separacion = 75;
int matizFocal = 210;

void setup() {
  size(480, 320);
  colorMode(HSB, 360, 100, 100);
}

void draw() {
  background(246, 248, 255);
  noStroke();

  for (int i = 0; i < numElementos; i++) {
    fill((matizFocal + i * 20) % 360, 75, 85);
    float posX = (width / 2) - ((numElementos - 1) * separacion) / 2.0 + (i * separacion);
    ellipse(posX, height / 2, 45 * escalaGeneral, 45 * escalaGeneral);
  }
}`,
        badge: 'Mesa de Control',
        estimatedTime: '25 min',
      },
      {
        id: 'u3-e5',
        code: 'U3·05',
        unitId: 'u3',
        unitTitle: 'Unidad 3. Variables y personalización visual',
        title: 'Tres fotogramas de una variable: introducir el incremento',
        subtitle: 'Actualización de estado numérico (x += paso) y preparación al movimiento',
        creativeProblem: 'Pensar el movimiento como una secuencia discreta de estados sin introducir aún todo el flujo de animación.',
        pedagogicalSteps: {
          observe:
            'Tres imágenes fijas de una misma figura desplazada a intervalos regulares.',
          interpret:
            'Predecir cómo cambia una coordenada si se le añade el mismo incremento en cada paso.',
          modify:
            'Completar operaciones como x = x + paso;, x += paso; o x++; en un contexto guiado; discutir la diferencia entre incremento unitario y un incremento configurado.',
          experiment:
            'Crear una secuencia de tres posiciones y contrastar incrementos positivos y negativos; no exigir todavía draw() animado continuo.',
          document:
            'Tabla paso/posición y representación de los tres estados.',
        },
        guidingQuestion: '¿Cómo describirías una trayectoria utilizando una posición inicial y una cantidad que se suma cada vez?',
        minimumEvidence: 'Predicción de tres valores + secuencia visual + fragmento de incremento.',
        observableCriteria: 'Explica dirección y magnitud de un desplazamiento a partir de una actualización numérica.',
        technicalScope: 'Operadores de asignación compuesta x = x + paso, x += paso, x++. Dirección de desplazamiento por signo.',
        inventoryStatus: 'creado_borrador',
        status: 'draft',
        objective:
          'Comprender la incrementación de variables como una actualización temporal de estado que desplaza geometrías en el espacio.',
        visualStartDescription:
          'Visualizador de 3 fotogramas secuenciales (Fotograma 1, 2 y 3) donde una figura avanza según el valor de incremento especificado.',
        activityDescription:
          'Predecir las posiciones de los fotogramas 1, 2 y 3; implementar x += velocidad; y probar el efecto de invertir el signo de la velocidad.',
        interpretationQuestion:
          'Si la posición inicial es X = 100 y en cada fotograma se ejecuta "x += 25;", ¿cuánto valdrá X tras 4 fotogramas y hacia dónde se mueve?',
        interpretationOptions: [
          {
            id: 'opt1',
            text: 'Valdrá 200 (100 + 4 * 25) y la figura se desplaza hacia la derecha de la pantalla.',
            isCorrect: true,
            feedback:
              '¡Matemáticamente exacto! Cada fotograma acumula la velocidad en la posición.',
          },
          {
            id: 'opt2',
            text: 'Valdrá 125 y se mueve hacia la izquierda.',
            isCorrect: false,
            feedback:
              'Incorrecto: tras 4 pasos de 25 se suman 100 unidades; al ser positivo (+25), avanza hacia la derecha.',
          },
        ],
        evidenceRequirement:
          'Tabla con los 3 estados fotograma/coordenada, captura de la secuencia y justificación del signo de dirección.',
        achievementCriteria:
          'Explica dirección y magnitud de un desplazamiento a partir de una actualización numérica.',
        defaultProcessingCode: `float posX = 100; // Posición inicial
float velocidad = 4; // Incremento por fotograma

void setup() {
  size(480, 240);
}

void draw() {
  background(246, 248, 255);

  // 1. Dibujamos en la posición actual
  fill(49, 105, 216);
  noStroke();
  ellipse(posX, height / 2, 50, 50);

  // 2. Incrementamos la variable de estado para el siguiente fotograma
  posX += velocidad;

  // Rebote simple en los bordes
  if (posX > width - 25 || posX < 25) {
    velocidad *= -1; // Invierte el signo de incremento
  }
}`,
        badge: 'Incremento & Estado',
        estimatedTime: '20 min',
      },
    ],
  },
];
