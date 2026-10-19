import React, { useState } from 'react';
import { ETAPA2_CARDS } from '../../data/stageData';
import { CardItem, ZoneId, DetailedToken } from '../../types/classStructure';
import { VisualRelationsPanel } from '../VisualRelationsPanel';
import { Check, ArrowRight, RotateCcw, Layers, Info } from 'lucide-react';

interface Stage2Props {
  onComplete: () => void;
  isCompleted: boolean;
  onGoNext: () => void;
  initialPlacements?: Record<string, ZoneId>;
  onSavePlacements?: (placements: Record<string, ZoneId>) => void;
}

export const Stage2Placement: React.FC<Stage2Props> = ({
  onComplete,
  isCompleted,
  onGoNext,
  initialPlacements = {},
  onSavePlacements,
}) => {
  const [placements, setPlacements] = useState<Record<string, ZoneId>>(initialPlacements);
  const [selectedCardId, setSelectedCardId] = useState<string>('card-fields');
  const [selectedToken, setSelectedToken] = useState<DetailedToken | null>(null);
  const [activeRelation, setActiveRelation] = useState<'assignment' | 'constructor-match' | 'method-structure' | null>('assignment');
  const [draggedCardId, setDraggedCardId] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const zones: Array<{ id: ZoneId; title: string; label: string }> = [
    {
      id: 'fields',
      title: 'Campos o atributos',
      label: '// Campos o atributos',
    },
    {
      id: 'constructor',
      title: 'Constructor',
      label: '// Constructor',
    },
    {
      id: 'methods',
      title: 'Métodos',
      label: '// Métodos',
    },
  ];

  const handlePlaceCard = (cardId: string, zoneId: ZoneId) => {
    const card = ETAPA2_CARDS.find((c) => c.id === cardId);
    const newPlacements = { ...placements, [cardId]: zoneId };
    setPlacements(newPlacements);
    onSavePlacements?.(newPlacements);

    if (card) {
      if (card.correctZone === zoneId) {
        setFeedbackMsg(`"${card.name}" ubicada correctamente.`);
      } else {
        setFeedbackMsg(`"${card.name}" suele ubicarse didácticamente en "${zones.find((z) => z.id === card.correctZone)?.title}".`);
      }
    }

    const allPlacedCorrectly = ETAPA2_CARDS.every(
      (c) => newPlacements[c.id] === c.correctZone
    );
    if (allPlacedCorrectly) {
      onComplete();
    }
  };

  const handleResetPlacements = () => {
    setPlacements({});
    onSavePlacements?.({});
    setFeedbackMsg(null);
  };

  const selectedCard = ETAPA2_CARDS.find((c) => c.id === selectedCardId) || ETAPA2_CARDS[0];

  return (
    <div className="space-y-10">
      {/* Stage Header */}
      <div className="border-b border-zinc-200 pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider block">
              Etapa 02
            </span>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-900 mt-1">
              Ubicar las partes de la clase
            </h2>
          </div>
          {isCompleted && (
            <div className="flex items-center gap-1.5 text-xs text-zinc-600 font-mono py-1">
              <Check className="w-3.5 h-3.5 text-zinc-900" />
              <span>Partes organizadas</span>
            </div>
          )}
        </div>
        <p className="text-sm text-zinc-600 mt-2 max-w-2xl leading-relaxed">
          Ubica cada bloque de código en su sección dentro de la clase Gato usando los botones o arrastrándolos. Selecciona cualquier ficha para consultar su rol sintáctico.
        </p>
      </div>

      {feedbackMsg && (
        <div className="p-3.5 rounded-xl border border-zinc-200 bg-zinc-50 text-xs text-zinc-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-zinc-500 shrink-0" />
            <span>{feedbackMsg}</span>
          </div>
          <button
            onClick={() => setFeedbackMsg(null)}
            className="text-zinc-400 hover:text-zinc-700 text-xs ml-4"
          >
            ✕
          </button>
        </div>
      )}

      {/* Spacious 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Cards to position & Token Inspector (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              Bloques a ubicar
            </h3>
            <button
              onClick={handleResetPlacements}
              className="text-xs text-zinc-500 hover:text-zinc-900 flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reiniciar</span>
            </button>
          </div>

          <div className="space-y-3.5">
            {ETAPA2_CARDS.map((card) => {
              const currentZone = placements[card.id];
              const isSelected = selectedCardId === card.id;

              return (
                <div
                  key={card.id}
                  draggable
                  onDragStart={() => setDraggedCardId(card.id)}
                  onClick={() => setSelectedCardId(card.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-white border-zinc-900 shadow-xs'
                      : 'bg-white border-zinc-200 hover:border-zinc-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-xs text-zinc-900">
                      {card.name}
                    </span>
                    {currentZone ? (
                      <span className="text-[11px] font-mono text-zinc-600 bg-zinc-100 px-2 py-0.5 rounded">
                        {zones.find((z) => z.id === currentZone)?.title}
                      </span>
                    ) : (
                      <span className="text-[11px] font-mono text-zinc-400">
                        Pendiente
                      </span>
                    )}
                  </div>

                  <pre className="p-3 bg-zinc-50 rounded-lg text-zinc-800 font-mono text-xs overflow-x-auto whitespace-pre border border-zinc-200 my-2 leading-relaxed">
                    {card.code}
                  </pre>

                  {/* Quick placement buttons with 44px min touch height */}
                  <div className="pt-2.5 border-t border-zinc-100">
                    <div className="text-[11px] text-zinc-500 mb-2">
                      Colocar en:
                    </div>
                    <div className="grid grid-cols-3 gap-1.5">
                      {zones.map((zone) => (
                        <button
                          key={zone.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePlaceCard(card.id, zone.id);
                          }}
                          className={`min-h-[44px] px-2 py-1 text-xs rounded-lg transition-colors font-medium border ${
                            currentZone === zone.id
                              ? 'bg-zinc-900 text-white border-zinc-900'
                              : 'bg-zinc-50 text-zinc-700 hover:bg-zinc-100 border-zinc-200'
                          }`}
                        >
                          {zone.title.split(' ')[0]}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Tokens inspection card for selected block */}
          <div className="bg-white border border-zinc-200 rounded-xl p-4 sm:p-5 space-y-3">
            <span className="text-xs font-semibold text-zinc-900 block">
              Tokens en {selectedCard.name}:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {selectedCard.tokens.map((token) => {
                const isTokSelected = selectedToken?.id === token.id;
                return (
                  <button
                    key={token.id}
                    onClick={() => {
                      setSelectedToken(token);
                      if (token.relationGroup === 'assign-nombre') {
                        setActiveRelation('assignment');
                      } else if (token.relationGroup === 'class-match') {
                        setActiveRelation('constructor-match');
                      }
                    }}
                    className={`min-h-[44px] px-3 py-1.5 rounded-lg text-xs font-mono transition-colors border ${
                      isTokSelected
                        ? 'bg-zinc-900 border-zinc-900 text-white font-bold'
                        : 'bg-zinc-50 border-zinc-200 text-zinc-800 hover:bg-zinc-100'
                    }`}
                  >
                    {token.text}
                  </button>
                );
              })}
            </div>

            {selectedToken && (
              <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-200 space-y-1 text-xs mt-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-zinc-900">
                    {selectedToken.text}
                  </span>
                  <span className="text-[10px] text-zinc-500 font-mono uppercase">
                    {selectedToken.label}
                  </span>
                </div>
                <p className="text-zinc-600 text-xs leading-relaxed pt-1">
                  {selectedToken.explanation}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Class skeleton and Relational view (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Esqueleto de la clase Gato
              </h3>
              <span className="text-xs text-zinc-400 font-mono">
                {Object.keys(placements).length}/{ETAPA2_CARDS.length} ubicadas
              </span>
            </div>

            <div className="bg-[#fcfcfd] border border-zinc-200 rounded-xl p-5 font-mono text-xs space-y-4">
              <div className="text-zinc-900 font-bold text-sm">
                class Gato <span className="text-zinc-500">{'{'}</span>
              </div>

              {/* Drop Zones */}
              {zones.map((zone) => {
                const cardsInZone = ETAPA2_CARDS.filter(
                  (c) => placements[c.id] === zone.id
                );

                return (
                  <div
                    key={zone.id}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => {
                      if (draggedCardId) {
                        handlePlaceCard(draggedCardId, zone.id);
                        setDraggedCardId(null);
                      }
                    }}
                    className={`p-4 rounded-xl border border-dashed transition-colors ml-2 sm:ml-4 ${
                      cardsInZone.length > 0
                        ? 'border-zinc-300 bg-white'
                        : 'border-zinc-200 bg-zinc-50/50 hover:border-zinc-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-zinc-500 italic text-[11px]">
                        {zone.label}
                      </span>
                      <span className="text-[11px] text-zinc-400 font-mono">
                        {cardsInZone.length} bloque(s)
                      </span>
                    </div>

                    {cardsInZone.length === 0 ? (
                      <div className="py-4 text-center text-zinc-400 text-xs font-sans">
                        Arrastra o pulsa un botón para ubicar aquí
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {cardsInZone.map((card) => (
                          <div
                            key={card.id}
                            onClick={() => setSelectedCardId(card.id)}
                            className={`p-3 rounded-lg bg-zinc-50 border transition-all cursor-pointer ${
                              selectedCardId === card.id
                                ? 'border-zinc-900 text-zinc-900'
                                : 'border-zinc-200 text-zinc-700 hover:border-zinc-300'
                            }`}
                          >
                            <span className="text-xs font-sans font-semibold text-zinc-900 block mb-1">
                              {card.name}
                            </span>
                            <pre className="text-xs whitespace-pre overflow-x-auto text-zinc-800 font-mono">
                              {card.code}
                            </pre>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              <div className="text-zinc-500 font-bold text-sm">{'}'}</div>
            </div>
          </div>

          {/* Relational view */}
          <VisualRelationsPanel
            activeRelation={activeRelation}
            onSelectRelation={(rel) => setActiveRelation(rel)}
            selectedTokenInfo={
              selectedToken
                ? {
                    token: selectedToken.text,
                    label: selectedToken.label,
                    explanation: selectedToken.explanation,
                  }
                : null
            }
          />

          {/* Navigation Action */}
          <div className="flex items-center justify-end pt-2">
            <button
              onClick={onGoNext}
              className="min-h-[44px] px-6 py-2.5 rounded-lg bg-zinc-900 hover:bg-black text-white font-medium text-xs sm:text-sm transition-colors flex items-center gap-2"
            >
              <span>Ir a Etapa 3: Completar sintaxis</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
