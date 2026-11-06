import React, { useEffect, useState } from 'react';
import { Save, Plus, Trash2, ExternalLink } from 'lucide-react';
import { CLASS_DESIGNER_STEPS, DEFAULT_CLASS_DESIGNER_CONTENT } from '../../data/classDesignerContent';
import type { ClassDesignerContent, ClassDesignerStepNumber } from '../../types/classDesignerContent';
import type { ClassDesignProject } from '../../types/classDesigner';
import { getClassDesignerContent, saveClassDesignerContent, instantiateClassDesignerTemplate } from '../../services/classDesignerContentService';
import { generateProcessingClassCode, importClassDesignFromJson } from '../../services/classDesignerService';
import { firebaseRuntime } from '../../config/firebaseRuntime';
import { ClassDesignerContentContext } from '../classDesigner/ClassDesignerContentContext';
import { Step1ObjectDefinition } from '../classDesigner/Step1ObjectDefinition';
import { Step2FieldsEditor } from '../classDesigner/Step2FieldsEditor';
import { Step3ConstructorEditor } from '../classDesigner/Step3ConstructorEditor';
import { Step4MethodsEditor } from '../classDesigner/Step4MethodsEditor';
import { Step5RelationsEditor } from '../classDesigner/Step5RelationsEditor';
import { ClassDesignerBlocksEditor } from './ClassDesignerBlocksEditor';

function ContentField({ label, value, onChange, multiline = false }: {
  label: string; value: string; onChange: (value: string) => void; multiline?: boolean;
}) {
  const className = 'w-full rounded-xl border border-[#E1E7E1] bg-white p-3 text-sm focus:border-[#407B5D] focus:outline-none';
  return <label className="block space-y-1.5 text-xs font-semibold text-[#232A24]">
    <span>{label}</span>
    {multiline ? <textarea className={className} rows={3} value={value} onChange={(event) => onChange(event.target.value)} />
      : <input className={className} value={value} onChange={(event) => onChange(event.target.value)} />}
  </label>;
}

function TemplateEditor({ project, onChange }: { project: ClassDesignProject; onChange: (project: ClassDesignProject) => void }) {
  const [step, setStep] = useState<ClassDesignerStepNumber>(1);
  const [importError, setImportError] = useState<string | null>(null);
  return <div className="space-y-4">
    <label className="block text-xs text-[#59645C]">También puedes cargar una estructura JSON exportada desde el diseñador:
      <input className="mt-2 block text-xs" type="file" accept=".json,application/json" onChange={async (event) => {
        const file = event.target.files?.[0];
        event.target.value = '';
        if (!file) return;
        try {
          const result = importClassDesignFromJson(await file.text());
          if (!result.project) throw new Error(result.error);
          onChange(result.project);
          setImportError(null);
        } catch (error) { setImportError(error instanceof Error ? error.message : 'No se pudo leer el archivo.'); }
      }} />
    </label>
    {importError && <p role="alert" className="text-xs text-red-800">{importError}</p>}
    <div className="flex flex-wrap gap-2" aria-label="Editar estructura de la plantilla">
      {CLASS_DESIGNER_STEPS.map((value) => <button key={value} type="button" aria-pressed={step === value}
        onClick={() => setStep(value)} className={`rounded-lg border px-3 py-2 text-xs ${step === value ? 'bg-[#407B5D] text-white' : 'bg-white'}`}>
        {value}. {['Objeto', 'Campos', 'Constructor', 'Métodos', 'Relaciones', 'Código'][value - 1]}
      </button>)}
    </div>
    <div className="rounded-2xl border border-[#E1E7E1] p-4">
      {step === 1 && <Step1ObjectDefinition project={project} onChange={onChange} />}
      {step === 2 && <Step2FieldsEditor project={project} onChange={onChange} />}
      {step === 3 && <Step3ConstructorEditor project={project} onChange={onChange} />}
      {step === 4 && <Step4MethodsEditor project={project} onChange={onChange} />}
      {step === 5 && <Step5RelationsEditor project={project} onChange={onChange} />}
      {step === 6 && <pre className="max-h-96 overflow-auto whitespace-pre text-xs">{generateProcessingClassCode(project)}</pre>}
    </div>
  </div>;
}

export function AdminClassDesignerContentView() {
  const [draft, setDraft] = useState<ClassDesignerContent>(() => structuredClone(DEFAULT_CLASS_DESIGNER_CONTENT));
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('default');

  const load = async () => {
    setLoading(true);
    setError(null);
    try { setDraft(await getClassDesignerContent()); setLoaded(true); }
    catch (failure) { setError(failure instanceof Error ? failure.message : 'No se pudo cargar el contenido.'); }
    finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, []);
  const change = (content: ClassDesignerContent) => { setDraft(content); setSaved(false); };
  const save = async () => {
    setSaving(true);
    setError(null);
    setSaved(false);
    try { await saveClassDesignerContent(draft); setSaved(true); }
    catch (failure) { setError(failure instanceof Error ? failure.message : 'No se pudo guardar el contenido.'); }
    finally { setSaving(false); }
  };
  if (loading) return <p role="status" className="text-sm">Cargando contenido del Diseñador POO…</p>;
  if (!loaded) return <div role="alert" className="space-y-3 text-sm text-red-800">
    <p>{error}</p><button onClick={() => { void load(); }} className="underline">Reintentar carga</button>
  </div>;

  const example = draft.examples.find((item) => item.id === selectedTemplate);
  const templateProject = example?.project ?? draft.defaultProject;
  const changeTemplate = (project: ClassDesignProject) => change(example
    ? { ...draft, examples: draft.examples.map((item) => item.id === example.id ? { ...item, project } : item) }
    : { ...draft, defaultProject: project });

  return <div className="space-y-5">
    <div className="flex flex-wrap items-start justify-between gap-3 rounded-2xl border border-[#E1E7E1] bg-white p-5">
      <div className="space-y-2">
        <h2 className="text-lg font-bold">Contenido del Diseñador POO</h2>
        <p className="max-w-xl text-xs text-[#59645C]">Edita las instrucciones que ven los estudiantes y las estructuras que pueden usar como punto de partida.</p>
        <p className="text-xs text-[#59645C]">Destino: {firebaseRuntime.useEmulators ? 'Firebase local' : 'Firebase de producción'}.</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <a href="#/herramientas" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-xl border px-3 py-2 text-xs">
          <ExternalLink className="h-4 w-4" />Abrir herramienta
        </a>
        <button disabled={saving} onClick={() => { void save(); }} className="flex items-center gap-2 rounded-xl bg-[#407B5D] px-4 py-2 text-xs font-bold text-white disabled:opacity-50">
          <Save className="h-4 w-4" />{saving ? 'Guardando…' : 'Guardar contenido'}
        </button>
      </div>
    </div>
    {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-xs text-red-800">{error}</p>}
    {saved && <p role="status" className="rounded-xl bg-[#E8EEE8] p-3 text-xs text-[#407B5D]">Contenido guardado. La herramienta ya recibe los cambios; las plantillas se aplican al crear un proyecto nuevo o cargar un ejemplo.</p>}
    <fieldset disabled={saving} className="space-y-5 disabled:opacity-70">
      <section className="space-y-4 rounded-2xl border border-[#E1E7E1] bg-white p-5">
        <h3 className="font-bold">Presentación</h3>
        <ContentField label="Título de la herramienta" value={draft.title} onChange={(title) => change({ ...draft, title })} />
        <ContentField label="Subtítulo" value={draft.subtitle} onChange={(subtitle) => change({ ...draft, subtitle })} />
        <ContentField label="Introducción" multiline value={draft.introduction} onChange={(introduction) => change({ ...draft, introduction })} />
        <ClassDesignerBlocksEditor label="Bloques de presentación" sectionId="class-designer-introduction" blocks={draft.blocks} onChange={(blocks) => change({ ...draft, blocks })} />
      </section>
      <section className="space-y-3 rounded-2xl border border-[#E1E7E1] bg-white p-5">
        <h3 className="font-bold">Instrucciones de las seis etapas</h3>
        <p className="text-xs text-[#59645C]">Puedes usar {'{{className}}'} en los textos para mostrar el nombre de la clase del estudiante.</p>
        {CLASS_DESIGNER_STEPS.map((step) => <details key={step} className="rounded-xl border border-[#E1E7E1] p-4">
          <summary className="cursor-pointer text-sm font-semibold">Etapa {step}: {draft.steps[step].shortTitle}</summary>
          <div className="mt-4 space-y-3">
            {([
              ['shortTitle', 'Nombre corto del paso'], ['navigationTitle', 'Descripción en la navegación'],
              ['category', 'Categoría del encabezado'], ['title', 'Título de la etapa'],
              ['description', 'Explicación e instrucciones'], ['tip', 'Orientación adicional'],
            ] as const).map(([field, label]) => <ContentField key={field} label={label} value={draft.steps[step][field]}
              multiline={field === 'description' || field === 'tip'}
              onChange={(value) => change({ ...draft, steps: { ...draft.steps, [step]: { ...draft.steps[step], [field]: value } } })} />)}
            <ClassDesignerBlocksEditor label={`Bloques de etapa ${step}`} sectionId={`class-designer-step-${step}`} blocks={draft.steps[step].blocks}
              onChange={(blocks) => change({ ...draft, steps: { ...draft.steps, [step]: { ...draft.steps[step], blocks } } })} />
          </div>
        </details>)}
      </section>
      <section className="space-y-4 rounded-2xl border border-[#E1E7E1] bg-white p-5">
        <h3 className="font-bold">Preguntas guía</h3>
        <ContentField label="Título de las preguntas" value={draft.guidingTitle} onChange={(guidingTitle) => change({ ...draft, guidingTitle })} />
        <ContentField label="Instrucciones de las preguntas" multiline value={draft.guidingDescription} onChange={(guidingDescription) => change({ ...draft, guidingDescription })} />
        {(Object.keys(draft.questions) as (keyof ClassDesignerContent['questions'])[]).map((key, index) => <div key={key} className="space-y-3 border-t border-[#E1E7E1] pt-3">
          <ContentField label={`Pregunta ${index + 1}`} value={draft.questions[key].label} onChange={(label) => change({ ...draft, questions: { ...draft.questions, [key]: { ...draft.questions[key], label } } })} />
          <ContentField label={`Ejemplo de respuesta ${index + 1}`} value={draft.questions[key].placeholder} onChange={(placeholder) => change({ ...draft, questions: { ...draft.questions, [key]: { ...draft.questions[key], placeholder } } })} />
        </div>)}
      </section>
      <section className="space-y-4 rounded-2xl border border-[#E1E7E1] bg-white p-5">
        <h3 className="font-bold">Explicación de las estrategias de inicialización</h3>
        {(Object.keys(draft.fieldStrategies) as (keyof ClassDesignerContent['fieldStrategies'])[]).map((key) => <div key={key} className="space-y-3 border-t border-[#E1E7E1] pt-3">
          <ContentField label="Nombre de la estrategia" value={draft.fieldStrategies[key].title} onChange={(title) => change({ ...draft, fieldStrategies: { ...draft.fieldStrategies, [key]: { ...draft.fieldStrategies[key], title } } })} />
          <ContentField label="Descripción de la estrategia" multiline value={draft.fieldStrategies[key].description} onChange={(description) => change({ ...draft, fieldStrategies: { ...draft.fieldStrategies, [key]: { ...draft.fieldStrategies[key], description } } })} />
        </div>)}
      </section>
      <section className="space-y-4 rounded-2xl border border-[#E1E7E1] bg-white p-5">
        <h3 className="font-bold">Plantilla inicial y ejemplos</h3>
        <p className="text-xs text-[#59645C]">Edita los campos, el constructor, los métodos y las relaciones con los mismos controles del diseñador. Los proyectos personales ya creados conservan su estructura.</p>
        <div className="flex flex-wrap gap-2">
          <select aria-label="Plantilla que se edita" className="rounded-xl border p-2 text-xs" value={example?.id ?? 'default'} onChange={(event) => setSelectedTemplate(event.target.value)}>
            <option value="default">Proyecto nuevo: plantilla inicial</option>
            {draft.examples.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
          </select>
          <button type="button" className="flex items-center gap-2 rounded-xl border px-3 py-2 text-xs" onClick={() => {
            const id = crypto.randomUUID();
            change({ ...draft, examples: [...draft.examples, { id, label: 'Nuevo ejemplo', project: instantiateClassDesignerTemplate(draft.defaultProject) }] });
            setSelectedTemplate(id);
          }}><Plus className="h-4 w-4" />Agregar ejemplo</button>
          {example && <button type="button" className="flex items-center gap-2 rounded-xl border px-3 py-2 text-xs text-red-800" onClick={() => {
            change({ ...draft, examples: draft.examples.filter((item) => item.id !== example.id) }); setSelectedTemplate('default');
          }}><Trash2 className="h-4 w-4" />Quitar ejemplo</button>}
        </div>
        {example && <ContentField label="Nombre del ejemplo en la herramienta" value={example.label} onChange={(label) => change({ ...draft, examples: draft.examples.map((item) => item.id === example.id ? { ...item, label } : item) })} />}
        <ClassDesignerContentContext.Provider value={draft}>
          <TemplateEditor key={example?.id ?? 'default'} project={templateProject} onChange={changeTemplate} />
        </ClassDesignerContentContext.Provider>
      </section>
    </fieldset>
    <button disabled={saving} onClick={() => { void save(); }} className="rounded-xl bg-[#407B5D] px-4 py-3 text-xs font-bold text-white disabled:opacity-50">{saving ? 'Guardando…' : 'Guardar contenido'}</button>
  </div>;
}
