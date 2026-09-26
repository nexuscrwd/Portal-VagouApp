export type AdminScreenId =
  | 'dashboard'
  | 'salons'
  | 'appointments'
  | 'moderation'
  | 'settings';

export type SalonFilterStatus = 'all' | 'active' | 'pending' | 'incomplete' | 'suspended';

export type SalonSegmentFilter = 'all' | 'barbearia' | 'salao' | 'estetica';

export interface AdminSalonItem {
  id: string;
  trade_name: string;
  legal_name?: string;
  slug: string;
  category: 'barbearia' | 'salao' | 'estetica' | 'outro';
  status: 'active' | 'pending' | 'incomplete' | 'suspended';
  is_verified?: boolean;
  phone_whatsapp?: string;
  email?: string;
  document_number?: string;
  address?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  cep?: string;
  logo_url?: string;
  primary_color?: string;
  created_at?: string;
  professionals_count?: number;
  active_offers_count?: number;
  rating?: number;
}

export interface AdminDashboardMetrics {
  totalSalons: number;
  activeSalons: number;
  pendingSalons: number;
  incompleteSalons: number;
  suspendedSalons: number;
  todayAppointments: number;
  activeFlashOffers: number;
  growthPercent: number;
}
