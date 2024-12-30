"use client";

import React, { useState } from "react";

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

import { RoomCard } from "./Room";

/**
 * 외부에서 모달 열림/닫힘을 제어하기 위해
 * open, onOpenChange를 props로 받도록
 */
interface EnterMeetingRoomProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EnterMeetingRoom: React.FC<EnterMeetingRoomProps> = ({
  open,
  onOpenChange,
}) => {
  const [roomName, setRoomName] = useState("");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/*
        (★) DialogTrigger 제거
        => 이제 버튼 없이, 외부에서 open=true로 열기
      */}
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
            <div className="h-full overflow-y-auto pr-4">
              <div className="mt-4 grid h-[310px] grid-cols-2 gap-4 overflow-y-auto pb-4">
                {[...Array(6)].map((_, i) => (
                  <RoomCard key={i} id={String(i)} />
                ))}
              </div>
            </div>
          </TabsContent>

          {/* 방 만들기 탭 */}
          <TabsContent value="make">
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
              <Button type="submit" className="mt-4">
                생성하기
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};