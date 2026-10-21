import React, { useState } from 'react';
import { Download, Copy, Check, FileCode, Sparkles } from 'lucide-react';
import { ModuleProgression } from '../../types/oopLab';

interface ProgressiveCodeEditorProps {
  module: ModuleProgression;
  currentStageIdx: number;
}

export const ProgressiveCodeEditor: React.FC<ProgressiveCodeEditorProps> = ({
  module,
  currentStageIdx,
}) => {
  const [activeTab, setActiveTab] = useState<'class' | 'sketch'>('class');
  const [copied, setCopied] = useState<boolean>(false);

  const isPelota = module.moduleId === 'pelota';
  const className = module.objectName;

  // Determine which parts of the class have been unlocked/built based on current stage
  const hasClassDeclared = currentStageIdx >= 1;
  const hasFields = currentStageIdx >= 2;
  const hasConstructor = currentStageIdx >= 3;
  const hasMethods = currentStageIdx >= 4;
  const hasArray = currentStageIdx >= 6;

  // Build the Class Tab Code
  const buildClassCode = (): string => {
    if (!hasClassDeclared) {
      return `// Observación previa: aún no se ha declarado la clase.
// En la siguiente etapa definiremos: class ${className} { }`;
    }

    let code = `class ${className} {\n`;

    if (hasFields) {
      code += `  // ===============================\n`;
      code += `  // 1. CAMPOS (Atributos de estado)\n`;
      code += `  // ===============================\n`;
      module.fields.forEach((f) => {
        code += `  ${f.type} ${f.name};\n`;
      });
      code += `\n`;
    }

    if (hasConstructor) {
      code += `  // ===============================\n`;
      code += `  // 2. CONSTRUCTOR\n`;
      code += `  // ===============================\n`;
      if (isPelota) {
        code += `  ${className}(float xTemp, float yTemp, float diamTemp, float velTemp, color tonoTemp) {\n`;
        code += `    x = xTemp;\n`;
        code += `    y = yTemp;\n`;
        code += `    diametro = diamTemp;\n`;
        code += `    velocidad = velTemp;\n`;
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
    }

    if (hasMethods) {
      code += `  // ===============================\n`;
      code += `  // 3. MÉTODOS (Comportamiento)\n`;
      code += `  // ===============================\n`;
      module.methods.forEach((m) => {
        code += `  ${m.codeSnippet.split('\n').join('\n  ')}\n\n`;
      });
    }

    code += `}`;
    return code;
  };

  // Build the Sketch Tab Code
  const buildSketchCode = (): string => {
    if (hasArray) {
      const count = isPelota ? 3 : 5;
      return `// ==========================================
// SKETCH PRINCIPAL (Processing Java)
// Múltiples instancias con arreglo: ${className}[]
// ==========================================

${className}[] ${isPelota ? 'pelotas' : 'burbujas'} = new ${className}[${count}];

void setup() {
  size(500, 350);
  
  // TIEMPO 1: Construir cada elemento en el arreglo
  for (int i = 0; i < ${isPelota ? 'pelotas' : 'burbujas'}.length; i++) {
${
  isPelota
    ? `    pelotas[i] = new Pelota(100 + i * 140, 180, 45 + i * 15, 2.0 + i * 1.5, color(226, 102 + i * 40, 26));`
    : `    burbujas[i] = new Burbuja(random(50, 450), random(220, 320), random(30, 55), random(1.8, 3.2), random(120, 200));`
}
  }
}

void draw() {
  background(${isPelota ? '245' : '15, 30, 60'});
  
  // TIEMPO 2: Actualizar y dibujar en cada ciclo a 60 fps
  for (int i = 0; i < ${isPelota ? 'pelotas' : 'burbujas'}.length; i++) {
${
  isPelota
    ? `    pelotas[i].mover();
    pelotas[i].mostrar();`
    : `    burbujas[i].subir();
    burbujas[i].mostrar();`
}
  }
}`;
    }

    return `// ==========================================
// SKETCH PRINCIPAL (Processing Java)
// Instancia individual
// ==========================================

${className} ${isPelota ? 'miPelota' : 'miBurbuja'};

void setup() {
  size(500, 350);
  // Instanciar el objeto con new y pasar argumentos al constructor:
${
  isPelota
    ? `  miPelota = new Pelota(200, 180, 50, 3.0, color(226, 102, 26));`
    : `  miBurbuja = new Burbuja(200, 280, 45, 2.2, 160);`
}
}

void draw() {
  background(${isPelota ? '245' : '15, 30, 60'});
  
  // Llamada continua desde draw():
${
  isPelota
    ? `  miPelota.mover();
  miPelota.mostrar();`
    : `  miBurbuja.subir();
  miBurbuja.mostrar();`
}
}`;
  };

  const currentCode = activeTab === 'class' ? buildClassCode() : buildSketchCode();

  const handleCopy = () => {
    navigator.clipboard.writeText(currentCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPde = () => {
    // Generate full standalone executable Processing sketch file
    const fullPdeContent = `// ==========================================
// PROYECTO EDUCATIVO: ${module.moduleName}
// Código fuente completo para Processing Java 4
// ==========================================

${buildSketchCode()}

// ==========================================
// DEFINICIÓN DE LA CLASE: ${className}.pde
// ==========================================

${buildClassCode()}
`;

    const blob = new Blob([fullPdeContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${className}_Sketch.pde`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const lines = currentCode.split('\n');

  return (
    <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-xs flex flex-col">
      {/* Editor Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-4 py-2.5 bg-zinc-50 border-b border-zinc-200">
        {/* Tabs */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('class')}
            className={`min-h-[34px] px-3 py-1 rounded-lg text-xs font-mono font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'class'
                ? 'bg-white text-zinc-950 font-bold border border-zinc-200 shadow-xs'
                : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100'
            }`}
          >
            <FileCode className="w-3.5 h-3.5 text-zinc-700" />
            <span>{className}.pde</span>
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
            <FileCode className="w-3.5 h-3.5 text-zinc-700" />
            <span>Sketch.pde</span>
            {hasArray && <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />}
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="min-h-[34px] px-2.5 py-1 rounded-lg bg-white hover:bg-zinc-100 border border-zinc-200 text-zinc-700 text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Copiar código al portapapeles"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-zinc-950" />
                <span className="font-semibold text-zinc-950">Copiado</span>
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
            title="Descargar archivo ejecutable para Processing"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Descargar .pde</span>
          </button>
        </div>
      </div>

      {/* Code Area with line numbers & syntax highlighting */}
      <div className="relative font-mono text-xs overflow-x-auto p-4 bg-[#FFFFFF] max-h-[460px] custom-scrollbar leading-relaxed">
        <div className="table w-full border-collapse">
          {lines.map((line, idx) => {
            const lineNum = idx + 1;
            const isComment = line.trim().startsWith('//');
            const isHeader = line.includes('===');
            const isClassDecl = line.includes(`class ${className}`);

            return (
              <div
                key={idx}
                className={`table-row transition-colors ${
                  isClassDecl ? 'bg-amber-50/60 font-semibold' : 'hover:bg-zinc-50'
                }`}
              >
                {/* Line number */}
                <span className="table-cell select-none pr-4 text-right text-zinc-300 font-mono text-[11px] w-8 tabular-nums">
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

      {/* Footer Status Bar */}
      <div className="px-4 py-2 bg-zinc-50 border-t border-zinc-200 text-[11px] text-zinc-500 flex items-center justify-between font-mono">
        <span>Sintaxis: Processing Java 4 (Estricto)</span>
        <span className="text-zinc-600">
          {activeTab === 'class'
            ? `${className}.pde · ${hasMethods ? '7 métodos listos' : 'En construcción'}`
            : `Sketch.pde · ${hasArray ? 'Arreglo activo' : 'Instancia única'}`}
        </span>
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
    /(\b(?:class|void|float|color|int|boolean|String|new|for|if|else|return|random|size|background|ellipse|fill|stroke|noStroke|strokeWeight|constrain|dist)\b|[{}();=+\-*\/,])/g
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
