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
    <div className="bg-[#F4F8FB] border border-[#DCE7F2] rounded-2xl p-4 sm:p-5 space-y-4 shadow-xs">
      <div className="flex items-center justify-between border-b border-[#DCE7F2] pb-2.5">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#006699]" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#0C2233]">
            Relaciones clave
          </h3>
        </div>
        <span className="text-[11px] text-[#4A6076] font-mono">3 conceptos</span>
      </div>

      {/* Preset tabs with 44px touch height */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <button
          onClick={() => onSelectRelation?.('assignment')}
          className={`min-h-[44px] px-3.5 py-2 text-xs rounded-xl text-left transition-colors border cursor-pointer ${
            activeRelation === 'assignment'
              ? 'bg-[#006699] border-[#006699] text-white font-bold shadow-xs'
              : 'bg-white border-[#DCE7F2] text-[#0C2233] hover:bg-[#E2EEF8]'
          }`}
        >
          <div className="font-bold">Asignación</div>
          <div className="text-[10px] font-mono opacity-85 truncate">nombre = nombreTemp;</div>
        </button>

        <button
          onClick={() => onSelectRelation?.('constructor-match')}
          className={`min-h-[44px] px-3.5 py-2 text-xs rounded-xl text-left transition-colors border cursor-pointer ${
            activeRelation === 'constructor-match'
              ? 'bg-[#006699] border-[#006699] text-white font-bold shadow-xs'
              : 'bg-white border-[#DCE7F2] text-[#0C2233] hover:bg-[#E2EEF8]'
          }`}
        >
          <div className="font-bold">Constructor</div>
          <div className="text-[10px] font-mono opacity-85 truncate">class Gato ↔ Gato()</div>
        </button>

        <button
          onClick={() => onSelectRelation?.('method-structure')}
          className={`min-h-[44px] px-3.5 py-2 text-xs rounded-xl text-left transition-colors border cursor-pointer ${
            activeRelation === 'method-structure'
              ? 'bg-[#006699] border-[#006699] text-white font-bold shadow-xs'
              : 'bg-white border-[#DCE7F2] text-[#0C2233] hover:bg-[#E2EEF8]'
          }`}
        >
          <div className="font-bold">Método</div>
          <div className="text-[10px] font-mono opacity-85 truncate">void caminar(...)</div>
        </button>
      </div>

      {/* Active Relationship Render */}
      {activeRelation === 'assignment' && (
        <div className="space-y-3 bg-white p-4 rounded-xl border border-[#DCE7F2] text-xs shadow-xs">
          <div className="font-bold text-[#0C2233]">
            Flujo de asignación en el constructor
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 py-3 bg-[#F4F8FB] rounded-xl border border-[#DCE7F2] font-mono text-xs">
            <div className="flex flex-col items-center p-2 rounded-lg bg-white border border-[#DCE7F2] shadow-xs">
              <span className="text-[10px] text-[#4A6076] font-sans mb-0.5">Atributo</span>
              <span className="text-[#0C2233] font-bold px-2 py-0.5">nombre</span>
              <span className="text-[10px] text-[#006699] font-sans font-semibold">Destino</span>
            </div>

            <div className="flex flex-col items-center px-1">
              <span className="text-[#006699] font-bold text-base">=</span>
              <span className="text-[10px] text-[#4A6076] font-sans">recibe</span>
            </div>

            <div className="flex flex-col items-center p-2 rounded-lg bg-white border border-[#DCE7F2] shadow-xs">
              <span className="text-[10px] text-[#4A6076] font-sans mb-0.5">Parámetro</span>
              <span className="text-[#0C2233] font-bold px-2 py-0.5">nombreTemp</span>
              <span className="text-[10px] text-[#8A6318] font-sans font-semibold">Origen</span>
            </div>

            <div className="text-[#4A6076] font-bold text-sm px-1">;</div>
          </div>

          <p className="text-[#4A6076] leading-relaxed text-[11px]">
            El valor recibido en <code className="text-[#0C2233] font-mono bg-[#E2EEF8] px-1 py-0.5 rounded">nombreTemp</code> se asigna al atributo <code className="text-[#0C2233] font-mono bg-[#E2EEF8] px-1 py-0.5 rounded">nombre</code>. La asignación viaja de <strong>derecha a izquierda</strong>.
          </p>
        </div>
      )}

      {activeRelation === 'constructor-match' && (
        <div className="space-y-3 bg-white p-4 rounded-xl border border-[#DCE7F2] text-xs shadow-xs">
          <div className="font-bold text-[#0C2233]">
            Coincidencia exacta de nombre
          </div>

          <div className="flex items-center justify-center gap-3 py-3 bg-[#F4F8FB] rounded-xl border border-[#DCE7F2] font-mono text-xs">
            <div className="p-2.5 rounded-lg bg-white border border-[#DCE7F2] text-center shadow-xs">
              <div className="text-[10px] text-[#4A6076] font-sans">Nombre de la clase</div>
              <div className="text-[#0C2233] font-bold">class Gato</div>
            </div>

            <div className="flex flex-col items-center text-[#4A6076]">
              <span className="text-[10px] font-sans font-medium">Igual</span>
              <ArrowRight className="w-3.5 h-3.5 my-0.5 text-[#006699]" />
            </div>

            <div className="p-2.5 rounded-lg bg-white border border-[#DCE7F2] text-center shadow-xs">
              <div className="text-[10px] text-[#4A6076] font-sans">Nombre del constructor</div>
              <div className="text-[#0C2233] font-bold">Gato(...)</div>
            </div>
          </div>

          <div className="text-[#4A6076] leading-relaxed text-[11px] space-y-1">
            <p>
              El constructor lleva <strong>exactamente el mismo nombre</strong> que la clase.
            </p>
            <p className="text-[#0C2233]">
              <strong>Sin tipo de retorno:</strong> El constructor no lleva ningún tipo, <strong>tampoco void</strong>.
            </p>
          </div>
        </div>
      )}

      {activeRelation === 'method-structure' && (
        <div className="space-y-3 bg-white p-4 rounded-xl border border-[#DCE7F2] text-xs shadow-xs">
          <div className="font-bold text-[#0C2233]">
            Anatomía de un método
          </div>

          <div className="p-3 bg-[#F4F8FB] rounded-xl border border-[#DCE7F2] font-mono text-xs space-y-1">
            <div className="text-[#0C2233] font-semibold">
              <span className="text-[#006699] italic font-bold">void</span>{' '}
              <span className="text-[#0C2233]">caminar</span>(
              <span className="text-[#4A6076]">int pasoX</span>,{' '}
              <span className="text-[#4A6076]">int pasoY</span>){' '}
              <span className="text-[#0C2233] font-bold">{'{'}</span>
            </div>
            <div className="pl-4 text-[#4A6076] italic font-mono text-[11px]">
              // Instrucciones del método...
            </div>
            <div className="text-[#0C2233] font-bold">{'}'}</div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
            <div className="p-2.5 bg-[#F4F8FB] rounded-lg border border-[#DCE7F2]">
              <span className="font-bold text-[#006699] block mb-0.5">void</span>
              <p className="text-[#4A6076]">Acción sin retorno de valor.</p>
            </div>
            <div className="p-2.5 bg-[#F4F8FB] rounded-lg border border-[#DCE7F2]">
              <span className="font-bold text-[#0C2233] block mb-0.5">caminar</span>
              <p className="text-[#4A6076]">Nombre de la acción (camelCase).</p>
            </div>
            <div className="p-2.5 bg-[#F4F8FB] rounded-lg border border-[#DCE7F2]">
              <span className="font-bold text-[#0C2233] block mb-0.5">Parámetros</span>
              <p className="text-[#4A6076]">Tipo y nombre de los datos que requiere.</p>
            </div>
            <div className="p-2.5 bg-[#F4F8FB] rounded-lg border border-[#DCE7F2]">
              <span className="font-bold text-[#0C2233] block mb-0.5">{'{ }'} Llaves</span>
              <p className="text-[#4A6076]">Delimitan las instrucciones.</p>
            </div>
          </div>
        </div>
      )}

      {/* Selected Token Inspector */}
      {selectedTokenInfo && (
        <div className="p-3 bg-white rounded-xl border border-[#DCE7F2] space-y-1 text-xs shadow-xs">
          <div className="flex items-center gap-1.5 text-[#0C2233] font-semibold">
            <BookOpen className="w-3.5 h-3.5 text-[#006699]" />
            <span>Elemento:</span>
            <code className="bg-[#E2EEF8] text-[#006699] px-1.5 py-0.5 rounded font-mono font-bold">
              {selectedTokenInfo.token}
            </code>
            <span className="text-[#4A6076]">({selectedTokenInfo.label})</span>
          </div>
          <p className="text-[#4A6076] text-xs leading-relaxed">
            {selectedTokenInfo.explanation}
          </p>
        </div>
      )}
    </div>
  );
};
