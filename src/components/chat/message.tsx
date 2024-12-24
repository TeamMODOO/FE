import { ChattingType } from "@/model/chatting";

export const Message = ({ message }: { message: ChattingType }) => {
  return (
    <div className="flex gap-2">
      <div className="flex-1">
        <div className="flex w-full items-center justify-between">
          <h1 className="font-bold">{message.user_name}</h1>
          <h1 className="text-sm text-gray-400">{message.create_at}</h1>
        </div>
        <p className="text-gray-300">{message.chat_text}</p>
      </div>
    </div>
  );
};
