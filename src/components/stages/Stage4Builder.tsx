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
    const defaultTarget = builder.fields[0]?.id || '';
    updateState((prev) => ({
      ...prev,
      constructorParams: [
        ...prev.constructorParams,
        { id: newId, type: 'int', name: 'nuevoParam', targetFieldId: defaultTarget },
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
  };

  const handleAddMethod = () => {
    const newId = `m_${Date.now()}`;
    updateState((prev) => ({
      ...prev,
      methods: [
        ...prev.methods,
        {
          id: newId,
          name: 'nuevoMetodo',
          returnType: 'void',
          params: [],
          comment: 'Acción adicional',
        },
      ],
    }));
    setActiveHighlight('nuevoMetodo');
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

  const handleReviewStructure = () => {
    const results: DiagnosticMessage[] = [];

    // Check class name
    if (builder.className.trim() === 'Gato') {
      results.push({
        id: 'cn-valid',
        type: 'valid',
        title: 'Nombre de clase adecuado',
        message: 'Utiliza PascalCase y coincide con la especificación de Gato.',
      });
    } else if (builder.className.trim()) {
      results.push({
        id: 'cn-custom',
        type: 'organization-suggestion',
        title: 'Nombre de clase personalizado',
        message: `Has nombrado tu clase como "${builder.className}". Asegúrate de que empiece en mayúscula.`,
      });
    } else {
      results.push({
        id: 'cn-empty',
        type: 'syntax-error',
        title: 'Falta el nombre de la clase',
        message: 'La clase necesita un identificador en PascalCase.',
      });
    }

    // Check fields
    if (builder.fields.length >= 4) {
      results.push({
        id: 'f-count',
        type: 'valid',
        title: 'Atributos suficientes',
        message: `La clase cuenta con ${builder.fields.length} atributos declarados.`,
      });
    } else {
      results.push({
        id: 'f-low',
        type: 'organization-suggestion',
        title: 'Pocos atributos',
        message: 'Se recomiendan al menos 4 atributos para describir el estado del objeto.',
      });
    }

    // Check constructor params
    if (builder.constructorParams.length >= 3) {
      results.push({
        id: 'cp-count',
        type: 'valid',
        title: 'Constructor parametrizado',
        message: `Recibe ${builder.constructorParams.length} parámetros para inicializar el objeto con flexibilidad.`,
      });
    } else {
      results.push({
        id: 'cp-low',
        type: 'organization-suggestion',
        title: 'Parámetros del constructor limitados',
        message: 'Un constructor con parámetros permite crear objetos con propiedades distintas.',
      });
    }

    // Check methods
    if (builder.methods.length >= 2) {
      results.push({
        id: 'm-count',
        type: 'valid',
        title: 'Métodos suficientes',
        message: `Has definido ${builder.methods.length} acciones que definen el comportamiento de la clase.`,
      });
    } else {
      results.push({
        id: 'm-low',
        type: 'organization-suggestion',
        title: 'Faltan métodos',
        message: 'Se recomiendan al menos 2 métodos (como dibujar y mover).',
      });
    }

    setDiagnostics(results);
    setHasRunDiagnostics(true);

    const hasErrors = results.some((r) => r.type === 'syntax-error');
    if (!hasErrors) {
      onComplete();
    }
  };

  const handleReset = () => {
    setBuilder(INITIAL_BUILDER_STATE);
    onSaveState?.(INITIAL_BUILDER_STATE);
    setDiagnostics([]);
    setHasRunDiagnostics(false);
  };

  const HINTS = [
    'Convención de nombres: las clases inician con mayúscula (PascalCase), mientras que las variables y métodos usan camelCase.',
    'Punto y coma: cada variable de campo debe terminar con punto y coma (;). Las firmas de clase y métodos no llevan punto y coma.',
    'Constructor: su nombre debe coincidir exactamente con el de la clase y no lleva tipo de retorno ni la palabra void.',
    'Asignación en constructor: cada parámetro recibido suele copiarse al atributo correspondiente (ej. x = tempX;).',
    'Métodos: el tipo de retorno más habitual para acciones visuales o de movimiento en Processing es void.',
  ];

  const handleNextHint = () => {
    setHintIndex((prev) => (prev + 1) % HINTS.length);
  };

  return (
    <div className="space-y-8">
      {/* Stage Header */}
      <div className="border-b border-[#DCE7F2] pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#006699] bg-[#E2EEF8] px-2.5 py-0.5 rounded-full inline-block mb-1.5">
              Etapa 04
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0C2233]">
              Construir la clase en Processing Java
            </h2>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => setShowReferenceModal(true)}
              className="min-h-[40px] px-4 py-2 rounded-xl bg-white hover:bg-[#E2EEF8] border border-[#DCE7F2] text-[#0C2233] text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Eye className="w-3.5 h-3.5 text-[#006699]" />
              <span>Ver referencia</span>
            </button>
            {isCompleted && (
              <div className="flex items-center gap-1.5 text-xs text-[#006699] font-semibold py-1 bg-[#E2EEF8] px-3 rounded-full">
                <Check className="w-3.5 h-3.5" />
                <span>Clase construida</span>
              </div>
            )}
          </div>
        </div>
        <p className="text-sm text-[#4A6076] mt-2 max-w-2xl leading-relaxed">
          Configura los atributos, constructor y métodos de tu clase. El código Processing Java se actualizará en tiempo real a la derecha.
        </p>
      </div>

      {/* 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form & Configuration (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#4A6076]">
              Partes de la clase
            </span>
            <button
              onClick={handleReset}
              className="text-xs text-[#4A6076] hover:text-[#0C2233] flex items-center gap-1 cursor-pointer font-medium"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reiniciar</span>
            </button>
          </div>

          {/* Form Card */}
          <div className="bg-white border border-[#DCE7F2] rounded-2xl p-5 sm:p-6 space-y-5 shadow-xs">
            {/* 1. Nombre de la clase */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#0C2233] uppercase tracking-wider">
                  Nombre de la clase
                </label>
                <span className="text-[11px] text-[#4A6076] font-mono">PascalCase</span>
              </div>
              <input
                type="text"
                value={builder.className}
                onChange={(e) => handleClassNameChange(e.target.value)}
                placeholder="Gato"
                className="w-full min-h-[44px] bg-white border border-[#DCE7F2] rounded-xl px-3.5 py-2 text-xs font-mono text-[#0C2233] placeholder:text-[#4A6076]/60 focus:outline-none focus:ring-1 focus:ring-[#006699] focus:border-[#006699]"
              />
            </div>

            {/* 2. Atributos o campos */}
            <div className="space-y-3 pt-3 border-t border-[#DCE7F2]">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-xs font-bold text-[#0C2233] uppercase tracking-wider block">
                    Atributos o campos
                  </label>
                  <span className="text-[11px] text-[#4A6076]">
                    Variables terminadas en ;
                  </span>
                </div>
                <button
                  onClick={handleAddField}
                  className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-white hover:bg-[#E2EEF8] border border-[#DCE7F2] text-[#0C2233] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5 text-[#006699]" />
                  <span>Agregar campo</span>
                </button>
              </div>

              <div className="space-y-2">
                {builder.fields.map((f) => (
                  <div
                    key={f.id}
                    className="flex items-center gap-2 bg-[#F4F8FB] p-2.5 rounded-xl border border-[#DCE7F2]"
                  >
                    <select
                      value={f.type}
                      onChange={(e) => handleFieldChange(f.id, 'type', e.target.value)}
                      className="min-h-[40px] bg-white border border-[#DCE7F2] rounded-lg px-2.5 py-1 text-xs text-[#0C2233] font-mono focus:outline-none"
                    >
                      <option value="int">int</option>
                      <option value="float">float</option>
                      <option value="String">String</option>
                      <option value="boolean">boolean</option>
                      <option value="color">color</option>
                    </select>

                    <input
                      type="text"
                      value={f.name}
                      onChange={(e) => handleFieldChange(f.id, 'name', e.target.value)}
                      placeholder="nombreAtributo"
                      className="flex-1 min-h-[40px] bg-white border border-[#DCE7F2] rounded-lg px-3 py-1 text-xs text-[#0C2233] font-mono focus:outline-none focus:ring-1 focus:ring-[#006699]"
                    />

                    <span className="text-[#4A6076] font-mono">;</span>

                    {builder.fields.length > 1 && (
                      <button
                        onClick={() => handleRemoveField(f.id)}
                        className="min-h-[40px] min-w-[40px] flex items-center justify-center text-[#4A6076] hover:text-[#0C2233] cursor-pointer"
                        title="Eliminar campo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Parámetros del Constructor */}
            <div className="space-y-3 pt-3 border-t border-[#DCE7F2]">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-xs font-bold text-[#0C2233] uppercase tracking-wider block">
                    Parámetros del Constructor
                  </label>
                  <span className="text-[11px] text-[#4A6076] font-mono">
                    {builder.className}(...)
                  </span>
                </div>
                <button
                  onClick={handleAddParam}
                  className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-white hover:bg-[#E2EEF8] border border-[#DCE7F2] text-[#0C2233] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5 text-[#006699]" />
                  <span>Agregar parámetro</span>
                </button>
              </div>

              <div className="space-y-2">
                {builder.constructorParams.map((p) => (
                  <div
                    key={p.id}
                    className="p-3 rounded-xl bg-[#F4F8FB] border border-[#DCE7F2] space-y-2"
                  >
                    <div className="flex items-center gap-2">
                      <select
                        value={p.type}
                        onChange={(e) => handleParamChange(p.id, 'type', e.target.value)}
                        className="min-h-[40px] bg-white border border-[#DCE7F2] rounded-lg px-2.5 py-1 text-xs text-[#0C2233] font-mono focus:outline-none"
                      >
                        <option value="int">int</option>
                        <option value="float">float</option>
                        <option value="String">String</option>
                        <option value="boolean">boolean</option>
                        <option value="color">color</option>
                      </select>

                      <input
                        type="text"
                        value={p.name}
                        onChange={(e) => handleParamChange(p.id, 'name', e.target.value)}
                        placeholder="tempParam"
                        className="flex-1 min-h-[40px] bg-white border border-[#DCE7F2] rounded-lg px-3 py-1 text-xs text-[#0C2233] font-mono focus:outline-none focus:ring-1 focus:ring-[#006699]"
                      />

                      {builder.constructorParams.length > 1 && (
                        <button
                          onClick={() => handleRemoveParam(p.id)}
                          className="min-h-[40px] min-w-[40px] flex items-center justify-center text-[#4A6076] hover:text-[#0C2233] cursor-pointer"
                          title="Eliminar parámetro"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-[#4A6076] font-mono pt-1">
                      <span>Asignar a atributo:</span>
                      <select
                        value={p.targetFieldId}
                        onChange={(e) =>
                          handleParamChange(p.id, 'targetFieldId', e.target.value)
                        }
                        className="min-h-[36px] bg-white border border-[#DCE7F2] rounded-lg px-2.5 py-1 text-xs text-[#0C2233] font-mono focus:outline-none"
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
            <div className="space-y-3 pt-3 border-t border-[#DCE7F2]">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-xs font-bold text-[#0C2233] uppercase tracking-wider block">
                    Métodos (void)
                  </label>
                  <span className="text-[11px] text-[#4A6076] font-mono">
                    void nombreAccion(...) {'{ ... }'}
                  </span>
                </div>
                <button
                  onClick={handleAddMethod}
                  className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-white hover:bg-[#E2EEF8] border border-[#DCE7F2] text-[#0C2233] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5 text-[#006699]" />
                  <span>Agregar método</span>
                </button>
              </div>

              <div className="space-y-2">
                {builder.methods.map((m) => (
                  <div
                    key={m.id}
                    className="p-3 rounded-xl bg-[#F4F8FB] border border-[#DCE7F2] space-y-1.5 text-xs font-mono"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-[#006699] font-bold italic">void</span>
                      <input
                        type="text"
                        value={m.name}
                        onChange={(e) => handleMethodNameChange(m.id, e.target.value)}
                        placeholder="nombreMetodo"
                        className="flex-1 min-h-[40px] bg-white border border-[#DCE7F2] rounded-lg px-3 py-1 text-xs text-[#0C2233] font-mono focus:outline-none focus:ring-1 focus:ring-[#006699]"
                      />
                      <span className="text-[#4A6076]">()</span>
                      {builder.methods.length > 1 && (
                        <button
                          onClick={() => handleRemoveMethod(m.id)}
                          className="min-h-[40px] min-w-[40px] flex items-center justify-center text-[#4A6076] hover:text-[#0C2233] cursor-pointer"
                          title="Eliminar método"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <div className="text-[11px] text-[#4A6076] font-sans italic">
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
                className="min-h-[44px] w-full py-2.5 px-3 rounded-xl bg-[#006699] hover:bg-[#00507A] text-white font-semibold text-xs sm:text-sm transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Revisar estructura</span>
              </button>

              <button
                onClick={() => {
                  handleNextHint();
                  setShowHintModal(true);
                }}
                className="min-h-[44px] w-full py-2.5 px-3 rounded-xl bg-white hover:bg-[#E2EEF8] border border-[#DCE7F2] text-[#0C2233] font-semibold text-xs sm:text-sm transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
              >
                <HelpCircle className="w-4 h-4 text-[#006699]" />
                <span>Pista ({hintIndex + 1}/5)</span>
              </button>
            </div>

            {/* Hint Box */}
            {showHintModal && (
              <div className="p-4 bg-[#FFF9EE] border border-[#E6B65A] rounded-2xl text-xs text-[#0C2233] flex items-start justify-between shadow-xs">
                <div>
                  <span className="font-bold text-[#8A6318] block mb-0.5">
                    Pista pedagógica #{hintIndex + 1}:
                  </span>
                  <p className="text-[#4A6076] leading-relaxed text-[12px]">{HINTS[hintIndex]}</p>
                </div>
                <button
                  onClick={() => setShowHintModal(false)}
                  className="text-[#4A6076] hover:text-[#0C2233] text-xs ml-3 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          {/* Diagnostics Results */}
          {hasRunDiagnostics && (
            <div className="bg-white border border-[#DCE7F2] rounded-2xl p-4 sm:p-5 space-y-3 shadow-xs">
              <div className="flex items-center justify-between border-b border-[#DCE7F2] pb-2">
                <span className="text-xs font-bold text-[#0C2233]">
                  Resultado de la revisión
                </span>
                <span className="text-[11px] text-[#4A6076] font-mono">
                  {diagnostics.length} observaciones
                </span>
              </div>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1 custom-scrollbar">
                {diagnostics.map((diag) => (
                  <div
                    key={diag.id}
                    className={`p-3 rounded-xl border text-xs space-y-1 ${
                      diag.type === 'valid'
                        ? 'border-[#006699] bg-[#E2EEF8]/40'
                        : 'border-[#E6B65A] bg-[#FFF9EE]'
                    }`}
                  >
                    <div className="font-bold text-xs text-[#0C2233] flex items-center gap-1.5">
                      <span className="font-mono text-[11px] text-[#006699]">
                        {diag.type === 'valid' ? '✓' : '·'}
                      </span>
                      <span>{diag.title}</span>
                    </div>
                    <p className="text-[12px] leading-relaxed text-[#4A6076]">
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
            <span className="text-xs font-bold uppercase tracking-wider text-[#4A6076]">
              Código Processing Java resultante
            </span>
            <span className="text-xs text-[#006699] font-mono font-semibold bg-[#E2EEF8] px-2 py-0.5 rounded-full">
              En vivo
            </span>
          </div>

          <ProcessingCodeBlock
            code={generatedCode}
            highlightedSection={activeHighlight}
          />

          <div className="p-4 bg-white rounded-2xl border border-[#DCE7F2] text-xs text-[#4A6076] space-y-1 shadow-xs">
            <div className="flex items-center gap-2 text-[#006699] font-bold">
              <Info className="w-4 h-4 shrink-0" />
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
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white border border-[#DCE7F2] rounded-3xl max-w-xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#DCE7F2] pb-3">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-[#006699]" />
                <h3 className="text-base font-bold text-[#0C2233]">
                  Código de referencia: clase Gato
                </h3>
              </div>
              <button
                onClick={() => setShowReferenceModal(false)}
                className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl border border-[#DCE7F2] text-[#4A6076] hover:text-[#0C2233] text-sm cursor-pointer shadow-xs"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[#4A6076] leading-relaxed">
              Estructura canónica de la clase Gato en Processing Java:
            </p>

            <ProcessingCodeBlock code={REFERENCE_PROCESSING_CODE} />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowReferenceModal(false)}
                className="min-h-[44px] px-5 py-2 rounded-xl bg-[#006699] hover:bg-[#00507A] text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs"
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
