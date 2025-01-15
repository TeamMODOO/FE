"use client";
import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MeetingRoom } from "@/model/MeetingRoom";
import { getHostName } from "@/queries/myroom/getName";

type RoomCardProps = {
  item: MeetingRoom;
};

export const RoomCard = ({ item }: RoomCardProps) => {
  const router = useRouter();
  const [hostName, setHostName] = useState("");

  useEffect(() => {
    async function fetchData() {
      const name = await getHostName(item.clients[0]);
      setHostName(name);
    }

    fetchData();
  }, []);
  return (
    <Card
      className="
        min-h-[10dvh]
        w-full
        cursor-pointer
        overflow-hidden
        border-[rgba(111,99,98,1)]
        bg-[rgba(55,55,55,0.6)]
        text-white
        hover:bg-[rgba(155,155,155,0.6)]
      "
      onClick={() => router.push(`/meetingroom/${item.room_id}`)}
    >
      <CardHeader>
        <CardTitle
          className="
            text-xl
            text-fuchsia-700
          "
        >
          {item.title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          <li className="flex items-center gap-2 text-lg">
            <span className="truncate">방장: {hostName}</span>
          </li>
        </ul>
      </CardContent>
    </Card>
  );
};
