
import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, X, Menu, MessageSquare, ArrowLeft, Volume2, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface VoiceOverlayProps {
  isVisible: boolean;
  onHide: () => void;
  onShow: () => void;
  onOpenChat?: (chatName: string) => void;
  onReplyTo?: (contact: string, messageIndex: number) => void;
  onSendMessage?: (message: string) => void;
  onBack?: () => void;
}

const VoiceOverlay: React.FC<VoiceOverlayProps> = ({ isVisible, onHide, onShow, onOpenChat, onReplyTo, onSendMessage, onBack }) => {
  const [isListening, setIsListening] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [lastCommand, setLastCommand] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [voiceLevel, setVoiceLevel] = useState(0);
  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const results = Array.from(event.results);
        const transcript = results
          .map((result: any) => result[0].transcript)
          .join('');
        
        setTranscript(transcript);
        
        if (event.results[event.results.length - 1].isFinal) {
          processVoiceCommand(transcript);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const processVoiceCommand = async (command: string) => {
    setIsProcessing(true);
    setLastCommand(command);
    
    const lowerCommand = command.toLowerCase();
    
    // Navigation commands
    if (lowerCommand.includes('go back')) {
      if (onBack) onBack();
    } else if (lowerCommand.includes('go to') && lowerCommand.includes('chat')) {
      const chatName = extractChatName(lowerCommand);
      if (chatName && onOpenChat) onOpenChat(capitalize(chatName));
    } else if (lowerCommand.includes('reply to')) {
      const replyContext = extractReplyContext(lowerCommand);
      if (replyContext.contact && onReplyTo) onReplyTo(capitalize(replyContext.contact), replyContext.messageIndex);
    } else if (lowerCommand.includes('send message')) {
      const message = extractMessage(lowerCommand);
      if (message && onSendMessage) onSendMessage(message);
    } else if (lowerCommand.includes('hide overlay')) {
      onHide();
    }
    
    setTimeout(() => {
      setIsProcessing(false);
      setTranscript('');
    }, 2000);
  };

  const extractChatName = (command: string): string => {
    const match = command.match(/go to (\w+)'?s? chat/i);
    return match ? match[1] : '';
  };

  const extractReplyContext = (command: string): { contact: string; messageIndex: number } => {
    const contactMatch = command.match(/reply to (?:the )?(?:last|latest) message from (\w+)/i);
    const indexMatch = command.match(/reply to (?:the )?(\w+) (?:last )?message from (\w+)/i);
    
    if (indexMatch) {
      const numberWord = indexMatch[1];
      const contact = indexMatch[2];
      const index = numberWord === 'second' ? 2 : numberWord === 'third' ? 3 : 1;
      return { contact, messageIndex: index };
    }
    
    return { contact: contactMatch?.[1] || '', messageIndex: 1 };
  };

  const extractMessage = (command: string): string => {
    const match = command.match(/send message (.+)/i);
    return match ? match[1] : '';
  };

  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  const startListening = async () => {
    if (recognitionRef.current) {
      try {
        // Start audio level monitoring
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioContextRef.current = new AudioContext();
        analyserRef.current = audioContextRef.current.createAnalyser();
        const source = audioContextRef.current.createMediaStreamSource(stream);
        source.connect(analyserRef.current);
        
        monitorAudioLevel();
        
        recognitionRef.current.start();
        setIsListening(true);
      } catch (error) {
        console.error('Error starting voice recognition:', error);
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
    setVoiceLevel(0);
  };

  const monitorAudioLevel = () => {
    if (analyserRef.current) {
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      
      const checkLevel = () => {
        if (isListening && analyserRef.current) {
          analyserRef.current.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
          setVoiceLevel(Math.min(100, (average / 255) * 100));
          requestAnimationFrame(checkLevel);
        }
      };
      
      checkLevel();
    }
  };

  if (!isVisible && !isCollapsed) return null;

  return (
    <>
      {/* Collapsed state - swipe handle */}
      {isCollapsed && (
        <div 
          className="fixed left-0 top-1/2 transform -translate-y-1/2 z-50 bg-gradient-to-r from-blue-600 to-purple-600 rounded-r-lg p-2 cursor-pointer animate-pulse"
          onClick={() => setIsCollapsed(false)}
        >
          <Menu className="w-4 h-4 text-white" />
        </div>
      )}

      {/* Main overlay */}
      {!isCollapsed && (
        <Card className="fixed top-4 right-4 w-80 bg-white/90 backdrop-blur-lg border border-white/20 shadow-2xl z-50 animate-fade-in">
          <div className="p-4 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MessageSquare className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-gray-800">Voice Assistant</h3>
              </div>
              <div className="flex space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsCollapsed(true)}
                  className="h-6 w-6 p-0"
                >
                  <Menu className="w-3 h-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onHide}
                  className="h-6 w-6 p-0"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </div>

            {/* Status */}
            <div className="space-y-2">
              {isListening && (
                <Badge variant="default" className="bg-green-500 text-white">
                  <Volume2 className="w-3 h-3 mr-1" />
                  Listening...
                </Badge>
              )}
              {isProcessing && (
                <Badge variant="default" className="bg-blue-500 text-white">
                  Processing command...
                </Badge>
              )}
            </div>

            {/* Voice level indicator */}
            {isListening && (
              <div className="space-y-2">
                <div className="text-xs text-gray-600">Voice Level</div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full transition-all duration-100"
                    style={{ width: `${voiceLevel}%` }}
                  />
                </div>
              </div>
            )}

            {/* Transcript */}
            {transcript && (
              <div className="p-2 bg-gray-50 rounded-lg text-sm">
                <div className="text-xs text-gray-500 mb-1">You said:</div>
                <div className="text-gray-800">{transcript}</div>
              </div>
            )}

            {/* Last command */}
            {lastCommand && (
              <div className="p-2 bg-blue-50 rounded-lg text-sm">
                <div className="text-xs text-blue-600 mb-1">Last command:</div>
                <div className="text-blue-800">{lastCommand}</div>
              </div>
            )}

            {/* Voice controls */}
            <div className="flex justify-center">
              <Button
                onClick={isListening ? stopListening : startListening}
                disabled={isProcessing}
                className={`w-16 h-16 rounded-full ${
                  isListening 
                    ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                    : 'bg-blue-500 hover:bg-blue-600'
                }`}
              >
                {isListening ? (
                  <MicOff className="w-6 h-6 text-white" />
                ) : (
                  <Mic className="w-6 h-6 text-white" />
                )}
              </Button>
            </div>

            {/* Quick commands */}
            <div className="text-xs text-gray-500 space-y-1">
              <div className="font-medium">Quick commands:</div>
              <div>• "Go back"</div>
              <div>• "Go to [name]'s chat"</div>
              <div>• "Reply to last message from [name]"</div>
              <div>• "Send message [your message]"</div>
              <div>• "Hide overlay"</div>
            </div>
          </div>
        </Card>
      )}
    </>
  );
};

export default VoiceOverlay;
