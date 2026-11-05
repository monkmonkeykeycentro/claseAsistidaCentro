import type { CmsBlock } from './cms';
import type { TopicItem } from '../data/topicsData';
import type { UnitDefinition } from '../data/unitsData';
import type { ActivityProgress, LessonProgress } from './classStructure';

export type LessonStatus = 'not-started' | 'in-progress' | 'completed' | 'blocked';

export interface LearningSection {
  id: string;
  title: string;
  summary: string;
  explanation: string;
  codeSnippet: string;
  codeSnippetP5?: string;
  codeSnippetJava?: string;
  repositoryUrl?: string;
  repositoryEntry?: string;
  showCodeJava?: boolean;
  showCodeP5?: boolean;
  showInteractiveExecution?: boolean;
  defaultLanguage?: 'p5' | 'processing';
  didacticTip: string;
  commonMistake?: string;
  blocks?: CmsBlock[];
}

export interface LearningLesson {
  id: string;
  unitId?: UnitDefinition['id'];
  number: number;
  title: string;
  category: TopicItem['category'];
  badge: string;
  summary: string;
  estimatedTime: string;
  conceptsCount: number;
  hasInteractiveWorkshop: boolean;
  sections: LearningSection[];
  thumbnailP5?: string;
  repositoryUrl?: string;
  repositoryEntry?: string;
  displayCodeJava?: string;
  showCodeJava?: boolean;
  showCodeP5?: boolean;
  showInteractiveExecution?: boolean;
  quickChallenge?: TopicItem['quickChallenge'];
}

const LESSON_UNIT_BY_ID: Record<string, UnitDefinition['id']> = {
  canvas: 'u1',
  variables: 'u2',
  functions: 'u2',
  conditionals: 'u3',
  loops: 'u3',
  classes: 'u3',
  'object-arrays': 'u3',
};

export function getLessonUnitId(lessonId: string): UnitDefinition['id'] | undefined {
  return LESSON_UNIT_BY_ID[lessonId];
}

export function inferUnitId(
  lessonId: string,
  category?: TopicItem['category'],
): UnitDefinition['id'] | undefined {
  return getLessonUnitId(lessonId) || (category === 'Fundamentos' ? 'u1' : undefined);
}

export interface LearningUnit {
  id: UnitDefinition['id'];
  number: number;
  title: string;
  summary: string;
  lessonIds: string[];
  prerequisiteUnitIds: UnitDefinition['prerequisiteUnitIds'];
}

export interface UnitEvaluationSummary {
  completedActivities: number;
  totalActivities: number;
  percentage: number;
  isComplete: boolean;
}

export function getUnitEvaluationSummary(
  unit: Pick<UnitDefinition, 'exercises'>,
  activityProgress?: Record<string, ActivityProgress>,
): UnitEvaluationSummary {
  const totalActivities = unit.exercises.length;
  const completedActivities = unit.exercises.filter((exercise) => activityProgress?.[exercise.id]?.passed).length;
  return {
    completedActivities,
    totalActivities,
    percentage: totalActivities ? Math.round((completedActivities / totalActivities) * 100) : 0,
    isComplete: totalActivities > 0 && completedActivities === totalActivities,
  };
}

export function getLessonStatus(
  lesson: Pick<LearningLesson, 'sections'>,
  progress?: LessonProgress,
  isBlocked = false,
): LessonStatus {
  if (isBlocked) return 'blocked';
  const completedSectionIds = new Set(progress?.completedSections || []);
  const completedCount = lesson.sections.filter((section) => completedSectionIds.has(section.id)).length;
  if (completedCount === 0) return 'not-started';
  if (lesson.sections.length > 0 && completedCount === lesson.sections.length) {
    return 'completed';
  }
  return 'in-progress';
}

export function getLessonProgressPercentage(
  lesson: Pick<LearningLesson, 'sections'>,
  progress?: LessonProgress,
): number {
  if (!lesson.sections.length) return 0;
  const completedSectionIds = new Set(progress?.completedSections || []);
  const completedCount = lesson.sections.filter((section) => completedSectionIds.has(section.id)).length;
  return Math.min(100, Math.round((completedCount / lesson.sections.length) * 100));
}

export function normalizeUnit(unit: UnitDefinition, lessonIds: string[] = []): LearningUnit {
  return {
    id: unit.id,
    number: unit.number,
    title: unit.title,
    summary: unit.summary,
    lessonIds,
    prerequisiteUnitIds: unit.prerequisiteUnitIds || [],
  };
}

export function areUnitPrerequisitesComplete(
  unit: { prerequisiteUnitIds?: Array<'u1' | 'u2' | 'u3'> },
  completedUnitIds: string[],
): boolean {
  return (unit.prerequisiteUnitIds || []).every((id) => completedUnitIds.includes(id));
}

export function normalizeTopic(topic: TopicItem): LearningLesson {
  return {
    ...topic,
    unitId: topic.unitId || inferUnitId(topic.id, topic.category),
    sections: topic.concepts.map((concept) => ({ ...concept })),
  };
}
