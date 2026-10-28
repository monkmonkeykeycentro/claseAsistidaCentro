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
        className="bg-[#F6F5F0] border border-[#DCDDD8] shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-[#DCDDD8] flex items-start justify-between bg-[#EEEDE8]">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#767773] uppercase tracking-wider mb-1">
              <BookOpen className="w-4 h-4 text-[#181818]" />
              <span>Programa Curricular · Processing Java</span>
            </div>
            <h2 className="text-xl font-semibold text-[#181818] tracking-tight font-sans">
              Temario del Curso
            </h2>
            <p className="text-xs text-[#555652] mt-0.5 font-sans">
              Explora los módulos estructurados desde los fundamentos visuales hasta POO y arreglos dinámicos.
            </p>
          </div>
          <button
            onClick={onClose}
            className="min-h-[40px] min-w-[40px] flex items-center justify-center border border-[#DCDDD8] bg-[#FFFFFF] hover:bg-[#DCDDD8] text-[#181818] transition-colors cursor-pointer"
            title="Cerrar catálogo"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filter bar */}
        <div className="px-5 sm:px-6 py-3 border-b border-[#DCDDD8] bg-[#F6F5F0] flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Categories */}
          <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar w-full sm:w-auto py-1 font-mono text-xs">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`min-h-[34px] px-3 py-1 border transition-colors whitespace-nowrap cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-[#181818] text-[#F6F5F0] border-[#181818] font-bold'
                    : 'bg-[#FFFFFF] text-[#181818] border-[#DCDDD8] hover:border-[#181818]'
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
            className="min-h-[36px] w-full sm:w-64 px-3 py-1 text-xs font-mono bg-[#FFFFFF] border border-[#DCDDD8] placeholder:text-[#767773] text-[#181818] focus:outline-none focus:border-[#4263CF]"
          />
        </div>

        {/* Topics Grid */}
        <div className="p-5 sm:p-6 overflow-y-auto custom-scrollbar space-y-3.5 flex-1 bg-[#F6F5F0]">
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
                      ? 'bg-[#FFFFFF] border-[#181818] ring-1 ring-[#181818]'
                      : 'bg-[#FFFFFF] border-[#DCDDD8] hover:border-[#181818]'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between font-mono text-xs text-[#767773]">
                      <span className="font-bold text-[#181818]">
                        Tema 0{topic.number}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {isClasses && (
                          <span className="text-[10px] font-bold bg-[#D5E35F] text-[#181818] border border-[#181818] px-1.5 py-0.5">
                            Taller interactivo
                          </span>
                        )}
                        {topic.id === 'object-arrays' && (
                          <span className="text-[10px] font-bold bg-[#4263CF] text-[#F6F5F0] px-1.5 py-0.5">
                            Laboratorio en vivo
                          </span>
                        )}
                        <span className="text-[10px] bg-[#EEEDE8] border border-[#DCDDD8] px-1.5 py-0.5">
                          {topic.badge}
                        </span>
                      </div>
                    </div>

                    <h3 className="font-semibold text-sm sm:text-base text-[#181818] group-hover:text-[#4263CF] transition-colors font-sans">
                      {topic.title}
                    </h3>

                    <p className="text-xs text-[#555652] leading-relaxed line-clamp-2 font-sans">
                      {topic.summary}
                    </p>
                  </div>

                  <div className="pt-3 mt-3 border-t border-[#DCDDD8] flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-3 text-[#767773] text-[11px]">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#767773]" />
                        {topic.estimatedTime}
                      </span>
                      <span className="flex items-center gap-1">
                        <Layers className="w-3 h-3 text-[#767773]" />
                        {topic.conceptsCount} {isClasses ? 'etapas' : 'conceptos'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 font-medium text-xs">
                      {isCurrent ? (
                        <span className="text-[#181818] flex items-center gap-1 font-bold">
                          <Check className="w-3.5 h-3.5 text-[#4263CF]" />
                          Tema activo
                        </span>
                      ) : (
                        <span className="text-[#767773] group-hover:text-[#181818] flex items-center gap-1">
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
        <div className="p-4 bg-[#EEEDE8] border-t border-[#DCDDD8] text-xs font-mono text-[#767773] flex items-center justify-between">
          <span>{TOPICS_DATA.length} módulos disponibles</span>
          <button
            onClick={onClose}
            className="min-h-[38px] px-4 py-1.5 bg-[#181818] hover:bg-[#4263CF] text-[#F6F5F0] text-xs font-mono transition-colors cursor-pointer"
          >
            Cerrar catálogo
          </button>
        </div>
      </div>
    </div>
  );
};
