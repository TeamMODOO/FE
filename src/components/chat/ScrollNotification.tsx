import { ArrowDown } from "lucide-react";

interface ScrollNotificationProps {
  userScrolled: boolean;
  notification: number;
  scrollDown: () => void;
}
export const ScrollNotification = ({
  userScrolled,
  notification,
  scrollDown,
}: ScrollNotificationProps) => {
  if (!userScrolled) return null;

  return (
    <div className="absolute bottom-20 w-full">
      {notification > 0 ? (
        <div
          className="mx-auto w-36 cursor-pointer rounded-md bg-indigo-500 p-1 transition-all hover:scale-110"
          onClick={scrollDown}
        >
          <h1>New {notification} Messages</h1>
        </div>
      ) : (
        <div
          className="mx-auto flex size-10 cursor-pointer items-center justify-center rounded-full border bg-blue-500 transition-all hover:scale-110"
          onClick={scrollDown}
        >
          <ArrowDown />
        </div>
      )}
    </div>
  );
};
