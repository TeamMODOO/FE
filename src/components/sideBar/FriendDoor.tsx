"use client";

import { useRouter } from "next/navigation";
import React, { useState } from "react";

interface Friend {
  id: string;
  name: string;
  avatar: string;
  status: string;
}

interface FriendDoorProps {
  friend: Friend;
}

const FriendDoor: React.FC<FriendDoorProps> = ({ friend }) => {
  const [isSelected, setIsSelected] = useState(false); // 클릭된 상태 관리
  const router = useRouter();

  const toggleSelection = () => {
    setIsSelected((prev) => !prev);
  };

  const handleClick = () => {
    router.push(`/myroom/${friend.id}`); // 동적 경로로 이동
  };

  return (
    <div
      className="relative flex cursor-pointer flex-col items-center rounded-lg"
      style={{
        backgroundImage: `url(${friend.status === "참여" ? "/furniture/litdoor.png" : "/furniture/unlitdoor.png"})`,
        backgroundSize: "contain",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        width: "120px", // 문 너비
        height: "180px", // 문 높이
        marginBottom: "30px", // 고정 높이 유지
      }}
      onClick={toggleSelection} // 클릭 이벤트
    >
      {/* 아바타 및 이름 */}
      <div className="absolute bottom-2 flex flex-col items-center justify-center">
        <img
          src={friend.avatar}
          alt={`${friend.name} avatar`}
          className="mb-1 size-20 rounded-full"
        />
        <p className="bg-gray-200 text-center text-base font-bold text-black shadow-md">
          {friend.name}
        </p>
      </div>

      {/* 버튼 */}
      {isSelected && (
        <div className="absolute bottom-[-25px] flex w-full flex-row items-center justify-between gap-1 px-2">
          <button
            className="flex-1 rounded bg-blue-500 py-1 text-xs text-white hover:bg-blue-600"
            onClick={handleClick}
          >
            방 이동
          </button>
          <button
            className="flex-1 rounded bg-green-500 py-1 text-xs text-white hover:bg-green-600"
            onClick={() => alert(`${friend.name}와 대화합니다.`)}
          >
            대화
          </button>
        </div>
      )}
    </div>
  );
};

export default FriendDoor;
