import React, { useState } from 'react';
import { X, Lock, Building2, Loader2, Check, ArrowRight, KeyRound } from 'lucide-react';
import { verifySalonPinInSupabase } from '../services/supabaseApi';
import { PasswordRecoveryModal } from './PasswordRecoveryModal';
import { hapticLight, hapticSuccess } from '../utils/haptics';

interface PartnerAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (salonData: any) => void;
  defaultSalonName?: string;
}

export const PartnerAuthModal: React.FC<PartnerAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  defaultSalonName = 'Salão & Barbearia Xpress',
}) => {
  const [salonIdentifier, setSalonIdentifier] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isRecoveryModalOpen, setIsRecoveryModalOpen] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!pinCode || pinCode.trim().length === 0) {
      setErrorMessage('Digite a senha administrativa de acesso.');
      return;
    }

    setIsLoading(true);

    // Consulta real e assíncrona na tabela salons do Supabase
    const res = await verifySalonPinInSupabase(pinCode, salonIdentifier);
    setIsLoading(false);

    if (res.success && res.salon) {
      hapticSuccess();
      onSuccess(res.salon);
      setPinCode('');
      onClose();
    } else {
      setErrorMessage(res.error || 'Senha de acesso administrativa incorreta.');
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm animate-fade-in overflow-hidden">
        <div className="w-full max-w-sm rounded-[4px] bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden flex flex-col my-auto">
          {/* Header Compacto (px-3.5 py-2.5) */}
          <div className="px-3.5 py-2.5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-[4px] bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white font-['Poppins']">Painel do Parceiro</h3>
                <p className="text-[9.5px] text-slate-400">Autenticação Administrativa</p>
              </div>
            </div>
            <button
              onClick={() => {
                hapticLight();
                onClose();
              }}
              className="p-1 rounded-[4px] text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Form Body Compacto (space-y-2.5) */}
          <form onSubmit={handleSubmit} className="p-3.5 space-y-2.5">
            <div>
              <label className="block text-[10px] font-semibold text-slate-300 mb-1">
                Identificador do Salão / E-mail (Opcional)
              </label>
              <input
                type="text"
                value={salonIdentifier}
                onChange={(e) => setSalonIdentifier(e.target.value)}
                placeholder="Ex: Salão Xpress, gestor@salao.com..."
                className="w-full px-2.5 py-1.5 rounded-[4px] bg-slate-950 border border-slate-800 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition"
              />
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-slate-300 mb-1">
                Senha Administrativa (PIN do Estabelecimento)
              </label>
              <div className="relative">
                <Lock className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  autoFocus
                  value={pinCode}
                  onChange={(e) => setPinCode(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-8 pr-2.5 py-1.5 rounded-[4px] bg-slate-950 border border-slate-800 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition font-mono tracking-widest"
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

            {errorMessage && (
              <div className="p-2 rounded-[4px] bg-rose-950/50 border border-rose-500/40 text-[10px] text-rose-300">
                {errorMessage}
              </div>
            )}

            {/* Dica do Banco e Senha Mestre */}
            <div className="p-2 rounded-[4px] bg-slate-950 border border-slate-800/80 text-[9.5px] text-slate-400 leading-tight">
              🔒 <strong className="text-slate-300">Banco de Dados:</strong> Validação em tempo real na coluna <code className="text-emerald-400">pin_code</code> da tabela <code className="text-emerald-400">salons</code>.
            </div>

            {/* Botão de Acesso Verde #00a033 com Texto e Ícone 100% Brancos */}
            <button
              type="submit"
              disabled={isLoading || !pinCode.trim()}
              className="w-full py-2.5 rounded-[4px] bg-[#00a033] hover:bg-[#008f2d] disabled:opacity-50 text-white text-xs font-bold tracking-wider uppercase shadow-md shadow-emerald-950/60 transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 text-white animate-spin" />
                  <span className="text-white">Verificando no Banco...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5 text-white stroke-[2.5]" />
                  <span className="text-white">Acessar Painel do Salão</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Modal de Recuperação de Senha */}
      <PasswordRecoveryModal
        isOpen={isRecoveryModalOpen}
        onClose={() => setIsRecoveryModalOpen(false)}
        salonName={salonIdentifier || defaultSalonName}
      />
    </>
  );
};
