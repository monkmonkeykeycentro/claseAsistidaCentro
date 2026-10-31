import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CustomClassConfig, LabInstanceObject } from '../../types/oopLab';
import { ProcessingCodeBlock } from '../ProcessingCodeBlock';
import {
  Sparkles,
  Plus,
  Trash2,
  Play,
  Pause,
  RotateCcw,
  MousePointer,
  Keyboard,
  Sliders,
  Code,
  Layers,
  HelpCircle,
  Check,
  Copy,
  Download,
  AlertTriangle,
  ArrowRight,
  Info,
} from 'lucide-react';

interface CustomClassArrayBuilderProps {
  onBackToGuided: () => void;
}

const DEFAULT_CONFIG: CustomClassConfig = {
  className: 'Particula',
  collectionType: 'arrayList',
  initialCount: 4,
  fields: {
    x: true,
    y: true,
    diametro: true,
    velocidad: true,
    color: true,
    opacidad: true,
  },
  constructorParams: {
    includePos: true,
    includeDiametro: true,
    includeVelocidad: true,
    includeColor: true,
  },
  methods: {
    mostrar: true,
    mover: true,
    rebotar: true,
    cambiarTamano: true,
    cambiarColor: true,
    reiniciar: true,
  },
  conditionals: {
    edgeBounce: true,
    edgeWrap: false,
    maxGrowLimit: false,
    mouseHoverProximity: true,
  },
  mouseEvents: {
    enabled: true,
    handlerType: 'spawn',
  },
  keyEvents: {
    enabled: true,
    spaceAction: 'reverse',
    keyAAction: 'spawnRandom',
    keyRAction: 'resetAll',
  },
};

const PALETTE = [
  '#E2661A', // Processing Orange
  '#006699', // Processing Blue
  '#059669', // Emerald
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#F59E0B', // Amber
  '#06B6D4', // Cyan
  '#E11D48', // Crimson
];

export const CustomClassArrayBuilder: React.FC<CustomClassArrayBuilderProps> = ({
  onBackToGuided,
}) => {
  const [config, setConfig] = useState<CustomClassConfig>(DEFAULT_CONFIG);
  const [activeBuilderTab, setActiveBuilderTab] = useState<'structure' | 'feed' | 'conditionals' | 'events' | 'code'>('structure');

  // Instances in the array
  const [instances, setInstances] = useState<LabInstanceObject[]>([
    {
      id: 1,
      name: 'Objeto 0',
      x: 120,
      y: 160,
      diametro: 50,
      velocidad: 3.0,
      colorHex: '#E2661A',
      opacidad: 220,
      vx: 3.0,
      vy: 1.5,
    },
    {
      id: 2,
      name: 'Objeto 1',
      x: 230,
      y: 110,
      diametro: 65,
      velocidad: 4.0,
      colorHex: '#006699',
      opacidad: 200,
      vx: -2.5,
      vy: 2.2,
    },
    {
      id: 3,
      name: 'Objeto 2',
      x: 340,
      y: 200,
      diametro: 42,
      velocidad: 2.4,
      colorHex: '#059669',
      opacidad: 240,
      vx: 2.0,
      vy: -2.0,
    },
    {
      id: 4,
      name: 'Objeto 3',
      x: 420,
      y: 150,
      diametro: 55,
      velocidad: 3.5,
      colorHex: '#8B5CF6',
      opacidad: 190,
      vx: -3.0,
      vy: -1.2,
    },
  ]);

  const [selectedIdx, setSelectedIdx] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [lastEventToast, setLastEventToast] = useState<string | null>(
    'Haz clic en el lienzo o presiona ESPACIO / A / R para probar eventos de Processing'
  );

  // Manual Feeder Form inputs
  const [feedX, setFeedX] = useState<number>(250);
  const [feedY, setFeedY] = useState<number>(160);
  const [feedDiam, setFeedDiam] = useState<number>(55);
  const [feedVel, setFeedVel] = useState<number>(3.5);
  const [feedColor, setFeedColor] = useState<string>('#E2661A');
  const [feedOpac, setFeedOpac] = useState<number>(220);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mousePosRef = useRef<{ x: number; y: number }>({ x: -100, y: -100 });
  const nextIdRef = useRef<number>(5);

  // Trigger brief event toast
  const showToast = useCallback((msg: string) => {
    setLastEventToast(msg);
  }, []);

  // Feed array with new instance
  const handleFeedInstance = (
    xVal: number,
    yVal: number,
    diamVal: number,
    velVal: number,
    colorVal: string,
    opacVal: number
  ) => {
    const newObj: LabInstanceObject = {
      id: nextIdRef.current++,
      name: `${config.className} ${instances.length}`,
      x: xVal,
      y: yVal,
      diametro: diamVal,
      velocidad: velVal,
      colorHex: colorVal,
      opacidad: opacVal,
      vx: velVal,
      vy: (Math.random() - 0.5) * 4,
    };

    setInstances((prev) => [...prev, newObj]);
    setSelectedIdx(instances.length);

    showToast(
      config.collectionType === 'arrayList'
        ? `Alimentado: ${config.className.toLowerCase()}s.add(new ${config.className}(${Math.round(xVal)}, ${Math.round(yVal)}, ${diamVal}, ${velVal.toFixed(1)}));`
        : `Alimentado elemento [${instances.length}] en arreglo ${config.className}[]`
    );
  };

  // Canvas animation loop
  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      const mouse = mousePosRef.current;

      // 1. Clear background (Dark modern Processing canvas)
      ctx.fillStyle = '#111827'; // Zinc 900
      ctx.fillRect(0, 0, width, height);

      // Fine grid
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
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

      // 2. Physics & Logic update if playing
      if (isPlaying) {
        instances.forEach((inst) => {
          // Method mover()
          if (config.methods.mover) {
            inst.x += inst.vx ?? inst.velocidad;
            inst.y += inst.vy ?? 0;
          }

          const r = inst.diametro / 2;

          // Conditionals: edgeBounce
          if (config.conditionals.edgeBounce) {
            if (inst.x > width - r) {
              inst.x = width - r;
              inst.vx = -(Math.abs(inst.vx ?? inst.velocidad));
              inst.velocidad = inst.vx;
            } else if (inst.x < r) {
              inst.x = r;
              inst.vx = Math.abs(inst.vx ?? inst.velocidad);
              inst.velocidad = inst.vx;
            }

            if (inst.y > height - r) {
              inst.y = height - r;
              inst.vy = -(Math.abs(inst.vy ?? 1.5));
            } else if (inst.y < r) {
              inst.y = r;
              inst.vy = Math.abs(inst.vy ?? 1.5);
            }
          }

          // Conditionals: edgeWrap
          if (config.conditionals.edgeWrap) {
            if (inst.x > width + r) inst.x = -r;
            if (inst.x < -r) inst.x = width + r;
            if (inst.y > height + r) inst.y = -r;
            if (inst.y < -r) inst.y = height + r;
          }

          // Conditionals: maxGrowLimit
          if (config.conditionals.maxGrowLimit) {
            if (inst.diametro > 110) {
              inst.diametro = 35;
            }
          }
        });
      }

      // 3. Render instances
      instances.forEach((inst, idx) => {
        const isSelected = idx === selectedIdx;
        const r = inst.diametro / 2;
        const mouse = mousePosRef.current;
        const distToMouse = Math.hypot(inst.x - mouse.x, inst.y - mouse.y);
        const isHovered = config.conditionals.mouseHoverProximity && distToMouse < r;

        ctx.save();

        // Alpha calculation
        const alpha = ((inst.opacidad ?? 220) / 255) * (isHovered ? 1 : 0.85);
        ctx.globalAlpha = alpha;

        // Glow ring if hovered
        if (isHovered) {
          ctx.strokeStyle = '#38BDF8';
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.arc(inst.x, inst.y, r + 4, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Draw body (ellipse)
        ctx.fillStyle = inst.colorHex;
        ctx.beginPath();
        ctx.arc(inst.x, inst.y, r, 0, Math.PI * 2);
        ctx.fill();

        // Inner specular shine
        ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
        ctx.beginPath();
        ctx.arc(inst.x - r * 0.3, inst.y - r * 0.3, r * 0.25, 0, Math.PI * 2);
        ctx.fill();

        ctx.globalAlpha = 1.0;

        // Selected indicator
        if (isSelected) {
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 2;
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          ctx.arc(inst.x, inst.y, r + 6, 0, Math.PI * 2);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        // Index tag above instance
        ctx.fillStyle = isSelected ? '#FFFFFF' : '#9CA3AF';
        ctx.font = 'bold 10px ui-monospace, monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`[${idx}]`, inst.x, inst.y - r - 8);

        ctx.restore();
      });

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [instances, isPlaying, selectedIdx, config]);

  // Handle canvas mouse move
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    mousePosRef.current = {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const handleMouseLeave = () => {
    mousePosRef.current = { x: -100, y: -100 };
  };

  // Handle mouse click on canvas (mousePressed event)
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;

    // Check if clicked an existing instance
    let clickedIndex = -1;
    for (let i = instances.length - 1; i >= 0; i--) {
      const inst = instances[i];
      const r = inst.diametro / 2 + 6;
      const dx = clickX - inst.x;
      const dy = clickY - inst.y;
      if (dx * dx + dy * dy <= r * r) {
        clickedIndex = i;
        break;
      }
    }

    if (clickedIndex !== -1) {
      setSelectedIdx(clickedIndex);

      if (config.mouseEvents.enabled && config.mouseEvents.handlerType === 'pop') {
        // Pop / remove clicked instance
        const removedName = instances[clickedIndex].name;
        setInstances((prev) => prev.filter((_, idx) => idx !== clickedIndex));
        setSelectedIdx(Math.max(0, clickedIndex - 1));
        showToast(
          `mousePressed(): ${config.className.toLowerCase()}s.remove(${clickedIndex}); // Explotó ${removedName}`
        );
        return;
      }

      if (config.mouseEvents.enabled && config.mouseEvents.handlerType === 'colorize') {
        const randColor = PALETTE[Math.floor(Math.random() * PALETTE.length)];
        setInstances((prev) =>
          prev.map((inst, i) =>
            i === clickedIndex ? { ...inst, colorHex: randColor } : inst
          )
        );
        showToast(
          `mousePressed(): ${config.className.toLowerCase()}s.get(${clickedIndex}).cambiarColor(color(...));`
        );
        return;
      }

      showToast(`Seleccionado objeto en índice [${clickedIndex}]`);
      return;
    }

    // Clicked on empty space: SPAWN new instance if enabled
    if (config.mouseEvents.enabled && config.mouseEvents.handlerType === 'spawn') {
      const randColor = PALETTE[Math.floor(Math.random() * PALETTE.length)];
      const randDiam = Math.round(35 + Math.random() * 45);
      const randVel = Number((1.5 + Math.random() * 3.5).toFixed(1));
      handleFeedInstance(clickX, clickY, randDiam, randVel, randColor, 220);
    }
  };

  // Keyboard Event handler (Physical or Virtual)
  const handleKeyTrigger = useCallback(
    (keyName: string) => {
      if (!config.keyEvents.enabled) return;

      if (keyName === ' ' || keyName === 'Space') {
        // Space Action
        if (config.keyEvents.spaceAction === 'reverse') {
          setInstances((prev) =>
            prev.map((inst) => ({
              ...inst,
              velocidad: -inst.velocidad,
              vx: -(inst.vx ?? inst.velocidad),
            }))
          );
          showToast(
            `keyPressed() [ESPACIO]: Invertidas velocidades con for (... { p.invertirDireccion(); })`
          );
        } else if (config.keyEvents.spaceAction === 'pause') {
          setIsPlaying((prev) => !prev);
          showToast(`keyPressed() [ESPACIO]: Animación ${!isPlaying ? 'Reanudada' : 'Pausada'}`);
        } else if (config.keyEvents.spaceAction === 'color') {
          const randColor = PALETTE[Math.floor(Math.random() * PALETTE.length)];
          setInstances((prev) => prev.map((inst) => ({ ...inst, colorHex: randColor })));
          showToast(`keyPressed() [ESPACIO]: Color modificado en masa`);
        }
      } else if (keyName === 'a' || keyName === 'A') {
        // Key 'A': Spawn Random
        const randX = 40 + Math.random() * 420;
        const randY = 40 + Math.random() * 240;
        const randDiam = Math.round(30 + Math.random() * 45);
        const randVel = Number((2.0 + Math.random() * 3.0).toFixed(1));
        const randColor = PALETTE[Math.floor(Math.random() * PALETTE.length)];
        handleFeedInstance(randX, randY, randDiam, randVel, randColor, 220);
      } else if (keyName === 'r' || keyName === 'R') {
        // Key 'R': Reset
        setInstances((prev) =>
          prev.map((inst, i) => ({
            ...inst,
            x: 80 + (i % 5) * 80,
            y: 100 + Math.floor(i / 5) * 80,
            vx: Math.abs(inst.vx ?? 3),
            velocidad: Math.abs(inst.velocidad),
          }))
        );
        showToast(`keyPressed() ['R']: Todas las instancias reiniciadas en formación`);
      }
    },
    [config, isPlaying]
  );

  // Listen to physical window key presses when builder view is open
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      if (e.key === ' ' || e.key === 'a' || e.key === 'A' || e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        handleKeyTrigger(e.key);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleKeyTrigger]);

  // Generate complete Processing Java Code
  const generateProcessingCode = (): string => {
    const cName = config.className;
    const isAL = config.collectionType === 'arrayList';
    const varName = `${cName.toLowerCase()}s`;

    let sketchCode = `// ==========================================================\n`;
    sketchCode += `// SKETCH PRINCIPAL EN PROCESSING JAVA\n`;
    sketchCode += `// Proyecto: Colección interactiva de objetos "${cName}"\n`;
    sketchCode += `// Generado en Código Creativo | CENTRO\n`;
    sketchCode += `// ==========================================================\n\n`;

    if (isAL) {
      sketchCode += `ArrayList<${cName}> ${varName};\n\n`;
    } else {
      sketchCode += `${cName}[] ${varName} = new ${cName}[${instances.length}];\n\n`;
    }

    sketchCode += `void setup() {\n`;
    sketchCode += `  size(500, 320);\n`;
    sketchCode += `  background(17, 24, 39);\n\n`;

    if (isAL) {
      sketchCode += `  // Inicializar ArrayList en memoria\n`;
      sketchCode += `  ${varName} = new ArrayList<${cName}>();\n\n`;
      sketchCode += `  // Alimentar la colección con ${instances.length} instancias iniciales\n`;
      instances.forEach((inst, i) => {
        sketchCode += `  ${varName}.add(new ${cName}(${Math.round(inst.x)}, ${Math.round(inst.y)}, ${Math.round(inst.diametro)}, ${inst.velocidad.toFixed(1)}, color(${hexToRgbString(inst.colorHex)})));\n`;
      });
    } else {
      sketchCode += `  // Alimentar el arreglo tradicional con instancias\n`;
      instances.forEach((inst, i) => {
        sketchCode += `  ${varName}[${i}] = new ${cName}(${Math.round(inst.x)}, ${Math.round(inst.y)}, ${Math.round(inst.diametro)}, ${inst.velocidad.toFixed(1)}, color(${hexToRgbString(inst.colorHex)})));\n`;
      });
    }

    sketchCode += `}\n\n`;

    sketchCode += `void draw() {\n`;
    sketchCode += `  background(17, 24, 39);\n\n`;

    if (isAL) {
      sketchCode += `  // Recorrer la colección dinámica y ejecutar sus métodos\n`;
      sketchCode += `  for (int i = 0; i < ${varName}.size(); i++) {\n`;
      sketchCode += `    ${cName} p = ${varName}.get(i);\n`;
      if (config.methods.mover) sketchCode += `    p.mover();\n`;
      if (config.methods.mostrar) sketchCode += `    p.mostrar();\n`;
      sketchCode += `  }\n`;
    } else {
      sketchCode += `  // Ciclo for canónico para recorrer el arreglo\n`;
      sketchCode += `  for (int i = 0; i < ${varName}.length; i++) {\n`;
      if (config.methods.mover) sketchCode += `    ${varName}[i].mover();\n`;
      if (config.methods.mostrar) sketchCode += `    ${varName}[i].mostrar();\n`;
      sketchCode += `  }\n`;
    }

    sketchCode += `}\n\n`;

    // mousePressed event function
    if (config.mouseEvents.enabled) {
      sketchCode += `// ==========================================================\n`;
      sketchCode += `// EVENTO DE RATÓN: mousePressed()\n`;
      sketchCode += `// ==========================================================\n`;
      sketchCode += `void mousePressed() {\n`;

      if (config.mouseEvents.handlerType === 'spawn') {
        if (isAL) {
          sketchCode += `  // ALIMENTAR EL ARREGLO AL HACER CLIC:\n`;
          sketchCode += `  float d = random(30, 65);\n`;
          sketchCode += `  float v = random(2.0, 5.0);\n`;
          sketchCode += `  color c = color(random(255), random(255), random(255));\n`;
          sketchCode += `  ${varName}.add(new ${cName}(mouseX, mouseY, d, v, c));\n`;
        } else {
          sketchCode += `  // En arreglo fijo, se reasigna la primera instancia o se modifica:\n`;
          sketchCode += `  if (${varName}.length > 0) {\n`;
          sketchCode += `    ${varName}[0].reiniciar(mouseX, mouseY);\n`;
          sketchCode += `  }\n`;
        }
      } else if (config.mouseEvents.handlerType === 'pop') {
        if (isAL) {
          sketchCode += `  // ELIMINAR ELEMENTOS EN CICLO INVERSO (para evitar desfase de índices):\n`;
          sketchCode += `  for (int i = ${varName}.size() - 1; i >= 0; i--) {\n`;
          sketchCode += `    ${cName} p = ${varName}.get(i);\n`;
          sketchCode += `    if (dist(mouseX, mouseY, p.x, p.y) < p.diametro / 2) {\n`;
          sketchCode += `      ${varName}.remove(i); // Objeto removido de la memoria\n`;
          sketchCode += `      break;\n`;
          sketchCode += `    }\n`;
          sketchCode += `  }\n`;
        }
      } else if (config.mouseEvents.handlerType === 'colorize') {
        sketchCode += `  // Cambiar color del objeto tocado:\n`;
        sketchCode += `  for (int i = 0; i < ${isAL ? `${varName}.size()` : `${varName}.length`}; i++) {\n`;
        sketchCode += `    ${cName} p = ${isAL ? `${varName}.get(i)` : `${varName}[i]`};\n`;
        sketchCode += `    if (dist(mouseX, mouseY, p.x, p.y) < p.diametro / 2) {\n`;
        sketchCode += `      p.cambiarColor(color(random(255), random(255), 255));\n`;
        sketchCode += `    }\n`;
        sketchCode += `  }\n`;
      }

      sketchCode += `}\n\n`;
    }

    // keyPressed event function
    if (config.keyEvents.enabled) {
      sketchCode += `// ==========================================================\n`;
      sketchCode += `// EVENTO DE TECLADO: keyPressed()\n`;
      sketchCode += `// ==========================================================\n`;
      sketchCode += `void keyPressed() {\n`;
      sketchCode += `  // Condicional según la tecla presionada:\n`;
      sketchCode += `  if (key == ' ') {\n`;
      sketchCode += `    for (int i = 0; i < ${isAL ? `${varName}.size()` : `${varName}.length`}; i++) {\n`;
      sketchCode += `      ${cName} p = ${isAL ? `${varName}.get(i)` : `${varName}[i]`};\n`;
      sketchCode += `      p.invertirDireccion();\n`;
      sketchCode += `    }\n`;
      sketchCode += `  } else if (key == 'a' || key == 'A') {\n`;
      if (isAL) {
        sketchCode += `    // Alimentar nuevo elemento al presionar 'A':\n`;
        sketchCode += `    ${varName}.add(new ${cName}(random(width), random(height), 45, 3.0, color(226, 102, 26)));\n`;
      } else {
        sketchCode += `    println("Presionaste A en arreglo de longitud fija");\n`;
      }
      sketchCode += `  } else if (key == 'r' || key == 'R') {\n`;
      sketchCode += `    // Reiniciar todas las posiciones:\n`;
      sketchCode += `    for (int i = 0; i < ${isAL ? `${varName}.size()` : `${varName}.length`}; i++) {\n`;
      sketchCode += `      ${cName} p = ${isAL ? `${varName}.get(i)` : `${varName}[i]`};\n`;
      sketchCode += `      p.reiniciar(100 + i * 70, 160);\n`;
      sketchCode += `    }\n`;
      sketchCode += `  }\n`;
      sketchCode += `}\n\n`;
    }

    // Class Definition
    sketchCode += `// ==========================================================\n`;
    sketchCode += `// DEFINICIÓN DE LA CLASE: class ${cName}\n`;
    sketchCode += `// ==========================================================\n`;
    sketchCode += `class ${cName} {\n`;
    sketchCode += `  // 1. CAMPOS (Variables de estado)\n`;
    if (config.fields.x) sketchCode += `  float x;\n`;
    if (config.fields.y) sketchCode += `  float y;\n`;
    if (config.fields.diametro) sketchCode += `  float diametro;\n`;
    if (config.fields.velocidad) sketchCode += `  float velocidad;\n`;
    if (config.fields.color) sketchCode += `  color tono;\n`;
    if (config.fields.opacidad) sketchCode += `  float opacidad;\n`;
    sketchCode += `\n`;

    sketchCode += `  // 2. CONSTRUCTOR\n`;
    sketchCode += `  ${cName}(float tempX, float tempY, float tempD, float tempV, color tempColor) {\n`;
    if (config.fields.x) sketchCode += `    x = tempX;\n`;
    if (config.fields.y) sketchCode += `    y = tempY;\n`;
    if (config.fields.diametro) sketchCode += `    diametro = tempD;\n`;
    if (config.fields.velocidad) sketchCode += `    velocidad = tempV;\n`;
    if (config.fields.color) sketchCode += `    tono = tempColor;\n`;
    if (config.fields.opacidad) sketchCode += `    opacidad = 220;\n`;
    sketchCode += `  }\n\n`;

    sketchCode += `  // 3. MÉTODOS\n`;

    if (config.methods.mostrar) {
      sketchCode += `  void mostrar() {\n`;
      sketchCode += `    fill(tono, opacidad);\n`;
      sketchCode += `    noStroke();\n`;
      sketchCode += `    ellipse(x, y, diametro, diametro);\n`;
      sketchCode += `  }\n\n`;
    }

    if (config.methods.mover) {
      sketchCode += `  void mover() {\n`;
      sketchCode += `    x = x + velocidad;\n`;
      if (config.conditionals.edgeBounce) {
        sketchCode += `    \n    // Estructura condicional de rebote en los límites:\n`;
        sketchCode += `    if (x > width - (diametro / 2) || x < (diametro / 2)) {\n`;
        sketchCode += `      velocidad = velocidad * -1; // Invierte el sentido\n`;
        sketchCode += `    }\n`;
      }
      if (config.conditionals.edgeWrap) {
        sketchCode += `    \n    // Condicional de teletransporte cíclico:\n`;
        sketchCode += `    if (x > width + (diametro / 2)) {\n`;
        sketchCode += `      x = -(diametro / 2);\n`;
        sketchCode += `    }\n`;
      }
      sketchCode += `  }\n\n`;
    }

    if (config.methods.cambiarTamano) {
      sketchCode += `  void cambiarTamano(float nuevoDiametro) {\n`;
      sketchCode += `    diametro = nuevoDiametro;\n`;
      sketchCode += `  }\n\n`;
    }

    if (config.methods.cambiarColor) {
      sketchCode += `  void cambiarColor(color nuevoColor) {\n`;
      sketchCode += `    tono = nuevoColor;\n`;
      sketchCode += `  }\n\n`;
    }

    if (config.methods.rebotar) {
      sketchCode += `  void invertirDireccion() {\n`;
      sketchCode += `    velocidad = velocidad * -1;\n`;
      sketchCode += `  }\n\n`;
    }

    if (config.methods.reiniciar) {
      sketchCode += `  void reiniciar(float nuevaX, float nuevaY) {\n`;
      sketchCode += `    x = nuevaX;\n`;
      sketchCode += `    y = nuevaY;\n`;
      sketchCode += `  }\n\n`;
    }

    sketchCode += `}\n`;
    return sketchCode;
  };

  const handleDownloadPde = () => {
    const code = generateProcessingCode();
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${config.className}App.pde`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Top Banner & Mode Description */}
      <div className="p-5 bg-[#FFFFFF] text-[#141414] border border-[#DEDDD7] flex flex-col md:flex-row md:items-center justify-between gap-4 font-mono">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-[#626262]">
            <span className="font-bold uppercase tracking-wider bg-[#141414] text-[#F7F6F1] px-1.5 py-0.5 text-[10px]">
              ESTUDIO CREATIVO
            </span>
            <span className="text-[#DEDDD7]">/</span>
            <span>Clases, Constructor, Arreglos y Eventos (if, mouse, keys)</span>
          </div>
          <h2 className="text-xl font-semibold tracking-tight text-[#141414] font-sans">
            Constructor & Alimentador de Arreglos de Objetos
          </h2>
          <p className="text-xs text-[#626262] max-w-2xl leading-relaxed font-sans">
            Define la arquitectura de tu propia clase, configura los parámetros de su constructor, incorpora condicionales <code>if</code> y activa eventos para poblar dinámicamente tu colección.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onBackToGuided}
            className="min-h-[38px] px-3.5 py-1.5 bg-[#141414] hover:bg-[#2868D9] text-xs font-mono text-[#F7F6F1] transition-colors cursor-pointer"
          >
            ← Volver a Módulos Guiados
          </button>
        </div>
      </div>

      {/* Main 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Controls & Configurations (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          {/* Builder Navigation Tabs */}
          <div className="flex items-center gap-1 p-1 bg-[#FFFFFF] border border-[#DEDDD7] overflow-x-auto font-mono text-xs">
            {[
              { id: 'structure', label: '1. Clase & Constructor', icon: Layers },
              { id: 'feed', label: '2. Alimentar Arreglo', icon: Plus },
              { id: 'conditionals', label: '3. Condicionales (if)', icon: AlertTriangle },
              { id: 'events', label: '4. Mouse & Teclas', icon: MousePointer },
              { id: 'code', label: '5. Código .pde', icon: Code },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeBuilderTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveBuilderTab(tab.id as typeof activeBuilderTab)}
                  className={`min-h-[36px] px-3 py-1 text-xs border transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-[#141414] text-[#F7F6F1] border-[#141414] font-bold'
                      : 'bg-[#FFFFFF] hover:bg-[#F7F6F1] text-[#141414] border-[#DEDDD7]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* TAB 1: STRUCTURE OF CLASS & CONSTRUCTOR */}
          {activeBuilderTab === 'structure' && (
            <div className="bg-[#FFFFFF] border border-[#DEDDD7] p-5 sm:p-6 space-y-5">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-[#141414] flex items-center gap-2 font-mono">
                  <Layers className="w-4 h-4 text-[#2868D9]" />
                  <span>Estructura de la Clase y el Constructor</span>
                </h3>
                <p className="text-xs text-[#626262] font-sans">
                  Configura cómo se declara la clase, su nombre y qué campos recibirá su constructor.
                </p>
              </div>

              {/* Class Name & Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#171717] block font-mono">
                    Nombre de la Clase
                  </label>
                  <input
                    type="text"
                    value={config.className}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        className: e.target.value.replace(/[^a-zA-Z0-9_]/g, '') || 'MiClase',
                      }))
                    }
                    className="w-full px-3 py-2 border border-[#E3E3DD] font-mono text-xs focus:ring-1 focus:ring-[#2779BD] focus:outline-hidden bg-[#FFFFFF]"
                    placeholder="Ej. Pelota, Burbuja, Particula"
                  />
                  <span className="text-[11px] text-[#666666] block font-mono">
                    class {config.className} {'{ ... }'}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#171717] block font-mono">
                    Tipo de Colección en Processing
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() =>
                        setConfig((prev) => ({ ...prev, collectionType: 'arrayList' }))
                      }
                      className={`min-h-[40px] px-2.5 py-2 border text-xs font-medium text-center transition-colors cursor-pointer ${
                        config.collectionType === 'arrayList'
                          ? 'border-[#171717] bg-[#171717] text-[#F7F7F2] font-semibold'
                          : 'border-[#E3E3DD] bg-[#FFFFFF] text-[#171717] hover:bg-[#F7F7F2]'
                      }`}
                    >
                      <span className="block font-mono text-[11px]">ArrayList&lt;{config.className}&gt;</span>
                      <span className="text-[10px] opacity-80">Dinámico (.add, .remove)</span>
                    </button>

                    <button
                      onClick={() =>
                        setConfig((prev) => ({ ...prev, collectionType: 'array' }))
                      }
                      className={`min-h-[40px] px-2.5 py-2 border text-xs font-medium text-center transition-colors cursor-pointer ${
                        config.collectionType === 'array'
                          ? 'border-[#171717] bg-[#171717] text-[#F7F7F2] font-semibold'
                          : 'border-[#E3E3DD] bg-[#FFFFFF] text-[#171717] hover:bg-[#F7F7F2]'
                      }`}
                    >
                      <span className="block font-mono text-[11px]">{config.className}[]</span>
                      <span className="text-[10px] opacity-80">Tamaño fijo ([i])</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Fields Selection */}
              <div className="space-y-2 pt-2 border-t border-zinc-100">
                <label className="text-xs font-semibold text-zinc-900 block">
                  1. Campos de Estado (Variables internas de la clase)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { key: 'x', label: 'float x', desc: 'Posición X' },
                    { key: 'y', label: 'float y', desc: 'Posición Y' },
                    { key: 'diametro', label: 'float diametro', desc: 'Tamaño' },
                    { key: 'velocidad', label: 'float velocidad', desc: 'Velocidad' },
                    { key: 'color', label: 'color tono', desc: 'Color RGB' },
                    { key: 'opacidad', label: 'float opacidad', desc: 'Alfa 0-255' },
                  ].map((f) => {
                    const isChecked = config.fields[f.key as keyof typeof config.fields];
                    return (
                      <label
                        key={f.key}
                        className={`p-2.5 rounded-lg border text-xs flex items-center justify-between cursor-pointer transition-colors ${
                          isChecked
                            ? 'border-zinc-900 bg-zinc-50 text-zinc-900 font-medium'
                            : 'border-zinc-200 bg-white text-zinc-500'
                        }`}
                      >
                        <div>
                          <span className="font-mono text-[11px] font-bold block">{f.label}</span>
                          <span className="text-[10px] text-zinc-400">{f.desc}</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) =>
                            setConfig((prev) => ({
                              ...prev,
                              fields: { ...prev.fields, [f.key]: e.target.checked },
                            }))
                          }
                          className="w-4 h-4 rounded text-zinc-950 accent-zinc-950"
                        />
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Constructor Formula Preview */}
              <div className="p-3.5 bg-zinc-50 border border-zinc-200 rounded-xl space-y-2">
                <span className="text-[11px] font-mono text-zinc-500 font-bold uppercase tracking-wider block">
                  Firma del Constructor resultante
                </span>
                <code className="text-xs font-mono text-zinc-900 block bg-white p-2.5 rounded-md border border-zinc-200 overflow-x-auto">
                  {config.className}(float tempX, float tempY, float tempD, float tempV, color tempColor)
                </code>
                <p className="text-[11px] text-zinc-500 leading-relaxed font-sans">
                  El constructor toma los argumentos temporales pasados en <code>new {config.className}(...)</code> y los copia a las variables de campo: <code>x = tempX; diametro = tempD;</code>
                </p>
              </div>

              {/* Methods toggle */}
              <div className="space-y-2 pt-2 border-t border-zinc-100">
                <label className="text-xs font-semibold text-zinc-900 block">
                  2. Métodos de Comportamiento Activos
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { key: 'mostrar', name: 'void mostrar()', desc: 'Dibujar en lienzo' },
                    { key: 'mover', name: 'void mover()', desc: 'Avanzar posición' },
                    { key: 'rebotar', name: 'void invertirDireccion()', desc: 'Invertir signo vel' },
                    { key: 'cambiarTamano', name: 'void cambiarTamano(...)', desc: 'Recibir parámetro' },
                    { key: 'cambiarColor', name: 'void cambiarColor(...)', desc: 'Cambiar tono' },
                    { key: 'reiniciar', name: 'void reiniciar(nx, ny)', desc: 'Reubicar objeto' },
                  ].map((m) => {
                    const isChecked = config.methods[m.key as keyof typeof config.methods];
                    return (
                      <label
                        key={m.key}
                        className={`p-2.5 rounded-lg border text-xs flex items-center justify-between cursor-pointer transition-colors ${
                          isChecked
                            ? 'border-zinc-900 bg-zinc-50 text-zinc-900 font-medium'
                            : 'border-zinc-200 bg-white text-zinc-500'
                        }`}
                      >
                        <div className="truncate mr-2">
                          <span className="font-mono text-[11px] font-bold block truncate">{m.name}</span>
                          <span className="text-[10px] text-zinc-400">{m.desc}</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) =>
                            setConfig((prev) => ({
                              ...prev,
                              methods: { ...prev.methods, [m.key]: e.target.checked },
                            }))
                          }
                          className="w-4 h-4 rounded text-zinc-950 accent-zinc-950 shrink-0"
                        />
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: FEED THE ARRAY (ALIMENTAR EL ARREGLO) */}
          {activeBuilderTab === 'feed' && (
            <div className="bg-white border border-zinc-200 rounded-2xl p-5 sm:p-6 space-y-5 shadow-xs">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-zinc-950 flex items-center gap-2">
                  <Plus className="w-4 h-4 text-zinc-900" />
                  <span>Alimentar el Arreglo con Nuevas Instancias</span>
                </h3>
                <p className="text-xs text-zinc-600">
                  Pasa valores como argumentos al constructor para crear e insertar nuevos objetos en la colección.
                </p>
              </div>

              {/* Direct Form */}
              <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl space-y-4">
                <span className="text-xs font-bold text-zinc-900 block font-sans">
                  Argumentos para el Constructor: <code>new {config.className}(x, y, diam, vel, color)</code>
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-zinc-600 block">X: {feedX}px</label>
                    <input
                      type="range"
                      min={20}
                      max={480}
                      value={feedX}
                      onChange={(e) => setFeedX(Number(e.target.value))}
                      className="w-full accent-zinc-900"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-zinc-600 block">Y: {feedY}px</label>
                    <input
                      type="range"
                      min={20}
                      max={300}
                      value={feedY}
                      onChange={(e) => setFeedY(Number(e.target.value))}
                      className="w-full accent-zinc-900"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-zinc-600 block">Diámetro: {feedDiam}px</label>
                    <input
                      type="range"
                      min={15}
                      max={110}
                      value={feedDiam}
                      onChange={(e) => setFeedDiam(Number(e.target.value))}
                      className="w-full accent-zinc-900"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-zinc-600 block">Velocidad: {feedVel}</label>
                    <input
                      type="range"
                      min={-8}
                      max={8}
                      step={0.5}
                      value={feedVel}
                      onChange={(e) => setFeedVel(Number(e.target.value))}
                      className="w-full accent-zinc-900"
                    />
                  </div>
                </div>

                {/* Color Palette Picker */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-zinc-600 block">Color de Relleno:</label>
                  <div className="flex items-center gap-2 flex-wrap">
                    {PALETTE.map((c) => (
                      <button
                        key={c}
                        onClick={() => setFeedColor(c)}
                        style={{ backgroundColor: c }}
                        className={`w-7 h-7 rounded-full border-2 transition-transform cursor-pointer ${
                          feedColor === c ? 'border-zinc-950 scale-110 shadow-xs' : 'border-white'
                        }`}
                        title={c}
                      />
                    ))}
                  </div>
                </div>

                {/* Live Code Call */}
                <div className="p-3 bg-zinc-900 text-emerald-400 rounded-lg font-mono text-xs overflow-x-auto">
                  {config.collectionType === 'arrayList'
                    ? `${config.className.toLowerCase()}s.add(new ${config.className}(${feedX}, ${feedY}, ${feedDiam}, ${feedVel}, color(...)));`
                    : `${config.className.toLowerCase()}s[${instances.length}] = new ${config.className}(${feedX}, ${feedY}, ${feedDiam}, ${feedVel}, color(...));`}
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() =>
                      handleFeedInstance(feedX, feedY, feedDiam, feedVel, feedColor, feedOpac)
                    }
                    className="min-h-[44px] flex-1 px-4 py-2 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Instanciar y Alimentar al Arreglo</span>
                  </button>

                  <button
                    onClick={() => {
                      if (instances.length > 0) {
                        setInstances([]);
                        setSelectedIdx(0);
                        showToast(`Colección vaciada: ${config.className.toLowerCase()}s.clear();`);
                      }
                    }}
                    className="min-h-[44px] px-3.5 py-2 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-100 text-zinc-700 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Vaciar arreglo"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                    <span>Vaciar</span>
                  </button>
                </div>
              </div>

              {/* Instances table in memory */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-zinc-500">
                  <span className="font-semibold text-zinc-900">
                    Instancias en Memoria ({instances.length})
                  </span>
                  <span>Haz clic en un objeto para seleccionarlo</span>
                </div>

                <div className="max-h-48 overflow-y-auto space-y-1.5 border border-zinc-200 rounded-xl p-2 bg-zinc-50">
                  {instances.length === 0 ? (
                    <p className="text-xs text-zinc-400 text-center py-4">
                      El arreglo está vacío. Aliméntalo con el botón de arriba o haz clic en el lienzo.
                    </p>
                  ) : (
                    instances.map((inst, i) => {
                      const isSel = i === selectedIdx;
                      return (
                        <div
                          key={inst.id}
                          onClick={() => setSelectedIdx(i)}
                          className={`p-2.5 rounded-lg border text-xs flex items-center justify-between transition-colors cursor-pointer ${
                            isSel
                              ? 'border-zinc-950 bg-white shadow-xs font-medium'
                              : 'border-zinc-200 bg-white/70 hover:bg-white text-zinc-700'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-zinc-900 bg-zinc-100 px-1.5 py-0.5 rounded text-[11px]">
                              [{i}]
                            </span>
                            <span
                              className="w-3 h-3 rounded-full border border-black/10 shrink-0"
                              style={{ backgroundColor: inst.colorHex }}
                            />
                            <span>
                              x: {Math.round(inst.x)}, y: {Math.round(inst.y)} · ø: {Math.round(inst.diametro)}px · vel: {inst.velocidad}
                            </span>
                          </div>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setInstances((prev) => prev.filter((_, idx) => idx !== i));
                              setSelectedIdx(Math.max(0, i - 1));
                            }}
                            className="p-1 rounded hover:bg-zinc-100 text-zinc-400 hover:text-rose-600 transition-colors cursor-pointer"
                            title="Eliminar del arreglo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CONDITIONALS (IF) */}
          {activeBuilderTab === 'conditionals' && (
            <div className="bg-white border border-zinc-200 rounded-2xl p-5 sm:p-6 space-y-5 shadow-xs">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-zinc-950 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <span>Estructuras Condicionales (`if`)</span>
                </h3>
                <p className="text-xs text-zinc-600">
                  Controla la lógica de tus objetos evaluando condiciones booleanas en cada fotograma dentro de <code>draw()</code> o <code>mover()</code>.
                </p>
              </div>

              <div className="space-y-3">
                {[
                  {
                    key: 'edgeBounce',
                    title: 'Rebote contra Bordes de Ventana',
                    code: 'if (x > width - (diametro/2) || x < (diametro/2)) {\n  velocidad = velocidad * -1;\n}',
                    desc: 'Invierte el sentido del movimiento horizontal cuando la pelota choca con la pared derecha o izquierda.',
                  },
                  {
                    key: 'edgeWrap',
                    title: 'Teletransporte Cíclico (Wrap Around)',
                    code: 'if (x > width + diametro/2) {\n  x = -diametro/2;\n}',
                    desc: 'Si el objeto sale de la pantalla por la derecha, reaparece suavemente por el lado opuesto.',
                  },
                  {
                    key: 'maxGrowLimit',
                    title: 'Límite Máximo de Crecimiento',
                    code: 'if (diametro > 110) {\n  diametro = 35; // Reinicia tamaño\n}',
                    desc: 'Evita que el diámetro crezca indefinidamente reiniciándolo cuando supera un umbral.',
                  },
                  {
                    key: 'mouseHoverProximity',
                    title: 'Detección de Proximidad con el Cursor',
                    code: 'if (dist(mouseX, mouseY, x, y) < diametro / 2) {\n  // Cursor adentro del círculo: iluminar\n}',
                    desc: 'Calcula la distancia euclidiana entre el puntero del ratón y el centro del objeto con dist().',
                  },
                ].map((cond) => {
                  const isChecked = config.conditionals[cond.key as keyof typeof config.conditionals];
                  return (
                    <div
                      key={cond.key}
                      className={`p-4 rounded-xl border space-y-2 transition-all ${
                        isChecked
                          ? 'border-zinc-950 bg-zinc-50/50'
                          : 'border-zinc-200 bg-white opacity-70'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-zinc-900">{cond.title}</span>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <span className="text-[11px] font-mono text-zinc-500">
                            {isChecked ? 'ACTIVO' : 'INACTIVO'}
                          </span>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) =>
                              setConfig((prev) => ({
                                ...prev,
                                conditionals: {
                                  ...prev.conditionals,
                                  [cond.key]: e.target.checked,
                                },
                              }))
                            }
                            className="w-4 h-4 rounded text-zinc-950 accent-zinc-950"
                          />
                        </label>
                      </div>

                      <pre className="p-2 bg-zinc-900 text-amber-300 rounded font-mono text-[11px] overflow-x-auto">
                        {cond.code}
                      </pre>
                      <p className="text-[11px] text-zinc-600 font-sans">{cond.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: MOUSE & KEYBOARD EVENTS */}
          {activeBuilderTab === 'events' && (
            <div className="bg-white border border-zinc-200 rounded-2xl p-5 sm:p-6 space-y-5 shadow-xs">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-zinc-950 flex items-center gap-2">
                  <MousePointer className="w-4 h-4 text-zinc-900" />
                  <span>Eventos de Ratón (`mousePressed`) y Teclado (`keyPressed`)</span>
                </h3>
                <p className="text-xs text-zinc-600">
                  Agrega interactividad directa en tiempo real respondiendo a las acciones del usuario.
                </p>
              </div>

              {/* mousePressed section */}
              <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-900 flex items-center gap-1.5">
                    <MousePointer className="w-3.5 h-3.5 text-zinc-700" />
                    <span>void mousePressed()</span>
                  </span>
                  <input
                    type="checkbox"
                    checked={config.mouseEvents.enabled}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        mouseEvents: { ...prev.mouseEvents, enabled: e.target.checked },
                      }))
                    }
                    className="w-4 h-4 rounded text-zinc-950 accent-zinc-950"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-zinc-600 block">
                    Acción al hacer clic en el lienzo:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {[
                      {
                        type: 'spawn',
                        label: 'Alimentar Arreglo',
                        desc: 'Crea nuevo objeto en (mouseX, mouseY)',
                      },
                      {
                        type: 'pop',
                        label: 'Explotar / Eliminar',
                        desc: 'Remueve objeto clickeado con .remove(i)',
                      },
                      {
                        type: 'colorize',
                        label: 'Cambiar Color',
                        desc: 'Asigna tono aleatorio al tocado',
                      },
                    ].map((opt) => (
                      <button
                        key={opt.type}
                        onClick={() =>
                          setConfig((prev) => ({
                            ...prev,
                            mouseEvents: {
                              ...prev.mouseEvents,
                              handlerType: opt.type as typeof prev.mouseEvents.handlerType,
                            },
                          }))
                        }
                        className={`min-h-[44px] p-2.5 rounded-lg border text-left text-xs transition-colors cursor-pointer ${
                          config.mouseEvents.handlerType === opt.type
                            ? 'border-zinc-950 bg-zinc-950 text-white font-medium shadow-xs'
                            : 'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-100'
                        }`}
                      >
                        <span className="font-bold block text-[11px]">{opt.label}</span>
                        <span className="text-[10px] opacity-80 leading-tight block">{opt.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* keyPressed section */}
              <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-900 flex items-center gap-1.5">
                    <Keyboard className="w-3.5 h-3.5 text-zinc-700" />
                    <span>void keyPressed()</span>
                  </span>
                  <input
                    type="checkbox"
                    checked={config.keyEvents.enabled}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        keyEvents: { ...prev.keyEvents, enabled: e.target.checked },
                      }))
                    }
                    className="w-4 h-4 rounded text-zinc-950 accent-zinc-950"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-zinc-200 text-xs">
                    <div className="flex items-center gap-2">
                      <kbd className="px-2 py-1 rounded bg-zinc-100 border border-zinc-300 font-mono text-[10px] font-bold">
                        ESPACIO
                      </kbd>
                      <span>Invertir dirección o pausar movimiento</span>
                    </div>
                    <button
                      onClick={() => handleKeyTrigger(' ')}
                      className="px-2.5 py-1 rounded bg-zinc-900 text-white text-[11px] font-medium hover:bg-zinc-800 cursor-pointer"
                    >
                      Probar Tecla
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-zinc-200 text-xs">
                    <div className="flex items-center gap-2">
                      <kbd className="px-2 py-1 rounded bg-zinc-100 border border-zinc-300 font-mono text-[10px] font-bold">
                        A
                      </kbd>
                      <span>Alimentar arreglo con nueva instancia aleatoria</span>
                    </div>
                    <button
                      onClick={() => handleKeyTrigger('a')}
                      className="px-2.5 py-1 rounded bg-zinc-900 text-white text-[11px] font-medium hover:bg-zinc-800 cursor-pointer"
                    >
                      Probar Tecla
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-zinc-200 text-xs">
                    <div className="flex items-center gap-2">
                      <kbd className="px-2 py-1 rounded bg-zinc-100 border border-zinc-300 font-mono text-[10px] font-bold">
                        R
                      </kbd>
                      <span>Reiniciar todas las posiciones con ciclo for</span>
                    </div>
                    <button
                      onClick={() => handleKeyTrigger('r')}
                      className="px-2.5 py-1 rounded bg-zinc-900 text-white text-[11px] font-medium hover:bg-zinc-800 cursor-pointer"
                    >
                      Probar Tecla
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: GENERATED PROCESSING JAVA CODE */}
          {activeBuilderTab === 'code' && (
            <div className="bg-white border border-zinc-200 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-zinc-950 flex items-center gap-2">
                    <Code className="w-4 h-4 text-zinc-900" />
                    <span>Código Processing Java (.pde)</span>
                  </h3>
                  <p className="text-xs text-zinc-600">
                    Código sincronizado que refleja tu clase, constructor, arreglo y eventos.
                  </p>
                </div>

                <button
                  onClick={handleDownloadPde}
                  className="min-h-[38px] px-3 py-1.5 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Descargar .pde</span>
                </button>
              </div>

              <ProcessingCodeBlock
                code={generateProcessingCode()}
                filename={`${config.className}App.pde`}
              />
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Interactive Live Canvas & Inspector (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          {/* Canvas Component */}
          <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-xs flex flex-col">
            {/* Top status bar */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-900 text-white text-xs border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${isPlaying ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                <span className="font-semibold font-mono">
                  {config.className}[] · {instances.length} Instancias en Memoria
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="min-h-[28px] px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-white text-[11px] font-medium flex items-center gap-1 transition-colors cursor-pointer"
                  title={isPlaying ? 'Pausar ciclo draw()' : 'Reanudar ciclo draw()'}
                >
                  {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                  <span>{isPlaying ? 'Pausa' : 'Play'}</span>
                </button>

                <button
                  onClick={() => handleKeyTrigger('r')}
                  className="min-h-[28px] p-1.5 rounded bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                  title="Reiniciar posiciones"
                >
                  <RotateCcw className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Canvas Element */}
            <div className="relative bg-zinc-950 flex items-center justify-center cursor-crosshair">
              <canvas
                ref={canvasRef}
                width={500}
                height={320}
                onClick={handleCanvasClick}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                className="w-full h-auto block select-none"
              />

              {/* Floating Helper Pill */}
              <div className="absolute top-2 left-2 right-2 px-3 py-1.5 rounded-lg bg-zinc-900/90 backdrop-blur-xs border border-zinc-700 text-[10px] text-zinc-300 flex items-center justify-between">
                <span className="truncate mr-2">
                  {config.mouseEvents.enabled
                    ? config.mouseEvents.handlerType === 'spawn'
                      ? '💡 Haz clic en el lienzo para alimentar una nueva instancia en (mouseX, mouseY)'
                      : config.mouseEvents.handlerType === 'pop'
                      ? '💡 Haz clic sobre una partícula para removerla del arreglo (.remove(i))'
                      : '💡 Haz clic sobre una partícula para cambiar su color'
                    : '💡 Haz clic en una partícula para seleccionarla'}
                </span>
                <span className="font-mono text-zinc-400 shrink-0">60 FPS</span>
              </div>
            </div>

            {/* Event Notification Bar */}
            {lastEventToast && (
              <div className="p-3 bg-zinc-950 border-t border-zinc-800 text-[11px] font-mono text-emerald-400 flex items-center justify-between gap-2">
                <span className="truncate flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span className="truncate">{lastEventToast}</span>
                </span>
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider shrink-0 font-sans">
                  Processing Java
                </span>
              </div>
            )}
          </div>

          {/* Quick Method Invocations for the selected instance */}
          {instances.length > 0 && instances[selectedIdx] && (
            <div className="p-5 bg-white border border-zinc-200 rounded-2xl space-y-3.5 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold bg-zinc-950 text-white px-2 py-0.5 rounded">
                    [{selectedIdx}]
                  </span>
                  <span className="text-xs font-bold text-zinc-900">
                    Inspección de {instances[selectedIdx].name}
                  </span>
                </div>

                <span className="text-[11px] font-mono text-zinc-500">
                  ø {Math.round(instances[selectedIdx].diametro)}px · vel: {instances[selectedIdx].velocidad}
                </span>
              </div>

              {/* Action buttons on this instance */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  onClick={() => {
                    setInstances((prev) =>
                      prev.map((inst, i) =>
                        i === selectedIdx
                          ? { ...inst, diametro: Math.min(130, inst.diametro + 10) }
                          : inst
                      )
                    );
                    showToast(`${config.className.toLowerCase()}s[${selectedIdx}].cambiarTamano(${Math.round(instances[selectedIdx].diametro + 10)});`);
                  }}
                  className="min-h-[36px] px-2 py-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-100 text-xs font-medium text-zinc-800 transition-colors cursor-pointer"
                >
                  + Creció
                </button>

                <button
                  onClick={() => {
                    setInstances((prev) =>
                      prev.map((inst, i) =>
                        i === selectedIdx
                          ? { ...inst, diametro: Math.max(15, inst.diametro - 10) }
                          : inst
                      )
                    );
                    showToast(`${config.className.toLowerCase()}s[${selectedIdx}].cambiarTamano(${Math.round(instances[selectedIdx].diametro - 10)});`);
                  }}
                  className="min-h-[36px] px-2 py-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-100 text-xs font-medium text-zinc-800 transition-colors cursor-pointer"
                >
                  - Encogió
                </button>

                <button
                  onClick={() => {
                    setInstances((prev) =>
                      prev.map((inst, i) =>
                        i === selectedIdx
                          ? { ...inst, velocidad: -inst.velocidad, vx: -(inst.vx ?? inst.velocidad) }
                          : inst
                      )
                    );
                    showToast(`${config.className.toLowerCase()}s[${selectedIdx}].invertirDireccion();`);
                  }}
                  className="min-h-[36px] px-2 py-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-100 text-xs font-medium text-zinc-800 transition-colors cursor-pointer"
                >
                  ⇄ Invertir
                </button>

                <button
                  onClick={() => {
                    const randColor = PALETTE[Math.floor(Math.random() * PALETTE.length)];
                    setInstances((prev) =>
                      prev.map((inst, i) =>
                        i === selectedIdx ? { ...inst, colorHex: randColor } : inst
                      )
                    );
                    showToast(`${config.className.toLowerCase()}s[${selectedIdx}].cambiarColor(color(...));`);
                  }}
                  className="min-h-[36px] px-2 py-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-100 text-xs font-medium text-zinc-800 transition-colors cursor-pointer"
                >
                  🎨 Tono
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

function hexToRgbString(hex: string): string {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.substring(0, 2), 16) || 200;
  const g = parseInt(clean.substring(2, 4), 16) || 100;
  const b = parseInt(clean.substring(4, 6), 16) || 50;
  return `${r}, ${g}, ${b}`;
}
