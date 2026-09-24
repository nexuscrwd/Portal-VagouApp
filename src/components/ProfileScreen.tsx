import React, { useState } from 'react';
import {
  User,
  Phone,
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
  Clock,
  Star,
  ArrowLeft,
  Home,
} from 'lucide-react';
import { ServiceOffer } from '../types';
import { requestNotificationPermission, sendLocalNotification } from '../utils/notifications';
import { VagouLogo } from './VagouLogo';

interface ProfileScreenProps {
  onBack?: () => void;
  onInstallClick?: () => void;
  isInstallable?: boolean;
  isStandalone?: boolean;
  offers?: ServiceOffer[];
  favorites?: string[];
  onToggleFavorite?: (id: string) => void;
  onSelectOffer?: (offer: ServiceOffer) => void;
  onSwitchToPartnerMode?: () => void;
  onOpenPartnerRegistration?: () => void;
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
  onSwitchToPartnerMode,
  onOpenPartnerRegistration,
}) => {
  const [notificationStatus, setNotificationStatus] = useState<string>(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );
  const [notifSuccessMessage, setNotifSuccessMessage] = useState<string>('');

  const favoriteOffers = offers.filter((o) => favorites.includes(o.id));

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

      {/* User Header */}
      <div className="flex items-center gap-3.5 pt-1">
        <div className="w-14 h-14 rounded-full bg-emerald-100 border-2 border-emerald-500 text-emerald-800 flex items-center justify-center font-black text-xl shadow-sm">
          A
        </div>
        <div>
          <h2 className="text-base font-black text-slate-900">Anderson Silva</h2>
          <p className="text-xs text-slate-500 font-medium">+55 (11) 98765-4321</p>
          <div className="flex items-center gap-1 mt-1">
            <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-md border border-emerald-200">
              Cliente VIP
            </span>
          </div>
        </div>
      </div>

      {/* Switch to Partner / Business Mode Banner */}
      {onSwitchToPartnerMode && (
        <div className="bg-slate-900 text-white rounded-xl p-4 shadow-md border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black text-sm">
                🏢
              </div>
              <div>
                <h4 className="text-xs font-black text-white">É dono de salão ou barbearia?</h4>
                <p className="text-[11px] text-slate-400">Cadastre seu negócio e publique vagas no Radar</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {onOpenPartnerRegistration && (
              <button
                id="btn-perfil-cadastrar-empresa"
                onClick={onOpenPartnerRegistration}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] text-white font-bold text-xs rounded-lg transition flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              >
                <span>Cadastrar Empresa Grátis</span>
                <ChevronRight className="w-4 h-4 text-white" />
              </button>
            )}
            <button
              onClick={onSwitchToPartnerMode}
              className={`w-full py-2.5 bg-slate-800 hover:bg-slate-700 active:scale-[0.99] text-slate-200 font-bold text-xs rounded-lg transition flex items-center justify-center gap-2 border border-slate-700 cursor-pointer ${
                !onOpenPartnerRegistration ? 'col-span-full' : ''
              }`}
            >
              <span>Acessar Painel de Gestão</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>
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
          className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-md transition shadow-sm flex items-center justify-center gap-1.5"
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
                  className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition shrink-0"
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
            className="w-full py-2.5 bg-white text-emerald-800 font-bold text-xs rounded-lg shadow hover:bg-emerald-50 active:scale-[0.98] transition flex items-center justify-center gap-2"
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
          <div className="p-3.5 flex items-center justify-between hover:bg-slate-100/60 transition cursor-pointer">
            <div className="flex items-center gap-3">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-bold text-slate-800">Endereços Salvos (Itaquera, SP)</span>
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
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="pt-4 pb-2 flex flex-col items-center justify-center gap-1.5 text-center">
        <VagouLogo variant="full" size="sm" theme="light" showTagline />
        <span className="text-[10px] text-slate-400 font-medium">Versão 1.2.0 • PWA Mobile</span>
      </div>
    </div>
  );
};
