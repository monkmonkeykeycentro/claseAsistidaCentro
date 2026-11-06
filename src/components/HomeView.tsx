import React, { useState } from 'react';
import { TOPICS_DATA } from '../data/topicsData';
import { areUnitPrerequisitesComplete, getLessonProgressPercentage, getLessonStatus, getUnitEvaluationSummary, LearningLesson, LessonStatus, normalizeTopic, UnitEvaluationSummary } from '../types/learning';
import { CURRICULUM_UNITS } from '../data/unitsData';
import { UserProgress, StageId } from '../types/classStructure';
import { AppUser } from '../services/firebase';
import { GenerativeArtwork } from './generative/GenerativeArtwork';
import { P5LiveThumbnail } from './generative/P5LiveThumbnail';
import { VariationSeries } from './generative/VariationSeries';
import { VideoAsciiSplitCanvas } from './generative/VideoAsciiSplitCanvas';
import { CmsCategory, CmsHomeBlock, CmsHomeConfig, CmsModule, CmsSiteContentCombined, DEFAULT_HOME_CONFIG } from '../types/cms';
import {
  ArrowRight,
  BookOpen,
  User,
  Check,
  RotateCcw,
  Sparkles,
  Layers,
  Code2,
  Sliders,
  PenTool,
  Compass,
  Film,
  Maximize2,
  Minimize2,
  Grid,
  CheckCircle,
} from 'lucide-react';

interface HomeViewProps {
  onOpenWorkshop: (stage?: StageId) => void;
  onOpenOopLab?: () => void;
  onNavigateOopLab?: () => void;
  onOpenPilot?: () => void;
  onOpenUnits?: (unitId?: 'u1' | 'u2' | 'u3', exerciseId?: string) => void;
  onOpenClassDesigner?: () => void;
  onNavigateHorse?: () => void;
  onSelectTopic: (topicId: string) => void;
  progress?: UserProgress;
  classesProgress?: UserProgress;
  currentUser: AppUser | null;
  onOpenAuth?: () => void;
  onResetProgress?: () => void;
  siteContent?: CmsSiteContentCombined | null;
  homeConfig?: CmsHomeConfig;
  homeModules?: CmsModule[];
  homeCategories?: CmsCategory[];
  onNavigateAdmin?: () => void;
  topics?: LearningLesson[];
  currentTopicId?: string;
  resumeTopicId?: string;
}

type TabFilter = 'all' | 'horse' | 'units' | 'pilot' | 'topics' | 'tools';

const LESSON_STATUS_LABELS: Record<LessonStatus, string> = {
  'not-started': 'No iniciada',
  'in-progress': 'En progreso',
  completed: 'Completada',
  blocked: 'Bloqueada',
};

const LESSON_STATUS_STYLES: Record<LessonStatus, string> = {
  'not-started': 'bg-[#F7F8F4] text-[#59645C]',
  'in-progress': 'bg-[#FFF5D9] text-[#8A6318]',
  completed: 'bg-[#E8EEE8] text-[#407B5D]',
  blocked: 'bg-[#FBE9E7] text-[#A4473D]',
};

const UnitProgressSummary: React.FC<{ summary: UnitEvaluationSummary; blocked?: boolean }> = ({ summary, blocked }) => (
  <div className="space-y-1.5 pt-2 border-t border-[#E1E7E1]">
    <div className="flex items-center justify-between text-[11px]">
      <span className={`font-semibold ${blocked ? 'text-[#A4473D]' : 'text-[#59645C]'}`}>
        {blocked ? 'Bloqueada por prerrequisito' : `${summary.completedActivities}/${summary.totalActivities} actividades aprobadas`}
      </span>
      <span className="font-mono text-[#407B5D]">{summary.percentage}%</span>
    </div>
    <div className="h-1.5 rounded-full bg-[#E8EEE8] overflow-hidden">
      <div className="h-full rounded-full bg-[#407B5D] transition-all" style={{ width: `${summary.percentage}%` }} />
    </div>
  </div>
);

export const HomeView: React.FC<HomeViewProps> = ({
  onOpenWorkshop,
  onOpenOopLab,
  onNavigateOopLab,
  onOpenPilot,
  onOpenUnits,
  onOpenClassDesigner,
  onNavigateHorse,
  onSelectTopic,
  progress,
  classesProgress,
  currentUser,
  onOpenAuth,
  onResetProgress,
  siteContent,
  homeConfig = DEFAULT_HOME_CONFIG,
  homeModules = [],
  homeCategories = [],
  onNavigateAdmin,
  topics,
  currentTopicId,
  resumeTopicId,
}) => {
  const [activeTab, setActiveTab] = useState<TabFilter>('all');
  const [showAsciiCanvas, setShowAsciiCanvas] = useState(true);

  const allCurriculumTopics = topics ?? TOPICS_DATA.map(normalizeTopic);
  const visibleTopics = homeConfig.featuredTopicIds.length
    ? allCurriculumTopics.filter((topic) => homeConfig.featuredTopicIds.some((id) => id === topic.id || id === `les_${topic.id}`))
    : allCurriculumTopics;
  const activeProgress = progress || classesProgress || {
    stageCompleted: { 1: false, 2: false, 3: false, 4: false },
    stage3CompletedExercises: [],
    stage2Placements: {},
    stage4BuilderCustomized: false,
    activityProgress: {},
  };

  const handleOpenOop = onNavigateOopLab || onOpenOopLab || (() => {});
  const completedStagesCount = Object.values(activeProgress.stageCompleted).filter(Boolean).length;
  const workshopPercentage = Math.round((completedStagesCount / 4) * 100);
  const resumeTopic = allCurriculumTopics.find((topic) => topic.id === (resumeTopicId || currentTopicId)) || allCurriculumTopics[0];
  const resumeLabel = resumeTopicId ? 'Continuar lección' : 'Comenzar recorrido';
  const foundationTopics = visibleTopics.filter((topic) => topic.unitId === 'u1');
  const additionalFoundationTopics = foundationTopics.filter(
    (topic) => !['canvas', 'variables'].includes(topic.id),
  );
  const unitEvaluation = Object.fromEntries(
    CURRICULUM_UNITS.map((unit) => [unit.id, getUnitEvaluationSummary(unit, activeProgress.activityProgress)]),
  ) as Record<'u1' | 'u2' | 'u3', ReturnType<typeof getUnitEvaluationSummary>>;
  const completedUnitIds = CURRICULUM_UNITS
    .filter((unit) => unitEvaluation[unit.id].isComplete)
    .map((unit) => unit.id);
  const unitAccess = Object.fromEntries(
    CURRICULUM_UNITS.map((unit) => [
      unit.id,
      areUnitPrerequisitesComplete(unit, completedUnitIds),
    ]),
  ) as Record<'u1' | 'u2' | 'u3', boolean>;

  const renderHomeBlocks = (blocks: CmsHomeBlock[]) => (
    <div className="space-y-4">
      {blocks.filter((block) => block.visible).sort((a, b) => a.position - b.position).map((block) => {
        const columns = block.columns || 2;
        const items = block.type === 'modules'
          ? homeModules.filter((item) => !block.sourceIds?.length || block.sourceIds.includes(item.id))
          : block.type === 'categories'
            ? homeCategories.filter((item) => !block.sourceIds?.length || block.sourceIds.includes(item.id))
            : block.type === 'lessons'
              ? visibleTopics.filter((item) => !block.sourceIds?.length || block.sourceIds.includes(item.id) || block.sourceIds.includes(`les_${item.id}`))
              : [];
        return (
          <div key={block.id} className="space-y-2">
            {block.title && <h3 className="text-sm font-bold text-[#232A24]">{block.title}</h3>}
            {block.text && <p className="text-xs text-[#59645C] leading-relaxed whitespace-pre-line">{block.text}</p>}
            {block.type === 'text' ? null : block.type === 'tools' ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {['Diseñador de Clases', 'Laboratorio POO', 'Exploraciones'].map((tool) => (
                  <div key={tool} className="p-3 bg-white border border-[#E1E7E1] rounded-xl text-xs font-semibold text-[#232A24]">{tool}</div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {items.map((item) => {
                  const title = 'title' in item ? item.title : item.name;
                  const description = 'description' in item ? item.description : 'summary' in item ? item.summary : '';
                  return <div key={item.id} className="p-3 bg-white border border-[#E1E7E1] rounded-xl space-y-1">
                    <p className="text-xs font-bold text-[#232A24]">{title}</p>
                    <p className="text-[11px] text-[#59645C] line-clamp-2">{description}</p>
                  </div>;
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="space-y-10 sm:space-y-14 animate-in fade-in duration-200">
      {/* 1. HERO SECTION: Limpio, ordenado y con jerarquía editorial */}
      {homeConfig.sections.hero && <section className="space-y-6 pt-2">
        {/* Soft Ribbon Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E1E7E1] pb-3 text-xs text-[#59645C]">
          <div className="flex items-center gap-2 font-medium">
            <span className="font-bold text-[#232A24] tracking-wide">Código Creativo</span>
            <span className="text-[#E1E7E1]">/</span>
            <span className="text-[#407B5D] font-semibold bg-[#E8EEE8] px-2.5 py-0.5 rounded-md">
              Processing Java
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-[#407B5D]" />
            <span className="text-[#59645C]">Laboratorio didáctico interactivo</span>
          </div>
        </div>

        {/* Editorial Headline & Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Main Title & Intro (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#407B5D] bg-[#E8EEE8] px-3 py-1 rounded-full">
                <Sparkles className="w-3.5 h-3.5 text-[#E6B65A]" />
                <span>{siteContent?.heroBadge || 'Laboratorio de Código Creativo'}</span>
              </span>

              <h1 className="text-3xl sm:text-4xl lg:text-[40px] font-extrabold tracking-tight text-[#232A24] leading-[1.18]">
                {siteContent?.heroHeadline || 'Aprende a programar creando arte y sistemas visuales.'}
              </h1>

              <p className="text-sm sm:text-base text-[#59645C] leading-relaxed pt-1">
                {siteContent?.heroSubtitle ||
                  'Descubre la programación como una herramienta para dar vida a formas, animaciones y patrones visuales. En cada paso escribes código en Processing Java y ves su resultado interactivo de inmediato.'}
              </p>
            </div>

            {/* Quick Action Navigation Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-2.5">
              {onOpenUnits && (
                <button
                  onClick={() => onOpenUnits('u1')}
                  className="min-h-[42px] px-5 py-2.5 bg-[#407B5D] hover:bg-[#33654C] text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer text-xs"
                >
                  <Layers className="w-4 h-4" />
                  <span>Unidades Curriculares (14 Prácticas)</span>
                </button>
              )}

              {onOpenPilot && (
                <button
                  onClick={onOpenPilot}
                  className="min-h-[42px] px-4 py-2.5 border border-[#407B5D] bg-white hover:bg-[#E8EEE8] text-[#407B5D] font-bold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs text-xs"
                >
                  <Compass className="w-4 h-4" />
                  <span>Módulo Piloto (3 Ejercicios)</span>
                </button>
              )}

              <button
                onClick={() => {
                  setActiveTab('horse');
                  const el = document.getElementById('caballo-galope');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="min-h-[42px] px-4 py-2.5 border border-[#407B5D] bg-[#E8EEE8]/70 hover:bg-[#E8EEE8] text-[#407B5D] font-bold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs text-xs"
              >
                <Film className="w-4 h-4 text-[#407B5D]" />
                <span>Caballo al Galope (1878)</span>
              </button>

              {onOpenClassDesigner && (
                <button
                  onClick={onOpenClassDesigner}
                  className="min-h-[42px] px-4 py-2.5 border border-[#E1E7E1] bg-white hover:bg-[#F7F8F4] text-[#232A24] font-semibold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs text-xs"
                >
                  <PenTool className="w-4 h-4 text-[#407B5D]" />
                  <span>Diseñador de Clases</span>
                </button>
              )}

              <button
                onClick={handleOpenOop}
                className="min-h-[42px] px-4 py-2.5 border border-[#E1E7E1] bg-white hover:bg-[#F7F8F4] text-[#232A24] font-semibold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs text-xs"
              >
                <Sliders className="w-4 h-4 text-[#407B5D]" />
                <span>Laboratorio POO</span>
              </button>
            </div>
          </div>

          {/* Generative Principles & Student Profile (5 cols) */}
          <div className="lg:col-span-5 space-y-3.5">
            <div className="p-4 sm:p-5 bg-white border border-[#E1E7E1] rounded-2xl space-y-2.5 shadow-xs">
              <span className="text-xs font-bold text-[#232A24] block">
                {siteContent?.generativeQuestion || '¿Cómo funciona el pensamiento generativo?'}
              </span>
              <div className="flex items-center gap-1.5 flex-wrap text-xs">
                {(siteContent?.generativePrinciples || [
                  '1. Código',
                  '2. Sistema',
                  '3. Regla',
                  '4. Variación',
                  '5. Forma',
                ]).map((principle, idx, arr) => (
                  <React.Fragment key={idx}>
                    <span className="px-2.5 py-1 bg-[#E8EEE8] text-[#407B5D] font-bold rounded-lg text-[11px]">
                      {principle}
                    </span>
                    {idx < arr.length - 1 && (
                      <span className="text-[#8E8E89] font-semibold text-[11px]">→</span>
                    )}
                  </React.Fragment>
                ))}
              </div>
              <p className="text-[11px] text-[#59645C] leading-relaxed pt-1">
                De instrucciones lógicas elementales a composiciones paramétricas complejas.
              </p>
            </div>

            {/* Session / Account Status */}
            <div className="p-3 bg-white border border-[#E1E7E1] rounded-2xl flex items-center justify-between text-xs text-[#59645C]">
              <div className="flex items-center gap-2 font-medium">
                <User className="w-4 h-4 text-[#407B5D]" />
                <span className="truncate max-w-[210px] sm:max-w-none">
                  {currentUser ? `${currentUser.displayName} (${currentUser.email})` : 'Modo Invitado (progreso en este navegador)'}
                </span>
              </div>
              {!currentUser && onOpenAuth && (
                <button
                  onClick={onOpenAuth}
                  className="text-[#407B5D] hover:underline font-bold cursor-pointer text-xs shrink-0"
                >
                  Conectar
                </button>
              )}
            </div>
          </div>
        </div>
      </section>}

      {/* 2. SECTION NAVIGATOR & FILTER BAR */}
      {homeConfig.sections.resume && <section className="p-5 bg-white border border-[#A4C4B5] rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div className="space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#407B5D]">Tu recorrido</span>
          <h2 className="text-lg font-bold text-[#232A24]">
            {resumeTopic ? resumeTopic.title : 'Explora el laboratorio'}
          </h2>
          <p className="text-xs text-[#59645C]">
            {resumeTopicId ? 'Retoma la última lección que visitaste.' : 'Elige una lección para comenzar a registrar tu avance.'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => resumeTopic && onSelectTopic(resumeTopic.id)}
          disabled={!resumeTopic}
          className="min-h-[42px] px-4 py-2 rounded-xl bg-[#407B5D] text-white text-xs font-bold hover:bg-[#33654C] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {resumeLabel}
        </button>
      </section>}

      <section className="border-b border-[#E1E7E1] pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar py-1 text-xs">
            {[
              { id: 'all', label: 'Todo el Laboratorio' },
              { id: 'horse', label: 'Caballo al Galope (1878)' },
              { id: 'units', label: 'Unidades Curriculares (14)' },
              { id: 'pilot', label: 'Módulo Piloto (3)' },
              { id: 'topics', label: 'Temario 01 al 07' },
              { id: 'tools', label: 'Herramientas de Autoría' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabFilter)}
                className={`min-h-[36px] px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-[#407B5D] text-white shadow-xs font-bold'
                    : 'bg-white hover:bg-[#E8EEE8] border border-[#E1E7E1] text-[#232A24]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="text-xs text-[#59645C] font-mono shrink-0">
            {allCurriculumTopics.length} Temas · 14 Prácticas · 3 Herramientas
          </div>
        </div>
      </section>

      {/* 3. PILAR 1: UNIDADES CURRICULARES (U1, U2, U3) */}
      {homeConfig.sections.units && (activeTab === 'all' || activeTab === 'units') && (
        <section className="space-y-5 animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E1E7E1] pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#407B5D]" />
                <span className="text-xs font-bold uppercase tracking-wider font-mono text-[#407B5D]">
                  Pilar 1 · Ruta Pedagógica
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#232A24] tracking-tight">
                {homeConfig.pillars.units.title}
              </h2>
            </div>
            <p className="text-xs text-[#59645C] max-w-md leading-relaxed">
              {homeConfig.pillars.units.description}
            </p>
          </div>
          {renderHomeBlocks(homeConfig.pillars.units.blocks)}

          <div className={`grid grid-cols-1 md:grid-cols-3 gap-5 ${homeConfig.pillars.units.showDefaultContent ? '' : 'hidden'}`}>
            {/* UNIDAD 1 */}
            <div className="p-5 bg-white border border-[#E1E7E1] hover:border-[#407B5D] rounded-2xl flex flex-col justify-between space-y-4 shadow-xs transition-all group">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="px-2.5 py-0.5 bg-[#E8EEE8] text-[#407B5D] font-bold rounded-lg">
                    UNIDAD 1
                  </span>
                  <span className="text-[#8E8E89]">3 Prácticas</span>
                </div>
                <h3 className="text-base font-bold text-[#232A24] group-hover:text-[#407B5D] transition-colors">
                  Fundamentos de programación y código creativo
                </h3>
                <p className="text-xs text-[#59645C] leading-relaxed">
                  Descubre cómo una imagen se construye siguiendo instrucciones secuenciales precisas y cómo una regla origina múltiples variaciones.
                </p>
                <UnitProgressSummary summary={unitEvaluation.u1} />
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
                  {additionalFoundationTopics.map((topic) => (
                    <li
                      key={topic.id}
                      onClick={() => onSelectTopic(topic.id)}
                      className="hover:text-[#407B5D] cursor-pointer flex items-center gap-1.5 font-medium"
                    >
                      <span className="text-[#407B5D] font-bold">CMS</span>
                      <span className="truncate">{topic.title}</span>
                    </li>
                  ))}
                </ul>
              </div>
              {onOpenUnits && (
                <button
                  onClick={() => onOpenUnits('u1')}
                  className="w-full min-h-[36px] px-3 py-1.5 bg-[#F7F8F4] hover:bg-[#E8EEE8] border border-[#E1E7E1] hover:border-[#407B5D] text-xs font-semibold rounded-xl text-[#232A24] transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>Iniciar Unidad 1</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#407B5D]" />
                </button>
              )}
            </div>

            {/* UNIDAD 2 */}
            <div className="p-5 bg-white border border-[#E1E7E1] hover:border-[#407B5D] rounded-2xl flex flex-col justify-between space-y-4 shadow-xs transition-all group">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="px-2.5 py-0.5 bg-[#E8EEE8] text-[#407B5D] font-bold rounded-lg">
                    UNIDAD 2
                  </span>
                  <span className="text-[#8E8E89]">6 Prácticas</span>
                </div>
                <h3 className="text-base font-bold text-[#232A24] group-hover:text-[#407B5D] transition-colors">
                  Primeros pasos con Processing
                </h3>
                <p className="text-xs text-[#59645C] leading-relaxed">
                  Sistema de coordenadas, funciones con parámetros, primitivas 2D, espacios RGB/HSB y consulta de referencias oficiales.
                </p>
                <UnitProgressSummary summary={unitEvaluation.u2} blocked={!unitAccess.u2} />
                <ul className="text-xs text-[#59645C] space-y-1.5 pt-2 border-t border-[#E1E7E1]">
                  <li
                    onClick={() => unitAccess.u2 && onOpenUnits?.('u2', 'u2-e1')}
                    className="hover:text-[#407B5D] cursor-pointer flex items-center gap-1.5 font-medium"
                  >
                    <span className="text-[#407B5D] font-bold">U2-E1</span>
                    <span>Primer recorrido por Processing</span>
                  </li>
                  <li
                    onClick={() => unitAccess.u2 && onOpenUnits?.('u2', 'u2-e2')}
                    className="hover:text-[#407B5D] cursor-pointer flex items-center gap-1.5 font-medium"
                  >
                    <span className="text-[#407B5D] font-bold">U2-E2</span>
                    <span>Del espacio a la forma</span>
                  </li>
                  <li
                    onClick={() => unitAccess.u2 && onOpenUnits?.('u2', 'u2-e3')}
                    className="hover:text-[#407B5D] cursor-pointer flex items-center gap-1.5 font-medium"
                  >
                    <span className="text-[#407B5D] font-bold">U2-E3</span>
                    <span>Funciones y comentarios</span>
                  </li>
                </ul>
              </div>
              {onOpenUnits && (
                <button
                  onClick={() => unitAccess.u2 && onOpenUnits('u2')}
                  disabled={!unitAccess.u2}
                  className="w-full min-h-[36px] px-3 py-1.5 bg-[#F7F8F4] hover:bg-[#E8EEE8] border border-[#E1E7E1] hover:border-[#407B5D] text-xs font-semibold rounded-xl text-[#232A24] transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <span>{unitAccess.u2 ? 'Iniciar Unidad 2' : 'Completa Unidad 1'}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#407B5D]" />
                </button>
              )}
            </div>

            {/* UNIDAD 3 */}
            <div className="p-5 bg-white border border-[#E1E7E1] hover:border-[#407B5D] rounded-2xl flex flex-col justify-between space-y-4 shadow-xs transition-all group">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="px-2.5 py-0.5 bg-[#E8EEE8] text-[#407B5D] font-bold rounded-lg">
                    UNIDAD 3
                  </span>
                  <span className="text-[#8E8E89]">5 Prácticas</span>
                </div>
                <h3 className="text-base font-bold text-[#232A24] group-hover:text-[#407B5D] transition-colors">
                  Variables, transformaciones y dinamismo
                </h3>
                <p className="text-xs text-[#59645C] leading-relaxed">
                  Variables de usuario, variables del sistema (mouseX, mouseY), interactividad en tiempo real y traslaciones con push/popMatrix.
                </p>
                <UnitProgressSummary summary={unitEvaluation.u3} blocked={!unitAccess.u3} />
                <ul className="text-xs text-[#59645C] space-y-1.5 pt-2 border-t border-[#E1E7E1]">
                  <li
                    onClick={() => unitAccess.u3 && onOpenUnits?.('u3', 'u3-e1')}
                    className="hover:text-[#407B5D] cursor-pointer flex items-center gap-1.5 font-medium"
                  >
                    <span className="text-[#407B5D] font-bold">U3-E1</span>
                    <span>Valores fijos vs valores que cambian</span>
                  </li>
                  <li
                    onClick={() => unitAccess.u3 && onOpenUnits?.('u3', 'u3-e2')}
                    className="hover:text-[#407B5D] cursor-pointer flex items-center gap-1.5 font-medium"
                  >
                    <span className="text-[#407B5D] font-bold">U3-E2</span>
                    <span>Variables del sistema en tiempo real</span>
                  </li>
                  <li
                    onClick={() => unitAccess.u3 && onOpenUnits?.('u3', 'u3-e3')}
                    className="hover:text-[#407B5D] cursor-pointer flex items-center gap-1.5 font-medium"
                  >
                    <span className="text-[#407B5D] font-bold">U3-E3</span>
                    <span>Declaración y asignación en memoria</span>
                  </li>
                </ul>
              </div>
              {onOpenUnits && (
                <button
                  onClick={() => unitAccess.u3 && onOpenUnits('u3')}
                  disabled={!unitAccess.u3}
                  className="w-full min-h-[36px] px-3 py-1.5 bg-[#F7F8F4] hover:bg-[#E8EEE8] border border-[#E1E7E1] hover:border-[#407B5D] text-xs font-semibold rounded-xl text-[#232A24] transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <span>{unitAccess.u3 ? 'Iniciar Unidad 3' : 'Completa Unidad 2'}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#407B5D]" />
                </button>
              )}
            </div>
          </div>
        </section>
      )}

      {/* 4. PILAR 2: MÓDULO PILOTO Y EJEMPLO FUNDAMENTAL DEL CABALLO */}
      {homeConfig.sections.pilot && (activeTab === 'all' || activeTab === 'pilot' || activeTab === 'horse') && (
        <section id="caballo-galope" className="p-6 sm:p-7 bg-white border border-[#E1E7E1] rounded-3xl space-y-6 shadow-xs hover:border-[#407B5D]/60 transition-all animate-in fade-in duration-150 scroll-mt-20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E1E7E1] pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#407B5D]" />
                <span className="text-xs font-bold uppercase tracking-wider font-mono text-[#407B5D]">
                  Pilar 2 · Módulo Piloto &amp; Instalación Audiovisual
                </span>
                <span className="text-[10px] font-bold uppercase font-mono bg-[#E8EEE8] text-[#407B5D] px-2 py-0.5 rounded">
                  Caballo al Galope (1878)
                </span>
              </div>
              <h2 className="text-2xl font-extrabold text-[#232A24] tracking-tight">
                {homeConfig.pillars.pilot.title || siteContent?.pilotModuleTitle || 'Exploraciones con Processing'}
              </h2>
              <p className="text-xs text-[#59645C] max-w-2xl leading-relaxed">
                {homeConfig.pillars.pilot.description || siteContent?.pilotModuleDescription ||
                  'Secuencia pedagógica de tres ejercicios con metodología: Observar → Interpretar → Escribir → Experimentar → Documentar.'}
              </p>
              {renderHomeBlocks(homeConfig.pillars.pilot.blocks)}
            </div>
            {onOpenPilot && (
              <button
                onClick={onOpenPilot}
                className="min-h-[42px] px-5 py-2.5 bg-[#407B5D] hover:bg-[#33654C] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer shrink-0"
              >
                <span>Abrir Módulo Piloto</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* 3 Progressive Exercise Cards */}
          <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 pt-1 ${homeConfig.pillars.pilot.showDefaultContent ? '' : 'hidden'}`}>
            {/* Ejercicio 1 */}
            <div
              onClick={onOpenPilot}
              className="p-4 bg-[#F7F8F4] border border-[#E1E7E1] hover:border-[#407B5D] rounded-2xl flex flex-col justify-between space-y-3 cursor-pointer transition-all group"
            >
              <div className="space-y-2">
                <span className="text-[10px] font-mono font-bold text-[#407B5D] bg-[#E8EEE8] px-2 py-0.5 rounded">
                  EJERCICIO 01 · COORDENADAS
                </span>
                <h3 className="text-sm font-bold text-[#232A24] group-hover:text-[#407B5D] transition-colors">
                  {siteContent?.pilotEx1Title || 'Sistemas de coordenadas: Del espacio a la forma'}
                </h3>
                <p className="text-xs text-[#59645C] leading-relaxed">
                  {siteContent?.pilotEx1Objective ||
                    'Comprender el sistema cartesiano de Processing Java y utilizar coordenadas precisas (X, Y) para posicionar elementos gráficos.'}
                </p>
              </div>
              <span className="text-xs font-bold text-[#407B5D] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                <span>Practicar coordenadas</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>

            {/* Ejercicio 2 */}
            <div
              onClick={onOpenPilot}
              className="p-4 bg-[#F7F8F4] border border-[#E1E7E1] hover:border-[#407B5D] rounded-2xl flex flex-col justify-between space-y-3 cursor-pointer transition-all group"
            >
              <div className="space-y-2">
                <span className="text-[10px] font-mono font-bold text-[#407B5D] bg-[#E8EEE8] px-2 py-0.5 rounded">
                  EJERCICIO 02 · CONDICIONALES
                </span>
                <h3 className="text-sm font-bold text-[#232A24] group-hover:text-[#407B5D] transition-colors">
                  {siteContent?.pilotEx2Title || 'Estructuras condicionales: Decisiones visuales'}
                </h3>
                <p className="text-xs text-[#59645C] leading-relaxed">
                  {siteContent?.pilotEx2Objective ||
                    'Comprender estructuras if, else if y else en Processing Java mediante tres zonas visuales y análisis de valores límite.'}
                </p>
              </div>
              <span className="text-xs font-bold text-[#407B5D] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                <span>Practicar condicionales</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>

            {/* Ejercicio 3 */}
            <div className="p-4 bg-[#F7F8F4] border border-[#E1E7E1] hover:border-[#407B5D] rounded-2xl flex flex-col justify-between space-y-3 transition-all group">
              <div className="space-y-2">
                <span className="text-[10px] font-mono font-bold text-[#407B5D] bg-[#E8EEE8] px-2 py-0.5 rounded">
                  EJERCICIO 03 · AUDIOVISUAL
                </span>
                <h3 className="text-sm font-bold text-[#232A24] group-hover:text-[#407B5D] transition-colors">
                  {siteContent?.pilotEx3Title || 'Discretización audiovisual: Video a ASCII'}
                </h3>
                <p className="text-xs text-[#59645C] leading-relaxed">
                  Cuantización tipográfica en tiempo real. Divide el lienzo con la barra central &lt;&gt; para comparar el fotograma original contra la salida en caracteres.
                </p>
              </div>
              <div className="flex items-center justify-between gap-2 pt-1">
                <a
                  href="#caballo-galope"
                  className="text-xs font-bold text-[#407B5D] hover:underline flex items-center gap-1"
                >
                  <Film className="w-3.5 h-3.5" />
                  <span>Ver instalación abajo</span>
                </a>
                {onOpenPilot && (
                  <button
                    onClick={onOpenPilot}
                    className="text-xs text-[#59645C] hover:text-[#232A24] cursor-pointer flex items-center gap-1"
                  >
                    <span>Ver en módulo</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Destacado: Instalación Audiovisual del Caballo de Muybridge (Siempre Visible) */}
          <div className={`pt-4 border-t border-[#E1E7E1] space-y-3 ${homeConfig.pillars.pilot.showDefaultContent ? '' : 'hidden'}`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Film className="w-4 h-4 text-[#407B5D]" />
                <span className="text-xs sm:text-sm font-bold text-[#232A24]">
                  Ejemplo Fundamental: Discretización de Video — Caballo al Galope (Muybridge 1878)
                </span>
              </div>
              <span className="text-[11px] text-[#59645C] font-mono">
                Lienzo interactivo en vivo · Arrastra &lt;&gt; para comparar
              </span>
            </div>
            <VideoAsciiSplitCanvas defaultVideoSrc="/video.mp4" />
          </div>
        </section>
      )}

      {/* 5. PILAR 3: TEMARIO CURRICULAR COMPLETO (01 AL 07) */}
      {homeConfig.sections.topics && (activeTab === 'all' || activeTab === 'topics') && (
        <section className="space-y-6 animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E1E7E1] pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#E6B65A]" />
                <span className="text-xs font-bold uppercase tracking-wider font-mono text-[#8A6318]">
                  Pilar 3 · Catálogo Temático
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#232A24] tracking-tight">
                {homeConfig.pillars.topics.title}
              </h2>
            </div>
            <span className="text-xs text-[#59645C] font-mono">
              {visibleTopics.length} Temas con modelos visuales interactivos
            </span>
          </div>
          {renderHomeBlocks(homeConfig.pillars.topics.blocks)}
          <p className="text-xs text-[#59645C] max-w-2xl leading-relaxed">
            {homeConfig.pillars.topics.description}
          </p>
          {allCurriculumTopics.length === 0 ? (
            <div className="bg-white border border-dashed border-[#E1E7E1] rounded-2xl p-8 text-center space-y-2">
              <p className="text-sm font-semibold text-[#232A24]">No hay temas disponibles en este momento.</p>
              <p className="text-xs text-[#59645C]">Puedes explorar las Unidades Curriculares o los Ejercicios Piloto desde las pestañas superiores.</p>
            </div>
          ) : (
            <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${homeConfig.pillars.topics.showDefaultContent ? '' : 'hidden'}`}>
            {visibleTopics.map((topic) => {
              const isClasses = topic.id === 'classes';
              const lessonProgress = activeProgress.lessonProgress?.[topic.id];
              const unit = topic.unitId ? CURRICULUM_UNITS.find((candidate) => candidate.id === topic.unitId) : undefined;
              const isBlocked = Boolean(unit && !areUnitPrerequisitesComplete(unit, completedUnitIds));
              const lessonStatus = getLessonStatus(topic, lessonProgress, isBlocked);
              const lessonPercentage = getLessonProgressPercentage(topic, lessonProgress);

              return (
                <div
                  key={topic.id}
                  className="bg-white border border-[#E1E7E1] hover:border-[#407B5D]/60 transition-all rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-xs hover:shadow-md"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs text-[#59645C]">
                      <span className="font-bold text-[#407B5D] bg-[#E8EEE8] px-2 py-0.5 rounded-md">
                        TEMA 0{topic.number}
                      </span>
                      <span className="font-medium">{topic.estimatedTime}</span>
                    </div>

                    {/* Generative Diagram Thumbnail */}
                    <div className="border border-[#E1E7E1] bg-[#F7F8F4] rounded-xl flex items-center justify-center p-1.5 overflow-hidden">
                      <P5LiveThumbnail
                        p5Code={topic.thumbnailP5 || topic.sections[0]?.codeSnippetP5}
                        repositoryUrl={topic.repositoryUrl || topic.sections[0]?.repositoryUrl}
                        repositoryEntry={topic.repositoryUrl ? topic.repositoryEntry : topic.sections[0]?.repositoryEntry}
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

                    {!isClasses && (
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-2 text-[11px]">
                          <span className={`px-2 py-0.5 rounded-md font-semibold ${LESSON_STATUS_STYLES[lessonStatus]}`}>
                            {LESSON_STATUS_LABELS[lessonStatus]}
                          </span>
                          <span className="font-mono text-[#59645C]">{lessonPercentage}%</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-[#E8EEE8] overflow-hidden">
                          <div
                            className="h-full rounded-full bg-[#407B5D] transition-all"
                            style={{ width: `${lessonPercentage}%` }}
                          />
                        </div>
                      </div>
                    )}
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
                        onClick={() => !isBlocked && onSelectTopic(topic.id)}
                        disabled={isBlocked}
                        className="min-h-[36px] px-3.5 py-1.5 border border-[#E1E7E1] hover:border-[#407B5D] hover:bg-[#E8EEE8]/30 text-[#232A24] text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <span>{isBlocked ? 'Completa el requisito' : 'Ver tema'}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-[#59645C]" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          )}
        </section>
      )}

      {/* 6. PILAR 4: HERRAMIENTAS DE AUTORÍA Y CREACIÓN (Consolidada sin duplicados) */}
      {homeConfig.sections.tools && (activeTab === 'all' || activeTab === 'tools') && (
        <section className="space-y-5 animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E1E7E1] pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#407B5D]" />
                <span className="text-xs font-bold uppercase tracking-wider font-mono text-[#407B5D]">
                  Pilar 4 · Creación y Experimentación
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#232A24] tracking-tight">
                {homeConfig.pillars.tools.title}
              </h2>
            </div>
            <p className="text-xs text-[#59645C] max-w-md leading-relaxed">
              {homeConfig.pillars.tools.description}
            </p>
          </div>
          {renderHomeBlocks(homeConfig.pillars.tools.blocks)}

          <div className={`grid grid-cols-1 md:grid-cols-3 gap-5 ${homeConfig.pillars.tools.showDefaultContent ? '' : 'hidden'}`}>
            {/* Card 1: Diseñador de Clases */}
            <div
              onClick={onOpenClassDesigner}
              className="p-5 bg-white border border-[#E1E7E1] hover:border-[#407B5D] rounded-2xl flex flex-col justify-between space-y-4 cursor-pointer transition-all group shadow-xs hover:shadow-md"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="px-2.5 py-1 bg-[#E8EEE8] text-[#407B5D] font-bold rounded-lg font-mono flex items-center gap-1.5 text-[11px]">
                    <PenTool className="w-3.5 h-3.5" />
                    <span>HERRAMIENTA POO</span>
                  </span>
                  <span className="text-[#8E8E89] text-[11px] font-mono">6 Etapas</span>
                </div>

                <h3 className="text-base font-bold text-[#232A24] group-hover:text-[#407B5D] transition-colors">
                  Diseñador de Clases
                </h3>

                <p className="text-xs text-[#59645C] leading-relaxed">
                  Diseña los campos, constructores y métodos de tus objetos y genera su estructura inicial en Processing Java.
                </p>

                <div className="grid grid-cols-3 gap-2 pt-1 text-[11px] text-[#232A24]">
                  <div className="p-2 bg-[#F7F8F4] border border-[#E1E7E1] rounded-xl text-center">
                    <span className="text-[10px] text-[#59645C] block font-semibold">1. DISEÑO</span>
                    <span className="font-bold">Abstracción</span>
                  </div>
                  <div className="p-2 bg-[#F7F8F4] border border-[#E1E7E1] rounded-xl text-center">
                    <span className="text-[10px] text-[#59645C] block font-semibold">2. CAMPOS</span>
                    <span className="font-bold">Memoria</span>
                  </div>
                  <div className="p-2 bg-[#F7F8F4] border border-[#E1E7E1] rounded-xl text-center">
                    <span className="text-[10px] text-[#59645C] block font-semibold">3. PDE TABS</span>
                    <span className="font-bold">Código</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[#E1E7E1] flex items-center justify-between">
                <span className="text-[11px] font-medium text-[#59645C]">
                  Plantilla Resorte incluida
                </span>
                <span className="text-xs font-bold text-[#407B5D] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  <span>Diseñar clase</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>

            {/* Card 2: Laboratorio de Objetos (Pelota & Burbuja) */}
            <div
              onClick={handleOpenOop}
              className="p-5 bg-white border border-[#E1E7E1] hover:border-[#407B5D] rounded-2xl flex flex-col justify-between space-y-4 cursor-pointer transition-all group shadow-xs hover:shadow-md"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="px-2.5 py-1 bg-[#E8EEE8] text-[#407B5D] font-bold rounded-lg font-mono flex items-center gap-1.5 text-[11px]">
                    <Sliders className="w-3.5 h-3.5" />
                    <span>SIMULADOR 60 FPS</span>
                  </span>
                  <span className="text-[#8E8E89] text-[11px] font-mono">2 Entidades</span>
                </div>

                <h3 className="text-base font-bold text-[#232A24] group-hover:text-[#407B5D] transition-colors">
                  {siteContent?.oopLabTitle || 'Laboratorio de Objetos: Pelota y Burbuja'}
                </h3>

                <p className="text-xs text-[#59645C] leading-relaxed">
                  {siteContent?.oopLabSummary ||
                    'Experimenta en tiempo real con instancias activas, métodos interactivos de estado y control simultáneo sobre arreglos de objetos.'}
                </p>

                <div className="grid grid-cols-3 gap-2 pt-1 text-[11px] text-[#232A24]">
                  <div className="p-2 bg-[#F7F8F4] border border-[#E1E7E1] rounded-xl text-center">
                    <span className="text-[10px] text-[#59645C] block font-semibold">ESTADO</span>
                    <span className="font-bold">7 Métodos</span>
                  </div>
                  <div className="p-2 bg-[#F7F8F4] border border-[#E1E7E1] rounded-xl text-center">
                    <span className="text-[10px] text-[#59645C] block font-semibold">FÍSICA</span>
                    <span className="font-bold">noise() Perlin</span>
                  </div>
                  <div className="p-2 bg-[#F7F8F4] border border-[#E1E7E1] rounded-xl text-center">
                    <span className="text-[10px] text-[#59645C] block font-semibold">ARREGLOS</span>
                    <span className="font-bold">Colección[]</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[#E1E7E1] flex items-center justify-between">
                <span className="text-[11px] font-medium text-[#59645C]">
                  Telemetría en tiempo real
                </span>
                <span className="text-xs font-bold text-[#407B5D] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  <span>Entrar al laboratorio</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>

            {/* Card 3: Taller Guiado de Estructura de Clases */}
            <div
              onClick={() => onOpenWorkshop()}
              className="p-5 bg-white border border-[#E1E7E1] hover:border-[#407B5D] rounded-2xl flex flex-col justify-between space-y-4 cursor-pointer transition-all group shadow-xs hover:shadow-md"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="px-2.5 py-1 bg-[#FFF4DC] text-[#9A6700] font-bold rounded-lg font-mono text-[11px]">
                    TALLER DIDÁCTICO
                  </span>
                  <span className="text-[#8E8E89] text-[11px] font-mono">
                    {completedStagesCount}/4 Completado
                  </span>
                </div>

                <h3 className="text-base font-bold text-[#232A24] group-hover:text-[#407B5D] transition-colors">
                  {siteContent?.workshopTitle || 'Anatomía de una Clase en Processing'}
                </h3>

                <p className="text-xs text-[#59645C] leading-relaxed">
                  {siteContent?.workshopSummary ||
                    'Recorrido didáctico en 4 etapas: declaración del molde, asignación de campos en memoria, constructor y firma de métodos.'}
                </p>

                {/* 4 Steps compact indicators */}
                <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                  {[
                    { step: '01', title: 'Estructura', done: activeProgress.stageCompleted[1] },
                    { step: '02', title: 'Partes', done: activeProgress.stageCompleted[2] },
                    { step: '03', title: 'Sintaxis', done: activeProgress.stageCompleted[3] },
                    { step: '04', title: 'Construir', done: activeProgress.stageCompleted[4] },
                  ].map((s) => (
                    <div
                      key={s.step}
                      className={`p-1.5 border rounded-lg text-[10px] flex items-center justify-between ${
                        s.done
                          ? 'border-[#407B5D] bg-[#E8EEE8] text-[#407B5D] font-bold'
                          : 'border-[#E1E7E1] bg-[#F7F8F4] text-[#59645C]'
                      }`}
                    >
                      <span>{s.step}. {s.title}</span>
                      {s.done && <Check className="w-3 h-3 text-[#407B5D]" />}
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-[#E1E7E1] flex items-center justify-between">
                <span className="text-[11px] font-medium text-[#59645C]">
                  {completedStagesCount === 4 ? '100% completado' : `${workshopPercentage}% completado`}
                </span>
                <span className="text-xs font-bold text-[#407B5D] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  <span>{completedStagesCount > 0 ? 'Continuar' : 'Iniciar'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 7. SERIE DE VARIACIONES GENERATIVAS (Demostración de Principios) */}
      {homeConfig.sections.philosophy && (activeTab === 'all' || activeTab === 'topics') && (
        <section className="space-y-4 pt-2">
          {renderHomeBlocks(homeConfig.pillars.philosophy.blocks)}
          {homeConfig.pillars.philosophy.showDefaultContent && <VariationSeries
            title={homeConfig.pillars.philosophy.title}
            systemDescription={homeConfig.pillars.philosophy.description}
            family="repetition"
          />}
        </section>
      )}
    </div>
  );
};
