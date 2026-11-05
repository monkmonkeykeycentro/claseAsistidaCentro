import React, { useEffect, useMemo, useState } from 'react';
import {
  CmsCapability,
  CmsNode,
  CmsNodeRelation,
  CmsNodeType,
  PublicationStatus,
} from '../../types/cms';
import {
  deleteCmsNode,
  getCmsNodeRelations,
  getCmsNodes,
  migrateLegacyContentToComposable,
  saveCmsNode,
  saveCmsNodeRelation,
} from '../../services/cmsService';
import { Check, Plus, Save, Trash2 } from 'lucide-react';

const NODE_TYPES: CmsNodeType[] = [
  'unit',
  'lesson',
  'section',
  'activity',
  'tool',
  'resource',
  'assessment',
  'collection',
  'container',
];

const CAPABILITIES: CmsCapability[] = [
  'content',
  'activity',
  'interactive',
  'assessment',
  'tool',
  'resource',
  'container',
  'navigation',
];

const now = () => new Date().toISOString();
const newId = (prefix: string) => `${prefix}_${crypto.randomUUID()}`;

function emptyNode(position: number): CmsNode {
  return {
    id: newId('node'),
    type: 'container',
    title: 'Nuevo contenido',
    description: '',
    status: 'draft',
    visible: true,
    position,
    capabilities: ['content', 'container'],
    metadata: {},
    createdAt: now(),
    updatedAt: now(),
  };
}

export function AdminComposableContentView() {
  const [nodes, setNodes] = useState<CmsNode[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [relations, setRelations] = useState<CmsNodeRelation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isMigrating, setIsMigrating] = useState(false);

  const selectedNode = nodes.find((node) => node.id === selectedId) || null;
  const availableChildren = useMemo(
    () => nodes.filter((node) => node.id !== selectedId && !relations.some((relation) => relation.childId === node.id)),
    [nodes, relations, selectedId],
  );

  const refresh = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const loaded = await getCmsNodes(true);
      setNodes(loaded);
      setSelectedId((current) => current && loaded.some((node) => node.id === current) ? current : loaded[0]?.id || null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'No se pudieron cargar los contenidos.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { refresh(); }, []);

  useEffect(() => {
    if (!selectedId) {
      setRelations([]);
      return;
    }
    getCmsNodeRelations(selectedId)
      .then(setRelations)
      .catch((loadError) => setError(loadError instanceof Error ? loadError.message : 'No se pudieron cargar las relaciones.'));
  }, [selectedId]);

  const updateSelected = (changes: Partial<CmsNode>) => {
    if (!selectedId) return;
    setNodes((current) => current.map((node) => node.id === selectedId ? { ...node, ...changes, updatedAt: now() } : node));
  };

  const handleCreate = () => {
    const node = emptyNode(nodes.length);
    setNodes((current) => [...current, node]);
    setSelectedId(node.id);
    setMessage('Nuevo contenido preparado. Guarda para publicarlo en el CMS.');
  };

  const handleMigration = async () => {
    if (!confirm('Se copiará todo el contenido existente al modelo composable sin borrar el CMS anterior. ¿Continuar?')) return;
    setIsMigrating(true);
    setError(null);
    try {
      const result = await migrateLegacyContentToComposable();
      await refresh();
      setMessage(result.migrated ? `Migración completada: ${result.nodes} contenidos, ${result.relations} relaciones y ${result.blocks} bloques.` : 'La migración ya estaba completada.');
    } catch (migrationError) {
      setError(migrationError instanceof Error ? migrationError.message : 'No se pudo completar la migración.');
    } finally {
      setIsMigrating(false);
    }
  };

  const handleSave = async () => {
    if (!selectedNode) return;
    setIsSaving(true);
    setError(null);
    try {
      await saveCmsNode(selectedNode);
      setMessage('Contenido guardado correctamente.');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'No se pudo guardar el contenido.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleArchive = async () => {
    if (!selectedNode || !confirm(`¿Archivar "${selectedNode.title}"?`)) return;
    try {
      await deleteCmsNode(selectedNode.id);
      await refresh();
      setMessage('Contenido archivado.');
    } catch (archiveError) {
      setError(archiveError instanceof Error ? archiveError.message : 'No se pudo archivar el contenido.');
    }
  };

  const handleAddRelation = async (childId: string) => {
    if (!selectedNode) return;
    const relation: CmsNodeRelation = {
      id: newId('rel'),
      parentId: selectedNode.id,
      childId,
      relationType: 'contains',
      position: relations.length,
      createdAt: now(),
      updatedAt: now(),
    };
    try {
      await saveCmsNodeRelation(relation);
      setRelations((current) => [...current, relation]);
    } catch (relationError) {
      setError(relationError instanceof Error ? relationError.message : 'No se pudo crear la relación.');
    }
  };

  return (
    <div className="space-y-5">
      <div className="p-5 bg-white border border-[#E1E7E1] rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#407B5D]">Arquitectura composable</span>
          <h2 className="text-xl font-extrabold text-[#232A24]">Unidades, herramientas y contenidos</h2>
          <p className="text-xs text-[#59645C] mt-1 max-w-2xl">Cada contenido puede combinar capacidades y contener otros contenidos sin depender de una jerarquía fija.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={handleMigration} disabled={isMigrating} className="min-h-[40px] px-4 rounded-xl border border-[#407B5D] text-[#407B5D] text-xs font-bold flex items-center gap-2 cursor-pointer disabled:opacity-50">
            {isMigrating ? 'Migrando...' : 'Migrar contenido existente'}
          </button>
          <button onClick={handleCreate} className="min-h-[40px] px-4 rounded-xl bg-[#407B5D] text-white text-xs font-bold flex items-center gap-2 cursor-pointer">
            <Plus className="w-4 h-4" /> Nuevo contenido
          </button>
        </div>
      </div>

      {error && <div className="p-3 rounded-xl bg-[#FFF1F0] border border-[#E2A6A1] text-xs text-[#8F3029]">{error}</div>}
      {message && <div className="p-3 rounded-xl bg-[#E8EEE8] border border-[#A4C4B5] text-xs text-[#28543D] flex items-center gap-2"><Check className="w-4 h-4" />{message}</div>}

      {isLoading ? <div className="p-8 text-center text-xs text-[#59645C]">Cargando contenidos...</div> : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="bg-white border border-[#E1E7E1] rounded-2xl p-3 space-y-1">
            {nodes.length === 0 && <p className="p-4 text-xs text-[#59645C]">Todavía no hay contenidos composables.</p>}
            {nodes.map((node) => (
              <button key={node.id} onClick={() => setSelectedId(node.id)} className={`w-full text-left p-3 rounded-xl cursor-pointer ${selectedId === node.id ? 'bg-[#E8EEE8] border border-[#A4C4B5]' : 'hover:bg-[#F7F8F4]'}`}>
                <span className="block text-[10px] uppercase font-bold tracking-wider text-[#407B5D]">{node.type}</span>
                <span className="block text-sm font-bold text-[#232A24] truncate">{node.title}</span>
                <span className="block text-[11px] text-[#59645C]">{node.status} · {node.capabilities.length} capacidades</span>
              </button>
            ))}
          </div>

          {selectedNode && (
            <div className="lg:col-span-2 bg-white border border-[#E1E7E1] rounded-2xl p-5 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="text-xs font-semibold text-[#232A24]">Título
                  <input value={selectedNode.title} onChange={(event) => updateSelected({ title: event.target.value })} className="mt-1 w-full p-2.5 rounded-xl border border-[#E1E7E1] text-sm" />
                </label>
                <label className="text-xs font-semibold text-[#232A24]">Tipo
                  <select value={selectedNode.type} onChange={(event) => updateSelected({ type: event.target.value as CmsNodeType })} className="mt-1 w-full p-2.5 rounded-xl border border-[#E1E7E1] text-sm">
                    {NODE_TYPES.map((type) => <option key={type}>{type}</option>)}
                  </select>
                </label>
                <label className="text-xs font-semibold text-[#232A24] sm:col-span-2">Descripción
                  <textarea value={selectedNode.description || ''} onChange={(event) => updateSelected({ description: event.target.value })} rows={2} className="mt-1 w-full p-2.5 rounded-xl border border-[#E1E7E1] text-sm resize-y" />
                </label>
                <label className="text-xs font-semibold text-[#232A24]">Estado
                  <select value={selectedNode.status} onChange={(event) => updateSelected({ status: event.target.value as PublicationStatus })} className="mt-1 w-full p-2.5 rounded-xl border border-[#E1E7E1] text-sm">
                    <option value="draft">Borrador</option><option value="published">Publicado</option><option value="archived">Archivado</option>
                  </select>
                </label>
                <label className="flex items-center gap-2 text-xs font-semibold text-[#232A24] mt-6"><input type="checkbox" checked={selectedNode.visible} onChange={(event) => updateSelected({ visible: event.target.checked })} /> Visible para estudiantes</label>
              </div>

              <fieldset>
                <legend className="text-xs font-bold text-[#232A24] mb-2">Capacidades</legend>
                <div className="flex flex-wrap gap-2">{CAPABILITIES.map((capability) => (
                  <label key={capability} className="px-2.5 py-1.5 rounded-lg border border-[#E1E7E1] text-[11px] cursor-pointer">
                    <input type="checkbox" className="mr-1.5" checked={selectedNode.capabilities.includes(capability)} onChange={(event) => updateSelected({ capabilities: event.target.checked ? [...selectedNode.capabilities, capability] : selectedNode.capabilities.filter((item) => item !== capability) })} />
                    {capability}
                  </label>
                ))}</div>
              </fieldset>

              <div className="border-t border-[#E1E7E1] pt-4 space-y-3">
                <div className="flex items-center justify-between"><h3 className="text-xs font-bold text-[#232A24]">Contenidos agrupados</h3>
                  <select defaultValue="" onChange={(event) => { if (event.target.value) { handleAddRelation(event.target.value); event.target.value = ''; } }} className="p-2 rounded-lg border border-[#E1E7E1] text-xs">
                    <option value="">Agregar contenido...</option>{availableChildren.map((node) => <option key={node.id} value={node.id}>{node.title}</option>)}
                  </select>
                </div>
                {relations.length === 0 ? <p className="text-xs text-[#59645C]">Este contenido todavía no agrupa otros contenidos.</p> : relations.map((relation) => <div key={relation.id} className="text-xs p-2.5 rounded-lg bg-[#F7F8F4]">{nodes.find((node) => node.id === relation.childId)?.title || relation.childId}</div>)}
              </div>

              <div className="flex justify-between gap-2 border-t border-[#E1E7E1] pt-4">
                <button onClick={handleArchive} className="px-3 py-2 rounded-xl border border-[#E2A6A1] text-[#8F3029] text-xs font-semibold flex items-center gap-1.5 cursor-pointer"><Trash2 className="w-3.5 h-3.5" /> Archivar</button>
                <button onClick={handleSave} disabled={isSaving} className="px-4 py-2 rounded-xl bg-[#407B5D] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"><Save className="w-3.5 h-3.5" /> {isSaving ? 'Guardando...' : 'Guardar contenido'}</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
