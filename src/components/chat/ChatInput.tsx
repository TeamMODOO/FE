import { Dispatch, SetStateAction } from "react";

import { Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type ChatInputType = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
};

export const ChatInput = ({ value, onChange, onSubmit }: ChatInputType) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key !== "Enter") return;
    if (e.shiftKey) return;
    else {
      e.preventDefault(); // 기본 줄바꿈 동작 방지
      onSubmit(e);
    }
  };

  return (
    <form onSubmit={onSubmit} className="flex w-[350px] justify-between gap-2">
      <Textarea
        value={value}
        placeholder="send message"
        onKeyDown={handleKeyDown}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-[40px] w-[270px] resize-none p-2"
      />
      <Button type="submit" size="icon" className="size-[58px]">
        <Send className="size-4" />
      </Button>
    </form>
  );
};
