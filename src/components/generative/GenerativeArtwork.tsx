import React, { useRef, useEffect } from 'react';

export type GenerativeFamily = 'repetition' | 'linefield' | 'points' | 'parametric' | 'topic-preview';

interface GenerativeArtworkProps {
  family?: GenerativeFamily;
  topicNumber?: number;
  seed?: number;
  width?: number;
  height?: number;
  interactive?: boolean;
  colorMode?: 'monochrome' | 'accent-blue' | 'accent-yellow' | 'accent-red' | 'editorial';
  className?: string;
  caption?: string;
}

export const GenerativeArtwork: React.FC<GenerativeArtworkProps> = ({
  family = 'repetition',
  topicNumber,
  seed = 42,
  width = 240,
  height = 160,
  interactive = false,
  colorMode = 'editorial',
  className = '',
  caption,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef<{ x: number; y: number; active: boolean }>({ x: width / 2, y: height / 2, active: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let t = 0;

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Pseudo-random seeded generator
    const makeRandom = (s: number) => {
      let state = s;
      return () => {
        state = (state * 9301 + 49297) % 233280;
        return state / 233280;
      };
    };

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Clean background
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);

      // Subtle hairline border
      ctx.strokeStyle = '#DEDDD7';
      ctx.lineWidth = 1;
      ctx.strokeRect(0.5, 0.5, width - 1, height - 1);

      const rnd = makeRandom(seed + (topicNumber || 1) * 73);

      // Determine palette based on colorMode
      let strokeColor = '#141414';
      let accentColor = '#2868D9';
      if (colorMode === 'accent-yellow') accentColor = '#D9AA3D';
      if (colorMode === 'accent-red') accentColor = '#D34E43';
      if (colorMode === 'monochrome') accentColor = '#141414';

      // Select generative rule based on topicNumber or family
      if (topicNumber !== undefined) {
        renderTopicVisual(ctx, topicNumber, width, height, t, rnd, mouseRef.current, strokeColor, accentColor);
      } else {
        switch (family) {
          case 'repetition':
            renderRepetition(ctx, width, height, t, rnd, mouseRef.current, strokeColor, accentColor);
            break;
          case 'linefield':
            renderLineField(ctx, width, height, t, rnd, mouseRef.current, strokeColor, accentColor);
            break;
          case 'points':
            renderPoints(ctx, width, height, t, rnd, mouseRef.current, strokeColor, accentColor);
            break;
          case 'parametric':
            renderParametric(ctx, width, height, t, rnd, mouseRef.current, strokeColor, accentColor);
            break;
          default:
            renderRepetition(ctx, width, height, t, rnd, mouseRef.current, strokeColor, accentColor);
        }
      }

      t += prefersReducedMotion ? 0 : 0.015;
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => cancelAnimationFrame(animId);
  }, [family, topicNumber, seed, width, height, colorMode]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!interactive) return;
    const rect = e.currentTarget.getBoundingClientRect();
    mouseRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      active: true,
    };
  };

  const handleMouseLeave = () => {
    mouseRef.current.active = false;
  };

  return (
    <div className={`inline-flex flex-col ${className}`}>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="block select-none"
        style={{ width: `${width}px`, height: `${height}px` }}
      />
      {caption && (
        <span className="text-[10px] font-mono text-[#626262] mt-1.5 uppercase tracking-wider block">
          {caption}
        </span>
      )}
    </div>
  );
};

// --- FAMILIA A: Repetición y módulos ---
function renderRepetition(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  rnd: () => number,
  mouse: { x: number; y: number; active: boolean },
  mainCol: string,
  accentCol: string
) {
  const cols = 8;
  const rows = 5;
  const cellW = w / cols;
  const cellH = h / rows;

  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows; r++) {
      const cx = (c + 0.5) * cellW;
      const cy = (r + 0.5) * cellH;

      const d = Math.hypot(cx - (mouse.active ? mouse.x : w / 2), cy - (mouse.active ? mouse.y : h / 2));
      const phase = Math.sin(t + d * 0.03 + (c + r) * 0.4);

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(phase * 0.6);

      const size = Math.max(3, (cellW * 0.4) * (1 + phase * 0.3));

      if ((c + r) % 3 === 0) {
        ctx.strokeStyle = accentCol;
        ctx.lineWidth = 1.5;
        ctx.strokeRect(-size / 2, -size / 2, size, size);
      } else {
        ctx.strokeStyle = mainCol;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(0, 0, size * 0.45, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.restore();
    }
  }
}

// --- FAMILIA B: Campos de líneas ---
function renderLineField(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  rnd: () => number,
  mouse: { x: number; y: number; active: boolean },
  mainCol: string,
  accentCol: string
) {
  const lineCount = 18;
  const stepY = h / (lineCount + 1);

  for (let i = 1; i <= lineCount; i++) {
    const baseY = i * stepY;
    const isAccent = i % 5 === 0;

    ctx.beginPath();
    ctx.strokeStyle = isAccent ? accentCol : 'rgba(20, 20, 20, 0.4)';
    ctx.lineWidth = isAccent ? 1.5 : 1;

    for (let x = 0; x <= w; x += 4) {
      const distToMouse = mouse.active ? Math.hypot(x - mouse.x, baseY - mouse.y) : 100;
      const influence = mouse.active ? Math.max(0, 1 - distToMouse / 80) * 12 : 0;
      const wave = Math.sin(x * 0.035 + t + i * 0.3) * 6 + Math.cos(x * 0.02 - t * 0.5) * 4;
      const y = baseY + wave - influence;

      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
}

// --- FAMILIA C: Sistemas de puntos ---
function renderPoints(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  rnd: () => number,
  mouse: { x: number; y: number; active: boolean },
  mainCol: string,
  accentCol: string
) {
  const cols = 12;
  const rows = 8;
  const dx = w / cols;
  const dy = h / rows;

  for (let c = 1; c < cols; c++) {
    for (let r = 1; r < rows; r++) {
      let px = c * dx;
      let py = r * dy;

      if (mouse.active) {
        const dist = Math.hypot(px - mouse.x, py - mouse.y);
        if (dist < 70) {
          const angle = Math.atan2(py - mouse.y, px - mouse.x);
          const push = (1 - dist / 70) * 14;
          px += Math.cos(angle) * push;
          py += Math.sin(angle) * push;
        }
      }

      const pulse = Math.sin(t * 1.5 + c * 0.5 + r * 0.3);
      const radius = 1.2 + Math.abs(pulse) * 1.8;

      ctx.beginPath();
      ctx.fillStyle = (c * r) % 5 === 0 ? accentCol : mainCol;
      ctx.arc(px, py, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

// --- FAMILIA D: Geometrías paramétricas ---
function renderParametric(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  rnd: () => number,
  mouse: { x: number; y: number; active: boolean },
  mainCol: string,
  accentCol: string
) {
  const cx = w / 2;
  const cy = h / 2;
  const rings = 7;
  const maxR = Math.min(w, h) * 0.42;

  for (let i = 1; i <= rings; i++) {
    const r = (i / rings) * maxR;
    const sides = 3 + (i % 4);
    const angleOffset = t * (i % 2 === 0 ? 0.3 : -0.3) + i * 0.4;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angleOffset);

    ctx.beginPath();
    ctx.strokeStyle = i === 4 ? accentCol : 'rgba(20, 20, 20, 0.5)';
    ctx.lineWidth = i === 4 ? 1.5 : 1;

    for (let s = 0; s < sides; s++) {
      const theta = (s / sides) * Math.PI * 2;
      const vx = Math.cos(theta) * r;
      const vy = Math.sin(theta) * r;
      if (s === 0) ctx.moveTo(vx, vy);
      else ctx.lineTo(vx, vy);
    }
    ctx.closePath();
    ctx.stroke();

    ctx.restore();
  }
}

// --- Topic-Specific Visualizations (Connecting code concept to form) ---
function renderTopicVisual(
  ctx: CanvasRenderingContext2D,
  topicNum: number,
  w: number,
  h: number,
  t: number,
  rnd: () => number,
  mouse: { x: number; y: number; active: boolean },
  mainCol: string,
  accentCol: string
) {
  switch (topicNum) {
    case 1: // Coordenadas: Retícula cartesiana con ejes y puntos dinámicos
      renderCoordinatesTopic(ctx, w, h, t, mainCol, accentCol);
      break;
    case 2: // Variables: Transformación continua de tamaño, color y traslación
      renderVariablesTopic(ctx, w, h, t, mainCol, accentCol);
      break;
    case 3: // Condicionales: Bifurcación geométrica y umbral de estado
      renderConditionalsTopic(ctx, w, h, t, mainCol, accentCol);
      break;
    case 4: // Ciclos: Repetición rítmica con regla matemática incremental
      renderLoopsTopic(ctx, w, h, t, mainCol, accentCol);
      break;
    case 5: // Funciones: Módulo geométrico reutilizable con transformaciones
      renderFunctionsTopic(ctx, w, h, t, mainCol, accentCol);
      break;
    case 6: // Clases y POO: Entidades autónomas con propiedades y métodos
      renderClassesTopic(ctx, w, h, t, mainCol, accentCol);
      break;
    case 7: // Arreglos de Objetos: Colección coordinada y armónicos colectivos
      renderArraysTopic(ctx, w, h, t, mainCol, accentCol);
      break;
    default:
      renderRepetition(ctx, w, h, t, rnd, mouse, mainCol, accentCol);
  }
}

function renderCoordinatesTopic(ctx: CanvasRenderingContext2D, w: number, h: number, t: number, main: string, accent: string) {
  // Grid lines
  ctx.strokeStyle = '#DEDDD7';
  ctx.lineWidth = 1;
  for (let x = 20; x < w; x += 25) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  for (let y = 20; y < h; y += 25) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }

  // Origin point
  ctx.fillStyle = main;
  ctx.font = '9px "IBM Plex Mono", monospace';
  ctx.fillText('(0,0)', 6, 14);

  // Moving coordinate point with projection lines
  const px = w * 0.35 + Math.sin(t) * (w * 0.25);
  const py = h * 0.45 + Math.cos(t * 1.3) * (h * 0.25);

  ctx.strokeStyle = accent;
  ctx.setLineDash([2, 2]);
  ctx.beginPath();
  ctx.moveTo(px, 0);
  ctx.lineTo(px, py);
  ctx.lineTo(0, py);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = accent;
  ctx.beginPath();
  ctx.arc(px, py, 4, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = main;
  ctx.fillText(`(${Math.round(px)}, ${Math.round(py)})`, px + 6, py - 4);
}

function renderVariablesTopic(ctx: CanvasRenderingContext2D, w: number, h: number, t: number, main: string, accent: string) {
  // Geometric progression showing continuous parameter variation
  const count = 6;
  const spacing = w / (count + 1);

  for (let i = 1; i <= count; i++) {
    const x = i * spacing;
    const factor = i / count;
    const d = 10 + factor * 26 + Math.sin(t + i * 0.5) * 6;
    const y = h / 2 + Math.cos(t + i * 0.4) * 12;

    ctx.strokeStyle = i % 2 === 0 ? accent : main;
    ctx.lineWidth = 1.2;
    ctx.strokeRect(x - d / 2, y - d / 2, d, d);

    ctx.fillStyle = '#626262';
    ctx.font = '8px "IBM Plex Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`d=${Math.round(d)}`, x, h - 8);
  }
}

function renderConditionalsTopic(ctx: CanvasRenderingContext2D, w: number, h: number, t: number, main: string, accent: string) {
  // Threshold line: if (x > threshold) stateA else stateB
  const threshold = w * 0.5;

  ctx.strokeStyle = '#DEDDD7';
  ctx.setLineDash([3, 3]);
  ctx.beginPath();
  ctx.moveTo(threshold, 0);
  ctx.lineTo(threshold, h);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = '#626262';
  ctx.font = '8px "IBM Plex Mono", monospace';
  ctx.fillText('if (x < lim) [○]', 10, 14);
  ctx.fillText('else [■]', threshold + 8, 14);

  const particles = 10;
  for (let i = 0; i < particles; i++) {
    const pX = (w * 0.15 + (i * 22) + t * 25) % (w - 20) + 10;
    const pY = 30 + (i % 5) * 22;

    if (pX < threshold) {
      ctx.strokeStyle = main;
      ctx.beginPath();
      ctx.arc(pX, pY, 5, 0, Math.PI * 2);
      ctx.stroke();
    } else {
      ctx.fillStyle = accent;
      ctx.fillRect(pX - 4, pY - 4, 8, 8);
    }
  }
}

function renderLoopsTopic(ctx: CanvasRenderingContext2D, w: number, h: number, t: number, main: string, accent: string) {
  // Nested concentric loop rhythm
  const cx = w / 2;
  const cy = h / 2;
  const steps = 14;

  for (let i = 1; i <= steps; i++) {
    const r = (i / steps) * (Math.min(w, h) * 0.44);
    const rotation = (i * 0.12) + t * 0.2;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rotation);

    ctx.strokeStyle = i % 3 === 0 ? accent : 'rgba(20, 20, 20, 0.4)';
    ctx.lineWidth = 1;
    ctx.strokeRect(-r, -r, r * 2, r * 2);

    ctx.restore();
  }
}

function renderFunctionsTopic(ctx: CanvasRenderingContext2D, w: number, h: number, t: number, main: string, accent: string) {
  // Modular stamp reusable geometry at 3 locations
  const centers = [
    { x: w * 0.25, y: h * 0.5, scale: 0.8 },
    { x: w * 0.5, y: h * 0.5, scale: 1.15 },
    { x: w * 0.75, y: h * 0.5, scale: 0.85 },
  ];

  centers.forEach((pos, idx) => {
    ctx.save();
    ctx.translate(pos.x, pos.y);
    ctx.rotate(t * (idx % 2 === 0 ? 0.4 : -0.4));
    ctx.scale(pos.scale, pos.scale);

    // Composite polygon unit
    ctx.strokeStyle = idx === 1 ? accent : main;
    ctx.lineWidth = 1.2;

    ctx.beginPath();
    ctx.arc(0, 0, 18, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(-18, 0);
    ctx.lineTo(18, 0);
    ctx.moveTo(0, -18);
    ctx.lineTo(0, 18);
    ctx.stroke();

    ctx.strokeRect(-12, -12, 24, 24);

    ctx.restore();
  });
}

function renderClassesTopic(ctx: CanvasRenderingContext2D, w: number, h: number, t: number, main: string, accent: string) {
  // Two distinct class instances with their internal vector heading
  const inst1 = { x: w * 0.35 + Math.sin(t * 0.8) * 35, y: h * 0.5 + Math.cos(t * 0.8) * 20, r: 16 };
  const inst2 = { x: w * 0.65 + Math.cos(t * 0.6) * 30, y: h * 0.5 + Math.sin(t * 0.6) * 25, r: 22 };

  // Instance 1
  ctx.strokeStyle = '#D9AA3D';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(inst1.x, inst1.y, inst1.r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = '#141414';
  ctx.font = '8px "IBM Plex Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillText('Pelota A', inst1.x, inst1.y - inst1.r - 4);

  // Instance 2
  ctx.strokeStyle = accent;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(inst2.x, inst2.y, inst2.r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillText('Pelota B', inst2.x, inst2.y - inst2.r - 4);

  // Connecting distance vector
  ctx.strokeStyle = '#DEDDD7';
  ctx.setLineDash([2, 3]);
  ctx.beginPath();
  ctx.moveTo(inst1.x, inst1.y);
  ctx.lineTo(inst2.x, inst2.y);
  ctx.stroke();
  ctx.setLineDash([]);
}

function renderArraysTopic(ctx: CanvasRenderingContext2D, w: number, h: number, t: number, main: string, accent: string) {
  // Swarm or array of elements linked by index
  const count = 7;
  const pts: { x: number; y: number }[] = [];

  for (let i = 0; i < count; i++) {
    const x = 30 + (i / (count - 1)) * (w - 60);
    const y = h * 0.5 + Math.sin(t * 1.2 + i * 0.8) * 30;
    pts.push({ x, y });

    ctx.fillStyle = i === 3 ? accent : main;
    ctx.beginPath();
    ctx.arc(x, y, i === 3 ? 5 : 3.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#626262';
    ctx.font = '8px "IBM Plex Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`[${i}]`, x, y + 14);
  }

  ctx.strokeStyle = 'rgba(20, 20, 20, 0.2)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  pts.forEach((p, idx) => {
    if (idx === 0) ctx.moveTo(p.x, p.y);
    else ctx.lineTo(p.x, p.y);
  });
  ctx.stroke();
}
