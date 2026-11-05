import React, { useMemo, useState } from 'react';
import { GenerativeArtwork } from './GenerativeArtwork';
import { RefreshCw } from 'lucide-react';
import { ErrorBoundary } from '../ErrorBoundary';

interface P5LiveThumbnailProps {
  p5Code?: string | null;
  fallbackTopicNumber?: number;
  width?: number;
  height?: number;
  interactive?: boolean;
  className?: string;
  caption?: string;
}

const P5LiveThumbnailInner: React.FC<P5LiveThumbnailProps> = ({
  p5Code,
  fallbackTopicNumber = 1,
  width = 280,
  height = 125,
  interactive = true,
  className = '',
  caption,
}) => {
  const [reloadKey, setReloadKey] = useState(0);

  // Clean code and determine whether valid p5 code is provided
  const cleanedCode = useMemo(() => {
    if (!p5Code || typeof p5Code !== 'string') return '';
    return p5Code.trim();
  }, [p5Code]);

  // If no code is provided, fall back immediately to the built-in GenerativeArtwork
  if (!cleanedCode) {
    return (
      <GenerativeArtwork
        topicNumber={fallbackTopicNumber}
        width={width}
        height={height}
        interactive={interactive}
        className={className}
        caption={caption}
      />
    );
  }

  // Construct iframe srcdoc with sandboxed p5.js execution
  // Safe stringification prevents template literal interpolation bugs with ${} or quotes
  const safeJsonCode = JSON.stringify(cleanedCode);

  const srcDoc = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    * { box-sizing: border-box; }
    html, body {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #FFFFFF;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    #canvas-container {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }
    canvas {
      display: block;
      max-width: 100% !important;
      max-height: 100% !important;
      object-fit: contain;
    }
    .fallback-box {
      color: #59645C;
      font-size: 11px;
      font-family: monospace;
      padding: 8px;
      text-align: center;
    }
  </style>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.4/p5.min.js"></script>
</head>
<body>
  <div id="canvas-container"></div>
  <script>
    window.onerror = function(msg, url, line) {
      console.warn("p5 thumbnail notice:", msg);
      return true; // prevent error bubbling
    };

    try {
      const userCode = ${safeJsonCode};
      // Evaluate user p5 sketch in global context
      const runFn = new Function(userCode);
      runFn();
    } catch(err) {
      console.warn("p5 runtime catch:", err.message);
    }
  </script>
</body>
</html>`;

  return (
    <div
      className={`relative group overflow-hidden rounded-xl bg-white border border-[#E1E7E1] ${className}`}
      style={{ width: `${width}px`, height: `${height}px`, maxWidth: '100%' }}
    >
      <iframe
        key={reloadKey}
        srcDoc={srcDoc}
        title="Live p5.js Thumbnail"
        sandbox="allow-scripts"
        className="w-full h-full border-0 block"
        style={{
          pointerEvents: interactive ? 'auto' : 'none',
          width: '100%',
          height: '100%',
        }}
      />

      {/* Floating subtle p5 badge and restart button on hover */}
      <div className="absolute top-1.5 right-1.5 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-auto">
        <span className="bg-[#232A24]/75 text-white text-[9px] font-mono px-1.5 py-0.5 rounded shadow-xs">
          p5.js en vivo
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setReloadKey((k) => k + 1);
          }}
          title="Reiniciar animación"
          className="bg-white/90 hover:bg-white text-[#232A24] p-1 rounded-md shadow-xs border border-[#E1E7E1] cursor-pointer"
        >
          <RefreshCw className="w-3 h-3" />
        </button>
      </div>

      {caption && <div className="sr-only">{caption}</div>}
    </div>
  );
};

export const P5LiveThumbnail: React.FC<P5LiveThumbnailProps> = (props) => {
  return (
    <ErrorBoundary
      fallbackTitle="Miniatura gráfica"
      onReset={() => {}}
    >
      <P5LiveThumbnailInner {...props} />
    </ErrorBoundary>
  );
};
