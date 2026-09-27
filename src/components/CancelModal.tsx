import React from 'react';
import { AlertTriangle, X, Clock, MapPin } from 'lucide-react';
import { BookingAppointment } from '../types';
import { hapticWarning, hapticLight } from '../utils/haptics';
import { useTheme } from '../context/ThemeContext';

interface CancelModalProps {
  isOpen: boolean;
  booking: BookingAppointment | null;
  onClose: () => void;
  onConfirmCancel: (booking: BookingAppointment) => void;
}

export const CancelModal: React.FC<CancelModalProps> = ({
  isOpen,
  booking,
  onClose,
  onConfirmCancel,
}) => {
  const { isDark } = useTheme();
  if (!isOpen || !booking) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className={`w-full max-w-sm rounded-2xl p-5 shadow-2xl space-y-4 border animate-in zoom-in-95 duration-200 ${
        isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        {/* Warning Header */}
        <div className="flex items-start justify-between">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 ${
            isDark ? 'bg-rose-950/40 border-rose-500/30 text-rose-400' : 'bg-rose-50 border-rose-200 text-rose-600'
          }`}>
            <AlertTriangle className="w-5 h-5" />
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition ${
              isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div>
          <h3 className={`text-base font-black leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Cancelar este agendamento?
          </h3>
          <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Esta vaga será liberada imediatamente para outro cliente no Vagou.
          </p>
        </div>

        {/* Appointment Summary Box */}
        <div className={`border rounded-xl p-3 space-y-2 text-xs ${
          isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200/80'
        }`}>
          <div className={`flex items-center justify-between font-bold border-b pb-2 ${
            isDark ? 'text-white border-slate-800' : 'text-slate-900 border-slate-200'
          }`}>
            <span>{booking.service}</span>
            <span className="text-[#20C933] font-bold">R$ {booking.totalPrice.toFixed(2).replace('.', ',')}</span>
          </div>

          <div className={`space-y-1 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{booking.salonName} • {booking.professional}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{booking.dateTime} ({booking.time})</span>
            </div>
          </div>
        </div>

        <div className={`text-[11px] p-2.5 rounded-xl border font-medium ${
          isDark ? 'bg-amber-950/30 text-amber-300 border-amber-500/30' : 'bg-amber-50 text-amber-900 border-amber-200'
        }`}>
          ⚠️ O cancelamento é gratuito e sem taxas até 1 hora antes do serviço.
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2.5 pt-1">
          <button
            onClick={() => {
              hapticLight();
              onClose();
            }}
            className={`py-2.5 px-3 font-bold text-xs rounded-xl transition cursor-pointer border ${
              isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
            }`}
          >
            Voltar
          </button>
          <button
            onClick={() => {
              hapticWarning();
              onConfirmCancel(booking);
            }}
            className="py-2.5 px-3 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-sm transition cursor-pointer"
          >
            Sim, Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};
