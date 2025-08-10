
import React, { useState, useEffect, useMemo } from 'react';
import VoiceOverlay from './VoiceOverlay';
import { Button } from '@/components/ui/button';
import { MessageSquare, Mic, Smartphone, Users, Accessibility } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ChatList, { ChatSummary } from './ChatList';
import ChatWindow, { MessageItem } from './ChatWindow';

const seedMessages: Record<string, MessageItem[]> = {
  Sam: [
    { id: 's1', from: 'them', text: 'Hey! Are you joining the meeting?', timestamp: Date.now() - 1000 * 60 * 45 },
    { id: 's2', from: 'me', text: 'Yes, on my way!', timestamp: Date.now() - 1000 * 60 * 40 },
    { id: 's3', from: 'them', text: 'Great, see you soon.', timestamp: Date.now() - 1000 * 60 * 35 },
  ],
  John: [
    { id: 'j1', from: 'them', text: 'Lunch today?', timestamp: Date.now() - 1000 * 60 * 90 },
    { id: 'j2', from: 'me', text: "Can't today, sorry.", timestamp: Date.now() - 1000 * 60 * 60 },
    { id: 'j3', from: 'them', text: 'No worries, maybe tomorrow.', timestamp: Date.now() - 1000 * 60 * 50 },
  ],
};

const WhatsAppVoiceApp: React.FC = () => {
  const [isOverlayVisible, setIsOverlayVisible] = useState(false);
  const [isWhatsAppDetected, setIsWhatsAppDetected] = useState(false);
  const [permissionsGranted, setPermissionsGranted] = useState(false);

  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<Record<string, MessageItem[]>>(seedMessages);

  const chats: ChatSummary[] = useMemo(() => {
    const names = Object.keys(chatMessages);
    return names.map((name) => {
      const list = chatMessages[name] ?? [];
      const last = list[list.length - 1];
      return {
        name,
        lastMessage: last ? last.text : 'No messages yet',
      };
    });
  }, [chatMessages]);

  useEffect(() => {
    const checkWhatsApp = () => {
      setIsWhatsAppDetected(true);
    };

    checkWhatsApp();
    
    if (isWhatsAppDetected && permissionsGranted) {
      setIsOverlayVisible(true);
    }
  }, [isWhatsAppDetected, permissionsGranted]);

  const requestPermissions = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setPermissionsGranted(true);
      setIsOverlayVisible(true);
    } catch (error) {
      alert('Microphone permission is required for voice commands');
    }
  };

  const handleOpenChat = (name: string) => {
    if (!chatMessages[name]) {
      setChatMessages((prev) => ({ ...prev, [name]: [] }));
    }
    setActiveChat(name);
  };

  const handleSend = (text: string) => {
    if (!activeChat) return;
    const newItem: MessageItem = {
      id: `${activeChat}-${Date.now()}`,
      from: 'me',
      text,
      timestamp: Date.now(),
    };
    setChatMessages((prev) => {
      const list = prev[activeChat] ?? [];
      const next = { ...prev, [activeChat]: [...list, newItem] };
      return next;
    });
  };

  const handleReplyTo = (contact: string, messageIndex: number) => {
    // messageIndex: 1 = last, 2 = second last, etc.
    const list = chatMessages[contact] ?? [];
    if (list.length === 0) {
      handleOpenChat(contact);
      return;
    }
    const idx = Math.max(0, list.length - messageIndex);
    const target = list[idx];
    handleOpenChat(contact);
    // Pre-fill a reply to target message (simple behavior: send a canned reply)
    const reply = `Re: "${target?.text ?? ''}"`;
    setTimeout(() => {
      handleSend(reply);
    }, 300);
  };

  const handleBack = () => {
    setActiveChat(null);
  };

  const features = [
    {
      icon: <Mic className="w-6 h-6 text-blue-500" />,
      title: "Voice Commands",
      description: "Control WhatsApp entirely with your voice"
    },
    {
      icon: <MessageSquare className="w-6 h-6 text-green-500" />,
      title: "Smart Replies",
      description: "Reply to specific messages using voice context"
    },
    {
      icon: <Users className="w-6 h-6 text-purple-500" />,
      title: "Chat Navigation",
      description: "Navigate between chats hands-free"
    },
    {
      icon: <Accessibility className="w-6 h-6 text-orange-500" />,
      title: "Accessibility First",
      description: "Designed for users with disabilities or limited mobility"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Main App Interface */}
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-full">
              <Smartphone className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            WhatsApp Voice Assistant
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Control WhatsApp hands-free with voice commands. Perfect for driving, accessibility needs, or when your hands are busy.
          </p>
        </div>

        {/* Status Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="border-l-4 border-l-green-500">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${isWhatsAppDetected ? 'bg-green-500' : 'bg-gray-400'}`} />
                <span>WhatsApp Status</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant={isWhatsAppDetected ? "default" : "secondary"} className={isWhatsAppDetected ? "bg-green-500" : ""}>
                {isWhatsAppDetected ? "Detected & Ready" : "Not Detected"}
              </Badge>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${permissionsGranted ? 'bg-blue-500' : 'bg-gray-400'}`} />
                <span>Voice Permissions</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant={permissionsGranted ? "default" : "secondary"} className={permissionsGranted ? "bg-blue-500" : ""}>
                {permissionsGranted ? "Granted" : "Required"}
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* Chat UI */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="md:col-span-1">
            <ChatList chats={chats} activeChatName={activeChat} onSelectChat={handleOpenChat} />
          </div>
          <div className="md:col-span-2">
            <ChatWindow contactName={activeChat} messages={activeChat ? (chatMessages[activeChat] ?? []) : []} onSend={handleSend} />
          </div>
        </div>

        {/* Action Button */}
        <div className="text-center">
          {!permissionsGranted ? (
            <Button 
              onClick={requestPermissions}
              size="lg"
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-4 text-lg"
            >
              <Mic className="w-5 h-5 mr-2" />
              Enable Voice Assistant
            </Button>
          ) : (
            <Button 
              onClick={() => setIsOverlayVisible(!isOverlayVisible)}
              size="lg"
              variant={isOverlayVisible ? "outline" : "default"}
              className={isOverlayVisible ? "" : "bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white px-8 py-4 text-lg"}
            >
              {isOverlayVisible ? 'Hide' : 'Show'} Voice Overlay
            </Button>
          )}
        </div>

        {/* Instructions */}
        <Card className="mt-8 max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle>How to Use</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-green-600 mb-2">Navigation Commands:</h4>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• "Go back"</li>
                  <li>• "Go to Sam's chat"</li>
                  <li>• "Go to John's chat"</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-blue-600 mb-2">Reply Commands:</h4>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• "Reply to last message from Sam"</li>
                  <li>• "Reply to second last message from John"</li>
                  <li>• "Send message Hello there"</li>
                </ul>
              </div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> This is a demo version. In the full implementation, the app would integrate directly with WhatsApp's accessibility APIs and auto-launch when WhatsApp opens.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Voice Overlay */}
      <VoiceOverlay
        isVisible={isOverlayVisible}
        onHide={() => setIsOverlayVisible(false)}
        onShow={() => setIsOverlayVisible(true)}
        onOpenChat={handleOpenChat}
        onReplyTo={handleReplyTo}
        onSendMessage={handleSend}
        onBack={handleBack}
      />
    </div>
  );
};

export default WhatsAppVoiceApp;
