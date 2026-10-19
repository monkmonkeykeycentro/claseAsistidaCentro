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
import { ConstructorSketchSummary } from '../ConstructorSketchSummary';
import {
  RotateCcw,
  Sparkles,
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
  const [diagnostics, setDiagnostics] = useState<DiagnosticMessage[]>([]);
  const [hasRunDiagnostics, setHasRunDiagnostics] = useState<boolean>(false);
  const [hintIndex, setHintIndex] = useState<number>(0);
  const [showHintModal, setShowHintModal] = useState<boolean>(false);
  const [showReferenceModal, setShowReferenceModal] = useState<boolean>(false);

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

  const handleClassNameChange = (val: string) => {
    updateState((prev) => ({ ...prev, className: val }));
    setActiveHighlight(val);
  };

  const handleAddField = () => {
    const newId = `f_${Date.now()}`;
    updateState((prev) => ({
      ...prev,
      fields: [...prev.fields, { id: newId, type: 'int', name: 'nuevaVar' }],
    }));
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
          comment: 'Instrucciones del método.',
        },
      ],
    }));
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
  };

  // Diagnostic check
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

    // 2. Constructor name check
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
        message: 'Una clase de Processing comúnmente define al menos un campo o atributo para almacenar su estado.',
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
            message: `El atributo "${fName}" ya fue declarado en esta clase.`,
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
            'Algunos parámetros del constructor no están asociados directamente a un atributo.',
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
        title: 'Estructura válida y completa',
        message: 'La estructura de la clase cumple con la sintaxis de Processing Java.',
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
    <div className="space-y-10">
      {/* Stage Header */}
      <div className="border-b border-zinc-200 pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider block">
              Etapa 04
            </span>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-900 mt-1">
              Construir la clase en Processing Java
            </h2>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => setShowReferenceModal(true)}
              className="min-h-[44px] px-4 py-2 rounded-lg bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 text-zinc-700 text-xs font-medium transition-colors flex items-center gap-1.5"
            >
              <Eye className="w-3.5 h-3.5 text-zinc-500" />
              <span>Ver referencia</span>
            </button>
            {isCompleted && (
              <div className="flex items-center gap-1.5 text-xs text-zinc-600 font-mono py-1">
                <Check className="w-3.5 h-3.5 text-zinc-900" />
                <span>Clase construida</span>
              </div>
            )}
          </div>
        </div>
        <p className="text-sm text-zinc-600 mt-2 max-w-2xl leading-relaxed">
          Configura los atributos, constructor y métodos de tu clase. El código Processing Java se actualizará en tiempo real a la derecha.
        </p>
      </div>

      {/* Spacious 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form & Configuration (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Partes de la clase
            </span>
            <button
              onClick={handleReset}
              className="text-xs text-zinc-500 hover:text-zinc-900 flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reiniciar</span>
            </button>
          </div>

          {/* Form Card */}
          <div className="bg-white border border-zinc-200 rounded-xl p-5 sm:p-6 space-y-5">
            {/* 1. Nombre de la clase */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-zinc-800 uppercase tracking-wider">
                  Nombre de la clase
                </label>
                <span className="text-[11px] text-zinc-400 font-mono">PascalCase</span>
              </div>
              <input
                type="text"
                value={builder.className}
                onChange={(e) => handleClassNameChange(e.target.value)}
                placeholder="Gato"
                className="w-full min-h-[44px] bg-white border border-zinc-300 rounded-lg px-3.5 py-2 text-xs font-mono text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900"
              />
            </div>

            {/* 2. Atributos o campos */}
            <div className="space-y-3 pt-3 border-t border-zinc-100">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-xs font-semibold text-zinc-800 uppercase tracking-wider block">
                    Atributos o campos
                  </label>
                  <span className="text-[11px] text-zinc-400">
                    Variables terminadas en ;
                  </span>
                </div>
                <button
                  onClick={handleAddField}
                  className="min-h-[44px] px-3 py-1 rounded-lg bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 text-zinc-700 text-xs font-medium flex items-center gap-1.5 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Agregar campo</span>
                </button>
              </div>

              <div className="space-y-2">
                {builder.fields.map((f) => (
                  <div
                    key={f.id}
                    className="flex items-center gap-2 bg-zinc-50 p-2 rounded-lg border border-zinc-200"
                  >
                    <select
                      value={f.type}
                      onChange={(e) =>
                        handleFieldChange(f.id, 'type', e.target.value as any)
                      }
                      className="min-h-[44px] bg-white border border-zinc-300 rounded-lg px-2.5 py-1 text-xs text-zinc-800 font-mono focus:outline-none"
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
                      className="flex-1 min-h-[44px] bg-white border border-zinc-300 rounded-lg px-3 py-1 text-xs text-zinc-900 font-mono focus:outline-none focus:ring-1 focus:ring-zinc-900"
                    />

                    <span className="text-zinc-500 font-mono font-bold text-xs px-1">;</span>

                    {builder.fields.length > 1 && (
                      <button
                        onClick={() => handleRemoveField(f.id)}
                        className="min-h-[44px] min-w-[44px] flex items-center justify-center text-zinc-400 hover:text-zinc-900 transition-colors"
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
            <div className="space-y-3 pt-3 border-t border-zinc-100">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-xs font-semibold text-zinc-800 uppercase tracking-wider block">
                    Constructor y Parámetros
                  </label>
                  <span className="text-[11px] text-zinc-400 font-mono">
                    {builder.className}(...) — Mismo nombre, sin void
                  </span>
                </div>
                <button
                  onClick={handleAddParam}
                  className="min-h-[44px] px-3 py-1 rounded-lg bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 text-zinc-700 text-xs font-medium flex items-center gap-1.5 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Agregar parámetro</span>
                </button>
              </div>

              <div className="space-y-2">
                {builder.constructorParams.map((p) => (
                  <div
                    key={p.id}
                    className="p-3 rounded-lg bg-zinc-50 border border-zinc-200 space-y-2"
                  >
                    <div className="flex items-center gap-2">
                      <select
                        value={p.type}
                        onChange={(e) =>
                          handleParamChange(p.id, 'type', e.target.value)
                        }
                        className="min-h-[44px] bg-white border border-zinc-300 rounded-lg px-2.5 py-1 text-xs text-zinc-800 font-mono"
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
                        className="flex-1 min-h-[44px] bg-white border border-zinc-300 rounded-lg px-3 py-1 text-xs text-zinc-900 font-mono focus:outline-none focus:ring-1 focus:ring-zinc-900"
                      />

                      {builder.constructorParams.length > 1 && (
                        <button
                          onClick={() => handleRemoveParam(p.id)}
                          className="min-h-[44px] min-w-[44px] flex items-center justify-center text-zinc-400 hover:text-zinc-900"
                          title="Eliminar parámetro"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-zinc-500 font-mono pt-1">
                      <span>Asignar a atributo:</span>
                      <select
                        value={p.targetFieldId}
                        onChange={(e) =>
                          handleParamChange(p.id, 'targetFieldId', e.target.value)
                        }
                        className="min-h-[44px] bg-white border border-zinc-300 rounded-lg px-2.5 py-1 text-xs text-zinc-800 font-mono focus:outline-none"
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
            <div className="space-y-3 pt-3 border-t border-zinc-100">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-xs font-semibold text-zinc-800 uppercase tracking-wider block">
                    Métodos (void)
                  </label>
                  <span className="text-[11px] text-zinc-400 font-mono">
                    void nombreAccion(...) {'{ ... }'}
                  </span>
                </div>
                <button
                  onClick={handleAddMethod}
                  className="min-h-[44px] px-3 py-1 rounded-lg bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 text-zinc-700 text-xs font-medium flex items-center gap-1.5 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Agregar método</span>
                </button>
              </div>

              <div className="space-y-2">
                {builder.methods.map((m) => (
                  <div
                    key={m.id}
                    className="p-3 rounded-lg bg-zinc-50 border border-zinc-200 space-y-1.5 text-xs font-mono"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-zinc-600 font-semibold italic">void</span>
                      <input
                        type="text"
                        value={m.name}
                        onChange={(e) => handleMethodNameChange(m.id, e.target.value)}
                        placeholder="nombreMetodo"
                        className="flex-1 min-h-[44px] bg-white border border-zinc-300 rounded-lg px-3 py-1 text-xs text-zinc-900 font-mono focus:outline-none focus:ring-1 focus:ring-zinc-900"
                      />
                      <span className="text-zinc-400">()</span>
                      {builder.methods.length > 1 && (
                        <button
                          onClick={() => handleRemoveMethod(m.id)}
                          className="min-h-[44px] min-w-[44px] flex items-center justify-center text-zinc-400 hover:text-zinc-900"
                          title="Eliminar método"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <div className="text-[11px] text-zinc-400 font-sans italic">
                      // {m.comment}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleReviewStructure}
                className="min-h-[44px] w-full py-2.5 px-3 rounded-lg bg-zinc-900 hover:bg-black text-white font-medium text-xs sm:text-sm transition-colors flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Revisar estructura</span>
              </button>

              <button
                onClick={() => {
                  handleNextHint();
                  setShowHintModal(true);
                }}
                className="min-h-[44px] w-full py-2.5 px-3 rounded-lg bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 text-zinc-700 font-medium text-xs sm:text-sm transition-colors flex items-center justify-center gap-1.5"
              >
                <HelpCircle className="w-4 h-4 text-zinc-500" />
                <span>Pista ({hintIndex + 1}/5)</span>
              </button>
            </div>

            {/* Hint Box */}
            {showHintModal && (
              <div className="p-3.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-700 flex items-start justify-between">
                <div>
                  <span className="font-semibold text-zinc-900 block mb-0.5">
                    Pista pedagógica #{hintIndex + 1}:
                  </span>
                  <p className="text-zinc-600 leading-relaxed text-[12px]">{HINTS[hintIndex]}</p>
                </div>
                <button
                  onClick={() => setShowHintModal(false)}
                  className="text-zinc-400 hover:text-zinc-700 text-xs ml-3"
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          {/* Diagnostics Results */}
          {hasRunDiagnostics && (
            <div className="bg-white border border-zinc-200 rounded-xl p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
                <span className="text-xs font-semibold text-zinc-900">
                  Resultado de la revisión
                </span>
                <span className="text-[11px] text-zinc-400 font-mono">
                  {diagnostics.length} observaciones
                </span>
              </div>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1 custom-scrollbar">
                {diagnostics.map((diag) => (
                  <div
                    key={diag.id}
                    className="p-3 rounded-lg border border-zinc-200 bg-zinc-50 text-xs space-y-1"
                  >
                    <div className="font-medium text-xs text-zinc-900 flex items-center gap-1.5">
                      <span className="text-zinc-500 font-mono text-[11px]">
                        {diag.type === 'valid' ? '✓' : '·'}
                      </span>
                      <span>{diag.title}</span>
                    </div>
                    <p className="text-[12px] leading-relaxed text-zinc-600">
                      {diag.message}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Real-Time Processing Code Viewer (6 cols) */}
        <div className="lg:col-span-6 space-y-4 lg:sticky lg:top-24">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Código Processing Java resultante
            </span>
            <span className="text-xs text-zinc-500 font-mono">En vivo</span>
          </div>

          <ProcessingCodeBlock
            code={generatedCode}
            highlightedSection={activeHighlight}
          />

          <div className="p-3.5 bg-zinc-50 rounded-xl border border-zinc-200 text-xs text-zinc-600 space-y-1">
            <div className="flex items-center gap-2 text-zinc-900 font-medium">
              <Info className="w-4 h-4 text-zinc-500 shrink-0" />
              <span>Sintaxis en vivo</span>
            </div>
            <p className="leading-relaxed text-[12px]">
              El código se actualiza al instante conforme editas los atributos, parámetros y métodos.
            </p>
          </div>
        </div>
      </div>

      {/* Constructor summary in sketch.pde */}
      <div id="constructor-sketch-summary" className="pt-4">
        <ConstructorSketchSummary builder={builder} />
      </div>

      {/* Modal: Referencia Oficial */}
      {showReferenceModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white border border-zinc-200 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-zinc-600" />
                <h3 className="text-sm font-semibold text-zinc-900">
                  Código de referencia: clase Gato
                </h3>
              </div>
              <button
                onClick={() => setShowReferenceModal(false)}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center text-zinc-400 hover:text-zinc-900 text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-zinc-600 leading-relaxed">
              Estructura canónica de la clase Gato en Processing Java:
            </p>

            <ProcessingCodeBlock code={REFERENCE_PROCESSING_CODE} />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowReferenceModal(false)}
                className="min-h-[44px] px-4 py-2 rounded-lg bg-zinc-900 hover:bg-black text-white text-xs font-medium transition-colors"
              >
                Volver a mi ejercicio
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
