import React, { useRef, useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export interface MessageItem {
  id: string;
  from: 'me' | 'them';
  text: string;
  timestamp: number;
}

interface ChatWindowProps {
  contactName: string | null;
  messages: MessageItem[];
  onSend: (text: string) => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ contactName, messages, onSend }) => {
  const endRef = useRef<HTMLDivElement | null>(null);
  const [draft, setDraft] = useState('');

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    const text = draft.trim();
    if (!text) return;
    onSend(text);
    setDraft('');
  };

  return (
    <Card className="h-[70vh] md:h-[75vh] flex flex-col">
      <div className="px-4 py-3 border-b">
        <div className="text-lg font-semibold text-gray-800">
          {contactName ?? 'Select a chat'}
        </div>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          {messages.map((m) => (
            <div key={m.id} className={`flex ${m.from === 'me' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[75%] rounded-lg px-3 py-2 text-sm shadow-sm ${
                  m.from === 'me'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <div>{m.text}</div>
                <div className={`mt-1 text-[10px] ${m.from === 'me' ? 'text-blue-100' : 'text-gray-500'}`}>
                  {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
          <div ref={endRef} />
        </div>
      </ScrollArea>
      <div className="p-3 border-t flex gap-2">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={contactName ? `Message ${contactName}` : 'Select a chat to start messaging'}
          disabled={!contactName}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
        />
        <Button onClick={handleSend} disabled={!contactName}>
          Send
        </Button>
      </div>
    </Card>
  );
};

export default ChatWindow;