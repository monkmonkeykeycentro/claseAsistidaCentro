import React from 'react';
import { CmsLesson, CmsSection, CmsBlock } from '../../types/cms';
import { ProcessingCodeBlock } from '../ProcessingCodeBlock';
import { X, Eye, Info, AlertTriangle, CheckCircle, ExternalLink, Code } from 'lucide-react';

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
          <div className="space-y-3 border-b border-[#E1E7E1] pb-6">
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
                      {blocks.map((block) => {
                        if (block.type === 'rich-text') {
                          return (
                            <div
                              key={block.id}
                              className="text-sm text-[#232A24] leading-relaxed whitespace-pre-line"
                            >
                              {block.content}
                            </div>
                          );
                        }

                        if (block.type === 'code') {
                          return (
                            <div key={block.id} className="space-y-1.5">
                              {block.caption && (
                                <span className="text-xs font-semibold text-[#59645C] block">
                                  {block.caption}
                                </span>
                              )}
                              <ProcessingCodeBlock
                                code={block.content}
                                filename={block.filename || 'sketch.pde'}
                                showCopyButton={true}
                              />
                            </div>
                          );
                        }

                        if (block.type === 'callout') {
                          const isWarning = block.calloutType === 'warning';
                          const isTip = block.calloutType === 'tip';
                          return (
                            <div
                              key={block.id}
                              className={`p-4 rounded-xl border text-xs leading-relaxed flex items-start gap-3 ${
                                isWarning
                                  ? 'bg-[#FFF9EE] border-[#E6B65A] text-[#232A24]'
                                  : isTip
                                  ? 'bg-[#E8EEE8] border-[#407B5D] text-[#232A24]'
                                  : 'bg-white border-[#E1E7E1] text-[#232A24]'
                              }`}
                            >
                              {isWarning ? (
                                <AlertTriangle className="w-4 h-4 text-[#8A6318] shrink-0 mt-0.5" />
                              ) : (
                                <Info className="w-4 h-4 text-[#407B5D] shrink-0 mt-0.5" />
                              )}
                              <div>
                                {block.caption && (
                                  <span className="font-bold block mb-0.5">
                                    {block.caption}
                                  </span>
                                )}
                                <span>{block.content}</span>
                              </div>
                            </div>
                          );
                        }

                        if (block.type === 'image') {
                          return (
                            <div key={block.id} className="space-y-1.5 text-center">
                              <img
                                src={block.content}
                                alt={block.caption || 'Imagen educativa'}
                                className="max-w-full h-auto rounded-xl border border-[#E1E7E1] mx-auto shadow-xs"
                              />
                              {block.caption && (
                                <span className="text-xs text-[#59645C] italic block">
                                  {block.caption}
                                </span>
                              )}
                            </div>
                          );
                        }

                        if (block.type === 'video') {
                          return (
                            <div key={block.id} className="space-y-1.5">
                              <div className="aspect-video w-full rounded-xl overflow-hidden border border-[#E1E7E1]">
                                <iframe
                                  src={block.content}
                                  title={block.caption || 'Video educativo'}
                                  className="w-full h-full"
                                  allowFullScreen
                                />
                              </div>
                              {block.caption && (
                                <span className="text-xs text-[#59645C] block">
                                  {block.caption}
                                </span>
                              )}
                            </div>
                          );
                        }

                        if (block.type === 'activity') {
                          return (
                            <div
                              key={block.id}
                              className="p-5 rounded-xl border border-[#407B5D] bg-[#E8EEE8]/30 space-y-2"
                            >
                              <div className="flex items-center gap-2 text-xs font-bold text-[#407B5D] uppercase">
                                <Code className="w-4 h-4" />
                                <span>Actividad Interactiva Vinculada</span>
                              </div>
                              <p className="text-xs font-semibold text-[#232A24]">
                                {block.content}
                              </p>
                              <span className="text-[11px] text-[#59645C] block">
                                En la plataforma del estudiante, este bloque se ejecuta con el simulador interactivo de Processing.
                              </span>
                            </div>
                          );
                        }

                        return null;
                      })}
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
