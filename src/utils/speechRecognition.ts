/**
 * Utilitário da Web Speech API (SpeechRecognition / webkitSpeechRecognition)
 * Reconhecimento de voz nativo para pesquisa por voz em português (pt-BR)
 */

// Declaração de interfaces para tipagem global da Web Speech API
export interface IWindowWithSpeech extends Window {
  SpeechRecognition?: any;
  webkitSpeechRecognition?: any;
}

export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false;
  const win = window as unknown as IWindowWithSpeech;
  return Boolean(win.SpeechRecognition || win.webkitSpeechRecognition);
}

export interface VoiceRecognitionHandlers {
  onStart?: () => void;
  onResult: (transcript: string, isFinal: boolean) => void;
  onError?: (error: string) => void;
  onEnd?: () => void;
}

export class VoiceRecognitionSession {
  private recognition: any = null;
  private isRunning: boolean = false;

  constructor() {
    if (typeof window === 'undefined') return;
    const win = window as unknown as IWindowWithSpeech;
    const SpeechConstructor = win.SpeechRecognition || win.webkitSpeechRecognition;
    if (SpeechConstructor) {
      this.recognition = new SpeechConstructor();
      this.recognition.lang = 'pt-BR';
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      this.recognition.maxAlternatives = 1;
    }
  }

  public get isSupported(): boolean {
    return Boolean(this.recognition);
  }

  public get active(): boolean {
    return this.isRunning;
  }

  public start(handlers: VoiceRecognitionHandlers): boolean {
    if (!this.recognition) {
      handlers.onError?.('Reconhecimento de voz não suportado neste navegador.');
      return false;
    }

    if (this.isRunning) {
      try {
        this.recognition.abort();
      } catch {}
    }

    this.recognition.onstart = () => {
      this.isRunning = true;
      handlers.onStart?.();
    };

    this.recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const item = event.results[i];
        const text = item[0]?.transcript || '';
        if (item.isFinal) {
          finalTranscript += text;
        } else {
          interimTranscript += text;
        }
      }

      const deliveredText = finalTranscript.trim() || interimTranscript.trim();
      if (deliveredText) {
        handlers.onResult(deliveredText, Boolean(finalTranscript));
      }
    };

    this.recognition.onerror = (event: any) => {
      this.isRunning = false;
      const errorMsg =
        event?.error === 'not-allowed'
          ? 'Permissão de microfone negada pelo usuário.'
          : event?.error === 'no-speech'
          ? 'Nenhuma voz detectada. Tente falar novamente.'
          : event?.error || 'Erro no reconhecimento de voz.';
      handlers.onError?.(errorMsg);
    };

    this.recognition.onend = () => {
      this.isRunning = false;
      handlers.onEnd?.();
    };

    try {
      this.recognition.start();
      return true;
    } catch (err: any) {
      console.warn('Erro ao iniciar reconhecimento de voz:', err);
      this.isRunning = false;
      handlers.onError?.('Falha ao acionar microfone.');
      return false;
    }
  }

  public stop(): void {
    if (this.recognition && this.isRunning) {
      try {
        this.recognition.stop();
      } catch {}
      this.isRunning = false;
    }
  }

  public abort(): void {
    if (this.recognition && this.isRunning) {
      try {
        this.recognition.abort();
      } catch {}
      this.isRunning = false;
    }
  }
}
