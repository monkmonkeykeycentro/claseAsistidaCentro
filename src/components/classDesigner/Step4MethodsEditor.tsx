/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  ClassDesignProject,
  ClassDesignerMethod,
  ClassDesignerMethodParam,
  JavaPrimitiveType,
  JAVA_RESERVED_KEYWORDS,
} from '../../types/classDesigner';
import { isValidJavaIdentifier, isCamelCase } from '../../services/classDesignerService';
import {
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Code2,
  HelpCircle,
  Lightbulb,
} from 'lucide-react';

interface Step4Props {
  project: ClassDesignProject;
  onChange: (updated: ClassDesignProject) => void;
}

const RETURN_TYPES: { value: 'void' | JavaPrimitiveType; label: string }[] = [
  { value: 'void', label: 'void (no retorna valor, ejecuta una acción visual o de cambio)' },
  { value: 'float', label: 'float (retorna un número decimal, ej: distancia, radio)' },
  { value: 'int', label: 'int (retorna un entero, ej: conteo, índice)' },
  { value: 'boolean', label: 'boolean (retorna true o false, ej: estáSobreElObjeto())' },
  { value: 'color', label: 'color (retorna un tono cromático)' },
  { value: 'String', label: 'String (retorna texto)' },
];

const PARAM_TYPES: JavaPrimitiveType[] = ['float', 'int', 'color', 'boolean', 'String'];

export const Step4MethodsEditor: React.FC<Step4Props> = ({ project, onChange }) => {
  const handleAddMethod = () => {
    const newId = `m-${Date.now()}`;
    const newMethod: ClassDesignerMethod = {
      id: newId,
      name: `metodo${project.methods.length + 1}`,
      returnType: 'void',
      description: 'Acción que realiza el objeto',
      params: [],
      relatedFieldIds: project.fields.slice(0, 2).map((f) => f.id),
      relationType: 'reads',
    };

    onChange({
      ...project,
      methods: [...project.methods, newMethod],
    });
  };

  const handleUpdateMethod = (id: string, updates: Partial<ClassDesignerMethod>) => {
    onChange({
      ...project,
      methods: project.methods.map((m) => (m.id === id ? { ...m, ...updates } : m)),
    });
  };

  const handleDeleteMethod = (id: string) => {
    onChange({
      ...project,
      methods: project.methods.filter((m) => m.id !== id),
    });
  };

  const handleMoveMethod = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= project.methods.length) return;

    const reordered = [...project.methods];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);

    onChange({
      ...project,
      methods: reordered,
    });
  };

  const handleAddMethodParam = (methodId: string) => {
    const method = project.methods.find((m) => m.id === methodId);
    if (!method) return;

    const newParam: ClassDesignerMethodParam = {
      id: `mp-${Date.now()}`,
      name: `param${method.params.length + 1}`,
      type: 'float',
    };

    handleUpdateMethod(methodId, {
      params: [...method.params, newParam],
    });
  };

  const handleUpdateMethodParam = (
    methodId: string,
    paramId: string,
    updates: Partial<ClassDesignerMethodParam>
  ) => {
    const method = project.methods.find((m) => m.id === methodId);
    if (!method) return;

    handleUpdateMethod(methodId, {
      params: method.params.map((p) => (p.id === paramId ? { ...p, ...updates } : p)),
    });
  };

  const handleDeleteMethodParam = (methodId: string, paramId: string) => {
    const method = project.methods.find((m) => m.id === methodId);
    if (!method) return;

    handleUpdateMethod(methodId, {
      params: method.params.filter((p) => p.id !== paramId),
    });
  };

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="space-y-1.5 border-b border-[#E1E7E1] pb-4">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 bg-[#E8EEE8] text-[#407B5D] text-xs font-bold rounded-md">
            Etapa 4 de 6
          </span>
          <span className="text-xs font-medium text-[#59645C]">
            Diseñar Métodos y Comportamientos
          </span>
        </div>
        <h2 className="text-xl font-bold text-[#232A24]">
          ¿Qué acciones o transformaciones puede ejecutar tu objeto?
        </h2>
        <p className="text-xs text-[#59645C] leading-relaxed">
          Los <strong className="text-[#232A24]">métodos</strong> son las funciones internas del objeto. Permiten que se dibuje en el lienzo (<code className="bg-[#E8EEE8] px-1 py-0.5 rounded text-[#232A24] font-bold">mostrar()</code>), altere sus variables (<code className="bg-[#E8EEE8] px-1 py-0.5 rounded text-[#232A24] font-bold">estirar(fuerza)</code>) o responda al paso del tiempo (<code className="bg-[#E8EEE8] px-1 py-0.5 rounded text-[#232A24] font-bold">oscilar()</code>).
        </p>
      </div>

      {/* Pedagogical Notice */}
      <div className="p-4 bg-[#F7F8F4] border border-[#E1E7E1] rounded-2xl flex items-start gap-3">
        <Lightbulb className="w-5 h-5 text-[#E6B65A] shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <span className="font-bold text-[#232A24] block">
            Principio Pedagógico del Diseñador
          </span>
          <p className="text-[#59645C] leading-relaxed">
            Esta herramienta genera la estructura anatómica limpia y comentarios orientadores con <code className="bg-white px-1.5 py-0.5 border border-[#E1E7E1] rounded text-[#232A24] font-mono">// TODO: [descripción]</code>. El código visual final lo escribes tú en Processing para desarrollar tu propio criterio creativo y resolución de algoritmos.
          </p>
        </div>
      </div>

      {/* Methods List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#232A24] uppercase tracking-wider">
            Métodos y Acciones Definidas ({project.methods.length})
          </span>
          <button
            onClick={handleAddMethod}
            className="min-h-[34px] px-3 py-1.5 bg-[#407B5D] hover:bg-[#33654C] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Agregar Método</span>
          </button>
        </div>

        {project.methods.length === 0 ? (
          <div className="p-8 border-2 border-dashed border-[#E1E7E1] rounded-2xl text-center space-y-3">
            <Code2 className="w-8 h-8 text-[#59645C] mx-auto" />
            <p className="text-xs text-[#59645C]">
              Aún no has agregado métodos. Un objeto interactivo suele requerir al menos un método para dibujarse (ej: <code className="font-bold text-[#232A24]">mostrar()</code>).
            </p>
            <button
              onClick={handleAddMethod}
              className="px-4 py-2 bg-[#407B5D] text-white text-xs font-bold rounded-xl inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Crear método mostrar()</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {project.methods.map((method, index) => {
              const isNameValid = isValidJavaIdentifier(method.name);
              const isReserved = JAVA_RESERVED_KEYWORDS.has(method.name.toLowerCase());
              const isCamel = isCamelCase(method.name);

              return (
                <div
                  key={method.id}
                  className="p-4 sm:p-5 bg-white border border-[#E1E7E1] hover:border-[#407B5D]/60 rounded-2xl space-y-4 shadow-xs transition-all"
                >
                  {/* Top Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E1E7E1] pb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-[#E8EEE8] text-[#407B5D] font-mono font-bold text-xs flex items-center justify-center shrink-0">
                        {index + 1}
                      </span>
                      <span className="font-mono text-xs font-bold text-[#232A24]">
                        {method.returnType} {method.name}(...)
                      </span>
                    </div>

                    {/* Reorder and Delete */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleMoveMethod(index, 'up')}
                        disabled={index === 0}
                        className="p-1.5 hover:bg-[#E8EEE8] text-[#59645C] disabled:opacity-30 rounded-lg cursor-pointer"
                        title="Mover arriba"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleMoveMethod(index, 'down')}
                        disabled={index === project.methods.length - 1}
                        className="p-1.5 hover:bg-[#E8EEE8] text-[#59645C] disabled:opacity-30 rounded-lg cursor-pointer"
                        title="Mover abajo"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteMethod(method.id)}
                        className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg cursor-pointer ml-1"
                        title="Eliminar método"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Method Signature Inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-start">
                    {/* Return Type */}
                    <div className="sm:col-span-4 space-y-1">
                      <label className="text-[11px] font-bold text-[#232A24] block">Tipo de Retorno</label>
                      <select
                        value={method.returnType}
                        onChange={(e) =>
                          handleUpdateMethod(method.id, {
                            returnType: e.target.value as 'void' | JavaPrimitiveType,
                          })
                        }
                        className="w-full px-2.5 py-1.5 text-xs font-mono bg-white border border-[#E1E7E1] rounded-xl focus:border-[#407B5D] focus:outline-none cursor-pointer"
                      >
                        {RETURN_TYPES.map((rt) => (
                          <option key={rt.value} value={rt.value}>
                            {rt.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Method Name */}
                    <div className="sm:col-span-8 space-y-1">
                      <label className="text-[11px] font-bold text-[#232A24] flex items-center justify-between">
                        <span>Nombre del Método (Verbo de acción)</span>
                        <span className="font-mono text-[10px] text-[#59645C]">camelCase</span>
                      </label>
                      <input
                        type="text"
                        value={method.name}
                        onChange={(e) =>
                          handleUpdateMethod(method.id, {
                            name: e.target.value.replace(/\s+/g, ''),
                          })
                        }
                        placeholder="ej: mostrar, estirar, oscilar, calcularDistancia"
                        className={`w-full px-2.5 py-1.5 text-xs font-mono bg-white border rounded-xl focus:outline-none ${
                          !isNameValid || isReserved
                            ? 'border-red-400 text-red-700'
                            : !isCamel
                            ? 'border-amber-400 text-amber-800'
                            : 'border-[#E1E7E1] text-[#232A24] focus:border-[#407B5D]'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Method Purpose Description */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-[#232A24] block">
                      Descripción de la Acción (se incluirá como comentario guía // TODO)
                    </label>
                    <input
                      type="text"
                      value={method.description}
                      onChange={(e) =>
                        handleUpdateMethod(method.id, { description: e.target.value })
                      }
                      placeholder="ej: Dibuja las espiras del resorte entre el anclaje y el extremo inferior..."
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#E1E7E1] rounded-xl focus:border-[#407B5D] focus:outline-none"
                    />
                  </div>

                  {/* Method Parameters Sub-section */}
                  <div className="p-3 bg-[#F7F8F4] border border-[#E1E7E1] rounded-xl space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-[#232A24] flex items-center gap-1.5">
                        <span>Argumentos que recibe este método ({method.params.length})</span>
                      </span>
                      <button
                        onClick={() => handleAddMethodParam(method.id)}
                        className="px-2.5 py-1 bg-white hover:bg-[#E8EEE8] border border-[#E1E7E1] text-[#407B5D] text-[11px] font-bold rounded-lg cursor-pointer flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Agregar argumento</span>
                      </button>
                    </div>

                    {method.params.length === 0 ? (
                      <p className="text-[11px] text-[#59645C] italic">
                        Sin argumentos. Se invoca como <code className="font-mono text-[#232A24]">{method.name}()</code>.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {method.params.map((param, pIdx) => (
                          <div
                            key={param.id}
                            className="flex items-center gap-2 bg-white p-2 border border-[#E1E7E1] rounded-lg"
                          >
                            <span className="text-[10px] font-mono text-[#59645C]">
                              #{pIdx + 1}
                            </span>
                            <select
                              value={param.type}
                              onChange={(e) =>
                                handleUpdateMethodParam(method.id, param.id, {
                                  type: e.target.value as JavaPrimitiveType,
                                })
                              }
                              className="px-2 py-1 text-xs font-mono border border-[#E1E7E1] rounded"
                            >
                              {PARAM_TYPES.map((t) => (
                                <option key={t} value={t}>
                                  {t}
                                </option>
                              ))}
                            </select>
                            <input
                              type="text"
                              value={param.name}
                              onChange={(e) =>
                                handleUpdateMethodParam(method.id, param.id, {
                                  name: e.target.value.replace(/\s+/g, ''),
                                })
                              }
                              placeholder="nombreParam"
                              className="px-2 py-1 text-xs font-mono border border-[#E1E7E1] rounded flex-1 focus:border-[#407B5D] focus:outline-none"
                            />
                            <button
                              onClick={() => handleDeleteMethodParam(method.id, param.id)}
                              className="p-1 hover:bg-red-50 text-red-600 rounded cursor-pointer"
                              title="Quitar argumento"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
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
