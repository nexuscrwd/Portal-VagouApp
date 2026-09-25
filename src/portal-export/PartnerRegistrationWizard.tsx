import React, { useState, useId } from 'react';
import {
  Building2,
  User,
  Palette,
  ArrowRight,
  ArrowLeft,
  Check,
  X,
  Eye,
  EyeOff,
  Sparkles,
  Scissors,
  Flower2,
  Store,
  Paintbrush,
  Search,
  Loader2,
  ShieldCheck,
  ExternalLink,
  MapPin,
  Phone,
  Mail,
  Lock,
} from 'lucide-react';
import { SalonRegistrationPayload } from '../types';
import {
  signUpWithSupabase,
  syncSalonDataToSupabase,
  saveOwnerPreliminaryDataToSupabase,
} from '../services/supabaseApi';
import { hapticLight, hapticSuccess } from '../utils/haptics';

export interface PartnerRegistrationWizardProps {
  onBack?: () => void;
  onComplete: (data: SalonRegistrationPayload, salonId: string) => void;
}

const BRAND_PALETTES = [
  { name: 'Emerald (Vagou)', primary: '#10B981', secondary: '#064E3B', accent: '#34D399' },
  { name: 'Âmbar Dourado', primary: '#F59E0B', secondary: '#78350F', accent: '#FCD34D' },
  { name: 'Ruby Elegance', primary: '#E11D48', secondary: '#4C0519', accent: '#FB7185' },
  { name: 'Safira Noturno', primary: '#3B82F6', secondary: '#1E3A8A', accent: '#93C5FD' },
  { name: 'Ônix Moderno', primary: '#20C933', secondary: '#18181B', accent: '#4ADE80' },
];

export const PartnerRegistrationWizard: React.FC<PartnerRegistrationWizardProps> = ({
  onBack,
  onComplete,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingStep1, setIsSavingStep1] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Armazena IDs criados preliminarmente na Etapa 1 para sincronização posterior
  const [registeredUserId, setRegisteredUserId] = useState<string | undefined>(undefined);
  const [registeredSalonId, setRegisteredSalonId] = useState<string | undefined>(undefined);

  // Accessible IDs for inputs
  const fantasyNameId = useId();
  const whatsappId = useId();
  const cepId = useId();
  const addressId = useId();
  const numberId = useId();
  const complementId = useId();
  const neighborhoodId = useId();
  const cityId = useId();
  const stateId = useId();
  const ownerNameId = useId();
  const cpfId = useId();
  const emailId = useId();
  const passwordId = useId();
  const confirmPasswordId = useId();
  const customColorId = useId();

  // Step 1: Estabelecimento
  const [fantasyName, setFantasyName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [cep, setCep] = useState('');
  const [address, setAddress] = useState('');
  const [number, setNumber] = useState('');
  const [complement, setComplement] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('SP');
  const [isLoadingCep, setIsLoadingCep] = useState(false);
  const [cepFeedback, setCepFeedback] = useState<string | null>(null);

  // Step 2: Responsável Legal
  const [ownerName, setOwnerName] = useState('');
  const [ownerCpf, setOwnerCpf] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [ownerPassword, setOwnerPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Step 3: Segmento & Identidade Visual
  const [segment, setSegment] = useState<'barbearia' | 'salao' | 'esmalteria' | 'estetica' | 'outros'>('barbearia');
  const [selectedPaletteIndex, setSelectedPaletteIndex] = useState(0);
  const [customPrimaryColor, setCustomPrimaryColor] = useState(BRAND_PALETTES[0].primary);
  const [slug, setSlug] = useState('');
  const [slugCustomized, setSlugCustomized] = useState(false);

  // Format Helpers
  const formatWhatsapp = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 2) return digits;
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  };

  const formatCpf = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
    if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
  };

  const formatCep = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 8);
    if (digits.length <= 5) return digits;
    return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  };

  const generateSlugFromName = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 30);
  };

  const handleFantasyNameChange = (val: string) => {
    setFantasyName(val);
    if (!slugCustomized) {
      setSlug(generateSlugFromName(val));
    }
  };

  const fetchCepData = async (rawCep: string) => {
    const clean = rawCep.replace(/\D/g, '');
    if (clean.length !== 8) return;

    setIsLoadingCep(true);
    setCepFeedback(null);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
      const data = await response.json();
      if (data.erro) {
        setCepFeedback('CEP não localizado. Preencha manualmente.');
      } else {
        setAddress(data.logradouro || '');
        setNeighborhood(data.bairro || '');
        setCity(data.localidade || '');
        setState(data.uf || 'SP');
        setCepFeedback('Endereço preenchido!');
        hapticLight();
      }
    } catch {
      setCepFeedback('Erro ao consultar CEP. Preencha os campos abaixo.');
    } finally {
      setIsLoadingCep(false);
    }
  };

  const handleCepChange = (val: string) => {
    const formatted = formatCep(val);
    setCep(formatted);
    const clean = formatted.replace(/\D/g, '');
    if (clean.length === 8) {
      fetchCepData(clean);
    }
  };

  // Password Requirements Checker
  const isLenValid = ownerPassword.length >= 8 && ownerPassword.length <= 10;
  const hasUpperCase = /[A-Z]/.test(ownerPassword);
  const hasSpecialChar = /[@$!%*?&#^()_+\-=\[\]{}|]/.test(ownerPassword);
  const isPasswordValid = isLenValid && hasUpperCase && hasSpecialChar;
  const doPasswordsMatch = ownerPassword.length > 0 && ownerPassword === confirmPassword;

  // Step Validation
  const validateStep1 = () => {
    if (!ownerName.trim()) {
      setErrorMessage('Informe o nome do responsável legal.');
      return false;
    }
    // CPF é opcional: se preenchido, valida os 11 dígitos
    const cleanCpf = ownerCpf.replace(/\D/g, '');
    if (cleanCpf.length > 0 && cleanCpf.length !== 11) {
      setErrorMessage('O CPF informado deve conter 11 dígitos (ou deixe em branco se preferir).');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(ownerEmail)) {
      setErrorMessage('Informe um e-mail de acesso válido.');
      return false;
    }
    if (!isPasswordValid) {
      setErrorMessage('A senha precisa cumprir todos os 3 requisitos de segurança.');
      return false;
    }
    if (!doPasswordsMatch) {
      setErrorMessage('A confirmação de senha não confere.');
      return false;
    }
    setErrorMessage(null);
    return true;
  };

  const validateStep2 = () => {
    if (!fantasyName.trim()) {
      setErrorMessage('Informe o Nome Fantasia do estabelecimento.');
      return false;
    }
    const cleanPhone = whatsapp.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setErrorMessage('Informe um WhatsApp comercial válido com DDD.');
      return false;
    }
    if (!address.trim() || !neighborhood.trim() || !city.trim()) {
      setErrorMessage('Preencha o endereço completo (Rua, Bairro e Cidade).');
      return false;
    }
    setErrorMessage(null);
    return true;
  };

  const handleNext = async () => {
    hapticLight();
    if (step === 1) {
      if (!validateStep1()) return;

      // Persistência Imediata dos Dados do Responsável no Supabase
      setIsSavingStep1(true);
      setErrorMessage(null);
      try {
        const res = await saveOwnerPreliminaryDataToSupabase(
          ownerName,
          ownerEmail,
          ownerPassword,
          ownerCpf
        );

        if (res.userId) {
          setRegisteredUserId(res.userId);
        }
        if (res.salonId) {
          setRegisteredSalonId(res.salonId);
        }

        hapticSuccess();
        setStep(2);
      } catch (err: any) {
        console.warn('[Partner Step 1 Save Warning]:', err);
        // Mesmo em oscilação de rede avança para não travar o parceiro
        setStep(2);
      } finally {
        setIsSavingStep1(false);
      }
    } else if (step === 2) {
      if (validateStep2()) setStep(3);
    }
  };

  const handleSubmit = async () => {
    if (!slug.trim()) {
      setErrorMessage('Defina o slug exclusivo para o link da sua empresa.');
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);
    hapticLight();

    const payload: SalonRegistrationPayload = {
      name: fantasyName.trim(),
      phoneWhatsapp: whatsapp.replace(/\D/g, ''),
      cep: cep.replace(/\D/g, ''),
      address: address.trim(),
      number: number.trim(),
      complement: complement.trim(),
      neighborhood: neighborhood.trim(),
      city: city.trim(),
      state: state.trim().toUpperCase(),
      ownerName: ownerName.trim(),
      ownerCpf: ownerCpf.replace(/\D/g, ''),
      ownerEmail: ownerEmail.trim().toLowerCase(),
      ownerPassword,
      segment,
      slug: slug.trim().toLowerCase(),
      branding: {
        primaryColor: customPrimaryColor,
        secondaryColor: BRAND_PALETTES[selectedPaletteIndex]?.secondary || '#0B0F17',
        backgroundColor: '#020617',
        accentColor: BRAND_PALETTES[selectedPaletteIndex]?.accent || '#34D399',
      },
      operatingModel: 'team',
    };

    try {
      // 1. Assegura criação de usuário no Supabase Auth caso ainda não criado
      let finalUserId = registeredUserId;
      if (!finalUserId) {
        const authRes = await signUpWithSupabase(payload.ownerEmail, payload.ownerPassword || 'Vagou@2026', {
          full_name: payload.ownerName,
          cpf: payload.ownerCpf || null,
          salon_name: payload.name,
          role: 'partner_owner',
        });
        if (authRes.user?.id) {
          finalUserId = authRes.user.id;
        }
      }

      // 2. Grava ou atualiza os dados completos na tabela `salons` do Supabase
      const result = await syncSalonDataToSupabase(payload, finalUserId, registeredSalonId);

      hapticSuccess();
      onComplete(payload, result.salonId);
    } catch (err: any) {
      console.error('[Partner Registration Error]:', err);
      setErrorMessage(err?.message || 'Erro ao processar cadastro no banco de dados. Verifique a conexão e tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-slate-950 text-slate-100 font-sans select-none">
      {/* Top Header */}
      <div className="flex-shrink-0 sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          {onBack && (
            <button
              onClick={onBack}
              className="p-1.5 -ml-1 text-slate-400 hover:text-white rounded-lg transition active:scale-95 cursor-pointer"
              title="Voltar"
              aria-label="Voltar"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div>
            <h1 className="text-sm font-black text-white tracking-tight flex items-center gap-1.5">
              <span>Cadastrar Estabelecimento</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-1.5 py-0.5 rounded border border-emerald-500/30">
                Parceiro
              </span>
            </h1>
            <p className="text-[11px] text-slate-400">
              Passo {step} de 3 — {step === 1 ? 'Responsável & Acesso' : step === 2 ? 'Dados do Estabelecimento' : 'Visual & Link'}
            </p>
          </div>
        </div>

        {/* Step Indicator Bullets */}
        <div className="flex items-center gap-1.5">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all ${
                s === step
                  ? 'w-6 bg-emerald-500'
                  : s < step
                  ? 'w-2.5 bg-emerald-600'
                  : 'w-2 bg-slate-800'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Main Scrollable Form Body */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-5">
        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2">
            <X className="w-4 h-4 text-rose-400 shrink-0" />
            <span className="flex-1">{errorMessage}</span>
          </div>
        )}

        {/* STEP 1: Responsável Legal & Acesso */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
              <User className="w-4 h-4" />
              <span>Dados do Responsável & Conta de Acesso</span>
            </div>

            {/* Nome Completo */}
            <div className="space-y-1">
              <label htmlFor={ownerNameId} className="text-xs font-bold text-slate-300">
                Nome Completo do Responsável <span className="text-emerald-400">*</span>
              </label>
              <input
                id={ownerNameId}
                type="text"
                placeholder="Ex: Carlos Eduardo da Silva"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm text-white placeholder-slate-500 outline-none transition"
              />
            </div>

            {/* CPF */}
            <div className="space-y-1">
              <label htmlFor={cpfId} className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>CPF do Responsável</span>
                </span>
                <span className="text-[10px] text-slate-500 font-normal">Opcional</span>
              </label>
              <input
                id={cpfId}
                type="text"
                placeholder="000.000.000-00 (opcional)"
                value={ownerCpf}
                onChange={(e) => setOwnerCpf(formatCpf(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm text-white placeholder-slate-500 outline-none transition font-mono"
              />
            </div>

            {/* E-mail de Acesso */}
            <div className="space-y-1">
              <label htmlFor={emailId} className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-emerald-400" />
                <span>E-mail de Acesso (Login) <span className="text-emerald-400">*</span></span>
              </label>
              <input
                id={emailId}
                type="email"
                placeholder="contato@seusalao.com.br"
                value={ownerEmail}
                onChange={(e) => setOwnerEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm text-white placeholder-slate-500 outline-none transition"
              />
            </div>

            {/* Senha Estrita */}
            <div className="space-y-1.5">
              <label htmlFor={passwordId} className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Senha de Acesso <span className="text-emerald-400">*</span></span>
                </span>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{showPassword ? 'Ocultar' : 'Exibir'}</span>
                </button>
              </label>
              <input
                id={passwordId}
                type={showPassword ? 'text' : 'password'}
                maxLength={10}
                placeholder="Senha de 8 a 10 dígitos"
                value={ownerPassword}
                onChange={(e) => setOwnerPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm text-white placeholder-slate-500 outline-none transition font-mono tracking-wider"
              />

              {/* Checklist de Validação Estrita */}
              <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800/80 space-y-1.5">
                <div className="flex items-center gap-2 text-[11px]">
                  {isLenValid ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  ) : (
                    <X className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                  )}
                  <span className={isLenValid ? 'text-emerald-300 font-medium' : 'text-slate-500'}>
                    8 a 10 caracteres ({ownerPassword.length}/10)
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[11px]">
                  {hasUpperCase ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  ) : (
                    <X className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                  )}
                  <span className={hasUpperCase ? 'text-emerald-300 font-medium' : 'text-slate-500'}>
                    Pelo menos 1 letra maiúscula (A-Z)
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[11px]">
                  {hasSpecialChar ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  ) : (
                    <X className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                  )}
                  <span className={hasSpecialChar ? 'text-emerald-300 font-medium' : 'text-slate-500'}>
                    Pelo menos 1 caractere especial (@, $, !, %, *, #)
                  </span>
                </div>
              </div>
            </div>

            {/* Confirmação de Senha */}
            <div className="space-y-1">
              <label htmlFor={confirmPasswordId} className="text-xs font-bold text-slate-300">
                Confirmar Senha <span className="text-emerald-400">*</span>
              </label>
              <input
                id={confirmPasswordId}
                type={showPassword ? 'text' : 'password'}
                maxLength={10}
                placeholder="Repita a senha"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm text-white placeholder-slate-500 outline-none transition font-mono tracking-wider"
              />
              {confirmPassword.length > 0 && (
                <span className={`text-[10px] block ${doPasswordsMatch ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {doPasswordsMatch ? '✓ As senhas coincidem' : '✗ As senhas não conferem'}
                </span>
              )}
            </div>
          </div>
        )}

        {/* STEP 2: Dados do Estabelecimento */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
              <Building2 className="w-4 h-4" />
              <span>Dados do Estabelecimento</span>
            </div>

            {/* Nome Fantasia */}
            <div className="space-y-1">
              <label htmlFor={fantasyNameId} className="text-xs font-bold text-slate-300">
                Nome Fantasia do Salão / Barbearia <span className="text-emerald-400">*</span>
              </label>
              <input
                id={fantasyNameId}
                type="text"
                placeholder="Ex: Barbearia Rota 99 ou Studio Belle"
                value={fantasyName}
                onChange={(e) => handleFantasyNameChange(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm text-white placeholder-slate-500 outline-none transition"
              />
            </div>

            {/* WhatsApp Comercial */}
            <div className="space-y-1">
              <label htmlFor={whatsappId} className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span>WhatsApp Comercial <span className="text-emerald-400">*</span></span>
              </label>
              <input
                id={whatsappId}
                type="tel"
                placeholder="(11) 98765-4321"
                value={whatsapp}
                onChange={(e) => setWhatsapp(formatWhatsapp(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm text-white placeholder-slate-500 outline-none transition font-mono"
              />
              <span className="text-[10px] text-slate-500">Usado para receber avisos e notificações de reservas</span>
            </div>

            {/* Busca por CEP */}
            <div className="space-y-1">
              <label htmlFor={cepId} className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  <span>CEP <span className="text-emerald-400">*</span></span>
                </span>
                {isLoadingCep && (
                  <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" /> Buscando endereço...
                  </span>
                )}
              </label>
              <div className="flex gap-2">
                <input
                  id={cepId}
                  type="text"
                  placeholder="00000-000"
                  value={cep}
                  onChange={(e) => handleCepChange(e.target.value)}
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm text-white placeholder-slate-500 outline-none transition font-mono"
                />
                <button
                  type="button"
                  onClick={() => fetchCepData(cep)}
                  disabled={isLoadingCep || cep.replace(/\D/g, '').length !== 8}
                  className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Buscar</span>
                </button>
              </div>
              {cepFeedback && (
                <span className="text-[10px] text-emerald-400 block">{cepFeedback}</span>
              )}
            </div>

            {/* Logradouro e Número */}
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2 space-y-1">
                <label htmlFor={addressId} className="text-xs font-bold text-slate-300">
                  Rua / Logradouro <span className="text-emerald-400">*</span>
                </label>
                <input
                  id={addressId}
                  type="text"
                  placeholder="Av. Paulista"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-emerald-500 text-sm text-white placeholder-slate-500 outline-none transition"
                />
              </div>
              <div className="space-y-1">
                <label htmlFor={numberId} className="text-xs font-bold text-slate-300">
                  Número
                </label>
                <input
                  id={numberId}
                  type="text"
                  placeholder="1000"
                  value={number}
                  onChange={(e) => setNumber(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-emerald-500 text-sm text-white placeholder-slate-500 outline-none transition font-mono"
                />
              </div>
            </div>

            {/* Complemento, Bairro e Cidade */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label htmlFor={complementId} className="text-xs font-bold text-slate-300">
                  Complemento
                </label>
                <input
                  id={complementId}
                  type="text"
                  placeholder="Sala 12, Bloco B"
                  value={complement}
                  onChange={(e) => setComplement(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-emerald-500 text-sm text-white placeholder-slate-500 outline-none transition"
                />
              </div>
              <div className="space-y-1">
                <label htmlFor={neighborhoodId} className="text-xs font-bold text-slate-300">
                  Bairro <span className="text-emerald-400">*</span>
                </label>
                <input
                  id={neighborhoodId}
                  type="text"
                  placeholder="Bela Vista"
                  value={neighborhood}
                  onChange={(e) => setNeighborhood(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-emerald-500 text-sm text-white placeholder-slate-500 outline-none transition"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2 space-y-1">
                <label htmlFor={cityId} className="text-xs font-bold text-slate-300">
                  Cidade <span className="text-emerald-400">*</span>
                </label>
                <input
                  id={cityId}
                  type="text"
                  placeholder="São Paulo"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-emerald-500 text-sm text-white placeholder-slate-500 outline-none transition"
                />
              </div>
              <div className="space-y-1">
                <label htmlFor={stateId} className="text-xs font-bold text-slate-300">
                  UF
                </label>
                <input
                  id={stateId}
                  type="text"
                  maxLength={2}
                  value={state}
                  onChange={(e) => setState(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-emerald-500 text-sm text-white text-center font-mono outline-none transition"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Segmento & Identidade Visual */}
        {step === 3 && (
          <div className="space-y-5">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
              <Palette className="w-4 h-4" />
              <span>Segmento & Identidade da Marca</span>
            </div>

            {/* Segmento */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 block">
                Segmento Principal <span className="text-emerald-400">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'barbearia', label: 'Barbearia', icon: Scissors },
                  { id: 'salao', label: 'Salão Feminino', icon: Sparkles },
                  { id: 'esmalteria', label: 'Esmalteria / Unhas', icon: Paintbrush },
                  { id: 'estetica', label: 'Estética & Spa', icon: Flower2 },
                  { id: 'outros', label: 'Outros Serviços', icon: Store },
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = segment === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setSegment(item.id as any);
                        hapticLight();
                      }}
                      className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition active:scale-95 cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-500/15 border-emerald-500 text-white'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isSelected ? 'text-emerald-400' : 'text-slate-500'}`} />
                      <span className="text-xs font-bold">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Paleta de Cores */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 block">
                Cor Primária do Aplicativo do Salão
              </label>
              <div className="flex flex-wrap gap-2">
                {BRAND_PALETTES.map((pal, idx) => (
                  <button
                    key={pal.name}
                    type="button"
                    onClick={() => {
                      setSelectedPaletteIndex(idx);
                      setCustomPrimaryColor(pal.primary);
                      hapticLight();
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition cursor-pointer ${
                      selectedPaletteIndex === idx
                        ? 'border-emerald-400 bg-slate-900 text-white shadow-sm'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-white/20"
                      style={{ backgroundColor: pal.primary }}
                    />
                    <span>{pal.name}</span>
                  </button>
                ))}
              </div>

              {/* Seletor Customizado Hex */}
              <div className="flex items-center gap-2.5 pt-1">
                <label
                  htmlFor={customColorId}
                  className="w-8 h-8 rounded-lg border border-slate-700 overflow-hidden cursor-pointer shrink-0 shadow-inner"
                  style={{ backgroundColor: customPrimaryColor }}
                  title="Clique para escolher outra cor"
                >
                  <input
                    id={customColorId}
                    type="color"
                    value={customPrimaryColor}
                    onChange={(e) => setCustomPrimaryColor(e.target.value)}
                    className="opacity-0 w-full h-full cursor-pointer"
                  />
                </label>
                <div className="flex-1">
                  <span className="text-[11px] text-slate-400 block">Cor Personalizada (Hex)</span>
                  <span className="text-xs font-mono font-bold text-white uppercase">{customPrimaryColor}</span>
                </div>
              </div>
            </div>

            {/* Slug e Subdomínio Cloudflare Exclusivo do App */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between">
                <label htmlFor="input-partner-slug" className="text-xs font-bold text-slate-300 block">
                  Subdomínio & Link Exclusivo do Estabelecimento <span className="text-emerald-400">*</span>
                </label>
                <span className="text-[9.5px] font-mono px-1.5 py-0.5 rounded-[4px] bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  Cloudflare Wildcard SSL
                </span>
              </div>

              <div className="flex items-center bg-slate-900 rounded-[4px] border border-slate-800 px-3 py-2 focus-within:border-emerald-500 transition">
                <input
                  id="input-partner-slug"
                  type="text"
                  value={slug}
                  onChange={(e) => {
                    setSlugCustomized(true);
                    setSlug(generateSlugFromName(e.target.value));
                  }}
                  placeholder="flavi"
                  className="w-28 bg-transparent text-xs text-white font-mono font-bold text-right outline-none pr-0.5"
                />
                <span className="text-xs font-mono text-[#20C933] font-bold select-none">.vagouapp.com</span>
              </div>
              <p className="text-[10px] text-slate-400">
                Seu subdomínio será ativado instantaneamente via Cloudflare para os clientes acessarem diretamente.
              </p>
            </div>

            {/* Cartão de Prévia da Marca & Endereço Web */}
            <div className="p-3.5 rounded-[4px] bg-slate-900/90 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">
                  Prévia da Identidade & URL Exclusiva
                </span>
                <span className="text-[9px] text-emerald-400 font-semibold bg-emerald-950/60 border border-emerald-500/20 px-1.5 py-0.5 rounded-[4px]">
                  ✓ Ativação Imediata
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-[4px] flex items-center justify-center font-black text-base text-white shadow-md shrink-0"
                  style={{ backgroundColor: customPrimaryColor }}
                >
                  {fantasyName ? fantasyName.charAt(0).toUpperCase() : 'F'}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-white truncate">{fantasyName || 'Flavi Hair • Studio'}</h4>
                  <p className="text-[11px] font-mono text-[#20C933] font-bold truncate">
                    https://{slug || 'flavi'}.vagouapp.com
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* FIXED STICKY ACTION FOOTER (Mandamento Vagou: sticky bottom-0 z-20) */}
      <div className="flex-shrink-0 sticky bottom-0 z-20 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 px-4 py-3 flex items-center justify-between gap-3">
        {step > 1 ? (
          <button
            type="button"
            onClick={() => {
              setStep((prev) => (prev - 1) as any);
              hapticLight();
            }}
            disabled={isSubmitting}
            className="px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Voltar</span>
          </button>
        ) : (
          <div className="text-[11px] text-slate-500">Etapa 1 de 3</div>
        )}

        {step < 3 ? (
          <button
            type="button"
            onClick={handleNext}
            disabled={isSavingStep1}
            className="flex-1 max-w-[200px] ml-auto py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 active:scale-95 text-white font-bold text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50 cursor-pointer"
          >
            {isSavingStep1 ? (
              <>
                <Loader2 className="w-3.5 h-3.5 text-white animate-spin" />
                <span>Salvando...</span>
              </>
            ) : (
              <>
                <span>Continuar</span>
                <ArrowRight className="w-3.5 h-3.5 text-white" />
              </>
            )}
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 max-w-[240px] ml-auto py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 active:scale-95 text-white font-bold text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 text-white animate-spin" />
                <span>Criando Conta...</span>
              </>
            ) : (
              <>
                <span>Finalizar Cadastro</span>
                <Check className="w-3.5 h-3.5 text-white" />
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};
export default PartnerRegistrationWizard;
