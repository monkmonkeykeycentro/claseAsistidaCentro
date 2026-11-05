import React, { useState } from 'react';
import { GenerativeArtwork, GenerativeFamily } from './GenerativeArtwork';
import { Sliders, RefreshCw, Sparkles } from 'lucide-react';

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
    { label: 'Variación 01 · Regla Base', seed: baseSeed, colorMode: 'monochrome' as const, note: 'Rotación estándar · Desfase 0.0' },
    { label: 'Variación 02 · Acento Verde', seed: baseSeed + 47, colorMode: 'accent-blue' as const, note: 'Densidad armónica · Múltiplos de 3' },
    { label: 'Variación 03 · Desfase Cálido', seed: baseSeed + 92, colorMode: 'accent-yellow' as const, note: 'Perturbación senoidal media' },
    { label: 'Variación 04 · Ruptura Simétrica', seed: baseSeed + 143, colorMode: 'accent-red' as const, note: 'Modulación asimétrica' },
  ];

  return (
    <div className={`p-6 bg-[#FFFFFF] border border-[#DCE7F2] rounded-2xl space-y-5 shadow-xs ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#DCE7F2] pb-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-[#4A6076]">
            <span className="font-bold text-[#006699] bg-[#E2EEF8] px-2 py-0.5 rounded-md">
              FAMILIA GENERATIVA
            </span>
            <span className="text-[#DCE7F2]">/</span>
            <span className="font-medium">Sistema → Regla → Variación</span>
          </div>
          <h3 className="text-xl font-bold text-[#0C2233]">
            {title}
          </h3>
          <p className="text-xs sm:text-sm text-[#4A6076] max-w-2xl leading-relaxed">
            {systemDescription}
          </p>
        </div>

        <button
          onClick={() => setBaseSeed((prev) => prev + Math.floor(Math.random() * 50) + 1)}
          className="min-h-[38px] px-3.5 py-1.5 border border-[#DCE7F2] bg-[#FFFFFF] hover:bg-[#E2EEF8]/40 text-xs font-semibold text-[#0C2233] rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shrink-0 self-start sm:self-auto shadow-2xs"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#006699]" />
          <span>Generar nueva serie</span>
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {variations.map((v, i) => (
          <div key={i} className="flex flex-col space-y-2">
            <div className="border border-[#DCE7F2] bg-[#F4F8FB] rounded-xl p-2.5 flex items-center justify-center">
              <GenerativeArtwork
                family={family}
                seed={v.seed}
                width={180}
                height={125}
                colorMode={v.colorMode}
                interactive={true}
              />
            </div>
            <div className="space-y-0.5 text-xs">
              <span className="font-bold text-[#0C2233] text-xs block">{v.label}</span>
              <span className="text-[11px] text-[#4A6076] leading-snug block">{v.note}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
