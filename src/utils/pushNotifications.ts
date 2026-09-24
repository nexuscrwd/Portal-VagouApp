import { supabase } from '../services/supabase';

// Chave pública VAPID padrão para Push Notifications (ou modo local fallback)
const VAPID_PUBLIC_KEY = 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIhbQFLXYp5Nksh8U';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Solicita permissão e registra subscription de Web Push no Service Worker
 */
export async function subscribeToWebPush(userId?: string): Promise<PushSubscription | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('[Push] Web Push não é suportado neste navegador.');
    return null;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.warn('[Push] Permissão de notificação negada pelo usuário.');
      return null;
    }

    const registration = await navigator.serviceWorker.ready;
    let subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      const convertedVapidKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey,
      });
    }

    const token = JSON.stringify(subscription);
    try {
      localStorage.setItem('vagou_push_subscription', token);
      localStorage.setItem('vagou_push_enabled', 'true');
    } catch {}

    // Se o usuário estiver autenticado, salva no Supabase
    if (userId) {
      await supabase
        .from('clients')
        .update({
          push_token: token,
          push_enabled: true,
          updated_at: new Date().toISOString(),
        })
        .eq('auth_user_id', userId);
    }

    return subscription;
  } catch (error) {
    console.error('[Push] Erro ao registrar Web Push:', error);
    return null;
  }
}

/**
 * Dispara uma notificação nativa via Service Worker
 */
export async function triggerBrowserNotification(
  title: string,
  options: {
    body: string;
    icon?: string;
    badge?: string;
    data?: any;
  }
) {
  if (typeof window === 'undefined' || !('Notification' in window)) return;

  if (Notification.permission === 'granted') {
    if ('serviceWorker' in navigator) {
      try {
        const reg = await navigator.serviceWorker.ready;
        await reg.showNotification(title, {
          body: options.body,
          icon: options.icon || '/icon-192.png',
          badge: options.badge || '/icon-192.png',
          data: options.data || { url: '/' },
        } as NotificationOptions);
        return;
      } catch {}
    }
    // Fallback para Notification API padrão
    new Notification(title, {
      body: options.body,
      icon: options.icon || '/icon-192.png',
    });
  }
}
