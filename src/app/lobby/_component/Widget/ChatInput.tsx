import { Send } from "lucide-react";
import { Dispatch, SetStateAction } from "react";

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
  return (
    <form
      onSubmit={sendMessage}
      className="flex w-[350px] justify-between gap-2"
    >
      <Textarea
        value={messageValue}
        placeholder="send message"
        onChange={(e) => setMessageValue(e.target.value)}
        className="min-h-[40px] w-[270px] resize-none p-2"
      />
      <Button type="submit" size="icon" className="size-[58px]">
        <Send className="size-4" />
      </Button>
    </form>
  );
};
