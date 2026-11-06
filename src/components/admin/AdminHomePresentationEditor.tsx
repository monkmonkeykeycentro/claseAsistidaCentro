import React from 'react';
import { ArrowDown, ArrowUp, Trash2 } from 'lucide-react';
import type { CmsHomePresentation, CmsHomePresentationItem, CmsLesson, CmsModule } from '../../types/cms';
import { homeLessonId, normalizeHomePresentation } from '../../utils/homePresentation';

export function AdminHomePresentationEditor({ value, lessons, modules, onChange }: {
  value?: CmsHomePresentation;
  lessons: CmsLesson[];
  modules: CmsModule[];
  onChange: (value: CmsHomePresentation) => void;
}) {
  const config = normalizeHomePresentation(value);
  const publicModules = new Set(modules.filter((module) => module.visible && module.status === 'published').map((module) => module.id));
  const publicLessons = lessons.filter((lesson) => lesson.visible && lesson.status === 'published' && publicModules.has(lesson.moduleId));
  const selected = new Set(config.items.filter((item) => item.type === 'lesson').map((item) => homeLessonId(item.id)));
  const titleFor = (item: CmsHomePresentationItem) => item.type === 'class-designer'
    ? 'Diseñador POO'
    : lessons.find((lesson) => homeLessonId(lesson.id) === homeLessonId(item.id))?.title || 'Lección no disponible';
  const move = (index: number, offset: number) => {
    const items = [...config.items];
    [items[index], items[index + offset]] = [items[index + offset], items[index]];
    onChange({ ...config, items });
  };

  return (
    <div className="space-y-4 rounded-xl border border-[#A4C4B5] bg-white p-4">
      <div className="space-y-2">
        <h3 className="text-sm font-bold text-[#232A24]">Selección para presentar</h3>
        <p className="text-xs text-[#59645C]">Organiza lecciones y herramientas en el orden en que quieres presentarlas. Aparecerán antes de las demás secciones de la portada.</p>
        <label className="flex items-center gap-2 text-xs font-semibold text-[#232A24]">
          <input type="checkbox" checked={config.enabled} onChange={(event) => onChange({ ...config, enabled: event.target.checked })} /> Mostrar selección en el inicio
        </label>
      </div>
      <label className="block space-y-1 text-xs text-[#59645C]">
        <span>Título de la selección</span>
        <input value={config.title} onChange={(event) => onChange({ ...config, title: event.target.value })} className="w-full rounded-lg border border-[#E1E7E1] px-3 py-2 text-[#232A24]" />
      </label>
      <label className="block space-y-1 text-xs text-[#59645C]">
        <span>Descripción de la selección</span>
        <textarea value={config.description} onChange={(event) => onChange({ ...config, description: event.target.value })} rows={2} className="w-full rounded-lg border border-[#E1E7E1] px-3 py-2 text-[#232A24]" />
      </label>
      <ol className="space-y-2" aria-label="Orden de presentación">
        {config.items.map((item, index) => {
          const title = titleFor(item);
          const unavailable = item.type === 'lesson' && !publicLessons.some((lesson) => homeLessonId(lesson.id) === homeLessonId(item.id));
          return (
            <li key={`${item.type}:${item.id}`} className="flex items-center justify-between gap-2 rounded-lg border border-[#E1E7E1] p-3 text-xs">
              <div className="min-w-0"><span className="font-semibold text-[#232A24]">{index + 1}. {title}</span>{unavailable && <p className="text-[#9A5A18]">Se mostrará cuando la lección y su módulo estén publicados y visibles.</p>}</div>
              <div className="flex shrink-0 gap-1">
                <button type="button" aria-label={`Subir ${title}`} disabled={index === 0} onClick={() => move(index, -1)} className="p-2 rounded-lg hover:bg-[#E8EEE8] disabled:opacity-30 cursor-pointer"><ArrowUp className="w-4 h-4" /></button>
                <button type="button" aria-label={`Bajar ${title}`} disabled={index === config.items.length - 1} onClick={() => move(index, 1)} className="p-2 rounded-lg hover:bg-[#E8EEE8] disabled:opacity-30 cursor-pointer"><ArrowDown className="w-4 h-4" /></button>
                <button type="button" aria-label={`Quitar ${title}`} onClick={() => onChange({ ...config, items: config.items.filter((_, current) => current !== index) })} className="p-2 rounded-lg hover:bg-[#FBE9E7] cursor-pointer"><Trash2 className="w-4 h-4" /></button>
              </div>
            </li>
          );
        })}
      </ol>
      <label className="block space-y-1 text-xs text-[#59645C]">
        <span>Añadir contenido a la selección</span>
        <select value="" onChange={(event) => {
          const target = event.target.value;
          if (!target) return;
          const item: CmsHomePresentationItem = target === 'class-designer' ? { type: 'class-designer', id: target } : { type: 'lesson', id: target.slice('lesson:'.length) };
          onChange({ ...config, items: [...config.items, item] });
        }} className="w-full rounded-lg border border-[#E1E7E1] bg-white px-3 py-2 text-[#232A24]">
          <option value="">Selecciona una lección o herramienta…</option>
          <optgroup label="Lecciones publicadas">{publicLessons.filter((lesson) => !selected.has(homeLessonId(lesson.id))).map((lesson) => <option key={lesson.id} value={`lesson:${lesson.id}`}>{lesson.title}</option>)}</optgroup>
          {!config.items.some((item) => item.type === 'class-designer') && <optgroup label="Herramientas"><option value="class-designer">Diseñador POO</option></optgroup>}
        </select>
      </label>
      <p className="text-[11px] text-[#59645C]">Usa «Guardar portada» para conservar los cambios.</p>
    </div>
  );
}
