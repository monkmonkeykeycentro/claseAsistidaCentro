import React from 'react';
import { TOPICS_DATA } from '../data/topicsData';
import { UserProgress, StageId } from '../types/classStructure';
import { AppUser } from '../services/firebase';
import { GenerativeHeroCanvas } from './generative/GenerativeHeroCanvas';
import { GenerativeArtwork } from './generative/GenerativeArtwork';
import { VariationSeries } from './generative/VariationSeries';
import {
  ArrowRight,
  BookOpen,
  User,
  Check,
  RotateCcw,
  Sparkles,
  Layers,
  Sliders,
  Code2,
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
    <div className="space-y-14 sm:space-y-18 animate-in fade-in duration-200">
      {/* 1. Hero Editorial Section — "Una publicación editorial programable" */}
      <section className="space-y-6 pt-2">
        {/* Meta Utility Ribbon */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#DEDDD7] pb-3 text-xs font-mono text-[#626262]">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#141414] tracking-wider uppercase">CENTRO</span>
            <span className="text-[#DEDDD7]">/</span>
            <span>Código Creativo</span>
            <span className="text-[#DEDDD7]">/</span>
            <span className="text-[#2868D9] font-medium">Processing Java</span>
          </div>

          <div className="flex items-center gap-3 text-[11px]">
            <span className="text-[#141414] font-medium">Código → Sistema → Regla → Variación → Forma</span>
            <span className="text-[#DEDDD7]">·</span>
            <span>60 FPS</span>
          </div>
        </div>

        {/* 2-Zone Grid: Left Editorial Area + Right Generative Hero Canvas */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT: Área Editorial */}
          <div className="lg:col-span-6 space-y-5">
            <div className="space-y-2">
              <span className="text-xs font-mono text-[#2868D9] uppercase tracking-widest font-semibold block">
                FIG. 00 · PUBLICACIÓN EDITORIAL PROGRAMABLE
              </span>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-[#141414] font-sans leading-[1.1]">
                Programar también es crear.
              </h1>
              <p className="text-base sm:text-lg text-[#626262] leading-relaxed font-sans pt-1">
                Explora el código como herramienta para construir formas, sistemas, imágenes e interacciones. Cada instrucción algorítmica genera un eco geométrico verificable en el lienzo.
              </p>
            </div>

            {/* Generative Principle Chain */}
            <div className="p-3.5 bg-[#FFFFFF] border border-[#DEDDD7] space-y-2 font-mono text-xs">
              <span className="text-[10px] uppercase tracking-wider text-[#626262] block font-bold">
                Metodología Generativa
              </span>
              <div className="flex items-center gap-2 flex-wrap text-[#141414] text-[11px]">
                <span className="px-2 py-0.5 bg-[#F7F6F1] border border-[#DEDDD7]">01. Código</span>
                <span className="text-[#DEDDD7]">→</span>
                <span className="px-2 py-0.5 bg-[#F7F6F1] border border-[#DEDDD7]">02. Sistema</span>
                <span className="text-[#DEDDD7]">→</span>
                <span className="px-2 py-0.5 bg-[#F7F6F1] border border-[#DEDDD7]">03. Regla</span>
                <span className="text-[#DEDDD7]">→</span>
                <span className="px-2 py-0.5 bg-[#F7F6F1] border border-[#DEDDD7]">04. Variación</span>
                <span className="text-[#DEDDD7]">→</span>
                <span className="px-2 py-0.5 bg-[#F7F6F1] border border-[#DEDDD7]">05. Forma</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 font-mono text-xs">
              <button
                onClick={onOpenOopLab}
                className="min-h-[44px] px-6 py-2.5 bg-[#141414] hover:bg-[#2868D9] text-[#F7F6F1] font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <span>Entrar al Laboratorio POO</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => onOpenWorkshop()}
                className="min-h-[44px] px-5 py-2.5 border border-[#141414] hover:bg-[#141414] hover:text-[#F7F6F1] text-[#141414] font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <span>Taller de Anatomía de Clases</span>
              </button>
            </div>

            {/* User session status */}
            <div className="pt-2 flex items-center justify-between text-xs font-mono text-[#626262] border-t border-[#DEDDD7]">
              <div className="flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-[#626262]" />
                <span>
                  {currentUser ? `${currentUser.displayName} (${currentUser.email})` : 'Modo Invitado local'}
                </span>
              </div>
              {!currentUser && (
                <button
                  onClick={onOpenAuth}
                  className="text-[#2868D9] hover:underline cursor-pointer"
                >
                  Conectar cuenta CENTRO
                </button>
              )}
            </div>
          </div>

          {/* RIGHT: Live Interactive Generative Canvas (Section 9) */}
          <div className="lg:col-span-6">
            <GenerativeHeroCanvas />
          </div>
        </div>
      </section>

      {/* 2. Interactive Experimentation Modules (Laboratorio de Objetos & Taller) */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-[#DEDDD7] pb-2">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#626262]">
            <span className="text-[#141414] font-bold">[01]</span>
            <span>Entornos de Experimentación Interactiva</span>
          </div>

          {completedStagesCount > 0 && (
            <button
              onClick={onResetProgress}
              className="text-xs font-mono text-[#626262] hover:text-[#141414] flex items-center gap-1.5 transition-colors min-h-[36px] cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reiniciar taller</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Card A: Laboratorio de Objetos (Pelota & Burbuja) */}
          <div className="bg-[#FFFFFF] border border-[#DEDDD7] hover:border-[#141414] transition-colors p-6 sm:p-7 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs font-mono text-[#626262]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-[#2868D9] inline-block" />
                  <span className="font-bold text-[#141414]">LABORATORIO POO</span>
                </div>
                <span>Módulo 1 & 2 · Processing Java</span>
              </div>

              <h2 className="text-2xl font-semibold text-[#141414] tracking-tight font-sans">
                Laboratorio de Objetos: Pelota, Burbuja y Arreglos
              </h2>

              <p className="text-sm text-[#626262] leading-relaxed font-sans">
                Aprende Programación Orientada a Objetos en Processing Java mediante la construcción progresiva: campos cartesianos, constructor con argumentos, 7 métodos de estado, oscilación orgánica bidimensional con ruido Perlin (<code className="font-mono text-xs text-[#2868D9]">noise()</code>) y control colectivo sobre arreglos dinámicos.
              </p>

              {/* Live generative illustration thumbnail */}
              <div className="border border-[#DEDDD7] p-2 bg-[#F7F6F1] flex items-center justify-center">
                <GenerativeArtwork
                  topicNumber={6}
                  width={340}
                  height={110}
                  interactive={true}
                  caption="Representación generativa de dos instancias autónomas con vectores de velocidad"
                />
              </div>

              <div className="grid grid-cols-3 gap-2 pt-1 text-xs font-mono text-[#141414]">
                <div className="p-2.5 bg-[#F7F6F1] border border-[#DEDDD7]">
                  <span className="text-[10px] text-[#626262] block">MÓDULO 1</span>
                  <span className="font-bold">Pelota</span>
                </div>
                <div className="p-2.5 bg-[#F7F6F1] border border-[#DEDDD7]">
                  <span className="text-[10px] text-[#626262] block">MÓDULO 2</span>
                  <span className="font-bold">Burbuja</span>
                </div>
                <div className="p-2.5 bg-[#F7F6F1] border border-[#DEDDD7]">
                  <span className="text-[10px] text-[#626262] block">COLECCIÓN</span>
                  <span className="font-bold">Arreglos[]</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#DEDDD7] flex items-center justify-between">
              <span className="text-xs font-mono text-[#626262]">
                Lienzo interactivo 60 FPS
              </span>
              <button
                onClick={onOpenOopLab}
                className="min-h-[44px] px-5 py-2.5 bg-[#141414] hover:bg-[#2868D9] text-[#F7F6F1] text-xs font-mono font-medium flex items-center gap-2 transition-colors cursor-pointer"
              >
                <span>Entrar al Laboratorio</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Card B: Taller Guiado de Estructura de Clases */}
          <div className="bg-[#FFFFFF] border border-[#DEDDD7] hover:border-[#141414] transition-colors p-6 sm:p-7 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs font-mono text-[#626262]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-[#D9AA3D] inline-block" />
                  <span className="font-bold text-[#141414]">TALLER CONCEPTUAL</span>
                </div>
                <span>Tema 06 · POO</span>
              </div>

              <h2 className="text-2xl font-semibold text-[#141414] tracking-tight font-sans">
                Anatomía y Estructura de una Clase en Processing
              </h2>

              <p className="text-sm text-[#626262] leading-relaxed font-sans">
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
                    className={`p-2.5 border text-xs font-mono flex items-center justify-between ${
                      s.done
                        ? 'border-[#141414] bg-[#F7F6F1] text-[#141414]'
                        : 'border-[#DEDDD7] bg-[#FFFFFF] text-[#626262]'
                    }`}
                  >
                    <span className="font-bold">{s.step}. {s.title}</span>
                    {s.done && <Check className="w-3.5 h-3.5 text-[#141414]" strokeWidth={2.5} />}
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-[#DEDDD7] flex items-center justify-between">
              <span className="text-xs font-mono text-[#626262]">
                4 etapas interactivas
              </span>
              <button
                onClick={() => onOpenWorkshop()}
                className="min-h-[44px] px-5 py-2.5 border border-[#141414] hover:bg-[#141414] hover:text-[#F7F6F1] text-[#141414] text-xs font-mono font-medium flex items-center gap-2 transition-colors cursor-pointer"
              >
                <span>{completedStagesCount > 0 ? 'Continuar Taller' : 'Iniciar Taller'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Systematic Variation Series (Section 3.3 & Section 8 - Familia E) */}
      <section className="space-y-4">
        <VariationSeries
          title="Serie de Variaciones Generativas: Familia de Repetición y Módulos"
          systemDescription="Un mismo algoritmo ejecutado bajo 4 configuraciones paramétricas distintas. Observa cómo el cambio de escala, rotación angular y modulación senoidal genera lenguajes gráficos totalmente diversos a partir de una única regla formal."
          family="repetition"
        />
      </section>

      {/* 4. Complete Curriculum Topics Section with Generative Graphic Identity (Section 11) */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-[#DEDDD7] pb-2">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#626262]">
            <span className="text-[#141414] font-bold">[02]</span>
            <span>Temario Curricular con Identidad Generativa</span>
          </div>
          <span className="text-xs font-mono text-[#626262]">7 temas con modelos visuales</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {TOPICS_DATA.map((topic) => {
            const isClasses = topic.id === 'classes';

            return (
              <div
                key={topic.id}
                className="bg-[#FFFFFF] border border-[#DEDDD7] hover:border-[#141414] transition-colors p-5 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono text-[#626262]">
                    <span className="font-bold text-[#141414]">
                      TEMA 0{topic.number}
                    </span>
                    <span>{topic.estimatedTime}</span>
                  </div>

                  {/* Generative Diagram Thumbnail connected to topic concept */}
                  <div className="border border-[#DEDDD7] bg-[#F7F6F1] flex items-center justify-center p-1">
                    <GenerativeArtwork
                      topicNumber={topic.number}
                      width={280}
                      height={130}
                      interactive={true}
                    />
                  </div>

                  <h3 className="text-base font-semibold text-[#141414] line-clamp-1 font-sans">
                    {topic.title}
                  </h3>

                  <p className="text-xs text-[#626262] line-clamp-2 leading-relaxed font-sans">
                    {topic.summary}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#DEDDD7] flex items-center justify-between">
                  <span className="text-[11px] text-[#626262] font-mono">
                    {topic.category}
                  </span>

                  {isClasses ? (
                    <button
                      onClick={() => onOpenWorkshop()}
                      className="min-h-[36px] px-3 py-1 bg-[#141414] hover:bg-[#2868D9] text-[#F7F6F1] text-xs font-mono font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <span>Taller POO</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  ) : topic.id === 'object-arrays' ? (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => onOpenOopLab()}
                        className="min-h-[36px] px-2.5 py-1 bg-[#141414] hover:bg-[#2868D9] text-[#F7F6F1] text-xs font-mono font-medium flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Sparkles className="w-3 h-3 text-[#D9AA3D]" />
                        <span>Laboratorio</span>
                      </button>
                      <button
                        onClick={() => onSelectTopic('object-arrays')}
                        className="min-h-[36px] px-2 py-1 border border-[#DEDDD7] hover:bg-[#F7F6F1] text-[#141414] text-xs font-mono transition-colors cursor-pointer"
                      >
                        Teoría
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => onSelectTopic(topic.id)}
                      className="min-h-[36px] px-3 py-1 border border-[#DEDDD7] hover:border-[#141414] hover:bg-[#F7F6F1] text-[#141414] text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <span>Ver tema</span>
                      <ArrowRight className="w-3 h-3 text-[#626262]" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. Editorial Creative Coding Philosophy Note */}
      <section className="p-6 bg-[#FFFFFF] border border-[#DEDDD7] space-y-2">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#141414] font-bold">
          <span>[03]</span>
          <span>Filosofía de Código Creativo · Generative Design</span>
        </div>
        <p className="text-xs text-[#626262] leading-relaxed font-sans max-w-3xl">
          Inspirado en los principios de <em>Generative Design: Visualize, Program, and Create with Processing</em>, este laboratorio aborda la programación como un lenguaje constructivo y plástico. La complejidad visual no surge del adorno superficial, sino de la combinación disciplinada de reglas matemáticas sencillas: iteración, modulación senoidal, ruido Perlin y encapsulamiento orientado a objetos.
        </p>
      </section>
    </div>
  );
};
