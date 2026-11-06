/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ClassDesignerStepIntro } from './ClassDesignerContentContext';
import {
  ClassDesignProject,
  MethodRelationType,
} from '../../types/classDesigner';
import {
  Eye,
  Edit3,
  RefreshCw,
  HelpCircle,
  Layers,
  ArrowRight,
} from 'lucide-react';

interface Step5Props {
  project: ClassDesignProject;
  onChange: (updated: ClassDesignProject) => void;
}

export const Step5RelationsEditor: React.FC<Step5Props> = ({ project, onChange }) => {
  const handleToggleRelation = (methodId: string, fieldId: string) => {
    const updatedMethods = project.methods.map((method) => {
      if (method.id !== methodId) return method;

      const isRelated = method.relatedFieldIds.includes(fieldId);
      let nextRelated: string[];
      if (isRelated) {
        nextRelated = method.relatedFieldIds.filter((id) => id !== fieldId);
      } else {
        nextRelated = [...method.relatedFieldIds, fieldId];
      }

      return {
        ...method,
        relatedFieldIds: nextRelated,
      };
    });

    onChange({
      ...project,
      methods: updatedMethods,
    });
  };

  const handleSetRelationType = (methodId: string, type: MethodRelationType) => {
    onChange({
      ...project,
      methods: project.methods.map((m) => (m.id === methodId ? { ...m, relationType: type } : m)),
    });
  };

  return (
    <div className="space-y-6">
      <ClassDesignerStepIntro step={5} className={project.className} />

      {/* Legend Card */}
      <div className="p-4 bg-[#F7F8F4] border border-[#E1E7E1] rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 font-bold text-[#232A24]">
          <Layers className="w-4 h-4 text-[#407B5D]" />
          <span>Convención de Interacción:</span>
        </div>
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#407B5D]" />
            <span className="text-[#59645C]">Lectura (reads: ej. dibujar, render)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#2868D9]" />
            <span className="text-[#59645C]">Modificación (mutates: ej. mover, estirar)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#9A6700]" />
            <span className="text-[#59645C]">Lectura y Modificación (both: ej. oscilar)</span>
          </div>
        </div>
      </div>

      {/* Relationship Table Matrix */}
      {project.methods.length === 0 || project.fields.length === 0 ? (
        <div className="p-8 border-2 border-dashed border-[#E1E7E1] rounded-2xl text-center space-y-2 text-xs text-[#59645C]">
          <p>
            Necesitas al menos 1 campo y 1 método para establecer la matriz de relaciones.
          </p>
          <p className="text-[11px] text-[#8E8E89]">
            Regresa a las etapas 2 y 4 para agregarlos.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="border border-[#E1E7E1] rounded-2xl bg-white overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-[#F7F8F4] border-b border-[#E1E7E1]">
                    <th className="p-3 font-bold text-[#232A24] w-48 sticky left-0 bg-[#F7F8F4] z-10 border-r border-[#E1E7E1]">
                      Métodos de la Clase
                    </th>
                    <th className="p-3 font-bold text-[#232A24] w-36 border-r border-[#E1E7E1]">
                      Naturaleza
                    </th>
                    {project.fields.map((field) => (
                      <th
                        key={field.id}
                        className="p-3 font-mono font-bold text-[#232A24] text-center min-w-[100px] border-r border-[#E1E7E1] last:border-r-0"
                      >
                        <div>{field.name}</div>
                        <div className="text-[10px] font-normal text-[#59645C]">{field.type}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E1E7E1]">
                  {project.methods.map((method) => {
                    return (
                      <tr key={method.id} className="hover:bg-[#F7F8F4]/50 transition-colors">
                        {/* Method Name Column */}
                        <td className="p-3 font-mono font-bold text-[#232A24] sticky left-0 bg-white z-10 border-r border-[#E1E7E1]">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-[#407B5D]" />
                            <span>{method.name}()</span>
                          </div>
                          <div className="text-[10px] font-normal font-sans text-[#59645C] line-clamp-1">
                            {method.description || 'Sin descripción'}
                          </div>
                        </td>

                        {/* Method Relation Type */}
                        <td className="p-3 border-r border-[#E1E7E1]">
                          <select
                            value={method.relationType}
                            onChange={(e) =>
                              handleSetRelationType(method.id, e.target.value as MethodRelationType)
                            }
                            className="w-full px-2 py-1 text-[11px] bg-[#F7F8F4] border border-[#E1E7E1] rounded-lg focus:outline-none cursor-pointer"
                          >
                            <option value="reads">Lectura</option>
                            <option value="mutates">Modificación</option>
                            <option value="both">Lectura + Modif.</option>
                          </select>
                        </td>

                        {/* Fields Check Matrix */}
                        {project.fields.map((field) => {
                          const isConnected = method.relatedFieldIds.includes(field.id);
                          return (
                            <td
                              key={field.id}
                              onClick={() => handleToggleRelation(method.id, field.id)}
                              className="p-3 text-center border-r border-[#E1E7E1] last:border-r-0 cursor-pointer select-none transition-colors"
                            >
                              <div className="flex justify-center">
                                <span
                                  className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs transition-all ${
                                    isConnected
                                      ? method.relationType === 'mutates'
                                      : 'border border-[#E1E7E1] text-transparent hover:border-[#407B5D]/60'
                                  } ${
                                    isConnected && method.relationType === 'reads'
                                      ? 'bg-[#407B5D] text-white shadow-2xs'
                                      : isConnected && method.relationType === 'mutates'
                                      ? 'bg-[#2868D9] text-white shadow-2xs'
                                      : isConnected && method.relationType === 'both'
                                      ? 'bg-[#9A6700] text-white shadow-2xs'
                                      : ''
                                  }`}
                                >
                                  {isConnected ? '✓' : ''}
                                </span>
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <p className="text-[11px] text-[#59645C] text-right italic">
            * Haz clic en cualquier casilla de la matriz para vincular o desvincular un campo a un método.
          </p>
        </div>
      )}
    </div>
  );
};
