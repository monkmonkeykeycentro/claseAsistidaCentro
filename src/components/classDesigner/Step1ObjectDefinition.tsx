/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  ClassDesignProject,
  JAVA_RESERVED_KEYWORDS,
} from '../../types/classDesigner';
import { isValidJavaIdentifier, isCamelCase } from '../../services/classDesignerService';
import { Sparkles, HelpCircle, CheckCircle2, AlertTriangle, Lightbulb } from 'lucide-react';

interface Step1Props {
  project: ClassDesignProject;
  onChange: (updated: ClassDesignProject) => void;
}

export const Step1ObjectDefinition: React.FC<Step1Props> = ({ project, onChange }) => {
  const isNameValid = isValidJavaIdentifier(project.className);
  const isReserved = JAVA_RESERVED_KEYWORDS.has(project.className.toLowerCase());
  const isCamel = isCamelCase(project.className);

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
      {/* Intro Header */}
      <div className="space-y-1.5 border-b border-[#E1E7E1] pb-4">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 bg-[#E8EEE8] text-[#407B5D] text-xs font-bold rounded-md">
            Etapa 1 de 6
          </span>
          <span className="text-xs font-medium text-[#59645C]">
            Abstracción y Definición del Objeto
          </span>
        </div>
        <h2 className="text-xl font-bold text-[#232A24]">
          ¿Qué entidad visual o física deseas modelar?
        </h2>
        <p className="text-xs text-[#59645C] leading-relaxed">
          En la Programación Orientada a Objetos, una <strong className="text-[#232A24]">clase</strong> es un molde conceptual que define las propiedades y comportamientos de una entidad antes de que cobre vida en el lienzo.
        </p>
      </div>

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
            <span className="font-mono text-[11px] text-[#407B5D]">camelCase</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={project.className}
              onChange={(e) => handleFieldChange('className', e.target.value.replace(/\s+/g, ''))}
              placeholder="ej: resorte, particula, criatura"
              className={`w-full px-3.5 py-2 text-xs font-mono font-bold bg-white border rounded-xl focus:outline-none transition-colors ${
                !isNameValid || isReserved
                  ? 'border-red-400 focus:border-red-500 text-red-700'
                  : !isCamel
                  ? 'border-amber-400 focus:border-amber-500 text-amber-800'
                  : 'border-[#407B5D] text-[#232A24]'
              }`}
            />
            <div className="absolute right-2.5 top-2.5">
              {!isNameValid || isReserved ? (
                <AlertTriangle className="w-4 h-4 text-red-500" />
              ) : isCamel ? (
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
            ) : !isCamel ? (
              <span className="text-amber-700 font-medium">Sugerencia: Usa camelCase iniciando con minúscula (ej: {project.className.charAt(0).toLowerCase() + project.className.slice(1)}).</span>
            ) : (
              <span className="text-[#407B5D] font-medium">✓ Nombre válido en camelCase.</span>
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
            Preguntas Guía para el Proceso de Abstracción
          </h3>
        </div>
        <p className="text-[11px] text-[#59645C] leading-relaxed">
          Antes de escribir código o abrir Processing, responde estas 4 preguntas. Te permitirán discernir qué propiedades serán fijas, cuáles cambiarán y qué métodos necesitarás implementar.
        </p>

        <div className="space-y-3.5">
          {/* Question 1 */}
          <div className="space-y-1 bg-white p-3 border border-[#E1E7E1] rounded-xl">
            <label className="text-xs font-semibold text-[#232A24] block">
              1. ¿Qué objeto o fenómeno del mundo real o visual quieres representar?
            </label>
            <input
              type="text"
              value={project.guidingQuestions.realWorldObject}
              onChange={(e) => handleGuidingChange('realWorldObject', e.target.value)}
              placeholder="ej: Un muelle helicoidal fijado por un extremo superior..."
              className="w-full px-2.5 py-1.5 text-xs border border-[#E1E7E1] rounded-lg focus:border-[#407B5D] focus:outline-none"
            />
          </div>

          {/* Question 2 */}
          <div className="space-y-1 bg-white p-3 border border-[#E1E7E1] rounded-xl">
            <label className="text-xs font-semibold text-[#232A24] block">
              2. ¿Cuáles son sus características definitorias (las que siempre posee)?
            </label>
            <input
              type="text"
              value={project.guidingQuestions.definingFeatures}
              onChange={(e) => handleGuidingChange('definingFeatures', e.target.value)}
              placeholder="ej: Posición de anclaje (x, y), longitud en reposo, rigidez elástica, color..."
              className="w-full px-2.5 py-1.5 text-xs border border-[#E1E7E1] rounded-lg focus:border-[#407B5D] focus:outline-none"
            />
          </div>

          {/* Question 3 */}
          <div className="space-y-1 bg-white p-3 border border-[#E1E7E1] rounded-xl">
            <label className="text-xs font-semibold text-[#232A24] block">
              3. ¿Cuáles de esas características pueden cambiar a lo largo del tiempo?
            </label>
            <input
              type="text"
              value={project.guidingQuestions.changeableFeatures}
              onChange={(e) => handleGuidingChange('changeableFeatures', e.target.value)}
              placeholder="ej: La longitud deformada actual y la velocidad de desplazamiento del extremo..."
              className="w-full px-2.5 py-1.5 text-xs border border-[#E1E7E1] rounded-lg focus:border-[#407B5D] focus:outline-none"
            />
          </div>

          {/* Question 4 */}
          <div className="space-y-1 bg-white p-3 border border-[#E1E7E1] rounded-xl">
            <label className="text-xs font-semibold text-[#232A24] block">
              4. ¿Qué acciones o comportamientos puede realizar por sí mismo?
            </label>
            <input
              type="text"
              value={project.guidingQuestions.actionsAndBehaviors}
              onChange={(e) => handleGuidingChange('actionsAndBehaviors', e.target.value)}
              placeholder="ej: Dibujarse en pantalla (mostrar), estirarse, comprimirse, oscilar armónicamente..."
              className="w-full px-2.5 py-1.5 text-xs border border-[#E1E7E1] rounded-lg focus:border-[#407B5D] focus:outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
