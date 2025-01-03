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
// 공지사항 모델
import { NoticeBoardModalProps } from "@/model/NoticeBoard";

import Style from "./NoticeBoardModal.style";

/**
 * 공지사항(Notice) 모달
 */
const NoticeBoardModal: React.FC<NoticeBoardModalProps> = ({
  open,
  onClose,
  noticeList,
  writerName,
  writerMessage,
  setWriterName,
  setWriterMessage,
  handleAddNotice,
}) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className={Style.dialogContent}>
        <DialogHeader>
          <DialogTitle>공지사항</DialogTitle>
        </DialogHeader>

        {/* 글 목록 */}
        <div className={Style.commentListContainer}>
          {noticeList.map((notice) => (
            <div key={notice.id} className={Style.singleCommentContainer}>
              <div className={Style.commentName}>{notice.name}</div>
              <div className={Style.commentMessage}>{notice.message}</div>
            </div>
          ))}
        </div>

        {/* 작성 폼 */}
        <div className={Style.formContainer}>
          <Label htmlFor="writerName" className="text-black">
            작성자
          </Label>
          <Input
            id="writerName"
            placeholder="작성자명"
            value={writerName}
            onChange={(e) => setWriterName(e.target.value)}
          />

          <Label htmlFor="writerMessage" className="text-black">
            내용
          </Label>
          <Input
            id="writerMessage"
            placeholder="내용을 입력하세요"
            value={writerMessage}
            onChange={(e) => setWriterMessage(e.target.value)}
          />

          <Button className={Style.submitButton} onClick={handleAddNotice}>
            등록하기
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NoticeBoardModal;
