"use client";

import { Users, X } from "lucide-react";
import React, { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

import FriendDoor from "./FriendDoor";

export const friends = Array.from({ length: 30 }, (_, index) => ({
  id: `friend-${index}`,
  name: `친구 ${index + 1}`,
  status: index % 2 === 0 ? "참여" : "비참여",
  avatar: `/profile/profile${((index + 1) % 3) + 1}.png`,
}));

export const FriendInformation: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const toggleWidget = () => setIsOpen(!isOpen);

  return (
    <>
      {isOpen && (
        <Card className="fixed inset-0 z-[60] flex flex-col md:bottom-auto md:left-auto md:right-4 md:top-4 md:h-[calc(100vh-2rem)] md:w-96">
          <CardHeader className="pt-safe-top flex flex-row items-center justify-between md:pt-0">
            <h3 className="font-semibold">친구 목록</h3>
            <Button variant="ghost" size="icon" onClick={toggleWidget}>
              <X className="size-4" />
            </Button>
          </CardHeader>
          <CardContent className="grow overflow-auto">
            <div className="grid grid-cols-3 gap-2">
              {friends.map((friend) => (
                <FriendDoor key={friend.id} friend={friend} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      {!isOpen && (
        <Button
          onClick={toggleWidget}
          size="icon"
          className="fixed right-20 top-4 z-50 size-12 rounded-full"
        >
          <Users className="size-6" />
        </Button>
      )}
    </>
  );
};

export default FriendInformation;
