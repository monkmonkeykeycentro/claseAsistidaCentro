import React from 'react';
import { CmsLesson, CmsSection, CmsBlock } from '../../types/cms';
import { CmsBlockView } from '../CmsBlockView';
import { P5LiveThumbnail } from '../generative/P5LiveThumbnail';
import { X } from 'lucide-react';

interface StudentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  lesson: CmsLesson;
  sections: CmsSection[];
  blocksBySection: Record<string, CmsBlock[]>;
}

export const StudentPreviewModal: React.FC<StudentPreviewModalProps> = ({
  isOpen,
  onClose,
  lesson,
  sections,
  blocksBySection,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs font-sans">
      <div
        className="bg-[#F7F8F4] border border-[#E1E7E1] rounded-3xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Preview Top Bar */}
        <div className="p-4 sm:p-5 border-b border-[#E1E7E1] flex items-center justify-between bg-white rounded-t-3xl">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#E6B65A] animate-pulse" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs uppercase tracking-wider text-[#8A6318] bg-[#FFF9EE] px-2 py-0.5 rounded-full border border-[#E6B65A]/40">
                  Vista Previa de Estudiante
                </span>
                <span className="text-xs text-[#59645C] font-mono">
                  Estado: {lesson.status === 'published' ? 'Publicado' : 'Borrador'}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-[#232A24] mt-0.5">
                {lesson.title}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="min-h-[38px] px-3.5 py-1.5 rounded-xl border border-[#E1E7E1] hover:bg-[#E8EEE8] text-xs font-semibold text-[#232A24] flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <X className="w-4 h-4" />
            <span>Cerrar Vista Previa</span>
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-6 sm:p-8 overflow-y-auto custom-scrollbar space-y-8 flex-1">
          {/* Header Summary */}
          <div className="space-y-4 border-b border-[#E1E7E1] pb-6">
            <div className="flex items-center gap-2 text-xs">
              {lesson.badge && (
                <span className="bg-[#E8EEE8] text-[#407B5D] px-2.5 py-0.5 rounded-full font-semibold">
                  {lesson.badge}
                </span>
              )}
              {lesson.estimatedTime && (
                <span className="text-[#59645C] font-mono text-[11px]">
                  ⏱ {lesson.estimatedTime}
                </span>
              )}
            </div>

            {lesson.thumbnailP5 && (
              <div className="p-3 bg-white border border-[#E1E7E1] rounded-2xl flex flex-col items-center gap-2 shadow-2xs">
                <span className="text-[11px] font-mono text-[#407B5D] font-bold self-start flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#407B5D] animate-pulse" />
                  Miniatura en vivo de la lección (p5.js):
                </span>
                <P5LiveThumbnail p5Code={lesson.thumbnailP5} width={360} height={150} interactive={true} />
              </div>
            )}

            <p className="text-sm sm:text-base text-[#59645C] leading-relaxed max-w-3xl">
              {lesson.summary}
            </p>
          </div>

          {/* Sections List */}
          {sections.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#59645C] bg-white rounded-2xl border border-dashed border-[#E1E7E1]">
              Esta lección aún no tiene secciones. Agrega secciones y bloques de contenido desde el editor.
            </div>
          ) : (
            <div className="space-y-8">
              {sections.map((section, sIdx) => {
                const blocks = blocksBySection[section.id] || [];

                return (
                  <div
                    key={section.id}
                    className="p-6 bg-white border border-[#E1E7E1] rounded-2xl space-y-5 shadow-xs"
                  >
                    <div className="border-b border-[#E1E7E1] pb-3 flex items-center justify-between">
                      <div className="space-y-0.5">
                        <span className="text-[11px] font-mono text-[#407B5D] uppercase tracking-wider font-semibold">
                          Sección 0{sIdx + 1}
                        </span>
                        <h3 className="text-lg font-bold text-[#232A24]">
                          {section.title}
                        </h3>
                      </div>
                      {!section.visible && (
                        <span className="text-[11px] font-mono text-[#59645C] bg-[#F7F8F4] px-2 py-0.5 rounded-full border border-[#E1E7E1]">
                          Oculta para alumnos
                        </span>
                      )}
                    </div>

                    {section.summary && (
                      <p className="text-xs text-[#59645C] italic leading-relaxed">
                        {section.summary}
                      </p>
                    )}

                    {/* Blocks in this section */}
                    <div className="space-y-4">
                      {blocks.map((block) => <CmsBlockView key={block.id} block={block} />)}
                    </div>

                    {/* Didactic Tip & Mistake Footers if any */}
                    {(section.didacticTip || section.commonMistake) && (
                      <div className="pt-3 border-t border-[#E1E7E1] grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        {section.didacticTip && (
                          <div className="p-3 bg-[#E8EEE8]/40 border border-[#E1E7E1] rounded-xl text-[#232A24] space-y-1">
                            <span className="font-bold text-[#407B5D] block">
                              Consejo pedagógico:
                            </span>
                            <p className="text-[11px] text-[#59645C]">
                              {section.didacticTip}
                            </p>
                          </div>
                        )}
                        {section.commonMistake && (
                          <div className="p-3 bg-[#FFF9EE] border border-[#E6B65A] rounded-xl text-[#232A24] space-y-1">
                            <span className="font-bold text-[#8A6318] block">
                              Error común:
                            </span>
                            <p className="text-[11px] text-[#59645C]">
                              {section.commonMistake}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
