import React, { useState, useEffect } from 'react';
import {
  LabModuleId,
  LabInstanceObject,
  MethodDefinition,
  MethodCallRecord,
} from '../../types/oopLab';
import { PELOTA_MODULE, BURBUJA_MODULE } from '../../data/oopLabData';
import { LearningPanel } from './LearningPanel';
import { ProgressiveCodeEditor } from './ProgressiveCodeEditor';
import { InteractiveStageCanvas } from './InteractiveStageCanvas';
import { MethodExplorerPanel } from './MethodExplorerPanel';
import { CustomClassArrayBuilder } from './CustomClassArrayBuilder';
import {
  ArrowLeft,
  Circle,
  Droplets,
  RotateCcw,
  Sparkles,
  BookOpen,
  Code2,
} from 'lucide-react';

interface OopLabViewProps {
  onBackToHome: () => void;
  onOpenCatalogue: () => void;
}

const STORAGE_KEY = 'oop_lab_progress_v2';

export const OopLabView: React.FC<OopLabViewProps> = ({
  onBackToHome,
  onOpenCatalogue,
}) => {
  // Module selection: Pelota vs Burbuja
  const [activeModuleId, setActiveModuleId] = useState<LabModuleId>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_module`);
      if (saved === 'pelota' || saved === 'burbuja' || saved === 'builder') return saved as LabModuleId;
    } catch {
      // Ignore
    }
    return 'pelota';
  });

  // Stage indices per module
  const [pelotaStageIdx, setPelotaStageIdx] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_pelota_stage`);
      if (saved) return Math.min(Number(saved), PELOTA_MODULE.stages.length - 1);
    } catch {
      // Ignore
    }
    return 0;
  });

  const [burbujaStageIdx, setBurbujaStageIdx] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_burbuja_stage`);
      if (saved) return Math.min(Number(saved), BURBUJA_MODULE.stages.length - 1);
    } catch {
      // Ignore
    }
    return 0;
  });

  const isPelota = activeModuleId === 'pelota';
  const currentModule = isPelota ? PELOTA_MODULE : BURBUJA_MODULE;
  const currentStageIdx = isPelota ? pelotaStageIdx : burbujaStageIdx;
  const setStageIdx = isPelota ? setPelotaStageIdx : setBurbujaStageIdx;

  // Track if current stage unlocks arrays
  const hasArrayUnlocked = isPelota ? currentStageIdx >= 6 : currentStageIdx >= 4;

  // Instances State (Single vs Array)
  const [pelotaInstances, setPelotaInstances] = useState<LabInstanceObject[]>([
    {
      id: 0,
      name: 'Pelota Alfa',
      x: 100,
      y: 140,
      diametro: 50,
      velocidad: 3.5,
      velocidadX: 3.5,
      velocidadY: 2.2,
      vx: 3.5,
      vy: 2.2,
      colorHex: '#E2661A',
    },
    {
      id: 1,
      name: 'Pelota Beta',
      x: 240,
      y: 190,
      diametro: 65,
      velocidad: 4.2,
      velocidadX: -3.0,
      velocidadY: 3.4,
      vx: -3.0,
      vy: 3.4,
      colorHex: '#006699',
    },
    {
      id: 2,
      name: 'Pelota Gamma',
      x: 380,
      y: 130,
      diametro: 42,
      velocidad: 2.8,
      velocidadX: 2.8,
      velocidadY: -2.0,
      vx: 2.8,
      vy: -2.0,
      colorHex: '#059669',
    },
  ]);

  const [burbujaInstances, setBurbujaInstances] = useState<LabInstanceObject[]>([
    {
      id: 0,
      name: 'Burbuja 0',
      x: 80,
      y: 260,
      diametro: 35,
      velocidad: 2.0,
      colorHex: '#38BDF8',
      opacidad: 140,
    },
    {
      id: 1,
      name: 'Burbuja 1',
      x: 170,
      y: 290,
      diametro: 55,
      velocidad: 3.2,
      colorHex: '#38BDF8',
      opacidad: 180,
    },
    {
      id: 2,
      name: 'Burbuja 2',
      x: 260,
      y: 230,
      diametro: 42,
      velocidad: 2.5,
      colorHex: '#38BDF8',
      opacidad: 120,
    },
    {
      id: 3,
      name: 'Burbuja 3',
      x: 350,
      y: 310,
      diametro: 60,
      velocidad: 1.8,
      colorHex: '#38BDF8',
      opacidad: 160,
    },
    {
      id: 4,
      name: 'Burbuja 4',
      x: 430,
      y: 250,
      diametro: 48,
      velocidad: 2.8,
      colorHex: '#38BDF8',
      opacidad: 150,
    },
  ]);

  const [selectedInstanceIndex, setSelectedInstanceIndex] = useState<number>(0);
  const [isContinuousAnimation, setIsContinuousAnimation] = useState<boolean>(false);
  const [callHistory, setCallHistory] = useState<MethodCallRecord[]>([]);

  // Filter instances to display (1 instance if before array stage, all if after array stage)
  const currentInstances = isPelota
    ? hasArrayUnlocked
      ? pelotaInstances
      : [pelotaInstances[0]]
    : hasArrayUnlocked
    ? burbujaInstances
    : [burbujaInstances[0]];

  const activeInstance = currentInstances[selectedInstanceIndex] || currentInstances[0];

  // Save stage progress to local storage
  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_module`, activeModuleId);
      localStorage.setItem(`${STORAGE_KEY}_pelota_stage`, String(pelotaStageIdx));
      localStorage.setItem(`${STORAGE_KEY}_burbuja_stage`, String(burbujaStageIdx));
    } catch {
      // Ignore
    }
  }, [activeModuleId, pelotaStageIdx, burbujaStageIdx]);

  // Execute a method from the Explorer on the selected instance
  const handleExecuteMethod = (
    method: MethodDefinition,
    paramValues: Record<string, number | string>,
    callString: string,
    effectText: string
  ) => {
    const updateTarget = isPelota ? setPelotaInstances : setBurbujaInstances;

    updateTarget((prev) => {
      return prev.map((inst, i) => {
        if (i !== selectedInstanceIndex) return inst;

        const updated = { ...inst };

        if (method.id === 'mover') {
          const vx = updated.vx ?? updated.velocidadX ?? updated.velocidad;
          const vy = updated.vy ?? updated.velocidadY ?? 2.0;
          updated.x += vx;
          updated.y += vy;
        } else if (method.id === 'subir') {
          updated.y -= updated.velocidad;
        } else if (method.id === 'rebotar') {
          updated.vx = -(updated.vx ?? updated.velocidadX ?? 3.5);
          updated.vy = -(updated.vy ?? updated.velocidadY ?? 2.2);
          updated.velocidadX = updated.vx;
          updated.velocidadY = updated.vy;
          updated.velocidad = updated.vx;
        } else if (method.id === 'flotar') {
          updated.isFloating = true;
          const amp = Number(paramValues.balanceo ?? paramValues.intensidad ?? 2.0);
          if (isPelota) {
            updated.y += Math.sin(updated.x * 0.05) * amp;
          } else {
            updated.x += Math.sin(updated.y * 0.05) * amp;
          }
        } else if (method.id === 'cambiarTamano') {
          updated.diametro = Number(paramValues.nuevoDiametro || 60);
        } else if (method.id === 'cambiarColor') {
          updated.colorHex = String(paramValues.nuevoColor || '#E2661A');
        } else if (method.id === 'cambiarVelocidad') {
          if (paramValues.nuevaVX !== undefined) {
            updated.velocidadX = Number(paramValues.nuevaVX);
            updated.vx = updated.velocidadX;
          }
          if (paramValues.nuevaVY !== undefined) {
            updated.velocidadY = Number(paramValues.nuevaVY);
            updated.vy = updated.velocidadY;
          }
          if (paramValues.nuevaVelocidad !== undefined) {
            updated.velocidad = Number(paramValues.nuevaVelocidad);
          }
        } else if (method.id === 'invertirDireccion') {
          updated.velocidad *= -1;
          if (updated.vx) updated.vx *= -1;
          if (updated.vy) updated.vy *= -1;
          if (updated.velocidadX) updated.velocidadX *= -1;
          if (updated.velocidadY) updated.velocidadY *= -1;
        } else if (method.id === 'reiniciar') {
          updated.x = Number(paramValues.nuevaX || 150);
          updated.y = Number(paramValues.nuevaY || 150);
        } else if (method.id === 'crecer') {
          updated.diametro = Math.max(10, updated.diametro + Number(paramValues.incremento || 5));
        } else if (method.id === 'desplazar') {
          updated.x += Number(paramValues.distancia || 15);
        } else if (method.id === 'cambiarTransparencia') {
          updated.opacidad = Number(paramValues.valor || 150);
        }

        return updated;
      });
    });

    // Record in history
    setCallHistory((prev) => [
      ...prev,
      {
        id: `call_${Date.now()}_${Math.random()}`,
        instanceIndex: selectedInstanceIndex,
        instanceName: activeInstance.name,
        methodName: method.name,
        callString,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        effectDescription: effectText,
      },
    ]);
  };

  const handleResetModule = () => {
    if (window.confirm('¿Deseas reiniciar el progreso de este módulo a la Etapa 1?')) {
      setStageIdx(0);
      setSelectedInstanceIndex(0);
      setIsContinuousAnimation(false);
      setCallHistory([]);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Top Breadcrumb & Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200">
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <button
            onClick={onBackToHome}
            className="hover:text-zinc-900 transition-colors font-medium flex items-center gap-1 min-h-[38px] px-2 py-1 rounded bg-zinc-100 hover:bg-zinc-200 text-zinc-900 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Inicio</span>
          </button>
          <span>/</span>
          <button
            onClick={onOpenCatalogue}
            className="hover:text-zinc-900 transition-colors font-medium flex items-center gap-1 cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Temario</span>
          </button>
          <span>/</span>
          <span className="text-zinc-400">POO en Processing Java</span>
          <span>/</span>
          <span className="text-zinc-950 font-semibold font-mono">Laboratorio de Objetos</span>
        </div>

        {/* Module Switcher (Módulo 1: Pelota, Módulo 2: Burbuja, Constructor Creativo) */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 p-1 bg-zinc-100 rounded-xl border border-zinc-200">
            <button
              onClick={() => {
                setActiveModuleId('pelota');
                setSelectedInstanceIndex(0);
              }}
              className={`min-h-[36px] px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeModuleId === 'pelota'
                  ? 'bg-zinc-950 text-white shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-950'
              }`}
            >
              <Circle className="w-3.5 h-3.5" />
              <span>Módulo 1: Pelota</span>
            </button>

            <button
              onClick={() => {
                setActiveModuleId('burbuja');
                setSelectedInstanceIndex(0);
              }}
              className={`min-h-[36px] px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeModuleId === 'burbuja'
                  ? 'bg-zinc-950 text-white shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-950'
              }`}
            >
              <Droplets className="w-3.5 h-3.5" />
              <span>Módulo 2: Burbuja</span>
            </button>

            <button
              onClick={() => {
                setActiveModuleId('builder');
              }}
              className={`min-h-[36px] px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeModuleId === 'builder'
                  ? 'bg-zinc-950 text-white shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-950'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Constructor & Eventos</span>
            </button>
          </div>

          {activeModuleId !== 'builder' && (
            <button
              onClick={handleResetModule}
              className="min-h-[36px] p-2 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-100 text-zinc-600 hover:text-zinc-900 transition-colors cursor-pointer"
              title="Reiniciar módulo a etapa 1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* When Builder Tab is selected, render CustomClassArrayBuilder */}
      {activeModuleId === 'builder' ? (
        <CustomClassArrayBuilder onBackToGuided={() => setActiveModuleId('pelota')} />
      ) : (
        <>
          {/* Hero Header */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500 font-mono">
              <span className="font-bold text-zinc-900 bg-zinc-100 px-2 py-0.5 rounded">
                {currentModule.moduleName}
              </span>
              <span>·</span>
              <span>Modelo de 5 momentos: Observar → Describir → Construir → Experimentar → Aplicar</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950">
              Laboratorio de Objetos: Construcción Progresiva de Clases
            </h1>

            <p className="text-xs sm:text-sm text-zinc-600 max-w-4xl leading-relaxed">
              {isPelota
                ? 'Aprende cómo nace una clase en Processing Java: desde observar un círculo en reposo, definir sus campos y constructor, hasta programar sus 7 métodos canónicos y gobernar un arreglo de pelotas independientes.'
                : 'Aplica de forma autónoma los conceptos adquiridos modelando la clase Burbuja: física ascendente en el eje Y, transparencia alfa (0-255), expansión dinámica y arreglos de burbujas en el agua.'}
            </p>
          </div>

          {/* 4 Synchronized Areas Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ROW 1 / LEFT: Panel de Aprendizaje (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          <LearningPanel
            activity={currentModule.stages[currentStageIdx]}
            totalStages={currentModule.stages.length}
            currentStageIdx={currentStageIdx}
            onSelectStageIdx={(idx) => {
              setStageIdx(idx);
              setSelectedInstanceIndex(0);
            }}
            onNextStage={() => {
              if (currentStageIdx < currentModule.stages.length - 1) {
                setStageIdx(currentStageIdx + 1);
                setSelectedInstanceIndex(0);
              }
            }}
            onPrevStage={() => {
              if (currentStageIdx > 0) {
                setStageIdx(currentStageIdx - 1);
                setSelectedInstanceIndex(0);
              }
            }}
            onChallengeAnswered={(chId, isCorrect) => {
              // Can optionally record completion
            }}
          />

          {/* Panel B: Progressive Code Editor with tabs and .pde export */}
          <ProgressiveCodeEditor
            module={currentModule}
            currentStageIdx={currentStageIdx}
          />
        </div>

        {/* ROW 1 / RIGHT: Visualización Interactiva & Explorador de Métodos (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          {/* Panel C: Visualización Interactiva Canvas */}
          <InteractiveStageCanvas
            moduleId={activeModuleId}
            instances={currentInstances}
            selectedIndex={selectedInstanceIndex}
            onSelectInstance={(idx) => setSelectedInstanceIndex(idx)}
            isContinuousAnimation={isContinuousAnimation}
            onCanvasClick={(clickX, clickY) => {
              // Click to re-position
              handleExecuteMethod(
                currentModule.methods.find((m) => m.id === 'reiniciar') || currentModule.methods[0],
                { nuevaX: Math.round(clickX), nuevaY: Math.round(clickY) },
                `${isPelota ? 'pelotas' : 'burbujas'}[${selectedInstanceIndex}].reiniciar(${Math.round(clickX)}, ${Math.round(clickY)});`,
                `Reubicado por clic en (${Math.round(clickX)}, ${Math.round(clickY)})`
              );
            }}
          />

          {/* Panel D: Explorador de Métodos */}
          <MethodExplorerPanel
            moduleId={activeModuleId as 'pelota' | 'burbuja'}
            methods={currentModule.methods}
            selectedInstance={activeInstance}
            selectedInstanceIndex={selectedInstanceIndex}
            totalInstances={currentInstances.length}
            isContinuousAnimation={isContinuousAnimation}
            onToggleContinuous={() => setIsContinuousAnimation(!isContinuousAnimation)}
            onExecuteMethod={handleExecuteMethod}
            callHistory={callHistory}
            onClearHistory={() => setCallHistory([])}
          />
        </div>
      </div>
      </>
      )}
    </div>
  );
};
