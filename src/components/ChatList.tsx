import React from 'react';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

export interface ChatSummary {
  name: string;
  lastMessage: string;
  unreadCount?: number;
}

interface ChatListProps {
  chats: ChatSummary[];
  activeChatName: string | null;
  onSelectChat: (chatName: string) => void;
}

const ChatList: React.FC<ChatListProps> = ({ chats, activeChatName, onSelectChat }) => {
  return (
    <Card className="h-[70vh] md:h-[75vh] overflow-hidden">
      <ScrollArea className="h-full">
        <div className="divide-y">
          {chats.map((chat) => (
            <button
              key={chat.name}
              onClick={() => onSelectChat(chat.name)}
              className={cn(
                'w-full text-left p-4 hover:bg-gray-50 flex items-center justify-between',
                activeChatName === chat.name && 'bg-blue-50'
              )}
            >
              <div>
                <div className="font-medium text-gray-900">{chat.name}</div>
                <div className="text-sm text-gray-500 line-clamp-1">{chat.lastMessage}</div>
              </div>
              {chat.unreadCount ? (
                <div className="ml-3 inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                  {chat.unreadCount}
                </div>
              ) : null}
            </button>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
};

export default ChatList;