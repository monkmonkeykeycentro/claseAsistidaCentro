import React from 'react';
import { ArrowRight, Sparkles, BookOpen, Layers } from 'lucide-react';

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
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-semibold text-slate-100">
            Relaciones Visuales y Análisis Sintáctico
          </h3>
        </div>
        <span className="text-xs text-slate-400">Guía interactiva</span>
      </div>

      {/* Preset interactive relationship selector tabs */}
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={() => onSelectRelation?.('assignment')}
          className={`px-3 py-2 text-xs rounded-lg text-left transition-all border ${
            activeRelation === 'assignment'
              ? 'bg-cyan-950/70 border-cyan-500/60 text-cyan-200'
              : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:text-white'
          }`}
        >
          <div className="font-medium">1. Asignación</div>
          <div className="text-[11px] opacity-75 font-mono truncate">nombre = nombreTemp;</div>
        </button>

        <button
          onClick={() => onSelectRelation?.('constructor-match')}
          className={`px-3 py-2 text-xs rounded-lg text-left transition-all border ${
            activeRelation === 'constructor-match'
              ? 'bg-amber-950/70 border-amber-500/60 text-amber-200'
              : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:text-white'
          }`}
        >
          <div className="font-medium">2. Constructor</div>
          <div className="text-[11px] opacity-75 font-mono truncate">class Gato ↔ Gato()</div>
        </button>

        <button
          onClick={() => onSelectRelation?.('method-structure')}
          className={`px-3 py-2 text-xs rounded-lg text-left transition-all border ${
            activeRelation === 'method-structure'
              ? 'bg-purple-950/70 border-purple-500/60 text-purple-200'
              : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:text-white'
          }`}
        >
          <div className="font-medium">3. Método</div>
          <div className="text-[11px] opacity-75 font-mono truncate">void caminar(...)</div>
        </button>
      </div>

      {/* Active Relationship Render */}
      {activeRelation === 'assignment' && (
        <div className="space-y-3 bg-slate-950/70 p-4 rounded-xl border border-slate-800">
          <div className="text-xs font-semibold text-cyan-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Flujo de asignación en el constructor
          </div>

          {/* Interactive Visual Breakdown */}
          <div className="flex flex-wrap items-center justify-center gap-2 py-3 bg-slate-900 rounded-lg border border-slate-800 font-mono text-sm">
            <div className="flex flex-col items-center p-2 rounded bg-cyan-950/60 border border-cyan-500/40">
              <span className="text-xs text-cyan-400 font-sans font-medium mb-1">Atributo</span>
              <span className="text-cyan-200 font-bold px-2 py-0.5 bg-cyan-900/40 rounded">nombre</span>
              <span className="text-[10px] text-slate-400 font-sans mt-1">Variable del objeto</span>
            </div>

            <div className="flex flex-col items-center px-1">
              <span className="text-emerald-400 font-bold text-lg">=</span>
              <span className="text-[10px] text-emerald-400 font-sans">Asigna</span>
            </div>

            <div className="flex flex-col items-center p-2 rounded bg-purple-950/60 border border-purple-500/40">
              <span className="text-xs text-purple-400 font-sans font-medium mb-1">Parámetro</span>
              <span className="text-purple-200 font-bold px-2 py-0.5 bg-purple-900/40 rounded">nombreTemp</span>
              <span className="text-[10px] text-slate-400 font-sans mt-1">Dato recibido</span>
            </div>

            <div className="text-slate-400 font-bold text-base px-1">;</div>
          </div>

          <div className="p-3 bg-cyan-950/30 border border-cyan-800/40 rounded-lg text-xs leading-relaxed text-cyan-100">
            <strong className="text-cyan-300">Explicación:</strong> &ldquo;El valor recibido en <code className="bg-purple-900/50 text-purple-200 px-1 py-0.5 rounded">nombreTemp</code> se asigna al atributo <code className="bg-cyan-900/50 text-cyan-200 px-1 py-0.5 rounded">nombre</code>&rdquo;. En Java, la asignación siempre viaja de <strong>derecha a izquierda</strong>: el valor que viene de fuera se deposita en la memoria permanente del gato.
          </div>
        </div>
      )}

      {activeRelation === 'constructor-match' && (
        <div className="space-y-3 bg-slate-950/70 p-4 rounded-xl border border-slate-800">
          <div className="text-xs font-semibold text-amber-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Coincidencia obligatoria de nombre
          </div>

          <div className="flex items-center justify-center gap-3 py-3 bg-slate-900 rounded-lg border border-slate-800 font-mono text-sm">
            <div className="p-2.5 rounded bg-emerald-950/60 border border-emerald-500/40 text-center">
              <div className="text-[11px] text-emerald-400 font-sans">Nombre de la clase</div>
              <div className="text-emerald-200 font-bold text-base">class Gato</div>
            </div>

            <div className="flex flex-col items-center text-amber-400">
              <span className="text-xs font-sans font-semibold">Exacto</span>
              <ArrowRight className="w-4 h-4 my-0.5" />
            </div>

            <div className="p-2.5 rounded bg-amber-950/60 border border-amber-500/40 text-center">
              <div className="text-[11px] text-amber-400 font-sans">Nombre del constructor</div>
              <div className="text-amber-200 font-bold text-base">Gato(...)</div>
            </div>
          </div>

          <div className="p-3 bg-amber-950/30 border border-amber-800/40 rounded-lg text-xs leading-relaxed text-amber-100 space-y-1">
            <p>
              <strong className="text-amber-300">Regla estricta:</strong> El constructor debe tener <strong>exactamente el mismo nombre</strong> que la clase (mismas mayúsculas y minúsculas).
            </p>
            <p className="text-amber-200/90">
              <strong>Sin tipo de retorno:</strong> El constructor <strong>no lleva tipo de retorno, tampoco void</strong>. Nunca escribas <code className="text-rose-300 line-through">void Gato()</code> ni <code className="text-rose-300 line-through">int Gato()</code>.
            </p>
          </div>
        </div>
      )}

      {activeRelation === 'method-structure' && (
        <div className="space-y-3 bg-slate-950/70 p-4 rounded-xl border border-slate-800">
          <div className="text-xs font-semibold text-purple-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Anatomía del método caminar
          </div>

          <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 font-mono text-xs space-y-2">
            <div className="text-slate-300 font-semibold">
              <span className="text-rose-400 px-1 py-0.5 rounded bg-rose-950/60 border border-rose-500/30">void</span>{' '}
              <span className="text-blue-300 px-1 py-0.5 rounded bg-blue-950/60 border border-blue-500/30">caminar</span>(
              <span className="text-purple-300 px-1 py-0.5 rounded bg-purple-950/60 border border-purple-500/30">int pasoX</span>,{' '}
              <span className="text-purple-300 px-1 py-0.5 rounded bg-purple-950/60 border border-purple-500/30">int pasoY</span>){' '}
              <span className="text-amber-300 font-bold">{'{'}</span>
            </div>
            <div className="pl-4 text-slate-500 italic font-mono text-[11px]">
              // Instrucciones del método...
            </div>
            <div className="text-amber-300 font-bold">{'}'}</div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 bg-slate-950 rounded border border-slate-800">
              <span className="font-semibold text-rose-300">void:</span>
              <p className="text-slate-400 text-[11px] mt-0.5">Indica que el método ejecuta una acción pero no devuelve un valor resultante.</p>
            </div>
            <div className="p-2 bg-slate-950 rounded border border-slate-800">
              <span className="font-semibold text-blue-300">caminar:</span>
              <p className="text-slate-400 text-[11px] mt-0.5">Nombre descriptivo de la acción en camelCase.</p>
            </div>
            <div className="p-2 bg-slate-950 rounded border border-slate-800">
              <span className="font-semibold text-purple-300">int pasoX, int pasoY:</span>
              <p className="text-slate-400 text-[11px] mt-0.5">Parámetros que especifican cuánto avanzará en cada eje.</p>
            </div>
            <div className="p-2 bg-slate-950 rounded border border-slate-800">
              <span className="font-semibold text-amber-300">{'{ }'} Llaves:</span>
              <p className="text-slate-400 text-[11px] mt-0.5">Delimitan el cuerpo y el bloque de instrucciones del método.</p>
            </div>
          </div>
        </div>
      )}

      {/* Selected Token Inspector */}
      {selectedTokenInfo && (
        <div className="p-3 bg-slate-950 rounded-lg border border-cyan-800/60 space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-cyan-300 font-semibold">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Elemento seleccionado:</span>
            <code className="bg-cyan-900/40 text-cyan-100 px-1.5 py-0.5 rounded font-mono font-bold">
              {selectedTokenInfo.token}
            </code>
            <span className="text-slate-400 font-normal">({selectedTokenInfo.label})</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {selectedTokenInfo.explanation}
          </p>
        </div>
      )}
    </div>
  );
};
