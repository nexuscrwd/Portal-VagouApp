import React, { useState } from 'react';
import { ArrowLeft, Share2, Star, ShieldCheck, Heart, Home, Check } from 'lucide-react';
import { ServiceOffer } from '../types';
import { useTheme } from '../context/ThemeContext';
import { shareServiceOffer } from '../utils/share';

interface OfferDetailScreenProps {
  offer: ServiceOffer;
  onBack: () => void;
  onConfirmBooking: (offer: ServiceOffer) => void;
  onGoHome?: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
}

export const OfferDetailScreen: React.FC<OfferDetailScreenProps> = ({
  offer,
  onBack,
  onConfirmBooking,
  onGoHome,
  isFavorite = false,
  onToggleFavorite,
}) => {
  const { isDark } = useTheme();
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);

  const handleShare = async () => {
    const result = await shareServiceOffer(offer);
    if (result.success) {
      setShareFeedback(result.message);
      setTimeout(() => setShareFeedback(null), 3000);
    }
  };

  return (
    <div className={`flex flex-col min-h-full pb-20 transition-colors relative ${isDark ? 'bg-slate-950 text-slate-100' : 'bg-white text-slate-900'}`}>
      {/* Feedback Toast de Compartilhamento */}
      {shareFeedback && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-[#20C933] text-white font-medium text-xs px-4 py-2 rounded-full shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-3">
          <Check className="w-3.5 h-3.5 stroke-[3]" />
          <span>{shareFeedback}</span>
        </div>
      )}

      {/* Top Banner Image with Action Overlays */}
      <div className="relative h-64 bg-slate-900">
        <img
          src={offer.imageUrl}
          alt={offer.serviceTitle}
          className="w-full h-full object-cover opacity-95"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30 pointer-events-none" />

        <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <button
              id="btn-voltar-detalhe-oferta"
              onClick={onBack}
              className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-md transition cursor-pointer active:scale-95 ${
                isDark ? 'bg-slate-950/80 text-white border border-slate-800 hover:bg-slate-900' : 'bg-white/90 text-slate-800 hover:bg-white'
              }`}
              title="Voltar para a página anterior"
              aria-label="Voltar"
            >
              <ArrowLeft className="w-5 h-5 text-emerald-500" />
            </button>
            {onGoHome && (
              <button
                id="btn-inicio-detalhe-oferta"
                onClick={onGoHome}
                className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-md transition cursor-pointer active:scale-95 ${
                  isDark ? 'bg-slate-950/80 text-white border border-slate-800 hover:bg-slate-900' : 'bg-white/90 text-slate-800 hover:bg-white'
                }`}
                title="Ir para a Tela Inicial (Radar)"
                aria-label="Tela Inicial"
              >
                <Home className="w-5 h-5 text-slate-300" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            {onToggleFavorite && (
              <button
                onClick={() => onToggleFavorite(offer.id)}
                className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-md transition cursor-pointer active:scale-95 ${
                  isDark ? 'bg-slate-950/80 text-white border border-slate-800 hover:bg-slate-900' : 'bg-white/90 text-slate-800 hover:bg-white'
                }`}
                aria-label="Favoritar"
              >
                <Heart
                  className={`w-5 h-5 ${
                    isFavorite ? 'fill-rose-500 text-rose-500' : 'text-slate-300'
                  }`}
                />
              </button>
            )}
            <button
              id="btn-compartilhar-oferta"
              onClick={handleShare}
              className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-md transition cursor-pointer active:scale-95 ${
                isDark ? 'bg-slate-950/80 text-white border border-slate-800 hover:bg-slate-900' : 'bg-white/90 text-slate-800 hover:bg-white'
              }`}
              title="Compartilhar oferta via WhatsApp, redes ou link"
              aria-label="Compartilhar oferta"
            >
              <Share2 className="w-4 h-4 text-slate-300" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Info Body */}
      <div className={`p-5 -mt-6 rounded-t-3xl relative z-10 flex-1 flex flex-col justify-between border-t ${
        isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="space-y-4">
          <div>
            <h1 className={`text-xl font-bold font-['Poppins'] ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {offer.serviceTitle} com {offer.professionalName}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-bold text-emerald-500">{offer.salonName}</span>
              <span className="text-slate-500">•</span>
              <div className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span className={`text-xs font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{offer.rating}</span>
                <span className="text-[11px] text-slate-400">({offer.ratingCount} avaliações)</span>
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-1">Distância: {offer.distance} • {offer.neighborhood}</p>
          </div>

          {/* Horário do Agendamento Section */}
          <div className="pt-2">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-emerald-500 mb-2 font-['Poppins']">
              HORÁRIO DO AGENDAMENTO
            </h3>
            <div className="grid grid-cols-3 gap-2">
              <div className={`rounded-xl p-2.5 text-center border ${
                isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-emerald-50 border-emerald-100'
              }`}>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">DIA</span>
                <span className={`text-xs font-black mt-0.5 block ${isDark ? 'text-white' : 'text-emerald-950'}`}>{offer.dayLabel}</span>
              </div>

              <div className={`rounded-xl p-2.5 text-center border ${
                isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-emerald-50 border-emerald-100'
              }`}>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">HORÁRIO</span>
                <span className="text-xs font-black text-[#20C933] mt-0.5 block">
                  {offer.timeSlot.replace('Hoje • ', '').replace('Amanhã • ', '')}
                </span>
              </div>

              <div className={`rounded-xl p-2.5 text-center border ${
                isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-emerald-50 border-emerald-100'
              }`}>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">DURAÇÃO</span>
                <span className={`text-xs font-black mt-0.5 block ${isDark ? 'text-white' : 'text-emerald-950'}`}>{offer.duration}</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              Horário programado. Por favor, chegue com 5 min de antecedência.
            </p>
          </div>

          {/* Value & Protection */}
          <div className="pt-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-400 block">Valor do serviço</span>
                <span className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  R$ {offer.price.toFixed(2).replace('.', ',')}
                </span>
              </div>
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border ${
                isDark ? 'bg-slate-900 border-slate-800 text-slate-200' : 'bg-slate-100 border-slate-200 text-slate-700'
              }`}>
                <ShieldCheck className="w-4 h-4 text-[#20C933]" />
                <span>Agendamento protegido</span>
              </div>
            </div>
          </div>
        </div>

        {/* CTA & Cancellation Policy */}
        <div className="pt-6 space-y-3">
          <button
            id="btn-agendar-agora"
            onClick={() => onConfirmBooking(offer)}
            className="w-full py-3.5 bg-[#20C933] hover:bg-[#1bb32d] active:scale-[0.99] text-white drop-shadow-xs font-bold text-sm rounded-xl transition shadow-lg shadow-emerald-900/30 uppercase tracking-wider font-['Poppins'] cursor-pointer flex items-center justify-center gap-2"
          >
            <span>AGENDAR AGORA</span>
          </button>

          <div className={`rounded-xl p-3 border text-[11px] ${
            isDark ? 'bg-slate-900/50 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-100 text-slate-500'
          }`}>
            <h4 className={`text-[10px] font-bold uppercase ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Regras de Cancelamento:</h4>
            <p className="mt-0.5">
              Cancelamento grátis até 1h antes do início do serviço. Após esse prazo, consulte as condições do estabelecimento.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
