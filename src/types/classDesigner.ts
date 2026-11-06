/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type JavaPrimitiveType = 'int' | 'float' | 'boolean' | 'String' | 'color';

export type FieldInitStrategy = 'constructor-param' | 'default-value' | 'later';

export type MethodRelationType = 'reads' | 'mutates' | 'both';

export interface ClassDesignerField {
  id: string;
  name: string;
  type: JavaPrimitiveType;
  description: string;
  initStrategy: FieldInitStrategy;
  defaultValue?: string;
}

export interface ClassDesignerParam {
  id: string;
  name: string;
  type: JavaPrimitiveType;
  targetFieldId?: string;
  description?: string;
}

export interface ClassDesignerMethodParam {
  id: string;
  name: string;
  type: JavaPrimitiveType;
}

export interface ClassDesignerMethod {
  id: string;
  name: string;
  returnType: 'void' | JavaPrimitiveType;
  description: string;
  params: ClassDesignerMethodParam[];
  relatedFieldIds: string[];
  relationType: MethodRelationType;
}

export interface AbstractionGuidingQuestions {
  realWorldObject: string;       // ¿Qué objeto o fenómeno del mundo real o visual quieres representar?
  definingFeatures: string;      // ¿Cuáles son sus características definitorias (las que siempre posee)?
  changeableFeatures: string;    // ¿Cuáles de esas características pueden cambiar a lo largo del tiempo?
  actionsAndBehaviors: string;   // ¿Qué acciones o comportamientos puede realizar por sí mismo?
}

export interface ClassDesignProject {
  id: string;
  userId?: string;
  projectName: string;
  className: string;
  conceptDescription: string;
  guidingQuestions: AbstractionGuidingQuestions;
  fields: ClassDesignerField[];
  constructorParams: ClassDesignerParam[];
  methods: ClassDesignerMethod[];
  createdAt: string;
  updatedAt: string;
}

export type DiagnosticSeverity = 'error' | 'warning' | 'suggestion';

export interface ClassDesignerDiagnostic {
  id: string;
  severity: DiagnosticSeverity;
  stage: 1 | 2 | 3 | 4 | 5 | 6;
  stageName: string;
  title: string;
  message: string;
  fieldId?: string;
  methodId?: string;
}

export interface CodeGenerationOptions {
  includeJavadoc: boolean;
  includeMainSketch: boolean;
  instanceName?: string;
}

export const JAVA_RESERVED_KEYWORDS = new Set([
  'abstract', 'assert', 'boolean', 'break', 'byte', 'case', 'catch', 'char', 'class',
  'const', 'continue', 'default', 'do', 'double', 'else', 'enum', 'extends', 'false',
  'final', 'finally', 'float', 'for', 'goto', 'if', 'implements', 'import', 'instanceof',
  'int', 'interface', 'long', 'native', 'new', 'null', 'package', 'private', 'protected',
  'public', 'return', 'short', 'static', 'strictfp', 'super', 'switch', 'synchronized',
  'this', 'throw', 'throws', 'transient', 'true', 'try', 'void', 'volatile', 'while',
  // Processing built-ins commonly shadowed
  'size', 'setup', 'draw', 'width', 'height', 'mouseX', 'mouseY', 'mousePressed',
  'keyPressed', 'background', 'fill', 'stroke', 'noStroke', 'noFill', 'ellipse',
  'rect', 'line', 'point', 'triangle', 'quad', 'color', 'random', 'map', 'constrain'
]);

export const DEFAULT_EMPTY_PROJECT: ClassDesignProject = {
  id: 'nuevo-diseno',
  projectName: 'Mi Nueva Clase',
  className: 'Particula',
  conceptDescription: 'Un elemento visual autónomo que se dibuja en el lienzo e interactúa con el espacio.',
  guidingQuestions: {
    realWorldObject: 'Una partícula de polvo de luz que flota en el aire.',
    definingFeatures: 'Posición espacial en el plano, radio de dibujo y un color distintivo.',
    changeableFeatures: 'Su coordenada vertical cambia con la gravedad y su transparencia se atenúa.',
    actionsAndBehaviors: 'Puede dibujarse en el lienzo, actualizar su posición y renacer cuando cae fuera de la ventana.'
  },
  fields: [
    {
      id: 'f-1',
      name: 'x',
      type: 'float',
      description: 'Coordenada horizontal en el lienzo',
      initStrategy: 'constructor-param'
    },
    {
      id: 'f-2',
      name: 'y',
      type: 'float',
      description: 'Coordenada vertical en el lienzo',
      initStrategy: 'constructor-param'
    },
    {
      id: 'f-3',
      name: 'radio',
      type: 'float',
      description: 'Diámetro de dibujo de la partícula',
      initStrategy: 'default-value',
      defaultValue: '12.0'
    },
    {
      id: 'f-4',
      name: 'velocidadY',
      type: 'float',
      description: 'Incremento vertical por cada fotograma',
      initStrategy: 'default-value',
      defaultValue: '1.5'
    }
  ],
  constructorParams: [
    {
      id: 'p-1',
      name: 'xInicial',
      type: 'float',
      targetFieldId: 'f-1',
      description: 'Posición horizontal inicial'
    },
    {
      id: 'p-2',
      name: 'yInicial',
      type: 'float',
      targetFieldId: 'f-2',
      description: 'Posición vertical inicial'
    }
  ],
  methods: [
    {
      id: 'm-1',
      name: 'dibujar',
      returnType: 'void',
      description: 'Dibuja la partícula en el lienzo como una elipse rellena.',
      params: [],
      relatedFieldIds: ['f-1', 'f-2', 'f-3'],
      relationType: 'reads'
    },
    {
      id: 'm-2',
      name: 'actualizar',
      returnType: 'void',
      description: 'Modifica la posición Y sumando la velocidad vertical.',
      params: [],
      relatedFieldIds: ['f-2', 'f-4'],
      relationType: 'mutates'
    }
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

export const RESORTE_EXAMPLE_PROJECT: ClassDesignProject = {
  id: 'ejemplo-resorte',
  projectName: 'Simulador de Resorte (Slinky)',
  className: 'Resorte',
  conceptDescription: 'Modelo mecánico y visual de un muelle helicoidal que responde a la elasticidad de la Ley de Hooke y oscila con amortiguación.',
  guidingQuestions: {
    realWorldObject: 'Un resorte o muelle de acero sujeto por un extremo que se deforma al jalarlo.',
    definingFeatures: 'Punto de anclaje (x, y), longitud en reposo, rigidez del material y color de la espira.',
    changeableFeatures: 'La longitud actual deformada y la velocidad de desplazamiento del extremo libre.',
    actionsAndBehaviors: 'Puede dibujarse en espiral, estirarse con una fuerza externa, comprimirse y oscilar físicamente hasta el equilibrio.'
  },
  fields: [
    {
      id: 'rf-1',
      name: 'x',
      type: 'float',
      description: 'Coordenada X del anclaje superior fijo',
      initStrategy: 'constructor-param'
    },
    {
      id: 'rf-2',
      name: 'y',
      type: 'float',
      description: 'Coordenada Y del anclaje superior fijo',
      initStrategy: 'constructor-param'
    },
    {
      id: 'rf-3',
      name: 'longitud',
      type: 'float',
      description: 'Longitud actual (estirada o comprimida) del resorte',
      initStrategy: 'constructor-param'
    },
    {
      id: 'rf-4',
      name: 'longitudReposo',
      type: 'float',
      description: 'Longitud en equilibrio natural sin fuerza aplicada',
      initStrategy: 'default-value',
      defaultValue: '140.0'
    },
    {
      id: 'rf-5',
      name: 'rigidez',
      type: 'float',
      description: 'Constante elástica del muelle (k de la ley de Hooke)',
      initStrategy: 'default-value',
      defaultValue: '0.04'
    },
    {
      id: 'rf-6',
      name: 'velocidad',
      type: 'float',
      description: 'Velocidad de movimiento del extremo libre en oscilación',
      initStrategy: 'default-value',
      defaultValue: '0.0'
    },
    {
      id: 'rf-7',
      name: 'colorResorte',
      type: 'color',
      description: 'Color de trazo de las espiras del resorte',
      initStrategy: 'constructor-param'
    }
  ],
  constructorParams: [
    {
      id: 'rp-1',
      name: 'xInicial',
      type: 'float',
      targetFieldId: 'rf-1',
      description: 'Punto X de anclaje del resorte'
    },
    {
      id: 'rp-2',
      name: 'yInicial',
      type: 'float',
      targetFieldId: 'rf-2',
      description: 'Punto Y de anclaje del resorte'
    },
    {
      id: 'rp-3',
      name: 'longitudInicial',
      type: 'float',
      targetFieldId: 'rf-3',
      description: 'Longitud inicial con la que nace el objeto'
    },
    {
      id: 'rp-4',
      name: 'colorInicial',
      type: 'color',
      targetFieldId: 'rf-7',
      description: 'Color cromático inicial del resorte'
    }
  ],
  methods: [
    {
      id: 'rm-1',
      name: 'mostrar',
      returnType: 'void',
      description: 'Dibuja las espiras del resorte conectando el anclaje con el extremo libre mediante líneas en zig-zag.',
      params: [],
      relatedFieldIds: ['rf-1', 'rf-2', 'rf-3', 'rf-7'],
      relationType: 'reads'
    },
    {
      id: 'rm-2',
      name: 'estirar',
      returnType: 'void',
      description: 'Aumenta la longitud del resorte en función de una fuerza recibida por parámetro.',
      params: [
        { id: 'rmp-1', name: 'fuerza', type: 'float' }
      ],
      relatedFieldIds: ['rf-3'],
      relationType: 'mutates'
    },
    {
      id: 'rm-3',
      name: 'comprimir',
      returnType: 'void',
      description: 'Reduce la longitud del resorte limitándola a un mínimo físico razonable.',
      params: [
        { id: 'rmp-2', name: 'fuerza', type: 'float' }
      ],
      relatedFieldIds: ['rf-3'],
      relationType: 'mutates'
    },
    {
      id: 'rm-4',
      name: 'oscilar',
      returnType: 'void',
      description: 'Calcula la fuerza elástica restauradora de Hooke y actualiza la velocidad y la longitud con amortiguación.',
      params: [],
      relatedFieldIds: ['rf-3', 'rf-4', 'rf-5', 'rf-6'],
      relationType: 'both'
    },
    {
      id: 'rm-5',
      name: 'cambiarColor',
      returnType: 'void',
      description: 'Asigna un nuevo color de trazo a las espiras del resorte.',
      params: [
        { id: 'rmp-3', name: 'nuevoColor', type: 'color' }
      ],
      relatedFieldIds: ['rf-7'],
      relationType: 'mutates'
    }
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};
