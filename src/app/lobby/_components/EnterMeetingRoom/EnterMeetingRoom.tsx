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

  const [roomName, setRoomName] = useState("");
  // 데이터 요청
  const { data, isLoading, isError, refetch } = useMeetingRoom();
  const { mutate: createNotice } = useCreateMeetingRoom();

  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const clientId = localStorage.getItem("client_id") ?? "";
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

  // const handleRefresh = () => {
  //   refetch();
  // };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="
        bg-color-none
        h-[70dvh] 
        w-[70dvw]
        overflow-hidden
        rounded-xl
        border-2
        border-[rgba(111,99,98,1)] 
        bg-gradient-to-b 
        from-black/20
        to-black/80 
        text-white
        [backdrop-filter:blur(2px)]
        [font-family:var(--font-noto-serif-kr),serif]
      "
      >
        <Tabs defaultValue="participate" className="flex size-full flex-col">
          <DialogHeader>
            <DialogTitle>
              <TabsList
                className="
                grid
                min-h-[7dvh] 
                w-full
                grid-cols-2
                border-2
                border-[rgba(111,99,98,1)]
                bg-[rgba(155,155,155,0.6)]
                text-xl
                text-white
                "
              >
                <TabsTrigger
                  value="participate"
                  className="
                  mx-[0.3dvw]
                  h-[5dvh]
                  p-0
                  text-xl
                  data-[state=active]:bg-[rgba(255,255,255,0.7)]
                  data-[state=active]:text-[rgba(111,99,98,1)]
                  "
                >
                  방 참여하기
                </TabsTrigger>
                <TabsTrigger
                  value="make"
                  className="
                  data-[state=active]:text-bold 
                  min-h-[4dvh]
                  p-0
                  text-xl
                  data-[state=active]:bg-[rgba(255,255,255,0.7)]
                  data-[state=active]:text-[rgba(111,99,98,1)]
                  "
                >
                  방 만들기
                </TabsTrigger>
              </TabsList>
            </DialogTitle>
          </DialogHeader>

          {/* 방 참여하기 탭 */}
          <TabsContent
            value="participate"
            className="
            flex-1
            p-1
            "
          >
            <div className="mb-2 flex justify-end">
              <Button
                variant="outline"
                size="icon"
                className="bg-[rgba(155,155,155,0.6)]"
                // onClick={handleRefresh}
                // disabled={isLoading}
              >
                <RefreshCw
                  className="
                  size-4"
                />
              </Button>
            </div>
            <div
              className="
              custom-scrollbar 
              max-h-[55dvh]
              min-h-[35dvh]
              overflow-y-auto
              rounded-lg
              pr-1
            "
            >
              <div
                className="
                  mt-4
                  grid 
                  grid-cols-2 
                  gap-4 
                  overflow-y-auto 
                  pb-4
                  text-base
              "
              >
                {data && data?.length > 0 ? (
                  data.map((item, i) => <RoomCard key={i} item={item} />)
                ) : (
                  <div
                    className="
                    flex 
                    size-full items-center justify-center
                    text-xl
                  "
                  >
                    <p>아직 생성된 방이 없습니다.</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* 방 만들기 탭 */}
          <TabsContent value="make" className="h-full">
            {session?.user?.role === "guest" ? (
              <div className="flex h-full flex-col justify-between">
                <div className="mt-20 text-center text-xl">
                  <p>게스트 로그인 상태입니다.</p>
                  <p>방 참여만 가능합니다.</p>
                </div>
                <Button
                  type="submit"
                  className="
                  h-[5dvh] 
                  text-center
                  text-xl
                  
                  "
                  onClick={() => {
                    router.push("/signin");
                  }}
                >
                  로그인 하러가기
                </Button>
              </div>
            ) : (
              <div
                className="
                mt-[3dvh]
                flex
                h-[30dvh]
                flex-col
                gap-4 
                rounded-xl
                border-2 
                border-[rgba(111,99,98,1)] 
                bg-[rgba(255,255,255,0.5)]
                p-5
                "
              >
                <div
                  className="
                        flex
                        flex-col 
                        justify-center
                        gap-2
                        rounded-xl
                        "
                >
                  <Label
                    htmlFor="roomName"
                    className="mb-4 mt-[3dvh] text-2xl text-fuchsia-700
                    "
                  >
                    방 제목
                  </Label>
                  <Input
                    id="roomName"
                    value={roomName}
                    className="
                    min-h-[5dvh]
                    flex-1
                    border-2
                    border-[rgba(111,99,98,1)]
                    bg-[rgba(255,255,255,0.7)]
                    !text-xl
                    text-black
                    placeholder:text-xl
                    "
                    onChange={(e) => setRoomName(e.target.value)}
                    placeholder="방 제목을 입력하세요"
                  />
                </div>
                <Button
                  type="submit"
                  className="
                  mt-4
                  h-[4dvh]
                  text-xl
                  "
                  onClick={handleSubmit}
                >
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
