"use client";

import { ArrowDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Message } from "./message";

const messages = [
  {
    created_at: "2000.02.28",
    id: "123",
    text: "123",
    user_id: "123",
    users: {
      avatar_url: "",
      created_at: "20000228",
      display_name: "123",
      id: "123",
    },
  },
  {
    created_at: "2000.02.28",
    id: "123",
    text: "123",
    user_id: "123",
    users: {
      avatar_url: "",
      created_at: "20000228",
      display_name: "123",
      id: "123",
    },
  },
];

export const ListMessages = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const [userScrolled, setUserScrolled] = useState(false); // scroll관리를 위한 state
  const [notification, setNotification] = useState(0); // 새로운 메세지가 왔을때 notification을 위한 state

  useEffect(() => {
    const scrollContainer = scrollRef.current;

    if (scrollContainer && !userScrolled) {
      scrollContainer.scrollTop = scrollContainer.scrollHeight;
    }
  }, []);

  const handleOnScroll = () => {
    const scrollContainer = scrollRef.current;
    if (scrollContainer) {
      // scroll 높이를 계산해 밑에있으면 false, 위로 뜨면 true
      const isScroll =
        scrollContainer.scrollTop <
        scrollContainer.scrollHeight - scrollContainer.clientHeight - 10;

      setUserScrolled(isScroll);

      if (!isScroll) {
        setNotification(0);
      }
    }
  };

  // // 스크롤을 내려주는 함수
  const scrollDown = () => {
    if (scrollRef.current)
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  };

  return (
    <>
      <div
        className="flex h-full flex-1 flex-col overflow-y-auto p-3"
        ref={scrollRef}
        onScroll={handleOnScroll}
      >
        {/* <div className="flex-1 pb-5">
          <LoadMoreMessages />
        </div> */}
        <div className="space-y-7">
          {messages.map((value, idx) => {
            return <Message key={idx} message={value} />;
          })}
        </div>
        {/* 아래로 가는 화살표. 아래로 내려갔을때만 표시되도록. */}
        {userScrolled && (
          <div className="absolute bottom-20 w-full">
            {notification ? (
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
        )}
      </div>
    </>
  );
};
