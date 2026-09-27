import React, { useState, useEffect } from 'react';
import {
  User,
  MapPin,
  Shield,
  CreditCard,
  Bell,
  ChevronRight,
  LogOut,
  Award,
  Download,
  Smartphone,
  Share2,
  CheckCircle2,
  Heart,
  Trash2,
  ArrowLeft,
  Home,
  Mail,
  Phone,
  Edit2,
  Check,
  X,
} from 'lucide-react';
import { ServiceOffer } from '../types';
import { requestNotificationPermission, sendLocalNotification } from '../utils/notifications';
import { VagouLogo } from './VagouLogo';
import { isValidCustomAvatar } from '../utils/avatarUtils';
import { fetchUserProfileFromDb, updateUserProfileInDb } from '../services/supabaseApi';
import { hapticLight, hapticSuccess } from '../utils/haptics';

interface ProfileScreenProps {
  onBack?: () => void;
  onInstallClick?: () => void;
  isInstallable?: boolean;
  isStandalone?: boolean;
  offers?: ServiceOffer[];
  favorites?: string[];
  onToggleFavorite?: (id: string) => void;
  onSelectOffer?: (offer: ServiceOffer) => void;
  currentUser?: any;
  isLoggedIn?: boolean;
  onLogout?: () => void;
  onOpenAuthModal?: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  onBack,
  onInstallClick,
  isInstallable = true,
  isStandalone = false,
  offers = [],
  favorites = [],
  onToggleFavorite,
  onSelectOffer,
  currentUser,
  isLoggedIn = false,
  onLogout,
  onOpenAuthModal,
}) => {
  const [notificationStatus, setNotificationStatus] = useState<string>(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );
  const [notifSuccessMessage, setNotifSuccessMessage] = useState<string>('');

  // Perfil privado do usuário
  const [userProfile, setUserProfile] = useState(() => {
    const sessionEmail = sessionStorage.getItem('vagou_user_email') || localStorage.getItem('vagou_user_email');
    const sessionPhone = sessionStorage.getItem('vagou_user_phone') || localStorage.getItem('vagou_user_phone');
    const sessionName = sessionStorage.getItem('vagou_user_name') || localStorage.getItem('vagou_user_name');
    try {
      const saved = localStorage.getItem('vagou_private_user_profile');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          fullName: parsed.fullName || sessionName || currentUser?.user_metadata?.full_name || 'Cliente Vagou',
          email: parsed.email || sessionEmail || currentUser?.email || '',
          phone: parsed.phone || sessionPhone || currentUser?.user_metadata?.phone || '',
          address: parsed.address || 'São Paulo, SP',
        };
      }
    } catch {}
    return {
      fullName: sessionName || currentUser?.user_metadata?.full_name || 'Cliente Vagou',
      email: sessionEmail || currentUser?.email || '',
      phone: sessionPhone || currentUser?.user_metadata?.phone || '',
      address: 'São Paulo, SP',
    };
  });

  const [isMyDataModalOpen, setIsMyDataModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState(userProfile);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);

  // Sincroniza com o Supabase quando abrir a tela ou o modal de Meus Dados
  useEffect(() => {
    const sessionEmail = sessionStorage.getItem('vagou_user_email') || localStorage.getItem('vagou_user_email');
    const sessionPhone = sessionStorage.getItem('vagou_user_phone') || localStorage.getItem('vagou_user_phone');

    if (!sessionEmail || !sessionPhone || !userProfile.email || !userProfile.phone) {
      setIsLoadingProfile(true);
      fetchUserProfileFromDb({
        name: userProfile.fullName,
        email: sessionEmail || userProfile.email,
        phone: sessionPhone || userProfile.phone,
        userId: currentUser?.id,
      }).then((dbData) => {
        setIsLoadingProfile(false);
        if (dbData) {
          const updated = {
            fullName: dbData.fullName || userProfile.fullName,
            email: dbData.email || userProfile.email,
            phone: dbData.phone || userProfile.phone,
            address: dbData.address || userProfile.address,
          };
          setUserProfile(updated);
          setEditFormData(updated);
        }
      });
    }
  }, [currentUser?.id]);

  const handleOpenMyData = () => {
    hapticLight();
    const sessionEmail = sessionStorage.getItem('vagou_user_email') || localStorage.getItem('vagou_user_email');
    const sessionPhone = sessionStorage.getItem('vagou_user_phone') || localStorage.getItem('vagou_user_phone');

    if (!sessionEmail || !sessionPhone || !userProfile.email || !userProfile.phone) {
      setIsLoadingProfile(true);
      fetchUserProfileFromDb({
        name: userProfile.fullName,
        email: sessionEmail || userProfile.email,
        phone: sessionPhone || userProfile.phone,
        userId: currentUser?.id,
      }).then((dbData) => {
        setIsLoadingProfile(false);
        if (dbData) {
          const updated = {
            fullName: dbData.fullName || userProfile.fullName,
            email: dbData.email || userProfile.email,
            phone: dbData.phone || userProfile.phone,
            address: dbData.address || userProfile.address,
          };
          setUserProfile(updated);
          setEditFormData(updated);
        }
      });
    } else {
      setEditFormData(userProfile);
    }
    setIsMyDataModalOpen(true);
  };

  const handleSaveMyData = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserProfile(editFormData);
    await updateUserProfileInDb(editFormData);
    setSaveSuccess(true);
    hapticSuccess();
    setTimeout(() => {
      setSaveSuccess(false);
      setIsMyDataModalOpen(false);
    }, 1500);
  };

  const favoriteOffers = offers.filter((o) => favorites.includes(o.id));

  const userName = userProfile.fullName || currentUser?.user_metadata?.full_name || 'Cliente Vagou';
  const userDisplayEmail = userProfile.email || currentUser?.email || '';
  const userDisplayPhone = userProfile.phone || currentUser?.user_metadata?.phone || '';

  const handleEnableNotifications = async () => {
    const perm = await requestNotificationPermission();
    setNotificationStatus(perm);

    if (perm === 'granted') {
      sendLocalNotification('🔔 Notificações Ativadas!', {
        body: 'O Vagou agora enviará alertas e lembretes 30 min antes do seu horário.',
      });
      setNotifSuccessMessage('Notificações ativadas com sucesso! Enviamos um teste.');
      setTimeout(() => setNotifSuccessMessage(''), 4000);
    } else {
      setNotifSuccessMessage('Permissão não concedida no navegador.');
      setTimeout(() => setNotifSuccessMessage(''), 4000);
    }
  };

  return (
    <div className="flex flex-col min-h-full pb-24 bg-white p-5 space-y-5">
      {/* Top Header with Back & Home */}
      {onBack && (
        <div className="flex items-center justify-between pb-1 border-b border-slate-100">
          <button
            id="btn-voltar-perfil"
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition p-1.5 -ml-1.5 rounded-lg hover:bg-slate-100 cursor-pointer active:scale-95"
            aria-label="Voltar para a tela anterior"
            title="Voltar"
          >
            <ArrowLeft className="w-4 h-4 text-emerald-600" />
            <span>Voltar ao Início</span>
          </button>
          <button
            onClick={onBack}
            className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer active:scale-95"
            title="Página Inicial (Radar)"
            aria-label="Tela Inicial"
          >
            <Home className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* User Header Dynamic State com ícone User padronizado */}
      {isLoggedIn ? (
        <div className="flex items-center justify-between pt-1 p-3.5 rounded-lg bg-slate-50 border border-slate-200/80">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center shrink-0">
              <User className="w-6 h-6 stroke-[1.8]" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-black text-slate-900 truncate">{userName}</h2>
              <p className="text-xs text-slate-500 font-medium truncate">
                {userDisplayEmail || userDisplayPhone || 'Conta Conectada'}
              </p>
              {userDisplayPhone && userDisplayEmail && (
                <p className="text-[11px] text-slate-400 font-mono truncate">{userDisplayPhone}</p>
              )}
              <div className="flex items-center gap-1 mt-1">
                <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded border border-emerald-200">
                  Sincronizado Supabase
                </span>
              </div>
            </div>
          </div>
          {onLogout && (
            <button
              onClick={onLogout}
              className="p-2 text-rose-600 hover:bg-rose-50 rounded transition text-xs font-bold flex items-center gap-1 cursor-pointer shrink-0"
              title="Sair da Conta"
            >
              <LogOut className="w-4 h-4 text-rose-600" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          )}
        </div>
      ) : (
        <div className="p-4 rounded-lg bg-slate-900 text-white border border-slate-800 space-y-3 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 flex items-center justify-center shrink-0">
              <User className="w-5 h-5 stroke-[1.8]" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Visitante no VagouApp</h2>
              <p className="text-xs text-slate-400">Entre para agendar serviços e guardar seus horários</p>
            </div>
          </div>
          {onOpenAuthModal && (
            <button
              onClick={onOpenAuthModal}
              className="w-full py-2.5 bg-[#20C933] hover:bg-[#1bb82d] active:scale-[0.99] text-white font-bold text-xs rounded transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <User className="w-4 h-4 text-white stroke-[1.8]" />
              <span>Entrar ou Cadastrar-se</span>
            </button>
          )}
        </div>
      )}

      {/* Modal / Gaveta de Meus Dados Cadastrais */}
      {isMyDataModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-sm rounded-xl bg-white border border-slate-200 text-slate-900 shadow-2xl p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700">
                  <User className="w-4 h-4 stroke-[1.8]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 font-['Poppins']">Meus Dados</h3>
                  <p className="text-[10px] text-slate-400">Sincronização em tempo real com o Supabase</p>
                </div>
              </div>
              <button
                onClick={() => setIsMyDataModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {saveSuccess && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-600" />
                Dados cadastrais atualizados no Supabase!
              </div>
            )}

            <form onSubmit={handleSaveMyData} className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Nome Completo
                </label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 stroke-[1.8]" />
                  <input
                    type="text"
                    value={editFormData.fullName}
                    onChange={(e) => setEditFormData({ ...editFormData, fullName: e.target.value })}
                    className="w-full pl-8 pr-2.5 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 focus:border-emerald-500 outline-none"
                    placeholder="Nome Completo"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  E-mail
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 stroke-[1.8]" />
                  <input
                    type="email"
                    value={editFormData.email}
                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                    className="w-full pl-8 pr-2.5 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 focus:border-emerald-500 outline-none"
                    placeholder="email@exemplo.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Telefone / WhatsApp
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 stroke-[1.8]" />
                  <input
                    type="tel"
                    value={editFormData.phone}
                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                    className="w-full pl-8 pr-2.5 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 focus:border-emerald-500 outline-none font-mono"
                    placeholder="(11) 90000-0000"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Endereço Padrão
                </label>
                <div className="relative">
                  <MapPin className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 stroke-[1.8]" />
                  <input
                    type="text"
                    value={editFormData.address}
                    onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                    className="w-full pl-8 pr-2.5 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 focus:border-emerald-500 outline-none"
                    placeholder="Cidade, Bairro, SP"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsMyDataModalOpen(false)}
                  className="flex-1 py-2 rounded-lg border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition cursor-pointer"
                >
                  Fechar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-[#20C933] hover:bg-[#1bb82d] text-white font-bold rounded-lg text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PWA Notification Control Box */}
      <div className="bg-slate-900 text-white rounded-lg p-4 shadow-md space-y-2.5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-black text-white">Lembretes 30 min antes</h4>
              <p className="text-[11px] text-slate-400">Notificações PWA no celular</p>
            </div>
          </div>

          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded ${
              notificationStatus === 'granted'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
            }`}
          >
            {notificationStatus === 'granted' ? 'ATIVADO' : 'DESATIVADO'}
          </span>
        </div>

        {notifSuccessMessage && (
          <div className="p-2 bg-emerald-950/80 border border-emerald-500/40 rounded text-[11px] text-emerald-300">
            {notifSuccessMessage}
          </div>
        )}

        <button
          onClick={handleEnableNotifications}
          className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-md transition shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Bell className="w-3.5 h-3.5" />
          <span>{notificationStatus === 'granted' ? 'Testar Notificação Agora' : 'Ativar Notificações de Vagas'}</span>
        </button>
      </div>

      {/* Meus Favoritos Section */}
      <div className="space-y-3 pt-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Meus Favoritos ({favoriteOffers.length})
            </h3>
          </div>
        </div>

        {favoriteOffers.length === 0 ? (
          <div className="p-4 bg-slate-50 border border-slate-100 rounded-lg text-center space-y-1">
            <Heart className="w-6 h-6 text-slate-300 mx-auto" />
            <p className="text-xs font-semibold text-slate-700">Nenhum salão favoritado ainda</p>
            <p className="text-[11px] text-slate-400">
              Toque no coração dos estabelecimentos para salvá-los aqui.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {favoriteOffers.map((off) => (
              <div
                key={off.id}
                onClick={() => onSelectOffer && onSelectOffer(off)}
                className="p-3 bg-white border border-slate-200 rounded-lg flex items-center justify-between shadow-sm hover:border-slate-300 transition cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={off.imageUrl}
                    alt={off.salonName}
                    className="w-12 h-12 rounded-md object-cover shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-slate-900 truncate">{off.salonName}</h4>
                    <p className="text-[11px] text-slate-500 truncate">{off.serviceTitle} • {off.professionalName}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">
                        R$ {off.price}
                      </span>
                      <span className="text-[10px] text-slate-400">{off.distance}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite && onToggleFavorite(off.id);
                  }}
                  className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition shrink-0 cursor-pointer"
                  title="Remover dos favoritos"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* PWA Install Banner */}
      {!isStandalone && (
        <div className="bg-gradient-to-r from-emerald-600 to-green-500 text-white rounded-lg p-4 shadow-md space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-md bg-white/20 backdrop-blur flex items-center justify-center shrink-0">
              <Smartphone className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-black text-white">Instalar o Vagou no Celular</h4>
              <p className="text-xs text-emerald-100 mt-0.5 leading-relaxed">
                Acesse horários imediatos mais rápido direto da sua tela inicial, sem barra do navegador.
              </p>
            </div>
          </div>
          <button
            onClick={onInstallClick}
            className="w-full py-2.5 bg-white text-emerald-800 font-bold text-xs rounded-lg shadow hover:bg-emerald-50 active:scale-[0.98] transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Instalar Aplicativo Agora</span>
          </button>
        </div>
      )}

      {isStandalone && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3.5 flex items-center gap-3 text-emerald-800">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div className="text-xs font-semibold">
            Você está usando o app Vagou instalado no celular!
          </div>
        </div>
      )}

      {/* Settings List */}
      <div className="space-y-3 pt-1">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Configurações da Conta</h3>
        
        <div className="bg-slate-50 rounded-lg border border-slate-100 overflow-hidden divide-y divide-slate-100">
          {/* Meus Dados Cadastrais */}
          <div
            onClick={handleOpenMyData}
            className="p-3.5 flex items-center justify-between hover:bg-slate-100/80 transition cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center">
                <User className="w-4 h-4 stroke-[1.8]" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-800 block">Meus Dados Pessoais</span>
                <span className="text-[10px] text-slate-400 block">Nome, e-mail, telefone e endereço</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {isLoadingProfile && <span className="text-[10px] text-slate-400">Sincronizando...</span>}
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 transition" />
            </div>
          </div>

          <div className="p-3.5 flex items-center justify-between hover:bg-slate-100/60 transition cursor-pointer">
            <div className="flex items-center gap-3">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-bold text-slate-800">Endereço Salvo ({userProfile.address || 'São Paulo, SP'})</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </div>

          <div className="p-3.5 flex items-center justify-between hover:bg-slate-100/60 transition cursor-pointer">
            <div className="flex items-center gap-3">
              <CreditCard className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-bold text-slate-800">Formas de Pagamento no Local</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </div>

          <div className="p-3.5 flex items-center justify-between hover:bg-slate-100/60 transition cursor-pointer">
            <div className="flex items-center gap-3">
              <Shield className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-bold text-slate-800">Privacidade & Termos de Uso</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </div>
        </div>
      </div>

      {/* Refer & Earn */}
      <div className="pt-1">
        <div className="bg-[#151A1E] text-white rounded-lg p-4 flex items-center gap-3 shadow-sm">
          <Award className="w-8 h-8 text-amber-400 shrink-0" />
          <div className="flex-1">
            <h4 className="text-xs font-black text-white">Indique e Ganhe R$ 10</h4>
            <p className="text-[11px] text-slate-300 mt-0.5">
              Compartilhe o Vagou com amigos e ganhe desconto na próxima vaga.
            </p>
          </div>
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: 'Vagou - Vagas Imediatas',
                  text: 'Agende vagas e horários imediatos em salões e barbearias!',
                  url: window.location.origin,
                }).catch(() => {});
              }
            }}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="pt-4 pb-2 flex flex-col items-center justify-center gap-1.5 text-center">
        <VagouLogo variant="full" size="sm" theme="light" showTagline />
        <p className="text-[11px] text-slate-500 font-medium">
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
  );
};

