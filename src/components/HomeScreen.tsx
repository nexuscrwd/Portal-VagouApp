import React, { useState, useMemo, useEffect } from 'react';
import { Compass, X, ArrowLeft, Home, Smartphone, LayoutGrid, Heart, Zap, Filter, MapPin } from 'lucide-react';
import { ServiceOffer } from '../types';
import { InstallBanner } from './InstallBanner';
import { RadarStoryModal } from './RadarStoryModal';
import { RadarOfferCard } from './RadarOfferCard';
import { RadarFullscreenFeed } from './RadarFullscreenFeed';
import { SalonProfileView } from './SalonProfileView';
import { VagouLogo } from './VagouLogo';
import { SalonNavContext } from './BottomNav';
import {
  getDeviceCoordinates,
  sortOffersByDistance,
  UserCoordinates,
  getAddressFromCoords,
  ReadableAddress,
} from '../utils/geolocation';

interface HomeScreenProps {
  onNavigateToOffers: (query?: string, category?: string) => void;
  onNavigateToOfferDetail: (offer: ServiceOffer) => void;
  onNavigateToMap: () => void;
  offers: ServiceOffer[];
  onOpenInstallModal?: () => void;
  isStandalone?: boolean;
  favorites?: string[];
  onToggleFavorite?: (id: string) => void;
  onSwitchToPartnerMode?: () => void;
  onConfirmBooking?: (offer: ServiceOffer) => void;
  onOpenProfileDrawer?: () => void;
  currentSegment?: 'barbearia' | 'salao' | 'todos';
  onSelectSegment?: (segment: 'barbearia' | 'salao' | 'todos') => void;
  userName?: string;
  userAvatarUrl?: string;
  externalSelectedCategory?: string;
  onCategoryChange?: (category: string) => void;
  onRegisterSalonNav?: (ctx: SalonNavContext | null) => void;
  onNavigateToAgenda?: () => void;
  userCoords?: UserCoordinates | null;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onNavigateToOffers,
  onNavigateToOfferDetail,
  onNavigateToMap,
  offers,
  onOpenInstallModal,
  isStandalone = false,
  favorites = [],
  onToggleFavorite,
  onSwitchToPartnerMode,
  onConfirmBooking,
  onOpenProfileDrawer,
  currentSegment = 'barbearia',
  onSelectSegment,
  userName = 'Anderson Silva',
  userAvatarUrl = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
  externalSelectedCategory,
  onCategoryChange,
  onRegisterSalonNav,
  onNavigateToAgenda,
  userCoords: propUserCoords,
}) => {
  const [internalSelectedCategory, setInternalSelectedCategory] = useState<string>('barba');
  const selectedCategory = externalSelectedCategory !== undefined ? externalSelectedCategory : internalSelectedCategory;
  const setSelectedCategory = (cat: string) => {
    if (onCategoryChange) {
      onCategoryChange(cat);
    }
    setInternalSelectedCategory(cat);
  };
  const [selectedSalonFilter, setSelectedSalonFilter] = useState<string | null>(null);
  const [viewingSalonProfile, setViewingSalonProfile] = useState<string | null>(null);
  const [bookingOfferForSalon, setBookingOfferForSalon] = useState<ServiceOffer | null>(null);
  const [sortBy, setSortBy] = useState<'urgency' | 'distance' | 'price'>('urgency');
  const [feedLayoutMode, setFeedLayoutMode] = useState<'fullscreen' | 'cards' | 'pinterest'>('fullscreen');

  const [isStoryModalOpen, setIsStoryModalOpen] = useState<boolean>(false);
  const [activeStoryIndex, setActiveStoryIndex] = useState<number>(0);

  const [internalCoords, setInternalCoords] = useState<UserCoordinates | null>(null);
  const [currentAddress, setCurrentAddress] = useState<ReadableAddress | null>(null);

  const activeCoords = propUserCoords || internalCoords;

  // Inicializa geolocalização do dispositivo e converte coordenadas em endereço legível
  useEffect(() => {
    if (propUserCoords) {
      getAddressFromCoords(propUserCoords.lat, propUserCoords.lng).then((addr) => {
        setCurrentAddress(addr);
      });
      return;
    }

    getDeviceCoordinates().then((coords) => {
      if (coords) {
        setInternalCoords(coords);
        getAddressFromCoords(coords.lat, coords.lng).then((addr) => {
          setCurrentAddress(addr);
        });
      }
    });
  }, [propUserCoords]);


  // Dynamic category tabs (Excluindo relâmpago, que agora está no menu inferior)
  const categories = useMemo(() => {
    if (currentSegment === 'barbearia') {
      return [
        { id: 'barba', label: 'Barba' },
        { id: 'cabelo', label: 'Corte Masculino' },
        { id: 'barba_corte', label: 'Barba + Corte' },
      ];
    }
    if (currentSegment === 'salao') {
      return [
        { id: 'cabelo', label: 'Cabelo & Mechas' },
        { id: 'unhas', label: 'Unhas & Gel' },
        { id: 'beleza', label: 'Sobrancelha & Cílios' },
        { id: 'estetica', label: 'Estética Facial' },
      ];
    }
    return [
      { id: 'barba', label: 'Barba' },
      { id: 'cabelo', label: 'Cabelo' },
      { id: 'unhas', label: 'Unhas' },
      { id: 'beleza', label: 'Sobrancelha' },
      { id: 'estetica', label: 'Estética' },
    ];
  }, [currentSegment]);

  const filteredAndSortedOffers = useMemo(() => {
    let list = [...offers];

    // Filter by selected Salon from Stories if active
    if (selectedSalonFilter) {
      list = list.filter((o) => o.salonName === selectedSalonFilter);
    }

    // Segment filter
    if (currentSegment === 'barbearia') {
      list = list.filter((o) => o.serviceCategory === 'barba' || o.serviceCategory === 'cabelo');
    } else if (currentSegment === 'salao') {
      list = list.filter(
        (o) =>
          o.serviceCategory === 'unhas' ||
          o.serviceCategory === 'beleza' ||
          o.serviceCategory === 'estetica' ||
          o.serviceCategory === 'cabelo'
      );
    }

    // Category filter
    if (selectedCategory === 'flash') {
      list = list.filter((o) => o.isFlashDeal || (o.expiresInMinutes && o.expiresInMinutes <= 30));
    } else if (selectedCategory === 'barba_corte') {
      list = list.filter(
        (o) =>
          o.serviceCategory === 'barba' ||
          o.serviceCategory === 'cabelo' ||
          o.serviceTitle.toLowerCase().includes('barba') ||
          o.serviceTitle.toLowerCase().includes('corte')
      );
    } else if (selectedCategory !== 'todos') {
      list = list.filter(
        (o) =>
          o.serviceCategory === selectedCategory ||
          (selectedCategory === 'beleza' &&
            (o.serviceCategory === 'beleza' || o.serviceCategory === 'estetica'))
      );
    }

    if (sortBy === 'distance') {
      return sortOffersByDistance(list, activeCoords);
    }

    list.sort((a, b) => {
      if (sortBy === 'urgency') {
        const timeA = a.expiresInMinutes || 999;
        const timeB = b.expiresInMinutes || 999;
        return timeA - timeB;
      } else {
        return a.price - b.price;
      }
    });

    return list;
  }, [offers, selectedSalonFilter, selectedCategory, sortBy, currentSegment, activeCoords]);

  const handleOpenStory = (index: number) => {
    setActiveStoryIndex(index);
    setIsStoryModalOpen(true);
  };

  // Redireciona o usuário diretamente para o app/página exclusiva do estabelecimento
  const handleDirectBook = (offer: ServiceOffer) => {
    setBookingOfferForSalon(offer);
    setViewingSalonProfile(offer.salonName);
  };

  // Ao clicar no anúncio/card, abre diretamente a página e seção do estabelecimento
  const handleSelectOffer = (offer: ServiceOffer) => {
    setBookingOfferForSalon(null);
    setViewingSalonProfile(offer.salonName);
  };

  // Se estiver visualizando o aplicativo exclusivo do estabelecimento
  if (viewingSalonProfile) {
    return (
      <SalonProfileView
        salonName={viewingSalonProfile}
        offers={offers}
        onBack={() => {
          setViewingSalonProfile(null);
          setBookingOfferForSalon(null);
        }}
        onSelectOffer={(off) => handleSelectOffer(off)}
        onDirectBook={(scheduledOffer) => {
          if (onConfirmBooking) {
            onConfirmBooking(scheduledOffer);
          }
        }}
        isFavorite={favorites.includes(viewingSalonProfile)}
        onToggleFavorite={() => onToggleFavorite?.(viewingSalonProfile)}
        userName={userName}
        userAvatarUrl={userAvatarUrl}
        onOpenProfileDrawer={onOpenProfileDrawer}
        onRegisterBottomNav={onRegisterSalonNav}
        initialBookingOffer={bookingOfferForSalon}
        autoOpenBooking={Boolean(bookingOfferForSalon)}
        onNavigateToAgenda={onNavigateToAgenda}
      />
    );
  }

  const isFullscreenFeed = feedLayoutMode === 'fullscreen';

  return (
    <div className={`bg-slate-950 text-slate-100 ${isFullscreenFeed ? 'h-full flex flex-col overflow-hidden' : 'min-h-full pb-0'}`}>
      {/* Fixed Sticky Global Header */}
      <div className="flex-shrink-0 sticky top-0 z-40 bg-[#151A1E] shadow-xl border-b border-slate-800">
        <div className="px-4 h-[60px] w-full flex items-center justify-between gap-3">
          {/* Brand Logo & Current Location Badge */}
          <div className="flex items-center gap-2 min-w-0">
            <VagouLogo size="lg" variant="full" />
            {currentAddress && (
              <button
                id="btn-location-chip"
                onClick={onNavigateToMap}
                className="hidden xs:flex items-center gap-1 px-2 py-0.5 rounded bg-slate-900 border border-slate-800 hover:border-[#20C933] text-slate-300 hover:text-white transition text-[11px] font-medium cursor-pointer max-w-[130px] sm:max-w-[170px] truncate group"
                title={`Localização: ${currentAddress.formatted}. Toque para abrir o mapa.`}
              >
                <MapPin className="w-3 h-3 text-[#20C933] shrink-0 group-hover:scale-110 transition-transform" />
                <span className="truncate">{currentAddress.neighborhood || currentAddress.city}</span>
              </button>
            )}
          </div>

          {/* Layout Mode Toggle, Filter & Profile */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Botão de Filtro (Ordenação) */}
            <div className="relative flex items-center justify-center w-8 h-8 md:w-9 md:h-9 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-[#20C933] transition-colors shadow-sm group">
              <Filter className="w-3.5 h-3.5 md:w-4 md:h-4 text-slate-300 group-hover:text-[#20C933] transition-colors" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                title="Filtrar e Ordenar vagas"
              >
                <option value="urgency">⚡ Urgência</option>
                <option value="distance">📍 Distância</option>
                <option value="price">🏷️ Menor Preço</option>
              </select>
              {/* Ponto indicador se não for o padrão */}
              {sortBy !== 'urgency' && (
                <span className="absolute top-1.5 right-1.5 md:top-2 md:right-2 w-1.5 h-1.5 rounded-full bg-[#20C933] animate-pulse"></span>
              )}
            </div>

            <div className="flex items-center bg-slate-900 p-0.5 md:p-1 rounded border border-slate-800 shadow-inner">
              {/* Botão Reels / Insta / TikTok (Tela Cheia) */}
              <button
                type="button"
                onClick={() => setFeedLayoutMode('fullscreen')}
                className={`px-2 py-1 rounded text-xs transition cursor-pointer flex items-center gap-1 font-bold ${
                  feedLayoutMode === 'fullscreen'
                    ? 'bg-[#20C933] text-white font-bold drop-shadow-xs shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Modo Vertical Reels / TikTok"
                aria-label="Modo Vertical Reels / TikTok"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span className="hidden xs:inline text-[11px]">Reels</span>
              </button>

              {/* Botão Pinterest / Grid (Quadriculadinho) */}
              <button
                type="button"
                onClick={() => setFeedLayoutMode('pinterest')}
                className={`px-2 py-1 rounded text-xs transition cursor-pointer flex items-center gap-1 font-bold ${
                  feedLayoutMode === 'pinterest' || feedLayoutMode === 'cards'
                    ? 'bg-[#20C933] text-white font-bold drop-shadow-xs shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Modo Pinterest (Grid de Inspirações e Vagas)"
                aria-label="Modo Pinterest Grid"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden xs:inline text-[11px]">Grid</span>
              </button>
            </div>

            {/* Profile Avatar Button */}
            <button
              onClick={onOpenProfileDrawer}
              className="relative w-9 h-9 rounded overflow-hidden ring-2 ring-[#20C933]/50 hover:ring-[#20C933] transition-all cursor-pointer flex-shrink-0 flex items-center justify-center"
              title="Meu Perfil & Configurações"
            >
              <img
                src={userAvatarUrl}
                alt={userName}
                className="w-full h-full object-cover rounded"
                referrerPolicy="no-referrer"
              />
              <span className="absolute top-0 right-0 w-2.5 h-2.5 rounded-full bg-[#20C933] border-2 border-[#151A1E]" />
            </button>
          </div>
        </div>

        {/* Stories / Carrossel de Salões */}
        <div className="px-4 py-2.5 flex items-center gap-3 overflow-x-auto no-scrollbar border-b border-slate-800/60 bg-slate-950/40">
              {Array.from(new Set(offers.map((o) => o.salonName))).map((salonName) => {
                const salonOffer = offers.find((o) => o.salonName === salonName);
                const isSelected = selectedSalonFilter === salonName;
                return (
                  <button
                    key={salonName}
                    onClick={() => {
                      if (selectedSalonFilter === salonName) {
                        setSelectedSalonFilter(null);
                      } else {
                        setSelectedSalonFilter(salonName);
                      }
                    }}
                    className="flex flex-col items-center gap-1 shrink-0 group cursor-pointer"
                  >
                    <div
                      className={`w-14 h-14 rounded-xl p-0.5 transition-transform group-active:scale-95 ${
                        isSelected
                          ? 'bg-gradient-to-tr from-[#20C933] to-emerald-400 ring-2 ring-[#20C933]'
                          : 'bg-gradient-to-tr from-emerald-500/60 via-[#20C933] to-emerald-300 hover:scale-105'
                      }`}
                    >
                      <div className="w-full h-full rounded overflow-hidden bg-slate-900 border border-slate-800">
                        <img
                          src={salonOffer?.imageUrl || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=200&q=80'}
                          alt={salonName}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold max-w-[64px] truncate ${isSelected ? 'text-[#20C933]' : 'text-slate-300 group-hover:text-white'}`}>
                      {salonName}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Category Chips Bar with Integrated Sort Filter & Count Badge - Restaurada Compacta / Estreita */}
            <div className="px-3 py-1 flex items-center justify-between gap-1.5 overflow-x-auto no-scrollbar">
              {categories.map((cat) => {
                const isActive = selectedCategory === cat.id;
                const isAll = cat.id === 'todos';

                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`flex-1 py-1.5 px-2.5 rounded-lg text-[11px] font-bold text-center transition-all cursor-pointer font-['Poppins'] whitespace-nowrap ${
                      isActive
                        ? 'bg-[#20C933] text-white drop-shadow-xs shadow-sm font-extrabold'
                        : 'bg-slate-900 text-slate-300 hover:bg-slate-850 hover:text-white border border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <span className="leading-none select-none">
                      {cat.label}
                    </span>
                    {isAll && (
                      <span
                        className={`ml-1.5 px-1.5 py-0.2 rounded text-[9px] font-black inline-block ${
                          isActive
                            ? 'bg-slate-950 text-[#20C933]'
                            : 'bg-[#20C933]/20 text-[#20C933]'
                        }`}
                      >
                        {filteredAndSortedOffers.length}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
      </div>

      {/* Active Salon Filter Ribbon */}
          {selectedSalonFilter && (
            <div className="px-4 pt-3 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2 bg-emerald-950/60 border border-emerald-500/40 px-3 py-1.5 rounded-xl text-xs text-emerald-200 font-medium">
                <span>
                  Filtrando vagas de: <strong className="text-white font-bold">{selectedSalonFilter}</strong>
                </span>
              </div>
              <button
                onClick={() => setSelectedSalonFilter(null)}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-white bg-slate-900 px-2.5 py-1.5 rounded-xl border border-slate-800 transition cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>Ver todos</span>
              </button>
            </div>
          )}

          {/* PWA Install Banner (apenas no modo grid para manter o reels 100% fullscreen) */}
          {onOpenInstallModal && feedLayoutMode !== 'fullscreen' && (
            <div className="px-4 pt-2">
              <InstallBanner
                onOpenInstallModal={onOpenInstallModal}
                isStandalone={isStandalone}
              />
            </div>
          )}

          {/* Alternância: Radar Fullscreen Feed vs Grid Pinterest vs Cards */}
          {feedLayoutMode === 'fullscreen' ? (
            <div className="flex-1 min-h-0 w-full overflow-hidden">
              <RadarFullscreenFeed
                offers={filteredAndSortedOffers}
                favorites={favorites}
                onToggleFavorite={(id) => onToggleFavorite?.(id)}
                onSelectOffer={(off) => handleSelectOffer(off)}
                onDirectBook={handleDirectBook}
                onOpenSalonProfile={(salon) => setViewingSalonProfile(salon)}
              />
            </div>
          ) : feedLayoutMode === 'pinterest' ? (
            /* Modo Pinterest: Grid vertical de 2 colunas dinâmico (Inspirações & Vagas) */
            <div className="px-3 mt-3">
              {filteredAndSortedOffers.length > 0 ? (
                <div className="grid grid-cols-2 gap-2.5">
                  {filteredAndSortedOffers.map((offer, index) => {
                    const isFavorite = favorites.includes(offer.id);
                    // Aspect ratio diferenciado para criar o efeito orgânico estilo Pinterest
                    const aspectClass =
                      index % 3 === 0
                        ? 'aspect-[3/4.2]'
                        : index % 2 === 0
                        ? 'aspect-[3/3.6]'
                        : 'aspect-[3/4.6]';

                    return (
                      <div
                        key={offer.id}
                        onClick={() => handleSelectOffer(offer)}
                        className="group relative flex flex-col rounded-2xl overflow-hidden bg-slate-900 border border-slate-800/80 shadow-md hover:border-slate-700 transition cursor-pointer"
                      >
                        {/* Imagem do Pin com Aspecto Orgânico */}
                        <div className={`relative w-full ${aspectClass} overflow-hidden bg-slate-950`}>
                          <img
                            src={offer.imageUrl}
                            alt={offer.serviceTitle}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            referrerPolicy="no-referrer"
                            loading="lazy"
                          />

                          {/* Gradiente sutil inferior na imagem */}
                          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/85 via-black/40 to-transparent pointer-events-none" />

                          {/* Tag de Preço Flutuante */}
                          <div className="absolute top-2 left-2 bg-black/65 backdrop-blur-md px-2 py-0.5 rounded-lg border border-white/10 text-[11px] font-black text-emerald-400 font-mono shadow-sm">
                            R$ {offer.price.toFixed(0)}
                          </div>

                          {/* Botão de Favoritar (Pin) */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleFavorite?.(offer.id);
                            }}
                            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/65 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:scale-110 active:scale-95 transition cursor-pointer"
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
                            <span className="text-[10px] text-slate-400 truncate max-w-[105px]">
                              {offer.salonName}
                            </span>

                            {/* Ação Rápida de Agendamento */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDirectBook(offer);
                              }}
                              className="p-1.5 rounded-lg bg-[#20C933] hover:bg-[#1bb32d] text-white transition active:scale-90 shadow-sm cursor-pointer"
                              title="Agendar vaga agora"
                            >
                              <Zap className="w-3 h-3 fill-white text-white" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-16 text-center px-6 bg-slate-900/60 rounded-2xl border border-slate-800">
                  <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-400 mb-3">
                    <Compass className="w-8 h-8 text-[#20C933] animate-spin" />
                  </div>
                  <h3 className="text-base font-bold text-white font-['Poppins']">
                    Nenhuma inspiração encontrada
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                    Tente selecionar outra categoria para ver vagas e referências visuais abertas.
                  </p>
                  <button
                    onClick={() => {
                      setSelectedSalonFilter(null);
                      setSelectedCategory('todos');
                      onSelectSegment?.('todos');
                    }}
                    className="mt-4 px-4 py-2 bg-[#20C933] text-white text-xs font-black drop-shadow-xs rounded-xl shadow cursor-pointer"
                  >
                    Ver Todas as Vagas
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="px-4 space-y-4 mt-3">
              {filteredAndSortedOffers.length > 0 ? (
                filteredAndSortedOffers.map((offer, index) => (
                  <RadarOfferCard
                    key={offer.id}
                    offer={offer}
                    isFavorite={favorites.includes(offer.id)}
                    onToggleFavorite={(id) => onToggleFavorite?.(id)}
                    onSelectOffer={(off) => handleSelectOffer(off)}
                    onDirectBook={handleDirectBook}
                    onOpenStory={() => handleOpenStory(index)}
                    onFilterBySalon={(salon) => setSelectedSalonFilter(salon)}
                    onOpenSalonProfile={(salon) => setViewingSalonProfile(salon)}
                  />
                ))
              ) : (
                <div className="py-16 text-center px-6 bg-slate-900/60 rounded-2xl border border-slate-800">
                  <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-400 mb-3">
                    <Compass className="w-8 h-8 text-[#20C933] animate-spin" />
                  </div>
                  <h3 className="text-base font-bold text-white font-['Poppins']">
                    Nenhuma vaga encontrada
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                    {selectedSalonFilter
                      ? `Não encontramos vagas adicionais para ${selectedSalonFilter} nesta categoria.`
                      : 'Tente selecionar outra categoria ou mudar para o perfil geral para ver todos os horários abertos.'}
                  </p>
                  <button
                    onClick={() => {
                      setSelectedSalonFilter(null);
                      setSelectedCategory('todos');
                      onSelectSegment?.('todos');
                    }}
                    className="mt-4 px-4 py-2 bg-[#20C933] text-white text-xs font-black drop-shadow-xs rounded-xl shadow cursor-pointer"
                  >
                    Ver Todas as Vagas
                  </button>
                </div>
              )}
            </div>
          )}

      {/* Fullscreen Story Viewer Modal */}
      <RadarStoryModal
        isOpen={isStoryModalOpen}
        onClose={() => setIsStoryModalOpen(false)}
        offers={filteredAndSortedOffers.length > 0 ? filteredAndSortedOffers : offers}
        initialIndex={activeStoryIndex}
        onConfirmBooking={handleDirectBook}
        onNavigateToDetail={(off) => onNavigateToOfferDetail(off)}
      />
    </div>
  );
};
