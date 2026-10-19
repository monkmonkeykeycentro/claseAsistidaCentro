import React from 'react';

/**
 * Processing Java Official Palette:
 * - Keywords (KEYWORD1): #E2661A (Processing Orange, font-weight: bold)
 * - Types (DATA_TYPE): #E2661A (Processing Orange, font-weight: bold)
 * - Built-in & standard functions (KEYWORD2): #006699 (Processing Cyan/Blue)
 * - System variables, constants & literals (KEYWORD3): #718A00 (Processing Green/Olive)
 * - Strings & Chars: #7D4793 (Processing Violet/Purple)
 * - Comments: #7E7E7E (Processing Gray, italic)
 * - Braces / Operators: #18181b
 * - Default Text / Identifiers: #18181b
 */

export const PROCESSING_KEYWORDS = new Set([
  'class',
  'void',
  'new',
  'this',
  'return',
  'if',
  'else',
  'for',
  'while',
  'public',
  'private',
  'protected',
  'extends',
  'implements',
  'super',
  'final',
  'import',
  'break',
  'continue',
  'switch',
  'case',
  'default',
]);

export const PROCESSING_TYPES = new Set([
  'int',
  'float',
  'boolean',
  'char',
  'byte',
  'color',
  'String',
  'PImage',
  'PVector',
  'PFont',
  'PShape',
  'Table',
  'XML',
  'long',
  'double',
]);

export const PROCESSING_FUNCTIONS = new Set([
  'setup',
  'draw',
  'size',
  'background',
  'fill',
  'noFill',
  'stroke',
  'noStroke',
  'strokeWeight',
  'rect',
  'ellipse',
  'circle',
  'square',
  'line',
  'point',
  'triangle',
  'quad',
  'arc',
  'println',
  'print',
  'random',
  'dist',
  'map',
  'constrain',
  'min',
  'max',
  'abs',
  'sin',
  'cos',
  'tan',
  'atan2',
  'pushMatrix',
  'popMatrix',
  'translate',
  'rotate',
  'scale',
  'resetMatrix',
  'color',
  'red',
  'green',
  'blue',
  'alpha',
  'hue',
  'saturation',
  'brightness',
  'lerpColor',
  'radians',
  'degrees',
  'millis',
  'delay',
  'image',
  'loadImage',
  'text',
  'textSize',
  'textAlign',
  'textFont',
  'textWidth',
  'loop',
  'noLoop',
  'redraw',
  'exit',
  // Domain methods in exercises
  'dibujar',
  'caminar',
  'maullar',
  'avanzar',
  'saludar',
  'mover',
  'mostrar',
]);

export const PROCESSING_SYSTEM_VARS = new Set([
  'width',
  'height',
  'mouseX',
  'mouseY',
  'pmouseX',
  'pmouseY',
  'mousePressed',
  'keyPressed',
  'key',
  'keyCode',
  'frameCount',
  'frameRate',
  'displayWidth',
  'displayHeight',
  'PI',
  'HALF_PI',
  'TWO_PI',
  'QUARTER_PI',
  'TAU',
  'CENTER',
  'CORNER',
  'CORNERS',
  'RADIUS',
  'RGB',
  'HSB',
  'JAVA2D',
  'P2D',
  'P3D',
  'true',
  'false',
  'null',
]);

export interface HighlightOptions {
  activeLine?: number | null;
  highlightedSection?: string | null;
  onSelectToken?: (token: string, context: string) => void;
  selectedToken?: string | null;
  hoveredBraceId?: number | null;
  onHoverBrace?: (lineIdx: number | null) => void;
}

/**
 * Parses and tokenizes a line of Processing Java code into syntax-colored spans
 */
export function renderProcessingLine(
  line: string,
  lineIdx: number,
  options?: HighlightOptions
): React.ReactNode {
  const trimmed = line.trim();

  // Full-line comment
  if (trimmed.startsWith('//')) {
    return (
      <span className="text-[#7E7E7E] italic select-text">
        {line}
      </span>
    );
  }

  // Regex to split tokens while preserving comments and strings
  // 1. Strings: "([^"\\]*(\\.[^"\\]*)*)"
  // 2. Chars: '([^'\\]*(\\.[^'\\]*)*)'
  // 3. Line comments: //.*$
  // 4. Identifiers / numbers / symbols: [a-zA-Z0-9_]+
  // 5. Operators & delimiters: [{}();,=.+\-*/<>!&|]
  // 6. Whitespace: \s+
  const tokenRegex = /(\/\/.*$|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|\s+|[{}();,=.+\-*/<>!&|]|[a-zA-Z_][a-zA-Z0-9_]*|\d+(?:\.\d+)?f?|.)/g;

  const matches = line.match(tokenRegex) || [line];

  return matches.map((token, pIdx) => {
    if (!token) return null;

    // Whitespace
    if (/^\s+$/.test(token)) {
      return <span key={pIdx}>{token}</span>;
    }

    // Trailing line comment
    if (token.startsWith('//')) {
      return (
        <span key={pIdx} className="text-[#7E7E7E] italic select-text">
          {token}
        </span>
      );
    }

    // String literal
    if (token.startsWith('"') || token.startsWith("'")) {
      return (
        <span key={pIdx} className="text-[#7D4793] select-text">
          {token}
        </span>
      );
    }

    // Keywords (KEYWORD1 in Processing: bold orange)
    if (PROCESSING_KEYWORDS.has(token)) {
      const isSelected = options?.selectedToken === token;
      return (
        <span
          key={pIdx}
          onClick={() => options?.onSelectToken?.(token, token === 'void' ? 'return-type' : 'keyword')}
          className={`text-[#E2661A] font-bold ${
            options?.onSelectToken ? 'cursor-pointer hover:underline px-0.5 rounded hover:bg-orange-50' : ''
          } ${isSelected ? 'bg-orange-100 ring-1 ring-[#E2661A] rounded' : ''}`}
        >
          {token}
        </span>
      );
    }

    // Data types (bold orange in Processing)
    if (PROCESSING_TYPES.has(token)) {
      const isSelected = options?.selectedToken === token;
      return (
        <span
          key={pIdx}
          onClick={() => options?.onSelectToken?.(token, 'type')}
          className={`text-[#E2661A] font-bold ${
            options?.onSelectToken ? 'cursor-pointer hover:underline px-0.5 rounded hover:bg-orange-50' : ''
          } ${isSelected ? 'bg-orange-100 ring-1 ring-[#E2661A] rounded' : ''}`}
        >
          {token}
        </span>
      );
    }

    // Processing functions & methods (KEYWORD2: cyan/blue)
    if (PROCESSING_FUNCTIONS.has(token)) {
      const isSelected = options?.selectedToken === token;
      return (
        <span
          key={pIdx}
          onClick={() => options?.onSelectToken?.(token, 'method-name')}
          className={`text-[#006699] font-semibold ${
            options?.onSelectToken ? 'cursor-pointer hover:underline px-0.5 rounded hover:bg-blue-50' : ''
          } ${isSelected ? 'bg-sky-100 ring-1 ring-[#006699] rounded' : ''}`}
        >
          {token}
        </span>
      );
    }

    // System variables & constants (KEYWORD3: olive-green)
    if (PROCESSING_SYSTEM_VARS.has(token)) {
      const isSelected = options?.selectedToken === token;
      return (
        <span
          key={pIdx}
          onClick={() => options?.onSelectToken?.(token, 'system-variable')}
          className={`text-[#718A00] font-medium ${
            options?.onSelectToken ? 'cursor-pointer hover:underline px-0.5 rounded hover:bg-green-50' : ''
          } ${isSelected ? 'bg-lime-100 ring-1 ring-[#718A00] rounded' : ''}`}
        >
          {token}
        </span>
      );
    }

    // Numbers
    if (/^\d+(?:\.\d+)?f?$/.test(token)) {
      return (
        <span key={pIdx} className="text-[#006699]">
          {token}
        </span>
      );
    }

    // Braces
    if (token === '{' || token === '}') {
      const isHovered = options?.hoveredBraceId === lineIdx;
      const isSelected = options?.selectedToken === token;
      return (
        <span
          key={pIdx}
          onMouseEnter={() => options?.onHoverBrace?.(lineIdx)}
          onMouseLeave={() => options?.onHoverBrace?.(null)}
          onClick={() => options?.onSelectToken?.(token, 'brace')}
          className={`text-zinc-900 font-bold transition-colors ${
            options?.onSelectToken ? 'cursor-pointer px-0.5 rounded hover:bg-zinc-200' : ''
          } ${isHovered ? 'bg-amber-100 ring-1 ring-amber-400 text-amber-900' : ''} ${
            isSelected ? 'bg-zinc-200 ring-1 ring-zinc-700' : ''
          }`}
        >
          {token}
        </span>
      );
    }

    // Parentheses
    if (token === '(' || token === ')') {
      const isSelected = options?.selectedToken === token;
      return (
        <span
          key={pIdx}
          onClick={() => options?.onSelectToken?.(token, 'parenthesis')}
          className={`text-zinc-800 font-medium ${
            options?.onSelectToken ? 'cursor-pointer px-0.5 rounded hover:bg-zinc-100' : ''
          } ${isSelected ? 'bg-zinc-200 ring-1 ring-zinc-600' : ''}`}
        >
          {token}
        </span>
      );
    }

    // Semicolon
    if (token === ';') {
      const isSelected = options?.selectedToken === token;
      return (
        <span
          key={pIdx}
          onClick={() => options?.onSelectToken?.(';', 'semicolon')}
          className={`text-zinc-700 font-bold ${
            options?.onSelectToken ? 'cursor-pointer px-0.5 rounded hover:bg-zinc-100' : ''
          } ${isSelected ? 'bg-zinc-200 ring-1 ring-zinc-600' : ''}`}
        >
          {token}
        </span>
      );
    }

    // Equal operator
    if (token === '=') {
      const isSelected = options?.selectedToken === token;
      return (
        <span
          key={pIdx}
          onClick={() => options?.onSelectToken?.('=', 'operator')}
          className={`text-zinc-950 font-bold ${
            options?.onSelectToken ? 'cursor-pointer px-1 rounded hover:bg-zinc-100' : ''
          } ${isSelected ? 'bg-zinc-200 ring-1 ring-zinc-600' : ''}`}
        >
          {token}
        </span>
      );
    }

    // Class / Constructor name identifier (e.g., Gato, Pelota, etc.)
    if (token === 'Gato' || /^[A-Z][a-zA-Z0-9]*$/.test(token)) {
      const isSelected = options?.selectedToken === token;
      return (
        <span
          key={pIdx}
          onClick={() => options?.onSelectToken?.(token, 'class-constructor-name')}
          className={`text-zinc-950 font-bold ${
            options?.onSelectToken ? 'cursor-pointer hover:underline px-0.5 rounded hover:bg-zinc-100' : ''
          } ${isSelected ? 'bg-zinc-200 ring-1 ring-zinc-800' : ''}`}
        >
          {token}
        </span>
      );
    }

    // Parameters with Temp or paso
    if (token.endsWith('Temp') || token.startsWith('paso')) {
      const isSelected = options?.selectedToken === token;
      return (
        <span
          key={pIdx}
          onClick={() => options?.onSelectToken?.(token, 'param')}
          className={`text-zinc-700 italic ${
            options?.onSelectToken ? 'cursor-pointer hover:underline px-0.5 rounded hover:bg-zinc-100' : ''
          } ${isSelected ? 'bg-zinc-200 ring-1 ring-zinc-600' : ''}`}
        >
          {token}
        </span>
      );
    }

    // Default identifiers & symbols
    const isSelected = options?.selectedToken === token;
    return (
      <span
        key={pIdx}
        onClick={() => options?.onSelectToken?.(token, 'identifier')}
        className={`text-zinc-800 ${
          options?.onSelectToken ? 'cursor-pointer hover:bg-zinc-100 px-0.5 rounded' : ''
        } ${isSelected ? 'bg-zinc-200 ring-1 ring-zinc-600' : ''}`}
      >
        {token}
      </span>
    );
  });
}

/**
 * Renders a code snippet containing '___' fill-in-the-blank placeholders
 * with live user inputs and authentic Processing Java styling.
 */
export function renderSnippetWithBlanks(
  snippet: string,
  blanks: Array<{ id: string }>,
  inputs: Record<string, string>
): React.ReactNode {
  let blankCount = 0;
  const indexedSnippet = snippet.replace(/___/g, () => {
    const marker = `__BLANK_${blankCount}__`;
    blankCount++;
    return marker;
  });

  const lines = indexedSnippet.split('\n');

  return lines.map((line, lIdx) => {
    const parts = line.split(/(__BLANK_\d+__)/g);

    return (
      <div key={lIdx} className="leading-relaxed">
        {parts.map((part, pIdx) => {
          const match = part.match(/^__BLANK_(\d+)__$/);
          if (match) {
            const blankIndex = parseInt(match[1], 10);
            const blankMeta = blanks[blankIndex];
            const rawVal = blankMeta ? inputs[blankMeta.id] : '';
            const hasVal = Boolean(rawVal && rawVal.trim().length > 0);

            if (!hasVal) {
              return (
                <span
                  key={pIdx}
                  className="inline-block px-2.5 py-0.5 mx-1 rounded bg-amber-50 border border-dashed border-amber-400 text-amber-700 font-mono font-bold text-xs select-none"
                  title="Espacio por rellenar"
                >
                  ___
                </span>
              );
            }

            return (
              <span
                key={pIdx}
                className="inline-block px-1.5 py-0.5 mx-0.5 rounded bg-amber-50/70 border border-amber-300 font-mono font-bold"
              >
                {renderProcessingLine(rawVal, 0)}
              </span>
            );
          }

          return <span key={pIdx}>{renderProcessingLine(part, lIdx)}</span>;
        })}
      </div>
    );
  });
}

