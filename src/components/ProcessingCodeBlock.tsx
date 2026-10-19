import React, { useState } from 'react';
import { Copy, Check, Eye } from 'lucide-react';

interface ProcessingCodeBlockProps {
  code: string;
  activeLine?: number | null;
  highlightedSection?: string | null;
  onSelectToken?: (token: string, context: string) => void;
  selectedToken?: string | null;
  showCopyButton?: boolean;
  className?: string;
}

export const ProcessingCodeBlock: React.FC<ProcessingCodeBlockProps> = ({
  code,
  activeLine = null,
  highlightedSection = null,
  onSelectToken,
  selectedToken = null,
  showCopyButton = true,
  className = '',
}) => {
  const [copied, setCopied] = useState(false);
  const [hoveredBraceId, setHoveredBraceId] = useState<number | null>(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lines = code.split('\n');

  // Token rendering with elegant light-theme contrast
  const renderTokens = (line: string, lineIndex: number) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('//')) {
      return <span className="text-zinc-400 italic">{line}</span>;
    }

    const parts = line.split(/(\s+|[{}();,=])/g);

    return parts.map((part, pIdx) => {
      if (!part) return null;

      const isSpace = /^\s+$/.test(part);
      if (isSpace) {
        return <span key={pIdx}>{part}</span>;
      }

      // Keywords
      if (['class', 'new', 'this', 'return'].includes(part)) {
        return (
          <span
            key={pIdx}
            onClick={() => onSelectToken?.(part, 'keyword')}
            className={`font-semibold text-zinc-950 cursor-pointer rounded px-0.5 hover:bg-zinc-200 transition-colors ${
              selectedToken === part ? 'bg-zinc-200 ring-1 ring-zinc-500 font-bold' : ''
            }`}
          >
            {part}
          </span>
        );
      }

      // Return type void
      if (part === 'void') {
        return (
          <span
            key={pIdx}
            onClick={() => onSelectToken?.('void', 'return-type')}
            className={`font-medium italic text-zinc-800 cursor-pointer rounded px-0.5 hover:bg-zinc-200 transition-colors ${
              selectedToken === 'void' ? 'bg-zinc-200 ring-1 ring-zinc-500' : ''
            }`}
          >
            {part}
          </span>
        );
      }

      // Types
      if (['String', 'int', 'float', 'boolean', 'color'].includes(part)) {
        return (
          <span
            key={pIdx}
            onClick={() => onSelectToken?.(part, 'type')}
            className={`font-medium text-zinc-700 cursor-pointer rounded px-0.5 hover:bg-zinc-200 transition-colors ${
              selectedToken === part ? 'bg-zinc-200 ring-1 ring-zinc-500 text-zinc-950' : ''
            }`}
          >
            {part}
          </span>
        );
      }

      // Braces
      if (part === '{' || part === '}') {
        return (
          <span
            key={pIdx}
            onMouseEnter={() => setHoveredBraceId(lineIndex)}
            onMouseLeave={() => setHoveredBraceId(null)}
            onClick={() => onSelectToken?.(part, 'brace')}
            className={`font-bold cursor-pointer rounded px-0.5 transition-colors ${
              hoveredBraceId !== null
                ? 'bg-zinc-200 ring-1 ring-zinc-400 text-zinc-950'
                : 'text-zinc-800 hover:bg-zinc-200'
            } ${selectedToken === part ? 'ring-1 ring-zinc-600 bg-zinc-200 text-zinc-950' : ''}`}
          >
            {part}
          </span>
        );
      }

      // Parentheses
      if (part === '(' || part === ')') {
        return (
          <span
            key={pIdx}
            onClick={() => onSelectToken?.(part, 'parenthesis')}
            className={`text-zinc-600 font-semibold cursor-pointer hover:bg-zinc-200 rounded px-0.5 ${
              selectedToken === part ? 'bg-zinc-200 ring-1 ring-zinc-500' : ''
            }`}
          >
            {part}
          </span>
        );
      }

      // Semicolon
      if (part === ';') {
        return (
          <span
            key={pIdx}
            onClick={() => onSelectToken?.(';', 'semicolon')}
            className={`text-zinc-500 font-bold cursor-pointer hover:text-zinc-900 hover:bg-zinc-200 rounded px-0.5 ${
              selectedToken === ';' ? 'bg-zinc-200 ring-1 ring-zinc-500 text-zinc-950' : ''
            }`}
          >
            {part}
          </span>
        );
      }

      // Operator
      if (part === '=') {
        return (
          <span
            key={pIdx}
            onClick={() => onSelectToken?.('=', 'operator')}
            className={`text-zinc-950 font-bold cursor-pointer rounded px-1 hover:bg-zinc-200 ${
              selectedToken === '=' ? 'bg-zinc-200 ring-1 ring-zinc-500' : ''
            }`}
          >
            {part}
          </span>
        );
      }

      // Class / Constructor name
      if (part === 'Gato') {
        return (
          <span
            key={pIdx}
            onClick={() => onSelectToken?.('Gato', 'class-constructor-name')}
            className={`text-zinc-950 font-bold cursor-pointer rounded px-0.5 hover:bg-zinc-200 transition-colors ${
              selectedToken === 'Gato' ? 'bg-zinc-200 ring-1 ring-zinc-600' : ''
            }`}
          >
            {part}
          </span>
        );
      }

      // Parameters
      if (part.endsWith('Temp') || part.startsWith('paso')) {
        return (
          <span
            key={pIdx}
            onClick={() => onSelectToken?.(part, 'param')}
            className={`text-zinc-700 cursor-pointer rounded px-0.5 hover:bg-zinc-200 ${
              selectedToken === part ? 'bg-zinc-200 ring-1 ring-zinc-500 text-zinc-950' : ''
            }`}
          >
            {part}
          </span>
        );
      }

      // Methods
      if (['dibujar', 'caminar'].includes(part)) {
        return (
          <span
            key={pIdx}
            onClick={() => onSelectToken?.(part, 'method-name')}
            className={`text-zinc-950 font-semibold cursor-pointer rounded px-0.5 hover:bg-zinc-200 ${
              selectedToken === part ? 'bg-zinc-200 ring-1 ring-zinc-500' : ''
            }`}
          >
            {part}
          </span>
        );
      }

      // Standard identifiers
      return (
        <span
          key={pIdx}
          onClick={() => onSelectToken?.(part, 'identifier')}
          className={`text-zinc-800 cursor-pointer rounded px-0.5 hover:bg-zinc-200 ${
            selectedToken === part ? 'bg-zinc-200 text-zinc-950 ring-1 ring-zinc-500' : ''
          }`}
        >
          {part}
        </span>
      );
    });
  };

  return (
    <div
      className={`relative bg-[#fcfcfd] border border-zinc-200 rounded-xl overflow-hidden font-mono text-xs sm:text-sm ${className}`}
    >
      {/* Editor top header */}
      <div className="flex items-center justify-between px-4 py-2 bg-zinc-50 border-b border-zinc-200 text-xs text-zinc-500">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-zinc-300" />
          <span className="w-2 h-2 rounded-full bg-zinc-300" />
          <span className="w-2 h-2 rounded-full bg-zinc-300" />
          <span className="ml-2 font-mono text-zinc-600 text-[11px] sm:text-xs">
            Gato.pde
          </span>
        </div>
        {showCopyButton && (
          <button
            onClick={handleCopy}
            className="min-h-[44px] flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-zinc-100 border border-zinc-200 text-zinc-700 text-xs transition-colors"
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
      <div className="p-4 sm:p-5 overflow-x-auto custom-scrollbar">
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
                    ? 'bg-zinc-100 ring-1 ring-zinc-300'
                    : isSectionActive
                    ? 'bg-zinc-100/80 ring-1 ring-zinc-300'
                    : 'hover:bg-zinc-100/50'
                }`}
              >
                <span className="w-8 select-none text-right pr-4 text-zinc-400 text-xs font-mono">
                  {lineNum}
                </span>
                <span className="flex-1 whitespace-pre">{renderTokens(line, idx)}</span>
              </div>
            );
          })}
        </pre>
      </div>

      {/* Footer hint */}
      {onSelectToken && (
        <div className="px-4 py-2 bg-zinc-50 border-t border-zinc-200 text-[11px] text-zinc-500 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Eye className="w-3 h-3 text-zinc-400" />
            Haz clic en un elemento para ver su función
          </span>
          <span className="text-zinc-400 font-mono hidden sm:inline">Processing Java</span>
        </div>
      )}
    </div>
  );
};
