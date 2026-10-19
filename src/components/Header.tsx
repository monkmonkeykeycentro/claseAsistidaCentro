import React from 'react';
import { StageId, UserProgress } from '../types/classStructure';
import { RotateCcw, Check } from 'lucide-react';

interface HeaderProps {
  currentStage: StageId;
  onSelectStage: (stage: StageId) => void;
  progress: UserProgress;
  onResetAllProgress: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentStage,
  onSelectStage,
  progress,
  onResetAllProgress,
}) => {
  const stages: Array<{ id: StageId; label: string; short: string }> = [
    { id: 1, label: '1. Reconocer estructura', short: 'Estructura' },
    { id: 2, label: '2. Ubicar partes', short: 'Ubicar' },
    { id: 3, label: '3. Completar sintaxis', short: 'Sintaxis' },
    { id: 4, label: '4. Construir clase', short: 'Construir' },
  ];

  const completedCount = Object.values(progress.stageCompleted).filter(Boolean).length;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-zinc-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-6 h-16">
          {/* Zone 1: Wordmark */}
          <div className="flex items-center gap-2.5 shrink-0">
            <span className="text-base sm:text-lg font-semibold tracking-tight text-zinc-900 whitespace-nowrap">
              Estructura de una clase
            </span>
            <span className="hidden sm:inline text-xs text-zinc-400 font-mono">
              / Processing Java
            </span>
          </div>

          {/* Zone 2: Navigation */}
          <nav
            aria-label="Etapas de aprendizaje"
            className="hidden md:flex items-center gap-8 text-sm font-medium"
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

          {/* Zone 3: Actions */}
          <div className="flex items-center gap-3 shrink-0">
            <span className="hidden lg:inline text-xs text-zinc-400 font-mono">
              {completedCount}/4
            </span>

            <button
              onClick={onResetAllProgress}
              className="min-h-[44px] px-3.5 py-2 text-xs font-medium text-zinc-600 hover:text-zinc-900 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded-lg transition-colors whitespace-nowrap flex items-center gap-2"
              title="Reiniciar progreso"
            >
              <RotateCcw className="w-3.5 h-3.5 text-zinc-500" />
              <span className="hidden sm:inline">Reiniciar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Stage Selector */}
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
    </header>
  );
};
