// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const Message = ({ message }: { message: any }) => {
  return (
    <div className="flex gap-2">
      <div className="flex-1">
        <div className="flex w-full items-center justify-between">
          <h1 className="font-bold">{message.users?.display_name}</h1>
          <h1 className="text-sm text-gray-400">
            {new Date(message.created_at).toDateString()}
          </h1>
        </div>
        <p className="text-gray-300">{message.text}</p>
      </div>
    </div>
  );
};
