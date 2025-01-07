import { Dispatch, SetStateAction } from "react";

import { Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type ChatInputType = {
  messageValue: string;
  setMessageValue: Dispatch<SetStateAction<string>>;
  sendMessage: (e: React.FormEvent) => void;
};

export const ChatInput = ({
  messageValue,
  setMessageValue,
  sendMessage,
}: ChatInputType) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key !== "Enter") return;
    if (e.shiftKey) return;
    else {
      e.preventDefault(); // 기본 줄바꿈 동작 방지
      sendMessage(e);
    }
  };

  return (
    <form
      onSubmit={sendMessage}
      className="flex w-[350px] justify-between gap-2"
    >
      <Textarea
        value={messageValue}
        placeholder="send message"
        onKeyDown={handleKeyDown}
        onChange={(e) => setMessageValue(e.target.value)}
        className="min-h-[40px] w-[270px] resize-none p-2"
      />
      <Button type="submit" size="icon" className="size-[58px]">
        <Send className="size-4" />
      </Button>
    </form>
  );
};
