
import React, { useState, useEffect } from 'react';
import VoiceOverlay from './VoiceOverlay';
import { Button } from '@/components/ui/button';
import { MessageSquare, Mic, Smartphone, Users, Accessibility } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const WhatsAppVoiceApp: React.FC = () => {
  const [isOverlayVisible, setIsOverlayVisible] = useState(false);
  const [isWhatsAppDetected, setIsWhatsAppDetected] = useState(false);
  const [permissionsGranted, setPermissionsGranted] = useState(false);

  useEffect(() => {
    // Simulate WhatsApp detection
    const checkWhatsApp = () => {
      // In a real implementation, this would detect if WhatsApp is active
      setIsWhatsAppDetected(true);
    };

    checkWhatsApp();
    
    // Auto-show overlay when WhatsApp is detected
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

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {features.map((feature, index) => (
            <Card key={index} className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-center mb-2">
                  {feature.icon}
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
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
      />
    </div>
  );
};

export default WhatsAppVoiceApp;
