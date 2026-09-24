/**
 * Utilitário de Compartilhamento Nativo (Web Share API) com Fallback para Área de Transferência
 */

import { ServiceOffer } from '../types';
import { hapticLight, hapticSuccess } from './haptics';

export interface ShareResult {
  success: boolean;
  method: 'native' | 'clipboard' | 'fallback';
  message: string;
}

export async function shareServiceOffer(offer: ServiceOffer): Promise<ShareResult> {
  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${window.location.pathname}?vaga=${offer.id}`
    : `https://vagou.app/?vaga=${offer.id}`;

  const shareTitle = `${offer.serviceTitle} no ${offer.salonName} • Vagou`;
  const shareText = `⚡ Vaga imediata no Vagou: ${offer.serviceTitle} com ${offer.professionalName} no ${offer.salonName} por R$ ${offer.price.toFixed(2).replace('.', ',')} (${offer.timeSlot}).`;

  // 1. Tentar Web Share API nativa (dispositivos móveis, iOS Safari, Android Chrome)
  if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
    try {
      hapticLight();
      await navigator.share({
        title: shareTitle,
        text: shareText,
        url: shareUrl,
      });
      return {
        success: true,
        method: 'native',
        message: 'Oferta compartilhada com sucesso!',
      };
    } catch (err: any) {
      // Se o usuário cancelou o menu nativo, não tratamos como erro
      if (err?.name === 'AbortError') {
        return {
          success: false,
          method: 'native',
          message: 'Compartilhamento cancelado.',
        };
      }
      console.warn('Falha no Web Share nativo, tentando fallback para clipboard:', err);
    }
  }

  // 2. Fallback: Copiar para Área de Transferência (Clipboard API)
  if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      hapticSuccess();
      return {
        success: true,
        method: 'clipboard',
        message: 'Link copiado para a área de transferência!',
      };
    } catch (err) {
      console.warn('Erro ao copiar para o clipboard:', err);
    }
  }

  // 3. Fallback legado com prompt ou textarea
  try {
    const textArea = document.createElement('textarea');
    textArea.value = `${shareText}\n${shareUrl}`;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    if (successful) {
      hapticSuccess();
      return {
        success: true,
        method: 'fallback',
        message: 'Link copiado para a área de transferência!',
      };
    }
  } catch {}

  return {
    success: false,
    method: 'fallback',
    message: 'Não foi possível compartilhar automaticamente.',
  };
}
