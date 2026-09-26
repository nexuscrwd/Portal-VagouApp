import React, { useState, useEffect } from 'react';
import {
  fetchAdminSalons,
  updateAdminSalon,
  fetchAdminDashboardMetrics,
} from '../../services/supabaseApi';
import { AdminSalonItem, AdminDashboardMetrics, AdminScreenId } from '../../types/admin';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';
import { AdminKpiCards } from './AdminKpiCards';
import { AdminSalonsList } from './AdminSalonsList';
import { AdminModerationPanel } from './AdminModerationPanel';
import { AdminEditSalonModal } from './AdminEditSalonModal';
import {
  CalendarCheck,
  Zap,
  Globe,
  CheckCircle2,
  ShieldCheck,
  Server,
  Database,
  ArrowRight,
} from 'lucide-react';

interface AdminMasterAppProps {
  onSwitchToClient: () => void;
  onSwitchToPartner: () => void;
}

export const AdminMasterApp: React.FC<AdminMasterAppProps> = ({
  onSwitchToClient,
  onSwitchToPartner,
}) => {
  const [currentScreen, setCurrentScreen] = useState<AdminScreenId>('dashboard');
  const [salons, setSalons] = useState<AdminSalonItem[]>([]);
  const [metrics, setMetrics] = useState<AdminDashboardMetrics>({
    totalSalons: 0,
    activeSalons: 0,
    pendingSalons: 0,
    incompleteSalons: 0,
    suspendedSalons: 0,
    todayAppointments: 0,
    activeFlashOffers: 0,
    growthPercent: 16.2,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Edit Modal State
  const [selectedSalonToEdit, setSelectedSalonToEdit] = useState<AdminSalonItem | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const loadData = async () => {
    setIsRefreshing(true);
    try {
      const [fetchedSalons, fetchedMetrics] = await Promise.all([
        fetchAdminSalons(),
        fetchAdminDashboardMetrics(),
      ]);
      setSalons(fetchedSalons);
      setMetrics(fetchedMetrics);
    } catch (err) {
      console.warn('[Admin Master] Erro ao carregar dados:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleEditSalon = (salon: AdminSalonItem) => {
    setSelectedSalonToEdit(salon);
    setIsEditModalOpen(true);
  };

  const handleSaveSalonUpdates = async (salonId: string, updates: Partial<AdminSalonItem>) => {
    const res = await updateAdminSalon(salonId, updates);
    if (res.success) {
      // Atualiza estado local imediatamente
      setSalons((prev) =>
        prev.map((s) => (s.id === salonId ? { ...s, ...updates } : s))
      );
      // Recalcula métricas
      fetchAdminDashboardMetrics().then(setMetrics);
      return true;
    }
    return false;
  };

  const handleUpdateStatus = async (salonId: string, status: AdminSalonItem['status']) => {
    const isVerified = status === 'active';
    await handleSaveSalonUpdates(salonId, { status, is_verified: isVerified });
  };

  const pendingCount = metrics.pendingSalons + metrics.incompleteSalons;

  return (
    <div className="flex h-screen w-screen bg-slate-950 text-slate-100 font-sans overflow-hidden">
      {/* 1. Sidebar Desktop */}
      <div className="hidden lg:block h-full">
        <AdminSidebar
          currentScreen={currentScreen}
          onSelectScreen={setCurrentScreen}
          onSwitchToClient={onSwitchToClient}
          onSwitchToPartner={onSwitchToPartner}
          pendingCount={pendingCount}
        />
      </div>

      {/* 2. Mobile Sidebar Overlay Drawer */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden bg-black/70 backdrop-blur-xs">
          <div className="w-64 h-full">
            <AdminSidebar
              currentScreen={currentScreen}
              onSelectScreen={setCurrentScreen}
              onSwitchToClient={onSwitchToClient}
              onSwitchToPartner={onSwitchToPartner}
              onCloseMobile={() => setMobileSidebarOpen(false)}
              pendingCount={pendingCount}
            />
          </div>
          <div className="flex-1" onClick={() => setMobileSidebarOpen(false)} />
        </div>
      )}

      {/* 3. Main Content Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden bg-slate-950">
        {/* Header */}
        <AdminHeader
          currentScreen={currentScreen}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onRefresh={loadData}
          isRefreshing={isRefreshing}
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
          onSwitchToClient={onSwitchToClient}
        />

        {/* Scrollable View Container */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 lg:p-6 space-y-6">
          {/* Top KPI Cards (Always visible on dashboard, optional on others) */}
          {currentScreen === 'dashboard' && (
            <div className="space-y-6">
              {/* KPIs */}
              <AdminKpiCards
                metrics={metrics}
                onFilterStatus={(status) => {
                  setCurrentScreen('salons');
                }}
              />

              {/* Salons Overview with Quick Action to Full List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-sm lg:text-base font-bold text-white tracking-tight">
                      Estabelecimentos Cadastrados
                    </h2>
                    <p className="text-xs text-slate-400">
                      Gestão completa dos salões, barbearias e studios sincronizados no Supabase.
                    </p>
                  </div>

                  <button
                    onClick={() => setCurrentScreen('salons')}
                    className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
                  >
                    <span>Ver todos</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <AdminSalonsList
                  salons={salons}
                  onEditSalon={handleEditSalon}
                  onUpdateStatus={handleUpdateStatus}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                />
              </div>
            </div>
          )}

          {/* SCREEN: SALONS (Full Management Table & Grid) */}
          {currentScreen === 'salons' && (
            <div className="space-y-4">
              <AdminSalonsList
                salons={salons}
                onEditSalon={handleEditSalon}
                onUpdateStatus={handleUpdateStatus}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
              />
            </div>
          )}

          {/* SCREEN: MODERATION */}
          {currentScreen === 'moderation' && (
            <AdminModerationPanel
              salons={salons}
              onEditSalon={handleEditSalon}
              onUpdateStatus={handleUpdateStatus}
            />
          )}

          {/* SCREEN: APPOINTMENTS & RADAR */}
          {currentScreen === 'appointments' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                    <CalendarCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-white tracking-tight">
                      Monitor em Tempo Real de Agendamentos
                    </h2>
                    <p className="text-xs text-slate-400">
                      Acompanhamento ao vivo de vagas relâmpago e horários preenchidos via Radar.
                    </p>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                  {metrics.todayAppointments} agendamentos hoje
                </span>
              </div>

              {/* Tabela rápida de agendamentos */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
                <p className="font-semibold text-white mb-2">Fluxo de Agendamentos do Dia:</p>
                <div className="divide-y divide-slate-800">
                  <div className="py-2.5 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-white block">Corte Degradê + Barba Terapia</span>
                      <span className="text-[11px] text-slate-400">Flavi Hair • Studio & Visagismo (Prof. Carlos Lima)</span>
                    </div>
                    <span className="font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      15:30 (Confirmado)
                    </span>
                  </div>

                  <div className="py-2.5 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-white block">Barba Italiana + Toalha Quente</span>
                      <span className="text-[11px] text-slate-400">Barbearia Dom Corleone (Prof. Marcos Barber)</span>
                    </div>
                    <span className="font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      16:00 (Confirmado)
                    </span>
                  </div>

                  <div className="py-2.5 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-white block">Escova Modelada + Hidratação Ozonizada</span>
                      <span className="text-[11px] text-slate-400">Studio VIP • Cabelo & Make (Prof. Amanda Torres)</span>
                    </div>
                    <span className="font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      17:15 (Confirmado)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SCREEN: SETTINGS & DNS */}
          {currentScreen === 'settings' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white tracking-tight">
                    Configurações de DNS, Subdomínios & Cloudflare
                  </h2>
                  <p className="text-xs text-slate-400">
                    Gerenciamento da zona de roteamento dinâmico multi-tenant (*.vagouapp.com).
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3 text-xs text-slate-300">
                <div className="flex items-center justify-between py-2 border-b border-slate-800">
                  <div>
                    <span className="font-bold text-white block">Zona Wildcard Ativa</span>
                    <span className="text-[11px] text-slate-400">*.vagouapp.com apontado para o CNAME Cloudflare Workers</span>
                  </div>
                  <span className="text-emerald-400 font-bold font-mono bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    Ativo & Proxied
                  </span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-slate-800">
                  <div>
                    <span className="font-bold text-white block">Supabase Row Level Security (RLS)</span>
                    <span className="text-[11px] text-slate-400">Proteção de leitura e gravação em salons, appointments e professionals</span>
                  </div>
                  <span className="text-emerald-400 font-bold font-mono bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    Habilitado
                  </span>
                </div>

                <div className="flex items-center justify-between py-2">
                  <div>
                    <span className="font-bold text-white block">Certificado SSL Automático</span>
                    <span className="text-[11px] text-slate-400">TLS 1.3 com renovação automática para cada novo subdomínio</span>
                  </div>
                  <span className="text-emerald-400 font-bold font-mono bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    SSL Válido
                  </span>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Edit Salon Modal */}
      <AdminEditSalonModal
        isOpen={isEditModalOpen}
        salon={selectedSalonToEdit}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveSalonUpdates}
      />
    </div>
  );
};
