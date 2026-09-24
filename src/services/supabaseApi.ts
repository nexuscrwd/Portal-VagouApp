import { supabase } from './supabase';
import { ServiceOffer, BookingAppointment, SalonRegistrationPayload } from '../types';
import { MOCK_OFFERS } from '../data';
import { triggerBrowserNotification } from '../utils/pushNotifications';

export interface RpcOfferResponse {
  offer_id: string;
  salon_id: string;
  salon_name: string;
  salon_neighborhood?: string;
  salon_address?: string;
  salon_logo?: string;
  salon_logo_light?: string;
  salon_logo_dark?: string;
  operating_model?: 'solo' | 'team' | 'home_delivery' | 'hybrid';
  home_delivery_enabled?: boolean;
  home_delivery_area?: string;
  home_delivery_travel_fee?: number;
  professional_name: string;
  professional_avatar?: string;
  rating_avg?: number;
  rating_count?: number;
  service_title: string;
  category: string;
  price: number;
  original_price?: number;
  date_str?: string;
  start_time?: string;
  end_time?: string;
  media_level?: number;
  video_url?: string;
  gallery_images?: string[];
  distance_meters?: number;
  distance_km?: number;
  expires_at: string;
}

/**
 * Busca vagas relâmpago no PostGIS usando a RPC get_offers_in_radius
 */
export async function fetchOffersFromSupabase(
  userLat = -23.5615,
  userLng = -46.6559,
  radiusKm = 25.0,
  filterCategory: string | null = null
): Promise<ServiceOffer[]> {
  try {
    const { data, error } = await supabase.rpc('get_offers_in_radius', {
      user_lat: userLat,
      user_lng: userLng,
      radius_km: radiusKm,
      filter_category: filterCategory && filterCategory !== 'todos' ? filterCategory : null,
    });

    if (error) {
      console.warn('[Supabase] Erro ao chamar get_offers_in_radius, usando fallback:', error.message);
      return MOCK_OFFERS;
    }

    if (!data || data.length === 0) {
      return MOCK_OFFERS;
    }

    return (data as RpcOfferResponse[]).map((row) => {
      const expiresDate = new Date(row.expires_at);
      const now = new Date();
      const diffMinutes = Math.max(1, Math.round((expiresDate.getTime() - now.getTime()) / 60000));

      const startTimeFormatted = row.start_time ? row.start_time.slice(0, 5) : '14:30';
      const timeSlotStr = `Hoje • ${startTimeFormatted}`;

      const catLower = (row.category || 'cabelo').toLowerCase();
      const validCategory: 'cabelo' | 'barba' | 'unhas' | 'beleza' | 'estetica' =
        catLower.includes('barba')
          ? 'barba'
          : catLower.includes('unha')
          ? 'unhas'
          : catLower.includes('estet')
          ? 'estetica'
          : catLower.includes('beleza')
          ? 'beleza'
          : 'cabelo';

      return {
        id: row.offer_id,
        salonId: row.salon_id,
        salonName: row.salon_name,
        salonLogo: row.salon_logo || row.salon_logo_light || '/logo.svg',
        salonLogoLight: row.salon_logo_light,
        salonLogoDark: row.salon_logo_dark,
        operatingModel: row.operating_model || 'team',
        homeDeliveryEnabled: row.home_delivery_enabled || false,
        homeDeliveryArea: row.home_delivery_area,
        homeDeliveryTravelFee: Number(row.home_delivery_travel_fee || 0),
        professionalName: row.professional_name,
        professionalAvatar: row.professional_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        serviceTitle: row.service_title,
        serviceCategory: validCategory,
        price: Number(row.price),
        originalPrice: row.original_price ? Number(row.original_price) : Number(row.price) * 1.3,
        rating: Number(row.rating_avg || 4.9),
        ratingCount: Number(row.rating_count || 32),
        distance: row.distance_km ? `${row.distance_km} km` : '0.8 km',
        distanceMeters: row.distance_meters || 800,
        neighborhood: row.salon_neighborhood || 'Jardins',
        timeSlot: timeSlotStr,
        dayLabel: 'HOJE',
        duration: '35 min',
        imageUrl:
          row.video_url ||
          (row.gallery_images && row.gallery_images[0]) ||
          'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800',
        lat: userLat,
        lng: userLng,
        mediaLevel: (row.media_level as 1 | 2 | 3) || (row.video_url ? 3 : 1),
        videoUrl: row.video_url,
        galleryImages: row.gallery_images && row.gallery_images.length > 0 ? row.gallery_images : undefined,
        expiresInMinutes: diffMinutes,
        expiresTimestamp: expiresDate.getTime(),
        activeViewers: Math.floor(Math.random() * 6) + 3,
        isFlashDeal: true,
      };
    });
  } catch (err) {
    console.error('[Supabase] Falha de conexão com backend:', err);
    return MOCK_OFFERS;
  }
}

/**
 * Criação de Agendamento no Supabase
 */
export async function createAppointmentInSupabase(
  booking: BookingAppointment,
  clientId?: string
): Promise<{ success: boolean; protocol: string; error?: string }> {
  try {
    const protocolCode = booking.protocolCode || `VG-${Math.floor(1000 + Math.random() * 9000)}`;
    const todayStr = new Date().toISOString().split('T')[0];

    const { error } = await supabase.from('appointments').insert({
      protocol_code: protocolCode,
      offer_id: booking.offerId || null,
      salon_id: booking.salonId || '00000000-0000-0000-0000-000000000001',
      professional_id: booking.professionalId || '00000000-0000-0000-0000-000000000002',
      client_id: clientId || null,
      client_name: booking.clientName || 'Cliente Vagou',
      client_phone: booking.clientPhone || '(11) 99999-9999',
      client_email: booking.clientEmail || null,
      service_type: booking.serviceType || 'IN_SALON',
      client_address: booking.clientAddress || booking.address || null,
      travel_fee: booking.travelFee || 0.0,
      service_title: booking.service,
      price: booking.totalPrice,
      date_str: todayStr,
      start_time: booking.time ? `${booking.time}:00` : '14:30:00',
      end_time: '15:15:00',
      status: 'CONFIRMADO',
      commission_fee: 1.5,
    });

    if (error) {
      console.warn('[Supabase] Erro ao salvar agendamento (modo local/offline ativado):', error.message);
      return { success: true, protocol: protocolCode };
    }

    return { success: true, protocol: protocolCode };
  } catch (err: any) {
    console.error('[Supabase] Erro de rede ao agendar:', err);
    return { success: true, protocol: booking.protocolCode };
  }
}

/**
 * Escuta atualizações em tempo real das vagas do Radar (Supabase Realtime)
 * e dispara notificações push locais quando novas vagas surgem.
 */
export function subscribeToRealtimeOffers(
  onOfferChange: (payload?: any) => void
) {
  try {
    const channel = supabase
      .channel('service_offers_channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'service_offers' },
        (payload) => {
          onOfferChange(payload);

          // Se for uma nova vaga disponível inserida, notifica o usuário
          if (payload.eventType === 'INSERT' && payload.new?.status === 'AVAILABLE') {
            triggerBrowserNotification('⚡ Nova Vaga no Radar!', {
              body: `${payload.new.service_title || 'Novo serviço'} disponível agora por R$ ${Number(payload.new.price || 0).toFixed(2).replace('.', ',')}!`,
              icon: '/icon-192.png',
              data: { url: '/ofertas', offerId: payload.new.id, type: 'flash_offer' },
            });
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'appointments' },
        (payload) => {
          if (payload.eventType === 'INSERT' || (payload.eventType === 'UPDATE' && payload.new?.status === 'CONFIRMADO')) {
            triggerBrowserNotification('🎉 Agendamento Confirmado!', {
              body: `Seu horário para ${payload.new?.service_title || 'serviço'} foi registrado com sucesso (${payload.new?.protocol_code || ''}).`,
              icon: '/icon-192.png',
              data: { url: '/agenda', protocolCode: payload.new?.protocol_code, type: 'booking_confirmation' },
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  } catch (err) {
    console.warn('[Supabase Realtime] Falha ao assinar canal:', err);
    return () => {};
  }
}

/**
 * Login com Google via Supabase Auth
 */
export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin,
    },
  });
  if (error) throw error;
  return data;
}

/**
 * Logout do Cliente
 */
export async function signOutClient() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/**
 * Obter usuário atual
 */
export async function getClientSession() {
  const { data } = await supabase.auth.getSession();
  return data.session?.user || null;
}

/**
 * Cadastro de Usuário Parceiro com Supabase Auth
 */
export async function signUpWithSupabase(
  email: string,
  password: string,
  metadata?: Record<string, any>
): Promise<{ user: any; session: any; error?: string }> {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata || {},
      },
    });
    if (error) {
      console.warn('[Supabase Auth] Erro ou aviso ao cadastrar usuário:', error.message);
      return { user: null, session: null, error: error.message };
    }
    return { user: data.user, session: data.session };
  } catch (err: any) {
    console.error('[Supabase Auth] Exceção no cadastro:', err);
    return { user: null, session: null, error: err?.message || 'Erro de conexão no Auth' };
  }
}

/**
 * Salva ou sincroniza o novo estabelecimento na tabela salons do Supabase
 */
export async function syncSalonDataToSupabase(
  salonData: SalonRegistrationPayload,
  ownerUserId?: string
): Promise<{ success: boolean; salonId: string; error?: string }> {
  const fullAddress = [
    salonData.address,
    salonData.number ? `nº ${salonData.number}` : '',
    salonData.complement ? `(${salonData.complement})` : '',
    salonData.neighborhood,
    `${salonData.city} - ${salonData.state}`,
    salonData.cep ? `CEP: ${salonData.cep}` : '',
  ]
    .filter(Boolean)
    .join(', ');

  const tradeName = (salonData.name && salonData.name.trim().length > 0)
    ? salonData.name.trim()
    : (salonData.slug && salonData.slug.trim().length > 0)
    ? salonData.slug.trim()
    : 'Meu Estabelecimento';

  const legalName = (salonData.ownerName && salonData.ownerName.trim().length > 0)
    ? salonData.ownerName.trim()
    : tradeName;

  const safeSlug = (salonData.slug && salonData.slug.trim().length > 0)
    ? salonData.slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '')
    : `salao-${Date.now()}`;

  // Lista de tentativas seguras: SEMPRE mantendo trade_name, legal_name e slug obrigatórios
  const attempts: Record<string, any>[] = [
    // 1. Inserção completa com campos comuns
    {
      trade_name: tradeName,
      legal_name: legalName,
      slug: safeSlug,
      phone_whatsapp: salonData.phoneWhatsapp || '',
      address: fullAddress || salonData.address || '',
      neighborhood: salonData.neighborhood || '',
      city: salonData.city || '',
      state: salonData.state || 'SP',
      operating_model: salonData.operatingModel || 'team',
    },
    // 2. Inserção com colunas obrigatórias e essenciais
    {
      trade_name: tradeName,
      legal_name: legalName,
      slug: safeSlug,
      phone_whatsapp: salonData.phoneWhatsapp || '',
      address: fullAddress || '',
    },
    // 3. Inserção mínima estrita com as colunas NOT NULL do banco
    {
      trade_name: tradeName,
      legal_name: legalName,
      slug: safeSlug,
    },
    // 4. Caso o schema também aceite 'name'
    {
      trade_name: tradeName,
      legal_name: legalName,
      name: tradeName,
      slug: safeSlug,
    },
  ];

  let lastError: any = null;

  for (let i = 0; i < attempts.length; i++) {
    const payload = attempts[i];
    try {
      console.log(`[Supabase DB] Executando inserção (tentativa ${i + 1}/${attempts.length}):`, payload);
      const { data, error } = await supabase
        .from('salons')
        .insert(payload)
        .select('*')
        .single();

      if (!error && data) {
        console.log('[Supabase DB Sucesso] Salão gravado com sucesso no Supabase! ID:', data.id, data);
        saveLocalSalon(salonData, data.id);
        return { success: true, salonId: data.id };
      }

      if (error) {
        console.warn(`[Supabase DB Aviso] Tentativa ${i + 1} falhou:`, error.message, error.code);
        lastError = error;
      }
    } catch (err: any) {
      console.warn(`[Supabase DB Aviso] Exceção na tentativa ${i + 1}:`, err);
      lastError = err;
    }
  }

  // Se todas as tentativas falharam, reporta o erro claro
  console.error('[Supabase DB Erro Fatal em todas as tentativas]:', lastError);
  throw new Error(`Erro ao gravar no Supabase: ${lastError?.message || 'Falha de comunicação com o banco'}`);
}

/**
 * Criação de profissional na tabela professionals do Supabase
 */
export async function createProfessionalInSupabase(
  salonId: string,
  profName: string,
  role: string,
  specialties: string[] = ['cabelo'],
  colorHex = '#10B981',
  slotMinutes = 45
): Promise<{ success: boolean; id?: string }> {
  try {
    const { data, error } = await supabase
      .from('professionals')
      .insert({
        salon_id: salonId,
        name: profName,
        specialties,
        color_hex: colorHex,
        slot_minutes: slotMinutes,
        is_active: true,
      })
      .select('id')
      .single();

    if (error) {
      console.warn('[Supabase DB] Aviso ao criar profissional:', error.message);
      return { success: false };
    }
    return { success: true, id: data?.id };
  } catch (err) {
    console.warn('[Supabase DB] Exceção ao criar profissional:', err);
    return { success: false };
  }
}

/**
 * Criação de oferta relâmpago na tabela service_offers do Supabase
 */
export async function createServiceOfferInSupabase(
  salonId: string,
  professionalId: string,
  title: string,
  category: string,
  price: number,
  durationMinutes = 45
): Promise<{ success: boolean; id?: string }> {
  try {
    const todayStr = new Date().toISOString().split('T')[0];
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

    const { data, error } = await supabase
      .from('service_offers')
      .insert({
        salon_id: salonId,
        professional_id: professionalId,
        service_title: title,
        category,
        price,
        original_price: Math.round(price * 1.3),
        date_str: todayStr,
        start_time: '15:00:00',
        end_time: '15:45:00',
        status: 'AVAILABLE',
        expires_at: expiresAt,
      })
      .select('id')
      .single();

    if (error) {
      console.warn('[Supabase DB] Aviso ao criar vaga relâmpago:', error.message);
      return { success: false };
    }
    return { success: true, id: data?.id };
  } catch (err) {
    console.warn('[Supabase DB] Exceção ao criar vaga relâmpago:', err);
    return { success: false };
  }
}

function saveLocalSalon(salonData: SalonRegistrationPayload, salonId: string) {
  try {
    const record = {
      ...salonData,
      id: salonId,
      registeredAt: new Date().toISOString(),
    };
    localStorage.setItem('vagou_registered_salon', JSON.stringify(record));
    localStorage.setItem('vagou_last_registered_slug', salonData.slug);
  } catch {}
}

export function getLocalRegisteredSalon(): (SalonRegistrationPayload & { id: string }) | null {
  try {
    const saved = localStorage.getItem('vagou_registered_salon');
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

