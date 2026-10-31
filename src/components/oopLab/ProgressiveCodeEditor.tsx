import React, { useState } from 'react';
import { Download, Copy, Check, FileCode, Layers, Info, Sparkles, Code2, ArrowRight } from 'lucide-react';
import { ModuleProgression } from '../../types/oopLab';

interface ProgressiveCodeEditorProps {
  module: ModuleProgression;
  currentStageIdx: number;
  isStageVerified?: boolean;
}

export const ProgressiveCodeEditor: React.FC<ProgressiveCodeEditorProps> = ({
  module,
  currentStageIdx,
  isStageVerified = true,
}) => {
  const [activeTab, setActiveTab] = useState<'sketch' | 'class'>('sketch');
  const [copiedType, setCopiedType] = useState<string | null>(null);

  const isPelota = module.moduleId === 'pelota';
  const className = module.objectName;

  // Progressive milestone flags gated by comprehension verification
  const hasClassDeclared = currentStageIdx >= 1 && (currentStageIdx > 1 || isStageVerified);
  const hasFields = currentStageIdx >= 2 && (currentStageIdx > 2 || isStageVerified);
  const hasConstructor = currentStageIdx >= 3 && (currentStageIdx > 3 || isStageVerified);
  const hasMethods = currentStageIdx >= 4 && (currentStageIdx > 4 || isStageVerified);
  const hasPerlinNoise = currentStageIdx >= 5 && (currentStageIdx > 5 || isStageVerified);
  const hasArray = currentStageIdx >= 6 && (currentStageIdx > 6 || isStageVerified);

  // Build the Class Tab Code with rich contextual explanations
  const buildClassCode = (): string => {
    if (!hasClassDeclared) {
      return `// ==========================================
// 1. OBSERVACIÓN PREVIA (Antes de escribir código)
// ==========================================
// Aún no hemos declarado la clase.
// [BLOQUE EN ANÁLISIS: Resuelve el reto en el Panel de Aprendizaje para integrar la clase]
// class ${className} {
//   // Molde que encapsulará campos, constructor y métodos
// }`;
    }

    let code = `// ==========================================
// DEFINICIÓN DE LA CLASE (Pestaña ${className}.pde)
// El molde o plano arquitectónico del objeto
// ==========================================\n\n`;

    code += `class ${className} {\n`;

    if (hasFields) {
      code += `  // ==========================================\n`;
      code += `  // 1. CAMPOS (Variables internas de estado en Heap)\n`;
      code += `  // ==========================================\n`;

      if (isPelota) {
        code += `  // Fase A: Geometría espacial básica (¿Dónde y de qué tamaño?)\n`;
        code += `  float x;          // Posición cartesiana horizontal\n`;
        code += `  float y;          // Posición cartesiana vertical\n`;
        code += `  float diametro;   // Ancho y alto del círculo en píxeles\n\n`;

        code += `  // Fase B: Dinámica y cinemática 2D (¿Hacia dónde avanza?)\n`;
        code += `  float velocidadX; // Rapidez en el eje X (positivo = derecha)\n`;
        code += `  float velocidadY; // Rapidez en el eje Y (positivo = abajo)\n\n`;

        code += `  // Fase C: Estética cromática (¿Cómo se distingue visualmente?)\n`;
        code += `  color tono;       // Color empaquetado RGBA para fill()\n\n`;

        code += `  // Fase D: Ruido Perlin 2D Desacoplado (Variables temporales independientes)\n`;
        code += `  float tX;         // Semilla temporal para deriva horizontal X\n`;
        code += `  float tY;         // Semilla temporal para deriva vertical Y (desfasada)\n\n`;
      } else {
        code += `  // Coordenadas cartesianas y dimensiones:\n`;
        code += `  float x;          // Posición horizontal en el agua\n`;
        code += `  float y;          // Posición vertical (nace abajo)\n`;
        code += `  float diametro;   // Diámetro inicial del cuerpo esférico\n\n`;

        code += `  // Cinemática ascendente y cualidad óptica translúcida:\n`;
        code += `  float velocidad;  // Rapidez de ascenso hacia la superficie\n`;
        code += `  float opacidad;   // Transparencia alfa en rango Processing (0 a 255)\n\n`;

        code += `  // Semillas para corrientes subacuáticas desacopladas:\n`;
        code += `  float tX;         // Deriva horizontal en agua\n`;
        code += `  float tY;         // Deriva vertical\n\n`;
      }
    } else {
      code += `  // [CAMPOS EN ANÁLISIS: Valida la Etapa 3 en el Panel de Aprendizaje para integrar las variables]\n\n`;
    }

    if (hasConstructor) {
      code += `  // ==========================================\n`;
      code += `  // 2. CONSTRUCTOR (Nacimiento del objeto)\n`;
      code += `  // Conecta argumentos externos con campos privados\n`;
      code += `  // ==========================================\n`;

      if (isPelota) {
        code += `  ${className}(float xTemp, float yTemp, float diamTemp, float velXTemp, float velYTemp, color tonoTemp) {\n`;
        code += `    // Asignación: campo permanente = parámetro temporal\n`;
        code += `    x = xTemp;\n`;
        code += `    y = yTemp;\n`;
        code += `    diametro = diamTemp;\n`;
        code += `    velocidadX = velXTemp;\n`;
        code += `    velocidadY = velYTemp;\n`;
        code += `    tono = tonoTemp;\n\n`;
        code += `    // Semillas desfasadas para ruido Perlin 2D desacoplado:\n`;
        code += `    tX = random(0, 1000);\n`;
        code += `    tY = random(5000, 10000); // Semilla asimétrica para evitar la diagonal a 45°\n`;
        code += `  }\n\n`;
      } else {
        code += `  ${className}(float xTemp, float yTemp, float diamTemp, float velTemp, float opacTemp) {\n`;
        code += `    x = xTemp;\n`;
        code += `    y = yTemp;\n`;
        code += `    diametro = diamTemp;\n`;
        code += `    velocidad = velTemp;\n`;
        code += `    opacidad = opacTemp;\n\n`;
        code += `    // Semillas desfasadas para deriva subacuática con noise():\n`;
        code += `    tX = random(0, 1000);\n`;
        code += `    tY = random(8000, 15000);\n`;
        code += `  }\n\n`;
      }
    } else if (hasClassDeclared && !hasConstructor) {
      code += `  // [CONSTRUCTOR EN ANÁLISIS: Valida la Etapa 4 para conectar la inicialización con new]\n\n`;
    }

    if (hasMethods) {
      code += `  // ==========================================\n`;
      code += `  // 3. MÉTODOS (Comportamientos del objeto)\n`;
      code += `  // ==========================================\n\n`;

      if (isPelota) {
        code += `  // --- GRUPO 1: Renderizado y Cinemática 2D ---\n`;
        module.methods
          .filter((m) => ['mostrar', 'mover', 'rebotar'].includes(m.id))
          .forEach((m) => {
            code += `  ${m.codeSnippet.split('\n').join('\n  ')}\n\n`;
          });

        if (hasPerlinNoise) {
          code += `  // --- GRUPO 2: Expresión Orgánica: Ruido Perlin Desacoplado ---\n`;
          module.methods
            .filter((m) => m.id === 'flotar')
            .forEach((m) => {
              code += `  ${m.codeSnippet.split('\n').join('\n  ')}\n\n`;
            });
        }

        code += `  // --- GRUPO 3: Mutación de Estado con Parámetros ---\n`;
        module.methods
          .filter((m) => !['mostrar', 'mover', 'rebotar', 'flotar'].includes(m.id))
          .forEach((m) => {
            code += `  ${m.codeSnippet.split('\n').join('\n  ')}\n\n`;
          });
      } else {
        module.methods.forEach((m) => {
          code += `  ${m.codeSnippet.split('\n').join('\n  ')}\n\n`;
        });
      }
    } else if (hasConstructor && !hasMethods) {
      code += `  // [MÉTODOS EN ANÁLISIS: Valida las etapas de comportamiento para incorporar los métodos]\n`;
    }

    code += `}`;
    return code;
  };

  // Build the Sketch Tab Code strictly reflecting the progressive learning stage
  const buildSketchCode = (): string => {
    // Stage 0: Procedural programming before OOP
    if (currentStageIdx === 0) {
      return `// ==========================================
// SKETCH PRINCIPAL (Processing Java)
// Etapa 1: Código Procedural Clásico (Antes de POO)
// ==========================================

void setup() {
  size(500, 350);
}

void draw() {
  background(${isPelota ? '245' : '15, 30, 60'});
  
  // Dibujo procedural con valores fijos hardcodeados en draw():
${
  isPelota
    ? `  fill(226, 102, 26);
  noStroke();
  ellipse(200, 160, 50, 50);`
    : `  fill(120, 200, 255, 140);
  stroke(255);
  ellipse(200, 280, 45, 45);`
}
  
  // ¿Problema? Si queremos 5 objetos o moverlos con física,
  // el código procedural se vuelve caótico e inmanejable.
  // Por eso pasamos a la Programación Orientada a Objetos.
}`;
    }

    // Stage 1: Declaring the reference variable
    if (currentStageIdx === 1) {
      return `// ==========================================
// SKETCH PRINCIPAL (Processing Java)
// Etapa 2: Declaración de la Referencia
// ==========================================

// PASO 1: Declarar la variable con el tipo de dato de la clase.
// Solo reserva la etiqueta o nombre; aún no existe memoria asignada.
${className} ${isPelota ? 'miPelota' : 'miBurbuja'};

void setup() {
  size(500, 350);
  // En la Etapa 4 usaremos 'new' para inicializarlo aquí dentro
}

void draw() {
  background(${isPelota ? '245' : '15, 30, 60'});
}`;
    }

    // Stage 2: Memory fields defined in class
    if (currentStageIdx === 2) {
      return `// ==========================================
// SKETCH PRINCIPAL (Processing Java)
// Etapa 3: Estructura de Campos en Memoria
// ==========================================

// El sketch reconoce el molde ${className} con sus campos definidos:
${className} ${isPelota ? 'miPelota' : 'miBurbuja'};

void setup() {
  size(500, 350);
  // Cada campo (x, y, diametro...) vivirá dentro del objeto
  // tan pronto como lo instanciemos en la siguiente etapa.
}

void draw() {
  background(${isPelota ? '245' : '15, 30, 60'});
}`;
    }

    // Stage 3: Instantiation with new in setup()
    if (currentStageIdx === 3) {
      return `// ==========================================
// SKETCH PRINCIPAL (Processing Java)
// Etapa 4: Instanciación e Inicialización con new
// ==========================================

// 1. Declarar la variable de referencia:
${className} ${isPelota ? 'miPelota' : 'miBurbuja'};

void setup() {
  size(500, 350);
  
  // 2. TIEMPO 1: El operador 'new' reserva memoria física en RAM
  // e invoca al Constructor pasando los argumentos iniciales:
${
  isPelota
    ? `  miPelota = new Pelota(200, 160, 55, 3.5, 2.2, color(226, 102, 26));`
    : `  miBurbuja = new Burbuja(200, 280, 45, 2.2, 160);`
}
}

void draw() {
  background(${isPelota ? '245' : '15, 30, 60'});
  
  // En la siguiente etapa pondremos al objeto a vivir
  // llamando sus métodos de comportamiento aquí dentro a 60 fps.
}`;
    }

    // Stage 4: Calling methods in draw()
    if (currentStageIdx === 4) {
      return `// ==========================================
// SKETCH PRINCIPAL (Processing Java)
// Etapa 5: Invocación de Métodos en el ciclo draw()
// ==========================================

${className} ${isPelota ? 'miPelota' : 'miBurbuja'};

void setup() {
  size(500, 350);
${
  isPelota
    ? `  miPelota = new Pelota(200, 160, 55, 3.5, 2.2, color(226, 102, 26));`
    : `  miBurbuja = new Burbuja(200, 280, 45, 2.2, 160);`
}
}

void draw() {
  background(${isPelota ? '245' : '15, 30, 60'});
  
  // TIEMPO 2: Los métodos se invocan continuamente a 60 fps
${
  isPelota
    ? `  miPelota.mover();                   // Desplaza en 2D sumando velocidadX y velocidadY
  miPelota.rebotar();                 // Comprueba colisiones con los 4 bordes del lienzo
  miPelota.flotar(0.015, 3.5);        // Deriva orgánica 2D con ruido Perlin desacoplado (tX, tY)
  miPelota.mostrar();                 // Proyecta el círculo en pantalla con fill() y ellipse()`
    : `  miBurbuja.subir();                  // Asciende restando velocidad al eje Y
  miBurbuja.flotar(0.012, 2.2);       // Vaivén subacuático desacoplado en X e Y
  miBurbuja.mostrar();                // Dibuja el cuerpo traslúcido y su brillo vítreo`
}
}`;
    }

    // Stage 5: Method explorer & user interaction events
    if (currentStageIdx === 5) {
      return `// ==========================================
// SKETCH PRINCIPAL (Processing Java)
// Etapa 6: Métodos + Interacción con Eventos de Usuario
// ==========================================

${className} ${isPelota ? 'miPelota' : 'miBurbuja'};

void setup() {
  size(500, 350);
${
  isPelota
    ? `  miPelota = new Pelota(200, 160, 55, 3.5, 2.2, color(226, 102, 26));`
    : `  miBurbuja = new Burbuja(200, 280, 45, 2.2, 160);`
}
}

void draw() {
  background(${isPelota ? '245' : '15, 30, 60'});
${
  isPelota
    ? `  miPelota.mover();
  miPelota.rebotar();
  miPelota.mostrar();`
    : `  miBurbuja.subir();
  miBurbuja.flotar(1.6);
  miBurbuja.mostrar();`
}
}

// EVENTO 1: Al hacer clic con el mouse, invocamos un método con parámetros:
void mousePressed() {
${
  isPelota
    ? `  miPelota.reiniciar(mouseX, mouseY); // Teletransporta al cursor
  miPelota.cambiarColor(color(random(255), random(255), random(255)));`
    : `  miBurbuja.reiniciar(mouseX, mouseY);
  miBurbuja.crecer(8);`
}
}

// EVENTO 2: Al presionar la barra espaciadora:
void keyPressed() {
  if (key == ' ') {
${
  isPelota
    ? `    miPelota.invertirDireccion(); // Giro completo de 180°`
    : `    miBurbuja.cambiarVelocidad(4.5);`
}
  }
}`;
    }

    // Stage 6+: Arrays of multiple independent instances
    const count = isPelota ? 3 : 5;
    return `// ==========================================
// SKETCH PRINCIPAL (Processing Java)
// Etapa ${currentStageIdx + 1}: Colección con Arreglo (${className}[])
// ==========================================

// 1. Declarar el arreglo con su dimensión total:
${className}[] ${isPelota ? 'pelotas' : 'burbujas'} = new ${className}[${count}];

void setup() {
  size(500, 350);
  
  // 2. TIEMPO 1: Inicializar cada celda del arreglo usando un ciclo for:
  for (int i = 0; i < ${isPelota ? 'pelotas' : 'burbujas'}.length; i++) {
${
  isPelota
    ? `    float posX = 100 + i * 140;
    float diam = 45 + i * 15;
    float vx = 3.2 + i * 0.8;
    float vy = 2.2 - i * 0.5;
    color col = color(226, 102 + i * 40, 26);
    pelotas[i] = new Pelota(posX, 160, diam, vx, vy, col);`
    : `    float posX = random(60, 440);
    float posY = random(240, 330);
    float diam = random(25, 55);
    float vel = random(1.8, 3.2);
    float opac = random(120, 200);
    burbujas[i] = new Burbuja(posX, posY, diam, vel, opac);`
}
  }
}

void draw() {
  background(${isPelota ? '245' : '15, 30, 60'});
  
  // 3. TIEMPO 2: Recorrer e invocar los métodos sobre cada instancia:
  for (int i = 0; i < ${isPelota ? 'pelotas' : 'burbujas'}.length; i++) {
${
  isPelota
    ? `    pelotas[i].mover();
    pelotas[i].rebotar();
    pelotas[i].flotar(3.5); // Deriva orgánica 2D con noise()
    pelotas[i].mostrar();`
    : `    burbujas[i].subir();
    burbujas[i].flotar(2.0); // Vaivén subacuático en X e Y con noise()
    burbujas[i].mostrar();
    
    // Condicional de reaparición continua:
    if (burbujas[i].y < -burbujas[i].diametro) {
      burbujas[i].reiniciar(random(50, width - 50), height + burbujas[i].diametro);
    }`
}
  }
}

void mousePressed() {
  // Al hacer clic, modificamos únicamente la instancia elegida al azar:
  int idx = int(random(${isPelota ? 'pelotas' : 'burbujas'}.length));
${
  isPelota
    ? `  pelotas[idx].reiniciar(mouseX, mouseY);
  pelotas[idx].cambiarTamano(random(30, 90));`
    : `  burbujas[idx].reiniciar(mouseX, mouseY);
  burbujas[idx].crecer(15);`
}
}`;
  };

  const getActiveCode = (): string => {
    return activeTab === 'sketch' ? buildSketchCode() : buildClassCode();
  };

  const currentCode = getActiveCode();

  const handleCopy = (type: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  const downloadFile = (fileName: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadActive = () => {
    if (activeTab === 'sketch') {
      downloadFile('Sketch.pde', buildSketchCode());
    } else {
      downloadFile(`${className}.pde`, buildClassCode());
    }
  };

  const handleDownloadBoth = () => {
    // Descarga ambos archivos por separado para abrir como dos pestañas en Processing
    downloadFile('Sketch.pde', buildSketchCode());
    setTimeout(() => {
      downloadFile(`${className}.pde`, buildClassCode());
    }, 250);
  };

  const lines = currentCode.split('\n');

  // Evolution guide labels
  const STAGE_SKETCH_NOTES: Record<number, { title: string; addition: string; rationale: string }> = {
    0: {
      title: 'Sketch Procedural Clásico',
      addition: 'Valores fijos y dibujo directo en draw()',
      rationale: 'Muestra la forma tradicional de programar sin clases, evidenciando por qué es difícil escalar a múltiples elementos.',
    },
    1: {
      title: 'Declaración de la Referencia',
      addition: `${className} ${isPelota ? 'miPelota' : 'miBurbuja'};`,
      rationale: 'Se define la etiqueta que apuntará al objeto en memoria. Aún no se ha invocado new.',
    },
    2: {
      title: 'Campos Progresivos en la Clase',
      addition: 'Campos de geometría, cinemática 2D y color',
      rationale: 'Cada objeto reserva memoria propia para x, y, diametro, velocidades y tono cromático.',
    },
    3: {
      title: 'Instanciación con new en setup()',
      addition: `${isPelota ? 'miPelota' : 'miBurbuja'} = new ${className}(...);`,
      rationale: 'TIEMPO 1: En setup() nace el objeto con sus datos iniciales. El constructor se ejecuta una sola vez.',
    },
    4: {
      title: 'Invocación de Métodos en draw()',
      addition: 'Llamadas continuas: mover(), rebotar(), flotar(), mostrar()',
      rationale: 'TIEMPO 2: draw() corre 60 veces por segundo, actualizando la posición y dibujando el fotograma.',
    },
    5: {
      title: 'Interactividad con Eventos',
      addition: 'void mousePressed() y void keyPressed()',
      rationale: 'Demuestra cómo los métodos con parámetros (ej. reiniciar, cambiarColor) responden a acciones del usuario.',
    },
    6: {
      title: 'Colección con Arreglo de Objetos',
      addition: `${className}[] con ciclo for en setup() y draw()`,
      rationale: 'Escala de 1 a múltiples objetos independientes usando índices numéricos y memoria encapsulada.',
    },
    7: {
      title: 'Sketch Completo Listo para Exportar',
      addition: 'Control colectivo e individual sobre el arreglo',
      rationale: 'Proyecto final modular, listo para copiar o abrir en el IDE oficial de Processing Java.',
    },
  };

  const currentGuide = STAGE_SKETCH_NOTES[currentStageIdx] || STAGE_SKETCH_NOTES[6];

  return (
    <div className="bg-[#FFFFFF] border border-[#E3E3DD] overflow-hidden flex flex-col">
      {/* 1. Header with 2 Distinct Tabs & File Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 px-4 py-2.5 bg-[#F7F7F2] border-b border-[#E3E3DD] font-mono text-xs">
        {/* 2 Tabs: Main Sketch vs Class */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setActiveTab('sketch')}
            className={`min-h-[34px] px-3 py-1 text-xs border transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === 'sketch'
                ? 'bg-[#141414] text-[#F7F6F1] border-[#141414] font-bold'
                : 'bg-[#FFFFFF] hover:bg-[#F7F6F1] text-[#141414] border-[#DEDDD7]'
            }`}
          >
            <Code2 className="w-3.5 h-3.5 text-[#2868D9]" />
            <span>Sketch.pde (Principal)</span>
            <span className="w-1.5 h-1.5 bg-[#2868D9] inline-block" />
          </button>

          <button
            onClick={() => setActiveTab('class')}
            className={`min-h-[34px] px-3 py-1 text-xs border transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === 'class'
                ? 'bg-[#141414] text-[#F7F6F1] border-[#141414] font-bold'
                : 'bg-[#FFFFFF] hover:bg-[#F7F6F1] text-[#141414] border-[#DEDDD7]'
            }`}
          >
            <FileCode className="w-3.5 h-3.5 text-[#D9AA3D]" />
            <span>{className}.pde (Clase)</span>
            {hasClassDeclared && <span className="w-1.5 h-1.5 bg-[#D9AA3D] inline-block" />}
          </button>
        </div>

        {/* Action Controls for Independent Files */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <button
            onClick={() => handleCopy('active', currentCode)}
            className="min-h-[34px] px-2.5 py-1 bg-[#FFFFFF] hover:bg-[#F7F6F1] border border-[#DEDDD7] text-[#141414] text-xs font-mono transition-colors flex items-center gap-1.5 cursor-pointer"
            title={`Copiar ${activeTab === 'sketch' ? 'Sketch.pde' : className + '.pde'} al portapapeles`}
          >
            {copiedType === 'active' ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#2868D9]" />
                <span className="font-bold text-[#141414]">¡Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar {activeTab === 'sketch' ? 'Sketch' : className}</span>
              </>
            )}
          </button>

          <button
            onClick={handleDownloadActive}
            className="min-h-[34px] px-3 py-1 bg-[#141414] hover:bg-[#2868D9] text-[#F7F6F1] text-xs font-mono font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
            title={`Descargar archivo individual ${activeTab === 'sketch' ? 'Sketch.pde' : className + '.pde'}`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Descargar {activeTab === 'sketch' ? 'Sketch.pde' : className + '.pde'}</span>
          </button>

          <button
            onClick={handleDownloadBoth}
            className="min-h-[34px] px-2.5 py-1 bg-[#FFFFFF] hover:bg-[#F7F6F1] border border-[#DEDDD7] text-[#141414] text-xs font-mono transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Descargar ambos archivos separados (Sketch.pde y clase .pde) para Processing IDE"
          >
            <Layers className="w-3.5 h-3.5 text-[#626262]" />
            <span className="hidden sm:inline">Descargar Ambos</span>
            <span className="sm:hidden">Ambos</span>
          </button>
        </div>
      </div>

      {/* Processing Multi-Tab Architecture Explanatory Banner */}
      <div className="px-4 py-2 bg-[#F7F6F1] border-b border-[#DEDDD7] text-xs font-mono flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-[#626262]">
          <span className="bg-[#FFFFFF] text-[#141414] border border-[#DEDDD7] text-[10px] font-bold px-1.5 py-0.5 shrink-0">
            ARQUITECTURA
          </span>
          <span className="text-[11px] leading-tight">
            {activeTab === 'sketch' ? (
              <>
                <strong>Sketch.pde:</strong> Ciclo general <code>setup()</code> y <code>draw()</code>. La clase vive en su propia pestaña <code>{className}.pde</code>.
              </>
            ) : (
              <>
                <strong>{className}.pde:</strong> Archivo independiente de la clase. En Processing crea esta pestaña con <kbd className="bg-[#FFFFFF] px-1 py-0.5 border border-[#DEDDD7] font-mono text-[10px]">Ctrl+Mayús+N</kbd>.
              </>
            )}
          </span>
        </div>
      </div>

      {/* 2. Progressive Sketch & Class Evolution Guide Banner */}
      <div className="px-4 py-2 bg-[#FFFFFF] border-b border-[#DEDDD7] text-xs font-mono flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-[#141414]">
          <span className="bg-[#141414] text-[#F7F6F1] text-[10px] font-bold px-1.5 py-0.5">
            ETAPA 0{currentStageIdx + 1}
          </span>
          <span className="font-semibold">{currentGuide.title}:</span>
          <span className="text-[#626262] truncate">{currentGuide.addition}</span>
        </div>

        <div className="text-[11px] text-[#626262] flex items-center gap-1 shrink-0">
          <Info className="w-3.5 h-3.5 text-[#626262] shrink-0" />
          <span>{currentGuide.rationale}</span>
        </div>
      </div>

      {/* 3. Code Area with Line Numbers & Strict Processing Java Highlighting */}
      <div className="relative font-mono text-xs overflow-x-auto p-4 bg-[#FFFFFF] max-h-[460px] custom-scrollbar leading-relaxed">
        <div className="table w-full border-collapse">
          {lines.map((line, idx) => {
            const lineNum = idx + 1;
            const isComment = line.trim().startsWith('//');
            const isHeader = line.includes('===');
            const isClassDecl = line.includes(`class ${className}`);
            const isNewInst = line.includes(`new ${className}`);

            return (
              <div
                key={idx}
                className={`table-row transition-colors ${
                  isClassDecl || isNewInst
                    ? 'bg-[#D9AA3D]/15 font-semibold'
                    : 'hover:bg-[#F7F6F1]'
                }`}
              >
                {/* Line number */}
                <span className="table-cell select-none pr-4 text-right text-[#A4A4A0] font-mono text-[11px] w-9 tabular-nums">
                  {lineNum}
                </span>

                {/* Code content */}
                <span
                  className={`table-cell whitespace-pre ${
                    isComment || isHeader
                      ? 'text-[#626262] font-mono text-[11px] italic'
                      : 'text-[#141414]'
                  }`}
                >
                  {highlightProcessingSyntax(line)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Footer Status Bar with Processing Architecture Note */}
      <div className="px-4 py-2 bg-[#F7F6F1] border-t border-[#DEDDD7] text-[11px] text-[#626262] flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 font-mono">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-[#2868D9] inline-block" />
          <span className="text-[#141414] font-semibold">Processing Java 4.3</span>
          <span className="text-[#DEDDD7]">|</span>
          <span>
            {activeTab === 'class'
              ? `Pestaña ${className}.pde (Definición independiente de la clase)`
              : 'Pestaña Sketch.pde (Sketch principal con setup() y draw())'}
          </span>
        </div>

        <div className="text-[#626262]">
          {activeTab === 'sketch' && 'setup() se ejecuta 1 vez · draw() se ejecuta a 60 fps'}
          {activeTab === 'class' && `${module.methods.length} métodos encapsulados en ${className}`}
        </div>
      </div>
    </div>
  );
};

// Lightweight editorial token highlighter for Processing Java
function highlightProcessingSyntax(line: string): React.ReactNode {
  if (line.trim().startsWith('//')) {
    return <span className="text-[#626262] italic">{line}</span>;
  }

  // Tokens regex including noise, frameCount, width, height
  const parts = line.split(
    /(\b(?:class|void|float|color|int|boolean|String|new|for|if|else|return|random|size|background|ellipse|fill|stroke|noStroke|strokeWeight|constrain|dist|sin|cos|tan|noise|frameCount|width|height)\b|[{}();=+\-*\/,])/g
  );

  return parts.map((part, pIdx) => {
    if (['class', 'new', 'for', 'if', 'else', 'return'].includes(part)) {
      return (
        <span key={pIdx} className="text-[#2868D9] font-bold">
          {part}
        </span>
      );
    }
    if (['float', 'color', 'int', 'boolean', 'String', 'void'].includes(part)) {
      return (
        <span key={pIdx} className="text-[#141414] font-semibold">
          {part}
        </span>
      );
    }
    if (
      [
        'ellipse',
        'fill',
        'stroke',
        'noStroke',
        'strokeWeight',
        'size',
        'background',
        'random',
        'constrain',
        'dist',
        'sin',
        'cos',
        'tan',
        'noise',
        'frameCount',
        'width',
        'height',
      ].includes(part)
    ) {
      return (
        <span key={pIdx} className="text-[#141414] font-medium underline decoration-[#DEDDD7] decoration-1">
          {part}
        </span>
      );
    }
    if (['{', '}', '(', ')', ';', '=', '+', '-', '*', '/'].includes(part)) {
      return (
        <span key={pIdx} className="text-[#626262] font-bold">
          {part}
        </span>
      );
    }
    return <span key={pIdx}>{part}</span>;
  });
}
