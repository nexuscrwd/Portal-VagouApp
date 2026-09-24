import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  Phone,
  MessageCircle,
  Plus,
  Zap,
  CheckCircle2,
  AlertCircle,
  Scissors,
  Check,
  XCircle,
  Play,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { PartnerAppointmentItem, PartnerProfessional } from '../types';

interface PartnerAgendaScreenProps {
  appointments: PartnerAppointmentItem[];
  professionals: PartnerProfessional[];
  onOpenPublishModal: (prefill?: { professionalId?: string; time?: string; date?: string }) => void;
  onUpdateAppointmentStatus: (
    id: string,
    status: PartnerAppointmentItem['status']
  ) => void;
  onNavigateToScheduleConfig: () => void;
}

export const PartnerAgendaScreen: React.FC<PartnerAgendaScreenProps> = ({
  appointments,
  professionals,
  onOpenPublishModal,
  onUpdateAppointmentStatus,
  onNavigateToScheduleConfig,
}) => {
  // Today's date baseline
  const today = useMemo(() => new Date(), []);
  
  // Selected Month & Year
  const [currentMonthDate, setCurrentMonthDate] = useState<Date>(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );

  // Selected Date string "YYYY-MM-DD" - DEFAULT OPENS ON TODAY!
  const todayIso = useMemo(() => today.toISOString().split('T')[0], [today]);
  const [selectedDateIso, setSelectedDateIso] = useState<string>(todayIso);

  // Selected Professional Filter ('all' or professionalId)
  const [selectedProfessionalId, setSelectedProfessionalId] = useState<string>('all');

  // Month navigation
  const handlePrevMonth = () => {
    setCurrentMonthDate(
      new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() - 1, 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentMonthDate(
      new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() + 1, 1)
    );
  };

  const handleGoToToday = () => {
    const now = new Date();
    setCurrentMonthDate(new Date(now.getFullYear(), now.getMonth(), 1));
    setSelectedDateIso(now.toISOString().split('T')[0]);
  };

  // Month Name in Portuguese
  const monthName = useMemo(() => {
    return currentMonthDate.toLocaleDateString('pt-BR', {
      month: 'long',
      year: 'numeric',
    });
  }, [currentMonthDate]);

  // Generate days for the selected month to populate the day selector carousel
  const daysInMonth = useMemo(() => {
    const year = currentMonthDate.getFullYear();
    const month = currentMonthDate.getMonth();
    const totalDays = new Date(year, month + 1, 0).getDate();

    const daysList = [];
    const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

    for (let dayNum = 1; dayNum <= totalDays; dayNum++) {
      const d = new Date(year, month, dayNum);
      const isoStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      const dayOfWeekIndex = d.getDay();

      // Count appointments on this day
      const dayAppts = appointments.filter((a) => a.dateStr === isoStr);
      const hasActive = dayAppts.some((a) => a.status === 'CONFIRMADO' || a.status === 'EM_ATENDIMENTO');
      const hasVaga = dayAppts.some((a) => a.status === 'VAGA_PUBLICADA');

      daysList.push({
        dayNumber: dayNum,
        dayLabel: dayNames[dayOfWeekIndex],
        isoStr,
        isToday: isoStr === todayIso,
        appointmentCount: dayAppts.length,
        hasActive,
        hasVaga,
      });
    }
    return daysList;
  }, [currentMonthDate, todayIso, appointments]);

  // Filtered Appointments for the selected day & professional
  const filteredAppointments = useMemo(() => {
    return appointments
      .filter((a) => a.dateStr === selectedDateIso)
      .filter((a) => (selectedProfessionalId === 'all' ? true : a.professionalId === selectedProfessionalId))
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [appointments, selectedDateIso, selectedProfessionalId]);

  // Daily statistics
  const stats = useMemo(() => {
    const dayAppts = appointments.filter((a) => a.dateStr === selectedDateIso);
    const confirmedCount = dayAppts.filter(
      (a) => a.status === 'CONFIRMADO' || a.status === 'EM_ATENDIMENTO' || a.status === 'CONCLUIDO'
    ).length;
    const vagasCount = dayAppts.filter((a) => a.status === 'VAGA_PUBLICADA').length;
    const livresCount = dayAppts.filter((a) => a.status === 'HORARIO_LIVRE').length;
    const totalRevenue = dayAppts
      .filter((a) => a.status === 'CONCLUIDO' || a.status === 'CONFIRMADO' || a.status === 'EM_ATENDIMENTO')
      .reduce((acc, curr) => acc + curr.price, 0);

    return { confirmedCount, vagasCount, livresCount, totalRevenue };
  }, [appointments, selectedDateIso]);

  // Format readable selected date string
  const readableSelectedDate = useMemo(() => {
    const parts = selectedDateIso.split('-');
    if (parts.length === 3) {
      const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      const isToday = selectedDateIso === todayIso;
      return `${isToday ? 'Hoje, ' : ''}${d.toLocaleDateString('pt-BR', {
        weekday: 'long',
        day: 'numeric',
        month: 'short',
      })}`;
    }
    return selectedDateIso;
  }, [selectedDateIso, todayIso]);

  return (
    <div className="flex flex-col min-h-full pb-24 bg-slate-50">
      {/* Top Header with Month Navigator */}
      <div className="bg-white border-b border-slate-200 px-4 pt-4 pb-3 sticky top-0 z-20 shadow-sm">
        {/* Salon Branding & Quick Actions */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h1 className="text-sm font-black text-slate-900">Salão & Barbearia Xpress</h1>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">Painel do Estabelecimento • Itaquera</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenPublishModal({ date: selectedDateIso })}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-sm active:scale-95"
            >
              <Zap className="w-3.5 h-3.5 fill-white" />
              <span>Publicar Vaga</span>
            </button>
          </div>
        </div>

        {/* Month Selector Bar */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-1.5">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-md transition"
              aria-label="Mês anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1.5">
              <CalendarIcon className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-black text-slate-900 capitalize">{monthName}</span>
            </div>
            <button
              onClick={handleNextMonth}
              className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-md transition"
              aria-label="Próximo mês"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleGoToToday}
            className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition border ${
              selectedDateIso === todayIso
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
            }`}
          >
            Ir para Hoje
          </button>
        </div>

        {/* Horizontal Day Selector Carousel */}
        <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar scroll-smooth">
          {daysInMonth.map((d) => {
            const isSelected = d.isoStr === selectedDateIso;
            return (
              <button
                key={d.isoStr}
                onClick={() => setSelectedDateIso(d.isoStr)}
                className={`flex flex-col items-center justify-center min-w-[50px] py-2 px-1.5 rounded-xl transition shrink-0 border relative ${
                  isSelected
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-md scale-105 font-bold'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                }`}
              >
                <span
                  className={`text-[10px] uppercase tracking-tight ${
                    isSelected ? 'text-emerald-100' : 'text-slate-400'
                  }`}
                >
                  {d.dayLabel}
                </span>
                <span className={`text-base font-black leading-tight ${isSelected ? 'text-white' : 'text-slate-800'}`}>
                  {d.dayNumber}
                </span>

                {/* Day status indicators */}
                <div className="flex items-center gap-1 mt-1">
                  {d.hasActive && (
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isSelected ? 'bg-emerald-200' : 'bg-emerald-500'
                      }`}
                    />
                  )}
                  {d.hasVaga && (
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isSelected ? 'bg-amber-300' : 'bg-amber-400'
                      }`}
                    />
                  )}
                </div>

                {d.isToday && !isSelected && (
                  <span className="absolute -top-1 right-1 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white" />
                )}
              </button>
            );
          })}
        </div>

        {/* Professional Filter Chips */}
        <div className="flex items-center gap-2 mt-3 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setSelectedProfessionalId('all')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold shrink-0 transition ${
              selectedProfessionalId === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Toda a Equipe ({professionals.length})
          </button>
          {professionals.map((prof) => (
            <button
              key={prof.id}
              onClick={() => setSelectedProfessionalId(prof.id)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold shrink-0 flex items-center gap-1.5 transition ${
                selectedProfessionalId === prof.id
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: prof.color }}
              />
              <span>{prof.name.split(' ')[0]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Selected Day Overview Banner */}
      <div className="p-4 bg-emerald-950 text-white flex items-center justify-between">
        <div>
          <span className="text-[10px] text-emerald-300 font-bold uppercase tracking-wider block">
            AGENDA DO DIA
          </span>
          <h2 className="text-sm font-black capitalize text-white mt-0.5">
            {readableSelectedDate}
          </h2>
        </div>
        <div className="flex items-center gap-3 text-right">
          <div>
            <span className="text-[10px] text-emerald-300 block">Atendimentos</span>
            <span className="text-xs font-black text-white">{stats.confirmedCount}</span>
          </div>
          <div className="border-l border-emerald-800 pl-3">
            <span className="text-[10px] text-emerald-300 block">Vagas no App</span>
            <span className="text-xs font-black text-amber-300">{stats.vagasCount}</span>
          </div>
          <div className="border-l border-emerald-800 pl-3">
            <span className="text-[10px] text-emerald-300 block">Previsto</span>
            <span className="text-xs font-black text-emerald-400">
              R$ {stats.totalRevenue.toFixed(0)}
            </span>
          </div>
        </div>
      </div>

      {/* Appointment Chronological List */}
      <div className="p-4 space-y-3">
        {filteredAppointments.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center space-y-3 shadow-sm">
            <Clock className="w-8 h-8 text-slate-300 mx-auto" />
            <div>
              <h3 className="text-sm font-bold text-slate-800">Nenhum horário marcado neste dia</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                Você pode publicar uma vaga relâmpago no radar do Vagou ou ajustar a grade de atendimento.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => onOpenPublishModal({ date: selectedDateIso })}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-sm transition flex items-center gap-1.5"
              >
                <Zap className="w-3.5 h-3.5 fill-white" />
                <span>Publicar Vaga no App</span>
              </button>
            </div>
          </div>
        ) : (
          filteredAppointments.map((appt) => {
            const isEmAtendimento = appt.status === 'EM_ATENDIMENTO';
            const isConfirmado = appt.status === 'CONFIRMADO';
            const isConcluido = appt.status === 'CONCLUIDO';
            const isVagaPublicada = appt.status === 'VAGA_PUBLICADA';
            const isHorarioLivre = appt.status === 'HORARIO_LIVRE';
            const isNoShow = appt.status === 'NO_SHOW';
            const isCancelado = appt.status === 'CANCELADO';

            return (
              <div
                key={appt.id}
                className={`bg-white rounded-xl border p-4 shadow-sm transition space-y-3 ${
                  isEmAtendimento
                    ? 'border-emerald-500 ring-2 ring-emerald-500/10'
                    : isVagaPublicada
                    ? 'border-amber-400 bg-amber-50/20'
                    : isConcluido
                    ? 'border-slate-200 opacity-70 bg-slate-50/50'
                    : 'border-slate-200'
                }`}
              >
                {/* Header of Appointment Card */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="bg-slate-100 rounded-lg p-2 text-center min-w-[55px]">
                      <span className="text-xs font-black text-slate-900 block leading-tight">
                        {appt.startTime}
                      </span>
                      <span className="text-[10px] text-slate-500 font-semibold block">
                        {appt.endTime}
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-slate-900">
                          {appt.clientName}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {appt.protocolCode}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-slate-700 mt-0.5">
                        {appt.serviceTitle}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] text-slate-500 flex items-center gap-1">
                          <Scissors className="w-3 h-3 text-slate-400" />
                          {appt.professionalName}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="text-right">
                    <span className="text-sm font-black text-slate-900 block">
                      R$ {appt.price.toFixed(2).replace('.', ',')}
                    </span>
                    {isEmAtendimento && (
                      <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full inline-block mt-1 animate-pulse">
                        Em Atendimento
                      </span>
                    )}
                    {isConfirmado && (
                      <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full inline-block mt-1 border border-blue-200">
                        Confirmado
                      </span>
                    )}
                    {isVagaPublicada && (
                      <span className="text-[10px] font-extrabold bg-amber-100 text-slate-900 px-2 py-0.5 rounded-full inline-block mt-1 border border-amber-300">
                        ⚡ Vaga no App
                      </span>
                    )}
                    {isHorarioLivre && (
                      <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full inline-block mt-1">
                        Horário Livre
                      </span>
                    )}
                    {isConcluido && (
                      <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full inline-block mt-1">
                        Concluído
                      </span>
                    )}
                    {isNoShow && (
                      <span className="text-[10px] font-bold bg-rose-100 text-slate-900 px-2 py-0.5 rounded-full inline-block mt-1 border border-rose-300">
                        Faltou (No-Show)
                      </span>
                    )}
                  </div>
                </div>

                {/* Optional Notes */}
                {appt.notes && (
                  <p className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100">
                    💡 {appt.notes}
                  </p>
                )}

                {/* Action Buttons for Card */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 gap-2">
                  {/* WhatsApp contact if client exists */}
                  {appt.clientPhone ? (
                    <a
                      href={`https://wa.me/${appt.clientPhone.replace(/\D/g, '')}?text=Ol%C3%A1%20${encodeURIComponent(
                        appt.clientName
                      )},%20confirmamos%20seu%20hor%C3%A1rio%20hoje%20%C3%A0s%20${
                        appt.startTime
                      }%20no%20Sal%C3%A3o%20Xpress.`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shrink-0"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                      <span>WhatsApp</span>
                    </a>
                  ) : (
                    <div />
                  )}

                  <div className="flex items-center gap-1.5">
                    {/* If Confirmado -> can Check-in / Start */}
                    {isConfirmado && (
                      <>
                        <button
                          onClick={() => onUpdateAppointmentStatus(appt.id, 'NO_SHOW')}
                          className="px-2.5 py-1.5 text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-semibold transition"
                        >
                          Faltou
                        </button>
                        <button
                          onClick={() => onUpdateAppointmentStatus(appt.id, 'EM_ATENDIMENTO')}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-sm"
                        >
                          <Play className="w-3 h-3 fill-white" />
                          <span>Iniciar Corte</span>
                        </button>
                      </>
                    )}

                    {/* If Em Atendimento -> can Concluir */}
                    {isEmAtendimento && (
                      <button
                        onClick={() => onUpdateAppointmentStatus(appt.id, 'CONCLUIDO')}
                        className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                      >
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Concluir Atendimento</span>
                      </button>
                    )}

                    {/* If Vaga Publicada -> can Pausar or edit */}
                    {isVagaPublicada && (
                      <button
                        onClick={() => onUpdateAppointmentStatus(appt.id, 'HORARIO_LIVRE')}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition flex items-center gap-1"
                      >
                        <XCircle className="w-3.5 h-3.5 text-slate-500" />
                        <span>Pausar Vaga</span>
                      </button>
                    )}

                    {/* If Horario Livre -> can Publicar no Vagou */}
                    {isHorarioLivre && (
                      <button
                        onClick={() =>
                          onOpenPublishModal({
                            professionalId: appt.professionalId,
                            time: appt.startTime,
                            date: appt.dateStr,
                          })
                        }
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-sm"
                      >
                        <Zap className="w-3 h-3 fill-white" />
                        <span>Publicar no App</span>
                      </button>
                    )}

                    {/* If Concluído / Cancelado -> can re-open */}
                    {(isConcluido || isNoShow) && (
                      <button
                        onClick={() => onUpdateAppointmentStatus(appt.id, 'CONFIRMADO')}
                        className="px-2 py-1 text-slate-400 hover:text-slate-600 rounded text-[11px] transition flex items-center gap-1"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Reabrir</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Quick Config Banner at Bottom */}
      <div className="px-4 pt-2">
        <div
          onClick={onNavigateToScheduleConfig}
          className="bg-white border border-slate-200 rounded-xl p-3.5 flex items-center justify-between hover:border-emerald-500/40 transition cursor-pointer shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              ⚙️
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Configurar Horários e Intervalos</h4>
              <p className="text-[11px] text-slate-500">Defina dias de trabalho, almoço e pausas da equipe</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </div>
      </div>
    </div>
  );
};
