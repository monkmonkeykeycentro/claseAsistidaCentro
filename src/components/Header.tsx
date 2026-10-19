import React from 'react';
import { AppUser } from '../services/firebase';
import { User, Cloud, BookOpen } from 'lucide-react';

interface HeaderProps {
  currentView: 'home' | 'workshop' | 'topic';
  onNavigateHome: () => void;
  onOpenCatalogue: () => void;
  currentUser: AppUser | null;
  onOpenAuth: () => void;
  isSyncing?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigateHome,
  onOpenCatalogue,
  currentUser,
  onOpenAuth,
  isSyncing,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-zinc-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 h-16">
          {/* Brand: Código Creativo | centro */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onNavigateHome}
              className="flex items-center gap-2 group text-left min-h-[44px] cursor-pointer"
              title="Ir a la página de inicio"
            >
              <div className="w-7 h-7 rounded-lg bg-zinc-950 text-white flex items-center justify-center font-mono text-xs font-bold transition-transform group-hover:scale-105">
                CC
              </div>
              <div className="flex items-baseline gap-1.5 font-sans">
                <span className="font-semibold text-zinc-950 text-sm tracking-tight">
                  Código Creativo
                </span>
                <span className="text-zinc-400 font-light text-sm">|</span>
                <span className="text-zinc-500 font-medium text-xs tracking-wider uppercase font-mono">
                  centro
                </span>
              </div>
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={onNavigateHome}
              className={`min-h-[44px] px-3 py-2 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                currentView === 'home'
                  ? 'bg-zinc-100 text-zinc-950 font-semibold'
                  : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-50'
              }`}
            >
              Inicio
            </button>

            <button
              onClick={onOpenCatalogue}
              className="min-h-[44px] px-3 py-2 text-xs font-medium rounded-lg text-zinc-600 hover:text-zinc-950 hover:bg-zinc-50 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5 text-zinc-500" />
              <span>Temario</span>
              <span className="text-[11px] font-mono text-zinc-400">(7)</span>
            </button>
          </nav>

          {/* Student Account & Cloud Sync */}
          <div className="flex items-center gap-2 shrink-0">
            {currentUser ? (
              <button
                onClick={onOpenAuth}
                className="min-h-[44px] flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 text-xs font-medium text-zinc-900 transition-colors cursor-pointer"
                title={`${currentUser.displayName} (${currentUser.email})`}
              >
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || ''}
                    className="w-5 h-5 rounded-full object-cover border border-zinc-300 shrink-0"
                  />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-zinc-900 text-white text-[10px] flex items-center justify-center font-bold shrink-0">
                    {currentUser.displayName?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}
                <span className="max-w-[70px] sm:max-w-[100px] truncate text-xs font-medium hidden xs:inline">
                  {currentUser.displayName?.split(' ')[0]}
                </span>
                {currentUser.isCentroStudent && (
                  <span className="hidden md:inline text-[9px] font-mono uppercase bg-zinc-900 text-white px-1 py-0.5 rounded font-semibold">
                    CENTRO
                  </span>
                )}
                {isSyncing ? (
                  <Cloud className="w-3.5 h-3.5 text-amber-500 animate-pulse shrink-0" />
                ) : (
                  <Cloud className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                )}
              </button>
            ) : (
              <button
                onClick={onOpenAuth}
                className="min-h-[44px] flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-medium transition-colors cursor-pointer shadow-2xs"
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
