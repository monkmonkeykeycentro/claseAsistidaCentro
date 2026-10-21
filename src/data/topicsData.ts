export interface TopicConcept {
  id: string;
  title: string;
  summary: string;
  explanation: string;
  codeSnippet: string;
  didacticTip: string;
  commonMistake?: string;
}

export interface TopicItem {
  id: string;
  number: number;
  title: string;
  category: 'Fundamentos' | 'Control y Lógica' | 'Modularidad' | 'Programación Orientada a Objetos';
  badge: string;
  summary: string;
  estimatedTime: string;
  conceptsCount: number;
  hasInteractiveWorkshop: boolean;
  concepts: TopicConcept[];
  quickChallenge?: {
    question: string;
    codeTemplate: string;
    options: Array<{ text: string; isCorrect: boolean; feedback: string }>;
  };
}

export const TOPICS_DATA: TopicItem[] = [
  {
    id: 'canvas',
    number: 1,
    title: 'Lienzo y Ciclo de Vida',
    category: 'Fundamentos',
    badge: 'setup() y draw()',
    summary: 'El motor de ejecución de Processing: inicialización única, bucle continuo a 60 fps y sistema de coordenadas.',
    estimatedTime: '15 min',
    conceptsCount: 3,
    hasInteractiveWorkshop: false,
    concepts: [
      {
        id: 'c-lifecycle',
        title: 'El ciclo setup() y draw()',
        summary: 'setup() se ejecuta una sola vez al arrancar; draw() se repite continuamente en bucle.',
        explanation: 'Processing divide la ejecución gráfica en dos momentos clave: en setup() defines el tamaño de ventana con size() e inicializas datos; en draw() Processing dibuja fotograma a fotograma.',
        codeSnippet: `void setup() {
  size(800, 600); // Se ejecuta una sola vez al inicio
  background(255);
}

void draw() {
  // Se repite 60 veces por segundo
  background(255); // Limpia el fotograma anterior
  fill(0, 102, 153);
  ellipse(mouseX, mouseY, 40, 40);
}`,
        didacticTip: 'Si olvidas llamar a background() dentro de draw(), las formas de los fotogramas anteriores dejarán un rastro en el lienzo.',
        commonMistake: 'Poner size() dentro de draw(): size() SOLO debe invocarse en la primera línea de setup().',
      },
      {
        id: 'c-coordinates',
        title: 'Sistema de Coordenadas Cartesiano',
        summary: 'El origen (0, 0) está en la esquina superior izquierda. X crece a la derecha; Y crece hacia abajo.',
        explanation: 'A diferencia de las matemáticas tradicionales donde Y crece hacia arriba, en las pantallas digitales el eje Y desciende. El límite inferior derecho es (width, height).',
        codeSnippet: `void setup() {
  size(400, 400);
}

void draw() {
  background(240);
  // Centro exacto del lienzo usando variables del sistema:
  ellipse(width / 2, height / 2, 50, 50);
}`,
        didacticTip: 'Usa siempre width y height en lugar de números duros para que tu dibujo se adapte a cualquier tamaño de ventana.',
      },
      {
        id: 'c-primitives',
        title: 'Primitivas 2D y Color',
        summary: 'Líneas, rectángulos, elipses y control de relleno (fill) y contorno (stroke).',
        explanation: 'En Processing las funciones de estilo como fill() y stroke() actúan como "levantar una brocha": afectan a todas las figuras que se dibujen después de la llamada hasta que se cambie el color.',
        codeSnippet: `void setup() {
  size(300, 300);
  noStroke(); // Sin contorno
}

void draw() {
  background(255);
  fill(226, 102, 26); // Naranja Processing
  rect(50, 50, 100, 60);

  fill(0, 102, 153); // Azul Processing
  circle(200, 200, 70);
}`,
        didacticTip: 'El orden de las instrucciones importa: rect(x, y, w, h) dibuja por defecto desde la esquina superior izquierda.',
      },
    ],
    quickChallenge: {
      question: '¿Por qué size(600, 400) se debe colocar dentro de void setup() y no en void draw()?',
      codeTemplate: 'void setup() {\n  size(600, 400);\n}',
      options: [
        {
          text: 'Porque la ventana debe configurarse una sola vez al iniciar el sketch.',
          isCorrect: true,
          feedback: '¡Exacto! El tamaño de la ventana gráfica es estático y no puede reinicializarse en cada fotograma.',
        },
        {
          text: 'Porque draw() solo acepta funciones que dibujan colores.',
          isCorrect: false,
          feedback: 'Incorrecto. draw() acepta cualquier instrucción de Java, pero redimensionar la ventana en cada fotograma bloquearía el motor.',
        },
      ],
    },
  },
  {
    id: 'variables',
    number: 2,
    title: 'Variables y Tipos de Datos',
    category: 'Fundamentos',
    badge: 'int, float, boolean, String',
    summary: 'Contenedores de memoria fuertemente tipados en Java: almacenar números, estados lógicos y cadenas de texto.',
    estimatedTime: '20 min',
    conceptsCount: 3,
    hasInteractiveWorkshop: false,
    concepts: [
      {
        id: 'v-primitives',
        title: 'Tipos Primitivos en Processing',
        summary: 'int para enteros, float para decimales con precisión continua, boolean para verdadero/falso.',
        explanation: 'Java exige especificar el tipo de dato al declarar una variable. En programación creativa, float es esencial para animaciones fluidas y cálculos de velocidad o trigonometría.',
        codeSnippet: `int vidas = 9;
float posicionX = 120.5;
float velocidad = 3.2;
boolean estaActivo = true;
String nombre = "Michi";

void setup() {
  size(400, 200);
}

void draw() {
  background(255);
  posicionX += velocidad; // Movimiento continuo
  println(nombre + " vidas: " + vidas);
}`,
        didacticTip: 'Si sumas o divides enteros (int), Java truncará los decimales (5 / 2 = 2). Si necesitas decimales usa float (5.0 / 2.0 = 2.5).',
      },
      {
        id: 'v-scope',
        title: 'Alcance de Variables (Scope Global vs Local)',
        summary: 'Las variables globales viven fuera de las funciones y persisten entre fotogramas; las locales mueren al cerrar la llave }.',
        explanation: 'Si declaras una variable dentro de draw(), se reiniciará a su valor inicial en cada fotograma. Para animar un valor acumulativo, la variable DEBE ser global (declarada arriba de setup).',
        codeSnippet: `// Variable GLOBAL: persiste entre fotogramas
float x = 0;

void setup() {
  size(400, 200);
}

void draw() {
  background(255);
  // Variable LOCAL: solo vive dentro de este fotograma
  float diametro = 30;
  
  ellipse(x, 100, diametro, diametro);
  x += 2; // Incrementa en cada fotograma
}`,
        didacticTip: 'Si declaras "float x = 0;" dentro de draw(), tu figura nunca se moverá porque se reiniciará 60 veces por segundo.',
      },
      {
        id: 'v-color',
        title: 'El tipo de dato color en Processing',
        summary: 'Processing introduce el tipo nativo color para manejar canales RGBA (Rojo, Verde, Azul, Alfa).',
        explanation: 'Puedes guardar un color en una variable usando la función color(r, g, b) o color(r, g, b, alpha) para transparencias.',
        codeSnippet: `color fondo = color(245, 245, 248);
color pelaje = color(226, 102, 26); // Naranja

void setup() {
  size(300, 300);
}

void draw() {
  background(fondo);
  fill(pelaje);
  circle(width / 2, height / 2, 80);
}`,
        didacticTip: 'El valor de alpha va de 0 (completamente transparente) a 255 (totalmente opaco).',
      },
    ],
    quickChallenge: {
      question: '¿Qué tipo de dato usarías para la posición de un personaje que debe moverse a 1.5 píxeles por fotograma?',
      codeTemplate: '___ posX = 100.0;\nposX += 1.5;',
      options: [
        {
          text: 'float, porque permite números con decimales necesarios para velocidades fraccionarias.',
          isCorrect: true,
          feedback: '¡Exacto! int solo almacena números enteros y redondearía o descartaría los decimales.',
        },
        {
          text: 'int, porque las pantallas solo tienen píxeles enteros.',
          isCorrect: false,
          feedback: 'Aunque los píxeles sean discretos, la simulación física necesita float para acumular velocidades fraccionarias suavemente.',
        },
      ],
    },
  },
  {
    id: 'conditionals',
    number: 3,
    title: 'Condicionales y Lógica',
    category: 'Control y Lógica',
    badge: 'if, else, boolean',
    summary: 'Toma de decisiones en el código: detectar colisiones, rebotar en bordes e interactuar con el mouse.',
    estimatedTime: '20 min',
    conceptsCount: 2,
    hasInteractiveWorkshop: false,
    concepts: [
      {
        id: 'cond-bounce',
        title: 'El algoritmo de rebote',
        summary: 'Invertir la dirección cuando la coordenada sobrepasa los límites de la ventana.',
        explanation: 'Al multiplicar la velocidad por -1 cuando la posición supera width o 0, el movimiento cambia de sentido.',
        codeSnippet: `float x = 200;
float velocidad = 4;
float radio = 20;

void setup() {
  size(400, 200);
}

void draw() {
  background(255);
  x += velocidad;

  // Si toca el borde derecho o el izquierdo:
  if (x > width - radio || x < radio) {
    velocidad = velocidad * -1; // Invierte el sentido
  }

  fill(0, 102, 153);
  circle(x, 100, radio * 2);
}`,
        didacticTip: 'El operador || significa O lógico. Basta con que una de las dos condiciones sea verdadera para ejecutar el bloque.',
      },
      {
        id: 'cond-mouse',
        title: 'Interacción con el mouse',
        summary: 'La variable booleana del sistema mousePressed indica si el usuario mantiene pulsado el botón.',
        explanation: 'Puedes usar condicionales para alterar el color, tamaño o estado de los objetos según la interacción del usuario.',
        codeSnippet: `void setup() {
  size(300, 300);
}

void draw() {
  background(240);

  if (mousePressed) {
    fill(226, 102, 26); // Si se hace clic: naranja
  } else {
    fill(0, 102, 153);   // En reposo: azul
  }

  circle(mouseX, mouseY, 60);
}`,
        didacticTip: 'En Java, la comparación de igualdad se escribe con doble igual (==); un solo igual (=) es para asignar valores.',
      },
    ],
  },
  {
    id: 'loops',
    number: 4,
    title: 'Bucles y Grillas Repetitivas',
    category: 'Control y Lógica',
    badge: 'for (int i = 0...)',
    summary: 'Repetición algorítmica: dibujar cientos de elementos, generar patrones visuales y grillas 2D.',
    estimatedTime: '20 min',
    conceptsCount: 2,
    hasInteractiveWorkshop: false,
    concepts: [
      {
        id: 'loop-line',
        title: 'Estructura del bucle for',
        summary: 'Inicialización, condición de continuación e incremento en una sola línea compacta.',
        explanation: 'El bucle for repite un bloque de código modificando un índice i en cada paso.',
        codeSnippet: `void setup() {
  size(500, 150);
}

void draw() {
  background(255);
  fill(0, 102, 153);

  // Dibuja 10 círculos espaciados uniformemente
  for (int i = 0; i < 10; i++) {
    float x = 50 + i * 45;
    circle(x, height / 2, 25);
  }
}`,
        didacticTip: 'i * 45 calcula la distancia entre cada círculo; es la base de todo espaciado procedimental.',
      },
      {
        id: 'loop-grid',
        title: 'Grillas bidimensionales (Bucles anidados)',
        summary: 'Un bucle for para las filas (Y) dentro de otro bucle for para las columnas (X).',
        explanation: 'Combinar dos bucles genera automáticamente una matriz de coordenadas cartesianas para patrones textiles o mapas.',
        codeSnippet: `void setup() {
  size(300, 300);
}

void draw() {
  background(255);

  for (int x = 20; x < width; x += 30) {
    for (int y = 20; y < height; y += 30) {
      fill(226, 102, 26);
      rect(x, y, 15, 15);
    }
  }
}`,
        didacticTip: 'El bucle interior (y) completa toda su columna antes de que el bucle exterior (x) avance al siguiente paso.',
      },
    ],
  },
  {
    id: 'functions',
    number: 5,
    title: 'Funciones y Modularidad',
    category: 'Modularidad',
    badge: 'void miFuncion(int param)',
    summary: 'Dividir programas grandes en bloques nombrados y reutilizables con parámetros y tipos de retorno.',
    estimatedTime: '25 min',
    conceptsCount: 2,
    hasInteractiveWorkshop: false,
    concepts: [
      {
        id: 'func-void',
        title: 'Definición de funciones con void',
        summary: 'void indica que la función ejecuta una tarea o dibujo pero no devuelve ningún valor numérico o texto.',
        explanation: 'Las funciones permiten encapsular dibujos complejos en una sola palabra que puedes llamar cuantas veces quieras pasándole parámetros de posición.',
        codeSnippet: `void setup() {
  size(400, 200);
}

void draw() {
  background(255);
  // Reutilizamos la función en dos posiciones distintas:
  dibujarCasa(50, 120);
  dibujarCasa(220, 120);
}

// Función personalizada con parámetros
void dibujarCasa(float x, float y) {
  fill(200);
  rect(x, y, 60, 50); // Pared
  fill(226, 102, 26);
  triangle(x, y, x + 30, y - 30, x + 60, y); // Techo
}`,
        didacticTip: 'Nombrar tus funciones con verbos descriptivos (dibujarCasa, calcularDistancia) hace que tu código sea legible por sí mismo.',
      },
      {
        id: 'func-return',
        title: 'Funciones que retornan valores',
        summary: 'Si una función calcula un resultado, sustituye void por el tipo de dato que devuelve (float, int, etc.).',
        explanation: 'Usa la palabra return para enviar el resultado de vuelta a quien llamó la función.',
        codeSnippet: `void setup() {
  size(200, 200);
  float precioFinal = aplicarDescuento(100.0, 0.15);
  println("Precio con descuento: " + precioFinal);
}

float aplicarDescuento(float precio, float tasa) {
  float ahorro = precio * tasa;
  return precio - ahorro; // Devuelve un float
}`,
        didacticTip: 'Si declaras que una función retorna float, estás obligado por Java a tener al menos una instrucción "return <valor>;".',
      },
    ],
  },
  {
    id: 'classes',
    number: 6,
    title: 'Programación Orientada a Objetos: Anatomía de una Clase',
    category: 'Programación Orientada a Objetos',
    badge: 'Módulo interactivo completo',
    summary: 'Estructura canónica de una clase: Campos (estado), Constructor (inicialización), Métodos (comportamiento) e instanciación con new.',
    estimatedTime: '45 min',
    conceptsCount: 4,
    hasInteractiveWorkshop: true, // The 4 interactive stages of our app!
    concepts: [
      {
        id: 'cls-canon',
        title: 'Los 3 bloques internos de una clase',
        summary: 'Campos arriba, constructor en medio y métodos al final.',
        explanation: 'Una clase es un molde o plantilla. Dentro de sus llaves { } se agrupan ordenadamente las variables (campos), la función de nacimiento (constructor) y las acciones (métodos).',
        codeSnippet: `class Gato {
  // 1. CAMPOS (Atributos)
  String nombre;
  float x, y;

  // 2. CONSTRUCTOR (Mismo nombre de la clase, sin void)
  Gato(String nombreTemp, float xTemp, float yTemp) {
    nombre = nombreTemp;
    x = xTemp;
    y = yTemp;
  }

  // 3. MÉTODOS (Comportamiento con void o tipo de retorno)
  void dibujar() {
    fill(226, 102, 26);
    circle(x, y, 40);
  }
}`,
        didacticTip: 'El constructor NUNCA lleva tipo de retorno, ni siquiera void. Si le pones void, Java creerá que es un método ordinario y no lo usará como constructor.',
      },
      {
        id: 'cls-new',
        title: 'Instanciación en el sketch con new',
        summary: 'Declarar la variable del tipo de la clase y llamar al constructor con la palabra reservada new.',
        explanation: 'Tener la clase Gato escrita en una pestaña no dibuja nada por sí sola. En el sketch principal debes crear un objeto concreto usando new Gato(...) en setup() y llamar a sus métodos en draw().',
        codeSnippet: `Gato miGato; // 1. Declarar variable objeto

void setup() {
  size(400, 400);
  // 2. Instanciar en memoria con 'new' y argumentos
  miGato = new Gato("Michi", 200, 200);
}

void draw() {
  background(255);
  // 3. Invocar método mediante operador punto (.)
  miGato.dibujar();
}`,
        didacticTip: 'El orden y tipo de los argumentos en "new Gato("Michi", 200, 200)" debe coincidir exactamente con los parámetros del constructor.',
      },
    ],
  },
  {
    id: 'object-arrays',
    number: 7,
    title: 'Arreglos y Colecciones de Objetos',
    category: 'Programación Orientada a Objetos',
    badge: 'Gato[] y ArrayList<Gato>',
    summary: 'Gestión masiva de instancias: reserva en memoria, inicialización canónica en bucle, el error de NullPointerException y sistemas dinámicos con ArrayList.',
    estimatedTime: '35 min',
    conceptsCount: 4,
    hasInteractiveWorkshop: true,
    concepts: [
      {
        id: 'oa-scale',
        title: '1. El problema de escala: de 1 a N objetos',
        summary: 'Por qué declarar gato1, gato2, gato3... no escala y cómo un arreglo agrupa referencias bajo un solo nombre.',
        explanation: 'En el módulo anterior creamos un solo objeto con "Gato miGato = new Gato(...)". Pero en el diseño generativo queremos simular 20, 100 o 1,000 entidades. Un arreglo de objetos (Gato[]) permite tratar a todo un conjunto de criaturas como una sola entidad indexada de [0] a [N-1].',
        codeSnippet: `// ❌ NO ESCALA: Declarar variables individuales
// Gato gato1, gato2, gato3, gato4, gato5;

// ✅ ESCALA: Un arreglo homogéneo de referencias a Gato
Gato[] camada = new Gato[60]; // 60 ranuras reservadas en memoria`,
        didacticTip: 'El corchete [] después del tipo de dato (Gato[]) le indica a Java que no estás creando un gato, sino un contenedor de gatos.',
        commonMistake: 'Confundir el tamaño total del arreglo con el último índice: si el tamaño es 60, los índices van de 0 a 59 (camada[60] lanzará ArrayIndexOutOfBoundsException).',
      },
      {
        id: 'oa-npe',
        title: '2. Anatomía en Memoria y el temido NullPointerException',
        summary: 'new Gato[N] solo reserva casillas vacías (null); debes instanciar cada casilla individualmente.',
        explanation: 'El error más común en Processing ocurre al declarar "Gato[] camada = new Gato[10];" e inmediatamente intentar llamar a "camada[0].dibujar();". El programa colapsa con "NullPointerException" porque la casilla [0] está vacía (apunta a null). Para que exista un gato real, debes ejecutar "camada[0] = new Gato(...)".',
        codeSnippet: `Gato[] camada = new Gato[5]; // Las 5 casillas contienen 'null'

void setup() {
  size(400, 300);
  
  // ⚠️ ERROR CLÁSICO:
  // camada[0].dibujar(); // ¡Lanza NullPointerException!

  // ✅ SOLUCIÓN: Construir el objeto antes de usarlo
  camada[0] = new Gato("Michi Alfa", 100, 150);
  camada[0].dibujar(); // ¡Ahora sí funciona!
}`,
        didacticTip: 'Piensa en el arreglo como un casillero de estacionamiento: "new Gato[10]" construye los 10 cajones vacíos. "new Gato(...)" estaciona el automóvil en cada cajón.',
        commonMistake: 'Olvidar el bucle for en setup() que rellena cada casilla con un new Gato(...).',
      },
      {
        id: 'oa-loop',
        title: '3. El Bucle Canónico de Dos Tiempos (setup y draw)',
        summary: 'Tiempo 1 en setup() para instanciar con new; Tiempo 2 en draw() para actualizar y dibujar en bucle.',
        explanation: 'El patrón arquitectónico universal en Processing para arreglos de objetos consta de dos bucles for idénticos: el primero en setup() usa "camada[i] = new Gato(...)" para dar vida a cada elemento. El segundo en draw() usa "camada[i].actualizar(); camada[i].dibujar();" en cada fotograma.',
        codeSnippet: `Gato[] camada = new Gato[40];

void setup() {
  size(600, 400);
  // TIEMPO 1: Inicialización masiva en bucle
  for (int i = 0; i < camada.length; i++) {
    camada[i] = new Gato("Gato" + i, random(width), random(height));
  }
}

void draw() {
  background(255);
  // TIEMPO 2: Actualización y render continuo
  for (int i = 0; i < camada.length; i++) {
    camada[i].mover();
    camada[i].dibujar();
  }
}`,
        didacticTip: 'Usa siempre "camada.length" (sin paréntesis) para la condición del bucle for. Así, si luego cambias el tamaño de 40 a 200, todo tu código se adaptará automáticamente.',
        commonMistake: 'Escribir "camada.length()" con paréntesis. En Java, los arreglos nativos usan la propiedad .length sin paréntesis; las cadenas String usan .length().',
      },
      {
        id: 'oa-arraylist',
        title: '4. Colecciones Dinámicas con ArrayList<Gato>',
        summary: 'Para sistemas de partículas o entidades que nacen y mueren continuamente, ArrayList permite crecer y decrecer.',
        explanation: 'Los arreglos normales Gato[] tienen un tamaño estático que no puede cambiar. Si un usuario hace clic para crear gatos o las partículas desaparecen al envejecer, usamos ArrayList<Gato>. Sus métodos clave son: .add(nuevoObjeto), .get(i) para leer, .size() para saber cuántos hay, y .remove(i) para eliminar.',
        codeSnippet: `ArrayList<Gato> gatos = new ArrayList<Gato>();

void setup() {
  size(600, 400);
}

void draw() {
  background(255);
  // Recorrido inverso seguro para poder remover sin saltar índices:
  for (int i = gatos.size() - 1; i >= 0; i--) {
    Gato g = gatos.get(i);
    g.mover();
    g.dibujar();
    
    // Si el gato sale de la pantalla o expira, se elimina:
    if (g.haMuerto()) {
      gatos.remove(i);
    }
  }
}

void mousePressed() {
  // Cada clic añade un nuevo gato en el puntero del mouse:
  gatos.add(new Gato("Gatito", mouseX, mouseY));
}`,
        didacticTip: 'Cuando elimines elementos con .remove(i) dentro de un bucle for, SIEMPRE recorre la lista de atrás hacia adelante (i = gatos.size() - 1; i >= 0; i--). Si recorres hacia adelante, al borrar un elemento los siguientes se desplazan y el bucle se saltará uno.',
        commonMistake: 'Intentar acceder con corchetes "gatos[i]" a un ArrayList. En ArrayList debes usar siempre el método "gatos.get(i)".',
      },
    ],
    quickChallenge: {
      question: 'Si ejecutas "Gato[] lista = new Gato[10];" y en la siguiente línea ejecutas "lista[0].dibujar();", ¿qué sucederá?',
      codeTemplate: 'Gato[] lista = new Gato[10];\nlista[0].dibujar(); // ???',
      options: [
        {
          text: 'Ocurrirá un NullPointerException porque solo se reservó el espacio, pero no se ha creado ningún Gato con "new".',
          isCorrect: true,
          feedback: '¡Exacto! "new Gato[10]" solo crea 10 casillas que contienen "null". Debes hacer "lista[0] = new Gato(...);" antes de llamar a sus métodos.',
        },
        {
          text: 'Se dibujará un gato con valores por defecto (0, 0, color negro).',
          isCorrect: false,
          feedback: 'Incorrecto. Java no crea objetos automáticamente en arreglos de clases; la casilla permanece en "null" hasta que tú llames explícitamente al constructor.',
        },
        {
          text: 'Dará un error de compilación porque los arreglos solo pueden almacenar números (int y float).',
          isCorrect: false,
          feedback: 'Incorrecto. Los arreglos en Java pueden almacenar cualquier tipo de dato, incluyendo objetos de clases que tú mismo hayas definido.',
        },
      ],
    },
  },
];
