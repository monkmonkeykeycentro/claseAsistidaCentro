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
      className={`relative bg-[#FFFFFF] border border-[#E1E7E1] rounded-2xl overflow-hidden font-mono text-xs sm:text-sm shadow-xs ${className}`}
    >
      {/* Editor top header */}
      <div className="flex items-center justify-between px-3 sm:px-4 py-2 bg-[#F7F8F4] border-b border-[#E1E7E1] text-xs text-[#232A24]">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] tracking-wider text-[#407B5D] bg-[#E8EEE8] px-2 py-0.5 rounded-full font-bold uppercase">
            PDE
          </span>
          <span className="font-mono text-[#232A24] font-semibold text-xs">
            {filename}
          </span>
        </div>
        {showCopyButton && (
          <button
            onClick={handleCopy}
            className="min-h-[34px] flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-[#E8EEE8] border border-[#E1E7E1] rounded-xl text-[#232A24] text-xs font-mono transition-colors cursor-pointer shadow-xs"
            title="Copiar código al portapapeles"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#407B5D]" />
                <span className="text-[#407B5D] font-bold">COPIADO</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-[#59645C]" />
                <span className="font-medium">COPIAR</span>
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
                className={`flex items-start transition-colors px-2 py-0.5 rounded-md ${
                  isLineActive
                    ? 'bg-[#E8EEE8]/70 border-l-2 border-[#407B5D]'
                    : isSectionActive
                    ? 'bg-[#E8EEE8]/40'
                    : 'hover:bg-[#F7F8F4]'
                }`}
              >
                <span className="w-8 select-none text-right pr-4 text-[#59645C]/60 text-xs font-mono">
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
      <div className="px-3 sm:px-4 py-2 bg-[#F7F8F4] border-t border-[#E1E7E1] text-[11px] text-[#59645C] flex flex-wrap items-center justify-between gap-2">
        {onSelectToken ? (
          <span className="flex items-center gap-1.5 text-[#232A24] font-mono">
            <Eye className="w-3.5 h-3.5 text-[#407B5D]" />
            Haz clic en una palabra para inspeccionar su sintaxis
          </span>
        ) : (
          <span className="font-mono text-[#59645C]">Processing Java · PDE</span>
        )}
        
        {/* Visual syntax legend */}
        <div className="flex items-center gap-3 text-[10px] font-mono">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#407B5D]" />
            <span className="text-[#407B5D] font-bold">tipos/class</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#232A24]" />
            <span className="text-[#232A24] font-medium">métodos</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#E6B65A]" />
            <span className="text-[#8A6318] font-medium">sistema</span>
          </span>
        </div>
      </div>
    </div>
  );
};
