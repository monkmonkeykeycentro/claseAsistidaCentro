import { logSafeError } from '../utils/safeError';
import React, { useState } from 'react';
import { AppUser, signInWithGoogle, signOutApp, FIREBASE_PROJECT_ID } from '../services/firebase';
import {
  X,
  ShieldCheck,
  Check,
  LogOut,
  Loader2,
  AlertCircle,
  ExternalLink,
  Copy,
  ChevronDown,
  ChevronUp,
  Globe,
  RotateCcw,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AppUser | null;
  onUserChange?: (user: AppUser | null) => void;
  hasUnsavedProgress?: boolean;
}

interface AuthErrorInfo {
  code: string;
  title: string;
  message: string;
  isDomainError: boolean;
  hostname: string;
  firebaseConsoleUrl: string;
}

function parseAuthError(err: unknown): AuthErrorInfo {
  const code =
    err && typeof err === 'object' && 'code' in err
      ? String((err as { code: unknown }).code)
      : '';
  const rawMsg = err instanceof Error ? err.message : String(err || '');
  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
  const firebaseConsoleUrl = `https://console.firebase.google.com/project/${FIREBASE_PROJECT_ID}/authentication/settings`;

  const isDomainError =
    code === 'auth/unauthorized-domain' ||
    rawMsg.includes('auth/unauthorized-domain') ||
    rawMsg.toLowerCase().includes('unauthorized-domain') ||
    rawMsg.toLowerCase().includes('authorized domain');

  if (isDomainError) {
    return {
      code: code || 'auth/unauthorized-domain',
      title: 'Dominio de Vercel no autorizado en Firebase',
      message: `Firebase bloquea el inicio de sesión desde "${hostname}" porque aún no está en la lista de dominios autorizados del proyecto.`,
      isDomainError: true,
      hostname,
      firebaseConsoleUrl,

    };
  }

  if (code === 'auth/popup-blocked' || rawMsg.includes('popup-blocked')) {
    return {
      code: code || 'auth/popup-blocked',
      title: 'Ventana emergente bloqueada por el navegador',
      message:
        'Tu navegador impidió abrir la ventana de Google. Por favor permite pop-ups en la barra de direcciones para este sitio y vuelve a intentarlo.',
      isDomainError: false,
      hostname,
      firebaseConsoleUrl,

    };
  }

  if (code === 'auth/popup-closed-by-user' || rawMsg.includes('popup-closed-by-user')) {
    return {
      code: code || 'auth/popup-closed-by-user',
      title: 'Ventana cerrada antes de completar',
      message: 'Se cerró la ventana de Google antes de finalizar la autenticación.',
      isDomainError: false,
      hostname,
      firebaseConsoleUrl,

    };
  }

  if (code === 'auth/operation-not-allowed' || rawMsg.includes('operation-not-allowed')) {
    return {
      code: code || 'auth/operation-not-allowed',
      title: 'Google Sign-In no habilitado',
      message:
        'El proveedor Google Authentication no está activado en la consola de Firebase para este proyecto.',
      isDomainError: false,
      hostname,
      firebaseConsoleUrl,

    };
  }

  if (code === 'auth/network-request-failed' || rawMsg.includes('network-request-failed')) {
    return {
      code: code || 'auth/network-request-failed',
      title: 'Error de conexión de red',
      message:
        'No fue posible contactar los servidores de autenticación. Verifica tu conexión o bloqueadores de rastreo (AdBlockers).',
      isDomainError: false,
      hostname,
      firebaseConsoleUrl,

    };
  }

  return {
    code: code || 'auth/unknown-error',
    title: 'No fue posible completar el inicio de sesión',
    message: 'No se pudo completar la autenticación. Intenta de nuevo o contacta a la administración.',
    isDomainError: false,
    hostname,
    firebaseConsoleUrl,

  };
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
}) => {
  const [loading, setLoading] = useState(false);
  const [errorInfo, setErrorInfo] = useState<AuthErrorInfo | null>(null);
  const [copied, setCopied] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  if (!isOpen) return null;

  const handleSignIn = async () => {
    try {
      setLoading(true);
      setErrorInfo(null);
      await signInWithGoogle();
      onClose();
    } catch (err: unknown) {
      logSafeError('Firebase Auth Error:', err);
      setErrorInfo(parseAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      setLoading(true);
      await signOutApp();
      onClose();
    } catch (err) {
      logSafeError('Firebase Sign-Out Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyHostname = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Acceso a la plataforma"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div className="bg-[#F6F5F0] rounded-none max-w-lg w-full border border-[#DCDDD8] shadow-2xl overflow-hidden max-h-[92vh] flex flex-col font-sans">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#DCDDD8] bg-[#EEEDE8] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#181818] text-[#F6F5F0] flex items-center justify-center font-mono text-xs font-bold">
              [CC]
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#181818] font-mono uppercase tracking-wide">Acceso al Laboratorio</h2>
              <p className="text-[11px] text-[#767773] font-mono">
                Autenticación y sincronización en la nube
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center border border-[#DCDDD8] bg-white text-[#767773] hover:text-[#181818] hover:bg-[#EEEDE8] transition-colors cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {currentUser ? (
            /* Logged in state */
            <div className="space-y-4">
              <div className="p-4 bg-[#EEEDE8] border border-[#DCDDD8] flex items-center gap-3.5">
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || 'Usuario'}
                    className="w-12 h-12 border border-[#DCDDD8] object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 bg-[#181818] text-white flex items-center justify-center font-bold font-mono text-sm">
                    {currentUser.displayName?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-sm text-[#181818] truncate">
                      {currentUser.displayName}
                    </p>
                  </div>
                  <p className="text-xs text-[#767773] font-mono truncate">{currentUser.email}</p>
                </div>
              </div>

              <div className="space-y-2 text-xs text-zinc-600 bg-emerald-50/60 p-3.5 rounded-xl border border-emerald-100">
                <div className="flex items-center gap-2 text-emerald-950 font-medium">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Sincronización en la nube activa</span>
                </div>
                <p className="text-[11px] text-emerald-800/80 leading-relaxed">
                  Tu progreso en cada etapa del taller y los ejercicios completados se sincronizan
                  automáticamente con tu cuenta.
                </p>
              </div>

              <button
                onClick={handleSignOut}
                disabled={loading}
                className="w-full min-h-[44px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-xs font-medium text-zinc-800 transition-colors cursor-pointer"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <LogOut className="w-4 h-4" />
                )}
                <span>Cerrar sesión</span>
              </button>
            </div>
          ) : (
            /* Logged out state */
            <div className="space-y-4">
              <div className="space-y-1.5">
                <h3 className="text-sm font-semibold text-zinc-900">
                  Guarda tu progreso de aprendizaje
                </h3>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  Inicia sesión con tu cuenta de Google para respaldar tus ejercicios, avances y configuraciones en la nube.
                </p>
              </div>

              {/* Special actionable banner if Domain is unauthorized in Firebase (Vercel deployment) */}
              {errorInfo && errorInfo.isDomainError ? (
                <div className="p-4 bg-amber-50/90 border border-amber-200/90 rounded-xl space-y-3 text-xs text-amber-950 animate-in fade-in duration-200">
                  <div className="flex items-start gap-2.5">
                    <Globe className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="font-semibold text-amber-950">{errorInfo.title}</p>
                      <p className="text-[11px] text-amber-800 leading-relaxed">
                        {errorInfo.message}
                      </p>
                    </div>
                  </div>

                  {/* Domain box with Copy */}
                  <div className="bg-white/80 p-2.5 rounded-lg border border-amber-200 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <span className="text-[10px] uppercase font-mono text-amber-700 block tracking-wider font-semibold">
                        Dominio a autorizar:
                      </span>
                      <code className="text-xs font-mono font-bold text-zinc-900 truncate block">
                        {errorInfo.hostname || window.location.hostname}
                      </code>
                    </div>
                    <button
                      onClick={() =>
                        handleCopyHostname(errorInfo.hostname || window.location.hostname)
                      }
                      className="shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-amber-100 hover:bg-amber-200 text-amber-950 text-[11px] font-medium transition-colors cursor-pointer"
                      title="Copiar dominio al portapapeles"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700 font-semibold">¡Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-amber-800" />
                          <span>Copiar</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Step by step */}
                  <div className="text-[11px] text-amber-900 space-y-1.5 bg-amber-100/50 p-3 rounded-lg border border-amber-200/60">
                    <p className="font-semibold text-amber-950">Pasos para resolverlo (1 minuto):</p>
                    <ol className="list-decimal pl-4 space-y-1 text-amber-900">
                      <li>
                        Copia el dominio de arriba (<strong>{errorInfo.hostname}</strong>).
                      </li>
                      <li>
                        Abre la consola de Firebase en la sección de dominios autorizados.
                      </li>
                      <li>
                        Haz clic en <strong>"Add domain"</strong> (Agregar dominio), pega el dominio y guarda.
                      </li>
                    </ol>
                  </div>

                  {/* Direct action links */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
                    <a
                      href={errorInfo.firebaseConsoleUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium transition-colors shadow-xs"
                    >
                      <span>Abrir Firebase Console</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <button
                      onClick={handleSignIn}
                      disabled={loading}
                      className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-amber-200/70 hover:bg-amber-200 text-amber-950 text-xs font-medium transition-colors cursor-pointer"
                    >
                      <RotateCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                      <span>Reintentar</span>
                    </button>
                  </div>
                </div>
              ) : errorInfo ? (
                /* Other general error */
                <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 space-y-2">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <p className="font-semibold text-red-900">{errorInfo.title}</p>
                      <p className="text-[11px] text-red-700 leading-relaxed">{errorInfo.message}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={() => setShowDetails(!showDetails)}
                      className="text-[11px] text-red-600 hover:text-red-800 underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>{showDetails ? 'Ocultar detalles' : 'Ver código de error'}</span>
                      {showDetails ? (
                        <ChevronUp className="w-3 h-3" />
                      ) : (
                        <ChevronDown className="w-3 h-3" />
                      )}
                    </button>
                    <button
                      onClick={handleSignIn}
                      disabled={loading}
                      className="flex items-center gap-1 text-[11px] font-semibold text-red-800 hover:text-red-950 bg-red-100 hover:bg-red-200 px-2 py-1 rounded-md transition-colors cursor-pointer"
                    >
                      <RotateCcw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                      <span>Reintentar</span>
                    </button>
                  </div>

                  {showDetails && (
                    <div className="p-2 bg-red-100/70 rounded font-mono text-[10px] text-red-900 break-all space-y-1">
                      <p>
                        <strong>Código:</strong> {errorInfo.code}
                      </p>
                    </div>
                  )}
                </div>
              ) : null}

              {/* Benefits checklist */}
              <div className="space-y-2 py-1 text-xs text-zinc-600">
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-800 font-mono text-[10px] font-bold">
                    1
                  </span>
                  <span>Sin contraseñas que memorizar ni riesgos de seguridad.</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-800 font-mono text-[10px] font-bold">
                    2
                  </span>
                  <span>Soporta autenticación con Google y 2FA.</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-800 font-mono text-[10px] font-bold">
                    3
                  </span>
                  <span>Retoma tu avance desde cualquier laptop, tablet o aula.</span>
                </div>
              </div>

              {/* Google Sign In Button */}
              <button
                onClick={handleSignIn}
                disabled={loading}
                className="w-full min-h-[46px] flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-semibold tracking-wide transition-all shadow-xs cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#EA4335"
                      d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
                    />
                    <path
                      fill="#4285F4"
                      d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15.2c0 2.8.7 5.4 1.9 7.8l3.7-2.9z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23.5c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16.5C3.7 20.2 7.5 23.5 12 23.5z"
                    />
                  </svg>
                )}
                <span>{loading ? 'Conectando con Google...' : 'Continuar con Google'}</span>
              </button>

              <p className="text-[10px] text-zinc-400 text-center font-sans">
                Tus datos de cuenta sólo se emplean para guardar tu progreso en este taller de Código Creativo.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
