/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type PedagogicalStage = 'observar' | 'interpretar' | 'escribir' | 'experimentar' | 'documentar';

export interface CoordinateEvidence {
  userId?: string;
  userEmail?: string;
  userName?: string;
  prediction: string;
  code: string;
  targetHits: {
    circleAtCenter: boolean;
    rectAtZone: boolean;
    lineAcross: boolean;
  };
  reflection: string;
  completed: boolean;
  updatedAt: string;
  currentStage: PedagogicalStage;
}

export interface BoundaryTestResult {
  valueX: number;
  expectedZone: 'zona1' | 'zona2' | 'zona3';
  actualZone: 'zona1' | 'zona2' | 'zona3';
  passed: boolean;
  description: string;
}

export interface ConditionalEvidence {
  userId?: string;
  userEmail?: string;
  userName?: string;
  prediction: string;
  code: string;
  boundaryTests: Record<number, BoundaryTestResult>;
  reflection: string;
  completed: boolean;
  updatedAt: string;
  currentStage: PedagogicalStage;
}

export interface PilotExerciseConfig {
  id: 'coordinates' | 'conditionals' | 'audiovisual';
  title: string;
  subtitle: string;
  objective: string;
  instructions: string;
  order: number;
  visible: boolean;
  status: 'draft' | 'published';
}

export interface PilotEvidenceRecord {
  id: string;
  exerciseId: 'coordinates' | 'conditionals';
  userId: string;
  userEmail: string;
  userName: string;
  data: CoordinateEvidence | ConditionalEvidence;
  submittedAt: string;
}
