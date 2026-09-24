import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Search, X, Compass, Mic, Volume2 } from 'lucide-react';
import { ServiceOffer } from '../types';
import { RadarOfferCard } from './RadarOfferCard';
import { VoiceRecognitionSession, isSpeechRecognitionSupported } from '../utils/speechRecognition';
import { hapticLight, hapticSuccess } from '../utils/haptics';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  offers: ServiceOffer[];
  onSelectOffer: (offer: ServiceOffer) => void;
  onConfirmBooking: (offer: ServiceOffer) => void;
  favorites?: string[];
  onToggleFavorite?: (id: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  offers,
  onSelectOffer,
  onConfirmBooking,
  favorites = [],
  onToggleFavorite,
}) => {
  const [query, setQuery] = useState<string>('');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [voiceFeedback, setVoiceFeedback] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const voiceSessionRef = useRef<VoiceRecognitionSession | null>(null);

  // Initialize voice session instance
  useEffect(() => {
    voiceSessionRef.current = new VoiceRecognitionSession();
    return () => {
      voiceSessionRef.current?.abort();
    };
  }, []);

  // Auto-focus when modal opens
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 60);
      return () => clearTimeout(timer);
    } else {
      setQuery('');
      setIsListening(false);
      setVoiceFeedback(null);
      voiceSessionRef.current?.abort();
    }
  }, [isOpen]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleToggleVoiceSearch = () => {
    hapticLight();
    if (!voiceSessionRef.current || !isSpeechRecognitionSupported()) {
      setVoiceFeedback('Reconhecimento de voz não suportado neste navegador.');
      setTimeout(() => setVoiceFeedback(null), 3000);
      return;
    }

    if (isListening) {
      voiceSessionRef.current.stop();
      setIsListening(false);
      setVoiceFeedback(null);
    } else {
      setIsListening(true);
      setVoiceFeedback('Ouvindo... Fale o serviço ou salão');

      const started = voiceSessionRef.current.start({
        onStart: () => {
          setIsListening(true);
        },
        onResult: (transcript: string, isFinal: boolean) => {
          setQuery(transcript);
          if (isFinal) {
            hapticSuccess();
            setIsListening(false);
            setVoiceFeedback(`Buscando por: "${transcript}"`);
            setTimeout(() => setVoiceFeedback(null), 2500);
          }
        },
        onError: (errMsg: string) => {
          setIsListening(false);
          setVoiceFeedback(errMsg);
          setTimeout(() => setVoiceFeedback(null), 3500);
        },
        onEnd: () => {
          setIsListening(false);
        },
      });

      if (!started) {
        setIsListening(false);
      }
    }
  };

  const quickTags = ['Degradê', 'Barba', 'Corte Feminino', 'Unhas em Gel', 'Sobrancelha'];

  const filteredOffers = useMemo(() => {
    if (!query.trim()) return [];

    const q = query.toLowerCase().trim();
    return offers.filter(
      (o) =>
        o.salonName.toLowerCase().includes(q) ||
        o.serviceTitle.toLowerCase().includes(q) ||
        o.professionalName.toLowerCase().includes(q) ||
        o.neighborhood.toLowerCase().includes(q) ||
        o.serviceCategory.toLowerCase().includes(q)
    );
  }, [offers, query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-xl animate-fadeIn">
      {/* Background click to close */}
      <div 
        className="absolute inset-0 -z-10 cursor-pointer" 
        onClick={onClose}
        aria-label="Fechar busca"
      />

      {/* Floating Center Search Container (Opção A) */}
      <div className="w-full max-w-lg flex flex-col transition-all duration-200 animate-in zoom-in-95">
        
        {/* Floating Search Bar */}
        <div className={`relative bg-[#151A1E] border-2 ${
          isListening ? 'border-[#20C933] shadow-[0_0_25px_rgba(32,201,51,0.35)]' : 'border-slate-700/80 focus-within:border-[#20C933]'
        } rounded p-1.5 shadow-[0_20px_50px_rgba(0,0,0,0.8)] flex items-center gap-1 transition-all`}>
          {/* Action Button: Search */}
          <button
            type="button"
            onClick={() => inputRef.current?.focus()}
            className="p-2.5 rounded text-[#20C933] hover:bg-slate-800/80 active:scale-95 transition-all flex items-center justify-center cursor-pointer"
            aria-label="Buscar"
            title="Buscar"
          >
            <Search className="w-5 h-5" />
          </button>

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={isListening ? 'Ouvindo sua voz...' : 'Ex: Barba, Degradê...'}
            className="flex-1 bg-transparent py-3 pr-2 text-base sm:text-lg font-medium text-white placeholder-slate-500 focus:outline-none"
          />

          {/* Action Button: Voice Search (Web Speech API) */}
          <button
            id="btn-busca-por-voz"
            type="button"
            onClick={handleToggleVoiceSearch}
            className={`p-2.5 rounded transition-all flex items-center justify-center cursor-pointer active:scale-95 ${
              isListening
                ? 'bg-[#20C933] text-white shadow-lg animate-pulse'
                : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700'
            }`}
            aria-label={isListening ? 'Parar escuta de voz' : 'Pesquisar por comando de voz'}
            title={isListening ? 'Parar escuta de voz' : 'Pesquisar por voz'}
          >
            {isListening ? (
              <Mic className="w-4 h-4 text-white animate-bounce" />
            ) : (
              <Mic className="w-4 h-4 text-slate-300" />
            )}
          </button>

          {/* Action Button: Clear query or Close modal */}
          {query ? (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              className="p-2.5 rounded bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 active:scale-95 transition-all flex items-center justify-center cursor-pointer"
              aria-label="Limpar campo de busca"
              title="Limpar campo"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="p-2.5 rounded bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700 active:scale-95 transition-all flex items-center justify-center cursor-pointer border border-slate-700/60"
              aria-label="Fechar busca"
              title="Fechar"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Voice Feedback Banner */}
        {voiceFeedback && (
          <div className="mt-2.5 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-center flex items-center justify-center gap-2 text-[#20C933] animate-fadeIn">
            {isListening ? <Volume2 className="w-3.5 h-3.5 animate-pulse" /> : null}
            <span className="font-medium">{voiceFeedback}</span>
          </div>
        )}

        {/* State 1: When user hasn't typed anything yet */}
        {!query.trim() ? (
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            {quickTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setQuery(tag)}
                className="px-3.5 py-1.5 rounded bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-medium transition active:scale-95 shadow-sm"
              >
                {tag}
              </button>
            ))}
          </div>
        ) : (
          /* State 2: Results revealed directly under the central search bar */
          <div className="mt-3 bg-[#151A1E]/95 border border-slate-800 rounded p-3 shadow-2xl max-h-[60vh] overflow-y-auto space-y-3 no-scrollbar">
            <div className="flex items-center justify-between px-2 pt-1 pb-2 border-b border-slate-800/80 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#20C933]" />
                <span className="font-bold text-slate-200 font-['Poppins']">
                  {filteredOffers.length} {filteredOffers.length === 1 ? 'vaga encontrada' : 'vagas encontradas'}
                </span>
              </div>
              <span className="text-slate-400 text-[11px]">
                para "{query}"
              </span>
            </div>

            {filteredOffers.length > 0 ? (
              filteredOffers.map((offer) => (
                <RadarOfferCard
                  key={offer.id}
                  offer={offer}
                  isFavorite={favorites.includes(offer.id)}
                  onToggleFavorite={(id) => onToggleFavorite?.(id)}
                  onSelectOffer={(off) => {
                    onClose();
                    onSelectOffer(off);
                  }}
                  onDirectBook={(off) => {
                    onClose();
                    onConfirmBooking(off);
                  }}
                />
              ))
            ) : (
              <div className="py-8 text-center px-4">
                <Compass className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-300">
                  Nenhuma vaga encontrada para "{query}"
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Tente buscar por outro termo ou nome de salão/barbearia.
                </p>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
