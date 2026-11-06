/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ClassDesignerStepIntro, useClassDesignerContent } from './ClassDesignerContentContext';
import {
  ClassDesignProject,
  JAVA_RESERVED_KEYWORDS,
} from '../../types/classDesigner';
import { isValidJavaIdentifier, isPascalCase } from '../../services/classDesignerService';
import { Sparkles, HelpCircle, CheckCircle2, AlertTriangle, Lightbulb } from 'lucide-react';

interface Step1Props {
  project: ClassDesignProject;
  onChange: (updated: ClassDesignProject) => void;
}

export const Step1ObjectDefinition: React.FC<Step1Props> = ({ project, onChange }) => {
  const content = useClassDesignerContent();
  const isNameValid = isValidJavaIdentifier(project.className);
  const isReserved = JAVA_RESERVED_KEYWORDS.has(project.className);
  const isPascal = isPascalCase(project.className);

  const handleFieldChange = <K extends keyof ClassDesignProject>(key: K, value: ClassDesignProject[K]) => {
    onChange({
      ...project,
      [key]: value,
    });
  };

  const handleGuidingChange = (key: keyof ClassDesignProject['guidingQuestions'], value: string) => {
    onChange({
      ...project,
      guidingQuestions: {
        ...project.guidingQuestions,
        [key]: value,
      },
    });
  };

  return (
    <div className="space-y-6">
      <ClassDesignerStepIntro step={1} className={project.className} />

      {/* Primary Identifiers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Project Name */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[#232A24] flex items-center justify-between">
            <span>Título del Proyecto o Sistema</span>
            <span className="text-[11px] font-normal text-[#59645C]">Referencia humana</span>
          </label>
          <input
            type="text"
            value={project.projectName}
            onChange={(e) => handleFieldChange('projectName', e.target.value)}
            placeholder="ej: Simulación de Resorte Elástico"
            className="w-full px-3.5 py-2 text-xs bg-white border border-[#E1E7E1] rounded-xl focus:border-[#407B5D] focus:outline-none transition-colors"
          />
        </div>

        {/* Class Name (PascalCase) */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[#232A24] flex items-center justify-between">
            <span>Nombre de la Clase en Processing Java</span>
            <span className="font-mono text-[11px] text-[#407B5D]">PascalCase</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={project.className}
              onChange={(e) => handleFieldChange('className', e.target.value.replace(/\s+/g, ''))}
              placeholder="ej: Resorte, Particula, CriaturaVisual"
              className={`w-full px-3.5 py-2 text-xs font-mono font-bold bg-white border rounded-xl focus:outline-none transition-colors ${
                !isNameValid || isReserved
                  ? 'border-red-400 focus:border-red-500 text-red-700'
                  : !isPascal
                  ? 'border-amber-400 focus:border-amber-500 text-amber-800'
                  : 'border-[#407B5D] text-[#232A24]'
              }`}
            />
            <div className="absolute right-2.5 top-2.5">
              {!isNameValid || isReserved ? (
                <AlertTriangle className="w-4 h-4 text-red-500" />
              ) : isPascal ? (
                <CheckCircle2 className="w-4 h-4 text-[#407B5D]" />
              ) : (
                <Lightbulb className="w-4 h-4 text-amber-500" />
              )}
            </div>
          </div>
          {/* Validation badge */}
          <div className="text-[11px] space-y-0.5">
            {!project.className ? (
              <span className="text-red-600 font-medium">Ingresa un nombre para la clase.</span>
            ) : !isNameValid ? (
              <span className="text-red-600 font-medium">No se permiten espacios ni caracteres especiales.</span>
            ) : isReserved ? (
              <span className="text-red-600 font-medium">Coincide con una palabra reservada de Java/Processing.</span>
            ) : !isPascal ? (
              <span className="text-amber-700 font-medium">Por convención, las clases usan PascalCase con mayúscula inicial (ej: {project.className.charAt(0).toUpperCase() + project.className.slice(1)}).</span>
            ) : (
              <span className="text-[#407B5D] font-medium">✓ Nombre válido en PascalCase.</span>
            )}
          </div>
        </div>
      </div>

      {/* Brief Concept */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-[#232A24]">
          Propósito / Concepto General del Objeto
        </label>
        <textarea
          rows={2}
          value={project.conceptDescription}
          onChange={(e) => handleFieldChange('conceptDescription', e.target.value)}
          placeholder="Describe brevemente qué función cumple este objeto dentro de tu composición o simulación..."
          className="w-full px-3.5 py-2 text-xs bg-white border border-[#E1E7E1] rounded-xl focus:border-[#407B5D] focus:outline-none transition-colors leading-relaxed"
        />
      </div>

      {/* 4 Guiding Reflection Questions for Abstraction */}
      <div className="p-4 sm:p-5 bg-[#F7F8F4] border border-[#E1E7E1] rounded-2xl space-y-4">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-[#407B5D]" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#232A24]">
            {content.guidingTitle}
          </h3>
        </div>
        <p className="text-[11px] text-[#59645C] leading-relaxed">
          {content.guidingDescription}
        </p>

        <div className="space-y-3.5">
          {/* Question 1 */}
          <div className="space-y-1 bg-white p-3 border border-[#E1E7E1] rounded-xl">
            <label className="text-xs font-semibold text-[#232A24] block">
              1. {content.questions.realWorldObject.label}
            </label>
            <input
              type="text"
              value={project.guidingQuestions.realWorldObject}
              onChange={(e) => handleGuidingChange('realWorldObject', e.target.value)}
              placeholder={content.questions.realWorldObject.placeholder}
              className="w-full px-2.5 py-1.5 text-xs border border-[#E1E7E1] rounded-lg focus:border-[#407B5D] focus:outline-none"
            />
          </div>

          {/* Question 2 */}
          <div className="space-y-1 bg-white p-3 border border-[#E1E7E1] rounded-xl">
            <label className="text-xs font-semibold text-[#232A24] block">
              2. {content.questions.definingFeatures.label}
            </label>
            <input
              type="text"
              value={project.guidingQuestions.definingFeatures}
              onChange={(e) => handleGuidingChange('definingFeatures', e.target.value)}
              placeholder={content.questions.definingFeatures.placeholder}
              className="w-full px-2.5 py-1.5 text-xs border border-[#E1E7E1] rounded-lg focus:border-[#407B5D] focus:outline-none"
            />
          </div>

          {/* Question 3 */}
          <div className="space-y-1 bg-white p-3 border border-[#E1E7E1] rounded-xl">
            <label className="text-xs font-semibold text-[#232A24] block">
              3. {content.questions.changeableFeatures.label}
            </label>
            <input
              type="text"
              value={project.guidingQuestions.changeableFeatures}
              onChange={(e) => handleGuidingChange('changeableFeatures', e.target.value)}
              placeholder={content.questions.changeableFeatures.placeholder}
              className="w-full px-2.5 py-1.5 text-xs border border-[#E1E7E1] rounded-lg focus:border-[#407B5D] focus:outline-none"
            />
          </div>

          {/* Question 4 */}
          <div className="space-y-1 bg-white p-3 border border-[#E1E7E1] rounded-xl">
            <label className="text-xs font-semibold text-[#232A24] block">
              4. {content.questions.actionsAndBehaviors.label}
            </label>
            <input
              type="text"
              value={project.guidingQuestions.actionsAndBehaviors}
              onChange={(e) => handleGuidingChange('actionsAndBehaviors', e.target.value)}
              placeholder={content.questions.actionsAndBehaviors.placeholder}
              className="w-full px-2.5 py-1.5 text-xs border border-[#E1E7E1] rounded-lg focus:border-[#407B5D] focus:outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
