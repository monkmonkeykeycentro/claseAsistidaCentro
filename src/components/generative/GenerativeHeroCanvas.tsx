import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Sliders, RefreshCw, Play, Pause, Compass } from 'lucide-react';

export type HeroAlgorithm = 'grid-modules' | 'wave-field' | 'particle-swarm' | 'parametric-orbit';

export const GenerativeHeroCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isVisibleRef = useRef<boolean>(true);

  // Generative Parameters
  const [algorithm, setAlgorithm] = useState<HeroAlgorithm>('grid-modules');
  const [seed, setSeed] = useState<number>(314);
  const [density, setDensity] = useState<number>(10);
  const [speed, setSpeed] = useState<number>(1.0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [mousePos, setMousePos] = useState<{ x: number; y: number; active: boolean }>({
    x: 200,
    y: 160,
    active: false,
  });

  // Observe visibility to pause rendering when offscreen
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisibleRef.current = entry.isIntersecting;
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let t = 0;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const makeRnd = (s: number) => {
      let st = s;
      return () => {
        st = (st * 9301 + 49297) % 233280;
        return st / 233280;
      };
    };

    const render = () => {
      if (!isVisibleRef.current || (!isPlaying && t > 0)) {
        animId = requestAnimationFrame(render);
        return;
      }

      const w = canvas.width;
      const h = canvas.height;

      // Clean background
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, w, h);

      // Subtle editorial coordinate grid
      ctx.strokeStyle = '#EFEFEA';
      ctx.lineWidth = 1;
      for (let x = 40; x < w; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 40; y < h; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      const rnd = makeRnd(seed);

      // Render based on selected algorithm
      if (algorithm === 'grid-modules') {
        renderGridModules(ctx, w, h, t, density, mousePos, rnd);
      } else if (algorithm === 'wave-field') {
        renderWaveField(ctx, w, h, t, density, mousePos);
      } else if (algorithm === 'particle-swarm') {
        renderParticleSwarm(ctx, w, h, t, density, mousePos, rnd);
      } else {
        renderParametricOrbit(ctx, w, h, t, density, mousePos);
      }

      // Origin mark (0,0) and bounding tick
      ctx.fillStyle = '#626262';
      ctx.font = '9px "IBM Plex Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText('+ [0,0]', 8, 16);
      ctx.textAlign = 'right';
      ctx.fillText(`${w}×${h} px`, w - 8, h - 8);

      if (mousePos.active) {
        ctx.fillStyle = '#2868D9';
        ctx.fillText(`cursor: (${Math.round(mousePos.x)}, ${Math.round(mousePos.y)})`, w - 8, 16);
      }

      if (!prefersReducedMotion && isPlaying) {
        t += 0.012 * speed;
      }
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [algorithm, seed, density, speed, isPlaying, mousePos]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    setMousePos({
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
      active: true,
    });
  };

  const handleMouseLeave = () => {
    setMousePos((prev) => ({ ...prev, active: false }));
  };

  const handleRandomizeSeed = () => {
    setSeed(Math.floor(Math.random() * 9000) + 100);
  };

  return (
    <div ref={containerRef} className="bg-[#FFFFFF] border border-[#DEDDD7] flex flex-col font-mono text-xs">
      {/* Top Header / Mode Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-[#FFFFFF] border-b border-[#DEDDD7]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-[#2868D9] inline-block" />
          <span className="font-bold text-[#141414]">ESTUDIO GENERATIVO</span>
          <span className="text-[#DEDDD7]">/</span>
          <span className="text-[#626262]">FIG. 01 · Reglas en vivo</span>
        </div>

        {/* Algorithm Tabs */}
        <div className="flex items-center gap-1">
          {[
            { id: 'grid-modules', label: '01. Módulos' },
            { id: 'wave-field', label: '02. Ondas' },
            { id: 'particle-swarm', label: '03. Partículas' },
            { id: 'parametric-orbit', label: '04. Polar' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setAlgorithm(tab.id as HeroAlgorithm)}
              className={`min-h-[28px] px-2.5 py-0.5 border text-[11px] transition-colors cursor-pointer ${
                algorithm === tab.id
                  ? 'bg-[#141414] text-[#F7F6F1] border-[#141414] font-bold'
                  : 'bg-[#FFFFFF] text-[#626262] border-[#DEDDD7] hover:text-[#141414]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Canvas Viewport */}
      <div className="relative bg-[#FFFFFF] flex items-center justify-center cursor-crosshair">
        <canvas
          ref={canvasRef}
          width={520}
          height={320}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="w-full h-auto block select-none"
        />
      </div>

      {/* Control Strip */}
      <div className="px-4 py-3 bg-[#F7F6F1] border-t border-[#DEDDD7] flex flex-wrap items-center justify-between gap-3">
        {/* Sliders: Density & Speed */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-[#626262] uppercase">Densidad:</span>
            <input
              type="range"
              min={6}
              max={16}
              value={density}
              onChange={(e) => setDensity(Number(e.target.value))}
              className="w-20 accent-[#2868D9] cursor-pointer"
            />
            <span className="text-[11px] font-bold text-[#141414] tabular-nums">{density}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] text-[#626262] uppercase">Velocidad:</span>
            <input
              type="range"
              min={0.2}
              max={2.5}
              step={0.1}
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="w-16 accent-[#2868D9] cursor-pointer"
            />
            <span className="text-[11px] font-bold text-[#141414] tabular-nums">{speed.toFixed(1)}x</span>
          </div>
        </div>

        {/* Seed & Play/Pause */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="min-h-[30px] px-2.5 py-1 bg-[#FFFFFF] border border-[#DEDDD7] hover:bg-[#EFEFEA] text-[#141414] flex items-center gap-1.5 transition-colors cursor-pointer"
            title={isPlaying ? 'Pausar animación' : 'Reanudar animación'}
          >
            {isPlaying ? <Pause className="w-3 h-3 text-[#D9AA3D]" /> : <Play className="w-3 h-3 text-[#2868D9]" />}
            <span>{isPlaying ? 'Pausar' : 'Reanudar'}</span>
          </button>

          <button
            onClick={handleRandomizeSeed}
            className="min-h-[30px] px-2.5 py-1 bg-[#141414] hover:bg-[#2868D9] text-[#F7F6F1] flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Cambiar semilla aleatoria reproducible"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Semilla #{seed}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Algorithm 1: Grid of Parametric Modules ---
function renderGridModules(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  density: number,
  mouse: { x: number; y: number; active: boolean },
  rnd: () => number
) {
  const cols = density;
  const rows = Math.round(density * 0.6);
  const cellW = w / cols;
  const cellH = h / rows;

  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows; r++) {
      const cx = (c + 0.5) * cellW;
      const cy = (r + 0.5) * cellH;

      const targetX = mouse.active ? mouse.x : w / 2;
      const targetY = mouse.active ? mouse.y : h / 2;
      const dist = Math.hypot(cx - targetX, cy - targetY);
      const angle = Math.atan2(cy - targetY, cx - targetX);

      const wave = Math.sin(t * 1.5 + dist * 0.02 + (c + r) * 0.2);

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle + wave * 0.4);

      const maxRadius = Math.min(cellW, cellH) * 0.42;
      const currentR = Math.max(2, maxRadius * (1 + wave * 0.25));

      if ((c * r) % 7 === 0) {
        ctx.strokeStyle = '#2868D9';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(-currentR, -currentR, currentR * 2, currentR * 2);
      } else if ((c + r) % 5 === 0) {
        ctx.strokeStyle = '#D9AA3D';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(-currentR, 0);
        ctx.lineTo(currentR, 0);
        ctx.moveTo(0, -currentR);
        ctx.lineTo(0, currentR);
        ctx.stroke();
      } else {
        ctx.strokeStyle = 'rgba(20, 20, 20, 0.45)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(0, 0, currentR * 0.8, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.restore();
    }
  }
}

// --- Algorithm 2: Mathematical Wave Field ---
function renderWaveField(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  density: number,
  mouse: { x: number; y: number; active: boolean }
) {
  const lineCount = density + 6;
  const stepY = h / (lineCount + 1);

  for (let i = 1; i <= lineCount; i++) {
    const baseY = i * stepY;
    const isAccent = i % 4 === 0;

    ctx.beginPath();
    ctx.strokeStyle = isAccent ? '#2868D9' : 'rgba(20, 20, 20, 0.35)';
    ctx.lineWidth = isAccent ? 1.5 : 1;

    for (let x = 0; x <= w; x += 4) {
      const distToMouse = mouse.active ? Math.hypot(x - mouse.x, baseY - mouse.y) : 120;
      const mouseInfluence = mouse.active ? Math.max(0, 1 - distToMouse / 90) * 16 : 0;
      const wave = Math.sin(x * 0.03 + t + i * 0.35) * 8 + Math.cos(x * 0.015 - t * 0.6) * 5;
      const y = baseY + wave - mouseInfluence;

      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
}

// --- Algorithm 3: Particle Swarm & Proximity Vectors ---
function renderParticleSwarm(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  density: number,
  mouse: { x: number; y: number; active: boolean },
  rnd: () => number
) {
  const particleCount = density * 4;
  const particles: { x: number; y: number; id: number }[] = [];

  for (let i = 0; i < particleCount; i++) {
    const seedAngle = i * 0.25;
    const baseR = 30 + (i % 6) * 25;
    let px = w / 2 + Math.cos(seedAngle + t * 0.5) * baseR;
    let py = h / 2 + Math.sin(seedAngle * 1.3 - t * 0.4) * (baseR * 0.7);

    if (mouse.active) {
      const dist = Math.hypot(px - mouse.x, py - mouse.y);
      if (dist < 80) {
        const ang = Math.atan2(py - mouse.y, px - mouse.x);
        const force = (1 - dist / 80) * 20;
        px += Math.cos(ang) * force;
        py += Math.sin(ang) * force;
      }
    }

    particles.push({ x: px, y: py, id: i });
  }

  // Draw connecting proximity lines
  ctx.strokeStyle = 'rgba(40, 104, 217, 0.15)';
  ctx.lineWidth = 1;
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const d = Math.hypot(particles[i].x - particles[j].x, particles[i].y - particles[j].y);
      if (d < 45) {
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.stroke();
      }
    }
  }

  // Draw nodes
  particles.forEach((p, idx) => {
    ctx.fillStyle = idx % 5 === 0 ? '#D9AA3D' : '#141414';
    ctx.beginPath();
    ctx.arc(p.x, p.y, idx % 5 === 0 ? 3.5 : 2, 0, Math.PI * 2);
    ctx.fill();
  });
}

// --- Algorithm 4: Concentric Polar Polygon Orbits ---
function renderParametricOrbit(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  density: number,
  mouse: { x: number; y: number; active: boolean }
) {
  const cx = w / 2;
  const cy = h / 2;
  const rings = density;
  const maxR = Math.min(w, h) * 0.44;

  for (let i = 1; i <= rings; i++) {
    const r = (i / rings) * maxR;
    const sides = 3 + (i % 5);
    const rotation = (i % 2 === 0 ? 1 : -1) * t * 0.35 + i * 0.3;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rotation);

    ctx.beginPath();
    ctx.strokeStyle = i === 5 ? '#2868D9' : i === 8 ? '#D9AA3D' : 'rgba(20, 20, 20, 0.4)';
    ctx.lineWidth = i === 5 ? 1.5 : 1;

    for (let s = 0; s < sides; s++) {
      const theta = (s / sides) * Math.PI * 2;
      const x = Math.cos(theta) * r;
      const y = Math.sin(theta) * r;
      if (s === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();

    ctx.restore();
  }
}
