import React, { useState } from 'react';
import { Zap, Clock, Calendar, Scissors, Sparkles, X, Check } from 'lucide-react';
import { PartnerProfessional, ServiceOffer } from '../types';

interface PartnerPublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  professionals: PartnerProfessional[];
  onPublishOffer: (newOffer: {
    professionalId: string;
    professionalName: string;
    serviceTitle: string;
    serviceCategory: 'cabelo' | 'barba' | 'unhas' | 'beleza' | 'estetica';
    price: number;
    originalPrice: number;
    timeSlot: string;
    dayLabel: string;
    duration: string;
    dateIso: string;
  }) => void;
  initialPrefill?: {
    professionalId?: string;
    time?: string;
    date?: string;
  };
}

export const PartnerPublishModal: React.FC<PartnerPublishModalProps> = ({
  isOpen,
  onClose,
  professionals,
  onPublishOffer,
  initialPrefill,
}) => {
  const [selectedProfId, setSelectedProfId] = useState<string>(
    initialPrefill?.professionalId || professionals[0]?.id || ''
  );
  const [serviceTitle, setServiceTitle] = useState<string>('Corte Degradê Navalhado');
  const [serviceCategory, setServiceCategory] = useState<'cabelo' | 'barba' | 'unhas' | 'beleza' | 'estetica'>('cabelo');
  const [price, setPrice] = useState<number>(40.0);
  const [originalPrice, setOriginalPrice] = useState<number>(55.0);
  const [timeSlot, setTimeSlot] = useState<string>(initialPrefill?.time || '15:30');
  const [dayChoice, setDayChoice] = useState<'hoje' | 'amanha'>('hoje');
  const [duration, setDuration] = useState<string>('45 min');

  if (!isOpen) return null;

  const discountPercent =
    originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const prof = professionals.find((p) => p.id === selectedProfId) || professionals[0];
    const today = new Date();
    if (dayChoice === 'amanha') {
      today.setDate(today.getDate() + 1);
    }
    const dateIso = today.toISOString().split('T')[0];

    onPublishOffer({
      professionalId: prof.id,
      professionalName: prof.name,
      serviceTitle,
      serviceCategory,
      price: Number(price),
      originalPrice: Number(originalPrice),
      timeSlot: `${dayChoice === 'hoje' ? 'Hoje' : 'Amanhã'} • ${timeSlot}`,
      dayLabel: dayChoice === 'hoje' ? 'Hoje' : 'Amanhã',
      duration,
      dateIso,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-sm">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-md shadow-2xl p-5 space-y-4 animate-in slide-in-from-bottom-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Zap className="w-4 h-4 fill-emerald-600 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900">
                Publicar Vaga Relâmpago
              </h3>
              <p className="text-[11px] text-slate-500">
                Aparece no radar de clientes próximos instantaneamente
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Professional Selection */}
          <div>
            <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">
              Profissional Responsável
            </label>
            <select
              value={selectedProfId}
              onChange={(e) => setSelectedProfId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {professionals.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — {p.role}
                </option>
              ))}
            </select>
          </div>

          {/* Service Title & Category */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">
                Serviço Oferecido
              </label>
              <input
                type="text"
                required
                value={serviceTitle}
                onChange={(e) => setServiceTitle(e.target.value)}
                placeholder="Ex: Corte Degradê"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">
                Categoria
              </label>
              <select
                value={serviceCategory}
                onChange={(e) => setServiceCategory(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="cabelo">Cabelo</option>
                <option value="barba">Barba</option>
                <option value="unhas">Unhas</option>
                <option value="beleza">Sobrancelhas</option>
                <option value="estetica">Estética</option>
              </select>
            </div>
          </div>

          {/* Day & Time */}
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">
                Dia
              </label>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => setDayChoice('hoje')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition border ${
                    dayChoice === 'hoje'
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  Hoje
                </button>
                <button
                  type="button"
                  onClick={() => setDayChoice('amanha')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition border ${
                    dayChoice === 'amanha'
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  Amanhã
                </button>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">
                Horário
              </label>
              <input
                type="time"
                required
                value={timeSlot}
                onChange={(e) => setTimeSlot(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">
                Duração
              </label>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="30 min">30 min</option>
                <option value="45 min">45 min</option>
                <option value="50 min">50 min</option>
                <option value="60 min">60 min</option>
              </select>
            </div>
          </div>

          {/* Pricing & Discount */}
          <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-950">Valores da Oferta</span>
              {discountPercent > 0 && (
                <span className="text-[10px] font-black bg-emerald-600 text-white px-2 py-0.5 rounded-full">
                  -{discountPercent}% OFF para atrair cliente rápido
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="text-[10px] font-bold text-emerald-800 uppercase block mb-1">
                  Preço Original (R$)
                </label>
                <input
                  type="number"
                  min="0"
                  step="5"
                  value={originalPrice}
                  onChange={(e) => setOriginalPrice(Number(e.target.value))}
                  className="w-full bg-white border border-emerald-200 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-800"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-emerald-800 uppercase block mb-1">
                  Preço Promocional no App (R$)
                </label>
                <input
                  type="number"
                  min="0"
                  step="5"
                  required
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="w-full bg-white border border-emerald-300 rounded-lg px-3 py-1.5 text-xs font-black text-emerald-700 ring-2 ring-emerald-500/20"
                />
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] text-white font-black text-xs uppercase tracking-wider rounded-xl transition shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4 fill-white" />
              <span>Publicar Vaga no Vagou Agora</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
