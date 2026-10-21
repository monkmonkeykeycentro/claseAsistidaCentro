import React, { useState } from 'react';
import {
  MethodDefinition,
  LabInstanceObject,
  MethodCallRecord,
  LabModuleId,
} from '../../types/oopLab';
import {
  Play,
  RotateCcw,
  Sliders,
  History,
  Terminal,
  Pause,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

interface MethodExplorerPanelProps {
  moduleId: LabModuleId;
  methods: MethodDefinition[];
  selectedInstance: LabInstanceObject;
  selectedInstanceIndex: number;
  totalInstances: number;
  isContinuousAnimation: boolean;
  onToggleContinuous: () => void;
  onExecuteMethod: (
    method: MethodDefinition,
    paramValues: Record<string, number | string>,
    callString: string,
    effectText: string
  ) => void;
  callHistory: MethodCallRecord[];
  onClearHistory: () => void;
}

export const MethodExplorerPanel: React.FC<MethodExplorerPanelProps> = ({
  moduleId,
  methods,
  selectedInstance,
  selectedInstanceIndex,
  totalInstances,
  isContinuousAnimation,
  onToggleContinuous,
  onExecuteMethod,
  callHistory,
  onClearHistory,
}) => {
  const [selectedMethodId, setSelectedMethodId] = useState<string>('cambiarTamano');
  const [paramInputs, setParamInputs] = useState<Record<string, number | string>>({
    nuevoDiametro: 75,
    nuevoColor: '#006699',
    nuevaVelocidad: 4.5,
    nuevaX: 180,
    nuevaY: 150,
    incremento: 8,
    distancia: 20,
    valor: 140,
  });

  const isPelota = moduleId === 'pelota';
  const instancePrefix = totalInstances > 1 ? `${isPelota ? 'pelotas' : 'burbujas'}[${selectedInstanceIndex}]` : isPelota ? 'miPelota' : 'miBurbuja';

  const activeMethod = methods.find((m) => m.id === selectedMethodId) || methods[0];

  const handleParamChange = (paramName: string, val: number | string) => {
    setParamInputs((prev) => ({ ...prev, [paramName]: val }));
  };

  // Build the code invocation string shown to students
  const buildCallString = (method: MethodDefinition): string => {
    if (method.parameters.length === 0) {
      return `${instancePrefix}.${method.name}();`;
    }
    const args = method.parameters
      .map((p) => {
        const val = paramInputs[p.name] ?? p.defaultValue;
        if (p.type === 'color') {
          return `color(${val})`;
        }
        return String(val);
      })
      .join(', ');
    return `${instancePrefix}.${method.name}(${args});`;
  };

  const handleExecute = () => {
    const callString = buildCallString(activeMethod);
    let effectText = `Ejecutado ${activeMethod.name}()`;

    if (activeMethod.id === 'mover' || activeMethod.id === 'subir') {
      effectText = isPelota ? `Avanzó ${selectedInstance.velocidad} px en el eje X` : `Ascendió ${selectedInstance.velocidad} px en el eje Y`;
    } else if (activeMethod.id === 'cambiarTamano') {
      effectText = `Diámetro actualizado a ${paramInputs.nuevoDiametro} px`;
    } else if (activeMethod.id === 'cambiarColor') {
      effectText = `Color actualizado a ${paramInputs.nuevoColor}`;
    } else if (activeMethod.id === 'invertirDireccion') {
      effectText = `Dirección invertida: velocidad multiplicada por -1`;
    } else if (activeMethod.id === 'cambiarVelocidad') {
      effectText = `Velocidad actualizada a ${paramInputs.nuevaVelocidad} px/frame`;
    } else if (activeMethod.id === 'reiniciar') {
      effectText = `Reubicado en coordenadas (${paramInputs.nuevaX}, ${paramInputs.nuevaY})`;
    } else if (activeMethod.id === 'crecer') {
      effectText = `Diámetro incrementado en +${paramInputs.incremento} px`;
    } else if (activeMethod.id === 'cambiarTransparencia') {
      effectText = `Opacidad alfa actualizada a ${paramInputs.valor} / 255`;
    }

    onExecuteMethod(activeMethod, paramInputs, callString, effectText);
  };

  return (
    <div className="bg-white border border-zinc-200 rounded-2xl p-5 sm:p-6 space-y-6 shadow-xs flex flex-col justify-between">
      {/* 1. Header & Animation Mode Toggle */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 pb-3">
          <div>
            <h3 className="font-bold text-sm sm:text-base text-zinc-950 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-zinc-800" />
              <span>Explorador de Métodos & Estado</span>
            </h3>
            <p className="text-xs text-zinc-500 font-sans">
              Ejecuta acciones sobre <strong>{instancePrefix}</strong> y observa cómo muta su memoria.
            </p>
          </div>

          {/* Mode Switch: Paso a paso vs Animación continua */}
          <div className="flex items-center gap-1.5 p-1 bg-zinc-100 rounded-xl">
            <button
              onClick={() => {
                if (isContinuousAnimation) onToggleContinuous();
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                !isContinuousAnimation
                  ? 'bg-white text-zinc-950 font-bold shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              Paso a paso
            </button>
            <button
              onClick={() => {
                if (!isContinuousAnimation) onToggleContinuous();
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                isContinuousAnimation
                  ? 'bg-zinc-950 text-white font-bold shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              {isContinuousAnimation ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
              <span>Animación draw()</span>
            </button>
          </div>
        </div>

        {/* 2. Live Field State Inspector for the selected instance */}
        <div className="p-3.5 bg-zinc-50 border border-zinc-200 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-zinc-900">
            <span>Campos actuales de {instancePrefix}:</span>
            <span className="font-mono text-[11px] text-zinc-400">Memoria encapsulada</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs font-mono">
            <div className="bg-white p-2 rounded-lg border border-zinc-200">
              <span className="text-[10px] text-zinc-400 block font-sans">x (pos)</span>
              <span className="font-bold text-zinc-900 tabular-nums">
                {Math.round(selectedInstance.x)}
              </span>
            </div>
            <div className="bg-white p-2 rounded-lg border border-zinc-200">
              <span className="text-[10px] text-zinc-400 block font-sans">y (pos)</span>
              <span className="font-bold text-zinc-900 tabular-nums">
                {Math.round(selectedInstance.y)}
              </span>
            </div>
            <div className="bg-white p-2 rounded-lg border border-zinc-200">
              <span className="text-[10px] text-zinc-400 block font-sans">diametro</span>
              <span className="font-bold text-zinc-900 tabular-nums">
                {Math.round(selectedInstance.diametro)} px
              </span>
            </div>
            <div className="bg-white p-2 rounded-lg border border-zinc-200">
              <span className="text-[10px] text-zinc-400 block font-sans">velocidad</span>
              <span className="font-bold text-zinc-900 tabular-nums">
                {selectedInstance.velocidad > 0 ? `+${selectedInstance.velocidad}` : selectedInstance.velocidad}
              </span>
            </div>
            <div className="bg-white p-2 rounded-lg border border-zinc-200">
              <span className="text-[10px] text-zinc-400 block font-sans">
                {isPelota ? 'tono' : 'opacidad'}
              </span>
              <span className="font-bold text-zinc-900 truncate block">
                {isPelota ? selectedInstance.colorHex : `${selectedInstance.opacidad ?? 160}/255`}
              </span>
            </div>
          </div>
        </div>

        {/* 3. Method Selection List */}
        <div className="space-y-2">
          <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Selecciona un método construido ({methods.length})
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-1.5">
            {methods.map((m) => {
              const isSelected = m.id === selectedMethodId;
              return (
                <button
                  key={m.id}
                  onClick={() => setSelectedMethodId(m.id)}
                  className={`p-2.5 rounded-lg border text-left text-xs transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-zinc-950 text-white font-semibold border-zinc-950 shadow-xs'
                      : 'bg-white hover:bg-zinc-100 border-zinc-200 text-zinc-700'
                  }`}
                >
                  <div className="font-mono truncate">{m.name}()</div>
                  <div className="text-[10px] opacity-70 truncate mt-0.5 font-sans">
                    {m.parameters.length > 0 ? `${m.parameters.length} parámetro` : 'Sin parámetros'}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Active Method Controller Card */}
        <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl space-y-3.5">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs sm:text-sm font-bold text-zinc-900">
                {activeMethod.signature}
              </span>
              <span className="text-[11px] text-zinc-500 font-sans">
                Modifica: {activeMethod.fieldsModified.join(', ') || 'Ninguno'}
              </span>
            </div>
            <p className="text-xs text-zinc-600 font-sans leading-relaxed">
              {activeMethod.description}
            </p>
          </div>

          {/* Parameters Controls if any */}
          {activeMethod.parameters.length > 0 && (
            <div className="space-y-3 pt-2 border-t border-zinc-200/80">
              {activeMethod.parameters.map((param) => {
                const currentVal = paramInputs[param.name] ?? param.defaultValue;

                return (
                  <div key={param.name} className="space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-zinc-700 font-medium">
                      <span>Parámetro: <code className="font-mono font-bold text-zinc-900">{param.name}</code></span>
                      <span className="font-mono font-bold text-zinc-900 tabular-nums">
                        {String(currentVal)}
                      </span>
                    </div>

                    {param.type === 'color' ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={String(currentVal)}
                          onChange={(e) => handleParamChange(param.name, e.target.value)}
                          className="w-10 h-8 rounded border border-zinc-300 p-0.5 cursor-pointer bg-white"
                        />
                        <span className="font-mono text-xs text-zinc-600 uppercase">
                          {String(currentVal)}
                        </span>
                      </div>
                    ) : (
                      <input
                        type="range"
                        min={param.min ?? 10}
                        max={param.max ?? 150}
                        step={param.step ?? 1}
                        value={Number(currentVal)}
                        onChange={(e) => handleParamChange(param.name, Number(e.target.value))}
                        className="w-full accent-zinc-900 cursor-pointer"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Visible Code Call in Processing Java */}
          <div className="pt-2 border-t border-zinc-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1 flex-1">
              <span className="text-[10px] text-zinc-400 font-mono uppercase block">
                Llamada visible en Processing Java:
              </span>
              <code className="px-2.5 py-1.5 bg-zinc-900 text-emerald-400 font-mono text-xs rounded-lg block overflow-x-auto">
                {buildCallString(activeMethod)}
              </code>
            </div>

            <button
              onClick={handleExecute}
              className="min-h-[42px] px-5 py-2 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-semibold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer shrink-0"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Ejecutar Método</span>
            </button>
          </div>
        </div>
      </div>

      {/* 5. Chronological Method Call History */}
      <div className="space-y-2 pt-2 border-t border-zinc-100">
        <div className="flex items-center justify-between text-xs text-zinc-500">
          <span className="flex items-center gap-1.5 font-semibold text-zinc-800">
            <History className="w-3.5 h-3.5" />
            <span>Historial real de llamadas ejecutadas ({callHistory.length})</span>
          </span>
          {callHistory.length > 0 && (
            <button
              onClick={onClearHistory}
              className="text-[11px] text-zinc-400 hover:text-zinc-700 underline cursor-pointer"
            >
              Limpiar historial
            </button>
          )}
        </div>

        {callHistory.length === 0 ? (
          <p className="text-xs text-zinc-400 italic py-2">
            Aún no se han ejecutado métodos. Presiona "Ejecutar Método" o prueba los controles interactivos.
          </p>
        ) : (
          <div className="max-h-28 overflow-y-auto space-y-1.5 custom-scrollbar pr-1">
            {callHistory.slice(-5).reverse().map((rec) => (
              <div
                key={rec.id}
                className="p-2 rounded-lg bg-zinc-50 border border-zinc-200 flex items-center justify-between text-xs font-mono"
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="text-emerald-700 font-bold">{rec.callString}</span>
                  <span className="text-zinc-400 font-sans text-[11px] truncate">
                    · {rec.effectDescription}
                  </span>
                </div>
                <span className="text-[10px] text-zinc-400 tabular-nums shrink-0">
                  {rec.timestamp}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
