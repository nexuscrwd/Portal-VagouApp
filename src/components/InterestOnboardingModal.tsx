import React, { useState } from 'react';
import { Check, Sparkles, X } from 'lucide-react';
import { VagouLogo } from './VagouLogo';
import { useTheme } from '../context/ThemeContext';

export interface InterestCategoryOption {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  categoryIds: string[];
}

export const INTEREST_OPTIONS: InterestCategoryOption[] = [
  {
    id: 'barbearia',
    title: 'Barbearia & Beleza Masculina',
    subtitle: 'Barba, corte masculino, degradê e pigmentação',
    badge: 'Barba & Corte',
    categoryIds: ['barba', 'cabelo'],
  },
  {
    id: 'salao',
    title: 'Salão Feminino, Cabelo & Mechas',
    subtitle: 'Corte, escova, mechas, luzes e hidratação',
    badge: 'Cabelo & Mechas',
    categoryIds: ['cabelo'],
  },
  {
    id: 'unhas_cilios',
    title: 'Unhas, Cílios & Sobrancelhas',
    subtitle: 'Manicure em gel, extensão de cílios e design',
    badge: 'Design & Gel',
    categoryIds: ['unhas', 'beleza'],
  },
  {
    id: 'estetica',
    title: 'Estética & Cuidados Faciais',
    subtitle: 'Limpeza de pele, massagem e estética corporal',
    badge: 'Bem-Estar',
    categoryIds: ['estetica', 'beleza'],
  },
];

interface InterestOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSavePreferences: (selectedIds: string[]) => void;
}

export const InterestOnboardingModal: React.FC<InterestOnboardingModalProps> = ({
  isOpen,
  onClose,
  onSavePreferences,
}) => {
  const { isDark } = useTheme();
  const [selectedIds, setSelectedIds] = useState<string[]>(['barbearia']);

  if (!isOpen) return null;

  const toggleInterest = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? (prev.length > 1 ? prev.filter((item) => item !== id) : prev) : [...prev, id]
    );
  };

  const handleSave = () => {
    onSavePreferences(selectedIds);
    onClose();
  };

  const handleSelectAll = () => {
    onSavePreferences(['todos', 'barbearia', 'salao', 'unhas_cilios', 'estetica']);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className={`w-full max-w-sm rounded-3xl p-6 shadow-2xl relative border ${
        isDark ? 'bg-[#151A1E] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        {/* Close button */}
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 p-2 rounded-full border transition ${
            isDark ? 'text-slate-400 hover:text-white bg-slate-900/80 border-slate-800' : 'text-slate-500 hover:text-slate-900 bg-slate-100 border-slate-200'
          }`}
          aria-label="Fechar"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Brand header */}
        <div className="flex flex-col items-center text-center pt-2 pb-4">
          <VagouLogo variant="header" size="sm" theme={isDark ? 'dark' : 'light'} showTagline={false} />
          <h2 className={`text-lg font-black mt-3 font-['Poppins'] ${isDark ? 'text-white' : 'text-slate-900'}`}>
            O que você costuma agendar?
          </h2>
          <p className={`text-xs mt-1 max-w-[260px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Personalize suas categorias estilo Netflix para ver vagas imediatas sob medida.
          </p>
        </div>

        {/* Options */}
        <div className="space-y-2.5 my-3">
          {INTEREST_OPTIONS.map((opt) => {
            const isSelected = selectedIds.includes(opt.id);
            return (
              <div
                key={opt.id}
                onClick={() => toggleInterest(opt.id)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  isSelected
                    ? isDark
                      ? 'bg-emerald-950/40 border-[#20C933] shadow-md shadow-emerald-950/50'
                      : 'bg-emerald-50/80 border-[#20C933] shadow-xs'
                    : isDark
                    ? 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex-1 pr-3">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold font-['Poppins'] ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {opt.title}
                    </span>
                  </div>
                  <p className={`text-[11px] mt-0.5 leading-snug ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {opt.subtitle}
                  </p>
                </div>

                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center transition ${
                    isSelected
                      ? 'bg-[#20C933] text-white shadow-sm'
                      : isDark
                      ? 'border-2 border-slate-700 bg-slate-800'
                      : 'border-2 border-slate-300 bg-white'
                  }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5 stroke-[3] text-white" />}
                </div>
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div className="pt-3 space-y-2">
          <button
            onClick={handleSave}
            className="w-full py-3 bg-[#20C933] hover:bg-[#1bb32d] active:scale-[0.99] text-white font-black text-xs drop-shadow-xs rounded-xl transition shadow-lg shadow-emerald-600/30 uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 fill-white text-white" />
            <span>Ver Vagas Personalizadas</span>
          </button>

          <button
            onClick={handleSelectAll}
            className={`w-full py-2 text-xs font-medium transition text-center cursor-pointer ${
              isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Quero ver todas as categorias
          </button>
        </div>
      </div>
    </div>
  );
};
