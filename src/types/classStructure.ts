export type StageId = 1 | 2 | 3 | 4;

export interface SectionExploration {
  id: 'declaration' | 'fields' | 'constructor' | 'methods' | 'braces';
  title: string;
  badge: string;
  color: string;
  whatItIs: string;
  howToWrite: string;
  whatItContains: string[];
  example: string;
  pedagogicalNote?: string;
}

export type ZoneId = 'fields' | 'constructor' | 'methods';

export interface CardItem {
  id: string;
  name: string;
  code: string;
  correctZone: ZoneId;
  previewNote: string;
  tokens: DetailedToken[];
}

export interface DetailedToken {
  id: string;
  text: string;
  type: 'keyword' | 'type' | 'field-name' | 'constructor-name' | 'param-type' | 'param-name' | 'method-name' | 'return-type' | 'brace' | 'operator' | 'punctuation' | 'comment';
  label: string;
  explanation: string;
  relationGroup?: string;
}

export interface BlankSlot {
  id: string;
  expected: string[];
  label: string;
  placeholder?: string;
  hint: string;
  explanation: string;
  caseSensitive?: boolean;
}

export interface SyntaxExercise {
  id: string;
  title: string;
  category: 'declaracion' | 'atributos' | 'constructor' | 'parametros' | 'asignaciones' | 'signos';
  badge: string;
  prompt: string;
  codeSnippet: string;
  blanks: BlankSlot[];
  signRoleExplanation: string;
  counterConceptNote?: string; // e.g. "No todas las líneas llevan punto y coma"
}

export interface BuilderField {
  id: string;
  type: 'String' | 'int' | 'float' | 'boolean' | 'color';
  name: string;
}

export interface BuilderParam {
  id: string;
  type: 'String' | 'int' | 'float' | 'boolean' | 'color';
  name: string;
  targetFieldId: string; // which attribute it assigns to
}

export interface BuilderMethod {
  id: string;
  name: string;
  params: Array<{ id: string; type: string; name: string }>;
  comment: string;
}

export interface BuilderState {
  className: string;
  fields: BuilderField[];
  constructorParams: BuilderParam[];
  methods: BuilderMethod[];
}

export interface DiagnosticMessage {
  id: string;
  type: 'syntax-error' | 'organization-suggestion' | 'valid' | 'tip';
  title: string;
  message: string;
  targetArea?: 'className' | 'fields' | 'constructor' | 'methods' | 'syntax';
}

export interface UserProgress {
  stageCompleted: {
    1: boolean;
    2: boolean;
    3: boolean;
    4: boolean;
  };
  stage3CompletedExercises: string[];
  stage2Placements: Record<string, ZoneId>;
  stage4BuilderCustomized: boolean;
}
