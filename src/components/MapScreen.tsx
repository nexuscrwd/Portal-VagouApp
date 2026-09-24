import React, { useState, useEffect } from 'react';
import { Search, Scissors, Star, Heart, ArrowLeft, Home, MapPin, Compass, Loader2 } from 'lucide-react';
import { ServiceOffer } from '../types';
import { formatSlotDateTime } from '../utils/dateFormatter';
import { UserCoordinates } from '../utils/geolocation';

interface MapScreenProps {
  offers: ServiceOffer[];
  onSelectOffer: (offer: ServiceOffer) => void;
  onBack?: () => void;
  favorites?: string[];
  onToggleFavorite?: (id: string) => void;
  isGpsLoading?: boolean;
  userCoords?: UserCoordinates | null;
}

export const MapScreen: React.FC<MapScreenProps> = ({
  offers,
  onSelectOffer,
  onBack,
  favorites = [],
  onToggleFavorite,
  isGpsLoading = false,
  userCoords,
}) => {
  const [selectedOffer, setSelectedOffer] = useState<ServiceOffer | undefined>(offers[0]);

  useEffect(() => {
    if (offers && offers.length > 0 && !selectedOffer) {
      setSelectedOffer(offers[0]);
    }
  }, [offers, selectedOffer]);

  // Estado visual de "Carregando mapa..." enquanto a permissão do GPS é processada
  if (isGpsLoading) {
    return (
      <div className="relative w-full h-[700px] bg-slate-950 text-white overflow-hidden flex flex-col justify-between select-none">
        {/* Top Floating Bar */}
        <div className="relative z-10 p-4 pt-4">
          <div className="bg-slate-900 rounded px-3 py-2 flex items-center gap-2 border border-slate-800 shadow-lg">
            {onBack && (
              <button
                id="btn-voltar-mapa-loading"
                onClick={onBack}
                className="p-1.5 rounded hover:bg-slate-800 text-slate-300 transition cursor-pointer flex items-center gap-1 active:scale-95"
                title="Voltar"
              >
                <ArrowLeft className="w-4 h-4 text-emerald-400" />
              </button>
            )}
            <Compass className="w-4 h-4 text-emerald-400 shrink-0 animate-spin" />
            <span className="text-xs font-semibold text-slate-200 flex-1 truncate">
              Localizando salões no GPS...
            </span>
          </div>
        </div>

        {/* Center GPS Loading State */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center z-10">
          <div className="relative mb-6">
            <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center">
                <MapPin className="w-7 h-7 text-emerald-400" />
              </div>
            </div>
            <div className="absolute -top-1 -right-1">
              <Loader2 className="w-5 h-5 text-emerald-400 animate-spin" />
            </div>
          </div>

          <h2 className="text-lg font-bold text-white tracking-tight">Carregando mapa...</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-[240px]">
            Obtendo sua posição exata pelo GPS para ordenar vagas mais próximas.
          </p>

          <div className="mt-6 flex items-center gap-2 px-3 py-1.5 rounded bg-slate-900 border border-slate-800 text-[11px] text-emerald-400 font-medium">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Consultando satélites e permissão...</span>
          </div>
        </div>

        {/* Bottom space placeholder */}
        <div className="p-4 pb-20 opacity-0 pointer-events-none">
          <div className="h-20" />
        </div>
      </div>
    );
  }

  const activeOffer = selectedOffer || offers[0];

  return (
    <div className="relative w-full h-[700px] bg-[#d9ebd9] overflow-hidden flex flex-col justify-between select-none">
      {/* Stylized Vector Map Canvas */}
      <div className="absolute inset-0 bg-[#e5f0e5] pointer-events-none">
        {/* Abstract Roads & Blocks */}
        <svg className="w-full h-full opacity-60" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#c2dec2" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          
          {/* Main Avenues */}
          <path d="M -20 150 Q 150 200 420 180" stroke="#ffffff" strokeWidth="14" fill="none" />
          <path d="M 80 -20 L 140 750" stroke="#ffffff" strokeWidth="12" fill="none" />
          <path d="M 280 -20 L 220 750" stroke="#ffffff" strokeWidth="16" fill="none" />
          <path d="M -20 420 Q 200 390 420 460" stroke="#ffffff" strokeWidth="18" fill="none" />
          
          {/* Secondary streets */}
          <path d="M 0 300 L 400 300" stroke="#ffffff" strokeWidth="6" fill="none" strokeDasharray="4 2" />
          <path d="M 30 550 L 380 520" stroke="#ffffff" strokeWidth="8" fill="none" />
        </svg>

        {/* Green Zones / Parks */}
        <div className="absolute top-28 left-8 w-24 h-32 bg-emerald-200/50 rounded-2xl -rotate-12" />
        <div className="absolute top-80 right-6 w-32 h-40 bg-emerald-200/40 rounded-3xl" />
      </div>

      {/* Top Floating Search Bar with Back & Home */}
      <div className="relative z-10 p-4 pt-4">
        <div className="bg-white rounded shadow-md px-3 py-2 flex items-center gap-2 border border-slate-100">
          {onBack && (
            <button
              id="btn-voltar-mapa"
              onClick={onBack}
              className="p-1.5 rounded hover:bg-slate-100 text-slate-700 transition cursor-pointer flex items-center gap-1 active:scale-95"
              aria-label="Voltar para a tela anterior"
              title="Voltar"
            >
              <ArrowLeft className="w-4 h-4 text-emerald-600" />
            </button>
          )}
          <Search className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="text-xs font-semibold text-slate-800 flex-1 truncate">
            {userCoords ? `Salões perto de você (${userCoords.lat.toFixed(4)}, ${userCoords.lng.toFixed(4)})` : 'Vagas no Mapa perto de você'}
          </span>
          {onBack && (
            <button
              onClick={onBack}
              className="p-1.5 rounded hover:bg-slate-100 text-slate-600 hover:text-emerald-600 transition cursor-pointer active:scale-95"
              title="Ir para a Tela Inicial (Radar)"
              aria-label="Tela Inicial"
            >
              <Home className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Map Interactive Pins */}
      <div className="relative z-10 flex-1">
        {/* User GPS Location Pin */}
        <div className="absolute top-[48%] left-[48%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none">
          <div className="w-4 h-4 rounded-full bg-blue-600 border-2 border-white shadow-md ring-4 ring-blue-500/30" />
          <span className="text-[10px] font-bold text-slate-700 bg-white/90 px-1.5 py-0.5 rounded shadow-sm mt-1">Você</span>
        </div>

        {/* Pin 1 */}
        {offers[0] && (
          <button
            onClick={() => setSelectedOffer(offers[0])}
            className="absolute top-[38%] left-[62%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group transition transform hover:scale-110 active:scale-95"
          >
            <div className={`px-3 py-1 ${activeOffer?.id === offers[0].id ? 'bg-emerald-700 ring-4 ring-emerald-500/20' : 'bg-emerald-600'} text-white rounded text-xs font-extrabold shadow-lg flex items-center gap-1 border-2 border-white`}>
              <span>R$ {Math.round(offers[0].price)}</span>
            </div>
            <div className={`w-2 h-2 ${activeOffer?.id === offers[0].id ? 'bg-emerald-700' : 'bg-emerald-600'} rotate-45 -mt-1`} />
          </button>
        )}

        {/* Pin 2 */}
        {offers[1] && (
          <button
            onClick={() => setSelectedOffer(offers[1])}
            className="absolute top-[28%] left-[30%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group transition transform hover:scale-110 active:scale-95"
          >
            <div className={`w-9 h-9 rounded ${activeOffer?.id === offers[1].id ? 'bg-emerald-700 ring-4 ring-emerald-500/20' : 'bg-emerald-600'} text-white flex items-center justify-center shadow-md border-2 border-white`}>
              <Scissors className="w-4 h-4" />
            </div>
          </button>
        )}

        {/* Pin 3 */}
        {offers[2] && (
          <button
            onClick={() => setSelectedOffer(offers[2])}
            className="absolute top-[62%] left-[76%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group transition transform hover:scale-110 active:scale-95"
          >
            <div className={`px-2.5 py-0.5 ${activeOffer?.id === offers[2].id ? 'bg-emerald-700 ring-4 ring-emerald-500/20' : 'bg-emerald-600'} text-white rounded text-[11px] font-bold shadow-md border-2 border-white`}>
              <span>R$ {Math.round(offers[2].price)}</span>
            </div>
          </button>
        )}
      </div>

      {/* Bottom Floating Info Card Sheet */}
      {activeOffer && (
        <div className="relative z-10 p-4 pb-20">
          <div className="bg-white rounded p-4 shadow-xl border border-slate-100 flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex gap-3">
              <div className="w-16 h-16 rounded overflow-hidden bg-slate-100 shrink-0">
                <img
                  src={activeOffer.imageUrl}
                  alt={activeOffer.salonName}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 truncate">{activeOffer.salonName}</h3>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-xs font-bold text-slate-800">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span>{activeOffer.rating}</span>
                    </div>
                    {onToggleFavorite && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleFavorite(activeOffer.id);
                        }}
                        className="p-1 text-slate-400 hover:text-rose-500 transition"
                      >
                        <Heart
                          className={`w-4 h-4 ${
                            favorites.includes(activeOffer.id)
                              ? 'fill-rose-500 text-rose-500'
                              : 'text-slate-400'
                          }`}
                        />
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-xs text-slate-600 mt-0.5">
                  {activeOffer.serviceTitle} • <span className="font-semibold">{activeOffer.professionalName}</span>
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {formatSlotDateTime(activeOffer.timeSlot)} • {activeOffer.distance}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <div>
                <span className="text-base font-black text-slate-900">
                  R$ {activeOffer.price.toFixed(2).replace('.', ',')}
                </span>
              </div>
              <button
                id="btn-ver-oferta-mapa"
                onClick={() => onSelectOffer(activeOffer)}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-bold transition shadow-sm uppercase tracking-wide cursor-pointer"
              >
                VER OFERTA
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
