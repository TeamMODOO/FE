"use client";

import { Input } from "@/components/ui/input";

export const ChatInput = () => {
  const handleSendMessage = async (text: string) => {
    // 빈 메세지가 오지 못하도록 처리
    if (!text.trim().length) {
      return;
    }
  };

  return (
    <div className="p-3">
      <Input
        placeholder="send message"
        onKeyDown={(e) => {
          if (e.key === "Enter" && e.nativeEvent.isComposing === false) {
            // enter 키를 누르면 메세지가 전송되도록.
            // e.nativeEvent.isComposing === false - 한글 두번 입력현상 방지
            handleSendMessage(e.currentTarget.value);
            e.currentTarget.value = ""; // 메세지를 전송하고 나서 칸을 비워준다.
          }
        }}
      />
    </div>
  );
};
