import React from 'react';
import { TOPICS_DATA } from '../data/topicsData';
import { UserProgress, StageId } from '../types/classStructure';
import { AppUser } from '../services/firebase';
import {
  ArrowRight,
  BookOpen,
  Code2,
  Terminal,
  User,
  Check,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

interface HomeViewProps {
  onOpenWorkshop: (stage?: StageId) => void;
  onOpenOopLab: () => void;
  onSelectTopic: (topicId: string) => void;
  progress: UserProgress;
  currentUser: AppUser | null;
  onOpenAuth: () => void;
  onResetProgress: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onOpenWorkshop,
  onOpenOopLab,
  onSelectTopic,
  progress,
  currentUser,
  onOpenAuth,
  onResetProgress,
}) => {
  const completedStagesCount = Object.values(progress.stageCompleted).filter(Boolean).length;
  const workshopPercentage = Math.round((completedStagesCount / 4) * 100);

  return (
    <div className="space-y-12 sm:space-y-16 animate-in fade-in duration-200">
      {/* 1. Hero Editorial Section — Inspired by Generative Design & Coding Art */}
      <section className="space-y-6 pt-2">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#DCDDD8] pb-4">
          <div className="flex items-center gap-2 text-xs font-mono text-[#767773]">
            <span className="font-semibold text-[#181818] tracking-wider uppercase">CENTRO</span>
            <span className="text-[#DCDDD8]">/</span>
            <span>Laboratorio de Código Creativo</span>
            <span className="text-[#DCDDD8]">/</span>
            <span className="text-[#4263CF]">Processing Java</span>
          </div>

          <div className="text-[11px] font-mono text-[#767773] flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-[#D5E35F] border border-[#181818] inline-block" />
            <span>Sistema 2D Canvas · 60 FPS</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 space-y-4">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-[#181818] font-sans leading-[1.12]">
              Código Creativo
            </h1>
            <p className="text-base sm:text-lg text-[#555652] leading-relaxed font-sans max-w-2xl">
              Plataforma de exploración y arquitectura de software para diseño computacional y artes visuales. Aprende <strong className="text-[#181818] font-medium">Processing Java</strong> conectando directamente la lógica de objetos, variables y métodos con su manifestación gráfica en pantalla.
            </p>

            {/* Methodological Sequence Ribbon: Observa → Modifica → Explora → Reflexiona */}
            <div className="pt-2 flex items-center gap-2 sm:gap-4 flex-wrap text-xs font-mono text-[#767773]">
              <span className="text-[#181818] font-medium">Secuencia:</span>
              <span className="px-2 py-0.5 bg-[#EEEDE8] text-[#181818] border border-[#DCDDD8]">01. Observa</span>
              <span className="text-[#DCDDD8]">→</span>
              <span className="px-2 py-0.5 bg-[#EEEDE8] text-[#181818] border border-[#DCDDD8]">02. Modifica</span>
              <span className="text-[#DCDDD8]">→</span>
              <span className="px-2 py-0.5 bg-[#EEEDE8] text-[#181818] border border-[#DCDDD8]">03. Explora</span>
              <span className="text-[#DCDDD8]">→</span>
              <span className="px-2 py-0.5 bg-[#EEEDE8] text-[#181818] border border-[#DCDDD8]">04. Reflexiona</span>
            </div>
          </div>

          {/* Student Session Card in Warm Generative Surface */}
          <div className="lg:col-span-4 p-5 bg-[#EEEDE8] border border-[#DCDDD8] space-y-4">
            <div className="flex items-center justify-between border-b border-[#DCDDD8] pb-3">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#767773]">
                Estado de la sesión
              </span>
              {currentUser?.isCentroStudent && (
                <span className="text-[9px] font-mono uppercase bg-[#181818] text-[#D5E35F] px-1.5 py-0.5 font-bold">
                  CENTRO
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              {currentUser ? (
                currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || ''}
                    className="w-9 h-9 border border-[#DCDDD8] object-cover shrink-0"
                  />
                ) : (
                  <div className="w-9 h-9 bg-[#181818] text-[#F6F5F0] flex items-center justify-center font-mono font-bold text-xs shrink-0">
                    {currentUser.displayName?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )
              ) : (
                <div className="w-9 h-9 border border-[#DCDDD8] bg-[#F6F5F0] text-[#767773] flex items-center justify-center shrink-0">
                  <User className="w-4 h-4" />
                </div>
              )}

              <div className="min-w-0">
                <p className="text-xs font-semibold text-[#181818] truncate">
                  {currentUser ? currentUser.displayName : 'Modo Invitado'}
                </p>
                <p className="text-[11px] text-[#767773] font-mono truncate">
                  {currentUser ? currentUser.email : 'Sin sincronización en la nube'}
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-[#DCDDD8] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-[#767773] uppercase block">
                  Taller POO
                </span>
                <span className="text-xs font-mono font-bold text-[#181818]">
                  {completedStagesCount}/4 etapas ({workshopPercentage}%)
                </span>
              </div>

              {!currentUser && (
                <button
                  onClick={onOpenAuth}
                  className="min-h-[36px] px-3 py-1 bg-[#181818] hover:bg-[#4263CF] text-[#F6F5F0] text-xs font-mono transition-colors cursor-pointer"
                >
                  Conectar cuenta
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 2. Interactive Experimentation Modules */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-[#DCDDD8] pb-2">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#767773]">
            <span className="text-[#181818] font-bold">[01]</span>
            <span>Módulos de Experimentación Interactiva</span>
          </div>

          {completedStagesCount > 0 && (
            <button
              onClick={onResetProgress}
              className="text-xs font-mono text-[#767773] hover:text-[#181818] flex items-center gap-1.5 transition-colors min-h-[36px] cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reiniciar taller</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Card A: Laboratorio de Objetos (Pelota & Burbuja) */}
          <div className="bg-[#FFFFFF] border border-[#DCDDD8] hover:border-[#181818] transition-colors p-6 sm:p-7 flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-mono text-[#767773]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-[#D5E35F] border border-[#181818] inline-block" />
                  <span className="font-bold text-[#181818]">LABORATORIO POO</span>
                </div>
                <span>Módulo 1 & 2</span>
              </div>

              <h2 className="text-2xl font-semibold text-[#181818] tracking-tight font-sans">
                Laboratorio de Objetos: Pelota, Burbuja y Arreglos
              </h2>

              <p className="text-sm text-[#555652] leading-relaxed font-sans">
                Aprende Programación Orientada a Objetos en Processing Java mediante la construcción progresiva: campos cartesianos, constructor con argumentos, 7 métodos de estado, oscilación orgánica bidimensional con ruido Perlin (<code className="font-mono text-xs text-[#4263CF]">noise()</code>) y control colectivo sobre arreglos dinámicos.
              </p>

              <div className="grid grid-cols-3 gap-2 pt-2 text-xs font-mono text-[#181818]">
                <div className="p-2.5 bg-[#F6F5F0] border border-[#DCDDD8]">
                  <span className="text-[10px] text-[#767773] block">MÓDULO 1</span>
                  <span className="font-bold">Pelota</span>
                </div>
                <div className="p-2.5 bg-[#F6F5F0] border border-[#DCDDD8]">
                  <span className="text-[10px] text-[#767773] block">MÓDULO 2</span>
                  <span className="font-bold">Burbuja</span>
                </div>
                <div className="p-2.5 bg-[#F6F5F0] border border-[#DCDDD8]">
                  <span className="text-[10px] text-[#767773] block">COLECCIÓN</span>
                  <span className="font-bold">Arreglos[]</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#DCDDD8] flex items-center justify-between">
              <span className="text-xs font-mono text-[#767773]">
                Lienzo interactivo 60 FPS
              </span>
              <button
                onClick={() => onOpenOopLab()}
                className="min-h-[44px] px-5 py-2.5 bg-[#181818] hover:bg-[#4263CF] text-[#F6F5F0] text-xs font-mono font-medium flex items-center gap-2 transition-colors cursor-pointer"
              >
                <span>Entrar al Laboratorio</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Card B: Taller Guiado de Estructura de Clases */}
          <div className="bg-[#FFFFFF] border border-[#DCDDD8] hover:border-[#181818] transition-colors p-6 sm:p-7 flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-mono text-[#767773]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-[#4263CF] inline-block" />
                  <span className="font-bold text-[#181818]">TALLER CONCEPTUAL</span>
                </div>
                <span>Tema 06 · POO</span>
              </div>

              <h2 className="text-2xl font-semibold text-[#181818] tracking-tight font-sans">
                Anatomía y Estructura de una Clase en Processing
              </h2>

              <p className="text-sm text-[#555652] leading-relaxed font-sans">
                Recorrido analítico en 4 etapas para comprender las partes anatómicas de una clase: declaración del molde, asignación de campos en memoria, inicialización del constructor y firma de métodos.
              </p>

              {/* 4 Steps Checklist */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                {[
                  { step: '01', title: 'Estructura', done: progress.stageCompleted[1] },
                  { step: '02', title: 'Ubicar partes', done: progress.stageCompleted[2] },
                  { step: '03', title: 'Sintaxis', done: progress.stageCompleted[3] },
                  { step: '04', title: 'Construir', done: progress.stageCompleted[4] },
                ].map((s) => (
                  <div
                    key={s.step}
                    className={`p-2 border text-xs font-mono flex items-center justify-between ${
                      s.done
                        ? 'border-[#181818] bg-[#EEEDE8] text-[#181818]'
                        : 'border-[#DCDDD8] bg-[#F6F5F0] text-[#767773]'
                    }`}
                  >
                    <span className="font-bold">{s.step}. {s.title}</span>
                    {s.done && <Check className="w-3.5 h-3.5 text-[#181818]" strokeWidth={2.5} />}
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-[#DCDDD8] flex items-center justify-between">
              <span className="text-xs font-mono text-[#767773]">
                4 etapas interactivas
              </span>
              <button
                onClick={() => onOpenWorkshop()}
                className="min-h-[44px] px-5 py-2.5 border border-[#181818] hover:bg-[#181818] hover:text-[#F6F5F0] text-[#181818] text-xs font-mono font-medium flex items-center gap-2 transition-colors cursor-pointer"
              >
                <span>{completedStagesCount > 0 ? 'Continuar Taller' : 'Iniciar Taller'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Complete Curriculum Topics Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-[#DCDDD8] pb-2">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#767773]">
            <span className="text-[#181818] font-bold">[02]</span>
            <span>Temario Curricular del Curso</span>
          </div>
          <span className="text-xs font-mono text-[#767773]">7 temas disponibles</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {TOPICS_DATA.map((topic) => {
            const isClasses = topic.id === 'classes';

            return (
              <div
                key={topic.id}
                className="bg-[#FFFFFF] border border-[#DCDDD8] hover:border-[#181818] transition-colors p-5 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-mono text-[#767773]">
                    <span className="font-bold text-[#181818]">
                      TEMA 0{topic.number}
                    </span>
                    <span>{topic.estimatedTime}</span>
                  </div>

                  <h3 className="text-base font-semibold text-[#181818] line-clamp-1 font-sans">
                    {topic.title}
                  </h3>

                  <p className="text-xs text-[#555652] line-clamp-2 leading-relaxed font-sans">
                    {topic.summary}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#DCDDD8] flex items-center justify-between">
                  <span className="text-[11px] text-[#767773] font-mono">
                    {topic.category}
                  </span>

                  {isClasses ? (
                    <button
                      onClick={() => onOpenWorkshop()}
                      className="min-h-[36px] px-3 py-1 bg-[#181818] hover:bg-[#4263CF] text-[#F6F5F0] text-xs font-mono font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <span>Taller POO</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  ) : topic.id === 'object-arrays' ? (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => onOpenOopLab()}
                        className="min-h-[36px] px-2.5 py-1 bg-[#181818] hover:bg-[#4263CF] text-[#F6F5F0] text-xs font-mono font-medium flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Sparkles className="w-3 h-3 text-[#D5E35F]" />
                        <span>Laboratorio</span>
                      </button>
                      <button
                        onClick={() => onSelectTopic('object-arrays')}
                        className="min-h-[36px] px-2 py-1 border border-[#DCDDD8] hover:bg-[#EEEDE8] text-[#181818] text-xs font-mono transition-colors cursor-pointer"
                      >
                        Teoría
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => onSelectTopic(topic.id)}
                      className="min-h-[36px] px-3 py-1 border border-[#DCDDD8] hover:border-[#181818] hover:bg-[#EEEDE8] text-[#181818] text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <span>Ver tema</span>
                      <ArrowRight className="w-3 h-3 text-[#767773]" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. Editorial Creative Coding Philosophy Note */}
      <section className="p-6 bg-[#EEEDE8] border border-[#DCDDD8] space-y-2">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#181818] font-bold">
          <span>[03]</span>
          <span>Filosofía de Código Creativo</span>
        </div>
        <p className="text-xs text-[#555652] leading-relaxed font-sans max-w-3xl">
          Inspirado en los principios de <em>Generative Design</em> y <em>Coding Art</em>, este espacio aborda la programación como un lenguaje constructivo y plástico. Cada instrucción algorítmica genera un eco geométrico inmediato en el lienzo cartesiano, promoviendo el rigor técnico a través de la experimentación visual abierta.
        </p>
      </section>
    </div>
  );
};
