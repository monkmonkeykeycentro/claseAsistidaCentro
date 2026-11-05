import React, { useState } from 'react';
import { ETAPA2_CARDS } from '../../data/stageData';
import { CardItem, ZoneId, DetailedToken } from '../../types/classStructure';
import { VisualRelationsPanel } from '../VisualRelationsPanel';
import { Check, ArrowRight, RotateCcw, Layers, Info } from 'lucide-react';
import { renderProcessingLine } from '../../utils/processingSyntax';

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
    <div className="space-y-8">
      {/* Stage Header */}
      <div className="border-b border-[#DCE7F2] pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#006699] bg-[#E2EEF8] px-2.5 py-0.5 rounded-full inline-block mb-1.5">
              Etapa 02
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0C2233]">
              Ubicar las partes de la clase
            </h2>
          </div>
          {isCompleted && (
            <div className="flex items-center gap-1.5 text-xs text-[#006699] font-semibold py-1 bg-[#E2EEF8] px-3 rounded-full">
              <Check className="w-3.5 h-3.5" />
              <span>Partes organizadas</span>
            </div>
          )}
        </div>
        <p className="text-sm text-[#4A6076] mt-2 max-w-2xl leading-relaxed">
          Ubica cada bloque de código en su sección dentro de la clase Gato usando los botones o arrastrándolos. Selecciona cualquier ficha para consultar su rol sintáctico.
        </p>
      </div>

      {feedbackMsg && (
        <div className="p-3.5 rounded-xl border border-[#DCE7F2] bg-white text-xs text-[#0C2233] flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-[#006699] shrink-0" />
            <span>{feedbackMsg}</span>
          </div>
          <button
            onClick={() => setFeedbackMsg(null)}
            className="text-[#4A6076] hover:text-[#0C2233] text-xs ml-4 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Cards to position & Token Inspector (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#4A6076] flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#006699]" />
              <span>Bloques a ubicar</span>
            </h3>
            <button
              onClick={handleResetPlacements}
              className="text-xs text-[#4A6076] hover:text-[#0C2233] flex items-center gap-1 cursor-pointer font-medium"
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
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-white border-[#006699] ring-2 ring-[#006699] shadow-xs'
                      : 'bg-white border-[#DCE7F2] hover:border-[#006699]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-xs text-[#0C2233]">
                      {card.name}
                    </span>
                    {currentZone ? (
                      <span className="text-[11px] font-mono text-[#006699] bg-[#E2EEF8] px-2 py-0.5 rounded-full font-semibold">
                        {zones.find((z) => z.id === currentZone)?.title}
                      </span>
                    ) : (
                      <span className="text-[11px] font-mono text-[#4A6076] bg-[#F4F8FB] px-2 py-0.5 rounded-full border border-[#DCE7F2]">
                        Pendiente
                      </span>
                    )}
                  </div>

                  <div className="p-3 bg-[#F4F8FB] rounded-xl font-mono text-xs overflow-x-auto whitespace-pre border border-[#DCE7F2] my-2 leading-relaxed">
                    {card.code.split('\n').map((line, lIdx) => (
                      <div key={lIdx}>{renderProcessingLine(line, lIdx)}</div>
                    ))}
                  </div>

                  {/* Placement buttons */}
                  <div className="pt-2.5 border-t border-[#DCE7F2]">
                    <div className="text-[11px] text-[#4A6076] mb-2 font-medium">
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
                          className={`min-h-[40px] px-2 py-1 text-xs rounded-xl transition-colors font-medium border cursor-pointer ${
                            currentZone === zone.id
                              ? 'bg-[#006699] text-white border-[#006699] font-bold shadow-xs'
                              : 'bg-white text-[#0C2233] hover:bg-[#E2EEF8] border-[#DCE7F2]'
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
          <div className="bg-white border border-[#DCE7F2] rounded-2xl p-4 sm:p-5 space-y-3 shadow-xs">
            <span className="text-xs font-bold text-[#0C2233] block">
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
                    className={`min-h-[38px] px-3 py-1.5 rounded-xl text-xs font-mono transition-colors border cursor-pointer ${
                      isTokSelected
                        ? 'bg-[#006699] border-[#006699] text-white font-bold shadow-xs'
                        : 'bg-[#F4F8FB] border-[#DCE7F2] text-[#0C2233] hover:bg-[#E2EEF8]'
                    }`}
                  >
                    {token.text}
                  </button>
                );
              })}
            </div>

            {selectedToken && (
              <div className="p-3 bg-[#F4F8FB] rounded-xl border border-[#DCE7F2] space-y-1 text-xs mt-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-[#0C2233]">
                    {selectedToken.text}
                  </span>
                  <span className="text-[10px] text-[#006699] bg-[#E2EEF8] px-2 py-0.5 rounded-full font-mono font-semibold uppercase">
                    {selectedToken.label}
                  </span>
                </div>
                <p className="text-[#4A6076] text-xs leading-relaxed pt-1">
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
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#4A6076]">
                Esqueleto de la clase Gato
              </h3>
              <span className="text-xs text-[#4A6076] font-mono">
                {Object.keys(placements).length}/{ETAPA2_CARDS.length} ubicadas
              </span>
            </div>

            <div className="bg-white border border-[#DCE7F2] rounded-2xl p-5 font-mono text-xs space-y-4 shadow-xs">
              <div className="text-[#0C2233] font-bold text-sm">
                <span className="text-[#E6B65A] font-bold">class</span> Gato <span className="text-[#4A6076] font-bold">{'{'}</span>
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
                        ? 'border-[#006699] bg-[#E2EEF8]/30'
                        : 'border-[#DCE7F2] bg-[#F4F8FB]/50 hover:border-[#006699]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[#4A6076] italic text-[11px] font-sans">
                        {zone.label}
                      </span>
                      <span className="text-[11px] text-[#006699] font-mono font-semibold">
                        {cardsInZone.length} bloque(s)
                      </span>
                    </div>

                    {cardsInZone.length === 0 ? (
                      <div className="py-4 text-center text-[#4A6076] text-xs font-sans">
                        Arrastra o pulsa un botón para ubicar aquí
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {cardsInZone.map((card) => (
                          <div
                            key={card.id}
                            onClick={() => setSelectedCardId(card.id)}
                            className={`p-3 rounded-xl bg-white border transition-all cursor-pointer ${
                              selectedCardId === card.id
                                ? 'border-[#006699] text-[#0C2233] shadow-xs ring-1 ring-[#006699]'
                                : 'border-[#DCE7F2] text-[#0C2233] hover:border-[#006699]'
                            }`}
                          >
                            <span className="text-xs font-sans font-bold text-[#0C2233] block mb-1">
                              {card.name}
                            </span>
                            <div className="text-xs whitespace-pre overflow-x-auto font-mono leading-relaxed">
                              {card.code.split('\n').map((line, lIdx) => (
                                <div key={lIdx}>{renderProcessingLine(line, lIdx)}</div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              <div className="text-[#4A6076] font-bold text-sm">{'}'}</div>
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
              className="min-h-[44px] px-6 py-2.5 rounded-xl bg-[#006699] hover:bg-[#00507A] text-white font-semibold text-xs sm:text-sm transition-colors flex items-center gap-2 shadow-xs cursor-pointer"
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
