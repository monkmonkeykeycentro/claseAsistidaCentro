import React, { useState } from 'react';
import { TopicItem } from '../data/topicsData';
import { ProcessingCodeBlock } from './ProcessingCodeBlock';
import { ObjectArraysSessionView } from './ObjectArraysSessionView';
import {
  BookOpen,
  ArrowRight,
  ArrowLeft,
  Info,
  AlertCircle,
  Check,
  ChevronRight,
  HelpCircle,
} from 'lucide-react';

interface TopicViewerProps {
  topic: TopicItem;
  onNavigateTopic: (topicId: string) => void;
  onOpenCatalogue: () => void;
  onBackToHome?: () => void;
  onCompleteChallenge?: (challengeId: string) => void;
}

export const TopicViewer: React.FC<TopicViewerProps> = ({
  topic,
  onNavigateTopic,
  onOpenCatalogue,
  onBackToHome,
  onCompleteChallenge,
}) => {
  const [activeConceptIdx, setActiveConceptIdx] = useState<number>(0);
  const [selectedOptionIdx, setSelectedOptionIdx] = useState<number | null>(null);
  const [showAnswerFeedback, setShowAnswerFeedback] = useState<boolean>(false);

  // If this is Topic 7 (Object Arrays & Collections), display the full interactive session view
  if (topic.id === 'object-arrays') {
    return (
      <ObjectArraysSessionView
        topic={topic}
        onNavigateHome={onBackToHome || (() => {})}
        onOpenCatalogue={onOpenCatalogue}
        onNavigateTopic={onNavigateTopic}
        onCompleteChallenge={onCompleteChallenge}
      />
    );
  }

  const activeConcept = topic.concepts[activeConceptIdx] || topic.concepts[0];

  const handleSelectOption = (idx: number) => {
    setSelectedOptionIdx(idx);
    setShowAnswerFeedback(true);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-150">
      {/* Top Breadcrumb & Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#DCDDD8]">
        <div className="flex items-center gap-2 text-xs font-mono text-[#767773]">
          {onBackToHome && (
            <>
              <button
                onClick={onBackToHome}
                className="hover:text-[#181818] transition-colors font-medium flex items-center gap-1 min-h-[38px] px-2 py-1 bg-[#EEEDE8] border border-[#DCDDD8] text-[#181818]"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Inicio</span>
              </button>
              <span className="text-[#DCDDD8]">/</span>
            </>
          )}
          <button
            onClick={onOpenCatalogue}
            className="hover:text-[#181818] transition-colors flex items-center gap-1"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Temario</span>
          </button>
          <span className="text-[#DCDDD8]">/</span>
          <span className="text-[#767773]">{topic.category}</span>
          <span className="text-[#DCDDD8]">/</span>
          <span className="text-[#181818] font-bold">
            Tema 0{topic.number}
          </span>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <button
            onClick={onOpenCatalogue}
            className="min-h-[38px] px-3 py-1.5 border border-[#DCDDD8] bg-[#FFFFFF] hover:bg-[#EEEDE8] text-[#181818] transition-colors cursor-pointer"
          >
            Ver todos los temas
          </button>
          <button
            onClick={() => onNavigateTopic('classes')}
            className="min-h-[38px] px-3.5 py-1.5 bg-[#181818] hover:bg-[#4263CF] text-[#F6F5F0] transition-colors flex items-center gap-1.5 cursor-pointer font-medium"
          >
            <span>Taller de Clases (POO)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Hero Header */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2.5 font-mono text-xs">
          <span className="text-[#181818] font-bold bg-[#EEEDE8] border border-[#DCDDD8] px-2 py-0.5">
            MÓDULO 0{topic.number}
          </span>
          <span className="text-[#767773] bg-[#FFFFFF] border border-[#DCDDD8] px-2 py-0.5">
            {topic.badge}
          </span>
          <span className="text-[#DCDDD8]">·</span>
          <span className="text-[#767773]">{topic.estimatedTime} de estudio</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#181818] font-sans">
          {topic.title}
        </h1>

        <p className="text-sm sm:text-base text-[#555652] max-w-3xl leading-relaxed font-sans">
          {topic.summary}
        </p>
      </div>

      {/* Main 2-Column Concept Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Concept Selector Navigation (4 cols) */}
        <div className="lg:col-span-4 space-y-4 font-mono">
          <div className="text-xs uppercase tracking-wider text-[#767773] font-bold">
            Conceptos clave ({topic.concepts.length})
          </div>

          <div className="space-y-2">
            {topic.concepts.map((concept, idx) => {
              const isActive = idx === activeConceptIdx;

              return (
                <button
                  key={concept.id}
                  onClick={() => setActiveConceptIdx(idx)}
                  className={`w-full p-4 border text-left transition-all flex items-start justify-between gap-3 cursor-pointer ${
                    isActive
                      ? 'bg-[#181818] text-[#F6F5F0] border-[#181818]'
                      : 'bg-[#FFFFFF] hover:border-[#181818] border-[#DCDDD8] text-[#181818]'
                  }`}
                >
                  <div className="space-y-1 min-w-0">
                    <div className="font-semibold text-xs sm:text-sm">
                      {concept.title}
                    </div>
                    <div
                      className={`text-xs line-clamp-2 leading-relaxed font-sans ${
                        isActive ? 'text-[#DCDDD8]' : 'text-[#767773]'
                      }`}
                    >
                      {concept.summary}
                    </div>
                  </div>
                  <ChevronRight
                    className={`w-4 h-4 shrink-0 transition-transform ${
                      isActive ? 'text-[#D5E35F] translate-x-0.5' : 'text-[#767773]'
                    }`}
                  />
                </button>
              );
            })}
          </div>

          {/* Quick Didactic Tip for the concept */}
          <div className="p-4 bg-[#EEEDE8] border border-[#DCDDD8] space-y-1.5 text-xs text-[#181818]">
            <div className="flex items-center gap-1.5 font-bold">
              <Info className="w-4 h-4 text-[#4263CF] shrink-0" />
              <span>Principio estructural</span>
            </div>
            <p className="leading-relaxed text-[12px] text-[#555652] font-sans">
              {activeConcept.didacticTip}
            </p>
          </div>

          {activeConcept.commonMistake && (
            <div className="p-4 bg-[#FFFFFF] border-l-4 border-l-amber-500 border border-[#DCDDD8] space-y-1.5 text-xs text-[#181818]">
              <div className="flex items-center gap-1.5 font-bold text-amber-800">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Error frecuente</span>
              </div>
              <p className="leading-relaxed text-[12px] text-[#555652] font-sans">
                {activeConcept.commonMistake}
              </p>
            </div>
          )}
        </div>

        {/* Right Column: Code and In-depth didactic card (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Explanation Card */}
          <div className="bg-[#FFFFFF] border border-[#DCDDD8] p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#DCDDD8] pb-3 font-mono">
              <h2 className="text-base sm:text-lg font-semibold text-[#181818] font-sans">
                {activeConcept.title}
              </h2>
              <span className="text-xs text-[#767773]">
                Concepto 0{activeConceptIdx + 1}/0{topic.concepts.length}
              </span>
            </div>

            <p className="text-sm text-[#555652] leading-relaxed font-sans">
              {activeConcept.explanation}
            </p>
          </div>

          {/* Processing Java Code Example */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-[#767773]">
              <span className="font-bold uppercase tracking-wider text-[#181818]">
                Código fuente de ejemplo
              </span>
              <span>Processing Java</span>
            </div>

            <ProcessingCodeBlock
              code={activeConcept.codeSnippet}
              filename={`${activeConcept.id}.pde`}
              showCopyButton={true}
            />
          </div>

          {/* Interactive Challenge if present */}
          {topic.quickChallenge && (
            <div className="p-5 sm:p-6 bg-[#EEEDE8] border border-[#DCDDD8] space-y-4">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#181818] uppercase tracking-wider border-b border-[#DCDDD8] pb-2">
                <HelpCircle className="w-4 h-4 text-[#4263CF]" />
                <span>Comprobación de comprensión</span>
              </div>

              <p className="text-sm font-medium text-[#181818] font-sans">
                {topic.quickChallenge.question}
              </p>

              <div className="space-y-2 font-sans">
                {topic.quickChallenge.options.map((opt, oIdx) => {
                  const isSelected = selectedOptionIdx === oIdx;

                  return (
                    <button
                      key={oIdx}
                      onClick={() => handleSelectOption(oIdx)}
                      className={`w-full p-3.5 border text-left text-xs transition-colors flex items-start gap-3 cursor-pointer ${
                        isSelected
                          ? opt.isCorrect
                            ? 'bg-[#181818] text-[#F6F5F0] border-[#181818]'
                            : 'bg-[#FFFFFF] text-[#181818] border-[#4263CF] ring-1 ring-[#4263CF]'
                          : 'bg-[#FFFFFF] hover:border-[#181818] border-[#DCDDD8] text-[#181818]'
                      }`}
                    >
                      <span className="w-5 h-5 border border-current flex items-center justify-center shrink-0 mt-0.5 text-[11px] font-mono font-bold">
                        {String.fromCharCode(65 + oIdx)}
                      </span>
                      <span className="leading-relaxed">{opt.text}</span>
                    </button>
                  );
                })}
              </div>

              {showAnswerFeedback && selectedOptionIdx !== null && (
                <div
                  className={`p-3.5 border-l-4 text-xs leading-relaxed font-sans ${
                    topic.quickChallenge.options[selectedOptionIdx].isCorrect
                      ? 'bg-[#FFFFFF] border-l-[#4263CF] border border-[#DCDDD8] text-[#181818]'
                      : 'bg-[#FFFFFF] border-l-amber-500 border border-[#DCDDD8] text-[#181818]'
                  }`}
                >
                  <div className="font-semibold mb-1 flex items-center gap-1.5 font-mono">
                    {topic.quickChallenge.options[selectedOptionIdx].isCorrect ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-[#4263CF]" />
                        <span className="text-[#4263CF] font-bold">¡CORRECTO!</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                        <span className="text-amber-800 font-bold">REVISA ESTE CONCEPTO:</span>
                      </>
                    )}
                  </div>
                  <p className="text-[#555652]">{topic.quickChallenge.options[selectedOptionIdx].feedback}</p>
                </div>
              )}
            </div>
          )}

          {/* Navigation to Next Topic */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#DCDDD8] font-mono text-xs">
            <button
              onClick={onOpenCatalogue}
              className="text-[#767773] hover:text-[#181818] flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Ver todos los temas</span>
            </button>

            <button
              onClick={() => onNavigateTopic('classes')}
              className="min-h-[44px] px-5 py-2.5 bg-[#181818] hover:bg-[#4263CF] text-[#F6F5F0] transition-colors flex items-center gap-2 cursor-pointer font-medium"
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
