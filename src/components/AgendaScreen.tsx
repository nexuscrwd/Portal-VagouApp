import React, { useState, useMemo } from 'react';
import { 
  Calendar, Clock, Trash2, ArrowLeft, Home, 
  Activity, Sparkles, Check
} from 'lucide-react';
import { BookingAppointment, ServiceOffer } from '../types';
import { CancelModal } from './CancelModal';
import { SalonBookingModal, CatalogServiceItem, SalonProfessionalItem } from './SalonBookingModal';
import { useTheme } from '../context/ThemeContext';

interface AgendaScreenProps {
  bookings: BookingAppointment[];
  onNewBookingClick: () => void;
  onCancelBooking: (protocolCode: string) => void;
  onBack?: () => void;
  onConfirmBooking?: (offer: ServiceOffer, navigateToConfirm?: boolean) => void;
}

export const AgendaScreen: React.FC<AgendaScreenProps> = ({
  bookings,
  onNewBookingClick,
  onCancelBooking,
  onBack,
  onConfirmBooking,
}) => {
  const { isDark } = useTheme();
  const [tab, setTab] = useState<'proximos' | 'historico'>('proximos');
  const [timePeriodFilter, setTimePeriodFilter] = useState<'todos' | 'manha' | 'tarde' | 'noite'>('todos');
  const [bookingToCancel, setBookingToCancel] = useState<BookingAppointment | null>(null);

  // Estados para o Modal de Agendamento da Agenda
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedTimeSlotForBooking, setSelectedTimeSlotForBooking] = useState<string | null>(null);
  const [bookingSuccessData, setBookingSuccessData] = useState<{
    protocolCode: string;
    serviceTitle: string;
    dateTime: string;
    professionalName: string;
  } | null>(null);

  // Dados das Cadeiras em Atendimento Ao Vivo
  const activeChairsData = [
    {
      id: 'chair-1',
      number: 'Cadeira 01',
      professional: 'Carlos',
      serviceTitle: 'Corte Degradê',
      remainingMinutes: 14,
      totalMinutes: 40,
      endTime: '14:15',
      isCurrentUser: true,
    },
    {
      id: 'chair-2',
      number: 'Cadeira 02',
      professional: 'Mateus',
      serviceTitle: 'Barba Terapia',
      remainingMinutes: 8,
      totalMinutes: 35,
      endTime: '14:10',
      isCurrentUser: false,
    },
  ];

  // Grade de Horários do Dia em Tempo Real (4 Colunas)
  const agendaTimeSlots = [
    { time: '09:00', available: false, period: 'manha' },
    { time: '09:45', available: false, period: 'manha' },
    { time: '10:30', available: false, period: 'manha' },
    { time: '11:15', available: false, period: 'manha' },
    { time: '13:00', available: false, period: 'tarde' },
    { time: '13:45', available: false, period: 'tarde' },
    { time: '14:30', available: true,  period: 'tarde' },
    { time: '15:15', available: true,  period: 'tarde' },
    { time: '16:00', available: true,  period: 'tarde' },
    { time: '16:45', available: true,  period: 'tarde' },
    { time: '17:30', available: true,  period: 'tarde' },
    { time: '18:15', available: true,  period: 'noite' },
    { time: '19:00', available: true,  period: 'noite' },
    { time: '19:45', available: false, period: 'noite' },
    { time: '20:15', available: false, period: 'noite' },
    { time: '20:45', available: false, period: 'noite' },
  ];

  // Filtro de turnos dos horários
  const filteredAgendaSlots = useMemo(() => {
    if (timePeriodFilter === 'todos') return agendaTimeSlots;
    return agendaTimeSlots.filter((s) => s.period === timePeriodFilter);
  }, [timePeriodFilter]);

  // Serviços e Profissionais Padrão para o Modal
  const defaultServices: CatalogServiceItem[] = [
    {
      id: 'srv-1',
      title: 'Corte Degradê / Fade Moderno',
      duration: '40 min',
      price: 55,
      description: 'Corte com acabamento preciso na lâmina e finalização personalizada.',
      category: 'Cabelo',
      image: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'srv-2',
      title: 'Barba Terapia Premium',
      duration: '35 min',
      price: 45,
      description: 'Design de barba com toalha quente e óleos essenciais.',
      category: 'Barba',
      image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'srv-3',
      title: 'Combo Corte + Barba VIP',
      duration: '60 min',
      price: 90,
      description: 'Experiência completa de corte de cabelo e tratamento de barba.',
      category: 'Combos',
      image: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'srv-4',
      title: 'Acabamento na Navalha & Visagismo',
      duration: '20 min',
      price: 30,
      description: 'Desenho de linhas com navalha descartável e pós-barba calmante.',
      category: 'Rosto',
      image: 'https://images.unsplash.com/photo-1512690459411-b9245aed614b?auto=format&fit=crop&w=800&q=80',
    },
  ];

  const defaultProfessionals: SalonProfessionalItem[] = [
    {
      name: 'Carlos',
      role: 'Especialista em Fade & Barboterapia',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      rating: 4.9,
    },
    {
      name: 'Mateus',
      role: 'Mestre Barbeiro & Visagismo',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
      rating: 4.8,
    },
    {
      name: 'Juliana',
      role: 'Colorista & Tratamentos Capilares',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
      rating: 5.0,
    },
  ];

  const handleOpenBooking = (slotTime?: string) => {
    setSelectedTimeSlotForBooking(slotTime || null);
    setIsBookingModalOpen(true);
  };

  const handleConfirmAppointmentModal = (bookingData: {
    service: CatalogServiceItem;
    professional: string;
    dateFormatted: string;
    timeSlot: string;
    salonName: string;
    salonAddress: string;
    price: number;
  }) => {
    setIsBookingModalOpen(false);
    const mockOffer: ServiceOffer = {
      id: `off-${Date.now()}`,
      salonName: bookingData.salonName || 'Salão & Barbearia Xpress',
      professionalName: bookingData.professional,
      serviceTitle: bookingData.service.title,
      serviceCategory: 'cabelo',
      price: bookingData.price,
      originalPrice: bookingData.price * 1.2,
      rating: 4.9,
      ratingCount: 120,
      distance: '650 metros de você',
      neighborhood: 'Itaquera, São Paulo',
      timeSlot: `${bookingData.dateFormatted} • ${bookingData.timeSlot}`,
      dayLabel: bookingData.dateFormatted,
      duration: bookingData.service.duration,
      imageUrl: bookingData.service.image || 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=800&q=80',
      lat: -23.535,
      lng: -46.452,
    };

    if (onConfirmBooking) {
      onConfirmBooking(mockOffer, false);
    }

    setBookingSuccessData({
      protocolCode: `#VGA-${Math.floor(1000 + Math.random() * 9000)}`,
      serviceTitle: bookingData.service.title,
      dateTime: `${bookingData.dateFormatted} às ${bookingData.timeSlot}`,
      professionalName: bookingData.professional,
    });
  };

  const activeBookings = bookings.filter((b) => b.status !== 'CANCELADO');
  const pastOrCancelledBookings = bookings.filter((b) => b.status === 'CANCELADO');
  const displayedList = tab === 'proximos' ? activeBookings : pastOrCancelledBookings;

  const groups = [
    { title: 'HOJE, 26 DE JAN', items: displayedList.filter((b) => b.dayGroup.includes('HOJE')) },
    { title: 'AMANHÃ, 27 DE JAN', items: displayedList.filter((b) => b.dayGroup.includes('AMANHÃ')) },
    { title: 'OUTRAS DATAS', items: displayedList.filter((b) => !b.dayGroup.includes('HOJE') && !b.dayGroup.includes('AMANHÃ')) },
  ];

  const handleConfirmCancel = (booking: BookingAppointment) => {
    onCancelBooking(booking.protocolCode);
    setBookingToCancel(null);
  };

  return (
    <div className={`flex flex-col min-h-full pb-20 font-['Poppins'] transition-colors ${
      isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      {/* Modal de confirmação de cancelamento */}
      <CancelModal
        isOpen={Boolean(bookingToCancel)}
        booking={bookingToCancel}
        onClose={() => setBookingToCancel(null)}
        onConfirmCancel={handleConfirmCancel}
      />

      {/* Modal de Agendamento da Agenda */}
      <SalonBookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        salonName="Salão & Barbearia Xpress"
        salonAddress="Rua das Flores, 120"
        services={defaultServices}
        professionals={defaultProfessionals}
        initialService={defaultServices[0]}
        skipDateStep={true}
        initialTimeSlot={selectedTimeSlotForBooking}
        onConfirmAppointment={handleConfirmAppointmentModal}
      />

      {/* Alerta de Sucesso de Agendamento */}
      {bookingSuccessData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
          <div className={`w-full max-w-sm rounded-2xl p-5 shadow-2xl border text-center space-y-3.5 ${
            isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="w-12 h-12 rounded-xl bg-[#20C933] text-white flex items-center justify-center mx-auto shadow-md shadow-emerald-500/30">
              <Check className="w-7 h-7 stroke-[3]" />
            </div>
            <div>
              <h3 className="text-base font-bold">Vaga Agendada com Sucesso!</h3>
              <p className="text-xs text-slate-400 mt-1">
                {bookingSuccessData.serviceTitle} com {bookingSuccessData.professionalName} ({bookingSuccessData.dateTime}).
              </p>
            </div>
            <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-xs font-mono font-bold text-[#20C933]">
              Protocolo: {bookingSuccessData.protocolCode}
            </div>
            <button
              onClick={() => setBookingSuccessData(null)}
              className="w-full py-2.5 rounded-xl bg-[#20C933] hover:bg-[#1bb32d] text-white text-xs font-bold transition shadow-sm cursor-pointer"
            >
              OK, Entendido
            </button>
          </div>
        </div>
      )}

      {/* Header Sticky da Tela de Agenda */}
      <div className={`sticky top-0 z-40 px-4 h-[58px] border-b flex items-center justify-between gap-3 backdrop-blur-md transition-colors ${
        isDark ? 'bg-[#151A1E]/95 border-slate-800 shadow-md' : 'bg-white/95 border-slate-200 shadow-xs'
      }`}>
        <div className="flex items-center gap-2.5">
          {onBack && (
            <button
              id="btn-voltar-agenda"
              onClick={onBack}
              className={`p-2 rounded-lg transition active:scale-95 cursor-pointer ${
                isDark ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-700 hover:bg-slate-100'
              }`}
              title="Voltar ao Início"
              aria-label="Voltar para a tela inicial"
            >
              <ArrowLeft className="w-5 h-5 text-[#20C933]" />
            </button>
          )}
          <div>
            <h1 className={`text-sm font-bold flex items-center gap-1.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              <Calendar className="w-4 h-4 text-[#20C933]" />
              <span>Agenda & Vagas</span>
            </h1>
            <p className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Horários de hoje & cadeiras ao vivo
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {onBack && (
            <button
              onClick={onBack}
              className={`p-2 rounded-lg transition cursor-pointer active:scale-95 ${
                isDark ? 'bg-slate-900 hover:bg-slate-800 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
              title="Página Inicial (Radar)"
              aria-label="Ir para a página inicial"
            >
              <Home className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Conteúdo da Ferramenta Agenda Replicada */}
      <div className="p-3.5 space-y-3.5">
        {/* BOTÃO COM BORDAS EM 5px: "HORÁRIOS HOJE" (Gradiente Linear & Texto Branco Puro) */}
        <div>
          <button
            onClick={() => handleOpenBooking()}
            className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-emerald-600 via-[#20C933] to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white rounded text-xs sm:text-sm font-bold tracking-wider uppercase transition-all shadow-[0_2px_10px_-2px_rgba(32,201,51,0.35)] border border-emerald-400/30 cursor-pointer active:scale-[0.99]"
          >
            <Calendar className="w-4 h-4 text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.3)]" />
            <span className="drop-shadow-[0_1px_1px_rgba(0,0,0,0.3)]">HORÁRIOS HOJE</span>
          </button>
        </div>

        {/* 1. SEÇÃO: CADEIRAS EM ATENDIMENTO AO VIVO */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className={`text-xs font-bold flex items-center gap-1.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              <Activity className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
              <span>Cadeiras em Atendimento</span>
            </h2>
          </div>

          {/* Grid de Cadeiras Ocupadas */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {activeChairsData.map((chair) => {
              const progressPercent = Math.min(100, Math.max(0, Math.round(((chair.totalMinutes - chair.remainingMinutes) / chair.totalMinutes) * 100)));

              return (
                <div
                  key={chair.id}
                  className={`border rounded-xl p-2.5 relative overflow-hidden transition-all shadow-xs flex flex-col justify-between ${
                    chair.isCurrentUser
                      ? isDark
                        ? 'bg-slate-900/95 border-emerald-500/70 ring-1 ring-emerald-500/30'
                        : 'bg-emerald-50/50 border-emerald-500/60 ring-1 ring-emerald-500/20'
                      : isDark
                        ? 'bg-slate-900/80 border-slate-800'
                        : 'bg-white border-slate-200/90'
                  }`}
                >
                  {/* Topo do Card: Cadeira */}
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className={`text-[10px] font-black uppercase tracking-wider ${
                      isDark ? 'text-emerald-400' : 'text-emerald-600'
                    }`}>
                      {chair.number}
                    </span>
                  </div>

                  {/* Meio: Profissional Simples */}
                  <div className="min-w-0 my-0.5">
                    <h4 className={`text-xs font-bold truncate leading-tight ${
                      isDark ? 'text-white' : 'text-slate-900'
                    }`}>
                      {chair.professional}
                    </h4>
                  </div>

                  {/* Barra de Progresso e Previsão */}
                  <div className="mt-2 space-y-1">
                    <div className="w-full h-1 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full transition-all duration-500"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[9px] text-slate-400">
                      <span>{chair.remainingMinutes}m rest.</span>
                      <span>Até <strong>{chair.endTime}</strong></span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. SEÇÃO: TABELA DE HORÁRIOS (COM FILTRO DE TURNOS & CLIQUE DIRETO) */}
        <div className={`pt-2 border-t space-y-2 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
          <div className="flex items-center justify-between gap-1">
            <h4 className={`text-[11px] font-bold font-['Poppins'] flex items-center gap-1 uppercase tracking-wider truncate ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              <Clock className="w-3.5 h-3.5 text-[#20C933] flex-shrink-0" />
              <span>Horários</span>
            </h4>
            
            {/* Filtro de Turnos */}
            <div className={`flex items-center gap-0.5 p-0.5 rounded-lg border flex-shrink-0 ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200'
            }`}>
              {(['todos', 'manha', 'tarde', 'noite'] as const).map((period) => (
                <button
                  key={period}
                  type="button"
                  onClick={() => setTimePeriodFilter(period)}
                  className={`px-1.5 py-0.5 rounded text-[9px] font-bold capitalize transition cursor-pointer ${
                    timePeriodFilter === period
                      ? 'bg-[#20C933] text-white font-bold drop-shadow-xs'
                      : isDark
                      ? 'text-slate-400 hover:text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>

          {/* Grade da Tabela de Horários - 4 Colunas Ultra Enxutas */}
          <div className="grid grid-cols-4 gap-1.5 py-[5px]">
            {filteredAgendaSlots.map((slot) => {
              const isAvailable = slot.available;

              return (
                <button
                  key={slot.time}
                  disabled={!isAvailable}
                  onClick={() => handleOpenBooking(slot.time)}
                  className={`py-1.5 px-1 rounded-lg text-xs font-bold border transition flex items-center justify-center gap-1 cursor-pointer active:scale-95 ${
                    !isAvailable
                      ? isDark
                        ? 'bg-slate-900/30 border-slate-900 text-slate-600 line-through opacity-40 cursor-not-allowed'
                        : 'bg-slate-100/50 border-slate-200 text-slate-300 line-through opacity-40 cursor-not-allowed'
                      : isDark
                      ? 'bg-slate-900 border-slate-800 text-slate-200 hover:border-emerald-500 hover:text-white'
                      : 'bg-white border-slate-200 text-slate-800 hover:border-emerald-500 hover:text-emerald-700 shadow-2xs'
                  }`}
                >
                  <Clock className={`w-3 h-3 ${isAvailable ? 'text-[#20C933]' : isDark ? 'text-slate-600' : 'text-slate-300'}`} />
                  <span>{slot.time}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. SEÇÃO: MEUS AGENDAMENTOS (PRÓXIMOS / HISTÓRICO) */}
        <div className={`pt-3 border-t space-y-3 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
          <div className="flex items-center justify-between">
            <h3 className={`text-xs font-bold flex items-center gap-1.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              <Sparkles className="w-3.5 h-3.5 text-[#20C933]" />
              <span>Minhas Reservas</span>
            </h3>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              isDark ? 'bg-slate-900 text-slate-400 border border-slate-800' : 'bg-slate-200 text-slate-700'
            }`}>
              {activeBookings.length} {activeBookings.length === 1 ? 'vaga ativa' : 'vagas ativas'}
            </span>
          </div>

          {/* Segmented Control */}
          <div className={`p-1 rounded-lg flex border ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200'
          }`}>
            <button
              onClick={() => setTab('proximos')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-md transition cursor-pointer ${
                tab === 'proximos'
                  ? isDark
                    ? 'bg-slate-800 text-[#20C933] shadow-xs'
                    : 'bg-white text-emerald-700 shadow-xs'
                  : isDark
                  ? 'text-slate-400 hover:text-slate-200'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Próximos ({activeBookings.length})
            </button>
            <button
              onClick={() => setTab('historico')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-md transition cursor-pointer ${
                tab === 'historico'
                  ? isDark
                    ? 'bg-slate-800 text-[#20C933] shadow-xs'
                    : 'bg-white text-emerald-700 shadow-xs'
                  : isDark
                  ? 'text-slate-400 hover:text-slate-200'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Histórico ({pastOrCancelledBookings.length})
            </button>
          </div>

          {/* Lista de Reservas do Usuário */}
          <div className="space-y-3">
            {displayedList.length === 0 ? (
              <div className={`text-center py-6 px-4 space-y-2 rounded-xl border ${
                isDark ? 'bg-slate-900/40 border-slate-800/80' : 'bg-slate-100/60 border-slate-200'
              }`}>
                <div className="w-9 h-9 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
                  <Calendar className="w-4 h-4" />
                </div>
                <h4 className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                  {tab === 'proximos' ? 'Nenhuma vaga ativa no momento' : 'Nenhum histórico'}
                </h4>
                <p className={`text-[11px] max-w-xs mx-auto ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {tab === 'proximos'
                    ? 'Clique em qualquer horário acima para agendar seu atendimento!'
                    : 'Seus atendimentos concluídos ou cancelados ficarão salvos aqui.'}
                </p>
              </div>
            ) : (
              groups.map((grp) =>
                grp.items.length > 0 ? (
                  <div key={grp.title} className="space-y-2">
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      {grp.title}
                    </h4>

                    <div className="space-y-2">
                      {grp.items.map((item) => (
                        <div
                          key={item.protocolCode}
                          className={`border rounded-xl p-3 flex flex-col gap-2.5 transition shadow-xs ${
                            item.status === 'EM ANDAMENTO'
                              ? isDark
                                ? 'border-emerald-500/50 bg-emerald-950/20 ring-1 ring-emerald-500/20'
                                : 'border-emerald-500/60 bg-emerald-50/40 ring-1 ring-emerald-500/20'
                              : item.status === 'CANCELADO'
                              ? isDark
                                ? 'border-slate-800 bg-slate-900/40 opacity-70'
                                : 'border-slate-200 bg-slate-50 opacity-70'
                              : isDark
                              ? 'border-slate-800 bg-slate-900'
                              : 'border-slate-200 bg-white'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5 min-w-0">
                              {/* Time Badge */}
                              <div className="text-center min-w-[45px] pr-2.5 border-r border-slate-800/80 shrink-0">
                                <span className={`text-xs font-black block ${isDark ? 'text-white' : 'text-slate-900'}`}>{item.time}</span>
                                <span className="text-[9px] font-semibold text-slate-400 block">
                                  {item.dayGroup.includes('HOJE') ? 'Hoje' : 'Amanhã'}
                                </span>
                              </div>

                              {/* Info */}
                              <div className="min-w-0">
                                <h4 className={`text-xs font-bold truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>{item.service}</h4>
                                <p className={`text-[10px] truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                  {item.salonName} • {item.professional}
                                </p>
                                <div className="mt-1 flex items-center gap-1.5">
                                  <span
                                    className={`text-[9px] font-bold px-1.5 py-0.2 rounded-sm uppercase tracking-wider ${
                                      item.status === 'EM ANDAMENTO'
                                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                        : item.status === 'CANCELADO'
                                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                        : 'bg-slate-800 text-slate-300'
                                    }`}
                                  >
                                    {item.status}
                                  </span>
                                  <span className="text-[9px] font-mono text-slate-400">
                                    #{item.protocolCode}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="text-right shrink-0">
                              <span className="text-xs font-black text-emerald-500 block">
                                R$ {item.totalPrice.toFixed(0)}
                              </span>
                            </div>
                          </div>

                          {/* Cancel Button */}
                          {item.status !== 'CANCELADO' && (
                            <div className={`pt-2 border-t flex items-center justify-between ${
                              isDark ? 'border-slate-800/80' : 'border-slate-100'
                            }`}>
                              <span className="text-[9px] text-slate-400">
                                Cancelamento gratuito até 1h antes
                              </span>
                              <button
                                onClick={() => setBookingToCancel(item)}
                                className="px-2 py-0.5 text-rose-500 hover:bg-rose-500/10 border border-rose-500/30 rounded-md text-[10px] font-bold flex items-center gap-1 transition cursor-pointer"
                              >
                                <Trash2 className="w-2.5 h-2.5" />
                                <span>Cancelar</span>
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

