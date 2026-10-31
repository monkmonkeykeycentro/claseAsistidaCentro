import React from 'react';
import { TOPICS_DATA, TopicItem } from '../data/topicsData';
import { UserProgress, StageId } from '../types/classStructure';
import { AppUser } from '../services/firebase';
import { GenerativeHeroCanvas } from './generative/GenerativeHeroCanvas';
import { GenerativeArtwork } from './generative/GenerativeArtwork';
import { VariationSeries } from './generative/VariationSeries';
import { CmsSiteContentCombined } from '../types/cms';
import {
  ArrowRight,
  BookOpen,
  User,
  Check,
  RotateCcw,
  Sparkles,
  Layers,
  Play,
  Heart,
} from 'lucide-react';

interface HomeViewProps {
  onOpenWorkshop: (stage?: StageId) => void;
  onOpenOopLab?: () => void;
  onNavigateOopLab?: () => void;
  onSelectTopic: (topicId: string) => void;
  progress?: UserProgress;
  classesProgress?: UserProgress;
  currentUser: AppUser | null;
  onOpenAuth?: () => void;
  onResetProgress?: () => void;
  siteContent?: CmsSiteContentCombined | null;
  onNavigateAdmin?: () => void;
  topics?: TopicItem[];
}

export const HomeView: React.FC<HomeViewProps> = ({
  onOpenWorkshop,
  onOpenOopLab,
  onNavigateOopLab,
  onSelectTopic,
  progress,
  classesProgress,
  currentUser,
  onOpenAuth,
  onResetProgress,
  siteContent,
  onNavigateAdmin,
  topics,
}) => {
  const allCurriculumTopics = topics && topics.length > 0 ? topics : TOPICS_DATA;
  const activeProgress = progress || classesProgress || {
    stageCompleted: { 1: false, 2: false, 3: false, 4: false },
    stage3CompletedExercises: [],
    stage2Placements: {},
    stage4BuilderCustomized: false,
  };

  const handleOpenOop = onNavigateOopLab || onOpenOopLab || (() => {});

  const completedStagesCount = Object.values(activeProgress.stageCompleted).filter(Boolean).length;
  const workshopPercentage = Math.round((completedStagesCount / 4) * 100);

  return (
    <div className="space-y-12 sm:space-y-16 animate-in fade-in duration-200">
      {/* 1. Friendly Hero Section — Learning & Creative Coding */}
      <section className="space-y-6 pt-2">
        {/* Soft Ribbon Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E1E7E1] pb-3 text-xs text-[#59645C]">
          <div className="flex items-center gap-2 font-medium">
            <span className="font-bold text-[#232A24] tracking-wide">CENTRO</span>
            <span className="text-[#E1E7E1]">/</span>
            <span>Código Creativo</span>
            <span className="text-[#E1E7E1]">/</span>
            <span className="text-[#407B5D] font-semibold bg-[#E8EEE8] px-2 py-0.5 rounded-md">
              Processing Java
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-[#407B5D]" />
            <span className="text-[#59645C]">Plataforma de aprendizaje accesible</span>
          </div>
        </div>

        {/* 2-Zone Grid: Left Friendly Intro + Right Generative Hero Canvas */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* LEFT: Friendly Editorial Area */}
          <div className="lg:col-span-6 space-y-5">
            <div className="space-y-2.5">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#407B5D] bg-[#E8EEE8] px-2.5 py-1 rounded-full">
                <Sparkles className="w-3.5 h-3.5 text-[#E6B65A]" />
                <span>Laboratorio de Código Creativo</span>
              </span>

              <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold tracking-tight text-[#232A24] leading-[1.15]">
                {siteContent?.heroHeadline || 'Aprende a programar creando arte y sistemas visuales.'}
              </h1>

              <p className="text-base sm:text-lg text-[#59645C] leading-relaxed pt-1">
                {siteContent?.heroSubtitle ||
                  'Descubre la programación como una herramienta para dar vida a formas, animaciones y patrones visuales. En cada paso escribes código en Processing Java y ves su resultado interactivo de inmediato.'}
              </p>
            </div>

            {/* Generative Principle Chain — Friendly Rounded Badges */}
            <div className="p-4 bg-[#FFFFFF] border border-[#E1E7E1] rounded-2xl space-y-2.5 shadow-xs">
              <span className="text-xs font-bold text-[#232A24] block">
                ¿Cómo funciona el pensamiento generativo?
              </span>
              <div className="flex items-center gap-2 flex-wrap text-xs">
                {(siteContent?.generativePrinciples || [
                  '1. Código',
                  '2. Sistema',
                  '3. Regla',
                  '4. Variación',
                  '5. Forma',
                ]).map((principle, idx, arr) => (
                  <React.Fragment key={idx}>
                    <span className="px-2.5 py-1 bg-[#E8EEE8] text-[#407B5D] font-bold rounded-lg">
                      {principle}
                    </span>
                    {idx < arr.length - 1 && (
                      <span className="text-[#59645C] font-semibold">→</span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* CTAs */}
            <div className="pt-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                onClick={handleOpenOop}
                className="min-h-[44px] px-6 py-2.5 bg-[#407B5D] hover:bg-[#33654C] text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-xs active:scale-98 cursor-pointer"
              >
                <span>Entrar al Laboratorio POO</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onOpenWorkshop()}
                className="min-h-[44px] px-5 py-2.5 border border-[#E1E7E1] bg-white hover:bg-[#E8EEE8]/40 text-[#232A24] font-semibold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs"
              >
                <span>Taller de Anatomía de Clases</span>
              </button>
            </div>

            {/* Student session bar */}
            <div className="pt-2 flex items-center justify-between text-xs text-[#59645C] border-t border-[#E1E7E1]">
              <div className="flex items-center gap-2 font-medium">
                <User className="w-4 h-4 text-[#407B5D]" />
                <span>
                  {currentUser ? `${currentUser.displayName} (${currentUser.email})` : 'Modo Invitado (progreso guardado localmente)'}
                </span>
              </div>
              {!currentUser && onOpenAuth && (
                <button
                  onClick={onOpenAuth}
                  className="text-[#407B5D] hover:underline font-semibold cursor-pointer"
                >
                  Conectar cuenta CENTRO
                </button>
              )}
            </div>
          </div>

          {/* RIGHT: Live Interactive Generative Canvas */}
          <div className="lg:col-span-6">
            <div className="rounded-2xl overflow-hidden border border-[#E1E7E1] shadow-xs bg-white">
              <GenerativeHeroCanvas />
            </div>
          </div>
        </div>
      </section>

      {/* 2. Interactive Experimentation Modules (Laboratorio de Objetos & Taller) */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-[#E1E7E1] pb-2">
          <div className="flex items-center gap-2 text-sm font-bold text-[#232A24]">
            <span className="w-2 h-2 rounded-full bg-[#407B5D]" />
            <span>Módulos de Práctica y Laboratorios Interactivos</span>
          </div>

          {completedStagesCount > 0 && onResetProgress && (
            <button
              onClick={onResetProgress}
              className="text-xs text-[#59645C] hover:text-[#232A24] flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reiniciar avance</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Card A: Laboratorio de Objetos (Pelota & Burbuja) */}
          <div className="bg-[#FFFFFF] border border-[#E1E7E1] hover:border-[#407B5D]/60 transition-all rounded-2xl p-6 sm:p-7 flex flex-col justify-between space-y-6 shadow-xs hover:shadow-md">
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-[#59645C]">
                <span className="bg-[#E8EEE8] text-[#407B5D] font-bold px-2.5 py-0.5 rounded-full">
                  LABORATORIO INTERACTIVO
                </span>
                <span className="font-medium">Módulo 1 & 2 · Processing Java</span>
              </div>

              <h2 className="text-2xl font-bold text-[#232A24] tracking-tight">
                Laboratorio de Objetos: Pelota, Burbuja y Arreglos
              </h2>

              <p className="text-sm text-[#59645C] leading-relaxed">
                Aprende Programación Orientada a Objetos en Processing Java mediante la construcción progresiva: campos espaciales, constructor con argumentos, 7 métodos de estado, movimiento fluido bidimensional con ruido Perlin (<code className="font-mono text-xs bg-[#E8EEE8] text-[#407B5D] px-1 py-0.5 rounded">noise()</code>) y control sobre arreglos colectivos.
              </p>

              {/* Generative illustration thumbnail */}
              <div className="border border-[#E1E7E1] p-3 bg-[#F7F8F4] rounded-xl flex items-center justify-center">
                <GenerativeArtwork
                  topicNumber={6}
                  width={340}
                  height={110}
                  interactive={true}
                  caption="Representación generativa de dos instancias autónomas con vectores de velocidad"
                />
              </div>

              <div className="grid grid-cols-3 gap-2.5 pt-1 text-xs text-[#232A24]">
                <div className="p-2.5 bg-[#F7F8F4] border border-[#E1E7E1] rounded-xl text-center">
                  <span className="text-[10px] text-[#59645C] block font-semibold">MÓDULO 1</span>
                  <span className="font-bold">Pelota</span>
                </div>
                <div className="p-2.5 bg-[#F7F8F4] border border-[#E1E7E1] rounded-xl text-center">
                  <span className="text-[10px] text-[#59645C] block font-semibold">MÓDULO 2</span>
                  <span className="font-bold">Burbuja</span>
                </div>
                <div className="p-2.5 bg-[#F7F8F4] border border-[#E1E7E1] rounded-xl text-center">
                  <span className="text-[10px] text-[#59645C] block font-semibold">COLECCIÓN</span>
                  <span className="font-bold">Arreglos[]</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#E1E7E1] flex items-center justify-between">
              <span className="text-xs font-medium text-[#59645C]">
                Lienzo a 60 FPS con telemetría
              </span>
              <button
                onClick={handleOpenOop}
                className="min-h-[40px] px-5 py-2 bg-[#407B5D] hover:bg-[#33654C] text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all shadow-xs active:scale-98 cursor-pointer"
              >
                <span>Entrar al Laboratorio</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Card B: Taller Guiado de Estructura de Clases */}
          <div className="bg-[#FFFFFF] border border-[#E1E7E1] hover:border-[#407B5D]/60 transition-all rounded-2xl p-6 sm:p-7 flex flex-col justify-between space-y-6 shadow-xs hover:shadow-md">
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-[#59645C]">
                <span className="bg-[#FFF4DC] text-[#9A6700] font-bold px-2.5 py-0.5 rounded-full">
                  TALLER CONCEPTUAL
                </span>
                <span className="font-medium">Tema 06 · Anatomía POO</span>
              </div>

              <h2 className="text-2xl font-bold text-[#232A24] tracking-tight">
                Anatomía y Estructura de una Clase en Processing
              </h2>

              <p className="text-sm text-[#59645C] leading-relaxed">
                Recorrido didáctico en 4 etapas para comprender las partes anatómicas de una clase: declaración del molde, asignación de campos en memoria, inicialización del constructor y firma de métodos.
              </p>

              {/* 4 Steps Checklist */}
              <div className="grid grid-cols-2 gap-2.5 pt-2">
                {[
                  { step: '01', title: 'Estructura', done: activeProgress.stageCompleted[1] },
                  { step: '02', title: 'Ubicar partes', done: activeProgress.stageCompleted[2] },
                  { step: '03', title: 'Sintaxis', done: activeProgress.stageCompleted[3] },
                  { step: '04', title: 'Construir', done: activeProgress.stageCompleted[4] },
                ].map((s) => (
                  <div
                    key={s.step}
                    className={`p-3 border rounded-xl text-xs flex items-center justify-between transition-colors ${
                      s.done
                        ? 'border-[#407B5D] bg-[#E8EEE8] text-[#407B5D] font-bold'
                        : 'border-[#E1E7E1] bg-[#FFFFFF] text-[#59645C]'
                    }`}
                  >
                    <span>{s.step}. {s.title}</span>
                    {s.done && <Check className="w-4 h-4 text-[#407B5D]" strokeWidth={2.5} />}
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-[#E1E7E1] flex items-center justify-between">
              <span className="text-xs font-medium text-[#59645C]">
                {completedStagesCount === 4 ? 'Taller completado al 100%' : `${workshopPercentage}% completado`}
              </span>
              <button
                onClick={() => onOpenWorkshop()}
                className="min-h-[40px] px-5 py-2 border border-[#E1E7E1] bg-white hover:bg-[#E8EEE8]/40 text-[#232A24] text-xs font-bold rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-2xs"
              >
                <span>{completedStagesCount > 0 ? 'Continuar Taller' : 'Iniciar Taller'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Systematic Variation Series */}
      <section className="space-y-4">
        <VariationSeries
          title="Serie de Variaciones Generativas: Familia de Repetición y Módulos"
          systemDescription="Un mismo algoritmo ejecutado bajo 4 configuraciones paramétricas distintas. Observa cómo el cambio de escala, rotación angular y modulación senoidal genera lenguajes gráficos totalmente diversos a partir de una única regla formal."
          family="repetition"
        />
      </section>

      {/* 4. Complete Curriculum Topics Section with Generative Graphic Identity */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-[#E1E7E1] pb-2">
          <div className="flex items-center gap-2 text-sm font-bold text-[#232A24]">
            <span className="w-2 h-2 rounded-full bg-[#E6B65A]" />
            <span>Temario Curricular Completo</span>
          </div>
          <span className="text-xs text-[#59645C] font-medium">7 temas con modelos visuales</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allCurriculumTopics.map((topic) => {
            const isClasses = topic.id === 'classes';

            return (
              <div
                key={topic.id}
                className="bg-[#FFFFFF] border border-[#E1E7E1] hover:border-[#407B5D]/60 transition-all rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-xs hover:shadow-md"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-[#59645C]">
                    <span className="font-bold text-[#407B5D] bg-[#E8EEE8] px-2 py-0.5 rounded-md">
                      TEMA 0{topic.number}
                    </span>
                    <span className="font-medium">{topic.estimatedTime}</span>
                  </div>

                  {/* Generative Diagram Thumbnail connected to topic concept */}
                  <div className="border border-[#E1E7E1] bg-[#F7F8F4] rounded-xl flex items-center justify-center p-1.5">
                    <GenerativeArtwork
                      topicNumber={topic.number}
                      width={280}
                      height={125}
                      interactive={true}
                    />
                  </div>

                  <h3 className="text-base font-bold text-[#232A24] line-clamp-1">
                    {topic.title}
                  </h3>

                  <p className="text-xs text-[#59645C] line-clamp-2 leading-relaxed">
                    {topic.summary}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#E1E7E1] flex items-center justify-between">
                  <span className="text-xs text-[#59645C] font-medium">
                    {topic.category}
                  </span>

                  {isClasses ? (
                    <button
                      onClick={() => onOpenWorkshop()}
                      className="min-h-[36px] px-3.5 py-1.5 bg-[#407B5D] hover:bg-[#33654C] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                    >
                      <span>Taller POO</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : topic.id === 'object-arrays' ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleOpenOop}
                        className="min-h-[36px] px-3 py-1.5 bg-[#407B5D] hover:bg-[#33654C] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-[#E6B65A]" />
                        <span>Laboratorio</span>
                      </button>
                      <button
                        onClick={() => onSelectTopic('object-arrays')}
                        className="min-h-[36px] px-2.5 py-1.5 border border-[#E1E7E1] hover:bg-[#E8EEE8]/40 text-[#232A24] text-xs font-semibold rounded-xl transition-all cursor-pointer"
                      >
                        Teoría
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => onSelectTopic(topic.id)}
                      className="min-h-[36px] px-3.5 py-1.5 border border-[#E1E7E1] hover:border-[#407B5D] hover:bg-[#E8EEE8]/30 text-[#232A24] text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <span>Ver tema</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#59645C]" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. Friendly Creative Coding Philosophy Note */}
      <section className="p-6 bg-[#FFFFFF] border border-[#E1E7E1] rounded-2xl space-y-2.5 shadow-xs">
        <div className="flex items-center gap-2 text-sm font-bold text-[#232A24]">
          <Heart className="w-4 h-4 text-[#407B5D]" />
          <span>Filosofía de Código Creativo · Generative Design</span>
        </div>
        <p className="text-xs sm:text-sm text-[#59645C] leading-relaxed max-w-3xl">
          {siteContent?.footerText ||
            'Inspirado en los principios de Generative Design, este laboratorio aborda la programación como un medio artístico y constructivo. La riqueza visual no surge del adorno superficial, sino de la combinación disciplinada de reglas matemáticas sencillas: iteración, modulación senoidal, ruido Perlin y la arquitectura orientada a objetos de Processing.'}
        </p>
      </section>
    </div>
  );
};
