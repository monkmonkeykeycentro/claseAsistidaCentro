import { DEFAULT_EMPTY_PROJECT, RESORTE_EXAMPLE_PROJECT } from '../types/classDesigner';
import type { ClassDesignerContent } from '../types/classDesignerContent';

export const CLASS_DESIGNER_STEPS = [1, 2, 3, 4, 5, 6] as const;
export const DEFAULT_CLASS_DESIGNER_CONTENT: ClassDesignerContent = {
  title: 'Diseñador de Clases en Processing Java',
  subtitle: 'Herramienta de Creación · POO',
  introduction: 'Diseña los campos, el constructor y los métodos de tus objetos y genera su estructura inicial en Processing Java.',
  blocks: [],
  steps: {
    1: { blocks: [], shortTitle: 'Objeto', navigationTitle: 'Definir el objeto', category: 'Abstracción y Definición del Objeto',
      title: '¿Qué entidad visual o física deseas modelar?',
      description: 'En la Programación Orientada a Objetos, una clase es un molde conceptual que define las propiedades y comportamientos de una entidad antes de que cobre vida en el lienzo.', tip: '' },
    2: { blocks: [], shortTitle: 'Campos', navigationTitle: 'Identificar campos', category: 'Campos y Variables de Estado',
      title: '¿Qué datos necesita recordar cada instancia de tu clase?',
      description: 'Los campos (o atributos) son las variables que residen dentro del objeto. Definen su aspecto, posición espacial, tamaño, color y variables físicas.', tip: '' },
    3: { blocks: [], shortTitle: 'Constructor', navigationTitle: 'Configurar constructor', category: 'Configurar Constructor y Asignaciones',
      title: '¿Cómo se inicializa cada objeto en el momento de su nacimiento?',
      description: 'El constructor es la función especial que se ejecuta cuando escribes new {{className}}(...). Recibe valores temporales a través de sus parámetros y los almacena en los campos permanentes del objeto.', tip: '' },
    4: { blocks: [], shortTitle: 'Métodos', navigationTitle: 'Diseñar métodos', category: 'Métodos y Comportamientos',
      title: '¿Qué acciones o transformaciones puede ejecutar tu objeto?',
      description: 'Los métodos son las funciones internas del objeto. Permiten que se dibuje en el lienzo (mostrar()), altere sus variables (estirar(fuerza)) o responda al paso del tiempo (oscilar()).',
      tip: 'Esta herramienta genera la estructura anatómica y comentarios orientadores con // TODO: [descripción]. El código visual final lo escribes tú en Processing para desarrollar tu propio criterio creativo y resolución de algoritmos.' },
    5: { blocks: [], shortTitle: 'Relaciones', navigationTitle: 'Establecer relaciones', category: 'Mapeo de Relaciones: Métodos ↔ Campos',
      title: '¿Qué métodos leen o transforman el estado del objeto?',
      description: 'En la Programación Orientada a Objetos, los métodos no están aislados: colaboran a través de la memoria interna. Esta matriz visual te permite mapear cómo fluye la información dentro de la clase.', tip: '' },
    6: { blocks: [], shortTitle: 'Código', navigationTitle: 'Revisar y exportar', category: 'Revisión Estructural, Exportación y Respaldo',
      title: 'Inspecciona tu clase, exporta la estructura o descárgala para Processing Java',
      description: 'Revisa el diagnóstico de tu diseño para asegurar consistencia sintáctica. Puedes descargar el código Java (.pde) o exportar la estructura completa en formato .json editable para seguir modificándola.', tip: '' },
  },
  guidingTitle: 'Preguntas Guía para el Proceso de Abstracción',
  guidingDescription: 'Antes de escribir código o abrir Processing, responde estas 4 preguntas. Te permitirán discernir qué propiedades serán fijas, cuáles cambiarán y qué métodos necesitarás implementar.',
  questions: {
    realWorldObject: { label: '¿Qué objeto o fenómeno del mundo real o visual quieres representar?', placeholder: 'ej: Un muelle helicoidal fijado por un extremo superior…' },
    definingFeatures: { label: '¿Cuáles son sus características definitorias (las que siempre posee)?', placeholder: 'ej: Posición de anclaje (x, y), longitud en reposo, rigidez elástica, color…' },
    changeableFeatures: { label: '¿Cuáles de esas características pueden cambiar a lo largo del tiempo?', placeholder: 'ej: La longitud deformada actual y la velocidad de desplazamiento del extremo…' },
    actionsAndBehaviors: { label: '¿Qué acciones o comportamientos puede realizar por sí mismo?', placeholder: 'ej: Dibujarse, estirarse, comprimirse y oscilar…' },
  },
  fieldStrategies: {
    'constructor-param': { title: 'Estrategia A · Constructor', description: 'Se recibe como argumento al instanciar (new Objeto(...)). Ideal para posición o colores únicos.' },
    'default-value': { title: 'Estrategia B · Valor Interno', description: 'Nace con un valor constante o fijo para todas las instancias (ej: velocidad = 0.0).' },
    later: { title: 'Estrategia C · Posterior', description: 'Se calcula o inicializa más tarde dentro de un método interactivo o de actualización.' },
  },
  defaultProject: DEFAULT_EMPTY_PROJECT,
  examples: [{ id: 'resorte', label: 'Resorte (Slinky)', project: RESORTE_EXAMPLE_PROJECT }],
};
