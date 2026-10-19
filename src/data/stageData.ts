import {
  SectionExploration,
  CardItem,
  SyntaxExercise,
  BuilderState,
} from '../types/classStructure';

export const ETAPA1_SECTIONS: SectionExploration[] = [
  {
    id: 'declaration',
    title: '1. Declaración de la clase',
    badge: 'Cabecera',
    color: 'emerald',
    whatItIs: 'Define el molde o plantilla a partir del cual se podrán crear múltiples objetos o instancias en Processing.',
    howToWrite: 'Se escribe con la palabra reservada `class` seguida del nombre de la clase (en mayúscula inicial por convención PascalCase) y una llave de apertura `{`.',
    whatItContains: [
      'Palabra clave `class`',
      'Nombre de la clase (ej. `Gato`)',
      'Llave de apertura `{` que engloba todo el contenido',
    ],
    example: 'class Gato {\n  // Todo el cuerpo de la clase va aquí dentro\n}',
    pedagogicalNote: 'En Processing Java, la convención de estilo es usar mayúscula inicial para el nombre de las clases (ej. Gato, Pelota, Particula).',
  },
  {
    id: 'fields',
    title: '2. Campos o atributos',
    badge: 'Estado / Variables',
    color: 'sky',
    whatItIs: 'Son las variables que describen las propiedades, datos o el estado de cada objeto (por ejemplo: su nombre, su posición en el lienzo x, y, su color, etc.).',
    howToWrite: 'Se escribe el tipo de dato seguido del nombre del atributo y termina obligatoriamente con punto y coma `;`.',
    whatItContains: [
      'Tipo de dato (`String`, `int`, `float`, `boolean`, `color`)',
      'Nombre descriptivo del atributo en minúscula o camelCase (ej. `nombre`, `x`, `y`)',
      'Punto y coma `;` final',
    ],
    example: 'String nombre;\nint x;\nint y;',
    pedagogicalNote: 'Pertenecen a cada instancia del objeto; cada gato tendrá su propio nombre y sus propias coordenadas en pantalla.',
  },
  {
    id: 'constructor',
    title: '3. Constructor',
    badge: 'Inicializador',
    color: 'amber',
    whatItIs: 'Es una función especial que se ejecuta automáticamente al crear un nuevo objeto con la instrucción `new`. Su misión principal es inicializar los atributos con valores iniciales.',
    howToWrite: 'Lleva EXACTAMENTE el mismo nombre que la clase. NO lleva ningún tipo de retorno (¡nunca lleva `void` ni `int`!), recibe parámetros entre paréntesis y su cuerpo va entre llaves `{}`.',
    whatItContains: [
      'Mismo nombre que la clase (ej. `Gato`)',
      'Lista de parámetros temporales entre paréntesis `(...)` que reciben los valores iniciales',
      'Asignaciones de los parámetros a los atributos (ej. `nombre = nombreTemp;`)',
      'Cuerpo delimitado por llaves `{}`',
    ],
    example: 'Gato(String nombreTemp, int xTemp, int yTemp) {\n  nombre = nombreTemp;\n  x = xTemp;\n  y = yTemp;\n}',
    pedagogicalNote: 'Regla de oro: El constructor NUNCA lleva tipo de retorno, ni siquiera void. Si le pones void, Java creerá que es un método ordinario y no un constructor.',
  },
  {
    id: 'methods',
    title: '4. Declaración de métodos',
    badge: 'Comportamiento / Funciones',
    color: 'purple',
    whatItIs: 'Son las acciones, habilidades o comportamientos que los objetos saben realizar (por ejemplo: dibujarse en pantalla, caminar, maullar, saltar).',
    howToWrite: 'Se declara el tipo de retorno (en Processing muy comúnmente `void` cuando ejecutan una acción sin retornar un resultado matemático), el nombre del método, los paréntesis de parámetros y el cuerpo entre llaves `{}`.',
    whatItContains: [
      'Tipo de retorno (`void` si solo ejecuta una acción gráfica o de cálculo)',
      'Nombre del método en minúscula inicial / camelCase (ej. `dibujar`, `caminar`)',
      'Paréntesis `()` con o sin parámetros',
      'Cuerpo con las instrucciones del método entre llaves `{}`',
    ],
    example: 'void dibujar() {\n  // Aquí se escribirían las instrucciones para dibujar.\n}\n\nvoid caminar(int pasoX, int pasoY) {\n  // Aquí se escribirían las instrucciones para caminar.\n}',
    pedagogicalNote: 'En este nivel educativo nos enfocamos en su estructura de declaración: no ejecutamos animación para concentrarnos en la sintaxis limpia.',
  },
  {
    id: 'braces',
    title: 'Llaves, paréntesis y signos delimitadores',
    badge: 'Sintaxis estructural',
    color: 'rose',
    whatItIs: 'Los signos de puntuación estructuran el código: las llaves `{}` abren y cierran bloques, los paréntesis `()` agrupan listas de parámetros y los puntos y coma `;` terminan sentencias individuales.',
    howToWrite: 'Toda llave `{` que se abre DEBE cerrarse con `}`. Todo paréntesis `(` debe cerrarse con `)`.',
    whatItContains: [
      'Llave `{`: Abre el cuerpo de la clase, del constructor o del método',
      'Llave `}`: Cierra el cuerpo correspondiente',
      'Punto y coma `;`: Termina declaraciones de campos y asignaciones internas',
      '¡Atención!: Las líneas de cabecera (`class Gato`, `void dibujar()`) NO llevan `;`',
    ],
    example: 'class Gato {\n  // Bloque general\n  void dibujar() {\n    // Bloque interno de método\n  }\n} // Cierre definitivo de la clase',
    pedagogicalNote: 'Un error muy frecuente en principiantes es poner punto y coma después de `class Gato;` o después de `void dibujar();`. Las cabeceras abren bloques con `{`, no terminan con `;`.',
  },
];

export const ORGANIZATIONAL_DIDACTIC_NOTE = {
  title: '¿El orden de las partes es obligatorio en Java?',
  content: 'En Java y Processing, el compilador permite técnicamente escribir los métodos antes de los campos o el constructor. Sin embargo, el orden:\n\n1. Campos o atributos\n2. Constructor\n3. Métodos\n\nes una convención didáctica y profesional universal. Organizar así el código permite a cualquier programador saber de inmediato de qué datos se compone el objeto (campos), cómo nace (constructor) y qué sabe hacer (métodos).',
};

export const ETAPA2_CARDS: CardItem[] = [
  {
    id: 'card-fields',
    name: 'Atributos (nombre, x, y)',
    correctZone: 'fields',
    previewNote: 'Variables que almacenan el estado del gato',
    code: `String nombre;
int x;
int y;`,
    tokens: [
      {
        id: 't-str-type',
        text: 'String',
        type: 'type',
        label: 'Tipo de dato',
        explanation: 'String representa cadenas de texto alfanumérico (ej. "Michi").',
      },
      {
        id: 't-nom-field',
        text: 'nombre',
        type: 'field-name',
        label: 'Nombre de atributo',
        explanation: 'Identificador del campo donde se almacenará el nombre del gato.',
      },
      {
        id: 't-semi-1',
        text: ';',
        type: 'punctuation',
        label: 'Punto y coma',
        explanation: 'Termina la declaración de esta variable en Java/Processing.',
      },
      {
        id: 't-int-type1',
        text: 'int',
        type: 'type',
        label: 'Tipo de dato',
        explanation: 'int representa números enteros para coordenadas en píxeles.',
      },
      {
        id: 't-x-field',
        text: 'x',
        type: 'field-name',
        label: 'Nombre de atributo',
        explanation: 'Coordenada horizontal de la posición del gato.',
      },
      {
        id: 't-int-type2',
        text: 'int',
        type: 'type',
        label: 'Tipo de dato',
        explanation: 'int representa números enteros.',
      },
      {
        id: 't-y-field',
        text: 'y',
        type: 'field-name',
        label: 'Nombre de atributo',
        explanation: 'Coordenada vertical de la posición del gato.',
      },
    ],
  },
  {
    id: 'card-constructor',
    name: 'Constructor Gato(...)',
    correctZone: 'constructor',
    previewNote: 'Inicializa los atributos con los parámetros recibidos',
    code: `Gato(String nombreTemp, int xTemp, int yTemp) {
  nombre = nombreTemp;
  x = xTemp;
  y = yTemp;
}`,
    tokens: [
      {
        id: 't-c-name',
        text: 'Gato',
        type: 'constructor-name',
        label: 'Nombre del constructor',
        explanation: 'Coincide exactamente con el nombre de la clase. Nota: NO lleva tipo de retorno, tampoco void.',
        relationGroup: 'class-match',
      },
      {
        id: 't-c-param1-type',
        text: 'String',
        type: 'param-type',
        label: 'Tipo de parámetro',
        explanation: 'Tipo de dato del primer valor temporal que recibirá el constructor.',
      },
      {
        id: 't-c-param1-name',
        text: 'nombreTemp',
        type: 'param-name',
        label: 'Nombre de parámetro',
        explanation: 'Variable temporal que contiene el dato entrante para asignarlo a nombre.',
        relationGroup: 'assign-nombre',
      },
      {
        id: 't-c-brace-open',
        text: '{',
        type: 'brace',
        label: 'Llave de apertura',
        explanation: 'Inicia el cuerpo del constructor.',
      },
      {
        id: 't-c-attr1',
        text: 'nombre',
        type: 'field-name',
        label: 'Atributo destino',
        explanation: 'El atributo del objeto que recibirá el valor.',
        relationGroup: 'assign-nombre',
      },
      {
        id: 't-c-op1',
        text: '=',
        type: 'operator',
        label: 'Operador de asignación',
        explanation: 'Asigna el valor de la derecha (nombreTemp) a la variable de la izquierda (nombre).',
        relationGroup: 'assign-nombre',
      },
      {
        id: 't-c-val1',
        text: 'nombreTemp',
        type: 'param-name',
        label: 'Parámetro origen',
        explanation: 'Valor temporal recibido al instanciar el gato.',
        relationGroup: 'assign-nombre',
      },
      {
        id: 't-c-brace-close',
        text: '}',
        type: 'brace',
        label: 'Llave de cierre',
        explanation: 'Termina el cuerpo del constructor.',
      },
    ],
  },
  {
    id: 'card-method-dibujar',
    name: 'Método dibujar()',
    correctZone: 'methods',
    previewNote: 'Acción para dibujar al gato en el lienzo',
    code: `void dibujar() {
  // Aquí se escribirían las instrucciones para dibujar.
}`,
    tokens: [
      {
        id: 't-md-void',
        text: 'void',
        type: 'return-type',
        label: 'Tipo de retorno void',
        explanation: 'Indica que este método ejecuta una acción pero no devuelve ningún valor al invocarse.',
      },
      {
        id: 't-md-name',
        text: 'dibujar',
        type: 'method-name',
        label: 'Nombre del método',
        explanation: 'Identificador de la acción en camelCase.',
      },
      {
        id: 't-md-parens',
        text: '()',
        type: 'punctuation',
        label: 'Lista de parámetros',
        explanation: 'Paréntesis vacíos: este método no necesita datos adicionales para ejecutarse.',
      },
      {
        id: 't-md-braces',
        text: '{ ... }',
        type: 'brace',
        label: 'Cuerpo delimitado por llaves',
        explanation: 'Las llaves contienen las instrucciones que se ejecutan cuando se llama a gato.dibujar().',
      },
    ],
  },
  {
    id: 'card-method-caminar',
    name: 'Método caminar(int pasoX, int pasoY)',
    correctZone: 'methods',
    previewNote: 'Acción con parámetros para desplazar al gato',
    code: `void caminar(int pasoX, int pasoY) {
  // Aquí se escribirían las instrucciones para caminar.
}`,
    tokens: [
      {
        id: 't-mc-void',
        text: 'void',
        type: 'return-type',
        label: 'Tipo de retorno void',
        explanation: 'No retorna ningún valor numérico ni de texto.',
      },
      {
        id: 't-mc-name',
        text: 'caminar',
        type: 'method-name',
        label: 'Nombre del método',
        explanation: 'Acción de desplazamiento.',
      },
      {
        id: 't-mc-p1-type',
        text: 'int',
        type: 'param-type',
        label: 'Tipo de primer parámetro',
        explanation: 'pasoX es un número entero.',
      },
      {
        id: 't-mc-p1-name',
        text: 'pasoX',
        type: 'param-name',
        label: 'Nombre de parámetro',
        explanation: 'Cantidad de píxeles a avanzar en el eje X.',
      },
      {
        id: 't-mc-comma',
        text: ',',
        type: 'punctuation',
        label: 'Coma separadora',
        explanation: 'Separa los múltiples parámetros dentro de los paréntesis.',
      },
      {
        id: 't-mc-p2-type',
        text: 'int',
        type: 'param-type',
        label: 'Tipo de segundo parámetro',
        explanation: 'pasoY es un número entero.',
      },
      {
        id: 't-mc-p2-name',
        text: 'pasoY',
        type: 'param-name',
        label: 'Nombre de parámetro',
        explanation: 'Cantidad de píxeles a avanzar en el eje Y.',
      },
      {
        id: 't-mc-braces',
        text: '{ ... }',
        type: 'brace',
        label: 'Cuerpo delimitado por llaves',
        explanation: 'Delimita el conjunto de instrucciones del método.',
      },
    ],
  },
];

export const ETAPA3_EXERCISES: SyntaxExercise[] = [
  {
    id: 'ex-a-class',
    title: 'Ejercicio A: Declarar la clase',
    category: 'declaracion',
    badge: 'Palabra clave',
    prompt: 'Completa la palabra clave de Java para declarar una nueva clase:',
    codeSnippet: '___ Gato {\n}',
    blanks: [
      {
        id: 'blank-class',
        expected: ['class'],
        label: 'Palabra clave',
        placeholder: 'Escribe aquí...',
        hint: 'Es la palabra en minúsculas reservada en Java para definir un tipo u objeto.',
        explanation: '`class` le dice a Java que todo el bloque siguiente definirá la estructura y comportamiento de los objetos de tipo Gato.',
      },
    ],
    signRoleExplanation: '`class` es una palabra reservada en minúsculas. Nota que la cabecera `class Gato` NO lleva punto y coma porque abre un bloque delimitado por `{`.',
    counterConceptNote: 'Nunca pongas `class Gato;`. En Java, cuando algo abre un bloque con `{`, no lleva punto y coma.',
  },
  {
    id: 'ex-b-attribute',
    title: 'Ejercicio B: Nombre de un atributo',
    category: 'atributos',
    badge: 'Identificador',
    prompt: 'Escribe un nombre válido para el atributo de tipo String (por ejemplo, el nombre, raza o color del gato):',
    codeSnippet: 'String ___;\n',
    blanks: [
      {
        id: 'blank-attr-name',
        expected: ['nombre', 'color', 'raza', 'apodo', 'tipo', 'pelaje'],
        label: 'Nombre del atributo',
        placeholder: 'Escribe un nombre...',
        hint: 'Usa una palabra en minúscula descriptiva (como nombre, color o raza), sin espacios ni caracteres especiales.',
        explanation: 'Los nombres de atributos en Processing usan minúsculas o camelCase (ej. `nombre`, `colorOjos`), son descriptivos y no deben contener espacios ni guiones.',
      },
    ],
    signRoleExplanation: 'La declaración de un campo o atributo SIEMPRE termina con punto y coma `;` porque es una sentencia terminada.',
  },
  {
    id: 'ex-c-constructor',
    title: 'Ejercicio C: Nombre del constructor',
    category: 'constructor',
    badge: 'Coincidencia exacta',
    prompt: '¿Cómo debe llamarse el constructor de la clase Gato?',
    codeSnippet: '___(String nombreTemp) {\n  nombre = nombreTemp;\n}',
    blanks: [
      {
        id: 'blank-constructor-name',
        expected: ['Gato'],
        label: 'Nombre del constructor',
        placeholder: 'Escribe el nombre...',
        hint: 'Regla estricta de Java: El constructor debe llamarse EXACTAMENTE igual que la clase.',
        explanation: 'El constructor de `class Gato` DEBE llamarse `Gato`. Además, nunca lleva tipo de retorno, tampoco `void`.',
        caseSensitive: true,
      },
    ],
    signRoleExplanation: 'Al invocar `new Gato("Michi")`, Java busca una función sin tipo de retorno llamada exactamente `Gato`.',
  },
  {
    id: 'ex-d-params',
    title: 'Ejercicio D: Estructura de un método',
    category: 'parametros',
    badge: 'Método sencillo',
    prompt: 'Completa la estructura para declarar este método sencillo (escribe la palabra que lo encabeza):',
    codeSnippet: '___ dibujar() {\n}',
    blanks: [
      {
        id: 'blank-void',
        expected: ['void'],
        label: 'Estructura del método',
        placeholder: 'Escribe aquí...',
        hint: 'Escribe void para iniciar la declaración del método.',
        explanation: 'En Processing, los métodos sencillos que ejecutan una acción directa como dibujar se estructuran iniciando con void.',
      },
    ],
    signRoleExplanation: 'La estructura básica de un método en Processing comienza con void, seguido del nombre del método y sus paréntesis ().',
    counterConceptNote: 'La cabecera "void dibujar()" abre el cuerpo con llave { y nunca lleva punto y coma al final.',
  },
  {
    id: 'ex-e-assignment',
    title: 'Ejercicio E: Asignación y terminador',
    category: 'asignaciones',
    badge: 'Operador y signo',
    prompt: 'Completa el operador de asignación y el signo que cierra la sentencia:',
    codeSnippet: 'nombre ___ nombreTemp___',
    blanks: [
      {
        id: 'blank-assign-op',
        expected: ['='],
        label: 'Operador',
        placeholder: 'Signo u operador...',
        hint: 'El operador de asignación en Java (un solo signo igual).',
        explanation: 'El operador `=` evalúa la expresión de la derecha (`nombreTemp`) y almacena su valor en la variable de la izquierda (`nombre`).',
      },
      {
        id: 'blank-assign-semi',
        expected: [';'],
        label: 'Terminador',
        placeholder: 'Signo de cierre...',
        hint: 'El signo que finaliza cualquier instrucción o sentencia en Java.',
        explanation: 'El punto y coma `;` le indica al compilador de Processing que la instrucción ha terminado.',
      },
    ],
    signRoleExplanation: 'En Java, `=` es asignación (guardar un valor). La comparación de igualdad utiliza `==`. La instrucción termina con `;`.',
  },
  {
    id: 'ex-f-braces',
    title: 'Ejercicio F: Llaves de apertura y cierre',
    category: 'signos',
    badge: 'Llaves { }',
    prompt: 'Completa los signos que abren y cierran el bloque principal de la clase:',
    codeSnippet: 'class Gato ___\n  // Contenido de la clase\n___',
    blanks: [
      {
        id: 'blank-brace-open',
        expected: ['{'],
        label: 'Apertura',
        placeholder: 'Signo...',
        hint: 'Llave que abre un bloque de código.',
        explanation: 'La llave de apertura `{` marca el comienzo del alcance (scope) de la clase.',
      },
      {
        id: 'blank-brace-close',
        expected: ['}'],
        label: 'Cierre',
        placeholder: 'Signo...',
        hint: 'Llave que cierra un bloque de código.',
        explanation: 'La llave de cierre `}` marca el fin de la clase.',
      },
    ],
    signRoleExplanation: 'Las llaves `{}` delimitan bloques de código. Cada llave abierta DEBE tener su correspondiente llave de cierre.',
  },
  {
    id: 'ex-g-parentheses',
    title: 'Ejercicio G: Paréntesis en declaración de métodos',
    category: 'signos',
    badge: 'Paréntesis ( )',
    prompt: 'Coloca los paréntesis que encierran la lista de parámetros (incluso si está vacía):',
    codeSnippet: 'void dibujar___ ___ {\n  // Instrucciones\n}',
    blanks: [
      {
        id: 'blank-paren-open',
        expected: ['('],
        label: 'Apertura de parámetros',
        placeholder: 'Signo...',
        hint: 'Signo de apertura de parámetros.',
        explanation: '`(` abre la lista de parámetros que recibirá el método.',
      },
      {
        id: 'blank-paren-close',
        expected: [')'],
        label: 'Cierre de parámetros',
        placeholder: 'Signo...',
        hint: 'Signo de cierre de parámetros.',
        explanation: '`)` cierra la lista de parámetros. Si el método no recibe nada, los paréntesis quedan contiguos: `()`',
      },
    ],
    signRoleExplanation: 'Los paréntesis `()` son obligatorios en los métodos y constructores, aún cuando no reciban ningún parámetro.',
  },
  {
    id: 'ex-h-commas',
    title: 'Ejercicio H: Separador entre parámetros',
    category: 'signos',
    badge: 'Coma ,',
    prompt: '¿Qué signo separa múltiples parámetros dentro de los paréntesis?',
    codeSnippet: 'void caminar(int pasoX___ int pasoY) {\n}',
    blanks: [
      {
        id: 'blank-comma',
        expected: [','],
        label: 'Separador',
        placeholder: 'Signo...',
        hint: 'Signo que separa elementos en una lista.',
        explanation: 'La coma `,` separa los parámetros entre sí. El último parámetro nunca lleva coma.',
      },
    ],
    signRoleExplanation: 'La coma `,` se usa para separar elementos de una lista, parámetros de funciones y argumentos al llamar funciones.',
  },
  {
    id: 'ex-i-semicolons',
    title: 'Ejercicio I: Puntos y coma en declaraciones múltiples',
    category: 'signos',
    badge: 'Punto y coma ;',
    prompt: 'Coloca los signos correspondientes al final de cada declaración de atributo:',
    codeSnippet: 'int x___\nint y___',
    blanks: [
      {
        id: 'blank-semi-x',
        expected: [';'],
        label: 'Terminador de x',
        placeholder: 'Signo...',
        hint: 'Punto y coma al final de la sentencia.',
        explanation: 'Finaliza la declaración del atributo `x`.',
      },
      {
        id: 'blank-semi-y',
        expected: [';'],
        label: 'Terminador de y',
        placeholder: 'Signo...',
        hint: 'Punto y coma al final de la sentencia.',
        explanation: 'Finaliza la declaración del atributo `y`.',
      },
    ],
    signRoleExplanation: 'Cada declaración individual de un campo requiere su propio punto y coma `;`. En cambio, las líneas de cabecera que abren llaves no llevan punto y coma.',
    counterConceptNote: 'Recuerda: No todas las líneas llevan punto y coma. Las cabeceras como `class Gato` o `void caminar(...)` abren llaves `{` y NO llevan `;`.',
  },
];

export const INITIAL_BUILDER_STATE: BuilderState = {
  className: 'Gato',
  fields: [
    { id: 'f1', type: 'String', name: 'nombre' },
    { id: 'f2', type: 'int', name: 'x' },
    { id: 'f3', type: 'int', name: 'y' },
  ],
  constructorParams: [
    { id: 'p1', type: 'String', name: 'nombreTemp', targetFieldId: 'f1' },
    { id: 'p2', type: 'int', name: 'xTemp', targetFieldId: 'f2' },
    { id: 'p3', type: 'int', name: 'yTemp', targetFieldId: 'f3' },
  ],
  methods: [
    {
      id: 'm1',
      name: 'dibujar',
      params: [],
      comment: 'Aquí se escribirían las instrucciones para dibujar.',
    },
    {
      id: 'm2',
      name: 'caminar',
      params: [
        { id: 'mp1', type: 'int', name: 'pasoX' },
        { id: 'mp2', type: 'int', name: 'pasoY' },
      ],
      comment: 'Aquí se escribirían las instrucciones para caminar.',
    },
  ],
};

export const REFERENCE_PROCESSING_CODE = `class Gato {
  String nombre;
  int x;
  int y;

  Gato(String nombreTemp, int xTemp, int yTemp) {
    nombre = nombreTemp;
    x = xTemp;
    y = yTemp;
  }

  void dibujar() {
    // Aquí se escribirían las instrucciones para dibujar.
  }

  void caminar(int pasoX, int pasoY) {
    // Aquí se escribirían las instrucciones para caminar.
  }
}`;
