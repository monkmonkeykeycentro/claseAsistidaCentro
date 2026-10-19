import React from 'react';
import { StageId, UserProgress } from '../types/classStructure';
import { TOPICS_DATA } from '../data/topicsData';
import { RotateCcw, Check, BookOpen, ChevronDown, Sparkles } from 'lucide-react';

interface HeaderProps {
  currentTopicId: string;
  onSelectTopic: (topicId: string) => void;
  onOpenCatalogue: () => void;
  currentStage: StageId;
  onSelectStage: (stage: StageId) => void;
  progress: UserProgress;
  onResetAllProgress: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTopicId,
  onSelectTopic,
  onOpenCatalogue,
  currentStage,
  onSelectStage,
  progress,
  onResetAllProgress,
}) => {
  const currentTopic =
    TOPICS_DATA.find((t) => t.id === currentTopicId) || TOPICS_DATA[5];

  const stages: Array<{ id: StageId; label: string; short: string }> = [
    { id: 1, label: '1. Reconocer estructura', short: 'Estructura' },
    { id: 2, label: '2. Ubicar partes', short: 'Ubicar' },
    { id: 3, label: '3. Completar sintaxis', short: 'Sintaxis' },
    { id: 4, label: '4. Construir clase', short: 'Construir' },
  ];

  const completedCount = Object.values(progress.stageCompleted).filter(Boolean).length;
  const isClassesTopic = currentTopicId === 'classes';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-zinc-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 h-16">
          {/* Zone 1: Topic Selector Trigger */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onOpenCatalogue}
              className="min-h-[44px] flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 text-xs text-zinc-900 font-medium transition-colors"
              title="Haz clic para seleccionar otro tema del temario"
            >
              <BookOpen className="w-4 h-4 text-zinc-700 shrink-0" />
              <div className="flex items-center gap-1.5 text-left">
                <span className="font-mono text-zinc-500 font-semibold text-[11px]">
                  Tema 0{currentTopic.number}
                </span>
                <span className="text-zinc-300">·</span>
                <span className="font-semibold text-zinc-900 max-w-[120px] sm:max-w-[180px] md:max-w-[210px] truncate">
                  {currentTopic.title.split(':')[0]}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-400 shrink-0 ml-0.5" />
            </button>
          </div>

          {/* Zone 2: Navigation */}
          {isClassesTopic ? (
            <nav
              aria-label="Etapas del taller de clases"
              className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-medium"
            >
              {stages.map((st) => {
                const isActive = currentStage === st.id;
                const isDone = progress.stageCompleted[st.id];

                return (
                  <button
                    key={st.id}
                    onClick={() => onSelectStage(st.id)}
                    className={`min-h-[44px] flex items-center gap-1.5 transition-colors whitespace-nowrap py-2 px-1 relative text-xs tracking-wider uppercase ${
                      isActive
                        ? 'text-zinc-900 font-semibold'
                        : 'text-zinc-500 hover:text-zinc-900'
                    }`}
                  >
                    <span>{st.short}</span>
                    {isDone && (
                      <Check className="w-3.5 h-3.5 text-zinc-500 shrink-0" strokeWidth={2.5} />
                    )}
                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-zinc-900" />
                    )}
                  </button>
                );
              })}
            </nav>
          ) : (
            <div className="hidden md:flex items-center gap-3">
              <span className="text-xs font-mono text-zinc-500 bg-zinc-50 border border-zinc-200 px-2.5 py-1 rounded-md">
                {currentTopic.category}
              </span>
              <button
                onClick={() => onSelectTopic('classes')}
                className="min-h-[38px] px-3 py-1 text-xs font-medium text-zinc-700 hover:text-zinc-900 bg-white hover:bg-zinc-50 border border-zinc-200 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Ir al Taller de Clases (POO)</span>
              </button>
            </div>
          )}

          {/* Zone 3: Actions */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={onOpenCatalogue}
              className="min-h-[44px] px-3 py-1.5 text-xs font-medium text-zinc-700 hover:text-zinc-900 bg-white hover:bg-zinc-50 border border-zinc-200 rounded-lg transition-colors hidden sm:flex items-center gap-1.5"
            >
              <span>Temario</span>
              <span className="text-[11px] font-mono text-zinc-400">(7)</span>
            </button>

            {isClassesTopic && (
              <>
                <span className="hidden lg:inline text-xs text-zinc-400 font-mono">
                  {completedCount}/4
                </span>

                <button
                  onClick={onResetAllProgress}
                  className="min-h-[44px] px-3 py-1.5 text-xs font-medium text-zinc-600 hover:text-zinc-900 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5"
                  title="Reiniciar progreso del taller de clases"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-zinc-500" />
                  <span className="hidden sm:inline">Reiniciar</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Sub-Navigation */}
      {isClassesTopic && (
        <div className="md:hidden flex items-center justify-between border-t border-zinc-100 px-3 py-1 overflow-x-auto bg-white">
          {stages.map((st) => {
            const isActive = currentStage === st.id;
            const isDone = progress.stageCompleted[st.id];

            return (
              <button
                key={st.id}
                onClick={() => onSelectStage(st.id)}
                className={`min-h-[44px] px-3 py-2 rounded-lg whitespace-nowrap text-xs font-medium transition-colors flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-zinc-900 text-white font-medium'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                <span>{st.short}</span>
                {isDone && <Check className="w-3 h-3 text-zinc-400" strokeWidth={2.5} />}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
