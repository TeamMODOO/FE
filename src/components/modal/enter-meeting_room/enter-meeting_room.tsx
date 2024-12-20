"use client";

import { useState } from "react";

import { CardPagination } from "@/components/modal/enter-meeting_room/pagination";
import { RoomCard } from "@/components/modal/enter-meeting_room/room";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const EnterMeetingRoom = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [roomName, setRoomName] = useState("");
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">미팅룸 참여하기</Button>
      </DialogTrigger>

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

          <TabsContent value="participate">
            <div className="grid grid-cols-3 gap-4 py-4">
              {[...Array(6)].map((_, i) => (
                <RoomCard key={i} />
              ))}
            </div>
            <CardPagination />
          </TabsContent>
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
          {/* <DialogFooter>
            <Button type="submit">Save changes</Button>
          </DialogFooter> */}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
