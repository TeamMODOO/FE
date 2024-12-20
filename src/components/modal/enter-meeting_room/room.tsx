import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";

export const RoomCard = () => {
  return (
    <Card className="w-[250px]">
      <CardHeader>
        <CardTitle>제목</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          <li className="flex items-center gap-2">
            <span>운동가기</span>
          </li>
        </ul>
      </CardContent>
    </Card>
  );
};
