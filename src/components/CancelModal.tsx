import React from 'react';
import { AlertTriangle, X, Clock, MapPin } from 'lucide-react';
import { BookingAppointment } from '../types';
import { hapticWarning, hapticLight } from '../utils/haptics';

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
  if (!isOpen || !booking) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-white rounded-xl p-5 shadow-2xl space-y-4 border border-slate-100 animate-in zoom-in-95 duration-200">
        {/* Warning Header */}
        <div className="flex items-start justify-between">
          <div className="w-10 h-10 rounded-lg bg-rose-50 text-slate-900 flex items-center justify-center border border-rose-200 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div>
          <h3 className="text-base font-black text-slate-900 leading-tight">
            Cancelar este agendamento?
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Esta vaga será liberada imediatamente para outro cliente no Vagou.
          </p>
        </div>

        {/* Appointment Summary Box */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-3 space-y-2 text-xs">
          <div className="flex items-center justify-between font-bold text-slate-900 border-b border-slate-200 pb-2">
            <span>{booking.service}</span>
            <span className="text-emerald-700">R$ {booking.totalPrice.toFixed(2).replace('.', ',')}</span>
          </div>

          <div className="text-slate-600 space-y-1">
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

        <div className="text-[11px] bg-amber-50 text-slate-900 p-2.5 rounded-md border border-amber-300 font-medium">
          ⚠️ O cancelamento é gratuito e sem taxas até 1 hora antes do serviço.
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2.5 pt-1">
          <button
            onClick={() => {
              hapticLight();
              onClose();
            }}
            className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg transition"
          >
            Voltar
          </button>
          <button
            onClick={() => {
              hapticWarning();
              onConfirmCancel(booking);
            }}
            className="py-2.5 px-3 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-lg shadow-sm transition"
          >
            Sim, Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};
