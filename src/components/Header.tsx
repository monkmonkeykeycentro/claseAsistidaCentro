import React from 'react';
import { AppUser, isUserAdmin } from '../services/firebase';
import { User, Cloud, BookOpen, Settings, Compass, Layers } from 'lucide-react';

interface HeaderProps {
  currentView: 'home' | 'workshop' | 'topic' | 'oop-lab' | 'pilot' | 'units' | 'admin';
  onNavigateHome: () => void;
  onOpenCatalogue: () => void;
  onNavigateOopLab: () => void;
  onNavigatePilot?: () => void;
  onNavigateUnits?: () => void;
  onNavigateAdmin?: () => void;
  currentUser: AppUser | null;
  onOpenAuth: () => void;
  isSyncing?: boolean;
  topicCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigateHome,
  onOpenCatalogue,
  onNavigateOopLab,
  onNavigatePilot,
  onNavigateUnits,
  onNavigateAdmin,
  currentUser,
  onOpenAuth,
  isSyncing,
  topicCount = 7,
}) => {

  return (
    <header className="sticky top-0 z-40 bg-[#FFFFFF]/90 backdrop-blur-md border-b border-[#E1E7E1] shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 h-16">
          {/* Brand: Código Creativo */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onNavigateHome}
              className="flex items-center gap-2.5 group text-left min-h-[44px] cursor-pointer"
              title="Laboratorio de Código Creativo — Inicio"
            >
              <div className="w-8 h-8 rounded-xl bg-[#407B5D] text-white flex items-center justify-center font-bold text-xs shadow-xs transition-transform group-hover:scale-105">
                CC
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="font-bold text-[#232A24] text-base tracking-tight">
                  Código Creativo
                </span>
              </div>
            </button>
          </div>

          {/* Navigation Links — Friendly tabs with soft rounded corners */}
          <nav className="flex items-center gap-1.5 sm:gap-2 text-sm font-medium">
            {currentView === 'admin' ? (
              <div className="flex items-center gap-2">
                <div className="px-3 py-1 bg-[#407B5D] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs">
                  <Settings className="w-3.5 h-3.5" />
                  <span>CMS Administrativo</span>
                </div>
                <button
                  onClick={onNavigateHome}
                  className="min-h-[38px] px-3.5 py-1.5 rounded-xl border border-[#E1E7E1] bg-white hover:bg-[#E8EEE8] text-xs font-semibold text-[#232A24] transition-all cursor-pointer"
                >
                  Volver al sitio
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={onNavigateHome}
                  className={`min-h-[40px] px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                    currentView === 'home'
                      ? 'bg-[#E8EEE8] text-[#407B5D] font-bold'
                      : 'text-[#59645C] hover:text-[#232A24] hover:bg-[#E8EEE8]/50'
                  }`}
                >
                  Inicio
                </button>

                <button
                  onClick={onNavigateOopLab}
                  className={`min-h-[40px] px-3.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                    currentView === 'oop-lab'
                      ? 'bg-[#E8EEE8] text-[#407B5D] font-bold'
                      : 'text-[#59645C] hover:text-[#232A24] hover:bg-[#E8EEE8]/50'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-[#407B5D] inline-block" />
                  <span>Laboratorio POO</span>
                </button>

                {onNavigatePilot && (
                  <button
                    onClick={onNavigatePilot}
                    className={`min-h-[40px] px-3.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                      currentView === 'pilot'
                        ? 'bg-[#E8EEE8] text-[#407B5D] font-bold'
                        : 'text-[#59645C] hover:text-[#232A24] hover:bg-[#E8EEE8]/50'
                    }`}
                  >
                    <Compass className="w-3.5 h-3.5 text-[#407B5D]" />
                    <span>Exploraciones</span>
                  </button>
                )}

                {onNavigateUnits && (
                  <button
                    onClick={onNavigateUnits}
                    className={`min-h-[40px] px-3.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                      currentView === 'units'
                        ? 'bg-[#E8EEE8] text-[#407B5D] font-bold'
                        : 'text-[#59645C] hover:text-[#232A24] hover:bg-[#E8EEE8]/50'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5 text-[#407B5D]" />
                    <span>Unidades 1-3</span>
                  </button>
                )}

                <button
                  onClick={onOpenCatalogue}
                  className="min-h-[40px] px-3.5 py-1.5 rounded-xl text-[#59645C] hover:text-[#232A24] hover:bg-[#E8EEE8]/50 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <BookOpen className="w-4 h-4 text-[#59645C]" />
                  <span>Temario</span>
                  <span className="text-xs font-semibold text-[#59645C] bg-[#E8EEE8] px-1.5 py-0.5 rounded-md">{topicCount}</span>
                </button>
              </>
            )}
          </nav>

          {/* Student Account & Cloud Sync */}
          <div className="flex items-center gap-2 shrink-0">
            {isUserAdmin(currentUser) && onNavigateAdmin && currentView !== 'admin' && (
              <button onClick={onNavigateAdmin} className="min-h-[40px] px-3 py-1.5 rounded-xl border border-[#E1E7E1] text-xs font-semibold flex items-center gap-1.5 cursor-pointer" title="Administrar contenidos">
                <Settings className="w-4 h-4" />
                <span>CMS</span>
              </button>
            )}
            {currentUser ? (
              <button
                onClick={onOpenAuth}
                className="min-h-[40px] flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[#E1E7E1] bg-[#FFFFFF] hover:bg-[#E8EEE8]/50 text-xs font-medium text-[#232A24] transition-all cursor-pointer shadow-2xs"
                title={`${currentUser.displayName} (${currentUser.email})`}
              >
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || ''}
                    className="w-5 h-5 rounded-full object-cover border border-[#E1E7E1] shrink-0"
                  />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-[#407B5D] text-white text-[10px] flex items-center justify-center font-bold shrink-0">
                    {currentUser.displayName?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}
                <span className="max-w-[70px] sm:max-w-[100px] truncate hidden xs:inline">
                  {currentUser.displayName?.split(' ')[0]}
                </span>
                {isSyncing ? (
                  <Cloud className="w-3.5 h-3.5 text-[#407B5D] animate-pulse shrink-0" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-[#407B5D] inline-block shrink-0" title="Sincronizado" />
                )}
              </button>
            ) : (
              <button
                onClick={onOpenAuth}
                className="min-h-[40px] flex items-center gap-2 px-4 py-1.5 rounded-xl bg-[#407B5D] hover:bg-[#33654C] text-white text-xs font-semibold transition-all cursor-pointer shadow-xs active:scale-98"
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
