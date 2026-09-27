import React, { useState } from 'react';
import { ArrowLeft, Home, Heart, Compass, Sparkles } from 'lucide-react';
import { ServiceOffer } from '../types';
import { RadarOfferCard } from './RadarOfferCard';
import { SalonBookingModal } from './SalonBookingModal';
import { VagouLogo } from './VagouLogo';
import { useTheme } from '../context/ThemeContext';

interface FavoritesScreenProps {
  offers: ServiceOffer[];
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  onSelectOffer: (offer: ServiceOffer) => void;
  onConfirmBooking: (offer: ServiceOffer) => void;
  onBack: () => void;
  onGoHome: () => void;
}

export const FavoritesScreen: React.FC<FavoritesScreenProps> = ({
  offers,
  favorites,
  onToggleFavorite,
  onSelectOffer,
  onConfirmBooking,
  onBack,
  onGoHome,
}) => {
  const { isDark } = useTheme();
  const [bookingModalOffer, setBookingModalOffer] = useState<ServiceOffer | null>(null);

  const favoriteOffers = offers.filter((o) => favorites.includes(o.id));

  const handleDirectBook = (offer: ServiceOffer) => {
    setBookingModalOffer(offer);
  };

  return (
    <div className={`flex flex-col min-h-full pb-24 ${isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-100/70 text-slate-900'}`}>
      {/* Fixed Header */}
      <div className={`sticky top-0 z-40 backdrop-blur-md border-b px-4 py-3 flex items-center justify-between transition-colors ${
        isDark ? 'bg-slate-950/90 border-slate-800/80' : 'bg-white/95 border-slate-200 shadow-xs'
      }`}>
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className={`p-2 rounded-xl border transition cursor-pointer active:scale-95 ${
              isDark ? 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800' : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
            }`}
            aria-label="Voltar"
            title="Voltar"
          >
            <ArrowLeft className="w-4 h-4 text-[#20C933]" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className={`text-sm font-black uppercase tracking-wider font-['Poppins'] ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Salões Favoritos
              </h1>
              <span className="text-[10px] bg-rose-500/20 text-rose-500 font-mono font-bold px-2 py-0.5 rounded-full border border-rose-500/30">
                {favoriteOffers.length} {favoriteOffers.length === 1 ? 'salvo' : 'salvos'}
              </span>
            </div>
            <p className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Seus estabelecimentos e serviços salvos
            </p>
          </div>
        </div>

        <button
          onClick={onGoHome}
          className={`p-2 rounded-xl border transition cursor-pointer active:scale-95 ${
            isDark ? 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800' : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
          }`}
          aria-label="Ir para o início"
          title="Início (Radar)"
        >
          <Home className="w-4 h-4" />
        </button>
      </div>

      {/* Main Content Area */}
      <div className="p-4 space-y-4">
        {favoriteOffers.length === 0 ? (
          <div className={`py-16 px-6 text-center rounded-2xl border mt-4 space-y-3 ${
            isDark ? 'bg-slate-900/60 border-slate-800/90' : 'bg-white border-slate-200 shadow-xs'
          }`}>
            <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center mx-auto shadow-lg">
              <Heart className="w-8 h-8 fill-rose-500/30" />
            </div>
            <h3 className={`text-base font-black font-['Poppins'] ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Nenhum salão favorito ainda
            </h3>
            <p className={`text-xs max-w-xs mx-auto leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Toque no ícone de coração <span className="text-rose-500">❤️</span> nos cards de salões do feed para salvá-los e acessar facilmente aqui.
            </p>
            <button
              onClick={onGoHome}
              className="mt-2 px-5 py-2.5 bg-[#20C933] hover:bg-[#1bb32d] text-white drop-shadow-xs text-xs font-black uppercase tracking-wider rounded-xl shadow-lg transition cursor-pointer active:scale-95 inline-flex items-center gap-2 font-['Poppins']"
            >
              <Compass className="w-4 h-4 text-white" />
              <span>Explorar Vagas no Radar</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {favoriteOffers.map((offer) => (
              <RadarOfferCard
                key={offer.id}
                offer={offer}
                isFavorite={true}
                onToggleFavorite={onToggleFavorite}
                onSelectOffer={onSelectOffer}
                onDirectBook={handleDirectBook}
              />
            ))}
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {bookingModalOffer && (
        <SalonBookingModal
          offer={bookingModalOffer}
          isOpen={!!bookingModalOffer}
          onClose={() => setBookingModalOffer(null)}
          onConfirmBooking={(off) => {
            onConfirmBooking(off);
            setBookingModalOffer(null);
          }}
        />
      )}
    </div>
  );
};
