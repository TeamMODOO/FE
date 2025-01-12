import { formatTime } from "@/lib/utils/date";
import type { ChatMessage as ChatMessageType } from "@/model/chatting";

interface ChatMessageProps {
  message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
  return (
    <div className="mb-2">
      <div className="rounded-lg bg-secondary p-3">
        <div className="flex flex-col gap-1">
          <div className="flex justify-between">
            <span className="font-medium">{message.user_name}</span>
            <span className="text-xs text-muted-foreground">
              {formatTime(message.create_at)}
            </span>
          </div>
          <span className="max-w-[326px] whitespace-pre-wrap break-all text-sm">
            {message.message}
          </span>
        </div>
      </div>
    </div>
  );
}
