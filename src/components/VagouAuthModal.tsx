import React, { useState } from 'react';
import { X, Sparkles, LogIn, UserPlus, Lock, Mail, Phone, User, CheckCircle2, ArrowRight, KeyRound } from 'lucide-react';
import { VagouLogo } from './VagouLogo';
import { signInWithSupabaseEmail, signUpWithSupabase } from '../services/supabaseApi';
import { PasswordRecoveryModal } from './PasswordRecoveryModal';
import { supabase } from '../services/supabase';
import { hapticLight } from '../utils/haptics';
import { useTheme } from '../context/ThemeContext';

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
  const { isDark } = useTheme();
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
      setErrorMessage('Informe seu e-mail, usuário ou WhatsApp e a senha.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await signInWithSupabaseEmail(loginIdentifier.trim(), loginPassword);
      if (res.error) {
        setErrorMessage(res.error);
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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 overflow-hidden">
        <div
          className={`w-full max-w-sm rounded-2xl border shadow-2xl overflow-hidden flex flex-col my-auto animate-in zoom-in-95 duration-200 ${
            isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
          }`}
          role="dialog"
          aria-modal="true"
        >
          {/* Header Superior Compacto */}
          <div className={`px-4 py-3 flex items-center justify-between border-b ${
            isDark ? 'border-slate-800 bg-slate-950/60' : 'border-slate-100 bg-slate-50'
          }`}>
            <div className="flex items-center gap-2">
              <VagouLogo className="h-5 w-auto" theme={isDark ? 'dark' : 'light'} />
              <span className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-mono">
                Portal
              </span>
            </div>
            <button
              onClick={() => {
                hapticLight();
                onClose();
              }}
              className={`p-1.5 rounded-lg border transition cursor-pointer ${
                isDark ? 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white' : 'bg-white border-slate-200 text-slate-500 hover:text-slate-900 shadow-2xs'
              }`}
              title="Fechar"
              aria-label="Fechar modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Conteúdo com Rolagem Interna Enxuta */}
          <div className="p-4 overflow-y-auto space-y-3 no-scrollbar max-h-[85vh]">
            {/* Chamada Principal */}
            <div>
              <h2 className={`text-sm font-bold leading-tight font-['Poppins'] ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Entre ou crie sua conta Vagou
              </h2>
              <p className={`text-[10px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {targetOfferTitle
                  ? `Para garantir sua vaga imediata em "${targetOfferTitle}".`
                  : 'Garanta sua vaga imediata e gerencie seus agendamentos.'}
              </p>
            </div>

            {/* Destaque Explicativo do Ecossistema */}
            <div className={`p-2.5 rounded-xl border flex items-start gap-2 ${
              isDark ? 'bg-emerald-950/40 border-emerald-500/25' : 'bg-emerald-50 border-emerald-200'
            }`}>
              <Sparkles className="w-3.5 h-3.5 text-[#20C933] shrink-0 mt-0.5" />
              <p className={`text-[10px] leading-relaxed ${isDark ? 'text-emerald-200/90' : 'text-emerald-800'}`}>
                <strong className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Já agendou no app de algum parceiro?</strong> Seu login e senha são os mesmos!
              </p>
            </div>

            {/* Seletor de Abas */}
            <div className={`grid grid-cols-2 p-1 rounded-xl border text-xs font-semibold ${
              isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'
            }`}>
              <button
                type="button"
                onClick={() => {
                  hapticLight();
                  setActiveTab('login');
                  setErrorMessage(null);
                }}
                className={`py-1.5 rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === 'login'
                    ? isDark ? 'bg-slate-800 text-white shadow-xs' : 'bg-white text-slate-900 shadow-xs'
                    : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-800'
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
                className={`py-1.5 rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === 'register'
                    ? isDark ? 'bg-slate-800 text-white shadow-xs' : 'bg-white text-slate-900 shadow-xs'
                    : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Criar Conta</span>
              </button>
            </div>

            {/* Feedback de Erro */}
            {errorMessage && (
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Formulário: Entrar */}
            {activeTab === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-2.5">
                <div>
                  <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1 ${
                    isDark ? 'text-slate-400' : 'text-slate-500'
                  }`}>
                    E-mail, Usuário ou WhatsApp
                  </label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      placeholder="E-mail, username ou WhatsApp"
                      required
                      className={`w-full pl-8 pr-2.5 py-2 rounded-xl border text-xs focus:outline-none focus:border-[#20C933] transition ${
                        isDark ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 shadow-2xs'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1 ${
                    isDark ? 'text-slate-400' : 'text-slate-500'
                  }`}>
                    Senha
                  </label>
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className={`w-full pl-8 pr-2.5 py-2 rounded-xl border text-xs focus:outline-none focus:border-[#20C933] transition font-mono ${
                        isDark ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 shadow-2xs'
                      }`}
                    />
                  </div>

                  {/* Link "Esqueceu a senha?" */}
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

                {/* Botão Principal Verde #20C933 com Texto Estritamente Branco */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 py-3 px-3 rounded-xl bg-[#20C933] hover:bg-[#1bb82d] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-emerald-900/20 transition cursor-pointer active:scale-98 disabled:opacity-60"
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
                  <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1 ${
                    isDark ? 'text-slate-400' : 'text-slate-500'
                  }`}>
                    Nome Completo
                  </label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={registerName}
                      onChange={(e) => setRegisterName(e.target.value)}
                      placeholder="Seu nome"
                      required
                      className={`w-full pl-8 pr-2.5 py-2 rounded-xl border text-xs focus:outline-none focus:border-[#20C933] transition ${
                        isDark ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 shadow-2xs'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1 ${
                    isDark ? 'text-slate-400' : 'text-slate-500'
                  }`}>
                    WhatsApp (com DDD)
                  </label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      value={registerPhone}
                      onChange={(e) => setRegisterPhone(e.target.value)}
                      placeholder="(11) 98765-4321"
                      className={`w-full pl-8 pr-2.5 py-2 rounded-xl border text-xs focus:outline-none focus:border-[#20C933] transition font-mono ${
                        isDark ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 shadow-2xs'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1 ${
                    isDark ? 'text-slate-400' : 'text-slate-500'
                  }`}>
                    E-mail
                  </label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      placeholder="seu@email.com"
                      required
                      className={`w-full pl-8 pr-2.5 py-2 rounded-xl border text-xs focus:outline-none focus:border-[#20C933] transition ${
                        isDark ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 shadow-2xs'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1 ${
                    isDark ? 'text-slate-400' : 'text-slate-500'
                  }`}>
                    Criar Senha (mín. 6 caracteres)
                  </label>
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      placeholder="Crie sua senha segura"
                      minLength={6}
                      required
                      className={`w-full pl-8 pr-2.5 py-2 rounded-xl border text-xs focus:outline-none focus:border-[#20C933] transition font-mono ${
                        isDark ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 shadow-2xs'
                      }`}
                    />
                  </div>
                </div>

                {/* Botão Principal Verde #20C933 com Texto Estritamente Branco */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 py-3 px-3 rounded-xl bg-[#20C933] hover:bg-[#1bb82d] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-emerald-900/20 transition cursor-pointer active:scale-98 disabled:opacity-60"
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
