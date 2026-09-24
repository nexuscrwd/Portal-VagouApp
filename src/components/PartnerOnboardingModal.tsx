import React, { useState } from 'react';
import {
  Building2,
  Car,
  Layers,
  User,
  Users,
  Sparkles,
  Scissors,
  Check,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Copy,
  ExternalLink,
  Plus,
  Trash2,
  Store,
  Clock,
  DollarSign,
  ShieldCheck,
  PartyPopper,
  Zap,
} from 'lucide-react';
import {
  SalonRegistrationPayload,
  PartnerOnboardingData,
  PartnerOnboardingInitialService,
} from '../types';
import { hapticLight, hapticSuccess } from '../utils/haptics';

export interface PartnerOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  salonData: SalonRegistrationPayload | null;
  onFinishOnboarding: (onboardingData: PartnerOnboardingData) => void;
}

export const PartnerOnboardingModal: React.FC<PartnerOnboardingModalProps> = ({
  isOpen,
  onClose,
  salonData,
  onFinishOnboarding,
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Step 1: Modelo de Operação
  const [operatingModel, setOperatingModel] = useState<'team' | 'solo' | 'home_delivery' | 'hybrid'>('team');

  // Step 2: Logomarca / Identidade
  const [selectedLogoPreset, setSelectedLogoPreset] = useState<string>('preset-1');

  // Step 3: Equipe Inicial
  const [profName, setProfName] = useState(salonData?.ownerName || 'Carlos Silva');
  const [profRole, setProfRole] = useState(
    salonData?.segment === 'barbearia' ? 'Master Barber' : 'Cabeleireiro & Visagista'
  );
  const [profSlotMinutes, setProfSlotMinutes] = useState<number>(45);

  // Step 4: Primeiro Catálogo de Serviços
  const defaultServicesForSegment = (): PartnerOnboardingInitialService[] => {
    if (salonData?.segment === 'barbearia') {
      return [
        { title: 'Corte Degradê & Lavagem', category: 'cabelo', price: 45, durationMinutes: 35 },
        { title: 'Barba com Toalha Quente', category: 'barba', price: 35, durationMinutes: 30 },
        { title: 'Combo Corte + Barba', category: 'cabelo', price: 75, durationMinutes: 55 },
      ];
    }
    if (salonData?.segment === 'esmalteria') {
      return [
        { title: 'Manicure & Pedicure Completa', category: 'unhas', price: 65, durationMinutes: 50 },
        { title: 'Esmaltação em Gel', category: 'unhas', price: 70, durationMinutes: 45 },
      ];
    }
    if (salonData?.segment === 'estetica') {
      return [
        { title: 'Limpeza de Pele Profunda', category: 'estetica', price: 110, durationMinutes: 60 },
        { title: 'Design de Sobrancelhas', category: 'beleza', price: 40, durationMinutes: 30 },
      ];
    }
    return [
      { title: 'Corte Feminino & Escova', category: 'cabelo', price: 80, durationMinutes: 45 },
      { title: 'Hidratação Profunda', category: 'cabelo', price: 70, durationMinutes: 40 },
    ];
  };

  const [services, setServices] = useState<PartnerOnboardingInitialService[]>(defaultServicesForSegment());
  const [newServiceTitle, setNewServiceTitle] = useState('');
  const [newServicePrice, setNewServicePrice] = useState('50');
  const [newServiceDuration, setNewServiceDuration] = useState('35');

  // Step 5: Link Copied State
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen) return null;

  const salonName = salonData?.name || 'Seu Estabelecimento';
  const slug = salonData?.slug || 'seu-salao';
  const primaryColor = salonData?.branding?.primaryColor || '#10B981';
  const salonAppUrl = `https://vagou.app/${slug}`;

  const handleAddCustomService = () => {
    if (!newServiceTitle.trim()) return;
    const cat: PartnerOnboardingInitialService['category'] =
      salonData?.segment === 'barbearia' ? 'cabelo' : 'beleza';
    setServices((prev) => [
      ...prev,
      {
        title: newServiceTitle.trim(),
        category: cat,
        price: Number(newServicePrice) || 40,
        durationMinutes: Number(newServiceDuration) || 30,
      },
    ]);
    setNewServiceTitle('');
    hapticLight();
  };

  const handleRemoveService = (idx: number) => {
    setServices((prev) => prev.filter((_, i) => i !== idx));
    hapticLight();
  };

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(salonAppUrl);
      setCopiedLink(true);
      hapticLight();
      setTimeout(() => setCopiedLink(false), 3000);
    }
  };

  const handleCompleteAll = () => {
    hapticSuccess();
    onFinishOnboarding({
      operatingModel,
      primaryProfessionalName: profName,
      primaryProfessionalRole: profRole,
      primaryProfessionalSlotMinutes: profSlotMinutes,
      services,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md h-[92dvh] max-h-[720px] bg-slate-950 border border-slate-800 rounded-2xl flex flex-col overflow-hidden shadow-2xl">
        {/* Modal Top Header */}
        <div className="flex-shrink-0 sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-sm"
              style={{ backgroundColor: primaryColor }}
            >
              ✓
            </div>
            <div>
              <h3 className="text-xs font-black text-white">Setup do Estabelecimento</h3>
              <p className="text-[10px] text-slate-400">
                Etapa {step} de 5 — {
                  step === 1 ? 'Modelo de Atendimento' :
                  step === 2 ? 'Logo & Identidade' :
                  step === 3 ? 'Equipe Inicial' :
                  step === 4 ? 'Catálogo de Serviços' : 'Pronto para Atender'
                }
              </p>
            </div>
          </div>

          {/* Progress dots */}
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <span
                key={s}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  s === step ? 'w-4 bg-emerald-500' : s < step ? 'bg-emerald-600' : 'bg-slate-800'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Modal Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-5">
          {/* STEP 1: Modelo de Operação */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-bold text-white">Como você atende seus clientes?</h4>
                <p className="text-xs text-slate-400">Escolha o formato que define sua operação hoje:</p>
              </div>

              <div className="space-y-2.5">
                {[
                  {
                    id: 'team',
                    title: 'Salão Físico com Equipe',
                    desc: 'Clientes vão ao salão físico. Gestão de cadeiras e múltiplos profissionais.',
                    icon: Building2,
                  },
                  {
                    id: 'hybrid',
                    title: 'Híbrido (Salão + A Domicílio)',
                    desc: 'Atende no espaço físico e também desloca profissionais para atendimento externo.',
                    icon: Layers,
                  },
                  {
                    id: 'home_delivery',
                    title: 'Exclusivo a Domicílio',
                    desc: 'Sem ponto comercial fixo. Os profissionais vão até a residência do cliente.',
                    icon: Car,
                  },
                  {
                    id: 'solo',
                    title: 'Profissional Solo / Studio',
                    desc: 'Operação individual, sem equipe no momento.',
                    icon: User,
                  },
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = operatingModel === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setOperatingModel(item.id as any);
                        hapticLight();
                      }}
                      className={`w-full p-3.5 rounded-xl border text-left flex items-start gap-3 transition active:scale-[0.99] cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-500/15 border-emerald-500'
                          : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border ${
                          isSelected
                            ? 'bg-emerald-500 text-white border-emerald-400'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h5 className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                            {item.title}
                          </h5>
                          {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{item.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: Logomarca & Visual */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-bold text-white">Logotipo & Identidade</h4>
                <p className="text-xs text-slate-400">Escolha o estilo de logotipo inicial da sua vitrine:</p>
              </div>

              {/* Logo Presets Grid */}
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { id: 'preset-1', label: 'Monograma', symbol: salonName.charAt(0).toUpperCase() },
                  { id: 'preset-2', label: 'Elegance', symbol: '✂' },
                  { id: 'preset-3', label: 'Minimal', symbol: '⚡' },
                ].map((item) => {
                  const isSelected = selectedLogoPreset === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setSelectedLogoPreset(item.id);
                        hapticLight();
                      }}
                      className={`p-3 rounded-xl border text-center flex flex-col items-center gap-2 transition active:scale-95 cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-500/15 border-emerald-500 text-white'
                          : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}
                    >
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-black text-white shadow-md"
                        style={{ backgroundColor: primaryColor }}
                      >
                        {item.symbol}
                      </div>
                      <span className="text-[11px] font-bold">{item.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Radar Card Preview */}
              <div className="pt-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-2">
                  Como seu salão aparece no radar:
                </span>
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg text-white shadow-md shrink-0"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {selectedLogoPreset === 'preset-1'
                      ? salonName.charAt(0).toUpperCase()
                      : selectedLogoPreset === 'preset-2'
                      ? '✂'
                      : '⚡'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h5 className="text-xs font-bold text-white truncate">{salonName}</h5>
                      <span className="text-[9px] bg-emerald-500/20 text-emerald-400 font-bold px-1 rounded">
                        Novo
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 truncate">
                      {salonData?.neighborhood ? `${salonData.neighborhood}, ${salonData.city}` : 'São Paulo, SP'}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                        <Zap className="w-3 h-3 text-emerald-400" /> Vagas relâmpago ativas
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Equipe Inicial */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-bold text-white">Cadastrar 1º Profissional</h4>
                <p className="text-xs text-slate-400">Pode ser você mesmo ou o barbeiro/cabeleireiro principal:</p>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300 block">Nome do Profissional</label>
                  <input
                    type="text"
                    value={profName}
                    onChange={(e) => setProfName(e.target.value)}
                    placeholder="Ex: Carlos Silva"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-emerald-500 text-sm text-white outline-none transition"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300 block">Especialidade / Cargo</label>
                  <input
                    type="text"
                    value={profRole}
                    onChange={(e) => setProfRole(e.target.value)}
                    placeholder="Ex: Master Barber, Manicure, Cabeleireiro"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-emerald-500 text-sm text-white outline-none transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                    <span>Tempo Médio por Atendimento</span>
                    <span className="text-xs font-mono font-bold text-emerald-400">{profSlotMinutes} min</span>
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[30, 45, 60, 90].map((mins) => (
                      <button
                        key={mins}
                        type="button"
                        onClick={() => {
                          setProfSlotMinutes(mins);
                          hapticLight();
                        }}
                        className={`py-2 rounded-lg border text-xs font-bold font-mono transition cursor-pointer ${
                          profSlotMinutes === mins
                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {mins}m
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Catálogo de Serviços */}
          {step === 4 && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-bold text-white">Serviços Iniciais</h4>
                <p className="text-xs text-slate-400">Serviços que seus clientes poderão agendar:</p>
              </div>

              {/* Lista Atual de Serviços */}
              <div className="space-y-2">
                {services.map((srv, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-2"
                  >
                    <div className="flex-1 min-w-0">
                      <h5 className="text-xs font-bold text-white truncate">{srv.title}</h5>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {srv.durationMinutes} min • R$ {srv.price.toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveService(idx)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 transition cursor-pointer"
                      title="Remover serviço"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Adicionar Novo Serviço */}
              <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800/80 space-y-2">
                <span className="text-[11px] font-bold text-slate-300 block">+ Adicionar Outro Serviço</span>
                <input
                  type="text"
                  placeholder="Nome do serviço (ex: Barboterapia)"
                  value={newServiceTitle}
                  onChange={(e) => setNewServiceTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 focus:border-emerald-500 text-xs text-white outline-none"
                />
                <div className="flex gap-2">
                  <div className="flex-1">
                    <input
                      type="number"
                      placeholder="Preço R$"
                      value={newServicePrice}
                      onChange={(e) => setNewServicePrice(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white font-mono outline-none"
                    />
                  </div>
                  <div className="w-24">
                    <input
                      type="number"
                      placeholder="Minutos"
                      value={newServiceDuration}
                      onChange={(e) => setNewServiceDuration(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white font-mono outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddCustomService}
                    className="px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition cursor-pointer shrink-0"
                  >
                    Adicionar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: Sucesso & Conclusão */}
          {step === 5 && (
            <div className="space-y-5 text-center py-2">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 mx-auto flex items-center justify-center shadow-lg">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h4 className="text-base font-black text-white">Parabéns! Empresa Cadastrada</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                  Seu estabelecimento está configurado e pronto para lançar vagas no Radar do Vagou.
                </p>
              </div>

              {/* Link Box */}
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-left space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Link Oficial do Estabelecimento:
                </span>
                <div className="flex items-center justify-between gap-2 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-xs font-mono text-emerald-400 font-bold truncate">
                    {salonAppUrl}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="p-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer active:scale-95 shrink-0"
                    title="Copiar link"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
                {copiedLink && (
                  <span className="text-[10px] text-emerald-400 block">✓ Link copiado para a área de transferência!</span>
                )}
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 text-left space-y-1">
                <h5 className="text-xs font-bold text-slate-200">Próximo Passo:</h5>
                <p className="text-[11px] text-slate-400">
                  Acesse o painel do estabelecimento para lançar sua primeira vaga relâmpago no Radar.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Sticky Bottom Action Footer (Regra Vagou: sticky bottom-0 z-20) */}
        <div className="flex-shrink-0 sticky bottom-0 z-20 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 px-4 py-3 flex items-center justify-between gap-3">
          {step > 1 && step < 5 ? (
            <button
              type="button"
              onClick={() => {
                setStep((prev) => (prev - 1) as any);
                hapticLight();
              }}
              className="px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Voltar</span>
            </button>
          ) : (
            <div className="text-[11px] text-slate-500">
              {step === 5 ? 'Configuração Final' : 'Etapa 1 de 5'}
            </div>
          )}

          {step < 5 ? (
            <button
              type="button"
              onClick={() => {
                setStep((prev) => (prev + 1) as any);
                hapticLight();
              }}
              className="flex-1 max-w-[200px] ml-auto py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50 cursor-pointer"
            >
              <span>Avançar</span>
              <ArrowRight className="w-3.5 h-3.5 text-white" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleCompleteAll}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50 cursor-pointer"
            >
              <Store className="w-4 h-4 text-white" />
              <span>Acessar Painel do Estabelecimento</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
export default PartnerOnboardingModal;
