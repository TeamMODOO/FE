import { useRouter } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type RoomCardProps = {
  id: string;
};

export const RoomCard = ({ id }: RoomCardProps) => {
  const router = useRouter();

  return (
    <Card className="w-full" onClick={() => router.push(`/meetingroom/${id}`)}>
      <CardHeader>
        <CardTitle>제목</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          <li className="flex items-center gap-2">
            <span>운동가기 {id}</span>
          </li>
        </ul>
      </CardContent>
    </Card>
  );
};
