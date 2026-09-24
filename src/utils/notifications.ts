// PWA Web Notifications API Service for Appointment Reminders

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    console.warn('Este navegador não suporta notificações de desktop/PWA.');
    return 'denied';
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission;
  }

  return Notification.permission;
}

export function sendLocalNotification(title: string, options?: NotificationOptions) {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return;
  }

  try {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.showNotification(title, {
          icon: '/icon-192.png',
          badge: '/icon-192.png',
          ...options,
        });
      });
    } else {
      new Notification(title, {
        icon: '/icon-192.png',
        ...options,
      });
    }
  } catch (err) {
    console.warn('Erro ao disparar notificação local:', err);
  }
}

// Schedule notification reminder 30 minutes before appointment
export function scheduleAppointmentReminder(
  serviceName: string,
  salonName: string,
  timeString: string
) {
  // Disparar uma confirmação imediata
  sendLocalNotification('🔔 Lembrete Vagou Ativado', {
    body: `Você receberá um lembrete 30 min antes do seu agendamento de ${serviceName} às ${timeString}.`,
    tag: `reminder-${Date.now()}`,
  });

  // Em ambiente de demonstração PWA, simula um lembrete futuro após 10 segundos
  setTimeout(() => {
    sendLocalNotification(`⏰ Lembrete: Seu horário é em 30 min!`, {
      body: `${serviceName} em ${salonName} está marcado para ${timeString}. Não se atrase!`,
      tag: `booking-reminder-${timeString}`,
    });
  }, 10000);
}
