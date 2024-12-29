import { Phone } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface RoomJoinFormProps {
  roomId: string;
  onRoomIdChange: (value: string) => void;
  onJoinRoom: () => void;
}

export function RoomJoinForm({
  roomId,
  onRoomIdChange,
  onJoinRoom,
}: RoomJoinFormProps) {
  return (
    <Card>
      <CardContent>
        <div className="mt-6 flex gap-4">
          <Input
            type="text"
            placeholder="Enter Room ID"
            value={roomId}
            onChange={(e) => onRoomIdChange(e.target.value)}
            className="max-w-sm"
          />
          <Button onClick={onJoinRoom}>
            <Phone className="mr-2 size-4" />
            Join Room
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
