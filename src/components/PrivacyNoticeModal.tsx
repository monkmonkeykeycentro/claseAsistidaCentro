/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { X, ShieldCheck } from 'lucide-react';

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
                Aviso de privacidad
              </h2>
              <p className="text-xs text-[#59645C]">
                Laboratorio de Código Creativo
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
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-[#59645C] leading-relaxed">
          <p>
            <strong className="text-[#232A24]">Laboratorio de Código Creativo</strong> es una herramienta educativa diseñada para apoyar el aprendizaje de programación mediante actividades interactivas, ejercicios y seguimiento académico.
          </p>

          <section className="space-y-3 border-b border-[#E1E7E1] pb-5">
            <h3 className="font-bold text-[#232A24]">¿Qué información recopilamos?</h3>
            <p>Para utilizar la plataforma se registra la siguiente información:</p>
            <ul className="list-disc space-y-2 pl-5">
              <li><strong className="text-[#232A24]">Datos de identificación:</strong> identificador de usuario y correo electrónico institucional, necesarios para gestionar el acceso y asociar la información a cada estudiante.</li>
              <li><strong className="text-[#232A24]">Progreso académico:</strong> información sobre las actividades, lecciones y módulos realizados, así como el estado y seguimiento del aprendizaje.</li>
              <li><strong className="text-[#232A24]">Contenido de las actividades:</strong> código, respuestas y proyectos desarrollados por el estudiante, cuando sea necesario conservarlos para continuar su trabajo.</li>
            </ul>
          </section>

          <section className="space-y-3 border-b border-[#E1E7E1] pb-5">
            <h3 className="font-bold text-[#232A24]">¿Para qué utilizamos esta información?</h3>
            <p>Los datos se utilizan para gestionar el acceso a la plataforma, registrar el progreso en las actividades y facilitar el seguimiento y la retroalimentación docente.</p>
          </section>

          <section className="space-y-3 border-b border-[#E1E7E1] pb-5">
            <h3 className="font-bold text-[#232A24]">¿Cómo se protege y quién puede consultar la información?</h3>
            <p>El acceso a la plataforma se realiza mediante una cuenta institucional de Google con el dominio <strong className="text-[#232A24]">@centro.edu.mx</strong>. No se permite el ingreso mediante cuentas personales o externas a este dominio.</p>
            <p>La plataforma utiliza servicios de <strong className="text-[#232A24]">Google Workspace y Firebase</strong> para la autenticación y gestión de la información.</p>
            <p>Los registros académicos podrán ser consultados únicamente por el docente responsable y las personas autorizadas para la administración de la plataforma.</p>
          </section>

          <section className="space-y-3 border-b border-[#E1E7E1] pb-5">
            <h3 className="font-bold text-[#232A24]">¿Cuánto tiempo conservamos los datos?</h3>
            <p>La información académica se conservará durante el semestre en el que el estudiante esté inscrito en los cursos de Código Creativo. Al finalizar este periodo, los registros se eliminarán o anonimizarán, salvo aquellos que deban conservarse por obligaciones legales.</p>
          </section>

          <section className="space-y-3 border-b border-[#E1E7E1] pb-5">
            <h3 className="font-bold text-[#232A24]">¿Puedo consultar, corregir o eliminar mis datos?</h3>
            <p>Sí. Puedes solicitar el acceso, rectificación, cancelación u oposición al tratamiento de tus datos personales, así como consultar las opciones para limitar su uso o revocar tu consentimiento cuando corresponda.</p>
            <p>Para realizar una solicitud, escribe a{' '}
              <a href="mailto:jmartineza@centro.edu.mx" className="font-bold text-[#407B5D] underline underline-offset-2">jmartineza@centro.edu.mx</a>, indicando tu nombre, cuenta institucional y el motivo de la solicitud. Recibirás una respuesta conforme a los plazos establecidos por la legislación aplicable.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="font-bold text-[#232A24]">Responsable y actualizaciones</h3>
            <p><strong className="text-[#232A24]">Responsable:</strong> Josué Javier Martínez Alcántara, docente de Código Creativo | Estudios Integrales.</p>
            <p>Cualquier modificación a este aviso se comunicará mediante su publicación en esta sección.</p>
            <p><strong className="text-[#232A24]">Última actualización:</strong> 5 de noviembre de 2026.</p>
          </section>
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
