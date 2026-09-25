import React, { useState } from 'react';
import { X, Check, Baby, Sparkles, User, Heart, Calendar, FileText, Phone, Mail, ShieldCheck } from 'lucide-react';
import { FamilyMemberProfile, FamilyAutonomyLevel } from '../types';
import { hapticLight, hapticSuccess } from '../utils/haptics';

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
      <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden flex flex-col my-auto">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Baby className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-['Poppins']">
                {initialMember ? 'Editar Perfil Familiar' : 'Vagou Family • Dependente'}
              </h3>
              <p className="text-[10px] text-slate-400">Filhos, dependentes ou cônjuge</p>
            </div>
          </div>
          <button
            onClick={() => {
              hapticLight();
              onClose();
            }}
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3.5 max-h-[80vh] overflow-y-auto no-scrollbar">
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">
              Nome de quem vai ser atendido
            </label>
            <input
              type="text"
              required
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Enzo Silva, Theo, Mariana..."
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1.5">
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
                        ? 'bg-emerald-950/40 border-emerald-500 text-white shadow-xs'
                        : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <IconComponent className={`w-3.5 h-3.5 ${isSelected ? 'text-emerald-400' : 'text-slate-400'}`} />
                      {isSelected && <Check className="w-3 h-3 text-emerald-400" />}
                    </div>
                    <span className="text-[11px] font-bold leading-tight">{opt.label}</span>
                    <span className="text-[8.5px] text-slate-400 leading-tight">{opt.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Data de Nascimento & Observações de Corte */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-semibold text-slate-400 mb-1 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-emerald-400" />
                <span>Nascimento</span>
              </label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-emerald-500 transition"
              />
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-slate-400 mb-1 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span>Autonomia</span>
              </label>
              <select
                value={autonomyLevel}
                onChange={(e) => setAutonomyLevel(e.target.value as FamilyAutonomyLevel)}
                className="w-full px-2 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-emerald-500 transition"
              >
                <option value="parent_controlled">Total (Pais controlam)</option>
                <option value="teen_assisted">Assistida (Jovem/Teen)</option>
                <option value="emancipated">Emancipado (Conta própria)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-slate-400 mb-1 flex items-center gap-1">
              <FileText className="w-3 h-3 text-emerald-400" />
              <span>Observações para o Profissional / Salão</span>
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Corte tesoura, sensível a máquina, desenho lateral..."
              className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition"
            />
          </div>

          {/* Se for Jovem / Emancipado: Campos de portabilidade digital */}
          {(autonomyLevel === 'teen_assisted' || autonomyLevel === 'emancipated' || relationship === 'filho_teen') && (
            <div className="p-2.5 rounded-xl bg-slate-950/90 border border-emerald-500/30 space-y-2">
              <div className="flex items-center gap-1 text-emerald-400 text-[10px] font-bold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Protocolo de Emancipação & Contato do Jovem</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <div>
                  <label className="block text-[9px] text-slate-400 mb-0.5 flex items-center gap-1">
                    <Phone className="w-2.5 h-2.5" /> WhatsApp Jovem
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(11) 9...."
                    className="w-full px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 text-white text-[11px] focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[9px] text-slate-400 mb-0.5 flex items-center gap-1">
                    <Mail className="w-2.5 h-2.5" /> E-mail Jovem
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="jovem@email.com"
                    className="w-full px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 text-white text-[11px] focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Dica de Integração com o Salão */}
          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-[10px] text-slate-400 leading-relaxed">
            💡 <strong className="text-slate-300">Meu Negócio:</strong> O salão recebe na comanda o nome do dependente e o contato do responsável.
          </div>

          {/* Rodapé Fixo de Ação */}
          <div className="pt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 rounded-xl border border-slate-800 text-slate-300 hover:bg-slate-800 text-xs font-bold transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="flex-1 py-2 rounded-xl bg-[#00a033] hover:bg-[#008f2d] disabled:opacity-50 text-white text-xs font-bold tracking-wide uppercase shadow-lg shadow-emerald-950/50 transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5 text-white" />
              <span>{initialMember ? 'Salvar Perfil' : 'Criar Perfil'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
