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
    nuevoColor: '#407B5D',
    nuevaVelocidad: 4.5,
    nuevaVX: 4.0,
    nuevaVY: 2.5,
    pasoRuido: 0.015,
    intensidad: 3.5,
    balanceo: 2.2,
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

    if (activeMethod.id === 'mover') {
      effectText = isPelota
        ? `Desplazamiento 2D: x += ${selectedInstance.velocidadX?.toFixed(1) ?? selectedInstance.velocidad}, y += ${selectedInstance.velocidadY?.toFixed(1) ?? '0.0'}`
        : `Desplazamiento horizontal`;
    } else if (activeMethod.id === 'subir') {
      effectText = `Ascenso vertical hacia la superficie: y -= ${selectedInstance.velocidad}`;
    } else if (activeMethod.id === 'rebotar') {
      effectText = isPelota
        ? `Inversión cinemática en límites`
        : `Reaparición cíclica en el fondo del lienzo`;
    } else if (activeMethod.id === 'flotar') {
      effectText = isPelota
        ? `Flotación Perlin: x=noise(tX), y=noise(tY) con semillas independientes`
        : `Deriva ondulante marina con Perlin noise 2D independiente`;
    } else if (activeMethod.id === 'cambiarTamano') {
      effectText = `Diámetro ajustado a ${paramInputs.nuevoDiametro} px`;
    } else if (activeMethod.id === 'cambiarColor') {
      effectText = `Color mutado a ${paramInputs.nuevoColor}`;
    } else if (activeMethod.id === 'cambiarTransparencia') {
      effectText = `Opacidad alfa actualizada a ${paramInputs.valor} / 255`;
    }

    onExecuteMethod(activeMethod, paramInputs, callString, effectText);
  };

  return (
    <div className="bg-[#FFFFFF] border border-[#E1E7E1] rounded-2xl p-5 sm:p-6 space-y-6 flex flex-col justify-between shadow-xs">
      {/* 1. Header & Animation Mode Toggle */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E1E7E1] pb-3">
          <div>
            <h3 className="font-bold text-base text-[#232A24] flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#407B5D]" />
              <span>Explorador de Métodos & Memoria</span>
            </h3>
            <p className="text-xs text-[#59645C] mt-0.5">
              Instancia seleccionada: <strong className="text-[#232A24] font-mono">{instancePrefix}</strong>
            </p>
          </div>

          {/* Mode Switch: Paso a paso vs Animación continua */}
          <div className="flex items-center gap-1 p-1 bg-[#F7F8F4] border border-[#E1E7E1] rounded-xl text-xs">
            <button
              onClick={() => {
                if (isContinuousAnimation) onToggleContinuous();
              }}
              className={`px-3 py-1 text-xs rounded-lg transition-all cursor-pointer ${
                !isContinuousAnimation
                  ? 'bg-[#407B5D] text-white font-bold shadow-xs'
                  : 'text-[#59645C] hover:text-[#232A24]'
              }`}
            >
              Paso a paso
            </button>
            <button
              onClick={() => {
                if (!isContinuousAnimation) onToggleContinuous();
              }}
              className={`px-3 py-1 text-xs rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                isContinuousAnimation
                  ? 'bg-[#407B5D] text-white font-bold shadow-xs'
                  : 'text-[#59645C] hover:text-[#232A24]'
              }`}
            >
              {isContinuousAnimation ? <Pause className="w-3.5 h-3.5 text-[#E6B65A]" /> : <Play className="w-3.5 h-3.5" />}
              <span>Animación draw()</span>
            </button>
          </div>
        </div>

        {/* 2. Live Field State Inspector for the selected instance */}
        <div className="p-3.5 bg-[#F7F8F4] border border-[#E1E7E1] rounded-xl space-y-2.5">
          <div className="flex items-center justify-between text-xs text-[#59645C]">
            <span className="font-bold text-[#232A24]">Campos en memoria Heap ({instancePrefix}):</span>
            <span className="font-mono text-[11px]">60 FPS</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs font-mono">
            <div className="bg-[#FFFFFF] p-2.5 border border-[#E1E7E1] rounded-lg">
              <span className="text-[10px] text-[#59645C] block font-sans">x (pos)</span>
              <span className="font-bold text-[#232A24] tabular-nums">
                {Math.round(selectedInstance.x)}
              </span>
            </div>
            <div className="bg-[#FFFFFF] p-2.5 border border-[#E1E7E1] rounded-lg">
              <span className="text-[10px] text-[#59645C] block font-sans">y (pos)</span>
              <span className="font-bold text-[#232A24] tabular-nums">
                {Math.round(selectedInstance.y)}
              </span>
            </div>
            <div className="bg-[#FFFFFF] p-2.5 border border-[#E1E7E1] rounded-lg">
              <span className="text-[10px] text-[#59645C] block font-sans">diametro</span>
              <span className="font-bold text-[#232A24] tabular-nums">
                {Math.round(selectedInstance.diametro)}px
              </span>
            </div>
            <div className="bg-[#FFFFFF] p-2.5 border border-[#E1E7E1] rounded-lg">
              <span className="text-[10px] text-[#59645C] block font-sans">
                {isPelota ? 'vel (vx, vy)' : 'velocidad'}
              </span>
              <span className="font-bold text-[#232A24] tabular-nums truncate block">
                {isPelota
                  ? `${(selectedInstance.velocidadX ?? selectedInstance.velocidad).toFixed(1)}, ${(selectedInstance.velocidadY ?? 0).toFixed(1)}`
                  : (selectedInstance.velocidad > 0 ? `+${selectedInstance.velocidad}` : selectedInstance.velocidad)}
              </span>
            </div>
            <div className="bg-[#FFFFFF] p-2.5 border border-[#E1E7E1] rounded-lg">
              <span className="text-[10px] text-[#59645C] block font-sans flex items-center justify-between">
                <span>{isPelota ? 'tono' : 'opacidad'}</span>
                {selectedInstance.isFloating && (
                  <span className="text-[9px] bg-[#E8EEE8] text-[#407B5D] font-bold px-1 rounded">~ noise</span>
                )}
              </span>
              <span className="font-bold text-[#232A24] truncate block">
                {isPelota ? selectedInstance.colorHex : `${selectedInstance.opacidad ?? 160}/255`}
              </span>
            </div>
            <div className="bg-[#FFFFFF] p-2.5 border border-[#E1E7E1] rounded-lg">
              <span className="text-[10px] text-[#59645C] block font-sans">semillas (tX, tY)</span>
              <span className="font-bold text-[#407B5D] tabular-nums truncate block">
                {(selectedInstance.tX ?? 0).toFixed(1)}, {(selectedInstance.tY ?? (isPelota ? 500 : 1000)).toFixed(1)}
              </span>
            </div>
          </div>
        </div>

        {/* 3. Method Selection List */}
        <div className="space-y-2">
          <div className="text-xs font-semibold text-[#59645C] flex items-center justify-between">
            <span>Métodos disponibles ({methods.length})</span>
            <span className="text-xs text-[#59645C]">Haz clic para configurar</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 text-xs">
            {methods.map((m) => {
              const isSelected = m.id === selectedMethodId;
              return (
                <button
                  key={m.id}
                  onClick={() => setSelectedMethodId(m.id)}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#407B5D] text-white border-[#407B5D] font-bold shadow-xs'
                      : 'bg-[#FFFFFF] hover:border-[#407B5D] hover:bg-[#E8EEE8]/30 border-[#E1E7E1] text-[#232A24]'
                  }`}
                >
                  <div className="font-mono font-semibold truncate">{m.name}()</div>
                  <div className={`text-[10px] truncate mt-0.5 ${isSelected ? 'text-white/80' : 'text-[#59645C]'}`}>
                    {m.parameters.length > 0 ? `${m.parameters.length} parámetro` : 'sin parámetros'}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Active Method Controller Card */}
        <div className="p-4 sm:p-5 bg-[#F7F8F4] border border-[#E1E7E1] rounded-xl space-y-3.5">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold font-mono text-[#232A24]">
                {activeMethod.signature}
              </span>
              <span className="text-xs text-[#59645C] bg-[#E8EEE8] px-2 py-0.5 rounded-md font-medium">
                Muta: {activeMethod.fieldsModified.join(', ') || 'Ninguno'}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#59645C] leading-relaxed">
              {activeMethod.description}
            </p>
          </div>

          {/* Parameters Controls if any */}
          {activeMethod.parameters.length > 0 && (
            <div className="space-y-3 pt-2.5 border-t border-[#E1E7E1]">
              {activeMethod.parameters.map((param) => {
                const currentVal = paramInputs[param.name] ?? param.defaultValue;

                return (
                  <div key={param.name} className="space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-[#232A24]">
                      <span className="font-medium">Parámetro: <code className="font-bold text-[#407B5D] font-mono">{param.name}</code></span>
                      <span className="font-bold tabular-nums font-mono">
                        {String(currentVal)}
                      </span>
                    </div>

                    {param.type === 'color' ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={String(currentVal)}
                          onChange={(e) => handleParamChange(param.name, e.target.value)}
                          className="w-10 h-8 border border-[#E1E7E1] rounded-lg p-0.5 cursor-pointer bg-white"
                        />
                        <span className="font-mono text-xs text-[#59645C] uppercase">
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
                        className="w-full accent-[#407B5D] cursor-pointer"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Visible Code Call in Processing Java */}
          <div className="pt-2.5 border-t border-[#E1E7E1] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1 flex-1">
              <span className="text-[11px] text-[#59645C] font-semibold block">
                Instrucción ejecutable en Processing:
              </span>
              <code className="px-3 py-2 bg-[#FFFFFF] border border-[#E1E7E1] rounded-lg text-[#232A24] font-mono text-xs block overflow-x-auto">
                {buildCallString(activeMethod)}
              </code>
            </div>

            <button
              onClick={handleExecute}
              className="min-h-[42px] px-5 py-2 bg-[#407B5D] hover:bg-[#33654C] text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0 shadow-xs active:scale-98"
            >
              <Play className="w-4 h-4" />
              <span>Ejecutar Método</span>
            </button>
          </div>
        </div>
      </div>

      {/* 5. Chronological Method Call History */}
      <div className="space-y-2 pt-2 border-t border-[#E1E7E1]">
        <div className="flex items-center justify-between text-xs text-[#59645C]">
          <span className="flex items-center gap-1.5 font-bold text-[#232A24]">
            <Terminal className="w-4 h-4 text-[#407B5D]" />
            <span>Terminal de Ejecución ({callHistory.length})</span>
          </span>
          {callHistory.length > 0 && (
            <button
              onClick={onClearHistory}
              className="text-xs text-[#59645C] hover:text-[#232A24] underline cursor-pointer"
            >
              Limpiar terminal
            </button>
          )}
        </div>

        {callHistory.length === 0 ? (
          <p className="text-xs text-[#59645C] italic py-2">
            Aún no se han ejecutado métodos. Haz clic en "Ejecutar Método" para observar el cambio de estado en vivo.
          </p>
        ) : (
          <div className="max-h-28 overflow-y-auto space-y-1.5 custom-scrollbar pr-1 font-mono text-xs">
            {callHistory.slice(-5).reverse().map((rec) => (
              <div
                key={rec.id}
                className="p-2 bg-[#F7F8F4] border border-[#E1E7E1] rounded-lg flex items-center justify-between"
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="text-[#232A24] font-bold">{rec.callString}</span>
                  <span className="text-[#59645C] text-[11px] truncate">
                    → {rec.effectDescription}
                  </span>
                </div>
                <span className="text-[10px] text-[#59645C] tabular-nums shrink-0">
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
