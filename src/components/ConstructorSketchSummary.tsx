import React, { useState } from 'react';
import { BuilderState } from '../types/classStructure';
import { Code2, ArrowDown, Copy, Check, Info } from 'lucide-react';
import { ProcessingCodeBlock } from './ProcessingCodeBlock';

interface ConstructorSketchSummaryProps {
  builder: BuilderState;
}

export const ConstructorSketchSummary: React.FC<ConstructorSketchSummaryProps> = ({
  builder,
}) => {
  const [copied, setCopied] = useState(false);

  const className = builder.className.trim() || 'Gato';
  const instanceVar = className.charAt(0).toLowerCase() + className.slice(1);

  // Sample values according to parameter types
  const sampleValues = builder.constructorParams.map((p, idx) => {
    switch (p.type) {
      case 'String':
        return idx === 0 ? '"Michi"' : '"Pelusa"';
      case 'int':
        return idx === 1 ? '150' : idx === 2 ? '200' : `${(idx + 1) * 50}`;
      case 'float':
        return '2.5';
      case 'boolean':
        return 'true';
      case 'color':
        return 'color(255, 100, 0)';
      default:
        return 'valor';
    }
  });

  const sketchCallArgs = sampleValues.join(', ');

  const mainSketchCode = `// sketch.pde (Pestaña principal)

// 1. Declarar la variable de objeto
${className} ${instanceVar};

void setup() {
  size(600, 400);

  // 2. Instanciar en setup() llamando al constructor con new:
  // Argumentos en orden estricto (${builder.constructorParams.length} valores)
  ${instanceVar} = new ${className}(${sketchCallArgs});
}

void draw() {
  background(240);

  // 3. Invocar métodos del objeto
  ${instanceVar}.${builder.methods[0]?.name || 'dibujar'}();
}`;

  const handleCopySketch = () => {
    navigator.clipboard.writeText(mainSketchCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white border border-[#E1E7E1] rounded-2xl p-5 sm:p-6 space-y-6 shadow-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E1E7E1] pb-4">
        <div className="flex items-center gap-2.5">
          <Code2 className="w-5 h-5 text-[#407B5D] shrink-0" />
          <div>
            <h3 className="text-base font-bold text-[#232A24]">
              Uso del constructor en el sketch principal
            </h3>
            <p className="text-xs text-[#59645C] mt-0.5">
              Cómo instanciar tu clase en el lienzo y orden estricto de los argumentos
            </p>
          </div>
        </div>
        <button
          onClick={handleCopySketch}
          className="min-h-[40px] flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-[#E8EEE8] border border-[#E1E7E1] text-[#232A24] text-xs font-semibold transition-colors self-start sm:self-auto cursor-pointer shadow-xs"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-[#407B5D]" />
              <span className="text-[#407B5D]">Copiado</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 text-[#59645C]" />
              <span>Copiar sketch.pde</span>
            </>
          )}
        </button>
      </div>

      {/* Main Sketch Call Preview with Processing Colors */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-[#59645C]">
          <span>Invocación en <code className="text-[#407B5D] font-mono bg-[#E8EEE8] px-1.5 py-0.5 rounded-md font-semibold">setup()</code> con la palabra reservada <code className="text-[#E6B65A] font-mono bg-[#FFF9EE] px-1.5 py-0.5 rounded-md font-bold">new</code>:</span>
          <span className="font-mono text-[11px] text-[#59645C]">sketch.pde</span>
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
          <span className="font-bold text-[#232A24] uppercase tracking-wider text-[11px]">
            Estructura y orden posicional
          </span>
          <span className="font-mono text-[#59645C] text-[11px]">
            {builder.constructorParams.length} parámetros
          </span>
        </div>

        {builder.constructorParams.length === 0 ? (
          <div className="p-4 bg-[#F7F8F4] rounded-xl border border-[#E1E7E1] text-xs text-[#59645C] text-center">
            Este constructor no recibe parámetros. En el sketch se invoca como: <code className="text-[#232A24] font-mono"><span className="text-[#E6B65A] font-bold">new</span> {className}()</code>.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-[#E1E7E1]">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#E1E7E1] bg-[#F7F8F4] text-[#59645C] font-mono text-[11px]">
                  <th className="py-2.5 px-3 font-semibold">Posición</th>
                  <th className="py-2.5 px-3 font-semibold">Tipo esperado</th>
                  <th className="py-2.5 px-3 font-semibold">Parámetro</th>
                  <th className="py-2.5 px-3 font-semibold">Atributo destino</th>
                  <th className="py-2.5 px-3 font-semibold">Ejemplo en llamada</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E1E7E1] font-mono bg-white">
                {builder.constructorParams.map((p, idx) => {
                  const targetField = builder.fields.find((f) => f.id === p.targetFieldId);
                  const targetAttrName = targetField ? targetField.name : p.name.replace('Temp', '');
                  const exampleVal = sampleValues[idx] || 'valor';

                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-[#E8EEE8]/40 transition-colors text-[#232A24]"
                    >
                      <td className="py-2.5 px-3 text-[#232A24] font-bold">
                        {idx + 1}º
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded-md bg-[#FFF9EE] border border-[#E6B65A] text-[#8A6318] font-bold text-[11px]">
                          {p.type}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-[#59645C] italic">
                        {p.name}
                      </td>
                      <td className="py-2.5 px-3 text-[#232A24] font-semibold">
                        {targetAttrName}
                      </td>
                      <td className="py-2.5 px-3">
                        <code className="bg-[#F7F8F4] px-2 py-0.5 rounded-md border border-[#E1E7E1] font-mono text-[11px]">
                          {exampleVal.startsWith('"') ? (
                            <span className="text-[#8B5CF6]">{exampleVal}</span>
                          ) : exampleVal === 'true' || exampleVal === 'false' ? (
                            <span className="text-[#407B5D] font-semibold">{exampleVal}</span>
                          ) : exampleVal.includes('color(') ? (
                            <span><span className="text-[#407B5D] font-semibold">color</span><span className="text-[#59645C]">(255, 100, 0)</span></span>
                          ) : (
                            <span className="text-[#2563EB]">{exampleVal}</span>
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
        <div className="p-4.5 bg-[#F7F8F4] rounded-2xl border border-[#E1E7E1] space-y-3">
          <div className="text-xs font-bold text-[#232A24] flex items-center gap-1.5">
            <ArrowDown className="w-3.5 h-3.5 text-[#407B5D]" />
            <span>Asociación de izquierda a derecha:</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 py-2 text-xs font-mono">
            <div className="p-2.5 rounded-xl bg-white border border-[#E1E7E1] text-center shadow-xs">
              <div className="text-[10px] text-[#59645C] font-sans mb-0.5 font-medium">
                Valores en sketch.pde
              </div>
              <div className="text-[#232A24] font-semibold">
                new {className}({builder.constructorParams.map((_, i) => sampleValues[i]).join(', ')})
              </div>
            </div>

            <div className="text-[#407B5D] font-bold">→</div>

            <div className="p-2.5 rounded-xl bg-white border border-[#E1E7E1] text-center shadow-xs">
              <div className="text-[10px] text-[#59645C] font-sans mb-0.5 font-medium">
                Constructor
              </div>
              <div className="text-[#232A24] font-semibold">
                {className}({builder.constructorParams.map((p) => `${p.type} ${p.name}`).join(', ')})
              </div>
            </div>

            <div className="text-[#407B5D] font-bold">→</div>

            <div className="p-2.5 rounded-xl bg-white border border-[#E1E7E1] text-center shadow-xs">
              <div className="text-[10px] text-[#59645C] font-sans mb-0.5 font-medium">
                Atributos guardados
              </div>
              <div className="text-[#232A24] font-semibold">
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
        <div className="p-4 bg-white rounded-2xl border border-[#E1E7E1] space-y-1 shadow-xs">
          <div className="font-bold text-[#232A24] flex items-center gap-1.5">
            <Info className="w-4 h-4 shrink-0 text-[#407B5D]" />
            <span>El orden es estricto</span>
          </div>
          <p className="text-[#59645C] leading-relaxed text-[11px]">
            Java asocia los argumentos <strong>por posición</strong> (1º con 1º, 2º con 2º). Si colocas <code className="text-[#232A24] font-mono bg-[#E8EEE8] px-1 py-0.5 rounded">new {className}(150, &quot;Michi&quot;, 200)</code>, el compilador marcará un error de tipos.
          </p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-[#E1E7E1] space-y-1 shadow-xs">
          <div className="font-bold text-[#232A24] flex items-center gap-1.5">
            <Info className="w-4 h-4 shrink-0 text-[#407B5D]" />
            <span>Instanciación con &ldquo;new&rdquo;</span>
          </div>
          <p className="text-[#59645C] leading-relaxed text-[11px]">
            Declarar <code className="text-[#232A24] font-mono bg-[#E8EEE8] px-1 py-0.5 rounded">{className} {instanceVar};</code> reserva la variable. El objeto real en memoria nace cuando se ejecuta <code className="text-[#232A24] font-mono bg-[#E8EEE8] px-1 py-0.5 rounded">new {className}(...)</code> dentro de <code className="text-[#232A24] font-mono bg-[#E8EEE8] px-1 py-0.5 rounded">setup()</code>.
          </p>
        </div>
      </div>
    </div>
  );
};
