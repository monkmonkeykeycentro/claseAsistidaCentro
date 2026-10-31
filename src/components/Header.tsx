import React from 'react';
import { AppUser } from '../services/firebase';
import { User, Cloud, BookOpen } from 'lucide-react';

interface HeaderProps {
  currentView: 'home' | 'workshop' | 'topic' | 'oop-lab';
  onNavigateHome: () => void;
  onOpenCatalogue: () => void;
  onNavigateOopLab: () => void;
  currentUser: AppUser | null;
  onOpenAuth: () => void;
  isSyncing?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigateHome,
  onOpenCatalogue,
  onNavigateOopLab,
  currentUser,
  onOpenAuth,
  isSyncing,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#F7F6F1]/95 backdrop-blur-xs border-b border-[#DEDDD7]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 h-16">
          {/* Brand: Código Creativo / centro */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onNavigateHome}
              className="flex items-center gap-2.5 group text-left min-h-[44px] cursor-pointer"
              title="Laboratorio de Código Creativo — Inicio"
            >
              <div className="w-7 h-7 border border-[#141414] bg-[#141414] text-[#F7F6F1] flex items-center justify-center font-mono text-xs font-bold transition-colors group-hover:bg-[#2868D9] group-hover:border-[#2868D9]">
                CC
              </div>
              <div className="flex items-baseline gap-1.5 font-sans">
                <span className="font-semibold text-[#141414] text-sm tracking-tight">
                  Código Creativo
                </span>
                <span className="text-[#DEDDD7] font-light text-sm">/</span>
                <span className="text-[#626262] font-mono text-xs uppercase tracking-wider">
                  centro
                </span>
              </div>
            </button>
          </div>

          {/* Navigation Links — Editorial text style with zero-pill discipline */}
          <nav className="flex items-center gap-1 sm:gap-4 font-sans text-xs">
            <button
              onClick={onNavigateHome}
              className={`min-h-[44px] px-3 py-1.5 transition-colors cursor-pointer relative ${
                currentView === 'home'
                  ? 'text-[#141414] font-semibold after:absolute after:bottom-0 after:left-3 after:right-3 after:h-[2px] after:bg-[#2868D9]'
                  : 'text-[#626262] hover:text-[#141414]'
              }`}
            >
              Inicio
            </button>

            <button
              onClick={onNavigateOopLab}
              className={`min-h-[44px] px-3 py-1.5 transition-colors cursor-pointer flex items-center gap-1.5 relative ${
                currentView === 'oop-lab'
                  ? 'text-[#141414] font-semibold after:absolute after:bottom-0 after:left-3 after:right-3 after:h-[2px] after:bg-[#2868D9]'
                  : 'text-[#626262] hover:text-[#141414]'
              }`}
            >
              <span className="w-1.5 h-1.5 bg-[#2868D9] rounded-none inline-block" />
              <span>Laboratorio POO</span>
            </button>

            <button
              onClick={onOpenCatalogue}
              className="min-h-[44px] px-3 py-1.5 text-[#626262] hover:text-[#141414] transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5 text-[#626262]" />
              <span>Temario</span>
              <span className="text-[11px] font-mono text-[#626262]">(7)</span>
            </button>
          </nav>

          {/* Student Account & Cloud Sync */}
          <div className="flex items-center gap-2 shrink-0">
            {currentUser ? (
              <button
                onClick={onOpenAuth}
                className="min-h-[44px] flex items-center gap-2 px-2.5 py-1.5 border border-[#DEDDD7] bg-[#FFFFFF] hover:bg-[#F7F6F1] text-xs font-mono text-[#141414] transition-colors cursor-pointer"
                title={`${currentUser.displayName} (${currentUser.email})`}
              >
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || ''}
                    className="w-5 h-5 rounded-none object-cover border border-[#DEDDD7] shrink-0"
                  />
                ) : (
                  <div className="w-5 h-5 bg-[#141414] text-[#F7F6F1] text-[10px] flex items-center justify-center font-mono font-bold shrink-0">
                    {currentUser.displayName?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}
                <span className="max-w-[70px] sm:max-w-[100px] truncate text-xs font-sans font-medium hidden xs:inline">
                  {currentUser.displayName?.split(' ')[0]}
                </span>
                {currentUser.isCentroStudent && (
                  <span className="hidden md:inline text-[9px] font-mono uppercase bg-[#141414] text-[#D9AA3D] px-1 py-0.5 font-bold">
                    CENTRO
                  </span>
                )}
                {isSyncing ? (
                  <Cloud className="w-3.5 h-3.5 text-[#2868D9] animate-pulse shrink-0" />
                ) : (
                  <span className="w-2 h-2 bg-[#2868D9] inline-block shrink-0" title="Sincronizado" />
                )}
              </button>
            ) : (
              <button
                onClick={onOpenAuth}
                className="min-h-[44px] flex items-center gap-2 px-3 py-1.5 bg-[#141414] hover:bg-[#2868D9] text-[#F7F6F1] text-xs font-mono transition-colors cursor-pointer"
                title="Iniciar sesión para guardar tu avance"
              >
                <User className="w-3.5 h-3.5" />
                <span>Entrar</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
