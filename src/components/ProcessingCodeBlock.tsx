import React, { useState } from 'react';
import { Copy, Check, Eye, Code2 } from 'lucide-react';
import { renderProcessingLine } from '../utils/processingSyntax';

interface ProcessingCodeBlockProps {
  code: string;
  codeP5?: string;
  codeJava?: string;
  defaultLanguage?: 'p5' | 'processing';
  activeLine?: number | null;
  highlightedSection?: string | null;
  onSelectToken?: (token: string, context: string) => void;
  selectedToken?: string | null;
  showCopyButton?: boolean;
  className?: string;
  filename?: string;
  caption?: string;
}

export const ProcessingCodeBlock: React.FC<ProcessingCodeBlockProps> = ({
  code,
  codeP5,
  codeJava,
  defaultLanguage = 'processing',
  activeLine = null,
  highlightedSection = null,
  onSelectToken,
  selectedToken = null,
  showCopyButton = true,
  className = '',
  filename,
  caption,
}) => {
  const [copied, setCopied] = useState(false);
  const [hoveredBraceId, setHoveredBraceId] = useState<number | null>(null);

  // Determine available code representations
  const hasP5 = Boolean(codeP5 && codeP5.trim().length > 0);
  const hasJava = Boolean(codeJava && codeJava.trim().length > 0);
  
  // Decide initial language (Processing Java as primary displayed code)
  const [activeLang, setActiveLang] = useState<'p5' | 'processing'>(() => {
    if (defaultLanguage === 'processing') return 'processing';
    if (hasJava && !hasP5) return 'processing';
    if (defaultLanguage === 'p5' && hasP5) return 'p5';
    if (hasJava) return 'processing';
    if (code.includes('createCanvas') || code.includes('function setup') || code.includes('function draw')) {
      return 'p5';
    }
    return 'processing';
  });

  // Select active code content
  const currentCode =
    activeLang === 'p5'
      ? (codeP5 || code)
      : (codeJava || code);

  const displayFilename =
    filename || (activeLang === 'p5' ? 'sketch.js' : 'sketch.pde');

  const handleCopy = () => {
    navigator.clipboard.writeText(currentCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lines = currentCode.split('\n');

  return (
    <div
      className={`relative bg-[#FFFFFF] border border-[#DCE7F2] rounded-2xl overflow-hidden font-mono text-xs sm:text-sm shadow-xs ${className}`}
    >
      {/* Editor top header — Dual Language Tabs (p5.js vs Processing Java) */}
      <div className="flex flex-wrap items-center justify-between px-3 sm:px-4 py-2.5 bg-[#F4F8FB] border-b border-[#DCE7F2] text-xs text-[#0C2233] gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Language Switcher Tabs */}
          {(hasP5 || hasJava || code) && (
            <div className="flex items-center bg-[#E2EEF8] p-0.5 rounded-xl border border-[#DCE7F2]">
              <button
                onClick={() => setActiveLang('p5')}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeLang === 'p5'
                    ? 'bg-[#006699] text-white shadow-xs'
                    : 'text-[#4A6076] hover:text-[#0C2233]'
                }`}
                title="Ver código interactivo en p5.js (JavaScript)"
              >
                <span>p5.js</span>
                <span className="text-[10px] font-normal opacity-85 hidden sm:inline">(JavaScript)</span>
              </button>

              <button
                onClick={() => setActiveLang('processing')}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeLang === 'processing'
                    ? 'bg-[#006699] text-white shadow-xs'
                    : 'text-[#4A6076] hover:text-[#0C2233]'
                }`}
                title="Ver código en Processing Java (.pde)"
              >
                <span>Processing</span>
                <span className="text-[10px] font-normal opacity-85 hidden sm:inline">(Java)</span>
              </button>
            </div>
          )}

          <span className="text-[#DCE7F2]">·</span>
          <span className="font-mono text-[#0C2233] font-semibold text-xs">
            {displayFilename}
          </span>
        </div>

        {showCopyButton && (
          <button
            onClick={handleCopy}
            className="min-h-[32px] flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-[#E2EEF8] border border-[#DCE7F2] rounded-xl text-[#0C2233] text-xs font-mono transition-colors cursor-pointer shadow-xs"
            title={`Copiar código ${activeLang === 'p5' ? 'p5.js' : 'Processing Java'} al portapapeles`}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#006699]" />
                <span className="text-[#006699] font-bold">COPIADO</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-[#4A6076]" />
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
                    ? 'bg-[#E2EEF8]/70 border-l-2 border-[#006699]'
                    : isSectionActive
                    ? 'bg-[#E2EEF8]/40'
                    : 'hover:bg-[#F4F8FB]'
                }`}
              >
                <span className="w-8 select-none text-right pr-4 text-[#4A6076]/60 text-xs font-mono">
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

      {/* Footer with language indicator and syntax guide */}
      <div className="px-3 sm:px-4 py-2 bg-[#F4F8FB] border-t border-[#DCE7F2] text-[11px] text-[#4A6076] flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Code2 className="w-3.5 h-3.5 text-[#006699]" />
          <span className="font-mono text-[#0C2233] font-semibold">
            {activeLang === 'p5' ? 'Modo p5.js (JavaScript en navegador)' : 'Modo Processing Java (.pde)'}
          </span>
          {activeLang === 'p5' && !hasJava && (
            <span className="text-[10px] text-[#4A6076] hidden sm:inline">
              · Puedes añadir la versión en Java desde el CMS
            </span>
          )}
        </div>

        {/* Visual syntax legend */}
        <div className="flex items-center gap-3 text-[10px] font-mono">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#006699]" />
            <span className="text-[#006699] font-bold">funciones/tipos</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#0C2233]" />
            <span className="text-[#0C2233] font-medium">métodos</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#E5A93C]" />
            <span className="text-[#9A6700] font-medium">variables/números</span>
          </span>
        </div>
      </div>
    </div>
  );
};
