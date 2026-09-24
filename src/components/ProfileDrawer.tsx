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
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { hapticLight } from '../utils/haptics';

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
                <img
                  src={userAvatarUrl}
                  alt={profile.fullName}
                  className="w-12 h-12 rounded-full object-cover border-2 border-[#20C933]"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#20C933] flex items-center justify-center text-white">
                  <UserCheck className="w-2.5 h-2.5 stroke-[3]" />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <h3 className={`text-sm font-black truncate font-['Poppins'] ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {profile.fullName}
                </h3>
              </div>
            </div>

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

          {/* Perfil Privado do Usuário (Nome Completo, E-mail, Telefone, Endereço) */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className={`text-[10px] font-bold uppercase tracking-wider font-['Poppins'] flex items-center gap-1.5 ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`}>
                <Shield className="w-3 h-3 text-[#20C933]" />
                Perfil do Usuário
              </span>
              {!isEditing ? (
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
              )}
            </div>

            {isEditing ? (
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
          </div>

          {/* Quick Help & Info */}
          {onOpenHelpModal && (
            <div className={`mt-4 pt-4 border-t ${isDark ? 'border-slate-800/80' : 'border-slate-200'}`}>
              <button
                onClick={() => {
                  onClose();
                  onOpenHelpModal();
                }}
                className={`w-full py-2 px-3 rounded-lg text-xs flex items-center gap-2 transition cursor-pointer ${
                  isDark ? 'text-slate-300 hover:text-white hover:bg-slate-900' : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
                }`}
              >
                <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                <span>Como funciona o Vagou?</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
