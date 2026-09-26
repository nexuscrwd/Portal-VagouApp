import React from 'react';
import {
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Edit,
  ExternalLink,
  Phone,
  Mail,
  Building2,
  Check,
  XCircle,
} from 'lucide-react';
import { AdminSalonItem } from '../../types/admin';

interface AdminModerationPanelProps {
  salons: AdminSalonItem[];
  onEditSalon: (salon: AdminSalonItem) => void;
  onUpdateStatus: (salonId: string, status: AdminSalonItem['status']) => void;
}

export const AdminModerationPanel: React.FC<AdminModerationPanelProps> = ({
  salons,
  onEditSalon,
  onUpdateStatus,
}) => {
  const pendingSalons = salons.filter((s) => s.status === 'pending');
  const incompleteSalons = salons.filter((s) => s.status === 'incomplete');

  return (
    <div className="space-y-6">
      {/* Intro banner */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border border-amber-500/30 flex items-start gap-3.5 shadow-sm">
        <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-white tracking-tight">
            Fila de Moderação & Auditoria de Estabelecimentos
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            Analise e aprove novos salões cadastrados no ecossistema Vagou. Verifique subdomínios, dados de contato e conceda o selo oficial.
          </p>
        </div>
      </div>

      {/* Section 1: Aguardando Aprovação */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <h3 className="text-sm font-bold text-white tracking-tight">
              Aguardando Aprovação ({pendingSalons.length})
            </h3>
          </div>
          <span className="text-xs text-slate-400">Salões prontos para análise</span>
        </div>

        {pendingSalons.length === 0 ? (
          <div className="p-8 rounded-xl bg-slate-900 border border-slate-800 text-center">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-80" />
            <p className="text-xs font-semibold text-white">Nenhum salão aguardando aprovação no momento.</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Todos os estabelecimentos estão moderados ou ativos.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {pendingSalons.map((salon) => (
              <div
                key={salon.id}
                className="p-4 rounded-xl bg-slate-900 border border-amber-500/30 hover:border-amber-500/50 transition flex flex-col justify-between shadow-xs"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2.5">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-sm"
                        style={{ backgroundColor: salon.primary_color || '#F59E0B' }}
                      >
                        {salon.trade_name?.charAt(0) || 'V'}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-white">{salon.trade_name}</h4>
                        <span className="text-[11px] text-slate-400">{salon.legal_name || 'Sem razão social informada'}</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      Pendente
                    </span>
                  </div>

                  <div className="space-y-1.5 py-2.5 my-2 border-y border-slate-800 text-xs text-slate-300">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Subdomínio:</span>
                      <span className="font-mono text-emerald-400 font-medium">{salon.slug}.vagouapp.com</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">WhatsApp:</span>
                      <span className="font-mono">{salon.phone_whatsapp || 'Não informado'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Local:</span>
                      <span>{salon.neighborhood || salon.city} - {salon.state}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={() => onUpdateStatus(salon.id, 'active')}
                    className="flex-1 py-2 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Aprovar Imediatamente</span>
                  </button>

                  <button
                    onClick={() => onEditSalon(salon)}
                    className="py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition cursor-pointer flex items-center gap-1.5"
                  >
                    <Edit className="w-3.5 h-3.5 text-slate-400" />
                    <span>Revisar</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section 2: Cadastros Incompletos */}
      <div className="space-y-3 pt-4 border-t border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-400" />
            <h3 className="text-sm font-bold text-white tracking-tight">
              Cadastros com Dados Incompletos ({incompleteSalons.length})
            </h3>
          </div>
          <span className="text-xs text-slate-400">Faltam documentos, endereço ou telefone</span>
        </div>

        {incompleteSalons.length === 0 ? (
          <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 text-center">
            <p className="text-xs font-semibold text-slate-300">Nenhum cadastro incompleto encontrado.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {incompleteSalons.map((salon) => (
              <div
                key={salon.id}
                className="p-4 rounded-xl bg-slate-900 border border-blue-500/30 flex items-center justify-between gap-3 shadow-xs"
              >
                <div>
                  <h4 className="font-bold text-xs text-white">{salon.trade_name}</h4>
                  <span className="text-[11px] text-slate-400 block font-mono">
                    {salon.slug}.vagouapp.com
                  </span>
                  <span className="text-[10px] text-amber-400 block mt-1">
                    ⚠️ Pendente de CPF/CNPJ ou Endereço Completo
                  </span>
                </div>

                <button
                  onClick={() => onEditSalon(salon)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition cursor-pointer shrink-0"
                >
                  Completar
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
