/**
 * Types and interfaces for the OOP Laboratory in Processing Java
 * Módulo 1: Pelota | Módulo 2: Burbuja
 */

export type LabModuleId = 'pelota' | 'burbuja' | 'builder';

export type LearningMoment =
  | 'observe' // 1. Observar
  | 'describe' // 2. Describir
  | 'build-class' // 3. Construir
  | 'fields'
  | 'constructor'
  | 'methods'
  | 'method-explorer' // 4. Experimentar
  | 'instances-arrays' // 5. Aplicar
  | 'free-lab';

export interface MethodDefinition {
  id: string;
  name: string;
  signature: string;
  description: string;
  fieldsUsed: string[];
  fieldsModified: string[];
  parameters: Array<{
    name: string;
    type: 'float' | 'color' | 'int';
    defaultValue: number | string;
    min?: number;
    max?: number;
    step?: number;
    description: string;
  }>;
  executionType: 'instant' | 'continuous';
  codeSnippet: string;
  explanation: string;
}

export interface FieldDefinition {
  name: string;
  type: 'float' | 'color' | 'int';
  initialValue: number | string;
  description: string;
  visualRole: string;
}

export interface MethodCallRecord {
  id: string;
  instanceIndex: number;
  instanceName: string;
  methodName: string;
  callString: string;
  timestamp: string;
  effectDescription: string;
}

export interface LabInstanceObject {
  id: number;
  name: string;
  x: number;
  y: number;
  diametro: number;
  velocidad: number;
  colorHex: string;
  opacidad?: number;
  vx?: number;
  vy?: number;
}

export interface HintLevels {
  hint1: string;
  hint2: string;
  hint3: string;
}

export interface ChallengeItem {
  id: string;
  question: string;
  codeSnippet?: string;
  options: Array<{
    id: string;
    text: string;
    isCorrect: boolean;
    feedback: string;
  }>;
  hints: HintLevels;
}

export interface StageActivity {
  id: string;
  stageNumber: number;
  title: string;
  moment: LearningMoment;
  objective: string;
  explanation: string;
  challenge?: ChallengeItem;
  activeMethodId?: string;
  codeAdditionHighlight?: string;
}

export interface ModuleProgression {
  moduleId: LabModuleId;
  moduleName: string;
  objectName: string;
  stages: StageActivity[];
  fields: FieldDefinition[];
  methods: MethodDefinition[];
}

export interface CustomClassConfig {
  className: string;
  collectionType: 'array' | 'arrayList'; // Objeto[] vs ArrayList<Objeto>
  initialCount: number;
  fields: {
    x: boolean;
    y: boolean;
    diametro: boolean;
    velocidad: boolean;
    color: boolean;
    opacidad: boolean;
  };
  constructorParams: {
    includePos: boolean;
    includeDiametro: boolean;
    includeVelocidad: boolean;
    includeColor: boolean;
  };
  methods: {
    mostrar: boolean;
    mover: boolean;
    rebotar: boolean;
    cambiarTamano: boolean;
    cambiarColor: boolean;
    reiniciar: boolean;
  };
  conditionals: {
    edgeBounce: boolean; // if (x > width - r || x < r) velocidad *= -1;
    edgeWrap: boolean; // if (y < 0) y = height;
    maxGrowLimit: boolean; // if (diametro > 120) diametro = 30;
    mouseHoverProximity: boolean; // if (dist(mouseX, mouseY, x, y) < diametro/2) ...
  };
  mouseEvents: {
    enabled: boolean;
    handlerType: 'spawn' | 'pop' | 'colorize' | 'repel';
  };
  keyEvents: {
    enabled: boolean;
    spaceAction: 'reverse' | 'pause' | 'color';
    keyAAction: 'spawnRandom';
    keyRAction: 'resetAll';
  };
}

export interface UserOopProgress {
  currentModule: LabModuleId;
  pelotaStageIndex: number;
  burbujaStageIndex: number;
  completedStages: Record<string, boolean>;
  completedChallenges: Record<string, boolean>;
}

