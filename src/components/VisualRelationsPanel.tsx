import React from 'react';
import { ArrowRight, BookOpen, Layers } from 'lucide-react';

interface VisualRelationsPanelProps {
  activeRelation: 'assignment' | 'constructor-match' | 'method-structure' | 'custom' | null;
  onSelectRelation?: (rel: 'assignment' | 'constructor-match' | 'method-structure') => void;
  selectedTokenInfo?: {
    token: string;
    label: string;
    explanation: string;
  } | null;
}

export const VisualRelationsPanel: React.FC<VisualRelationsPanelProps> = ({
  activeRelation,
  onSelectRelation,
  selectedTokenInfo,
}) => {
  return (
    <div className="bg-zinc-50/70 border border-zinc-200 rounded-xl p-4 sm:p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-zinc-200 pb-2.5">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-zinc-500" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-700">
            Relaciones clave
          </h3>
        </div>
        <span className="text-[11px] text-zinc-400 font-mono">3 conceptos</span>
      </div>

      {/* Preset tabs with 44px touch height */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <button
          onClick={() => onSelectRelation?.('assignment')}
          className={`min-h-[44px] px-3 py-2 text-xs rounded-lg text-left transition-colors border ${
            activeRelation === 'assignment'
              ? 'bg-zinc-900 border-zinc-900 text-white font-medium shadow-xs'
              : 'bg-white border-zinc-200 text-zinc-600 hover:text-zinc-900 hover:border-zinc-300'
          }`}
        >
          <div className="font-semibold">Asignación</div>
          <div className="text-[10px] font-mono opacity-80 truncate">nombre = nombreTemp;</div>
        </button>

        <button
          onClick={() => onSelectRelation?.('constructor-match')}
          className={`min-h-[44px] px-3 py-2 text-xs rounded-lg text-left transition-colors border ${
            activeRelation === 'constructor-match'
              ? 'bg-zinc-900 border-zinc-900 text-white font-medium shadow-xs'
              : 'bg-white border-zinc-200 text-zinc-600 hover:text-zinc-900 hover:border-zinc-300'
          }`}
        >
          <div className="font-semibold">Constructor</div>
          <div className="text-[10px] font-mono opacity-80 truncate">class Gato ↔ Gato()</div>
        </button>

        <button
          onClick={() => onSelectRelation?.('method-structure')}
          className={`min-h-[44px] px-3 py-2 text-xs rounded-lg text-left transition-colors border ${
            activeRelation === 'method-structure'
              ? 'bg-zinc-900 border-zinc-900 text-white font-medium shadow-xs'
              : 'bg-white border-zinc-200 text-zinc-600 hover:text-zinc-900 hover:border-zinc-300'
          }`}
        >
          <div className="font-semibold">Método</div>
          <div className="text-[10px] font-mono opacity-80 truncate">void caminar(...)</div>
        </button>
      </div>

      {/* Active Relationship Render */}
      {activeRelation === 'assignment' && (
        <div className="space-y-3 bg-white p-4 rounded-xl border border-zinc-200 text-xs">
          <div className="font-semibold text-zinc-900">
            Flujo de asignación en el constructor
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 py-3 bg-zinc-50 rounded-lg border border-zinc-200 font-mono text-xs">
            <div className="flex flex-col items-center p-2 rounded bg-white border border-zinc-200 shadow-2xs">
              <span className="text-[10px] text-zinc-500 font-sans mb-0.5">Atributo</span>
              <span className="text-zinc-900 font-bold px-2 py-0.5">nombre</span>
              <span className="text-[10px] text-zinc-400 font-sans">Destino</span>
            </div>

            <div className="flex flex-col items-center px-1">
              <span className="text-zinc-900 font-bold text-base">=</span>
              <span className="text-[10px] text-zinc-400 font-sans">recibe</span>
            </div>

            <div className="flex flex-col items-center p-2 rounded bg-white border border-zinc-200 shadow-2xs">
              <span className="text-[10px] text-zinc-500 font-sans mb-0.5">Parámetro</span>
              <span className="text-zinc-900 font-bold px-2 py-0.5">nombreTemp</span>
              <span className="text-[10px] text-zinc-400 font-sans">Origen</span>
            </div>

            <div className="text-zinc-400 font-bold text-sm px-1">;</div>
          </div>

          <p className="text-zinc-600 leading-relaxed text-[11px]">
            El valor recibido en <code className="text-zinc-900 font-mono bg-zinc-100 px-1 py-0.5 rounded">nombreTemp</code> se asigna al atributo <code className="text-zinc-900 font-mono bg-zinc-100 px-1 py-0.5 rounded">nombre</code>. La asignación viaja de <strong>derecha a izquierda</strong>.
          </p>
        </div>
      )}

      {activeRelation === 'constructor-match' && (
        <div className="space-y-3 bg-white p-4 rounded-xl border border-zinc-200 text-xs">
          <div className="font-semibold text-zinc-900">
            Coincidencia exacta de nombre
          </div>

          <div className="flex items-center justify-center gap-3 py-3 bg-zinc-50 rounded-lg border border-zinc-200 font-mono text-xs">
            <div className="p-2.5 rounded bg-white border border-zinc-200 text-center shadow-2xs">
              <div className="text-[10px] text-zinc-400 font-sans">Nombre de la clase</div>
              <div className="text-zinc-900 font-bold">class Gato</div>
            </div>

            <div className="flex flex-col items-center text-zinc-400">
              <span className="text-[10px] font-sans">Igual</span>
              <ArrowRight className="w-3.5 h-3.5 my-0.5 text-zinc-600" />
            </div>

            <div className="p-2.5 rounded bg-white border border-zinc-200 text-center shadow-2xs">
              <div className="text-[10px] text-zinc-400 font-sans">Nombre del constructor</div>
              <div className="text-zinc-900 font-bold">Gato(...)</div>
            </div>
          </div>

          <div className="text-zinc-600 leading-relaxed text-[11px] space-y-1">
            <p>
              El constructor lleva <strong>exactamente el mismo nombre</strong> que la clase.
            </p>
            <p className="text-zinc-800">
              <strong>Sin tipo de retorno:</strong> El constructor no lleva ningún tipo, <strong>tampoco void</strong>.
            </p>
          </div>
        </div>
      )}

      {activeRelation === 'method-structure' && (
        <div className="space-y-3 bg-white p-4 rounded-xl border border-zinc-200 text-xs">
          <div className="font-semibold text-zinc-900">
            Anatomía de un método
          </div>

          <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-200 font-mono text-xs space-y-1">
            <div className="text-zinc-900 font-semibold">
              <span className="text-zinc-500 italic">void</span>{' '}
              <span className="text-zinc-900">caminar</span>(
              <span className="text-zinc-700">int pasoX</span>,{' '}
              <span className="text-zinc-700">int pasoY</span>){' '}
              <span className="text-zinc-900 font-bold">{'{'}</span>
            </div>
            <div className="pl-4 text-zinc-400 italic font-mono text-[11px]">
              // Instrucciones del método...
            </div>
            <div className="text-zinc-900 font-bold">{'}'}</div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
            <div className="p-2.5 bg-zinc-50 rounded-lg border border-zinc-200">
              <span className="font-semibold text-zinc-900 block mb-0.5">void</span>
              <p className="text-zinc-600">Acción sin retorno de valor.</p>
            </div>
            <div className="p-2.5 bg-zinc-50 rounded-lg border border-zinc-200">
              <span className="font-semibold text-zinc-900 block mb-0.5">caminar</span>
              <p className="text-zinc-600">Nombre de la acción (camelCase).</p>
            </div>
            <div className="p-2.5 bg-zinc-50 rounded-lg border border-zinc-200">
              <span className="font-semibold text-zinc-900 block mb-0.5">Parámetros</span>
              <p className="text-zinc-600">Tipo y nombre de los datos que requiere.</p>
            </div>
            <div className="p-2.5 bg-zinc-50 rounded-lg border border-zinc-200">
              <span className="font-semibold text-zinc-900 block mb-0.5">{'{ }'} Llaves</span>
              <p className="text-zinc-600">Delimitan las instrucciones.</p>
            </div>
          </div>
        </div>
      )}

      {/* Selected Token Inspector */}
      {selectedTokenInfo && (
        <div className="p-3 bg-white rounded-lg border border-zinc-200 space-y-1 text-xs">
          <div className="flex items-center gap-1.5 text-zinc-900 font-medium">
            <BookOpen className="w-3.5 h-3.5 text-zinc-500" />
            <span>Elemento:</span>
            <code className="bg-zinc-100 text-zinc-900 px-1.5 py-0.5 rounded font-mono font-bold">
              {selectedTokenInfo.token}
            </code>
            <span className="text-zinc-400">({selectedTokenInfo.label})</span>
          </div>
          <p className="text-zinc-600 text-xs leading-relaxed">
            {selectedTokenInfo.explanation}
          </p>
        </div>
      )}
    </div>
  );
};
