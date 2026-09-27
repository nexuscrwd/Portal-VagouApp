import React, { useState } from 'react';
import { X, Check, Baby, Sparkles, User, Heart, Calendar, FileText, Phone, Mail, ShieldCheck } from 'lucide-react';
import { FamilyMemberProfile, FamilyAutonomyLevel } from '../types';
import { hapticLight, hapticSuccess } from '../utils/haptics';
import { useTheme } from '../context/ThemeContext';

interface AddFamilyMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddMember: (member: Omit<FamilyMemberProfile, 'id'>) => void;
  initialMember?: FamilyMemberProfile | null;
}

export const AddFamilyMemberModal: React.FC<AddFamilyMemberModalProps> = ({
  isOpen,
  onClose,
  onAddMember,
  initialMember,
}) => {
  const { isDark } = useTheme();
  const [name, setName] = useState(initialMember?.name || '');
  const [relationship, setRelationship] = useState<FamilyMemberProfile['relationship']>(
    initialMember?.relationship || 'filho_kids'
  );
  const [birthDate, setBirthDate] = useState(initialMember?.birthDate || '');
  const [notes, setNotes] = useState(initialMember?.notes || '');
  const [autonomyLevel, setAutonomyLevel] = useState<FamilyAutonomyLevel>(
    initialMember?.autonomyLevel || 'parent_controlled'
  );
  const [phone, setPhone] = useState(initialMember?.phone || '');
  const [email, setEmail] = useState(initialMember?.email || '');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    hapticSuccess();
    const isKids = relationship === 'filho_kids';
    let targetSegment: FamilyMemberProfile['targetSegment'] = 'todos';
    let avatarUrl = initialMember?.avatarUrl || 'https://images.unsplash.com/photo-1543332164-6e82f355badc?auto=format&fit=crop&w=150&q=80';

    if (relationship === 'filho_kids') {
      targetSegment = 'kids';
      avatarUrl = 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=150&q=80';
    } else if (relationship === 'esposa') {
      targetSegment = 'feminino';
      avatarUrl = 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80';
    } else if (relationship === 'esposo') {
      targetSegment = 'masculino';
      avatarUrl = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80';
    } else if (relationship === 'filho_teen') {
      targetSegment = 'todos';
      avatarUrl = 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80';
    }

    onAddMember({
      name: name.trim(),
      relationship,
      birthDate: birthDate || undefined,
      notes: notes.trim() || undefined,
      autonomyLevel,
      phone: phone.trim() || undefined,
      email: email.trim() || undefined,
      targetSegment,
      isKids,
      avatarUrl,
    });

    setName('');
    setBirthDate('');
    setNotes('');
    setPhone('');
    setEmail('');
    setRelationship('filho_kids');
    setAutonomyLevel('parent_controlled');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className={`w-full max-w-sm rounded-2xl border shadow-2xl overflow-hidden flex flex-col my-auto ${
        isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        {/* Header */}
        <div className={`p-4 border-b flex items-center justify-between ${
          isDark ? 'border-slate-800 bg-slate-950/40' : 'border-slate-100 bg-slate-50'
        }`}>
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-lg border flex items-center justify-center ${
              isDark ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-700'
            }`}>
              <Baby className="w-4 h-4" />
            </div>
            <div>
              <h3 className={`text-sm font-bold font-['Poppins'] ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {initialMember ? 'Editar Perfil Familiar' : 'Vagou Family • Dependente'}
              </h3>
              <p className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Filhos, dependentes ou cônjuge</p>
            </div>
          </div>
          <button
            onClick={() => {
              hapticLight();
              onClose();
            }}
            className={`p-1 rounded-full transition cursor-pointer ${
              isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3.5 max-h-[80vh] overflow-y-auto no-scrollbar">
          <div>
            <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1 ${
              isDark ? 'text-slate-400' : 'text-slate-600'
            }`}>
              Nome de quem vai ser atendido
            </label>
            <input
              type="text"
              required
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Enzo Silva, Theo, Mariana..."
              className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none focus:border-[#20C933] transition ${
                isDark
                  ? 'bg-slate-950 border-slate-800 text-white placeholder:text-slate-500'
                  : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 shadow-2xs'
              }`}
            />
          </div>

          <div>
            <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1.5 ${
              isDark ? 'text-slate-400' : 'text-slate-600'
            }`}>
              Parentesco / Tipo de Perfil
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { id: 'filho_kids', label: 'Filho(a) Kids', icon: Baby, desc: 'Filtra ofertas infantis' },
                { id: 'filho_teen', label: 'Filho(a) Jovem', icon: Sparkles, desc: 'Cortes modernos & unhas' },
                { id: 'esposa', label: 'Esposa', icon: Heart, desc: 'Salão & Estética' },
                { id: 'esposo', label: 'Esposo', icon: User, desc: 'Barbearia & Homem' },
              ].map((opt) => {
                const isSelected = relationship === opt.id;
                const IconComponent = opt.icon;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      hapticLight();
                      setRelationship(opt.id as any);
                      if (opt.id === 'filho_kids') {
                        setAutonomyLevel('parent_controlled');
                      } else if (opt.id === 'filho_teen') {
                        setAutonomyLevel('teen_assisted');
                      }
                    }}
                    className={`p-2 rounded-xl text-left border transition cursor-pointer flex flex-col gap-0.5 ${
                      isSelected
                        ? isDark
                          ? 'bg-emerald-950/50 border-[#20C933] text-white shadow-xs'
                          : 'bg-emerald-50 border-[#20C933] text-slate-900 shadow-xs'
                        : isDark
                        ? 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <IconComponent className={`w-3.5 h-3.5 ${isSelected ? 'text-[#20C933]' : isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                      <span className="text-xs font-bold">{opt.label}</span>
                    </div>
                    <span className={`text-[9px] ${isSelected ? (isDark ? 'text-emerald-300' : 'text-emerald-700') : 'text-slate-400'}`}>
                      {opt.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1 ${
              isDark ? 'text-slate-400' : 'text-slate-600'
            }`}>
              Data de Nascimento (Opcional)
            </label>
            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none focus:border-[#20C933] transition ${
                isDark
                  ? 'bg-slate-950 border-slate-800 text-white'
                  : 'bg-white border-slate-300 text-slate-900 shadow-2xs'
              }`}
            />
          </div>

          <div>
            <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1 ${
              isDark ? 'text-slate-400' : 'text-slate-600'
            }`}>
              Observações & Preferências de Atendimento
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Corte tesoura nas laterais, não usar máquina..."
              className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none focus:border-[#20C933] transition resize-none ${
                isDark
                  ? 'bg-slate-950 border-slate-800 text-white placeholder:text-slate-500'
                  : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 shadow-2xs'
              }`}
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-[#20C933] hover:bg-[#1bb82d] active:scale-[0.99] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Check className="w-4 h-4 text-white stroke-[2.5]" />
            <span>{initialMember ? 'Salvar Alterações' : 'Salvar Perfil Familiar'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
