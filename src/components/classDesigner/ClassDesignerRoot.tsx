/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  ClassDesignProject,
  DEFAULT_EMPTY_PROJECT,
  RESORTE_EXAMPLE_PROJECT,
} from '../../types/classDesigner';
import {
  validateClassDesign,
  generateProcessingClassCode,
  saveClassDesignToLocal,
  loadClassDesignFromLocal,
  saveClassDesignToFirestore,
  loadClassDesignsFromFirestore,
  downloadClassDesignJson,
  importClassDesignFromJson,
} from '../../services/classDesignerService';
import { AppUser } from '../../services/firebase';
import { Step1ObjectDefinition } from './Step1ObjectDefinition';
import { Step2FieldsEditor } from './Step2FieldsEditor';
import { Step3ConstructorEditor } from './Step3ConstructorEditor';
import { Step4MethodsEditor } from './Step4MethodsEditor';
import { Step5RelationsEditor } from './Step5RelationsEditor';
import { Step6ReviewAndExport } from './Step6ReviewAndExport';
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  RotateCcw,
  Cloud,
  FileCode,
  AlertOctagon,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  Copy,
  Check,
  Download,
  Eye,
  Maximize2,
  Minimize2,
  FileJson,
  Upload,
  FileUp,
} from 'lucide-react';

interface ClassDesignerRootProps {
  onBackToHome: () => void;
  currentUser: AppUser | null;
  onOpenCatalogue?: () => void;
}

type StepNumber = 1 | 2 | 3 | 4 | 5 | 6;

const STEP_DEFINITIONS: { step: StepNumber; shortTitle: string; title: string }[] = [
  { step: 1, shortTitle: 'Objeto', title: 'Definir el objeto' },
  { step: 2, shortTitle: 'Campos', title: 'Identificar campos' },
  { step: 3, shortTitle: 'Constructor', title: 'Configurar constructor' },
  { step: 4, shortTitle: 'Métodos', title: 'Diseñar métodos' },
  { step: 5, shortTitle: 'Relaciones', title: 'Establecer relaciones' },
  { step: 6, shortTitle: 'Código', title: 'Revisar y exportar' },
];

export const ClassDesignerRoot: React.FC<ClassDesignerRootProps> = ({
  onBackToHome,
  currentUser,
}) => {
  const [currentStep, setCurrentStep] = useState<StepNumber>(1);
  const [project, setProject] = useState<ClassDesignProject>(() => {
    return loadClassDesignFromLocal();
  });
  const [isCloudSaving, setIsCloudSaving] = useState(false);
  const [cloudSynced, setCloudSynced] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [isLivePreviewExpanded, setIsLivePreviewExpanded] = useState(true);
  const [jsonNotification, setJsonNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const jsonFileInputRef = useRef<HTMLInputElement>(null);

  // Auto-validate project on every change
  const diagnostics = useMemo(() => validateClassDesign(project), [project]);
  const errors = diagnostics.filter((d) => d.severity === 'error');
  const warnings = diagnostics.filter((d) => d.severity === 'warning');
  const suggestions = diagnostics.filter((d) => d.severity === 'suggestion');

  // Real-time generated code for collateral preview
  const liveClassCode = useMemo(() => generateProcessingClassCode(project), [project]);

  // Save to local storage on change
  useEffect(() => {
    saveClassDesignToLocal(project);
  }, [project]);

  // Debounced auto-save to Firestore if user is authenticated
  useEffect(() => {
    if (!currentUser) return;

    const timeout = setTimeout(async () => {
      try {
        setIsCloudSaving(true);
        await saveClassDesignToFirestore(currentUser.uid, project);
        setCloudSynced(true);
      } catch (err) {
        console.warn('Error al sincronizar clase con Firestore:', err);
      } finally {
        setIsCloudSaving(false);
      }
    }, 1500);

    return () => clearTimeout(timeout);
  }, [project, currentUser]);

  const handleLoadResorteExample = () => {
    if (
      window.confirm(
        '¿Deseas cargar la plantilla pedagógica "Resorte (Slinky)"? Se sobrescribirá el borrador actual.'
      )
    ) {
      setProject(RESORTE_EXAMPLE_PROJECT);
      setCurrentStep(1);
    }
  };

  const handleResetToNew = () => {
    if (window.confirm('¿Deseas iniciar un diseño nuevo en blanco?')) {
      const freshProject: ClassDesignProject = {
        ...DEFAULT_EMPTY_PROJECT,
        id: `diseno-${Date.now()}`,
        projectName: 'Mi Nueva Clase',
        className: 'particula',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setProject(freshProject);
      setCurrentStep(1);
    }
  };

  const handleCopyLiveCode = async () => {
    try {
      await navigator.clipboard.writeText(liveClassCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch {
      // Fallback
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleDownloadLivePde = () => {
    const filename = `${project.className.trim() || 'MiClase'}.pde`;
    const blob = new Blob([liveClassCode], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportJson = () => {
    downloadClassDesignJson(project);
    setJsonNotification({
      type: 'success',
      message: `Estructura descargada como diseno_${(project.className || 'clase').toLowerCase()}.json. Puedes guardarla y volver a abrirla para continuar editando.`,
    });
    setTimeout(() => setJsonNotification(null), 5000);
  };

  const handleTriggerJsonImport = () => {
    if (jsonFileInputRef.current) {
      jsonFileInputRef.current.value = '';
      jsonFileInputRef.current.click();
    }
  };

  const handleJsonFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content !== 'string') return;

      const result = importClassDesignFromJson(content);
      if (result.success && result.project) {
        setProject(result.project);
        setJsonNotification({
          type: 'success',
          message: `Proyecto "${result.project.projectName || result.project.className}" cargado correctamente con ${result.project.fields.length} campos y ${result.project.methods.length} métodos. ¡Todo listo para editar!`,
        });
        setTimeout(() => setJsonNotification(null), 6000);
      } else {
        setJsonNotification({
          type: 'error',
          message: result.error || 'No se pudo leer la estructura del archivo JSON.',
        });
        setTimeout(() => setJsonNotification(null), 6000);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Header Toolbar */}
      <div className="bg-white border border-[#E1E7E1] rounded-3xl p-4 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E1E7E1] pb-4">
          {/* Breadcrumb + Title */}
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToHome}
              className="p-2 border border-[#E1E7E1] hover:bg-[#E8EEE8] text-[#59645C] hover:text-[#232A24] rounded-xl transition-all cursor-pointer shadow-2xs"
              title="Volver a la página principal"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#407B5D]" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#407B5D] font-mono">
                  Herramienta de Creación · POO
                </span>
                {currentUser && (
                  <span className="text-[10px] text-[#59645C] flex items-center gap-1 font-mono">
                    <Cloud className="w-3 h-3 text-[#407B5D]" />
                    {isCloudSaving ? 'Guardando en la nube...' : 'Sincronizado'}
                  </span>
                )}
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-[#232A24] tracking-tight">
                Diseñador de Clases en Processing Java
              </h1>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleExportJson}
              className="min-h-[36px] px-3 py-1.5 bg-white border border-[#E1E7E1] hover:border-[#407B5D] text-[#232A24] text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
              title="Descargar la estructura editable (.json) para guardarla y seguir editando"
            >
              <FileJson className="w-3.5 h-3.5 text-[#407B5D]" />
              <span>Exportar JSON</span>
            </button>

            <button
              onClick={handleTriggerJsonImport}
              className="min-h-[36px] px-3 py-1.5 bg-white border border-[#E1E7E1] hover:border-[#407B5D] text-[#232A24] text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
              title="Cargar un archivo .json guardado previamente para continuar editándolo"
            >
              <FileUp className="w-3.5 h-3.5 text-[#59645C]" />
              <span>Importar JSON</span>
            </button>

            <button
              onClick={handleLoadResorteExample}
              className="min-h-[36px] px-3 py-1.5 bg-[#FFF4DC] hover:bg-[#FFE8B3] border border-[#E6B65A]/50 text-[#9A6700] text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
              title="Cargar ejemplo de referencia completo: Resorte / Slinky"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Plantilla: Resorte (Slinky)</span>
            </button>

            <button
              onClick={handleResetToNew}
              className="min-h-[36px] px-3 py-1.5 border border-[#E1E7E1] hover:bg-[#E8EEE8] text-[#59645C] hover:text-[#232A24] text-xs font-medium rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
              title="Comenzar un diseño en blanco"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Nuevo Proyecto</span>
            </button>
          </div>
        </div>

        {/* Hidden File Input for JSON import */}
        <input
          type="file"
          ref={jsonFileInputRef}
          onChange={handleJsonFileSelected}
          accept=".json,application/json"
          className="hidden"
        />

        {/* JSON Notification Banner */}
        {jsonNotification && (
          <div
            className={`p-3.5 rounded-2xl border text-xs flex items-center justify-between gap-3 animate-in fade-in ${
              jsonNotification.type === 'success'
                ? 'bg-[#E8EEE8] border-[#A4C4B5] text-[#232A24]'
                : 'bg-red-50 border-red-200 text-red-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {jsonNotification.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-[#407B5D] shrink-0" />
              ) : (
                <AlertOctagon className="w-4 h-4 text-red-600 shrink-0" />
              )}
              <span>{jsonNotification.message}</span>
            </div>
            <button
              onClick={() => setJsonNotification(null)}
              className="text-xs underline text-[#59645C] hover:text-[#232A24] cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        )}

        {/* 2. Step Navigation Bar (1 to 6) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {STEP_DEFINITIONS.map((def) => {
            const isActive = currentStep === def.step;
            const isCompleted = currentStep > def.step;
            const stepDiags = diagnostics.filter((d) => d.stage === def.step);
            const hasError = stepDiags.some((d) => d.severity === 'error');

            return (
              <button
                key={def.step}
                onClick={() => setCurrentStep(def.step)}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-1 ${
                  isActive
                    ? 'border-[#407B5D] bg-[#E8EEE8] text-[#407B5D] font-bold shadow-2xs ring-1 ring-[#407B5D]'
                    : isCompleted
                    ? 'border-[#E1E7E1] bg-white hover:bg-[#F7F8F4] text-[#232A24]'
                    : 'border-[#E1E7E1] bg-[#F7F8F4]/60 hover:bg-white text-[#59645C]'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span>0{def.step}</span>
                  {hasError ? (
                    <AlertOctagon className="w-3 h-3 text-red-500" />
                  ) : isCompleted ? (
                    <CheckCircle2 className="w-3 h-3 text-[#407B5D]" />
                  ) : null}
                </div>
                <div className="text-xs font-semibold truncate">{def.shortTitle}</div>
                <div className="text-[10px] opacity-75 truncate">{def.title}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Main Workspace: Split View with Collateral Live Code Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT / CENTER: Active Step Workspace */}
        <div
          className={`${
            isLivePreviewExpanded ? 'lg:col-span-7 xl:col-span-8' : 'lg:col-span-12'
          } bg-white border border-[#E1E7E1] rounded-3xl p-5 sm:p-7 shadow-xs space-y-6 transition-all`}
        >
          {currentStep === 1 && (
            <Step1ObjectDefinition project={project} onChange={setProject} />
          )}

          {currentStep === 2 && (
            <Step2FieldsEditor project={project} onChange={setProject} />
          )}

          {currentStep === 3 && (
            <Step3ConstructorEditor project={project} onChange={setProject} />
          )}

          {currentStep === 4 && (
            <Step4MethodsEditor project={project} onChange={setProject} />
          )}

          {currentStep === 5 && (
            <Step5RelationsEditor project={project} onChange={setProject} />
          )}

          {currentStep === 6 && (
            <Step6ReviewAndExport
              project={project}
              diagnostics={diagnostics}
              onNavigateStep={(step) => setCurrentStep(step)}
              onImportProject={(imported) => {
                setProject(imported);
              }}
            />
          )}

          {/* Stepper Navigation Buttons */}
          <div className="pt-6 border-t border-[#E1E7E1] flex items-center justify-between gap-3">
            <button
              onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1) as StepNumber)}
              disabled={currentStep === 1}
              className="min-h-[40px] px-4 py-2 border border-[#E1E7E1] hover:bg-[#E8EEE8] text-[#232A24] text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Etapa Anterior</span>
            </button>

            <div className="flex items-center gap-2">
              <span className="text-xs text-[#59645C] hidden sm:inline">
                Etapa {currentStep} de 6
              </span>

              {currentStep < 6 ? (
                <button
                  onClick={() => setCurrentStep((prev) => Math.min(6, prev + 1) as StepNumber)}
                  className="min-h-[40px] px-5 py-2 bg-[#407B5D] hover:bg-[#33654C] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-98"
                >
                  <span>Siguiente Etapa</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleDownloadLivePde}
                  className="min-h-[40px] px-5 py-2 bg-[#407B5D] hover:bg-[#33654C] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-98"
                >
                  <Download className="w-4 h-4" />
                  <span>Descargar {project.className || 'Clase'}.pde</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT: Live Processing Java Code Inspector */}
        {isLivePreviewExpanded && (
          <div className="lg:col-span-5 xl:col-span-4 space-y-4 lg:sticky lg:top-20">
            <div className="bg-white border border-[#E1E7E1] rounded-3xl p-4 sm:p-5 shadow-xs space-y-3">
              {/* Toolbar */}
              <div className="flex items-center justify-between border-b border-[#E1E7E1] pb-3">
                <div className="flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-[#407B5D]" />
                  <span className="font-mono text-xs font-bold text-[#232A24]">
                    {project.className || 'MiClase'}.pde
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleCopyLiveCode}
                    className="p-1.5 bg-[#F7F8F4] hover:bg-[#E8EEE8] border border-[#E1E7E1] text-[#232A24] rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                    title="Copiar código actual"
                  >
                    {copiedCode ? (
                      <Check className="w-3.5 h-3.5 text-[#407B5D]" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-[#59645C]" />
                    )}
                  </button>
                  <button
                    onClick={handleDownloadLivePde}
                    className="p-1.5 bg-[#F7F8F4] hover:bg-[#E8EEE8] border border-[#E1E7E1] text-[#232A24] rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                    title="Descargar archivo .pde"
                  >
                    <Download className="w-3.5 h-3.5 text-[#59645C]" />
                  </button>
                </div>
              </div>

              {/* Real-time Validation Pills */}
              <div className="flex items-center gap-2 text-[11px] font-mono">
                <span
                  className={`px-2 py-0.5 rounded-md flex items-center gap-1 ${
                    errors.length > 0
                      ? 'bg-red-50 text-red-700 font-bold'
                      : 'bg-[#F7F8F4] text-[#8E8E89]'
                  }`}
                >
                  <AlertOctagon className="w-3 h-3" />
                  <span>{errors.length} err</span>
                </span>
                <span
                  className={`px-2 py-0.5 rounded-md flex items-center gap-1 ${
                    warnings.length > 0
                      ? 'bg-amber-50 text-amber-800 font-bold'
                      : 'bg-[#F7F8F4] text-[#8E8E89]'
                  }`}
                >
                  <AlertTriangle className="w-3 h-3" />
                  <span>{warnings.length} adv</span>
                </span>
                <span
                  className={`px-2 py-0.5 rounded-md flex items-center gap-1 ${
                    suggestions.length > 0
                      ? 'bg-[#E8EEE8] text-[#407B5D] font-bold'
                      : 'bg-[#F7F8F4] text-[#8E8E89]'
                  }`}
                >
                  <Lightbulb className="w-3 h-3" />
                  <span>{suggestions.length} sug</span>
                </span>
              </div>

              {/* Code Area */}
              <div className="p-3 bg-[#F7F8F4] border border-[#E1E7E1] rounded-2xl max-h-[500px] overflow-y-auto">
                <pre className="font-mono text-[11px] text-[#232A24] leading-relaxed select-text whitespace-pre">
                  {liveClassCode}
                </pre>
              </div>

              <div className="text-[10px] text-[#59645C] text-center">
                Actualizado en tiempo real según cada edición.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
