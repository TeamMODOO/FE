"use client";

import React from "react";

import { useRouter } from "next/navigation";

// Friend 인터페이스는 서버와 소켓에서 받은 데이터를 통합하여 표현
interface Friend {
  id: string; // 서버에서 받은 client_id
  name: string; // 서버에서 받은 user_name
  status: string; // 소켓을 통해 확인된 접속 상태
}

interface FriendDoorProps {
  friend: Friend;
}

const FriendDoor = ({ friend }: FriendDoorProps) => {
  const router = useRouter();

  // 방 이동 핸들러
  const handleRoomMove = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/myroom/${friend.id}`);
  };

  return (
    <div
      className="
      relative 
      mt-[1dvh] 
      flex 
      cursor-pointer 
      flex-col 
      items-center
      rounded-lg 
      transition-shadow 
      duration-300
      hover:shadow-[0_0_4px_4px_rgba(244,217,105,0.7)]
      "
      style={{
        backgroundImage: `url(${friend.status === "online" ? "/furniture/litdoor.png" : "/furniture/unlitdoor.png"})`,
        backgroundSize: "contain",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        width: "101px",
        height: "180px",
        marginBottom: "30px",
      }}
      onClick={handleRoomMove}
    >
      {/* 아바타 및 이름 섹션 */}
      <div className="absolute bottom-6 flex flex-col items-center justify-center">
        <p className="bg-[rgba(10,10,10,1)] text-center text-base font-bold text-yellow-600 shadow-md">
          {friend.name}
        </p>
      </div>
    </div>
  );
};

export default FriendDoor;
