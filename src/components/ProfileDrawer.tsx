import React, { useState } from 'react';
import {
  X,
  Calendar,
  SlidersHorizontal,
  HelpCircle,
  ChevronRight,
  UserCheck,
  Heart,
  Sun,
  Moon,
  User,
  Mail,
  Phone,
  MapPin,
  Edit2,
  Check,
  Shield,
  Building2,
  Store,
  LogOut,
  LogIn,
  Users,
  Plus,
  Baby,
  Trash2,
  ShieldCheck,
  Sparkles,
  FileText,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { hapticLight, hapticSuccess } from '../utils/haptics';
import { FamilyMemberProfile } from '../types';

interface UserPrivateProfile {
  fullName: string;
  email: string;
  phone: string;
  address: string;
}

interface ProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToAgenda: () => void;
  onNavigateToFavorites?: () => void;
  favoriteCount?: number;
  onSwitchToPartnerMode: () => void;
  onOpenPartnerRegistration?: () => void;
  onOpenInterestConfig: () => void;
  onOpenHelpModal?: () => void;
  currentSegment?: string;
  onSelectSegment?: (segment: 'barbearia' | 'salao' | 'todos') => void;
  userName?: string;
  userAvatarUrl?: string;
  isLoggedIn?: boolean;
  onLogout?: () => void;
  onOpenAuthModal?: () => void;
  familyProfiles?: FamilyMemberProfile[];
  activeFamilyProfileId?: string;
  onSelectFamilyProfile?: (id: string) => void;
  onOpenAddFamilyModal?: () => void;
  onEditFamilyMember?: (member: FamilyMemberProfile) => void;
  onDeleteFamilyMember?: (id: string) => void;
}

export const ProfileDrawer: React.FC<ProfileDrawerProps> = ({
  isOpen,
  onClose,
  onNavigateToAgenda,
  onNavigateToFavorites,
  favoriteCount,
  onSwitchToPartnerMode,
  onOpenPartnerRegistration,
  onOpenInterestConfig,
  onOpenHelpModal,
  userName = 'Anderson Silva',
  userAvatarUrl = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
  isLoggedIn = true,
  onLogout,
  onOpenAuthModal,
  familyProfiles = [],
  activeFamilyProfileId = 'titular',
  onSelectFamilyProfile,
  onOpenAddFamilyModal,
  onEditFamilyMember,
  onDeleteFamilyMember,
}) => {
  const { isDark, toggleTheme } = useTheme();

  // Perfil privado do usuário (carregado do localStorage)
  const [profile, setProfile] = useState<UserPrivateProfile>(() => {
    try {
      const saved = localStorage.getItem('vagou_private_user_profile');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          fullName: parsed.fullName || userName || 'Anderson Silva',
          email: parsed.email || 'anderson.silva@email.com',
          phone: parsed.phone || '(11) 98765-4321',
          address: parsed.address || 'Rua Oscar Freire, 1200 - São Paulo, SP',
        };
      }
    } catch {
      // fallback padrão
    }
    return {
      fullName: userName || 'Anderson Silva',
      email: 'anderson.silva@email.com',
      phone: '(11) 98765-4321',
      address: 'Rua Oscar Freire, 1200 - São Paulo, SP',
    };
  });

  // Atualiza perfil quando o nome ou status mudar
  React.useEffect(() => {
    if (userName && userName !== 'Visitante') {
      setProfile((prev) => ({
        ...prev,
        fullName: userName,
      }));
    }
  }, [userName]);

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<UserPrivateProfile>(profile);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleStartEdit = () => {
    setFormData(profile);
    setIsEditing(true);
    setSaveSuccess(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setProfile(formData);
    try {
      localStorage.setItem('vagou_private_user_profile', JSON.stringify(formData));
    } catch {
      // ignore
    }
    setIsEditing(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-fadeIn">
      {/* Backdrop click */}
      <div className="flex-1" onClick={onClose} />

      {/* Drawer Container */}
      <div className={`w-full max-w-xs h-full border-l flex flex-col justify-between shadow-2xl p-5 overflow-y-auto transition-colors duration-200 ${
        isDark ? 'bg-[#151A1E] border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
      }`}>
        {/* Top Content */}
        <div>
          {/* User Profile Card com botão fechar integrado */}
          <div className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 ${
            isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
          }`}>
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative shrink-0">
                {isLoggedIn ? (
                  <>
                    <img
                      src={userAvatarUrl}
                      alt={profile.fullName}
                      className="w-12 h-12 rounded-full object-cover border-2 border-[#20C933]"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#20C933] flex items-center justify-center text-white">
                      <UserCheck className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                  </>
                ) : (
                  <div className="w-12 h-12 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center text-slate-400">
                    <User className="w-6 h-6 text-slate-400" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className={`text-sm font-black truncate font-['Poppins'] ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {isLoggedIn ? profile.fullName : 'Visitante'}
                </h3>
                <p className="text-[10px] text-slate-400">
                  {isLoggedIn ? 'Conectado' : 'Não autenticado'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {isLoggedIn && onLogout && (
                <button
                  id="btn-drawer-quick-logout"
                  onClick={() => {
                    hapticLight();
                    onLogout();
                    onClose();
                  }}
                  className="p-1.5 rounded-full border border-rose-500/30 bg-rose-950/20 text-rose-400 hover:bg-rose-950/40 hover:text-rose-200 transition cursor-pointer"
                  title="Sair da Conta"
                  aria-label="Sair da conta"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              )}

              <button
                onClick={() => {
                  hapticLight();
                  onClose();
                }}
                className={`p-1.5 rounded-full border transition cursor-pointer shrink-0 ${
                  isDark
                    ? 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white'
                    : 'bg-slate-100 border-slate-200 text-slate-500 hover:text-slate-900 shadow-xs'
                }`}
                aria-label="Fechar menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Vagou Family: Seletor de Perfis da Família (Estilo Netflix / Uber Family) */}
          {isLoggedIn && (
            <div className="mt-3 p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-[#20C933]" />
                  <span className="text-[11px] font-bold text-slate-200 font-['Poppins']">
                    Vagou Family • Quem vai ser atendido?
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    hapticLight();
                    onOpenAddFamilyModal?.();
                  }}
                  className="text-[10px] font-bold text-[#20C933] hover:underline cursor-pointer flex items-center gap-0.5"
                >
                  <Plus className="w-3 h-3" />
                  <span>Novo</span>
                </button>
              </div>

              {/* Carrossel de Perfis da Família */}
              <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar py-1">
                {/* Perfil Titular */}
                <button
                  type="button"
                  onClick={() => {
                    hapticLight();
                    onSelectFamilyProfile?.('titular');
                  }}
                  className={`flex flex-col items-center gap-1 shrink-0 p-1.5 rounded-xl border transition cursor-pointer ${
                    activeFamilyProfileId === 'titular'
                      ? 'bg-emerald-950/40 border-[#20C933] ring-1 ring-[#20C933]'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="relative w-10 h-10 rounded-full overflow-hidden border border-slate-700">
                    <img
                      src={userAvatarUrl}
                      alt={profile.fullName}
                      className="w-full h-full object-cover"
                    />
                    {activeFamilyProfileId === 'titular' && (
                      <span className="absolute inset-0 bg-emerald-500/20 border-2 border-[#20C933] rounded-full" />
                    )}
                  </div>
                  <span className="text-[10px] font-bold max-w-[58px] truncate text-center text-slate-200">
                    {profile.fullName.split(' ')[0]} (Você)
                  </span>
                  <span className="text-[8px] text-slate-400 -mt-0.5">Titular</span>
                </button>

                {/* Sub-perfis / Dependentes */}
                {familyProfiles.map((member) => {
                  const isActive = activeFamilyProfileId === member.id;
                  return (
                    <button
                      key={member.id}
                      type="button"
                      onClick={() => {
                        hapticLight();
                        onSelectFamilyProfile?.(member.id);
                      }}
                      className={`flex flex-col items-center gap-1 shrink-0 p-1.5 rounded-xl border transition cursor-pointer ${
                        isActive
                          ? 'bg-emerald-950/40 border-[#20C933] ring-1 ring-[#20C933]'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <div className="relative w-10 h-10 rounded-full overflow-hidden border border-slate-700 bg-slate-800 flex items-center justify-center">
                        {member.avatarUrl ? (
                          <img
                            src={member.avatarUrl}
                            alt={member.name}
                            className="w-full h-full object-cover"
                          />
                        ) : member.isKids ? (
                          <Baby className="w-5 h-5 text-emerald-400" />
                        ) : (
                          <User className="w-5 h-5 text-slate-300" />
                        )}
                        {isActive && (
                          <span className="absolute inset-0 bg-emerald-500/20 border-2 border-[#20C933] rounded-full" />
                        )}
                      </div>
                      <span className="text-[10px] font-bold max-w-[58px] truncate text-center text-slate-200">
                        {member.name.split(' ')[0]}
                      </span>
                      <span className="text-[8px] text-emerald-400 font-medium -mt-0.5">
                        {member.isKids ? 'Kids 👶' : member.relationship}
                      </span>
                    </button>
                  );
                })}

                {/* Botão Adicionar Dependente */}
                <button
                  type="button"
                  onClick={() => {
                    hapticLight();
                    onOpenAddFamilyModal?.();
                  }}
                  className="flex flex-col items-center justify-center gap-1 shrink-0 p-1.5 w-[66px] h-[78px] rounded-xl border border-dashed border-slate-700 bg-slate-950/40 hover:bg-slate-900 text-slate-400 hover:text-emerald-400 transition cursor-pointer"
                  title="Cadastrar Filho / Dependente"
                >
                  <div className="w-8 h-8 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-300">
                    <Plus className="w-4 h-4" />
                  </div>
                  <span className="text-[9px] font-bold text-center leading-tight">
                    + Perfil
                  </span>
                </button>
              </div>

              {/* Detalhes e Gestão do Dependente Selecionado */}
              {(() => {
                if (activeFamilyProfileId === 'titular') return null;
                const activeMember = familyProfiles.find((f) => f.id === activeFamilyProfileId);
                if (!activeMember) return null;

                const autonomyBadge =
                  activeMember.autonomyLevel === 'emancipated'
                    ? { label: 'Emancipado (Conta Própria)', color: 'text-cyan-400 bg-cyan-950/40 border-cyan-500/30' }
                    : activeMember.autonomyLevel === 'teen_assisted'
                    ? { label: 'Autonomia Assistida (Jovem)', color: 'text-amber-400 bg-amber-950/40 border-amber-500/30' }
                    : { label: 'Controle Total (Pais)', color: 'text-emerald-400 bg-emerald-950/40 border-emerald-500/30' };

                return (
                  <div className="mt-2.5 pt-2.5 border-t border-slate-800 space-y-2 animate-fade-in">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${autonomyBadge.color}`}>
                          {autonomyBadge.label}
                        </span>
                        {activeMember.birthDate && (
                          <span className="text-[9px] text-slate-400 font-medium">
                            Nasc: {activeMember.birthDate.split('-').reverse().join('/')}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            hapticLight();
                            onEditFamilyMember?.(activeMember);
                          }}
                          className="p-1 rounded text-slate-400 hover:text-emerald-400 hover:bg-slate-800 transition cursor-pointer"
                          title="Editar Dependente"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            hapticLight();
                            onDeleteFamilyMember?.(activeMember.id);
                          }}
                          className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition cursor-pointer"
                          title="Remover Dependente"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {activeMember.notes && (
                      <div className="p-2 rounded-xl bg-slate-950 border border-slate-800/80 text-[10px] text-slate-300 flex items-start gap-1.5">
                        <FileText className="w-3 h-3 text-emerald-400 shrink-0 mt-0.5" />
                        <span className="leading-snug">{activeMember.notes}</span>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          )}

          {/* Se estiver deslogado, botão principal para abrir o VagouAuthModal */}
          {!isLoggedIn && (
            <button
              id="btn-drawer-open-auth"
              onClick={() => {
                onClose();
                onOpenAuthModal?.();
              }}
              className="w-full mt-3 py-3 px-4 rounded-xl bg-[#00a033] hover:bg-[#008f2d] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/60 transition cursor-pointer active:scale-98"
            >
              <LogIn className="w-4 h-4 text-white" />
              <span>Entrar ou Criar Conta</span>
            </button>
          )}

          {/* Perfil Privado do Usuário (Nome Completo, E-mail, Telefone, Endereço) */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className={`text-[10px] font-bold uppercase tracking-wider font-['Poppins'] flex items-center gap-1.5 ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`}>
                <Shield className="w-3 h-3 text-[#20C933]" />
                Perfil do Usuário
              </span>
              {isLoggedIn && (!isEditing ? (
                <button
                  type="button"
                  onClick={handleStartEdit}
                  className="text-[10px] font-bold text-[#20C933] hover:underline cursor-pointer flex items-center gap-1"
                >
                  <Edit2 className="w-2.5 h-2.5" />
                  Editar
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className={`text-[10px] font-medium hover:underline cursor-pointer ${
                    isDark ? 'text-slate-400' : 'text-slate-500'
                  }`}
                >
                  Cancelar
                </button>
              ))}
            </div>

            {!isLoggedIn ? (
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-center space-y-1">
                <p className="text-xs font-bold text-slate-200">Modo Visitante</p>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Faça login para salvar seus dados, histórico de agendamentos e estabelecimentos favoritos.
                </p>
              </div>
            ) : isEditing ? (
              <form onSubmit={handleSave} className={`p-3 rounded-xl border space-y-2 text-xs ${
                isDark ? 'bg-slate-950/90 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
              }`}>
                <div>
                  <label className={`text-[9px] font-bold uppercase tracking-wider block mb-1 ${
                    isDark ? 'text-slate-400' : 'text-slate-500'
                  }`}>
                    Nome Completo
                  </label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className={`w-full pl-8 pr-2.5 py-1.5 rounded-lg border text-xs outline-none transition ${
                        isDark
                          ? 'bg-slate-900 border-slate-700 text-white focus:border-[#20C933]'
                          : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-[#20C933]'
                      }`}
                      placeholder="Nome Completo"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className={`text-[9px] font-bold uppercase tracking-wider block mb-1 ${
                    isDark ? 'text-slate-400' : 'text-slate-500'
                  }`}>
                    E-mail
                  </label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className={`w-full pl-8 pr-2.5 py-1.5 rounded-lg border text-xs outline-none transition ${
                        isDark
                          ? 'bg-slate-900 border-slate-700 text-white focus:border-[#20C933]'
                          : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-[#20C933]'
                      }`}
                      placeholder="email@exemplo.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className={`text-[9px] font-bold uppercase tracking-wider block mb-1 ${
                    isDark ? 'text-slate-400' : 'text-slate-500'
                  }`}>
                    Telefone
                  </label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className={`w-full pl-8 pr-2.5 py-1.5 rounded-lg border text-xs outline-none transition ${
                        isDark
                          ? 'bg-slate-900 border-slate-700 text-white focus:border-[#20C933]'
                          : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-[#20C933]'
                      }`}
                      placeholder="(11) 90000-0000"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className={`text-[9px] font-bold uppercase tracking-wider block mb-1 ${
                    isDark ? 'text-slate-400' : 'text-slate-500'
                  }`}>
                    Endereço
                  </label>
                  <div className="relative">
                    <MapPin className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className={`w-full pl-8 pr-2.5 py-1.5 rounded-lg border text-xs outline-none transition ${
                        isDark
                          ? 'bg-slate-900 border-slate-700 text-white focus:border-[#20C933]'
                          : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-[#20C933]'
                      }`}
                      placeholder="Rua, número, bairro e cidade"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full mt-2 py-1.5 bg-[#20C933] hover:bg-[#1bb82d] text-white font-bold rounded-lg text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  Salvar Dados
                </button>
              </form>
            ) : (
              <div className={`p-3 rounded-xl border space-y-2.5 text-xs transition-all ${
                isDark ? 'bg-slate-950/80 border-slate-800/90' : 'bg-white border-slate-200 shadow-xs'
              }`}>
                {saveSuccess && (
                  <div className="text-[10px] text-[#20C933] font-bold flex items-center gap-1 pb-1 border-b border-emerald-500/20">
                    <Check className="w-3 h-3" />
                    Dados atualizados com sucesso!
                  </div>
                )}
                
                <div className="flex items-start gap-2.5 min-w-0">
                  <User className="w-3.5 h-3.5 text-[#20C933] shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <span className={`text-[9px] uppercase tracking-wider block font-bold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                      Nome Completo
                    </span>
                    <span className={`text-xs font-semibold truncate block ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                      {profile.fullName}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 min-w-0">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <span className={`text-[9px] uppercase tracking-wider block font-bold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                      E-mail
                    </span>
                    <span className={`text-xs truncate block ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      {profile.email}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 min-w-0">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <span className={`text-[9px] uppercase tracking-wider block font-bold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                      Telefone
                    </span>
                    <span className={`text-xs font-mono block ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      {profile.phone}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 min-w-0">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <span className={`text-[9px] uppercase tracking-wider block font-bold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                      Endereço
                    </span>
                    <span className={`text-xs line-clamp-2 block ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      {profile.address}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Links */}
          <div className="mt-5 space-y-2">
            {/* Botão de Alternar Tema (Claro / Escuro) - Simplificado */}
            <button
              id="btn-drawer-toggle-theme"
              onClick={() => {
                hapticLight();
                toggleTheme();
              }}
              className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition group cursor-pointer active:scale-[0.99] ${
                isDark
                  ? 'bg-slate-900/60 hover:bg-slate-800 border-slate-800/80 text-white'
                  : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-900 shadow-xs'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center border transition ${
                  isDark
                    ? 'bg-slate-800 text-amber-400 border-slate-700'
                    : 'bg-amber-50 text-amber-600 border-amber-200'
                }`}>
                  {isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                </div>
                <span className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Modo Escuro
                </span>
              </div>
              <div className={`w-9 h-5 rounded-full transition-colors flex items-center px-0.5 ${
                isDark ? 'bg-[#20C933]' : 'bg-slate-300'
              }`}>
                <div className={`w-4 h-4 rounded-full bg-white shadow-xs transition-transform transform ${
                  isDark ? 'translate-x-4' : 'translate-x-0'
                }`} />
              </div>
            </button>

            <button
              onClick={() => {
                onClose();
                onNavigateToAgenda();
              }}
              className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition group cursor-pointer ${
                isDark
                  ? 'bg-slate-900/60 hover:bg-slate-800 border-slate-800/80 text-white'
                  : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-900 shadow-xs'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-950/60 text-[#20C933] flex items-center justify-center border border-emerald-500/20">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <span className={`text-xs font-bold block ${isDark ? 'text-white' : 'text-slate-900'}`}>Meus Agendamentos</span>
                  <span className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Ver vagas confirmadas</span>
                </div>
              </div>
              <ChevronRight className={`w-4 h-4 transition ${isDark ? 'text-slate-500 group-hover:text-white' : 'text-slate-400 group-hover:text-slate-900'}`} />
            </button>

            {onNavigateToFavorites && (
              <button
                onClick={() => {
                  onClose();
                  onNavigateToFavorites();
                }}
                className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition group cursor-pointer ${
                  isDark
                    ? 'bg-slate-900/60 hover:bg-slate-800 border-slate-800/80 text-white'
                    : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-900 shadow-xs'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-rose-950/60 text-rose-500 flex items-center justify-center border border-rose-500/20">
                    <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-xs font-bold block ${isDark ? 'text-white' : 'text-slate-900'}`}>Favoritos</span>
                      {favoriteCount !== undefined && favoriteCount > 0 && (
                        <span className="text-[10px] bg-rose-500/20 text-rose-400 font-bold font-mono px-1.5 py-0.2 rounded-full border border-rose-500/30">
                          {favoriteCount}
                        </span>
                      )}
                    </div>
                    <span className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Salões e serviços salvos</span>
                  </div>
                </div>
                <ChevronRight className={`w-4 h-4 transition ${isDark ? 'text-slate-500 group-hover:text-white' : 'text-slate-400 group-hover:text-slate-900'}`} />
              </button>
            )}

            <button
              onClick={() => {
                onClose();
                onOpenInterestConfig();
              }}
              className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition group cursor-pointer ${
                isDark
                  ? 'bg-slate-900/60 hover:bg-slate-800 border-slate-800/80 text-white'
                  : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-900 shadow-xs'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
                  isDark ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-slate-100 text-slate-600 border-slate-200'
                }`}>
                  <SlidersHorizontal className="w-4 h-4" />
                </div>
                <div>
                  <span className={`text-xs font-bold block ${isDark ? 'text-white' : 'text-slate-900'}`}>Personalizar Categorias</span>
                  <span className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Ajustar interesses do feed</span>
                </div>
              </div>
              <ChevronRight className={`w-4 h-4 transition ${isDark ? 'text-slate-500 group-hover:text-white' : 'text-slate-400 group-hover:text-slate-900'}`} />
            </button>

            {/* SEJA PARCEIRO / CADASTRO DE EMPRESA */}
            <div className="pt-2 border-t border-slate-800/60 space-y-2">
              <button
                id="btn-drawer-register-partner"
                onClick={() => {
                  onClose();
                  if (onOpenPartnerRegistration) {
                    onOpenPartnerRegistration();
                  } else {
                    onSwitchToPartnerMode();
                  }
                }}
                className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition group cursor-pointer ${
                  isDark
                    ? 'bg-emerald-950/30 hover:bg-emerald-950/60 border-emerald-500/40 text-white'
                    : 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-slate-900 shadow-xs'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
                    <Building2 className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-xs font-bold block ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        Cadastre seu Estabelecimento
                      </span>
                      <span className="text-[9px] bg-emerald-500 text-white font-bold px-1.5 py-0.5 rounded-full">
                        Grátis
                      </span>
                    </div>
                    <span className={`text-[10px] ${isDark ? 'text-emerald-400/80' : 'text-emerald-700'}`}>
                      Seja parceiro e publique vagas relâmpago
                    </span>
                  </div>
                </div>
                <ChevronRight className={`w-4 h-4 transition ${isDark ? 'text-emerald-400 group-hover:text-white' : 'text-emerald-600 group-hover:text-slate-900'}`} />
              </button>

              <button
                id="btn-drawer-switch-partner"
                onClick={() => {
                  onClose();
                  onSwitchToPartnerMode();
                }}
                className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition cursor-pointer ${
                  isDark
                    ? 'bg-slate-900/60 hover:bg-slate-800 border-slate-800/80 text-slate-300'
                    : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Store className="w-4 h-4 text-slate-400" />
                  <span className="text-xs font-medium">Já sou parceiro: Acessar Painel</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
              </button>
            </div>

            {/* Botão Sair da Conta */}
            {isLoggedIn && onLogout && (
              <div className="pt-2">
                <button
                  id="btn-drawer-logout"
                  onClick={() => {
                    hapticLight();
                    onLogout();
                    onClose();
                  }}
                  className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition cursor-pointer ${
                    isDark
                      ? 'bg-rose-950/20 hover:bg-rose-950/40 border-rose-500/30 text-rose-300'
                      : 'bg-rose-50 hover:bg-rose-100 border-rose-200 text-rose-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <LogOut className="w-4 h-4 text-rose-400" />
                    <span className="text-xs font-bold">Sair da Conta ({profile.fullName.split(' ')[0]})</span>
                  </div>
                  <span className="text-[10px] text-rose-400 font-medium">Desconectar</span>
                </button>
              </div>
            )}
          </div>

          {/* Quick Help & Institutional Footer */}
          <div className={`mt-4 pt-3 border-t text-center space-y-2 ${isDark ? 'border-slate-800/80' : 'border-slate-200'}`}>
            {onOpenHelpModal && (
              <button
                onClick={() => {
                  onClose();
                  onOpenHelpModal();
                }}
                className={`w-full py-1.5 px-3 rounded-lg text-xs flex items-center justify-center gap-2 transition cursor-pointer ${
                  isDark ? 'text-slate-300 hover:text-white hover:bg-slate-900' : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
                }`}
              >
                <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                <span>Como funciona o Vagou?</span>
              </button>
            )}

            <p className="text-[10.5px] text-slate-400 font-medium">
              Tecnologia{' '}
              <a
                href="https://vagou.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#20C933] font-bold hover:underline"
              >
                VagouApp
              </a>{' '}
              • 2026
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
