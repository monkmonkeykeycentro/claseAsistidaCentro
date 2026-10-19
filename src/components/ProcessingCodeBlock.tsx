import React, { useState } from 'react';
import { Copy, Check, Eye } from 'lucide-react';
import { renderProcessingLine } from '../utils/processingSyntax';

interface ProcessingCodeBlockProps {
  code: string;
  activeLine?: number | null;
  highlightedSection?: string | null;
  onSelectToken?: (token: string, context: string) => void;
  selectedToken?: string | null;
  showCopyButton?: boolean;
  className?: string;
  filename?: string;
}

export const ProcessingCodeBlock: React.FC<ProcessingCodeBlockProps> = ({
  code,
  activeLine = null,
  highlightedSection = null,
  onSelectToken,
  selectedToken = null,
  showCopyButton = true,
  className = '',
  filename = 'Gato.pde',
}) => {
  const [copied, setCopied] = useState(false);
  const [hoveredBraceId, setHoveredBraceId] = useState<number | null>(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lines = code.split('\n');

  return (
    <div
      className={`relative bg-[#ffffff] border border-zinc-200 rounded-xl overflow-hidden font-mono text-xs sm:text-sm shadow-xs ${className}`}
    >
      {/* Editor top header */}
      <div className="flex items-center justify-between px-4 py-2 bg-zinc-50 border-b border-zinc-200 text-xs text-zinc-500">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-zinc-300" />
          <span className="w-2.5 h-2.5 rounded-full bg-zinc-300" />
          <span className="w-2.5 h-2.5 rounded-full bg-zinc-300" />
          <span className="ml-2 font-mono text-zinc-700 font-medium text-[11px] sm:text-xs">
            {filename}
          </span>
        </div>
        {showCopyButton && (
          <button
            onClick={handleCopy}
            className="min-h-[44px] flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-zinc-100 border border-zinc-200 text-zinc-700 text-xs font-medium transition-colors"
            title="Copiar código al portapapeles"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-zinc-900" />
                <span className="text-zinc-900 font-medium">Copiado</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-zinc-500" />
                <span>Copiar</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Code body with line numbers */}
      <div className="p-4 sm:p-5 overflow-x-auto custom-scrollbar bg-white">
        <pre className="leading-relaxed">
          {lines.map((line, idx) => {
            const lineNum = idx + 1;
            const isLineActive = activeLine === lineNum;
            const isSectionActive =
              highlightedSection &&
              line.toLowerCase().includes(highlightedSection.toLowerCase());

            return (
              <div
                key={idx}
                className={`flex items-start transition-colors px-2 py-0.5 rounded ${
                  isLineActive
                    ? 'bg-amber-50/60 ring-1 ring-amber-300'
                    : isSectionActive
                    ? 'bg-zinc-50 ring-1 ring-zinc-200'
                    : 'hover:bg-zinc-50/80'
                }`}
              >
                <span className="w-8 select-none text-right pr-4 text-zinc-300 text-xs font-mono">
                  {lineNum}
                </span>
                <span className="flex-1 whitespace-pre">
                  {renderProcessingLine(line, idx, {
                    activeLine,
                    highlightedSection,
                    onSelectToken,
                    selectedToken,
                    hoveredBraceId,
                    onHoverBrace: setHoveredBraceId,
                  })}
                </span>
              </div>
            );
          })}
        </pre>
      </div>

      {/* Footer with Processing Java syntax guide */}
      <div className="px-4 py-2.5 bg-zinc-50 border-t border-zinc-200 text-[11px] text-zinc-500 flex flex-wrap items-center justify-between gap-2">
        {onSelectToken ? (
          <span className="flex items-center gap-1.5 text-zinc-600">
            <Eye className="w-3.5 h-3.5 text-zinc-400" />
            Haz clic en una palabra para inspeccionar su sintaxis
          </span>
        ) : (
          <span className="font-mono text-zinc-400">Processing Java PDE</span>
        )}
        
        {/* Visual syntax legend */}
        <div className="flex items-center gap-3 text-[10px] font-mono">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#E2661A]" />
            <span className="text-[#E2661A] font-bold">reservadas/tipos</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#006699]" />
            <span className="text-[#006699] font-medium">funciones</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#718A00]" />
            <span className="text-[#718A00] font-medium">sistema</span>
          </span>
        </div>
      </div>
    </div>
  );
};
