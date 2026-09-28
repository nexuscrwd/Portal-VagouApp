import React, { useState, useEffect } from 'react';
import {
  Building2,
  X,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Lock,
  Globe,
  Phone,
  Scissors,
  Sparkles,
} from 'lucide-react';
import { registerSalonInSupabase } from '../services/supabaseApi';
import { hapticLight, hapticSuccess } from '../utils/haptics';
import { useTheme } from '../context/ThemeContext';

interface RegisterSalonModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSlug?: string;
  currentUser?: any;
  onOpenAuthModal?: () => void;
}

export const RegisterSalonModal: React.FC<RegisterSalonModalProps> = ({
  isOpen,
  onClose,
  initialSlug = '',
  currentUser,
  onOpenAuthModal,
}) => {
  const { isDark } = useTheme();

  const [salonName, setSalonName] = useState('');
  const [slug, setSlug] = useState(initialSlug);
  const [phone, setPhone] = useState('');
  const [segment, setSegment] = useState<'barbearia' | 'salao' | 'ambos'>('barbearia');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (initialSlug) {
      setSlug(initialSlug.toLowerCase().trim().replace(/[^a-z0-9-]/g, ''));
    }
  }, [initialSlug]);

  if (!isOpen) return null;

  const handleSlugChange = (val: string) => {
    const clean = val.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setSlug(clean);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    hapticLight();
    setErrorMessage('');
    setSuccessMessage('');

    // 1. Pré-requisito inegociável: Usuário Pessoal Conectado (auth.users)
    if (!currentUser) {
      setErrorMessage('Para cadastrar um estabelecimento, você deve estar conectado à sua conta pessoal.');
      if (onOpenAuthModal) {
        setTimeout(() => {
          onClose();
          onOpenAuthModal();
        }, 1200);
      }
      return;
    }

    if (!salonName.trim()) {
      setErrorMessage('Por favor, informe o nome do seu estabelecimento.');
      return;
    }

    if (!slug || slug.length < 3) {
      setErrorMessage('O nome do subdomínio deve conter pelo menos 3 caracteres.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await registerSalonInSupabase({
        name: salonName.trim(),
        slug: slug.trim(),
        phoneWhatsapp: phone.trim(),
        segment,
        ownerId: currentUser?.id,
      });

      if (res.success && res.data) {
        hapticSuccess();
        const createdName = res.data.name || res.data.trade_name || salonName;
        setSuccessMessage(`Estabelecimento "${createdName}" cadastrado com sucesso!`);
        setTimeout(() => {
          // Redireciona para o subdomínio oficial do parceiro
          window.location.href = `https://${res.data!.slug}.vagouapp.com`;
        }, 1800);
      } else {
        setErrorMessage(res.error || 'Erro ao registrar estabelecimento.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Falha na conexão ao cadastrar salão.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div
        className={`w-full max-w-md rounded-2xl border shadow-2xl p-6 relative flex flex-col transition-colors duration-200 ${
          isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Botão Fechar */}
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 p-2 rounded-full border transition-colors ${
            isDark ? 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white' : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900'
          }`}
        >
          <X className="w-5 h-5 stroke-[2]" />
        </button>

        {/* Cabeçalho */}
        <div className="flex items-center gap-3 mb-5 pr-8">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <Building2 className="w-6 h-6 stroke-[2]" />
          </div>
          <div>
            <h2 className="text-lg font-black font-['Poppins'] tracking-tight">
              Cadastrar meu Negócio
            </h2>
            <p className="text-xs text-slate-400">
              Crie seu PWA exclusivo e gerencie vagas no VagouApp
            </p>
          </div>
        </div>

        {/* Status de Conta Pessoal (Pré-requisito) */}
        {!currentUser ? (
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2.5 mb-5">
            <Lock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5 stroke-[2]" />
            <div>
              <span className="font-bold block mb-0.5">Conta Pessoal Necessária</span>
              Faça login ou crie sua conta pessoal para vincular o novo estabelecimento à sua propriedade.
              <button
                onClick={() => {
                  onClose();
                  if (onOpenAuthModal) onOpenAuthModal();
                }}
                className="mt-2 text-xs font-bold underline text-amber-400 hover:text-amber-300 block cursor-pointer"
              >
                Conectar / Criar Conta Agora &rarr;
              </button>
            </div>
          </div>
        ) : (
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2 mb-5">
            <CheckCircle2 className="w-4 h-4 stroke-[2]" />
            <span>Conectado como <strong>{currentUser?.email || currentUser?.user_metadata?.full_name || 'Conta Pessoal'}</strong></span>
          </div>
        )}

        {/* Alertas de Erro / Sucesso */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2 mb-4">
            <AlertCircle className="w-4 h-4 shrink-0 stroke-[2]" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2 mb-4">
            <CheckCircle2 className="w-4 h-4 shrink-0 stroke-[2]" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nome do Salão */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Nome do Estabelecimento / Salão
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Barbearia Anderson Studio"
              value={salonName}
              onChange={(e) => setSalonName(e.target.value)}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                isDark ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
              }`}
            />
          </div>

          {/* Subdomínio Personalizado (Slug) */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Endereço / Subdomínio Exclusivo (*.vagouapp.com)
            </label>
            <div className="relative flex items-center">
              <input
                type="text"
                required
                placeholder="andersonstudio"
                value={slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                className={`w-full pl-3.5 pr-28 py-2.5 rounded-xl border text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  isDark ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                }`}
              />
              <span className="absolute right-3 text-xs font-mono text-slate-400 pointer-events-none">
                .vagouapp.com
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
              <Globe className="w-3 h-3 stroke-[2]" />
              <span>URL final: <strong>{slug ? `${slug}.vagouapp.com` : 'seu-nome.vagouapp.com'}</strong></span>
            </p>
          </div>

          {/* Telefone / WhatsApp */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              WhatsApp Comercial
            </label>
            <div className="relative flex items-center">
              <Phone className="w-4 h-4 absolute left-3.5 text-slate-400 stroke-[2]" />
              <input
                type="tel"
                placeholder="(11) 99999-9999"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  isDark ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                }`}
              />
            </div>
          </div>

          {/* Categoria do Negócio */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Tipo de Atendimento
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSegment('barbearia')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  segment === 'barbearia'
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                    : isDark ? 'bg-slate-950 border-slate-800 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-600'
                }`}
              >
                <Scissors className="w-3.5 h-3.5" />
                <span>Barbearia</span>
              </button>

              <button
                type="button"
                onClick={() => setSegment('salao')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  segment === 'salao'
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                    : isDark ? 'bg-slate-950 border-slate-800 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-600'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Salão</span>
              </button>

              <button
                type="button"
                onClick={() => setSegment('ambos')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  segment === 'ambos'
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                    : isDark ? 'bg-slate-950 border-slate-800 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-600'
                }`}
              >
                <span>Ambos</span>
              </button>
            </div>
          </div>

          {/* Botão de Ação (Fundo Verde = Texto Branco) */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 py-3.5 px-5 bg-emerald-500 hover:bg-emerald-600 active:scale-98 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>Cadastrando no Supabase...</span>
            ) : (
              <>
                <span>Confirmar & Criar Estabelecimento</span>
                <ArrowRight className="w-4 h-4 stroke-[2]" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
