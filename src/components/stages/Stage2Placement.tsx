import React, { useState } from 'react';
import { ETAPA2_CARDS } from '../../data/stageData';
import { CardItem, ZoneId, DetailedToken } from '../../types/classStructure';
import { VisualRelationsPanel } from '../VisualRelationsPanel';
import { CheckCircle2, ArrowRight, RotateCcw, HelpCircle, Layers, MousePointer } from 'lucide-react';

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
  // Placement map: cardId -> zoneId | null
  const [placements, setPlacements] = useState<Record<string, ZoneId>>(initialPlacements);
  const [selectedCardId, setSelectedCardId] = useState<string>('card-fields');
  const [selectedToken, setSelectedToken] = useState<DetailedToken | null>(null);
  const [activeRelation, setActiveRelation] = useState<'assignment' | 'constructor-match' | 'method-structure' | null>('assignment');
  const [draggedCardId, setDraggedCardId] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'warning' | 'info'; text: string } | null>(null);

  const zones: Array<{ id: ZoneId; title: string; subtitle: string; label: string }> = [
    {
      id: 'fields',
      title: '1. Campos o atributos',
      subtitle: 'Variables que guardan el estado de la instancia',
      label: '// Campos o atributos',
    },
    {
      id: 'constructor',
      title: '2. Constructor',
      subtitle: 'Inicializa los atributos con los parámetros recibidos',
      label: '// Constructor',
    },
    {
      id: 'methods',
      title: '3. Métodos',
      subtitle: 'Comportamientos y acciones de la clase',
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
        setFeedbackMsg({
          type: 'success',
          text: `¡Correcto! "${card.name}" pertenece a la sección de ${zones.find((z) => z.id === zoneId)?.title}.`,
        });
      } else {
        setFeedbackMsg({
          type: 'warning',
          text: `"${card.name}" suele ubicarse en "${zones.find((z) => z.id === card.correctZone)?.title}". En Java el compilador es flexible, pero didácticamente se recomienda colocarla allí.`,
        });
      }
    }

    // Check completion: all 4 cards placed in their correct zone
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
    setFeedbackMsg({
      type: 'info',
      text: 'Se han reiniciado las ubicaciones. Vuelve a colocar cada tarjeta.',
    });
  };

  const selectedCard = ETAPA2_CARDS.find((c) => c.id === selectedCardId) || ETAPA2_CARDS[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-800 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">
                Etapa 2
              </span>
              <span className="text-slate-500">·</span>
              <span className="text-xs text-slate-400">Organización y tokens</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-100 mt-1">
              Ubicar las partes de la clase Gato
            </h2>
          </div>
          {isCompleted && (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-950/60 border border-emerald-500/40 rounded-full text-xs font-medium text-emerald-300">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Todas las partes ubicadas
            </div>
          )}
        </div>
        <p className="text-sm text-slate-300 mt-2 max-w-3xl leading-relaxed">
          Coloca cada bloque de código en su sección correspondiente dentro de la clase. Puedes usar los botones de acción rápida o arrastrar la tarjeta. Además, haz clic en cualquier elemento para inspeccionar su tipo, nombre y rol sintáctico.
        </p>
      </div>

      {feedbackMsg && (
        <div
          className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-200'
              : feedbackMsg.type === 'warning'
              ? 'bg-amber-950/50 border-amber-500/40 text-amber-200'
              : 'bg-cyan-950/50 border-cyan-500/40 text-cyan-200'
          }`}
        >
          <span>{feedbackMsg.text}</span>
          <button
            onClick={() => setFeedbackMsg(null)}
            className="text-slate-400 hover:text-white text-xs underline ml-4"
          >
            Entendido
          </button>
        </div>
      )}

      {/* 3-Area Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Area 1: Elementos disponibles (Cards to place) (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              1. Tarjetas disponibles
            </h3>
            <button
              onClick={handleResetPlacements}
              className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              Reiniciar
            </button>
          </div>

          <div className="space-y-3">
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
                      ? 'bg-slate-800/90 border-cyan-500 shadow-md shadow-cyan-950/30'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-xs text-slate-200">
                      {card.name}
                    </span>
                    {currentZone ? (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-medium">
                        Ubicado en {zones.find((z) => z.id === currentZone)?.title.split('.')[1]}
                      </span>
                    ) : (
                      <span className="text-[10px] text-amber-400 font-mono">
                        Pendiente
                      </span>
                    )}
                  </div>

                  {/* Code snippet inside card */}
                  <pre className="p-2.5 bg-slate-950 rounded-lg text-slate-200 font-mono text-xs overflow-x-auto whitespace-pre border border-slate-800/80 my-2">
                    {card.code}
                  </pre>

                  <div className="text-[11px] text-slate-400 mb-3">
                    {card.previewNote}
                  </div>

                  {/* Quick placement buttons */}
                  <div className="pt-2 border-t border-slate-800/80">
                    <div className="text-[10px] text-slate-500 mb-1.5 font-medium">
                      Ubicar mediante botones:
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      {zones.map((zone) => (
                        <button
                          key={zone.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePlaceCard(card.id, zone.id);
                          }}
                          className={`px-2 py-1 text-[10px] rounded transition-colors font-medium ${
                            currentZone === zone.id
                              ? 'bg-cyan-600 text-white'
                              : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                          }`}
                        >
                          {zone.id === 'fields' ? 'Campos' : zone.id === 'constructor' ? 'Constructor' : 'Métodos'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Area 2: Espacio para construir la clase (Canvas with drop zones) (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              2. Esqueleto de la clase Gato
            </h3>
            <span className="text-xs text-slate-500 font-mono">class Gato {'{ ... }'}</span>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 font-mono text-xs space-y-3">
            {/* Class Header */}
            <div className="text-amber-400 font-bold text-sm">
              class Gato <span className="text-slate-100">{'{'}</span>
            </div>

            {/* Drop Zones for each part */}
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
                  className={`p-3.5 rounded-xl border border-dashed transition-all ml-4 ${
                    cardsInZone.length > 0
                      ? 'border-slate-700 bg-slate-900/60'
                      : 'border-slate-800 bg-slate-900/20 hover:border-cyan-500/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-500 italic text-[11px]">
                      {zone.label}
                    </span>
                    <span className="text-[10px] text-slate-400 font-sans">
                      {cardsInZone.length} bloque(s)
                    </span>
                  </div>

                  {cardsInZone.length === 0 ? (
                    <div className="py-4 text-center text-slate-600 text-xs font-sans">
                      Arrastra aquí o pulsa el botón correspondiente
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {cardsInZone.map((card) => (
                        <div
                          key={card.id}
                          onClick={() => setSelectedCardId(card.id)}
                          className={`p-2.5 rounded-lg bg-slate-950 border transition-all cursor-pointer ${
                            selectedCardId === card.id
                              ? 'border-cyan-500 text-cyan-100'
                              : 'border-slate-800 text-slate-200 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[11px] font-sans font-semibold text-slate-300">
                              {card.name}
                            </span>
                            <span className="text-[10px] text-cyan-400 font-sans flex items-center gap-1">
                              <MousePointer className="w-3 h-3" />
                              Clic para inspeccionar
                            </span>
                          </div>
                          <pre className="text-xs whitespace-pre overflow-x-auto text-emerald-300">
                            {card.code}
                          </pre>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Class Footer */}
            <div className="text-slate-100 font-bold text-sm">{'}'}</div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-slate-400">
              Progreso: {Object.keys(placements).length} de {ETAPA2_CARDS.length} tarjetas ubicadas
            </span>
            <button
              onClick={onGoNext}
              className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs transition-colors flex items-center gap-1.5"
            >
              Continuar a Etapa 3
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Area 3: Explicación contextual e Inspector de Tokens (3 cols) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              3. Identificador de partes
            </h3>
            <span className="text-xs text-cyan-400 font-medium">Inspección</span>
          </div>

          {/* Tokens of selected card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
            <div>
              <span className="text-xs font-bold text-slate-200">
                Elementos identificables en {selectedCard.name}:
              </span>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Selecciona cualquier token para entender su tipo y función:
              </p>
            </div>

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
                    className={`px-2 py-1 rounded text-xs font-mono transition-all border ${
                      isTokSelected
                        ? 'bg-cyan-500/30 border-cyan-400 text-cyan-200 ring-1 ring-cyan-400'
                        : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    {token.text}
                  </button>
                );
              })}
            </div>

            {selectedToken ? (
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-cyan-300">
                    {selectedToken.text}
                  </span>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wide">
                    {selectedToken.label}
                  </span>
                </div>
                <p className="text-slate-300 text-xs leading-relaxed pt-1">
                  {selectedToken.explanation}
                </p>
              </div>
            ) : (
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-[11px] text-slate-500 text-center">
                Haz clic en una ficha para ver su definición
              </div>
            )}
          </div>

          {/* Visual relations summary */}
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
        </div>
      </div>
    </div>
  );
};
