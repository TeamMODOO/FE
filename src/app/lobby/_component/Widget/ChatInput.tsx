import { Dispatch, SetStateAction } from "react";

import { Input } from "@/components/ui/input";

type ChatInputType = {
  messageValue: string;
  setMessageValue: Dispatch<SetStateAction<string>>;
};

export const ChatInput = ({ messageValue, setMessageValue }: ChatInputType) => {
  return (
    <Input
      value={messageValue}
      placeholder="send message"
      onChange={(e) => setMessageValue(e.target.value)}
    />
  );
};
