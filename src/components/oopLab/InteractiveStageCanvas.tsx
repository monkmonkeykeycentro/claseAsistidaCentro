import React, { useRef, useEffect } from 'react';
import { LabInstanceObject, LabModuleId } from '../../types/oopLab';
import { Info, Crosshair, Terminal } from 'lucide-react';

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

      // 1. Clear background — Generative Design palette
      if (isPelota) {
        ctx.fillStyle = '#F6F5F0'; // Warm generative paper tone
        ctx.fillRect(0, 0, width, height);

        // Subtle coordinate grid (every 50px)
        ctx.strokeStyle = '#E6E5DE';
        ctx.lineWidth = 1;

        for (let x = 50; x < width; x += 50) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
          ctx.stroke();
        }
        for (let y = 50; y < height; y += 50) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();
        }

        // Coordinate crosshair ticks (+) at major intersections (100, 200, 300, 400)
        ctx.strokeStyle = '#B8B9B3';
        ctx.lineWidth = 1;
        for (let x = 100; x < width; x += 100) {
          for (let y = 100; y < height; y += 100) {
            ctx.beginPath();
            ctx.moveTo(x - 4, y);
            ctx.lineTo(x + 4, y);
            ctx.moveTo(x, y - 4);
            ctx.lineTo(x, y + 4);
            ctx.stroke();
          }
        }

        // Subtle coordinate numerals along borders
        ctx.fillStyle = '#8F908A';
        ctx.font = '9px "IBM Plex Mono", monospace';
        ctx.textAlign = 'left';
        for (let x = 50; x < width; x += 100) {
          ctx.fillText(`x:${x}`, x + 4, 12);
        }
        for (let y = 50; y < height; y += 50) {
          ctx.fillText(`y:${y}`, 4, y - 4);
        }
      } else {
        // Burbuja: Deep Prussian / marine generative chamber
        ctx.fillStyle = '#0E1524';
        ctx.fillRect(0, 0, width, height);

        // Fluid gradient field
        const grad = ctx.createLinearGradient(0, 0, 0, height);
        grad.addColorStop(0, 'rgba(66, 99, 207, 0.15)');
        grad.addColorStop(1, 'rgba(14, 21, 36, 0.9)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);

        // Fine coordinate grid in cyan/cobalt
        ctx.strokeStyle = 'rgba(66, 99, 207, 0.1)';
        ctx.lineWidth = 1;
        for (let x = 50; x < width; x += 50) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
          ctx.stroke();
        }
        for (let y = 50; y < height; y += 50) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();
        }

        // Coordinate marks
        ctx.fillStyle = 'rgba(125, 211, 252, 0.4)';
        ctx.font = '9px "IBM Plex Mono", monospace';
        for (let x = 50; x < width; x += 100) {
          ctx.fillText(`x:${x}`, x + 4, 12);
        }
      }

      // 2. Continuous animation update if enabled
      if (isContinuousAnimation) {
        instances.forEach((inst) => {
          if (isPelota) {
            // 2D Movement with X and Y velocities
            const vx = inst.vx ?? inst.velocidadX ?? inst.velocidad;
            const vy = inst.vy ?? inst.velocidadY ?? 2.0;
            inst.x += vx;
            inst.y += vy;

            // Organic 2D Perlin Noise Floating Modulation in X and Y
            if (inst.isFloating) {
              inst.floatOffset = (inst.floatOffset ?? 0) + 0.015;
              const fx = (noise2D(inst.x * 0.01, inst.floatOffset) - 0.5) * 3.5;
              const fy = (noise2D(inst.y * 0.01 + 50, inst.floatOffset) - 0.5) * 2.8;
              inst.x += fx;
              inst.y += fy;
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

            // Vaivén y corriente subacuática orgánica con ruido Perlin (noise) en X e Y
            inst.floatOffset = (inst.floatOffset ?? 0) + 0.018;
            const intensity = inst.isFloating ? 2.5 : 1.0;
            const pasoX = (noise2D(inst.x * 0.015, inst.floatOffset) - 0.5) * intensity;
            const pasoY = (noise2D(inst.y * 0.015 + 80, inst.floatOffset) - 0.5) * (intensity * 0.7);
            inst.x += pasoX;
            inst.y += pasoY;

            const r = inst.diametro / 2;
            // Respawn when leaves top
            if (inst.y < -r) {
              inst.y = height + r;
              inst.x = 40 + Math.random() * (width - 80);
            }
          }
        });
      }

      // 3. Render all instances with clean geometric styling
      instances.forEach((inst, idx) => {
        const isSelected = idx === selectedIndex;
        const radius = inst.diametro / 2;

        ctx.save();

        if (isPelota) {
          // Sharp graphic shadow underneath
          ctx.fillStyle = 'rgba(24, 24, 24, 0.08)';
          ctx.beginPath();
          ctx.ellipse(inst.x, inst.y + radius * 0.9, radius * 0.9, radius * 0.22, 0, 0, Math.PI * 2);
          ctx.fill();

          // Pelota Body (Primary fill with solid edge)
          ctx.fillStyle = inst.colorHex;
          ctx.beginPath();
          ctx.arc(inst.x, inst.y, radius, 0, Math.PI * 2);
          ctx.fill();

          // Editorial vector outline
          ctx.strokeStyle = '#181818';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // Geometric highlight
          ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
          ctx.beginPath();
          ctx.arc(inst.x - radius * 0.32, inst.y - radius * 0.32, radius * 0.22, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Burbuja Body with translucent glass fill
          const opac = (inst.opacidad ?? 160) / 255;
          ctx.fillStyle = `rgba(125, 211, 252, ${opac * 0.4})`;
          ctx.beginPath();
          ctx.arc(inst.x, inst.y, radius, 0, Math.PI * 2);
          ctx.fill();

          // Rim stroke in bright white/cyan
          ctx.strokeStyle = `rgba(255, 255, 255, ${Math.min(1, opac + 0.4)})`;
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // Inner ring
          ctx.strokeStyle = 'rgba(66, 99, 207, 0.5)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(inst.x, inst.y, radius * 0.85, 0, Math.PI * 2);
          ctx.stroke();

          // Specular specular spot
          ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
          ctx.beginPath();
          ctx.arc(inst.x - radius * 0.32, inst.y - radius * 0.32, radius * 0.18, 0, Math.PI * 2);
          ctx.fill();
        }

        // Floating Aura if flotar() is active
        if (inst.isFloating) {
          ctx.save();
          ctx.strokeStyle = isPelota ? '#4263CF' : '#D5E35F';
          ctx.lineWidth = 1;
          ctx.setLineDash([2, 4]);
          ctx.beginPath();
          ctx.arc(inst.x, inst.y, radius + 6, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }

        // Selection Target & Coordinate Callout
        if (isSelected) {
          // Outer hairline bounding circle
          ctx.strokeStyle = '#4263CF';
          ctx.lineWidth = 1.5;
          ctx.setLineDash([4, 3]);
          ctx.beginPath();
          ctx.arc(inst.x, inst.y, radius + 8, 0, Math.PI * 2);
          ctx.stroke();
          ctx.setLineDash([]);

          // Center origin crosshairs
          ctx.strokeStyle = '#4263CF';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(inst.x - 6, inst.y);
          ctx.lineTo(inst.x + 6, inst.y);
          ctx.moveTo(inst.x, inst.y - 6);
          ctx.lineTo(inst.x, inst.y + 6);
          ctx.stroke();

          // Coordinate label in monospace
          ctx.fillStyle = '#181818';
          ctx.font = 'bold 10px "IBM Plex Mono", monospace';
          ctx.textAlign = 'center';
          const posLabel = `(${Math.round(inst.x)}, ${Math.round(inst.y)}) · ø${Math.round(inst.diametro)}`;
          
          // Badge background
          ctx.fillStyle = '#F6F5F0';
          ctx.strokeStyle = '#DCDDD8';
          ctx.lineWidth = 1;
          const textW = ctx.measureText(posLabel).width + 12;
          ctx.fillRect(inst.x - textW / 2, inst.y - radius - 22, textW, 16);
          ctx.strokeRect(inst.x - textW / 2, inst.y - radius - 22, textW, 16);

          ctx.fillStyle = '#181818';
          ctx.fillText(posLabel, inst.x, inst.y - radius - 10);
        } else if (instances.length > 1) {
          // Index label for other instances in array
          ctx.fillStyle = isPelota ? '#767773' : 'rgba(255, 255, 255, 0.6)';
          ctx.font = '10px "IBM Plex Mono", monospace';
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

  const selectedInst = instances[selectedIndex] || instances[0];

  return (
    <div className="bg-[#FFFFFF] border border-[#DCDDD8] flex flex-col">
      {/* Canvas Top Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#EEEDE8] border-b border-[#DCDDD8] text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-[#4263CF] inline-block" />
          <span className="font-bold text-[#181818]">
            LIENZO CARTESIANO
          </span>
          <span className="text-[#DCDDD8]">/</span>
          <span className="text-[#767773]">
            {instances.length > 1 ? `${instances.length} instancias [${selectedIndex}]` : 'Instancia única'}
          </span>
        </div>

        {/* Multi-instance tab selector if array exists */}
        {instances.length > 1 && (
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-[#767773] mr-1 hidden sm:inline">Índice:</span>
            {instances.map((_, i) => (
              <button
                key={i}
                onClick={() => onSelectInstance(i)}
                className={`min-h-[26px] px-2 py-0.5 font-mono text-[11px] border transition-colors cursor-pointer ${
                  i === selectedIndex
                    ? 'bg-[#181818] text-[#F6F5F0] border-[#181818] font-bold'
                    : 'bg-[#FFFFFF] hover:bg-[#DCDDD8] text-[#181818] border-[#DCDDD8]'
                }`}
              >
                [{i}]
              </button>
            ))}
          </div>
        )}
      </div>

      {/* HTML5 Canvas with Generative Coordinates */}
      <div className="relative bg-[#F6F5F0] flex items-center justify-center cursor-crosshair">
        <canvas
          ref={canvasRef}
          width={500}
          height={320}
          onClick={handleCanvasClick}
          className="w-full h-auto block select-none"
        />

        {/* Minimalist coordinate callout strip */}
        <div className="absolute top-2 right-2 px-2 py-1 bg-[#F6F5F0]/90 backdrop-blur-xs border border-[#DCDDD8] font-mono text-[10px] text-[#767773] flex items-center gap-2">
          <span>x:{Math.round(selectedInst.x)}</span>
          <span className="text-[#DCDDD8]">|</span>
          <span>y:{Math.round(selectedInst.y)}</span>
          <span className="text-[#DCDDD8]">|</span>
          <span>ø:{Math.round(selectedInst.diametro)}px</span>
        </div>
      </div>

      {/* Canvas Bottom Status Bar */}
      <div className="px-4 py-2 bg-[#EEEDE8] border-t border-[#DCDDD8] text-[11px] font-mono text-[#767773] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[#181818] font-semibold">500 × 320 px</span>
          <span className="text-[#DCDDD8]">/</span>
          <span>Clic en el lienzo para reubicar objeto</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
          <span className="text-[#181818]">60 FPS</span>
        </div>
      </div>
    </div>
  );
};

// Smooth 2D Perlin pseudo-noise generator for natural fluid movement
function noise2D(x: number, y: number): number {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = x - xi;
  const yf = y - yi;

  const hash = (i: number, j: number) => {
    const s = Math.sin(i * 127.1 + j * 311.7) * 43758.5453;
    return s - Math.floor(s);
  };

  // Smoothstep interpolation curve (3t^2 - 2t^3)
  const u = xf * xf * (3 - 2 * xf);
  const v = yf * yf * (3 - 2 * yf);

  const n00 = hash(xi, yi);
  const n10 = hash(xi + 1, yi);
  const n01 = hash(xi, yi + 1);
  const n11 = hash(xi + 1, yi + 1);

  const nx0 = n00 * (1 - u) + n10 * u;
  const nx1 = n01 * (1 - u) + n11 * u;
  return nx0 * (1 - v) + nx1 * v;
}
