import React, { useState } from 'react';
import { ETAPA1_SECTIONS, ORGANIZATIONAL_DIDACTIC_NOTE } from '../../data/stageData';
import { ProcessingCodeBlock } from '../ProcessingCodeBlock';
import { Check, ArrowRight, Info, ChevronRight } from 'lucide-react';

interface Stage1Props {
  onComplete: () => void;
  isCompleted: boolean;
  onGoNext: () => void;
}

export const Stage1Structure: React.FC<Stage1Props> = ({
  onComplete,
  isCompleted,
  onGoNext,
}) => {
  const [selectedSectionId, setSelectedSectionId] = useState<string>('declaration');

  const selectedSection =
    ETAPA1_SECTIONS.find((s) => s.id === selectedSectionId) || ETAPA1_SECTIONS[0];

  const SKELETON_CODE = `class Gato {
  // Campos o atributos

  // Constructor

  // Métodos
}`;

  const handleSelectSection = (id: string) => {
    setSelectedSectionId(id);
    onComplete();
  };

  return (
    <div className="space-y-10">
      {/* Stage Header */}
      <div className="border-b border-zinc-200 pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider block">
              Etapa 01
            </span>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-900 mt-1">
              Reconocer la estructura de una clase
            </h2>
          </div>
          {isCompleted && (
            <div className="flex items-center gap-1.5 text-xs text-zinc-600 font-mono py-1">
              <Check className="w-3.5 h-3.5 text-zinc-900" />
              <span>Estructura reconocida</span>
            </div>
          )}
        </div>
        <p className="text-sm text-zinc-600 mt-2 max-w-2xl leading-relaxed">
          Una clase en Processing Java actúa como molde para crear objetos. Revisa cada una de sus tres secciones principales para comprender su función y sintaxis.
        </p>
      </div>

      {/* Spacious 2-Column Experience: Selection on left, Code and Explanation on right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Sections List (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Partes de la clase
          </div>

          <div className="space-y-2.5">
            {ETAPA1_SECTIONS.map((sec) => {
              const isSelected = selectedSectionId === sec.id;
              return (
                <button
                  key={sec.id}
                  onClick={() => handleSelectSection(sec.id)}
                  className={`w-full min-h-[56px] text-left p-4 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-zinc-900 border-zinc-900 text-white shadow-xs'
                      : 'bg-white border-zinc-200 text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50'
                  }`}
                >
                  <div className="space-y-0.5 min-w-0">
                    <div className="font-medium text-sm truncate">
                      {sec.title}
                    </div>
                    <div className={`text-xs line-clamp-1 ${isSelected ? 'text-zinc-300' : 'text-zinc-500'}`}>
                      {sec.badge}
                    </div>
                  </div>
                  <ChevronRight
                    className={`w-4 h-4 shrink-0 transition-transform ${
                      isSelected ? 'text-white translate-x-0.5' : 'text-zinc-400'
                    }`}
                  />
                </button>
              );
            })}
          </div>

          {/* Clean Didactic Note */}
          <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl space-y-1.5 text-xs text-zinc-600">
            <div className="flex items-center gap-2 text-zinc-900 font-medium">
              <Info className="w-4 h-4 text-zinc-500 shrink-0" />
              <span>{ORGANIZATIONAL_DIDACTIC_NOTE.title}</span>
            </div>
            <p className="leading-relaxed text-[12px]">
              El orden <strong>campos → constructor → métodos</strong> es una convención didáctica de lectura recomendada, no un orden estricto exigido por Java.
            </p>
          </div>
        </div>

        {/* Right Column: Code viewer & Explanatory details (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Esquema canónico
              </div>
              <span className="text-xs font-mono text-zinc-400">Gato.pde</span>
            </div>

            <ProcessingCodeBlock
              code={SKELETON_CODE}
              highlightedSection={
                selectedSectionId === 'fields'
                  ? 'Campos'
                  : selectedSectionId === 'constructor'
                  ? 'Constructor'
                  : selectedSectionId === 'methods'
                  ? 'Métodos'
                  : selectedSectionId === 'declaration'
                  ? 'class Gato'
                  : null
              }
              showCopyButton={false}
            />
          </div>

          {/* Concise explanation of the active section */}
          <div className="bg-white border border-zinc-200 rounded-xl p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <h3 className="font-semibold text-base text-zinc-900">
                {selectedSection.title}
              </h3>
              <span className="text-xs font-mono text-zinc-500 bg-zinc-100 px-2.5 py-1 rounded-md">
                {selectedSection.badge}
              </span>
            </div>

            <div className="space-y-3 text-sm text-zinc-700">
              <div>
                <span className="font-medium text-zinc-900 block mb-0.5 text-xs uppercase tracking-wider text-zinc-500">
                  ¿Qué representa?
                </span>
                <p className="leading-relaxed text-zinc-700 text-xs sm:text-sm">
                  {selectedSection.whatItIs}
                </p>
              </div>

              <div>
                <span className="font-medium text-zinc-900 block mb-0.5 text-xs uppercase tracking-wider text-zinc-500">
                  ¿Cómo se escribe?
                </span>
                <p className="leading-relaxed text-zinc-700 text-xs sm:text-sm">
                  {selectedSection.howToWrite}
                </p>
              </div>

              <div>
                <span className="font-medium text-zinc-900 block mb-1 text-xs uppercase tracking-wider text-zinc-500">
                  Elementos que contiene:
                </span>
                <ul className="space-y-1 text-xs sm:text-sm text-zinc-600 pl-1">
                  {selectedSection.whatItContains.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-zinc-400 font-mono select-none">—</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-2">
                <span className="font-medium text-zinc-900 block mb-1 text-xs uppercase tracking-wider text-zinc-500">
                  Ejemplo en Gato:
                </span>
                <pre className="p-3 bg-zinc-50 rounded-lg text-zinc-900 font-mono text-xs overflow-x-auto border border-zinc-200">
                  {selectedSection.example}
                </pre>
              </div>
            </div>
          </div>

          {/* Navigation Action */}
          <div className="flex items-center justify-end pt-2">
            <button
              onClick={onGoNext}
              className="min-h-[44px] px-6 py-2.5 rounded-lg bg-zinc-900 hover:bg-black text-white font-medium text-xs sm:text-sm transition-colors flex items-center gap-2"
            >
              <span>Ir a Etapa 2: Ubicar partes</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
