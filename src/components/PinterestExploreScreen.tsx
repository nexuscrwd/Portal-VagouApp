import React, { useState, useMemo } from 'react';
import { Search, MapPin, Heart, Zap, Compass, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { ServiceOffer } from '../types';
import { VagouLogo } from './VagouLogo';

interface PinterestExploreScreenProps {
  offers: ServiceOffer[];
  onSelectOffer: (offer: ServiceOffer) => void;
  onConfirmBooking: (offer: ServiceOffer) => void;
  favorites?: string[];
  onToggleFavorite?: (id: string) => void;
}

export const PinterestExploreScreen: React.FC<PinterestExploreScreenProps> = ({
  offers,
  onSelectOffer,
  onConfirmBooking,
  favorites = [],
  onToggleFavorite,
}) => {
  const [query, setQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<string>('todos');

  const categories = [
    { id: 'todos', label: 'Tudo' },
    { id: 'cabelo', label: 'Cabelos' },
    { id: 'barba', label: 'Barbas' },
    { id: 'unhas', label: 'Unhas' },
    { id: 'beleza', label: 'Sobrancelhas' },
    { id: 'estetica', label: 'Estética' },
  ];

  const neighborhoods = useMemo(() => {
    const list = Array.from(new Set(offers.map((o) => o.neighborhood.split(',')[0].trim())));
    return ['todos', ...list];
  }, [offers]);

  const filteredOffers = useMemo(() => {
    let list = [...offers];

    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (o) =>
          o.salonName.toLowerCase().includes(q) ||
          o.serviceTitle.toLowerCase().includes(q) ||
          o.professionalName.toLowerCase().includes(q) ||
          o.neighborhood.toLowerCase().includes(q)
      );
    }

    if (selectedCategory !== 'todos') {
      list = list.filter((o) => o.serviceCategory === selectedCategory);
    }

    if (selectedNeighborhood !== 'todos') {
      list = list.filter((o) => o.neighborhood.toLowerCase().includes(selectedNeighborhood.toLowerCase()));
    }

    return list;
  }, [offers, query, selectedCategory, selectedNeighborhood]);

  // Divisão em 2 colunas para efeito Masonry autêntico (Pinterest)
  const leftColumn = useMemo(
    () => filteredOffers.filter((_, idx) => idx % 2 === 0),
    [filteredOffers]
  );
  const rightColumn = useMemo(
    () => filteredOffers.filter((_, idx) => idx % 2 === 1),
    [filteredOffers]
  );

  const renderPinCard = (offer: ServiceOffer, index: number) => {
    const isFavorite = favorites.includes(offer.id);
    // Variação orgânica de altura para o efeito Pinterest (aspect-ratio diferenciado)
    const aspectClass = index % 3 === 0 ? 'aspect-[3/4.2]' : index % 2 === 0 ? 'aspect-[3/3.6]' : 'aspect-[3/4.8]';

    return (
      <div
        key={offer.id}
        onClick={() => onSelectOffer(offer)}
        className="group relative flex flex-col rounded-2xl overflow-hidden bg-slate-900 border border-slate-800/80 shadow-md hover:border-slate-700 transition cursor-pointer mb-3"
      >
        {/* Imagem do Pin com Aspecto Dinâmico */}
        <div className={`relative w-full ${aspectClass} overflow-hidden bg-slate-950`}>
          <img
            src={offer.imageUrl}
            alt={offer.serviceTitle}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            referrerPolicy="no-referrer"
            loading="lazy"
          />

          {/* Gradiente sutil inferior na imagem */}
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />

          {/* Micro Tag de Preço Flutuante */}
          <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-lg border border-white/10 text-[11px] font-black text-emerald-400 font-mono">
            R$ {offer.price.toFixed(0)}
          </div>

          {/* Botão de Favoritar (Estilo Pin do Pinterest) */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite?.(offer.id);
            }}
            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:scale-110 active:scale-95 transition"
            aria-label="Salvar inspiração"
          >
            <Heart
              className={`w-3.5 h-3.5 transition-colors ${
                isFavorite ? 'fill-rose-500 text-rose-500' : 'text-white'
              }`}
            />
          </button>

          {/* Horário da Vaga Rápida */}
          <div className="absolute bottom-1.5 left-2 right-2 flex items-center justify-between text-[10px] text-slate-200">
            <span className="truncate font-mono font-bold text-emerald-300">
              {offer.timeSlot.replace('Hoje • ', '').replace('Amanhã • ', '')}
            </span>
            <span className="text-slate-300 shrink-0 font-medium">
              {offer.distance.split(' ')[0]}m
            </span>
          </div>
        </div>

        {/* Rodapé do Pin: Título e Salão */}
        <div className="p-2.5 flex flex-col gap-1">
          <h4 className="text-xs font-bold text-white line-clamp-1 leading-snug">
            {offer.serviceTitle}
          </h4>

          <div className="flex items-center justify-between gap-1 mt-0.5">
            <span className="text-[10px] text-slate-400 truncate max-w-[100px]">
              {offer.salonName}
            </span>

            {/* Ação Rápida de Agendamento */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onConfirmBooking(offer);
              }}
              className="p-1 rounded-md bg-[#20C933] hover:bg-[#1bb32d] text-white transition active:scale-90"
              title="Agendar vaga"
            >
              <Zap className="w-3 h-3 fill-white text-white" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen pb-24 bg-slate-950 text-slate-100">
      {/* Top Header Fixo */}
      <div className="sticky top-0 z-30 bg-[#151A1E]/95 backdrop-blur-md border-b border-slate-800">
        <div className="px-4 py-3 flex items-center justify-between gap-2">
          <VagouLogo size="sm" variant="full" />
          <span className="text-[11px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full">
            Inspiração & Vagas
          </span>
        </div>

        {/* Search Input */}
        <div className="px-4 pb-2.5">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar corte, degradê, salão, bairro..."
              className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#20C933] transition"
            />
          </div>
        </div>

        {/* Categories Bar */}
        <div className="px-4 pb-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                  isActive
                    ? 'bg-[#20C933] text-white drop-shadow-xs font-black shadow-sm'
                    : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800/80'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid Masonry em 2 Colunas */}
      <div className="px-3 pt-3">
        {filteredOffers.length > 0 ? (
          <div className="grid grid-cols-2 gap-2.5 items-start">
            {/* Coluna da Esquerda */}
            <div className="flex flex-col">
              {leftColumn.map((offer, idx) => renderPinCard(offer, idx * 2))}
            </div>

            {/* Coluna da Direita */}
            <div className="flex flex-col">
              {rightColumn.map((offer, idx) => renderPinCard(offer, idx * 2 + 1))}
            </div>
          </div>
        ) : (
          <div className="py-20 text-center px-6">
            <Compass className="w-10 h-10 text-slate-500 mx-auto mb-2" />
            <p className="text-sm font-bold text-white">Nenhuma inspiração encontrada</p>
            <p className="text-xs text-slate-400 mt-1">Tente pesquisar por outro termo ou categoria.</p>
          </div>
        )}
      </div>
    </div>
  );
};
