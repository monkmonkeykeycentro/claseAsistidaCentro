import React, { useState } from 'react';
import { TOPICS_DATA } from '../data/topicsData';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/50 backdrop-blur-xs">
      <div
        className="bg-[#F7F7F2] border border-[#E3E3DD] shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-[#E3E3DD] flex items-start justify-between bg-[#FFFFFF]">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#666666] uppercase tracking-wider mb-1">
              <BookOpen className="w-4 h-4 text-[#171717]" />
              <span>Programa Curricular · Processing Java</span>
            </div>
            <h2 className="text-xl font-semibold text-[#171717] tracking-tight font-sans">
              Temario del Curso
            </h2>
            <p className="text-xs text-[#666666] mt-0.5 font-sans">
              Explora los módulos estructurados desde los fundamentos visuales hasta POO y arreglos dinámicos.
            </p>
          </div>
          <button
            onClick={onClose}
            className="min-h-[40px] min-w-[40px] flex items-center justify-center border border-[#E3E3DD] bg-[#FFFFFF] hover:bg-[#F7F7F2] text-[#171717] transition-colors cursor-pointer"
            title="Cerrar catálogo"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filter bar */}
        <div className="px-5 sm:px-6 py-3 border-b border-[#E3E3DD] bg-[#F7F7F2] flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Categories */}
          <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar w-full sm:w-auto py-1 font-mono text-xs">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`min-h-[34px] px-3 py-1 border transition-colors whitespace-nowrap cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-[#171717] text-[#F7F7F2] border-[#171717] font-bold'
                    : 'bg-[#FFFFFF] text-[#171717] border-[#E3E3DD] hover:border-[#171717]'
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
            className="min-h-[36px] w-full sm:w-64 px-3 py-1 text-xs font-mono bg-[#FFFFFF] border border-[#E3E3DD] placeholder:text-[#666666] text-[#171717] focus:outline-none focus:border-[#2779BD]"
          />
        </div>

        {/* Topics Grid */}
        <div className="p-5 sm:p-6 overflow-y-auto custom-scrollbar space-y-3.5 flex-1 bg-[#F7F7F2]">
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
                  className={`p-4 sm:p-5 border transition-all text-left flex flex-col justify-between cursor-pointer group ${
                    isCurrent
                      ? 'bg-[#FFFFFF] border-[#171717] ring-1 ring-[#171717]'
                      : 'bg-[#FFFFFF] border-[#E3E3DD] hover:border-[#171717]'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between font-mono text-xs text-[#666666]">
                      <span className="font-bold text-[#171717]">
                        Tema 0{topic.number}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {isClasses && (
                          <span className="text-[10px] font-bold bg-[#E0A52D] text-[#171717] border border-[#171717] px-1.5 py-0.5">
                            Taller interactivo
                          </span>
                        )}
                        {topic.id === 'object-arrays' && (
                          <span className="text-[10px] font-bold bg-[#2779BD] text-[#F7F7F2] px-1.5 py-0.5">
                            Laboratorio en vivo
                          </span>
                        )}
                        <span className="text-[10px] bg-[#F7F7F2] border border-[#E3E3DD] px-1.5 py-0.5">
                          {topic.badge}
                        </span>
                      </div>
                    </div>

                    <h3 className="font-semibold text-sm sm:text-base text-[#171717] group-hover:text-[#2779BD] transition-colors font-sans">
                      {topic.title}
                    </h3>

                    <p className="text-xs text-[#666666] leading-relaxed line-clamp-2 font-sans">
                      {topic.summary}
                    </p>
                  </div>

                  <div className="pt-3 mt-3 border-t border-[#E3E3DD] flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-3 text-[#666666] text-[11px]">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#666666]" />
                        {topic.estimatedTime}
                      </span>
                      <span className="flex items-center gap-1">
                        <Layers className="w-3 h-3 text-[#666666]" />
                        {topic.conceptsCount} {isClasses ? 'etapas' : 'conceptos'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 font-medium text-xs">
                      {isCurrent ? (
                        <span className="text-[#171717] flex items-center gap-1 font-bold">
                          <Check className="w-3.5 h-3.5 text-[#2779BD]" />
                          Tema activo
                        </span>
                      ) : (
                        <span className="text-[#666666] group-hover:text-[#171717] flex items-center gap-1">
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
        <div className="p-4 bg-[#FFFFFF] border-t border-[#E3E3DD] text-xs font-mono text-[#666666] flex items-center justify-between">
          <span>{TOPICS_DATA.length} módulos disponibles</span>
          <button
            onClick={onClose}
            className="min-h-[38px] px-4 py-1.5 bg-[#171717] hover:bg-[#2779BD] text-[#F7F7F2] text-xs font-mono transition-colors cursor-pointer"
          >
            Cerrar catálogo
          </button>
        </div>
      </div>
    </div>
  );
};
