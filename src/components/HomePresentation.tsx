import React from 'react';
import { ArrowRight, PenTool } from 'lucide-react';
import type { CmsHomePresentation, CmsHomePresentationItem } from '../types/cms';
import type { LearningLesson } from '../types/learning';
import type { UserProgress } from '../types/classStructure';
import { getLessonProgressPercentage } from '../types/learning';
import { homeLessonId, normalizeHomePresentation } from '../utils/homePresentation';
import { routeHash } from '../app/routeState';
import { P5LiveThumbnail } from './generative/P5LiveThumbnail';

export function HomePresentation({ config, topics, progress, isLoading = false }: {
  config: CmsHomePresentation;
  topics: LearningLesson[];
  progress?: UserProgress;
  isLoading?: boolean;
}) {
  const presentation = normalizeHomePresentation(config);
  if (!presentation.enabled) return null;
  const available = presentation.items.flatMap<{ item: CmsHomePresentationItem; topic?: LearningLesson }>((item) => {
    if (item.type === 'class-designer') return [{ item, topic: undefined }];
    const topic = topics.find((topic) => topic.id === item.id)
      || topics.find((topic) => homeLessonId(topic.id) === homeLessonId(item.id));
    return topic ? [{ item, topic }] : [];
  });

  return (
    <section aria-labelledby="home-presentation-title" className="space-y-6">
      <div className="space-y-2 max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-wider text-[#407B5D]">Para explorar paso a paso</p>
        <h2 id="home-presentation-title" className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#232A24]">{presentation.title}</h2>
        {presentation.description && <p className="text-sm text-[#59645C] leading-relaxed">{presentation.description}</p>}
      </div>
      {isLoading ? <p role="status" className="text-sm text-[#59645C]">Cargando selección…</p> : available.length === 0 ? (
        <p className="text-sm text-[#59645C]">La selección estará disponible cuando se publiquen sus contenidos.</p>
      ) : (
        <ol className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {available.map(({ item, topic }, index) => {
            const designer = item.type === 'class-designer';
            const title = designer ? 'Diseñador POO' : topic!.title;
            const description = designer
              ? 'Organiza una idea en campos, constructores y métodos para diseñar tus propias clases en Processing Java.'
              : topic!.summary;
            const percentage = topic ? getLessonProgressPercentage(topic, progress?.lessonProgress?.[topic.id]) : 0;
            const href = routeHash(designer ? { view: 'class-designer' } : { view: topic!.id === 'classes' ? 'workshop' : 'topic', topicId: topic!.id });
            return (
              <li key={`${item.type}:${item.id}`}>
                <article className="h-full bg-white rounded-2xl border border-[#E1E7E1] p-5 sm:p-6 flex flex-col gap-4 shadow-xs">
                  <div className="flex items-center justify-between gap-3 text-xs">
                    <span className="font-mono font-bold text-[#407B5D]">PASO {String(index + 1).padStart(2, '0')}</span>
                    <span className="text-[#59645C]">{designer ? 'Herramienta de creación' : topic!.estimatedTime}</span>
                  </div>
                  <div className="h-[180px] rounded-xl border border-[#E1E7E1] bg-[#F7F8F4] overflow-hidden flex items-center justify-center" aria-hidden="true" inert>
                    {designer ? (
                      <div className="space-y-4 p-5 text-center">
                        <PenTool className="w-8 h-8 mx-auto text-[#407B5D]" />
                        <div className="flex flex-wrap justify-center gap-2 text-xs font-semibold text-[#407B5D]">
                          {['Campos', 'Constructor', 'Métodos'].map((label) => <span key={label} className="bg-white border border-[#A4C4B5] rounded-lg px-3 py-2">{label}</span>)}
                        </div>
                      </div>
                    ) : <P5LiveThumbnail
                      p5Code={topic!.thumbnailP5 || topic!.sections[0]?.codeSnippetP5}
                      repositoryUrl={topic!.repositoryUrl || topic!.sections[0]?.repositoryUrl}
                      repositoryEntry={topic!.repositoryUrl ? topic!.repositoryEntry : topic!.sections[0]?.repositoryEntry}
                      width={460} height={180} interactive={false} fit="contain"
                    />}
                  </div>
                  <div className="space-y-2 flex-1">
                    <h3 className="text-lg font-bold text-[#232A24] leading-snug">{title}</h3>
                    <p className="text-sm text-[#59645C] leading-relaxed line-clamp-3">{description}</p>
                  </div>
                  <div className="pt-4 border-t border-[#E1E7E1] flex flex-wrap items-center justify-between gap-3">
                    <span className="text-xs text-[#59645C]">{designer ? 'De la idea a la clase' : percentage ? `${percentage}% recorrido` : 'Lección guiada'}</span>
                    <a href={href} className="min-h-[40px] inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-[#407B5D] hover:bg-[#33654C] text-white text-xs font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#407B5D]">
                      {designer ? 'Abrir diseñador' : percentage ? 'Continuar lección' : 'Abrir lección'}<ArrowRight className="w-4 h-4" />
                    </a>
                  </div>
                </article>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
