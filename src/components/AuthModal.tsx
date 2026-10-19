import React, { useState } from 'react';
import { AppUser, signInWithGoogle, signOutApp } from '../services/firebase';
import { X, ShieldCheck, Check, LogOut, Loader2, Sparkles, AlertCircle } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AppUser | null;
  onUserChange?: (user: AppUser | null) => void;
  hasUnsavedProgress?: boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  hasUnsavedProgress,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSignIn = async () => {
    try {
      setLoading(true);
      setError(null);
      await signInWithGoogle();
      onClose();
    } catch (err: unknown) {
      console.error(err);
      const msg = err instanceof Error ? err.message : 'Error desconocido al iniciar sesión';
      if (msg.includes('popup-closed-by-user')) {
        setError('Ventana de acceso cerrada antes de completar.');
      } else {
        setError('No fue posible completar el inicio de sesión. Intenta nuevamente.');
      }
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
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Acceso a la plataforma"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div className="bg-white rounded-2xl max-w-md w-full border border-zinc-200 shadow-xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-zinc-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-900">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-zinc-950">Acceso Seguro</h2>
              <p className="text-[11px] text-zinc-500 font-sans">
                Autenticación verificada con Google OAuth
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
            aria-label="Cerrar modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {currentUser ? (
            /* Logged in state */
            <div className="space-y-4">
              <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200 flex items-center gap-3.5">
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || 'Usuario'}
                    className="w-12 h-12 rounded-full border border-zinc-300 object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-zinc-900 text-white flex items-center justify-center font-bold text-sm">
                    {currentUser.displayName?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm text-zinc-900 truncate">
                      {currentUser.displayName}
                    </p>
                    {currentUser.isCentroStudent && (
                      <span className="text-[10px] font-mono uppercase bg-zinc-900 text-white px-1.5 py-0.5 rounded font-medium">
                        CENTRO
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-500 font-mono truncate">{currentUser.email}</p>
                </div>
              </div>

              <div className="space-y-2 text-xs text-zinc-600 bg-white p-3.5 rounded-xl border border-zinc-100">
                <div className="flex items-center gap-2 text-zinc-800 font-medium">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Sincronización en la nube activa</span>
                </div>
                <p className="text-[11px] text-zinc-500 pl-6 leading-relaxed">
                  Tu progreso en cada etapa del taller y los ejercicios completados se guardan
                  automáticamente en tu cuenta.
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
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-zinc-900">
                  Guarda tu progreso de aprendizaje
                </h3>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  Inicia sesión con tu cuenta institucional de <strong className="text-zinc-800 font-semibold">CENTRO (@centro.edu.mx)</strong> o personal de Google para mantener tus avances, ejercicios resueltos y clases diseñadas sincronizados.
                </p>
              </div>

              <div className="space-y-2.5 py-1 text-xs text-zinc-600">
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-800 font-mono text-[10px] font-bold">1</span>
                  <span>Sin contraseñas que recordar ni riesgo de filtración.</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-800 font-mono text-[10px] font-bold">2</span>
                  <span>Protección institucional con doble factor de autenticación (2FA).</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-800 font-mono text-[10px] font-bold">3</span>
                  <span>Retoma tu avance desde cualquier computadora o dispositivo.</span>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <button
                onClick={handleSignIn}
                disabled={loading}
                className="w-full min-h-[44px] flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-semibold tracking-wide transition-all shadow-xs cursor-pointer"
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
                <span>Continuar con Google</span>
              </button>

              <p className="text-[10px] text-zinc-400 text-center font-sans">
                Tus datos de cuenta sólo se usan para identificar tu avance en este taller educativo.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
