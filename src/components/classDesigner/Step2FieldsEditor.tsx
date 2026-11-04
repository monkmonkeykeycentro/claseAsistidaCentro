/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  ClassDesignProject,
  ClassDesignerField,
  JavaPrimitiveType,
  FieldInitStrategy,
  JAVA_RESERVED_KEYWORDS,
} from '../../types/classDesigner';
import { isValidJavaIdentifier, isCamelCase } from '../../services/classDesignerService';
import {
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Sliders,
  HelpCircle,
  AlertTriangle,
  Lightbulb,
} from 'lucide-react';

interface Step2Props {
  project: ClassDesignProject;
  onChange: (updated: ClassDesignProject) => void;
}

const PRIMITIVE_TYPES: { value: JavaPrimitiveType; label: string; desc: string }[] = [
  { value: 'float', label: 'float', desc: 'Decimales continuos (ej: posiciones, velocidades, radios)' },
  { value: 'int', label: 'int', desc: 'Números enteros (ej: contadores, índices de iteración)' },
  { value: 'color', label: 'color', desc: 'Valores cromáticos de Processing (ej: color(255, 0, 0))' },
  { value: 'boolean', label: 'boolean', desc: 'Bifurcaciones binarias: true o false (ej: activo, visible)' },
  { value: 'String', label: 'String', desc: 'Cadenas de texto alfanumérico entre comillas' },
];

export const Step2FieldsEditor: React.FC<Step2Props> = ({ project, onChange }) => {
  const handleAddField = () => {
    const newId = `f-${Date.now()}`;
    const newField: ClassDesignerField = {
      id: newId,
      name: `nuevoCampo${project.fields.length + 1}`,
      type: 'float',
      description: 'Propiedad de estado del objeto',
      initStrategy: 'constructor-param',
    };

    onChange({
      ...project,
      fields: [...project.fields, newField],
    });
  };

  const handleUpdateField = (id: string, updates: Partial<ClassDesignerField>) => {
    onChange({
      ...project,
      fields: project.fields.map((f) => (f.id === id ? { ...f, ...updates } : f)),
    });
  };

  const handleDeleteField = (id: string) => {
    // Also remove from constructor params mapping and method relations
    onChange({
      ...project,
      fields: project.fields.filter((f) => f.id !== id),
      constructorParams: project.constructorParams.map((p) =>
        p.targetFieldId === id ? { ...p, targetFieldId: undefined } : p
      ),
      methods: project.methods.map((m) => ({
        ...m,
        relatedFieldIds: m.relatedFieldIds.filter((fId) => fId !== id),
      })),
    });
  };

  const handleMoveField = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= project.fields.length) return;

    const reordered = [...project.fields];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);

    onChange({
      ...project,
      fields: reordered,
    });
  };

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="space-y-1.5 border-b border-[#E1E7E1] pb-4">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 bg-[#E8EEE8] text-[#407B5D] text-xs font-bold rounded-md">
            Etapa 2 de 6
          </span>
          <span className="text-xs font-medium text-[#59645C]">
            Campos y Variables de Estado
          </span>
        </div>
        <h2 className="text-xl font-bold text-[#232A24]">
          ¿Qué datos necesita recordar cada instancia de tu clase?
        </h2>
        <p className="text-xs text-[#59645C] leading-relaxed">
          Los <strong className="text-[#232A24]">campos</strong> (o atributos) son las variables que residen dentro del objeto. Definen su aspecto, posición espacial, tamaño, color y variables físicas.
        </p>
      </div>

      {/* Strategy Explanation Card */}
      <div className="p-4 bg-[#F7F8F4] border border-[#E1E7E1] rounded-2xl grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        <div className="p-3 bg-white border border-[#E1E7E1] rounded-xl space-y-1">
          <span className="font-bold text-[#407B5D] block">Estrategia A · Constructor</span>
          <p className="text-[11px] text-[#59645C] leading-relaxed">
            Se recibe como argumento al instanciar (<code className="bg-[#E8EEE8] px-1 rounded">new Objeto(...)</code>). Ideal para posición o colores únicos.
          </p>
        </div>

        <div className="p-3 bg-white border border-[#E1E7E1] rounded-xl space-y-1">
          <span className="font-bold text-[#2868D9] block">Estrategia B · Valor Interno</span>
          <p className="text-[11px] text-[#59645C] leading-relaxed">
            Nace con un valor constante o fijo para todas las instancias (ej: <code className="bg-[#E8EEE8] px-1 rounded">velocidad = 0.0</code>).
          </p>
        </div>

        <div className="p-3 bg-white border border-[#E1E7E1] rounded-xl space-y-1">
          <span className="font-bold text-[#9A6700] block">Estrategia C · Posterior</span>
          <p className="text-[11px] text-[#59645C] leading-relaxed">
            Se calcula o inicializa más tarde dentro de un método interactivo o de actualización.
          </p>
        </div>
      </div>

      {/* Fields List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#232A24] uppercase tracking-wider">
            Variables de Estado Definidas ({project.fields.length})
          </span>
          <button
            onClick={handleAddField}
            className="min-h-[34px] px-3 py-1.5 bg-[#407B5D] hover:bg-[#33654C] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Agregar Campo</span>
          </button>
        </div>

        {project.fields.length === 0 ? (
          <div className="p-8 border-2 border-dashed border-[#E1E7E1] rounded-2xl text-center space-y-3">
            <Sliders className="w-8 h-8 text-[#59645C] mx-auto" />
            <p className="text-xs text-[#59645C]">
              No has definido ningún campo todavía. Agrega al menos una coordenada (como <code className="font-bold text-[#232A24]">x</code> o <code className="font-bold text-[#232A24]">y</code>) para comenzar.
            </p>
            <button
              onClick={handleAddField}
              className="px-4 py-2 bg-[#407B5D] text-white text-xs font-bold rounded-xl inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Crear primer campo</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {project.fields.map((field, index) => {
              const isNameValid = isValidJavaIdentifier(field.name);
              const isReserved = JAVA_RESERVED_KEYWORDS.has(field.name.toLowerCase());
              const isCamel = isCamelCase(field.name);

              return (
                <div
                  key={field.id}
                  className="p-4 bg-white border border-[#E1E7E1] hover:border-[#407B5D]/60 rounded-2xl space-y-3 shadow-xs transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E1E7E1] pb-2.5">
                    {/* Index + Name */}
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-[#E8EEE8] text-[#407B5D] font-mono font-bold text-xs flex items-center justify-center shrink-0">
                        {index + 1}
                      </span>
                      <span className="font-mono text-xs font-bold text-[#232A24]">
                        {field.name || '(sin nombre)'}
                      </span>
                      <span className="px-2 py-0.5 bg-[#F7F8F4] border border-[#E1E7E1] text-[#59645C] text-[10px] font-mono rounded">
                        {field.type}
                      </span>
                    </div>

                    {/* Controls: Reorder + Delete */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleMoveField(index, 'up')}
                        disabled={index === 0}
                        className="p-1.5 hover:bg-[#E8EEE8] text-[#59645C] disabled:opacity-30 rounded-lg cursor-pointer"
                        title="Mover arriba"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleMoveField(index, 'down')}
                        disabled={index === project.fields.length - 1}
                        className="p-1.5 hover:bg-[#E8EEE8] text-[#59645C] disabled:opacity-30 rounded-lg cursor-pointer"
                        title="Mover abajo"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteField(field.id)}
                        className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg cursor-pointer ml-1"
                        title="Eliminar campo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Field Configuration Inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-start">
                    {/* Type Selector */}
                    <div className="sm:col-span-3 space-y-1">
                      <label className="text-[11px] font-bold text-[#232A24] block">Tipo de Dato</label>
                      <select
                        value={field.type}
                        onChange={(e) =>
                          handleUpdateField(field.id, {
                            type: e.target.value as JavaPrimitiveType,
                          })
                        }
                        className="w-full px-2.5 py-1.5 text-xs font-mono bg-white border border-[#E1E7E1] rounded-xl focus:border-[#407B5D] focus:outline-none cursor-pointer"
                      >
                        {PRIMITIVE_TYPES.map((pt) => (
                          <option key={pt.value} value={pt.value}>
                            {pt.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Field Identifier Name */}
                    <div className="sm:col-span-4 space-y-1">
                      <label className="text-[11px] font-bold text-[#232A24] flex items-center justify-between">
                        <span>Nombre del Campo</span>
                        <span className="font-mono text-[10px] text-[#59645C]">camelCase</span>
                      </label>
                      <input
                        type="text"
                        value={field.name}
                        onChange={(e) =>
                          handleUpdateField(field.id, {
                            name: e.target.value.replace(/\s+/g, ''),
                          })
                        }
                        placeholder="ej: x, velocidadY, colorTrazo"
                        className={`w-full px-2.5 py-1.5 text-xs font-mono bg-white border rounded-xl focus:outline-none ${
                          !isNameValid || isReserved
                            ? 'border-red-400 text-red-700'
                            : !isCamel
                            ? 'border-amber-400 text-amber-800'
                            : 'border-[#E1E7E1] text-[#232A24] focus:border-[#407B5D]'
                        }`}
                      />
                    </div>

                    {/* Initialization Strategy */}
                    <div className="sm:col-span-5 space-y-1">
                      <label className="text-[11px] font-bold text-[#232A24] block">
                        Estrategia de Inicialización
                      </label>
                      <select
                        value={field.initStrategy}
                        onChange={(e) =>
                          handleUpdateField(field.id, {
                            initStrategy: e.target.value as FieldInitStrategy,
                          })
                        }
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#E1E7E1] rounded-xl focus:border-[#407B5D] focus:outline-none cursor-pointer"
                      >
                        <option value="constructor-param">Estrategia A: Parámetro del constructor (new)</option>
                        <option value="default-value">Estrategia B: Valor predeterminado fijo</option>
                        <option value="later">Estrategia C: Inicialización posterior en método</option>
                      </select>
                    </div>
                  </div>

                  {/* Sub-row: Default value if Strategy B, plus Field Description */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center pt-1">
                    {field.initStrategy === 'default-value' ? (
                      <>
                        <div className="sm:col-span-4 space-y-1">
                          <label className="text-[11px] font-bold text-[#232A24] block">
                            Valor Fijo Predeterminado
                          </label>
                          <input
                            type="text"
                            value={field.defaultValue || ''}
                            onChange={(e) =>
                              handleUpdateField(field.id, { defaultValue: e.target.value })
                            }
                            placeholder="ej: 0.0, 120.0, color(0)"
                            className="w-full px-2.5 py-1.5 text-xs font-mono bg-white border border-[#E1E7E1] rounded-xl focus:border-[#407B5D] focus:outline-none"
                          />
                        </div>
                        <div className="sm:col-span-8 space-y-1">
                          <label className="text-[11px] font-bold text-[#232A24] block">
                            Descripción / Rol en el Objeto
                          </label>
                          <input
                            type="text"
                            value={field.description}
                            onChange={(e) =>
                              handleUpdateField(field.id, { description: e.target.value })
                            }
                            placeholder="¿Qué aspecto controla esta variable?"
                            className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#E1E7E1] rounded-xl focus:border-[#407B5D] focus:outline-none"
                          />
                        </div>
                      </>
                    ) : (
                      <div className="sm:col-span-12 space-y-1">
                        <label className="text-[11px] font-bold text-[#232A24] block">
                          Descripción / Rol en el Objeto
                        </label>
                        <input
                          type="text"
                          value={field.description}
                          onChange={(e) =>
                            handleUpdateField(field.id, { description: e.target.value })
                          }
                          placeholder="¿Qué aspecto controla esta variable en la clase?"
                          className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#E1E7E1] rounded-xl focus:border-[#407B5D] focus:outline-none"
                        />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
