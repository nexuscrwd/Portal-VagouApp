import React, { useState } from 'react';
import { X, Sparkles, LogIn, UserPlus, Lock, Mail, Phone, User, CheckCircle2, ArrowRight, KeyRound } from 'lucide-react';
import { VagouLogo } from './VagouLogo';
import { signInWithSupabaseEmail, signUpWithSupabase } from '../services/supabaseApi';
import { PasswordRecoveryModal } from './PasswordRecoveryModal';
import { supabase } from '../services/supabase';
import { hapticLight } from '../utils/haptics';

interface VagouAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: any) => void;
  targetOfferTitle?: string;
}

export const VagouAuthModal: React.FC<VagouAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  targetOfferTitle,
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isRecoveryModalOpen, setIsRecoveryModalOpen] = useState(false);

  // Campos do Formulário
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [registerName, setRegisterName] = useState('');
  const [registerPhone, setRegisterPhone] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!loginIdentifier.trim() || !loginPassword) {
      setErrorMessage('Informe seu e-mail e senha.');
      return;
    }

    setIsLoading(true);
    try {
      const emailToUse = loginIdentifier.includes('@')
        ? loginIdentifier.trim()
        : `${loginIdentifier.replace(/\D/g, '')}@cliente.vagou.app`;

      const res = await signInWithSupabaseEmail(emailToUse, loginPassword);
      if (res.error) {
        setErrorMessage(res.error.includes('Invalid') ? 'E-mail ou senha incorretos.' : res.error);
        setIsLoading(false);
        return;
      }

      if (res.user) {
        onSuccess(res.user);
        onClose();
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao realizar login.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!registerName.trim() || !registerEmail.trim() || !registerPassword) {
      setErrorMessage('Preencha os campos obrigatórios.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await signUpWithSupabase(registerEmail, registerPassword, {
        full_name: registerName.trim(),
        phone: registerPhone.replace(/\D/g, ''),
        role: 'client',
      });

      if (res.error) {
        setErrorMessage(res.error);
        setIsLoading(false);
        return;
      }

      if (res.user?.id) {
        try {
          await supabase.from('clients').insert({
            user_id: res.user.id,
            name: registerName.trim(),
            phone: registerPhone.trim(),
            email: registerEmail.trim(),
          });
        } catch {}

        onSuccess(res.user);
        onClose();
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao criar conta.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 overflow-hidden">
        <div
          className="w-full max-w-sm rounded-[4px] bg-slate-950 border border-slate-800/90 text-slate-100 shadow-2xl overflow-hidden flex flex-col my-auto animate-in zoom-in-95 duration-200"
          role="dialog"
          aria-modal="true"
        >
          {/* Header Superior Compacto (px-3.5 py-2.5) */}
          <div className="px-3.5 py-2.5 flex items-center justify-between border-b border-slate-800/60 bg-slate-900">
            <div className="flex items-center gap-2">
              <VagouLogo className="h-5 w-auto" />
              <span className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-[4px] bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 font-mono">
                Portal
              </span>
            </div>
            <button
              onClick={() => {
                hapticLight();
                onClose();
              }}
              className="p-1 rounded-[4px] bg-slate-900 border border-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
              title="Fechar"
              aria-label="Fechar modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Conteúdo com Rolagem Interna Enxuta (space-y-2.5) */}
          <div className="p-3.5 overflow-y-auto space-y-2.5 no-scrollbar max-h-[85vh]">
            {/* Chamada Principal */}
            <div>
              <h2 className="text-sm font-bold text-white leading-tight font-['Poppins']">
                Entre ou crie sua conta Vagou
              </h2>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {targetOfferTitle
                  ? `Para garantir sua vaga imediata em "${targetOfferTitle}".`
                  : 'Garanta sua vaga imediata e gerencie seus agendamentos.'}
              </p>
            </div>

            {/* Destaque Explicativo do Ecossistema */}
            <div className="p-2.5 rounded-[4px] bg-emerald-950/40 border border-emerald-500/25 flex items-start gap-2">
              <Sparkles className="w-3.5 h-3.5 text-[#00a033] shrink-0 mt-0.5" />
              <p className="text-[10px] text-emerald-200/90 leading-relaxed">
                <strong className="text-white font-bold">Já agendou no app de algum parceiro?</strong> Seu login e senha são os mesmos!
              </p>
            </div>

            {/* Seletor de Abas com rounded-[4px] */}
            <div className="grid grid-cols-2 p-0.5 rounded-[4px] bg-slate-900 border border-slate-800 text-xs font-semibold">
              <button
                type="button"
                onClick={() => {
                  hapticLight();
                  setActiveTab('login');
                  setErrorMessage(null);
                }}
                className={`py-1.5 rounded-[4px] transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === 'login'
                    ? 'bg-slate-800 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Entrar</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  hapticLight();
                  setActiveTab('register');
                  setErrorMessage(null);
                }}
                className={`py-1.5 rounded-[4px] transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === 'register'
                    ? 'bg-slate-800 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Criar Conta</span>
              </button>
            </div>

            {/* Feedback de Erro */}
            {errorMessage && (
              <div className="p-2 rounded-[4px] bg-rose-950/60 border border-rose-500/30 text-rose-200 text-[10px] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Formulário: Entrar */}
            {activeTab === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-2.5">
                <div>
                  <label className="block text-[10px] font-medium text-slate-300 mb-1">
                    E-mail ou WhatsApp
                  </label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      placeholder="seu@email.com ou (11) 99999-9999"
                      required
                      className="w-full pl-8 pr-2.5 py-1.5 rounded-[4px] bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-emerald-500 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-medium text-slate-300 mb-1">
                    Senha
                  </label>
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full pl-8 pr-2.5 py-1.5 rounded-[4px] bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-emerald-500 transition font-mono"
                    />
                  </div>

                  {/* Link "Esqueceu a senha?" posicionado logo abaixo do campo de senha */}
                  <div className="mt-1 flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        hapticLight();
                        setIsRecoveryModalOpen(true);
                      }}
                      className="text-[10px] font-semibold text-[#20C933] hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <KeyRound className="w-2.5 h-2.5 text-[#20C933]" />
                      <span>Esqueceu a senha?</span>
                    </button>
                  </div>
                </div>

                {/* Botão Principal Verde #00a033 com Texto Estritamente Branco */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-1 py-2.5 px-3 rounded-[4px] bg-[#00a033] hover:bg-[#008f2d] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-emerald-950/60 transition cursor-pointer active:scale-98 disabled:opacity-60"
                >
                  {isLoading ? (
                    <span className="text-white">Acessando...</span>
                  ) : (
                    <>
                      <span className="text-white">Entrar e Garantir Vaga</span>
                      <ArrowRight className="w-3.5 h-3.5 text-white" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Formulário: Criar Conta */}
            {activeTab === 'register' && (
              <form onSubmit={handleRegisterSubmit} className="space-y-2.5">
                <div>
                  <label className="block text-[10px] font-medium text-slate-300 mb-1">
                    Nome Completo
                  </label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={registerName}
                      onChange={(e) => setRegisterName(e.target.value)}
                      placeholder="Seu nome"
                      required
                      className="w-full pl-8 pr-2.5 py-1.5 rounded-[4px] bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-emerald-500 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-medium text-slate-300 mb-1">
                    WhatsApp (com DDD)
                  </label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      value={registerPhone}
                      onChange={(e) => setRegisterPhone(e.target.value)}
                      placeholder="(11) 98765-4321"
                      className="w-full pl-8 pr-2.5 py-1.5 rounded-[4px] bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-emerald-500 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-medium text-slate-300 mb-1">
                    E-mail
                  </label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      placeholder="seu@email.com"
                      required
                      className="w-full pl-8 pr-2.5 py-1.5 rounded-[4px] bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-emerald-500 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-medium text-slate-300 mb-1">
                    Criar Senha (mín. 6 caracteres)
                  </label>
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      placeholder="Crie sua senha segura"
                      minLength={6}
                      required
                      className="w-full pl-8 pr-2.5 py-1.5 rounded-[4px] bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-emerald-500 transition"
                    />
                  </div>
                </div>

                {/* Botão Principal Verde #00a033 com Texto Estritamente Branco */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-1 py-2.5 px-3 rounded-[4px] bg-[#00a033] hover:bg-[#008f2d] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-emerald-950/60 transition cursor-pointer active:scale-98 disabled:opacity-60"
                >
                  {isLoading ? (
                    <span className="text-white">Criando conta...</span>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                      <span className="text-white">Cadastrar e Continuar</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Recuperação de Senha */}
      <PasswordRecoveryModal
        isOpen={isRecoveryModalOpen}
        onClose={() => setIsRecoveryModalOpen(false)}
        defaultEmail={loginIdentifier.includes('@') ? loginIdentifier : ''}
      />
    </>
  );
};
