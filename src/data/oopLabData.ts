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
      initialValue: 180,
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
      name: 'velocidad',
      type: 'float',
      initialValue: 3.0,
      description: 'Cantidad de píxeles que la pelota avanza en cada ciclo.',
      visualRole: 'Define qué tan rápido y hacia dónde (positivo = derecha, negativo = izquierda) se desplaza.',
    },
    {
      name: 'tono',
      type: 'color',
      initialValue: '#E2661A',
      description: 'Color de relleno en formato RGBA de Processing.',
      visualRole: 'Define el color con el que la función fill() pinta la pelota.',
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
      description: 'Desplaza la pelota sumando el valor del campo velocidad a la posición x.',
      fieldsUsed: ['x', 'velocidad'],
      fieldsModified: ['x'],
      parameters: [],
      executionType: 'continuous',
      codeSnippet: `void mover() {
  x = x + velocidad;
}`,
      explanation:
        'A diferencia de mostrar(), mover() altera el estado interno del objeto: toma el valor actual de x, le suma velocidad y vuelve a guardar el resultado en x.',
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
      signature: 'void cambiarVelocidad(float nuevaVelocidad)',
      description: 'Ajusta la rapidez y sentido con la que la pelota se desplaza.',
      fieldsUsed: [],
      fieldsModified: ['velocidad'],
      parameters: [
        {
          name: 'nuevaVelocidad',
          type: 'float',
          defaultValue: 5.0,
          min: -10,
          max: 10,
          step: 0.5,
          description: 'Nueva velocidad en píxeles por fotograma.',
        },
      ],
      executionType: 'instant',
      codeSnippet: `void cambiarVelocidad(float nuevaVelocidad) {
  velocidad = nuevaVelocidad;
}`,
      explanation:
        'Modificar la velocidad permite experimentar cómo dos pelotas con la misma clase se mueven a ritmos completamente distintos según sus campos individuales.',
    },
    {
      id: 'invertirDireccion',
      name: 'invertirDireccion',
      signature: 'void invertirDireccion()',
      description: 'Invierte el sentido del movimiento multiplicando la velocidad por -1.',
      fieldsUsed: ['velocidad'],
      fieldsModified: ['velocidad'],
      parameters: [],
      executionType: 'instant',
      codeSnippet: `void invertirDireccion() {
  velocidad = velocidad * -1;
}`,
      explanation:
        'Una operación matemática elemental sobre un campo interno produce un cambio drástico en el comportamiento visual del objeto.',
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
          defaultValue: 100,
          min: 20,
          max: 480,
          description: 'Nueva coordenada horizontal X.',
        },
        {
          name: 'nuevaY',
          type: 'float',
          defaultValue: 180,
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
      objective: 'Reconocer las características visuales de una pelota y distinguir entre propiedades y acciones.',
      explanation:
        'En la programación orientada a objetos (POO), antes de escribir una sola línea de código observamos la realidad o el diseño gráfico. ¿Qué información define a una pelota? ¿Qué acciones puede realizar?',
      challenge: {
        id: 'p-ch-1',
        question: 'De la siguiente lista de características observadas en la pelota, ¿cuál corresponde a una ACCIÓN (comportamiento) y no a una propiedad estática?',
        options: [
          {
            id: 'opt-1',
            text: 'Moverse horizontalmente hacia adelante.',
            isCorrect: true,
            feedback: '¡Exacto! "Moverse" es un verbo, una acción que altera el estado. En Java se convertirá en un método void mover().',
          },
          {
            id: 'opt-2',
            text: 'El diámetro del círculo en píxeles.',
            isCorrect: false,
            feedback: 'El diámetro es un dato o medida que describe el objeto en reposo: es una propiedad (campo), no una acción.',
          },
          {
            id: 'opt-3',
            text: 'El color naranja de relleno.',
            isCorrect: false,
            feedback: 'El color describe una cualidad visual del objeto: es una propiedad (campo color tono).',
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
      objective: 'Escribir la declaración de la clase Pelota con su palabra reservada y llaves de apertura y cierre.',
      explanation:
        'Una clase en Processing es el molde o plantilla a partir del cual nacerán las pelotas. Se declara con la palabra reservada class seguida del nombre en mayúscula inicial (convención PascalCase) y un bloque de llaves { }.',
      codeAdditionHighlight: `class Pelota {
  // Aquí vivirá la estructura interna
}`,
      challenge: {
        id: 'p-ch-2',
        question: '¿Cuál es la forma sintácticamente correcta de declarar la clase Pelota en Processing Java?',
        options: [
          {
            id: 'opt-1',
            text: 'class Pelota { }',
            isCorrect: true,
            feedback: '¡Correcto! En Processing Java usamos "class", el nombre con mayúscula inicial y llaves { } delimitando su contenido.',
          },
          {
            id: 'opt-2',
            text: 'function Pelota() { }',
            isCorrect: false,
            feedback: 'Incorrecto. "function" se usa en JavaScript/p5.js. En Processing Java estricto se declara con la palabra "class".',
          },
          {
            id: 'opt-3',
            text: 'Pelota class ( )',
            isCorrect: false,
            feedback: 'Incorrecto. La palabra "class" debe ir antes del nombre y el cuerpo de una clase se delimita con llaves { }, no con paréntesis.',
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
      title: 'Etapa 3. Campos (Estado del Objeto)',
      moment: 'fields',
      objective: 'Declarar las variables internas que almacenan la posición, tamaño, velocidad y color de la pelota.',
      explanation:
        'Los campos (también llamados atributos o variables de instancia) son los datos que cada pelota recordará en su propia memoria. Comenzamos con posición y tamaño (x, y, diametro) y luego agregamos dinámica (velocidad) y estética (color tono).',
      codeAdditionHighlight: `class Pelota {
  // CAMPOS (Atributos de estado)
  float x;
  float y;
  float diametro;
  float velocidad;
  color tono;
}`,
      challenge: {
        id: 'p-ch-3',
        question: '¿Por qué para la posición (x, y) y la velocidad usamos el tipo de dato "float" en lugar de "int"?',
        options: [
          {
            id: 'opt-1',
            text: 'Porque float permite números decimales, lo que permite acumular velocidades fraccionarias (ej. 2.5 px/frame) y lograr movimientos suaves.',
            isCorrect: true,
            feedback: '¡Exacto! Aunque los píxeles de la pantalla sean enteros, la física necesita decimales para animaciones fluidas.',
          },
          {
            id: 'opt-2',
            text: 'Porque Processing Java prohíbe el uso de int dentro de las clases.',
            isCorrect: false,
            feedback: 'Falso. Puedes usar int en cualquier clase, pero truncaría los decimales en cálculos de velocidad.',
          },
          {
            id: 'opt-3',
            text: 'Porque las variables float consumen menos memoria que las variables int.',
            isCorrect: false,
            feedback: 'Incorrecto. En Java tanto int como float ocupan exactamente 32 bits en memoria.',
          },
        ],
        hints: {
          hint1: 'Piensa en qué ocurre si quieres que una pelota avance a 1.5 píxeles por fotograma.',
          hint2: 'El tipo "int" solo guarda enteros (1, 2, 3); "float" almacena valores con punto flotante (1.5, 3.14).',
          hint3: 'Las simulaciones de movimiento en código creativo casi siempre requieren precisión decimal con float.',
        },
      },
    },
    {
      id: 'p-stage-4',
      stageNumber: 4,
      title: 'Etapa 4. El Constructor',
      moment: 'constructor',
      objective: 'Construir el bloque de inicialización que asigna los valores iniciales a los campos de la pelota.',
      explanation:
        'El constructor es la función especial que se ejecuta cuando creamos una pelota con "new". Tiene el mismo nombre exacto de la clase, NO lleva tipo de retorno (ni siquiera void) y recibe parámetros temporales para inicializar los campos.',
      codeAdditionHighlight: `  // CONSTRUCTOR
  Pelota(float xTemp, float yTemp, float diamTemp, float velTemp, color tonoTemp) {
    x = xTemp;
    y = yTemp;
    diametro = diamTemp;
    velocidad = velTemp;
    tono = tonoTemp;
  }`,
      challenge: {
        id: 'p-ch-4',
        question: 'En la instrucción "x = xTemp;", ¿cuál es el campo del objeto y cuál es el parámetro recibido?',
        options: [
          {
            id: 'opt-1',
            text: '"x" es el campo permanente de la pelota; "xTemp" es el parámetro temporal que llegó con el valor inicial.',
            isCorrect: true,
            feedback: '¡Brillante! El parámetro xTemp entrega el valor al nacer y se guarda en la variable x de la instancia.',
          },
          {
            id: 'opt-2',
            text: '"xTemp" es el campo de la pelota y "x" es el parámetro.',
            isCorrect: false,
            feedback: 'Al revés: el campo definido arriba en la clase es x; xTemp es el parámetro que declaramos entre los paréntesis del constructor.',
          },
          {
            id: 'opt-3',
            text: 'Ambos son variables globales del sketch de Processing.',
            isCorrect: false,
            feedback: 'No son globales. Viven dentro del ámbito de la clase Pelota.',
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
      title: 'Etapa 5. Construcción Progresiva de Métodos',
      moment: 'methods',
      objective: 'Implementar los 7 métodos canónicos: mostrar(), mover(), cambiarTamano(), cambiarColor(), cambiarVelocidad(), invertirDireccion() y reiniciar().',
      explanation:
        'Los métodos definen qué puede hacer el objeto. Algunos no reciben parámetros y solo leen datos (mostrar()), otros alteran campos internos (mover(), invertirDireccion()), y otros reciben nuevos argumentos del exterior para modificar el estado (cambiarTamano(float nuevoDiametro)).',
      challenge: {
        id: 'p-ch-5',
        question: '¿Qué método permite a una pelota invertir el sentido de su movimiento multiplicando la velocidad por -1?',
        options: [
          {
            id: 'opt-1',
            text: 'void invertirDireccion() { velocidad = velocidad * -1; }',
            isCorrect: true,
            feedback: '¡Exacto! Al multiplicar por -1, una velocidad positiva (+3) se vuelve negativa (-3) y viceversa, invirtiendo el sentido.',
          },
          {
            id: 'opt-2',
            text: 'void mover(0) { velocidad = 0; }',
            isCorrect: false,
            feedback: 'Poner la velocidad en 0 detiene la pelota por completo en lugar de invertir su dirección.',
          },
          {
            id: 'opt-3',
            text: 'void cambiarTamano(-1) { diametro = -1; }',
            isCorrect: false,
            feedback: 'El diámetro no puede ser negativo y cambiar de tamaño no altera la dirección del movimiento.',
          },
        ],
        hints: {
          hint1: 'Recuerda que en matemáticas un número multiplicado por -1 cambia de signo.',
          hint2: 'Si la pelota va a la derecha (+3) y queremos que vaya a la izquierda (-3), multiplicamos el campo velocidad por -1.',
          hint3: 'El método es: void invertirDireccion() { velocidad = velocidad * -1; }',
        },
      },
    },
    {
      id: 'p-stage-6',
      stageNumber: 6,
      title: 'Etapa 6. Explorador de Métodos',
      moment: 'method-explorer',
      objective: 'Experimentar interactivamente ejecutando cada método en modo paso a paso y en modo animación continua desde draw().',
      explanation:
        'Has construido los métodos de la clase Pelota. Ahora puedes interactuar directamente con ellos: prueba cambiar su tamaño con el deslizador, alternar colores, pulsar "Paso a paso" para ver una ejecución aislada de mover(), o activar "Animación" para ver el efecto repetitivo de 60 llamadas por segundo.',
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
            id: 'opt-1',
            text: 'Únicamente la primera pelota del arreglo (índice 0). Las pelotas en los índices 1 y 2 conservan su propio diámetro.',
            isCorrect: true,
            feedback: '¡Correcto! Cada elemento del arreglo es una instancia con su propia memoria encapsulada.',
          },
          {
            id: 'opt-2',
            text: 'Todas las pelotas cambiarán a 90 px porque comparten la misma clase Pelota.',
            isCorrect: false,
            feedback: 'Error común: la clase es el molde, pero cada objeto instanciado almacena sus propios valores independientes en sus campos.',
          },
          {
            id: 'opt-3',
            text: 'Ninguna, porque los métodos no pueden invocarse sobre elementos de un arreglo.',
            isCorrect: false,
            feedback: 'Falso. Para invocar un método sobre un elemento de un arreglo usamos la notación de corchetes seguida de un punto: pelotas[i].metodo().',
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
        'Ahora aplicaremos los conocimientos de POO para modelar un objeto más poético: una Burbuja. A diferencia de la pelota, una burbuja asciende hacia arriba en el eje Y y posee una cualidad translúcida gobernada por un canal alfa de opacidad.',
      challenge: {
        id: 'b-ch-1',
        question: 'Para lograr que una burbuja ascienda hacia arriba en Processing, ¿cómo debe modificarse su coordenada "y" en cada fotograma?',
        options: [
          {
            id: 'opt-1',
            text: 'y = y - velocidad; (Restar velocidad porque Y = 0 está en el borde superior).',
            isCorrect: true,
            feedback: '¡Correcto! En Processing el origen (0,0) está arriba a la izquierda. Restar a Y hace que el objeto suba hacia el cielo de la ventana.',
          },
          {
            id: 'opt-2',
            text: 'y = y + velocidad; (Sumar velocidad como en la física cartesiana escolar).',
            isCorrect: false,
            feedback: 'En las matemáticas tradicionales Y crece arriba, pero en pantallas digitales Y crece hacia abajo. Si sumas, la burbuja caerá hacia el fondo.',
          },
          {
            id: 'opt-3',
            text: 'x = x - velocidad; (Modificar la coordenada X).',
            isCorrect: false,
            feedback: 'X controla el eje horizontal (izquierda/derecha), no el ascenso vertical.',
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
      objective: 'Declarar los 5 campos de la clase Burbuja incluyendo opacidad en el rango 0 a 255.',
      explanation:
        'Una burbuja necesita: x, y, diametro, velocidad y opacidad. En Processing los valores de transparencia alfa se especifican en el rango de 0 (completamente transparente) a 255 (completamente sólida).',
      codeAdditionHighlight: `class Burbuja {
  float x;
  float y;
  float diametro;
  float velocidad;
  float opacidad; // 0 a 255
}`,
      challenge: {
        id: 'b-ch-2',
        question: '¿Qué valor del campo "opacidad" producirá una burbuja semitransparente bien visible?',
        options: [
          {
            id: 'opt-1',
            text: '150 (en el rango 0 a 255 de Processing).',
            isCorrect: true,
            feedback: '¡Exacto! 150 es aproximadamente un 60% de opacidad, ideal para ver objetos detrás de la burbuja.',
          },
          {
            id: 'opt-2',
            text: '0.6 (en el rango de 0.0 a 1.0 de CSS).',
            isCorrect: false,
            feedback: 'Processing por defecto usa enteros/floats de 0 a 255 para los canales de color. Un valor de 0.6 sería casi 100% invisible.',
          },
          {
            id: 'opt-3',
            text: '500.',
            isCorrect: false,
            feedback: 'Cualquier valor superior a 255 se satura al 100% de opacidad sólida.',
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
        'El constructor asigna los valores iniciales. Al crear una burbuja, le pasamos las coordenadas de origen, su tamaño, su velocidad de ascenso y su nivel de transparencia.',
      codeAdditionHighlight: `  Burbuja(float xTemp, float yTemp, float diamTemp, float velTemp, float opacTemp) {
    x = xTemp;
    y = yTemp;
    diametro = diamTemp;
    velocidad = velTemp;
    opacidad = opacTemp;
  }`,
    },
    {
      id: 'b-stage-4',
      stageNumber: 4,
      title: 'Etapa 4. Métodos de la Burbuja',
      moment: 'methods',
      objective: 'Implementar los métodos de ascenso (subir), expansión (crecer) y recolocación (reiniciar).',
      explanation:
        'La clase cuenta con 7 métodos adaptados a su naturaleza: mostrar(), subir(), crecer(float incremento), desplazar(float distancia), cambiarTransparencia(float valor), cambiarVelocidad(float nuevaVelocidad) y reiniciar(float nuevaX, float nuevaY).',
      challenge: {
        id: 'b-ch-4',
        question: '¿Qué método permite simular que una burbuja se hace más grande al subir?',
        options: [
          {
            id: 'opt-1',
            text: 'void crecer(float incremento) { diametro = diametro + incremento; }',
            isCorrect: true,
            feedback: '¡Exacto! Suma el incremento al campo diametro en cada llamado.',
          },
          {
            id: 'opt-2',
            text: 'void subir() { y = y - velocidad; }',
            isCorrect: false,
            feedback: 'subir() cambia la posición vertical, pero el tamaño no se ve afectado.',
          },
          {
            id: 'opt-3',
            text: 'void reiniciar(0, 0)',
            isCorrect: false,
            feedback: 'reiniciar reubica la posición, no altera el diámetro.',
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
      title: 'Etapa 5. Arreglo de 5 Burbujas (Burbuja[])',
      moment: 'instances-arrays',
      objective: 'Construir y recorrer un arreglo de 5 burbujas independientes con un ciclo for en setup() y draw().',
      explanation:
        'Para crear una columna de burbujas en el agua, declaramos "Burbuja[] burbujas = new Burbuja[5];". En setup() usamos un bucle for para crearlas con diámetros y velocidades escalonadas.',
      codeAdditionHighlight: `Burbuja[] burbujas = new Burbuja[5];

void setup() {
  size(500, 350);
  for (int i = 0; i < burbujas.length; i++) {
    burbujas[i] = new Burbuja(random(50, 450), random(250, 340), random(25, 60), random(1.5, 3.5), random(120, 200));
  }
}

void draw() {
  background(15, 30, 60); // Fondo azul marino profundo
  for (int i = 0; i < burbujas.length; i++) {
    burbujas[i].subir();
    burbujas[i].mostrar();
  }
}`,
    },
    {
      id: 'b-stage-6',
      stageNumber: 6,
      title: 'Etapa 6. Reto de Ampliación: Reaparición con if',
      moment: 'free-lab',
      objective: 'Integrar una estructura condicional que detecte cuándo una burbuja sale por arriba y la reinicie abajo.',
      explanation:
        'Cuando una burbuja sube más allá de la parte superior (y < -diametro), desaparece del lienzo. Con una condición if dentro de su método subir() o desde draw(), podemos reiniciarla automáticamente en la parte inferior para lograr un ciclo continuo infinito.',
      codeAdditionHighlight: `// Reto de ampliación con estructura condicional if:
if (y < -diametro) {
  reiniciar(random(50, width - 50), height + diametro);
}`,
      challenge: {
        id: 'b-ch-6',
        question: '¿Por qué la condición para saber si salió por completo es "y < -diametro" en lugar de "y < 0"?',
        options: [
          {
            id: 'opt-1',
            text: 'Porque como el círculo se dibuja desde su centro (y), cuando y = 0 la mitad inferior de la burbuja aún es visible en la pantalla.',
            isCorrect: true,
            feedback: '¡Excelente percepción visual! Al usar -diametro, garantizamos que la burbuja desaparezca por completo antes de reiniciarse abajo.',
          },
          {
            id: 'opt-2',
            text: 'Porque Processing no permite números negativos menores a cero.',
            isCorrect: false,
            feedback: 'Processing permite cualquier número negativo en coordenadas float.',
          },
          {
            id: 'opt-3',
            text: 'Porque el diámetro siempre debe ser mayor a la posición.',
            isCorrect: false,
            feedback: 'No tiene relación con la posición.',
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
      id: 'b-stage-7',
      stageNumber: 7,
      title: 'Etapa 7. Laboratorio Libre de Burbujas',
      moment: 'free-lab',
      objective: 'Experimentar libremente con las 5 burbujas, explorar sus métodos, consultar el historial y descargar el archivo .pde.',
      explanation:
        'Has dominado la transferencia de conceptos de POO a una nueva clase. Experimenta con las 5 burbujas, perturba sus trayectorias, cambia sus transparencias y descarga tu sketch completo de Processing Java.',
    },
  ],
};
