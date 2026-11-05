import React, { useState } from 'react';
import { BuilderState } from '../types/classStructure';
import { ProcessingCodeBlock } from './ProcessingCodeBlock';
import { Code2, Copy, Check, ArrowDown, Info } from 'lucide-react';

interface ConstructorSketchSummaryProps {
  builder: BuilderState;
}

export const ConstructorSketchSummary: React.FC<ConstructorSketchSummaryProps> = ({
  builder,
}) => {
  const [copied, setCopied] = useState(false);

  const className = builder.className.trim() || 'Pelota';
  const instanceVar = className.toLowerCase() + '1';

  // Sample values based on parameter types
  const sampleValues: string[] = builder.constructorParams.map((p) => {
    switch (p.type) {
      case 'int':
        return '150';
      case 'float':
        return '2.5';
      case 'boolean':
        return 'true';
      case 'color':
        return 'color(255, 100, 0)';
      case 'String':
        return '"ObjetoA"';
      default:
        return '0';
    }
  });

  const invocationArgs = sampleValues.join(', ');

  // Full runnable sketch.pde code
  const mainSketchCode = `// sketch.pde — Programa principal
// 1. Declaramos la variable de referencia con el molde de la clase:
${className} ${instanceVar};

void setup() {
  size(800, 600);

  // 2. Nacimiento del objeto con "new" y argumentos ordenados:
  ${instanceVar} = new ${className}(${invocationArgs});
}

void draw() {
  background(245, 248, 250);

  // 3. Invocación de sus métodos de acción y dibujo:
${builder.methods
  .map((m) => `  ${instanceVar}.${m.name}();`)
  .join('\n')}
}`;

  const handleCopySketch = () => {
    navigator.clipboard.writeText(mainSketchCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white border border-[#DCE7F2] rounded-2xl p-5 sm:p-6 space-y-6 shadow-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#DCE7F2] pb-4">
        <div className="flex items-center gap-2.5">
          <Code2 className="w-5 h-5 text-[#006699] shrink-0" />
          <div>
            <h3 className="text-base font-bold text-[#0C2233]">
              Uso del constructor en el sketch principal
            </h3>
            <p className="text-xs text-[#4A6076] mt-0.5">
              Cómo instanciar tu clase en el lienzo y orden estricto de los argumentos
            </p>
          </div>
        </div>
        <button
          onClick={handleCopySketch}
          className="min-h-[40px] flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-[#E2EEF8] border border-[#DCE7F2] text-[#0C2233] text-xs font-semibold transition-colors self-start sm:self-auto cursor-pointer shadow-xs"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-[#006699]" />
              <span className="text-[#006699]">Copiado</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 text-[#4A6076]" />
              <span>Copiar sketch.pde</span>
            </>
          )}
        </button>
      </div>

      {/* Main Sketch Call Preview with Processing Colors */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-[#4A6076]">
          <span>Invocación en <code className="text-[#006699] font-mono bg-[#E2EEF8] px-1.5 py-0.5 rounded-md font-semibold">setup()</code> con la palabra reservada <code className="text-[#E5A93C] font-mono bg-[#FFF9EE] px-1.5 py-0.5 rounded-md font-bold">new</code>:</span>
          <span className="font-mono text-[11px] text-[#4A6076]">sketch.pde</span>
        </div>
        <ProcessingCodeBlock
          code={mainSketchCode}
          filename="sketch.pde"
          showCopyButton={false}
        />
      </div>

      {/* Positional Table: Parameter Order & Types */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-[#0C2233] uppercase tracking-wider text-[11px]">
            Estructura y orden posicional
          </span>
          <span className="font-mono text-[#4A6076] text-[11px]">
            {builder.constructorParams.length} parámetros
          </span>
        </div>

        {builder.constructorParams.length === 0 ? (
          <div className="p-4 bg-[#F4F8FB] rounded-xl border border-[#DCE7F2] text-xs text-[#4A6076] text-center">
            Este constructor no recibe parámetros. En el sketch se invoca como: <code className="text-[#0C2233] font-mono"><span className="text-[#E5A93C] font-bold">new</span> {className}()</code>.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-[#DCE7F2]">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#DCE7F2] bg-[#F4F8FB] text-[#4A6076] font-mono text-[11px]">
                  <th className="py-2.5 px-3 font-semibold">Posición</th>
                  <th className="py-2.5 px-3 font-semibold">Tipo esperado</th>
                  <th className="py-2.5 px-3 font-semibold">Parámetro</th>
                  <th className="py-2.5 px-3 font-semibold">Atributo destino</th>
                  <th className="py-2.5 px-3 font-semibold">Ejemplo en llamada</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DCE7F2] font-mono bg-white">
                {builder.constructorParams.map((p, idx) => {
                  const targetField = builder.fields.find((f) => f.id === p.targetFieldId);
                  const targetAttrName = targetField ? targetField.name : p.name.replace('Temp', '');
                  const exampleVal = sampleValues[idx] || 'valor';

                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-[#E2EEF8]/40 transition-colors text-[#0C2233]"
                    >
                      <td className="py-2.5 px-3 text-[#0C2233] font-bold">
                        {idx + 1}º
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded-md bg-[#FFF9EE] border border-[#E5A93C] text-[#9A6700] font-bold text-[11px]">
                          {p.type}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-[#4A6076] italic">
                        {p.name}
                      </td>
                      <td className="py-2.5 px-3 text-[#0C2233] font-semibold">
                        {targetAttrName}
                      </td>
                      <td className="py-2.5 px-3">
                        <code className="bg-[#F4F8FB] px-2 py-0.5 rounded-md border border-[#DCE7F2] font-mono text-[11px]">
                          {exampleVal.startsWith('"') ? (
                            <span className="text-[#8B5CF6]">{exampleVal}</span>
                          ) : exampleVal === 'true' || exampleVal === 'false' ? (
                            <span className="text-[#10B981] font-semibold">{exampleVal}</span>
                          ) : exampleVal.includes('color(') ? (
                            <span><span className="text-[#006699] font-semibold">color</span><span className="text-[#4A6076]">(255, 100, 0)</span></span>
                          ) : (
                            <span className="text-[#006699] font-semibold">{exampleVal}</span>
                          )}
                        </code>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Visual Positional Flow Diagram */}
      {builder.constructorParams.length > 0 && (
        <div className="p-4.5 bg-[#F4F8FB] rounded-2xl border border-[#DCE7F2] space-y-3">
          <div className="text-xs font-bold text-[#0C2233] flex items-center gap-1.5">
            <ArrowDown className="w-3.5 h-3.5 text-[#006699]" />
            <span>Asociación de izquierda a derecha:</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 py-2 text-xs font-mono">
            <div className="p-2.5 rounded-xl bg-white border border-[#DCE7F2] text-center shadow-xs">
              <div className="text-[10px] text-[#4A6076] font-sans mb-0.5 font-medium">
                Valores en sketch.pde
              </div>
              <div className="text-[#0C2233] font-semibold">
                new {className}({builder.constructorParams.map((_, i) => sampleValues[i]).join(', ')})
              </div>
            </div>

            <div className="text-[#006699] font-bold">→</div>

            <div className="p-2.5 rounded-xl bg-white border border-[#DCE7F2] text-center shadow-xs">
              <div className="text-[10px] text-[#4A6076] font-sans mb-0.5 font-medium">
                Constructor
              </div>
              <div className="text-[#0C2233] font-semibold">
                {className}({builder.constructorParams.map((p) => `${p.type} ${p.name}`).join(', ')})
              </div>
            </div>

            <div className="text-[#006699] font-bold">→</div>

            <div className="p-2.5 rounded-xl bg-white border border-[#DCE7F2] text-center shadow-xs">
              <div className="text-[10px] text-[#4A6076] font-sans mb-0.5 font-medium">
                Atributos guardados
              </div>
              <div className="text-[#0C2233] font-semibold">
                {builder.constructorParams
                  .map((p) => {
                    const f = builder.fields.find((field) => field.id === p.targetFieldId);
                    return f ? f.name : p.name;
                  })
                  .join(', ')}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Didactic Key Takeaways */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div className="p-4 bg-white rounded-2xl border border-[#DCE7F2] space-y-1 shadow-xs">
          <div className="font-bold text-[#0C2233] flex items-center gap-1.5">
            <Info className="w-4 h-4 shrink-0 text-[#006699]" />
            <span>El orden es estricto</span>
          </div>
          <p className="text-[#4A6076] leading-relaxed text-[11px]">
            Java asocia los argumentos <strong>por posición</strong> (1º con 1º, 2º con 2º). Si colocas <code className="text-[#0C2233] font-mono bg-[#E2EEF8] px-1 py-0.5 rounded">new {className}(150, &quot;Michi&quot;, 200)</code>, el compilador marcará un error de tipos.
          </p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-[#DCE7F2] space-y-1 shadow-xs">
          <div className="font-bold text-[#0C2233] flex items-center gap-1.5">
            <Info className="w-4 h-4 shrink-0 text-[#006699]" />
            <span>Instanciación con &ldquo;new&rdquo;</span>
          </div>
          <p className="text-[#4A6076] leading-relaxed text-[11px]">
            Declarar <code className="text-[#0C2233] font-mono bg-[#E2EEF8] px-1 py-0.5 rounded">{className} {instanceVar};</code> reserva la variable. El objeto real en memoria nace cuando se ejecuta <code className="text-[#0C2233] font-mono bg-[#E2EEF8] px-1 py-0.5 rounded">new {className}(...)</code> dentro de <code className="text-[#0C2233] font-mono bg-[#E2EEF8] px-1 py-0.5 rounded">setup()</code>.
          </p>
        </div>
      </div>
    </div>
  );
};
