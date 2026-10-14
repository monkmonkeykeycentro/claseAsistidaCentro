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

  // Simple token highlight helper for Processing Java
  const renderTokens = (line: string, lineIndex: number) => {
    // If it's a comment line
    const trimmed = line.trim();
    if (trimmed.startsWith('//')) {
      return <span className="text-slate-400 italic">{line}</span>;
    }

    // Split preserving whitespace and delimiters
    const parts = line.split(/(\s+|[{}();,=])/g);

    return parts.map((part, pIdx) => {
      if (!part) return null;

      const isSpace = /^\s+$/.test(part);
      if (isSpace) {
        return <span key={pIdx}>{part}</span>;
      }

      // Check keywords
      if (['class', 'new', 'this', 'return'].includes(part)) {
        return (
          <span
            key={pIdx}
            onClick={() => onSelectToken?.(part, 'keyword')}
            className={`font-semibold text-amber-400 cursor-pointer rounded px-0.5 hover:bg-amber-400/20 transition-colors ${
              selectedToken === part ? 'bg-amber-400/30 ring-1 ring-amber-400' : ''
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
            className={`font-semibold text-rose-400 cursor-pointer rounded px-0.5 hover:bg-rose-400/20 transition-colors ${
              selectedToken === 'void' ? 'bg-rose-400/30 ring-1 ring-rose-400' : ''
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
            className={`font-medium text-cyan-300 cursor-pointer rounded px-0.5 hover:bg-cyan-400/20 transition-colors ${
              selectedToken === part ? 'bg-cyan-400/30 ring-1 ring-cyan-400' : ''
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
                ? 'text-yellow-300 bg-yellow-400/20 ring-1 ring-yellow-400/50'
                : 'text-amber-200 hover:bg-amber-200/20'
            } ${selectedToken === part ? 'ring-2 ring-yellow-300' : ''}`}
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
            className="text-purple-300 font-semibold cursor-pointer hover:bg-purple-400/20 rounded px-0.5"
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
            className={`text-slate-400 font-bold cursor-pointer hover:text-white hover:bg-slate-700/50 rounded px-0.5 ${
              selectedToken === ';' ? 'bg-slate-700 text-white ring-1 ring-slate-400' : ''
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
            className={`text-emerald-400 font-bold cursor-pointer rounded px-1 hover:bg-emerald-400/20 ${
              selectedToken === '=' ? 'bg-emerald-400/30 ring-1 ring-emerald-400' : ''
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
            className={`text-emerald-300 font-bold cursor-pointer rounded px-0.5 hover:bg-emerald-400/20 transition-colors ${
              selectedToken === 'Gato' ? 'bg-emerald-400/30 ring-2 ring-emerald-400' : ''
            }`}
          >
            {part}
          </span>
        );
      }

      // Parameters ending with Temp or starting with paso
      if (part.endsWith('Temp') || part.startsWith('paso')) {
        return (
          <span
            key={pIdx}
            onClick={() => onSelectToken?.(part, 'param')}
            className={`text-purple-300 cursor-pointer rounded px-0.5 hover:bg-purple-400/20 ${
              selectedToken === part ? 'bg-purple-400/30 ring-1 ring-purple-400' : ''
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
            className={`text-blue-300 font-semibold cursor-pointer rounded px-0.5 hover:bg-blue-400/20 ${
              selectedToken === part ? 'bg-blue-400/30 ring-1 ring-blue-400' : ''
            }`}
          >
            {part}
          </span>
        );
      }

      // Standard identifiers (fields like nombre, x, y)
      return (
        <span
          key={pIdx}
          onClick={() => onSelectToken?.(part, 'identifier')}
          className={`text-slate-100 cursor-pointer rounded px-0.5 hover:bg-slate-700/50 ${
            selectedToken === part ? 'bg-cyan-500/20 text-cyan-200 ring-1 ring-cyan-400' : ''
          }`}
        >
          {part}
        </span>
      );
    });
  };

  return (
    <div className={`relative bg-slate-950 border border-slate-800 rounded-xl overflow-hidden font-mono text-sm ${className}`}>
      {/* Editor top header */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900/90 border-b border-slate-800 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-700" />
          <span className="w-2.5 h-2.5 rounded-full bg-slate-700" />
          <span className="w-2.5 h-2.5 rounded-full bg-slate-700" />
          <span className="ml-2 font-mono text-slate-300">Gato.pde (Processing Java)</span>
        </div>
        {showCopyButton && (
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            title="Copiar código al portapapeles"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-medium">¡Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar código</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Code body with line numbers */}
      <div className="p-4 overflow-x-auto custom-scrollbar">
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
                    ? 'bg-cyan-950/60 ring-1 ring-cyan-500/50'
                    : isSectionActive
                    ? 'bg-amber-950/40 ring-1 ring-amber-500/40'
                    : 'hover:bg-slate-900/50'
                }`}
              >
                <span className="w-8 select-none text-right pr-4 text-slate-600 text-xs font-mono">
                  {lineNum}
                </span>
                <span className="flex-1 whitespace-pre">{renderTokens(line, idx)}</span>
              </div>
            );
          })}
        </pre>
      </div>

      {/* Subtle footer hint */}
      {onSelectToken && (
        <div className="px-4 py-1.5 bg-slate-900/50 border-t border-slate-800/80 text-[11px] text-slate-500 flex items-center justify-between">
          <span className="flex items-center gap-1">
            <Eye className="w-3 h-3 text-slate-400" />
            Haz clic en cualquier palabra o símbolo para ver su explicación y relaciones
          </span>
          <span className="text-slate-400 font-mono">Sintaxis Processing Java</span>
        </div>
      )}
    </div>
  );
};
