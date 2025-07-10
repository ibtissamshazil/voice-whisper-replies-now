
import { speechService } from './speechService';
import { commandProcessor, VoiceCommand, CommandResult } from './commandProcessor';
import { audioService } from './audioService';
import { whatsappService } from './whatsappService';

interface VoiceControllerCallbacks {
  onListeningStart: () => void;
  onListeningStop: () => void;
  onTranscript: (transcript: string, isFinal: boolean) => void;
  onCommandProcessed: (command: VoiceCommand, result: CommandResult) => void;
  onError: (error: string) => void;
  onAudioLevel: (level: number) => void;
  onOverlayControl: (action: string) => void;
}

class VoiceController {
  private callbacks: VoiceControllerCallbacks | null = null;
  private isInitialized: boolean = false;
  private isListening: boolean = false;
  private currentTranscript: string = '';

  public async initialize(callbacks: VoiceControllerCallbacks): Promise<void> {
    this.callbacks = callbacks;

    // Initialize WhatsApp service
    whatsappService.initialize({
      onMessageReceived: (message) => {
        console.log('New message received:', message);
      },
      onChatOpened: (chat) => {
        console.log('Chat opened:', chat.name);
      },
      onStatusChange: (isActive) => {
        console.log('WhatsApp status:', isActive ? 'Active' : 'Inactive');
      }
    });

    this.isInitialized = true;
  }

  public async startListening(): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('Voice controller not initialized');
    }

    if (this.isListening) {
      return;
    }

    try {
      // Start audio level monitoring
      await audioService.startMonitoring({
        onLevelChange: (level) => {
          this.callbacks?.onAudioLevel(level);
        },
        onError: (error) => {
          this.callbacks?.onError(`Audio monitoring error: ${error}`);
        }
      });

      // Start speech recognition
      speechService.startListening({
        onStart: () => {
          this.isListening = true;
          this.callbacks?.onListeningStart();
        },
        onEnd: () => {
          this.isListening = false;
          this.callbacks?.onListeningStop();
          audioService.stopMonitoring();
        },
        onResult: async (result) => {
          this.currentTranscript = result.transcript;
          this.callbacks?.onTranscript(result.transcript, result.isFinal);

          if (result.isFinal && result.confidence > 0.5) {
            await this.processVoiceCommand(result.transcript);
          }
        },
        onError: (error) => {
          this.callbacks?.onError(`Speech recognition error: ${error}`);
          this.stopListening();
        }
      });
    } catch (error) {
      this.callbacks?.onError(`Failed to start listening: ${error}`);
    }
  }

  public stopListening(): void {
    if (this.isListening) {
      speechService.stopListening();
      audioService.stopMonitoring();
      this.isListening = false;
    }
  }

  private async processVoiceCommand(transcript: string): Promise<void> {
    try {
      const command = commandProcessor.parseCommand(transcript);
      
      if (!command) {
        this.callbacks?.onError('Command not recognized');
        return;
      }

      // Handle control commands specially
      if (command.type === 'control') {
        this.callbacks?.onOverlayControl(command.action);
        return;
      }

      // Execute the command
      const result = await this.executeCommand(command);
      this.callbacks?.onCommandProcessed(command, result);

    } catch (error) {
      this.callbacks?.onError(`Command processing error: ${error}`);
    }
  }

  private async executeCommand(command: VoiceCommand): Promise<CommandResult> {
    const { type, action, parameters } = command;

    try {
      switch (type) {
        case 'navigation':
          return await this.handleNavigationCommand(action, parameters);
        case 'reply':
          return await this.handleReplyCommand(action, parameters);
        case 'send':
          return await this.handleSendCommand(action, parameters);
        default:
          return { success: false, message: 'Unknown command type' };
      }
    } catch (error) {
      return { success: false, message: `Command execution failed: ${error}` };
    }
  }

  private async handleNavigationCommand(action: string, parameters?: Record<string, any>): Promise<CommandResult> {
    switch (action) {
      case 'back':
        const backSuccess = await whatsappService.navigateBack();
        return { 
          success: backSuccess, 
          message: backSuccess ? 'Navigated back' : 'Failed to navigate back' 
        };

      case 'openChat':
        const contact = parameters?.contact;
        if (!contact) {
          return { success: false, message: 'No contact specified' };
        }
        
        const chatSuccess = await whatsappService.openChat(contact);
        return { 
          success: chatSuccess, 
          message: chatSuccess ? `Opened chat with ${contact}` : `Could not find chat with ${contact}` 
        };

      default:
        return { success: false, message: 'Unknown navigation action' };
    }
  }

  private async handleReplyCommand(action: string, parameters?: Record<string, any>): Promise<CommandResult> {
    const contact = parameters?.contact;
    const messageIndex = parameters?.messageIndex || 1;

    if (!contact) {
      return { success: false, message: 'No contact specified for reply' };
    }

    // For now, we'll just prepare the reply context
    // In a real implementation, this would open the reply interface
    return { 
      success: true, 
      message: `Ready to reply to message ${messageIndex} from ${contact}. Please speak your reply.`,
      data: { contact, messageIndex, awaitingReply: true }
    };
  }

  private async handleSendCommand(action: string, parameters?: Record<string, any>): Promise<CommandResult> {
    const message = parameters?.message;
    const contact = parameters?.contact;

    if (!message) {
      return { success: false, message: 'No message content specified' };
    }

    const sendSuccess = await whatsappService.sendMessage(message, contact);
    
    if (sendSuccess) {
      const recipient = contact ? ` to ${contact}` : '';
      return { success: true, message: `Message sent${recipient}: "${message}"` };
    } else {
      return { success: false, message: 'Failed to send message' };
    }
  }

  public getCurrentTranscript(): string {
    return this.currentTranscript;
  }

  public getIsListening(): boolean {
    return this.isListening;
  }

  public isSupported(): boolean {
    return speechService.isSupported();
  }

  public getWhatsAppStatus(): boolean {
    return whatsappService.isWhatsAppActive();
  }

  public getActiveChats() {
    return whatsappService.getActiveChats();
  }
}

export const voiceController = new VoiceController();
