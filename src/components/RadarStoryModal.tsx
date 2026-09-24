import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Volume2, VolumeX, Clock, Zap } from 'lucide-react';
import { ServiceOffer } from '../types';
import { MediaFallbackCard } from './MediaFallbackCard';
import { formatSlotDateTime } from '../utils/dateFormatter';
import { getSalonLogo } from '../utils/salonLogos';

interface RadarStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  offers: ServiceOffer[];
  initialIndex?: number;
  onConfirmBooking: (offer: ServiceOffer) => void;
  onNavigateToDetail: (offer: ServiceOffer) => void;
}

export const RadarStoryModal: React.FC<RadarStoryModalProps> = ({
  isOpen,
  onClose,
  offers,
  initialIndex = 0,
  onConfirmBooking,
  onNavigateToDetail,
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(initialIndex);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Sync index and reset progress when opening modal or when initialIndex changes
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(Math.min(Math.max(0, initialIndex), Math.max(0, offers.length - 1)));
      setProgress(0);
    }
  }, [isOpen, initialIndex, offers.length]);

  const STORY_DURATION_MS = 6000;

  // Auto-advancing story timer
  useEffect(() => {
    if (!isOpen || isPaused || offers.length === 0) return;

    const interval = 50;
    const step = (interval / STORY_DURATION_MS) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev + step >= 100) {
          if (currentIndex < offers.length - 1) {
            setCurrentIndex((curr) => curr + 1);
            return 0;
          } else {
            // Close safely without state update during rendering
            setTimeout(() => onClose(), 0);
            return 100;
          }
        }
        return prev + step;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [isOpen, isPaused, currentIndex, offers.length, onClose]);

  // Video reset on story change
  useEffect(() => {
    setProgress(0);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  }, [currentIndex]);

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (currentIndex < offers.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setProgress(0);
    } else {
      onClose();
    }
  };

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setProgress(0);
    }
  };

  if (!isOpen || offers.length === 0) return null;

  const activeOffer = offers[currentIndex] || offers[0];
  if (!activeOffer) return null;

  const mediaLevel = activeOffer.mediaLevel || (activeOffer.imageUrl ? 2 : 1);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.2 }}
          className="relative w-full h-full max-w-md bg-slate-950 flex flex-col justify-between overflow-hidden shadow-2xl select-none"
          onMouseDown={() => setIsPaused(true)}
          onMouseUp={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
        >
          {/* Top Multi-Story Progress Bars */}
          <div className="absolute top-0 inset-x-0 z-40 p-3 pt-4 flex gap-1.5 bg-gradient-to-b from-black/80 via-black/40 to-transparent">
            {offers.map((off, idx) => (
              <div key={off.id} className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white transition-all duration-75 ease-linear rounded-full"
                  style={{
                    width:
                      idx < currentIndex
                        ? '100%'
                        : idx === currentIndex
                        ? `${progress}%`
                        : '0%',
                  }}
                />
              </div>
            ))}
          </div>

          {/* Top Bar Header */}
          <div className="absolute top-8 inset-x-0 z-40 px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-9 px-2 rounded ring-1 ring-emerald-500/80 bg-slate-900/90 backdrop-blur-md overflow-hidden flex items-center justify-center text-white font-bold shadow-lg">
                <img
                  src={getSalonLogo(activeOffer.salonName, activeOffer.salonLogo)}
                  alt={activeOffer.salonName}
                  className="h-full w-auto max-w-[110px] object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-sm font-bold text-white leading-none">
                    {activeOffer.salonName}
                  </h4>
                  <span className="bg-emerald-500 text-white drop-shadow-xs text-[9px] font-black uppercase px-1.5 py-0.5 rounded">
                    VAGA AGORA
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 mt-0.5 flex items-center gap-1">
                  <span>{activeOffer.professionalName}</span>
                  <span>•</span>
                  <span>{activeOffer.distance}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {mediaLevel === 3 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMuted(!isMuted);
                  }}
                  className="w-8 h-8 rounded bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/60 transition"
                  aria-label={isMuted ? 'Ativar som' : 'Desativar som'}
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
              )}

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
                className="w-8 h-8 rounded bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/60 transition"
                aria-label="Fechar Story"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Story Visual Media */}
          <div className="relative w-full h-full flex items-center justify-center bg-black">
            {mediaLevel === 3 && activeOffer.videoUrl ? (
              <video
                ref={videoRef}
                src={activeOffer.videoUrl}
                autoPlay
                loop
                muted={isMuted}
                playsInline
                className="w-full h-full object-cover"
              />
            ) : mediaLevel === 2 && activeOffer.imageUrl ? (
              <img
                src={activeOffer.imageUrl}
                alt={activeOffer.serviceTitle}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <MediaFallbackCard offer={activeOffer} isStoryMode />
            )}

            <div className="absolute inset-x-0 bottom-0 h-72 bg-gradient-to-t from-black via-black/70 to-transparent pointer-events-none" />

            <div onClick={handlePrev} className="absolute inset-y-16 left-0 w-1/3 z-30 cursor-pointer" />
            <div onClick={handleNext} className="absolute inset-y-16 right-0 w-1/3 z-30 cursor-pointer" />
          </div>

          {/* Bottom Card Content & 1-Tap CTA */}
          <div className="absolute inset-x-0 bottom-0 z-40 p-5 space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-bold shadow-md">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                <span>{formatSlotDateTime(activeOffer.timeSlot)}</span>
              </div>

              {activeOffer.activeViewers && (
                <div className="px-2.5 py-1 rounded bg-black/60 backdrop-blur-md border border-white/10 text-[11px] font-medium text-slate-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
                  <span>{activeOffer.activeViewers} pessoas vendo</span>
                </div>
              )}
            </div>

            <div className="bg-slate-900/90 backdrop-blur-lg border border-white/15 rounded p-4 shadow-xl">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white leading-snug">
                    {activeOffer.serviceTitle}
                  </h3>
                  <p className="text-xs text-slate-300 mt-1">
                    {activeOffer.description || `Atendimento com ${activeOffer.professionalName} (${activeOffer.duration})`}
                  </p>
                </div>
                <div className="text-right">
                  {activeOffer.originalPrice && (
                    <span className="text-xs text-slate-400 line-through block">
                      R${activeOffer.originalPrice.toFixed(0)}
                    </span>
                  )}
                  <span className="text-2xl font-black text-emerald-400">
                    R${activeOffer.price.toFixed(0)}
                  </span>
                </div>
              </div>

              <div className="mt-3.5 pt-3 border-t border-white/10 flex items-center gap-2">
                <button
                  id="btn-story-reservar"
                  onClick={(e) => {
                    e.stopPropagation();
                    onConfirmBooking(activeOffer);
                    onClose();
                  }}
                  className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-white drop-shadow-xs font-black text-sm rounded transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 uppercase tracking-wide"
                >
                  <Zap className="w-4 h-4 fill-white text-white" />
                  <span>RESERVAR ESTE HORÁRIO</span>
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onNavigateToDetail(activeOffer);
                    onClose();
                  }}
                  className="px-3.5 py-3 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded transition border border-white/10"
                >
                  Detalhes
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
