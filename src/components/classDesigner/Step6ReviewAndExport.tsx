/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  ClassDesignProject,
  ClassDesignerDiagnostic,
} from '../../types/classDesigner';
import {
  generateProcessingClassCode,
  generateProcessingMainSketch,
} from '../../services/classDesignerService';
import {
  Copy,
  Check,
  Download,
  AlertOctagon,
  AlertTriangle,
  Lightbulb,
  FileCode,
  Layers,
  ExternalLink,
} from 'lucide-react';

interface Step6Props {
  project: ClassDesignProject;
  diagnostics: ClassDesignerDiagnostic[];
  onNavigateStep: (step: 1 | 2 | 3 | 4 | 5 | 6) => void;
}

export const Step6ReviewAndExport: React.FC<Step6Props> = ({
  project,
  diagnostics,
  onNavigateStep,
}) => {
  const [activeTab, setActiveTab] = useState<'class' | 'sketch'>('class');
  const [copied, setCopied] = useState(false);

  const className = project.className.trim() || 'MiClase';
  const classCode = generateProcessingClassCode(project);
  const sketchCode = generateProcessingMainSketch(project);

  const errors = diagnostics.filter((d) => d.severity === 'error');
  const warnings = diagnostics.filter((d) => d.severity === 'warning');
  const suggestions = diagnostics.filter((d) => d.severity === 'suggestion');

  const handleCopy = async () => {
    const textToCopy = activeTab === 'class' ? classCode : sketchCode;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = textToCopy;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadPde = () => {
    const text = activeTab === 'class' ? classCode : sketchCode;
    const filename =
      activeTab === 'class' ? `${className}.pde` : `sketch_${className.toLowerCase()}.pde`;

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="space-y-1.5 border-b border-[#E1E7E1] pb-4">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 bg-[#E8EEE8] text-[#407B5D] text-xs font-bold rounded-md">
            Etapa 6 de 6
          </span>
          <span className="text-xs font-medium text-[#59645C]">
            Revisión Estructural y Exportación
          </span>
        </div>
        <h2 className="text-xl font-bold text-[#232A24]">
          Inspecciona tu clase y genera el archivo para Processing Java
        </h2>
        <p className="text-xs text-[#59645C] leading-relaxed">
          Revisa el diagnóstico de tu diseño para asegurar consistencia sintáctica. Puedes copiar el código generado directamente al IDE de Processing o descargarlo como archivo <code className="bg-[#E8EEE8] px-1 py-0.5 rounded text-[#232A24] font-bold">.pde</code>.
        </p>
      </div>

      {/* Diagnostics Inspector */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#232A24] uppercase tracking-wider">
            Diagnóstico Estructural y Reglas de Calidad
          </span>
          <div className="flex items-center gap-3 text-xs">
            <span className={`flex items-center gap-1 font-bold ${errors.length > 0 ? 'text-red-600' : 'text-[#8E8E89]'}`}>
              <AlertOctagon className="w-3.5 h-3.5" />
              <span>{errors.length} Errores</span>
            </span>
            <span className={`flex items-center gap-1 font-bold ${warnings.length > 0 ? 'text-amber-600' : 'text-[#8E8E89]'}`}>
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{warnings.length} Advertencias</span>
            </span>
            <span className={`flex items-center gap-1 font-bold ${suggestions.length > 0 ? 'text-[#407B5D]' : 'text-[#8E8E89]'}`}>
              <Lightbulb className="w-3.5 h-3.5" />
              <span>{suggestions.length} Sugerencias</span>
            </span>
          </div>
        </div>

        {diagnostics.length === 0 ? (
          <div className="p-4 bg-[#E8EEE8] border border-[#407B5D] rounded-2xl flex items-center gap-3 text-xs text-[#407B5D]">
            <Check className="w-5 h-5 shrink-0" strokeWidth={2.5} />
            <div>
              <span className="font-bold block">¡Estructura impecable!</span>
              <span>
                No se detectaron errores de sintaxis, variables huérfanas ni inconsistencias en la firma del constructor.
              </span>
            </div>
          </div>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {diagnostics.map((diag) => {
              const bg =
                diag.severity === 'error'
                  ? 'bg-red-50 border-red-200 text-red-900'
                  : diag.severity === 'warning'
                  ? 'bg-amber-50 border-amber-200 text-amber-900'
                  : 'bg-[#F7F8F4] border-[#E1E7E1] text-[#232A24]';

              const icon =
                diag.severity === 'error' ? (
                  <AlertOctagon className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                ) : diag.severity === 'warning' ? (
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                ) : (
                  <Lightbulb className="w-4 h-4 text-[#407B5D] shrink-0 mt-0.5" />
                );

              return (
                <div
                  key={diag.id}
                  className={`p-3 border rounded-xl flex items-start justify-between gap-3 text-xs ${bg}`}
                >
                  <div className="flex items-start gap-2.5">
                    {icon}
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{diag.title}</span>
                        <span className="text-[10px] opacity-75 font-mono">
                          [{diag.stageName}]
                        </span>
                      </div>
                      <p className="text-[11px] opacity-90 leading-relaxed">{diag.message}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => onNavigateStep(diag.stage)}
                    className="px-2.5 py-1 bg-white/80 hover:bg-white border border-current text-[10px] font-bold rounded-lg cursor-pointer shrink-0 transition-colors"
                  >
                    Ir a Etapa {diag.stage}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Code Viewer Tabs & Actions */}
      <div className="border border-[#E1E7E1] rounded-2xl bg-[#FFFFFF] overflow-hidden shadow-xs">
        {/* Tabs and Copy Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-[#F7F8F4] border-b border-[#E1E7E1]">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveTab('class')}
              className={`px-3 py-1.5 text-xs font-mono font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'class'
                  ? 'bg-white text-[#407B5D] border border-[#E1E7E1] shadow-2xs'
                  : 'text-[#59645C] hover:text-[#232A24]'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>{className}.pde</span>
              <span className="text-[10px] font-normal text-[#59645C]">(Clase)</span>
            </button>

            <button
              onClick={() => setActiveTab('sketch')}
              className={`px-3 py-1.5 text-xs font-mono font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'sketch'
                  ? 'bg-white text-[#407B5D] border border-[#E1E7E1] shadow-2xs'
                  : 'text-[#59645C] hover:text-[#232A24]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>sketch_{className.toLowerCase()}.pde</span>
              <span className="text-[10px] font-normal text-[#59645C]">(Sketch de prueba)</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 bg-white border border-[#E1E7E1] hover:border-[#407B5D] text-[#232A24] text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#407B5D]" />
                  <span className="text-[#407B5D]">¡Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-[#59645C]" />
                  <span>Copiar código</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownloadPde}
              className="px-3 py-1.5 bg-[#407B5D] hover:bg-[#33654C] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Descargar .pde</span>
            </button>
          </div>
        </div>

        {/* Code Output Display */}
        <div className="p-4 bg-[#FFFFFF] overflow-x-auto max-h-[460px]">
          <pre className="font-mono text-xs text-[#232A24] leading-relaxed select-text whitespace-pre">
            {activeTab === 'class' ? classCode : sketchCode}
          </pre>
        </div>
      </div>

      {/* Practical Guide for Processing PDE */}
      <div className="p-4 bg-[#F7F8F4] border border-[#E1E7E1] rounded-2xl space-y-2 text-xs">
        <span className="font-bold text-[#232A24] block">
          ¿Cómo utilizar estos archivos en Processing IDE 4.3?
        </span>
        <ol className="list-decimal list-inside space-y-1 text-[#59645C] leading-relaxed">
          <li>
            Abre Processing y crea un sketch nuevo (<code className="font-mono text-[#232A24]">Ctrl+N</code> / <code className="font-mono text-[#232A24]">Cmd+N</code>).
          </li>
          <li>
            Pega el código de <code className="font-mono font-bold text-[#232A24]">sketch_{className.toLowerCase()}.pde</code> en la pestaña principal.
          </li>
          <li>
            Haz clic en la flecha pequeña desplegable en la esquina superior derecha del editor y selecciona <strong className="text-[#232A24]">Nueva pestaña</strong> (o presiona <code className="font-mono text-[#232A24]">Ctrl+Shift+N</code>).
          </li>
          <li>
            Nombra esa nueva pestaña exactamente como tu clase: <code className="font-mono font-bold text-[#407B5D]">{className}</code>.
          </li>
          <li>
            Pega el contenido de la clase en esa segunda pestaña, implementa los cuerpos de los métodos y presiona <strong className="text-[#232A24]">Ejecutar (Play)</strong>.
          </li>
        </ol>
      </div>
    </div>
  );
};
