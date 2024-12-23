import React from "react";

import FriendDoor from "./FriendDoor";
import { friends } from "./friends"; // 친구 데이터

export const FriendInformation: React.FC = () => {
  return (
    <div className="h-full overflow-hidden p-2">
      <div className="grid grid-cols-3 gap-1">
        {friends.map((friend) => (
          <FriendDoor key={friend.id} friend={friend} />
        ))}
      </div>
    </div>
  );
};
