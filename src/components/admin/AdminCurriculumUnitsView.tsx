/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  CURRICULUM_UNITS,
  ExerciseDefinition,
  UnitDefinition,
  UnitPublicationStatus,
} from '../../data/unitsData';
import {
  loadCurriculumStatusMap,
  saveExercisePublicationStatus,
  setUnitPublicationStatus,
  getCurriculumInventory,
  CurriculumInventorySummary,
} from '../../services/unitsCurriculumService';
import {
  BookOpen,
  CheckCircle,
  AlertTriangle,
  Eye,
  EyeOff,
  Layers,
  ArrowUp,
  ArrowDown,
  ChevronDown,
  ChevronUp,
  Code2,
  FileText,
  HelpCircle,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';

interface AdminCurriculumUnitsViewProps {
  adminEmail?: string;
  onPreviewAsStudent: () => void;
  onOpenExerciseInRunner: (unitId: 'u1' | 'u2' | 'u3', exerciseId: string) => void;
}

export const AdminCurriculumUnitsView: React.FC<AdminCurriculumUnitsViewProps> = ({
  adminEmail,
  onPreviewAsStudent,
  onOpenExerciseInRunner,
}) => {
  const [statusMap, setStatusMap] = useState<Record<string, UnitPublicationStatus>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedUnitFilter, setSelectedUnitFilter] = useState<'all' | 'u1' | 'u2' | 'u3'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'published'>('all');
  const [expandedExerciseId, setExpandedExerciseId] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // Load publication status on mount
  const refreshStatus = async () => {
    setIsLoading(true);
    try {
      const map = await loadCurriculumStatusMap();
      setStatusMap(map);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshStatus();
  }, []);

  const inventory: CurriculumInventorySummary = getCurriculumInventory(statusMap);

  const handleToggleStatus = async (ex: ExerciseDefinition) => {
    if (ex.inventoryStatus === 'ya_existia') {
      alert('El ejercicio U2·02 es preexistente y se conserva permanentemente publicado y protegido.');
      return;
    }
    const current = statusMap[ex.id] || ex.status;
    const next: UnitPublicationStatus = current === 'published' ? 'draft' : 'published';
    try {
      const updated = await saveExercisePublicationStatus(ex.id, next, adminEmail);
      setStatusMap(updated);
      setNotification(
        next === 'published'
          ? `Actividad ${ex.code} ("${ex.title}") publicada. Ahora es visible para los estudiantes.`
          : `Actividad ${ex.code} pasada a borrador (oculta para estudiantes).`
      );
      setTimeout(() => setNotification(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Error actualizando estado.');
    }
  };

  const handlePublishAllInUnit = async (unitId: 'u1' | 'u2' | 'u3', publish: boolean) => {
    const next: UnitPublicationStatus = publish ? 'published' : 'draft';
    const actionText = publish ? 'publicar' : 'revertir a borrador';
    if (!confirm(`¿Deseas ${actionText} todas las actividades nuevas de la Unidad ${unitId.toUpperCase()}?`)) {
      return;
    }
    setIsLoading(true);
    try {
      const updated = await setUnitPublicationStatus(unitId, next, adminEmail);
      setStatusMap(updated);
      setNotification(`Unidad ${unitId.toUpperCase()} actualizada a estado ${next}.`);
      setTimeout(() => setNotification(null), 4000);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUnits = CURRICULUM_UNITS.filter((u) => {
    if (selectedUnitFilter === 'all') return true;
    return u.id === selectedUnitFilter;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* 1. Header & Inventory Summary Banner */}
      <div className="p-5 bg-white border border-[#E1E7E1] rounded-2xl shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E1E7E1] pb-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#407B5D]">
              <span className="font-bold uppercase tracking-wider bg-[#E8EEE8] px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Revisión Docente · U1–U3</span>
              </span>
              <span className="text-[#8E8E89]">Segundo Semestre</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#232A24] tracking-tight mt-1">
              Propuesta Curricular y Gestión de Actividades (14 Prácticas)
            </h2>
            <p className="text-xs text-[#59645C] max-w-3xl leading-relaxed mt-1">
              Inventario clasificado según la regla de protección docente: los ejercicios preexistentes se conservan intactos; las 13 actividades nuevas se crean en estado <strong>Borrador</strong> para revisión y publicación manual del profesorado.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onPreviewAsStudent}
              className="min-h-[38px] px-3.5 py-2 rounded-xl bg-white hover:bg-[#E8EEE8] border border-[#E1E7E1] text-[#232A24] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              title="Explorar actividades en modo estudiante"
            >
              <Eye className="w-4 h-4 text-[#407B5D]" />
              <span>Ver como Estudiante</span>
            </button>
            <button
              onClick={refreshStatus}
              className="p-2 border border-[#E1E7E1] bg-white hover:bg-[#E8EEE8] rounded-xl text-[#59645C] cursor-pointer"
              title="Refrescar estados"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Inventory Report Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
          {/* Card 1: Ya existía */}
          <div className="p-3.5 bg-[#F7F8F4] border border-[#A4C4B5] rounded-xl space-y-1">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-[#407B5D] font-bold flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" />
                YA EXISTÍA (PROTEGIDO)
              </span>
              <span className="text-sm font-extrabold text-[#232A24]">{inventory.yaExistia.length}</span>
            </div>
            <p className="text-[11px] text-[#59645C] leading-snug">
              <strong>U2·02 Cartografía del lienzo:</strong> Se reutiliza íntegramente el ejercicio cartesiano interactivo previo sin duplicación ni cambios.
            </p>
          </div>

          {/* Card 2: Creado como borrador */}
          <div className="p-3.5 bg-[#F7F8F4] border border-[#E1E7E1] rounded-xl space-y-1">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-[#2868D9] font-bold flex items-center gap-1">
                <Layers className="w-3.5 h-3.5" />
                CREADOS COMO BORRADOR
              </span>
              <span className="text-sm font-extrabold text-[#232A24]">{inventory.creadoBorrador.length}</span>
            </div>
            <p className="text-[11px] text-[#59645C] leading-snug">
              13 actividades nuevas con especificación completa, 5 etapas pedagógicas y ejemplos Processing Java listos para revisión.
            </p>
          </div>

          {/* Card 3: Requiere decisión docente */}
          <div className="p-3.5 bg-[#FFF9EE] border border-[#E6C687] rounded-xl space-y-1">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-[#8A6318] font-bold flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                REQUIERE DECISIÓN DOCENTE
              </span>
              <span className="text-sm font-extrabold text-[#8A6318]">{inventory.requiereDecisionDocente.length}</span>
            </div>
            <p className="text-[11px] text-[#8A6318] leading-snug">
              {inventory.requiereDecisionDocente.length === 0
                ? 'Todas las actividades han sido aprobadas y publicadas para los estudiantes.'
                : `${inventory.requiereDecisionDocente.length} actividades en borrador esperando aprobación o publicación manual.`}
            </p>
          </div>
        </div>
      </div>

      {notification && (
        <div className="p-3.5 bg-[#E8EEE8] border border-[#407B5D] text-[#232A24] text-xs font-semibold rounded-xl flex items-center gap-2 shadow-xs animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-[#407B5D] shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* 2. Filter & Bulk Action Controls */}
      <div className="p-4 bg-white border border-[#E1E7E1] rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2 overflow-x-auto py-1 text-xs">
          <span className="font-semibold text-[#59645C] shrink-0">Filtrar Unidad:</span>
          {(['all', 'u1', 'u2', 'u3'] as const).map((uid) => (
            <button
              key={uid}
              onClick={() => setSelectedUnitFilter(uid)}
              className={`px-3 py-1.5 rounded-lg border font-semibold transition-colors cursor-pointer shrink-0 ${
                selectedUnitFilter === uid
                  ? 'bg-[#407B5D] text-white border-[#407B5D]'
                  : 'bg-[#F7F8F4] text-[#232A24] border-[#E1E7E1] hover:bg-[#E8EEE8]'
              }`}
            >
              {uid === 'all'
                ? 'Todas (14)'
                : uid === 'u1'
                ? 'Unidad 1 (3)'
                : uid === 'u2'
                ? 'Unidad 2 (6)'
                : 'Unidad 3 (5)'}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="font-semibold text-[#59645C] shrink-0">Estado:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-1.5 bg-[#F7F8F4] border border-[#E1E7E1] rounded-xl text-xs text-[#232A24] focus:outline-none"
          >
            <option value="all">Todos los estados</option>
            <option value="draft">Solo Borradores ({inventory.requiereDecisionDocente.length})</option>
            <option value="published">Solo Publicadas ({14 - inventory.requiereDecisionDocente.length})</option>
          </select>
        </div>
      </div>

      {/* 3. Units & Activities List */}
      <div className="space-y-6">
        {filteredUnits.map((unit) => {
          const unitExercises = unit.exercises.filter((ex) => {
            const currentStatus = statusMap[ex.id] || ex.status;
            if (statusFilter === 'all') return true;
            return currentStatus === statusFilter;
          });

          return (
            <div
              key={unit.id}
              className="p-5 sm:p-6 bg-white border border-[#E1E7E1] rounded-2xl shadow-xs space-y-4"
            >
              {/* Unit Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E1E7E1] pb-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-[#E8EEE8] text-[#407B5D]">
                      UNIDAD {unit.number}
                    </span>
                    <span className="text-xs text-[#59645C] font-semibold">
                      Proyecto: <em>{unit.creativeSubtitle}</em>
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-[#232A24]">
                    {unit.title}
                  </h3>
                  <p className="text-xs text-[#59645C] italic">
                    «{unit.unitQuestion}»
                  </p>
                </div>

                {/* Bulk unit controls */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handlePublishAllInUnit(unit.id, true)}
                    className="min-h-[34px] px-3 py-1.5 bg-[#E8EEE8] hover:bg-[#d5e4d5] text-[#407B5D] text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                    title="Hacer visibles todas las actividades de esta unidad a los estudiantes"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Publicar Unidad</span>
                  </button>
                  <button
                    onClick={() => handlePublishAllInUnit(unit.id, false)}
                    className="min-h-[34px] px-3 py-1.5 bg-white hover:bg-[#FFF2D6] border border-[#E1E7E1] text-[#8A6318] text-xs font-semibold rounded-xl transition-colors cursor-pointer flex items-center gap-1"
                    title="Ocultar actividades nuevas a los estudiantes"
                  >
                    <EyeOff className="w-3.5 h-3.5" />
                    <span>A Borrador</span>
                  </button>
                </div>
              </div>

              {/* Exercises in this unit */}
              {unitExercises.length === 0 ? (
                <div className="p-4 text-center text-xs text-[#59645C] bg-[#F7F8F4] rounded-xl border border-dashed border-[#E1E7E1]">
                  No hay actividades que coincidan con el filtro actual en esta unidad.
                </div>
              ) : (
                <div className="space-y-3">
                  {unitExercises.map((ex) => {
                    const currentStatus = statusMap[ex.id] || ex.status;
                    const isPublished = currentStatus === 'published';
                    const isPreexisting = ex.inventoryStatus === 'ya_existia';
                    const isExpanded = expandedExerciseId === ex.id;

                    return (
                      <div
                        key={ex.id}
                        className={`border rounded-2xl transition-all ${
                          isExpanded
                            ? 'border-[#407B5D] bg-[#F7F8F4] shadow-xs'
                            : 'border-[#E1E7E1] bg-white hover:border-[#407B5D]/60'
                        }`}
                      >
                        {/* Compact exercise card header */}
                        <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-mono text-xs font-bold text-[#407B5D] bg-[#E8EEE8] px-2 py-0.5 rounded">
                                {ex.code}
                              </span>

                              {isPreexisting ? (
                                <span className="text-[10px] font-bold bg-[#E8EEE8] text-[#407B5D] border border-[#A4C4B5] px-2 py-0.5 rounded-full flex items-center gap-1">
                                  <CheckCircle className="w-3 h-3" />
                                  <span>YA EXISTÍA · PROTEGIDO</span>
                                </span>
                              ) : (
                                <span className="text-[10px] font-bold bg-[#EBF1FA] text-[#2868D9] px-2 py-0.5 rounded-full flex items-center gap-1">
                                  <Sparkles className="w-3 h-3" />
                                  <span>PROPUESTA NUEVA</span>
                                </span>
                              )}

                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  isPublished
                                    ? 'bg-[#E8EEE8] text-[#407B5D]'
                                    : 'bg-[#FFF9EE] text-[#8A6318]'
                                }`}
                              >
                                {isPublished ? '● PUBLICADO (VISIBLE)' : '○ BORRADOR (OCULTO)'}
                              </span>
                            </div>

                            <div className="flex items-baseline gap-2">
                              <h4 className="text-sm font-bold text-[#232A24]">
                                {ex.title}
                              </h4>
                              <span className="text-xs text-[#59645C] hidden sm:inline">
                                · {ex.subtitle}
                              </span>
                            </div>

                            <p className="text-xs text-[#59645C] line-clamp-1">
                              <strong>Problema creativo:</strong> {ex.creativeProblem}
                            </p>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-[#E1E7E1]">
                            {/* Toggle status */}
                            {!isPreexisting ? (
                              <button
                                onClick={() => handleToggleStatus(ex)}
                                className={`min-h-[34px] px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs ${
                                  isPublished
                                    ? 'bg-white hover:bg-[#FFF2D6] border border-[#E1E7E1] text-[#8A6318]'
                                    : 'bg-[#407B5D] hover:bg-[#33654C] text-white'
                                }`}
                                title={
                                  isPublished
                                    ? 'Pasar a borrador (ocultar a los estudiantes)'
                                    : 'Aprobar y publicar para los estudiantes'
                                }
                              >
                                {isPublished ? (
                                  <>
                                    <EyeOff className="w-3.5 h-3.5" />
                                    <span>Pasar a Borrador</span>
                                  </>
                                ) : (
                                  <>
                                    <Eye className="w-3.5 h-3.5" />
                                    <span>Publicar Actividad</span>
                                  </>
                                )}
                              </button>
                            ) : (
                              <span className="text-xs text-[#407B5D] font-mono px-2 py-1 bg-[#E8EEE8] rounded-lg font-bold">
                                Fijo y Protegido
                              </span>
                            )}

                            {/* Open in Runner */}
                            <button
                              onClick={() => onOpenExerciseInRunner(unit.id, ex.id)}
                              className="min-h-[34px] px-3 py-1.5 bg-white hover:bg-[#E8EEE8] border border-[#E1E7E1] rounded-xl text-xs font-semibold text-[#232A24] transition-colors cursor-pointer flex items-center gap-1"
                              title="Abrir este ejercicio en el entorno interactivo"
                            >
                              <ExternalLink className="w-3.5 h-3.5 text-[#407B5D]" />
                              <span>Probar</span>
                            </button>

                            {/* Expand Ficha button */}
                            <button
                              onClick={() => setExpandedExerciseId(isExpanded ? null : ex.id)}
                              className="min-h-[34px] px-2.5 py-1.5 bg-white hover:bg-[#E8EEE8] border border-[#E1E7E1] rounded-xl text-xs text-[#59645C] transition-colors cursor-pointer flex items-center gap-1"
                              title="Ver ficha pedagógica completa"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>

                        {/* Detailed pedagogical spec sheet (Expanded) */}
                        {isExpanded && (
                          <div className="p-4 sm:p-5 border-t border-[#E1E7E1] bg-white rounded-b-2xl space-y-4 text-xs">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {/* Left Column: Didactic Protocol */}
                              <div className="space-y-3">
                                <div>
                                  <span className="font-bold text-[#232A24] block uppercase tracking-wider text-[10px] text-[#407B5D]">
                                    Problema Creativo
                                  </span>
                                  <p className="text-[#232A24] mt-0.5 font-medium bg-[#F7F8F4] p-2.5 rounded-xl border border-[#E1E7E1]">
                                    {ex.creativeProblem}
                                  </p>
                                </div>

                                <div className="space-y-1.5">
                                  <span className="font-bold text-[#232A24] block uppercase tracking-wider text-[10px] text-[#407B5D]">
                                    Plantilla Didáctica de 5 Fases
                                  </span>
                                  <div className="space-y-2 bg-[#F7F8F4] p-3 rounded-xl border border-[#E1E7E1]">
                                    <div>
                                      <strong className="text-[#232A24]">1. Observar:</strong>{' '}
                                      <span className="text-[#59645C]">{ex.pedagogicalSteps.observe}</span>
                                    </div>
                                    <div>
                                      <strong className="text-[#232A24]">2. Interpretar:</strong>{' '}
                                      <span className="text-[#59645C]">{ex.pedagogicalSteps.interpret}</span>
                                    </div>
                                    <div>
                                      <strong className="text-[#232A24]">3. Modificar/Escribir:</strong>{' '}
                                      <span className="text-[#59645C]">{ex.pedagogicalSteps.modify}</span>
                                    </div>
                                    <div>
                                      <strong className="text-[#232A24]">4. Experimentar:</strong>{' '}
                                      <span className="text-[#59645C]">{ex.pedagogicalSteps.experiment}</span>
                                    </div>
                                    <div>
                                      <strong className="text-[#232A24]">5. Documentar:</strong>{' '}
                                      <span className="text-[#59645C]">{ex.pedagogicalSteps.document}</span>
                                    </div>
                                  </div>
                                </div>

                                <div>
                                  <span className="font-bold text-[#232A24] block uppercase tracking-wider text-[10px] text-[#407B5D]">
                                    Pregunta Guía
                                  </span>
                                  <p className="text-[#232A24] italic font-semibold mt-0.5 bg-[#E8EEE8]/40 p-2.5 rounded-xl border border-[#A4C4B5]">
                                    «{ex.guidingQuestion}»
                                  </p>
                                </div>
                              </div>

                              {/* Right Column: Evidence, Criteria & Processing Java Code */}
                              <div className="space-y-3">
                                <div>
                                  <span className="font-bold text-[#232A24] block uppercase tracking-wider text-[10px] text-[#407B5D]">
                                    Evidencia Mínima Requerida
                                  </span>
                                  <p className="text-[#59645C] mt-0.5 bg-[#F7F8F4] p-2.5 rounded-xl border border-[#E1E7E1]">
                                    {ex.minimumEvidence}
                                  </p>
                                </div>

                                <div>
                                  <span className="font-bold text-[#232A24] block uppercase tracking-wider text-[10px] text-[#407B5D]">
                                    Criterio Observable de Logro
                                  </span>
                                  <p className="text-[#59645C] mt-0.5 bg-[#F7F8F4] p-2.5 rounded-xl border border-[#E1E7E1]">
                                    {ex.observableCriteria}
                                  </p>
                                </div>

                                <div>
                                  <span className="font-bold text-[#232A24] block uppercase tracking-wider text-[10px] text-[#407B5D]">
                                    Alcance Técnico
                                  </span>
                                  <p className="text-[#59645C] mt-0.5 bg-[#F7F8F4] p-2 rounded-xl border border-[#E1E7E1] font-mono text-[11px]">
                                    {ex.technicalScope}
                                  </p>
                                </div>

                                {ex.supportExampleCode && (
                                  <div>
                                    <span className="font-bold text-[#232A24] block uppercase tracking-wider text-[10px] text-[#407B5D]">
                                      Fragmento Original de Apoyo en Processing Java
                                    </span>
                                    <pre className="mt-1 p-2.5 bg-[#232A24] text-[#E8EEE8] rounded-xl font-mono text-[11px] overflow-x-auto">
                                      {ex.supportExampleCode}
                                    </pre>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
