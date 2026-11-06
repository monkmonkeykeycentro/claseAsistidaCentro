/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { X, ShieldCheck, Lock, FileText, School, UserCheck, Mail } from 'lucide-react';

interface PrivacyNoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyNoticeModal: React.FC<PrivacyNoticeModalProps> = ({
  isOpen,
  onClose,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="privacy-modal-title"
    >
      <div
        className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-[#E1E7E1] overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-6 border-b border-[#E1E7E1] flex items-center justify-between bg-[#F7F8F4]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#E8EEE8] text-[#407B5D] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2
                id="privacy-modal-title"
                className="text-lg font-bold text-[#232A24]"
              >
                Aviso de Privacidad Integral
              </h2>
              <p className="text-xs text-[#59645C]">
                Laboratorio de Código Creativo · CENTRO de diseño, cine y televisión
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar aviso de privacidad"
            className="p-2 text-[#59645C] hover:text-[#232A24] hover:bg-[#E8EEE8] rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-[#232A24] leading-relaxed">
          {/* Badge & Legal Framework */}
          <div className="p-4 bg-[#E8EEE8] border border-[#A4C4B5] rounded-2xl flex items-start gap-3">
            <School className="w-5 h-5 text-[#407B5D] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-[#407B5D] block text-sm">
                Compromiso de Privacidad y Entorno Educativo
              </span>
              <p className="text-[11px] text-[#232A24]">
                En cumplimiento con la <strong>Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP)</strong> y la normativa institucional de <strong>CENTRO de diseño, cine y televisión</strong>, este aviso informa a estudiantes, docentes y visitantes sobre el tratamiento legítimo, controlado e informado de sus datos personales.
              </p>
            </div>
          </div>

          {/* 1. Responsable */}
          <div className="space-y-2 border-b border-[#E1E7E1] pb-4">
            <h3 className="text-sm font-bold text-[#232A24] flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#407B5D]" />
              1. Identidad y Domicilio del Responsable
            </h3>
            <p className="text-[#59645C]">
              El <strong>Laboratorio de Código Creativo</strong>, como iniciativa académica y pedagógica adscrita a <strong>CENTRO de diseño, cine y televisión</strong> (con domicilio en Av. Constituyentes 455, Col. América, Alcaldía Miguel Hidalgo, C.P. 11820, Ciudad de México), es responsable del uso y protección de los datos personales recabados a través de esta plataforma digital.
            </p>
          </div>

          {/* 2. Finalidades */}
          <div className="space-y-2 border-b border-[#E1E7E1] pb-4">
            <h3 className="text-sm font-bold text-[#232A24] flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-[#407B5D]" />
              2. Finalidades del Tratamiento de Datos
            </h3>
            <p className="text-[#59645C]">
              Los datos personales recabados son tratados única y exclusivamente con <strong>fines académicos, formativos y de investigación didáctica</strong>:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-[#59645C] pl-2">
              <li>
                <strong className="text-[#232A24]">Finalidades primarias:</strong> Registro de sesiones pedagógicas mediante correo institucional (<code className="font-mono text-[#407B5D]">@centro.edu.mx</code>), seguimiento del avance en las unidades curriculares, guardado y sincronización de ejercicios de Processing Java y p5.js, persistencia de proyectos del <em>Diseñador de Clases (POO)</em> y retroalimentación docente.
              </li>
              <li>
                <strong className="text-[#232A24]">Sin fines comerciales:</strong> La plataforma <strong>no contiene publicidad, no monetiza información ni comercializa perfiles</strong> de estudiantes con entidades externas.
              </li>
            </ul>
          </div>

          {/* 3. Datos Recabados */}
          <div className="space-y-2 border-b border-[#E1E7E1] pb-4">
            <h3 className="text-sm font-bold text-[#232A24] flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#407B5D]" />
              3. Datos Personales Recabados
            </h3>
            <p className="text-[#59645C]">
              Para la correcta operación didáctica del laboratorio, recopilamos:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3 bg-[#F7F8F4] border border-[#E1E7E1] rounded-xl space-y-1">
                <span className="font-bold text-[#232A24] block">Datos de Identificación</span>
                <p className="text-[11px] text-[#59645C]">
                  Nombre, fotografía de perfil pública y correo electrónico institucional vinculado a la cuenta de Google Workspace.
                </p>
              </div>
              <div className="p-3 bg-[#F7F8F4] border border-[#E1E7E1] rounded-xl space-y-1">
                <span className="font-bold text-[#232A24] block">Datos de Producción Creativa</span>
                <p className="text-[11px] text-[#59645C]">
                  Bocetos de código Processing/p5.js, estados de progreso en talleres, estructuras de clases exportadas/guardadas y evidencias de aprendizaje.
                </p>
              </div>
            </div>
            <p className="text-[11px] text-[#59645C] italic pt-1">
              * La plataforma no solicita ni almacena datos personales sensibles (como origen étnico, estado de salud o datos financieros).
            </p>
          </div>

          {/* 4. Seguridad y Almacenamiento */}
          <div className="space-y-2 border-b border-[#E1E7E1] pb-4">
            <h3 className="text-sm font-bold text-[#232A24] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#407B5D]" />
              4. Medidas de Seguridad y Almacenamiento
            </h3>
            <p className="text-[#59645C]">
              La información se resguarda mediante infraestructura segura de <strong>Google Cloud Firestore</strong> con reglas de seguridad que restringen el acceso a datos individuales exclusivamente al propio usuario autenticado y al equipo docente administrador. Adicionalmente, el navegador conserva copias locales temporales (<code className="font-mono text-[#232A24]">localStorage</code>) para permitir la continuidad sin pérdida de borradores ante desconexiones.
            </p>
          </div>

          {/* 5. Derechos ARCO */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-[#232A24] flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#407B5D]" />
              5. Ejercicio de Derechos ARCO y Dudas
            </h3>
            <p className="text-[#59645C]">
              Cualquier titular tiene derecho a conocer qué datos personales tenemos, para qué los utilizamos y las condiciones de su uso (<strong>Acceso</strong>). Asimismo, puede solicitar la corrección de su información (<strong>Rectificación</strong>), su eliminación de nuestros registros (<strong>Cancelación</strong>), oponerse al tratamiento de los mismos (<strong>Oposición</strong>), o solicitar la exportación de sus creaciones y proyectos de clase.
            </p>
            <div className="p-3 bg-[#F7F8F4] border border-[#E1E7E1] rounded-xl flex items-center gap-3">
              <Mail className="w-4 h-4 text-[#407B5D] shrink-0" />
              <div className="text-[11px]">
                <span className="font-bold text-[#232A24] block">Contacto del Laboratorio:</span>
                <span className="text-[#59645C]">
                  Coordinación académica de Código Creativo ·{' '}
                  <a
                    href="mailto:jmartineza@centro.edu.mx"
                    className="text-[#407B5D] font-mono hover:underline"
                  >
                    jmartineza@centro.edu.mx
                  </a>
                </span>
              </div>
            </div>
            <p className="text-[10px] text-[#59645C] pt-2 text-right">
              Fecha de última actualización: <strong>Noviembre de 2026</strong>.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[#E1E7E1] bg-[#F7F8F4] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#407B5D] hover:bg-[#33654C] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            Entendido y cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
