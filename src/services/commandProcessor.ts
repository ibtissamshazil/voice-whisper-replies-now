
export interface VoiceCommand {
  type: 'navigation' | 'reply' | 'send' | 'control';
  action: string;
  parameters?: Record<string, any>;
}

export interface CommandResult {
  success: boolean;
  message: string;
  data?: any;
}

class CommandProcessor {
  private navigationPatterns = [
    { pattern: /go back/i, action: 'back' },
    { pattern: /go to (\w+)'?s? chat/i, action: 'openChat' },
    { pattern: /open (\w+)'?s? chat/i, action: 'openChat' },
    { pattern: /switch to (\w+)/i, action: 'openChat' },
  ];

  private replyPatterns = [
    { pattern: /reply to (?:the )?(?:last|latest) message from (\w+)/i, action: 'replyToLast' },
    { pattern: /reply to (?:the )?(\w+) (?:last )?message from (\w+)/i, action: 'replyToSpecific' },
    { pattern: /reply to (\w+)/i, action: 'replyToContact' },
  ];

  private sendPatterns = [
    { pattern: /send message (.+)/i, action: 'sendMessage' },
    { pattern: /send (.+) to (\w+)/i, action: 'sendToContact' },
    { pattern: /tell (\w+) (.+)/i, action: 'sendToContact' },
  ];

  private controlPatterns = [
    { pattern: /hide overlay/i, action: 'hideOverlay' },
    { pattern: /show overlay/i, action: 'showOverlay' },
    { pattern: /minimize/i, action: 'minimize' },
    { pattern: /close/i, action: 'close' },
  ];

  public parseCommand(transcript: string): VoiceCommand | null {
    const cleanTranscript = transcript.trim();
    
    // Check navigation commands
    for (const { pattern, action } of this.navigationPatterns) {
      const match = cleanTranscript.match(pattern);
      if (match) {
        return {
          type: 'navigation',
          action,
          parameters: { 
            contact: match[1]?.toLowerCase(),
            originalText: cleanTranscript 
          }
        };
      }
    }

    // Check reply commands
    for (const { pattern, action } of this.replyPatterns) {
      const match = cleanTranscript.match(pattern);
      if (match) {
        const parameters: Record<string, any> = { originalText: cleanTranscript };
        
        if (action === 'replyToSpecific') {
          parameters.messageIndex = this.parseMessageIndex(match[1]);
          parameters.contact = match[2]?.toLowerCase();
        } else if (action === 'replyToLast') {
          parameters.contact = match[1]?.toLowerCase();
          parameters.messageIndex = 1;
        } else {
          parameters.contact = match[1]?.toLowerCase();
        }
        
        return {
          type: 'reply',
          action,
          parameters
        };
      }
    }

    // Check send commands
    for (const { pattern, action } of this.sendPatterns) {
      const match = cleanTranscript.match(pattern);
      if (match) {
        const parameters: Record<string, any> = { originalText: cleanTranscript };
        
        if (action === 'sendMessage') {
          parameters.message = match[1];
        } else if (action === 'sendToContact') {
          if (cleanTranscript.startsWith('tell')) {
            parameters.contact = match[1]?.toLowerCase();
            parameters.message = match[2];
          } else {
            parameters.message = match[1];
            parameters.contact = match[2]?.toLowerCase();
          }
        }
        
        return {
          type: 'send',
          action,
          parameters
        };
      }
    }

    // Check control commands
    for (const { pattern, action } of this.controlPatterns) {
      const match = cleanTranscript.match(pattern);
      if (match) {
        return {
          type: 'control',
          action,
          parameters: { originalText: cleanTranscript }
        };
      }
    }

    return null;
  }

  private parseMessageIndex(indexWord: string): number {
    const numberMap: Record<string, number> = {
      'first': 1,
      'second': 2,
      'third': 3,
      'fourth': 4,
      'fifth': 5,
      'last': 1,
      'latest': 1
    };

    return numberMap[indexWord.toLowerCase()] || 1;
  }

  public async executeCommand(command: VoiceCommand): Promise<CommandResult> {
    try {
      switch (command.type) {
        case 'navigation':
          return await this.executeNavigationCommand(command);
        case 'reply':
          return await this.executeReplyCommand(command);
        case 'send':
          return await this.executeSendCommand(command);
        case 'control':
          return await this.executeControlCommand(command);
        default:
          return { success: false, message: 'Unknown command type' };
      }
    } catch (error) {
      return { success: false, message: `Command execution failed: ${error}` };
    }
  }

  private async executeNavigationCommand(command: VoiceCommand): Promise<CommandResult> {
    const { action, parameters } = command;
    
    console.log(`Navigation command: ${action}`, parameters);
    
    switch (action) {
      case 'back':
        // Simulate back navigation
        return { success: true, message: 'Navigating back' };
      case 'openChat':
        const contact = parameters?.contact;
        return { 
          success: true, 
          message: `Opening chat with ${contact}`,
          data: { contact }
        };
      default:
        return { success: false, message: 'Unknown navigation action' };
    }
  }

  private async executeReplyCommand(command: VoiceCommand): Promise<CommandResult> {
    const { action, parameters } = command;
    
    console.log(`Reply command: ${action}`, parameters);
    
    switch (action) {
      case 'replyToLast':
      case 'replyToSpecific':
        const contact = parameters?.contact;
        const messageIndex = parameters?.messageIndex || 1;
        return { 
          success: true, 
          message: `Preparing to reply to message ${messageIndex} from ${contact}`,
          data: { contact, messageIndex }
        };
      case 'replyToContact':
        return { 
          success: true, 
          message: `Preparing to reply to ${parameters?.contact}`,
          data: { contact: parameters?.contact }
        };
      default:
        return { success: false, message: 'Unknown reply action' };
    }
  }

  private async executeSendCommand(command: VoiceCommand): Promise<CommandResult> {
    const { action, parameters } = command;
    
    console.log(`Send command: ${action}`, parameters);
    
    switch (action) {
      case 'sendMessage':
        return { 
          success: true, 
          message: `Sending message: "${parameters?.message}"`,
          data: { message: parameters?.message }
        };
      case 'sendToContact':
        return { 
          success: true, 
          message: `Sending "${parameters?.message}" to ${parameters?.contact}`,
          data: { message: parameters?.message, contact: parameters?.contact }
        };
      default:
        return { success: false, message: 'Unknown send action' };
    }
  }

  private async executeControlCommand(command: VoiceCommand): Promise<CommandResult> {
    const { action, parameters } = command;
    
    console.log(`Control command: ${action}`, parameters);
    
    // These would be handled by the UI components
    return { 
      success: true, 
      message: `Control action: ${action}`,
      data: { action }
    };
  }
}

export const commandProcessor = new CommandProcessor();
