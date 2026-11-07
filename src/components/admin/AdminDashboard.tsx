import React, { useState, useEffect } from 'react';
import {
  CmsModule,
  CmsCategory,
  CmsHomeConfig,
  CmsLesson,
  CmsSiteContent,
  CmsMediaResource,
  CmsRevision,
  CurriculumExportData,
  HeaderNavigationItem,
  DEFAULT_HEADER_NAVIGATION,
  DEFAULT_HOME_CONFIG,
  NavigationTarget,
} from '../../types/cms';
import {
  getCmsModules,
  getCmsCategories,
  saveCmsCategory,
  deleteCmsCategory,
  saveCmsModule,
  deleteCmsModule,
  duplicateCmsModule,
  getCmsLessons,
  saveCmsLesson,
  deleteCmsLesson,
  duplicateCmsLesson,
  reorderCmsItems,
  getAllSiteContent,
  saveSiteContent,
  getCmsMediaResources,
  saveCmsMediaResource,
  deleteCmsMediaResource,
  exportCurriculumBackup,
  importCurriculumBackup,
  getCmsRevisions,
  seedCmsFromExistingContentIfEmpty,
  getHeaderNavigation,
  saveHeaderNavigation,
  syncCmsCategoryReferences,
  getHomeConfig,
  saveHomeConfig,
} from '../../services/cmsService';
import { AdminLessonEditor } from './AdminLessonEditor';
import { ContentStatus } from '../ContentStatus';
import { AdminHomePresentationEditor } from './AdminHomePresentationEditor';
import { AdminCurriculumUnitsView } from './AdminCurriculumUnitsView';
import { AdminComposableContentView } from './AdminComposableContentView';
import { AdminClassDesignerContentView } from './AdminClassDesignerContentView';
import { CmsBlockView } from '../CmsBlockView';
import { MediaImage } from '../MediaImage';
import { mediaResourceKind, mediaResourceUrl } from '../../utils/mediaUrls';
import { AppUser, isUserAdmin, db } from '../../services/firebase';
import { databaseLabel } from '../../config/dataBackend';
import { describeCmsError } from '../../utils/cmsErrors';
import { connectGoogleDrive, isDriveConfigured, makeDriveImagePublicReadOnly, uploadDriveFile } from '../../services/googleDriveService';
import { collection, doc, getDoc, getDocs } from '../../services/database';
import {
  PilotEvidenceRecord,
  CoordinateEvidence,
  ConditionalEvidence,
} from '../../types/pilotExercises';
import {
  Layers,
  BookOpen,
  FileText,
  Image as ImageIcon,
  History,
  Plus,
  Edit3,
  Copy,
  Trash2,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  Download,
  Upload,
  RefreshCw,
  Search,
  CheckCircle,
  AlertTriangle,
  ArrowLeft,
  ShieldCheck,
  ChevronRight,
  ChevronDown,
  Sparkles,
  Save,
  RotateCcw,
  User,
  FileCheck,
  Compass,
  Code2,
  Filter,
  Check,
  Menu,
  Film,
  Sliders,
  Tags,
} from 'lucide-react';

interface AdminDashboardProps {
  currentUser: AppUser | null;
  onExitAdmin: () => void;
  onPreviewAsStudent: () => void;
  onOpenExerciseInRunner?: (unitId: 'u1' | 'u2' | 'u3', exerciseId: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = (props) => {
  if (!isUserAdmin(props.currentUser)) return null;
  return <AuthorizedAdminDashboard {...props} />;
};

const AuthorizedAdminDashboard: React.FC<AdminDashboardProps> = ({
  currentUser,
  onExitAdmin,
  onPreviewAsStudent,
  onOpenExerciseInRunner,
}) => {
  const [activeTab, setActiveTab] = useState<'curriculum_units' | 'class_designer' | 'composable' | 'navigation' | 'content' | 'categories' | 'evidences' | 'overview' | 'site_texts' | 'media' | 'history'>('curriculum_units');
  const [navItems, setNavItems] = useState<HeaderNavigationItem[]>(DEFAULT_HEADER_NAVIGATION);
  const [isSavingNav, setIsSavingNav] = useState<boolean>(false);
  const [navSuccessMessage, setNavSuccessMessage] = useState<string>('');
  const [evidenceList, setEvidenceList] = useState<PilotEvidenceRecord[]>([]);
  const [evidenceFilter, setEvidenceFilter] = useState<'all' | 'coordinates' | 'conditionals'>('all');
  const [selectedEvidence, setSelectedEvidence] = useState<PilotEvidenceRecord | null>(null);
  const [modules, setModules] = useState<CmsModule[]>([]);
  const [categories, setCategories] = useState<CmsCategory[]>([]);
  const [lessons, setLessons] = useState<CmsLesson[]>([]);
  const [siteContent, setSiteContent] = useState<Record<string, CmsSiteContent>>({});
  const [siteTextDrafts, setSiteTextDrafts] = useState<Record<string, string>>({});
  const [homeConfig, setHomeConfig] = useState<CmsHomeConfig>(DEFAULT_HOME_CONFIG);
  const [savingTextKeys, setSavingTextKeys] = useState<Record<string, boolean>>({});
  const [mediaList, setMediaList] = useState<CmsMediaResource[]>([]);
  const [revisions, setRevisions] = useState<CmsRevision[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft' | 'hidden'>('all');
  const [categoryForm, setCategoryForm] = useState<Partial<CmsCategory>>({});

  // Currently editing lesson (switches to AdminLessonEditor)
  const [editingLesson, setEditingLesson] = useState<CmsLesson | null>(null);

  // Module creation/edit modal state
  const [isModuleModalOpen, setIsModuleModalOpen] = useState<boolean>(false);
  const [moduleForm, setModuleForm] = useState<Partial<CmsModule>>({
    title: '',
    description: '',
    category: 'Fundamentos',
    badge: '',
    status: 'published',
    visible: true,
  });

  // Media creation modal state
  const [isMediaModalOpen, setIsMediaModalOpen] = useState<boolean>(false);
  const [previewMedia, setPreviewMedia] = useState<CmsMediaResource | null>(null);
  const [mediaForm, setMediaForm] = useState<Partial<CmsMediaResource>>({
    title: '',
    url: '',
    altText: '',
    category: 'diagramas',
  });
  const [isDriveConnected, setIsDriveConnected] = useState(false);

  // Notification Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Expanded modules in the hierarchical tree
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const [actionError, setActionError] = useState<string | null>(null);
  const [isWorking, setIsWorking] = useState(false);
  const runAction = async (action: () => Promise<void>) => {
    if (isWorking) return;
    setIsWorking(true);
    setActionError(null);
    try { await action(); }
    catch (error) { setActionError(error instanceof Error ? error.message : 'No se pudo completar la operación.'); }
    finally { setIsWorking(false); }
  };

  const [hasLoaded, setHasLoaded] = useState(false);
  const [loadRevision, setLoadRevision] = useState(0);
  const [evidenceLoading, setEvidenceLoading] = useState(false);
  const [evidenceReady, setEvidenceReady] = useState(false);
  const [evidenceError, setEvidenceError] = useState<string | null>(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyReady, setHistoryReady] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [categoryReady, setCategoryReady] = useState(false);

  const loadAll = async () => {
    setIsLoading(true);
    setActionError(null);
    try {
      await seedCmsFromExistingContentIfEmpty();
      const [modList, categoryList, lesList, texts, loadedHomeConfig, nav, media] = await Promise.all([
        getCmsModules(true), getCmsCategories(true), getCmsLessons(undefined, true),
        getAllSiteContent(), getHomeConfig(), getHeaderNavigation(), getCmsMediaResources(),
      ]);
      setModules(modList);
      setCategories(categoryList);
      setLessons(lesList);
      setExpandedModules(Object.fromEntries(modList.slice(0, 4).map((module) => [module.id, true])));
      setSiteContent(texts);
      setHomeConfig(loadedHomeConfig);
      setSiteTextDrafts(Object.fromEntries(Object.entries(texts).map(([key, item]) => [key, item.content])));
      setNavItems(nav);
      setMediaList(media);
      setHasLoaded(true);
      setLoadRevision((revision) => revision + 1);
    } catch (error) {
      setActionError(describeCmsError(error, 'cargar el CMS'));
    } finally {
      setIsLoading(false);
    }
  };

  const loadEvidences = async () => {
    setEvidenceLoading(true);
    setEvidenceError(null);
    try {
        const loadedEvidences: PilotEvidenceRecord[] = [];
        {
          const usersSnap = await getDocs(collection(db, 'users'));
          for (let start = 0; start < usersSnap.docs.length; start += 6) {
            await Promise.all(usersSnap.docs.slice(start, start + 6).map(async (uDoc) => {
              const uData = uDoc.data();
              const [coordSnap, condSnap] = await Promise.all([
                getDoc(doc(db, 'users', uDoc.id, 'pilot_evidences', 'coordinates')),
                getDoc(doc(db, 'users', uDoc.id, 'pilot_evidences', 'conditionals')),
              ]);
              if (coordSnap.exists()) {
                const cData = coordSnap.data();
                loadedEvidences.push({
                  id: `ev_coord_${uDoc.id}`,
                  exerciseId: 'coordinates',
                  userId: uDoc.id,
                  userEmail: uData.email || 'Estudiante',
                  userName: uData.displayName || 'Estudiante',
                  data: cData as CoordinateEvidence,
                  submittedAt: cData.submittedAt || cData.updatedAt || new Date().toISOString(),
                });
              }
              if (condSnap.exists()) {
                const cnData = condSnap.data();
                loadedEvidences.push({
                  id: `ev_cond_${uDoc.id}`,
                  exerciseId: 'conditionals',
                  userId: uDoc.id,
                  userEmail: uData.email || 'Estudiante',
                  userName: uData.displayName || 'Estudiante',
                  data: cnData as ConditionalEvidence,
                  submittedAt: cnData.submittedAt || cnData.updatedAt || new Date().toISOString(),
                });
              }
            }));
          }
        }

        // Also merge local storage evidence for instant preview
        try {
          const locCoord = localStorage.getItem('pilot_coordinate_evidence');
          if (locCoord) {
            const pCoord = JSON.parse(locCoord);
            if (!loadedEvidences.some((e) => e.exerciseId === 'coordinates')) {
              loadedEvidences.push({
                id: 'ev_coord_local',
                exerciseId: 'coordinates',
                userId: currentUser?.uid || 'local',
                userEmail: currentUser?.email || 'estudiante.demo@centro.edu.mx',
                userName: currentUser?.displayName || 'Estudiante de Prueba',
                data: pCoord,
                submittedAt: pCoord.updatedAt || new Date().toISOString(),
              });
            }
          }
          const locCond = localStorage.getItem('pilot_conditional_evidence');
          if (locCond) {
            const pCond = JSON.parse(locCond);
            if (!loadedEvidences.some((e) => e.exerciseId === 'conditionals')) {
              loadedEvidences.push({
                id: 'ev_cond_local',
                exerciseId: 'conditionals',
                userId: currentUser?.uid || 'local',
                userEmail: currentUser?.email || 'estudiante.demo@centro.edu.mx',
                userName: currentUser?.displayName || 'Estudiante de Prueba',
                data: pCond,
                submittedAt: pCond.updatedAt || new Date().toISOString(),
              });
            }
          }
        } catch {
          // ignore
        }

        setEvidenceList(loadedEvidences);
        setEvidenceReady(true);
    } catch {
      setEvidenceError('No se pudieron cargar las evidencias. Vuelve a intentarlo.');
    } finally {
      setEvidenceLoading(false);
    }
  };

  const loadHistory = async () => {
    setHistoryLoading(true);
    setHistoryError(null);
    try { setRevisions(await getCmsRevisions()); setHistoryReady(true); }
    catch { setHistoryError('No se pudo cargar el historial. Vuelve a intentarlo.'); }
    finally { setHistoryLoading(false); }
  };

  useEffect(() => { void loadAll(); }, []);

  // Personal evidence and revision history are loaded only when requested.
  useEffect(() => {
    if (!hasLoaded) return;
    if (activeTab === 'evidences' || activeTab === 'overview') void loadEvidences();
    if (activeTab === 'history' || activeTab === 'overview') void loadHistory();
    if (activeTab === 'categories') {
      setCategoryLoading(true);
      setCategoryReady(false);
      syncCmsCategoryReferences()
        .then(() => getCmsCategories(true)).then((list) => { setCategories(list); setCategoryReady(true); })
        .catch((error) => setActionError(describeCmsError(error, 'sincronizar las categorías')))
        .finally(() => setCategoryLoading(false));
    }
  }, [activeTab, hasLoaded, loadRevision]);

  // Navigation & Apartados actions
  const handleMoveNav = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= navItems.length) return;
    const copy = [...navItems];
    const [moved] = copy.splice(index, 1);
    copy.splice(targetIndex, 0, moved);
    setNavItems(copy.map((item, idx) => ({ ...item, position: idx })));
  };

  const handleUpdateNavItem = (index: number, updates: Partial<HeaderNavigationItem>) => {
    setNavItems((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, ...updates } : item))
    );
  };

  const handleAddNavItem = () => {
    const newItem: HeaderNavigationItem = {
      id: `nav_custom_${Date.now()}`,
      label: 'Nuevo Apartado',
      target: 'home',
      visibleInHeader: true,
      position: navItems.length,
      description: 'Descripción del apartado',
    };
    setNavItems((prev) => [...prev, newItem]);
  };

  const handleDeleteNavItem = (index: number) => {
    setNavItems((prev) =>
      prev.filter((_, idx) => idx !== index).map((item, idx) => ({ ...item, position: idx }))
    );
  };

  const handleResetNavItems = () => {
    if (window.confirm('¿Deseas restaurar los apartados del header a su configuración predeterminada?')) {
      setNavItems(DEFAULT_HEADER_NAVIGATION);
    }
  };

  const handleSaveNav = async () => {
    try {
      setIsSavingNav(true);
      setNavSuccessMessage('');
      await saveHeaderNavigation(navItems);
      setNavSuccessMessage('¡Configuración de apartados y header guardada exitosamente!');
      setTimeout(() => setNavSuccessMessage(''), 4000);
    } catch (err) {
      console.error('Error saving navigation:', err);
      alert('No se pudo guardar la configuración de navegación. Verifica tus permisos de administrador.');
    } finally {
      setIsSavingNav(false);
    }
  };

  // Module actions
  const handleOpenNewModule = () => {
    setModuleForm({
      id: `mod_${Date.now()}`,
      title: '',
      description: '',
      category: 'Fundamentos',
      badge: '',
      position: modules.length,
      status: 'draft',
      visible: true,
    });
    setIsModuleModalOpen(true);
  };

  const handleOpenEditModule = (mod: CmsModule) => {
    setModuleForm({ ...mod });
    setIsModuleModalOpen(true);
  };

  const handleSaveModuleModal = async () => {
    if (!moduleForm.title?.trim()) {
      alert('Ingresa un título para el módulo');
      return;
    }

    const modToSave: CmsModule = {
      id: moduleForm.id || `mod_${Date.now()}`,
      title: moduleForm.title.trim(),
      description: moduleForm.description || '',
      category: moduleForm.category || 'Fundamentos',
      badge: moduleForm.badge || '',
      slug: moduleForm.title.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      position: moduleForm.position ?? modules.length,
      status: moduleForm.status || 'published',
      visible: moduleForm.visible ?? true,
      createdAt: moduleForm.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await saveCmsModule(modToSave);
    setIsModuleModalOpen(false);
    await loadAll();
    showToast(`Módulo "${modToSave.title}" guardado con éxito.`);
  };

  const handleSaveCategory = async () => {
    if (!categoryForm.name?.trim()) {
      alert('Ingresa un nombre para la categoría');
      return;
    }
    const category: CmsCategory = {
      id: categoryForm.id || `cat_${Date.now()}`,
      name: categoryForm.name.trim(),
      slug: categoryForm.slug || categoryForm.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: categoryForm.description || '',
      position: categoryForm.position ?? categories.length,
      visible: categoryForm.visible ?? true,
      createdAt: categoryForm.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await saveCmsCategory(category);
    setCategories((current) => [...current.filter((item) => item.id !== category.id), category].sort((a, b) => a.position - b.position));
    setCategoryForm({});
    showToast(`Categoría "${category.name}" guardada.`);
  };

  const handleDeleteCategory = async (category: CmsCategory) => {
    if (!confirm(`¿Archivar la categoría "${category.name}"?`)) return;
    await deleteCmsCategory(category.id);
    setCategories((current) => current.filter((item) => item.id !== category.id));
    showToast('Categoría eliminada.');
  };

  const handleToggleModuleVisibility = async (mod: CmsModule) => {
    const updated: CmsModule = { ...mod, visible: !mod.visible };
    await saveCmsModule(updated);
    setModules(modules.map((m) => (m.id === mod.id ? updated : m)));
    showToast(
      updated.visible
        ? `Módulo visible para estudiantes.`
        : `Módulo oculto de la navegación pública.`
    );
  };

  const handleDuplicateModule = async (moduleId: string) => {
    setIsLoading(true);
    try {
      await duplicateCmsModule(moduleId);
      await loadAll();
      showToast('Módulo y sus lecciones duplicados con éxito.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteModule = async (moduleId: string) => {
    if (
      !confirm(
        '¿Deseas archivar este módulo? No se borrará de la base de datos, pero dejará de ser visible para los estudiantes.'
      )
    ) {
      return;
    }
    await deleteCmsModule(moduleId, false);
    await loadAll();
    showToast('Módulo archivado.');
  };

  const handleMoveModule = async (idx: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= modules.length) return;

    const copy = [...modules];
    const [moved] = copy.splice(idx, 1);
    copy.splice(targetIdx, 0, moved);

    const reordered = copy.map((m, p) => ({ ...m, position: p }));
    await reorderCmsItems(
      'cms_modules',
      reordered.map((m) => m.id)
    );
    setModules(reordered);
  };

  // Lesson actions
  const handleCreateNewLesson = async (targetModuleId: string) => {
    const newLesson: CmsLesson = {
      id: `les_${Date.now()}`,
      moduleId: targetModuleId,
      title: 'Nueva Lección',
      summary: 'Escribe aquí el resumen y objetivos pedagógicos de la lección...',
      badge: 'Conceptos clave',
      estimatedTime: '20 min',
      slug: `leccion-${Date.now()}`,
      position: lessons.filter((l) => l.moduleId === targetModuleId).length,
      status: 'draft',
      visible: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await saveCmsLesson(newLesson);
    setLessons([...lessons, newLesson]);
    setEditingLesson(newLesson);
  };

  const handleToggleLessonVisibility = async (les: CmsLesson) => {
    const updated: CmsLesson = { ...les, visible: !les.visible };
    await saveCmsLesson(updated);
    setLessons(lessons.map((l) => (l.id === les.id ? updated : l)));
    showToast(
      updated.visible
        ? 'Lección visible para estudiantes.'
        : 'Lección oculta de la navegación pública.'
    );
  };

  const handleDuplicateLesson = async (lessonId: string) => {
    setIsLoading(true);
    try {
      await duplicateCmsLesson(lessonId);
      await loadAll();
      showToast('Lección duplicada como borrador.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm('¿Deseas archivar esta lección?')) return;
    await deleteCmsLesson(lessonId, false);
    await loadAll();
    showToast('Lección archivada.');
  };

  // Site text saving
  const handleSaveSiteText = async (key: string, content?: string) => {
    const textToSave = content !== undefined ? content : (siteTextDrafts[key] ?? siteContent[key]?.content ?? '');
    const current = siteContent[key] || {
      key,
      title: key,
      section: 'general',
      content: textToSave,
      updatedAt: new Date().toISOString(),
    };

    setSavingTextKeys((prev) => ({ ...prev, [key]: true }));
    try {
      const updated: CmsSiteContent = {
        ...current,
        content: textToSave,
        updatedAt: new Date().toISOString(),
        updatedBy: currentUser?.email || 'admin',
      };
      await saveSiteContent(updated, currentUser?.email || undefined);
      setSiteContent((prev) => ({ ...prev, [key]: updated }));
      setSiteTextDrafts((prev) => ({ ...prev, [key]: textToSave }));
      showToast(`✓ "${updated.title}" guardado correctamente.`);
    } catch (e) {
      console.error(e);
      setActionError(`No se pudo guardar "${current.title}". Revisa tu conexión y los permisos.`);
    } finally {
      setSavingTextKeys((prev) => ({ ...prev, [key]: false }));
    }
  };

  const handleSaveAllSiteTexts = async () => {
    setIsLoading(true);
    try {
      const entries = Object.entries(siteTextDrafts);
      let count = 0;
      for (const [k, val] of entries) {
        const current = siteContent[k];
        if (current) {
          const updated: CmsSiteContent = {
            ...current,
            content: val,
            updatedAt: new Date().toISOString(),
            updatedBy: currentUser?.email || 'admin',
          };
          await saveSiteContent(updated, currentUser?.email || undefined);
          setSiteContent((prev) => ({ ...prev, [k]: updated }));
          count++;
        }
      }
      showToast(`✓ Se guardaron ${count} textos generales en Firestore.`);
    } catch (err) {
      console.error(err);
      setActionError('No se pudieron guardar todos los textos. Revisa tu conexión y los permisos.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveHomeConfig = async () => {
    await saveHomeConfig({
      ...homeConfig,
      key: 'home_config',
      updatedAt: new Date().toISOString(),
    });
    showToast('✓ Configuración de la portada guardada en Firestore.');
  };

  const updateHomePillar = (id: keyof CmsHomeConfig['pillars'], changes: Partial<CmsHomeConfig['pillars'][typeof id]>) => {
    setHomeConfig((current) => ({
      ...current,
      pillars: { ...current.pillars, [id]: { ...current.pillars[id], ...changes } },
    }));
  };

  const handleResetSiteText = (key: string) => {
    const orig = siteContent[key]?.content || '';
    setSiteTextDrafts((prev) => ({ ...prev, [key]: orig }));
    showToast(`Borrador de "${siteContent[key]?.title || key}" restaurado.`);
  };

  // Media actions
  const handleAddMedia = async () => {
    if (!mediaForm.title || !mediaForm.url) {
      alert('Ingresa título y URL del recurso');
      return;
    }
    const newMedia: CmsMediaResource = {
      id: `med_${Date.now()}`,
      title: mediaForm.title,
      url: mediaForm.url,
      altText: mediaForm.altText || mediaForm.title,
      category: mediaForm.category || 'diagramas',
      createdAt: new Date().toISOString(),
    };

    await saveCmsMediaResource(newMedia);
    setIsMediaModalOpen(false);
    setMediaList([newMedia, ...mediaList]);
    showToast('Recurso multimedia agregado.');
  };

  const handleUploadToDrive = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!isDriveConfigured()) {
      setActionError('Falta configurar VITE_GOOGLE_CLIENT_ID para usar Google Drive.');
      return;
    }
    if (!isDriveConnected) {
      setActionError('Primero presiona "Conectar Drive" y autoriza el acceso.');
      return;
    }
    try {
      setIsLoading(true);
      const uploaded = await uploadDriveFile(file);
      const resource: CmsMediaResource = {
        id: `med_drive_${uploaded.id}`,
        title: uploaded.name,
        url: uploaded.webViewLink,
        driveWebViewLink: uploaded.webViewLink,
        driveThumbnailLink: uploaded.thumbnailLink,
        driveShortUrl: `https://drive.google.com/file/d/${uploaded.id}/view`,
        driveFileId: uploaded.id,
        mimeType: uploaded.mimeType,
        provider: 'google-drive',
        drivePublicRead: uploaded.publicRead,
        driveSharingError: uploaded.sharingError,
        altText: uploaded.name,
        category: file.type.startsWith('video/') ? 'video' : file.type.startsWith('audio/') ? 'audio' : file.type.startsWith('image/') ? 'imagenes' : 'documentos',
        createdAt: new Date().toISOString(),
      };

      await saveCmsMediaResource(resource);
      setMediaList((current) => [resource, ...current]);
      if (uploaded.sharingError) setActionError(uploaded.sharingError);
      showToast(uploaded.publicRead ? `"${uploaded.name}" se subió y quedó pública con permiso de lectura.` : `"${uploaded.name}" se subió a Google Drive y se registró en el CMS.`);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'No se pudo subir el archivo a Google Drive.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnectDrive = async () => {
    if (!isDriveConfigured()) {
      setActionError('Falta configurar VITE_GOOGLE_CLIENT_ID para usar Google Drive.');
      return;
    }
    try {
      setActionError(null);
      await connectGoogleDrive();
      setIsDriveConnected(true);
      showToast('Google Drive conectado correctamente.');
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'No se pudo conectar Google Drive.');
    }
  };

  const handlePublishDriveImage = async (media: CmsMediaResource) => {
    if (!isDriveConnected) throw new Error('Conecta Drive para compartir esta imagen como lectura pública.');
    const id = media.driveFileId;
    if (!id) throw new Error('Este recurso no tiene identificador de archivo de Drive.');
    const shared = await makeDriveImagePublicReadOnly(id);
    const updated: CmsMediaResource = { ...media, url: shared.webViewLink, driveWebViewLink: shared.webViewLink,
      driveThumbnailLink: shared.thumbnailLink, drivePublicRead: true, driveSharingError: '' };
    await saveCmsMediaResource(updated);
    setMediaList((current) => current.map((item) => item.id === media.id ? updated : item));
    showToast('Imagen pública por enlace, con permiso de lectura verificado.');
  };

  const handleDeleteMedia = async (mediaId: string) => {
    if (!confirm('¿Eliminar este recurso de la biblioteca?')) return;
    await deleteCmsMediaResource(mediaId);
    setMediaList(mediaList.filter((m) => m.id !== mediaId));
    showToast('Recurso eliminado.');
  };

  // Backup export / import
  const handleExportBackup = async () => {
    try {
      const backup = await exportCurriculumBackup();
      const blob = new Blob([JSON.stringify(backup, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `respaldo_curriculum_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Respaldo descargado exitosamente.');
      const revs = await getCmsRevisions();
      setRevisions(revs);
    } catch (e) {
      alert('Error al exportar: ' + String(e));
    }
  };

  const handleImportBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data: CurriculumExportData = JSON.parse(text);
      const destination = databaseLabel;
      const origin = data.source ? `${data.source.projectId} / ${data.source.databaseId}` : 'no especificado (respaldo anterior)';
      const total = (['modules', 'lessons', 'sections', 'blocks', 'siteContent', 'media', 'categories', 'nodes', 'nodeRelations', 'nodeBlocks'] as const)
        .reduce((count, key) => count + (Array.isArray(data[key]) ? data[key].length : 0), 0);
      if (!confirm(`Importar ${total} documentos del CMS.\n\nOrigen: ${origin}\nDestino: ${destination}\n\nSe actualizarán documentos con el mismo ID y se añadirán los nuevos. No se borrarán documentos adicionales. Antes se creará un respaldo del destino.\n\n¿Continuar?`)) return;
      setIsLoading(true);
      await importCurriculumBackup(data);
      await loadAll();
      showToast('Curriculum restaurado exitosamente.');
    } catch (err) {
      alert('Error importando archivo: ' + String(err));
    } finally {
      setIsLoading(false);
      e.target.value = '';
    }
  };

  // Filter modules/lessons
  const filteredModules = modules.filter((mod) => {
    const matchesSearch =
      mod.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mod.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mod.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'published'
        ? mod.status === 'published' && mod.visible
        : statusFilter === 'draft'
        ? mod.status === 'draft'
        : !mod.visible;

    return matchesSearch && matchesStatus;
  });

  // If in lesson editor mode, render the specialized editor
  if (editingLesson) {
    return (
      <AdminLessonEditor
        lesson={editingLesson}
        modules={modules}
        onBack={() => {
          setEditingLesson(null);
          loadAll();
        }}
        onLessonUpdated={(updated: CmsLesson) => {
          setEditingLesson(updated);
          setLessons(lessons.map((l) => (l.id === updated.id ? updated : l)));
        }}
      />
    );
  }

  return (
    <div aria-busy={isWorking || isLoading} className="space-y-6 animate-in fade-in duration-150 font-sans">
      {/* Top Admin Navigation Header */}
      <div className="p-5 bg-white border border-[#E1E7E1] rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs">
            <span className="font-bold uppercase tracking-wider bg-[#E8EEE8] text-[#407B5D] px-2.5 py-0.5 rounded-full text-[10px] flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Panel de Administración Privado</span>
            </span>
            <span className="text-[#E1E7E1]">/</span>
            <span className="text-[#59645C] font-mono text-[11px]">
              {currentUser?.email}
            </span>
            <span className="rounded-full bg-[#E8EEE8] px-2 py-0.5 text-[10px] font-semibold text-[#28543D]">
              Sesión CMS activa
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#232A24]">
            Gestor de Contenidos Educativos (CMS)
          </h1>
          <p className="text-xs text-[#59645C] leading-relaxed">
            Administra módulos, lecciones, secciones, código Processing Java y textos generales de forma persistente en tiempo real.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={onPreviewAsStudent}
            className="min-h-[40px] px-4 py-2 rounded-xl bg-white hover:bg-[#E8EEE8] border border-[#E1E7E1] text-xs font-semibold text-[#232A24] flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            title="Ver la plataforma tal como la ven los estudiantes"
          >
            <Eye className="w-4 h-4 text-[#407B5D]" />
            <span>Vista Estudiante</span>
          </button>

          <button
            onClick={() => runAction(handleExportBackup)}
            className="min-h-[40px] px-3.5 py-2 rounded-xl bg-white hover:bg-[#E8EEE8] border border-[#E1E7E1] text-xs font-semibold text-[#232A24] flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            title="Exportar respaldo completo del curriculum en JSON"
          >
            <Download className="w-4 h-4 text-[#59645C]" />
            <span>Exportar Respaldo</span>
          </button>

          <button
            onClick={onExitAdmin}
            className="min-h-[40px] px-4 py-2 rounded-xl bg-[#407B5D] hover:bg-[#33654C] text-xs font-semibold text-white flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Salir al Sitio</span>
          </button>
        </div>
      </div>

      <div className="p-3.5 bg-[#E8EEE8] border border-[#A4C4B5] rounded-2xl text-xs text-[#232A24]">
        <ShieldCheck className="w-4 h-4 inline mr-2 text-[#407B5D]" />
        Administrador: <strong>{currentUser?.email}</strong>. Los cambios se confirman al guardarse en Firebase.
      </div>
      {actionError && (
        <div role="alert" className="p-4 bg-[#FFF9EE] border border-[#E6C687] rounded-xl text-sm text-[#8A6318] space-y-3">
          <p>{actionError}</p>
          <button disabled={isLoading || isWorking} onClick={() => loadAll()} className="px-3 py-2 rounded-lg border border-[#E6C687] text-xs font-semibold cursor-pointer disabled:opacity-50">
            Reintentar carga
          </button>
        </div>
      )}

      {toastMessage && (
        <div className="p-3.5 bg-[#E8EEE8] border border-[#407B5D] text-[#232A24] text-xs font-semibold rounded-xl flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-[#407B5D]" />
            <span>{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-[#59645C] hover:text-[#232A24] cursor-pointer text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Layout: Left Navigation Sidebar & Right Content Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Sidebar Navigation (3 cols) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="p-3 bg-white border border-[#E1E7E1] rounded-2xl space-y-1 shadow-xs">
            {[
              { id: 'curriculum_units', label: 'Propuesta Unidades 1–3', icon: BookOpen, count: 14 },
              { id: 'composable', label: 'Contenido Composable', icon: Sparkles },
              { id: 'class_designer', label: 'Diseñador POO', icon: Sliders },
              { id: 'navigation', label: 'Apartados y Header', icon: Menu, count: navItems.length },
              { id: 'content', label: 'Módulos y Lecciones (CMS)', icon: Layers, count: modules.length },
              { id: 'categories', label: 'Categorías', icon: Tags, count: categories.length },
              { id: 'evidences', label: 'Evidencias de Estudiantes', icon: FileCheck, count: evidenceList.length },
              { id: 'overview', label: 'Resumen & Estadísticas', icon: Sparkles },
              { id: 'site_texts', label: 'Textos Generales', icon: FileText },
              { id: 'media', label: 'Recursos Multimedia', icon: ImageIcon, count: mediaList.length },
              { id: 'history', label: 'Historial y Respaldos', icon: History, count: revisions.length },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full min-h-[44px] px-3.5 py-2.5 rounded-xl text-xs font-semibold text-left transition-colors flex items-center justify-between cursor-pointer ${
                    isActive
                      ? 'bg-[#407B5D] text-white shadow-xs font-bold'
                      : 'bg-white hover:bg-[#E8EEE8] text-[#232A24]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#407B5D]'}`} />
                    <span>{tab.label}</span>
                  </div>
                  {tab.count !== undefined && (
                    <span
                      className={`text-[11px] font-mono px-2 py-0.5 rounded-full ${
                        isActive ? 'bg-white/20 text-white' : 'bg-[#F7F8F4] text-[#59645C]'
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick Help Card */}
          <div className="p-4 bg-white border border-[#E1E7E1] rounded-2xl space-y-2 text-xs text-[#59645C] shadow-xs">
            <span className="font-bold text-[#232A24] block flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-[#407B5D]" />
              <span>{actionError ? 'Revisa el aviso de carga' : hasLoaded ? 'Contenido guardado cargado' : 'Cargando contenido guardado…'}</span>
            </span>
            <p className="text-[11px] leading-relaxed">
              Los cambios se guardan en la plataforma. Revisa cualquier aviso de error antes de continuar.
            </p>
          </div>
        </div>

        {/* Right Main Content Area (9 cols) */}
        <div className="lg:col-span-9 space-y-6">
          {(!hasLoaded || isLoading) && <ContentStatus error={!isLoading ? actionError : null} onRetry={loadAll} />}
          {hasLoaded && !isLoading && <>
          {(activeTab === 'evidences' || activeTab === 'overview') && (!evidenceReady || evidenceLoading || evidenceError) && <ContentStatus error={evidenceError} onRetry={loadEvidences} loadingText="Cargando evidencias…" />}
          {(activeTab === 'history' || activeTab === 'overview') && (!historyReady || historyLoading || historyError) && <ContentStatus error={historyError} onRetry={loadHistory} loadingText="Cargando historial…" />}
          {activeTab === 'categories' && (!categoryReady || categoryLoading) && <ContentStatus error={!categoryLoading ? actionError : null} onRetry={() => setLoadRevision((revision) => revision + 1)} loadingText="Cargando categorías…" />}
          {/* ========================================================================= */}
          {/* TAB 0: PROPUESTA CURRICULAR U1–U3 (REVISIÓN DOCENTE)                     */}
          {/* ========================================================================= */}
          {activeTab === 'curriculum_units' && (
            <AdminCurriculumUnitsView
              adminEmail={currentUser?.email || undefined}
              onPreviewAsStudent={onPreviewAsStudent}
              onOpenExerciseInRunner={(uId, exId) => {
                if (onOpenExerciseInRunner) {
                  onOpenExerciseInRunner(uId, exId);
                } else {
                  window.location.hash = `#${exId}`;
                }
              }}
            />
          )}

          {activeTab === 'composable' && <AdminComposableContentView />}
          {activeTab === 'class_designer' && <AdminClassDesignerContentView />}

          {/* ========================================================================= */}
          {/* TAB: APARTADOS Y NAVEGACIÓN DEL HEADER                                    */}
          {/* ========================================================================= */}
          {activeTab === 'navigation' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Header Box */}
              <div className="p-5 bg-white border border-[#E1E7E1] rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#407B5D]" />
                    <span className="text-xs font-bold uppercase tracking-wider font-mono text-[#407B5D]">
                      Estructura y Menús
                    </span>
                  </div>
                  <h2 className="text-xl font-extrabold text-[#232A24] tracking-tight">
                    Personalización de Apartados y Header
                  </h2>
                  <p className="text-xs text-[#59645C] max-w-2xl leading-relaxed">
                    Define qué apartados aparecen en la barra de navegación superior (computadora y móvil), con qué nombre visible y a qué contenido conducen.
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={handleAddNavItem}
                    className="min-h-[38px] px-3.5 py-1.5 rounded-xl border border-[#407B5D] text-[#407B5D] hover:bg-[#E8EEE8] text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Agregar Apartado</span>
                  </button>
                  <button
                    onClick={handleResetNavItems}
                    className="min-h-[38px] px-3 py-1.5 rounded-xl border border-[#E1E7E1] text-[#59645C] hover:text-[#232A24] hover:bg-[#F7F8F4] text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                    title="Restaurar a los apartados iniciales"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Restaurar</span>
                  </button>
                  <button
                    onClick={handleSaveNav}
                    disabled={isSavingNav}
                    className="min-h-[38px] px-4 py-1.5 rounded-xl bg-[#407B5D] hover:bg-[#33654C] text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSavingNav ? 'Guardando...' : 'Guardar Cambios'}</span>
                  </button>
                </div>
              </div>

              {navSuccessMessage && (
                <div className="p-3.5 bg-[#E8EEE8] border border-[#407B5D] text-[#232A24] text-xs font-semibold rounded-xl flex items-center gap-2 shadow-xs animate-in fade-in">
                  <CheckCircle className="w-4 h-4 text-[#407B5D]" />
                  <span>{navSuccessMessage}</span>
                </div>
              )}

              {/* Real-time Header Preview Mockup */}
              <div className="p-4 bg-[#F7F8F4] border border-[#E1E7E1] rounded-2xl space-y-2">
                <div className="flex items-center justify-between text-xs text-[#59645C]">
                  <span className="font-bold text-[#232A24] flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-[#407B5D]" />
                    <span>Vista previa en vivo del Header</span>
                  </span>
                  <span className="font-mono text-[11px]">
                    {navItems.filter((i) => i.visibleInHeader).length} de {navItems.length} apartados visibles
                  </span>
                </div>

                <div className="bg-white border border-[#E1E7E1] rounded-xl p-3 shadow-2xs overflow-x-auto custom-scrollbar">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-[#407B5D] text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                      CC
                    </div>
                    <span className="font-bold text-xs text-[#232A24] shrink-0 mr-2">Código Creativo</span>
                    <div className="flex items-center gap-1.5">
                      {navItems
                        .filter((item) => item.visibleInHeader)
                        .map((item, idx) => (
                          <div
                            key={item.id}
                            className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 border whitespace-nowrap ${
                              idx === 0
                                ? 'bg-[#E8EEE8] text-[#407B5D] border-[#407B5D]/30 font-bold'
                                : 'bg-[#F7F8F4] text-[#232A24] border-[#E1E7E1]'
                            }`}
                          >
                            <span>{item.label}</span>
                            {item.badge && (
                              <span className="text-[10px] bg-white text-[#59645C] px-1.5 py-0.2 rounded border border-[#E1E7E1]">
                                {item.badge}
                              </span>
                            )}
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* List of Configurable Apartados */}
              <div className="space-y-3">
                {navItems.map((item, index) => (
                  <div
                    key={item.id}
                    className="p-4 bg-white border border-[#E1E7E1] hover:border-[#407B5D]/60 rounded-2xl shadow-xs space-y-3 transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E1E7E1] pb-3">
                      {/* Left: Position & Reorder */}
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-lg bg-[#F7F8F4] border border-[#E1E7E1] text-[11px] font-mono font-bold text-[#59645C] flex items-center justify-center">
                          {index + 1}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleMoveNav(index, 'up')}
                            disabled={index === 0}
                            className="p-1.5 rounded-lg border border-[#E1E7E1] hover:bg-[#E8EEE8] disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
                            title="Mover arriba"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleMoveNav(index, 'down')}
                            disabled={index === navItems.length - 1}
                            className="p-1.5 rounded-lg border border-[#E1E7E1] hover:bg-[#E8EEE8] disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
                            title="Mover abajo"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Visibility Toggle */}
                        <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold ml-2">
                          <input
                            type="checkbox"
                            checked={item.visibleInHeader}
                            onChange={(e) => handleUpdateNavItem(index, { visibleInHeader: e.target.checked })}
                            className="rounded border-[#E1E7E1] text-[#407B5D] focus:ring-[#407B5D] cursor-pointer"
                          />
                          <span className={item.visibleInHeader ? 'text-[#407B5D]' : 'text-[#8E8E89]'}>
                            {item.visibleInHeader ? 'Visible en cabecera' : 'Oculto en cabecera'}
                          </span>
                        </label>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDeleteNavItem(index)}
                          className="p-1.5 rounded-lg border border-[#E1E7E1] text-[#8E8E89] hover:text-red-600 hover:border-red-300 transition-colors cursor-pointer"
                          title="Eliminar apartado"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Field Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 pt-1">
                      {/* Name in header (4 cols) */}
                      <div className="lg:col-span-4 space-y-1">
                        <label className="text-[11px] font-bold text-[#232A24] block">
                          Nombre visible en el Header
                        </label>
                        <input
                          type="text"
                          value={item.label}
                          onChange={(e) => handleUpdateNavItem(index, { label: e.target.value })}
                          placeholder="Ej. Caballo al Galope, Inicio, etc."
                          className="w-full px-3 py-1.5 bg-[#F7F8F4] border border-[#E1E7E1] rounded-xl text-xs text-[#232A24] font-medium focus:outline-none focus:border-[#407B5D]"
                        />
                      </div>

                      {/* Target selection (5 cols) */}
                      <div className="lg:col-span-5 space-y-1">
                        <label className="text-[11px] font-bold text-[#232A24] block">
                          ¿Qué contiene / a qué conduce este apartado?
                        </label>
                        <select
                          value={item.target}
                          onChange={(e) => handleUpdateNavItem(index, { target: e.target.value as NavigationTarget })}
                          className="w-full px-3 py-1.5 bg-[#F7F8F4] border border-[#E1E7E1] rounded-xl text-xs text-[#232A24] font-medium focus:outline-none focus:border-[#407B5D]"
                        >
                          <option value="home">Inicio (Vista Principal del Laboratorio)</option>
                          <option value="horse">El Caballo al Galope (Muybridge 1878 - Discretización ASCII)</option>
                          <option value="units">Unidades Curriculares 1, 2 y 3 (14 Prácticas)</option>
                          <option value="oop-lab">Laboratorio POO (Pelota, Burbuja y Ruido Perlin)</option>
                          <option value="class-designer">Diseñador de Clases (POO)</option>
                          <option value="pilot">Módulo Piloto (Coordenadas, Condicionales y Video)</option>
                          <option value="catalogue">Temario Curricular Completo (01 al 07)</option>
                        </select>
                      </div>

                      {/* Badge / Tag (3 cols) */}
                      <div className="lg:col-span-3 space-y-1">
                        <label className="text-[11px] font-bold text-[#232A24] block">
                          Insignia / Badge (opcional)
                        </label>
                        <input
                          type="text"
                          value={item.badge || ''}
                          onChange={(e) => handleUpdateNavItem(index, { badge: e.target.value })}
                          placeholder="Ej. 1878, 14, Nuevo"
                          className="w-full px-3 py-1.5 bg-[#F7F8F4] border border-[#E1E7E1] rounded-xl text-xs text-[#232A24] font-mono focus:outline-none focus:border-[#407B5D]"
                        />
                      </div>

                      {/* Description (12 cols) */}
                      <div className="lg:col-span-12 space-y-1 pt-1">
                        <label className="text-[11px] font-bold text-[#59645C] block">
                          Descripción breve del contenido (mostrada en el menú móvil y ayuda)
                        </label>
                        <input
                          type="text"
                          value={item.description || ''}
                          onChange={(e) => handleUpdateNavItem(index, { description: e.target.value })}
                          placeholder="Breve resumen de lo que el estudiante encontrará aquí..."
                          className="w-full px-3 py-1.5 bg-[#F7F8F4] border border-[#E1E7E1] rounded-xl text-xs text-[#59645C] focus:outline-none focus:border-[#407B5D]"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 1: MÓDULOS Y LECCIONES                                                */}
          {/* ========================================================================= */}
          {activeTab === 'categories' && categoryReady && !categoryLoading && (
            <div className="space-y-4">
              <div className="p-5 bg-white border border-[#E1E7E1] rounded-2xl shadow-xs">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div>
                    <h2 className="text-base font-bold text-[#232A24]">Categorías curriculares</h2>
                    <p className="text-xs text-[#59645C]">Organiza módulos y lecciones con nombres propios de tu curso.</p>
                  </div>
                  <button
                    onClick={() => setCategoryForm({ visible: true })}
                    className="min-h-[36px] px-3 py-2 bg-[#407B5D] text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Nueva categoría
                  </button>
                </div>
                {Object.keys(categoryForm).length > 0 && (
                  <div className="p-4 mb-4 bg-[#F7F8F4] border border-[#E1E7E1] rounded-xl space-y-3">
                    <input
                      value={categoryForm.name || ''}
                      onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                      placeholder="Ej. Código generativo"
                      className="w-full px-3 py-2 bg-white border border-[#E1E7E1] rounded-xl text-xs"
                    />
                    <textarea
                      value={categoryForm.description || ''}
                      onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                      placeholder="Descripción opcional"
                      rows={2}
                      className="w-full px-3 py-2 bg-white border border-[#E1E7E1] rounded-xl text-xs"
                    />
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setCategoryForm({})} className="px-3 py-2 border border-[#E1E7E1] rounded-xl text-xs cursor-pointer">Cancelar</button>
                      <button onClick={() => runAction(handleSaveCategory)} className="px-3 py-2 bg-[#407B5D] text-white rounded-xl text-xs font-semibold cursor-pointer">Guardar</button>
                    </div>
                  </div>
                )}
                <div className="grid gap-2">
                  {categories.map((category) => (
                    <div key={category.id} className="flex items-center justify-between gap-3 p-3 border border-[#E1E7E1] rounded-xl">
                      <div>
                        <p className="text-sm font-semibold text-[#232A24]">{category.name}</p>
                        <p className="text-[11px] text-[#59645C]">{category.description || 'Sin descripción'}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => setCategoryForm(category)} className="p-2 border border-[#E1E7E1] rounded-lg text-[#407B5D] cursor-pointer" title="Editar categoría"><Edit3 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => runAction(() => handleDeleteCategory(category))} className="p-2 border border-[#E1E7E1] rounded-lg text-[#A4473D] cursor-pointer" title="Eliminar categoría"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'content' && (
            <div className="space-y-4">
              {/* Filter and Top Search Bar */}
              <div className="p-4 bg-white border border-[#E1E7E1] rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-[#59645C]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar por título, categoría o palabra clave..."
                    className="w-full pl-9 pr-3 py-2 bg-[#F7F8F4] border border-[#E1E7E1] rounded-xl text-xs text-[#232A24] focus:outline-none focus:border-[#407B5D]"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    className="px-3 py-2 bg-[#F7F8F4] border border-[#E1E7E1] rounded-xl text-xs text-[#232A24] focus:outline-none"
                  >
                    <option value="all">Todos los estados</option>
                    <option value="published">Publicados y Visibles</option>
                    <option value="draft">Borradores</option>
                    <option value="hidden">Ocultos</option>
                  </select>

                  <button
                    onClick={handleOpenNewModule}
                    className="min-h-[38px] px-4 py-2 rounded-xl bg-[#407B5D] hover:bg-[#33654C] text-xs font-semibold text-white flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Nuevo Módulo</span>
                  </button>
                </div>
              </div>

              {/* Modules & Lessons Hierarchy List */}
              {isLoading ? (
                <div className="p-12 text-center text-xs text-[#59645C] bg-white border border-[#E1E7E1] rounded-2xl">
                  Cargando contenidos educativos...
                </div>
              ) : filteredModules.length === 0 ? (
                <div className="p-12 text-center text-xs text-[#59645C] bg-white border border-[#E1E7E1] rounded-2xl space-y-3">
                  <p>No se encontraron módulos con el filtro aplicado.</p>
                  <button
                    onClick={handleOpenNewModule}
                    className="px-4 py-2 bg-[#407B5D] text-white rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    Crear primer módulo
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredModules.map((mod, mIdx) => {
                    const isExpanded = Boolean(expandedModules[mod.id]);
                    const modLessons = lessons.filter((l) => l.moduleId === mod.id);

                    return (
                      <div
                        key={mod.id}
                        className="bg-white border border-[#E1E7E1] rounded-2xl overflow-hidden shadow-xs transition-all"
                      >
                        {/* Module Header Bar */}
                        <div className="p-4 sm:p-5 bg-white border-b border-[#E1E7E1] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <button
                              onClick={() =>
                                setExpandedModules({
                                  ...expandedModules,
                                  [mod.id]: !isExpanded,
                                })
                              }
                              className="p-1 rounded-lg hover:bg-[#E8EEE8] text-[#59645C] cursor-pointer shrink-0"
                              title={isExpanded ? 'Contraer lecciones' : 'Expandir lecciones'}
                            >
                              {isExpanded ? (
                                <ChevronDown className="w-5 h-5 text-[#407B5D]" />
                              ) : (
                                <ChevronRight className="w-5 h-5 text-[#59645C]" />
                              )}
                            </button>

                            <div className="space-y-0.5 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-mono text-xs font-bold text-[#407B5D]">
                                  #{mIdx + 1}
                                </span>
                                <h3 className="font-bold text-base text-[#232A24] truncate">
                                  {mod.title}
                                </h3>
                                <span className="text-[10px] font-semibold bg-[#F7F8F4] border border-[#E1E7E1] text-[#59645C] px-2 py-0.5 rounded-full">
                                  {mod.category}
                                </span>
                                <span
                                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                    mod.status === 'published'
                                      ? 'bg-[#E8EEE8] text-[#407B5D]'
                                      : 'bg-[#FFF9EE] text-[#8A6318]'
                                  }`}
                                >
                                  {mod.status === 'published' ? 'Publicado' : 'Borrador'}
                                </span>
                                {!mod.visible && (
                                  <span className="text-[10px] bg-zinc-100 text-[#59645C] px-2 py-0.5 rounded-full border border-zinc-200">
                                    Oculto
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-[#59645C] line-clamp-1">
                                {mod.description}
                              </p>
                            </div>
                          </div>

                          {/* Module Quick Actions */}
                          <div className="flex items-center gap-1 shrink-0 self-end sm:self-auto">
                            <button
                              onClick={() => runAction(() => handleMoveModule(mIdx, 'up'))}
                              disabled={mIdx === 0}
                              className="p-1.5 rounded-lg border border-[#E1E7E1] hover:bg-[#E8EEE8] text-[#59645C] disabled:opacity-20 cursor-pointer"
                              title="Subir posición"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => runAction(() => handleMoveModule(mIdx, 'down'))}
                              disabled={mIdx === filteredModules.length - 1}
                              className="p-1.5 rounded-lg border border-[#E1E7E1] hover:bg-[#E8EEE8] text-[#59645C] disabled:opacity-20 cursor-pointer"
                              title="Bajar posición"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => runAction(() => handleToggleModuleVisibility(mod))}
                              className={`p-1.5 rounded-lg border border-[#E1E7E1] transition-colors cursor-pointer ${
                                mod.visible
                                  ? 'hover:bg-[#E8EEE8] text-[#407B5D]'
                                  : 'bg-zinc-100 text-zinc-400'
                              }`}
                              title={mod.visible ? 'Ocultar módulo' : 'Mostrar módulo'}
                            >
                              {mod.visible ? (
                                <Eye className="w-3.5 h-3.5" />
                              ) : (
                                <EyeOff className="w-3.5 h-3.5" />
                              )}
                            </button>

                            <button
                              onClick={() => runAction(() => handleDuplicateModule(mod.id))}
                              className="p-1.5 rounded-lg border border-[#E1E7E1] hover:bg-[#E8EEE8] text-[#59645C] cursor-pointer"
                              title="Duplicar módulo y sus lecciones"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleOpenEditModule(mod)}
                              className="p-1.5 rounded-lg border border-[#E1E7E1] hover:bg-[#E8EEE8] text-[#59645C] cursor-pointer"
                              title="Editar configuración del módulo"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => runAction(() => handleDeleteModule(mod.id))}
                              className="p-1.5 rounded-lg border border-[#E1E7E1] hover:bg-red-50 text-red-600 cursor-pointer"
                              title="Archivar módulo"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Lessons List inside Module */}
                        {isExpanded && (
                          <div className="p-4 sm:p-5 bg-[#F7F8F4]/50 space-y-3">
                            <div className="flex items-center justify-between text-xs font-semibold text-[#59645C] mb-1">
                              <span>Lecciones del módulo ({modLessons.length})</span>
                              <button
                                onClick={() => runAction(() => handleCreateNewLesson(mod.id))}
                                className="px-3 py-1 rounded-lg bg-white hover:bg-[#E8EEE8] border border-[#E1E7E1] text-[#407B5D] text-xs font-semibold flex items-center gap-1 cursor-pointer shadow-xs"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Agregar Lección</span>
                              </button>
                            </div>

                            {modLessons.length === 0 ? (
                              <div className="p-4 bg-white rounded-xl border border-dashed border-[#E1E7E1] text-center text-xs text-[#59645C]">
                                Este módulo no tiene lecciones aún. Pulsa &quot;Agregar Lección&quot; para crear la primera.
                              </div>
                            ) : (
                              <div className="space-y-2">
                                {modLessons.map((les, lIdx) => (
                                  <div
                                    key={les.id}
                                    className="p-3.5 bg-white border border-[#E1E7E1] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs hover:border-[#407B5D] transition-colors"
                                  >
                                    <div className="space-y-1 min-w-0 flex-1">
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <span className="font-mono text-xs font-semibold text-[#59645C]">
                                          {lIdx + 1}.
                                        </span>
                                        <span className="font-bold text-xs sm:text-sm text-[#232A24]">
                                          {les.title}
                                        </span>
                                        <span
                                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                            les.status === 'published'
                                              ? 'bg-[#E8EEE8] text-[#407B5D]'
                                              : 'bg-[#FFF9EE] text-[#8A6318]'
                                          }`}
                                        >
                                          {les.status === 'published' ? 'Publicado' : 'Borrador'}
                                        </span>
                                        {!les.visible && (
                                          <span className="text-[10px] bg-zinc-100 text-zinc-500 px-2 py-0.5 rounded-full border border-zinc-200">
                                            Oculta
                                          </span>
                                        )}
                                      </div>
                                      <p className="text-xs text-[#59645C] line-clamp-1">
                                        {les.summary}
                                      </p>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-1.5 shrink-0">
                                      <button
                                        onClick={() => runAction(() => handleToggleLessonVisibility(les))}
                                        className={`p-1.5 rounded-lg border border-[#E1E7E1] transition-colors cursor-pointer ${
                                          les.visible
                                            ? 'hover:bg-[#E8EEE8] text-[#407B5D]'
                                            : 'bg-zinc-100 text-zinc-400'
                                        }`}
                                        title={les.visible ? 'Ocultar lección' : 'Mostrar lección'}
                                      >
                                        {les.visible ? (
                                          <Eye className="w-3.5 h-3.5" />
                                        ) : (
                                          <EyeOff className="w-3.5 h-3.5" />
                                        )}
                                      </button>

                                      <button
                                        onClick={() => runAction(() => handleDuplicateLesson(les.id))}
                                        className="p-1.5 rounded-lg border border-[#E1E7E1] hover:bg-[#E8EEE8] text-[#59645C] cursor-pointer"
                                        title="Duplicar lección"
                                      >
                                        <Copy className="w-3.5 h-3.5" />
                                      </button>

                                      <button
                                        onClick={() => setEditingLesson(les)}
                                        className="min-h-[32px] px-3 py-1 rounded-xl bg-[#407B5D] hover:bg-[#33654C] text-white text-xs font-semibold flex items-center gap-1 cursor-pointer shadow-xs"
                                      >
                                        <Edit3 className="w-3 h-3" />
                                        <span>Editar Contenido</span>
                                      </button>

                                      <button
                                        onClick={() => runAction(() => handleDeleteLesson(les.id))}
                                        className="p-1.5 rounded-lg border border-[#E1E7E1] hover:bg-red-50 text-red-600 cursor-pointer"
                                        title="Archivar lección"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </div>
                                ))}
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
          )}

          {/* ========================================================================= */}
          {/* TAB 2: RESUMEN Y ESTADÍSTICAS                                             */}
          {/* ========================================================================= */}
          {activeTab === 'overview' && evidenceReady && historyReady && !evidenceLoading && !historyLoading && !evidenceError && !historyError && (
            <div className="space-y-6">
              {/* Metrics cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-5 bg-white border border-[#E1E7E1] rounded-2xl space-y-1 shadow-xs">
                  <span className="text-xs text-[#59645C] font-semibold block">Total Módulos</span>
                  <span className="text-2xl sm:text-3xl font-bold text-[#232A24] font-mono">
                    {modules.length}
                  </span>
                  <span className="text-[11px] text-[#407B5D] block">
                    {modules.filter((m) => m.status === 'published').length} publicados
                  </span>
                </div>

                <div className="p-5 bg-white border border-[#E1E7E1] rounded-2xl space-y-1 shadow-xs">
                  <span className="text-xs text-[#59645C] font-semibold block">Total Lecciones</span>
                  <span className="text-2xl sm:text-3xl font-bold text-[#232A24] font-mono">
                    {lessons.length}
                  </span>
                  <span className="text-[11px] text-[#407B5D] block">
                    {lessons.filter((l) => l.status === 'published').length} publicadas
                  </span>
                </div>

                <div className="p-5 bg-white border border-[#E1E7E1] rounded-2xl space-y-1 shadow-xs">
                  <span className="text-xs text-[#59645C] font-semibold block">En Borrador</span>
                  <span className="text-2xl sm:text-3xl font-bold text-[#8A6318] font-mono">
                    {lessons.filter((l) => l.status === 'draft').length}
                  </span>
                  <span className="text-[11px] text-[#8A6318] block">Ediciones privadas</span>
                </div>

                <div className="p-5 bg-white border border-[#E1E7E1] rounded-2xl space-y-1 shadow-xs">
                  <span className="text-xs text-[#59645C] font-semibold block">Recursos Media</span>
                  <span className="text-2xl sm:text-3xl font-bold text-[#232A24] font-mono">
                    {mediaList.length}
                  </span>
                  <span className="text-[11px] text-[#59645C] block">Diagramas & assets</span>
                </div>
              </div>

              {/* Quick Actions Panel */}
              <div className="p-6 bg-white border border-[#E1E7E1] rounded-2xl space-y-4 shadow-xs">
                <h3 className="text-sm font-bold text-[#232A24]">
                  Acciones Rápidas del Administrador
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    onClick={handleOpenNewModule}
                    className="p-4 rounded-xl border border-[#E1E7E1] hover:border-[#407B5D] hover:bg-[#E8EEE8]/40 transition-colors text-left space-y-1 cursor-pointer"
                  >
                    <Plus className="w-5 h-5 text-[#407B5D]" />
                    <span className="font-bold text-xs text-[#232A24] block">Crear Módulo</span>
                    <span className="text-[11px] text-[#59645C] block">
                      Añade un nuevo conjunto temático al curso.
                    </span>
                  </button>

                  <button
                    onClick={() => runAction(handleExportBackup)}
                    className="p-4 rounded-xl border border-[#E1E7E1] hover:border-[#407B5D] hover:bg-[#E8EEE8]/40 transition-colors text-left space-y-1 cursor-pointer"
                  >
                    <Download className="w-5 h-5 text-[#407B5D]" />
                    <span className="font-bold text-xs text-[#232A24] block">Exportar Curriculum</span>
                    <span className="text-[11px] text-[#59645C] block">
                      Descarga todo el contenido en archivo JSON estructurado.
                    </span>
                  </button>

                  <label className="p-4 rounded-xl border border-[#E1E7E1] hover:border-[#407B5D] hover:bg-[#E8EEE8]/40 transition-colors text-left space-y-1 cursor-pointer block">
                    <Upload className="w-5 h-5 text-[#407B5D]" />
                    <span className="font-bold text-xs text-[#232A24] block">Restaurar Respaldo</span>
                    <span className="text-[11px] text-[#59645C] block">
                      Importa un archivo JSON de respaldo previo.
                    </span>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportBackup}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: TEXTOS GENERALES (Site Content)                                   */}
          {/* ========================================================================= */}
          {activeTab === 'site_texts' && (
            <div className="p-6 bg-white border border-[#E1E7E1] rounded-2xl space-y-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E1E7E1] pb-4">
                <div>
                  <h3 className="text-base font-bold text-[#232A24]">
                    Textos Generales y Contenido Editorial del Sitio
                  </h3>
                  <p className="text-xs text-[#59645C]">
                    Modifica los encabezados principales, mensajes de bienvenida y textos del pie de página sin tocar código.
                  </p>
                </div>
                <button
                  onClick={() => runAction(handleSaveAllSiteTexts)}
                  className="min-h-[38px] px-4 py-2 rounded-xl bg-[#407B5D] hover:bg-[#33654C] text-xs font-semibold text-white flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs shrink-0"
                >
                  <Save className="w-4 h-4" />
                  <span>Guardar todos los textos</span>
                </button>
              </div>

              <div className="p-4 bg-[#E8EEE8] border border-[#A4C4B5] rounded-2xl space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-sm text-[#232A24]">Configuración visible de la portada</h4>
                    <p className="text-[11px] text-[#59645C]">Decide qué bloques aparecen en el Home sin borrar su contenido.</p>
                  </div>
                  <div className="space-y-3 border-t border-[#A4C4B5] pt-4">
                    <p className="text-xs font-bold text-[#232A24]">Configuración del Footer</p>
                    <label className="flex items-center gap-2 text-xs text-[#59645C]">
                      <input type="checkbox" checked={homeConfig.footer.visible} onChange={(event) => setHomeConfig((current) => ({ ...current, footer: { ...current.footer, visible: event.target.checked } }))} />
                      Mostrar Footer
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {([
                        ['brand', 'Marca'],
                        ['technology', 'Tecnología / versión'],
                      ] as const).map(([field, label]) => (
                        <input
                          key={field}
                          value={homeConfig.footer[field]}
                          onChange={(event) => setHomeConfig((current) => ({ ...current, footer: { ...current.footer, [field]: event.target.value } }))}
                          placeholder={label}
                          className="w-full px-3 py-2 rounded-lg border border-[#E1E7E1] text-xs"
                        />
                      ))}
                    </div>
                    <textarea
                      value={homeConfig.footer.text}
                      onChange={(event) => setHomeConfig((current) => ({ ...current, footer: { ...current.footer, text: event.target.value } }))}
                      placeholder="Texto del Footer"
                      rows={2}
                      className="w-full px-3 py-2 rounded-lg border border-[#E1E7E1] text-xs resize-y"
                    />
                    <div className="flex flex-wrap gap-3">
                      {([
                        ['showHomeLink', 'Inicio'],
                        ['showDesignerLink', 'Diseñador'],
                        ['showUnitsLink', 'Unidades'],
                        ['showCatalogueLink', 'Temario'],
                        ['showOopLink', 'Laboratorio POO'],
                        ['showPilotLink', 'Exploraciones'],
                        ['showPrivacyLink', 'Aviso de Privacidad'],
                      ] as const).map(([field, label]) => (
                        <label key={field} className="flex items-center gap-1.5 text-[11px] text-[#59645C]">
                          <input type="checkbox" checked={homeConfig.footer[field] ?? true} onChange={(event) => setHomeConfig((current) => ({ ...current, footer: { ...current.footer, [field]: event.target.checked } }))} />
                          {label}
                        </label>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => runAction(handleSaveHomeConfig)}
                    className="min-h-[36px] px-3 py-2 rounded-xl bg-[#407B5D] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" /> Guardar portada
                  </button>
                </div>
                <AdminHomePresentationEditor
                  value={homeConfig.presentation}
                  lessons={lessons}
                  modules={modules}
                  onChange={(presentation) => setHomeConfig((current) => ({ ...current, presentation }))}
                />
                <label className="flex items-center gap-2 text-xs font-semibold text-[#232A24]">
                  <input type="checkbox" checked={homeConfig.showSectionNavigator !== false} onChange={(event) => setHomeConfig((current) => ({ ...current, showSectionNavigator: event.target.checked }))} />
                  Mostrar barra de filtros del laboratorio
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {([
                    ['hero', 'Hero y bienvenida'],
                    ['resume', 'Continuar lección'],
                    ['units', 'Unidades curriculares'],
                    ['pilot', 'Módulo piloto y caballo'],
                    ['topics', 'Temario de lecciones'],
                    ['tools', 'Herramientas de autoría'],
                    ['philosophy', 'Filosofía didáctica'],
                  ] as const).map(([id, label]) => (
                    <label key={id} className="flex items-center gap-2 p-2.5 bg-white rounded-xl border border-[#E1E7E1] text-xs font-semibold text-[#232A24] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={homeConfig.sections[id]}
                        onChange={(event) => setHomeConfig((current) => ({
                          ...current,
                          sections: { ...current.sections, [id]: event.target.checked },
                        }))}
                      />
                      {label}
                    </label>
                  ))}
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-bold text-[#232A24]">Lecciones destacadas</p>
                  <p className="text-[11px] text-[#59645C]">Si seleccionas alguna, el Home mostrará solo esas lecciones en el temario. Sin selección, muestra todas.</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                    {lessons.map((lesson) => {
                      const selected = homeConfig.featuredTopicIds.includes(lesson.id);
                      return (
                        <label key={lesson.id} className="flex items-center gap-2 p-2 bg-white rounded-lg border border-[#E1E7E1] text-[11px] text-[#232A24] cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={(event) => setHomeConfig((current) => ({
                              ...current,
                              featuredTopicIds: event.target.checked
                                ? [...current.featuredTopicIds, lesson.id]
                                : current.featuredTopicIds.filter((id) => id !== lesson.id),
                            }))}
                          />
                          <span className="truncate">{lesson.title}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
                <div className="space-y-3">
                  <p className="text-xs font-bold text-[#232A24]">Contenido editorial de los pilares</p>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                    {([
                      ['units', 'Pilar 1 · Unidades'],
                      ['pilot', 'Pilar 2 · Módulo piloto'],
                      ['topics', 'Pilar 3 · Temario'],
                      ['tools', 'Pilar 4 · Herramientas'],
                      ['philosophy', 'Pilar 5 · Filosofía'],
                    ] as const).map(([id, label]) => (
                      <div key={id} className="p-3 bg-white border border-[#E1E7E1] rounded-xl space-y-2">
                        <span className="text-[11px] font-bold uppercase tracking-wide text-[#407B5D]">{label}</span>
                        <input
                          value={homeConfig.pillars[id].title}
                          onChange={(event) => setHomeConfig((current) => ({
                            ...current,
                            pillars: {
                              ...current.pillars,
                              [id]: { ...current.pillars[id], title: event.target.value },
                            },
                          }))}
                          placeholder="Título del pilar"
                          className="w-full px-3 py-2 rounded-lg border border-[#E1E7E1] text-xs outline-none focus:border-[#407B5D]"
                        />
                        <textarea
                          value={homeConfig.pillars[id].description}
                          onChange={(event) => setHomeConfig((current) => ({
                            ...current,
                            pillars: {
                              ...current.pillars,
                              [id]: { ...current.pillars[id], description: event.target.value },
                            },
                          }))}
                          placeholder="Descripción y propósito del pilar"
                          rows={3}
                          className="w-full px-3 py-2 rounded-lg border border-[#E1E7E1] text-xs outline-none resize-y focus:border-[#407B5D]"
                        />
                        <div className="flex items-center justify-between gap-2 pt-1">
                          <label className="flex items-center gap-2 text-[11px] text-[#59645C]">
                            <input
                              type="checkbox"
                              checked={homeConfig.pillars[id].showDefaultContent}
                              onChange={(event) => updateHomePillar(id, { showDefaultContent: event.target.checked })}
                            />
                            Mostrar contenido predeterminado
                          </label>
                          <button
                            type="button"
                            onClick={() => updateHomePillar(id, {
                              blocks: [...homeConfig.pillars[id].blocks, {
                                id: `home_block_${Date.now()}`,
                                type: 'text',
                                title: 'Nuevo bloque',
                                text: 'Escribe aquí el contenido de este bloque.',
                                columns: 1,
                                visible: true,
                                position: homeConfig.pillars[id].blocks.length,
                              }],
                            })}
                            className="px-2.5 py-1.5 rounded-lg border border-[#407B5D] text-[#407B5D] text-[11px] font-semibold cursor-pointer"
                          >
                            + Agregar bloque
                          </button>
                        </div>
                        {homeConfig.pillars[id].blocks.map((block, blockIndex) => (
                          <div key={block.id} className="p-3 bg-[#F7F8F4] border border-[#E1E7E1] rounded-lg space-y-2">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[11px] font-bold text-[#232A24]">Bloque {blockIndex + 1}</span>
                              <button
                                type="button"
                                onClick={() => updateHomePillar(id, { blocks: homeConfig.pillars[id].blocks.filter((item) => item.id !== block.id) })}
                                className="text-[11px] text-[#A4473D] cursor-pointer"
                              >
                                Eliminar
                              </button>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <select
                                value={block.type}
                                onChange={(event) => updateHomePillar(id, {
                                  blocks: homeConfig.pillars[id].blocks.map((item) => item.id === block.id ? { ...item, type: event.target.value as typeof block.type } : item),
                                })}
                                className="px-2 py-2 rounded-lg border border-[#E1E7E1] text-[11px] bg-white"
                              >
                                <option value="text">Bloque de texto</option>
                                <option value="modules">Módulos educativos</option>
                                <option value="categories">Categorías</option>
                                <option value="lessons">Lecciones</option>
                                <option value="tools">Herramientas</option>
                              </select>
                              <input
                                value={block.title}
                                onChange={(event) => updateHomePillar(id, { blocks: homeConfig.pillars[id].blocks.map((item) => item.id === block.id ? { ...item, title: event.target.value } : item) })}
                                placeholder="Título del bloque"
                                className="px-2 py-2 rounded-lg border border-[#E1E7E1] text-[11px]"
                              />
                            </div>
                            <textarea
                              value={block.text || ''}
                              onChange={(event) => updateHomePillar(id, { blocks: homeConfig.pillars[id].blocks.map((item) => item.id === block.id ? { ...item, text: event.target.value } : item) })}
                              placeholder="Texto introductorio o instrucciones"
                              rows={2}
                              className="w-full px-2 py-2 rounded-lg border border-[#E1E7E1] text-[11px] resize-y"
                            />
                            {block.type !== 'text' && block.type !== 'tools' && (
                              <div className="space-y-1.5">
                                <p className="text-[10px] text-[#59645C]">Selecciona elementos específicos o deja todo sin marcar para mostrar todos.</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 max-h-28 overflow-y-auto">
                                  {(block.type === 'modules' ? modules : block.type === 'categories' ? categories : lessons).map((item) => {
                                    const selected = (block.sourceIds || []).includes(item.id);
                                    return (
                                      <label key={item.id} className="flex items-center gap-1.5 text-[10px] text-[#59645C]">
                                        <input
                                          type="checkbox"
                                          checked={selected}
                                          onChange={(event) => updateHomePillar(id, {
                                            blocks: homeConfig.pillars[id].blocks.map((currentBlock) => currentBlock.id === block.id
                                              ? {
                                                ...currentBlock,
                                                sourceIds: event.target.checked
                                                  ? [...(currentBlock.sourceIds || []), item.id]
                                                  : (currentBlock.sourceIds || []).filter((sourceId) => sourceId !== item.id),
                                              }
                                              : currentBlock),
                                          })}
                                        />
                                        <span className="truncate">{'title' in item ? item.title : item.name}</span>
                                      </label>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                            <label className="flex items-center gap-2 text-[11px] text-[#59645C]">
                              <input
                                type="checkbox"
                                checked={block.visible}
                                onChange={(event) => updateHomePillar(id, { blocks: homeConfig.pillars[id].blocks.map((item) => item.id === block.id ? { ...item, visible: event.target.checked } : item) })}
                              />
                              Bloque visible
                            </label>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Grouped by Section */}
              {[
                {
                  sectionTitle: '1. Portada y Hero Principal',
                  sectionSubtitle: 'Títulos, subtítulos y etiquetas de bienvenida en la página principal',
                  keys: ['hero_badge', 'hero_headline', 'hero_subtitle'],
                },
                {
                  sectionTitle: '2. Pensamiento Generativo',
                  sectionSubtitle: 'Pregunta rectora y cadena de principios pedagógicos',
                  keys: ['generative_question', 'generative_principles'],
                },
                {
                  sectionTitle: '3. Laboratorios y Módulos Prácticos',
                  sectionSubtitle: 'Tarjetas destacadas del Laboratorio de Objetos y el Taller',
                  keys: ['oop_lab_title', 'oop_lab_summary', 'workshop_title', 'workshop_summary'],
                },
                {
                  sectionTitle: '4. Filosofía Didáctica',
                  sectionSubtitle: 'Sección inspirada en Generative Design y pie de página',
                  keys: ['philosophy_title', 'footer_text'],
                },
              ].map((grp, gIdx) => (
                <div key={gIdx} className="space-y-3 pt-2">
                  <div className="border-b border-[#E1E7E1] pb-1.5">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-[#407B5D]">
                      {grp.sectionTitle}
                    </h4>
                    <p className="text-[11px] text-[#59645C]">{grp.sectionSubtitle}</p>
                  </div>

                  <div className="space-y-3">
                    {grp.keys.map((key) => {
                      const item = siteContent[key] || {
                        key,
                        title: key,
                        section: 'general',
                        content: '',
                        updatedAt: new Date().toISOString(),
                      };
                      const currentVal = siteTextDrafts[key] ?? item.content;
                      const isSaving = Boolean(savingTextKeys[key]);
                      const isDirty = siteTextDrafts[key] !== undefined && siteTextDrafts[key] !== item.content;

                      return (
                        <div
                          key={key}
                          className="p-4 bg-[#F7F8F4] border border-[#E1E7E1] rounded-2xl space-y-2.5 text-xs shadow-xs"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-[#232A24] text-xs">
                                {item.title}
                              </span>
                              <span className="font-mono text-[10px] text-[#59645C] bg-white border border-[#E1E7E1] px-1.5 py-0.5 rounded-md">
                                {item.key}
                              </span>
                              {isDirty && (
                                <span className="text-[10px] font-semibold text-[#8A6318] bg-[#FFF9EE] border border-[#E6C687] px-1.5 py-0.5 rounded-md">
                                  Cambios sin guardar
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-[#59645C] font-mono">
                              Actualizado: {new Date(item.updatedAt).toLocaleDateString()}
                            </span>
                          </div>

                          <textarea
                            rows={item.content.length > 90 ? 3 : 2}
                            value={currentVal}
                            onChange={(e) =>
                              setSiteTextDrafts((prev) => ({
                                ...prev,
                                [key]: e.target.value,
                              }))
                            }
                            className="w-full p-3 bg-white border border-[#E1E7E1] focus:border-[#407B5D] rounded-xl text-xs text-[#232A24] focus:outline-none transition-colors"
                          />

                          <div className="flex items-center justify-between pt-1">
                            <span className="text-[11px] text-[#59645C]">
                              Se actualiza inmediatamente en la portada para todos los visitantes.
                            </span>

                            <div className="flex items-center gap-2">
                              {isDirty && (
                                <button
                                  type="button"
                                  onClick={() => handleResetSiteText(key)}
                                  className="min-h-[30px] px-2.5 py-1 text-[11px] text-[#59645C] hover:text-[#232A24] bg-white border border-[#E1E7E1] rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                                >
                                  <RotateCcw className="w-3 h-3" />
                                  <span>Restablecer</span>
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => runAction(() => handleSaveSiteText(key, currentVal))}
                                disabled={isSaving}
                                className={`min-h-[32px] px-3.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs ${
                                  isDirty
                                    ? 'bg-[#407B5D] hover:bg-[#33654C] text-white'
                                    : 'bg-white hover:bg-[#E8EEE8] border border-[#E1E7E1] text-[#232A24]'
                                }`}
                              >
                                {isSaving ? (
                                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <Save className="w-3.5 h-3.5" />
                                )}
                                <span>{isSaving ? 'Guardando...' : 'Guardar este texto'}</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 4: RECURSOS MULTIMEDIA                                               */}
          {/* ========================================================================= */}
          {activeTab === 'media' && (
            <div className="p-6 bg-white border border-[#E1E7E1] rounded-2xl space-y-5 shadow-xs">
              <div className="flex items-center justify-between border-b border-[#E1E7E1] pb-3">
                <div>
                  <h3 className="text-base font-bold text-[#232A24]">
                    Biblioteca de Recursos Multimedia
                  </h3>
                  <p className="text-xs text-[#59645C]">
                    Las imágenes nuevas se comparten automáticamente con cualquier persona que tenga el enlace, solo como lector. Los demás archivos conservan sus permisos.
                  </p>
                </div>
                <button
                  onClick={() => setIsMediaModalOpen(true)}
                  className="min-h-[38px] px-4 py-2 rounded-xl bg-[#407B5D] hover:bg-[#33654C] text-xs font-semibold text-white flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Registrar Recurso</span>
                </button>
                <label className="min-h-[38px] px-4 py-2 rounded-xl border border-[#407B5D] text-[#407B5D] text-xs font-semibold flex items-center gap-1.5 cursor-pointer">
                  <Upload className="w-4 h-4" />
                  <span>Subir a Drive</span>
                  <input type="file" className="hidden" onChange={handleUploadToDrive} accept="image/*,audio/*,video/*,.pdf,.pde,.zip" />
                </label>
                {(
                  <button
                    onClick={handleConnectDrive}
                    className="min-h-[38px] px-4 py-2 rounded-xl border border-[#407B5D] text-[#407B5D] text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    {isDriveConnected ? 'Renovar conexión Drive' : 'Conectar Drive'}
                  </button>
                )}
                {isDriveConnected && <span className="min-h-[38px] px-4 py-2 rounded-xl bg-[#E8EEE8] text-[#28543D] border border-[#A4C4B5] text-xs font-semibold flex items-center">Drive conectado</span>}
              </div>

              {mediaList.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#59645C] bg-[#F7F8F4] rounded-2xl border border-dashed border-[#E1E7E1]">
                  No hay recursos multimedia registrados aún. Pulsa &quot;Registrar Recurso&quot;.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {mediaList.map((m) => (
                    <div
                      key={m.id}
                      className="p-3 bg-[#F7F8F4] border border-[#E1E7E1] rounded-2xl space-y-2 text-xs shadow-xs"
                    >
                      <div className="aspect-video bg-white rounded-xl border border-[#E1E7E1] overflow-hidden flex items-center justify-center">
                        {mediaResourceKind(m) === 'image' ? (
                          <MediaImage
                            src={mediaResourceUrl(m)}
                            alt={m.altText || m.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="text-center text-[#59645C] p-3">
                            <FileText className="w-8 h-8 mx-auto mb-2 text-[#407B5D]" />
                            <span className="text-[11px] font-semibold">{m.mimeType || m.category || 'Recurso'}</span>
                          </div>
                        )}
                      </div>
                      <div className="space-y-0.5">
                        <span className="font-bold text-[#232A24] block truncate">
                          {m.title}
                        </span>
                        <span className="text-[10px] text-[#59645C] font-mono block truncate">
                          {m.url}
                        </span>
                      </div>
                      {m.drivePublicRead && <p className="text-[11px] font-semibold text-[#407B5D]">Pública por enlace · Lector</p>}
                      {m.driveSharingError && <p className="text-[11px] text-[#9A5A18]">{m.driveSharingError}</p>}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-[#E1E7E1]">
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(mediaResourceUrl(m));
                            showToast('Enlace copiado al portapapeles');
                          }}
                          className="text-[11px] font-semibold text-[#407B5D] hover:underline cursor-pointer"
                        >
                          Copiar URL
                        </button>
                        {m.provider === 'google-drive' && mediaResourceKind(m) === 'image' && <button type="button" disabled={isWorking} onClick={() => runAction(() => handlePublishDriveImage(m))} className="text-[11px] font-semibold text-[#407B5D] hover:underline disabled:opacity-40">{m.drivePublicRead ? 'Comprobar lectura pública' : 'Hacer pública (lector)'}</button>}
                        <button type="button" onClick={() => setPreviewMedia(m)} className="text-[11px] font-semibold text-[#407B5D] hover:underline">Consultar</button>
                        {mediaResourceUrl(m) && (
                          <a
                            href={mediaResourceUrl(m)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] font-semibold text-[#407B5D] hover:underline"
                          >
                            Abrir
                          </a>
                        )}
                        <button
                          onClick={() => runAction(() => handleDeleteMedia(m.id))}
                          className="p-1 text-red-500 hover:text-red-700 cursor-pointer"
                          title="Eliminar recurso"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 5: HISTORIAL Y RESPALDOS                                             */}
          {/* ========================================================================= */}
          {activeTab === 'history' && historyReady && !historyLoading && !historyError && (
            <div className="p-6 bg-white border border-[#E1E7E1] rounded-2xl space-y-5 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E1E7E1] pb-3">
                <div>
                  <h3 className="text-base font-bold text-[#232A24]">
                    Historial de Revisiones & Respaldos
                  </h3>
                  <p className="text-xs text-[#59645C]">
                    Registro cronológico de publicaciones, exportaciones y puntos de restauración.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => runAction(handleExportBackup)}
                    className="min-h-[38px] px-4 py-2 rounded-xl bg-white hover:bg-[#E8EEE8] border border-[#E1E7E1] text-[#232A24] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  >
                    <Download className="w-4 h-4 text-[#407B5D]" />
                    <span>Descargar Respaldo JSON</span>
                  </button>
                </div>
              </div>

              {revisions.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#59645C] bg-[#F7F8F4] rounded-2xl border border-dashed border-[#E1E7E1]">
                  Aún no se han generado revisiones editoriales en esta sesión.
                </div>
              ) : (
                <div className="space-y-2">
                  {revisions.map((rev) => (
                    <div
                      key={rev.id}
                      className="p-3.5 bg-[#F7F8F4] border border-[#E1E7E1] rounded-xl flex items-center justify-between text-xs"
                    >
                      <div className="space-y-0.5">
                        <span className="font-bold text-[#232A24] block">
                          {rev.note || 'Instantánea editorial'}
                        </span>
                        <div className="flex items-center gap-2 text-[10px] text-[#59645C] font-mono">
                          <span>{rev.createdBy || 'Admin'}</span>
                          <span>·</span>
                          <span>{new Date(rev.createdAt).toLocaleString()}</span>
                          <span>·</span>
                          <span>Tipo: {rev.entityType}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 6: EVIDENCIAS DE ESTUDIANTES (PILOTO)                                 */}
          {/* ========================================================================= */}
          {activeTab === 'evidences' && evidenceReady && !evidenceLoading && !evidenceError && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E1E7E1] pb-4">
                <div>
                  <h3 className="text-base font-bold text-[#232A24]">
                    Evidencias de Estudiantes · Exploraciones con Processing
                  </h3>
                  <p className="text-xs text-[#59645C]">
                    Revisa las hipótesis, código Processing Java escrito, pruebas de frontera y reflexiones pedagógicas registradas por los estudiantes.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center border border-[#E1E7E1] bg-white rounded-xl p-1 text-xs">
                    <button
                      onClick={() => setEvidenceFilter('all')}
                      className={`px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                        evidenceFilter === 'all'
                          ? 'bg-[#407B5D] text-white'
                          : 'text-[#59645C] hover:text-[#232A24]'
                      }`}
                    >
                      Todos ({evidenceList.length})
                    </button>
                    <button
                      onClick={() => setEvidenceFilter('coordinates')}
                      className={`px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                        evidenceFilter === 'coordinates'
                          ? 'bg-[#407B5D] text-white'
                          : 'text-[#59645C] hover:text-[#232A24]'
                      }`}
                    >
                      01. Coordenadas ({evidenceList.filter((e) => e.exerciseId === 'coordinates').length})
                    </button>
                    <button
                      onClick={() => setEvidenceFilter('conditionals')}
                      className={`px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                        evidenceFilter === 'conditionals'
                          ? 'bg-[#407B5D] text-white'
                          : 'text-[#59645C] hover:text-[#232A24]'
                      }`}
                    >
                      02. Condicionales ({evidenceList.filter((e) => e.exerciseId === 'conditionals').length})
                    </button>
                  </div>
                </div>
              </div>

              {evidenceList.filter((e) => evidenceFilter === 'all' || e.exerciseId === evidenceFilter).length === 0 ? (
                <div className="p-8 text-center text-xs text-[#59645C] bg-[#F7F8F4] rounded-2xl border border-dashed border-[#E1E7E1] space-y-2">
                  <FileCheck className="w-8 h-8 text-[#8E8E89] mx-auto opacity-50" />
                  <p className="font-semibold">No se encontraron evidencias registradas para este filtro.</p>
                  <p className="text-[11px] text-[#8E8E89]">
                    Cuando los estudiantes completen los ejercicios en &quot;Exploraciones con Processing&quot; y guarden su avance, aparecerán aquí automáticamente.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {evidenceList
                    .filter((e) => evidenceFilter === 'all' || e.exerciseId === evidenceFilter)
                    .map((ev) => {
                      const isCoord = ev.exerciseId === 'coordinates';
                      const coordData = isCoord ? (ev.data as CoordinateEvidence) : null;
                      const condData = !isCoord ? (ev.data as ConditionalEvidence) : null;

                      return (
                        <div
                          key={ev.id}
                          className="p-5 bg-white border border-[#E1E7E1] rounded-2xl shadow-xs space-y-4 hover:border-[#407B5D]/60 transition-all"
                        >
                          {/* Header bar */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E1E7E1] pb-3">
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-md ${
                                    isCoord ? 'bg-[#E8EEE8] text-[#407B5D]' : 'bg-[#EBF1FA] text-[#2868D9]'
                                  }`}
                                >
                                  {isCoord ? 'EJERCICIO 01 · COORDENADAS' : 'EJERCICIO 02 · CONDICIONALES'}
                                </span>
                                <span className="text-xs font-bold text-[#232A24]">
                                  {ev.userName} ({ev.userEmail})
                                </span>
                              </div>
                              <span className="text-[11px] text-[#59645C] font-mono">
                                Enviado: {new Date(ev.submittedAt).toLocaleString()} · Etapa: {ev.data.currentStage || 'documentar'}
                              </span>
                            </div>

                            <span
                              className={`text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 ${
                                ev.data.completed
                                  ? 'bg-[#E8EEE8] text-[#407B5D]'
                                  : 'bg-[#FFF9EE] text-[#8A6318]'
                              }`}
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>{ev.data.completed ? 'Completado al 100%' : 'En Progreso'}</span>
                            </span>
                          </div>

                          {/* Content details grid */}
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-xs">
                            {/* Left Column: Prediction & Reflections */}
                            <div className="space-y-3">
                              <div className="p-3 bg-[#F7F8F4] border border-[#E1E7E1] rounded-xl space-y-1">
                                <span className="font-bold text-[#232A24] block">1. Predicción del Estudiante:</span>
                                <p className="text-[#59645C] leading-relaxed">
                                  {ev.data.prediction || 'Sin respuesta de predicción.'}
                                </p>
                              </div>

                              <div className="p-3 bg-[#F7F8F4] border border-[#E1E7E1] rounded-xl space-y-1">
                                <span className="font-bold text-[#232A24] block">2. Reflexión Escrita:</span>
                                <p className="text-[#59645C] leading-relaxed">
                                  {ev.data.reflection || 'Sin reflexión registrada.'}
                                </p>
                              </div>

                              {/* Testing verification indicators */}
                              {isCoord && coordData && (
                                <div className="p-3 bg-[#F7F8F4] border border-[#E1E7E1] rounded-xl space-y-1.5">
                                  <span className="font-bold text-[#232A24] block">Metas de Coordenadas:</span>
                                  <div className="grid grid-cols-3 gap-2 font-mono text-[10px]">
                                    <div className={`p-1.5 rounded text-center font-bold ${coordData.targetHits?.circleAtCenter ? 'bg-[#E8EEE8] text-[#407B5D]' : 'bg-white text-[#8E8E89]'}`}>
                                      Centro: {coordData.targetHits?.circleAtCenter ? '✓' : '✗'}
                                    </div>
                                    <div className={`p-1.5 rounded text-center font-bold ${coordData.targetHits?.rectAtZone ? 'bg-[#E8EEE8] text-[#407B5D]' : 'bg-white text-[#8E8E89]'}`}>
                                      Rect (100,80): {coordData.targetHits?.rectAtZone ? '✓' : '✗'}
                                    </div>
                                    <div className={`p-1.5 rounded text-center font-bold ${coordData.targetHits?.lineAcross ? 'bg-[#E8EEE8] text-[#407B5D]' : 'bg-white text-[#8E8E89]'}`}>
                                      Línea Y=200: {coordData.targetHits?.lineAcross ? '✓' : '✗'}
                                    </div>
                                  </div>
                                </div>
                              )}

                              {!isCoord && condData && condData.boundaryTests && (
                                <div className="p-3 bg-[#F7F8F4] border border-[#E1E7E1] rounded-xl space-y-1.5">
                                  <span className="font-bold text-[#232A24] block">Pruebas de Límites Ejecutadas:</span>
                                  <div className="grid grid-cols-3 gap-1.5 font-mono text-[10px]">
                                    {[199, 200, 201, 399, 400, 401].map((bx) => {
                                      const t = condData.boundaryTests[bx];
                                      return (
                                        <div
                                          key={bx}
                                          className={`p-1 rounded text-center ${
                                            t?.passed ? 'bg-[#E8EEE8] text-[#407B5D] font-bold' : 'bg-white text-[#8E8E89]'
                                          }`}
                                        >
                                          X={bx}: {t?.passed ? 'OK ✓' : 'Pendiente'}
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Right Column: Processing Java Code Written */}
                            <div className="space-y-1.5">
                              <span className="font-bold text-[#232A24] block">Código Processing Java Enviado:</span>
                              <pre className="p-3 bg-[#141414] text-[#FAF9F5] border border-[#232A24] rounded-xl font-mono text-[11px] leading-relaxed overflow-x-auto max-h-[220px]">
                                <code>{ev.data.code || '// Sin código'}</code>
                              </pre>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          )}
          </>}
        </div>
      </div>

      {/* Module Edit/Create Modal */}
      {isModuleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white border border-[#E1E7E1] rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-[#232A24] border-b border-[#E1E7E1] pb-2">
              {moduleForm.id ? 'Configurar Módulo' : 'Nuevo Módulo'}
            </h3>

            {actionError && <p role="alert" className="text-sm text-[#8A6318]">{actionError}</p>}
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-[#232A24] block mb-1">
                  Título del Módulo:
                </label>
                <input
                  type="text"
                  value={moduleForm.title || ''}
                  onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })}
                  placeholder="Ej. Módulo 01: Lienzo y Ciclo de Vida"
                  className="w-full px-3 py-2 bg-[#F7F8F4] border border-[#E1E7E1] rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-[#232A24] block mb-1">
                  Categoría curricular:
                </label>
                <select
                  value={moduleForm.category || 'Fundamentos'}
                  onChange={(e) => setModuleForm({ ...moduleForm, category: e.target.value })}
                  className="w-full px-3 py-2 bg-[#F7F8F4] border border-[#E1E7E1] rounded-xl text-xs"
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.name}>{category.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-[#232A24] block mb-1">
                  Descripción pedagógica:
                </label>
                <textarea
                  rows={3}
                  value={moduleForm.description || ''}
                  onChange={(e) =>
                    setModuleForm({ ...moduleForm, description: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-[#F7F8F4] border border-[#E1E7E1] rounded-xl text-xs"
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#E1E7E1]">
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-[#232A24]">
                  <input
                    type="checkbox"
                    checked={moduleForm.visible ?? true}
                    onChange={(e) =>
                      setModuleForm({ ...moduleForm, visible: e.target.checked })
                    }
                    className="w-4 h-4 rounded text-[#407B5D] accent-[#407B5D]"
                  />
                  <span>Módulo Visible</span>
                </label>

                <select
                  value={moduleForm.status || 'published'}
                  onChange={(e) =>
                    setModuleForm({ ...moduleForm, status: e.target.value as any })
                  }
                  className="px-2.5 py-1 bg-[#F7F8F4] border border-[#E1E7E1] rounded-lg text-xs"
                >
                  <option value="published">Publicado</option>
                  <option value="draft">Borrador</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E1E7E1]">
              <button
                onClick={() => setIsModuleModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-[#E1E7E1] text-xs font-semibold text-[#59645C] hover:bg-[#F7F8F4] cursor-pointer"
              >
                Cancelar
              </button>
              <button
                disabled={isWorking}
                onClick={() => runAction(handleSaveModuleModal)}
                className="px-5 py-2 rounded-xl bg-[#407B5D] hover:bg-[#33654C] text-xs font-semibold text-white cursor-pointer shadow-xs"
              >
                {isWorking ? 'Guardando…' : 'Guardar Módulo'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Media Registration Modal */}
      {previewMedia && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <section role="dialog" aria-modal="true" aria-label="Consultar recurso multimedia" className="max-h-[90vh] w-full max-w-4xl space-y-4 overflow-auto rounded-2xl bg-white p-5">
          <div className="flex items-center justify-between gap-3"><h3 className="text-base font-bold">{previewMedia.title}</h3><button type="button" autoFocus onClick={() => setPreviewMedia(null)} className="rounded-lg border px-3 py-2 text-xs">Cerrar consulta</button></div>
          {mediaResourceKind(previewMedia) === 'image' ? <MediaImage src={mediaResourceUrl(previewMedia)} alt={previewMedia.altText || previewMedia.title} className="mx-auto max-h-[65vh] max-w-full rounded-xl" /> : <CmsBlockView block={{ id: previewMedia.id, sectionId: 'media-preview', type: mediaResourceKind(previewMedia) === 'video' ? 'video' : previewMedia.provider === 'google-drive' ? 'iframe' : 'resources', content: mediaResourceUrl(previewMedia), caption: previewMedia.title, position: 0, createdAt: previewMedia.createdAt, updatedAt: previewMedia.createdAt }} />}
        </section>
      </div>}
      {isMediaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white border border-[#E1E7E1] rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-[#232A24] border-b border-[#E1E7E1] pb-2">
              Registrar Recurso Multimedia
            </h3>

            {actionError && <p role="alert" className="text-sm text-[#8A6318]">{actionError}</p>}
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-[#232A24] block mb-1">
                  Título del recurso:
                </label>
                <input
                  type="text"
                  value={mediaForm.title || ''}
                  onChange={(e) => setMediaForm({ ...mediaForm, title: e.target.value })}
                  placeholder="Ej. Diagrama de Flujo POO"
                  className="w-full px-3 py-2 bg-[#F7F8F4] border border-[#E1E7E1] rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-[#232A24] block mb-1">
                  URL de la imagen o diagrama:
                </label>
                <input
                  type="text"
                  value={mediaForm.url || ''}
                  onChange={(e) => setMediaForm({ ...mediaForm, url: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 bg-[#F7F8F4] border border-[#E1E7E1] rounded-xl font-mono text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-[#232A24] block mb-1">
                  Texto alternativo accesible:
                </label>
                <input
                  type="text"
                  value={mediaForm.altText || ''}
                  onChange={(e) => setMediaForm({ ...mediaForm, altText: e.target.value })}
                  placeholder="Descripción de la imagen"
                  className="w-full px-3 py-2 bg-[#F7F8F4] border border-[#E1E7E1] rounded-xl text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E1E7E1]">
              <button
                onClick={() => setIsMediaModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-[#E1E7E1] text-xs font-semibold text-[#59645C] hover:bg-[#F7F8F4] cursor-pointer"
              >
                Cancelar
              </button>
              <button
                disabled={isWorking}
                onClick={() => runAction(handleAddMedia)}
                className="px-5 py-2 rounded-xl bg-[#407B5D] hover:bg-[#33654C] text-xs font-semibold text-white cursor-pointer shadow-xs"
              >
                Guardar Recurso
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
