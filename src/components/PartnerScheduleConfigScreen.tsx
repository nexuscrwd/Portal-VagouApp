import React, { useState } from 'react';
import {
  Clock,
  Calendar,
  Users,
  Plus,
  Trash2,
  Check,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  ArrowLeft,
  Copy,
  AlertCircle,
  Scissors,
  CheckCircle2,
  Home,
} from 'lucide-react';
import { DayScheduleConfig, PartnerProfessional, TimeBreak } from '../types';

interface PartnerScheduleConfigScreenProps {
  professionals: PartnerProfessional[];
  onSaveSchedule: (
    professionalId: string | 'all',
    schedule: DayScheduleConfig[],
    slotDuration: number
  ) => void;
  onAddProfessional: (prof: Omit<PartnerProfessional, 'id'>) => void;
  onBack: () => void;
  onNavigateToHome?: () => void;
}

export const PartnerScheduleConfigScreen: React.FC<PartnerScheduleConfigScreenProps> = ({
  professionals,
  onSaveSchedule,
  onAddProfessional,
  onBack,
  onNavigateToHome,
}) => {
  // Selected Target: 'all' (Salon Default) or specific professional ID
  const [selectedTargetId, setSelectedTargetId] = useState<string>('all');

  // Currently active professional or default
  const activeProfessional = professionals.find((p) => p.id === selectedTargetId);

  // Local working copy of schedule
  const [workingSchedule, setWorkingSchedule] = useState<DayScheduleConfig[]>(() => {
    if (activeProfessional) {
      return JSON.parse(JSON.stringify(activeProfessional.schedule));
    }
    return JSON.parse(JSON.stringify(professionals[0]?.schedule || []));
  });

  const [slotDuration, setSlotDuration] = useState<number>(
    activeProfessional ? activeProfessional.slotDurationMinutes : 45
  );

  const [showAddProfModal, setShowAddProfModal] = useState<boolean>(false);
  const [newProfName, setNewProfName] = useState<string>('');
  const [newProfRole, setNewProfRole] = useState<string>('Barbeiro');
  const [newProfPhone, setNewProfPhone] = useState<string>('');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string>('');

  // Handle changing selected target (all or professional)
  const handleSelectTarget = (targetId: string) => {
    setSelectedTargetId(targetId);
    if (targetId === 'all') {
      setWorkingSchedule(JSON.parse(JSON.stringify(professionals[0]?.schedule || [])));
      setSlotDuration(45);
    } else {
      const prof = professionals.find((p) => p.id === targetId);
      if (prof) {
        setWorkingSchedule(JSON.parse(JSON.stringify(prof.schedule)));
        setSlotDuration(prof.slotDurationMinutes);
      }
    }
  };

  // Toggle active day
  const handleToggleDay = (dayIndex: number) => {
    setWorkingSchedule((prev) =>
      prev.map((d) => (d.dayOfWeek === dayIndex ? { ...d, active: !d.active } : d))
    );
  };

  // Update open/close time
  const handleUpdateTime = (
    dayIndex: number,
    field: 'openTime' | 'closeTime',
    value: string
  ) => {
    setWorkingSchedule((prev) =>
      prev.map((d) => (d.dayOfWeek === dayIndex ? { ...d, [field]: value } : d))
    );
  };

  // Add a break (e.g. Almoço)
  const handleAddBreak = (dayIndex: number) => {
    setWorkingSchedule((prev) =>
      prev.map((d) => {
        if (d.dayOfWeek === dayIndex) {
          const newBreak: TimeBreak = {
            id: `brk-${Date.now()}`,
            label: 'Almoço',
            start: '12:00',
            end: '13:00',
          };
          return { ...d, breaks: [...d.breaks, newBreak] };
        }
        return d;
      })
    );
  };

  // Remove a break
  const handleRemoveBreak = (dayIndex: number, breakId: string) => {
    setWorkingSchedule((prev) =>
      prev.map((d) => {
        if (d.dayOfWeek === dayIndex) {
          return { ...d, breaks: d.breaks.filter((b) => b.id !== breakId) };
        }
        return d;
      })
    );
  };

  // Update break details
  const handleUpdateBreak = (
    dayIndex: number,
    breakId: string,
    field: keyof TimeBreak,
    value: string
  ) => {
    setWorkingSchedule((prev) =>
      prev.map((d) => {
        if (d.dayOfWeek === dayIndex) {
          return {
            ...d,
            breaks: d.breaks.map((b) => (b.id === breakId ? { ...b, [field]: value } : b)),
          };
        }
        return d;
      })
    );
  };

  // Save changes
  const handleSave = () => {
    onSaveSchedule(selectedTargetId, workingSchedule, slotDuration);
    setSaveSuccessMsg(
      selectedTargetId === 'all'
        ? 'Grade aplicada com sucesso a todos os profissionais!'
        : `Horários de ${activeProfessional?.name} salvos com sucesso!`
    );
    setTimeout(() => setSaveSuccessMsg(''), 4000);
  };

  // Handle Add New Professional
  const handleCreateProfessional = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProfName.trim()) return;

    const colors = ['#059669', '#2563eb', '#db2777', '#7c3aed', '#d97706', '#0891b2'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    onAddProfessional({
      name: newProfName.trim(),
      role: newProfRole,
      phone: newProfPhone.trim() || '(11) 90000-0000',
      specialties: ['Atendimento Geral', 'Serviços do Salão'],
      color: randomColor,
      slotDurationMinutes: slotDuration,
      useCustomSchedule: false,
      schedule: JSON.parse(JSON.stringify(workingSchedule)),
    });

    setNewProfName('');
    setNewProfPhone('');
    setShowAddProfModal(false);
    setSaveSuccessMsg('Novo profissional cadastrado na equipe!');
    setTimeout(() => setSaveSuccessMsg(''), 4000);
  };

  return (
    <div className="flex flex-col min-h-full pb-28 bg-slate-50">
      {/* Top Bar */}
      <div className="bg-white border-b border-slate-200 p-4 sticky top-0 z-20 shadow-sm">
        <div className="flex items-center justify-between">
          <button
            id="btn-voltar-config-horarios"
            onClick={onBack}
            className="flex items-center gap-1.5 p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition cursor-pointer active:scale-95"
            title="Voltar para a Agenda"
            aria-label="Voltar"
          >
            <ArrowLeft className="w-5 h-5 text-emerald-600" />
            <span className="text-xs font-bold hidden sm:inline">Voltar</span>
          </button>
          <div>
            <h1 className="text-sm font-black text-slate-900 text-center">
              Horários & Equipe
            </h1>
            <p className="text-[11px] text-slate-500 text-center">
              Dias de atendimento, turnos e intervalos
            </p>
          </div>
          {onNavigateToHome ? (
            <button
              id="btn-inicio-config-horarios"
              onClick={onNavigateToHome}
              className="p-2 text-slate-600 hover:text-emerald-600 hover:bg-slate-100 rounded-xl transition cursor-pointer active:scale-95"
              title="Ir para a Tela Inicial (Radar)"
              aria-label="Tela Inicial"
            >
              <Home className="w-5 h-5" />
            </button>
          ) : (
            <div className="w-9" />
          )}
        </div>

        {/* Target Professional / Salon Selector */}
        <div className="mt-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
              Configurar Horários Para:
            </span>
            <button
              onClick={() => setShowAddProfModal(true)}
              className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              <Plus className="w-3 h-3" />
              <span>Novo Profissional</span>
            </button>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            <button
              onClick={() => handleSelectTarget('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition flex items-center gap-1.5 ${
                selectedTargetId === 'all'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <span>🏢 Salão Geral (Todos)</span>
            </button>

            {professionals.map((prof) => (
              <button
                key={prof.id}
                onClick={() => handleSelectTarget(prof.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition flex items-center gap-1.5 ${
                  selectedTargetId === prof.id
                    ? 'bg-slate-900 text-white shadow-sm font-bold'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: prof.color }}
                />
                <span>{prof.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Notification banner */}
      {saveSuccessMsg && (
        <div className="m-4 p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* Target Status Card */}
      <div className="p-4 bg-emerald-950 text-white">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] text-emerald-300 font-bold uppercase tracking-wider block">
              MODIFICANDO GRADE DE:
            </span>
            <h2 className="text-sm font-black text-white mt-0.5">
              {selectedTargetId === 'all'
                ? 'Todos os Profissionais (Regra Geral)'
                : `${activeProfessional?.name} (${activeProfessional?.role})`}
            </h2>
          </div>

          {selectedTargetId !== 'all' && (
            <span className="text-[10px] bg-emerald-800 text-emerald-200 px-2 py-0.5 rounded font-semibold">
              Grade Individual
            </span>
          )}
        </div>
      </div>

      {/* Slot Duration Setting */}
      <div className="p-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-600" />
              <h3 className="text-xs font-bold text-slate-900">
                Duração Padrão do Atendimento
              </h3>
            </div>
            <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              {slotDuration} minutos
            </span>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {[30, 45, 50, 60].map((duration) => (
              <button
                key={duration}
                onClick={() => setSlotDuration(duration)}
                className={`py-2 rounded-lg text-xs font-bold transition border ${
                  slotDuration === duration
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {duration} min
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Days & Working Hours & Breaks List */}
      <div className="px-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Dias da Semana & Horários
          </h3>
          <span className="text-[11px] text-slate-400">Ative ou pause cada dia</span>
        </div>

        {workingSchedule.map((day) => (
          <div
            key={day.dayOfWeek}
            className={`bg-white rounded-xl border p-4 shadow-sm transition space-y-3 ${
              day.active ? 'border-slate-200' : 'border-slate-200/60 opacity-60 bg-slate-50/50'
            }`}
          >
            {/* Day Toggle Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <input
                  type="checkbox"
                  id={`day-toggle-${day.dayOfWeek}`}
                  checked={day.active}
                  onChange={() => handleToggleDay(day.dayOfWeek)}
                  className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                />
                <label
                  htmlFor={`day-toggle-${day.dayOfWeek}`}
                  className="text-xs font-black text-slate-900 cursor-pointer"
                >
                  {day.dayName}
                </label>
              </div>

              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  day.active
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                {day.active ? 'Aberto / Atende' : 'Fechado / Folga'}
              </span>
            </div>

            {day.active && (
              <div className="space-y-3 pt-2 border-t border-slate-100">
                {/* Working hours inputs */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                      Início do Atendimento
                    </label>
                    <input
                      type="time"
                      value={day.openTime}
                      onChange={(e) =>
                        handleUpdateTime(day.dayOfWeek, 'openTime', e.target.value)
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                      Término do Atendimento
                    </label>
                    <input
                      type="time"
                      value={day.closeTime}
                      onChange={(e) =>
                        handleUpdateTime(day.dayOfWeek, 'closeTime', e.target.value)
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* Breaks Section */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-700">
                      Intervalos de Descanso (Almoço/Pausa)
                    </span>
                    <button
                      onClick={() => handleAddBreak(day.dayOfWeek)}
                      className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Adicionar Intervalo</span>
                    </button>
                  </div>

                  {day.breaks.length === 0 ? (
                    <p className="text-[11px] text-slate-400 italic">
                      Sem intervalos cadastrados para este dia.
                    </p>
                  ) : (
                    day.breaks.map((brk) => (
                      <div
                        key={brk.id}
                        className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-200"
                      >
                        <input
                          type="text"
                          value={brk.label}
                          onChange={(e) =>
                            handleUpdateBreak(
                              day.dayOfWeek,
                              brk.id,
                              'label',
                              e.target.value
                            )
                          }
                          placeholder="Ex: Almoço"
                          className="w-24 bg-white border border-slate-200 rounded px-2 py-1 text-xs font-semibold text-slate-800"
                        />
                        <div className="flex items-center gap-1 flex-1">
                          <input
                            type="time"
                            value={brk.start}
                            onChange={(e) =>
                              handleUpdateBreak(
                                day.dayOfWeek,
                                brk.id,
                                'start',
                                e.target.value
                              )
                            }
                            className="bg-white border border-slate-200 rounded px-1.5 py-1 text-xs font-bold text-slate-800 flex-1"
                          />
                          <span className="text-[11px] text-slate-400">às</span>
                          <input
                            type="time"
                            value={brk.end}
                            onChange={(e) =>
                              handleUpdateBreak(
                                day.dayOfWeek,
                                brk.id,
                                'end',
                                e.target.value
                              )
                            }
                            className="bg-white border border-slate-200 rounded px-1.5 py-1 text-xs font-bold text-slate-800 flex-1"
                          />
                        </div>
                        <button
                          onClick={() => handleRemoveBreak(day.dayOfWeek, brk.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-500 rounded transition"
                          title="Remover intervalo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Sticky Save CTA */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/95 backdrop-blur border-t border-slate-200 p-4 z-30 shadow-lg">
        <button
          onClick={handleSave}
          className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] text-white font-black text-xs uppercase tracking-wider rounded-xl transition shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2"
        >
          <Check className="w-4 h-4" />
          <span>
            {selectedTargetId === 'all'
              ? 'Salvar Grade Para Todos os Profissionais'
              : `Salvar Horários de ${activeProfessional?.name}`}
          </span>
        </button>
      </div>

      {/* Modal Add Professional */}
      {showAddProfModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-5 w-full max-w-sm shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-black text-slate-900">
                Adicionar Profissional à Equipe
              </h3>
              <button
                onClick={() => setShowAddProfModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateProfessional} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  Nome Completo
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Matheus Oliveira"
                  value={newProfName}
                  onChange={(e) => setNewProfName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  Função / Especialidade
                </label>
                <select
                  value={newProfRole}
                  onChange={(e) => setNewProfRole(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Barbeiro Master">Barbeiro Master</option>
                  <option value="Cabeleireiro(a)">Cabeleireiro(a)</option>
                  <option value="Manicure & Pedicure">Manicure & Pedicure</option>
                  <option value="Designer de Sobrancelhas">Designer de Sobrancelhas</option>
                  <option value="Esteticista">Esteticista</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  WhatsApp / Celular
                </label>
                <input
                  type="text"
                  placeholder="(11) 98888-7777"
                  value={newProfPhone}
                  onChange={(e) => setNewProfPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddProfModal(false)}
                  className="px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition shadow-sm"
                >
                  Cadastrar Profissional
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
