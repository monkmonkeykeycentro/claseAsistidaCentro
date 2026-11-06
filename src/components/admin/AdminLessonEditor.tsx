import React, { useState, useEffect, useRef } from 'react';
import {
  CmsLesson,
  CmsSection,
  CmsBlock,
  CmsModule,
  BlockType,
} from '../../types/cms';
import {
  saveCmsLessonContent,
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
import { RichTextEditor } from './RichTextEditor';
import { MediaResourcePicker } from './MediaResourcePicker';
import { MediaImage } from '../MediaImage';
import { P5LiveThumbnail } from '../generative/P5LiveThumbnail';
import { fetchGithubSketchSource } from '../../services/githubRepositoryService';
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
  const [isLoadingRepository, setIsLoadingRepository] = useState(false);
  const [loadingRepositoryBlockId, setLoadingRepositoryBlockId] = useState<string | null>(null);

  const savingRef = useRef(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const runAction = async (action: () => Promise<void>) => {
    if (savingRef.current || isLoading) return;
    savingRef.current = true;
    setIsSaving(true);
    setActionError(null);
    try {
      // Preserve field edits before operations that reload sections or blocks.
      await saveCmsLessonContent(formData, sections, blocksBySection);
      await action();
      setHasUnsavedChanges(false);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'No se pudo guardar el contenido.');
    } finally {
      savingRef.current = false;
      setIsSaving(false);
    }
  };

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
      setActionError('No se pudo cargar el contenido de la lección.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadContent();
  }, [lesson.id]);

  // Handle saving the lesson metadata
  const handleSaveLesson = async (publishNow = false) => {
    if (savingRef.current || isLoading) return;
    savingRef.current = true;
    setIsSaving(true);
    try {
      const updated: CmsLesson = {
        ...formData,
        status: publishNow ? 'published' : 'draft',
        updatedAt: new Date().toISOString(),
      };

      await saveCmsLessonContent(updated, sections, blocksBySection);
      setHasUnsavedChanges(false);
      setActionError(null);
      setFormData(updated);
      onLessonUpdated(updated);
      setSaveSuccessMsg(
        publishNow ? '¡Lección publicada con éxito!' : 'Borrador guardado exitosamente.'
      );
      setTimeout(() => setSaveSuccessMsg(null), 3000);
    } catch (err) {
      setActionError('Error al guardar: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      savingRef.current = false;
      setIsSaving(false);
    }
  };

  const handleLoadRepository = async () => {
    if (!formData.repositoryUrl?.trim()) {
      setActionError('Agrega primero el enlace del repositorio de GitHub.');
      return;
    }
    setIsLoadingRepository(true);
    setActionError(null);
    try {
      const source = await fetchGithubSketchSource(formData.repositoryUrl, formData.repositoryEntry || undefined);
      setFormData((current) => current.repositoryUrl !== formData.repositoryUrl || current.repositoryEntry !== formData.repositoryEntry ? current : ({
        ...current,
        thumbnailP5: source.code,
        displayCodeJava: source.codeJava,
        repositoryEntry: source.entry,
      }));
      setHasUnsavedChanges(true);
      setSaveSuccessMsg(`p5.js y Processing Java cargados. Guarda la lección para conservarlos.`);
      setTimeout(() => setSaveSuccessMsg(null), 4000);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'No se pudo cargar el proyecto desde GitHub.');
    } finally {
      setIsLoadingRepository(false);
    }
  };

  const handleLoadBlockRepository = async (sectionId: string, block: CmsBlock) => {
    if (!block.repositoryUrl?.trim()) return;
    setLoadingRepositoryBlockId(block.id);
    setActionError(null);
    try {
      const source = await fetchGithubSketchSource(block.repositoryUrl, block.repositoryEntry);
      setBlocksBySection((current) => ({
        ...current,
        [sectionId]: (current[sectionId] || []).map((item) => item.id === block.id && item.repositoryUrl === block.repositoryUrl && item.repositoryEntry === block.repositoryEntry ? {
          ...item, content: source.codeJava, contentJava: source.codeJava, contentP5: source.code,
          repositoryEntry: source.entry, filename: source.javaEntry.split('/').at(-1),
        } : item),
      }));
      setHasUnsavedChanges(true);
      setSaveSuccessMsg('p5.js y Processing Java cargados. Guarda los cambios para conservarlos.');
      setTimeout(() => setSaveSuccessMsg(null), 4000);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'No se pudo cargar el código desde GitHub.');
    } finally {
      setLoadingRepositoryBlockId(null);
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

  const handleUpdateSectionField = (
    secId: string,
    field: keyof CmsSection,
    value: any
  ) => {
    const current = sections.find((s) => s.id === secId);
    if (!current) return;
    const updated = { ...current, [field]: value, updatedAt: new Date().toISOString() };
    setSections(sections.map((s) => (s.id === secId ? updated : s)));
    setHasUnsavedChanges(true);
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
    await reorderCmsItems(
      'cms_sections',
      reordered.map((s) => s.id)
    );
    setSections(reordered);
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
        : type === 'iframe'
        ? 'https://example.com'
        : type === 'resources' ? 'https://processing.org/reference/' : 'Actividad práctica guiada';

    const newBlock: CmsBlock = {
      id: newBlockId,
      sectionId: secId,
      type,
      content: defaultContent,
      filename: type === 'code' ? 'sketch.pde' : undefined,
      caption: type === 'code' ? 'Ejemplo en Processing Java' : undefined,
      iframeTitle: type === 'iframe' ? 'Contenido embebido' : undefined,
      iframeHeight: type === 'iframe' ? 480 : undefined,
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

  const handleUpdateBlockField = (
    secId: string,
    blockId: string,
    field: keyof CmsBlock,
    value: any
  ) => {
    setBlocksBySection((prev) => ({
      ...prev,
      [secId]: (prev[secId] || []).map((b) => b.id === blockId ? {
        ...b, [field]: value, updatedAt: new Date().toISOString(),
        ...(field === 'repositoryUrl' ? { repositoryEntry: '' } : {}),
      } : b),
    }));
    setHasUnsavedChanges(true);
  };

  const handleUpdateRichText = (sectionId: string, blockId: string, content: string) => {
    handleUpdateBlockField(sectionId, blockId, 'content', content);
    handleUpdateBlockField(sectionId, blockId, 'contentFormat', 'html');
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
    await reorderCmsItems(
      'cms_blocks',
      reordered.map((b) => b.id)
    );
    setBlocksBySection((prev) => ({ ...prev, [secId]: reordered }));
  };

  const activeSection = sections.find((s) => s.id === activeSectionId) || sections[0];
  const activeBlocks = activeSection ? blocksBySection[activeSection.id] || [] : [];

  return (
    <div aria-busy={isSaving || isLoading}>
      <fieldset disabled={isSaving || isLoading} className="space-y-6 border-0 p-0 m-0 min-w-0">
      {/* Top Breadcrumb & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white border border-[#E1E7E1] rounded-2xl shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (!hasUnsavedChanges || confirm('Hay cambios sin guardar. ¿Deseas salir del editor?')) onBack();
            }}
            className="min-h-[38px] px-3 py-1.5 rounded-xl border border-[#E1E7E1] hover:bg-[#E8EEE8] text-xs font-semibold text-[#232A24] flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Volver a Módulos</span>
          </button>
          <span className="text-[#E1E7E1]">/</span>
          <div>
            <label className="font-semibold text-[#59645C] block mb-1 text-[11px]">
              Repositorio o carpeta pública de GitHub (opcional):
            </label>
            <input
              type="url"
              value={formData.repositoryUrl || ''}
              placeholder="https://github.com/usuario/proyecto"
              onChange={(e) => {
                setHasUnsavedChanges(true);
                setFormData({ ...formData, repositoryUrl: e.target.value, repositoryEntry: '' });
              }}
              className="w-full p-2 border border-[#E1E7E1] rounded-xl text-xs bg-[#F7F8F4] text-[#232A24] focus:outline-none focus:border-[#407B5D]"
            />
            <input
              type="text"
              value={formData.repositoryEntry || ''}
              placeholder="Se detecta automáticamente el único archivo .js de *_p5"
              onChange={(e) => {
                setHasUnsavedChanges(true);
                setFormData({ ...formData, repositoryEntry: e.target.value });
              }}
              className="w-full mt-1 p-2 border border-[#E1E7E1] rounded-xl font-mono text-[11px] bg-[#F7F8F4] text-[#232A24] focus:outline-none focus:border-[#407B5D]"
            />
            <p className="text-[10px] text-[#7A867E] mt-1">
              Acepta la raíz del repositorio o /tree/rama/carpeta. Dentro de esa ubicación: *_p5 se ejecuta y la carpeta Java se muestra como ejemplo.
            </p>
            <button
              type="button"
              onClick={handleLoadRepository}
              disabled={isLoadingRepository || !formData.repositoryUrl?.trim()}
              className="mt-2 px-3 py-1.5 rounded-lg bg-[#407B5D] text-white text-[11px] font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoadingRepository ? 'Cargando desde GitHub…' : 'Cargar código desde GitHub'}
            </button>
          </div>

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

      {actionError && <div role="alert" className="p-4 rounded-xl bg-[#FFF9EE] border border-[#E6C687] text-sm text-[#8A6318]">{actionError}</div>}
      <p className="text-xs text-[#59645C]">Los textos y bloques se guardan con «Guardar Borrador» o «Publicar Lección».</p>
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
                  onChange={(e) => { setHasUnsavedChanges(true); setFormData({ ...formData, title: e.target.value }); }}
                  className="w-full px-3 py-2 border border-[#E1E7E1] rounded-xl text-xs bg-[#F7F8F4] text-[#232A24] focus:outline-none focus:border-[#407B5D]"
                />
              </div>

              <div>
                <label className="font-semibold text-[#232A24] block mb-1">
                  Módulo Perteneciente:
                </label>
                <select
                  value={formData.moduleId}
                  onChange={(e) => { setHasUnsavedChanges(true); setFormData({ ...formData, moduleId: e.target.value }); }}
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
                  onChange={(e) => { setHasUnsavedChanges(true); setFormData({ ...formData, summary: e.target.value }); }}
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
                    onChange={(e) => { setHasUnsavedChanges(true); setFormData({ ...formData, badge: e.target.value }); }}
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
                    onChange={(e) => { setHasUnsavedChanges(true); setFormData({ ...formData, estimatedTime: e.target.value }); }}
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
                    onChange={(e) => { setHasUnsavedChanges(true); setFormData({ ...formData, visible: e.target.checked }); }}
                    className="w-4 h-4 rounded text-[#407B5D] accent-[#407B5D]"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[#232A24]">Estado editorial:</span>
                  <select
                    value={formData.status}
                    onChange={(e) => {
                      setHasUnsavedChanges(true);
                      setFormData({ ...formData, status: e.target.value as CmsLesson['status'] });
                    }}
                    className="px-2.5 py-1 border border-[#E1E7E1] rounded-lg text-xs bg-[#F7F8F4]"
                  >
                    <option value="draft">Borrador</option>
                    <option value="published">Publicado</option>
                    <option value="archived">Archivado</option>
                  </select>
                </div>
              </div>

              {/* Dual Code Configuration for Lesson Card / Header */}
              <div className="pt-3 border-t border-[#E1E7E1] space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#232A24] text-[11px] uppercase tracking-wide">
                    Miniatura en vivo & Código
                  </span>
                  <span className="text-[10px] text-[#407B5D] bg-[#E8EEE8] px-2 py-0.5 rounded font-mono font-bold">
                    p5.js + Processing
                  </span>
                </div>

                <div className="p-3 rounded-xl border border-[#A4C4B5] bg-[#F7F8F4] space-y-2">
                  <span className="font-semibold text-[#59645C] block text-[11px]">
                    Qué mostrar dentro del tema:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <label className="flex items-center gap-2 text-[11px] text-[#232A24]">
                      <input type="checkbox" checked={formData.showCodeJava !== false}
                        onChange={(e) => { setHasUnsavedChanges(true); setFormData({ ...formData, showCodeJava: e.target.checked }); }}
                        className="accent-[#407B5D]" />
                      Código Processing Java
                    </label>
                    <label className="flex items-center gap-2 text-[11px] text-[#232A24]">
                      <input type="checkbox" checked={formData.showCodeP5 === true}
                        onChange={(e) => { setHasUnsavedChanges(true); setFormData({ ...formData, showCodeP5: e.target.checked }); }}
                        className="accent-[#407B5D]" />
                      Código p5.js
                    </label>
                    <label className="flex items-center gap-2 text-[11px] text-[#232A24]">
                      <input type="checkbox" checked={formData.showInteractiveExecution === true}
                        onChange={(e) => { setHasUnsavedChanges(true); setFormData({ ...formData, showInteractiveExecution: e.target.checked }); }}
                        className="accent-[#407B5D]" />
                      Ejecución interactiva
                    </label>
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-[#59645C] block mb-1 text-[11px]">
                    Código p5.js de miniatura (se ejecuta en la tarjeta del home):
                  </label>
                  <textarea
                    rows={3}
                    value={formData.thumbnailP5 || ''}
                    placeholder={'function setup() {\n  createCanvas(280, 125);\n}\nfunction draw() {\n  background(240);\n}'}
                    onChange={(e) => {
                      setHasUnsavedChanges(true);
                      setFormData({ ...formData, thumbnailP5: e.target.value });
                    }}
                    className="w-full p-2 border border-[#E1E7E1] rounded-xl font-mono text-[11px] bg-[#F7F8F4] text-[#232A24] focus:outline-none focus:border-[#407B5D]"
                  />
                </div>

                <div>
                  <label className="font-semibold text-[#59645C] block mb-1 text-[11px]">
                    Código Processing Java (lo que lee el estudiante):
                  </label>
                  <textarea
                    rows={3}
                    value={formData.displayCodeJava || ''}
                    placeholder={'void setup() {\n  size(400, 400);\n}\nvoid draw() {\n  background(255);\n}'}
                    onChange={(e) => {
                      setHasUnsavedChanges(true);
                      setFormData({ ...formData, displayCodeJava: e.target.value });
                    }}
                    className="w-full p-2 border border-[#E1E7E1] rounded-xl font-mono text-[11px] bg-[#F7F8F4] text-[#232A24] focus:outline-none focus:border-[#407B5D]"
                  />
                </div>

                {(formData.thumbnailP5 || formData.repositoryUrl) && (
                  <div className="pt-1 space-y-1">
                    <span className="text-[10px] text-[#59645C] font-semibold block">
                      Vista previa de miniatura ejecutándose en p5:
                    </span>
                    <div className="flex justify-center p-2 bg-[#F7F8F4] border border-[#E1E7E1] rounded-xl overflow-hidden">
                      <P5LiveThumbnail
                        p5Code={formData.thumbnailP5}
                        repositoryUrl={formData.repositoryUrl}
                        repositoryEntry={formData.repositoryEntry}
                        width={240}
                        height={105}
                        interactive={true}
                      />
                    </div>
                  </div>
                )}
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
                onClick={() => runAction(handleAddSection)}
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
                          onClick={() => runAction(() => handleMoveSection(sIdx, 'up'))}
                          disabled={sIdx === 0}
                          className="p-1 rounded hover:bg-white text-[#59645C] disabled:opacity-20 cursor-pointer"
                          title="Subir"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => runAction(() => handleMoveSection(sIdx, 'down'))}
                          disabled={sIdx === sections.length - 1}
                          className="p-1 rounded hover:bg-white text-[#59645C] disabled:opacity-20 cursor-pointer"
                          title="Bajar"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => runAction(() => handleDuplicateSection(sec.id))}
                          className="p-1 rounded hover:bg-white text-[#59645C] cursor-pointer"
                          title="Duplicar sección"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => runAction(() => handleDeleteSection(sec.id))}
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
                    onClick={() => runAction(() => handleAddBlock(activeSection.id, 'rich-text'))}
                    className="min-h-[36px] px-3 py-1.5 rounded-xl border border-[#E1E7E1] bg-white hover:bg-[#E8EEE8] text-xs font-semibold text-[#232A24] flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <FileText className="w-3.5 h-3.5 text-[#407B5D]" />
                    <span>+ Texto</span>
                  </button>
                  <button
                    onClick={() => runAction(() => handleAddBlock(activeSection.id, 'code'))}
                    className="min-h-[36px] px-3 py-1.5 rounded-xl border border-[#E1E7E1] bg-white hover:bg-[#E8EEE8] text-xs font-semibold text-[#232A24] flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Code className="w-3.5 h-3.5 text-[#407B5D]" />
                    <span>+ Código Java</span>
                  </button>
                  <button
                    onClick={() => runAction(() => handleAddBlock(activeSection.id, 'callout'))}
                    className="min-h-[36px] px-3 py-1.5 rounded-xl border border-[#E1E7E1] bg-white hover:bg-[#E8EEE8] text-xs font-semibold text-[#232A24] flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <AlertTriangle className="w-3.5 h-3.5 text-[#E6B65A]" />
                    <span>+ Destacado / Nota</span>
                  </button>
                  <button
                    onClick={() => runAction(() => handleAddBlock(activeSection.id, 'image'))}
                    className="min-h-[36px] px-3 py-1.5 rounded-xl border border-[#E1E7E1] bg-white hover:bg-[#E8EEE8] text-xs font-semibold text-[#232A24] flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <ImageIcon className="w-3.5 h-3.5 text-[#407B5D]" />
                    <span>+ Imagen</span>
                  </button>
                  <button
                    onClick={() => runAction(() => handleAddBlock(activeSection.id, 'video'))}
                    className="min-h-[36px] px-3 py-1.5 rounded-xl border border-[#E1E7E1] bg-white hover:bg-[#E8EEE8] text-xs font-semibold text-[#232A24] flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Video className="w-3.5 h-3.5 text-[#407B5D]" />
                    <span>+ Video</span>
                  </button>
                  <button
                    onClick={() => runAction(() => handleAddBlock(activeSection.id, 'iframe'))}
                    className="min-h-[36px] px-3 py-1.5 rounded-xl border border-[#E1E7E1] bg-white hover:bg-[#E8EEE8] text-xs font-semibold text-[#232A24] cursor-pointer"
                  >
                    + Iframe
                  </button>
                  <button onClick={() => runAction(() => handleAddBlock(activeSection.id, 'resources'))} className="min-h-[36px] px-3 py-1.5 rounded-xl border border-[#E1E7E1] text-xs cursor-pointer">+ Recurso</button>
                  <button onClick={() => runAction(() => handleAddBlock(activeSection.id, 'activity'))} className="min-h-[36px] px-3 py-1.5 rounded-xl border border-[#E1E7E1] text-xs cursor-pointer">+ Actividad</button>
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
                            onClick={() => runAction(() => handleMoveBlock(activeSection.id, bIdx, 'up'))}
                            disabled={bIdx === 0}
                            className="p-1 rounded bg-white hover:bg-[#E8EEE8] border border-[#E1E7E1] text-[#59645C] disabled:opacity-20 cursor-pointer"
                            title="Subir bloque"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => runAction(() => handleMoveBlock(activeSection.id, bIdx, 'down'))}
                            disabled={bIdx === activeBlocks.length - 1}
                            className="p-1 rounded bg-white hover:bg-[#E8EEE8] border border-[#E1E7E1] text-[#59645C] disabled:opacity-20 cursor-pointer"
                            title="Bajar bloque"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => runAction(() => handleDuplicateBlock(activeSection.id, block.id))}
                            className="p-1 rounded bg-white hover:bg-[#E8EEE8] border border-[#E1E7E1] text-[#59645C] cursor-pointer"
                            title="Duplicar bloque"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => runAction(() => handleDeleteBlock(activeSection.id, block.id))}
                            className="p-1 rounded bg-white hover:bg-red-50 border border-[#E1E7E1] text-red-600 cursor-pointer"
                            title="Eliminar bloque"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {(['image', 'video', 'iframe', 'resources'] as const).some((type) => type === block.type) && (
                        <MediaResourcePicker kind={block.type as 'image' | 'video' | 'iframe' | 'resources'} onSelect={(resource, url) => {
                          handleUpdateBlockField(activeSection.id, block.id, 'content', url);
                          if (!block.caption) handleUpdateBlockField(activeSection.id, block.id, 'caption', resource.altText || resource.title);
                        }} />
                      )}
                      {/* Content editor based on block type */}
                      {block.type === 'rich-text' && (
                        <RichTextEditor key={block.id} label="Texto de la lección" value={block.content} format={block.contentFormat}
                          onChange={(content) => handleUpdateRichText(activeSection.id, block.id, content)} />
                      )}

                      {block.type === 'code' && (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 p-2.5 rounded-xl border border-[#A4C4B5] bg-white text-xs">
                            <span className="font-semibold">Fuente:</span>
                            <select
                              value={block.codeSource || (block.repositoryUrl ? 'github' : 'inline')}
                              onChange={(e) => handleUpdateBlockField(activeSection.id, block.id, 'codeSource', e.target.value)}
                              className="px-2 py-1 rounded-lg border border-[#E1E7E1]"
                            >
                              <option value="inline">Código independiente</option>
                              <option value="github">Repositorio GitHub</option>
                            </select>
                            <span className="text-[10px] text-[#59645C]">
                              GitHub solo se usa cuando se selecciona esa opción.
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <input
                              type="text"
                              value={block.filename || 'sketch.pde'}
                              onChange={(e) =>
                                handleUpdateBlockField(activeSection.id, block.id, 'filename', e.target.value)
                              }
                              placeholder="Nombre de archivo (ej. sketch.pde)"
                              className="px-2.5 py-1.5 bg-white border border-[#E1E7E1] rounded-xl font-mono text-xs text-[#232A24]"
                            />
                            <input
                              type="text"
                              value={block.caption || ''}
                              onChange={(e) =>
                                handleUpdateBlockField(activeSection.id, block.id, 'caption', e.target.value)
                              }
                              placeholder="Pie de código / descripción del sketch"
                              className="px-2.5 py-1.5 bg-white border border-[#E1E7E1] rounded-xl text-xs text-[#232A24]"
                            />
                          </div>

                          {block.codeSource === 'github' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <input
                                type="url"
                                value={block.repositoryUrl || ''}
                                onChange={(e) => handleUpdateBlockField(activeSection.id, block.id, 'repositoryUrl', e.target.value)}
                                placeholder="Repositorio o carpeta GitHub (/tree/main/a1)"
                                className="px-2.5 py-2 bg-white border border-[#E1E7E1] rounded-xl text-xs"
                              />
                              <input
                                type="text"
                                value={block.repositoryEntry || ''}
                                onChange={(e) => handleUpdateBlockField(activeSection.id, block.id, 'repositoryEntry', e.target.value)}
                                placeholder="Ruta .js opcional, relativa a la carpeta o al repositorio"
                                className="px-2.5 py-2 bg-white border border-[#E1E7E1] rounded-xl font-mono text-xs"
                              />
                              <p className="text-[11px] text-[#59645C] md:col-span-2">
                                Dentro de la ubicación indicada, *_p5 se ejecuta en el navegador y los archivos .pde de la carpeta Java se muestran al alumno.
                              </p>
                              <button type="button" onClick={() => handleLoadBlockRepository(activeSection.id, block)} disabled={loadingRepositoryBlockId !== null || !block.repositoryUrl?.trim()} className="px-3 py-2 rounded-lg bg-[#407B5D] text-white text-xs disabled:opacity-50">
                                {loadingRepositoryBlockId === block.id ? 'Cargando desde GitHub…' : 'Cargar p5.js y Processing Java desde GitHub'}
                              </button>
                            </div>
                          )}

                          {/* Dual Code Inputs: 1. Processing Java (Displayed) and 2. p5.js (Live thumbnail) */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between text-xs">
                                <label className="font-bold text-[#232A24] flex items-center gap-1.5">
                                  <span className="w-2 h-2 rounded-full bg-[#006699]" />
                                  <span>1. Código Processing Java (.pde)</span>
                                </label>
                                <span className="text-[10px] text-[#59645C] font-mono">Lo que lee el alumno</span>
                              </div>
                              <textarea
                                rows={8}
                                value={block.contentJava !== undefined ? block.contentJava : block.content}
                                onChange={(e) => {
                                  handleUpdateBlockField(activeSection.id, block.id, 'contentJava', e.target.value);
                                  handleUpdateBlockField(activeSection.id, block.id, 'content', e.target.value);
                                }}
                                className="w-full p-2.5 bg-white border border-[#E1E7E1] focus:border-[#407B5D] rounded-xl font-mono text-xs text-[#232A24] focus:outline-none"
                                placeholder="// Código en Processing Java (.pde)&#10;void setup() {&#10;  size(400, 400);&#10;}&#10;void draw() {&#10;  background(240);&#10;  circle(200, 200, 50);&#10;}"
                              />
                            </div>

                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between text-xs">
                                <label className="font-bold text-[#232A24] flex items-center gap-1.5">
                                  <span className="w-2 h-2 rounded-full bg-[#ED225D]" />
                                  <span>2. Código p5.js (.js)</span>
                                </label>
                                <span className="text-[10px] text-[#407B5D] font-mono font-bold">Miniatura viva</span>
                              </div>
                              <textarea
                                rows={8}
                                value={block.contentP5 || ''}
                                onChange={(e) =>
                                  handleUpdateBlockField(activeSection.id, block.id, 'contentP5', e.target.value)
                                }
                                className="w-full p-2.5 bg-white border border-[#E1E7E1] focus:border-[#407B5D] rounded-xl font-mono text-xs text-[#232A24] focus:outline-none"
                                placeholder="// Código p5.js para la miniatura&#10;function setup() {&#10;  createCanvas(340, 150);&#10;}&#10;function draw() {&#10;  background(240);&#10;  circle(mouseX, mouseY, 30);&#10;}"
                              />
                            </div>
                          </div>

                          <label className="flex items-start gap-2 p-3 rounded-xl border border-[#A4C4B5] bg-[#F7F8F4] text-xs text-[#232A24] cursor-pointer">
                            <input
                              type="checkbox"
                              checked={block.showInteractiveExecution === true}
                              onChange={(e) =>
                                handleUpdateBlockField(
                                  activeSection.id,
                                  block.id,
                                  'showInteractiveExecution',
                                  e.target.checked,
                                )
                              }
                              className="mt-0.5 accent-[#407B5D]"
                            />
                            <span>
                              <strong className="block">Mostrar ejecución interactiva dentro del tema</strong>
                              <span className="text-[11px] text-[#59645C]">
                                Añade un lienzo grande ejecutable además de la miniatura.
                              </span>
                            </span>
                          </label>

                          {/* Live mini preview of the p5.js code */}
                          <div className="p-3 bg-white border border-[#E1E7E1] rounded-xl space-y-2">
                            <div className="flex items-center justify-between text-xs text-[#59645C]">
                              <span className="font-semibold text-[11px] flex items-center gap-1.5 text-[#407B5D]">
                                <span className="w-2 h-2 rounded-full bg-[#407B5D] animate-pulse" />
                                Vista previa de la miniatura interactiva (p5.js en ejecución):
                              </span>
                              <span className="text-[10px] text-[#7A867E]">
                                {block.contentP5?.trim() ? 'Ejecutando p5.js en tiempo real' : 'Sin código p5 (agrega código para ver la miniatura)'}
                              </span>
                            </div>
                            <div className="w-full flex justify-center bg-[#F7F8F4] rounded-lg p-2 border border-[#E1E7E1]">
                              <P5LiveThumbnail
                                p5Code={block.contentP5}
                                repositoryUrl={block.codeSource === 'github' ? block.repositoryUrl : undefined}
                                repositoryEntry={block.repositoryEntry}
                                width={340}
                                height={150}
                                interactive={true}
                              />
                            </div>
                          </div>
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
                          <RichTextEditor key={block.id} label="Texto del aviso" value={block.content} format={block.contentFormat}
                            onChange={(content) => handleUpdateRichText(activeSection.id, block.id, content)} />
                        </div>
                      )}

                      {block.type === 'activity' && (
                        <RichTextEditor key={block.id} label="Instrucciones de la actividad" value={block.content} format={block.contentFormat}
                          onChange={(content) => handleUpdateRichText(activeSection.id, block.id, content)} />
                      )}
                      {block.type === 'resources' && (
                        <textarea rows={4} value={block.content} onChange={(e) => handleUpdateBlockField(activeSection.id, block.id, 'content', e.target.value)} placeholder="URL o descripción del recurso" className="w-full p-3 rounded-xl border border-[#E1E7E1] text-sm" />
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
                            <MediaImage
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

                      {block.type === 'iframe' && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                          <input
                            type="url"
                            value={block.content}
                            onChange={(e) => handleUpdateBlockField(activeSection.id, block.id, 'content', e.target.value)}
                            placeholder="URL https://... o código <iframe> de Miro"
                            className="md:col-span-2 px-2.5 py-2 bg-white border border-[#E1E7E1] rounded-xl text-xs"
                          />
                          <input
                            type="number"
                            min={160}
                            max={1200}
                            value={block.iframeHeight || 480}
                            onChange={(e) => handleUpdateBlockField(activeSection.id, block.id, 'iframeHeight', Number(e.target.value))}
                            placeholder="Alto (px)"
                            className="px-2.5 py-2 bg-white border border-[#E1E7E1] rounded-xl text-xs"
                          />
                          <input
                            type="text"
                            value={block.iframeTitle || ''}
                            onChange={(e) => handleUpdateBlockField(activeSection.id, block.id, 'iframeTitle', e.target.value)}
                            placeholder="Título accesible del iframe"
                            className="md:col-span-2 px-2.5 py-2 bg-white border border-[#E1E7E1] rounded-xl text-xs"
                          />
                          <input
                            type="text"
                            value={block.caption || ''}
                            onChange={(e) => handleUpdateBlockField(activeSection.id, block.id, 'caption', e.target.value)}
                            placeholder="Pie del contenido"
                            className="px-2.5 py-2 bg-white border border-[#E1E7E1] rounded-xl text-xs"
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
      </fieldset>
    </div>
  );
};
