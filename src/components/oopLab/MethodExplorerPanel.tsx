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
      effectText = `Ascendió ${selectedInstance.velocidad} px en el eje Y hacia la superficie`;
    } else if (activeMethod.id === 'rebotar') {
      effectText = `Evaluó límites del lienzo e invirtió velocidades de choque (*= -1)`;
    } else if (activeMethod.id === 'flotar') {
      const paso = Number(paramInputs.pasoRuido ?? 0.015);
      const amp = Number(paramInputs.intensidad ?? paramInputs.balanceo ?? 3.5);
      effectText = isPelota
        ? `Deriva 2D con ruido Perlin desacoplado: tX += ${paso}, tY += ${paso}, amplitud = ${amp}px`
        : `Vaivén subacuático con noise(tX, tY): paso = ${paso}, balanceo = ${amp}px`;
    } else if (activeMethod.id === 'cambiarTamano') {
      effectText = `Diámetro actualizado a ${paramInputs.nuevoDiametro} px`;
    } else if (activeMethod.id === 'cambiarColor') {
      effectText = `Color actualizado a ${paramInputs.nuevoColor}`;
    } else if (activeMethod.id === 'invertirDireccion') {
      effectText = `Dirección invertida: velocidadX y velocidadY multiplicadas por -1`;
    } else if (activeMethod.id === 'cambiarVelocidad') {
      effectText = isPelota
        ? `Velocidades 2D fijadas a: vx = ${paramInputs.nuevaVX}, vy = ${paramInputs.nuevaVY}`
        : `Velocidad actualizada a ${paramInputs.nuevaVelocidad} px/frame`;
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
    <div className="bg-[#FFFFFF] border border-[#DEDDD7] p-5 sm:p-6 space-y-6 flex flex-col justify-between">
      {/* 1. Header & Animation Mode Toggle */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#DEDDD7] pb-3">
          <div>
            <h3 className="font-semibold text-sm sm:text-base text-[#141414] flex items-center gap-2 font-mono uppercase">
              <Sliders className="w-4 h-4 text-[#2868D9]" />
              <span>Explorador de Métodos & Memoria</span>
            </h3>
            <p className="text-xs text-[#626262] font-mono mt-0.5">
              Instancia activa: <strong className="text-[#141414]">{instancePrefix}</strong>
            </p>
          </div>

          {/* Mode Switch: Paso a paso vs Animación continua */}
          <div className="flex items-center gap-1 p-1 bg-[#FFFFFF] border border-[#DEDDD7] font-mono text-xs">
            <button
              onClick={() => {
                if (isContinuousAnimation) onToggleContinuous();
              }}
              className={`px-3 py-1 text-xs border transition-colors cursor-pointer ${
                !isContinuousAnimation
                  ? 'bg-[#141414] text-[#F7F6F1] border-[#141414] font-bold'
                  : 'bg-transparent text-[#626262] border-transparent hover:text-[#141414]'
              }`}
            >
              Paso a paso
            </button>
            <button
              onClick={() => {
                if (!isContinuousAnimation) onToggleContinuous();
              }}
              className={`px-3 py-1 text-xs border transition-colors flex items-center gap-1.5 cursor-pointer ${
                isContinuousAnimation
                  ? 'bg-[#141414] text-[#F7F6F1] border-[#141414] font-bold'
                  : 'bg-transparent text-[#626262] border-transparent hover:text-[#141414]'
              }`}
            >
              {isContinuousAnimation ? <Pause className="w-3 h-3 text-[#D9AA3D]" /> : <Play className="w-3 h-3" />}
              <span>Animación draw()</span>
            </button>
          </div>
        </div>

        {/* 2. Live Field State Inspector for the selected instance */}
        <div className="p-3 bg-[#F7F6F1] border border-[#DEDDD7] space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-[#626262]">
            <span className="font-bold text-[#141414]">CAMPOS EN MEMORIA DE {instancePrefix}:</span>
            <span className="text-[10px]">60 fps</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs font-mono">
            <div className="bg-[#FFFFFF] p-2 border border-[#DEDDD7]">
              <span className="text-[10px] text-[#626262] block">x (pos)</span>
              <span className="font-bold text-[#141414] tabular-nums">
                {Math.round(selectedInstance.x)}
              </span>
            </div>
            <div className="bg-[#FFFFFF] p-2 border border-[#DEDDD7]">
              <span className="text-[10px] text-[#626262] block">y (pos)</span>
              <span className="font-bold text-[#141414] tabular-nums">
                {Math.round(selectedInstance.y)}
              </span>
            </div>
            <div className="bg-[#FFFFFF] p-2 border border-[#DEDDD7]">
              <span className="text-[10px] text-[#626262] block">diametro</span>
              <span className="font-bold text-[#141414] tabular-nums">
                {Math.round(selectedInstance.diametro)}px
              </span>
            </div>
            <div className="bg-[#FFFFFF] p-2 border border-[#DEDDD7]">
              <span className="text-[10px] text-[#626262] block">
                {isPelota ? 'vel (vx, vy)' : 'velocidad'}
              </span>
              <span className="font-bold text-[#141414] tabular-nums truncate block">
                {isPelota
                  ? `${(selectedInstance.velocidadX ?? selectedInstance.velocidad).toFixed(1)}, ${(selectedInstance.velocidadY ?? 0).toFixed(1)}`
                  : (selectedInstance.velocidad > 0 ? `+${selectedInstance.velocidad}` : selectedInstance.velocidad)}
              </span>
            </div>
            <div className="bg-[#FFFFFF] p-2 border border-[#DEDDD7]">
              <span className="text-[10px] text-[#626262] block flex items-center justify-between">
                <span>{isPelota ? 'tono' : 'opacidad'}</span>
                {selectedInstance.isFloating && (
                  <span className="text-[9px] bg-[#D9AA3D] text-[#141414] font-bold px-1">~ noise</span>
                )}
              </span>
              <span className="font-bold text-[#141414] truncate block">
                {isPelota ? selectedInstance.colorHex : `${selectedInstance.opacidad ?? 160}/255`}
              </span>
            </div>
            <div className="bg-[#FFFFFF] p-2 border border-[#DEDDD7]">
              <span className="text-[10px] text-[#626262] block">semillas (tX, tY)</span>
              <span className="font-bold text-[#2868D9] tabular-nums truncate block">
                {(selectedInstance.tX ?? 0).toFixed(1)}, {(selectedInstance.tY ?? (isPelota ? 500 : 1000)).toFixed(1)}
              </span>
            </div>
          </div>
        </div>

        {/* 3. Method Selection List */}
        <div className="space-y-2">
          <div className="text-xs font-mono uppercase tracking-wider text-[#626262] flex items-center justify-between">
            <span>Métodos disponibles ({methods.length})</span>
            <span className="text-[11px]">Click para probar</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-1.5 font-mono text-xs">
            {methods.map((m) => {
              const isSelected = m.id === selectedMethodId;
              return (
                <button
                  key={m.id}
                  onClick={() => setSelectedMethodId(m.id)}
                  className={`p-2 border text-left transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-[#141414] text-[#F7F6F1] border-[#141414] font-bold'
                      : 'bg-[#FFFFFF] hover:border-[#141414] border-[#DEDDD7] text-[#141414]'
                  }`}
                >
                  <div className="truncate">{m.name}()</div>
                  <div className="text-[10px] opacity-70 truncate mt-0.5">
                    {m.parameters.length > 0 ? `${m.parameters.length} arg` : '0 args'}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Active Method Controller Card */}
        <div className="p-4 bg-[#F7F6F1] border border-[#DEDDD7] space-y-3.5">
          <div className="space-y-1">
            <div className="flex items-center justify-between font-mono">
              <span className="text-xs sm:text-sm font-bold text-[#141414]">
                {activeMethod.signature}
              </span>
              <span className="text-[11px] text-[#626262]">
                Muta: {activeMethod.fieldsModified.join(', ') || 'Ninguno'}
              </span>
            </div>
            <p className="text-xs text-[#626262] font-sans leading-relaxed">
              {activeMethod.description}
            </p>
          </div>

          {/* Parameters Controls if any */}
          {activeMethod.parameters.length > 0 && (
            <div className="space-y-3 pt-2 border-t border-[#DEDDD7]">
              {activeMethod.parameters.map((param) => {
                const currentVal = paramInputs[param.name] ?? param.defaultValue;

                return (
                  <div key={param.name} className="space-y-1.5 text-xs font-mono">
                    <div className="flex items-center justify-between text-[#141414]">
                      <span>Parámetro: <code className="font-bold text-[#2868D9]">{param.name}</code></span>
                      <span className="font-bold tabular-nums">
                        {String(currentVal)}
                      </span>
                    </div>

                    {param.type === 'color' ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={String(currentVal)}
                          onChange={(e) => handleParamChange(param.name, e.target.value)}
                          className="w-10 h-8 border border-[#DEDDD7] p-0.5 cursor-pointer bg-white"
                        />
                        <span className="font-mono text-xs text-[#626262] uppercase">
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
                        className="w-full accent-[#2868D9] cursor-pointer"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Visible Code Call in Processing Java */}
          <div className="pt-2 border-t border-[#DEDDD7] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1 flex-1">
              <span className="text-[10px] text-[#626262] font-mono uppercase block">
                Instrucción ejecutable en Processing:
              </span>
              <code className="px-3 py-2 bg-[#FFFFFF] border border-[#DEDDD7] text-[#141414] font-mono text-xs block overflow-x-auto">
                {buildCallString(activeMethod)}
              </code>
            </div>

            <button
              onClick={handleExecute}
              className="min-h-[42px] px-5 py-2 bg-[#141414] hover:bg-[#2868D9] text-[#F7F6F1] text-xs font-mono font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer shrink-0"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Ejecutar Método</span>
            </button>
          </div>
        </div>
      </div>

      {/* 5. Chronological Method Call History */}
      <div className="space-y-2 pt-2 border-t border-[#DEDDD7]">
        <div className="flex items-center justify-between text-xs font-mono text-[#626262]">
          <span className="flex items-center gap-1.5 font-bold text-[#141414]">
            <Terminal className="w-3.5 h-3.5 text-[#2868D9]" />
            <span>TERMINAL DE EJECUCIÓN ({callHistory.length})</span>
          </span>
          {callHistory.length > 0 && (
            <button
              onClick={onClearHistory}
              className="text-[11px] text-[#626262] hover:text-[#141414] underline cursor-pointer"
            >
              Limpiar terminal
            </button>
          )}
        </div>

        {callHistory.length === 0 ? (
          <p className="text-xs font-mono text-[#626262] italic py-2">
            Aún no se han ejecutado métodos. Haz clic en "Ejecutar Método" para observar el cambio de estado.
          </p>
        ) : (
          <div className="max-h-28 overflow-y-auto space-y-1.5 custom-scrollbar pr-1 font-mono text-xs">
            {callHistory.slice(-5).reverse().map((rec) => (
              <div
                key={rec.id}
                className="p-2 bg-[#F7F6F1] border border-[#DEDDD7] flex items-center justify-between"
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="text-[#141414] font-bold">{rec.callString}</span>
                  <span className="text-[#626262] text-[11px] truncate">
                    → {rec.effectDescription}
                  </span>
                </div>
                <span className="text-[10px] text-[#626262] tabular-nums shrink-0">
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
