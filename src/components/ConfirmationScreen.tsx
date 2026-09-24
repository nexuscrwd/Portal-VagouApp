import React from 'react';
import { Check, MessageCircle, ArrowRight, ArrowLeft, Home } from 'lucide-react';
import { BookingAppointment } from '../types';
import { useTheme } from '../context/ThemeContext';

interface ConfirmationScreenProps {
  booking: BookingAppointment;
  onNavigateToAgenda: () => void;
  onNavigateToHome: () => void;
}

export const ConfirmationScreen: React.FC<ConfirmationScreenProps> = ({
  booking,
  onNavigateToAgenda,
  onNavigateToHome,
}) => {
  const { isDark } = useTheme();

  return (
    <div className={`flex flex-col min-h-full pb-20 p-5 justify-between transition-colors ${
      isDark ? 'bg-slate-950 text-slate-100' : 'bg-white text-slate-900'
    }`}>
      {/* Top Header Navigation with Back & Home */}
      <div className={`flex items-center justify-between pb-3 border-b ${
        isDark ? 'border-slate-800' : 'border-slate-100'
      }`}>
        <button
          id="btn-voltar-topo-confirmacao"
          onClick={onNavigateToHome}
          className={`flex items-center gap-1.5 text-xs font-bold transition p-1.5 -ml-1.5 rounded cursor-pointer ${
            isDark ? 'text-slate-300 hover:text-white hover:bg-slate-900' : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
          }`}
          title="Voltar à tela inicial"
        >
          <ArrowLeft className="w-4 h-4 text-emerald-500" />
          <span>Voltar ao Início</span>
        </button>

        <button
          onClick={onNavigateToHome}
          className={`p-2 rounded transition cursor-pointer border ${
            isDark ? 'bg-slate-900 hover:bg-slate-850 text-slate-300 border-slate-800' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
          }`}
          title="Página Inicial"
        >
          <Home className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-6 pt-4">
        {/* Check Success Icon */}
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded bg-[#20C933] text-white flex items-center justify-center shadow-lg shadow-emerald-900/40 animate-in zoom-in-75 duration-300 drop-shadow-xs">
            <Check className="w-9 h-9 stroke-[3] text-white" />
          </div>
          <h1 className={`text-xl font-bold mt-4 font-['Poppins'] ${isDark ? 'text-white' : 'text-slate-900'}`}>Agendamento confirmado!</h1>
          <p className="text-xs text-slate-400 max-w-xs mt-1">
            Sua vaga está garantida. Apresente o código abaixo ao chegar no estabelecimento.
          </p>
        </div>

        {/* Summary Card */}
        <div className={`rounded p-4.5 space-y-3.5 shadow-sm border ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200/80'
        }`}>
          <div className={`flex items-center justify-between pb-3 border-b ${
            isDark ? 'border-slate-800' : 'border-slate-200'
          }`}>
            <span className="text-xs font-bold text-slate-400">Código Protocolo</span>
            <span className="text-xs font-mono font-black text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded border border-emerald-500/30">
              {booking.protocolCode}
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400 font-medium">Serviço:</span>
              <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{booking.service}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-400 font-medium">Profissional:</span>
              <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{booking.professional}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-400 font-medium">Estabelecimento:</span>
              <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{booking.salonName}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-400 font-medium">Data / Hora:</span>
              <span className="font-bold text-emerald-400">{booking.dateTime}</span>
            </div>
          </div>

          <div className={`pt-3 border-t flex items-center justify-between ${
            isDark ? 'border-slate-800' : 'border-slate-200'
          }`}>
            <span className={`text-xs font-bold ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>Total pago no local:</span>
            <span className="text-base font-black text-emerald-400 font-mono">
              R$ {booking.totalPrice.toFixed(2).replace('.', ',')}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-6 space-y-3">
        <button
          id="btn-ver-agenda-confirmacao"
          onClick={onNavigateToAgenda}
          className="w-full py-3.5 bg-[#20C933] hover:bg-[#1bb32d] active:scale-[0.99] text-white font-bold text-xs drop-shadow-xs rounded transition shadow-lg shadow-emerald-900/30 uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>VER MINHA AGENDA</span>
          <ArrowRight className="w-4 h-4 stroke-[2.5]" />
        </button>

        <button
          id="btn-voltar-inicio-confirmacao"
          onClick={onNavigateToHome}
          className={`w-full py-3 active:scale-[0.99] font-bold text-xs rounded transition flex items-center justify-center gap-2 cursor-pointer border ${
            isDark ? 'bg-slate-900 hover:bg-slate-850 text-slate-200 border-slate-800' : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200'
          }`}
        >
          <Home className="w-4 h-4 text-slate-400" />
          <span>Voltar à Página Inicial</span>
        </button>

        <div className="flex items-center justify-center gap-2 text-emerald-500 text-xs font-medium pt-1">
          <MessageCircle className="w-4 h-4" />
          <span>Detalhes enviados por WhatsApp</span>
        </div>
      </div>
    </div>
  );
};
