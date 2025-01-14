import { Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ChatInputAreaProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
}

export function ChatInputArea({
  value,
  onChange,
  onSubmit,
  onKeyDown,
}: ChatInputAreaProps) {
  return (
    <form onSubmit={onSubmit} className="flex w-[286px] justify-between gap-2">
      <Textarea
        value={value}
        placeholder="여기에 내용을 입력하세요..."
        onKeyDown={onKeyDown}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-[40px] w-[225px] resize-none
        border-[rgba(111,99,98,1)]
        bg-[rgba(255,255,255,0.7)] p-2 !text-xl"
      />
      <Button
        type="submit"
        size="icon"
        className="size-[58px] border-2
        border-[rgba(111,99,98,1)] bg-gradient-to-b from-black/10 to-black/20 hover:bg-[rgba(85,85,85,0.5)"
      >
        <Send className="size-4" />
      </Button>
    </form>
  );
}
