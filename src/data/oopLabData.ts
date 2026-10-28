import { ModuleProgression } from '../types/oopLab';

export const PELOTA_MODULE: ModuleProgression = {
  moduleId: 'pelota',
  moduleName: 'Módulo 1: Pelota',
  objectName: 'Pelota',
  fields: [
    {
      name: 'x',
      type: 'float',
      initialValue: 200,
      description: 'Posición horizontal en el lienzo cartesiano.',
      visualRole: 'Determina en qué columna de píxeles se ubica el centro de la pelota.',
    },
    {
      name: 'y',
      type: 'float',
      initialValue: 160,
      description: 'Posición vertical en el lienzo cartesiano.',
      visualRole: 'Determina en qué fila de píxeles se ubica el centro de la pelota.',
    },
    {
      name: 'diametro',
      type: 'float',
      initialValue: 50,
      description: 'Ancho y alto del círculo en píxeles.',
      visualRole: 'Controla el tamaño físico del objeto dibujado con ellipse().',
    },
    {
      name: 'velocidadX',
      type: 'float',
      initialValue: 3.5,
      description: 'Cantidad de píxeles que la pelota avanza en el eje horizontal X.',
      visualRole: 'Define la rapidez horizontal (positivo = derecha, negativo = izquierda).',
    },
    {
      name: 'velocidadY',
      type: 'float',
      initialValue: 2.2,
      description: 'Cantidad de píxeles que la pelota avanza en el eje vertical Y.',
      visualRole: 'Define la rapidez vertical para un movimiento 2D fluido y diagonal.',
    },
    {
      name: 'tono',
      type: 'color',
      initialValue: '#E2661A',
      description: 'Color de relleno en formato RGBA de Processing.',
      visualRole: 'Define el color con el que la función fill() pinta la pelota.',
    },
    {
      name: 'tX',
      type: 'float',
      initialValue: 0.0,
      description: 'Coordenada temporal en el espacio de ruido Perlin para el eje horizontal X.',
      visualRole: 'Permite muestrear noise() de forma continua e independiente del eje Y.',
    },
    {
      name: 'tY',
      type: 'float',
      initialValue: 500.0,
      description: 'Coordenada temporal en el espacio de ruido Perlin para el eje vertical Y (desfasada).',
      visualRole: 'Semilla asimétrica desacoplada de tX para asegurar una trayectoria 2D libre y no diagonal.',
    },
  ],
  methods: [
    {
      id: 'mostrar',
      name: 'mostrar',
      signature: 'void mostrar()',
      description: 'Dibuja la pelota en el lienzo usando su posición, diámetro y color actuales.',
      fieldsUsed: ['x', 'y', 'diametro', 'tono'],
      fieldsModified: [],
      parameters: [],
      executionType: 'instant',
      codeSnippet: `void mostrar() {
  fill(tono);
  noStroke();
  ellipse(x, y, diametro, diametro);
}`,
      explanation:
        'El método mostrar() consulta los campos del objeto pero no los modifica. Es el encargado de hacer visible al objeto en la pantalla gráfica.',
    },
    {
      id: 'mover',
      name: 'mover',
      signature: 'void mover()',
      description: 'Desplaza la pelota fluidamente en 2D sumando velocidadX a x y velocidadY a y.',
      fieldsUsed: ['x', 'y', 'velocidadX', 'velocidadY'],
      fieldsModified: ['x', 'y'],
      parameters: [],
      executionType: 'continuous',
      codeSnippet: `void mover() {
  x = x + velocidadX;
  y = y + velocidadY;
}`,
      explanation:
        'Al mover en ambos ejes simultáneamente, la pelota adquiere una trayectoria diagonal natural en lugar de estar atada a un eje unidimensional.',
    },
    {
      id: 'rebotar',
      name: 'rebotar',
      signature: 'void rebotar()',
      description: 'Comprueba los 4 bordes de la ventana (izq, der, arriba, abajo) e invierte la velocidad correspondiente.',
      fieldsUsed: ['x', 'y', 'diametro', 'velocidadX', 'velocidadY'],
      fieldsModified: ['velocidadX', 'velocidadY'],
      parameters: [],
      executionType: 'continuous',
      codeSnippet: `void rebotar() {
  float r = diametro / 2;
  // Rebote horizontal en X
  if (x > width - r || x < r) {
    velocidadX = velocidadX * -1;
  }
  // Rebote vertical en Y
  if (y > height - r || y < r) {
    velocidadY = velocidadY * -1;
  }
}`,
      explanation:
        'Evalúa condicionales if en ambas dimensiones. Si choca con las paredes laterales invierte velocidadX; si choca con piso o techo invierte velocidadY.',
    },
    {
      id: 'flotar',
      name: 'flotar',
      signature: 'void flotar(float pasoRuido, float intensidad)',
      description: 'Aplica deriva orgánica bidimensional evaluando noise() en coordenadas desacopladas (tX y tY).',
      fieldsUsed: ['x', 'y', 'tX', 'tY'],
      fieldsModified: ['x', 'y', 'tX', 'tY'],
      parameters: [
        {
          name: 'pasoRuido',
          type: 'float',
          defaultValue: 0.015,
          min: 0.002,
          max: 0.05,
          step: 0.002,
          description: 'Incremento de tiempo en el espacio de ruido (velocidad de cambio).',
        },
        {
          name: 'intensidad',
          type: 'float',
          defaultValue: 3.5,
          min: 0.5,
          max: 10.0,
          step: 0.5,
          description: 'Fuerza o amplitud de perturbación en píxeles.',
        },
      ],
      executionType: 'continuous',
      codeSnippet: `void flotar(float pasoRuido, float intensidad) {
  // Muestreo desacoplado de ruido Perlin en 2 dimensiones
  // IMPORTANTE: tX y tY deben tener desfases diferentes. Si tX == tY,
  // noise(tX) sería idéntico a noise(tY), forzando una trayectoria diagonal a 45°.
  float fuerzaX = map(noise(tX), 0, 1, -intensidad, intensidad);
  float fuerzaY = map(noise(tY), 0, 1, -intensidad, intensidad);
  
  x = x + fuerzaX;
  y = y + fuerzaY;
  
  // Avanzamos en el paisaje de ruido 1D desacoplado
  tX = tX + pasoRuido;
  tY = tY + pasoRuido;
}`,
      explanation:
        'En Processing, noise() produce ruido Perlin continuo y armónico entre 0.0 y 1.0. Para lograr un movimiento bidimensional orgánico en artes visuales y diseño generativo, es indispensable desacoplar los ejes cartesianos muestreando el ruido en coordenadas independientes (tX != tY).',
    },
    {
      id: 'cambiarTamano',
      name: 'cambiarTamano',
      signature: 'void cambiarTamano(float nuevoDiametro)',
      description: 'Asigna un nuevo diámetro a la pelota mediante un parámetro.',
      fieldsUsed: [],
      fieldsModified: ['diametro'],
      parameters: [
        {
          name: 'nuevoDiametro',
          type: 'float',
          defaultValue: 70,
          min: 15,
          max: 160,
          step: 5,
          description: 'El nuevo valor en píxeles para el diámetro.',
        },
      ],
      executionType: 'instant',
      codeSnippet: `void cambiarTamano(float nuevoDiametro) {
  diametro = nuevoDiametro;
}`,
      explanation:
        'Este método recibe un argumento desde fuera (el parámetro nuevoDiametro) y lo asigna al campo interno diametro. Permite comunicarse con el objeto.',
    },
    {
      id: 'cambiarColor',
      name: 'cambiarColor',
      signature: 'void cambiarColor(color nuevoColor)',
      description: 'Modifica el color de relleno del objeto.',
      fieldsUsed: [],
      fieldsModified: ['tono'],
      parameters: [
        {
          name: 'nuevoColor',
          type: 'color',
          defaultValue: '#006699',
          description: 'Nuevo color en formato color(...) de Processing.',
        },
      ],
      executionType: 'instant',
      codeSnippet: `void cambiarColor(color nuevoColor) {
  tono = nuevoColor;
}`,
      explanation:
        'El método cambiarColor() recibe un nuevo valor cromático y actualiza el campo tono del objeto, afectando la siguiente llamada a mostrar().',
    },
    {
      id: 'cambiarVelocidad',
      name: 'cambiarVelocidad',
      signature: 'void cambiarVelocidad(float nuevaVX, float nuevaVY)',
      description: 'Ajusta la rapidez en ambos ejes (X e Y) para variar el ángulo y velocidad.',
      fieldsUsed: [],
      fieldsModified: ['velocidadX', 'velocidadY'],
      parameters: [
        {
          name: 'nuevaVX',
          type: 'float',
          defaultValue: 4.5,
          min: -10,
          max: 10,
          step: 0.5,
          description: 'Velocidad horizontal X.',
        },
        {
          name: 'nuevaVY',
          type: 'float',
          defaultValue: 3.0,
          min: -10,
          max: 10,
          step: 0.5,
          description: 'Velocidad vertical Y.',
        },
      ],
      executionType: 'instant',
      codeSnippet: `void cambiarVelocidad(float nuevaVX, float nuevaVY) {
  velocidadX = nuevaVX;
  velocidadY = nuevaVY;
}`,
      explanation:
        'Modificar simultáneamente velocidadX y velocidadY permite cambiar tanto la velocidad absoluta como el ángulo de vuelo de la pelota.',
    },
    {
      id: 'invertirDireccion',
      name: 'invertirDireccion',
      signature: 'void invertirDireccion()',
      description: 'Invierte el sentido del movimiento multiplicando ambas velocidades por -1.',
      fieldsUsed: ['velocidadX', 'velocidadY'],
      fieldsModified: ['velocidadX', 'velocidadY'],
      parameters: [],
      executionType: 'instant',
      codeSnippet: `void invertirDireccion() {
  velocidadX = velocidadX * -1;
  velocidadY = velocidadY * -1;
}`,
      explanation:
        'Una operación matemática elemental sobre los campos de velocidad produce un giro completo de 180° en la trayectoria de la pelota.',
    },
    {
      id: 'reiniciar',
      name: 'reiniciar',
      signature: 'void reiniciar(float nuevaX, float nuevaY)',
      description: 'Reubica la pelota en unas coordenadas específicas.',
      fieldsUsed: [],
      fieldsModified: ['x', 'y'],
      parameters: [
        {
          name: 'nuevaX',
          type: 'float',
          defaultValue: 150,
          min: 20,
          max: 480,
          description: 'Nueva coordenada horizontal X.',
        },
        {
          name: 'nuevaY',
          type: 'float',
          defaultValue: 150,
          min: 20,
          max: 280,
          description: 'Nueva coordenada vertical Y.',
        },
      ],
      executionType: 'instant',
      codeSnippet: `void reiniciar(float nuevaX, float nuevaY) {
  x = nuevaX;
  y = nuevaY;
}`,
      explanation:
        'Demuestra cómo un solo método puede recibir múltiples parámetros y actualizar simultáneamente varios campos de estado del objeto.',
    },
  ],
  stages: [
    {
      id: 'p-stage-1',
      stageNumber: 1,
      title: 'Etapa 1. Observación y Descripción',
      moment: 'observe',
      objective: 'Reconocer las características visuales de una pelota y distinguir con claridad entre propiedades estáticas y acciones dinámicas.',
      explanation:
        'En la programación orientada a objetos (POO), antes de escribir código observamos la entidad gráfica. ¿Qué información necesita la computadora para saber cómo es una pelota en reposo? ¿Y qué verbos describen lo que puede hacer cuando cobra vida? Las cualidades estáticas serán campos (variables), mientras que los verbos de acción se convertirán en métodos (funciones dentro de la clase).',
      challenge: {
        id: 'p-ch-1',
        question: 'De la siguiente lista de características observadas en la pelota, ¿cuál corresponde a una ACCIÓN (comportamiento) y no a una propiedad estática?',
        options: [
          {
            id: 'p1-opt-a',
            text: 'El diámetro del círculo en píxeles.',
            isCorrect: false,
            feedback: 'El diámetro es una dimensión geométrica en reposo: es una propiedad (campo float diametro), no una acción.',
          },
          {
            id: 'p1-opt-b',
            text: 'El color naranja (#E2661A) de relleno.',
            isCorrect: false,
            feedback: 'El color describe una cualidad estética estática: es una propiedad (campo color tono).',
          },
          {
            id: 'p1-opt-c',
            text: 'Moverse en el lienzo sumando desplazamientos continuos.',
            isCorrect: true,
            feedback: '¡Exacto! "Moverse" es un verbo de acción que muta el estado del objeto en cada fotograma. En Java se convertirá en el método void mover().',
          },
          {
            id: 'p1-opt-d',
            text: 'La coordenada vertical Y en un momento dado.',
            isCorrect: false,
            feedback: 'La posición instantánea es un valor numérico almacenado en memoria: es una propiedad (campo float y).',
          },
        ],
        hints: {
          hint1: 'Piensa en qué elementos son sustantivos o adjetivos (propiedades) y cuáles son verbos de acción.',
          hint2: 'Las propiedades se guardan en variables; los comportamientos se ejecutan a través de funciones llamadas métodos.',
          hint3: 'Moverse, botar o cambiar de tamaño son acciones; radio, posición y color son propiedades.',
        },
      },
    },
    {
      id: 'p-stage-2',
      stageNumber: 2,
      title: 'Etapa 2. Construcción de la Clase',
      moment: 'build-class',
      objective: 'Escribir la declaración canónica de la clase Pelota con su palabra reservada y llaves de apertura y cierre.',
      explanation:
        'Una clase en Processing es el molde o plantilla arquitectónica a partir de la cual nacerán todas las pelotas. Se declara con la palabra reservada "class", seguida del nombre con mayúscula inicial (convención PascalCase) y un bloque de llaves { } que encapsulará todo su contenido interior.',
      codeAdditionHighlight: `class Pelota {
  // Aquí vivirá la estructura interna (Campos, Constructor y Métodos)
}`,
      challenge: {
        id: 'p-ch-2',
        question: '¿Cuál es la forma sintácticamente correcta de declarar la clase Pelota en Processing Java?',
        options: [
          {
            id: 'p2-opt-a',
            text: 'function Pelota() { }',
            isCorrect: false,
            feedback: 'Incorrecto. "function" se usa en JavaScript/p5.js. En Processing Java estricto se declara con la palabra reservada "class".',
          },
          {
            id: 'p2-opt-b',
            text: 'class Pelota { }',
            isCorrect: true,
            feedback: '¡Correcto! En Processing Java usamos "class", el nombre con mayúscula inicial y llaves { } delimitando su cuerpo.',
          },
          {
            id: 'p2-opt-c',
            text: 'Pelota class ( )',
            isCorrect: false,
            feedback: 'Incorrecto. La palabra "class" debe anteceder al nombre y el cuerpo de una clase se delimita con llaves { }, no con paréntesis.',
          },
          {
            id: 'p2-opt-d',
            text: 'new Class(Pelota);',
            isCorrect: false,
            feedback: 'Incorrecto. "new" se usa posteriormente en el sketch para instanciar objetos, no para declarar la clase.',
          },
        ],
        hints: {
          hint1: 'La palabra clave en Java para definir moldes de objetos es "class".',
          hint2: 'El nombre de la clase suele iniciar con mayúscula para diferenciarlo de las variables comunes.',
          hint3: 'La estructura canónica es: class NombreClase { ... }',
        },
      },
    },
    {
      id: 'p-stage-3',
      stageNumber: 3,
      title: 'Etapa 3. Campos Progresivos (Memoria del Objeto)',
      moment: 'fields',
      objective: 'Comprender por qué los campos se incorporan en dos fases: primero la geometría espacial y después la dinámica y estética.',
      explanation:
        'Los campos no deben memorizarse de golpe; nacen de necesidades concretas de diseño:\n\n1. FASE GEOMÉTRICA BÁSICA: Para que Processing pueda dibujar un círculo con ellipse(x, y, d, d), necesita obligatoriamente saber DÓNDE (float x, float y) y DE QUÉ TAMAÑO (float diametro).\n\n2. FASE DINÁMICA Y ESTÉTICA: Para que la pelota cobre vida y viaje por la pantalla con física 2D autónoma, incorporamos cuánto avanza por cuadro (float velocidadX, float velocidadY) y cómo se viste visualmente (color tono).',
      codeAdditionHighlight: `class Pelota {
  // FASE 1: Geometría espacial básica (¿Dónde y de qué tamaño?)
  float x;
  float y;
  float diametro;

  // FASE 2: Dinámica 2D y estética (¿Hacia dónde avanza y qué color tiene?)
  float velocidadX;
  float velocidadY;
  color tono;
}`,
      challenge: {
        id: 'p-ch-3',
        question: '¿Por qué para la posición (x, y) y las velocidades (velocidadX, velocidadY) usamos el tipo de dato "float" en lugar de "int"?',
        options: [
          {
            id: 'p3-opt-a',
            text: 'Porque las variables float consumen menos memoria RAM en la tarjeta gráfica que las de tipo int.',
            isCorrect: false,
            feedback: 'Incorrecto. En Java tanto int como float ocupan exactamente 32 bits (4 bytes) en memoria.',
          },
          {
            id: 'p3-opt-b',
            text: 'Porque Processing Java prohíbe terminantemente usar int dentro de las clases de objetos.',
            isCorrect: false,
            feedback: 'Falso. Puedes usar int en cualquier clase, pero truncaría los decimales en cálculos cinemáticos.',
          },
          {
            id: 'p3-opt-c',
            text: 'Porque la función ellipse() no acepta números enteros como argumentos.',
            isCorrect: false,
            feedback: 'ellipse() acepta enteros sin problema convirtiéndolos automáticamente a float.',
          },
          {
            id: 'p3-opt-d',
            text: 'Porque float permite números fraccionarios con decimales (ej. 3.5 px/frame), indispensables para calcular aceleraciones y lograr movimientos 2D suaves.',
            isCorrect: true,
            feedback: '¡Exacto! Aunque la cuadrícula física de píxeles sea entera, la física matemática requiere acumular fracciones decimales para que el movimiento no sea tosco.',
          },
        ],
        hints: {
          hint1: 'Piensa en qué ocurre si quieres que una pelota avance a 1.5 o 3.2 píxeles por fotograma.',
          hint2: 'El tipo "int" solo guarda enteros (1, 2, 3); "float" almacena valores con punto flotante (1.5, 3.14).',
          hint3: 'Las simulaciones de movimiento en código creativo casi siempre requieren precisión decimal con float.',
        },
      },
    },
    {
      id: 'p-stage-4',
      stageNumber: 4,
      title: 'Etapa 4. El Constructor (Inicialización)',
      moment: 'constructor',
      objective: 'Distinguir entre campos de la clase, parámetros de entrada y argumentos del sketch principal.',
      explanation:
        'El constructor es la función inaugural que se activa al escribir "new Pelota(...)". Tiene el mismo nombre exacto de la clase, NO lleva tipo de retorno (ni siquiera void) y recibe parámetros temporales (ej. xTemp, yTemp) que transfieren sus valores a los campos permanentes (x = xTemp). Usamos sufijos "Temp" deliberadamente para no confundir el dato que entra con la memoria que lo almacena.',
      codeAdditionHighlight: `  // CONSTRUCTOR: Conecta los datos iniciales con la memoria del objeto
  Pelota(float xTemp, float yTemp, float diamTemp, float velXTemp, float velYTemp, color tonoTemp) {
    x = xTemp;
    y = yTemp;
    diametro = diamTemp;
    velocidadX = velXTemp;
    velocidadY = velYTemp;
    tono = tonoTemp;
  }`,
      challenge: {
        id: 'p-ch-4',
        question: 'En la instrucción de asignación "x = xTemp;", ¿cuál es el campo permanente y cuál es el parámetro recibido?',
        options: [
          {
            id: 'p4-opt-a',
            text: 'Ambas son variables globales accesibles desde cualquier lugar del sketch.',
            isCorrect: false,
            feedback: 'No son globales. Ambas pertenecen al ámbito estricto de la clase Pelota.',
          },
          {
            id: 'p4-opt-b',
            text: '"xTemp" es el campo permanente en memoria y "x" es el parámetro temporal de entrada.',
            isCorrect: false,
            feedback: 'Al revés: el campo definido arriba en la clase es x; xTemp es el parámetro que declaramos entre paréntesis.',
          },
          {
            id: 'p4-opt-c',
            text: '"x" es el campo permanente del objeto en memoria; "xTemp" es el parámetro temporal que entrega el valor inicial.',
            isCorrect: true,
            feedback: '¡Brillante! El parámetro xTemp entrega el dato al nacer la pelota y se guarda en el casillero permanente x de la instancia.',
          },
          {
            id: 'p4-opt-d',
            text: '"x" es el nombre del sketch y "xTemp" es la velocidad del reloj de Processing.',
            isCorrect: false,
            feedback: 'Ninguno tiene relación con el reloj ni con el nombre del archivo.',
          },
        ],
        hints: {
          hint1: 'La convención de nombrar parámetros con el sufijo "Temp" nos ayuda a recordar que son temporales de entrada.',
          hint2: 'En una asignación "A = B;", el receptor de la izquierda es donde se almacena el dato permanente.',
          hint3: 'El campo declarado arriba en la clase es x; el parámetro que llega entre los paréntesis es xTemp.',
        },
      },
    },
    {
      id: 'p-stage-5',
      stageNumber: 5,
      title: 'Etapa 5. Métodos Cinemáticos y Condicionales (mover y rebotar)',
      moment: 'methods',
      objective: 'Comprender cómo los métodos alteran el estado interno y cómo los condicionales if controlan la física cartesiana en los límites.',
      explanation:
        'Los métodos representan el comportamiento activo de la clase. Se dividen en dos funciones esenciales:\n\n1. RENDERIZADO Y TRASLACIÓN:\n- void mostrar(): consulta los campos x, y, diametro y tono para dibujar la elipse mediante fill() y noStroke(). No muta el estado.\n- void mover(): acumula los vectores cinemáticos (x += velocidadX; y += velocidadY;) modificando la posición en cada fotograma.\n\n2. FÍSICA Y REFLEXIÓN:\n- void rebotar(): evalúa si el perímetro del círculo colisiona con los muros de la ventana mediante condicionales if e invierte el sentido multiplicando la velocidad por -1.',
      codeAdditionHighlight: `  // RENDERIZADO Y CINEMÁTICA BÁSICA
  void mostrar() {
    fill(tono);
    noStroke();
    ellipse(x, y, diametro, diametro);
  }

  void mover() {
    x += velocidadX;
    y += velocidadY;
  }

  void rebotar() {
    float r = diametro / 2;
    // Colisión horizontal con bordes izquierdo y derecho
    if (x > width - r || x < r) {
      velocidadX *= -1;
    }
    // Colisión vertical con bordes superior e inferior
    if (y > height - r || y < r) {
      velocidadY *= -1;
    }
  }`,
      challenge: {
        id: 'p-ch-5',
        question: 'En el método rebotar(), ¿por qué la condición evalúa "x > width - r || x < r" considerando el radio "r" en lugar de evaluar únicamente "x > width || x < 0"?',
        options: [
          {
            id: 'p5-opt-a',
            text: 'Porque evaluar solo x provocaría un error de ejecución NullPointerException en Java.',
            isCorrect: false,
            feedback: 'Incorrecto. No hay referencias nulas aquí; x y width son números primitivos float.',
          },
          {
            id: 'p5-opt-b',
            text: 'Porque como ellipse() se dibuja centrada en (x, y), si solo evalúas el centro x, la mitad de la pelota penetrará y quedará encajada visualmente dentro del muro antes de rebotar.',
            isCorrect: true,
            feedback: '¡Exacto! El rebote físico verosímil debe considerar el radio geométrico para que la colisión ocurra en el punto de contacto tangencial con la pared.',
          },
          {
            id: 'p5-opt-c',
            text: 'Para que la gravedad de Processing duplique la velocidad tras cada impacto.',
            isCorrect: false,
            feedback: 'Falso. No hay fórmulas de aceleración gravitatoria en esa condición de rebote.',
          },
          {
            id: 'p5-opt-d',
            text: 'Porque en Processing Java está prohibido evaluar condicionales sin restar variables.',
            isCorrect: false,
            feedback: 'Incorrecto. Es un criterio de geometría visual y detección de colisiones, no una restricción del compilador.',
          },
        ],
        hints: {
          hint1: 'Recuerda que por defecto Processing ubica las elipses desde su centro (x, y).',
          hint2: 'La distancia desde el centro de la pelota hasta su borde exterior es exactamente su radio (diametro / 2).',
          hint3: 'Para que el perímetro de la esfera toque el borde exactamente en x = 0, el centro x debe estar a una distancia r del borde.',
        },
      },
      applicationTask: {
        title: 'Verificación de Rebote Tangencial',
        instruction: 'Ejecuta el método mover() o activa la animación continua y comprueba en el lienzo cómo el rebote ocurre exactamente cuando el borde tangencial toca la pared cartesiana.',
        targetMethodId: 'rebotar',
        expectedOutcome: 'Reflexión cinemática limpia en los 4 bordes sin atravesar el límite.',
      },
    },
    {
      id: 'p-stage-6',
      stageNumber: 6,
      title: 'Etapa 6. Deriva Orgánica 2D: Ruido de Perlin Desacoplado (tX, tY)',
      moment: 'methods',
      objective: 'Comprender la función noise() y por qué un movimiento bidimensional orgánico requiere variables de tiempo independientes en X e Y.',
      explanation:
        'La función noise() de Processing calcula ruido Perlin unidimensional continuo, devolviendo valores armónicos entre 0.0 y 1.0.\n\nPara trasladar este concepto a un plano bidimensional (X e Y), es fundamental DESACOPLAR los dos ejes. Si evaluáramos noise(t) con una sola variable para ambos ejes, las variaciones en X e Y serían idénticas en todo momento, obligando a la pelota a moverse en una línea diagonal rígida a 45°.\n\nAl declarar campos independientes float tX y float tY con valores iniciales desfasados (ej. tX = 0, tY = 500), garantizamos que cada eje explore regiones independientes del espacio de ruido.',
      codeAdditionHighlight: `  // DERIVA ORGÁNICA 2D MEDIANTE RUIDO PERLIN DESACOPLADO
  void flotar(float pasoRuido, float intensidad) {
    // Muestreo independiente de ruido Perlin para X e Y
    // tX y tY recorren regiones no correlacionadas
    float fuerzaX = map(noise(tX), 0, 1, -intensidad, intensidad);
    float fuerzaY = map(noise(tY), 0, 1, -intensidad, intensidad);

    x += fuerzaX;
    y += fuerzaY;

    // Avance temporal en el paisaje de ruido 1D
    tX += pasoRuido;
    tY += pasoRuido;
  }`,
      challenge: {
        id: 'p-ch-6',
        question: '¿Qué consecuencia cinemática ocurriría en pantalla si en el método flotar() calculáramos la fuerza de X e Y usando la misma variable temporal "t" (ej. float fx = map(noise(t), 0, 1, -f, f); float fy = map(noise(t), 0, 1, -f, f);)?',
        options: [
          {
            id: 'p6-opt-a',
            text: 'Processing arrojaría un error de compilación por evaluar dos veces la función noise() en un mismo bloque de código.',
            isCorrect: false,
            feedback: 'Falso. noise() es una función pura; puedes llamarla tantas veces como desees sin errores de compilación.',
          },
          {
            id: 'p6-opt-b',
            text: 'La pelota quedaría bloqueada en una trayectoria diagonal rígida a 45°, porque en todo fotograma el desplazamiento horizontal fx sería exactamente idéntico al vertical fy.',
            isCorrect: true,
            feedback: '¡Exacto! Al ser una función determinista, noise(t) == noise(t). Si ambas fuerzas son iguales en todo instante, la relación deltaX / deltaY es 1, confinando el movimiento a una diagonal sin riqueza espacial.',
          },
          {
            id: 'p6-opt-c',
            text: 'La pelota saltaría instantáneamente a coordenadas aleatorias inconexas como si fuera la función random().',
            isCorrect: false,
            feedback: 'Incorrecto. noise() sigue siendo continua; lo que se pierde es la independencia dimensional 2D.',
          },
          {
            id: 'p6-opt-d',
            text: 'La velocidad de refresco del sketch caería a 0 FPS porque Processing no puede resolver raíces cuadradas en ruido.',
            isCorrect: false,
            feedback: 'No tiene relación con el rendimiento de cálculo.',
          },
        ],
        hints: {
          hint1: 'noise(t) es una función matemática determinista: para una misma entrada t, siempre devuelve exactamente el mismo valor de salida.',
          hint2: 'Si fuerzaX == fuerzaY en todo fotograma, ¿hacia qué ángulo se desplaza un vector con componentes idénticas (1, 1)?',
          hint3: 'Un vector donde X e Y crecen y decrecen al unísono traza una línea recta con inclinación de 45°.',
        },
      },
      applicationTask: {
        title: 'Experimentación de Ruido Desacoplado',
        instruction: 'Ejecuta el método flotar() en el Explorador de Métodos y verifica en el Inspector de Estado cómo tX y tY avanzan con valores asimétricos, liberando la pelota en un vaivén auténticamente 2D.',
        targetMethodId: 'flotar',
        expectedOutcome: 'Deriva bidimensional orgánica sin restricción diagonal.',
      },
    },
    {
      id: 'p-stage-7',
      stageNumber: 7,
      title: 'Etapa 7. Instancias y Arreglos (Pelota[])',
      moment: 'instances-arrays',
      objective: 'Aprender cómo un arreglo permite gestionar múltiples pelotas independientes con un ciclo for en setup() y draw().',
      explanation:
        'Compartir la misma clase Pelota NO significa compartir los valores de sus campos. Al crear un arreglo "Pelota[] pelotas = new Pelota[3];", cada pelota tiene su propia posición, color y velocidad independiente.',
      challenge: {
        id: 'p-ch-7',
        question: 'Si ejecutamos "pelotas[0].cambiarTamano(90);", ¿qué pelotas cambiarán de tamaño?',
        options: [
          {
            id: 'p7-opt-a',
            text: 'Todas las pelotas cambiarán a 90 px porque comparten la misma clase Pelota.',
            isCorrect: false,
            feedback: 'Error común: la clase es el molde, pero cada objeto instanciado almacena sus propios valores independientes en sus campos.',
          },
          {
            id: 'p7-opt-b',
            text: 'Ninguna pelota cambiará, porque los arreglos en Processing son inmutables.',
            isCorrect: false,
            feedback: 'Falso. Las instancias dentro de un arreglo pueden mutar sus campos mediante métodos en cualquier instante.',
          },
          {
            id: 'p7-opt-c',
            text: 'Únicamente la primera pelota del arreglo (índice 0). Las pelotas en los índices 1 y 2 conservan su propio diámetro intacto.',
            isCorrect: true,
            feedback: '¡Correcto! Cada elemento del arreglo es una instancia con su propia memoria encapsulada independiente.',
          },
          {
            id: 'p7-opt-d',
            text: 'Solo la última pelota del arreglo porque el índice 0 se descarta.',
            isCorrect: false,
            feedback: 'En Processing los arreglos son de base cero; el índice [0] apunta con exactitud al primer elemento.',
          },
        ],
        hints: {
          hint1: 'Recuerda el concepto de encapsulamiento: cada instancia tiene su propio casillero de memoria.',
          hint2: 'El índice [0] señala específicamente a la primera pelota.',
          hint3: 'Modificar pelotas[0] no afecta a pelotas[1] ni a pelotas[2].',
        },
      },
    },
    {
      id: 'p-stage-8',
      stageNumber: 8,
      title: 'Etapa 8. Laboratorio de Experimentación Libre',
      moment: 'free-lab',
      objective: 'Explorar con total libertad el arreglo de pelotas, consultar el historial de métodos ejecutados y descargar el archivo .pde ejecutable.',
      explanation:
        '¡Felicitaciones! Has completado la construcción guiada de la clase Pelota. Experimenta seleccionando cada pelota, modificando sus campos, revisando el historial de llamadas reales y descargando el sketch completo listo para Processing Java.',
    },
  ],
};

export const BURBUJA_MODULE: ModuleProgression = {
  moduleId: 'burbuja',
  moduleName: 'Módulo 2: Burbuja (Aplicación Autónoma)',
  objectName: 'Burbuja',
  fields: [
    {
      name: 'x',
      type: 'float',
      initialValue: 200,
      description: 'Posición horizontal en el lienzo.',
      visualRole: 'Columna cartesiana donde se dibuja la burbuja.',
    },
    {
      name: 'y',
      type: 'float',
      initialValue: 280,
      description: 'Posición vertical (nace en la parte baja).',
      visualRole: 'Fila cartesiana donde se ubica la burbuja.',
    },
    {
      name: 'diametro',
      type: 'float',
      initialValue: 45,
      description: 'Diámetro del círculo de la burbuja.',
      visualRole: 'Tamaño del cuerpo esférico.',
    },
    {
      name: 'velocidad',
      type: 'float',
      initialValue: 2.2,
      description: 'Velocidad de ascenso vertical.',
      visualRole: 'Cantidad de píxeles que sube restando al eje Y en cada fotograma.',
    },
    {
      name: 'opacidad',
      type: 'float',
      initialValue: 160,
      description: 'Nivel de transparencia alfa (0 a 255).',
      visualRole: 'Define qué tan traslúcida es la burbuja; 255 es sólida y 50 es casi transparente.',
    },
    {
      name: 'tX',
      type: 'float',
      initialValue: 0.0,
      description: 'Semilla temporal en el espacio de ruido Perlin para la deriva horizontal X.',
      visualRole: 'Controla el vaivén subacuático lateral de forma desacoplada.',
    },
    {
      name: 'tY',
      type: 'float',
      initialValue: 1000.0,
      description: 'Semilla temporal en el espacio de ruido Perlin para la perturbación vertical Y.',
      visualRole: 'Desfase asimétrico para simular microvórtices sin forzar trayectorias diagonales.',
    },
  ],
  methods: [
    {
      id: 'mostrar',
      name: 'mostrar',
      signature: 'void mostrar()',
      description: 'Dibuja la burbuja con relleno traslúcido y un contorno brillante.',
      fieldsUsed: ['x', 'y', 'diametro', 'opacidad'],
      fieldsModified: [],
      parameters: [],
      executionType: 'instant',
      codeSnippet: `void mostrar() {
  fill(120, 200, 255, opacidad);
  stroke(255, opacidad + 40);
  strokeWeight(2);
  ellipse(x, y, diametro, diametro);
  // Brillo especular interior
  noStroke();
  fill(255, opacidad + 30);
  ellipse(x - diametro * 0.2, y - diametro * 0.2, diametro * 0.25, diametro * 0.25);
}`,
      explanation:
        'Aprovecha el cuarto parámetro de fill(r, g, b, alfa) en Processing para generar el efecto vítreo de la burbuja.',
    },
    {
      id: 'subir',
      name: 'subir',
      signature: 'void subir()',
      description: 'Desplaza la burbuja verticalmente hacia arriba restando velocidad a y.',
      fieldsUsed: ['y', 'velocidad'],
      fieldsModified: ['y'],
      parameters: [],
      executionType: 'continuous',
      codeSnippet: `void subir() {
  y = y - velocidad;
}`,
      explanation:
        'En Processing, el eje Y = 0 se encuentra arriba. Para que un objeto suba flotando en contra de la gravedad, debemos RESTAR velocidad al campo y.',
    },
    {
      id: 'flotar',
      name: 'flotar',
      signature: 'void flotar(float pasoRuido, float balanceo)',
      description: 'Aplica una deriva subacuática orgánica evaluando noise() con semillas temporales independientes (tX y tY).',
      fieldsUsed: ['x', 'y', 'tX', 'tY'],
      fieldsModified: ['x', 'y', 'tX', 'tY'],
      parameters: [
        {
          name: 'pasoRuido',
          type: 'float',
          defaultValue: 0.012,
          min: 0.002,
          max: 0.04,
          step: 0.002,
          description: 'Frecuencia de avance temporal en la curva continua de ruido.',
        },
        {
          name: 'balanceo',
          type: 'float',
          defaultValue: 2.2,
          min: 0.5,
          max: 8.0,
          step: 0.2,
          description: 'Amplitud de la oscilación de corrientes en píxeles.',
        },
      ],
      executionType: 'continuous',
      codeSnippet: `void flotar(float pasoRuido, float balanceo) {
  // Deriva subacuática por ruido Perlin independiente en X e Y
  // tX y tY recorren regiones no correlacionadas del espacio de ruido
  float corrienteX = map(noise(tX), 0, 1, -balanceo, balanceo);
  float corrienteY = map(noise(tY), 0, 1, -balanceo * 0.6, balanceo * 0.6);
  
  x = x + corrienteX;
  y = y + corrienteY;
  
  tX = tX + pasoRuido;
  tY = tY + pasoRuido;
}`,
      explanation:
        'En fluidos reales las burbujas no ascienden de forma perfectamente vertical ni siguen una onda matemática repetitiva. Al desacoplar tX y tY, la componente de deriva horizontal y vertical responden a corrientes turbulentas independientes, logrando una estética natural propia del diseño generativo.',
    },
    {
      id: 'crecer',
      name: 'crecer',
      signature: 'void crecer(float incremento)',
      description: 'Aumenta progresivamente el diámetro de la burbuja a medida que asciende.',
      fieldsUsed: ['diametro'],
      fieldsModified: ['diametro'],
      parameters: [
        {
          name: 'incremento',
          type: 'float',
          defaultValue: 10,
          min: -20,
          max: 40,
          step: 2,
          description: 'Píxeles a sumar al diámetro.',
        },
      ],
      executionType: 'instant',
      codeSnippet: `void crecer(float incremento) {
  diametro = diametro + incremento;
}`,
      explanation:
        'Simula la expansión física de una burbuja al ascender debido a la menor presión hidrostática.',
    },
    {
      id: 'desplazar',
      name: 'desplazar',
      signature: 'void desplazar(float distancia)',
      description: 'Mueve la burbuja horizontalmente para simular corrientes de aire o agua.',
      fieldsUsed: ['x'],
      fieldsModified: ['x'],
      parameters: [
        {
          name: 'distancia',
          type: 'float',
          defaultValue: 15,
          min: -60,
          max: 60,
          step: 5,
          description: 'Distancia horizontal en píxeles a desplazar.',
        },
      ],
      executionType: 'instant',
      codeSnippet: `void desplazar(float distancia) {
  x = x + distancia;
}`,
      explanation:
        'Permite perturbar la trayectoria vertical recta con derivas laterales.',
    },
    {
      id: 'cambiarTransparencia',
      name: 'cambiarTransparencia',
      signature: 'void cambiarTransparencia(float valor)',
      description: 'Ajusta el nivel de transparencia alfa entre 0 (invisible) y 255 (sólida).',
      fieldsUsed: [],
      fieldsModified: ['opacidad'],
      parameters: [
        {
          name: 'valor',
          type: 'float',
          defaultValue: 120,
          min: 20,
          max: 255,
          step: 5,
          description: 'Nuevo valor de canal alfa (0 a 255).',
        },
      ],
      executionType: 'instant',
      codeSnippet: `void cambiarTransparencia(float valor) {
  opacidad = constrain(valor, 0, 255);
}`,
      explanation:
        'Modifica la visibilidad de la burbuja usando la función constrain() para garantizar que el valor se mantenga en el rango de alfa de Processing (0 a 255).',
    },
    {
      id: 'cambiarVelocidad',
      name: 'cambiarVelocidad',
      signature: 'void cambiarVelocidad(float nuevaVelocidad)',
      description: 'Modifica la rapidez de ascenso vertical.',
      fieldsUsed: [],
      fieldsModified: ['velocidad'],
      parameters: [
        {
          name: 'nuevaVelocidad',
          type: 'float',
          defaultValue: 3.5,
          min: 0.5,
          max: 8.0,
          step: 0.5,
          description: 'Nueva velocidad ascendente en px/frame.',
        },
      ],
      executionType: 'instant',
      codeSnippet: `void cambiarVelocidad(float nuevaVelocidad) {
  velocidad = nuevaVelocidad;
}`,
      explanation:
        'Burbujas más grandes suelen tener mayor flotabilidad y pueden configurarse con velocidades distintas.',
    },
    {
      id: 'reiniciar',
      name: 'reiniciar',
      signature: 'void reiniciar(float nuevaX, float nuevaY)',
      description: 'Reubica la burbuja (típicamente en la parte inferior del lienzo).',
      fieldsUsed: [],
      fieldsModified: ['x', 'y'],
      parameters: [
        {
          name: 'nuevaX',
          type: 'float',
          defaultValue: 200,
          min: 20,
          max: 480,
          description: 'Nueva coordenada X.',
        },
        {
          name: 'nuevaY',
          type: 'float',
          defaultValue: 320,
          min: 100,
          max: 360,
          description: 'Nueva coordenada Y.',
        },
      ],
      executionType: 'instant',
      codeSnippet: `void reiniciar(float nuevaX, float nuevaY) {
  x = nuevaX;
  y = nuevaY;
}`,
      explanation:
        'Permite reciclar la burbuja cuando alcanza la superficie.',
    },
  ],
  stages: [
    {
      id: 'b-stage-1',
      stageNumber: 1,
      title: 'Etapa 1. Observación y Análisis de la Burbuja',
      moment: 'observe',
      objective: 'Identificar qué propiedades visuales distinguen a una burbuja (ascenso, transparencia) frente a la pelota.',
      explanation:
        'Ahora aplicaremos los conocimientos de POO para modelar un objeto más poético: una Burbuja acuática. A diferencia de la pelota que rebota en 2D, una burbuja asciende hacia arriba en el eje Y contrarrestando la gravedad y posee una cualidad translúcida gobernada por un canal alfa de opacidad.',
      challenge: {
        id: 'b-ch-1',
        question: 'Para lograr que una burbuja ascienda hacia arriba en la ventana gráfica de Processing, ¿cómo debe modificarse su coordenada "y" en cada fotograma?',
        options: [
          {
            id: 'b1-opt-a',
            text: 'x = x + velocidad; (Sumar a la coordenada horizontal X).',
            isCorrect: false,
            feedback: 'X controla el plano horizontal (izquierda/derecha), no el ascenso vertical hacia la superficie.',
          },
          {
            id: 'b1-opt-b',
            text: 'y = y - velocidad; (Restar a Y porque el origen Y = 0 se ubica en el borde superior de la pantalla).',
            isCorrect: true,
            feedback: '¡Correcto! En Processing el origen (0,0) está arriba a la izquierda. Restar a Y desplaza el objeto hacia el cielo de la ventana.',
          },
          {
            id: 'b1-opt-c',
            text: 'y = y + velocidad; (Sumar a Y como en el plano cartesiano matemático escolar).',
            isCorrect: false,
            feedback: 'En el sistema de coordenadas de pantallas digitales, el eje Y crece hacia abajo. Si sumas, la burbuja se hundirá hacia el fondo.',
          },
          {
            id: 'b1-opt-d',
            text: 'diametro = diametro - velocidad;',
            isCorrect: false,
            feedback: 'Modificar el diámetro cambiaría el tamaño físico, no la posición vertical en pantalla.',
          },
        ],
        hints: {
          hint1: 'Recuerda cómo funciona el sistema de coordenadas de Processing visto en el Módulo 1.',
          hint2: 'El borde superior del lienzo tiene coordenada Y = 0.',
          hint3: 'Para acercarse a Y = 0 desde abajo, se debe restar al valor de y.',
        },
      },
    },
    {
      id: 'b-stage-2',
      stageNumber: 2,
      title: 'Etapa 2. Campos de la Burbuja',
      moment: 'fields',
      objective: 'Declarar los 5 campos de la clase Burbuja comprendiendo el rango alfa de opacidad (0 a 255).',
      explanation:
        'Una burbuja almacena 5 datos fundamentales en su memoria:\n1. Posición (float x, float y)\n2. Dimensión (float diametro)\n3. Cinemática vertical (float velocidad)\n4. Cualidad óptica (float opacidad en el rango 0 a 255).\n\nEn Processing, el canal alfa no va de 0.0 a 1.0 como en CSS web, sino de 0 (invisible) a 255 (sólido opaco).',
      codeAdditionHighlight: `class Burbuja {
  float x;
  float y;
  float diametro;
  float velocidad;
  float opacidad; // 0 (invisible) a 255 (opaco)
}`,
      challenge: {
        id: 'b-ch-2',
        question: '¿Qué valor numérico para el campo "opacidad" producirá una burbuja traslúcida que permita ver objetos a través de ella en Processing?',
        options: [
          {
            id: 'b2-opt-a',
            text: '0.6 (siguiendo el rango de 0.0 a 1.0 del lenguaje CSS).',
            isCorrect: false,
            feedback: 'Processing maneja canales de color de 8 bits (0 a 255). Un valor de 0.6 sería prácticamente 100% invisible en pantalla.',
          },
          {
            id: 'b2-opt-b',
            text: '500 (para garantizar máxima luminosidad).',
            isCorrect: false,
            feedback: 'Cualquier número superior a 255 se satura al 100% de opacidad completamente sólida sin transparencia.',
          },
          {
            id: 'b2-opt-c',
            text: '140 (en el rango de 0 a 255 de Processing, equivalente a un 55% de translucidez vítrea).',
            isCorrect: true,
            feedback: '¡Exacto! Un valor intermedio cercano a 140 permite apreciar tanto el brillo de la burbuja como los elementos marinos de fondo.',
          },
          {
            id: 'b2-opt-d',
            text: '-50 (número negativo para invertir la luz).',
            isCorrect: false,
            feedback: 'Los canales de color no admiten valores negativos en la función fill(r, g, b, alfa).',
          },
        ],
        hints: {
          hint1: 'Processing maneja los colores con canales de 8 bits (0 a 255).',
          hint2: 'Un valor medio entre 0 y 255 da la semitransparencia ideal.',
          hint3: 'Valores entre 100 y 180 son los más habituales para burbujas en Processing.',
        },
      },
    },
    {
      id: 'b-stage-3',
      stageNumber: 3,
      title: 'Etapa 3. Constructor de Burbuja',
      moment: 'constructor',
      objective: 'Diseñar el constructor con parámetros para instanciar burbujas en el fondo del lienzo.',
      explanation:
        'El constructor asigna los valores iniciales. Al nacer una burbuja con "new Burbuja(...)", le enviamos 5 argumentos en estricto orden: posición inicial horizontal y vertical (xTemp, yTemp), tamaño (diamTemp), velocidad ascendente (velTemp) y opacidad (opacTemp).',
      codeAdditionHighlight: `  // Constructor: Asigna valores iniciales a los 5 campos
  Burbuja(float xTemp, float yTemp, float diamTemp, float velTemp, float opacTemp) {
    x = xTemp;
    y = yTemp;
    diametro = diamTemp;
    velocidad = velTemp;
    opacidad = opacTemp;
  }`,
      challenge: {
        id: 'b-ch-3',
        question: 'Si escribimos en setup(): "miBurbuja = new Burbuja(200, 300, 40, 2.5, 140);", ¿en qué orden se asignan los valores en el constructor?',
        options: [
          {
            id: 'b3-opt-a',
            text: 'El orden es arbitrario porque Java detecta automáticamente cuál valor corresponde al diámetro por su tamaño.',
            isCorrect: false,
            feedback: 'Falso. Java asigna los valores estrictamente de izquierda a derecha según el orden de declaración en los paréntesis del constructor.',
          },
          {
            id: 'b3-opt-b',
            text: 'Coordenada X (200), Coordenada Y (300), Diámetro (40), Velocidad (2.5) y Opacidad (140), correspondiendo uno a uno con los parámetros.',
            isCorrect: true,
            feedback: '¡Excelente! Los argumentos reales coinciden posicionalmente con los parámetros declarados en la firma del constructor.',
          },
          {
            id: 'b3-opt-c',
            text: 'Todos los 5 valores se suman para calcular una velocidad global de la burbuja.',
            isCorrect: false,
            feedback: 'Incorrecto. Cada argumento inicializa su propio campo independiente.',
          },
          {
            id: 'b3-opt-d',
            text: 'Primero la opacidad, después la velocidad y al final las coordenadas cartesianas.',
            isCorrect: false,
            feedback: 'Incorrecto. La firma declarada empieza con xTemp e yTemp.',
          },
        ],
        hints: {
          hint1: 'Compara los 5 argumentos del "new" con la lista de parámetros en la firma del constructor.',
          hint2: 'El orden posicional de izquierda a derecha es vinculante en Java.',
          hint3: 'Primero xTemp, luego yTemp, diamTemp, velTemp y opacTemp.',
        },
      },
    },
    {
      id: 'b-stage-4',
      stageNumber: 4,
      title: 'Etapa 4. Métodos de la Burbuja',
      moment: 'methods',
      objective: 'Implementar los métodos de ascenso (subir), vaivén sutil en agua (flotar), expansión (crecer) y recolocación (reiniciar).',
      explanation:
        'La clase cuenta con 8 métodos adaptados a su física marina:\n1. mostrar(): dibuja cuerpo traslúcido y brillo especular\n2. subir(): resta velocidad a y para ascender\n3. flotar(float balanceo): oscilación senoidal sutil en el eje X para vaivén orgánico\n4. crecer(float incremento): aumenta el diámetro al subir\n5. desplazar(float distancia): añade deriva por corrientes\n6. cambiarTransparencia(float valor): ajusta alfa con constrain()\n7. cambiarVelocidad(float nuevaVelocidad): modifica la rapidez\n8. reiniciar(float nuevaX, float nuevaY): recicla la burbuja al llegar a la superficie.',
      challenge: {
        id: 'b-ch-4',
        question: '¿Qué método permite simular que una burbuja se expande y se hace más grande a medida que asciende hacia la superficie marina?',
        options: [
          {
            id: 'b4-opt-a',
            text: 'void subir() { y = y - velocidad; }',
            isCorrect: false,
            feedback: 'subir() modifica la posición vertical Y, pero el diámetro geométrico permanece idéntico.',
          },
          {
            id: 'b4-opt-b',
            text: 'void reiniciar(0, 0);',
            isCorrect: false,
            feedback: 'reiniciar() reubica las coordenadas cartesianas pero no altera el tamaño.',
          },
          {
            id: 'b4-opt-c',
            text: 'void cambiarTransparencia(255);',
            isCorrect: false,
            feedback: 'cambiarTransparencia() modifica el canal alfa, no el tamaño del círculo.',
          },
          {
            id: 'b4-opt-d',
            text: 'void crecer(float incremento) { diametro = diametro + incremento; }',
            isCorrect: true,
            feedback: '¡Exacto! Recibe un valor decimal en el parámetro incremento y lo suma al campo diametro.',
          },
        ],
        hints: {
          hint1: 'Busca el método que recibe un parámetro y modifica el campo diametro.',
          hint2: 'El método es crecer(float incremento).',
          hint3: 'diametro = diametro + incremento;',
        },
      },
    },
    {
      id: 'b-stage-5',
      stageNumber: 5,
      title: 'Etapa 5. Deriva Subacuática: Ruido Perlin 2D Desacoplado (tX, tY)',
      moment: 'methods',
      objective: 'Comprender por qué en simulación acuática continua se emplea ruido Perlin multidimensional en vez de funciones aleatorias discretas.',
      explanation:
        'En corrientes reales, las burbujas experimentan microturbulencias fluidas. Si usáramos random(-2, 2), la burbuja vibraría de forma espástica (ruido blanco). Para lograr un vaivén hidrodinámico suave, evaluamos la función armónica noise(tX) y noise(tY) con semillas temporales separadas.\n\nAl igual que en la pelota, desacoplar tX y tY permite que la oscilación horizontal y vertical respondan a dinámicas independientes del fluido marino.',
      codeAdditionHighlight: `  // DERIVA Y VÓRTICE SUBACUÁTICO CON RUIDO PERLIN 2D
  void flotar(float pasoRuido, float balanceo) {
    float corrienteX = map(noise(tX), 0, 1, -balanceo, balanceo);
    float corrienteY = map(noise(tY), 0, 1, -balanceo * 0.6, balanceo * 0.6);

    x += corrienteX;
    y += corrienteY;

    tX += pasoRuido;
    tY += pasoRuido;
  }`,
      challenge: {
        id: 'b-ch-5',
        question: '¿Por qué en simulación hidrodinámica de código creativo se prefiere evaluar noise(tX) y noise(tY) en lugar de utilizar random(-2, 2) para el vaivén de las burbujas?',
        options: [
          {
            id: 'b5-opt-a',
            text: 'Porque random() solo produce números enteros impares en Processing Java.',
            isCorrect: false,
            feedback: 'Falso. random() devuelve valores de coma flotante (float).',
          },
          {
            id: 'b5-opt-b',
            text: 'Porque random() genera saltos bruscos e inconexos entre fotogramas sucesivos (ruido blanco), mientras que noise() genera una curva suave y continua donde cada valor está armónicamente conectado con el anterior.',
            isCorrect: true,
            feedback: '¡Exacto! El ruido de Perlin provee coherencia temporal (las muestras contiguas varían gradualmente), simulando a la perfección la inercia viscosa del agua.',
          },
          {
            id: 'b5-opt-c',
            text: 'Porque la función random() colapsaría la memoria Heap de los objetos en pantalla.',
            isCorrect: false,
            feedback: 'Incorrecto. No tiene que ver con consumo de memoria.',
          },
          {
            id: 'b5-opt-d',
            text: 'Porque noise() obliga a la burbuja a ascender a velocidad constante sin importar la fricción.',
            isCorrect: false,
            feedback: 'Falso. noise() modula la deriva espacial, no la gravedad.',
          },
        ],
        hints: {
          hint1: 'Compara la gráfica de una señal aleatoria pura (ruido blanco) frente a la curva armónica de Ken Perlin.',
          hint2: 'random() no tiene memoria del fotograma anterior; noise() evalúa una función continua en el espacio.',
          hint3: 'La física del agua requiere suavidad en la aceleración para que el movimiento sea creíble.',
        },
      },
      applicationTask: {
        title: 'Verificación de Vaivén Subacuático',
        instruction: 'Ejecuta flotar() con pasoRuido = 0.012 y observa cómo las burbujas derivan orgánicamente en el entorno marino con corrientes suaves.',
        targetMethodId: 'flotar',
        expectedOutcome: 'Fluctuación continua en 2D sin saltos bruscos de píxeles.',
      },
    },
    {
      id: 'b-stage-6',
      stageNumber: 6,
      title: 'Etapa 6. Arreglo de 5 Burbujas (Burbuja[]) y Ciclo for',
      moment: 'instances-arrays',
      objective: 'Construir y recorrer un arreglo de 5 burbujas independientes con un ciclo for en setup() y draw().',
      explanation:
        'Para simular una columna de efervescencia acuática, declaramos "Burbuja[] burbujas = new Burbuja[5];". En setup() usamos un ciclo for para poblar el arreglo con diámetros y velocidades escalonadas usando random(). En draw(), otro bucle for invoca subir(), flotar(0.012, 2.2) y mostrar() sobre cada elemento.',
      codeAdditionHighlight: `Burbuja[] burbujas = new Burbuja[5];

void setup() {
  size(500, 350);
  for (int i = 0; i < burbujas.length; i++) {
    burbujas[i] = new Burbuja(random(50, 450), random(250, 340), random(25, 60), random(1.5, 3.5), random(120, 200));
  }
}

void draw() {
  background(14, 21, 36); // Fondo azul marino profundo
  for (int i = 0; i < burbujas.length; i++) {
    burbujas[i].subir();
    burbujas[i].flotar(0.012, 2.2); // Ruido Perlin 2D desacoplado
    burbujas[i].mostrar();
  }
}`,
      challenge: {
        id: 'b-ch-6',
        question: 'En la estructura "for (int i = 0; i < burbujas.length; i++)", ¿cuál es la ventaja de escribir "burbujas.length" en vez de escribir un número fijo como 5?',
        options: [
          {
            id: 'b6-opt-a',
            text: 'Porque escribir números en la condición del for provoca un error de compilación en Java.',
            isCorrect: false,
            feedback: 'Falso. Escribir 5 compilaría, pero si luego cambias el tamaño a 10 tendrías que modificar el código manualmente.',
          },
          {
            id: 'b6-opt-b',
            text: 'Para que el sketch aumente automáticamente la velocidad de la tarjeta gráfica.',
            isCorrect: false,
            feedback: 'No tiene relación con la velocidad de hardware.',
          },
          {
            id: 'b6-opt-c',
            text: 'Porque si después decides cambiar el arreglo a 10 o 50 burbujas, el ciclo for se adaptará automáticamente sin necesidad de editar los límites a mano.',
            isCorrect: true,
            feedback: '¡Excelente principio de ingeniería de software! La propiedad .length hace que el código sea modular, elástico y a prueba de errores de índice fuera de rango.',
          },
          {
            id: 'b6-opt-d',
            text: 'Porque .length calcula el diámetro promedio de todas las burbujas.',
            isCorrect: false,
            feedback: '.length devuelve la cantidad de casilleros del arreglo, no una medida geométrica.',
          },
        ],
        hints: {
          hint1: 'Piensa qué sucedería si cambias new Burbuja[5] a new Burbuja[20].',
          hint2: 'La propiedad .length lee dinámicamente la capacidad del arreglo.',
          hint3: 'Evita tener números "mágicos" hardcodeados en el código.',
        },
      },
    },
    {
      id: 'b-stage-7',
      stageNumber: 7,
      title: 'Etapa 7. Reto de Ampliación: Reaparición con if',
      moment: 'free-lab',
      objective: 'Integrar una estructura condicional que detecte cuándo una burbuja sale por arriba y la reinicie abajo.',
      explanation:
        'Cuando una burbuja sube más allá de la parte superior (y < -diametro), desaparece del lienzo. Con una condición if dentro de su método subir() o desde draw(), podemos reiniciarla automáticamente en la parte inferior para lograr un ciclo continuo infinito.',
      codeAdditionHighlight: `// Reto de ampliación con estructura condicional if:
if (y < -diametro) {
  reiniciar(random(50, width - 50), height + diametro);
}`,
      challenge: {
        id: 'b-ch-7',
        question: '¿Por qué la condición para saber si la burbuja salió por completo de la pantalla es "y < -diametro" en lugar de "y < 0"?',
        options: [
          {
            id: 'b7-opt-a',
            text: 'Porque Processing prohíbe terminantemente evaluar números negativos con cero en condiciones if.',
            isCorrect: false,
            feedback: 'Processing permite comparar cualquier número float con operadores relacionales (<, >, <=, etc.).',
          },
          {
            id: 'b7-opt-b',
            text: 'Porque como el círculo se dibuja desde su centro (y), cuando y = 0 la mitad inferior del círculo todavía es visible en la pantalla; restar el diámetro garantiza que haya salido al 100% antes de teletransportarse.',
            isCorrect: true,
            feedback: '¡Excelente percepción visual! Al usar -diametro, evitamos el efecto visual tosco de ver desaparecer una esfera a medio camino.',
          },
          {
            id: 'b7-opt-c',
            text: 'Porque el diámetro siempre debe ser estrictamente mayor a la posición cartesiana X.',
            isCorrect: false,
            feedback: 'El diámetro es una dimensión; no tiene restricción de ser mayor que la posición.',
          },
          {
            id: 'b7-opt-d',
            text: 'Para que la gravedad de Processing invierta la dirección del agua hacia abajo.',
            isCorrect: false,
            feedback: 'No tiene relación con la gravedad.',
          },
        ],
        hints: {
          hint1: 'Recuerda que ellipse() posiciona el círculo por defecto en su centro (x, y).',
          hint2: 'Si el centro está en 0, el radio del círculo aún asoma por el borde.',
          hint3: 'Para que esté 100% fuera, y debe ser menor a -diametro o -radio.',
        },
      },
    },
    {
      id: 'b-stage-8',
      stageNumber: 8,
      title: 'Etapa 8. Laboratorio Libre de Burbujas',
      moment: 'free-lab',
      objective: 'Experimentar libremente con las 5 burbujas, explorar sus métodos, consultar el historial y descargar el archivo .pde.',
      explanation:
        'Has dominado la transferencia de conceptos de POO a una nueva clase con física marina y ruido Perlin 2D desacoplado. Experimenta con las 5 burbujas, perturba sus trayectorias y descarga tu sketch completo de Processing Java.',
    },
  ],
};
