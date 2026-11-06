import { createContext, useContext } from 'react';
import { DEFAULT_CLASS_DESIGNER_CONTENT } from '../../data/classDesignerContent';
import type { ClassDesignerContent, ClassDesignerStepNumber } from '../../types/classDesignerContent';
import { ClassDesignerContentBlocks } from './ClassDesignerContentBlocks';

export const ClassDesignerContentContext = createContext<ClassDesignerContent>(DEFAULT_CLASS_DESIGNER_CONTENT);
export const useClassDesignerContent = () => useContext(ClassDesignerContentContext);

export function ClassDesignerStepIntro({ step, className = 'Clase' }: { step: ClassDesignerStepNumber; className?: string }) {
  const content = useClassDesignerContent().steps[step];
  const render = (value: string) => value.replaceAll('{{className}}', className || 'Clase');
  return <div className="space-y-2 border-b border-[#E1E7E1] pb-4">
    <div className="flex items-center gap-2">
      <span className="px-2 py-0.5 bg-[#E8EEE8] text-[#407B5D] text-xs font-bold rounded-md">Etapa {step} de 6</span>
      <span className="text-xs font-medium text-[#59645C]">{content.category}</span>
    </div>
    <h2 className="text-xl font-bold text-[#232A24]">{render(content.title)}</h2>
    <p className="text-xs text-[#59645C] leading-relaxed whitespace-pre-wrap">{render(content.description)}</p>
    {content.tip && <p className="rounded-xl bg-[#F7F8F4] p-3 text-xs text-[#59645C] leading-relaxed whitespace-pre-wrap">{render(content.tip)}</p>}
    <ClassDesignerContentBlocks blocks={content.blocks} label={`Contenido de la etapa ${step}`} />
  </div>;
}
