import { formatTime } from "@/lib/utils/date";
import type { ChatMessage as ChatMessageType } from "@/model/chatting";

interface ChatMessageProps {
  message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
  return (
    <div className="mb-2">
      <div
        className="bg-secondary-none rounded-lg border-2 border-[rgba(111,99,98,1)]
        bg-[rgba(50,50,50,0.7)]
        p-3"
      >
        <div className="flex flex-col gap-1">
          <div className="flex justify-between">
            <span className="text-lg text-[rgba(171,159,158,1)]">
              {message.user_name}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatTime(message.create_at)}
            </span>
          </div>
          <span className="max-w-[326px] whitespace-pre-wrap break-all text-sm text-white">
            {message.message}
          </span>
        </div>
      </div>
    </div>
  );
}
