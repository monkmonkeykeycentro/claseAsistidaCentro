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
      className={`relative bg-[#FFFFFF] border border-[#E3E3DD] rounded-none overflow-hidden font-mono text-xs sm:text-sm ${className}`}
    >
      {/* Editor top header */}
      <div className="flex items-center justify-between px-3 sm:px-4 py-2 bg-[#F7F7F2] border-b border-[#E3E3DD] text-xs text-[#171717]">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] tracking-wider text-[#666666] uppercase">
            [PDE]
          </span>
          <span className="font-mono text-[#171717] font-semibold text-xs">
            {filename}
          </span>
        </div>
        {showCopyButton && (
          <button
            onClick={handleCopy}
            className="min-h-[36px] flex items-center gap-1.5 px-3 py-1 bg-[#FFFFFF] hover:bg-[#F7F7F2] border border-[#E3E3DD] text-[#171717] text-xs font-mono transition-colors cursor-pointer"
            title="Copiar código al portapapeles"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#2779BD]" />
                <span className="text-[#2779BD] font-semibold">COPIADO</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-[#666666]" />
                <span>COPIAR</span>
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
                className={`flex items-start transition-colors px-2 py-0.5 ${
                  isLineActive
                    ? 'bg-[#F7F7F2] border-l-2 border-[#2779BD]'
                    : isSectionActive
                    ? 'bg-[#F7F7F2]'
                    : 'hover:bg-[#F7F7F2]'
                }`}
              >
                <span className="w-8 select-none text-right pr-4 text-[#666666] text-xs font-mono">
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
      <div className="px-3 sm:px-4 py-2 bg-[#F7F7F2] border-t border-[#E3E3DD] text-[11px] text-[#666666] flex flex-wrap items-center justify-between gap-2">
        {onSelectToken ? (
          <span className="flex items-center gap-1.5 text-[#171717] font-mono">
            <Eye className="w-3.5 h-3.5 text-[#2779BD]" />
            Haz clic en una palabra para inspeccionar su sintaxis
          </span>
        ) : (
          <span className="font-mono text-[#666666]">Processing Java · PDE</span>
        )}
        
        {/* Visual syntax legend */}
        <div className="flex items-center gap-3 text-[10px] font-mono">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-[#2779BD]" />
            <span className="text-[#2779BD] font-bold">tipos/class</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-[#171717]" />
            <span className="text-[#171717] font-medium">métodos</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-[#666666]" />
            <span className="text-[#666666] font-medium">sistema</span>
          </span>
        </div>
      </div>
    </div>
  );
};
