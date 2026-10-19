import React, { useState } from 'react';
import { TopicItem } from '../data/topicsData';
import { ProcessingCodeBlock } from './ProcessingCodeBlock';
import {
  BookOpen,
  ArrowRight,
  ArrowLeft,
  Info,
  AlertCircle,
  Check,
  ChevronRight,
  Sparkles,
  HelpCircle,
} from 'lucide-react';

interface TopicViewerProps {
  topic: TopicItem;
  onNavigateTopic: (topicId: string) => void;
  onOpenCatalogue: () => void;
}

export const TopicViewer: React.FC<TopicViewerProps> = ({
  topic,
  onNavigateTopic,
  onOpenCatalogue,
}) => {
  const [activeConceptIdx, setActiveConceptIdx] = useState<number>(0);
  const [selectedOptionIdx, setSelectedOptionIdx] = useState<number | null>(null);
  const [showAnswerFeedback, setShowAnswerFeedback] = useState<boolean>(false);

  const activeConcept = topic.concepts[activeConceptIdx] || topic.concepts[0];

  const handleSelectOption = (idx: number) => {
    setSelectedOptionIdx(idx);
    setShowAnswerFeedback(true);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-150">
      {/* Top Breadcrumb & Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200">
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <button
            onClick={onOpenCatalogue}
            className="hover:text-zinc-900 transition-colors font-medium flex items-center gap-1"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Temario</span>
          </button>
          <span>/</span>
          <span className="text-zinc-400">{topic.category}</span>
          <span>/</span>
          <span className="text-zinc-900 font-semibold font-mono">
            Tema 0{topic.number}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenCatalogue}
            className="min-h-[38px] px-3 py-1.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-xs font-medium text-zinc-700 transition-colors"
          >
            Ver todos los temas
          </button>
          <button
            onClick={() => onNavigateTopic('classes')}
            className="min-h-[38px] px-3.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-black text-white text-xs font-medium transition-colors flex items-center gap-1.5"
          >
            <span>Ir al taller de Clases (POO)</span>
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          </button>
        </div>
      </div>

      {/* Hero Header */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="font-mono text-xs text-zinc-500 font-semibold bg-zinc-100 px-2 py-0.5 rounded">
            Módulo 0{topic.number}
          </span>
          <span className="text-xs font-mono text-zinc-600 bg-zinc-50 border border-zinc-200 px-2 py-0.5 rounded">
            {topic.badge}
          </span>
          <span className="text-xs text-zinc-400">·</span>
          <span className="text-xs text-zinc-500">{topic.estimatedTime} de estudio</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900">
          {topic.title}
        </h1>

        <p className="text-sm sm:text-base text-zinc-600 max-w-3xl leading-relaxed">
          {topic.summary}
        </p>
      </div>

      {/* Main 2-Column Concept Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Concept Selector Navigation (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Conceptos clave ({topic.concepts.length})
          </div>

          <div className="space-y-2">
            {topic.concepts.map((concept, idx) => {
              const isActive = idx === activeConceptIdx;

              return (
                <button
                  key={concept.id}
                  onClick={() => setActiveConceptIdx(idx)}
                  className={`w-full p-4 rounded-xl text-left border transition-all flex items-start justify-between gap-3 ${
                    isActive
                      ? 'bg-zinc-900 text-white border-zinc-900 shadow-xs'
                      : 'bg-white hover:bg-zinc-50 border-zinc-200 text-zinc-800'
                  }`}
                >
                  <div className="space-y-1 min-w-0">
                    <div className="font-semibold text-xs sm:text-sm">
                      {concept.title}
                    </div>
                    <div
                      className={`text-xs line-clamp-2 leading-relaxed ${
                        isActive ? 'text-zinc-300' : 'text-zinc-500'
                      }`}
                    >
                      {concept.summary}
                    </div>
                  </div>
                  <ChevronRight
                    className={`w-4 h-4 shrink-0 transition-transform ${
                      isActive ? 'text-white translate-x-0.5' : 'text-zinc-400'
                    }`}
                  />
                </button>
              );
            })}
          </div>

          {/* Quick Didactic Tip for the concept */}
          <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl space-y-1.5 text-xs text-zinc-700">
            <div className="flex items-center gap-1.5 text-zinc-900 font-semibold">
              <Info className="w-4 h-4 text-zinc-500 shrink-0" />
              <span>Regla de oro</span>
            </div>
            <p className="leading-relaxed text-[12px] text-zinc-600">
              {activeConcept.didacticTip}
            </p>
          </div>

          {activeConcept.commonMistake && (
            <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl space-y-1.5 text-xs text-amber-900">
              <div className="flex items-center gap-1.5 font-semibold text-amber-950">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Error común a evitar</span>
              </div>
              <p className="leading-relaxed text-[12px] text-amber-800">
                {activeConcept.commonMistake}
              </p>
            </div>
          )}
        </div>

        {/* Right Column: Code and In-depth didactic card (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Explanation Card */}
          <div className="bg-white border border-zinc-200 rounded-xl p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <h2 className="text-base sm:text-lg font-semibold text-zinc-900">
                {activeConcept.title}
              </h2>
              <span className="text-xs font-mono text-zinc-400">
                Concepto {activeConceptIdx + 1}/{topic.concepts.length}
              </span>
            </div>

            <p className="text-sm text-zinc-700 leading-relaxed">
              {activeConcept.explanation}
            </p>
          </div>

          {/* Processing Java Code Example with official syntax highlighter */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-zinc-600">
              <span className="font-semibold uppercase tracking-wider text-[11px] text-zinc-500">
                Código fuente de ejemplo
              </span>
              <span className="font-mono text-zinc-400 text-[11px]">Processing Java</span>
            </div>

            <ProcessingCodeBlock
              code={activeConcept.codeSnippet}
              filename={`${activeConcept.id}.pde`}
              showCopyButton={true}
            />
          </div>

          {/* Interactive Challenge if present */}
          {topic.quickChallenge && (
            <div className="p-5 sm:p-6 bg-white border border-zinc-200 rounded-xl space-y-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-zinc-900 uppercase tracking-wider">
                <HelpCircle className="w-4 h-4 text-zinc-700" />
                <span>Comprobación rápida de aprendizaje</span>
              </div>

              <p className="text-sm font-medium text-zinc-800">
                {topic.quickChallenge.question}
              </p>

              <div className="space-y-2">
                {topic.quickChallenge.options.map((opt, oIdx) => {
                  const isSelected = selectedOptionIdx === oIdx;

                  return (
                    <button
                      key={oIdx}
                      onClick={() => handleSelectOption(oIdx)}
                      className={`w-full p-3.5 rounded-lg border text-left text-xs transition-colors flex items-start gap-3 ${
                        isSelected
                          ? opt.isCorrect
                            ? 'bg-zinc-900 text-white border-zinc-900'
                            : 'bg-zinc-100 text-zinc-900 border-zinc-300'
                          : 'bg-zinc-50 hover:bg-zinc-100 border-zinc-200 text-zinc-700'
                      }`}
                    >
                      <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center shrink-0 mt-0.5 text-[11px] font-mono">
                        {String.fromCharCode(65 + oIdx)}
                      </span>
                      <span className="leading-relaxed">{opt.text}</span>
                    </button>
                  );
                })}
              </div>

              {showAnswerFeedback && selectedOptionIdx !== null && (
                <div
                  className={`p-3.5 rounded-lg border text-xs leading-relaxed ${
                    topic.quickChallenge.options[selectedOptionIdx].isCorrect
                      ? 'bg-zinc-50 border-zinc-300 text-zinc-900'
                      : 'bg-amber-50/80 border-amber-200 text-amber-900'
                  }`}
                >
                  <div className="font-semibold mb-1 flex items-center gap-1.5">
                    {topic.quickChallenge.options[selectedOptionIdx].isCorrect ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-zinc-900" />
                        <span>¡Correcto!</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-3.5 h-3.5 text-amber-700" />
                        <span>Revisa este concepto:</span>
                      </>
                    )}
                  </div>
                  <p>{topic.quickChallenge.options[selectedOptionIdx].feedback}</p>
                </div>
              )}
            </div>
          )}

          {/* Navigation to Next Topic */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-zinc-200">
            <button
              onClick={onOpenCatalogue}
              className="text-xs text-zinc-500 hover:text-zinc-900 flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Ver todos los temas</span>
            </button>

            <button
              onClick={() => onNavigateTopic('classes')}
              className="min-h-[44px] px-5 py-2.5 rounded-lg bg-zinc-900 hover:bg-black text-white text-xs sm:text-sm font-medium transition-colors flex items-center gap-2"
            >
              <span>Explorar Taller de Anatomía de una Clase (POO)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
