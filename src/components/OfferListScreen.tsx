import React, { useState, useEffect } from 'react';
import { ArrowLeft, XCircle, SlidersHorizontal, Star, Clock, Heart, Home, MapPin } from 'lucide-react';
import { ServiceOffer } from '../types';
import { OfferListSkeleton } from './SkeletonLoader';
import { formatSlotDateTime } from '../utils/dateFormatter';
import { getDeviceCoordinates, sortOffersByDistance, UserCoordinates } from '../utils/geolocation';
import { hapticLight } from '../utils/haptics';
import { useTheme } from '../context/ThemeContext';

interface OfferListScreenProps {
  offers: ServiceOffer[];
  onBack: () => void;
  onSelectOffer: (offer: ServiceOffer) => void;
  onGoHome?: () => void;
  favorites?: string[];
  onToggleFavorite?: (id: string) => void;
}

export const OfferListScreen: React.FC<OfferListScreenProps> = ({
  offers,
  onBack,
  onSelectOffer,
  onGoHome,
  favorites = [],
  onToggleFavorite,
}) => {
  const { isDark } = useTheme();
  const [activeFilter, setActiveFilter] = useState<'distancia' | 'preco' | 'avaliacao' | 'todos'>('todos');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [userCoords, setUserCoords] = useState<UserCoordinates | null>(null);

  // Skeleton loading effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 450);
    return () => clearTimeout(timer);
  }, []);

  const handleFilterChange = async (filter: 'distancia' | 'preco' | 'avaliacao') => {
    hapticLight();
    setIsLoading(true);
    const nextFilter = activeFilter === filter ? 'todos' : filter;
    setActiveFilter(nextFilter);

    if (nextFilter === 'distancia' && !userCoords) {
      const coords = await getDeviceCoordinates();
      setUserCoords(coords);
    }

    setTimeout(() => setIsLoading(false), 250);
  };

  const filteredOffers = React.useMemo(() => {
    if (activeFilter === 'distancia') {
      return sortOffersByDistance(offers, userCoords);
    }
    return [...offers].sort((a, b) => {
      if (activeFilter === 'preco') return a.price - b.price;
      if (activeFilter === 'avaliacao') return b.rating - a.rating;
      return 0;
    });
  }, [offers, activeFilter, userCoords]);

  return (
    <div className={`flex flex-col min-h-full pb-20 ${isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-100/70 text-slate-900'}`}>
      {/* Top Bar with Search Chip, Back & Home */}
      <div className={`p-4 border-b sticky top-0 z-30 shadow-xs backdrop-blur-md transition-colors ${
        isDark ? 'bg-slate-950/90 border-slate-800' : 'bg-white/95 border-slate-200'
      }`}>
        <div className="flex items-center gap-2">
          <button
            id="btn-voltar-lista"
            onClick={onBack}
            className={`p-2 rounded-lg transition cursor-pointer active:scale-95 ${
              isDark ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100'
            }`}
            title="Voltar para a página anterior"
            aria-label="Voltar"
          >
            <ArrowLeft className="w-5 h-5 text-[#20C933]" />
          </button>

          {onGoHome && (
            <button
              id="btn-inicio-lista"
              onClick={onGoHome}
              className={`p-2 rounded-lg transition cursor-pointer active:scale-95 ${
                isDark ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100'
              }`}
              title="Ir para a Tela Inicial (Radar)"
              aria-label="Tela Inicial"
            >
              <Home className="w-5 h-5" />
            </button>
          )}

          <div className={`flex-1 flex items-center justify-between rounded-lg px-3.5 py-2 ${
            isDark ? 'bg-slate-900 border border-slate-800 text-slate-200' : 'bg-slate-100 text-slate-900'
          }`}>
            <span className="text-xs font-bold">Corte masculino • Hoje</span>
            <button className="text-slate-400 hover:text-slate-600">
              <XCircle className="w-4 h-4 fill-slate-500 text-white" />
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 mt-3 overflow-x-auto no-scrollbar">
          <button className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1 shrink-0 ${
            isDark ? 'bg-slate-900 border border-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'
          }`}>
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filtros</span>
          </button>
          <button
            onClick={() => handleFilterChange('distancia')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition ${
              activeFilter === 'distancia'
                ? 'bg-[#20C933] text-white font-bold'
                : isDark
                ? 'bg-slate-900 border border-slate-800 text-slate-400'
                : 'bg-slate-100 text-slate-700'
            }`}
          >
            Distância
          </button>
          <button
            onClick={() => handleFilterChange('preco')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition ${
              activeFilter === 'preco'
                ? 'bg-[#20C933] text-white font-bold'
                : isDark
                ? 'bg-slate-900 border border-slate-800 text-slate-400'
                : 'bg-slate-100 text-slate-700'
            }`}
          >
            Preço
          </button>
          <button
            onClick={() => handleFilterChange('avaliacao')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition ${
              activeFilter === 'avaliacao'
                ? 'bg-[#20C933] text-white font-bold'
                : isDark
                ? 'bg-slate-900 border border-slate-800 text-slate-400'
                : 'bg-slate-100 text-slate-700'
            }`}
          >
            Avaliação
          </button>
        </div>
      </div>

      {/* Skeleton screen loader or Offers List */}
      {isLoading ? (
        <OfferListSkeleton count={4} />
      ) : (
        <div className="p-4 space-y-3">
          {filteredOffers.map((off) => (
            <div
              key={off.id}
              onClick={() => onSelectOffer(off)}
              className={`rounded-xl p-3 border transition cursor-pointer flex gap-3.5 group relative ${
                isDark
                  ? 'bg-slate-900 border-slate-800 hover:border-emerald-500/50 shadow-md shadow-black/20 text-white'
                  : 'bg-white border-slate-200 hover:border-emerald-500/50 shadow-xs shadow-slate-200/50 text-slate-900'
              }`}
            >
              <div className="w-20 h-20 rounded-md overflow-hidden bg-slate-800 shrink-0 relative">
                <img
                  src={off.imageUrl}
                  alt={off.salonName}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="flex-1 flex flex-col justify-between min-w-0">
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className={`text-xs font-extrabold truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>{off.salonName}</h3>
                    <div className="flex items-center gap-2">
                      <div className={`flex items-center gap-1 text-[11px] font-bold ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span>{off.rating}</span>
                      </div>
                      {onToggleFavorite && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleFavorite(off.id);
                          }}
                          className="p-1 text-slate-400 hover:text-rose-500 transition"
                        >
                          <Heart
                            className={`w-3.5 h-3.5 ${
                              favorites.includes(off.id)
                                ? 'fill-rose-500 text-rose-500'
                                : 'text-slate-400'
                            }`}
                          />
                        </button>
                      )}
                    </div>
                  </div>
                  <p className={`text-xs font-semibold truncate mt-0.5 ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>{off.serviceTitle}</p>
                  <p className={`text-[11px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Profissional: {off.professionalName} • {off.distance}
                  </p>
                </div>

                <div className={`flex items-center justify-between mt-2 pt-2 border-t ${
                  isDark ? 'border-slate-800/80' : 'border-slate-100'
                }`}>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded flex items-center gap-1 ${
                    isDark ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/20' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}>
                    <Clock className="w-3 h-3" />
                    {formatSlotDateTime(off.timeSlot)}
                  </span>
                  <span className={`text-sm font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>R$ {off.price.toFixed(0)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

