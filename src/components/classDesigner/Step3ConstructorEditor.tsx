/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ClassDesignerStepIntro } from './ClassDesignerContentContext';
import {
  ClassDesignProject,
  ClassDesignerParam,
  JavaPrimitiveType,
  JAVA_RESERVED_KEYWORDS,
} from '../../types/classDesigner';
import { isValidJavaIdentifier, isCamelCase } from '../../services/classDesignerService';
import {
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  ArrowRight,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';

interface Step3Props {
  project: ClassDesignProject;
  onChange: (updated: ClassDesignProject) => void;
}

const PRIMITIVE_TYPES: JavaPrimitiveType[] = ['int', 'float', 'boolean', 'String', 'color'];

export const Step3ConstructorEditor: React.FC<Step3Props> = ({ project, onChange }) => {
  const handleAddParam = () => {
    const newId = `p-${Date.now()}`;
    const unmappedField = project.fields.find(
      (f) =>
        f.initStrategy === 'constructor-param' &&
        !project.constructorParams.some((p) => p.targetFieldId === f.id)
    );

    const newParam: ClassDesignerParam = {
      id: newId,
      name: unmappedField ? `${unmappedField.name}Inicial` : `param${project.constructorParams.length + 1}`,
      type: unmappedField ? unmappedField.type : 'float',
      targetFieldId: unmappedField?.id,
      description: 'Parámetro de inicialización externa',
    };

    onChange({
      ...project,
      constructorParams: [...project.constructorParams, newParam],
    });
  };

  const handleAutoPopulate = () => {
    // Generate parameters for any field that is 'constructor-param' but not yet in constructorParams
    const existingMapped = new Set(project.constructorParams.map((p) => p.targetFieldId).filter(Boolean));
    const missingFields = project.fields.filter(
      (f) => f.initStrategy === 'constructor-param' && !existingMapped.has(f.id)
    );

    if (missingFields.length === 0) return;

    const newParams: ClassDesignerParam[] = missingFields.map((f, i) => ({
      id: `p-auto-${Date.now()}-${i}`,
      name: `${f.name}Inicial`,
      type: f.type,
      targetFieldId: f.id,
      description: `Valor inicial para el campo ${f.name}`,
    }));

    onChange({
      ...project,
      constructorParams: [...project.constructorParams, ...newParams],
    });
  };

  const handleUpdateParam = (id: string, updates: Partial<ClassDesignerParam>) => {
    onChange({
      ...project,
      constructorParams: project.constructorParams.map((p) =>
        p.id === id ? { ...p, ...updates } : p
      ),
    });
  };

  const handleDeleteParam = (id: string) => {
    onChange({
      ...project,
      constructorParams: project.constructorParams.filter((p) => p.id !== id),
    });
  };

  const handleMoveParam = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= project.constructorParams.length) return;

    const reordered = [...project.constructorParams];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);

    onChange({
      ...project,
      constructorParams: reordered,
    });
  };

  // Find unmapped fields that wanted constructor initialization
  const unmappedStrategyAFields = project.fields.filter(
    (f) =>
      f.initStrategy === 'constructor-param' &&
      !project.constructorParams.some((p) => p.targetFieldId === f.id)
  );

  return (
    <div className="space-y-6">
      <ClassDesignerStepIntro step={3} className={project.className} />

      {/* Conceptual Flow Diagram */}
      <div className="p-4 bg-[#F7F8F4] border border-[#E1E7E1] rounded-2xl space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-[#232A24]">
          <HelpCircle className="w-4 h-4 text-[#407B5D]" />
          <span>El Puente de Inicialización: De Afuera Hacia Adentro</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs items-center">
          <div className="p-3 bg-white border border-[#E1E7E1] rounded-xl text-center space-y-1">
            <span className="text-[10px] uppercase font-bold text-[#59645C] block">1. En el Sketch Principal</span>
            <code className="text-[#2868D9] font-bold block">new {project.className || 'Clase'}(width/2, 200)</code>
            <span className="text-[11px] text-[#59645C] block">Envías valores externos</span>
          </div>

          <div className="p-3 bg-white border border-[#E1E7E1] rounded-xl text-center space-y-1">
            <span className="text-[10px] uppercase font-bold text-[#407B5D] block">2. Parámetros del Constructor</span>
            <code className="text-[#407B5D] font-bold block">{project.className || 'Clase'}(float xIni, float yIni)</code>
            <span className="text-[11px] text-[#59645C] block">Reciben y transportan el dato</span>
          </div>

          <div className="p-3 bg-white border border-[#E1E7E1] rounded-xl text-center space-y-1">
            <span className="text-[10px] uppercase font-bold text-[#9A6700] block">3. Campos en Memoria</span>
            <code className="text-[#232A24] font-bold block">x = xIni; y = yIni;</code>
            <span className="text-[11px] text-[#59645C] block">Se guardan permanentemente</span>
          </div>
        </div>
      </div>

      {/* Unmapped Fields Notification Bar */}
      {unmappedStrategyAFields.length > 0 && (
        <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-amber-900 font-medium">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              Hay {unmappedStrategyAFields.length} campo(s) configurados con Estrategia A que aún no tienen parámetro en el constructor: <strong>{unmappedStrategyAFields.map((f) => f.name).join(', ')}</strong>.
            </span>
          </div>
          <button
            onClick={handleAutoPopulate}
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Crear parámetros automáticamente</span>
          </button>
        </div>
      )}

      {/* Constructor Parameters List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#232A24] uppercase tracking-wider">
            Parámetros en la Firma del Constructor ({project.constructorParams.length})
          </span>
          <div className="flex items-center gap-2">
            {unmappedStrategyAFields.length > 0 && (
              <button
                onClick={handleAutoPopulate}
                className="min-h-[34px] px-3 py-1.5 border border-[#407B5D] text-[#407B5D] hover:bg-[#E8EEE8] text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Auto-asignar campos</span>
              </button>
            )}
            <button
              onClick={handleAddParam}
              className="min-h-[34px] px-3 py-1.5 bg-[#407B5D] hover:bg-[#33654C] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Agregar Parámetro</span>
            </button>
          </div>
        </div>

        {project.constructorParams.length === 0 ? (
          <div className="p-8 border-2 border-dashed border-[#E1E7E1] rounded-2xl text-center space-y-3">
            <p className="text-xs text-[#59645C]">
              El constructor actual no tiene parámetros (<code className="font-mono text-[#232A24] font-bold">{project.className || 'Clase'}()</code>). Todas las instancias se crearán de manera idéntica.
            </p>
            <button
              onClick={handleAddParam}
              className="px-4 py-2 bg-[#407B5D] text-white text-xs font-bold rounded-xl inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Agregar primer parámetro</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {project.constructorParams.map((param, index) => {
              const isNameValid = isValidJavaIdentifier(param.name);
              const isReserved = JAVA_RESERVED_KEYWORDS.has(param.name.toLowerCase());
              const isCamel = isCamelCase(param.name);
              const targetField = project.fields.find((f) => f.id === param.targetFieldId);
              const isTypeMismatch = targetField && targetField.type !== param.type;

              return (
                <div
                  key={param.id}
                  className="p-4 bg-white border border-[#E1E7E1] hover:border-[#407B5D]/60 rounded-2xl space-y-3 shadow-xs transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E1E7E1] pb-2.5">
                    {/* Position in constructor signature */}
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-[#E8EEE8] text-[#407B5D] font-mono font-bold text-xs flex items-center justify-center shrink-0">
                        {index + 1}
                      </span>
                      <span className="font-mono text-xs font-bold text-[#232A24]">
                        {param.name || '(sin nombre)'}
                      </span>
                      <span className="px-2 py-0.5 bg-[#F7F8F4] border border-[#E1E7E1] text-[#59645C] text-[10px] font-mono rounded">
                        {param.type}
                      </span>
                      {targetField && (
                        <div className="flex items-center gap-1 text-[11px] text-[#407B5D] font-mono">
                          <ArrowRight className="w-3 h-3" />
                          <span>asigna a: <strong>{targetField.name}</strong></span>
                        </div>
                      )}
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleMoveParam(index, 'up')}
                        disabled={index === 0}
                        className="p-1.5 hover:bg-[#E8EEE8] text-[#59645C] disabled:opacity-30 rounded-lg cursor-pointer"
                        title="Mover parámetro antes en la firma"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleMoveParam(index, 'down')}
                        disabled={index === project.constructorParams.length - 1}
                        className="p-1.5 hover:bg-[#E8EEE8] text-[#59645C] disabled:opacity-30 rounded-lg cursor-pointer"
                        title="Mover parámetro después en la firma"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteParam(param.id)}
                        className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg cursor-pointer ml-1"
                        title="Eliminar parámetro"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-start">
                    {/* Type */}
                    <div className="sm:col-span-3 space-y-1">
                      <label className="text-[11px] font-bold text-[#232A24] block">Tipo</label>
                      <select
                        value={param.type}
                        onChange={(e) =>
                          handleUpdateParam(param.id, {
                            type: e.target.value as JavaPrimitiveType,
                          })
                        }
                        className="w-full px-2.5 py-1.5 text-xs font-mono bg-white border border-[#E1E7E1] rounded-xl focus:border-[#407B5D] focus:outline-none cursor-pointer"
                      >
                        {PRIMITIVE_TYPES.map((pt) => (
                          <option key={pt} value={pt}>
                            {pt}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Name */}
                    <div className="sm:col-span-4 space-y-1">
                      <label className="text-[11px] font-bold text-[#232A24] flex items-center justify-between">
                        <span>Nombre del Parámetro</span>
                        <span className="font-mono text-[10px] text-[#59645C]">camelCase</span>
                      </label>
                      <input
                        type="text"
                        value={param.name}
                        onChange={(e) =>
                          handleUpdateParam(param.id, {
                            name: e.target.value.replace(/\s+/g, ''),
                          })
                        }
                        placeholder="ej: xInicial, longInicial"
                        className={`w-full px-2.5 py-1.5 text-xs font-mono bg-white border rounded-xl focus:outline-none ${
                          !isNameValid || isReserved
                            ? 'border-red-400 text-red-700'
                            : !isCamel
                            ? 'border-amber-400 text-amber-800'
                            : 'border-[#E1E7E1] text-[#232A24] focus:border-[#407B5D]'
                        }`}
                      />
                    </div>

                    {/* Target Field Mapping */}
                    <div className="sm:col-span-5 space-y-1">
                      <label className="text-[11px] font-bold text-[#232A24] flex items-center justify-between">
                        <span>Campo de Destino al Asignar</span>
                        {isTypeMismatch && (
                          <span className="text-[10px] text-red-600 font-bold">Tipo incompatible</span>
                        )}
                      </label>
                      <select
                        value={param.targetFieldId || ''}
                        onChange={(e) => {
                          const targetId = e.target.value || undefined;
                          const found = project.fields.find((f) => f.id === targetId);
                          handleUpdateParam(param.id, {
                            targetFieldId: targetId,
                            // Optionally sync type automatically
                            type: found ? found.type : param.type,
                          });
                        }}
                        className={`w-full px-2.5 py-1.5 text-xs bg-white border rounded-xl focus:outline-none cursor-pointer ${
                          isTypeMismatch ? 'border-red-400 text-red-700' : 'border-[#E1E7E1] focus:border-[#407B5D]'
                        }`}
                      >
                        <option value="">(Sin asignar / parámetro huérfano)</option>
                        {project.fields.map((f) => (
                          <option key={f.id} value={f.id}>
                            {f.name} ({f.type}) — {f.description || f.initStrategy}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Generated assignment preview */}
                  {targetField && (
                    <div className="p-2.5 bg-[#F7F8F4] border border-[#E1E7E1] rounded-xl flex items-center justify-between text-xs font-mono">
                      <span className="text-[11px] text-[#59645C]">Línea generada dentro del constructor:</span>
                      <code className="text-[#407B5D] font-bold">
                        {param.name === targetField.name
                          ? `this.${targetField.name} = ${param.name};`
                          : `${targetField.name} = ${param.name};`}
                      </code>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
