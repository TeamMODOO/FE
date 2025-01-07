import { useRouter } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MeetingRoom } from "@/model/MeetingRoom";

type RoomCardProps = {
  item: MeetingRoom;
};

export const RoomCard = ({ item }: RoomCardProps) => {
  const router = useRouter();

  return (
    <Card
      className="w-full"
      onClick={() => router.push(`/meetingroom/${item.room_id}`)}
    >
      <CardHeader>
        <CardTitle>제목</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          <li className="flex items-center gap-2">
            <span>{item.title}</span>
          </li>
        </ul>
      </CardContent>
    </Card>
  );
};
