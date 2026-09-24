import React, { useState, useRef } from 'react';
import { Heart, Volume2, VolumeX, Play, ChevronLeft, ChevronRight, Zap } from 'lucide-react';
import { ServiceOffer } from '../types';
import { MediaFallbackCard } from './MediaFallbackCard';
import { formatSlotDateTime } from '../utils/dateFormatter';
import { getSalonLogo } from '../utils/salonLogos';
import { hapticLight, hapticMedium } from '../utils/haptics';

interface RadarOfferCardProps {
  offer: ServiceOffer;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onSelectOffer: (offer: ServiceOffer) => void;
  onDirectBook: (offer: ServiceOffer) => void;
  onOpenStory?: () => void;
  onFilterBySalon?: (salonName: string) => void;
  onOpenSalonProfile?: (salonName: string) => void;
}

export const RadarOfferCard: React.FC<RadarOfferCardProps> = ({
  offer,
  isFavorite,
  onToggleFavorite,
  onSelectOffer,
  onDirectBook,
  onOpenStory,
  onFilterBySalon,
  onOpenSalonProfile,
}) => {
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [carouselIndex, setCarouselIndex] = useState<number>(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const mediaLevel = offer.mediaLevel || (offer.imageUrl ? 2 : 1);
  const gallery = offer.galleryImages && offer.galleryImages.length > 0
    ? offer.galleryImages
    : offer.imageUrl
    ? [offer.imageUrl]
    : [];

  // Swipe & Touch Gesture State
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const isSwiping = useRef<boolean>(false);
  const mouseDownX = useRef<number | null>(null);
  const isDraggingMouse = useRef<boolean>(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchEndX.current = null;
    touchStartX.current = e.targetTouches[0].clientX;
    isSwiping.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
    if (touchStartX.current && Math.abs(touchStartX.current - touchEndX.current) > 10) {
      isSwiping.current = true;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 30;

    if (Math.abs(distance) >= minSwipeDistance && gallery.length > 1) {
      if (distance > 0) {
        setCarouselIndex((prev) => (prev + 1) % gallery.length);
      } else {
        setCarouselIndex((prev) => (prev - 1 + gallery.length) % gallery.length);
      }
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    mouseDownX.current = e.clientX;
    isDraggingMouse.current = true;
    isSwiping.current = false;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingMouse.current || mouseDownX.current === null) return;
    if (Math.abs(mouseDownX.current - e.clientX) > 10) {
      isSwiping.current = true;
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isDraggingMouse.current || mouseDownX.current === null) return;
    const distance = mouseDownX.current - e.clientX;
    mouseDownX.current = null;
    isDraggingMouse.current = false;
    const minSwipeDistance = 30;

    if (Math.abs(distance) >= minSwipeDistance && gallery.length > 1) {
      if (distance > 0) {
        setCarouselIndex((prev) => (prev + 1) % gallery.length);
      } else {
        setCarouselIndex((prev) => (prev - 1 + gallery.length) % gallery.length);
      }
    }
  };

  const handleMouseLeave = () => {
    isDraggingMouse.current = false;
    mouseDownX.current = null;
  };

  const toggleVideoPlayback = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const nextCarouselImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (gallery.length > 1) {
      setCarouselIndex((prev) => (prev + 1) % gallery.length);
    }
  };

  const prevCarouselImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (gallery.length > 1) {
      setCarouselIndex((prev) => (prev - 1 + gallery.length) % gallery.length);
    }
  };

  return (
    <div
      onClick={() => {
        if (isSwiping.current) return;
        onSelectOffer(offer);
      }}
      className="relative z-0 w-full rounded overflow-hidden bg-slate-900 border border-slate-800 shadow-lg group hover:border-emerald-500/50 transition-all duration-300 cursor-pointer"
    >
      {/* Media Canvas Container */}
      <div className="relative w-full h-[390px] sm:h-[440px] bg-slate-950 overflow-hidden">
        {/* LEVEL 3: Video */}
        {mediaLevel === 3 && offer.videoUrl ? (
          <div className="relative w-full h-full" onClick={toggleVideoPlayback}>
            <video
              ref={videoRef}
              src={offer.videoUrl}
              autoPlay
              loop
              muted={isMuted}
              playsInline
              className="w-full h-full object-cover"
            />
            {!isPlaying && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center pointer-events-none">
                <div className="w-14 h-14 rounded bg-black/60 backdrop-blur-md flex items-center justify-center text-white">
                  <Play className="w-7 h-7 fill-white translate-x-0.5" />
                </div>
              </div>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsMuted(!isMuted);
              }}
              className="absolute bottom-3 right-3 z-20 w-8 h-8 rounded bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-black/80 transition shadow-md cursor-pointer"
              aria-label={isMuted ? 'Ativar som' : 'Desativar som'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>
        ) : mediaLevel === 2 && gallery.length > 0 ? (
          /* LEVEL 2: Photo Carousel with Touch Swipe */
          <div
            className="relative w-full h-full overflow-hidden select-none"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
          >
            <div
              className="flex w-full h-full transition-transform duration-300 ease-out"
              style={{ transform: `translateX(-${carouselIndex * 100}%)` }}
            >
              {gallery.map((imgUrl, idx) => (
                <img
                  key={idx}
                  src={imgUrl}
                  alt={`${offer.serviceTitle} - ${idx + 1}`}
                  className="w-full h-full object-cover flex-shrink-0"
                  referrerPolicy="no-referrer"
                  draggable={false}
                />
              ))}
            </div>

            {gallery.length > 1 && (
              <>
                <button
                  onClick={prevCarouselImage}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/60 transition cursor-pointer"
                  aria-label="Foto anterior"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={nextCarouselImage}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/60 transition cursor-pointer"
                  aria-label="Próxima foto"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        ) : (
          /* LEVEL 1: Fallback Universal */
          <div className="relative w-full h-full">
            <MediaFallbackCard offer={offer} />
          </div>
        )}

        {/* Top Gradient for text contrast */}
        <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-slate-950/90 via-slate-950/50 to-transparent pointer-events-none z-10" />

        {/* Top Header - Reels / Stories Style: Salon Info + Favorite Inline & Action Top Right */}
        <div className="absolute top-3 inset-x-3 z-20 flex items-start justify-between gap-2">
          {/* Left: Salon & Service Info + Inline Micro-Favorite */}
          <div className="flex-1 min-w-0 pr-1">
            <div className="flex items-center gap-2">
              {/* Logo do Salão em Formato Retangular/Badge em PNG transparente */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onOpenSalonProfile) {
                    onOpenSalonProfile(offer.salonName);
                  } else if (onFilterBySalon) {
                    onFilterBySalon(offer.salonName);
                  }
                }}
                className="h-7 px-1.5 rounded overflow-hidden bg-slate-950/80 backdrop-blur-md border border-slate-700/80 hover:border-emerald-500 transition cursor-pointer shadow-md flex items-center justify-center shrink-0"
                title={`Ver perfil de ${offer.salonName}`}
              >
                <img
                  src={getSalonLogo(offer.salonName, offer.salonLogo)}
                  alt={offer.salonName}
                  className="h-full w-auto max-w-[95px] object-contain"
                  referrerPolicy="no-referrer"
                />
              </button>

              <div className="flex items-center gap-1.5 min-w-0">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onOpenSalonProfile) {
                      onOpenSalonProfile(offer.salonName);
                    } else if (onFilterBySalon) {
                      onFilterBySalon(offer.salonName);
                    }
                  }}
                  className="text-xs font-bold text-white hover:text-emerald-400 truncate tracking-wide flex items-center gap-1 transition cursor-pointer shadow-sm drop-shadow"
                  title={`Ver perfil completo de ${offer.salonName}`}
                >
                  <span className="truncate">{offer.salonName}</span>
                  <ChevronRight className="w-3 h-3 text-emerald-400 shrink-0" />
                </button>

                {/* Inline Micro Favorite Heart (Opção 3) */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    hapticLight();
                    onToggleFavorite(offer.id);
                  }}
                  className="p-1 -ml-0.5 rounded hover:bg-white/10 active:scale-90 transition cursor-pointer shrink-0"
                  title={isFavorite ? "Remover dos favoritos" : "Salvar nos favoritos"}
                  aria-label="Favoritar"
                >
                  <Heart
                    className={`w-3.5 h-3.5 drop-shadow transition-colors ${
                      isFavorite ? 'fill-rose-500 text-rose-500' : 'text-white/80 hover:text-white'
                    }`}
                  />
                </button>
              </div>
            </div>

            <h3 className="text-sm font-black text-white leading-tight truncate mt-1 drop-shadow-md">
              {offer.serviceTitle}
            </h3>

            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[11px] text-slate-200 font-medium drop-shadow truncate">
                Com <strong className="text-white">{offer.professionalName}</strong>
              </span>
            </div>
          </div>

          {/* Right Actions: Gallery Dots */}
          {gallery.length > 1 && (
            <div className="flex items-center gap-1 bg-slate-900/80 backdrop-blur-md border border-white/20 px-2 py-1 rounded shadow-sm shrink-0 pt-0.5">
              {gallery.map((_, idx) => (
                <span
                  key={idx}
                  className={`h-1 rounded transition-all duration-300 ${
                    idx === carouselIndex ? 'w-2.5 bg-emerald-400' : 'w-1 bg-white/60'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Bottom subtle gradient for contrast */}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-950/80 via-slate-950/40 to-transparent pointer-events-none z-10" />

        {/* Bottom Left: Easy Thumb Access (Slot Time & Quick Book) */}
        <div className="absolute bottom-3 left-3 z-20 flex flex-col items-start gap-1">
          <span className="text-[11px] font-black text-emerald-400 font-mono tracking-tight drop-shadow-md bg-black/50 backdrop-blur-sm px-1.5 py-0.5 rounded leading-none border border-emerald-500/20">
            {formatSlotDateTime(offer.timeSlot)}
          </span>

          <button
            id={`btn-radar-agendar-${offer.id}`}
            onClick={(e) => {
              e.stopPropagation();
              hapticMedium();
              onDirectBook(offer);
            }}
            className="h-8 px-3 bg-[#20C933] hover:bg-[#1bb32d] active:scale-95 text-white drop-shadow-xs text-xs font-black rounded transition shadow-lg shadow-emerald-500/30 uppercase tracking-wider flex items-center gap-1.5 font-['Poppins'] cursor-pointer whitespace-nowrap"
          >
            <Zap className="w-3.5 h-3.5 fill-white text-white shrink-0" />
            <span>AGENDAR • R${offer.price.toFixed(0)}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
