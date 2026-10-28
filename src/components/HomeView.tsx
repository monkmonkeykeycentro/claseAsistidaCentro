import React from 'react';
import { TOPICS_DATA, TopicItem } from '../data/topicsData';
import { UserProgress, StageId } from '../types/classStructure';
import { AppUser } from '../services/firebase';
import {
  ArrowRight,
  BookOpen,
  Code2,
  CheckCircle2,
  Layers,
  Sparkles,
  Terminal,
  User,
  Check,
  RotateCcw,
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

  // Group topics by category
  const categories = Array.from(new Set(TOPICS_DATA.map((t) => t.category)));

  return (
    <div className="space-y-12 sm:space-y-16 animate-in fade-in duration-200">
      {/* 1. Hero Editorial Section */}
      <section className="space-y-5 pt-2 sm:pt-4">
        <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500 font-mono">
          <span className="font-semibold text-zinc-900 tracking-wider uppercase">CENTRO</span>
          <span>·</span>
          <span>Código Creativo</span>
        </div>

        <div className="space-y-3 max-w-3xl">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-zinc-950 font-sans leading-tight">
            Código Creativo
          </h1>
          <p className="text-base sm:text-lg text-zinc-600 leading-relaxed font-sans">
            Plataforma estructurada de aprendizaje en <strong className="text-zinc-900 font-semibold">Processing Java</strong>. Explora los fundamentos conceptuales y practica la arquitectura de software aplicada a las artes visuales y el diseño computacional.
          </p>
        </div>

        {/* Student Session / Progress Bar */}
        <div className="p-4 sm:p-5 rounded-2xl border border-zinc-200 bg-zinc-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            {currentUser ? (
              currentUser.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt={currentUser.displayName || ''}
                  className="w-10 h-10 rounded-full border border-zinc-300 object-cover shrink-0"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-zinc-900 text-white flex items-center justify-center font-bold text-sm shrink-0">
                  {currentUser.displayName?.charAt(0).toUpperCase() || 'U'}
                </div>
              )
            ) : (
              <div className="w-10 h-10 rounded-full bg-zinc-200 text-zinc-600 flex items-center justify-center shrink-0">
                <User className="w-5 h-5" />
              </div>
            )}

            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-zinc-900">
                  {currentUser ? `Estudiante: ${currentUser.displayName}` : 'Sesión de invitado'}
                </p>
                {currentUser?.isCentroStudent && (
                  <span className="text-[10px] font-mono uppercase bg-zinc-900 text-white px-1.5 py-0.5 rounded font-medium">
                    CENTRO
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-500 font-sans">
                {currentUser
                  ? `${currentUser.email} · Sincronizado en la nube`
                  : 'Inicia sesión con tu cuenta @centro.edu.mx para guardar tu progreso'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {!currentUser && (
              <button
                onClick={onOpenAuth}
                className="min-h-[44px] px-4 py-2 rounded-xl bg-white hover:bg-zinc-100 border border-zinc-200 text-xs font-semibold text-zinc-900 transition-colors cursor-pointer"
              >
                Conectar cuenta
              </button>
            )}

            <div className="text-right">
              <span className="text-[11px] text-zinc-500 block font-sans">Taller de Clases (POO)</span>
              <span className="text-xs font-mono font-semibold text-zinc-900">
                {completedStagesCount} de 4 etapas ({workshopPercentage}%)
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Featured Interactive Workshop Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-zinc-500">
            <span>Módulo Destacado</span>
            <span>·</span>
            <span>Taller Práctico</span>
          </div>

          {completedStagesCount > 0 && (
            <button
              onClick={onResetProgress}
              className="text-xs text-zinc-500 hover:text-zinc-900 flex items-center gap-1 transition-colors min-h-[44px]"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reiniciar taller</span>
            </button>
          )}
        </div>

        <div className="relative rounded-2xl border-2 border-zinc-900 bg-white p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="flex items-center gap-2 text-xs text-zinc-500 font-mono">
                <span className="bg-zinc-900 text-white px-2 py-0.5 rounded text-[11px] font-semibold">
                  TEMA 06
                </span>
                <span>Programación Orientada a Objetos</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-950 tracking-tight">
                Anatomía y Estructura de una Clase en Processing
              </h2>

              <p className="text-sm sm:text-base text-zinc-600 leading-relaxed font-sans">
                Un taller interactivo paso a paso diseñado para entender las cuatro partes
                esenciales de una clase en Java: declaración, atributos, constructor con parámetros
                y métodos de comportamiento.
              </p>

              {/* 4 Steps Pills */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
                {[
                  { step: '1', title: 'Estructura', done: progress.stageCompleted[1] },
                  { step: '2', title: 'Ubicar partes', done: progress.stageCompleted[2] },
                  { step: '3', title: 'Sintaxis', done: progress.stageCompleted[3] },
                  { step: '4', title: 'Construir', done: progress.stageCompleted[4] },
                ].map((s) => (
                  <div
                    key={s.step}
                    className={`p-2.5 rounded-lg border text-xs font-medium flex items-center justify-between ${
                      s.done
                        ? 'border-zinc-900 bg-zinc-50 text-zinc-950 font-semibold'
                        : 'border-zinc-200 bg-white text-zinc-600'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="font-mono text-[11px] text-zinc-400 font-bold">{s.step}.</span>
                      <span className="truncate">{s.title}</span>
                    </div>
                    {s.done && <Check className="w-3.5 h-3.5 text-zinc-900 shrink-0" strokeWidth={2.5} />}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-3 shrink-0 lg:w-64">
              <button
                onClick={() => onOpenWorkshop()}
                className="w-full min-h-[48px] px-6 py-3.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white font-medium text-sm flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer"
              >
                <span>{completedStagesCount > 0 ? 'Continuar Taller' : 'Iniciar Taller'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <p className="text-[11px] text-zinc-400 text-center font-sans">
                Estimado: 25 min · 4 etapas guiadas
              </p>
            </div>
          </div>
        </div>

        {/* Card 2: Laboratorio de Objetos & Arreglos Dinámicos */}
        <div className="relative rounded-2xl border border-zinc-200 bg-gradient-to-br from-zinc-900 to-zinc-950 text-white p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono">
                <span className="bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded text-[11px] font-semibold flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-300" />
                  <span>LABORATORIO POO</span>
                </span>
                <span>Módulo 1: Pelota · Módulo 2: Burbuja · Constructor & Eventos</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
                Laboratorio de Objetos: Construcción Progresiva y Arreglos
              </h2>

              <p className="text-sm sm:text-base text-zinc-300 leading-relaxed font-sans">
                Aprende POO siguiendo los 5 momentos (Observar → Describir → Construir → Experimentar → Aplicar).
                Explora los 7 métodos canónicos, gobierna arreglos dinámicos en vivo, añade condicionales con <code className="text-amber-300">if</code> y programa eventos de <code className="text-amber-300">mousePressed()</code> y <code className="text-amber-300">keyPressed()</code>.
              </p>

              {/* Modules Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
                <div className="p-2.5 rounded-lg bg-white/10 border border-white/10 text-xs">
                  <span className="font-bold text-amber-300 block">Módulo 1: Pelota</span>
                  <span className="text-[11px] text-zinc-300">7 métodos canónicos y estado</span>
                </div>
                <div className="p-2.5 rounded-lg bg-white/10 border border-white/10 text-xs">
                  <span className="font-bold text-sky-300 block">Módulo 2: Burbuja</span>
                  <span className="text-[11px] text-zinc-300">Física ascendente y ciclos</span>
                </div>
                <div className="p-2.5 rounded-lg bg-white/10 border border-white/10 text-xs">
                  <span className="font-bold text-emerald-300 block">Constructor & Eventos</span>
                  <span className="text-[11px] text-zinc-300">if, mousePress, keyPress</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 shrink-0 lg:w-64">
              <button
                onClick={() => onOpenOopLab()}
                className="w-full min-h-[48px] px-6 py-3.5 rounded-xl bg-white hover:bg-zinc-100 text-zinc-950 font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Entrar al Laboratorio</span>
                <ArrowRight className="w-4 h-4 text-zinc-950" />
              </button>

              <p className="text-[11px] text-zinc-400 text-center font-sans">
                Lienzo interactivo 60 FPS · Processing Java
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Complete Curriculum Topics Section */}
      <section className="space-y-6">
        <div className="space-y-1">
          <h2 className="text-xl sm:text-2xl font-semibold text-zinc-950 tracking-tight">
            Temario del Curso
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 font-sans">
            Guía curricular completa para programar gráficos interactivos y sistemas generativos en Processing.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {TOPICS_DATA.map((topic) => {
            const isClasses = topic.id === 'classes';

            return (
              <div
                key={topic.id}
                className={`p-5 rounded-xl border flex flex-col justify-between transition-all duration-150 ${
                  isClasses
                    ? 'border-zinc-900 bg-white shadow-xs'
                    : 'border-zinc-200 bg-white hover:border-zinc-300'
                }`}
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs text-zinc-500 font-mono">
                    <span className="font-semibold text-zinc-900">
                      TEMA 0{topic.number}
                    </span>
                    <span>{topic.estimatedTime}</span>
                  </div>

                  <h3 className="text-base font-semibold text-zinc-950 line-clamp-1">
                    {topic.title}
                  </h3>

                  <p className="text-xs text-zinc-600 line-clamp-2 leading-relaxed">
                    {topic.summary}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-zinc-100 flex items-center justify-between">
                  <span className="text-[11px] text-zinc-500 font-mono">
                    {topic.category}
                  </span>

                  {isClasses ? (
                    <button
                      onClick={() => onOpenWorkshop()}
                      className="min-h-[40px] px-3 py-1.5 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <span>Taller POO</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : topic.id === 'object-arrays' ? (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => onOpenOopLab()}
                        className="min-h-[40px] px-3 py-1.5 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        <span>Laboratorio</span>
                      </button>
                      <button
                        onClick={() => onSelectTopic('object-arrays')}
                        className="min-h-[40px] px-2.5 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-medium transition-colors cursor-pointer"
                      >
                        Teoría
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => onSelectTopic(topic.id)}
                      className="min-h-[40px] px-3 py-1.5 rounded-lg bg-zinc-50 hover:bg-zinc-100 text-zinc-800 text-xs font-medium border border-zinc-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <span>Ver tema</span>
                      <ArrowRight className="w-3.5 h-3.5 text-zinc-400" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. Pedagogical Philosophy Footer */}
      <section className="p-6 rounded-2xl border border-zinc-200 bg-zinc-50 space-y-2">
        <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-500 font-semibold">
          Metodología Pedagógica CENTRO
        </h4>
        <p className="text-xs text-zinc-600 leading-relaxed font-sans max-w-3xl">
          El curso de Código Creativo aborda la programación como un medio de expresión formal y espacial. Cada concepto se vincula con su representación visual directa en el lienzo de Processing, fomentando la comprensión algorítmica a través de la experimentación estética.
        </p>
      </section>
    </div>
  );
};
