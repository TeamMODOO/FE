import { CardContent } from "@/components/ui/card";
import type { ChatMessage as ChatMessageType } from "@/model/chatting";

import { ChatMessage } from "./RightChatMessage";

interface ChatMessageListProps {
  messages: ChatMessageType[];
  scrollRef: React.RefObject<HTMLDivElement | null>;
  onScroll: () => void;
}

export function ChatMessageList({
  messages,
  scrollRef,
  onScroll,
}: ChatMessageListProps) {
  return (
    <CardContent
      className="custom-scrollbar flex grow flex-col overflow-auto"
      ref={scrollRef}
      onScroll={onScroll}
    >
      <div className="mt-auto">
        {messages.map((message, index) => (
          <ChatMessage key={index} message={message} />
        ))}
      </div>
    </CardContent>
  );
}
