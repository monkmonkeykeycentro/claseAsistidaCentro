import type { AbstractionGuidingQuestions, ClassDesignProject, FieldInitStrategy } from './classDesigner';
import type { CmsBlock } from './cms';

export interface ClassDesignerContentBlock extends CmsBlock {
  visible?: boolean;
}

export type ClassDesignerStepNumber = 1 | 2 | 3 | 4 | 5 | 6;
export interface ClassDesignerStepContent {
  shortTitle: string;
  navigationTitle: string;
  category: string;
  title: string;
  description: string;
  tip: string;
  blocks: ClassDesignerContentBlock[];
}
export interface ClassDesignerContent {
  title: string;
  subtitle: string;
  introduction: string;
  blocks: ClassDesignerContentBlock[];
  steps: Record<ClassDesignerStepNumber, ClassDesignerStepContent>;
  guidingTitle: string;
  guidingDescription: string;
  questions: Record<keyof AbstractionGuidingQuestions, { label: string; placeholder: string }>;
  fieldStrategies: Record<FieldInitStrategy, { title: string; description: string }>;
  defaultProject: ClassDesignProject;
  examples: { id: string; label: string; project: ClassDesignProject }[];
}
