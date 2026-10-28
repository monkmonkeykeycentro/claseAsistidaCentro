import React, { useState } from 'react';
import { Download, Copy, Check, FileCode, Layers, Info, Sparkles, Code2, ArrowRight } from 'lucide-react';
import { ModuleProgression } from '../../types/oopLab';

interface ProgressiveCodeEditorProps {
  module: ModuleProgression;
  currentStageIdx: number;
}

export const ProgressiveCodeEditor: React.FC<ProgressiveCodeEditorProps> = ({
  module,
  currentStageIdx,
}) => {
  const [activeTab, setActiveTab] = useState<'class' | 'sketch' | 'unified'>('class');
  const [copiedType, setCopiedType] = useState<string | null>(null);

  const isPelota = module.moduleId === 'pelota';
  const className = module.objectName;

  // Progressive milestone flags
  const hasClassDeclared = currentStageIdx >= 1;
  const hasFields = currentStageIdx >= 2;
  const hasConstructor = currentStageIdx >= 3;
  const hasMethods = currentStageIdx >= 4;
  const hasMethodExplorer = currentStageIdx >= 5;
  const hasArray = currentStageIdx >= 6;

  // Build the Class Tab Code with rich contextual explanations
  const buildClassCode = (): string => {
    if (!hasClassDeclared) {
      return `// ==========================================
// 1. OBSERVACIÓN PREVIA (Antes de escribir código)
// ==========================================
// Aún no hemos declarado la clase.
// En la siguiente etapa escribiremos:
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
      code += `  // 1. CAMPOS (Variables internas de estado)\n`;
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
      } else {
        code += `  // Coordenadas cartesianas y dimensiones:\n`;
        code += `  float x;          // Posición horizontal en el agua\n`;
        code += `  float y;          // Posición vertical (nace abajo)\n`;
        code += `  float diametro;   // Diámetro inicial del cuerpo esférico\n\n`;

        code += `  // Cinemática ascendente y cualidad óptica translúcida:\n`;
        code += `  float velocidad;  // Rapidez de ascenso hacia la superficie\n`;
        code += `  float opacidad;   // Transparencia alfa en rango Processing (0 a 255)\n\n`;
      }
    } else {
      code += `  // (Aquí declararemos los campos en la Etapa 3)\n\n`;
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
        code += `    tono = tonoTemp;\n`;
        code += `  }\n\n`;
      } else {
        code += `  ${className}(float xTemp, float yTemp, float diamTemp, float velTemp, float opacTemp) {\n`;
        code += `    x = xTemp;\n`;
        code += `    y = yTemp;\n`;
        code += `    diametro = diamTemp;\n`;
        code += `    velocidad = velTemp;\n`;
        code += `    opacidad = opacTemp;\n`;
        code += `  }\n\n`;
      }
    } else if (hasClassDeclared && !hasConstructor) {
      code += `  // (El constructor se construirá en la Etapa 4)\n\n`;
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

        code += `  // --- GRUPO 2: Expresión Orgánica & Trigonometría ---\n`;
        module.methods
          .filter((m) => m.id === 'flotar')
          .forEach((m) => {
            code += `  ${m.codeSnippet.split('\n').join('\n  ')}\n\n`;
          });

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
      code += `  // (Los métodos de comportamiento se incorporarán en la Etapa 5)\n`;
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
    ? `  miPelota.mover();            // Desplaza en 2D sumando velocidadX y velocidadY
  miPelota.rebotar();          // Comprueba colisiones con los 4 bordes del lienzo
  miPelota.flotar(2.0);        // Aplica modulación senoidal armónica con sin()
  miPelota.mostrar();          // Proyecta el círculo en pantalla con fill() y ellipse()`
    : `  miBurbuja.subir();           // Asciende restando velocidad al eje Y
  miBurbuja.flotar(1.6);       // Oscilación sutil de vaivén en agua
  miBurbuja.mostrar();         // Dibuja el cuerpo traslúcido y su brillo vítreo`
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
    pelotas[i].flotar(2.0);
    pelotas[i].mostrar();`
    : `    burbujas[i].subir();
    burbujas[i].flotar(1.6); // Vaivén sutil de flotación
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

  // Build the complete unified file combining Sketch + Class
  const buildUnifiedCode = (): string => {
    return `// ==========================================
// PROYECTO COMPLETO PARA PROCESSING JAVA 4
// Módulo: ${module.moduleName}
// ==========================================

${buildSketchCode()}

// ==========================================
// DEFINICIÓN DE LA CLASE: ${className}
// (En Processing IDE puede colocarse en una pestaña separada llamada ${className})
// ==========================================

${buildClassCode()}
`;
  };

  const getActiveCode = (): string => {
    if (activeTab === 'class') return buildClassCode();
    if (activeTab === 'sketch') return buildSketchCode();
    return buildUnifiedCode();
  };

  const currentCode = getActiveCode();

  const handleCopy = (type: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  const handleDownloadPde = () => {
    const fullPdeContent = buildUnifiedCode();
    const blob = new Blob([fullPdeContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${className}_Proyecto.pde`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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
    <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-xs flex flex-col">
      {/* 1. Header with 3 Tabs & Quick Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 px-4 py-2.5 bg-zinc-50 border-b border-zinc-200">
        {/* 3 Tabs */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setActiveTab('class')}
            className={`min-h-[34px] px-3 py-1 rounded-lg text-xs font-mono font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'class'
                ? 'bg-white text-zinc-950 font-bold border border-zinc-200 shadow-xs'
                : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100'
            }`}
          >
            <FileCode className="w-3.5 h-3.5 text-zinc-700" />
            <span>{className}.pde (Clase)</span>
            {hasClassDeclared && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
          </button>

          <button
            onClick={() => setActiveTab('sketch')}
            className={`min-h-[34px] px-3 py-1 rounded-lg text-xs font-mono font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'sketch'
                ? 'bg-white text-zinc-950 font-bold border border-zinc-200 shadow-xs'
                : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100'
            }`}
          >
            <Code2 className="w-3.5 h-3.5 text-zinc-700" />
            <span>Sketch.pde (Principal)</span>
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
          </button>

          <button
            onClick={() => setActiveTab('unified')}
            className={`min-h-[34px] px-3 py-1 rounded-lg text-xs font-mono font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'unified'
                ? 'bg-white text-zinc-950 font-bold border border-zinc-200 shadow-xs'
                : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-zinc-700" />
            <span>Todo el .pde</span>
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleCopy('active', currentCode)}
            className="min-h-[34px] px-2.5 py-1 rounded-lg bg-white hover:bg-zinc-100 border border-zinc-200 text-zinc-700 text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Copiar pestaña activa al portapapeles"
          >
            {copiedType === 'active' ? (
              <>
                <Check className="w-3.5 h-3.5 text-zinc-950" />
                <span className="font-semibold text-zinc-950">¡Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar</span>
              </>
            )}
          </button>

          <button
            onClick={handleDownloadPde}
            className="min-h-[34px] px-3 py-1 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
            title="Descargar archivo ejecutable .pde para abrir en Processing"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Descargar .pde</span>
          </button>
        </div>
      </div>

      {/* 2. Progressive Sketch & Class Evolution Guide Banner */}
      <div className="px-4 py-2.5 bg-zinc-50/80 border-b border-zinc-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-zinc-700 font-sans">
          <span className="bg-zinc-200/90 text-zinc-800 font-mono text-[10px] font-bold px-2 py-0.5 rounded">
            Etapa {currentStageIdx + 1}
          </span>
          <span className="font-semibold text-zinc-900">{currentGuide.title}:</span>
          <span className="text-zinc-600 truncate">{currentGuide.addition}</span>
        </div>

        <div className="text-[11px] text-zinc-500 font-sans flex items-center gap-1 shrink-0">
          <Info className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
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
                    ? 'bg-amber-50/70 font-semibold'
                    : 'hover:bg-zinc-50'
                }`}
              >
                {/* Line number */}
                <span className="table-cell select-none pr-4 text-right text-zinc-300 font-mono text-[11px] w-9 tabular-nums">
                  {lineNum}
                </span>

                {/* Code content */}
                <span
                  className={`table-cell whitespace-pre ${
                    isComment || isHeader
                      ? 'text-zinc-400 font-sans text-[11px] italic'
                      : 'text-zinc-800'
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
      <div className="px-4 py-2 bg-zinc-50 border-t border-zinc-200 text-[11px] text-zinc-500 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 font-mono">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>Processing Java 4 (Estricto)</span>
          <span className="text-zinc-300">|</span>
          <span className="text-zinc-600 font-sans">
            {activeTab === 'class'
              ? `Pestaña ${className}.pde (Definición del molde)`
              : activeTab === 'sketch'
              ? 'Pestaña Sketch.pde (setup() y draw() principales)'
              : 'Sketch completo unificado'}
          </span>
        </div>

        <div className="text-zinc-400 font-sans text-[11px]">
          {activeTab === 'sketch' && 'setup() corre 1 vez · draw() corre a 60 fps'}
          {activeTab === 'class' && `${module.methods.length} métodos construidos en la clase`}
          {activeTab === 'unified' && 'Listo para copiar o abrir en el IDE oficial'}
        </div>
      </div>
    </div>
  );
};

// Lightweight token highlighter for Processing Java
function highlightProcessingSyntax(line: string): React.ReactNode {
  if (line.trim().startsWith('//')) {
    return <span className="text-zinc-400 italic">{line}</span>;
  }

  // Tokens regex
  const parts = line.split(
    /(\b(?:class|void|float|color|int|boolean|String|new|for|if|else|return|random|size|background|ellipse|fill|stroke|noStroke|strokeWeight|constrain|dist|sin|cos|tan)\b|[{}();=+\-*\/,])/g
  );

  return parts.map((part, pIdx) => {
    if (['class', 'new', 'for', 'if', 'else', 'return'].includes(part)) {
      return (
        <span key={pIdx} className="text-purple-700 font-bold">
          {part}
        </span>
      );
    }
    if (['float', 'color', 'int', 'boolean', 'String', 'void'].includes(part)) {
      return (
        <span key={pIdx} className="text-emerald-700 font-semibold">
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
      ].includes(part)
    ) {
      return (
        <span key={pIdx} className="text-sky-700 font-medium">
          {part}
        </span>
      );
    }
    if (['{', '}', '(', ')', ';', '=', '+', '-', '*', '/'].includes(part)) {
      return (
        <span key={pIdx} className="text-zinc-500 font-bold">
          {part}
        </span>
      );
    }
    return <span key={pIdx}>{part}</span>;
  });
}
