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

import { BoardModalProps } from "../../_model/Board";
import Style from "./BoardModal.style";

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
      <DialogContent className={Style.dialogContent}>
        <DialogHeader>
          <DialogTitle>방명록</DialogTitle>
        </DialogHeader>

        {/* 댓글 목록 */}
        <div className={Style.commentListContainer}>
          {boardComments.map((comment) => (
            <div key={comment.id} className={Style.singleCommentContainer}>
              <div className={Style.commentName}>{comment.name}</div>
              <div className={Style.commentMessage}>{comment.message}</div>
            </div>
          ))}
        </div>

        {/* 입력폼 */}
        <div className={Style.formContainer}>
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

          <Button className={Style.submitButton} onClick={handleAddComment}>
            작성하기
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BoardModal;
