import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  Play,
  Pause,
  Maximize2,
  Minimize2,
  Code2,
  Camera,
  Upload,
  RefreshCw,
  Sliders,
  Check,
  Copy,
  Info,
  Sparkles,
  Film,
} from 'lucide-react';

interface VideoAsciiSplitCanvasProps {
  className?: string;
  defaultVideoSrc?: string;
}

const DEFAULT_FRASE = 'nT#JCwfy325Fp6mqSghVd4EgXPGZbYkOA&8U$@KHDBWNMR0Q';

const PROCESSING_JAVA_CODE = `// ==========================================================
// EJERCICIO: DISCRETIZACIÓN DE VIDEO A CARACTERES ASCII
// Video: "Sallie Gardner at a Gallop" (1878) de Eadweard Muybridge
// ==========================================================

import processing.video.*;

Movie video;

int columnas, filas;
int escala = 10;

String frase = "nT#JCwfy325Fp6mqSghVd4EgXPGZbYkOA&8U$@KHDBWNMR0Q";

void setup() {
  size(1280, 720);
  pixelDensity(1);

  columnas = width / escala;
  filas = height / escala;

  textFont(createFont("Monospaced", escala));
  textAlign(LEFT, TOP);

  video = new Movie(this, "video.mp4");
  video.loop();
}

void movieEvent(Movie video) {
  video.read();
}

void draw() {
  background(0);

  if (video.width <= 0 || video.height <= 0) {
    return;
  }

  video.loadPixels();

  if (video.pixels.length == 0) {
    return;
  }

  // La posición horizontal del mouse define la división.
  int division = constrain(mouseX, 0, width);

  // 1. Dibujamos el video original en toda la ventana.
  image(video, 0, 0, width, height);

  // 2. Limitamos el dibujo del efecto al lado derecho.
  if (division < width) {
    clip(division, 0, width - division, height);

    // Fondo negro únicamente en la zona del efecto.
    noStroke();
    fill(0);
    rect(division, 0, width - division, height);

    // Incluimos la celda que cruza la línea divisoria.
    int primeraColumna = division / escala;

    for (int x = primeraColumna; x < columnas; x++) {
      for (int y = 0; y < filas; y++) {

        int videoX = int(
          map(x, 0, columnas, 0, video.width)
        );

        int videoY = int(
          map(y, 0, filas, 0, video.height)
        );

        int indice = videoX + videoY * video.width;
        color c = video.pixels[indice];

        float grises = (red(c) + green(c) + blue(c)) / 3;

        int letraActual = int(
          map(grises, 0, 255, frase.length() - 1, 0)
        );

        String letraADibujar = frase.substring(
          letraActual, letraActual + 1
        );

        fill(c);
        text(letraADibujar, x * escala, y * escala);
      }
    }

    // Quitamos el recorte para dibujar la interfaz.
    noClip();
  }

  // 3. Línea divisoria.
  stroke(255);
  strokeWeight(2);
  line(division, 0, division, height);

  // Indicador central.
  noStroke();
  fill(255);
  ellipse(division, height / 2, 30, 30);

  fill(0);
  textAlign(CENTER, CENTER);
  textSize(16);
  text("<>", division, height / 2);

  // Restauramos el formato de los caracteres ASCII.
  textAlign(LEFT, TOP);
  textSize(escala);
}`;

export const VideoAsciiSplitCanvas: React.FC<VideoAsciiSplitCanvasProps> = ({
  className = '',
  defaultVideoSrc = '/video.mp4',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Procedural generator animation ref
  const proceduralTimeRef = useRef<number>(0);

  // Interactive controls
  const [divisionRatio, setDivisionRatio] = useState<number>(0.5); // 0 to 1
  const [escala, setEscala] = useState<number>(10);
  const [frase, setFrase] = useState<string>(DEFAULT_FRASE);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Source selection: 'video_file' | 'camera' | 'procedural' | 'user_upload'
  const [sourceType, setSourceType] = useState<'video_file' | 'camera' | 'procedural' | 'user_upload'>('video_file');
  const [videoError, setVideoError] = useState<string | null>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [customVideoUrl, setCustomVideoUrl] = useState<string | null>(null);

  // Modal for Processing Java code
  const [isCodeModalOpen, setIsCodeModalOpen] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [showConfigPanel, setShowConfigPanel] = useState<boolean>(false);

  // Create offscreen canvas on mount
  useEffect(() => {
    const off = document.createElement('canvas');
    offscreenCanvasRef.current = off;
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
      }
      if (customVideoUrl) {
        URL.revokeObjectURL(customVideoUrl);
      }
    };
  }, []);

  // Ensure video playback starts, loops continuously and handles browser autoplay policies
  useEffect(() => {
    const video = videoRef.current;
    if (!video || sourceType === 'procedural') return;

    video.defaultMuted = true;
    video.muted = true;
    video.loop = true;
    video.playsInline = true;

    const startPlayback = () => {
      video
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => {
          console.warn('Autoplay waiting for user gesture or muted state:', err);
          setIsPlaying(false);
        });
    };

    const handleEnded = () => {
      video.currentTime = 0;
      video.play().catch(() => {});
    };

    video.addEventListener('canplay', startPlayback);
    video.addEventListener('loadeddata', startPlayback);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('play', () => setIsPlaying(true));
    video.addEventListener('pause', () => setIsPlaying(false));

    startPlayback();

    return () => {
      video.removeEventListener('canplay', startPlayback);
      video.removeEventListener('loadeddata', startPlayback);
      video.removeEventListener('ended', handleEnded);
    };
  }, [sourceType, customVideoUrl]);

  // Play / Pause toggle
  const togglePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  // Handle switching to Webcam
  const handleToggleCamera = async () => {
    if (sourceType === 'camera') {
      // turn off camera, return to video_file
      if (cameraStream) {
        cameraStream.getTracks().forEach((t) => t.stop());
        setCameraStream(null);
      }
      setSourceType('video_file');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
      setSourceType('camera');
      setVideoError(null);
    } catch (err) {
      alert('No se pudo acceder a la cámara: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  // Handle user uploading local MP4
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (customVideoUrl) {
      URL.revokeObjectURL(customVideoUrl);
    }

    const url = URL.createObjectURL(file);
    setCustomVideoUrl(url);
    setSourceType('user_upload');
    setVideoError(null);

    if (videoRef.current) {
      videoRef.current.srcObject = null;
      videoRef.current.src = url;
      videoRef.current.defaultMuted = true;
      videoRef.current.muted = true;
      videoRef.current.loop = true;
      videoRef.current.play().catch(() => {});
    }
  };

  // Switch back to default /video.mp4
  const handleSelectDefaultVideo = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((t) => t.stop());
      setCameraStream(null);
    }
    setSourceType('video_file');
    setVideoError(null);
    if (videoRef.current) {
      videoRef.current.srcObject = null;
      videoRef.current.src = defaultVideoSrc;
      videoRef.current.defaultMuted = true;
      videoRef.current.muted = true;
      videoRef.current.loop = true;
      videoRef.current.play().catch(() => {});
    }
  };

  // Switch to procedural generative scene
  const handleSelectProcedural = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((t) => t.stop());
      setCameraStream(null);
    }
    setSourceType('procedural');
    setVideoError(null);
  };

  // Video error handler (e.g. video.mp4 404 because user hasn't added it yet)
  const handleVideoError = () => {
    if (sourceType === 'video_file') {
      console.warn('El archivo /public/video.mp4 no se encontró en el servidor. Activando generador visual de respaldo.');
      setVideoError(
        'El archivo "video.mp4" aún no ha sido añadido a /public/video.mp4. Mostrando generador dinámico de respaldo.'
      );
      setSourceType('procedural');
    }
  };

  // Dragging division handler
  const updateDivisionFromPointer = useCallback((clientX: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    setDivisionRatio(ratio);
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    updateDivisionFromPointer(e.clientX);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);

    // If video was paused, start playback on first touch/pointer interaction
    const video = videoRef.current;
    if (video && video.paused && sourceType !== 'procedural') {
      video.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isDragging) {
      updateDivisionFromPointer(e.clientX);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
  };

  // Toggle fullscreen
  const handleToggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // Copy Java code
  const handleCopyCode = () => {
    navigator.clipboard.writeText(PROCESSING_JAVA_CODE).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    });
  };

  // Main Render Loop: 1-to-1 Processing Algorithm in HTML5 Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const offscreen = offscreenCanvasRef.current;
    if (!canvas || !offscreen) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const offCtx = offscreen.getContext('2d', { willReadFrequently: true });
    if (!ctx || !offCtx) return;

    let animFrameId: number;

    const drawFrame = () => {
      const width = canvas.width;
      const height = canvas.height;

      // 0. Background
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, width, height);

      const division = Math.round(divisionRatio * width);

      // Determine video or procedural source
      const isVideoSource = sourceType !== 'procedural' && video && video.readyState >= 2 && video.videoWidth > 0;

      let srcWidth = width;
      let srcHeight = height;

      if (isVideoSource && video) {
        srcWidth = video.videoWidth;
        srcHeight = video.videoHeight;

        if (offscreen.width !== srcWidth || offscreen.height !== srcHeight) {
          offscreen.width = srcWidth;
          offscreen.height = srcHeight;
        }

        try {
          offCtx.drawImage(video, 0, 0, srcWidth, srcHeight);
        } catch {
          // ignore transient CORS/state glitches
        }
      } else {
        // Procedural Generative Video generator (when no video is loaded or procedural mode is on)
        proceduralTimeRef.current += 0.025;
        const t = proceduralTimeRef.current;

        const offW = 640;
        const offH = 360;
        if (offscreen.width !== offW || offscreen.height !== offH) {
          offscreen.width = offW;
          offscreen.height = offH;
        }

        // Draw animated artistic generative composition
        offCtx.fillStyle = '#0a0d0b';
        offCtx.fillRect(0, 0, offW, offH);

        // Dynamic concentric flowing waves
        const cx = offW / 2 + Math.cos(t * 0.8) * 80;
        const cy = offH / 2 + Math.sin(t * 1.1) * 50;

        for (let r = 20; r < 280; r += 24) {
          const hue = (t * 40 + r * 1.2) % 360;
          offCtx.strokeStyle = `hsl(${hue}, 80%, 60%)`;
          offCtx.lineWidth = 6 + Math.sin(t + r) * 3;
          offCtx.beginPath();
          offCtx.arc(cx, cy, r, 0, Math.PI * 2);
          offCtx.stroke();
        }

        // Floating geometric objects
        for (let i = 0; i < 7; i++) {
          const ox = offW * (0.15 + (i * 0.12)) + Math.sin(t * 1.5 + i) * 30;
          const oy = offH * 0.5 + Math.cos(t * 2 + i * 0.8) * 70;
          offCtx.fillStyle = i % 2 === 0 ? '#407B5D' : '#E6B65A';
          offCtx.beginPath();
          offCtx.arc(ox, oy, 16 + i * 4, 0, Math.PI * 2);
          offCtx.fill();
        }

        // Large typographic label "PROCESSING"
        offCtx.fillStyle = '#FFFFFF';
        offCtx.font = 'bold 36px monospace';
        offCtx.textAlign = 'center';
        offCtx.textBaseline = 'middle';
        offCtx.fillText('PROCESSING', offW / 2, offH * 0.82);

        srcWidth = offW;
        srcHeight = offH;
      }

      // 1. Draw raw video/generative image on entire canvas (Processing step 1)
      try {
        ctx.drawImage(offscreen, 0, 0, width, height);
      } catch {}

      // 2. Limit drawing effect to the right side of the division (Processing step 2)
      if (division < width) {
        ctx.save();
        ctx.beginPath();
        ctx.rect(division, 0, width - division, height);
        ctx.clip(); // clip(division, 0, width - division, height);

        // Black background in the effect zone
        ctx.fillStyle = '#000000';
        ctx.fillRect(division, 0, width - division, height);

        // Get pixel buffer from offscreen canvas
        try {
          const imgData = offCtx.getImageData(0, 0, srcWidth, srcHeight);
          const pixels = imgData.data;

          const columnas = Math.floor(width / escala);
          const filas = Math.floor(height / escala);
          const primeraColumna = Math.floor(division / escala);

          ctx.font = `${escala}px Monospace, monospace`;
          ctx.textAlign = 'left';
          ctx.textBaseline = 'top';

          const fraseLen = frase.length;

          for (let x = primeraColumna; x < columnas; x++) {
            for (let y = 0; y < filas; y++) {
              const videoX = Math.floor((x / columnas) * srcWidth);
              const videoY = Math.floor((y / filas) * srcHeight);

              const index = (videoX + videoY * srcWidth) * 4;
              if (index >= 0 && index + 3 < pixels.length) {
                const r = pixels[index];
                const g = pixels[index + 1];
                const b = pixels[index + 2];

                const grises = (r + g + b) / 3;

                // map(grises, 0, 255, frase.length() - 1, 0)
                let letraActual = Math.floor(
                  ((255 - grises) / 255) * (fraseLen - 1)
                );
                letraActual = Math.max(0, Math.min(fraseLen - 1, letraActual));

                const letraADibujar = frase.charAt(letraActual) || ' ';

                ctx.fillStyle = `rgb(${r},${g},${b})`;
                ctx.fillText(letraADibujar, x * escala, y * escala);
              }
            }
          }
        } catch {}

        ctx.restore(); // noClip()
      }

      // 3. Divider Line & Center Indicator (Processing step 3)
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(division, 0);
      ctx.lineTo(division, height);
      ctx.stroke();

      // Circle indicator
      const midY = height / 2;
      ctx.beginPath();
      ctx.arc(division, midY, 16, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
      ctx.strokeStyle = '#232A24';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Text indicator "<>"
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 13px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('<>', division, midY);

      animFrameId = requestAnimationFrame(drawFrame);
    };

    animFrameId = requestAnimationFrame(drawFrame);

    return () => {
      cancelAnimationFrame(animFrameId);
    };
  }, [divisionRatio, escala, frase, sourceType]);

  return (
    <div
      ref={containerRef}
      className={`relative bg-[#111612] text-white rounded-2xl overflow-hidden shadow-lg border border-[#232A24] flex flex-col ${className}`}
    >
      {/* Hidden HTML5 video element for pixel extraction */}
      <video
        ref={videoRef}
        src={sourceType === 'user_upload' && customVideoUrl ? customVideoUrl : defaultVideoSrc}
        autoPlay
        playsInline
        loop
        muted={isMuted}
        crossOrigin="anonymous"
        onError={handleVideoError}
        className="hidden"
      />

      {/* Top Header / Bar */}
      <div className="px-4 py-3 bg-[#1A221C] border-b border-[#2B382F] flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="w-2.5 h-2.5 rounded-full bg-[#407B5D] animate-pulse" />
          <span className="font-bold tracking-wide uppercase text-[#E8EEE8] text-[11px]">
            Instalación Interactiva: Video a ASCII en Tiempo Real
          </span>
          <span className="text-[#59645C]">·</span>
          <span className="text-[11px] text-[#E6B65A] font-medium hidden md:inline">
            Crédito: <em>Sallie Gardner at a Gallop</em> (1878) de Eadweard Muybridge
          </span>
        </div>

        {/* Source Switcher & Code Button */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-[#111612] border border-[#2B382F] rounded-lg p-0.5">
            <button
              onClick={handleSelectDefaultVideo}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer flex items-center gap-1 ${
                sourceType === 'video_file'
                  ? 'bg-[#407B5D] text-white'
                  : 'text-[#A4C4B5] hover:text-white'
              }`}
              title="Cargar video del servidor (/public/video.mp4)"
            >
              <Film className="w-3 h-3" />
              <span>video.mp4</span>
            </button>

            <button
              onClick={handleToggleCamera}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer flex items-center gap-1 ${
                sourceType === 'camera'
                  ? 'bg-[#407B5D] text-white'
                  : 'text-[#A4C4B5] hover:text-white'
              }`}
              title="Usar tu cámara web en vivo"
            >
              <Camera className="w-3 h-3" />
              <span>Cámara</span>
            </button>

            <button
              onClick={handleSelectProcedural}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer flex items-center gap-1 ${
                sourceType === 'procedural'
                  ? 'bg-[#407B5D] text-white'
                  : 'text-[#A4C4B5] hover:text-white'
              }`}
              title="Modo Generativo de Respaldo"
            >
              <Sparkles className="w-3 h-3" />
              <span>Generativo</span>
            </button>

            <label
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer flex items-center gap-1 ${
                sourceType === 'user_upload'
                  ? 'bg-[#407B5D] text-white'
                  : 'text-[#A4C4B5] hover:text-white'
              }`}
              title="Seleccionar un archivo MP4 desde tu computadora"
            >
              <Upload className="w-3 h-3" />
              <span>Subir MP4</span>
              <input
                type="file"
                accept="video/mp4,video/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          <button
            onClick={() => setIsCodeModalOpen(true)}
            className="min-h-[30px] px-3 py-1 bg-[#232E26] hover:bg-[#2F3D33] border border-[#3A4B3F] text-[#E8EEE8] font-semibold rounded-lg text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <Code2 className="w-3.5 h-3.5 text-[#E6B65A]" />
            <span>Ver Código Java</span>
          </button>
        </div>
      </div>

      {/* Notice bar if video.mp4 is missing */}
      {videoError && sourceType === 'procedural' && (
        <div className="px-4 py-2 bg-[#2B2313] border-b border-[#5E4C20] text-[#E6C687] text-[11px] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Info className="w-3.5 h-3.5 text-[#E6B65A] shrink-0" />
            <span>
              Para usar tu propio video, coloca el archivo en <strong className="font-mono text-white">/public/video.mp4</strong> o pulsa &quot;Subir MP4&quot;. Ejecutando generador interactivo.
            </span>
          </div>
          <button
            onClick={() => handleSelectDefaultVideo()}
            className="underline hover:text-white font-semibold cursor-pointer shrink-0 ml-2"
          >
            Reintentar video.mp4
          </button>
        </div>
      )}

      {/* Main Interactive Canvas Area */}
      <div className="relative w-full aspect-video bg-black select-none touch-none">
        <canvas
          ref={canvasRef}
          width={1280}
          height={720}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="w-full h-full object-contain cursor-ew-resize block"
        />

        {/* Floating Split Ratio Badge */}
        <div className="absolute top-3 left-3 pointer-events-none bg-black/60 backdrop-blur-md border border-white/10 px-2.5 py-1 rounded-lg text-[11px] font-mono text-white/90">
          ◀ Video Original ({Math.round((1 - divisionRatio) * 100)}%) | Efecto ASCII ({Math.round(divisionRatio * 100)}%) ▶
        </div>

        {/* Centered Play Button Overlay if video is paused */}
        {!isPlaying && sourceType !== 'procedural' && (
          <button
            onClick={togglePlayPause}
            className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-black/75 hover:bg-black/90 border border-white/40 text-white flex items-center justify-center cursor-pointer transition-transform hover:scale-105 shadow-2xl backdrop-blur-sm z-10"
            title="Reproducir video"
          >
            <Play className="w-7 h-7 text-white fill-white ml-1" />
          </button>
        )}

        {/* Drag Hint on Initial Display */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 pointer-events-none bg-black/70 backdrop-blur-sm border border-white/15 px-3 py-1 rounded-full text-[11px] text-white/80 flex items-center gap-1.5">
          <span>Arrastra horizontalmente para mover la línea divisoria</span>
        </div>
      </div>

      {/* Bottom Controls Bar */}
      <div className="p-3 bg-[#1A221C] border-t border-[#2B382F] flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Left: Play/Pause & Quick Split Presets */}
        <div className="flex items-center gap-2 flex-wrap">
          {sourceType !== 'procedural' && (
            <button
              onClick={togglePlayPause}
              className="min-h-[30px] px-3 py-1 rounded-lg bg-[#232E26] hover:bg-[#2F3D33] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-[#3A4B3F]"
              title={isPlaying ? 'Pausar video' : 'Reproducir video en bucle'}
            >
              {isPlaying ? (
                <Pause className="w-3.5 h-3.5 text-[#E6B65A]" />
              ) : (
                <Play className="w-3.5 h-3.5 text-[#407B5D]" />
              )}
              <span>{isPlaying ? 'Pausar' : 'Reproducir'}</span>
            </button>
          )}

          <span className="text-[#A4C4B5] text-[11px] mr-1 hidden sm:inline">División:</span>
          {[
            { label: '0% (Todo ASCII)', val: 0 },
            { label: '25%', val: 0.25 },
            { label: '50%', val: 0.5 },
            { label: '75%', val: 0.75 },
            { label: '100% (Todo Video)', val: 1 },
          ].map((preset) => (
            <button
              key={preset.val}
              onClick={() => setDivisionRatio(preset.val)}
              className={`px-2 py-1 rounded-md text-[10px] font-mono transition-colors cursor-pointer ${
                Math.abs(divisionRatio - preset.val) < 0.05
                  ? 'bg-[#407B5D] text-white font-bold'
                  : 'bg-[#232E26] hover:bg-[#2F3D33] text-[#A4C4B5]'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Right: Parameter slider toggles */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#111612] px-3 py-1 rounded-lg border border-[#2B382F]">
            <span className="text-[11px] text-[#A4C4B5] font-mono">Escala: {escala}px</span>
            <input
              type="range"
              min={6}
              max={18}
              step={1}
              value={escala}
              onChange={(e) => setEscala(Number(e.target.value))}
              className="w-20 accent-[#407B5D] cursor-pointer"
              title="Resolución de la cuadrícula ASCII"
            />
          </div>

          <button
            onClick={() => setShowConfigPanel(!showConfigPanel)}
            className={`min-h-[30px] px-2.5 py-1 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              showConfigPanel
                ? 'bg-[#407B5D] border-[#407B5D] text-white'
                : 'bg-[#232E26] hover:bg-[#2F3D33] border-[#3A4B3F] text-[#A4C4B5]'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Ajustes</span>
          </button>

          <button
            onClick={handleToggleFullscreen}
            className="p-1.5 rounded-lg bg-[#232E26] hover:bg-[#2F3D33] text-[#A4C4B5] hover:text-white transition-colors cursor-pointer"
            title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Video Credit & Historical Note Bar */}
      <div className="px-4 py-2.5 bg-[#141A15] border-t border-[#232E26] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-[#A4C4B5]">
        <div className="flex items-center gap-2">
          <Film className="w-3.5 h-3.5 text-[#E6B65A] shrink-0" />
          <span>
            Crédito de video: <strong className="text-[#E8EEE8] font-semibold italic">Sallie Gardner at a Gallop</strong> (1878) de <strong className="text-[#E8EEE8]">Eadweard Muybridge</strong>.
          </span>
        </div>
        <span className="text-[10px] text-[#A4C4B5] font-mono">
          Reproducción continua en bucle (loop) · Discretización en tiempo real
        </span>
      </div>

      {/* Expandable Advanced Adjustments Panel */}
      {showConfigPanel && (
        <div className="p-4 bg-[#141A15] border-t border-[#2B382F] space-y-3 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex-1 space-y-1">
              <label className="text-[11px] font-bold text-[#E8EEE8] block">
                Conjunto de Caracteres ASCII (Cadena <code>frase</code>):
              </label>
              <input
                type="text"
                value={frase}
                onChange={(e) => setFrase(e.target.value)}
                className="w-full px-3 py-1.5 bg-[#1F2721] border border-[#2B382F] rounded-lg text-xs font-mono text-[#E8EEE8] focus:outline-none focus:border-[#407B5D]"
              />
              <span className="text-[10px] text-[#A4C4B5]">
                Los caracteres se ordenan de menor a mayor luminosidad (brillo muestreado del pixel).
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setFrase(DEFAULT_FRASE)}
                className="px-2.5 py-1.5 bg-[#232E26] hover:bg-[#2F3D33] text-[11px] text-[#A4C4B5] rounded-lg cursor-pointer"
              >
                Restablecer frase
              </button>
              <button
                onClick={() => setFrase(' .:-=+*#%@')}
                className="px-2.5 py-1.5 bg-[#232E26] hover:bg-[#2F3D33] text-[11px] text-[#A4C4B5] rounded-lg cursor-pointer"
              >
                ASCII Estándar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Processing Java Code Modal */}
      {isCodeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-[#1A221C] border border-[#2B382F] w-full max-w-3xl max-h-[85vh] rounded-2xl flex flex-col overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="p-4 bg-[#232E26] border-b border-[#2B382F] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code2 className="w-5 h-5 text-[#E6B65A]" />
                <h3 className="font-bold text-sm text-[#E8EEE8]">
                  Código Fuente Original en Processing Java
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyCode}
                  className="px-3 py-1.5 bg-[#407B5D] hover:bg-[#33654C] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs"
                >
                  {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{isCopied ? '¡Copiado!' : 'Copiar Código'}</span>
                </button>
                <button
                  onClick={() => setIsCodeModalOpen(false)}
                  className="p-1.5 text-[#A4C4B5] hover:text-white cursor-pointer rounded-lg hover:bg-white/10"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Body: Code + Explanations */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs font-mono">
              <div className="p-3 bg-[#111612] border border-[#2B382F] rounded-xl text-[#A4C4B5] space-y-1 font-sans">
                <span className="font-bold text-[#E8EEE8] block">💡 Cómo funciona este sketch:</span>
                <p className="text-[11px] leading-relaxed">
                  1. Muestrea el búfer continuo de píxeles del video mediante <code className="text-[#E6B65A]">video.loadPixels()</code>.
                  <br />
                  2. Calcula la luminancia promedio: <code className="text-[#E6B65A]">(red(c) + green(c) + blue(c)) / 3</code>.
                  <br />
                  3. Cuantiza el brillo para seleccionar un carácter de la cadena <code className="text-[#E6B65A]">frase</code>.
                  <br />
                  4. Utiliza <code className="text-[#E6B65A]">clip(division, 0, width - division, height)</code> para aplicar el efecto solo a la derecha del puntero.
                </p>
              </div>

              <pre className="p-4 bg-[#111612] border border-[#2B382F] rounded-xl overflow-x-auto text-[12px] leading-relaxed text-[#D0DED4]">
                <code>{PROCESSING_JAVA_CODE}</code>
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
