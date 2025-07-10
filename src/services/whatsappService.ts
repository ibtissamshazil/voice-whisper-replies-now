
interface WhatsAppMessage {
  id: string;
  sender: string;
  content: string;
  timestamp: Date;
  isRead: boolean;
}

interface WhatsAppChat {
  id: string;
  name: string;
  lastMessage: WhatsAppMessage;
  unreadCount: number;
  messages: WhatsAppMessage[];
}

interface WhatsAppIntegrationCallbacks {
  onMessageReceived: (message: WhatsAppMessage) => void;
  onChatOpened: (chat: WhatsAppChat) => void;
  onStatusChange: (isActive: boolean) => void;
}

class WhatsAppIntegrationService {
  private isActive: boolean = false;
  private callbacks: WhatsAppIntegrationCallbacks | null = null;
  private mockChats: WhatsAppChat[] = [];
  private currentChat: WhatsAppChat | null = null;

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData(): void {
    this.mockChats = [
      {
        id: '1',
        name: 'Sam',
        unreadCount: 2,
        lastMessage: {
          id: 'm1',
          sender: 'Sam',
          content: 'Hey, are you free tonight?',
          timestamp: new Date(Date.now() - 300000), // 5 minutes ago
          isRead: false
        },
        messages: [
          {
            id: 'm1',
            sender: 'Sam',
            content: 'Hey, are you free tonight?',
            timestamp: new Date(Date.now() - 300000),
            isRead: false
          },
          {
            id: 'm2',
            sender: 'Sam',
            content: 'We could grab dinner somewhere',
            timestamp: new Date(Date.now() - 240000),
            isRead: false
          }
        ]
      },
      {
        id: '2',
        name: 'John',
        unreadCount: 1,
        lastMessage: {
          id: 'm3',
          sender: 'John',
          content: 'The meeting is at 3 PM',
          timestamp: new Date(Date.now() - 600000), // 10 minutes ago
          isRead: false
        },
        messages: [
          {
            id: 'm3',
            sender: 'John',
            content: 'The meeting is at 3 PM',
            timestamp: new Date(Date.now() - 600000),
            isRead: false
          }
        ]
      }
    ];
  }

  public initialize(callbacks: WhatsAppIntegrationCallbacks): void {
    this.callbacks = callbacks;
    this.detectWhatsApp();
  }

  private detectWhatsApp(): void {
    // Simulate WhatsApp detection
    setTimeout(() => {
      this.isActive = true;
      this.callbacks?.onStatusChange(true);
      console.log('WhatsApp detected and active');
    }, 1000);
  }

  public async navigateBack(): Promise<boolean> {
    console.log('Navigating back in WhatsApp');
    this.currentChat = null;
    return true;
  }

  public async openChat(contactName: string): Promise<boolean> {
    const chat = this.mockChats.find(c => 
      c.name.toLowerCase() === contactName.toLowerCase()
    );

    if (chat) {
      this.currentChat = chat;
      this.callbacks?.onChatOpened(chat);
      console.log(`Opened chat with ${contactName}`);
      return true;
    }

    console.log(`Chat with ${contactName} not found`);
    return false;
  }

  public async sendMessage(message: string, contactName?: string): Promise<boolean> {
    if (contactName) {
      const success = await this.openChat(contactName);
      if (!success) return false;
    }

    if (!this.currentChat) {
      console.log('No active chat to send message to');
      return false;
    }

    const newMessage: WhatsAppMessage = {
      id: `m${Date.now()}`,
      sender: 'You',
      content: message,
      timestamp: new Date(),
      isRead: true
    };

    this.currentChat.messages.push(newMessage);
    this.currentChat.lastMessage = newMessage;

    console.log(`Sent message: "${message}" to ${this.currentChat.name}`);
    return true;
  }

  public async replyToMessage(messageIndex: number, contactName: string, replyText: string): Promise<boolean> {
    const chat = this.mockChats.find(c => 
      c.name.toLowerCase() === contactName.toLowerCase()
    );

    if (!chat) {
      console.log(`Chat with ${contactName} not found`);
      return false;
    }

    const messages = chat.messages.filter(m => m.sender !== 'You');
    if (messageIndex > messages.length) {
      console.log(`Message index ${messageIndex} out of range`);
      return false;
    }

    const targetMessage = messages[messages.length - messageIndex];
    console.log(`Replying to message: "${targetMessage.content}" with: "${replyText}"`);

    // Simulate sending the reply
    return await this.sendMessage(replyText, contactName);
  }

  public getActiveChats(): WhatsAppChat[] {
    return this.mockChats;
  }

  public getCurrentChat(): WhatsAppChat | null {
    return this.currentChat;
  }

  public isWhatsAppActive(): boolean {
    return this.isActive;
  }

  public getUnreadMessages(): WhatsAppMessage[] {
    return this.mockChats
      .flatMap(chat => chat.messages)
      .filter(message => !message.isRead && message.sender !== 'You');
  }
}

export const whatsappService = new WhatsAppIntegrationService();
