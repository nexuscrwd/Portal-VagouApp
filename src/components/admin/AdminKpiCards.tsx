import React from 'react';
import {
  Building2,
  CalendarCheck,
  CheckCircle2,
  AlertTriangle,
  Zap,
  TrendingUp,
  ArrowUpRight,
} from 'lucide-react';
import { AdminDashboardMetrics } from '../../types/admin';

interface AdminKpiCardsProps {
  metrics: AdminDashboardMetrics;
  onFilterStatus?: (status: any) => void;
}

export const AdminKpiCards: React.FC<AdminKpiCardsProps> = ({ metrics, onFilterStatus }) => {
  const cards = [
    {
      id: 'total',
      title: 'Total de Salões',
      value: metrics.totalSalons,
      subtext: '+16.2% este mês',
      trend: 'positive',
      icon: Building2,
      iconBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      actionStatus: 'all',
    },
    {
      id: 'today_appts',
      title: 'Agendamentos Hoje',
      value: metrics.todayAppointments,
      subtext: '+8.4% vs ontem',
      trend: 'positive',
      icon: CalendarCheck,
      iconBg: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      actionStatus: null,
    },
    {
      id: 'active',
      title: 'Salões Ativos',
      value: metrics.activeSalons,
      subtext: 'Operando normalmente',
      trend: 'neutral',
      icon: CheckCircle2,
      iconBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      actionStatus: 'active',
    },
    {
      id: 'pending',
      title: 'Aguardando Moderação',
      value: metrics.pendingSalons + metrics.incompleteSalons,
      subtext: `${metrics.pendingSalons} pendentes • ${metrics.incompleteSalons} incompletos`,
      trend: metrics.pendingSalons > 0 ? 'warning' : 'neutral',
      icon: AlertTriangle,
      iconBg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      actionStatus: 'pending',
    },
    {
      id: 'radar',
      title: 'Vagas no Radar Agora',
      value: metrics.activeFlashOffers,
      subtext: 'Ofertas com desconto ativas',
      trend: 'positive',
      icon: Zap,
      iconBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      actionStatus: null,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.id}
            onClick={() => card.actionStatus && onFilterStatus?.(card.actionStatus)}
            className={`p-4 rounded-xl bg-slate-900 border border-slate-800 transition shadow-sm hover:border-slate-700 ${
              card.actionStatus ? 'cursor-pointer hover:bg-slate-850 active:scale-[0.99]' : ''
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-slate-400 tracking-tight">{card.title}</span>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${card.iconBg}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black text-white font-mono tracking-tight">
                {card.value}
              </span>

              {card.trend === 'positive' && (
                <div className="flex items-center gap-0.5 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                  <ArrowUpRight className="w-3 h-3 text-emerald-400" />
                  <span>{card.subtext.split(' ')[0]}</span>
                </div>
              )}
            </div>

            <div className="mt-2 text-[11px] text-slate-400 truncate">
              {card.subtext}
            </div>
          </div>
        );
      })}
    </div>
  );
};
