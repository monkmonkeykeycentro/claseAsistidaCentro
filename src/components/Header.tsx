import React from 'react';
import { StageId, UserProgress } from '../types/classStructure';
import { RotateCcw, CheckCircle2 } from 'lucide-react';

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
    <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-lg font-bold tracking-tight text-white whitespace-nowrap">
              Estructura de una clase
            </span>
            <span className="hidden sm:inline text-xs text-slate-500">· Processing Java</span>
          </div>

          {/* Zone 2: Clean single-line text navigation links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
            {stages.map((st) => {
              const isActive = currentStage === st.id;
              const isDone = progress.stageCompleted[st.id];

              return (
                <button
                  key={st.id}
                  onClick={() => onSelectStage(st.id)}
                  className={`flex items-center gap-1.5 transition-colors whitespace-nowrap py-1 relative ${
                    isActive
                      ? 'text-cyan-400 font-semibold'
                      : 'text-slate-400 hover:text-slate-100'
                  }`}
                >
                  <span>{st.short}</span>
                  {isDone && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  )}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400 rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="hidden lg:flex items-center gap-2 text-xs text-slate-400 font-mono">
              <span>{completedCount}/4 etapas</span>
            </div>

            <button
              onClick={onResetAllProgress}
              className="px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800/80 hover:bg-slate-700 hover:text-white rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5"
              title="Reiniciar todo el progreso"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reiniciar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Stage Selector Strip */}
      <div className="md:hidden flex items-center justify-around border-t border-slate-800/80 px-2 py-2 overflow-x-auto text-xs bg-slate-900/50">
        {stages.map((st) => {
          const isActive = currentStage === st.id;
          const isDone = progress.stageCompleted[st.id];

          return (
            <button
              key={st.id}
              onClick={() => onSelectStage(st.id)}
              className={`px-2.5 py-1 rounded-md whitespace-nowrap font-medium transition-colors flex items-center gap-1 ${
                isActive
                  ? 'bg-cyan-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>{st.short}</span>
              {isDone && <CheckCircle2 className="w-3 h-3 text-emerald-300" />}
            </button>
          );
        })}
      </div>
    </header>
  );
};
