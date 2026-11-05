import React, { useState } from 'react';
import { TopicItem } from '../data/topicsData';
import { CmsBlockView } from './CmsBlockView';
import { ProcessingCodeBlock } from './ProcessingCodeBlock';
import { P5LiveThumbnail } from './generative/P5LiveThumbnail';
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

  const activeConcept = topic.concepts[activeConceptIdx] || topic.concepts[0] || { id: 'empty', title: topic.title, summary: '', explanation: 'Esta lección aún no tiene contenido.', codeSnippet: '', didacticTip: '', commonMistake: undefined, blocks: undefined };

  const handleSelectOption = (idx: number) => {
    setSelectedOptionIdx(idx);
    setShowAnswerFeedback(true);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-150">
      {/* Top Breadcrumb & Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E1E7E1]">
        <div className="flex items-center gap-2 text-xs text-[#59645C]">
          {onBackToHome && (
            <>
              <button
                onClick={onBackToHome}
                className="hover:text-[#232A24] transition-colors font-medium flex items-center gap-1 min-h-[38px] px-3 py-1.5 bg-[#FFFFFF] border border-[#E1E7E1] rounded-xl text-[#232A24] shadow-xs cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Inicio</span>
              </button>
              <span className="text-[#E1E7E1]">/</span>
            </>
          )}
          <button
            onClick={onOpenCatalogue}
            className="hover:text-[#232A24] transition-colors flex items-center gap-1 cursor-pointer font-medium"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#407B5D]" />
            <span>Temario</span>
          </button>
          <span className="text-[#E1E7E1]">/</span>
          <span className="text-[#59645C]">{topic.category}</span>
          <span className="text-[#E1E7E1]">/</span>
          <span className="text-[#232A24] font-bold">
            Tema 0{topic.number}
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={onOpenCatalogue}
            className="min-h-[38px] px-3.5 py-1.5 border border-[#E1E7E1] bg-[#FFFFFF] hover:bg-[#E8EEE8] text-[#232A24] rounded-xl transition-colors cursor-pointer font-medium shadow-xs"
          >
            Ver todos los temas
          </button>
          <button
            onClick={() => onNavigateTopic('classes')}
            className="min-h-[38px] px-4 py-2 bg-[#407B5D] hover:bg-[#33654C] text-white rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer font-semibold shadow-xs"
          >
            <span>Taller de Clases (POO)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Hero Header */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2.5 text-xs">
          <span className="text-[#407B5D] font-bold bg-[#E8EEE8] px-2.5 py-0.5 rounded-full">
            MÓDULO 0{topic.number}
          </span>
          <span className="text-[#59645C] bg-[#FFFFFF] border border-[#E1E7E1] px-2.5 py-0.5 rounded-full font-medium">
            {topic.badge}
          </span>
          <span className="text-[#E1E7E1]">·</span>
          <span className="text-[#59645C] font-medium">{topic.estimatedTime} de estudio</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#232A24]">
          {topic.title}
        </h1>

        <p className="text-sm sm:text-base text-[#59645C] max-w-3xl leading-relaxed">
          {topic.summary}
        </p>
      </div>

      {/* Main 2-Column Concept Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Concept Selector Navigation (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="text-xs uppercase tracking-wider text-[#59645C] font-bold">
            Conceptos clave ({topic.concepts.length})
          </div>

          <div className="space-y-2">
            {topic.concepts.map((concept, idx) => {
              const isActive = idx === activeConceptIdx;

              return (
                <button
                  key={concept.id}
                  onClick={() => setActiveConceptIdx(idx)}
                  className={`w-full p-4 rounded-2xl border text-left transition-all flex items-start justify-between gap-3 cursor-pointer ${
                    isActive
                      ? 'bg-[#407B5D] text-white border-[#407B5D] shadow-xs'
                      : 'bg-[#FFFFFF] hover:bg-[#E8EEE8] border-[#E1E7E1] text-[#232A24]'
                  }`}
                >
                  <div className="space-y-1 min-w-0">
                    <div className="font-semibold text-xs sm:text-sm">
                      {concept.title}
                    </div>
                    <div
                      className={`text-xs line-clamp-2 leading-relaxed ${
                        isActive ? 'text-white/85' : 'text-[#59645C]'
                      }`}
                    >
                      {concept.summary}
                    </div>
                  </div>
                  <ChevronRight
                    className={`w-4 h-4 shrink-0 mt-0.5 transition-transform ${
                      isActive ? 'text-[#E6B65A] translate-x-0.5' : 'text-[#59645C]'
                    }`}
                  />
                </button>
              );
            })}
          </div>

          {/* Quick Didactic Tip for the concept */}
          <div className="p-4 bg-[#FFFFFF] border border-[#E1E7E1] rounded-2xl space-y-1.5 text-xs text-[#232A24] shadow-xs">
            <div className="flex items-center gap-1.5 font-bold text-[#407B5D]">
              <Info className="w-4 h-4 shrink-0" />
              <span>Principio estructural</span>
            </div>
            <p className="leading-relaxed text-[12px] text-[#59645C]">
              {activeConcept.didacticTip}
            </p>
          </div>

          {activeConcept.commonMistake && (
            <div className="p-4 bg-[#FFFFFF] border-l-4 border-l-[#E6B65A] border border-[#E1E7E1] rounded-2xl space-y-1.5 text-xs text-[#232A24] shadow-xs">
              <div className="flex items-center gap-1.5 font-bold text-[#8A6318]">
                <AlertCircle className="w-4 h-4 text-[#E6B65A] shrink-0" />
                <span>Error frecuente</span>
              </div>
              <p className="leading-relaxed text-[12px] text-[#59645C]">
                {activeConcept.commonMistake}
              </p>
            </div>
          )}
        </div>

        {/* Right Column: Code and In-depth didactic card (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Explanation Card */}
          <div className="bg-[#FFFFFF] border border-[#E1E7E1] rounded-2xl p-5 sm:p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-[#E1E7E1] pb-3">
              <h2 className="text-base sm:text-lg font-bold text-[#232A24]">
                {activeConcept.title}
              </h2>
              <span className="text-xs text-[#59645C] font-mono">
                Concepto 0{activeConceptIdx + 1}/0{topic.concepts.length}
              </span>
            </div>

            <p className="text-sm text-[#59645C] leading-relaxed">
              {!activeConcept.blocks && activeConcept.explanation}
            </p>
          </div>

          {activeConcept.blocks && (
            <div className="space-y-5">{activeConcept.blocks.map((block) => <CmsBlockView key={block.id} block={block} />)}</div>
          )}
          {/* Processing Java Code Example with Live p5.js Thumbnail */}
          {!activeConcept.blocks && activeConcept.codeSnippet && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-[#59645C]">
                <span className="font-bold uppercase tracking-wider text-[#232A24]">
                  Código fuente de ejemplo
                </span>
                <span className="font-mono text-[11px] text-[#407B5D] font-bold">Processing Java (.pde)</span>
              </div>

              {activeConcept.codeSnippetP5 && (
                <div className="border border-[#E1E7E1] rounded-2xl overflow-hidden bg-white p-3 space-y-2 shadow-2xs">
                  <div className="flex items-center justify-between text-xs text-[#59645C] px-1">
                    <span className="font-mono text-[11px] flex items-center gap-1.5 font-bold text-[#407B5D]">
                      <span className="w-2 h-2 rounded-full bg-[#407B5D] inline-block animate-pulse" />
                      Miniatura interactiva (p5.js en vivo)
                    </span>
                    <span className="text-[10px] text-[#7A867E]">Mueve el cursor / lienzo activo</span>
                  </div>
                  <div className="w-full flex justify-center bg-[#F7F8F4] rounded-xl p-2 border border-[#E1E7E1]">
                    <P5LiveThumbnail
                      p5Code={activeConcept.codeSnippetP5}
                      width={380}
                      height={170}
                      interactive={true}
                    />
                  </div>
                </div>
              )}

              <ProcessingCodeBlock
                code={activeConcept.codeSnippetJava || activeConcept.codeSnippet}
                codeJava={activeConcept.codeSnippetJava || activeConcept.codeSnippet}
                codeP5={activeConcept.codeSnippetP5}
                defaultLanguage="processing"
                filename={`${activeConcept.id}.pde`}
                showCopyButton={true}
              />
            </div>
          )}

          {/* Interactive Challenge if present */}
          {topic.quickChallenge && (
            <div className="p-5 sm:p-6 bg-[#FFFFFF] border border-[#E1E7E1] rounded-2xl space-y-4 shadow-xs">
              <div className="flex items-center gap-2 text-xs font-bold text-[#232A24] uppercase tracking-wider border-b border-[#E1E7E1] pb-2">
                <HelpCircle className="w-4 h-4 text-[#407B5D]" />
                <span>Comprobación de comprensión</span>
              </div>

              <p className="text-sm font-semibold text-[#232A24]">
                {topic.quickChallenge.question}
              </p>

              <div className="space-y-2">
                {topic.quickChallenge.options.map((opt, oIdx) => {
                  const isSelected = selectedOptionIdx === oIdx;

                  return (
                    <button
                      key={oIdx}
                      onClick={() => handleSelectOption(oIdx)}
                      className={`w-full p-3.5 rounded-xl border text-left text-xs transition-colors flex items-start gap-3 cursor-pointer ${
                        isSelected
                          ? opt.isCorrect
                            ? 'bg-[#E8EEE8] text-[#232A24] border-[#407B5D] font-medium'
                            : 'bg-[#FFF9EE] text-[#232A24] border-[#E6B65A]'
                          : 'bg-[#FFFFFF] hover:bg-[#E8EEE8] border-[#E1E7E1] text-[#232A24]'
                      }`}
                    >
                      <span className="w-5 h-5 rounded-md border border-current flex items-center justify-center shrink-0 mt-0.5 text-[11px] font-mono font-bold">
                        {String.fromCharCode(65 + oIdx)}
                      </span>
                      <span className="leading-relaxed">{opt.text}</span>
                    </button>
                  );
                })}
              </div>

              {showAnswerFeedback && selectedOptionIdx !== null && (
                <div
                  className={`p-4 rounded-xl border-l-4 text-xs leading-relaxed ${
                    topic.quickChallenge.options[selectedOptionIdx].isCorrect
                      ? 'bg-[#E8EEE8] border-l-[#407B5D] border border-[#E1E7E1] text-[#232A24]'
                      : 'bg-[#FFF9EE] border-l-[#E6B65A] border border-[#E1E7E1] text-[#232A24]'
                  }`}
                >
                  <div className="font-bold mb-1 flex items-center gap-1.5">
                    {topic.quickChallenge.options[selectedOptionIdx].isCorrect ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-[#407B5D]" />
                        <span className="text-[#407B5D]">¡Correcto! Comprensión afianzada.</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-3.5 h-3.5 text-[#8A6318]" />
                        <span className="text-[#8A6318]">Revisa este concepto:</span>
                      </>
                    )}
                  </div>
                  <p className="text-[#59645C]">{topic.quickChallenge.options[selectedOptionIdx].feedback}</p>
                </div>
              )}
            </div>
          )}

          {/* Navigation to Next Topic */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#E1E7E1] text-xs">
            <button
              onClick={onOpenCatalogue}
              className="text-[#59645C] hover:text-[#232A24] flex items-center gap-1.5 cursor-pointer font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Ver todos los temas</span>
            </button>

            <button
              onClick={() => onNavigateTopic('classes')}
              className="min-h-[44px] px-5 py-2.5 bg-[#407B5D] hover:bg-[#33654C] text-white rounded-xl transition-colors flex items-center gap-2 cursor-pointer font-semibold shadow-xs"
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
