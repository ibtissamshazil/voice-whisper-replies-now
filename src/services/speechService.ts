
interface SpeechRecognitionResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
}

interface SpeechRecognitionCallbacks {
  onResult: (result: SpeechRecognitionResult) => void;
  onError: (error: string) => void;
  onStart: () => void;
  onEnd: () => void;
}

class SpeechRecognitionService {
  private recognition: any = null;
  private isListening: boolean = false;
  private callbacks: SpeechRecognitionCallbacks | null = null;

  constructor() {
    this.initializeRecognition();
  }

  private initializeRecognition() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      this.recognition = new SpeechRecognition();
      
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';
      this.recognition.maxAlternatives = 1;

      this.setupEventHandlers();
    }
  }

  private setupEventHandlers() {
    if (!this.recognition) return;

    this.recognition.onstart = () => {
      this.isListening = true;
      this.callbacks?.onStart();
    };

    this.recognition.onend = () => {
      this.isListening = false;
      this.callbacks?.onEnd();
    };

    this.recognition.onerror = (event: any) => {
      this.callbacks?.onError(event.error);
    };

    this.recognition.onresult = (event: any) => {
      const results = Array.from(event.results);
      const transcript = results
        .map((result: any) => result[0].transcript)
        .join('');
      
      const lastResult = event.results[event.results.length - 1];
      const confidence = lastResult[0].confidence || 0;
      const isFinal = lastResult.isFinal;

      this.callbacks?.onResult({
        transcript,
        confidence,
        isFinal
      });
    };
  }

  public startListening(callbacks: SpeechRecognitionCallbacks) {
    if (!this.recognition) {
      callbacks.onError('Speech recognition not supported');
      return;
    }

    this.callbacks = callbacks;
    
    try {
      this.recognition.start();
    } catch (error) {
      callbacks.onError('Failed to start speech recognition');
    }
  }

  public stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
    }
  }

  public isSupported(): boolean {
    return !!this.recognition;
  }

  public getIsListening(): boolean {
    return this.isListening;
  }
}

export const speechService = new SpeechRecognitionService();
