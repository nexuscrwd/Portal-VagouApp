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
  | 'perfil';

export interface SalonProfessional {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  rating?: number;
}

export interface ServiceOffer {
  id: string;
  salonId?: string;
  salonSlug?: string;
  customDomain?: string;
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
  isDependent?: boolean;
  dependentId?: string;
  dependentName?: string;
  status: 'EM ANDAMENTO' | 'CONFIRMADO' | 'AGENDADO' | 'CONCLUÍDO' | 'CANCELADO';
  address: string;
  qrCodeMock?: string;
}

export type FamilyAutonomyLevel = 'parent_controlled' | 'teen_assisted' | 'emancipated';

export interface FamilyMemberProfile {
  id: string;
  guardianClientId?: string;
  name: string;
  relationship: 'titular' | 'filho_kids' | 'filho_teen' | 'esposa' | 'esposo' | 'pais' | 'outro';
  birthDate?: string;
  targetSegment: 'kids' | 'feminino' | 'masculino' | 'todos';
  avatarUrl?: string;
  avatarEmoji?: string;
  notes?: string;
  autonomyLevel?: FamilyAutonomyLevel;
  phone?: string;
  email?: string;
  emancipatedUserId?: string;
  isKids?: boolean;
  createdAt?: string;
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

