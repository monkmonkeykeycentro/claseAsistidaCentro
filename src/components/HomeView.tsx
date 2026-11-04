import React from 'react';
import { TOPICS_DATA, TopicItem } from '../data/topicsData';
import { UserProgress, StageId } from '../types/classStructure';
import { AppUser } from '../services/firebase';
import { GenerativeHeroCanvas } from './generative/GenerativeHeroCanvas';
import { GenerativeArtwork } from './generative/GenerativeArtwork';
import { P5LiveThumbnail } from './generative/P5LiveThumbnail';
import { VariationSeries } from './generative/VariationSeries';
import { VideoAsciiSplitCanvas } from './generative/VideoAsciiSplitCanvas';
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
  Code2,
  Sliders,
  Compass,
  PenTool,
  Wrench,
} from 'lucide-react';

interface HomeViewProps {
  onOpenWorkshop: (stage?: StageId) => void;
  onOpenOopLab?: () => void;
  onNavigateOopLab?: () => void;
  onOpenPilot?: () => void;
  onOpenUnits?: (unitId?: 'u1' | 'u2' | 'u3', exerciseId?: string) => void;
  onOpenClassDesigner?: () => void;
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
  onOpenPilot,
  onOpenUnits,
  onOpenClassDesigner,
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
  const allCurriculumTopics = topics ?? TOPICS_DATA;
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
            <span className="font-bold text-[#232A24] tracking-wide">Código Creativo</span>
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

        {/* Editorial Intro & CTAs */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT: Friendly Editorial Area */}
          <div className="lg:col-span-7 space-y-5">
            <div className="space-y-2.5">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#407B5D] bg-[#E8EEE8] px-2.5 py-1 rounded-full">
                <Sparkles className="w-3.5 h-3.5 text-[#E6B65A]" />
                <span>{siteContent?.heroBadge || 'Laboratorio de Código Creativo'}</span>
              </span>

              <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold tracking-tight text-[#232A24] leading-[1.15]">
                {siteContent?.heroHeadline || 'Aprende a programar creando arte y sistemas visuales.'}
              </h1>

              <p className="text-base sm:text-lg text-[#59645C] leading-relaxed pt-1">
                {siteContent?.heroSubtitle ||
                  'Descubre la programación como una herramienta para dar vida a formas, animaciones y patrones visuales. En cada paso escribes código en Processing Java y ves su resultado interactivo de inmediato.'}
              </p>
            </div>

            {/* CTAs */}
            <div className="pt-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-wrap">
              {onOpenUnits && (
                <button
                  onClick={() => onOpenUnits('u1')}
                  className="min-h-[44px] px-6 py-2.5 bg-[#407B5D] hover:bg-[#33654C] text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-xs active:scale-98 cursor-pointer"
                >
                  <Layers className="w-4 h-4" />
                  <span>Unidades 1, 2 y 3 (14 Prácticas)</span>
                </button>
              )}

              <button
                onClick={handleOpenOop}
                className="min-h-[44px] px-5 py-2.5 border border-[#407B5D] text-[#407B5D] hover:bg-[#E8EEE8] font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-2xs active:scale-98 cursor-pointer bg-white"
              >
                <span>Laboratorio POO</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {onOpenClassDesigner && (
                <button
                  onClick={onOpenClassDesigner}
                  className="min-h-[44px] px-4 py-2.5 border border-[#407B5D] bg-[#E8EEE8] hover:bg-[#d8e4d8] text-[#407B5D] font-bold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs text-xs"
                >
                  <PenTool className="w-4 h-4 text-[#407B5D]" />
                  <span>Diseñador de Clases</span>
                </button>
              )}

              <button
                onClick={() => onOpenWorkshop()}
                className="min-h-[44px] px-4 py-2.5 border border-[#E1E7E1] bg-white hover:bg-[#E8EEE8]/40 text-[#232A24] font-medium rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs text-xs"
              >
                <span>Taller de Clases</span>
              </button>
            </div>
          </div>

          {/* RIGHT: Generative Principle Chain */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-5 bg-[#FFFFFF] border border-[#E1E7E1] rounded-2xl space-y-3 shadow-xs">
              <span className="text-xs font-bold text-[#232A24] block">
                {siteContent?.generativeQuestion || '¿Cómo funciona el pensamiento generativo?'}
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
              <p className="text-[11px] text-[#59645C] leading-relaxed pt-1">
                Desde instrucciones aritméticas hasta la descomposición de señales de video en caracteres tipográficos ordenados por luminancia.
              </p>
            </div>

            {/* Student session bar */}
            <div className="p-3 bg-white border border-[#E1E7E1] rounded-2xl flex items-center justify-between text-xs text-[#59645C]">
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
                  Conectar cuenta
                </button>
              )}
            </div>
          </div>
        </div>

        {/* PRIMARY HERO ELEMENT: Video ASCII Split-Screen Installation */}
        <div className="space-y-3 pt-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E1E7E1] pb-2.5">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#407B5D]" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#407B5D]">
                  Elemento Principal de Experimentación
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#232A24] tracking-tight">
                Discretización de Video a Caracteres ASCII con División Interactiva
              </h2>
            </div>
            <p className="text-xs text-[#59645C] max-w-md leading-relaxed">
              Arrastra la línea divisoria central <code className="bg-[#E8EEE8] px-1.5 py-0.5 rounded text-[#232A24] font-bold">&lt;&gt;</code> para comparar en tiempo real el fotograma original contra la cuantización tipográfica en Processing Java.
            </p>
          </div>

          <VideoAsciiSplitCanvas defaultVideoSrc="/video.mp4" />
        </div>
      </section>

      {/* PILOT MODULE: Exploraciones con Processing (3 Ejercicios Progresivos) */}
      <section className="p-6 sm:p-7 bg-white border border-[#E1E7E1] rounded-3xl space-y-5 shadow-xs hover:border-[#407B5D]/60 transition-all">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E1E7E1] pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#407B5D]" />
              <span className="text-xs font-bold uppercase tracking-wider font-mono text-[#407B5D]">
                Módulo Piloto Educativo
              </span>
            </div>
            <h2 className="text-2xl font-extrabold text-[#232A24] tracking-tight">
              {siteContent?.pilotModuleTitle || 'Exploraciones con Processing'}
            </h2>
          </div>
          {onOpenPilot && (
            <button
              onClick={onOpenPilot}
              className="min-h-[42px] px-6 py-2.5 bg-[#407B5D] hover:bg-[#33654C] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer shrink-0"
            >
              <span>Iniciar Exploraciones (3 Ejercicios)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>

        <p className="text-sm text-[#59645C] leading-relaxed max-w-3xl">
          {siteContent?.pilotModuleDescription ||
            'Secuencia progresiva con metodología Observar → Interpretar → Escribir → Experimentar → Documentar. Recorre desde el plano cartesiano hasta decisiones condicionales y experimentación audiovisual continua.'}
        </p>

        {/* The 3 Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          <div
            onClick={onOpenPilot}
            className="p-4 bg-[#F7F8F4] border border-[#E1E7E1] hover:border-[#407B5D] rounded-2xl space-y-2 cursor-pointer transition-all"
          >
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="font-bold text-[#407B5D]">01. COORDENADAS</span>
              <span className="text-[#8E8E89]">5 Etapas</span>
            </div>
            <h3 className="text-sm font-bold text-[#232A24]">
              {siteContent?.pilotEx1Title || 'Del espacio a la forma'}
            </h3>
            <p className="text-xs text-[#59645C] line-clamp-2">
              {siteContent?.pilotEx1Objective ||
                'Retícula cartesiana, origen (0,0), visualización de ejes e instrucciones Processing Java.'}
            </p>
          </div>

          <div
            onClick={onOpenPilot}
            className="p-4 bg-[#F7F8F4] border border-[#E1E7E1] hover:border-[#407B5D] rounded-2xl space-y-2 cursor-pointer transition-all"
          >
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="font-bold text-[#2868D9]">02. CONDICIONALES</span>
              <span className="text-[#8E8E89]">5 Etapas</span>
            </div>
            <h3 className="text-sm font-bold text-[#232A24]">
              {siteContent?.pilotEx2Title || 'Decisiones visuales'}
            </h3>
            <p className="text-xs text-[#59645C] line-clamp-2">
              {siteContent?.pilotEx2Objective ||
                'Bifurcaciones con if, else if y else en tres zonas horizontales con pruebas en valores límite.'}
            </p>
          </div>

          <div
            onClick={onOpenPilot}
            className="p-4 bg-[#F7F8F4] border border-[#E1E7E1] hover:border-[#407B5D] rounded-2xl space-y-2 cursor-pointer transition-all"
          >
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="font-bold text-[#D9AA3D]">03. AUDIOVISUAL</span>
              <span className="text-[#8E8E89]">Instalación</span>
            </div>
            <h3 className="text-sm font-bold text-[#232A24]">
              {siteContent?.pilotEx3Title || 'Discretización Video a ASCII'}
            </h3>
            <p className="text-xs text-[#59645C] line-clamp-2">
              Video: Sallie Gardner at a Gallop (Eadweard Muybridge). División interactiva en vivo.
            </p>
          </div>
        </div>
      </section>

      {/* PLAN CURRICULAR: Unidades 1, 2 y 3 (14 Actividades Interactivas) */}
      <section className="p-6 sm:p-7 bg-[#FFFFFF] border border-[#E1E7E1] rounded-3xl space-y-6 shadow-xs hover:border-[#407B5D]/60 transition-all">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E1E7E1] pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#407B5D]" />
              <span className="text-xs font-bold uppercase tracking-wider font-mono text-[#407B5D]">
                Plan Curricular de Processing Java
              </span>
            </div>
            <h2 className="text-2xl font-extrabold text-[#232A24] tracking-tight">
              Unidades 1, 2 y 3 · 14 Prácticas Interactivas
            </h2>
          </div>
          {onOpenUnits && (
            <button
              onClick={() => onOpenUnits('u1')}
              className="min-h-[42px] px-6 py-2.5 bg-[#407B5D] hover:bg-[#33654C] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer shrink-0"
            >
              <Layers className="w-4 h-4" />
              <span>Explorar las 3 Unidades</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>

        <p className="text-sm text-[#59645C] leading-relaxed max-w-3xl">
          Estructura curricular completa orientada a construir pensamiento computacional y código creativo mediante Processing Java. Cada actividad integra: Inicio visual interactivo, Manipulación de parámetros en vivo, Pregunta de interpretación con retroalimentación razonada y Registro de evidencia pedagógica.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-1">
          {/* UNIDAD 1 */}
          <div className="p-5 bg-[#F7F8F4] border border-[#E1E7E1] rounded-2xl flex flex-col justify-between space-y-4 hover:border-[#407B5D] transition-all">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="px-2.5 py-1 bg-[#E8EEE8] text-[#407B5D] font-bold rounded-lg">
                  UNIDAD 1
                </span>
                <span className="text-[#8E8E89]">3 Prácticas</span>
              </div>
              <h3 className="text-base font-bold text-[#232A24]">
                Fundamentos de programación y código creativo
              </h3>
              <p className="text-xs text-[#59645C] leading-relaxed">
                Descubre cómo una imagen se construye siguiendo instrucciones secuenciales precisas y cómo una regla origina múltiples variaciones.
              </p>
              <ul className="text-xs text-[#59645C] space-y-1.5 pt-2 border-t border-[#E1E7E1]">
                <li
                  onClick={() => onOpenUnits?.('u1', 'u1-e1')}
                  className="hover:text-[#407B5D] cursor-pointer flex items-center gap-1.5 font-medium"
                >
                  <span className="text-[#407B5D] font-bold">U1-E1</span>
                  <span>Secuencia de instrucciones</span>
                </li>
                <li
                  onClick={() => onOpenUnits?.('u1', 'u1-e2')}
                  className="hover:text-[#407B5D] cursor-pointer flex items-center gap-1.5 font-medium"
                >
                  <span className="text-[#407B5D] font-bold">U1-E2</span>
                  <span>Una regla, múltiples variaciones</span>
                </li>
                <li
                  onClick={() => onOpenUnits?.('u1', 'u1-e3')}
                  className="hover:text-[#407B5D] cursor-pointer flex items-center gap-1.5 font-medium"
                >
                  <span className="text-[#407B5D] font-bold">U1-E3</span>
                  <span>Del boceto a un procedimiento</span>
                </li>
              </ul>
            </div>
            {onOpenUnits && (
              <button
                onClick={() => onOpenUnits('u1')}
                className="w-full min-h-[36px] px-3 py-1.5 bg-white border border-[#E1E7E1] hover:border-[#407B5D] hover:text-[#407B5D] text-xs font-semibold rounded-xl text-[#232A24] transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Comenzar Unidad 1</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* UNIDAD 2 */}
          <div className="p-5 bg-[#F7F8F4] border border-[#E1E7E1] rounded-2xl flex flex-col justify-between space-y-4 hover:border-[#407B5D] transition-all">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="px-2.5 py-1 bg-[#E8EEE8] text-[#407B5D] font-bold rounded-lg">
                  UNIDAD 2
                </span>
                <span className="text-[#8E8E89]">6 Prácticas</span>
              </div>
              <h3 className="text-base font-bold text-[#232A24]">
                Primeros pasos con Processing
              </h3>
              <p className="text-xs text-[#59645C] leading-relaxed">
                Aprende la interfaz, sistema de coordenadas, funciones con parámetros, primitivas 2D, espacios RGB/HSB y cómo consultar referencias oficiales.
              </p>
              <ul className="text-xs text-[#59645C] space-y-1.5 pt-2 border-t border-[#E1E7E1]">
                <li
                  onClick={() => onOpenUnits?.('u2', 'u2-e1')}
                  className="hover:text-[#407B5D] cursor-pointer flex items-center gap-1.5 font-medium"
                >
                  <span className="text-[#407B5D] font-bold">U2-E1</span>
                  <span>Primer recorrido por Processing</span>
                </li>
                <li
                  onClick={() => onOpenUnits?.('u2', 'u2-e2')}
                  className="hover:text-[#407B5D] cursor-pointer flex items-center gap-1.5 font-medium"
                >
                  <span className="text-[#407B5D] font-bold">U2-E2</span>
                  <span>Del espacio a la forma: coordenadas</span>
                </li>
                <li
                  onClick={() => onOpenUnits?.('u2', 'u2-e3')}
                  className="hover:text-[#407B5D] cursor-pointer flex items-center gap-1.5 font-medium"
                >
                  <span className="text-[#407B5D] font-bold">U2-E3</span>
                  <span>Leer funciones y comentarios</span>
                </li>
                <li
                  onClick={() => onOpenUnits?.('u2', 'u2-e4')}
                  className="hover:text-[#407B5D] cursor-pointer flex items-center gap-1.5 font-medium"
                >
                  <span className="text-[#407B5D] font-bold">U2-E4</span>
                  <span>Composición con primitivas 2D</span>
                </li>
                <li
                  onClick={() => onOpenUnits?.('u2', 'u2-e5')}
                  className="hover:text-[#407B5D] cursor-pointer flex items-center gap-1.5 font-medium"
                >
                  <span className="text-[#407B5D] font-bold">U2-E5</span>
                  <span>Laboratorio de color: RGB y HSB</span>
                </li>
                <li
                  onClick={() => onOpenUnits?.('u2', 'u2-e6')}
                  className="hover:text-[#407B5D] cursor-pointer flex items-center gap-1.5 font-medium"
                >
                  <span className="text-[#407B5D] font-bold">U2-E6</span>
                  <span>Aprender a consultar una referencia</span>
                </li>
              </ul>
            </div>
            {onOpenUnits && (
              <button
                onClick={() => onOpenUnits('u2')}
                className="w-full min-h-[36px] px-3 py-1.5 bg-white border border-[#E1E7E1] hover:border-[#407B5D] hover:text-[#407B5D] text-xs font-semibold rounded-xl text-[#232A24] transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Comenzar Unidad 2</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* UNIDAD 3 */}
          <div className="p-5 bg-[#F7F8F4] border border-[#E1E7E1] rounded-2xl flex flex-col justify-between space-y-4 hover:border-[#407B5D] transition-all">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="px-2.5 py-1 bg-[#E8EEE8] text-[#407B5D] font-bold rounded-lg">
                  UNIDAD 3
                </span>
                <span className="text-[#8E8E89]">5 Prácticas</span>
              </div>
              <h3 className="text-base font-bold text-[#232A24]">
                Variables y personalización visual
              </h3>
              <p className="text-xs text-[#59645C] leading-relaxed">
                Comprende los parámetros como decisiones modificables y reutilizables: tipos de datos, variables del sistema, operaciones aritméticas e incrementación animada.
              </p>
              <ul className="text-xs text-[#59645C] space-y-1.5 pt-2 border-t border-[#E1E7E1]">
                <li
                  onClick={() => onOpenUnits?.('u3', 'u3-e1')}
                  className="hover:text-[#407B5D] cursor-pointer flex items-center gap-1.5 font-medium"
                >
                  <span className="text-[#407B5D] font-bold">U3-E1</span>
                  <span>Del valor fijo a la variable</span>
                </li>
                <li
                  onClick={() => onOpenUnits?.('u3', 'u3-e2')}
                  className="hover:text-[#407B5D] cursor-pointer flex items-center gap-1.5 font-medium"
                >
                  <span className="text-[#407B5D] font-bold">U3-E2</span>
                  <span>Tipos de datos y width/height</span>
                </li>
                <li
                  onClick={() => onOpenUnits?.('u3', 'u3-e3')}
                  className="hover:text-[#407B5D] cursor-pointer flex items-center gap-1.5 font-medium"
                >
                  <span className="text-[#407B5D] font-bold">U3-E3</span>
                  <span>Sistema con variables propias</span>
                </li>
                <li
                  onClick={() => onOpenUnits?.('u3', 'u3-e4')}
                  className="hover:text-[#407B5D] cursor-pointer flex items-center gap-1.5 font-medium"
                >
                  <span className="text-[#407B5D] font-bold">U3-E4</span>
                  <span>Operaciones y retoque</span>
                </li>
                <li
                  onClick={() => onOpenUnits?.('u3', 'u3-e5')}
                  className="hover:text-[#407B5D] cursor-pointer flex items-center gap-1.5 font-medium"
                >
                  <span className="text-[#407B5D] font-bold">U3-E5</span>
                  <span>Incrementación y animación</span>
                </li>
              </ul>
            </div>
            {onOpenUnits && (
              <button
                onClick={() => onOpenUnits('u3')}
                className="w-full min-h-[36px] px-3 py-1.5 bg-white border border-[#E1E7E1] hover:border-[#407B5D] hover:text-[#407B5D] text-xs font-semibold rounded-xl text-[#232A24] transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Comenzar Unidad 3</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* SECCIÓN: Herramientas de Creación y Producción */}
      <section className="p-6 sm:p-7 bg-[#FFFFFF] border border-[#E1E7E1] rounded-3xl space-y-5 shadow-xs hover:border-[#407B5D]/60 transition-all">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E1E7E1] pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#407B5D]" />
              <span className="text-xs font-bold uppercase tracking-wider font-mono text-[#407B5D]">
                Herramientas
              </span>
            </div>
            <h2 className="text-2xl font-extrabold text-[#232A24] tracking-tight">
              Herramientas de Creación y Producción
            </h2>
          </div>
          {onOpenClassDesigner && (
            <button
              onClick={onOpenClassDesigner}
              className="min-h-[42px] px-6 py-2.5 bg-[#407B5D] hover:bg-[#33654C] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer shrink-0"
            >
              <PenTool className="w-4 h-4" />
              <span>Abrir Diseñador de Clases</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>

        <p className="text-sm text-[#59645C] leading-relaxed max-w-3xl">
          Espacios de autoría autónoma para formular arquitecturas modulares, estructurar modelos orientados a objetos y generar código limpio en Processing Java para tus proyectos creativos.
        </p>

        {/* Tools Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
          {/* Card 1: Diseñador de Clases */}
          <div
            onClick={onOpenClassDesigner}
            className="p-5 bg-[#F7F8F4] border border-[#E1E7E1] hover:border-[#407B5D] rounded-2xl flex flex-col justify-between space-y-4 cursor-pointer transition-all group shadow-2xs hover:shadow-sm"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="px-2.5 py-1 bg-[#E8EEE8] text-[#407B5D] font-bold rounded-lg font-mono flex items-center gap-1.5">
                  <PenTool className="w-3.5 h-3.5" />
                  <span>HERRAMIENTA POO</span>
                </span>
                <span className="text-[#8E8E89] text-[11px] font-mono">6 Etapas</span>
              </div>

              <h3 className="text-lg font-bold text-[#232A24] group-hover:text-[#407B5D] transition-colors">
                Diseñador de Clases
              </h3>

              <p className="text-xs text-[#59645C] leading-relaxed">
                Diseña los campos, constructores y métodos de tus objetos y genera su estructura inicial en Processing Java.
              </p>

              {/* Feature pills */}
              <div className="grid grid-cols-3 gap-2 pt-1 text-[11px] text-[#232A24]">
                <div className="p-2 bg-white border border-[#E1E7E1] rounded-xl text-center">
                  <span className="text-[10px] text-[#59645C] block font-semibold">1. ABSTRACCIÓN</span>
                  <span className="font-bold">4 Preguntas</span>
                </div>
                <div className="p-2 bg-white border border-[#E1E7E1] rounded-xl text-center">
                  <span className="text-[10px] text-[#59645C] block font-semibold">2. MEMORIA</span>
                  <span className="font-bold">Estrategias A/B/C</span>
                </div>
                <div className="p-2 bg-white border border-[#E1E7E1] rounded-xl text-center">
                  <span className="text-[10px] text-[#59645C] block font-semibold">3. PDE TABS</span>
                  <span className="font-bold">Código Real</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#E1E7E1] flex items-center justify-between">
              <span className="text-[11px] font-medium text-[#59645C]">
                Incluye plantilla Resorte (Slinky)
              </span>
              <span className="text-xs font-bold text-[#407B5D] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                <span>Diseñar mi clase</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>

          {/* Card 2: Laboratorio de Objetos Complementario */}
          <div
            onClick={handleOpenOop}
            className="p-5 bg-[#F7F8F4] border border-[#E1E7E1] hover:border-[#407B5D] rounded-2xl flex flex-col justify-between space-y-4 cursor-pointer transition-all group shadow-2xs hover:shadow-sm"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="px-2.5 py-1 bg-[#E8EEE8] text-[#407B5D] font-bold rounded-lg font-mono flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5" />
                  <span>SIMULADOR EN VIVO</span>
                </span>
                <span className="text-[#8E8E89] text-[11px] font-mono">60 FPS</span>
              </div>

              <h3 className="text-lg font-bold text-[#232A24] group-hover:text-[#407B5D] transition-colors">
                Laboratorio POO · Pelota y Burbuja
              </h3>

              <p className="text-xs text-[#59645C] leading-relaxed">
                Experimenta en tiempo real con instancias activas, métodos interactivos de estado y control simultáneo sobre arreglos de objetos.
              </p>

              <div className="grid grid-cols-3 gap-2 pt-1 text-[11px] text-[#232A24]">
                <div className="p-2 bg-white border border-[#E1E7E1] rounded-xl text-center">
                  <span className="text-[10px] text-[#59645C] block font-semibold">ESTADO</span>
                  <span className="font-bold">7 Métodos</span>
                </div>
                <div className="p-2 bg-white border border-[#E1E7E1] rounded-xl text-center">
                  <span className="text-[10px] text-[#59645C] block font-semibold">FÍSICA</span>
                  <span className="font-bold">noise() Perlin</span>
                </div>
                <div className="p-2 bg-white border border-[#E1E7E1] rounded-xl text-center">
                  <span className="text-[10px] text-[#59645C] block font-semibold">COLECCIONES</span>
                  <span className="font-bold">Arreglos[]</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#E1E7E1] flex items-center justify-between">
              <span className="text-[11px] font-medium text-[#59645C]">
                Inspección de telemetría y variables
              </span>
              <span className="text-xs font-bold text-[#407B5D] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                <span>Entrar al laboratorio</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
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
                {siteContent?.oopLabTitle || 'Laboratorio de Objetos: Pelota, Burbuja y Arreglos'}
              </h2>

              <p className="text-sm text-[#59645C] leading-relaxed">
                {siteContent?.oopLabSummary ||
                  'Aprende Programación Orientada a Objetos en Processing Java mediante la construcción progresiva: campos espaciales, constructor con argumentos, 7 métodos de estado, movimiento fluido bidimensional con ruido Perlin (noise()) y control sobre arreglos colectivos.'}
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
                {siteContent?.workshopTitle || 'Anatomía y Estructura de una Clase en Processing'}
              </h2>

              <p className="text-sm text-[#59645C] leading-relaxed">
                {siteContent?.workshopSummary ||
                  'Recorrido didáctico en 4 etapas para comprender las partes anatómicas de una clase: declaración del molde, asignación de campos en memoria, inicialización del constructor y firma de métodos.'}
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
                  <div className="border border-[#E1E7E1] bg-[#F7F8F4] rounded-xl flex items-center justify-center p-1.5 overflow-hidden">
                    <P5LiveThumbnail
                      p5Code={topic.thumbnailP5 || topic.concepts[0]?.codeSnippetP5}
                      fallbackTopicNumber={topic.number}
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
    </div>
  );
};
