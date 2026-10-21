import React, { useState } from 'react';
import { TOPICS_DATA, TopicItem } from '../data/topicsData';
import { BookOpen, Check, ArrowRight, X, Clock, Layers, Sparkles } from 'lucide-react';

interface TopicsCatalogueModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTopicId: string;
  onSelectTopic: (topicId: string) => void;
  classesProgressCount: number;
}

export const TopicsCatalogueModal: React.FC<TopicsCatalogueModalProps> = ({
  isOpen,
  onClose,
  currentTopicId,
  onSelectTopic,
  classesProgressCount,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  if (!isOpen) return null;

  const categories = [
    { id: 'all', label: 'Todos los temas' },
    { id: 'Fundamentos', label: 'Fundamentos' },
    { id: 'Control y Lógica', label: 'Control y Lógica' },
    { id: 'Modularidad', label: 'Modularidad' },
    { id: 'Programación Orientada a Objetos', label: 'POO' },
  ];

  const filteredTopics = TOPICS_DATA.filter((topic) => {
    const matchesCat =
      selectedCategory === 'all' || topic.category === selectedCategory;
    const matchesSearch =
      topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      topic.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      topic.badge.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-xs">
      <div
        className="bg-white rounded-2xl border border-zinc-200 shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-zinc-200 flex items-start justify-between bg-zinc-50/60">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 uppercase tracking-wider mb-1">
              <BookOpen className="w-4 h-4 text-zinc-700" />
              <span>Programa Curricular · Processing Java</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-zinc-900 tracking-tight">
              Seleccionar tema de estudio
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 mt-0.5">
              Explora los módulos del curso desde los fundamentos del lienzo hasta la POO y colecciones.
            </p>
          </div>
          <button
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200/60 transition-colors"
            title="Cerrar catálogo"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter bar */}
        <div className="px-5 sm:px-6 py-3 border-b border-zinc-200 bg-white flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Categories */}
          <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar w-full sm:w-auto py-1">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`min-h-[36px] px-3 py-1 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                  selectedCategory === cat.id
                    ? 'bg-zinc-900 text-white'
                    : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar tema, palabra clave..."
            className="min-h-[38px] w-full sm:w-64 px-3 py-1.5 text-xs bg-zinc-50 border border-zinc-200 rounded-lg placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900"
          />
        </div>

        {/* Topics Grid */}
        <div className="p-5 sm:p-6 overflow-y-auto custom-scrollbar space-y-3.5 flex-1 bg-zinc-50/30">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredTopics.map((topic) => {
              const isCurrent = topic.id === currentTopicId;
              const isClasses = topic.id === 'classes';

              return (
                <div
                  key={topic.id}
                  onClick={() => {
                    onSelectTopic(topic.id);
                    onClose();
                  }}
                  className={`p-4 sm:p-5 rounded-xl border transition-all text-left flex flex-col justify-between cursor-pointer group ${
                    isCurrent
                      ? 'bg-white border-zinc-900 shadow-sm ring-1 ring-zinc-900'
                      : 'bg-white border-zinc-200 hover:border-zinc-400 hover:shadow-xs'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs text-zinc-500 font-medium">
                        Tema 0{topic.number}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {isClasses && (
                          <span className="flex items-center gap-1 text-[11px] font-medium bg-zinc-100 text-zinc-900 border border-zinc-300 px-2 py-0.5 rounded">
                            <Sparkles className="w-3 h-3 text-zinc-800" />
                            Taller interactivo
                          </span>
                        )}
                        {topic.id === 'object-arrays' && (
                          <span className="flex items-center gap-1 text-[11px] font-medium bg-zinc-100 text-zinc-900 border border-zinc-300 px-2 py-0.5 rounded">
                            <Sparkles className="w-3 h-3 text-zinc-800" />
                            Laboratorio en vivo
                          </span>
                        )}
                        <span className="text-[11px] font-mono text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded">
                          {topic.badge}
                        </span>
                      </div>
                    </div>

                    <h3 className="font-semibold text-sm sm:text-base text-zinc-900 group-hover:text-black">
                      {topic.title}
                    </h3>

                    <p className="text-xs text-zinc-600 leading-relaxed line-clamp-2">
                      {topic.summary}
                    </p>
                  </div>

                  <div className="pt-4 mt-3 border-t border-zinc-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3 text-zinc-500 text-[11px]">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-zinc-400" />
                        {topic.estimatedTime}
                      </span>
                      <span className="flex items-center gap-1">
                        <Layers className="w-3 h-3 text-zinc-400" />
                        {topic.conceptsCount} {isClasses ? 'etapas' : 'conceptos'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 font-medium text-xs">
                      {isCurrent ? (
                        <span className="text-zinc-900 flex items-center gap-1 font-semibold">
                          <Check className="w-3.5 h-3.5 text-zinc-900" />
                          Tema activo
                        </span>
                      ) : (
                        <span className="text-zinc-600 group-hover:text-zinc-900 flex items-center gap-1">
                          Estudiar
                          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-zinc-50 border-t border-zinc-200 text-xs text-zinc-500 flex items-center justify-between">
          <span>{TOPICS_DATA.length} temas disponibles en el temario</span>
          <button
            onClick={onClose}
            className="min-h-[40px] px-4 py-1.5 rounded-lg bg-zinc-900 text-white text-xs font-medium hover:bg-black transition-colors"
          >
            Continuar con el tema seleccionado
          </button>
        </div>
      </div>
    </div>
  );
};
