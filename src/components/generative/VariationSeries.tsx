import React, { useState } from 'react';
import { GenerativeArtwork, GenerativeFamily } from './GenerativeArtwork';
import { Sliders, RefreshCw } from 'lucide-react';

interface VariationSeriesProps {
  title?: string;
  systemDescription?: string;
  family?: GenerativeFamily;
  className?: string;
}

export const VariationSeries: React.FC<VariationSeriesProps> = ({
  title = 'Serie de Variaciones Paramétricas',
  systemDescription = 'Un mismo sistema algorítmico ejecutado con 4 estados de parámetros independientes (densidad, rotación, escala y desfase temporal).',
  family = 'repetition',
  className = '',
}) => {
  const [baseSeed, setBaseSeed] = useState<number>(101);

  const variations = [
    { label: 'Var. 01 · Regla Base', seed: baseSeed, colorMode: 'monochrome' as const, note: 'Rotación estándar · Desfase 0.0' },
    { label: 'Var. 02 · Acento Azul', seed: baseSeed + 47, colorMode: 'accent-blue' as const, note: 'Densidad armónica · Acento en múltiplos de 3' },
    { label: 'Var. 03 · Desfase Ámbar', seed: baseSeed + 92, colorMode: 'accent-yellow' as const, note: 'Perturbación senoidal · Frecuencia media' },
    { label: 'Var. 04 · Umbral Rojo', seed: baseSeed + 143, colorMode: 'accent-red' as const, note: 'Ruptura de simetría · Acento crítico' },
  ];

  return (
    <div className={`p-6 bg-[#FFFFFF] border border-[#DEDDD7] space-y-5 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#DEDDD7] pb-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-[#626262]">
            <span className="font-bold text-[#141414] uppercase tracking-wider">FAMILIA E</span>
            <span className="text-[#DEDDD7]">/</span>
            <span>Sistema → Regla → Variación</span>
          </div>
          <h3 className="text-lg font-semibold text-[#141414] font-sans">
            {title}
          </h3>
          <p className="text-xs text-[#626262] font-sans max-w-2xl">
            {systemDescription}
          </p>
        </div>

        <button
          onClick={() => setBaseSeed((prev) => prev + Math.floor(Math.random() * 50) + 1)}
          className="min-h-[38px] px-3.5 py-1.5 border border-[#DEDDD7] bg-[#FFFFFF] hover:bg-[#F7F6F1] text-xs font-mono text-[#141414] flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#2868D9]" />
          <span>Generar nueva serie</span>
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {variations.map((v, i) => (
          <div key={i} className="flex flex-col space-y-2">
            <div className="border border-[#DEDDD7] bg-[#FFFFFF] p-2 flex items-center justify-center">
              <GenerativeArtwork
                family={family}
                seed={v.seed}
                width={180}
                height={125}
                colorMode={v.colorMode}
                interactive={true}
              />
            </div>
            <div className="space-y-0.5 font-mono text-xs">
              <span className="font-semibold text-[#141414] text-[11px] block">{v.label}</span>
              <span className="text-[10px] text-[#626262] leading-tight block">{v.note}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
