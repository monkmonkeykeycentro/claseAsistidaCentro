/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AppUser, isUserAdmin } from '../services/firebase';
import {
  User,
  Cloud,
  BookOpen,
  Settings,
  Compass,
  Layers,
  PenTool,
  Menu,
  X,
  Home,
  ChevronRight,
  Film,
} from 'lucide-react';
import {
  HeaderNavigationItem,
  DEFAULT_HEADER_NAVIGATION,
  NavigationTarget,
} from '../types/cms';

interface HeaderProps {
  currentView: 'home' | 'workshop' | 'topic' | 'oop-lab' | 'pilot' | 'units' | 'admin' | 'class-designer' | 'horse';
  onNavigateHome: () => void;
  onOpenCatalogue: () => void;
  onNavigateOopLab: () => void;
  onNavigatePilot?: () => void;
  onNavigateUnits?: () => void;
  onNavigateClassDesigner?: () => void;
  onNavigateHorse?: () => void;
  onNavigateAdmin?: () => void;
  currentUser: AppUser | null;
  onOpenAuth: () => void;
  isSyncing?: boolean;
  topicCount?: number;
  navigationItems?: HeaderNavigationItem[];
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigateHome,
  onOpenCatalogue,
  onNavigateOopLab,
  onNavigatePilot,
  onNavigateUnits,
  onNavigateClassDesigner,
  onNavigateHorse,
  onNavigateAdmin,
  currentUser,
  onOpenAuth,
  isSyncing,
  topicCount = 7,
  navigationItems,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close mobile menu when screen resizes to desktop width
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleMobileNav = (callback?: () => void) => {
    setIsMobileMenuOpen(false);
    if (callback) callback();
  };

  const getActionForTarget = (target: NavigationTarget) => {
    switch (target) {
      case 'home':
        return onNavigateHome;
      case 'horse':
        return onNavigateHorse || onNavigatePilot || onNavigateHome;
      case 'units':
        return onNavigateUnits;
      case 'oop-lab':
        return onNavigateOopLab;
      case 'class-designer':
        return onNavigateClassDesigner;
      case 'pilot':
        return onNavigatePilot;
      case 'catalogue':
        return onOpenCatalogue;
      default:
        return onNavigateHome;
    }
  };

  const isTargetActive = (target: NavigationTarget) => {
    if (target === 'home') return currentView === 'home';
    if (target === 'horse') return currentView === 'horse';
    if (target === 'units') return currentView === 'units';
    if (target === 'oop-lab') return currentView === 'oop-lab';
    if (target === 'class-designer') return currentView === 'class-designer';
    if (target === 'pilot') return currentView === 'pilot';
    return false;
  };

  const getIconForTarget = (target: NavigationTarget) => {
    switch (target) {
      case 'home':
        return null;
      case 'horse':
        return <Film className="w-3.5 h-3.5 text-[#407B5D]" />;
      case 'units':
        return <Layers className="w-3.5 h-3.5 text-[#407B5D]" />;
      case 'oop-lab':
        return <span className="w-2 h-2 rounded-full bg-[#407B5D] inline-block" />;
      case 'class-designer':
        return <PenTool className="w-3.5 h-3.5 text-[#407B5D]" />;
      case 'pilot':
        return <Compass className="w-3.5 h-3.5 text-[#407B5D]" />;
      case 'catalogue':
        return <BookOpen className="w-3.5 h-3.5 text-[#59645C]" />;
      default:
        return null;
    }
  };

  const getMobileIconForTarget = (target: NavigationTarget) => {
    switch (target) {
      case 'home':
        return <Home className="w-4 h-4 text-[#407B5D]" />;
      case 'horse':
        return <Film className="w-4 h-4 text-[#407B5D]" />;
      case 'units':
        return <Layers className="w-4 h-4 text-[#407B5D]" />;
      case 'oop-lab':
        return <span className="w-2.5 h-2.5 rounded-full bg-[#407B5D]" />;
      case 'class-designer':
        return <PenTool className="w-4 h-4 text-[#407B5D]" />;
      case 'pilot':
        return <Compass className="w-4 h-4 text-[#407B5D]" />;
      case 'catalogue':
        return <BookOpen className="w-4 h-4 text-[#59645C]" />;
      default:
        return <Home className="w-4 h-4 text-[#407B5D]" />;
    }
  };

  const effectiveNavItems = (navigationItems && navigationItems.length > 0 ? navigationItems : DEFAULT_HEADER_NAVIGATION)
    .filter((item) => item.visibleInHeader)
    .sort((a, b) => a.position - b.position);

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#FFFFFF]/95 backdrop-blur-md border-b border-[#E1E7E1] shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-3 h-16">
            {/* Brand: Código Creativo */}
            <div className="flex items-center gap-2.5 shrink-0">
              <button
                onClick={() => handleMobileNav(onNavigateHome)}
                className="flex items-center gap-2 group text-left min-h-[44px] cursor-pointer"
                title="Laboratorio de Código Creativo — Inicio"
              >
                <div className="w-8 h-8 rounded-xl bg-[#407B5D] text-white flex items-center justify-center font-bold text-xs shadow-xs transition-transform group-hover:scale-105">
                  CC
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-[#232A24] text-sm sm:text-base tracking-tight leading-tight">
                    Código Creativo
                  </span>
                  <span className="text-[10px] text-[#59645C] font-mono leading-none hidden sm:inline">
                    Processing Java
                  </span>
                </div>
              </button>
            </div>

            {/* Desktop Navigation Links (hidden on screens < 1024px to prevent any overflow) */}
            <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5 text-xs xl:text-sm font-medium">
              {currentView === 'admin' ? (
                <div className="flex items-center gap-2">
                  <div className="px-3 py-1 bg-[#407B5D] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs">
                    <Settings className="w-3.5 h-3.5" />
                    <span>CMS Administrativo</span>
                  </div>
                  <button
                    onClick={onNavigateHome}
                    className="min-h-[38px] px-3 py-1.5 rounded-xl border border-[#E1E7E1] bg-white hover:bg-[#E8EEE8] text-xs font-semibold text-[#232A24] transition-all cursor-pointer"
                  >
                    Volver al sitio
                  </button>
                </div>
              ) : (
                effectiveNavItems.map((item) => {
                  const action = getActionForTarget(item.target);
                  if (!action) return null;
                  const active = isTargetActive(item.target);
                  const icon = getIconForTarget(item.target);

                  return (
                    <button
                      key={item.id}
                      onClick={action}
                      title={item.description || item.label}
                      className={`min-h-[38px] px-2.5 xl:px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                        active
                          ? 'bg-[#E8EEE8] text-[#407B5D] font-bold'
                          : 'text-[#59645C] hover:text-[#232A24] hover:bg-[#E8EEE8]/50'
                      }`}
                    >
                      {icon}
                      <span>{item.label}</span>
                      {item.badge ? (
                        <span className="text-[11px] font-semibold text-[#59645C] bg-[#E8EEE8] px-1.5 py-0.5 rounded-md">
                          {item.badge}
                        </span>
                      ) : item.target === 'catalogue' ? (
                        <span className="text-[11px] font-semibold text-[#59645C] bg-[#E8EEE8] px-1.5 py-0.5 rounded-md">
                          {topicCount}
                        </span>
                      ) : null}
                    </button>
                  );
                })
              )}
            </nav>

            {/* Right Side: Account + Mobile Toggle */}
            <div className="flex items-center gap-2 shrink-0">
              {isUserAdmin(currentUser) && onNavigateAdmin && currentView !== 'admin' && (
                <button
                  onClick={onNavigateAdmin}
                  className="hidden sm:flex min-h-[38px] px-2.5 sm:px-3 py-1.5 rounded-xl border border-[#E1E7E1] text-xs font-semibold items-center gap-1.5 cursor-pointer hover:bg-[#E8EEE8]"
                  title="Administrar contenidos"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>CMS</span>
                </button>
              )}

              {/* User Account / Login */}
              {currentUser ? (
                <button
                  onClick={onOpenAuth}
                  className="min-h-[38px] flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl border border-[#E1E7E1] bg-[#FFFFFF] hover:bg-[#E8EEE8]/50 text-xs font-medium text-[#232A24] transition-all cursor-pointer shadow-2xs"
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
                  <span className="max-w-[70px] sm:max-w-[100px] truncate hidden sm:inline">
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
                  className="min-h-[38px] flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-xl bg-[#407B5D] hover:bg-[#33654C] text-white text-xs font-semibold transition-all cursor-pointer shadow-xs active:scale-98"
                  title="Iniciar sesión para guardar tu avance"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Entrar</span>
                </button>
              )}

              {/* Mobile Hamburger Button (visible strictly on < lg) */}
              <button
                onClick={() => setIsMobileMenuOpen((prev) => !prev)}
                className="lg:hidden min-h-[40px] min-w-[40px] p-2 rounded-xl border border-[#E1E7E1] bg-white hover:bg-[#E8EEE8] text-[#232A24] transition-all flex items-center justify-center cursor-pointer shadow-2xs"
                aria-label={isMobileMenuOpen ? 'Cerrar menú' : 'Abrir menú de navegación'}
                aria-expanded={isMobileMenuOpen}
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5 text-[#232A24]" />
                ) : (
                  <Menu className="w-5 h-5 text-[#232A24]" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer / Dropdown */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-[#E1E7E1] bg-white animate-in slide-in-from-top-2 duration-200 shadow-md">
            <div className="max-w-6xl mx-auto px-4 py-4 space-y-1.5">
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#59645C] px-3 py-1 font-mono">
                Navegación del Laboratorio
              </div>

              {effectiveNavItems.map((item) => {
                const action = getActionForTarget(item.target);
                if (!action) return null;
                const active = isTargetActive(item.target);
                const icon = getMobileIconForTarget(item.target);

                return (
                  <button
                    key={item.id}
                    onClick={() => handleMobileNav(action)}
                    className={`w-full min-h-[44px] px-3.5 py-2 rounded-xl flex items-center justify-between text-left transition-colors cursor-pointer ${
                      active
                        ? 'bg-[#E8EEE8] text-[#407B5D] font-bold'
                        : 'text-[#232A24] hover:bg-[#F7F8F4]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 text-sm">
                      {icon}
                      <div className="flex flex-col">
                        <span>{item.label}</span>
                        {item.description && (
                          <span className="text-[11px] text-[#59645C] font-normal leading-tight line-clamp-1">
                            {item.description}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.badge ? (
                        <span className="text-[11px] font-semibold text-[#59645C] bg-[#E8EEE8] px-2 py-0.5 rounded-md">
                          {item.badge}
                        </span>
                      ) : item.target === 'catalogue' ? (
                        <span className="text-[11px] font-semibold text-[#59645C] bg-[#E8EEE8] px-2 py-0.5 rounded-md">
                          {topicCount}
                        </span>
                      ) : null}
                      {active ? (
                        <span className="text-[11px] font-bold text-[#407B5D] bg-white px-2 py-0.5 rounded-md">
                          Actual
                        </span>
                      ) : (
                        <ChevronRight className="w-4 h-4 text-[#8E8E89]" />
                      )}
                    </div>
                  </button>
                );
              })}

              {isUserAdmin(currentUser) && onNavigateAdmin && (
                <div className="pt-2 border-t border-[#E1E7E1]">
                  <button
                    onClick={() => handleMobileNav(onNavigateAdmin)}
                    className="w-full min-h-[44px] px-3.5 py-2 rounded-xl flex items-center justify-between text-left bg-[#407B5D]/10 text-[#407B5D] font-bold hover:bg-[#407B5D]/20 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 text-sm">
                      <Settings className="w-4 h-4" />
                      <span>CMS Administrativo</span>
                    </div>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Backdrop overlay for mobile menu */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/20 backdrop-blur-2xs z-30 lg:hidden"
          aria-hidden="true"
        />
      )}
    </>
  );
};
