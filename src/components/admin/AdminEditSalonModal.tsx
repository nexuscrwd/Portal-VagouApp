import React, { useState, useEffect } from 'react';
import {
  X,
  Building2,
  Save,
  CheckCircle2,
  AlertTriangle,
  Globe,
  Phone,
  Mail,
  FileText,
  MapPin,
  Palette,
  Image as ImageIcon,
  Loader2,
} from 'lucide-react';
import { AdminSalonItem } from '../../types/admin';

interface AdminEditSalonModalProps {
  isOpen: boolean;
  salon: AdminSalonItem | null;
  onClose: () => void;
  onSave: (salonId: string, updates: Partial<AdminSalonItem>) => Promise<boolean>;
}

export const AdminEditSalonModal: React.FC<AdminEditSalonModalProps> = ({
  isOpen,
  salon,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<Partial<AdminSalonItem>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (salon) {
      setFormData({
        trade_name: salon.trade_name || '',
        legal_name: salon.legal_name || '',
        slug: salon.slug || '',
        category: salon.category || 'salao',
        status: salon.status || 'active',
        is_verified: salon.is_verified ?? true,
        phone_whatsapp: salon.phone_whatsapp || '',
        email: salon.email || '',
        document_number: salon.document_number || '',
        address: salon.address || '',
        neighborhood: salon.neighborhood || '',
        city: salon.city || '',
        state: salon.state || 'SP',
        cep: salon.cep || '',
        logo_url: salon.logo_url || '',
        primary_color: salon.primary_color || '#10B981',
      });
      setStatusMessage(null);
    }
  }, [salon, isOpen]);

  if (!isOpen || !salon) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setStatusMessage(null);

    try {
      const success = await onSave(salon.id, formData);
      if (success) {
        setStatusMessage({ type: 'success', text: 'Estabelecimento atualizado no Supabase com sucesso!' });
        setTimeout(() => {
          onClose();
        }, 900);
      } else {
        setStatusMessage({ type: 'error', text: 'Não foi possível salvar as alterações no banco.' });
      }
    } catch {
      setStatusMessage({ type: 'error', text: 'Erro inesperado na sincronização com o banco.' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-base shadow-md shrink-0"
              style={{ backgroundColor: formData.primary_color || '#10B981' }}
            >
              {formData.logo_url ? (
                <img
                  src={formData.logo_url}
                  alt={formData.trade_name}
                  className="w-full h-full object-cover rounded-lg"
                  onError={(e) => ((e.target as HTMLElement).style.display = 'none')}
                />
              ) : (
                formData.trade_name?.charAt(0) || 'V'
              )}
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-2">
                Editar Estabelecimento
                <span className="text-[10px] font-mono font-normal text-slate-400">ID: {salon.id.slice(0, 8)}</span>
              </h2>
              <p className="text-xs text-slate-400">
                Correção de informações cadastrais críticas sincronizadas com o Supabase.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body (Scrollable) */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {statusMessage && (
            <div
              className={`p-3 rounded-lg text-xs font-medium flex items-center gap-2 ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-950/80 border border-emerald-500/40 text-emerald-300'
                  : 'bg-rose-950/80 border border-rose-500/40 text-rose-300'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* Section 1: Identidade Básica */}
          <div className="space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5" />
              Identidade do Negócio
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Nome Fantasia *</label>
                <input
                  type="text"
                  required
                  value={formData.trade_name || ''}
                  onChange={(e) => setFormData({ ...formData, trade_name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg px-3 py-2 text-xs text-white outline-none transition"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Razão Social / Titular</label>
                <input
                  type="text"
                  value={formData.legal_name || ''}
                  onChange={(e) => setFormData({ ...formData, legal_name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg px-3 py-2 text-xs text-white outline-none transition"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Subdomínio (Slug) *</label>
                <div className="flex items-center bg-slate-950 border border-slate-800 focus-within:border-emerald-500 rounded-lg px-2.5 py-1.5 transition">
                  <Globe className="w-3.5 h-3.5 text-slate-500 mr-1.5 shrink-0" />
                  <input
                    type="text"
                    required
                    value={formData.slug || ''}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                    className="w-full bg-transparent text-xs text-white outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Categoria / Segmento</label>
                <select
                  value={formData.category || 'salao'}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg px-3 py-2 text-xs text-white outline-none transition"
                >
                  <option value="barbearia">Barbearia</option>
                  <option value="salao">Salão de Beleza</option>
                  <option value="estetica">Estética & Spa</option>
                  <option value="outro">Outro</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Status Cadastral</label>
                <select
                  value={formData.status || 'active'}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg px-3 py-2 text-xs text-white outline-none transition font-semibold"
                >
                  <option value="active">Ativo (Aprovado)</option>
                  <option value="pending">Pendente (Moderação)</option>
                  <option value="incomplete">Incompleto</option>
                  <option value="suspended">Suspenso</option>
                </select>
              </div>
            </div>

            {/* Selo Verificado */}
            <div className="pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={Boolean(formData.is_verified)}
                  onChange={(e) => setFormData({ ...formData, is_verified: e.target.checked })}
                  className="w-4 h-4 rounded text-emerald-500 focus:ring-0 bg-slate-950 border-slate-800 accent-emerald-500 cursor-pointer"
                />
                <span className="text-xs font-medium text-slate-200">
                  Conceder Selo Oficial de Verificado (Exibido no perfil e nos cards do feed)
                </span>
              </label>
            </div>
          </div>

          {/* Section 2: Contato & Documento */}
          <div className="space-y-3 pt-3 border-t border-slate-800">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5" />
              Contato & Documentação
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">WhatsApp Oficial</label>
                <div className="flex items-center bg-slate-950 border border-slate-800 focus-within:border-emerald-500 rounded-lg px-2.5 py-1.5 transition">
                  <Phone className="w-3.5 h-3.5 text-slate-500 mr-1.5 shrink-0" />
                  <input
                    type="text"
                    value={formData.phone_whatsapp || ''}
                    onChange={(e) => setFormData({ ...formData, phone_whatsapp: e.target.value })}
                    className="w-full bg-transparent text-xs text-white outline-none font-mono"
                    placeholder="(11) 99999-9999"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">E-mail Administrativo</label>
                <div className="flex items-center bg-slate-950 border border-slate-800 focus-within:border-emerald-500 rounded-lg px-2.5 py-1.5 transition">
                  <Mail className="w-3.5 h-3.5 text-slate-500 mr-1.5 shrink-0" />
                  <input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-transparent text-xs text-white outline-none"
                    placeholder="contato@salao.com"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">CPF ou CNPJ</label>
                <div className="flex items-center bg-slate-950 border border-slate-800 focus-within:border-emerald-500 rounded-lg px-2.5 py-1.5 transition">
                  <FileText className="w-3.5 h-3.5 text-slate-500 mr-1.5 shrink-0" />
                  <input
                    type="text"
                    value={formData.document_number || ''}
                    onChange={(e) => setFormData({ ...formData, document_number: e.target.value })}
                    className="w-full bg-transparent text-xs text-white outline-none font-mono"
                    placeholder="00.000.000/0001-00"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Endereço & Localização */}
          <div className="space-y-3 pt-3 border-t border-slate-800">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              Localização Física
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-slate-300 block mb-1">Logradouro & Número</label>
                <input
                  type="text"
                  value={formData.address || ''}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg px-3 py-2 text-xs text-white outline-none transition"
                  placeholder="Av. Paulista, 1578"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Bairro</label>
                <input
                  type="text"
                  value={formData.neighborhood || ''}
                  onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg px-3 py-2 text-xs text-white outline-none transition"
                  placeholder="Bela Vista"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Cidade</label>
                <input
                  type="text"
                  value={formData.city || ''}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg px-3 py-2 text-xs text-white outline-none transition"
                  placeholder="São Paulo"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Estado (UF)</label>
                <input
                  type="text"
                  maxLength={2}
                  value={formData.state || 'SP'}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value.toUpperCase() })}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg px-3 py-2 text-xs text-white outline-none transition uppercase font-mono"
                  placeholder="SP"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">CEP</label>
                <input
                  type="text"
                  value={formData.cep || ''}
                  onChange={(e) => setFormData({ ...formData, cep: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg px-3 py-2 text-xs text-white outline-none transition font-mono"
                  placeholder="01310-200"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Branding (Logo & Cor) */}
          <div className="space-y-3 pt-3 border-t border-slate-800">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5" />
              Identidade Visual & Branding
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">URL do Logotipo</label>
                <div className="flex items-center bg-slate-950 border border-slate-800 focus-within:border-emerald-500 rounded-lg px-2.5 py-1.5 transition">
                  <ImageIcon className="w-3.5 h-3.5 text-slate-500 mr-1.5 shrink-0" />
                  <input
                    type="url"
                    value={formData.logo_url || ''}
                    onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                    className="w-full bg-transparent text-xs text-white outline-none"
                    placeholder="https://exemplo.com/logo.png"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Cor Primária (HEX)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={formData.primary_color || '#10B981'}
                    onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                    className="w-8 h-8 rounded border border-slate-700 bg-transparent cursor-pointer shrink-0"
                  />
                  <input
                    type="text"
                    value={formData.primary_color || '#10B981'}
                    onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg px-3 py-1.5 text-xs text-white outline-none font-mono"
                  />
                </div>
              </div>
            </div>
          </div>
        </form>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-end gap-3 sticky bottom-0 z-10">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 transition cursor-pointer"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSaving}
            className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-xs font-bold text-white transition flex items-center gap-2 cursor-pointer shadow-md shadow-emerald-950/50"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 text-white animate-spin" />
            ) : (
              <Save className="w-4 h-4 text-white" />
            )}
            <span>Salvar no Supabase</span>
          </button>
        </div>
      </div>
    </div>
  );
};
