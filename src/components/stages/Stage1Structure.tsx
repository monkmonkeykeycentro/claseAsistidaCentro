import React, { useState } from 'react';
import { ETAPA1_SECTIONS, ORGANIZATIONAL_DIDACTIC_NOTE } from '../../data/stageData';
import { ProcessingCodeBlock } from '../ProcessingCodeBlock';
import { CheckCircle2, Info, ChevronRight, HelpCircle, Check, ArrowRight } from 'lucide-react';

interface Stage1Props {
  onComplete: () => void;
  isCompleted: boolean;
  onGoNext: () => void;
}

export const Stage1Structure: React.FC<Stage1Props> = ({
  onComplete,
  isCompleted,
  onGoNext,
}) => {
  const [selectedSectionId, setSelectedSectionId] = useState<string>('declaration');
  const [showDidacticNote, setShowDidacticNote] = useState<boolean>(true);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);

  const selectedSection =
    ETAPA1_SECTIONS.find((s) => s.id === selectedSectionId) || ETAPA1_SECTIONS[0];

  const SKELETON_CODE = `class Gato {
  // Campos o atributos

  // Constructor

  // Métodos
}`;

  // Mini quiz to verify comprehension
  const QUIZ_QUESTIONS = [
    {
      id: 'q1',
      question: '¿Qué sección inicializa los datos del objeto cuando se ejecuta `new`?',
      correct: 'constructor',
      options: [
        { id: 'fields', label: 'Campos o atributos' },
        { id: 'constructor', label: 'Constructor' },
        { id: 'methods', label: 'Métodos' },
      ],
      explanation: 'El constructor tiene como fin principal inicializar los atributos del objeto.',
    },
    {
      id: 'q2',
      question: '¿El orden campos -> constructor -> métodos es obligatorio por Java?',
      correct: 'no',
      options: [
        { id: 'yes', label: 'Sí, si se cambia el orden el compilador da error' },
        { id: 'no', label: 'No, es una organización didáctica y de buenas prácticas' },
      ],
      explanation: 'Java permite escribir métodos antes o después, pero seguir este orden facilita enormemente la lectura y el aprendizaje.',
    },
    {
      id: 'q3',
      question: '¿Qué signo cierra toda declaración de atributo como `int x;`?',
      correct: 'semicolon',
      options: [
        { id: 'semicolon', label: 'Punto y coma (;)' },
        { id: 'brace', label: 'Llave ({})' },
        { id: 'colon', label: 'Dos puntos (:)' },
      ],
      explanation: 'Toda declaración de campo en Processing Java termina con punto y coma (;).',
    },
  ];

  const handleSelectQuiz = (qId: string, optId: string) => {
    setQuizAnswers((prev) => ({ ...prev, [qId]: optId }));
  };

  const handleVerifyQuiz = () => {
    setQuizSubmitted(true);
    const allCorrect = QUIZ_QUESTIONS.every((q) => quizAnswers[q.id] === q.correct);
    if (allCorrect) {
      onComplete();
    }
  };

  return (
    <div className="space-y-6">
      {/* Stage Header */}
      <div className="border-b border-slate-800 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">
                Etapa 1
              </span>
              <span className="text-slate-500">·</span>
              <span className="text-xs text-slate-400">Fundamentos sintácticos</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-100 mt-1">
              Reconocer la estructura de una clase
            </h2>
          </div>
          {isCompleted && (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-950/60 border border-emerald-500/40 rounded-full text-xs font-medium text-emerald-300">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Etapa completada
            </div>
          )}
        </div>
        <p className="text-sm text-slate-300 mt-2 max-w-3xl leading-relaxed">
          Una clase en Processing Java funciona como un molde o plano que define cómo son (atributos) y qué hacen (métodos) los objetos creados a partir de ella. Explora cada sección para comprender su propósito.
        </p>
      </div>

      {/* Main 3-Area Experience */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Area 1: Elementos disponibles / Selector de Secciones (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              1. Partes de la clase
            </h3>
            <span className="text-xs text-slate-500">Selecciona para explorar</span>
          </div>

          <div className="space-y-2">
            {ETAPA1_SECTIONS.map((sec) => {
              const isSelected = selectedSectionId === sec.id;
              return (
                <button
                  key={sec.id}
                  onClick={() => setSelectedSectionId(sec.id)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-slate-800/90 border-cyan-500/80 text-white shadow-lg shadow-cyan-950/40'
                      : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800/50 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">{sec.title}</span>
                    </div>
                    <div className="text-xs text-slate-400 line-clamp-1">
                      {sec.whatItIs}
                    </div>
                  </div>
                  <ChevronRight
                    className={`w-4 h-4 shrink-0 transition-transform ${
                      isSelected ? 'text-cyan-400 translate-x-1' : 'text-slate-600'
                    }`}
                  />
                </button>
              );
            })}
          </div>

          {/* Didactic Note Box */}
          <div className="p-4 bg-amber-950/20 border border-amber-800/40 rounded-xl space-y-2 text-xs">
            <div className="flex items-center gap-1.5 text-amber-300 font-semibold">
              <Info className="w-4 h-4 shrink-0 text-amber-400" />
              <span>{ORGANIZATIONAL_DIDACTIC_NOTE.title}</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              En Java el orden de métodos, constructor y campos <strong>no es un requisito obligatorio del compilador</strong>; sin embargo, agrupar primero los <strong>campos</strong>, luego el <strong>constructor</strong> y finalmente los <strong>métodos</strong> es el orden didáctico universal para mantener el código claro y estructurado.
            </p>
          </div>
        </div>

        {/* Area 2: Espacio visual de la clase (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              2. Esquema estructural base
            </h3>
            <span className="text-xs text-slate-500 font-mono">Gato.pde</span>
          </div>

          <ProcessingCodeBlock
            code={SKELETON_CODE}
            highlightedSection={
              selectedSectionId === 'fields'
                ? 'Campos'
                : selectedSectionId === 'constructor'
                ? 'Constructor'
                : selectedSectionId === 'methods'
                ? 'Métodos'
                : selectedSectionId === 'declaration'
                ? 'class Gato'
                : null
            }
            showCopyButton={false}
          />

          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2 text-xs">
            <span className="text-xs font-semibold text-slate-200">
              Ejemplo simplificado de esta sección:
            </span>
            <pre className="p-3 bg-slate-950 rounded-lg text-emerald-300 font-mono text-xs overflow-x-auto whitespace-pre border border-slate-800">
              {selectedSection.example}
            </pre>
          </div>
        </div>

        {/* Area 3: Explicación contextual de la parte seleccionada (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              3. Explicación contextual
            </h3>
            <span className="text-xs text-cyan-400 font-medium">
              {selectedSection.badge}
            </span>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4 text-xs">
            <div>
              <h4 className="font-semibold text-sm text-slate-100 mb-1">
                ¿Qué representa?
              </h4>
              <p className="text-slate-300 leading-relaxed">
                {selectedSection.whatItIs}
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-sm text-slate-100 mb-1">
                ¿Cómo se escribe?
              </h4>
              <p className="text-slate-300 leading-relaxed">
                {selectedSection.howToWrite}
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-sm text-slate-100 mb-1.5">
                ¿Qué elementos contiene?
              </h4>
              <ul className="space-y-1.5">
                {selectedSection.whatItContains.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-slate-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {selectedSection.pedagogicalNote && (
              <div className="p-3 bg-cyan-950/30 border border-cyan-800/40 rounded-lg text-cyan-200">
                <span className="font-semibold text-cyan-300 block mb-0.5">
                  Consejo pedagógico:
                </span>
                {selectedSection.pedagogicalNote}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Verification Checkpoint */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-semibold text-slate-100">
              Comprobación rápida de la Etapa 1
            </h3>
          </div>
          <span className="text-xs text-slate-400">Responde para desbloquear el avance</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {QUIZ_QUESTIONS.map((q, idx) => {
            const isUserAnswer = quizAnswers[q.id];
            const isCorrect = isUserAnswer === q.correct;
            return (
              <div
                key={q.id}
                className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3 text-xs flex flex-col justify-between"
              >
                <div>
                  <div className="text-slate-400 font-mono text-[11px] mb-1">
                    Pregunta {idx + 1} de {QUIZ_QUESTIONS.length}
                  </div>
                  <div className="text-slate-100 font-medium leading-snug">
                    {q.question}
                  </div>
                </div>

                <div className="space-y-1.5">
                  {q.options.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => handleSelectQuiz(q.id, opt.id)}
                      className={`w-full text-left p-2.5 rounded-lg border transition-all text-xs ${
                        isUserAnswer === opt.id
                          ? quizSubmitted
                            ? isCorrect
                              ? 'bg-emerald-950/60 border-emerald-500 text-emerald-200'
                              : 'bg-rose-950/60 border-rose-500 text-rose-200'
                            : 'bg-cyan-950/50 border-cyan-500 text-cyan-200'
                          : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                {quizSubmitted && (
                  <div
                    className={`p-2 rounded text-[11px] ${
                      isCorrect
                        ? 'bg-emerald-950/40 text-emerald-300'
                        : 'bg-rose-950/40 text-rose-300'
                    }`}
                  >
                    {isCorrect ? '¡Correcto!' : `Sugerencia: ${q.explanation}`}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <button
            onClick={handleVerifyQuiz}
            className="px-5 py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs transition-colors flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            Comprobar respuestas
          </button>

          <button
            onClick={onGoNext}
            className="px-5 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100 font-medium text-xs transition-colors flex items-center gap-2"
          >
            Continuar a Etapa 2
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
