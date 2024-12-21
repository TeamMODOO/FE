import Image from "next/image";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const Message = ({ message }: { message: any }) => {
  return (
    <div className="flex gap-2">
      <div>
        <Image
          src={message.users?.avatar_url as string}
          alt={message.users?.display_name as string}
          width={40}
          height={40}
          className="right-2 rounded-full"
        />
      </div>

      <div className="flex-1">
        <div className="flex items-center  justify-between">
          <div className="flex items-center gap-1">
            <h1 className="font-bold">{message.users?.display_name}</h1>
            <h1 className="text-sm text-gray-400">
              {new Date(message.created_at).toDateString()}
            </h1>
          </div>
        </div>
        <p className="text-gray-300">{message.text}</p>
      </div>
    </div>
  );
};
