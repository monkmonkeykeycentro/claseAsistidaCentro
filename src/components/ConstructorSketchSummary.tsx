import React, { useState } from 'react';
import { BuilderState } from '../types/classStructure';
import { Code2, ArrowDown, Copy, Check, Info } from 'lucide-react';

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
    <div className="bg-white border border-zinc-200 rounded-xl p-5 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 pb-4">
        <div className="flex items-center gap-2.5">
          <Code2 className="w-5 h-5 text-zinc-600 shrink-0" />
          <div>
            <h3 className="text-sm font-semibold text-zinc-900">
              Uso del constructor en el sketch principal
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              Cómo instanciar tu clase en el lienzo y orden estricto de los argumentos
            </p>
          </div>
        </div>
        <button
          onClick={handleCopySketch}
          className="min-h-[44px] flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 text-zinc-700 text-xs font-medium transition-colors self-start sm:self-auto"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-zinc-900" />
              <span>Copiado</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 text-zinc-500" />
              <span>Copiar sketch.pde</span>
            </>
          )}
        </button>
      </div>

      {/* Main Sketch Call Preview */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-zinc-600">
          <span>Invocación en <code className="text-zinc-900 font-mono bg-zinc-100 px-1 py-0.5 rounded">setup()</code> con la palabra <code className="text-zinc-900 font-mono bg-zinc-100 px-1 py-0.5 rounded">new</code>:</span>
          <span className="font-mono text-[11px] text-zinc-400">sketch.pde</span>
        </div>
        <pre className="p-4 bg-zinc-50 rounded-xl border border-zinc-200 font-mono text-xs text-zinc-800 overflow-x-auto leading-relaxed">
          {mainSketchCode}
        </pre>
      </div>

      {/* Positional Table: Parameter Order & Types */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-zinc-700 uppercase tracking-wider text-[11px]">
            Estructura y orden posicional
          </span>
          <span className="font-mono text-zinc-400 text-[11px]">
            {builder.constructorParams.length} parámetros
          </span>
        </div>

        {builder.constructorParams.length === 0 ? (
          <div className="p-4 bg-zinc-50 rounded-lg border border-zinc-200 text-xs text-zinc-500 text-center">
            Este constructor no recibe parámetros. En el sketch se invoca como: <code className="text-zinc-900 font-mono">new {className}()</code>.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 text-zinc-500 font-mono text-[11px]">
                  <th className="py-2.5 px-3 font-semibold">Posición</th>
                  <th className="py-2.5 px-3 font-semibold">Tipo esperado</th>
                  <th className="py-2.5 px-3 font-semibold">Parámetro</th>
                  <th className="py-2.5 px-3 font-semibold">Atributo destino</th>
                  <th className="py-2.5 px-3 font-semibold">Ejemplo en llamada</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 font-mono">
                {builder.constructorParams.map((p, idx) => {
                  const targetField = builder.fields.find((f) => f.id === p.targetFieldId);
                  const targetAttrName = targetField ? targetField.name : p.name.replace('Temp', '');
                  const exampleVal = sampleValues[idx] || 'valor';

                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-zinc-50/70 transition-colors text-zinc-700"
                    >
                      <td className="py-2.5 px-3 text-zinc-900 font-bold">
                        {idx + 1}º
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded bg-zinc-100 border border-zinc-200 text-zinc-900 font-semibold text-[11px]">
                          {p.type}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-zinc-700">
                        {p.name}
                      </td>
                      <td className="py-2.5 px-3 text-zinc-900 font-semibold">
                        {targetAttrName}
                      </td>
                      <td className="py-2.5 px-3">
                        <code className="text-zinc-900 bg-zinc-100 px-2 py-0.5 rounded border border-zinc-200">
                          {exampleVal}
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
        <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200 space-y-3">
          <div className="text-xs font-semibold text-zinc-700 flex items-center gap-1.5">
            <ArrowDown className="w-3.5 h-3.5 text-zinc-500" />
            <span>Asociación de izquierda a derecha:</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 py-2 text-xs font-mono">
            <div className="p-2 sm:p-2.5 rounded-lg bg-white border border-zinc-200 text-center shadow-2xs">
              <div className="text-[10px] text-zinc-400 font-sans mb-0.5">
                Valores en sketch.pde
              </div>
              <div className="text-zinc-900 font-semibold">
                new {className}({builder.constructorParams.map((_, i) => sampleValues[i]).join(', ')})
              </div>
            </div>

            <div className="text-zinc-400 font-bold">→</div>

            <div className="p-2 sm:p-2.5 rounded-lg bg-white border border-zinc-200 text-center shadow-2xs">
              <div className="text-[10px] text-zinc-400 font-sans mb-0.5">
                Constructor
              </div>
              <div className="text-zinc-900 font-semibold">
                {className}({builder.constructorParams.map((p) => `${p.type} ${p.name}`).join(', ')})
              </div>
            </div>

            <div className="text-zinc-400 font-bold">→</div>

            <div className="p-2 sm:p-2.5 rounded-lg bg-white border border-zinc-200 text-center shadow-2xs">
              <div className="text-[10px] text-zinc-400 font-sans mb-0.5">
                Atributos guardados
              </div>
              <div className="text-zinc-900 font-semibold">
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
        <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200 space-y-1">
          <div className="font-semibold text-zinc-900 flex items-center gap-1.5">
            <Info className="w-4 h-4 shrink-0 text-zinc-500" />
            <span>El orden es estricto</span>
          </div>
          <p className="text-zinc-600 leading-relaxed text-[11px]">
            Java asocia los argumentos <strong>por posición</strong> (1º con 1º, 2º con 2º). Si colocas <code className="text-zinc-900 font-mono bg-zinc-100 px-1 py-0.5 rounded">new {className}(150, &quot;Michi&quot;, 200)</code>, el compilador marcará un error de tipos.
          </p>
        </div>

        <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200 space-y-1">
          <div className="font-semibold text-zinc-900 flex items-center gap-1.5">
            <Info className="w-4 h-4 shrink-0 text-zinc-500" />
            <span>Instanciación con &ldquo;new&rdquo;</span>
          </div>
          <p className="text-zinc-600 leading-relaxed text-[11px]">
            Declarar <code className="text-zinc-900 font-mono bg-zinc-100 px-1 py-0.5 rounded">{className} {instanceVar};</code> reserva la variable. El objeto real en memoria nace cuando se ejecuta <code className="text-zinc-900 font-mono bg-zinc-100 px-1 py-0.5 rounded">new {className}(...)</code> dentro de <code className="text-zinc-900 font-mono bg-zinc-100 px-1 py-0.5 rounded">setup()</code>.
          </p>
        </div>
      </div>
    </div>
  );
};
