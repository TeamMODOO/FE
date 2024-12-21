import React from "react";

import { friends } from "./friends";

export const FriendInformation: React.FC = () => {
  return (
    <div className="h-full overflow-hidden p-2">
      <div className="grid grid-cols-3 gap-1">
        {" "}
        {/* 문 사이 간격 최소화 */}
        {friends.map((friend, index) => {
          const backgroundImage =
            friend.status === "참여"
              ? "/furniture/litdoor.png"
              : "/furniture/unlitdoor.png";

          return (
            <div
              key={index}
              className="relative flex flex-col items-center rounded-lg"
              style={{
                backgroundImage: `url(${backgroundImage})`,
                backgroundSize: "contain", // 원래 해상도 비율 유지
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center",
                width: "120px", // 문 너비 확대
                height: "180px", // 문 높이 확대
                marginBottom: "40px", // 동그라미가 잘리지 않도록 여백 추가
              }}
            >
              {/* 회색 동그라미 컴포넌트 */}
              <div className="absolute bottom-[-10px] flex size-20 flex-col items-center justify-center bg-gray-200 shadow-md">
                {/* 아바타 */}
                <img
                  src={friend.avatar}
                  alt={`${friend.name} avatar`}
                  className="size-15 mb-1 rounded-full" // 더 작은 아바타 크기
                />
                {/* 이름 */}
                <p className="text-center text-base font-bold text-black">
                  {friend.name}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
