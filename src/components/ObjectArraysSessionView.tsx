import React, { useState, useEffect, useRef, useCallback } from 'react';
import { TopicItem } from '../data/topicsData';
import { ProcessingCodeBlock } from './ProcessingCodeBlock';
import {
  ArrowLeft,
  BookOpen,
  Play,
  Pause,
  Plus,
  Minus,
  RotateCcw,
  AlertCircle,
  Check,
  Code2,
  Cpu,
  Sparkles,
  HelpCircle,
  Sliders,
  MousePointer,
  Keyboard,
  Wand2,
  RefreshCw,
} from 'lucide-react';

interface ObjectArraysSessionViewProps {
  topic: TopicItem;
  onNavigateHome: () => void;
  onOpenCatalogue: () => void;
  onNavigateTopic: (topicId: string) => void;
  onCompleteChallenge?: (challengeId: string) => void;
}

interface SwarmEntity {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  name: string;
  life: number;
  maxLife: number;
}

const PALETTE = [
  '#E2661A', // Processing orange
  '#006699', // Processing blue
  '#2C2C2C', // Charcoal
  '#059669', // Emerald
  '#8B5CF6', // Purple
  '#D97706', // Warm amber
  '#DC2626', // Crimson
];

// --- Custom Class Builder Types ---
type ShapeKind = 'michis' | 'circles' | 'squares' | 'triangles' | 'rings';
type MovementKind = 'bounce' | 'gravity' | 'organic' | 'drift';
type ConditionalRule = 'proximity-mouse' | 'half-screen' | 'size-pulse' | 'none';
type ConditionalEffect = 'color-shift' | 'speed-boost' | 'scale-up';
type MouseEventAction = 'spawn-click' | 'repel-click' | 'color-click';
type KeyEventAction = 'burst-space' | 'reverse-r' | 'clear-c';

interface CustomClassConfig {
  className: string;
  shapeType: ShapeKind;
  baseColor: string;
  baseSize: number;
  movementType: MovementKind;
  speed: number;
  conditionalRule: ConditionalRule;
  conditionalEffect: ConditionalEffect;
  mouseAction: MouseEventAction;
  keyAction: KeyEventAction;
}

export const ObjectArraysSessionView: React.FC<ObjectArraysSessionViewProps> = ({
  topic,
  onNavigateHome,
  onOpenCatalogue,
  onNavigateTopic,
  onCompleteChallenge,
}) => {
  const [activeTab, setActiveTab] = useState<'builder' | 'lab' | 'memory' | 'guide' | 'challenges'>('builder');

  // =========================================================================
  // 1. CUSTOM CLASS & EVENTS BUILDER STATE
  // =========================================================================
  const [builderConfig, setBuilderConfig] = useState<CustomClassConfig>({
    className: 'AgenteCreativo',
    shapeType: 'michis',
    baseColor: '#E2661A',
    baseSize: 18,
    movementType: 'bounce',
    speed: 3,
    conditionalRule: 'proximity-mouse',
    conditionalEffect: 'color-shift',
    mouseAction: 'spawn-click',
    keyAction: 'burst-space',
  });

  const builderCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const builderEntitiesRef = useRef<SwarmEntity[]>([]);
  const builderNextId = useRef<number>(0);
  const [builderIsRunning, setBuilderIsRunning] = useState<boolean>(true);
  const [builderMousePos, setBuilderMousePos] = useState<{ x: number; y: number } | null>(null);
  const [builderLiveCount, setBuilderLiveCount] = useState<number>(14);
  const [lastEventToast, setLastEventToast] = useState<{ text: string; type: 'mouse' | 'key' } | null>(null);
  const [builderCodeTab, setBuilderCodeTab] = useState<'class' | 'sketch'>('class');

  // Helper toast notification for event triggers
  const triggerEventToast = (text: string, type: 'mouse' | 'key') => {
    setLastEventToast({ text, type });
    setTimeout(() => {
      setLastEventToast((prev) => (prev?.text === text ? null : prev));
    }, 1800);
  };

  // Initialize builder instances
  const initBuilderEntities = useCallback(
    (count = 14, width = 680, height = 380) => {
      const arr: SwarmEntity[] = [];
      for (let i = 0; i < count; i++) {
        arr.push({
          id: builderNextId.current++,
          x: 40 + Math.random() * (width - 80),
          y: 40 + Math.random() * (height - 80),
          vx: (Math.random() - 0.5) * builderConfig.speed * 1.5,
          vy: (Math.random() - 0.5) * builderConfig.speed * 1.5,
          radius: builderConfig.baseSize,
          color: builderConfig.baseColor,
          name: `${builderConfig.className}_${i}`,
          life: 255,
          maxLife: 255,
        });
      }
      builderEntitiesRef.current = arr;
      setBuilderLiveCount(arr.length);
    },
    [builderConfig.baseColor, builderConfig.baseSize, builderConfig.className, builderConfig.speed]
  );

  useEffect(() => {
    initBuilderEntities(14);
  }, [initBuilderEntities]);

  // Builder Canvas Animation Loop
  useEffect(() => {
    if (activeTab !== 'builder') return;
    let animId: number;
    const canvas = builderCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frameCount = 0;

    const render = () => {
      frameCount++;
      const width = canvas.width;
      const height = canvas.height;

      // Background: clean off-white
      ctx.fillStyle = '#FAFAFA';
      ctx.fillRect(0, 0, width, height);

      // Draw middle dividing line if half-screen rule is active
      if (builderConfig.conditionalRule === 'half-screen') {
        ctx.strokeStyle = 'rgba(226, 102, 26, 0.25)';
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(width / 2, 0);
        ctx.lineTo(width / 2, height);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = 'rgba(226, 102, 26, 0.6)';
        ctx.font = '10px ui-monospace, monospace';
        ctx.fillText('x > width / 2 (Línea condicional if)', width / 2 + 8, 20);
      }

      // Subtle background grid
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.035)';
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

      const list = builderEntitiesRef.current;

      // Update & Render each custom object
      for (let i = 0; i < list.length; i++) {
        const obj = list[i];

        let effectiveRadius = builderConfig.baseSize;
        let effectiveColor = obj.color;

        // Evaluate the student's 'if' conditional rule
        let conditionMet = false;
        if (builderConfig.conditionalRule === 'proximity-mouse' && builderMousePos) {
          const dx = obj.x - builderMousePos.x;
          const dy = obj.y - builderMousePos.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 85) conditionMet = true;
        } else if (builderConfig.conditionalRule === 'half-screen') {
          if (obj.x > width / 2) conditionMet = true;
        } else if (builderConfig.conditionalRule === 'size-pulse') {
          if (Math.sin(frameCount * 0.08 + obj.id) > 0.3) conditionMet = true;
        }

        // Apply effect if condition is true
        if (conditionMet) {
          if (builderConfig.conditionalEffect === 'color-shift') {
            effectiveColor = '#38BDF8'; // Highlighting cyan
          } else if (builderConfig.conditionalEffect === 'scale-up') {
            effectiveRadius = builderConfig.baseSize * 1.5;
          }
        }

        // Physics movement
        if (builderIsRunning) {
          if (builderConfig.movementType === 'gravity') {
            obj.vy += 0.12;
            obj.vx *= 0.995;
            obj.x += obj.vx;
            obj.y += obj.vy;
            if (obj.y > height - effectiveRadius) {
              obj.y = height - effectiveRadius;
              obj.vy *= -0.75;
            }
          } else if (builderConfig.movementType === 'organic') {
            obj.x += obj.vx + Math.sin(frameCount * 0.04 + obj.id) * 1.2;
            obj.y += obj.vy + Math.cos(frameCount * 0.04 + obj.id) * 1.2;
          } else if (builderConfig.movementType === 'drift') {
            obj.x += obj.vx;
            obj.y += obj.vy;
            // Screen wrap-around
            if (obj.x < -effectiveRadius) obj.x = width + effectiveRadius;
            if (obj.x > width + effectiveRadius) obj.x = -effectiveRadius;
            if (obj.y < -effectiveRadius) obj.y = height + effectiveRadius;
            if (obj.y > height + effectiveRadius) obj.y = -effectiveRadius;
          } else {
            // Bounce
            obj.x += obj.vx;
            obj.y += obj.vy;
          }

          // Wall bounce for bounce & organic modes
          if (builderConfig.movementType === 'bounce' || builderConfig.movementType === 'organic') {
            if (obj.x < effectiveRadius) {
              obj.x = effectiveRadius;
              obj.vx *= -1;
            } else if (obj.x > width - effectiveRadius) {
              obj.x = width - effectiveRadius;
              obj.vx *= -1;
            }
            if (obj.y < effectiveRadius) {
              obj.y = effectiveRadius;
              obj.vy *= -1;
            } else if (obj.y > height - effectiveRadius) {
              obj.y = height - effectiveRadius;
              obj.vy *= -1;
            }
          }
        }

        // Render Custom Geometry
        ctx.save();
        ctx.translate(obj.x, obj.y);

        if (builderConfig.shapeType === 'michis') {
          // Michi / Cat Head
          ctx.fillStyle = effectiveColor;
          ctx.beginPath();
          ctx.arc(0, 0, effectiveRadius, 0, Math.PI * 2);
          ctx.fill();

          // Ears
          ctx.beginPath();
          ctx.moveTo(-effectiveRadius * 0.7, -effectiveRadius * 0.5);
          ctx.lineTo(-effectiveRadius * 0.9, -effectiveRadius * 1.3);
          ctx.lineTo(-effectiveRadius * 0.2, -effectiveRadius * 0.85);
          ctx.fill();

          ctx.beginPath();
          ctx.moveTo(effectiveRadius * 0.7, -effectiveRadius * 0.5);
          ctx.lineTo(effectiveRadius * 0.9, -effectiveRadius * 1.3);
          ctx.lineTo(effectiveRadius * 0.2, -effectiveRadius * 0.85);
          ctx.fill();

          // Pupils tracking mouse
          const targetX = builderMousePos ? builderMousePos.x - obj.x : obj.vx * 20;
          const targetY = builderMousePos ? builderMousePos.y - obj.y : obj.vy * 20;
          const angle = Math.atan2(targetY, targetX);
          const px = Math.cos(angle) * 2;
          const py = Math.sin(angle) * 2;

          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.arc(-effectiveRadius * 0.35, -effectiveRadius * 0.1, 3.5, 0, Math.PI * 2);
          ctx.arc(effectiveRadius * 0.35, -effectiveRadius * 0.1, 3.5, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#111827';
          ctx.beginPath();
          ctx.arc(-effectiveRadius * 0.35 + px, -effectiveRadius * 0.1 + py, 1.8, 0, Math.PI * 2);
          ctx.arc(effectiveRadius * 0.35 + px, -effectiveRadius * 0.1 + py, 1.8, 0, Math.PI * 2);
          ctx.fill();
        } else if (builderConfig.shapeType === 'circles') {
          ctx.fillStyle = effectiveColor;
          ctx.beginPath();
          ctx.arc(0, 0, effectiveRadius, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        } else if (builderConfig.shapeType === 'squares') {
          ctx.fillStyle = effectiveColor;
          ctx.beginPath();
          ctx.roundRect(
            -effectiveRadius,
            -effectiveRadius,
            effectiveRadius * 2,
            effectiveRadius * 2,
            4
          );
          ctx.fill();
        } else if (builderConfig.shapeType === 'triangles') {
          const heading = Math.atan2(obj.vy, obj.vx);
          ctx.rotate(heading);
          ctx.fillStyle = effectiveColor;
          ctx.beginPath();
          ctx.moveTo(effectiveRadius * 1.2, 0);
          ctx.lineTo(-effectiveRadius * 0.8, -effectiveRadius * 0.7);
          ctx.lineTo(-effectiveRadius * 0.8, effectiveRadius * 0.7);
          ctx.closePath();
          ctx.fill();
        } else {
          // Rings
          ctx.strokeStyle = effectiveColor;
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(0, 0, effectiveRadius, 0, Math.PI * 2);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(0, 0, effectiveRadius * 0.4, 0, Math.PI * 2);
          ctx.fillStyle = effectiveColor;
          ctx.fill();
        }

        // Draw object label or index
        ctx.fillStyle = '#27272A';
        ctx.font = 'bold 9px ui-monospace, monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`[${i}]`, 0, -effectiveRadius - 5);

        ctx.restore();
      }

      setBuilderLiveCount(list.length);
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [activeTab, builderConfig, builderIsRunning, builderMousePos]);

  // Handle Canvas Click -> Triggers mousePressed()
  const handleBuilderCanvasClick = (evt: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = builderCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clickX = (evt.clientX - rect.left) * scaleX;
    const clickY = (evt.clientY - rect.top) * scaleY;

    if (builderConfig.mouseAction === 'spawn-click') {
      const newEntity: SwarmEntity = {
        id: builderNextId.current++,
        x: clickX,
        y: clickY,
        vx: (Math.random() - 0.5) * builderConfig.speed * 2,
        vy: (Math.random() - 0.5) * builderConfig.speed * 2,
        radius: builderConfig.baseSize,
        color: builderConfig.baseColor,
        name: `${builderConfig.className}_${builderEntitiesRef.current.length}`,
        life: 255,
        maxLife: 255,
      };
      builderEntitiesRef.current.push(newEntity);
      setBuilderLiveCount(builderEntitiesRef.current.length);
      triggerEventToast(`mousePressed(): new ${builderConfig.className}(${Math.round(clickX)}, ${Math.round(clickY)})`, 'mouse');
    } else if (builderConfig.mouseAction === 'repel-click') {
      builderEntitiesRef.current.forEach((item) => {
        const dx = item.x - clickX;
        const dy = item.y - clickY;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const force = 12 / (dist * 0.05 + 1);
        item.vx += (dx / dist) * force;
        item.vy += (dy / dist) * force;
      });
      triggerEventToast(`mousePressed(): repel() en coordenadas (${Math.round(clickX)}, ${Math.round(clickY)})`, 'mouse');
    } else if (builderConfig.mouseAction === 'color-click') {
      const nextColor = PALETTE[Math.floor(Math.random() * PALETTE.length)];
      builderEntitiesRef.current.forEach((item) => {
        item.color = nextColor;
      });
      triggerEventToast(`mousePressed(): cambiarColor(${nextColor}) en todo el arreglo`, 'mouse');
    }
  };

  // Keyboard Event Handler -> Triggers keyPressed()
  const handleBuilderKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const key = e.key.toLowerCase();
    if (key === ' ' || key === 'spacebar') {
      e.preventDefault();
      // Burst
      const canvas = builderCanvasRef.current;
      const w = canvas ? canvas.width : 680;
      const h = canvas ? canvas.height : 380;
      for (let k = 0; k < 5; k++) {
        builderEntitiesRef.current.push({
          id: builderNextId.current++,
          x: 40 + Math.random() * (w - 80),
          y: 40 + Math.random() * (h - 80),
          vx: (Math.random() - 0.5) * builderConfig.speed * 2,
          vy: (Math.random() - 0.5) * builderConfig.speed * 2,
          radius: builderConfig.baseSize,
          color: builderConfig.baseColor,
          name: `${builderConfig.className}_${builderEntitiesRef.current.length}`,
          life: 255,
          maxLife: 255,
        });
      }
      setBuilderLiveCount(builderEntitiesRef.current.length);
      triggerEventToast(`keyPressed('ESPACIO'): Ráfaga de 5 instancias añadidas`, 'key');
    } else if (key === 'r') {
      builderEntitiesRef.current.forEach((item) => {
        item.vx *= -1;
        item.vy *= -1;
      });
      triggerEventToast(`keyPressed('R'): Inversión de velocidades (vx *= -1, vy *= -1)`, 'key');
    } else if (key === 'c') {
      builderEntitiesRef.current = [];
      setBuilderLiveCount(0);
      triggerEventToast(`keyPressed('C'): enjambre.clear() - Arreglo vaciado`, 'key');
    }
  };

  // Generate Real-time Java Code for the Class
  const generatedClassCode = `// ==========================================
// PESTAÑA: ${builderConfig.className}.pde
// Molde canónico de la clase
// ==========================================

class ${builderConfig.className} {
  // 1. CAMPOS (Atributos de estado)
  float x, y;
  float vx, vy;
  float tam;
  color c;

  // 2. CONSTRUCTOR (Inicialización de instancia)
  ${builderConfig.className}(float xTemp, float yTemp) {
    x = xTemp;
    y = yTemp;
    vx = random(-${builderConfig.speed}, ${builderConfig.speed});
    vy = random(-${builderConfig.speed}, ${builderConfig.speed});
    tam = ${builderConfig.baseSize};
    c = color(${builderConfig.baseColor.replace('#', '0x')});
  }

  // 3. MÉTODOS (Comportamiento)
  void mover() {
${
  builderConfig.movementType === 'gravity'
    ? `    vy += 0.12; // Gravedad acumulativa
    vx *= 0.995; // Fricción del aire
    x += vx;
    y += vy;
    if (y > height - tam) {
      y = height - tam;
      vy *= -0.75; // Rebote con pérdida de energía
    }`
    : builderConfig.movementType === 'organic'
    ? `    x += vx + sin(frameCount * 0.04) * 1.2;
    y += vy + cos(frameCount * 0.04) * 1.2;
    if (x < tam || x > width - tam) vx *= -1;
    if (y < tam || y > height - tam) vy *= -1;`
    : builderConfig.movementType === 'drift'
    ? `    x += vx;
    y += vy;
    // Teletransportación en bordes (Wrap-around):
    if (x < -tam) x = width + tam;
    if (x > width + tam) x = -tam;
    if (y < -tam) y = height + tam;
    if (y > height + tam) y = -tam;`
    : `    // Rebote estándar en bordes
    x += vx;
    y += vy;
    if (x < tam || x > width - tam) vx *= -1;
    if (y < tam || y > height - tam) vy *= -1;`
}
  }

  // Estructura condicional (Evaluada en cada frame)
  void checarCondicion() {
${
  builderConfig.conditionalRule === 'proximity-mouse'
    ? `    // Regla: si el cursor del mouse está a menos de 85 píxeles
    float d = dist(x, y, mouseX, mouseY);
    if (d < 85) {
      ${
        builderConfig.conditionalEffect === 'color-shift'
          ? `c = color(56, 189, 248); // Cambia a color reactivo de alerta`
          : `tam = ${builderConfig.baseSize * 1.5}; // Crece de tamaño por proximidad`
      }
    } else {
      c = color(${builderConfig.baseColor.replace('#', '0x')});
      tam = ${builderConfig.baseSize};
    }`
    : builderConfig.conditionalRule === 'half-screen'
    ? `    // Regla: si el objeto cruza la mitad de la pantalla
    if (x > width / 2) {
      c = color(56, 189, 248);
    } else {
      c = color(${builderConfig.baseColor.replace('#', '0x')});
    }`
    : `    // Regla oscilante senoidal
    if (sin(frameCount * 0.08) > 0.3) {
      tam = ${builderConfig.baseSize * 1.3};
    } else {
      tam = ${builderConfig.baseSize};
    }`
}
  }

  void dibujar() {
    fill(c);
    noStroke();
${
  builderConfig.shapeType === 'michis'
    ? `    // Cabeza del Michi
    circle(x, y, tam * 2);
    // Orejas triangulares
    triangle(x - tam * 0.7, y - tam * 0.5, x - tam * 0.9, y - tam * 1.3, x - tam * 0.2, y - tam * 0.85);
    triangle(x + tam * 0.7, y - tam * 0.5, x + tam * 0.9, y - tam * 1.3, x + tam * 0.2, y - tam * 0.85);`
    : builderConfig.shapeType === 'squares'
    ? `    rectMode(CENTER);
    rect(x, y, tam * 2, tam * 2, 4);`
    : builderConfig.shapeType === 'triangles'
    ? `    float angle = atan2(vy, vx);
    pushMatrix();
    translate(x, y);
    rotate(angle);
    triangle(tam * 1.2, 0, -tam * 0.8, -tam * 0.7, -tam * 0.8, tam * 0.7);
    popMatrix();`
    : builderConfig.shapeType === 'rings'
    ? `    stroke(c);
    strokeWeight(3);
    noFill();
    circle(x, y, tam * 2);
    fill(c);
    circle(x, y, tam * 0.8);`
    : `    circle(x, y, tam * 2);`
}
  }
}`;

  // Generate Real-time Java Code for the Main Sketch (incorporating mousePressed & keyPressed)
  const generatedSketchCode = `// ==========================================
// PESTAÑA PRINCIPAL: Sketch.pde
// Alimentando el arreglo con la clase ${builderConfig.className}
// ==========================================

ArrayList<${builderConfig.className}> enjambre = new ArrayList<${builderConfig.className}>();

void setup() {
  size(680, 380);
  
  // TIEMPO 1: Alimentar el arreglo con 14 instancias iniciales
  for (int i = 0; i < 14; i++) {
    enjambre.add(new ${builderConfig.className}(random(width), random(height)));
  }
}

void draw() {
  background(250);

  // TIEMPO 2: Actualizar, evaluar condición y dibujar cada objeto
  for (int i = 0; i < enjambre.size(); i++) {
    ${builderConfig.className} obj = enjambre.get(i);
    obj.checarCondicion(); // Evalúa la regla condicional 'if'
    obj.mover();           // Ejecuta la física del objeto
    obj.dibujar();         // Renderiza la geometría
  }
}

// ==========================================
// MANEJADOR DE EVENTO: MOUSE
// ==========================================
void mousePressed() {
${
  builderConfig.mouseAction === 'spawn-click'
    ? `  // Cada clic alimenta el arreglo con una nueva instancia en las coordenadas del cursor
  enjambre.add(new ${builderConfig.className}(mouseX, mouseY));
  println("Nueva instancia creada. Total en arreglo: " + enjambre.size());`
    : builderConfig.mouseAction === 'repel-click'
    ? `  // Clic repele a todas las instancias en el arreglo
  for (int i = 0; i < enjambre.size(); i++) {
    ${builderConfig.className} obj = enjambre.get(i);
    float d = dist(obj.x, obj.y, mouseX, mouseY);
    if (d < 150) {
      obj.vx += (obj.x - mouseX) * 0.15;
      obj.vy += (obj.y - mouseY) * 0.15;
    }
  }`
    : `  // Clic cambia el color de todos los objetos en el arreglo
  color nuevoColor = color(random(255), random(255), random(255));
  for (int i = 0; i < enjambre.size(); i++) {
    enjambre.get(i).c = nuevoColor;
  }`
}
}

// ==========================================
// MANEJADOR DE EVENTO: TECLADO
// ==========================================
void keyPressed() {
${
  builderConfig.keyAction === 'burst-space'
    ? `  // Presionar 'ESPACIO' genera una ráfaga de 5 objetos
  if (key == ' ') {
    for (int k = 0; k < 5; k++) {
      enjambre.add(new ${builderConfig.className}(random(width), random(height)));
    }
    println("Ráfaga de 5 instancias añadidas.");
  }`
    : builderConfig.keyAction === 'reverse-r'
    ? `  // Presionar 'R' invierte el sentido de todos los objetos
  if (key == 'r' || key == 'R') {
    for (int i = 0; i < enjambre.size(); i++) {
      enjambre.get(i).vx *= -1;
      enjambre.get(i).vy *= -1;
    }
    println("Sentido de velocidad invertido.");
  }`
    : `  // Presionar 'C' vacía el arreglo
  if (key == 'c' || key == 'C') {
    enjambre.clear();
    println("Arreglo vaciado.");
  }`
}
}`;

  // =========================================================================
  // 2. SWARM LAB SIMULATOR STATE
  // =========================================================================
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [simPreset, setSimPreset] = useState<'cats' | 'particles' | 'network'>('cats');
  const [collectionType, setCollectionType] = useState<'fixed' | 'arraylist'>('fixed');
  const [entityCount, setEntityCount] = useState<number>(18);
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [showIndices, setShowIndices] = useState<boolean>(true);
  const [connectNeighbors, setConnectNeighbors] = useState<boolean>(true);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);

  const entitiesRef = useRef<SwarmEntity[]>([]);
  const nextIdRef = useRef<number>(0);
  const [liveSize, setLiveSize] = useState<number>(entityCount);

  const initEntities = useCallback(
    (count: number, width = 680, height = 380) => {
      const arr: SwarmEntity[] = [];
      for (let i = 0; i < count; i++) {
        arr.push({
          id: nextIdRef.current++,
          x: 40 + Math.random() * (width - 80),
          y: 40 + Math.random() * (height - 80),
          vx: (Math.random() - 0.5) * 3,
          vy: (Math.random() - 0.5) * 3,
          radius: simPreset === 'cats' ? 18 : simPreset === 'particles' ? 9 : 12,
          color: PALETTE[i % PALETTE.length],
          name: `Michi_${i}`,
          life: 255,
          maxLife: 255,
        });
      }
      entitiesRef.current = arr;
      setLiveSize(arr.length);
    },
    [simPreset]
  );

  useEffect(() => {
    initEntities(entityCount);
  }, [initEntities, entityCount, simPreset]);

  // Main canvas animation loop for Swarm Lab
  useEffect(() => {
    if (activeTab !== 'lab') return;
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;

      ctx.fillStyle = '#FAFAFA';
      ctx.fillRect(0, 0, width, height);

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

      const list = entitiesRef.current;

      if (connectNeighbors && (simPreset === 'network' || simPreset === 'cats')) {
        const threshold = simPreset === 'network' ? 95 : 70;
        ctx.lineWidth = 1;
        for (let i = 0; i < list.length; i++) {
          for (let j = i + 1; j < list.length; j++) {
            const dx = list[i].x - list[j].x;
            const dy = list[i].y - list[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < threshold) {
              const alpha = (1 - dist / threshold) * 0.45;
              ctx.strokeStyle = `rgba(0, 102, 153, ${alpha})`;
              ctx.beginPath();
              ctx.moveTo(list[i].x, list[i].y);
              ctx.lineTo(list[j].x, list[j].y);
              ctx.stroke();
            }
          }
        }
      }

      for (let i = list.length - 1; i >= 0; i--) {
        const e = list[i];

        if (isRunning) {
          if (simPreset === 'particles') {
            e.vy += 0.06;
            e.vx *= 0.99;
            e.life -= 1.2;
          }

          e.x += e.vx;
          e.y += e.vy;

          if (e.x < e.radius) {
            e.x = e.radius;
            e.vx *= -1;
          } else if (e.x > width - e.radius) {
            e.x = width - e.radius;
            e.vx *= -1;
          }

          if (e.y < e.radius) {
            e.y = e.radius;
            e.vy *= -1;
          } else if (e.y > height - e.radius) {
            e.y = height - e.radius;
            e.vy *= simPreset === 'particles' ? -0.7 : -1;
          }

          if (collectionType === 'arraylist' && simPreset === 'particles' && e.life <= 0) {
            list.splice(i, 1);
            continue;
          }
        }

        ctx.save();
        ctx.translate(e.x, e.y);

        if (simPreset === 'cats') {
          ctx.fillStyle = e.color;
          ctx.beginPath();
          ctx.arc(0, 0, e.radius, 0, Math.PI * 2);
          ctx.fill();

          ctx.beginPath();
          ctx.moveTo(-e.radius * 0.7, -e.radius * 0.5);
          ctx.lineTo(-e.radius * 0.9, -e.radius * 1.3);
          ctx.lineTo(-e.radius * 0.2, -e.radius * 0.85);
          ctx.fill();

          ctx.beginPath();
          ctx.moveTo(e.radius * 0.7, -e.radius * 0.5);
          ctx.lineTo(e.radius * 0.9, -e.radius * 1.3);
          ctx.lineTo(e.radius * 0.2, -e.radius * 0.85);
          ctx.fill();

          const targetX = mousePos ? mousePos.x - e.x : e.vx * 30;
          const targetY = mousePos ? mousePos.y - e.y : e.vy * 30;
          const angle = Math.atan2(targetY, targetX);
          const eyeDist = 2.5;
          const pupilX = Math.cos(angle) * eyeDist;
          const pupilY = Math.sin(angle) * eyeDist;

          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.arc(-e.radius * 0.35, -e.radius * 0.1, 4, 0, Math.PI * 2);
          ctx.arc(e.radius * 0.35, -e.radius * 0.1, 4, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#111827';
          ctx.beginPath();
          ctx.arc(-e.radius * 0.35 + pupilX, -e.radius * 0.1 + pupilY, 2, 0, Math.PI * 2);
          ctx.arc(e.radius * 0.35 + pupilX, -e.radius * 0.1 + pupilY, 2, 0, Math.PI * 2);
          ctx.fill();
        } else if (simPreset === 'particles') {
          const alpha = Math.max(0, e.life / e.maxLife);
          ctx.fillStyle = e.color;
          ctx.globalAlpha = alpha;
          ctx.beginPath();
          ctx.arc(0, 0, e.radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1;
        } else {
          ctx.fillStyle = '#0F172A';
          ctx.beginPath();
          ctx.arc(0, 0, e.radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#38BDF8';
          ctx.lineWidth = 2;
          ctx.stroke();
        }

        if (showIndices) {
          ctx.fillStyle = '#18181B';
          ctx.font = 'bold 9px ui-monospace, SFMono-Regular, Menlo, monospace';
          ctx.textAlign = 'center';
          ctx.fillText(`[${i}]`, 0, -e.radius - 6);
        }

        ctx.restore();
      }

      setLiveSize(list.length);
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [activeTab, isRunning, showIndices, connectNeighbors, simPreset, collectionType, mousePos]);

  // =========================================================================
  // 3. MEMORY VISUALIZER STATE
  // =========================================================================
  const [memoryStep, setMemoryStep] = useState<number>(0);
  const [memorySlots, setMemorySlots] = useState<Array<{ name: string; hex: string } | null>>([
    null,
    null,
    null,
    null,
    null,
    null,
  ]);
  const [hasNpeCrash, setHasNpeCrash] = useState<boolean>(false);

  const handleStepMemory = (step: number) => {
    setMemoryStep(step);
    setHasNpeCrash(false);
    if (step === 0 || step === 1) {
      setMemorySlots([null, null, null, null, null, null]);
    } else if (step === 2) {
      setMemorySlots([
        { name: 'Michi Alfa', hex: '#0x7F20' },
        { name: 'Michi Beta', hex: '#0x7F28' },
        { name: 'Michi Rayas', hex: '#0x7F30' },
        null,
        null,
        null,
      ]);
    } else if (step === 3) {
      setMemorySlots([
        { name: 'Michi Alfa', hex: '#0x7F20' },
        { name: 'Michi Beta', hex: '#0x7F28' },
        { name: 'Michi Rayas', hex: '#0x7F30' },
        { name: 'Michi Nieve', hex: '#0x7F38' },
        { name: 'Michi Cosmos', hex: '#0x7F40' },
        { name: 'Michi Luna', hex: '#0x7F48' },
      ]);
    }
  };

  // =========================================================================
  // 4. CHALLENGES STATE
  // =========================================================================
  const [challengeAnswers, setChallengeAnswers] = useState<Record<number, number | null>>({
    1: null,
    2: null,
    3: null,
  });

  const challenges = [
    {
      id: 1,
      title: 'Reto 1: Diagnóstico de NullPointerException',
      description:
        'Observa este código que un estudiante escribió en el laboratorio de CENTRO. El sketch se congela en la línea 8 con un error rojo en la consola.',
      snippet: `Gato[] camada = new Gato[20];

void setup() {
  size(600, 400);
}

void draw() {
  background(255);
  camada[0].dibujar(); // 💥 LÍNEA 8: NullPointerException
}`,
      question: '¿Por qué ocurre el error en la línea 8?',
      options: [
        {
          text: 'Porque new Gato[20] solo reservó 20 casillas vacías (null). La casilla camada[0] no tiene ningún objeto creado con "new Gato(...)".',
          isCorrect: true,
          feedback:
            '¡Correcto! En Java, los arreglos de objetos nacen llenos de referencias "null". Antes de llamar a .dibujar(), debes hacer camada[0] = new Gato(...); en setup().',
        },
        {
          text: 'Porque en Processing no se puede usar el índice 0; los arreglos siempre inician en 1.',
          isCorrect: false,
          feedback:
            'Incorrecto. En Processing y Java los arreglos siempre inician en el índice 0 (índices 0 a N-1).',
        },
        {
          text: 'Porque la variable camada debe declararse dentro de draw() en lugar de ser global.',
          isCorrect: false,
          feedback:
            'Incorrecto. Si declaras el arreglo dentro de draw(), se reiniciaría 60 veces por segundo. Debe ser global.',
        },
      ],
    },
    {
      id: 2,
      title: 'Reto 2: Propiedad de longitud en Arreglos Fijos',
      description:
        'Queremos cambiar el tamaño del arreglo de 20 a 50 sin tener que buscar y reemplazar el número 20 en todo nuestro código.',
      snippet: `Gato[] camada = new Gato[50];

void setup() {
  size(600, 400);
  for (int i = 0; i < ___________; i++) {
    camada[i] = new Gato("Gato" + i, random(width), random(height));
  }
}`,
      question: '¿Cuál es la forma correcta de escribir la condición de parada del bucle?',
      options: [
        {
          text: 'camada.length (propiedad nativa de Java sin paréntesis).',
          isCorrect: true,
          feedback:
            '¡Exacto! Los arreglos fijos de Java exponen .length como propiedad de solo lectura. Las cadenas String usan .length() con paréntesis, y los ArrayList usan .size().',
        },
        {
          text: 'camada.size()',
          isCorrect: false,
          feedback:
            'Incorrecto. .size() es un método exclusivo de colecciones como ArrayList, no de arreglos fijos nativos.',
        },
        {
          text: 'camada.length()',
          isCorrect: false,
          feedback:
            'Incorrecto. En los arreglos de Java .length no es un método, sino una variable interna, por lo que NO lleva paréntesis.',
        },
      ],
    },
    {
      id: 3,
      title: 'Reto 3: Eliminación segura en ArrayList',
      description:
        'En un sistema de partículas o fuegos artificiales, algunas partículas expiran. ¿Por qué debemos recorrer el ArrayList de atrás hacia adelante al usar .remove(i)?',
      snippet: `// Bucle inverso para remoción segura:
for (int i = particulas.size() - 1; i >= 0; i--) {
  Particula p = particulas.get(i);
  if (p.haMuerto()) {
    particulas.remove(i);
  }
}`,
      question: '¿Qué bug ocurre si recorres la lista hacia adelante (i = 0; i < size; i++) y eliminas un elemento?',
      options: [
        {
          text: 'Al borrar el elemento en el índice i, todos los elementos posteriores se recorren una posición a la izquierda, provocando que el bucle se salte el siguiente elemento sin revisarlo.',
          isCorrect: true,
          feedback:
            '¡Excelente comprensión de memoria! Si borras el índice 2, el que estaba en el 3 pasa a ser el nuevo 2, pero en la siguiente vuelta el bucle evalúa el 3, saltándose por completo al elemento desplazado.',
        },
        {
          text: 'Java bloquea inmediatamente la ejecución con una excepción de seguridad de memoria.',
          isCorrect: false,
          feedback:
            'Incorrecto. El código compila y corre, pero genera un comportamiento errático visual con partículas que parpadean o no mueren a tiempo.',
        },
        {
          text: 'El ArrayList se convierte automáticamente en un arreglo fijo y ya no se pueden agregar más elementos.',
          isCorrect: false,
          feedback: 'Incorrecto. Un ArrayList nunca cambia de tipo dinámicamente.',
        },
      ],
    },
  ];

  const handleSelectChallengeOption = (chId: number, optIdx: number) => {
    setChallengeAnswers((prev) => ({ ...prev, [chId]: optIdx }));
    const ch = challenges.find((c) => c.id === chId);
    if (ch && ch.options[optIdx].isCorrect && onCompleteChallenge) {
      onCompleteChallenge(`challenge_${chId}`);
    }
  };

  const completedCount = Object.entries(challengeAnswers).filter(
    ([id, ans]) => ans !== null && challenges.find((c) => c.id === Number(id))?.options[ans].isCorrect
  ).length;

  return (
    <div className="space-y-8 animate-in fade-in duration-150">
      {/* Top Breadcrumb Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200">
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <button
            onClick={onNavigateHome}
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
          <span className="text-zinc-400">Programación Orientada a Objetos</span>
          <span>/</span>
          <span className="text-zinc-950 font-semibold font-mono">Tema 07 · Sesión Completa</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigateTopic('classes')}
            className="min-h-[38px] px-3.5 py-1.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-xs font-medium text-zinc-800 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span>Taller previo: Anatomía de Clase (Tema 6)</span>
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2.5 text-xs text-zinc-500">
          <span className="font-mono text-xs text-zinc-900 font-semibold bg-zinc-100 px-2 py-0.5 rounded">
            Módulo Canónico 07
          </span>
          <span>·</span>
          <span className="font-mono text-zinc-600 bg-zinc-50 border border-zinc-200 px-2 py-0.5 rounded">
            Gato[] y ArrayList&lt;Gato&gt;
          </span>
          <span>·</span>
          <span>Estudio & Laboratorio Interactivo</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950">
          Arreglos y Colecciones de Objetos
        </h1>

        <p className="text-sm sm:text-base text-zinc-600 max-w-3xl leading-relaxed">
          Diseña la clase con sus campos, constructor y métodos, programa reglas lógicas con{' '}
          <code className="text-xs bg-zinc-100 px-1 py-0.5 rounded font-mono text-zinc-800">if</code>, conecta eventos de{' '}
          <code className="text-xs bg-zinc-100 px-1 py-0.5 rounded font-mono text-zinc-800">mousePressed()</code> y{' '}
          <code className="text-xs bg-zinc-100 px-1 py-0.5 rounded font-mono text-zinc-800">keyPressed()</code>, y alimenta el
          arreglo para simular enjambres vivos en Processing.
        </p>
      </div>

      {/* Segmented Tab Navigation Bar */}
      <div className="flex items-center gap-1.5 p-1 bg-zinc-100 rounded-xl border border-zinc-200 max-w-fit overflow-x-auto">
        <button
          onClick={() => setActiveTab('builder')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'builder'
              ? 'bg-zinc-950 text-white shadow-xs'
              : 'text-zinc-600 hover:text-zinc-950'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Diseñar Clase & Eventos</span>
        </button>

        <button
          onClick={() => setActiveTab('lab')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'lab'
              ? 'bg-zinc-950 text-white shadow-xs'
              : 'text-zinc-600 hover:text-zinc-950'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Laboratorio de Enjambres</span>
        </button>

        <button
          onClick={() => setActiveTab('memory')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'memory'
              ? 'bg-zinc-950 text-white shadow-xs'
              : 'text-zinc-600 hover:text-zinc-950'
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span>Simulador de Memoria RAM</span>
        </button>

        <button
          onClick={() => setActiveTab('guide')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'guide'
              ? 'bg-zinc-950 text-white shadow-xs'
              : 'text-zinc-600 hover:text-zinc-950'
          }`}
        >
          <Code2 className="w-4 h-4" />
          <span>Patrones & Código Canónico</span>
        </button>

        <button
          onClick={() => setActiveTab('challenges')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'challenges'
              ? 'bg-zinc-950 text-white shadow-xs'
              : 'text-zinc-600 hover:text-zinc-950'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>Retos Didácticos ({completedCount}/3)</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB: BUILDER DE CLASE, CONSTRUCTOR, MÉTODOS Y EVENTOS                     */}
      {/* ========================================================================= */}
      {activeTab === 'builder' && (
        <div
          tabIndex={0}
          onKeyDown={handleBuilderKeyDown}
          className="space-y-6 outline-none focus:ring-1 focus:ring-zinc-400 rounded-2xl"
        >
          {/* Preset Quick Start */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs">
            <div className="flex items-center gap-2 text-zinc-700 font-medium">
              <Wand2 className="w-4 h-4 text-zinc-900" />
              <span>Plantillas rápidas para comenzar:</span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                onClick={() => {
                  setBuilderConfig({
                    className: 'MichiAutonomo',
                    shapeType: 'michis',
                    baseColor: '#E2661A',
                    baseSize: 18,
                    movementType: 'bounce',
                    speed: 3,
                    conditionalRule: 'proximity-mouse',
                    conditionalEffect: 'color-shift',
                    mouseAction: 'spawn-click',
                    keyAction: 'burst-space',
                  });
                  initBuilderEntities(14);
                }}
                className="px-2.5 py-1 rounded-md bg-white hover:bg-zinc-200 border border-zinc-200 text-zinc-800 font-medium transition-colors cursor-pointer"
              >
                Michi Reactivo
              </button>

              <button
                onClick={() => {
                  setBuilderConfig({
                    className: 'ParticulaGravedad',
                    shapeType: 'circles',
                    baseColor: '#006699',
                    baseSize: 12,
                    movementType: 'gravity',
                    speed: 4,
                    conditionalRule: 'half-screen',
                    conditionalEffect: 'color-shift',
                    mouseAction: 'spawn-click',
                    keyAction: 'reverse-r',
                  });
                  initBuilderEntities(14);
                }}
                className="px-2.5 py-1 rounded-md bg-white hover:bg-zinc-200 border border-zinc-200 text-zinc-800 font-medium transition-colors cursor-pointer"
              >
                Partícula con Gravedad
              </button>

              <button
                onClick={() => {
                  setBuilderConfig({
                    className: 'NaveOrbital',
                    shapeType: 'triangles',
                    baseColor: '#059669',
                    baseSize: 14,
                    movementType: 'drift',
                    speed: 3.5,
                    conditionalRule: 'proximity-mouse',
                    conditionalEffect: 'scale-up',
                    mouseAction: 'repel-click',
                    keyAction: 'burst-space',
                  });
                  initBuilderEntities(14);
                }}
                className="px-2.5 py-1 rounded-md bg-white hover:bg-zinc-200 border border-zinc-200 text-zinc-800 font-medium transition-colors cursor-pointer"
              >
                Nave Orbital
              </button>
            </div>
          </div>

          {/* 2-Column Architecture: Left = Interactive Class Definition & Events / Right = Live Canvas & Real-time Code */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT COLUMN: The Class & Event Blueprint (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              {/* 1. Class Identity & Constructor Attributes */}
              <div className="bg-white border border-zinc-200 rounded-xl p-4 sm:p-5 space-y-3.5">
                <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-zinc-900 text-white flex items-center justify-center font-mono text-[10px] font-bold">
                      1
                    </span>
                    <h3 className="font-semibold text-xs sm:text-sm text-zinc-900">
                      Identidad de la Clase & Constructor
                    </h3>
                  </div>
                  <span className="font-mono text-[11px] text-zinc-400">Campos y Molde</span>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-zinc-600 font-medium mb-1">Nombre de la Clase:</label>
                    <div className="flex items-center gap-1.5 font-mono">
                      <span className="text-zinc-400">class</span>
                      <input
                        type="text"
                        value={builderConfig.className}
                        onChange={(e) =>
                          setBuilderConfig((prev) => ({
                            ...prev,
                            className: e.target.value.replace(/[^a-zA-Z0-9_]/g, '') || 'MiObjeto',
                          }))
                        }
                        className="flex-1 px-2.5 py-1.5 bg-zinc-50 border border-zinc-300 rounded font-semibold text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                      />
                      <span className="text-zinc-400">&#123;</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-zinc-600 font-medium mb-1">Geometría Visual:</label>
                      <select
                        value={builderConfig.shapeType}
                        onChange={(e) =>
                          setBuilderConfig((prev) => ({ ...prev, shapeType: e.target.value as ShapeKind }))
                        }
                        className="w-full px-2.5 py-1.5 bg-zinc-50 border border-zinc-300 rounded text-xs text-zinc-800 focus:outline-none focus:ring-1 focus:ring-zinc-900 cursor-pointer"
                      >
                        <option value="michis">Michis con Orejas</option>
                        <option value="circles">Círculos con Brillo</option>
                        <option value="squares">Cuadrados Rotados</option>
                        <option value="triangles">Triángulos Orientados</option>
                        <option value="rings">Anillos de Pulso</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-zinc-600 font-medium mb-1">Color Base:</label>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="color"
                          value={builderConfig.baseColor}
                          onChange={(e) => {
                            const newCol = e.target.value;
                            setBuilderConfig((prev) => ({ ...prev, baseColor: newCol }));
                            builderEntitiesRef.current.forEach((item) => (item.color = newCol));
                          }}
                          className="w-8 h-8 rounded border border-zinc-300 p-0.5 cursor-pointer bg-white"
                        />
                        <span className="font-mono text-[11px] text-zinc-600 uppercase">
                          {builderConfig.baseColor}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-zinc-600 mb-1">
                      <span>Tamaño del objeto (tam):</span>
                      <span className="font-mono font-bold text-zinc-900 tabular-nums">
                        {builderConfig.baseSize} px
                      </span>
                    </div>
                    <input
                      type="range"
                      min={8}
                      max={32}
                      value={builderConfig.baseSize}
                      onChange={(e) => {
                        const s = Number(e.target.value);
                        setBuilderConfig((prev) => ({ ...prev, baseSize: s }));
                        builderEntitiesRef.current.forEach((item) => (item.radius = s));
                      }}
                      className="w-full accent-zinc-900 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Physics & Movement Method */}
              <div className="bg-white border border-zinc-200 rounded-xl p-4 sm:p-5 space-y-3.5">
                <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-zinc-900 text-white flex items-center justify-center font-mono text-[10px] font-bold">
                      2
                    </span>
                    <h3 className="font-semibold text-xs sm:text-sm text-zinc-900">
                      Método void mover()
                    </h3>
                  </div>
                  <span className="font-mono text-[11px] text-zinc-400">Cinemática & Física</span>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-zinc-600 font-medium mb-1">Tipo de Comportamiento Físico:</label>
                    <select
                      value={builderConfig.movementType}
                      onChange={(e) =>
                        setBuilderConfig((prev) => ({ ...prev, movementType: e.target.value as MovementKind }))
                      }
                      className="w-full px-2.5 py-1.5 bg-zinc-50 border border-zinc-300 rounded text-xs text-zinc-800 focus:outline-none focus:ring-1 focus:ring-zinc-900 cursor-pointer"
                    >
                      <option value="bounce">Rebote en Bordes (vx *= -1)</option>
                      <option value="gravity">Gravedad y Pérdida de Energía (vy += 0.12)</option>
                      <option value="organic">Deriva Orgánica Senoidal (sin & cos)</option>
                      <option value="drift">Flotación Continua (Wrap-around en bordes)</option>
                    </select>
                  </div>

                  <div>
                    <div className="flex justify-between text-zinc-600 mb-1">
                      <span>Velocidad de desplazamiento:</span>
                      <span className="font-mono font-bold text-zinc-900 tabular-nums">
                        {builderConfig.speed} px/frame
                      </span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={8}
                      step={0.5}
                      value={builderConfig.speed}
                      onChange={(e) => {
                        const spd = Number(e.target.value);
                        setBuilderConfig((prev) => ({ ...prev, speed: spd }));
                        builderEntitiesRef.current.forEach((item) => {
                          const angle = Math.atan2(item.vy, item.vx);
                          item.vx = Math.cos(angle) * spd;
                          item.vy = Math.sin(angle) * spd;
                        });
                      }}
                      className="w-full accent-zinc-900 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* 3. Conditional Rule with IF */}
              <div className="bg-white border border-zinc-200 rounded-xl p-4 sm:p-5 space-y-3.5">
                <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-zinc-900 text-white flex items-center justify-center font-mono text-xs font-bold">
                      3
                    </span>
                    <h3 className="font-semibold text-xs sm:text-sm text-zinc-900">
                      Regla Condicional con if
                    </h3>
                  </div>
                  <span className="font-mono text-[11px] text-zinc-400">Toma de Decisiones</span>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-zinc-600 font-medium mb-1">Condición evaluada en cada frame:</label>
                    <select
                      value={builderConfig.conditionalRule}
                      onChange={(e) =>
                        setBuilderConfig((prev) => ({ ...prev, conditionalRule: e.target.value as ConditionalRule }))
                      }
                      className="w-full px-2.5 py-1.5 bg-zinc-50 border border-zinc-300 rounded text-xs text-zinc-800 focus:outline-none focus:ring-1 focus:ring-zinc-900 cursor-pointer"
                    >
                      <option value="proximity-mouse">if (dist(x, y, mouseX, mouseY) &lt; 85) - Proximidad</option>
                      <option value="half-screen">if (x &gt; width / 2) - Cruzar mitad de pantalla</option>
                      <option value="size-pulse">if (sin(frameCount * 0.08) &gt; 0.3) - Pulso temporal</option>
                      <option value="none">Sin condición especial</option>
                    </select>
                  </div>

                  {builderConfig.conditionalRule !== 'none' && (
                    <div>
                      <label className="block text-zinc-600 font-medium mb-1">Efecto al cumplirse el if:</label>
                      <select
                        value={builderConfig.conditionalEffect}
                        onChange={(e) =>
                          setBuilderConfig((prev) => ({
                            ...prev,
                            conditionalEffect: e.target.value as ConditionalEffect,
                          }))
                        }
                        className="w-full px-2.5 py-1.5 bg-zinc-50 border border-zinc-300 rounded text-xs text-zinc-800 focus:outline-none focus:ring-1 focus:ring-zinc-900 cursor-pointer"
                      >
                        <option value="color-shift">Cambiar color a cian reactivo (#38BDF8)</option>
                        <option value="scale-up">Agrandar tamaño un 50% (tam * 1.5)</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>

              {/* 4. Event Handlers: mousePressed() & keyPressed() */}
              <div className="bg-white border border-zinc-200 rounded-xl p-4 sm:p-5 space-y-3.5">
                <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-zinc-900 text-white flex items-center justify-center font-mono text-[10px] font-bold">
                      4
                    </span>
                    <h3 className="font-semibold text-xs sm:text-sm text-zinc-900">
                      Manejadores de Eventos (Entradas)
                    </h3>
                  </div>
                  <span className="font-mono text-[11px] text-zinc-400">Mouse & Teclado</span>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <div className="flex items-center gap-1.5 text-zinc-700 font-medium mb-1">
                      <MousePointer className="w-3.5 h-3.5 text-zinc-900" />
                      <span>Al hacer clic en el lienzo (void mousePressed):</span>
                    </div>
                    <select
                      value={builderConfig.mouseAction}
                      onChange={(e) =>
                        setBuilderConfig((prev) => ({ ...prev, mouseAction: e.target.value as MouseEventAction }))
                      }
                      className="w-full px-2.5 py-1.5 bg-zinc-50 border border-zinc-300 rounded text-xs text-zinc-800 focus:outline-none focus:ring-1 focus:ring-zinc-900 cursor-pointer"
                    >
                      <option value="spawn-click">Alimentar el arreglo con new {builderConfig.className}(mouseX, mouseY)</option>
                      <option value="repel-click">Repeler todas las instancias lejos del cursor</option>
                      <option value="color-click">Cambiar color de todo el arreglo a un tono aleatorio</option>
                    </select>
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5 text-zinc-700 font-medium mb-1">
                      <Keyboard className="w-3.5 h-3.5 text-zinc-900" />
                      <span>Al presionar el teclado (void keyPressed):</span>
                    </div>
                    <select
                      value={builderConfig.keyAction}
                      onChange={(e) =>
                        setBuilderConfig((prev) => ({ ...prev, keyAction: e.target.value as KeyEventAction }))
                      }
                      className="w-full px-2.5 py-1.5 bg-zinc-50 border border-zinc-300 rounded text-xs text-zinc-800 focus:outline-none focus:ring-1 focus:ring-zinc-900 cursor-pointer"
                    >
                      <option value="burst-space">Barra Espaciadora: Inyectar ráfaga de 5 instancias</option>
                      <option value="reverse-r">Tecla 'R': Invertir sentido de velocidad (vx *= -1)</option>
                      <option value="clear-c">Tecla 'C': Vaciar todo el arreglo (enjambre.clear())</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Live Canvas & Double-Tabbed Generated Processing Code (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              {/* Live Canvas Window */}
              <div className="bg-white border border-zinc-200 rounded-2xl p-4 space-y-3 shadow-xs">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="font-semibold text-zinc-900">
                      Lienzo Reactivo: {builderConfig.className}[]
                    </span>
                    <span className="text-zinc-400">·</span>
                    <span className="font-mono text-zinc-600 tabular-nums">
                      {builderLiveCount} instancias vivas
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setBuilderIsRunning(!builderIsRunning)}
                      className="min-h-[34px] flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-medium transition-colors cursor-pointer"
                    >
                      {builderIsRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                      <span>{builderIsRunning ? 'Pausar' : 'Correr'}</span>
                    </button>

                    <button
                      onClick={() => initBuilderEntities(14)}
                      className="min-h-[34px] flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-medium transition-colors cursor-pointer"
                      title="Reiniciar posiciones"
                    >
                      <RotateCcw className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* The Interactive Canvas */}
                <div className="relative border border-zinc-200 rounded-xl overflow-hidden bg-zinc-50 cursor-crosshair">
                  <canvas
                    ref={builderCanvasRef}
                    width={680}
                    height={380}
                    onClick={handleBuilderCanvasClick}
                    onMouseMove={(e) => {
                      const canvas = builderCanvasRef.current;
                      if (!canvas) return;
                      const rect = canvas.getBoundingClientRect();
                      const scaleX = canvas.width / rect.width;
                      const scaleY = canvas.height / rect.height;
                      setBuilderMousePos({
                        x: (e.clientX - rect.left) * scaleX,
                        y: (e.clientY - rect.top) * scaleY,
                      });
                    }}
                    onMouseLeave={() => setBuilderMousePos(null)}
                    className="w-full h-auto block select-none"
                  />

                  {/* Toast notification for real-time event executions */}
                  {lastEventToast && (
                    <div className="absolute top-3 left-3 right-3 flex justify-center pointer-events-none animate-in fade-in duration-150">
                      <div className="px-3 py-1.5 rounded-lg bg-zinc-950/90 text-white border border-zinc-800 text-xs font-mono shadow-lg flex items-center gap-2">
                        {lastEventToast.type === 'mouse' ? (
                          <MousePointer className="w-3.5 h-3.5 text-sky-400" />
                        ) : (
                          <Keyboard className="w-3.5 h-3.5 text-amber-400" />
                        )}
                        <span>{lastEventToast.text}</span>
                      </div>
                    </div>
                  )}

                  {/* Bottom helper pill */}
                  <div className="absolute bottom-2 left-2 right-2 px-3 py-1.5 rounded-lg bg-white/95 backdrop-blur-xs border border-zinc-200 text-[11px] text-zinc-600 flex flex-wrap items-center justify-between gap-2">
                    <span className="flex items-center gap-1.5">
                      <MousePointer className="w-3 h-3 text-zinc-800" />
                      <span>Haz clic para probar <strong>mousePressed()</strong></span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Keyboard className="w-3 h-3 text-zinc-800" />
                      <span>Presiona <strong>Espacio</strong>, <strong>R</strong> o <strong>C</strong> para <strong>keyPressed()</strong></span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-zinc-500 pt-1">
                  <span>
                    Colección activa: <code className="font-mono text-zinc-900 font-bold">ArrayList&lt;{builderConfig.className}&gt;</code>
                  </span>
                  <span className="font-mono text-[11px]">
                    Física: {builderConfig.movementType} · Regla: {builderConfig.conditionalRule}
                  </span>
                </div>
              </div>

              {/* Double-Tabbed Code Inspector */}
              <div className="bg-white border border-zinc-200 rounded-2xl p-4 sm:p-5 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-100 pb-3">
                  <div>
                    <h3 className="font-semibold text-sm text-zinc-900">
                      Código Fuente Generado en Tiempo Real
                    </h3>
                    <p className="text-[11px] text-zinc-500">
                      Tu diseño exportado en sintaxis Processing Java 4
                    </p>
                  </div>

                  <div className="flex items-center gap-1 p-1 bg-zinc-100 rounded-lg">
                    <button
                      onClick={() => setBuilderCodeTab('class')}
                      className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                        builderCodeTab === 'class'
                          ? 'bg-white text-zinc-950 font-semibold shadow-xs'
                          : 'text-zinc-600 hover:text-zinc-900'
                      }`}
                    >
                      {builderConfig.className}.pde (La Clase)
                    </button>
                    <button
                      onClick={() => setBuilderCodeTab('sketch')}
                      className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                        builderCodeTab === 'sketch'
                          ? 'bg-white text-zinc-950 font-semibold shadow-xs'
                          : 'text-zinc-600 hover:text-zinc-900'
                      }`}
                    >
                      Sketch.pde (El Enjambre)
                    </button>
                  </div>
                </div>

                {builderCodeTab === 'class' ? (
                  <ProcessingCodeBlock
                    code={generatedClassCode}
                    filename={`${builderConfig.className}.pde`}
                    showCopyButton={true}
                  />
                ) : (
                  <ProcessingCodeBlock
                    code={generatedSketchCode}
                    filename="Sketch.pde"
                    showCopyButton={true}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB: LABORATORIO DE ENJAMBRES PREFABRICADO                                */}
      {/* ========================================================================= */}
      {activeTab === 'lab' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-8 bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-xs space-y-3 p-4">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
                <div className="flex items-center gap-2 text-xs text-zinc-700 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="font-semibold text-zinc-900">Lienzo en Vivo (Processing Engine)</span>
                  <span className="text-zinc-400">·</span>
                  <span className="font-mono text-zinc-600 tabular-nums">
                    {collectionType === 'fixed'
                      ? `camada.length = ${liveSize}`
                      : `gatos.size() = ${liveSize}`}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsRunning(!isRunning)}
                    className="min-h-[36px] flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-medium transition-colors cursor-pointer"
                  >
                    {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    <span>{isRunning ? 'Pausar' : 'Reanudar'}</span>
                  </button>

                  <button
                    onClick={() => initEntities(entityCount)}
                    className="min-h-[36px] flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-medium transition-colors cursor-pointer"
                    title="Regenerar posiciones aleatorias"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reiniciar</span>
                  </button>
                </div>
              </div>

              <div className="relative border border-zinc-200 rounded-xl overflow-hidden bg-zinc-50 cursor-crosshair">
                <canvas
                  ref={canvasRef}
                  width={680}
                  height={380}
                  onClick={(evt) => {
                    const canvas = canvasRef.current;
                    if (!canvas) return;
                    const rect = canvas.getBoundingClientRect();
                    const scaleX = canvas.width / rect.width;
                    const scaleY = canvas.height / rect.height;
                    const x = (evt.clientX - rect.left) * scaleX;
                    const y = (evt.clientY - rect.top) * scaleY;
                    entitiesRef.current.push({
                      id: nextIdRef.current++,
                      x,
                      y,
                      vx: (Math.random() - 0.5) * 5,
                      vy: (Math.random() - 0.5) * 5,
                      radius: simPreset === 'cats' ? 18 : simPreset === 'particles' ? 10 : 12,
                      color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
                      name: `Michi_${entitiesRef.current.length}`,
                      life: 255,
                      maxLife: 255,
                    });
                    setLiveSize(entitiesRef.current.length);
                  }}
                  onMouseMove={(evt) => {
                    const canvas = canvasRef.current;
                    if (!canvas) return;
                    const rect = canvas.getBoundingClientRect();
                    const scaleX = canvas.width / rect.width;
                    const scaleY = canvas.height / rect.height;
                    setMousePos({
                      x: (evt.clientX - rect.left) * scaleX,
                      y: (evt.clientY - rect.top) * scaleY,
                    });
                  }}
                  onMouseLeave={() => setMousePos(null)}
                  className="w-full h-auto block select-none"
                />

                <div className="absolute bottom-2 left-2 right-2 px-3 py-1.5 rounded-lg bg-white/90 backdrop-blur-xs border border-zinc-200/80 text-[11px] text-zinc-600 flex items-center justify-between">
                  <span>
                    💡 <strong>Interacción:</strong> Haz clic en cualquier parte del lienzo para instanciar un nuevo objeto en ese punto.
                  </span>
                  <span className="font-mono text-zinc-400 text-[10px]">60 FPS</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-zinc-500 font-medium">Instancias en escena:</span>
                  <button
                    onClick={() => {
                      if (entitiesRef.current.length > 0) {
                        entitiesRef.current.pop();
                        setLiveSize(entitiesRef.current.length);
                      }
                    }}
                    disabled={liveSize <= 1}
                    className="w-8 h-8 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-100 flex items-center justify-center text-zinc-700 disabled:opacity-40 cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="font-mono font-bold text-zinc-950 px-2 tabular-nums">
                    {liveSize}
                  </span>
                  <button
                    onClick={() => {
                      const canvas = canvasRef.current;
                      const width = canvas ? canvas.width : 680;
                      const height = canvas ? canvas.height : 380;
                      entitiesRef.current.push({
                        id: nextIdRef.current++,
                        x: 50 + Math.random() * (width - 100),
                        y: 50 + Math.random() * (height - 100),
                        vx: (Math.random() - 0.5) * 4,
                        vy: (Math.random() - 0.5) * 4,
                        radius: simPreset === 'cats' ? 18 : 10,
                        color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
                        name: `Instancia_${entitiesRef.current.length}`,
                        life: 255,
                        maxLife: 255,
                      });
                      setLiveSize(entitiesRef.current.length);
                    }}
                    disabled={liveSize >= 80}
                    className="w-8 h-8 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-100 flex items-center justify-center text-zinc-700 disabled:opacity-40 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center gap-4 text-xs">
                  <label className="flex items-center gap-1.5 cursor-pointer text-zinc-700">
                    <input
                      type="checkbox"
                      checked={showIndices}
                      onChange={(e) => setShowIndices(e.target.checked)}
                      className="rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
                    />
                    <span>Mostrar índice [i]</span>
                  </label>

                  <label className="flex items-center gap-1.5 cursor-pointer text-zinc-700">
                    <input
                      type="checkbox"
                      checked={connectNeighbors}
                      onChange={(e) => setConnectNeighbors(e.target.checked)}
                      className="rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
                    />
                    <span>Red de proximidad</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 space-y-4">
              <div className="bg-white border border-zinc-200 rounded-xl p-4 space-y-3">
                <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Comportamiento & Tema
                </div>
                <div className="space-y-1.5">
                  <button
                    onClick={() => {
                      setSimPreset('cats');
                      initEntities(entityCount);
                    }}
                    className={`w-full p-2.5 rounded-lg text-left text-xs transition-colors flex items-center justify-between cursor-pointer ${
                      simPreset === 'cats'
                        ? 'bg-zinc-900 text-white font-medium'
                        : 'bg-zinc-50 hover:bg-zinc-100 text-zinc-700 border border-zinc-200'
                    }`}
                  >
                    <span>Criaturas Autónomas (Michis)</span>
                    <span className="text-[10px] font-mono opacity-70">Rebote + Mirada</span>
                  </button>

                  <button
                    onClick={() => {
                      setSimPreset('particles');
                      initEntities(entityCount);
                    }}
                    className={`w-full p-2.5 rounded-lg text-left text-xs transition-colors flex items-center justify-between cursor-pointer ${
                      simPreset === 'particles'
                        ? 'bg-zinc-900 text-white font-medium'
                        : 'bg-zinc-50 hover:bg-zinc-100 text-zinc-700 border border-zinc-200'
                    }`}
                  >
                    <span>Partículas con Gravedad</span>
                    <span className="text-[10px] font-mono opacity-70">Física + Desvanecimiento</span>
                  </button>

                  <button
                    onClick={() => {
                      setSimPreset('network');
                      setConnectNeighbors(true);
                      initEntities(entityCount);
                    }}
                    className={`w-full p-2.5 rounded-lg text-left text-xs transition-colors flex items-center justify-between cursor-pointer ${
                      simPreset === 'network'
                        ? 'bg-zinc-900 text-white font-medium'
                        : 'bg-zinc-50 hover:bg-zinc-100 text-zinc-700 border border-zinc-200'
                    }`}
                  >
                    <span>Constelación & Red Proximidad</span>
                    <span className="text-[10px] font-mono opacity-70">dist(i, j) &lt; 95</span>
                  </button>
                </div>
              </div>

              <div className="bg-white border border-zinc-200 rounded-xl p-4 space-y-3">
                <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Tipo de Contenedor en Java
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setCollectionType('fixed')}
                    className={`p-2.5 rounded-lg text-center text-xs transition-colors cursor-pointer ${
                      collectionType === 'fixed'
                        ? 'bg-zinc-900 text-white font-semibold'
                        : 'bg-zinc-50 hover:bg-zinc-100 text-zinc-700 border border-zinc-200'
                    }`}
                  >
                    <div className="font-mono text-[11px]">Gato[]</div>
                    <div className="text-[10px] text-zinc-400 mt-0.5">Arreglo Estático</div>
                  </button>

                  <button
                    onClick={() => setCollectionType('arraylist')}
                    className={`p-2.5 rounded-lg text-center text-xs transition-colors cursor-pointer ${
                      collectionType === 'arraylist'
                        ? 'bg-zinc-900 text-white font-semibold'
                        : 'bg-zinc-50 hover:bg-zinc-100 text-zinc-700 border border-zinc-200'
                    }`}
                  >
                    <div className="font-mono text-[11px]">ArrayList&lt;Gato&gt;</div>
                    <div className="text-[10px] text-zinc-400 mt-0.5">Dinámico (add/remove)</div>
                  </button>
                </div>
              </div>

              <div className="bg-white border border-zinc-200 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-zinc-700">Densidad del enjambre</span>
                  <span className="font-mono font-bold text-zinc-950 tabular-nums">
                    {entityCount}
                  </span>
                </div>
                <input
                  type="range"
                  min={3}
                  max={60}
                  value={entityCount}
                  onChange={(e) => {
                    const count = Number(e.target.value);
                    setEntityCount(count);
                    initEntities(count);
                  }}
                  className="w-full accent-zinc-900 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB: SIMULADOR DE MEMORIA RAM & NULLPOINTER                                */}
      {/* ========================================================================= */}
      {activeTab === 'memory' && (
        <div className="space-y-6">
          <div className="bg-white border border-zinc-200 rounded-2xl p-6 space-y-5">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-zinc-900">
                Simulador de Memoria RAM: ¿Qué pasa en el Heap?
              </h2>
              <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                El 90% de los errores en estudiantes al programar arreglos en Processing se debe a no
                comprender que <code className="bg-zinc-100 px-1 py-0.5 rounded font-mono text-zinc-800">new Gato[6]</code> no
                construye 6 gatos; solo construye el casillero vacío. Sigue los pasos interactivos:
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
              <button
                onClick={() => handleStepMemory(0)}
                className={`p-3 rounded-xl border text-left text-xs transition-colors cursor-pointer ${
                  memoryStep === 0
                    ? 'bg-zinc-900 text-white border-zinc-900'
                    : 'bg-zinc-50 hover:bg-zinc-100 border-zinc-200 text-zinc-700'
                }`}
              >
                <div className="font-bold font-mono">Paso 0: Declaración</div>
                <div className="text-[11px] opacity-75 mt-0.5">Gato[] camada;</div>
              </button>

              <button
                onClick={() => handleStepMemory(1)}
                className={`p-3 rounded-xl border text-left text-xs transition-colors cursor-pointer ${
                  memoryStep === 1
                    ? 'bg-zinc-900 text-white border-zinc-900'
                    : 'bg-zinc-50 hover:bg-zinc-100 border-zinc-200 text-zinc-700'
                }`}
              >
                <div className="font-bold font-mono">Paso 1: new Gato[6]</div>
                <div className="text-[11px] opacity-75 mt-0.5">Casillas en 'null'</div>
              </button>

              <button
                onClick={() => handleStepMemory(2)}
                className={`p-3 rounded-xl border text-left text-xs transition-colors cursor-pointer ${
                  memoryStep === 2
                    ? 'bg-zinc-900 text-white border-zinc-900'
                    : 'bg-zinc-50 hover:bg-zinc-100 border-zinc-200 text-zinc-700'
                }`}
              >
                <div className="font-bold font-mono">Paso 2: Bucle i &lt; 3</div>
                <div className="text-[11px] opacity-75 mt-0.5">Llenado parcial</div>
              </button>

              <button
                onClick={() => handleStepMemory(3)}
                className={`p-3 rounded-xl border text-left text-xs transition-colors cursor-pointer ${
                  memoryStep === 3
                    ? 'bg-zinc-900 text-white border-zinc-900'
                    : 'bg-zinc-50 hover:bg-zinc-100 border-zinc-200 text-zinc-700'
                }`}
              >
                <div className="font-bold font-mono">Paso 3: Bucle Completo</div>
                <div className="text-[11px] opacity-75 mt-0.5">Todas instanciadas</div>
              </button>
            </div>

            <div className="p-5 bg-zinc-50 border border-zinc-200 rounded-xl space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-zinc-800">
                  Espacio de Direccionamiento en Heap (camada)
                </span>
                <span className="font-mono text-zinc-400">Total: 6 slots</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
                {memorySlots.map((slot, idx) => {
                  const isNull = slot === null;
                  return (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl border text-center space-y-1.5 transition-all ${
                        hasNpeCrash && idx === 0
                          ? 'bg-red-50 border-red-500 shadow-sm animate-pulse'
                          : isNull
                          ? 'bg-white border-zinc-200 text-zinc-400'
                          : 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
                      }`}
                    >
                      <div className="font-mono font-bold text-xs">camada[{idx}]</div>
                      <div
                        className={`text-[11px] font-mono px-1.5 py-0.5 rounded ${
                          isNull ? 'bg-zinc-100 text-zinc-500' : 'bg-emerald-100 text-emerald-800 font-semibold'
                        }`}
                      >
                        {isNull ? 'null' : slot.hex}
                      </div>
                      <div className="text-[11px] font-medium truncate">
                        {isNull ? 'Vacío' : slot.name}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-zinc-200">
                <div className="text-xs text-zinc-600">
                  {memoryStep === 0 && 'Variable declarada: aún no apunta a ninguna dirección de memoria.'}
                  {memoryStep === 1 && 'El cascarón de 6 ranuras existe en RAM, pero cada ranura contiene "null".'}
                  {memoryStep === 2 && '3 objetos ya han sido construidos con new; las 3 restantes siguen siendo null.'}
                  {memoryStep === 3 && 'Todas las ranuras tienen un objeto válido asignado en memoria.'}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setHasNpeCrash(true)}
                    className="min-h-[40px] px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                  >
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Simular Error: camada[0].dibujar()</span>
                  </button>
                </div>
              </div>
            </div>

            {hasNpeCrash && (
              <div className="bg-zinc-950 text-white p-4 rounded-xl font-mono text-xs space-y-2 border border-red-500/50 animate-in fade-in duration-150">
                <div className="flex items-center justify-between text-red-400 border-b border-zinc-800 pb-2">
                  <span className="font-bold flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4" />
                    <span>Processing Console Exception</span>
                  </span>
                  <button
                    onClick={() => setHasNpeCrash(false)}
                    className="text-zinc-400 hover:text-white"
                  >
                    Cerrar
                  </button>
                </div>
                <div className="text-red-400 space-y-1">
                  <p>FATAL EXCEPTION: java.lang.NullPointerException</p>
                  <p className="text-zinc-400">  at ProcessingSketch.draw(ProcessingSketch.java:18)</p>
                </div>
                <div className="pt-2 text-zinc-300 text-[11px] leading-relaxed border-t border-zinc-800">
                  💡 <strong>Explicación didáctica:</strong> Intentaste ejecutar <code className="text-red-300">.dibujar()</code> sobre la casilla <code className="text-red-300">camada[0]</code>, pero su valor es <code className="text-red-300">null</code>. Para solucionarlo, en tu función <code className="text-emerald-400">setup()</code> debes correr:
                  <pre className="mt-1.5 p-2 bg-zinc-900 rounded text-emerald-400 font-mono text-xs">
                    camada[0] = new Gato("Michi", 200, 200);
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB: PATRONES & CÓDIGO CANÓNICO                                            */}
      {/* ========================================================================= */}
      {activeTab === 'guide' && (
        <div className="space-y-8">
          <div className="bg-white border border-zinc-200 rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-bold text-zinc-900">
              El Patrón de Dos Tiempos en Processing
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
              Trabajar con arreglos de objetos en Processing requiere dividir el código en dos
              momentos fundamentales:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-zinc-900 text-white flex items-center justify-center font-mono text-xs font-bold">
                    1
                  </span>
                  <h3 className="font-semibold text-sm text-zinc-900">Tiempo 1: setup()</h3>
                </div>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  Se ejecuta <strong>una sola vez</strong>. Aquí usamos el bucle <code className="font-mono bg-zinc-200/70 px-1 py-0.5 rounded">for</code> para llamar al operador <code className="font-mono bg-zinc-200/70 px-1 py-0.5 rounded">new</code> en cada posición y darle valores iniciales aleatorios o en cuadrícula.
                </p>
                <div className="bg-white p-2.5 rounded-lg border border-zinc-200 font-mono text-[11px] text-zinc-800">
                  for (int i = 0; i &lt; camada.length; i++) &#123;<br />
                  &nbsp;&nbsp;camada[i] = new Gato(...);<br />
                  &#125;
                </div>
              </div>

              <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-zinc-900 text-white flex items-center justify-center font-mono text-xs font-bold">
                    2
                  </span>
                  <h3 className="font-semibold text-sm text-zinc-900">Tiempo 2: draw()</h3>
                </div>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  Se repite <strong>60 veces por segundo</strong>. Aquí NO usamos <code className="font-mono bg-zinc-200/70 px-1 py-0.5 rounded">new</code>; únicamente invocamos los métodos de comportamiento como <code className="font-mono bg-zinc-200/70 px-1 py-0.5 rounded">.mover()</code> y <code className="font-mono bg-zinc-200/70 px-1 py-0.5 rounded">.dibujar()</code>.
                </p>
                <div className="bg-white p-2.5 rounded-lg border border-zinc-200 font-mono text-[11px] text-zinc-800">
                  for (int i = 0; i &lt; camada.length; i++) &#123;<br />
                  &nbsp;&nbsp;camada[i].mover();<br />
                  &nbsp;&nbsp;camada[i].dibujar();<br />
                  &#125;
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-zinc-200 rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-bold text-zinc-900">
              Tabla Comparativa: Arreglo Fijo vs ArrayList
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-zinc-200 text-zinc-500 font-mono text-[11px] uppercase">
                    <th className="py-2.5 px-3">Característica</th>
                    <th className="py-2.5 px-3">Arreglo Fijo (Gato[])</th>
                    <th className="py-2.5 px-3">Lista Dinámica (ArrayList&lt;Gato&gt;)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 text-zinc-700">
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-zinc-900">Declaración</td>
                    <td className="py-2.5 px-3 font-mono">Gato[] camada = new Gato[50];</td>
                    <td className="py-2.5 px-3 font-mono">ArrayList&lt;Gato&gt; list = new ArrayList&lt;&gt;();</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-zinc-900">Tamaño en ejecución</td>
                    <td className="py-2.5 px-3">Estático (no puede crecer)</td>
                    <td className="py-2.5 px-3">Dinámico (crece y decrece a demanda)</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-zinc-900">Conocer la cantidad</td>
                    <td className="py-2.5 px-3 font-mono text-zinc-900">camada.length</td>
                    <td className="py-2.5 px-3 font-mono text-zinc-900">list.size()</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-zinc-900">Obtener un elemento</td>
                    <td className="py-2.5 px-3 font-mono text-zinc-900">camada[i]</td>
                    <td className="py-2.5 px-3 font-mono text-zinc-900">list.get(i)</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-zinc-900">Añadir / Eliminar</td>
                    <td className="py-2.5 px-3">No es posible directamente</td>
                    <td className="py-2.5 px-3 font-mono text-zinc-900">list.add(g) / list.remove(i)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB: RETOS DIDÁCTICOS EVALUADOS                                           */}
      {/* ========================================================================= */}
      {activeTab === 'challenges' && (
        <div className="space-y-6">
          <div className="bg-white border border-zinc-200 rounded-2xl p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-100 pb-3">
              <div>
                <h2 className="text-lg font-bold text-zinc-900">
                  Retos Didácticos: Validación de Aprendizaje
                </h2>
                <p className="text-xs text-zinc-500">
                  Resuelve los 3 retos para consolidar tu dominio sobre colecciones y arreglos de objetos.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-zinc-900 bg-zinc-100 px-3 py-1 rounded-lg">
                  {completedCount} de 3 aprobados
                </span>
              </div>
            </div>

            <div className="space-y-8 pt-2">
              {challenges.map((ch) => {
                const selectedIdx = challengeAnswers[ch.id];
                const hasAnswered = selectedIdx !== null;
                const isCorrect = hasAnswered && ch.options[selectedIdx].isCorrect;

                return (
                  <div key={ch.id} className="p-5 border border-zinc-200 rounded-xl space-y-4 bg-zinc-50/50">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm text-zinc-900">{ch.title}</span>
                      {hasAnswered && (
                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded flex items-center gap-1 ${
                            isCorrect
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {isCorrect ? <Check className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                          <span>{isCorrect ? 'Correcto' : 'Revisar'}</span>
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-zinc-600 leading-relaxed">{ch.description}</p>

                    <ProcessingCodeBlock code={ch.snippet} filename={`Reto_${ch.id}.pde`} showCopyButton={false} />

                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-zinc-800">{ch.question}</p>
                    </div>

                    <div className="space-y-2">
                      {ch.options.map((opt, oIdx) => {
                        const isChosen = selectedIdx === oIdx;
                        return (
                          <button
                            key={oIdx}
                            onClick={() => handleSelectChallengeOption(ch.id, oIdx)}
                            className={`w-full p-3 rounded-lg border text-left text-xs transition-colors flex items-start gap-2.5 cursor-pointer ${
                              isChosen
                                ? opt.isCorrect
                                  ? 'bg-zinc-900 text-white border-zinc-900'
                                  : 'bg-amber-50 text-amber-950 border-amber-300'
                                : 'bg-white hover:bg-zinc-100 border-zinc-200 text-zinc-700'
                            }`}
                          >
                            <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center shrink-0 mt-0.5 font-mono text-[10px] font-bold">
                              {String.fromCharCode(65 + oIdx)}
                            </span>
                            <span className="leading-relaxed">{opt.text}</span>
                          </button>
                        );
                      })}
                    </div>

                    {hasAnswered && (
                      <div
                        className={`p-3.5 rounded-lg border text-xs leading-relaxed ${
                          isCorrect
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                            : 'bg-amber-50 border-amber-200 text-amber-900'
                        }`}
                      >
                        <p>{ch.options[selectedIdx].feedback}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
