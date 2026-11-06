import React, { useEffect, useMemo, useRef, useState } from 'react';
import { GenerativeArtwork } from './GenerativeArtwork';
import { RefreshCw } from 'lucide-react';
import { ErrorBoundary } from '../ErrorBoundary';
import { fetchGithubSketchSource } from '../../services/githubRepositoryService';

interface P5LiveThumbnailProps {
  p5Code?: string | null;
  repositoryUrl?: string | null;
  repositoryEntry?: string | null;
  fallbackTopicNumber?: number;
  width?: number;
  height?: number;
  interactive?: boolean;
  fit?: 'contain' | 'cover';
  className?: string;
  caption?: string;
}

const P5LiveThumbnailInner: React.FC<P5LiveThumbnailProps> = ({
  p5Code,
  repositoryUrl,
  repositoryEntry,
  fallbackTopicNumber = 1,
  width = 280,
  height = 125,
  interactive = true,
  fit = 'contain',
  className = '',
  caption,
}) => {
  const [reloadKey, setReloadKey] = useState(0);
  const [frameState, setFrameState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [executionError, setExecutionError] = useState('');
  const [repositoryError, setRepositoryError] = useState('');
  const repositoryKey = JSON.stringify([repositoryUrl, repositoryEntry]);
  const [repositoryResult, setRepositoryResult] = useState<{ code: string; baseUrl: string; key: string } | null>(null);
  const repositoryCode = repositoryResult?.key === repositoryKey ? repositoryResult : null;
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  // Clean code and determine whether valid p5 code is provided
  const cleanedCode = useMemo(() => {
    // A configured repository is authoritative. Do not execute stale inline
    // code while its source is still being downloaded.
    return (repositoryUrl?.trim() ? repositoryCode?.code || '' : p5Code || '').trim();
  }, [p5Code, repositoryCode, repositoryUrl]);

  useEffect(() => {
    let active = true;
    setRepositoryResult(null);
    setRepositoryError('');
    setFrameState('loading');
    setExecutionError('');
    if (!repositoryUrl?.trim()) return () => { active = false; };
    fetchGithubSketchSource(repositoryUrl, repositoryEntry || undefined)
      .then(({ code, baseUrl }) => { if (active) setRepositoryResult({ code, baseUrl, key: repositoryKey }); })
      .catch((error: unknown) => {
        if (!active) return;
        setRepositoryError(error instanceof Error ? error.message : 'Error desconocido al cargar GitHub.');
        setFrameState('error');
      });
    return () => { active = false; };
  }, [repositoryUrl, repositoryEntry, repositoryKey]);

  useEffect(() => {
    setFrameState('loading');
    setExecutionError('');
    // Assets loaded in preload() can take longer than the first canvas frame.
    // Do not replace a valid project with the decorative fallback too early.
    const timeout = window.setTimeout(() => setFrameState('error'), 15000);
    const handleMessage = (event: MessageEvent) => {
      if (event.source !== iframeRef.current?.contentWindow) return;
      if (event.data?.type === 'p5-thumbnail-ready') {
        window.clearTimeout(timeout);
        setFrameState('ready');
      }
      if (event.data?.type === 'p5-thumbnail-error') {
        window.clearTimeout(timeout);
        setFrameState('error');
        setExecutionError(event.data.message || 'Error desconocido del sketch.');
      }
    };
    window.addEventListener('message', handleMessage);
    return () => {
      window.clearTimeout(timeout);
      window.removeEventListener('message', handleMessage);
    };
  }, [reloadKey, cleanedCode, fit]);

  // If no code or repository is provided, fall back immediately.
  if (!cleanedCode && !repositoryUrl?.trim()) {
    return (
      <GenerativeArtwork
        family="points"
        width={width}
        height={height}
        interactive={interactive}
        className={className}
        caption={caption}
      />
    );
  }

  if (!cleanedCode) {
    if (frameState === 'error') {
      return (
        <div
          className={`inline-flex items-center justify-center rounded-xl border border-[#E6C687] bg-[#FFF9EE] p-3 text-center text-[11px] text-[#7A5A18] ${className}`}
          style={{ width: `${width}px`, height: `${height}px`, maxWidth: '100%' }}
        >
          No se pudo cargar el proyecto de GitHub: {repositoryError || 'revisa el enlace y la ruta del archivo.'}
        </div>
      );
    }
    return (
      <div
        className={`inline-flex items-center justify-center rounded-xl border border-[#E1E7E1] bg-white text-[11px] text-[#59645C] ${className}`}
        style={{ width: `${width}px`, height: `${height}px`, maxWidth: '100%' }}
      >
        Cargando proyecto desde GitHub…
      </div>
    );
  }

  if (frameState === 'error') {
    return (
      <div
        className={`inline-flex items-center justify-center rounded-xl border border-[#E6C687] bg-[#FFF9EE] p-3 text-center text-[11px] text-[#7A5A18] ${className}`}
        style={{ width: `${width}px`, height: `${height}px`, maxWidth: '100%' }}
      >
        No se pudo ejecutar este proyecto p5.js: {executionError || 'el proyecto no creó un canvas a tiempo.'}
      </div>
    );
  }

  // Construct iframe srcdoc with sandboxed p5.js execution
  // Safe stringification prevents template literal interpolation bugs with ${} or quotes
  const safeJsonCode = JSON.stringify(cleanedCode);
  const baseUrl = repositoryCode?.baseUrl || '';
  const fitMode = JSON.stringify(fit);

  const srcDoc = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  ${baseUrl ? `<base href="${baseUrl}" />` : ''}
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
      position: relative;
      overflow: hidden;
    }
    canvas {
      display: block;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      transform-origin: center center;
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
  <div id="status" class="fallback-box" hidden></div>
  <script>
    const status = document.getElementById("status");
    const showError = (message) => {
      status.textContent = "No se pudo ejecutar esta miniatura: " + message;
      status.hidden = false;
      window.parent.postMessage({ type: "p5-thumbnail-error", message }, "*");
      console.warn("p5 thumbnail notice:", message);
    };

    window.onerror = function(msg) {
      // p5 can emit a transient resource event while preload() is still
      // resolving. The parent timeout decides whether execution truly failed.
      console.warn("p5 thumbnail runtime notice:", String(msg));
      return true;
    };

    const startSketch = () => {
      if (!window.p5) {
        showError("p5.js no está disponible");
        return;
      }

      try {
        const userCode = ${safeJsonCode};
        // p5 global mode looks for setup/draw on window. Indirect eval keeps
        // those declarations global instead of hiding them in a Function scope.
        (0, eval)(userCode);
        // Explicitly start global mode. This is reliable inside sandboxed
        // iframes where p5's automatic DOM-ready startup may not run.
        new window.p5();
        const readyCheck = window.setInterval(() => {
          const canvas = document.querySelector("canvas");
          const container = document.getElementById("canvas-container");
          if (canvas && container) {
            if (canvas.parentElement !== container) {
              container.appendChild(canvas);
            }
            const fitCanvas = () => {
              const scale = (${fitMode} === "cover" ? Math.max : Math.min)(
                container.clientWidth / canvas.width,
                container.clientHeight / canvas.height
              );
              canvas.style.width = Math.max(1, canvas.width * scale) + "px";
              canvas.style.height = Math.max(1, canvas.height * scale) + "px";
            };
            fitCanvas();
            new ResizeObserver(fitCanvas).observe(container);
            window.clearInterval(readyCheck);
            window.parent.postMessage({ type: "p5-thumbnail-ready" }, "*");
          }
        }, 100);
      } catch (err) {
        showError(err instanceof Error ? err.message : String(err));
      }
    };

    if (window.p5) startSketch();
    else showError("p5.js no pudo cargarse desde el CDN");
  </script>
</body>
</html>`;

  return (
    <div
      className={`relative group overflow-hidden rounded-xl bg-white border border-[#E1E7E1] ${className}`}
      style={{ width: `${width}px`, height: `${height}px`, maxWidth: '100%' }}
    >
      <iframe
        ref={iframeRef}
          key={reloadKey}
          srcDoc={srcDoc}
          title="Live p5.js Thumbnail"
          sandbox="allow-scripts allow-same-origin"
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
