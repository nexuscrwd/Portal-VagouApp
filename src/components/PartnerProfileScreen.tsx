import React, { useState } from 'react';
import {
  Building2,
  Users,
  Clock,
  TrendingUp,
  CreditCard,
  QrCode,
  Share2,
  ChevronRight,
  Sparkles,
  ArrowRightLeft,
  DollarSign,
  ShieldCheck,
  Zap,
  ArrowLeft,
  Home,
} from 'lucide-react';
import { PartnerProfessional } from '../types';
import { VagouLogo } from './VagouLogo';

interface PartnerProfileScreenProps {
  professionals: PartnerProfessional[];
  onSwitchToClientMode: () => void;
  onNavigateToScheduleConfig: () => void;
  onOpenPublishModal: () => void;
  onNavigateToHome?: () => void;
  onOpenPartnerRegistration?: () => void;
}

export const PartnerProfileScreen: React.FC<PartnerProfileScreenProps> = ({
  professionals,
  onSwitchToClientMode,
  onNavigateToScheduleConfig,
  onOpenPublishModal,
  onNavigateToHome,
  onOpenPartnerRegistration,
}) => {
  const [copySuccess, setCopySuccess] = useState<boolean>(false);

  const handleShareLink = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Salão & Barbearia Xpress no Vagou',
        text: 'Confira nossas vagas relâmpago e horários disponíveis hoje!',
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 3000);
    }
  };

  return (
    <div className="flex flex-col min-h-full pb-24 bg-slate-50 p-4 space-y-4">
      {/* Top Header with Back to Home */}
      <div className="flex items-center justify-between pb-1 border-b border-slate-200">
        <button
          id="btn-voltar-painel-parceiro"
          onClick={onSwitchToClientMode}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 transition p-1.5 -ml-1.5 rounded hover:bg-slate-200 cursor-pointer active:scale-95"
          aria-label="Voltar para Modo Cliente"
          title="Voltar para o Modo Cliente"
        >
          <ArrowLeft className="w-4 h-4 text-emerald-600" />
          <span>Voltar ao App / Cliente</span>
        </button>
        {onNavigateToHome && (
          <button
            onClick={onNavigateToHome}
            className="p-2 rounded bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 transition cursor-pointer active:scale-95"
            title="Ir para a Tela Inicial (Radar)"
            aria-label="Tela Inicial"
          >
            <Home className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Establishment Header */}
      <div className="bg-white border border-slate-200 rounded p-4 shadow-sm space-y-3">
        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 rounded bg-emerald-600 text-white flex items-center justify-center font-black text-xl shadow-md shadow-emerald-600/20">
            SX
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h2 className="text-base font-black text-slate-900 truncate">
                Salão & Barbearia Xpress
              </h2>
            </div>
            <p className="text-xs text-slate-500 font-medium truncate">
              Rua Itaquera, 340 - São Paulo, SP
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                ⚡ Parceiro Verificado
              </span>
              <span className="text-[10px] font-bold text-slate-500">
                ⭐ 4.9 (128 avaliações)
              </span>
            </div>
          </div>
        </div>

        {/* Switch Mode Button */}
        <button
          onClick={onSwitchToClientMode}
          className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 active:scale-[0.99] text-white rounded text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm"
        >
          <ArrowRightLeft className="w-4 h-4 text-emerald-400" />
          <span>Alternar para Modo Cliente (Agendar Vaga)</span>
        </button>
      </div>

      {/* Performance & Revenue Dashboard */}
      <div className="bg-emerald-950 text-white rounded p-4 shadow-md space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-black text-white uppercase tracking-wider">
              Ociosidade Recuperada no Mês
            </h3>
          </div>
          <span className="text-[10px] bg-emerald-800 text-emerald-300 font-bold px-2 py-0.5 rounded">
            Agosto 2026
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-1">
          <div className="bg-white/10 rounded p-3 backdrop-blur-sm border border-white/5">
            <span className="text-[10px] text-emerald-300 block">Faturamento Salvo</span>
            <span className="text-lg font-black text-emerald-400 mt-0.5 block">
              R$ 2.480,00
            </span>
            <span className="text-[10px] text-emerald-200/80 mt-0.5 block">
              +42 vagas preenchidas
            </span>
          </div>

          <div className="bg-white/10 rounded p-3 backdrop-blur-sm border border-white/5">
            <span className="text-[10px] text-emerald-300 block">Taxa de Ocupação</span>
            <span className="text-lg font-black text-white mt-0.5 block">
              91.4%
            </span>
            <span className="text-[10px] text-emerald-200/80 mt-0.5 block">
              Meta atingida ⭐
            </span>
          </div>
        </div>

        <button
          onClick={onOpenPublishModal}
          className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-white drop-shadow-xs font-black text-xs rounded transition flex items-center justify-center gap-1.5 shadow-sm"
        >
          <Zap className="w-3.5 h-3.5 fill-white text-white" />
          <span>Criar Nova Vaga Relâmpago</span>
        </button>
      </div>

      {/* Quick Settings Section */}
      <div className="space-y-2.5">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          Configurações da Empresa
        </h3>

        <div className="bg-white rounded border border-slate-200 overflow-hidden divide-y divide-slate-100 shadow-sm">
          {/* Horários & Equipe */}
          <div
            onClick={onNavigateToScheduleConfig}
            className="p-3.5 flex items-center justify-between hover:bg-slate-50 transition cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">
                  Horários, Dias e Intervalos
                </h4>
                <p className="text-[11px] text-slate-500">
                  Configurar jornada da equipe ({professionals.length} profissionais)
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </div>

          {/* Compartilhar link */}
          <div
            onClick={handleShareLink}
            className="p-3.5 flex items-center justify-between hover:bg-slate-50 transition cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded bg-blue-50 text-blue-700 flex items-center justify-center">
                <Share2 className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">
                  Link Público do Estabelecimento
                </h4>
                <p className="text-[11px] text-slate-500">
                  {copySuccess ? 'Link copiado para a área de transferência!' : 'Divulgue no Instagram e WhatsApp'}
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </div>

          {/* Formas de pagamento */}
          <div className="p-3.5 flex items-center justify-between hover:bg-slate-50 transition cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded bg-purple-50 text-purple-700 flex items-center justify-center">
                <CreditCard className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">
                  Formas de Recebimento no Local
                </h4>
                <p className="text-[11px] text-slate-500">
                  PIX, Cartão de Crédito/Débito e Dinheiro
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </div>

          {/* Cadastrar Nova Empresa / Unidade */}
          {onOpenPartnerRegistration && (
            <div
              onClick={onOpenPartnerRegistration}
              className="p-3.5 flex items-center justify-between hover:bg-emerald-50/50 transition cursor-pointer border-t border-slate-100"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded bg-emerald-600 text-white flex items-center justify-center">
                  <Building2 className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-xs font-bold text-slate-900">
                      Cadastrar Nova Empresa / Unidade
                    </h4>
                    <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded-full">
                      Novo
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Registre outro salão, barbearia ou filial no Vagou
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-emerald-600" />
            </div>
          )}
        </div>
      </div>

      {/* Team preview */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Equipe Cadastrada ({professionals.length})
          </h3>
          <button
            onClick={onNavigateToScheduleConfig}
            className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700"
          >
            Editar Grade
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {professionals.map((prof) => (
            <div
              key={prof.id}
              className="bg-white border border-slate-200 rounded p-3 shadow-sm flex items-center gap-2.5"
            >
              <div
                className="w-8 h-8 rounded text-white flex items-center justify-center font-bold text-xs shrink-0"
                style={{ backgroundColor: prof.color }}
              >
                {prof.name.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-bold text-slate-900 truncate">{prof.name}</h4>
                <p className="text-[10px] text-slate-500 truncate">{prof.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-4 pb-2 flex flex-col items-center justify-center gap-1.5 text-center">
        <VagouLogo variant="full" size="sm" theme="light" showTagline />
        <span className="text-[10px] text-slate-400 font-medium">
          Vagou Parceiro v1.2.0 • Painel do Estabelecimento
        </span>
      </div>
    </div>
  );
};
