import React, { useRef, useEffect } from 'react';
import { LabInstanceObject, LabModuleId } from '../../types/oopLab';

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

      // 1. Clear background — Friendly Generative palette
      if (isPelota) {
        ctx.fillStyle = '#F7F8F4'; // Gentle generative canvas tone
        ctx.fillRect(0, 0, width, height);

        // Subtle coordinate grid (every 50px)
        ctx.strokeStyle = '#E1E7E1';
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
        ctx.strokeStyle = '#CCD5CC';
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
        ctx.fillStyle = '#8A968C';
        ctx.font = '9px "IBM Plex Mono", monospace';
        ctx.textAlign = 'left';
        for (let x = 50; x < width; x += 100) {
          ctx.fillText(`x:${x}`, x + 4, 12);
        }
        for (let y = 50; y < height; y += 50) {
          ctx.fillText(`y:${y}`, 4, y - 4);
        }
      } else {
        // Burbuja: Deep generative chamber
        ctx.fillStyle = '#0F1822';
        ctx.fillRect(0, 0, width, height);

        // Fluid gradient field
        const grad = ctx.createLinearGradient(0, 0, 0, height);
        grad.addColorStop(0, 'rgba(64, 123, 93, 0.22)');
        grad.addColorStop(1, 'rgba(15, 24, 34, 0.95)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);

        // Fine coordinate grid
        ctx.strokeStyle = 'rgba(232, 238, 232, 0.08)';
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
        ctx.fillStyle = 'rgba(230, 182, 90, 0.6)';
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

            // Organic 2D Perlin Noise Floating Modulation in X and Y (decoupled seeds)
            if (inst.isFloating) {
              const paso = inst.floatPaso ?? 0.015;
              const amp = inst.floatAmp ?? 3.5;
              inst.tX = (inst.tX ?? (inst.id * 137.5)) + paso;
              inst.tY = (inst.tY ?? (inst.id * 293.1 + 800)) + paso;

              // Independent 1D Perlin noise along decoupled time dimensions
              const fx = (noise2D(inst.tX, 0) - 0.5) * 2 * amp;
              const fy = (noise2D(inst.tY, 0) - 0.5) * 2 * (amp * 0.7);
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

            // Vaivén y corriente subacuática orgánica con ruido Perlin (noise) desacoplado en X e Y
            const paso = inst.floatPaso ?? 0.012;
            const amp = inst.floatAmp ?? (inst.isFloating ? 2.5 : 1.2);
            inst.tX = (inst.tX ?? (inst.id * 97.3)) + paso;
            inst.tY = (inst.tY ?? (inst.id * 314.1 + 1000)) + paso;

            const pasoX = (noise2D(inst.tX, 0) - 0.5) * 2 * amp;
            const pasoY = (noise2D(inst.tY, 0) - 0.5) * 2 * (amp * 0.6);
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
          // Soft shadow underneath
          ctx.fillStyle = 'rgba(35, 42, 36, 0.08)';
          ctx.beginPath();
          ctx.ellipse(inst.x, inst.y + radius * 0.9, radius * 0.9, radius * 0.22, 0, 0, Math.PI * 2);
          ctx.fill();

          // Pelota Body
          ctx.fillStyle = inst.colorHex;
          ctx.beginPath();
          ctx.arc(inst.x, inst.y, radius, 0, Math.PI * 2);
          ctx.fill();

          // Outline
          ctx.strokeStyle = '#232A24';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // Geometric highlight
          ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
          ctx.beginPath();
          ctx.arc(inst.x - radius * 0.32, inst.y - radius * 0.32, radius * 0.22, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Burbuja Body with translucent glass fill
          const opac = (inst.opacidad ?? 160) / 255;
          ctx.fillStyle = `rgba(164, 214, 230, ${opac * 0.35})`;
          ctx.beginPath();
          ctx.arc(inst.x, inst.y, radius, 0, Math.PI * 2);
          ctx.fill();

          // Rim stroke in bright white/soft green
          ctx.strokeStyle = `rgba(255, 255, 255, ${Math.min(1, opac + 0.4)})`;
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // Inner ring
          ctx.strokeStyle = 'rgba(64, 123, 93, 0.4)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(inst.x, inst.y, radius * 0.85, 0, Math.PI * 2);
          ctx.stroke();

          // Specular spot
          ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
          ctx.beginPath();
          ctx.arc(inst.x - radius * 0.32, inst.y - radius * 0.32, radius * 0.18, 0, Math.PI * 2);
          ctx.fill();
        }

        // Floating Aura if flotar() is active
        if (inst.isFloating) {
          ctx.save();
          ctx.strokeStyle = isPelota ? '#407B5D' : '#E6B65A';
          ctx.lineWidth = 1.5;
          ctx.setLineDash([3, 4]);
          ctx.beginPath();
          ctx.arc(inst.x, inst.y, radius + 6, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }

        // Selection Target & Coordinate Callout
        if (isSelected) {
          // Outer hairline bounding circle in #407B5D
          ctx.strokeStyle = '#407B5D';
          ctx.lineWidth = 1.5;
          ctx.setLineDash([4, 3]);
          ctx.beginPath();
          ctx.arc(inst.x, inst.y, radius + 8, 0, Math.PI * 2);
          ctx.stroke();
          ctx.setLineDash([]);

          // Center origin crosshairs
          ctx.strokeStyle = '#407B5D';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(inst.x - 6, inst.y);
          ctx.lineTo(inst.x + 6, inst.y);
          ctx.moveTo(inst.x, inst.y - 6);
          ctx.lineTo(inst.x, inst.y + 6);
          ctx.stroke();

          // Coordinate label in monospace
          ctx.font = 'bold 10px "IBM Plex Mono", monospace';
          ctx.textAlign = 'center';
          const posLabel = `(${Math.round(inst.x)}, ${Math.round(inst.y)}) · ø${Math.round(inst.diametro)}`;
          
          // Badge background with gentle rounded rect simulation
          const textW = ctx.measureText(posLabel).width + 14;
          const badgeX = inst.x - textW / 2;
          const badgeY = inst.y - radius - 24;
          
          ctx.fillStyle = '#FFFFFF';
          ctx.strokeStyle = '#E1E7E1';
          ctx.lineWidth = 1;
          ctx.fillRect(badgeX, badgeY, textW, 18);
          ctx.strokeRect(badgeX, badgeY, textW, 18);

          ctx.fillStyle = '#232A24';
          ctx.fillText(posLabel, inst.x, inst.y - radius - 11);
        } else if (instances.length > 1) {
          // Index label for other instances in array
          ctx.fillStyle = isPelota ? '#59645C' : 'rgba(255, 255, 255, 0.7)';
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
    <div className="bg-[#FFFFFF] border border-[#E1E7E1] rounded-2xl overflow-hidden shadow-xs flex flex-col font-sans">
      {/* Canvas Top Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#F7F8F4] border-b border-[#E1E7E1] text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#407B5D] inline-block" />
          <span className="font-bold text-[#232A24]">
            Lienzo Cartesiano
          </span>
          <span className="text-[#E1E7E1]">/</span>
          <span className="text-[#59645C] text-[11px]">
            {instances.length > 1 ? `${instances.length} instancias [${selectedIndex}]` : 'Instancia única activa'}
          </span>
        </div>

        {/* Multi-instance tab selector if array exists */}
        {instances.length > 1 && (
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-[#59645C] mr-1 hidden sm:inline font-medium">Índice:</span>
            {instances.map((_, i) => (
              <button
                key={i}
                onClick={() => onSelectInstance(i)}
                className={`min-h-[28px] px-2.5 py-0.5 rounded-lg font-mono text-[11px] border transition-colors cursor-pointer ${
                  i === selectedIndex
                    ? 'bg-[#407B5D] text-white border-[#407B5D] font-bold shadow-xs'
                    : 'bg-[#FFFFFF] hover:bg-[#E8EEE8] text-[#232A24] border-[#E1E7E1]'
                }`}
              >
                [{i}]
              </button>
            ))}
          </div>
        )}
      </div>

      {/* HTML5 Canvas with Generative Coordinates */}
      <div className="relative bg-[#F7F8F4] flex items-center justify-center cursor-crosshair">
        <canvas
          ref={canvasRef}
          width={500}
          height={320}
          onClick={handleCanvasClick}
          className="w-full h-auto block select-none"
        />

        {/* Minimalist coordinate callout strip */}
        <div className="absolute top-2.5 right-2.5 px-3 py-1.5 bg-[#FFFFFF]/95 backdrop-blur-xs border border-[#E1E7E1] rounded-xl font-mono text-[10px] text-[#59645C] shadow-xs flex items-center gap-2">
          <span>x:{Math.round(selectedInst.x)}</span>
          <span className="text-[#E1E7E1]">|</span>
          <span>y:{Math.round(selectedInst.y)}</span>
          <span className="text-[#E1E7E1]">|</span>
          <span>ø:{Math.round(selectedInst.diametro)}px</span>
          <span className="text-[#E1E7E1]">|</span>
          <span className="text-[#407B5D] font-semibold">tX:{(selectedInst.tX ?? 0).toFixed(1)}</span>
          <span className="text-[#E1E7E1]">|</span>
          <span className="text-[#407B5D] font-semibold">tY:{(selectedInst.tY ?? (isPelota ? 500 : 1000)).toFixed(1)}</span>
        </div>
      </div>

      {/* Canvas Bottom Status Bar */}
      <div className="px-4 py-2.5 bg-[#F7F8F4] border-t border-[#E1E7E1] text-[11px] text-[#59645C] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[#232A24] font-medium font-mono text-[11px]">500 × 320 px</span>
          <span className="text-[#E1E7E1]">/</span>
          <span>Haz clic en el lienzo para reposicionar</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#407B5D] inline-block" />
          <span className="text-[#232A24] font-mono text-[11px]">60 FPS</span>
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
