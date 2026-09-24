export type ScreenId =
  | 'home'
  | 'busca'
  | 'mapa'
  | 'lista-ofertas'
  | 'ofertas'
  | 'detalhe-oferta'
  | 'detalhe'
  | 'confirmacao'
  | 'agenda'
  | 'favoritos'
  | 'perfil'
  | 'cadastro-empresa';

export type PartnerScreenId =
  | 'partner-agenda'
  | 'partner-publish'
  | 'partner-schedule-config'
  | 'partner-config'
  | 'partner-profile';

export type AppMode = 'client' | 'partner';

export interface TimeBreak {
  id: string;
  label: string;
  start: string; // e.g. "12:00"
  end: string;   // e.g. "13:00"
}

export interface DayScheduleConfig {
  dayOfWeek: number; // 0 = Domingo, 1 = Segunda ... 6 = Sábado
  dayName: string;
  active: boolean;
  openTime: string; // "09:00"
  closeTime: string; // "19:00"
  breaks: TimeBreak[];
}

export interface PartnerProfessional {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  phone?: string;
  specialties: string[];
  color: string;
  slotDurationMinutes: number;
  useCustomSchedule: boolean;
  schedule: DayScheduleConfig[];
}

export interface PartnerAppointmentItem {
  id: string;
  protocolCode: string;
  professionalId: string;
  professionalName: string;
  clientName: string;
  clientPhone: string;
  serviceTitle: string;
  serviceCategory: 'cabelo' | 'barba' | 'unhas' | 'beleza' | 'estetica';
  price: number;
  dateStr: string; // "2026-08-29"
  startTime: string; // "14:30"
  endTime: string;   // "15:15"
  status: 'CONFIRMADO' | 'EM_ATENDIMENTO' | 'CONCLUIDO' | 'CANCELADO' | 'NO_SHOW' | 'VAGA_PUBLICADA' | 'HORARIO_LIVRE';
  notes?: string;
}

export interface ServiceOffer {
  id: string;
  salonId?: string;
  professionalId?: string;
  serviceId?: string;
  salonName: string;
  salonLogo?: string;
  salonLogoLight?: string;
  salonLogoDark?: string;
  professionalName: string;
  professionalAvatar?: string;
  serviceTitle: string;
  serviceCategory: 'cabelo' | 'barba' | 'unhas' | 'beleza' | 'estetica';
  price: number;
  originalPrice?: number;
  rating: number;
  ratingCount: number;
  distance: string;
  distanceMeters?: number;
  neighborhood: string;
  timeSlot: string;
  dayLabel: string;
  duration: string;
  imageUrl: string;
  lat: number;
  lng: number;
  featured?: boolean;

  // Operating Model & Condomínio / Domicílio
  operatingModel?: 'solo' | 'team' | 'home_delivery' | 'hybrid';
  homeDeliveryEnabled?: boolean;
  homeDeliveryArea?: string;
  homeDeliveryTravelFee?: number;

  // Radar de Vagas - Extensões
  mediaLevel?: 1 | 2 | 3; // 1 = Fallback animado, 2 = Carrossel de fotos, 3 = Vídeo vertical
  videoUrl?: string;
  galleryImages?: string[];
  expiresInMinutes?: number;
  expiresTimestamp?: number;
  activeViewers?: number;
  isFlashDeal?: boolean;
  isRecurring?: boolean;
  recurringCount?: number;
  brandColor?: string;
  brandGradient?: string;
  categoryIconKey?: 'cabelo' | 'barba' | 'unhas' | 'sobrancelha' | 'estetica' | 'beleza';
  description?: string;
}

export interface BookingAppointment {
  id?: string;
  protocolCode: string;
  offerId?: string;
  salonId?: string;
  professionalId?: string;
  clientId?: string;
  service: string;
  professional: string;
  salonName: string;
  dateTime: string;
  dayGroup: string;
  time: string;
  totalPrice: number;
  serviceType?: 'IN_SALON' | 'HOME_DELIVERY';
  travelFee?: number;
  clientAddress?: string;
  clientName?: string;
  clientPhone?: string;
  clientEmail?: string;
  status: 'EM ANDAMENTO' | 'CONFIRMADO' | 'AGENDADO' | 'CONCLUÍDO' | 'CANCELADO';
  address: string;
  qrCodeMock?: string;
}

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  thumbnailLink?: string;
  webViewLink?: string;
  webContentLink?: string;
  iconLink?: string;
  size?: string;
  modifiedTime?: string;
  category: 'image' | 'video' | 'figma' | 'folder' | 'document' | 'other';
  hasThumbnail?: boolean;
}

export interface DriveFolderBreadcrumb {
  id: string;
  name: string;
}

export interface ScreenAnalysis {
  screenName: string;
  primaryPurpose: string;
  hierarchy: string[];
  designTokens: {
    colors: { name: string; hex: string; usage: string }[];
    typography: { role: string; size: string; weight: string }[];
    spacing: string[];
  };
  components: {
    name: string;
    description: string;
    suggestedTailwind: string;
  }[];
  userFlowStep: string;
  recommendations: string[];
}

export interface SalonBranding {
  logoUrl?: string;
  primaryColor: string;
  secondaryColor?: string;
  backgroundColor?: string;
  accentColor?: string;
}

export interface SalonRegistrationPayload {
  name: string;
  phoneWhatsapp: string;
  cep: string;
  address: string;
  number?: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  latitude?: number;
  longitude?: number;
  ownerName: string;
  ownerCpf: string;
  ownerEmail: string;
  ownerPassword?: string;
  segment: 'barbearia' | 'salao' | 'esmalteria' | 'estetica' | 'outros';
  branding: SalonBranding;
  slug: string;
  operatingModel?: 'team' | 'solo' | 'home_delivery' | 'hybrid';
}

export interface PartnerOnboardingInitialService {
  title: string;
  category: 'cabelo' | 'barba' | 'unhas' | 'beleza' | 'estetica';
  price: number;
  durationMinutes: number;
}

export interface PartnerOnboardingData {
  operatingModel: 'team' | 'solo' | 'home_delivery' | 'hybrid';
  logoUrl?: string;
  primaryProfessionalName?: string;
  primaryProfessionalRole?: string;
  primaryProfessionalSlotMinutes?: number;
  services: PartnerOnboardingInitialService[];
}
