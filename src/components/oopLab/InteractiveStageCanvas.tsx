import React, { useRef, useEffect } from 'react';
import { LabInstanceObject, LabModuleId } from '../../types/oopLab';
import { Info, Crosshair } from 'lucide-react';

interface InteractiveStageCanvasProps {
  moduleId: LabModuleId;
  instances: LabInstanceObject[];
  selectedIndex: number;
  onSelectInstance: (idx: number) => void;
  isContinuousAnimation: boolean;
  onCanvasClick?: (x: number, y: number) => void;
}

export const InteractiveStageCanvas: React.FC<InteractiveStageCanvasProps> = ({
  moduleId,
  instances,
  selectedIndex,
  onSelectInstance,
  isContinuousAnimation,
  onCanvasClick,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isPelota = moduleId === 'pelota';

  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;

      // 1. Clear background
      if (isPelota) {
        ctx.fillStyle = '#FAFAFA'; // Neutral light canvas
        ctx.fillRect(0, 0, width, height);

        // Grid lines
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.04)';
        ctx.lineWidth = 1;
        for (let x = 0; x < width; x += 40) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
          ctx.stroke();
        }
        for (let y = 0; y < height; y += 40) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();
        }
      } else {
        // Burbuja: Deep aquatic marine background
        ctx.fillStyle = '#0F1E36';
        ctx.fillRect(0, 0, width, height);

        // Underwater gradient rays
        const grad = ctx.createLinearGradient(0, 0, 0, height);
        grad.addColorStop(0, 'rgba(56, 189, 248, 0.1)');
        grad.addColorStop(1, 'rgba(15, 30, 54, 0.8)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
      }

      // 2. Continuous animation update if enabled
      if (isContinuousAnimation) {
        instances.forEach((inst) => {
          if (isPelota) {
            // 2D Fluid Movement with X and Y velocities
            const vx = inst.vx ?? inst.velocidadX ?? inst.velocidad;
            const vy = inst.vy ?? inst.velocidadY ?? 2.0;
            inst.x += vx;
            inst.y += vy;

            // Organic Sine Wave Floating Modulation
            if (inst.isFloating) {
              inst.floatOffset = (inst.floatOffset ?? 0) + 0.07;
              inst.y += Math.sin(inst.floatOffset) * 2.2;
            }

            const r = inst.diametro / 2;

            // Horizontal bouncing (walls left & right)
            if (inst.x > width - r) {
              inst.x = width - r;
              inst.vx = -Math.abs(vx);
              inst.velocidadX = inst.vx;
              inst.velocidad = inst.vx;
            } else if (inst.x < r) {
              inst.x = r;
              inst.vx = Math.abs(vx);
              inst.velocidadX = inst.vx;
              inst.velocidad = inst.vx;
            }

            // Vertical bouncing (floor & ceiling)
            if (inst.y > height - r) {
              inst.y = height - r;
              inst.vy = -Math.abs(vy);
              inst.velocidadY = inst.vy;
            } else if (inst.y < r) {
              inst.y = r;
              inst.vy = Math.abs(vy);
              inst.velocidadY = inst.vy;
            }
          } else {
            // Burbuja: asciende restando velocidad a Y
            inst.y -= inst.velocidad;

            // Movimiento sutil y orgánico de flotación / vaivén lateral en agua
            inst.floatOffset = (inst.floatOffset ?? 0) + 0.05;
            const swayAmplitude = inst.isFloating ? 2.4 : 1.2;
            inst.x += Math.sin((inst.y * 0.04) + inst.floatOffset) * (swayAmplitude * 0.7);

            // Si el método flotar() está activado, añade una micro-ondulación sutil
            if (inst.isFloating) {
              inst.y += Math.sin(inst.floatOffset * 1.5) * 0.6;
            }

            const r = inst.diametro / 2;
            // Respawn with if when leaves top
            if (inst.y < -r) {
              inst.y = height + r;
              inst.x = 40 + Math.random() * (width - 80);
            }
          }
        });
      }

      // 3. Render all instances
      instances.forEach((inst, idx) => {
        const isSelected = idx === selectedIndex;
        const radius = inst.diametro / 2;

        ctx.save();

        if (isPelota) {
          // Shadow underneath
          ctx.fillStyle = 'rgba(0, 0, 0, 0.06)';
          ctx.beginPath();
          ctx.ellipse(inst.x, inst.y + radius * 0.9, radius * 0.9, radius * 0.25, 0, 0, Math.PI * 2);
          ctx.fill();

          // Pelota Body
          ctx.fillStyle = inst.colorHex;
          ctx.beginPath();
          ctx.arc(inst.x, inst.y, radius, 0, Math.PI * 2);
          ctx.fill();

          // Subtle 3D gradient lighting highlight
          const gradLight = ctx.createRadialGradient(
            inst.x - radius * 0.35,
            inst.y - radius * 0.35,
            radius * 0.05,
            inst.x,
            inst.y,
            radius
          );
          gradLight.addColorStop(0, 'rgba(255, 255, 255, 0.45)');
          gradLight.addColorStop(0.7, 'rgba(255, 255, 255, 0)');
          gradLight.addColorStop(1, 'rgba(0, 0, 0, 0.2)');
          ctx.fillStyle = gradLight;
          ctx.beginPath();
          ctx.arc(inst.x, inst.y, radius, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Burbuja Body with opacity
          const opac = (inst.opacidad ?? 160) / 255;
          ctx.fillStyle = `rgba(125, 211, 252, ${opac * 0.45})`;
          ctx.beginPath();
          ctx.arc(inst.x, inst.y, radius, 0, Math.PI * 2);
          ctx.fill();

          // Rim stroke
          ctx.strokeStyle = `rgba(255, 255, 255, ${Math.min(1, opac + 0.3)})`;
          ctx.lineWidth = 2;
          ctx.stroke();

          // Specular highlight spot
          ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(1, opac + 0.4)})`;
          ctx.beginPath();
          ctx.arc(inst.x - radius * 0.3, inst.y - radius * 0.3, radius * 0.22, 0, Math.PI * 2);
          ctx.fill();
        }

        // Floating Aura if flotar() is active
        if (inst.isFloating) {
          ctx.save();
          ctx.strokeStyle = isPelota ? 'rgba(226, 102, 26, 0.5)' : 'rgba(56, 189, 248, 0.6)';
          ctx.lineWidth = 1.5;
          ctx.setLineDash([3, 3]);
          ctx.beginPath();
          ctx.arc(inst.x, inst.y, radius + 4, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }

        // Selection Ring & Coordinate Callout
        if (isSelected) {
          ctx.strokeStyle = isPelota ? '#18181B' : '#38BDF8';
          ctx.lineWidth = 2;
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          ctx.arc(inst.x, inst.y, radius + 6, 0, Math.PI * 2);
          ctx.stroke();
          ctx.setLineDash([]);

          // Center crosshair dot
          ctx.fillStyle = isPelota ? '#18181B' : '#FFFFFF';
          ctx.beginPath();
          ctx.arc(inst.x, inst.y, 2.5, 0, Math.PI * 2);
          ctx.fill();

          // Measurement badge floating above with 2D velocity
          ctx.fillStyle = isPelota ? '#18181B' : '#0369A1';
          ctx.font = 'bold 10px ui-monospace, SFMono-Regular, Menlo, monospace';
          ctx.textAlign = 'center';
          const vxVal = (inst.vx ?? inst.velocidadX ?? inst.velocidad).toFixed(1);
          const vyVal = (inst.vy ?? inst.velocidadY ?? 2.0).toFixed(1);
          const velLabel = isPelota ? ` · v:(${vxVal}, ${vyVal})` : '';
          const label = instances.length > 1 
            ? `[${idx}] ø${Math.round(inst.diametro)}px${velLabel}` 
            : `ø${Math.round(inst.diametro)}px${velLabel}`;
          ctx.fillText(label, inst.x, inst.y - radius - 10);
        } else if (instances.length > 1) {
          // Label for other instances
          ctx.fillStyle = isPelota ? '#71717A' : '#94A3B8';
          ctx.font = '9px ui-monospace, SFMono-Regular, Menlo, monospace';
          ctx.textAlign = 'center';
          ctx.fillText(`[${idx}]`, inst.x, inst.y - radius - 6);
        }

        ctx.restore();
      });

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [instances, isPelota, selectedIndex, isContinuousAnimation]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;

    // Check if clicked on an instance
    let clickedIdx = -1;
    for (let i = instances.length - 1; i >= 0; i--) {
      const inst = instances[i];
      const r = inst.diametro / 2 + 8;
      const dx = clickX - inst.x;
      const dy = clickY - inst.y;
      if (dx * dx + dy * dy <= r * r) {
        clickedIdx = i;
        break;
      }
    }

    if (clickedIdx !== -1) {
      onSelectInstance(clickedIdx);
    } else if (onCanvasClick) {
      onCanvasClick(clickX, clickY);
    }
  };

  return (
    <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-xs flex flex-col">
      {/* Canvas Top Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-zinc-50 border-b border-zinc-200 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-semibold text-zinc-900">
            Lienzo Gráfico · {instances.length > 1 ? `${instances.length} Instancias en Memoria` : 'Instancia Única'}
          </span>
        </div>

        {/* Multi-instance pill selector if array exists */}
        {instances.length > 1 && (
          <div className="flex items-center gap-1">
            <span className="text-[11px] text-zinc-500 mr-1 hidden sm:inline">Seleccionar:</span>
            {instances.map((_, i) => (
              <button
                key={i}
                onClick={() => onSelectInstance(i)}
                className={`min-h-[28px] px-2 py-0.5 rounded-md font-mono text-[11px] font-medium transition-colors cursor-pointer ${
                  i === selectedIndex
                    ? 'bg-zinc-950 text-white font-bold'
                    : 'bg-zinc-200/80 hover:bg-zinc-300 text-zinc-800'
                }`}
              >
                [{i}]
              </button>
            ))}
          </div>
        )}
      </div>

      {/* HTML5 Canvas */}
      <div className="relative bg-zinc-50 flex items-center justify-center cursor-pointer">
        <canvas
          ref={canvasRef}
          width={500}
          height={320}
          onClick={handleCanvasClick}
          className="w-full h-auto block select-none"
        />

        {/* Floating honest indicator */}
        <div className="absolute bottom-2 left-2 right-2 px-3 py-1 rounded-lg bg-white/95 backdrop-blur-xs border border-zinc-200 text-[10px] text-zinc-500 flex items-center justify-between">
          <span className="flex items-center gap-1">
            <Info className="w-3 h-3 text-zinc-400" />
            <span>Simulación en tiempo real basada en la especificación de Processing Java</span>
          </span>
          <span className="font-mono text-zinc-400 font-bold">60 FPS</span>
        </div>
      </div>
    </div>
  );
};
