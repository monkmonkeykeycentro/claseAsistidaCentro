import React, { useState } from 'react';
import { TopicItem, TOPICS_DATA } from '../data/topicsData';
import { P5LiveThumbnail } from './generative/P5LiveThumbnail';
import { BookOpen, Check, ArrowRight, X, Clock, Layers } from 'lucide-react';

interface TopicsCatalogueModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTopicId: string;
  onSelectTopic: (topicId: string) => void;
  classesProgressCount: number;
  topics?: TopicItem[];
  onNavigateUnits?: () => void;
}

export const TopicsCatalogueModal: React.FC<TopicsCatalogueModalProps> = ({
  isOpen,
  onClose,
  currentTopicId,
  onSelectTopic,
  topics,
  onNavigateUnits,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  if (!isOpen) return null;

  const allTopics = topics ?? TOPICS_DATA;

  const categories = [
    { id: 'all', label: 'Todos los temas' },
    { id: 'Fundamentos', label: 'Fundamentos' },
    { id: 'Control y Lógica', label: 'Control y Lógica' },
    { id: 'Modularidad', label: 'Modularidad' },
    { id: 'Programación Orientada a Objetos', label: 'POO' },
  ];

  const filteredTopics = allTopics.filter((topic) => {
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
        className="bg-[#F7F8F4] border border-[#E1E7E1] rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-[#E1E7E1] flex items-start justify-between bg-[#FFFFFF] rounded-t-3xl">
          <div>
            <div className="flex items-center gap-2 text-xs text-[#59645C] uppercase tracking-wider mb-1 font-semibold">
              <BookOpen className="w-4 h-4 text-[#407B5D]" />
              <span>Programa Curricular · Processing Java</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#232A24] tracking-tight">
              Temario del Curso
            </h2>
            <p className="text-xs text-[#59645C] mt-1">
              Explora los módulos estructurados desde los fundamentos visuales hasta POO y arreglos dinámicos.
            </p>
          </div>
          <button
            onClick={onClose}
            className="min-h-[40px] min-w-[40px] flex items-center justify-center border border-[#E1E7E1] bg-[#FFFFFF] hover:bg-[#E8EEE8] text-[#232A24] rounded-xl transition-colors cursor-pointer shadow-xs"
            title="Cerrar catálogo"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filter bar */}
        <div className="px-5 sm:px-6 py-3 border-b border-[#E1E7E1] bg-[#F7F8F4] flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Categories */}
          <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar w-full sm:w-auto py-1 text-xs">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`min-h-[34px] px-3.5 py-1.5 rounded-xl border transition-colors whitespace-nowrap cursor-pointer font-medium ${
                  selectedCategory === cat.id
                    ? 'bg-[#407B5D] text-white border-[#407B5D] font-bold shadow-xs'
                    : 'bg-[#FFFFFF] text-[#232A24] border-[#E1E7E1] hover:bg-[#E8EEE8]'
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
            placeholder="Buscar tema o palabra clave..."
            className="min-h-[36px] w-full sm:w-64 px-3.5 py-1.5 text-xs bg-[#FFFFFF] border border-[#E1E7E1] rounded-xl placeholder:text-[#59645C] text-[#232A24] focus:outline-none focus:border-[#407B5D] focus:ring-1 focus:ring-[#407B5D]"
          />
        </div>

        {/* Topics Grid */}
        <div className="p-5 sm:p-6 overflow-y-auto custom-scrollbar space-y-3.5 flex-1 bg-[#F7F8F4]">
          {onNavigateUnits && (
            <div className="p-4 bg-[#FFFFFF] border border-[#407B5D]/40 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#E8EEE8] text-[#407B5D] flex items-center justify-center shrink-0">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#232A24]">
                    Plan de Unidades Curriculares (14 Prácticas Interactivas)
                  </h4>
                  <p className="text-[11px] text-[#59645C]">
                    Unidad 1 (Fundamentos), Unidad 2 (Primeros pasos) y Unidad 3 (Variables).
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  onClose();
                  onNavigateUnits();
                }}
                className="min-h-[34px] px-3.5 py-1.5 bg-[#407B5D] hover:bg-[#33654C] text-white text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
              >
                <span>Explorar Unidades</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

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
                  className={`p-4 sm:p-5 rounded-2xl border transition-all text-left flex flex-col justify-between cursor-pointer group ${
                    isCurrent
                      ? 'bg-[#FFFFFF] border-[#407B5D] ring-2 ring-[#407B5D] shadow-xs'
                      : 'bg-[#FFFFFF] border-[#E1E7E1] hover:border-[#407B5D] hover:shadow-xs'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-[#59645C]">
                      <span className="font-bold text-[#232A24]">
                        Tema 0{topic.number}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {isClasses && (
                          <span className="text-[10px] font-bold bg-[#FFF2D6] text-[#8A6318] px-2 py-0.5 rounded-full">
                            Taller interactivo
                          </span>
                        )}
                        {topic.id === 'object-arrays' && (
                          <span className="text-[10px] font-bold bg-[#E8EEE8] text-[#407B5D] px-2 py-0.5 rounded-full">
                            Laboratorio en vivo
                          </span>
                        )}
                        <span className="text-[10px] bg-[#F7F8F4] border border-[#E1E7E1] px-2 py-0.5 rounded-full font-medium">
                          {topic.badge}
                        </span>
                      </div>
                    </div>

                    <h3 className="font-bold text-sm sm:text-base text-[#232A24] group-hover:text-[#407B5D] transition-colors">
                      {topic.title}
                    </h3>

                    {topic.thumbnailP5 && (
                      <div className="w-full flex justify-center bg-[#F7F8F4] p-1.5 rounded-xl border border-[#E1E7E1] overflow-hidden my-1">
                        <P5LiveThumbnail p5Code={topic.thumbnailP5} width={260} height={90} interactive={false} />
                      </div>
                    )}

                    <p className="text-xs text-[#59645C] leading-relaxed line-clamp-2">
                      {topic.summary}
                    </p>
                  </div>

                  <div className="pt-3 mt-3 border-t border-[#E1E7E1] flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3 text-[#59645C] text-[11px]">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#59645C]" />
                        {topic.estimatedTime}
                      </span>
                      <span className="flex items-center gap-1">
                        <Layers className="w-3 h-3 text-[#59645C]" />
                        {topic.conceptsCount} {isClasses ? 'etapas' : 'conceptos'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 font-semibold text-xs">
                      {isCurrent ? (
                        <span className="text-[#407B5D] flex items-center gap-1 font-bold">
                          <Check className="w-3.5 h-3.5 text-[#407B5D]" />
                          Tema activo
                        </span>
                      ) : (
                        <span className="text-[#59645C] group-hover:text-[#407B5D] flex items-center gap-1">
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
        <div className="p-4 bg-[#FFFFFF] border-t border-[#E1E7E1] text-xs text-[#59645C] flex items-center justify-between rounded-b-3xl">
          <span className="font-medium">{allTopics.length} lecciones disponibles</span>
          <button
            onClick={onClose}
            className="min-h-[38px] px-4 py-2 bg-[#407B5D] hover:bg-[#33654C] text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer shadow-xs"
          >
            Cerrar catálogo
          </button>
        </div>
      </div>
    </div>
  );
};
