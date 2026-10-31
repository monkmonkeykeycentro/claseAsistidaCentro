import React, { useState, useEffect } from 'react';
import {
  CmsLesson,
  CmsSection,
  CmsBlock,
  CmsModule,
  BlockType,
} from '../../types/cms';
import {
  saveCmsLesson,
  getCmsSections,
  saveCmsSection,
  deleteCmsSection,
  duplicateCmsSection,
  getCmsBlocks,
  saveCmsBlock,
  deleteCmsBlock,
  duplicateCmsBlock,
  reorderCmsItems,
} from '../../services/cmsService';
import { StudentPreviewModal } from './StudentPreviewModal';
import { ProcessingCodeBlock } from '../ProcessingCodeBlock';
import {
  ArrowLeft,
  Save,
  Eye,
  Plus,
  Trash2,
  Copy,
  ArrowUp,
  ArrowDown,
  Layers,
  Code,
  FileText,
  Image as ImageIcon,
  Video,
  AlertTriangle,
  Check,
  CheckCircle,
  HelpCircle,
  Clock,
  ExternalLink,
} from 'lucide-react';

interface AdminLessonEditorProps {
  lesson: CmsLesson;
  modules: CmsModule[];
  onBack: () => void;
  onLessonUpdated: (updated: CmsLesson) => void;
}

export const AdminLessonEditor: React.FC<AdminLessonEditorProps> = ({
  lesson,
  modules,
  onBack,
  onLessonUpdated,
}) => {
  const [formData, setFormData] = useState<CmsLesson>({ ...lesson });
  const [sections, setSections] = useState<CmsSection[]>([]);
  const [blocksBySection, setBlocksBySection] = useState<Record<string, CmsBlock[]>>({});
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);

  // Load sections and their blocks
  const loadContent = async () => {
    setIsLoading(true);
    try {
      const secList = await getCmsSections(lesson.id, true);
      setSections(secList);

      const blocksMap: Record<string, CmsBlock[]> = {};
      for (const sec of secList) {
        const blocks = await getCmsBlocks(sec.id);
        blocksMap[sec.id] = blocks;
      }
      setBlocksBySection(blocksMap);

      if (secList.length > 0 && !activeSectionId) {
        setActiveSectionId(secList[0].id);
      }
    } catch (e) {
      console.error('Error loading lesson content:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadContent();
  }, [lesson.id]);

  // Handle saving the lesson metadata
  const handleSaveLesson = async (publishNow = false) => {
    setIsSaving(true);
    try {
      const updated: CmsLesson = {
        ...formData,
        status: publishNow ? 'published' : formData.status,
        updatedAt: new Date().toISOString(),
      };
      await saveCmsLesson(updated);
      setFormData(updated);
      onLessonUpdated(updated);
      setSaveSuccessMsg(
        publishNow ? '¡Lección publicada con éxito!' : 'Borrador guardado exitosamente.'
      );
      setTimeout(() => setSaveSuccessMsg(null), 3000);
    } catch (err) {
      alert('Error al guardar: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsSaving(false);
    }
  };

  // Section operations
  const handleAddSection = async () => {
    const newId = `sec_${Date.now()}`;
    const newSection: CmsSection = {
      id: newId,
      lessonId: lesson.id,
      title: `Nueva Sección ${sections.length + 1}`,
      position: sections.length,
      visible: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await saveCmsSection(newSection);
    setSections([...sections, newSection]);
    setBlocksBySection((prev) => ({ ...prev, [newId]: [] }));
    setActiveSectionId(newId);
  };

  const handleUpdateSectionField = async (
    secId: string,
    field: keyof CmsSection,
    value: any
  ) => {
    const current = sections.find((s) => s.id === secId);
    if (!current) return;
    const updated = { ...current, [field]: value, updatedAt: new Date().toISOString() };
    setSections(sections.map((s) => (s.id === secId ? updated : s)));
    await saveCmsSection(updated);
  };

  const handleDeleteSection = async (secId: string) => {
    if (!confirm('¿Seguro que deseas eliminar esta sección y todos sus bloques?')) return;
    await deleteCmsSection(secId);
    const remaining = sections.filter((s) => s.id !== secId);
    setSections(remaining);
    if (activeSectionId === secId) {
      setActiveSectionId(remaining[0]?.id || null);
    }
  };

  const handleDuplicateSection = async (secId: string) => {
    const dup = await duplicateCmsSection(secId);
    await loadContent();
    setActiveSectionId(dup.id);
  };

  const handleMoveSection = async (idx: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= sections.length) return;

    const copy = [...sections];
    const [moved] = copy.splice(idx, 1);
    copy.splice(targetIdx, 0, moved);

    const reordered = copy.map((item, p) => ({ ...item, position: p }));
    setSections(reordered);
    await reorderCmsItems(
      'cms_sections',
      reordered.map((s) => s.id)
    );
  };

  // Block operations
  const handleAddBlock = async (secId: string, type: BlockType) => {
    const currentBlocks = blocksBySection[secId] || [];
    const newBlockId = `blk_${Date.now()}`;
    const defaultContent =
      type === 'rich-text'
        ? 'Escribe aquí la explicación o contenido pedagógico...'
        : type === 'code'
        ? `void setup() {\n  size(600, 400);\n}\n\nvoid draw() {\n  background(255);\n}`
        : type === 'callout'
        ? 'Nota o principio didáctico importante para el estudiante.'
        : type === 'image'
        ? 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80'
        : type === 'video'
        ? 'https://www.youtube.com/embed/dQw4w9WgXcQ'
        : 'Actividad práctica guiada';

    const newBlock: CmsBlock = {
      id: newBlockId,
      sectionId: secId,
      type,
      content: defaultContent,
      filename: type === 'code' ? 'sketch.pde' : undefined,
      caption: type === 'code' ? 'Ejemplo en Processing Java' : undefined,
      calloutType: type === 'callout' ? 'tip' : undefined,
      position: currentBlocks.length,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await saveCmsBlock(newBlock);
    setBlocksBySection((prev) => ({
      ...prev,
      [secId]: [...currentBlocks, newBlock],
    }));
  };

  const handleUpdateBlockField = async (
    secId: string,
    blockId: string,
    field: keyof CmsBlock,
    value: any
  ) => {
    const currentBlocks = blocksBySection[secId] || [];
    const updatedBlocks = currentBlocks.map((b) =>
      b.id === blockId ? { ...b, [field]: value, updatedAt: new Date().toISOString() } : b
    );
    setBlocksBySection((prev) => ({ ...prev, [secId]: updatedBlocks }));
    const targetBlock = updatedBlocks.find((b) => b.id === blockId);
    if (targetBlock) {
      await saveCmsBlock(targetBlock);
    }
  };

  const handleDeleteBlock = async (secId: string, blockId: string) => {
    await deleteCmsBlock(blockId);
    const currentBlocks = blocksBySection[secId] || [];
    setBlocksBySection((prev) => ({
      ...prev,
      [secId]: currentBlocks.filter((b) => b.id !== blockId),
    }));
  };

  const handleDuplicateBlock = async (secId: string, blockId: string) => {
    await duplicateCmsBlock(blockId);
    const updatedList = await getCmsBlocks(secId);
    setBlocksBySection((prev) => ({ ...prev, [secId]: updatedList }));
  };

  const handleMoveBlock = async (
    secId: string,
    bIdx: number,
    direction: 'up' | 'down'
  ) => {
    const currentBlocks = [...(blocksBySection[secId] || [])];
    const targetIdx = direction === 'up' ? bIdx - 1 : bIdx + 1;
    if (targetIdx < 0 || targetIdx >= currentBlocks.length) return;

    const [moved] = currentBlocks.splice(bIdx, 1);
    currentBlocks.splice(targetIdx, 0, moved);

    const reordered = currentBlocks.map((b, p) => ({ ...b, position: p }));
    setBlocksBySection((prev) => ({ ...prev, [secId]: reordered }));
    await reorderCmsItems(
      'cms_blocks',
      reordered.map((b) => b.id)
    );
  };

  const activeSection = sections.find((s) => s.id === activeSectionId) || sections[0];
  const activeBlocks = activeSection ? blocksBySection[activeSection.id] || [] : [];

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white border border-[#E1E7E1] rounded-2xl shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="min-h-[38px] px-3 py-1.5 rounded-xl border border-[#E1E7E1] hover:bg-[#E8EEE8] text-xs font-semibold text-[#232A24] flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Volver a Módulos</span>
          </button>
          <span className="text-[#E1E7E1]">/</span>
          <div>
            <div className="flex items-center gap-2 text-xs">
              <span className="font-bold text-[#407B5D] uppercase tracking-wider bg-[#E8EEE8] px-2 py-0.5 rounded-full text-[10px]">
                Editor de Lección
              </span>
              <span className="text-[#59645C] font-mono text-[11px]">ID: {lesson.id}</span>
            </div>
            <h2 className="text-xl font-bold text-[#232A24] mt-0.5">
              {formData.title || 'Lección sin título'}
            </h2>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPreviewOpen(true)}
            className="min-h-[40px] px-4 py-2 rounded-xl bg-white hover:bg-[#E8EEE8] border border-[#E1E7E1] text-[#232A24] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <Eye className="w-4 h-4 text-[#407B5D]" />
            <span>Vista Previa</span>
          </button>

          <button
            onClick={() => handleSaveLesson(false)}
            disabled={isSaving}
            className="min-h-[40px] px-4 py-2 rounded-xl bg-white hover:bg-[#E8EEE8] border border-[#E1E7E1] text-[#232A24] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
          >
            <Save className="w-4 h-4 text-[#59645C]" />
            <span>{isSaving ? 'Guardando...' : 'Guardar Borrador'}</span>
          </button>

          <button
            onClick={() => handleSaveLesson(true)}
            disabled={isSaving}
            className="min-h-[40px] px-5 py-2 rounded-xl bg-[#407B5D] hover:bg-[#33654C] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Publicar Lección</span>
          </button>
        </div>
      </div>

      {saveSuccessMsg && (
        <div className="p-3.5 bg-[#E8EEE8] border border-[#407B5D] text-[#232A24] text-xs font-semibold rounded-xl flex items-center gap-2 shadow-xs animate-in fade-in">
          <Check className="w-4 h-4 text-[#407B5D]" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* Main 2-Column Grid: Left metadata & Sections list (4 cols) | Right Section Editor (8 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Lesson Metadata & Section Navigator (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Metadata Card */}
          <div className="p-5 bg-white border border-[#E1E7E1] rounded-2xl space-y-4 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#232A24] border-b border-[#E1E7E1] pb-2">
              Configuración de la Lección
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-[#232A24] block mb-1">
                  Título de la Lección:
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-[#E1E7E1] rounded-xl text-xs bg-[#F7F8F4] text-[#232A24] focus:outline-none focus:border-[#407B5D]"
                />
              </div>

              <div>
                <label className="font-semibold text-[#232A24] block mb-1">
                  Módulo Perteneciente:
                </label>
                <select
                  value={formData.moduleId}
                  onChange={(e) => setFormData({ ...formData, moduleId: e.target.value })}
                  className="w-full px-3 py-2 border border-[#E1E7E1] rounded-xl text-xs bg-[#F7F8F4] text-[#232A24] focus:outline-none"
                >
                  {modules.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-[#232A24] block mb-1">
                  Resumen / Descripción corta:
                </label>
                <textarea
                  rows={2}
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  className="w-full px-3 py-2 border border-[#E1E7E1] rounded-xl text-xs bg-[#F7F8F4] text-[#232A24] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-[#232A24] block mb-1">
                    Insignia (Badge):
                  </label>
                  <input
                    type="text"
                    value={formData.badge || ''}
                    placeholder="Ej. setup() y draw()"
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-[#E1E7E1] rounded-xl text-xs bg-[#F7F8F4]"
                  />
                </div>
                <div>
                  <label className="font-semibold text-[#232A24] block mb-1">
                    Tiempo estimado:
                  </label>
                  <input
                    type="text"
                    value={formData.estimatedTime || ''}
                    placeholder="Ej. 20 min"
                    onChange={(e) => setFormData({ ...formData, estimatedTime: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-[#E1E7E1] rounded-xl text-xs bg-[#F7F8F4]"
                  />
                </div>
              </div>

              {/* Status and Visibility */}
              <div className="pt-2 border-t border-[#E1E7E1] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[#232A24]">Visible para alumnos:</span>
                  <input
                    type="checkbox"
                    checked={formData.visible}
                    onChange={(e) => setFormData({ ...formData, visible: e.target.checked })}
                    className="w-4 h-4 rounded text-[#407B5D] accent-[#407B5D]"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[#232A24]">Estado editorial:</span>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value as any })
                    }
                    className="px-2.5 py-1 border border-[#E1E7E1] rounded-lg text-xs bg-[#F7F8F4]"
                  >
                    <option value="draft">Borrador</option>
                    <option value="published">Publicado</option>
                    <option value="archived">Archivado</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Section Management Navigator */}
          <div className="p-5 bg-white border border-[#E1E7E1] rounded-2xl space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-[#E1E7E1] pb-2">
              <div className="flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-[#407B5D]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#232A24]">
                  Secciones ({sections.length})
                </h3>
              </div>
              <button
                onClick={handleAddSection}
                className="px-2.5 py-1 rounded-lg bg-[#E8EEE8] hover:bg-[#d8e3d8] text-[#407B5D] text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nueva Sección</span>
              </button>
            </div>

            {sections.length === 0 ? (
              <p className="text-xs text-[#59645C] text-center py-4 italic">
                No hay secciones aún. Pulsa &quot;Nueva Sección&quot;.
              </p>
            ) : (
              <div className="space-y-2">
                {sections.map((sec, sIdx) => {
                  const isActive = sec.id === activeSectionId;
                  const blockCount = (blocksBySection[sec.id] || []).length;

                  return (
                    <div
                      key={sec.id}
                      onClick={() => setActiveSectionId(sec.id)}
                      className={`p-3 rounded-xl border text-xs transition-all cursor-pointer flex items-center justify-between gap-2 ${
                        isActive
                          ? 'bg-[#E8EEE8]/70 border-[#407B5D] shadow-xs'
                          : 'bg-white hover:bg-[#F7F8F4] border-[#E1E7E1]'
                      }`}
                    >
                      <div className="space-y-0.5 min-w-0 flex-1">
                        <div className="font-bold text-[#232A24] truncate flex items-center gap-1.5">
                          <span className="font-mono text-[10px] text-[#59645C]">
                            {sIdx + 1}.
                          </span>
                          <span className="truncate">{sec.title}</span>
                        </div>
                        <span className="text-[10px] text-[#59645C] block">
                          {blockCount} bloques de contenido · {sec.visible ? 'Visible' : 'Oculta'}
                        </span>
                      </div>

                      {/* Quick section reorder buttons */}
                      <div
                        className="flex items-center gap-0.5 shrink-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => handleMoveSection(sIdx, 'up')}
                          disabled={sIdx === 0}
                          className="p-1 rounded hover:bg-white text-[#59645C] disabled:opacity-20 cursor-pointer"
                          title="Subir"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleMoveSection(sIdx, 'down')}
                          disabled={sIdx === sections.length - 1}
                          className="p-1 rounded hover:bg-white text-[#59645C] disabled:opacity-20 cursor-pointer"
                          title="Bajar"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDuplicateSection(sec.id)}
                          className="p-1 rounded hover:bg-white text-[#59645C] cursor-pointer"
                          title="Duplicar sección"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteSection(sec.id)}
                          className="p-1 rounded hover:bg-red-50 text-red-600 cursor-pointer"
                          title="Eliminar sección"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Active Section & Content Blocks Editor (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {activeSection ? (
            <div className="p-6 bg-white border border-[#E1E7E1] rounded-2xl space-y-6 shadow-xs">
              {/* Section Header Controls */}
              <div className="border-b border-[#E1E7E1] pb-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1 flex-1">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[#59645C] block">
                      Título de la sección activa:
                    </label>
                    <input
                      type="text"
                      value={activeSection.title}
                      onChange={(e) =>
                        handleUpdateSectionField(activeSection.id, 'title', e.target.value)
                      }
                      className="w-full text-base font-bold text-[#232A24] px-3 py-1.5 rounded-xl border border-[#E1E7E1] bg-[#F7F8F4] focus:outline-none focus:border-[#407B5D]"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-1.5 text-xs text-[#59645C] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={activeSection.visible}
                        onChange={(e) =>
                          handleUpdateSectionField(activeSection.id, 'visible', e.target.checked)
                        }
                        className="w-4 h-4 rounded text-[#407B5D] accent-[#407B5D]"
                      />
                      <span>Sección Visible</span>
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="font-semibold text-[#59645C] block mb-1">
                      Consejo didáctico (opcional):
                    </label>
                    <input
                      type="text"
                      value={activeSection.didacticTip || ''}
                      placeholder="Ej. Recuerda limpiar el lienzo con background()..."
                      onChange={(e) =>
                        handleUpdateSectionField(activeSection.id, 'didacticTip', e.target.value)
                      }
                      className="w-full px-2.5 py-1.5 border border-[#E1E7E1] rounded-xl text-xs bg-[#F7F8F4]"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-[#59645C] block mb-1">
                      Error común a advertir (opcional):
                    </label>
                    <input
                      type="text"
                      value={activeSection.commonMistake || ''}
                      placeholder="Ej. No declarar size() dentro de draw()..."
                      onChange={(e) =>
                        handleUpdateSectionField(activeSection.id, 'commonMistake', e.target.value)
                      }
                      className="w-full px-2.5 py-1.5 border border-[#E1E7E1] rounded-xl text-xs bg-[#F7F8F4]"
                    />
                  </div>
                </div>
              </div>

              {/* Add Content Blocks Toolbar */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-[#232A24] block">
                  Agregar nuevo bloque a esta sección:
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => handleAddBlock(activeSection.id, 'rich-text')}
                    className="min-h-[36px] px-3 py-1.5 rounded-xl border border-[#E1E7E1] bg-white hover:bg-[#E8EEE8] text-xs font-semibold text-[#232A24] flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <FileText className="w-3.5 h-3.5 text-[#407B5D]" />
                    <span>+ Texto</span>
                  </button>
                  <button
                    onClick={() => handleAddBlock(activeSection.id, 'code')}
                    className="min-h-[36px] px-3 py-1.5 rounded-xl border border-[#E1E7E1] bg-white hover:bg-[#E8EEE8] text-xs font-semibold text-[#232A24] flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Code className="w-3.5 h-3.5 text-[#407B5D]" />
                    <span>+ Código Java</span>
                  </button>
                  <button
                    onClick={() => handleAddBlock(activeSection.id, 'callout')}
                    className="min-h-[36px] px-3 py-1.5 rounded-xl border border-[#E1E7E1] bg-white hover:bg-[#E8EEE8] text-xs font-semibold text-[#232A24] flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <AlertTriangle className="w-3.5 h-3.5 text-[#E6B65A]" />
                    <span>+ Destacado / Nota</span>
                  </button>
                  <button
                    onClick={() => handleAddBlock(activeSection.id, 'image')}
                    className="min-h-[36px] px-3 py-1.5 rounded-xl border border-[#E1E7E1] bg-white hover:bg-[#E8EEE8] text-xs font-semibold text-[#232A24] flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <ImageIcon className="w-3.5 h-3.5 text-[#407B5D]" />
                    <span>+ Imagen</span>
                  </button>
                  <button
                    onClick={() => handleAddBlock(activeSection.id, 'video')}
                    className="min-h-[36px] px-3 py-1.5 rounded-xl border border-[#E1E7E1] bg-white hover:bg-[#E8EEE8] text-xs font-semibold text-[#232A24] flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Video className="w-3.5 h-3.5 text-[#407B5D]" />
                    <span>+ Video</span>
                  </button>
                </div>
              </div>

              {/* Blocks Render List */}
              <div className="space-y-4 pt-2">
                {activeBlocks.length === 0 ? (
                  <div className="p-8 text-center text-xs text-[#59645C] bg-[#F7F8F4] rounded-2xl border border-dashed border-[#E1E7E1]">
                    Esta sección no tiene bloques de contenido todavía. Usa la barra superior para agregar texto, código o imágenes.
                  </div>
                ) : (
                  activeBlocks.map((block, bIdx) => (
                    <div
                      key={block.id}
                      className="p-4 bg-[#F7F8F4] border border-[#E1E7E1] rounded-2xl space-y-3 shadow-xs"
                    >
                      <div className="flex items-center justify-between border-b border-[#E1E7E1] pb-2 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] text-[#407B5D] bg-[#E8EEE8] px-2 py-0.5 rounded-full font-bold uppercase">
                            {block.type}
                          </span>
                          <span className="text-[11px] text-[#59645C] font-mono">
                            Posición {bIdx + 1}
                          </span>
                        </div>

                        {/* Block Action Controls */}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleMoveBlock(activeSection.id, bIdx, 'up')}
                            disabled={bIdx === 0}
                            className="p-1 rounded bg-white hover:bg-[#E8EEE8] border border-[#E1E7E1] text-[#59645C] disabled:opacity-20 cursor-pointer"
                            title="Subir bloque"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleMoveBlock(activeSection.id, bIdx, 'down')}
                            disabled={bIdx === activeBlocks.length - 1}
                            className="p-1 rounded bg-white hover:bg-[#E8EEE8] border border-[#E1E7E1] text-[#59645C] disabled:opacity-20 cursor-pointer"
                            title="Bajar bloque"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDuplicateBlock(activeSection.id, block.id)}
                            className="p-1 rounded bg-white hover:bg-[#E8EEE8] border border-[#E1E7E1] text-[#59645C] cursor-pointer"
                            title="Duplicar bloque"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteBlock(activeSection.id, block.id)}
                            className="p-1 rounded bg-white hover:bg-red-50 border border-[#E1E7E1] text-red-600 cursor-pointer"
                            title="Eliminar bloque"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Content editor based on block type */}
                      {block.type === 'rich-text' && (
                        <div className="space-y-2">
                          <textarea
                            rows={4}
                            value={block.content}
                            onChange={(e) =>
                              handleUpdateBlockField(activeSection.id, block.id, 'content', e.target.value)
                            }
                            className="w-full p-3 bg-white border border-[#E1E7E1] rounded-xl text-xs text-[#232A24] focus:outline-none focus:border-[#407B5D]"
                            placeholder="Escribe el texto de la lección..."
                          />
                        </div>
                      )}

                      {block.type === 'code' && (
                        <div className="space-y-2">
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <input
                              type="text"
                              value={block.filename || 'sketch.pde'}
                              onChange={(e) =>
                                handleUpdateBlockField(activeSection.id, block.id, 'filename', e.target.value)
                              }
                              placeholder="Nombre de archivo (ej. Pelota.pde)"
                              className="px-2.5 py-1.5 bg-white border border-[#E1E7E1] rounded-xl font-mono text-xs"
                            />
                            <input
                              type="text"
                              value={block.caption || ''}
                              onChange={(e) =>
                                handleUpdateBlockField(activeSection.id, block.id, 'caption', e.target.value)
                              }
                              placeholder="Pie de código / descripción"
                              className="px-2.5 py-1.5 bg-white border border-[#E1E7E1] rounded-xl text-xs"
                            />
                          </div>
                          <textarea
                            rows={6}
                            value={block.content}
                            onChange={(e) =>
                              handleUpdateBlockField(activeSection.id, block.id, 'content', e.target.value)
                            }
                            className="w-full p-3 bg-white border border-[#E1E7E1] rounded-xl font-mono text-xs text-[#232A24] focus:outline-none focus:border-[#407B5D]"
                            placeholder="// Código Processing Java..."
                          />
                        </div>
                      )}

                      {block.type === 'callout' && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-xs">
                            <span className="font-semibold text-[#59645C]">Tipo de aviso:</span>
                            <select
                              value={block.calloutType || 'tip'}
                              onChange={(e) =>
                                handleUpdateBlockField(activeSection.id, block.id, 'calloutType', e.target.value)
                              }
                              className="px-2 py-1 bg-white border border-[#E1E7E1] rounded-lg text-xs"
                            >
                              <option value="tip">Consejo (Verde)</option>
                              <option value="warning">Advertencia (Ámbar)</option>
                              <option value="info">Información (Azul)</option>
                            </select>
                            <input
                              type="text"
                              value={block.caption || ''}
                              onChange={(e) =>
                                handleUpdateBlockField(activeSection.id, block.id, 'caption', e.target.value)
                              }
                              placeholder="Título del aviso..."
                              className="flex-1 px-2.5 py-1 bg-white border border-[#E1E7E1] rounded-lg text-xs"
                            />
                          </div>
                          <textarea
                            rows={2}
                            value={block.content}
                            onChange={(e) =>
                              handleUpdateBlockField(activeSection.id, block.id, 'content', e.target.value)
                            }
                            className="w-full p-2.5 bg-white border border-[#E1E7E1] rounded-xl text-xs"
                            placeholder="Contenido de la nota..."
                          />
                        </div>
                      )}

                      {block.type === 'image' && (
                        <div className="space-y-2 text-xs">
                          <input
                            type="text"
                            value={block.content}
                            onChange={(e) =>
                              handleUpdateBlockField(activeSection.id, block.id, 'content', e.target.value)
                            }
                            placeholder="URL de la imagen..."
                            className="w-full px-2.5 py-1.5 bg-white border border-[#E1E7E1] rounded-xl font-mono"
                          />
                          <input
                            type="text"
                            value={block.caption || ''}
                            onChange={(e) =>
                              handleUpdateBlockField(activeSection.id, block.id, 'caption', e.target.value)
                            }
                            placeholder="Pie de foto / descripción..."
                            className="w-full px-2.5 py-1.5 bg-white border border-[#E1E7E1] rounded-xl"
                          />
                          {block.content && (
                            <img
                              src={block.content}
                              alt={block.caption || ''}
                              className="max-h-36 rounded-lg border border-[#E1E7E1] mx-auto mt-2"
                            />
                          )}
                        </div>
                      )}

                      {block.type === 'video' && (
                        <div className="space-y-2 text-xs">
                          <input
                            type="text"
                            value={block.content}
                            onChange={(e) =>
                              handleUpdateBlockField(activeSection.id, block.id, 'content', e.target.value)
                            }
                            placeholder="URL embebida del video (ej. https://www.youtube.com/embed/...)"
                            className="w-full px-2.5 py-1.5 bg-white border border-[#E1E7E1] rounded-xl font-mono"
                          />
                          <input
                            type="text"
                            value={block.caption || ''}
                            onChange={(e) =>
                              handleUpdateBlockField(activeSection.id, block.id, 'caption', e.target.value)
                            }
                            placeholder="Descripción del video..."
                            className="w-full px-2.5 py-1.5 bg-white border border-[#E1E7E1] rounded-xl"
                          />
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-[#59645C] bg-white border border-[#E1E7E1] rounded-2xl shadow-xs">
              Selecciona o crea una sección a la izquierda para comenzar a editar su contenido.
            </div>
          )}
        </div>
      </div>

      {/* Student Preview Modal */}
      <StudentPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        lesson={formData}
        sections={sections}
        blocksBySection={blocksBySection}
      />
    </div>
  );
};
