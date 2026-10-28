import React from 'react';
import { AppUser } from '../services/firebase';
import { User, Cloud, BookOpen, Sparkles, Terminal } from 'lucide-react';

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
    <header className="sticky top-0 z-40 bg-[#F6F5F0]/95 backdrop-blur-xs border-b border-[#DCDDD8]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 h-16">
          {/* Brand: Código Creativo / centro */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onNavigateHome}
              className="flex items-center gap-2.5 group text-left min-h-[44px] cursor-pointer"
              title="Laboratorio de Código Creativo — Inicio"
            >
              <div className="w-7 h-7 border border-[#181818] bg-[#181818] text-[#F6F5F0] flex items-center justify-center font-mono text-xs font-bold transition-colors group-hover:bg-[#4263CF] group-hover:border-[#4263CF]">
                CC
              </div>
              <div className="flex items-baseline gap-1.5 font-sans">
                <span className="font-semibold text-[#181818] text-sm tracking-tight">
                  Código Creativo
                </span>
                <span className="text-[#DCDDD8] font-light text-sm">/</span>
                <span className="text-[#767773] font-mono text-xs uppercase tracking-wider">
                  centro
                </span>
              </div>
            </button>
          </div>

          {/* Navigation Links — Editorial text style with focus on content */}
          <nav className="flex items-center gap-1 sm:gap-4 font-sans text-xs">
            <button
              onClick={onNavigateHome}
              className={`min-h-[44px] px-2.5 py-1.5 transition-colors cursor-pointer relative ${
                currentView === 'home'
                  ? 'text-[#181818] font-semibold after:absolute after:bottom-0 after:left-2.5 after:right-2.5 after:h-[2px] after:bg-[#4263CF]'
                  : 'text-[#767773] hover:text-[#181818]'
              }`}
            >
              Inicio
            </button>

            <button
              onClick={onNavigateOopLab}
              className={`min-h-[44px] px-2.5 py-1.5 transition-colors cursor-pointer flex items-center gap-1.5 relative ${
                currentView === 'oop-lab'
                  ? 'text-[#181818] font-semibold after:absolute after:bottom-0 after:left-2.5 after:right-2.5 after:h-[2px] after:bg-[#4263CF]'
                  : 'text-[#767773] hover:text-[#181818]'
              }`}
            >
              <span className="w-1.5 h-1.5 bg-[#4263CF] rounded-full inline-block" />
              <span>Laboratorio POO</span>
            </button>

            <button
              onClick={onOpenCatalogue}
              className="min-h-[44px] px-2.5 py-1.5 text-[#767773] hover:text-[#181818] transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5 text-[#767773]" />
              <span>Temario</span>
              <span className="text-[11px] font-mono text-[#767773]">(7)</span>
            </button>
          </nav>

          {/* Student Account & Cloud Sync */}
          <div className="flex items-center gap-2 shrink-0">
            {currentUser ? (
              <button
                onClick={onOpenAuth}
                className="min-h-[44px] flex items-center gap-2 px-2.5 py-1.5 border border-[#DCDDD8] bg-[#EEEDE8] hover:bg-[#E4E3DD] text-xs font-mono text-[#181818] transition-colors cursor-pointer"
                title={`${currentUser.displayName} (${currentUser.email})`}
              >
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || ''}
                    className="w-5 h-5 rounded-none object-cover border border-[#DCDDD8] shrink-0"
                  />
                ) : (
                  <div className="w-5 h-5 bg-[#181818] text-[#F6F5F0] text-[10px] flex items-center justify-center font-mono font-bold shrink-0">
                    {currentUser.displayName?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}
                <span className="max-w-[70px] sm:max-w-[100px] truncate text-xs font-sans font-medium hidden xs:inline">
                  {currentUser.displayName?.split(' ')[0]}
                </span>
                {currentUser.isCentroStudent && (
                  <span className="hidden md:inline text-[9px] font-mono uppercase bg-[#181818] text-[#D5E35F] px-1 py-0.5 font-bold">
                    CENTRO
                  </span>
                )}
                {isSyncing ? (
                  <Cloud className="w-3.5 h-3.5 text-[#4263CF] animate-pulse shrink-0" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block shrink-0" title="Sincronizado" />
                )}
              </button>
            ) : (
              <button
                onClick={onOpenAuth}
                className="min-h-[44px] flex items-center gap-1.5 px-3 py-1.5 bg-[#181818] hover:bg-[#4263CF] text-[#F6F5F0] text-xs font-mono transition-colors cursor-pointer"
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
