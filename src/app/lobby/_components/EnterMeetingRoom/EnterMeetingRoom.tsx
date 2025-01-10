"use client";

import React, { useState } from "react";

import { useRouter } from "next/navigation";

import { useSession } from "next-auth/react";

import { RefreshCw } from "lucide-react";
import { v4 as uuid } from "uuid";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreateMeetingRoomPayload } from "@/model/MeetingRoom";
import { useMeetingRoom } from "@/queries/meetingroom/useMeetingRoom";
import { useCreateMeetingRoom } from "@/queries/meetingroom/useMeetingRoomCreate";
import useClientIdStore from "@/store/useClientIdStore";

import { RoomCard } from "./Room";

interface EnterMeetingRoomProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EnterMeetingRoom: React.FC<EnterMeetingRoomProps> = ({
  open,
  onOpenChange,
}) => {
  const { data: session } = useSession();
  const { clientId } = useClientIdStore();

  const [roomName, setRoomName] = useState("");
  // 데이터 요청
  const { data, isLoading, refetch } = useMeetingRoom();
  const { mutate: createNotice } = useCreateMeetingRoom();

  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    if (!clientId) return;
    e.preventDefault();

    const roomId = uuid();
    const payload: CreateMeetingRoomPayload = {
      room_id: roomId,
      title: roomName,
      client_id: clientId,
    };

    createNotice(payload, {
      onSuccess: () => {
        setRoomName("");
        router.push(`/meetingroom/${roomId}`);
      },
    });
  };

  const handleRefresh = () => {
    refetch();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="h-[400px] w-[800px]">
        <Tabs defaultValue="participate" className="flex size-full flex-col">
          <DialogHeader>
            <DialogTitle>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="participate">방 참여하기</TabsTrigger>
                <TabsTrigger value="make">방 만들기</TabsTrigger>
              </TabsList>
            </DialogTitle>
          </DialogHeader>

          {/* 방 참여하기 탭 */}
          <TabsContent value="participate" className="flex-1 overflow-hidden">
            <div className="mb-2 flex justify-end">
              <Button
                variant="outline"
                size="icon"
                onClick={handleRefresh}
                disabled={isLoading}
              >
                <RefreshCw className="size-4" />
              </Button>
            </div>
            <div className="h-full overflow-y-auto pr-4">
              <div className="mt-4 grid h-[270px] grid-cols-2 gap-4 overflow-y-auto pb-4">
                {data?.map((item, i) => <RoomCard key={i} item={item} />)}
              </div>
            </div>
          </TabsContent>

          {/* 방 만들기 탭 */}
          <TabsContent value="make" className="h-full">
            {session?.user?.role === "guest" ? (
              <div className="flex h-full flex-col justify-between">
                <div className="mt-20 text-center">
                  <p>게스트 로그인 상태입니다.</p>
                  <p>방 참여만 가능합니다.</p>
                </div>
                <Button
                  type="submit"
                  className="text-center"
                  onClick={() => {
                    router.push("/signin");
                  }}
                >
                  로그인 하러가기
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-4 py-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="roomName">방 이름</Label>
                  <Input
                    id="roomName"
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                    placeholder="방 이름을 입력하세요"
                  />
                </div>
                <Button type="submit" className="mt-4" onClick={handleSubmit}>
                  생성하기
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
