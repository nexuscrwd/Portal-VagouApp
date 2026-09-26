import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  LayoutGrid,
  List,
  Edit,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Shield,
  Phone,
  Building2,
  Check,
  ChevronRight,
  MoreVertical,
  Plus,
} from 'lucide-react';
import { AdminSalonItem, SalonFilterStatus, SalonSegmentFilter } from '../../types/admin';

interface AdminSalonsListProps {
  salons: AdminSalonItem[];
  onEditSalon: (salon: AdminSalonItem) => void;
  onUpdateStatus: (salonId: string, status: AdminSalonItem['status']) => void;
  onOpenNewSalon?: () => void;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
}

export const AdminSalonsList: React.FC<AdminSalonsListProps> = ({
  salons,
  onEditSalon,
  onUpdateStatus,
  onOpenNewSalon,
  searchQuery = '',
  onSearchChange,
}) => {
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [localSearch, setLocalSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<SalonFilterStatus>('all');
  const [segmentFilter, setSegmentFilter] = useState<SalonSegmentFilter>('all');

  const activeSearch = searchQuery || localSearch;

  const filteredSalons = useMemo(() => {
    return salons.filter((salon) => {
      // Search
      if (activeSearch.trim()) {
        const query = activeSearch.toLowerCase();
        const matchName = salon.trade_name?.toLowerCase().includes(query);
        const matchLegal = salon.legal_name?.toLowerCase().includes(query);
        const matchSlug = salon.slug?.toLowerCase().includes(query);
        const matchCity = salon.city?.toLowerCase().includes(query);
        const matchPhone = salon.phone_whatsapp?.includes(query);
        if (!matchName && !matchLegal && !matchSlug && !matchCity && !matchPhone) {
          return false;
        }
      }

      // Status
      if (statusFilter !== 'all') {
        if (salon.status !== statusFilter) return false;
      }

      // Segment
      if (segmentFilter !== 'all') {
        if (salon.category !== segmentFilter) return false;
      }

      return true;
    });
  }, [salons, activeSearch, statusFilter, segmentFilter]);

  const getStatusBadge = (status: AdminSalonItem['status']) => {
    switch (status) {
      case 'active':
        return {
          label: 'Ativo',
          className: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
          dot: 'bg-emerald-400',
        };
      case 'pending':
        return {
          label: 'Pendente',
          className: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
          dot: 'bg-amber-400',
        };
      case 'incomplete':
        return {
          label: 'Incompleto',
          className: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
          dot: 'bg-blue-400',
        };
      case 'suspended':
        return {
          label: 'Suspenso',
          className: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
          dot: 'bg-rose-400',
        };
      default:
        return {
          label: 'Ativo',
          className: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
          dot: 'bg-emerald-400',
        };
    }
  };

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'barbearia':
        return 'Barbearia';
      case 'salao':
        return 'Salão de Beleza';
      case 'estetica':
        return 'Estética & Spa';
      default:
        return 'Geral';
    }
  };

  return (
    <div className="space-y-4">
      {/* Control Bar: Filters, Search & View Mode Switcher */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-xs">
        {/* Search & Status Filters */}
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-0">
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 w-full sm:w-64 focus-within:border-emerald-500 transition">
            <Search className="w-3.5 h-3.5 text-slate-400 mr-2 shrink-0" />
            <input
              type="text"
              placeholder="Buscar estabelecimento..."
              value={activeSearch}
              onChange={(e) => {
                if (onSearchChange) onSearchChange(e.target.value);
                else setLocalSearch(e.target.value);
              }}
              className="w-full bg-transparent text-xs text-white placeholder-slate-500 outline-none"
            />
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 overflow-x-auto max-w-full">
            {[
              { id: 'all', label: 'Todos' },
              { id: 'active', label: 'Ativos' },
              { id: 'pending', label: 'Pendentes' },
              { id: 'incomplete', label: 'Incompletos' },
              { id: 'suspended', label: 'Suspensos' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id as any)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition cursor-pointer whitespace-nowrap ${
                  statusFilter === tab.id
                    ? 'bg-emerald-500 text-white font-bold shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Right Side: View Mode & Total Count */}
        <div className="flex items-center justify-between md:justify-end gap-2.5 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800">
          <span className="text-xs text-slate-400 font-medium">
            Exibindo <strong className="text-white font-mono">{filteredSalons.length}</strong> salões
          </span>

          <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setViewMode('table')}
              title="Visualização em Tabela"
              className={`p-1.5 rounded-md transition cursor-pointer ${
                viewMode === 'table' ? 'bg-slate-800 text-emerald-400 shadow-xs' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('cards')}
              title="Visualização em Cartões"
              className={`p-1.5 rounded-md transition cursor-pointer ${
                viewMode === 'cards' ? 'bg-slate-800 text-emerald-400 shadow-xs' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* VIEW 1: DATA TABLE (Matches top of reference screenshot) */}
      {viewMode === 'table' && (
        <div className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800 select-none">
                <tr>
                  <th className="py-3 px-4 font-semibold">Salão / Marca</th>
                  <th className="py-3 px-3 font-semibold">Subdomínio</th>
                  <th className="py-3 px-3 font-semibold">Categoria</th>
                  <th className="py-3 px-3 font-semibold">Localização</th>
                  <th className="py-3 px-3 font-semibold">Contato</th>
                  <th className="py-3 px-3 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredSalons.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400 text-xs">
                      Nenhum estabelecimento encontrado com os filtros aplicados.
                    </td>
                  </tr>
                ) : (
                  filteredSalons.map((salon) => {
                    const statusBadge = getStatusBadge(salon.status);
                    return (
                      <tr key={salon.id} className="hover:bg-slate-800/40 transition group">
                        {/* Name & Avatar */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-xs shrink-0"
                              style={{ backgroundColor: salon.primary_color || '#10B981' }}
                            >
                              {salon.logo_url ? (
                                <img
                                  src={salon.logo_url}
                                  alt={salon.trade_name}
                                  className="w-full h-full object-cover rounded-lg"
                                  onError={(e) => ((e.target as HTMLElement).style.display = 'none')}
                                />
                              ) : (
                                salon.trade_name?.charAt(0) || 'V'
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-white block truncate">{salon.trade_name}</span>
                                {salon.is_verified && (
                                  <span title="Verificado Oficial">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-slate-400 block truncate">
                                {salon.legal_name || 'Sem razão social'}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Subdomain */}
                        <td className="py-3 px-3">
                          <span className="font-mono text-[11px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-medium">
                            {salon.slug}.vagouapp.com
                          </span>
                        </td>

                        {/* Category */}
                        <td className="py-3 px-3">
                          <span className="text-slate-300 font-medium">{getCategoryLabel(salon.category)}</span>
                        </td>

                        {/* Location */}
                        <td className="py-3 px-3 text-slate-300">
                          <span className="block truncate max-w-[130px] font-medium">{salon.neighborhood || salon.city}</span>
                          <span className="text-[10px] text-slate-400 block">{salon.state || 'SP'}</span>
                        </td>

                        {/* Contact */}
                        <td className="py-3 px-3">
                          <span className="font-mono text-[11px] text-slate-300 block">{salon.phone_whatsapp || '—'}</span>
                          <span className="text-[10px] text-slate-400 block truncate max-w-[120px]">{salon.email || ''}</span>
                        </td>

                        {/* Status Badge */}
                        <td className="py-3 px-3">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusBadge.className}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${statusBadge.dot}`} />
                            {statusBadge.label}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {salon.status === 'pending' && (
                              <button
                                onClick={() => onUpdateStatus(salon.id, 'active')}
                                className="px-2 py-1 rounded bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-[10px] transition cursor-pointer shadow-xs"
                                title="Aprovar Cadastro"
                              >
                                Aprovar
                              </button>
                            )}

                            <button
                              onClick={() => onEditSalon(salon)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer border border-slate-700/60"
                              title="Editar Informações Críticas"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>

                            <a
                              href={`?salon=${salon.slug}`}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-emerald-400 transition cursor-pointer border border-slate-700/60"
                              title="Abrir Página do Salão"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 2: CARDS GRID (Matches bottom of reference screenshot) */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
          {filteredSalons.map((salon) => {
            const statusBadge = getStatusBadge(salon.status);
            return (
              <div
                key={salon.id}
                className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between shadow-xs group"
              >
                <div>
                  {/* Top card header: Avatar, Status & Edit */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="relative">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-base shadow-md shrink-0"
                        style={{ backgroundColor: salon.primary_color || '#10B981' }}
                      >
                        {salon.logo_url ? (
                          <img
                            src={salon.logo_url}
                            alt={salon.trade_name}
                            className="w-full h-full object-cover rounded-xl"
                            onError={(e) => ((e.target as HTMLElement).style.display = 'none')}
                          />
                        ) : (
                          salon.trade_name?.charAt(0) || 'V'
                        )}
                      </div>
                      {salon.is_verified && (
                        <div className="absolute -bottom-1 -right-1 bg-slate-900 rounded-full p-0.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusBadge.className}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${statusBadge.dot}`} />
                        {statusBadge.label}
                      </span>

                      <button
                        onClick={() => onEditSalon(salon)}
                        className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
                        title="Editar"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Salon Title & Category */}
                  <h3 className="font-bold text-sm text-white tracking-tight line-clamp-1 group-hover:text-emerald-400 transition">
                    {salon.trade_name}
                  </h3>
                  <span className="text-[11px] text-slate-400 block font-medium">
                    {getCategoryLabel(salon.category)} • {salon.city || 'São Paulo'}
                  </span>

                  {/* Subdomain pill */}
                  <div className="mt-2.5">
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 block truncate">
                      {salon.slug}.vagouapp.com
                    </span>
                  </div>

                  {/* Details summary */}
                  <div className="mt-3 pt-3 border-t border-slate-800 space-y-1 text-[11px] text-slate-400">
                    <div className="flex items-center justify-between">
                      <span>WhatsApp:</span>
                      <span className="font-mono text-slate-300 font-medium">{salon.phone_whatsapp || '—'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Profissionais:</span>
                      <span className="text-slate-300 font-semibold">{salon.professionals_count || 1} membros</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Quick Action */}
                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                  <button
                    onClick={() => onEditSalon(salon)}
                    className="flex-1 py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Edit className="w-3 h-3 text-emerald-400" />
                    <span>Editar Dados</span>
                  </button>

                  <a
                    href={`?salon=${salon.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-emerald-400 transition cursor-pointer"
                    title="Ver Subdomínio"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
