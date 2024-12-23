"use client";

import React from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { BoardModalProps } from "../_model/Board";

const BoardModal: React.FC<BoardModalProps> = ({
  open,
  onClose,
  boardComments,
  visitorName,
  visitorMessage,
  setVisitorName,
  setVisitorMessage,
  handleAddComment,
}) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[500px]">
        <DialogHeader>
          <DialogTitle>방명록</DialogTitle>
        </DialogHeader>

        {/* 댓글 목록 */}
        <div className="mt-4 max-h-[300px] overflow-y-auto border p-2">
          {boardComments.map((comment) => (
            <div key={comment.id} className="mb-4">
              <div className="font-bold text-black">{comment.name}</div>
              <div className="text-black">{comment.message}</div>
            </div>
          ))}
        </div>

        {/* 입력폼 */}
        <div className="mt-4 flex flex-col gap-2">
          <Label htmlFor="name" className="text-black">
            이름
          </Label>
          <Input
            id="name"
            placeholder="이름을 입력하세요"
            value={visitorName}
            onChange={(e) => setVisitorName(e.target.value)}
          />

          <Label htmlFor="message" className="text-black">
            글
          </Label>
          <Input
            id="message"
            placeholder="글 내용을 입력하세요"
            value={visitorMessage}
            onChange={(e) => setVisitorMessage(e.target.value)}
          />

          <Button className="mt-2" onClick={handleAddComment}>
            작성하기
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BoardModal;
