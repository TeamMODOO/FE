import { Dispatch, SetStateAction } from "react";

import { Input } from "@/components/ui/input";

type ChatInputType = {
  messageValue: string;
  setMessageValue: Dispatch<SetStateAction<string>>;
  handleSendMessage: () => void;
};

export const ChatInput = ({
  messageValue,
  setMessageValue,
  handleSendMessage,
}: ChatInputType) => {
  return (
    <div className="p-3">
      <Input
        value={messageValue}
        placeholder="send message"
        onChange={(e) => setMessageValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.nativeEvent.isComposing) {
            handleSendMessage();
          }
        }}
      />
    </div>
  );
};
