import React, { useState, useEffect, useMemo } from 'react';
import {
  ScreenId,
  ServiceOffer,
  BookingAppointment,
  FamilyMemberProfile,
} from './types';
import { MOCK_OFFERS } from './data';
import { HomeScreen } from './components/HomeScreen';
import { PinterestExploreScreen } from './components/PinterestExploreScreen';
import { MapScreen } from './components/MapScreen';
import { OfferListScreen } from './components/OfferListScreen';
import { OfferDetailScreen } from './components/OfferDetailScreen';
import { ConfirmationScreen } from './components/ConfirmationScreen';
import { AgendaScreen } from './components/AgendaScreen';
import { FavoritesScreen } from './components/FavoritesScreen';
import { ProfileScreen } from './components/ProfileScreen';
import { BottomNav, SalonNavContext } from './components/BottomNav';
import { SearchModal } from './components/SearchModal';
import { ProfileDrawer } from './components/ProfileDrawer';
import { VagouAuthModal } from './components/VagouAuthModal';
import { InterestOnboardingModal } from './components/InterestOnboardingModal';
import { AddFamilyMemberModal } from './components/AddFamilyMemberModal';
import { InstallModal } from './components/InstallModal';
import { SplashScreen } from './components/SplashScreen';
import { scheduleAppointmentReminder } from './utils/notifications';
import { formatSlotDateTime } from './utils/dateFormatter';
import { useTheme } from './context/ThemeContext';
import { hapticSuccess } from './utils/haptics';
import {
  fetchOffersFromSupabase,
  fetchAppointmentsFromSupabase,
  createAppointmentInSupabase,
  subscribeToRealtimeOffers,
  signOutClient,
  fetchFamilyMembersFromSupabase,
  saveFamilyMemberToSupabase,
  deleteFamilyMemberFromSupabase,
  fetchUserProfileFromDb,
} from './services/supabaseApi';
import {
  getDeviceCoordinates,
  UserCoordinates,
} from './utils/geolocation';
import { subscribeToWebPush } from './utils/pushNotifications';

export const App: React.FC = () => {
  const { isDark } = useTheme();
  // Client Navigation State
  const [currentScreen, setCurrentScreen] = useState<ScreenId>('home');
  const [salonNavContext, setSalonNavContext] = useState<SalonNavContext | null>(null);
  const [offers, setOffers] = useState<ServiceOffer[]>([]);
  const [selectedOffer, setSelectedOffer] = useState<ServiceOffer | null>(null);
  const [bookings, setBookings] = useState<BookingAppointment[]>([]);
  const [lastBooking, setLastBooking] = useState<BookingAppointment | null>(null);
  const [userCoords, setUserCoords] = useState<UserCoordinates | null>(null);
  const [isGpsLoading, setIsGpsLoading] = useState<boolean>(true);

  // Profile Drawer & Netflix Profile Segment & Search Modal
  const [isProfileDrawerOpen, setIsProfileDrawerOpen] = useState<boolean>(false);
  const [isInterestModalOpen, setIsInterestModalOpen] = useState<boolean>(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authPendingOffer, setAuthPendingOffer] = useState<ServiceOffer | null>(null);

  // Estado de Autenticação do Usuário (Visitante por Padrão em Produção)
  const [currentUser, setCurrentUser] = useState<any>(() => {
    try {
      const saved = localStorage.getItem('vagou_current_user');
      if (saved) return JSON.parse(saved);
      return null;
    } catch {
      return null;
    }
  });

  const handleLogout = async () => {
    try {
      localStorage.setItem('vagou_logged_out', 'true');
      localStorage.removeItem('vagou_current_user');
      localStorage.removeItem('vagou_private_user_profile');
      localStorage.removeItem('vagou_user_name');
      localStorage.removeItem('vagou_user_email');
      localStorage.removeItem('vagou_user_phone');
      localStorage.removeItem('vagou_user_avatar');
      sessionStorage.removeItem('vagou_user_name');
      sessionStorage.removeItem('vagou_user_email');
      sessionStorage.removeItem('vagou_user_phone');
      sessionStorage.removeItem('vagou_user_avatar');
      await signOutClient();
    } catch (err) {
      console.warn('Erro ao sair:', err);
    }
    setCurrentUser(null);
  };

  const handleLoginSuccess = (user: any) => {
    setCurrentUser(user);
    try {
      localStorage.removeItem('vagou_logged_out');
      localStorage.setItem('vagou_current_user', JSON.stringify(user));
      const fullName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Cliente Vagou';
      const email = user.email || '';
      const phone = user.user_metadata?.phone || '';
      const avatarUrl = user.user_metadata?.avatar_url || '';

      sessionStorage.setItem('vagou_user_name', fullName);
      sessionStorage.setItem('vagou_user_email', email);
      sessionStorage.setItem('vagou_user_phone', phone);
      if (avatarUrl) sessionStorage.setItem('vagou_user_avatar', avatarUrl);
      localStorage.setItem('vagou_user_name', fullName);
      localStorage.setItem('vagou_user_email', email);
      localStorage.setItem('vagou_user_phone', phone);
      if (avatarUrl) localStorage.setItem('vagou_user_avatar', avatarUrl);

      localStorage.setItem('vagou_private_user_profile', JSON.stringify({
        fullName,
        email,
        phone,
        address: 'São Paulo, SP',
        avatarUrl: avatarUrl || undefined,
      }));

      // Sincroniza dados com o Supabase
      fetchUserProfileFromDb({
        userId: user.id,
        email,
        phone,
        name: fullName,
      });
    } catch {}
  };

  // --- Vagou Family: Sub-perfis / Dependentes (Modelo Netflix / Uber Family) ---
  const [familyProfiles, setFamilyProfiles] = useState<FamilyMemberProfile[]>(() => {
    try {
      const saved = localStorage.getItem('vagou_family_profiles');
      if (saved) return JSON.parse(saved);
      // Perfis de demonstração padrão (Filho Kids + Esposa)
      return [
        {
          id: 'fam-enzo-kids',
          name: 'Enzo Silva',
          relationship: 'filho_kids',
          birthDate: '2018-05-14',
          targetSegment: 'kids',
          isKids: true,
          notes: 'Corte tesoura nas laterais com risquinho. Não usar máquina na nuca.',
          autonomyLevel: 'parent_controlled',
          avatarUrl: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=150&q=80',
        },
        {
          id: 'fam-mariana-esposa',
          name: 'Mariana Silva',
          relationship: 'esposa',
          birthDate: '1992-11-20',
          targetSegment: 'feminino',
          isKids: false,
          notes: 'Unhas em gel e cronograma capilar.',
          autonomyLevel: 'parent_controlled',
          avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
        },
      ];
    } catch {
      return [];
    }
  });

  const [activeFamilyProfileId, setActiveFamilyProfileId] = useState<string>(() => {
    try {
      return localStorage.getItem('vagou_active_family_profile_id') || 'titular';
    } catch {
      return 'titular';
    }
  });

  const [isAddFamilyModalOpen, setIsAddFamilyModalOpen] = useState(false);
  const [editingFamilyMember, setEditingFamilyMember] = useState<FamilyMemberProfile | null>(null);

  // Sincroniza dependentes do Supabase quando o usuário estiver logado
  useEffect(() => {
    if (currentUser?.id) {
      fetchFamilyMembersFromSupabase(currentUser.id).then((members) => {
        if (members && members.length > 0) {
          setFamilyProfiles(members);
          try {
            localStorage.setItem('vagou_family_profiles', JSON.stringify(members));
          } catch {}
        }
      });
    }
  }, [currentUser?.id]);

  const activeFamilyProfile = useMemo(() => {
    if (activeFamilyProfileId === 'titular') return null;
    return familyProfiles.find((f) => f.id === activeFamilyProfileId) || null;
  }, [activeFamilyProfileId, familyProfiles]);

  const handleSelectFamilyProfile = (id: string) => {
    setActiveFamilyProfileId(id);
    try {
      localStorage.setItem('vagou_active_family_profile_id', id);
    } catch {}
  };

  const handleAddOrUpdateFamilyMember = (memberData: Omit<FamilyMemberProfile, 'id'>) => {
    if (editingFamilyMember) {
      // Atualização
      const updatedMember: FamilyMemberProfile = {
        ...editingFamilyMember,
        ...memberData,
      };
      const updated = familyProfiles.map((m) => (m.id === editingFamilyMember.id ? updatedMember : m));
      setFamilyProfiles(updated);
      try {
        localStorage.setItem('vagou_family_profiles', JSON.stringify(updated));
      } catch {}

      if (currentUser?.id) {
        saveFamilyMemberToSupabase(updatedMember, currentUser.id).catch((err) => {
          console.warn('Erro ao atualizar membro no Supabase:', err);
        });
      }
      setEditingFamilyMember(null);
    } else {
      // Novo cadastro
      const newMember: FamilyMemberProfile = {
        ...memberData,
        id: `fam-${Date.now()}`,
      };
      const updated = [...familyProfiles, newMember];
      setFamilyProfiles(updated);
      setActiveFamilyProfileId(newMember.id);
      try {
        localStorage.setItem('vagou_family_profiles', JSON.stringify(updated));
        localStorage.setItem('vagou_active_family_profile_id', newMember.id);
      } catch {}

      if (currentUser?.id) {
        saveFamilyMemberToSupabase(newMember, currentUser.id).then((res) => {
          if (res.data?.id) {
            // Atualiza com o UUID oficial do Supabase
            setFamilyProfiles((prev) => prev.map((m) => (m.id === newMember.id ? { ...m, id: res.data!.id } : m)));
            setActiveFamilyProfileId(res.data.id);
          }
        }).catch((err) => {
          console.warn('Erro ao salvar novo membro no Supabase:', err);
        });
      }
    }
  };

  const handleEditFamilyMember = (member: FamilyMemberProfile) => {
    setEditingFamilyMember(member);
    setIsAddFamilyModalOpen(true);
  };

  const handleDeleteFamilyMember = (memberId: string) => {
    const updated = familyProfiles.filter((m) => m.id !== memberId);
    setFamilyProfiles(updated);
    if (activeFamilyProfileId === memberId) {
      setActiveFamilyProfileId('titular');
      try {
        localStorage.setItem('vagou_active_family_profile_id', 'titular');
      } catch {}
    }
    try {
      localStorage.setItem('vagou_family_profiles', JSON.stringify(updated));
    } catch {}

    if (currentUser?.id && !memberId.startsWith('fam-demo-') && !memberId.startsWith('fam-enzo-') && !memberId.startsWith('fam-mariana-')) {
      deleteFamilyMemberFromSupabase(memberId).catch((err) => {
        console.warn('Erro ao excluir membro do Supabase:', err);
      });
    }
  };
  const [userSegment, setUserSegment] = useState<'barbearia' | 'salao' | 'todos'>(() => {
    try {
      const saved = localStorage.getItem('vagou_user_segment');
      return (saved as 'barbearia' | 'salao' | 'todos') || 'barbearia';
    } catch {
      return 'barbearia';
    }
  });

  // Supabase Live Offers Loading estritamente com a Geolocation API do Navegador
  const loadLiveOffers = async (coordsOverride?: UserCoordinates | null) => {
    try {
      const targetCoords = coordsOverride || userCoords;
      const lat = targetCoords?.lat ?? -23.5615;
      const lng = targetCoords?.lng ?? -46.6559;

      const liveOffers = await fetchOffersFromSupabase(
        lat,
        lng,
        25.0,
        userSegment !== 'todos' ? userSegment : null
      );
      setOffers(liveOffers || []);
      if (liveOffers && liveOffers.length > 0 && !selectedOffer) {
        setSelectedOffer(liveOffers[0]);
      }
    } catch (err) {
      console.warn('[Supabase Live] Erro ao carregar ofertas:', err);
      setOffers([]);
    }
  };

  // Carrega agendamentos reais do Supabase
  const loadLiveAppointments = async () => {
    try {
      const liveBookings = await fetchAppointmentsFromSupabase();
      setBookings(liveBookings || []);
      if (liveBookings && liveBookings.length > 0 && !lastBooking) {
        setLastBooking(liveBookings[0]);
      }
    } catch (err) {
      console.warn('[Supabase DB] Erro ao carregar agendamentos:', err);
    }
  };

  useEffect(() => {
    loadLiveAppointments();

    // Roteamento por Subdomínio Dinâmico (ex: nomedonegocio.vagouapp.com) e Parâmetros de URL
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const urlSlug = urlParams.get('salon') || urlParams.get('slug');
      const hostname = window.location.hostname.toLowerCase();

      let targetSlug = urlSlug;

      if (!targetSlug) {
        // Trata subdomínios como nomedonegocio.vagoapp.com ou nomedonegocio.vagouapp.com
        const parts = hostname.split('.');
        if (parts.length >= 2) {
          const firstSub = parts[0];
          const reservedSubs = ['www', 'app', 'dev', 'ais-dev', 'ais-pre', 'localhost', '127'];
          if (!reservedSubs.includes(firstSub)) {
            targetSlug = firstSub;
          }
        }
      }

      if (targetSlug) {
        const foundSalonOffer = MOCK_OFFERS.find(
          (o) => o.salonSlug === targetSlug || o.salonName.toLowerCase().includes(targetSlug.toLowerCase())
        );
        if (foundSalonOffer) {
          setSelectedOffer(foundSalonOffer);
          setCurrentScreen('detalhe-oferta');
        }
      }
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    // 1. Obter geolocalização real estritamente da API do navegador
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      setIsGpsLoading(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          if (!isMounted) return;
          const realCoords: UserCoordinates = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
          };
          setUserCoords(realCoords);
          setIsGpsLoading(false);
          loadLiveOffers(realCoords);
        },
        (err) => {
          console.warn('GPS negado ou indisponível:', err.message);
          if (!isMounted) return;
          setIsGpsLoading(false);
          // Fallback somente em caso de bloqueio explícito pelo usuário
          getDeviceCoordinates().then((fallback) => {
            if (fallback && isMounted) {
              setUserCoords(fallback);
              loadLiveOffers(fallback);
            }
          });
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0, // Garante posição fresca em tempo real
        }
      );
    } else {
      setIsGpsLoading(false);
      loadLiveOffers();
    }

    // 2. Watcher para atualização de posição se o usuário se mover
    let watchId: number | null = null;
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      try {
        watchId = navigator.geolocation.watchPosition(
          (pos) => {
            if (!isMounted) return;
            const updatedCoords: UserCoordinates = {
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
              accuracy: pos.coords.accuracy,
            };
            setUserCoords(updatedCoords);
            setIsGpsLoading(false);
          },
          (err) => {
            console.warn('Watcher de geolocalização:', err.message);
          },
          {
            enableHighAccuracy: true,
            timeout: 12000,
            maximumAge: 10000,
          }
        );
      } catch {}
    }

    // 3. Inicializar Web Push Subscription de forma não-intrusiva
    subscribeToWebPush().catch(() => {});

    // 4. Inscrição para atualizações em tempo real das vagas no Supabase
    const unsubscribe = subscribeToRealtimeOffers(() => {
      loadLiveOffers();
    });

    return () => {
      isMounted = false;
      if (watchId !== null && 'geolocation' in navigator) {
        navigator.geolocation.clearWatch(watchId);
      }
      unsubscribe();
    };
  }, [userSegment]);

  const handleSelectSegment = (segment: 'barbearia' | 'salao' | 'todos') => {
    setUserSegment(segment);
    try {
      localStorage.setItem('vagou_user_segment', segment);
    } catch {}
  };

  const handleSaveInterestPreferences = (selectedIds: string[]) => {
    if (selectedIds.includes('barbearia') && !selectedIds.includes('salao')) {
      handleSelectSegment('barbearia');
    } else if (selectedIds.includes('salao') && !selectedIds.includes('barbearia')) {
      handleSelectSegment('salao');
    } else {
      handleSelectSegment('todos');
    }
    try {
      localStorage.setItem('vagou_user_interests', JSON.stringify(selectedIds));
      localStorage.setItem('vagou_onboarding_completed', 'true');
    } catch {}
  };

  // Global Favorites State with LocalStorage
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('vagou_favorites');
      return saved ? JSON.parse(saved) : ['1', '3'];
    } catch {
      return ['1', '3'];
    }
  });

  const handleToggleFavorite = (offerId: string) => {
    setFavorites((prev) => {
      const exists = prev.includes(offerId);
      const next = exists ? prev.filter((id) => id !== offerId) : [...prev, offerId];
      try {
        localStorage.setItem('vagou_favorites', JSON.stringify(next));
      } catch (err) {
        console.warn('Erro ao salvar favoritos:', err);
      }
      return next;
    });
  };

  // PWA Install State
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState<boolean>(false);
  const [isStandalone, setIsStandalone] = useState<boolean>(false);
  const [showInstallModal, setShowInstallModal] = useState<boolean>(false);

  useEffect(() => {
    // Detect standalone mode
    const isStandaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.matchMedia('(display-mode: fullscreen)').matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes('android-app://');
    setIsStandalone(isStandaloneMode);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    window.addEventListener('appinstalled', () => {
      setIsStandalone(true);
      setIsInstallable(false);
      setShowInstallModal(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleNativeInstall = async () => {
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          setIsStandalone(true);
          setShowInstallModal(false);
        }
      } catch (err) {
        console.log('Error triggering prompt:', err);
      }
      setDeferredPrompt(null);
    }
  };

  const handleOpenInstallModal = () => {
    setShowInstallModal(true);
  };

  // Handle Client Booking creation
  const handleConfirmBooking = (offer: ServiceOffer, skipScreenChange = false) => {
    hapticSuccess();
    const newProtocol = `VG-${Math.floor(1000 + Math.random() * 9000)}`;

    const isDependent = Boolean(activeFamilyProfile);
    const dependentName = activeFamilyProfile ? activeFamilyProfile.name : undefined;
    const clientName = isDependent ? `${dependentName} (Dep. de Anderson Silva)` : 'Anderson Silva (Você)';

    const newBooking: BookingAppointment = {
      protocolCode: newProtocol,
      offerId: offer.id,
      salonId: offer.salonId,
      professionalId: offer.professionalId,
      service: offer.serviceTitle,
      professional: offer.professionalName,
      salonName: offer.salonName,
      dateTime: formatSlotDateTime(offer.timeSlot),
      dayGroup: 'HOJE, 26 DE JAN',
      time: offer.timeSlot.replace('Hoje • ', '').replace('Amanhã • ', ''),
      totalPrice: offer.price,
      serviceType: offer.homeDeliveryEnabled ? 'HOME_DELIVERY' : 'IN_SALON',
      travelFee: offer.homeDeliveryTravelFee || 0,
      clientName: isDependent ? 'Anderson Silva' : 'Anderson Silva (Você)',
      clientPhone: '(11) 98765-4321',
      isDependent,
      dependentId: activeFamilyProfile ? activeFamilyProfile.id : undefined,
      dependentName,
      status: 'EM ANDAMENTO',
      address: `${offer.neighborhood} - São Paulo, SP`,
    };

    setBookings([newBooking, ...bookings]);
    setLastBooking(newBooking);

    // Persiste no Supabase assincronamente (com os 4 campos acordados com o "Meu Negócio")
    createAppointmentInSupabase(newBooking).catch((err) => {
      console.warn('Erro ao salvar agendamento no Supabase:', err);
    });

    // Trigger PWA reminder notification
    scheduleAppointmentReminder(
      offer.serviceTitle,
      offer.salonName,
      offer.timeSlot
    );

    if (!skipScreenChange) {
      setCurrentScreen('confirmacao');
    }
  };

  // Handle Client Booking Cancellation
  const handleCancelBooking = (protocolCode: string) => {
    setBookings((prev) =>
      prev.map((b) =>
        b.protocolCode === protocolCode
          ? { ...b, status: 'CANCELADO' as const }
          : b
      )
    );
  };

  const [clientSelectedCategory, setClientSelectedCategory] = useState<string>('flash');

  return (
    <div className={`h-[100dvh] w-full ${isDark ? 'bg-[#151A1E]' : 'bg-slate-200'} sm:bg-slate-200 flex justify-center items-center antialiased selection:bg-[#20C933] selection:text-white overflow-hidden`}>
      {/* Real Fullscreen Mobile Container */}
      <main className={`w-full max-w-md h-[100dvh] ${isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'} flex flex-col relative shadow-2xl overflow-hidden font-sans`}>
        
        {/* PORTAL MARKETPLACE CONTAINER */}
        <div className="flex flex-col h-full w-full overflow-hidden">
            {/* Scrollable Screen Content Container */}
            <div className={`flex-1 min-h-0 w-full relative scroll-smooth ${
              salonNavContext !== null
                ? 'overflow-hidden'
                : 'overflow-y-auto overflow-x-hidden'
            } ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
              {currentScreen === 'home' && (
                <HomeScreen
                  offers={offers}
                  userCoords={userCoords}
                  externalSelectedCategory={clientSelectedCategory}
                  onCategoryChange={setClientSelectedCategory}
                  onNavigateToOffers={() => setCurrentScreen('busca')}
                  onNavigateToOfferDetail={(off) => {
                    setSelectedOffer(off);
                    setCurrentScreen('detalhe-oferta');
                  }}
                  onNavigateToMap={() => setCurrentScreen('mapa')}
                  onOpenInstallModal={handleOpenInstallModal}
                  isStandalone={isStandalone}
                  favorites={favorites}
                  onToggleFavorite={handleToggleFavorite}
                  onConfirmBooking={(offer) => handleConfirmBooking(offer, true)}
                  onOpenProfileDrawer={() => setIsProfileDrawerOpen(true)}
                  currentSegment={userSegment}
                  onSelectSegment={handleSelectSegment}
                  onRegisterSalonNav={setSalonNavContext}
                  onNavigateToAgenda={() => setCurrentScreen('agenda')}
                  userName={currentUser?.user_metadata?.full_name || currentUser?.email || 'Visitante'}
                  isLoggedIn={Boolean(currentUser)}
                  onOpenAuthModal={() => setIsAuthModalOpen(true)}
                  activeFamilyProfile={activeFamilyProfile}
                  onOpenAddFamilyModal={() => setIsAddFamilyModalOpen(true)}
                />
              )}

              {currentScreen === 'busca' && (
                <PinterestExploreScreen
                  offers={offers}
                  onSelectOffer={(off) => {
                    setSelectedOffer(off);
                    setCurrentScreen('detalhe-oferta');
                  }}
                  onConfirmBooking={handleConfirmBooking}
                  favorites={favorites}
                  onToggleFavorite={handleToggleFavorite}
                />
              )}

              {currentScreen === 'mapa' && (
                <MapScreen
                  offers={offers}
                  onSelectOffer={(off) => {
                    setSelectedOffer(off);
                    setCurrentScreen('detalhe-oferta');
                  }}
                  onBack={() => setCurrentScreen('home')}
                  favorites={favorites}
                  onToggleFavorite={handleToggleFavorite}
                  isGpsLoading={isGpsLoading}
                  userCoords={userCoords}
                />
              )}

              {currentScreen === 'lista-ofertas' && (
                <OfferListScreen
                  offers={offers}
                  onBack={() => setCurrentScreen('home')}
                  onGoHome={() => setCurrentScreen('home')}
                  onSelectOffer={(off) => {
                    setSelectedOffer(off);
                    setCurrentScreen('detalhe-oferta');
                  }}
                  favorites={favorites}
                  onToggleFavorite={handleToggleFavorite}
                />
              )}

              {currentScreen === 'detalhe-oferta' && selectedOffer && (
                <OfferDetailScreen
                  offer={selectedOffer}
                  onBack={() => setCurrentScreen('home')}
                  onGoHome={() => setCurrentScreen('home')}
                  onConfirmBooking={handleConfirmBooking}
                  isFavorite={favorites.includes(selectedOffer.id)}
                  onToggleFavorite={handleToggleFavorite}
                />
              )}

              {currentScreen === 'confirmacao' && lastBooking && (
                <ConfirmationScreen
                  booking={lastBooking}
                  onNavigateToAgenda={() => setCurrentScreen('agenda')}
                  onNavigateToHome={() => setCurrentScreen('home')}
                />
              )}

              {currentScreen === 'agenda' && (
                <AgendaScreen
                  bookings={bookings}
                  onNewBookingClick={() => setCurrentScreen('home')}
                  onCancelBooking={handleCancelBooking}
                  onBack={() => setCurrentScreen('home')}
                  onConfirmBooking={handleConfirmBooking}
                />
              )}

              {currentScreen === 'favoritos' && (
                <FavoritesScreen
                  offers={offers}
                  favorites={favorites}
                  onToggleFavorite={handleToggleFavorite}
                  onSelectOffer={(off) => {
                    setSelectedOffer(off);
                    setCurrentScreen('detalhe-oferta');
                  }}
                  onConfirmBooking={handleConfirmBooking}
                  onBack={() => setCurrentScreen('home')}
                  onGoHome={() => setCurrentScreen('home')}
                />
              )}

              {currentScreen === 'perfil' && (
                <ProfileScreen
                  onBack={() => setCurrentScreen('home')}
                  onInstallClick={handleOpenInstallModal}
                  isInstallable={true}
                  isStandalone={isStandalone}
                  offers={offers}
                  favorites={favorites}
                  onToggleFavorite={handleToggleFavorite}
                  onSelectOffer={(off) => {
                    setSelectedOffer(off);
                    setCurrentScreen('detalhe-oferta');
                  }}
                  currentUser={currentUser}
                  isLoggedIn={Boolean(currentUser)}
                  onLogout={handleLogout}
                  onOpenAuthModal={() => setIsAuthModalOpen(true)}
                />
              )}
            </div>

            {/* Client Bottom Navigation - Fixed and Permanent at bottom */}
            <BottomNav
              currentScreen={currentScreen}
              onSelectScreen={(screen) => setCurrentScreen(screen)}
              onOpenSearchModal={() => setIsSearchModalOpen(true)}
              onSelectFlashCategory={() => {
                setCurrentScreen('home');
                setClientSelectedCategory('flash');
              }}
              isFlashActive={currentScreen === 'home' && clientSelectedCategory === 'flash'}
              salonContext={currentScreen === 'home' ? salonNavContext : null}
            />

            {/* Profile Drawer Component */}
            <ProfileDrawer
              isOpen={isProfileDrawerOpen}
              onClose={() => setIsProfileDrawerOpen(false)}
              onNavigateToAgenda={() => setCurrentScreen('agenda')}
              onNavigateToFavorites={() => setCurrentScreen('favoritos')}
              favoriteCount={favorites.length}
              onOpenInterestConfig={() => setIsInterestModalOpen(true)}
              currentSegment={userSegment}
              onSelectSegment={handleSelectSegment}
              userName={currentUser?.user_metadata?.full_name || currentUser?.email || 'Visitante'}
              isLoggedIn={Boolean(currentUser)}
              onLogout={handleLogout}
              onOpenAuthModal={() => {
                setIsProfileDrawerOpen(false);
                setIsAuthModalOpen(true);
              }}
              familyProfiles={familyProfiles}
              activeFamilyProfileId={activeFamilyProfileId}
              onSelectFamilyProfile={handleSelectFamilyProfile}
              onOpenAddFamilyModal={() => {
                setEditingFamilyMember(null);
                setIsAddFamilyModalOpen(true);
              }}
              onEditFamilyMember={handleEditFamilyMember}
              onDeleteFamilyMember={handleDeleteFamilyMember}
            />

            {/* Modal de Cadastro de Dependente / Família (Vagou Family) */}
            <AddFamilyMemberModal
              isOpen={isAddFamilyModalOpen}
              initialMember={editingFamilyMember}
              onClose={() => {
                setIsAddFamilyModalOpen(false);
                setEditingFamilyMember(null);
              }}
              onAddMember={handleAddOrUpdateFamilyMember}
            />

            {/* Interest Onboarding / Personalization Modal */}
            <InterestOnboardingModal
              isOpen={isInterestModalOpen}
              onClose={() => setIsInterestModalOpen(false)}
              onSavePreferences={handleSaveInterestPreferences}
            />

            {/* Center Search Modal with Backdrop Blur */}
            <SearchModal
              isOpen={isSearchModalOpen}
              onClose={() => setIsSearchModalOpen(false)}
              offers={offers}
              onSelectOffer={(off) => {
                setSelectedOffer(off);
                setCurrentScreen('detalhe-oferta');
              }}
              onConfirmBooking={handleConfirmBooking}
              favorites={favorites}
              onToggleFavorite={handleToggleFavorite}
            />

            {/* Modal de Autenticação Exclusivo do Portal Vagou */}
            <VagouAuthModal
              isOpen={isAuthModalOpen}
              onClose={() => {
                setIsAuthModalOpen(false);
                setAuthPendingOffer(null);
              }}
              targetOfferTitle={authPendingOffer?.serviceTitle}
              onSuccess={(user) => {
                handleLoginSuccess(user);
                setIsAuthModalOpen(false);
                if (authPendingOffer) {
                  handleConfirmBooking(authPendingOffer);
                  setAuthPendingOffer(null);
                }
              }}
            />
          </div>

        {/* Universal Multi-Browser Install Modal */}
        <InstallModal
          isOpen={showInstallModal}
          onClose={() => setShowInstallModal(false)}
          onNativeInstall={handleNativeInstall}
          hasNativePrompt={!!deferredPrompt}
        />

        {/* Official Brand Splash Screen (Manual de Identidade Visual) */}
        <SplashScreen durationMs={1400} />

        {/* Supabase Realtime Diagnostic Toast on App Load (Guardado para ativação futura quando solicitado) */}
        {/* <SupabaseDiagnosticToast /> */}
      </main>
    </div>
  );
};

export default App;

