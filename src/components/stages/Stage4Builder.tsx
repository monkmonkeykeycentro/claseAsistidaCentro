import React, { useState, useMemo } from 'react';
import {
  BuilderState,
  DiagnosticMessage,
} from '../../types/classStructure';
import {
  INITIAL_BUILDER_STATE,
  REFERENCE_PROCESSING_CODE,
} from '../../data/stageData';
import { ProcessingCodeBlock } from '../ProcessingCodeBlock';
import { VisualRelationsPanel } from '../VisualRelationsPanel';
import {
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Copy,
  Check,
  HelpCircle,
  Eye,
  Plus,
  Trash2,
  Info,
} from 'lucide-react';

interface Stage4Props {
  onComplete: () => void;
  isCompleted: boolean;
  savedState?: BuilderState;
  onSaveState?: (state: BuilderState) => void;
}

export const Stage4Builder: React.FC<Stage4Props> = ({
  onComplete,
  isCompleted,
  savedState,
  onSaveState,
}) => {
  const [builder, setBuilder] = useState<BuilderState>(savedState || INITIAL_BUILDER_STATE);
  const [activeHighlight, setActiveHighlight] = useState<string | null>('Gato');
  const [activeSectionType, setActiveSectionType] = useState<
    'className' | 'fields' | 'constructor' | 'methods'
  >('className');
  const [diagnostics, setDiagnostics] = useState<DiagnosticMessage[]>([]);
  const [hasRunDiagnostics, setHasRunDiagnostics] = useState<boolean>(false);
  const [hintIndex, setHintIndex] = useState<number>(0);
  const [showHintModal, setShowHintModal] = useState<boolean>(false);
  const [showReferenceModal, setShowReferenceModal] = useState<boolean>(false);
  const [activeRelation, setActiveRelation] = useState<
    'assignment' | 'constructor-match' | 'method-structure' | null
  >('assignment');
  const [selectedTokenInfo, setSelectedTokenInfo] = useState<{
    token: string;
    label: string;
    explanation: string;
  } | null>(null);

  // Generate real-time Processing Java code string
  const generatedCode = useMemo(() => {
    const classNameClean = builder.className.trim() || 'MiClase';

    // Fields block
    const fieldsCode = builder.fields
      .map((f) => `  ${f.type} ${f.name.trim() || 'variable'};`)
      .join('\n');

    // Constructor parameters
    const paramsList = builder.constructorParams
      .map((p) => `${p.type} ${p.name.trim() || 'paramTemp'}`)
      .join(', ');

    // Constructor assignments
    const assignments = builder.constructorParams
      .map((p) => {
        const targetField = builder.fields.find((f) => f.id === p.targetFieldId);
        const attrName = targetField ? targetField.name : p.name.replace('Temp', '');
        return `    ${attrName} = ${p.name};`;
      })
      .join('\n');

    const constructorCode = `  ${classNameClean}(${paramsList}) {\n${assignments || '    // Asignaciones'}\n  }`;

    // Methods block
    const methodsCode = builder.methods
      .map((m) => {
        const methodParams = m.params
          .map((p) => `${p.type} ${p.name.trim()}`)
          .join(', ');
        return `  void ${m.name.trim() || 'accion'}(${methodParams}) {\n    // ${m.comment}\n  }`;
      })
      .join('\n\n');

    return `class ${classNameClean} {\n${fieldsCode}\n\n${constructorCode}\n\n${methodsCode}\n}`;
  }, [builder]);

  const updateState = (updater: (prev: BuilderState) => BuilderState) => {
    setBuilder((prev) => {
      const next = updater(prev);
      onSaveState?.(next);
      return next;
    });
    setHasRunDiagnostics(false);
  };

  // Form field handlers
  const handleClassNameChange = (val: string) => {
    updateState((prev) => ({ ...prev, className: val }));
    setActiveHighlight(val);
    setActiveSectionType('className');
  };

  const handleAddField = () => {
    const newId = `f_${Date.now()}`;
    updateState((prev) => ({
      ...prev,
      fields: [...prev.fields, { id: newId, type: 'int', name: 'nuevaVar' }],
    }));
    setActiveSectionType('fields');
    setActiveHighlight('nuevaVar');
  };

  const handleRemoveField = (id: string) => {
    updateState((prev) => ({
      ...prev,
      fields: prev.fields.filter((f) => f.id !== id),
      constructorParams: prev.constructorParams.filter((p) => p.targetFieldId !== id),
    }));
  };

  const handleFieldChange = (
    id: string,
    key: 'type' | 'name',
    val: string
  ) => {
    updateState((prev) => ({
      ...prev,
      fields: prev.fields.map((f) => (f.id === id ? { ...f, [key]: val } : f)),
    }));
    setActiveHighlight(val);
    setActiveSectionType('fields');
  };

  const handleAddParam = () => {
    const newId = `p_${Date.now()}`;
    const defaultField = builder.fields[0];
    updateState((prev) => ({
      ...prev,
      constructorParams: [
        ...prev.constructorParams,
        {
          id: newId,
          type: defaultField ? defaultField.type : 'int',
          name: defaultField ? `${defaultField.name}Temp` : 'paramTemp',
          targetFieldId: defaultField ? defaultField.id : '',
        },
      ],
    }));
    setActiveSectionType('constructor');
  };

  const handleRemoveParam = (id: string) => {
    updateState((prev) => ({
      ...prev,
      constructorParams: prev.constructorParams.filter((p) => p.id !== id),
    }));
  };

  const handleParamChange = (
    id: string,
    key: 'type' | 'name' | 'targetFieldId',
    val: string
  ) => {
    updateState((prev) => ({
      ...prev,
      constructorParams: prev.constructorParams.map((p) =>
        p.id === id ? { ...p, [key]: val } : p
      ),
    }));
    setActiveHighlight(val);
    setActiveSectionType('constructor');
  };

  const handleAddMethod = () => {
    const newId = `m_${Date.now()}`;
    updateState((prev) => ({
      ...prev,
      methods: [
        ...prev.methods,
        {
          id: newId,
          name: 'nuevaAccion',
          params: [],
          comment: 'Instrucciones del nuevo método.',
        },
      ],
    }));
    setActiveSectionType('methods');
  };

  const handleRemoveMethod = (id: string) => {
    updateState((prev) => ({
      ...prev,
      methods: prev.methods.filter((m) => m.id !== id),
    }));
  };

  const handleMethodNameChange = (id: string, val: string) => {
    updateState((prev) => ({
      ...prev,
      methods: prev.methods.map((m) => (m.id === id ? { ...m, name: val } : m)),
    }));
    setActiveHighlight(val);
    setActiveSectionType('methods');
  };

  // Run comprehensive diagnostic check with specific, constructive feedback
  const handleReviewStructure = () => {
    const msgs: DiagnosticMessage[] = [];

    // 1. Class name validation
    const className = builder.className.trim();
    if (!className) {
      msgs.push({
        id: 'err-class-name-empty',
        type: 'syntax-error',
        title: 'Falta el nombre de la clase',
        message: 'La declaración de la clase necesita un identificador (ej. "class Gato").',
        targetArea: 'className',
      });
    } else if (!/^[A-Z][a-zA-Z0-9_]*$/.test(className)) {
      msgs.push({
        id: 'err-class-name-case',
        type: 'organization-suggestion',
        title: 'Sugerencia de estilo para nombre de clase',
        message: `El nombre "${className}" es sintácticamente válido en Java, pero la convención en Processing es usar mayúscula inicial (PascalCase, ej. "Gato").`,
        targetArea: 'className',
      });
    } else {
      msgs.push({
        id: 'ok-class-name',
        type: 'valid',
        title: 'Nombre de clase válido',
        message: `La clase "class ${className}" está correctamente declarada.`,
        targetArea: 'className',
      });
    }

    // 2. Constructor name check (must match class name!)
    msgs.push({
      id: 'info-constructor-rule',
      type: 'tip',
      title: 'Regla del constructor',
      message: `El constructor se genera automáticamente con el nombre "${className}". Recuerda que el constructor no lleva tipo de retorno, tampoco void.`,
      targetArea: 'constructor',
    });

    // 3. Fields validation
    if (builder.fields.length === 0) {
      msgs.push({
        id: 'warn-no-fields',
        type: 'organization-suggestion',
        title: 'Clase sin atributos',
        message: 'Una clase de Processing comúnmente define al menos un campo o atributo (como x, y, o nombre) para almacenar su estado.',
        targetArea: 'fields',
      });
    } else {
      const fieldNames = new Set<string>();
      for (const field of builder.fields) {
        const fName = field.name.trim();
        if (!fName) {
          msgs.push({
            id: `err-field-empty-${field.id}`,
            type: 'syntax-error',
            title: 'Nombre de atributo vacío',
            message: 'Esta declaración de atributo necesita un tipo y un nombre válido antes del punto y coma.',
            targetArea: 'fields',
          });
        } else if (fieldNames.has(fName)) {
          msgs.push({
            id: `err-field-dup-${field.id}`,
            type: 'syntax-error',
            title: 'Atributo duplicado',
            message: `El atributo "${fName}" ya fue declarado en esta clase. Cada atributo debe tener un nombre único.`,
            targetArea: 'fields',
          });
        } else {
          fieldNames.add(fName);
        }
      }
    }

    // 4. Parameter matching validation
    if (builder.constructorParams.length > 0 && builder.fields.length > 0) {
      const unmapped = builder.constructorParams.filter(
        (p) => !builder.fields.some((f) => f.id === p.targetFieldId)
      );
      if (unmapped.length > 0) {
        msgs.push({
          id: 'warn-unmapped-param',
          type: 'organization-suggestion',
          title: 'Parámetros sin asociar a atributos',
          message:
            'Algunos parámetros del constructor no están asociados directamente a un atributo. Generalmente cada parámetro inicializa un campo.',
          targetArea: 'constructor',
        });
      } else {
        msgs.push({
          id: 'ok-params-mapped',
          type: 'valid',
          title: 'Correspondencia correcta de parámetros',
          message: 'Todos los parámetros del constructor se asignan a sus correspondientes atributos.',
          targetArea: 'constructor',
        });
      }
    }

    // 5. Methods check
    if (builder.methods.length === 0) {
      msgs.push({
        id: 'warn-no-methods',
        type: 'organization-suggestion',
        title: 'Sin métodos de comportamiento',
        message: 'Para el ejemplo de Gato, se recomiendan los métodos void dibujar() y void caminar().',
        targetArea: 'methods',
      });
    } else {
      builder.methods.forEach((m) => {
        if (!m.name.trim()) {
          msgs.push({
            id: `err-method-empty-${m.id}`,
            type: 'syntax-error',
            title: 'Nombre de método vacío',
            message: 'Todo método necesita un nombre en minúscula/camelCase (ej. dibujar o caminar).',
            targetArea: 'methods',
          });
        }
      });
    }

    // Check if error-free
    const hasSyntaxErrors = msgs.some((m) => m.type === 'syntax-error');
    if (!hasSyntaxErrors) {
      msgs.unshift({
        id: 'success-overall',
        type: 'valid',
        title: '¡Estructura válida y completa!',
        message: 'La estructura de la clase cumple con la sintaxis de Processing Java. ¡Excelente trabajo!',
      });
      onComplete();
    }

    setDiagnostics(msgs);
    setHasRunDiagnostics(true);
  };

  const handleReset = () => {
    setBuilder(INITIAL_BUILDER_STATE);
    onSaveState?.(INITIAL_BUILDER_STATE);
    setDiagnostics([]);
    setHasRunDiagnostics(false);
    setActiveHighlight('Gato');
  };

  const HINTS = [
    'Paso 1: El nombre de la clase suele ser un sustantivo con mayúscula inicial (ej. Gato).',
    'Paso 2: Declara los atributos como String nombre;, int x;, int y; terminando cada uno con punto y coma (;).',
    'Paso 3: El constructor debe llamarse exactamente igual que la clase (Gato) y NO debe llevar tipo de retorno ni void.',
    'Paso 4: Cada parámetro del constructor (como nombreTemp) se asigna a su atributo: nombre = nombreTemp;.',
    'Paso 5: Declara los métodos con tipo de retorno void (ej. void dibujar() { ... }), abriendo y cerrando con llaves.',
  ];

  const handleNextHint = () => {
    setHintIndex((prev) => (prev + 1) % HINTS.length);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-800 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">
                Etapa 4
              </span>
              <span className="text-slate-500">·</span>
              <span className="text-xs text-slate-400">Construcción y diagnóstico</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-100 mt-1">
              Construir la clase con Processing Java
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowReferenceModal(true)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors flex items-center gap-1.5"
            >
              <Eye className="w-3.5 h-3.5" />
              Ver solución de referencia
            </button>
            {isCompleted && (
              <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-950/60 border border-emerald-500/40 rounded-full text-xs font-medium text-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Clase construida con éxito
              </div>
            )}
          </div>
        </div>
        <p className="text-sm text-slate-300 mt-2 max-w-3xl leading-relaxed">
          Configura cada parte de la clase mediante los campos guiados. El código de Processing Java se actualizará en tiempo real a la derecha resaltando cada cambio. Cuando termines, pulsa <strong>Revisar estructura</strong> para diagnosticar la sintaxis.
        </p>
      </div>

      {/* Main 3-Area Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Area 1: Elementos y Formulario de Construcción (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              1. Configuración de partes
            </h3>
            <button
              onClick={handleReset}
              className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              Reiniciar ejercicio
            </button>
          </div>

          <div className="space-y-4 max-h-[750px] overflow-y-auto pr-1 custom-scrollbar">
            {/* 1. Nombre de la clase */}
            <div
              onClick={() => setActiveSectionType('className')}
              className={`p-4 rounded-xl border transition-all ${
                activeSectionType === 'className'
                  ? 'bg-slate-900 border-cyan-500/70 shadow-sm'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  A. Nombre de la clase
                </label>
                <span className="text-[10px] text-amber-400 font-mono">class Gato</span>
              </div>
              <input
                type="text"
                value={builder.className}
                onChange={(e) => handleClassNameChange(e.target.value)}
                placeholder="Nombre de la clase (ej. Gato)"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-cyan-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              <span className="text-[11px] text-slate-400 block mt-1.5">
                Convención: Primera letra mayúscula (PascalCase).
              </span>
            </div>

            {/* 2. Atributos o campos */}
            <div
              onClick={() => setActiveSectionType('fields')}
              className={`p-4 rounded-xl border transition-all ${
                activeSectionType === 'fields'
                  ? 'bg-slate-900 border-cyan-500/70 shadow-sm'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <label className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    B. Atributos o campos
                  </label>
                  <span className="text-[10px] text-slate-400 block">
                    Variables de instancia terminadas en ;
                  </span>
                </div>
                <button
                  onClick={handleAddField}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-medium flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  Agregar campo
                </button>
              </div>

              <div className="space-y-2">
                {builder.fields.map((f, idx) => (
                  <div
                    key={f.id}
                    className="flex items-center gap-2 bg-slate-950 p-2 rounded-lg border border-slate-800"
                  >
                    <select
                      value={f.type}
                      onChange={(e) =>
                        handleFieldChange(f.id, 'type', e.target.value as any)
                      }
                      className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-cyan-300 font-mono focus:outline-none"
                    >
                      <option value="String">String</option>
                      <option value="int">int</option>
                      <option value="float">float</option>
                      <option value="boolean">boolean</option>
                      <option value="color">color</option>
                    </select>

                    <input
                      type="text"
                      value={f.name}
                      onChange={(e) => handleFieldChange(f.id, 'name', e.target.value)}
                      placeholder="nombre"
                      className="flex-1 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200 font-mono focus:outline-none"
                    />

                    <span className="text-slate-400 font-mono font-bold text-xs">;</span>

                    {builder.fields.length > 1 && (
                      <button
                        onClick={() => handleRemoveField(f.id)}
                        className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                        title="Eliminar campo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Constructor y Parámetros */}
            <div
              onClick={() => setActiveSectionType('constructor')}
              className={`p-4 rounded-xl border transition-all ${
                activeSectionType === 'constructor'
                  ? 'bg-slate-900 border-cyan-500/70 shadow-sm'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <label className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    C. Constructor y Parámetros
                  </label>
                  <span className="text-[10px] text-amber-400 block font-mono">
                    {builder.className}(...) — Mismo nombre, sin void
                  </span>
                </div>
                <button
                  onClick={handleAddParam}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-medium flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  Agregar parámetro
                </button>
              </div>

              <div className="space-y-2 mt-3">
                {builder.constructorParams.map((p) => (
                  <div
                    key={p.id}
                    className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5"
                  >
                    <div className="flex items-center gap-2">
                      <select
                        value={p.type}
                        onChange={(e) =>
                          handleParamChange(p.id, 'type', e.target.value)
                        }
                        className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-purple-300 font-mono"
                      >
                        <option value="String">String</option>
                        <option value="int">int</option>
                        <option value="float">float</option>
                        <option value="boolean">boolean</option>
                        <option value="color">color</option>
                      </select>

                      <input
                        type="text"
                        value={p.name}
                        onChange={(e) =>
                          handleParamChange(p.id, 'name', e.target.value)
                        }
                        placeholder="paramTemp"
                        className="flex-1 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-purple-200 font-mono"
                      />

                      {builder.constructorParams.length > 1 && (
                        <button
                          onClick={() => handleRemoveParam(p.id)}
                          className="p-1 text-slate-500 hover:text-rose-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono pt-1">
                      <span>Asignar a atributo:</span>
                      <select
                        value={p.targetFieldId}
                        onChange={(e) =>
                          handleParamChange(p.id, 'targetFieldId', e.target.value)
                        }
                        className="bg-slate-900 border border-slate-700 rounded px-2 py-0.5 text-[11px] text-cyan-300 font-mono"
                      >
                        {builder.fields.map((f) => (
                          <option key={f.id} value={f.id}>
                            {f.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. Métodos */}
            <div
              onClick={() => setActiveSectionType('methods')}
              className={`p-4 rounded-xl border transition-all ${
                activeSectionType === 'methods'
                  ? 'bg-slate-900 border-cyan-500/70 shadow-sm'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <label className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    D. Métodos (Acciones void)
                  </label>
                  <span className="text-[10px] text-rose-400 block font-mono">
                    void nombreAccion(...) {'{ ... }'}
                  </span>
                </div>
                <button
                  onClick={handleAddMethod}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-medium flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  Agregar método
                </button>
              </div>

              <div className="space-y-2 mt-3">
                {builder.methods.map((m) => (
                  <div
                    key={m.id}
                    className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5 text-xs font-mono"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-rose-400 font-bold">void</span>
                      <input
                        type="text"
                        value={m.name}
                        onChange={(e) => handleMethodNameChange(m.id, e.target.value)}
                        placeholder="nombreMetodo"
                        className="flex-1 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-blue-200 font-mono"
                      />
                      <span>()</span>
                      {builder.methods.length > 1 && (
                        <button
                          onClick={() => handleRemoveMethod(m.id)}
                          className="p-1 text-slate-500 hover:text-rose-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 font-sans italic">
                      // {m.comment}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Area 2: Espacio para construir la clase / Visor en Vivo (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              2. Código Processing Java resultante
            </h3>
            <span className="text-xs text-emerald-400 font-mono">En vivo</span>
          </div>

          <ProcessingCodeBlock
            code={generatedCode}
            highlightedSection={activeHighlight}
            onSelectToken={(token, ctx) => {
              if (token === 'Gato') {
                setActiveRelation('constructor-match');
              } else if (token === '=') {
                setActiveRelation('assignment');
              } else if (token === 'caminar' || token === 'void') {
                setActiveRelation('method-structure');
              }
              setSelectedTokenInfo({
                token,
                label: ctx,
                explanation: `Elemento de tipo ${ctx} en la clase ${builder.className}.`,
              });
            }}
          />

          {/* Action strip */}
          <div className="space-y-2.5">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleReviewStructure}
                className="w-full py-2.5 px-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                <Sparkles className="w-4 h-4" />
                Revisar estructura
              </button>

              <button
                onClick={() => {
                  handleNextHint();
                  setShowHintModal(true);
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <HelpCircle className="w-4 h-4 text-amber-400" />
                Ver una pista ({hintIndex + 1}/5)
              </button>
            </div>

            {/* Hint alert */}
            {showHintModal && (
              <div className="p-3 bg-amber-950/40 border border-amber-800/50 rounded-xl text-xs text-amber-200 flex items-start justify-between">
                <div>
                  <span className="font-semibold text-amber-300 block mb-0.5">
                    Pista pedagógica #{hintIndex + 1}:
                  </span>
                  {HINTS[hintIndex]}
                </div>
                <button
                  onClick={() => setShowHintModal(false)}
                  className="text-slate-400 hover:text-white text-xs ml-2"
                >
                  ✕
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Area 3: Explicación contextual y Diagnóstico (3 cols) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              3. Diagnóstico y relaciones
            </h3>
            <span className="text-xs text-cyan-400 font-medium">Análisis</span>
          </div>

          {/* Diagnostics feedback container */}
          {hasRunDiagnostics ? (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-slate-200">
                  Resultado de la revisión:
                </span>
                <span className="text-[10px] text-slate-400">
                  {diagnostics.length} observaciones
                </span>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                {diagnostics.map((diag) => (
                  <div
                    key={diag.id}
                    className={`p-2.5 rounded-lg border text-xs space-y-0.5 ${
                      diag.type === 'valid'
                        ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-200'
                        : diag.type === 'syntax-error'
                        ? 'bg-rose-950/60 border-rose-500/50 text-rose-200'
                        : diag.type === 'organization-suggestion'
                        ? 'bg-amber-950/50 border-amber-500/40 text-amber-200'
                        : 'bg-slate-950 border-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="font-semibold text-[11px] flex items-center gap-1.5">
                      {diag.type === 'valid' ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : diag.type === 'syntax-error' ? (
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                      ) : (
                        <Info className="w-3.5 h-3.5 text-amber-400" />
                      )}
                      {diag.title}
                    </div>
                    <p className="text-[11px] leading-relaxed opacity-90">
                      {diag.message}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl text-xs text-slate-400 text-center space-y-2">
              <Sparkles className="w-5 h-5 mx-auto text-cyan-400" />
              <p>
                Pulsa <strong>Revisar estructura</strong> para ejecutar la comprobación sintáctica y recibir sugerencias.
              </p>
            </div>
          )}

          {/* Interactive visual relations panel */}
          <VisualRelationsPanel
            activeRelation={activeRelation}
            onSelectRelation={(rel) => setActiveRelation(rel)}
            selectedTokenInfo={selectedTokenInfo}
          />
        </div>
      </div>

      {/* Modal: Referencia Oficial con advertencia previa */}
      {showReferenceModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-slate-100">
                  Código de referencia: clase Gato
                </h3>
              </div>
              <button
                onClick={() => setShowReferenceModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Esta es la estructura limpia y canónica de la clase Gato en Processing Java. Puedes consultarla para comparar con tu solución:
            </p>

            <ProcessingCodeBlock code={REFERENCE_PROCESSING_CODE} />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowReferenceModal(false)}
                className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium transition-colors"
              >
                Entendido, volver a mi ejercicio
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
