import { Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Position } from "@/model/chatting";

import { ChatInput } from "./ChatInput";

interface ChatInputAreaProps extends Position {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
}

export function ChatInputArea({
  position,
  value,
  onChange,
  onSubmit,
  onKeyDown,
}: ChatInputAreaProps) {
  if (position === "right") {
    return <ChatInput value={value} onChange={onChange} onSubmit={onSubmit} />;
  }

  return (
    <form onSubmit={onSubmit} className="flex w-[286px] justify-between gap-2">
      <Textarea
        value={value}
        placeholder="send message"
        onKeyDown={onKeyDown}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-[40px] w-[225px] resize-none p-2"
      />
      <Button type="submit" size="icon" className="size-[58px]">
        <Send className="size-4" />
      </Button>
    </form>
  );
}
