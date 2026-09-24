import React from 'react';
import { motion } from 'motion/react';
import { Star, MapPin } from 'lucide-react';
import { ServiceOffer } from '../types';

interface MediaFallbackCardProps {
  offer: ServiceOffer;
  size?: 'full' | 'compact';
}

export const MediaFallbackCard: React.FC<MediaFallbackCardProps> = ({ offer }) => {
  const gradientClass = offer.brandGradient || 'from-slate-950 via-slate-900 to-zinc-950';

  return (
    <div className={`relative w-full h-full bg-gradient-to-br ${gradientClass} flex flex-col items-center justify-between p-6 text-white overflow-hidden select-none`}>
      {/* Background Pulsing Mesh */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
        <motion.div
          animate={{ scale: [1, 1.3, 1], x: [-20, 20, -20], y: [-10, 10, -10] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-12 -left-12 w-64 h-64 rounded-full bg-emerald-500/30 blur-3xl"
        />
        <motion.div
          animate={{ scale: [1.2, 1, 1.2], x: [20, -20, 20], y: [10, -10, 10] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -bottom-16 -right-16 w-64 h-64 rounded-full bg-indigo-500/30 blur-3xl"
        />
      </div>

      {/* Top Header */}
      <div className="relative z-10 w-full flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center font-bold text-xs text-white">
            {offer.salonName.charAt(0)}
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">
              Salão Verificado
            </span>
            <h4 className="text-xs font-semibold text-slate-200 truncate max-w-[160px]">
              {offer.salonName}
            </h4>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded border border-white/10 text-[11px] font-bold text-amber-300">
          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
          <span>{offer.rating.toFixed(1)}</span>
        </div>
      </div>

      {/* Center Service Information */}
      <div className="relative z-10 my-auto flex flex-col items-center text-center px-4 py-2">
        <motion.h3
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xl sm:text-2xl font-black text-white tracking-tight leading-tight"
        >
          {offer.serviceTitle}
        </motion.h3>

        <p className="mt-2 text-xs text-slate-300/90 max-w-[240px] line-clamp-2">
          {offer.description || `Com ${offer.professionalName} no ${offer.salonName}`}
        </p>

        <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded bg-white/10 backdrop-blur-md border border-white/15 text-[10px] font-medium text-slate-200">
          <MapPin className="w-3 h-3 text-emerald-400" />
          <span>{offer.neighborhood} • {offer.distance}</span>
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 w-full pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
        <span className="flex items-center gap-1.5 text-[10px] text-emerald-300 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
          Vaga Imediata no Radar
        </span>
        <span className="text-[10px] text-slate-400">
          {offer.duration} de atendimento
        </span>
      </div>
    </div>
  );
};
