
interface AudioLevelCallbacks {
  onLevelChange: (level: number) => void;
  onError: (error: string) => void;
}

class AudioLevelService {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private microphone: MediaStreamAudioSourceNode | null = null;
  private dataArray: Uint8Array | null = null;
  private animationId: number | null = null;
  private callbacks: AudioLevelCallbacks | null = null;

  public async startMonitoring(callbacks: AudioLevelCallbacks): Promise<void> {
    this.callbacks = callbacks;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      this.audioContext = new AudioContext();
      this.analyser = this.audioContext.createAnalyser();
      this.microphone = this.audioContext.createMediaStreamSource(stream);

      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.8;
      
      this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
      this.microphone.connect(this.analyser);

      this.updateLevel();
    } catch (error) {
      this.callbacks?.onError(`Failed to access microphone: ${error}`);
    }
  }

  private updateLevel(): void {
    if (!this.analyser || !this.dataArray || !this.callbacks) return;

    this.analyser.getByteFrequencyData(this.dataArray);
    
    // Calculate average volume level
    const average = this.dataArray.reduce((sum, value) => sum + value, 0) / this.dataArray.length;
    const normalizedLevel = Math.min(100, Math.max(0, (average / 255) * 100));

    this.callbacks.onLevelChange(normalizedLevel);

    this.animationId = requestAnimationFrame(() => this.updateLevel());
  }

  public stopMonitoring(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }

    if (this.microphone) {
      this.microphone.disconnect();
      this.microphone = null;
    }

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    this.analyser = null;
    this.dataArray = null;
    this.callbacks = null;
  }

  public isActive(): boolean {
    return this.audioContext !== null && this.audioContext.state === 'running';
  }
}

export const audioService = new AudioLevelService();
