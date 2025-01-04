"use client";

import { useParams } from "next/navigation";
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
import { useGuestBookPost } from "@/hooks/myroom/useGuestBookPost";
import { BoardModalProps } from "@/model/Board";

import Style from "./BoardModal.style";

const BoardModal: React.FC<BoardModalProps> = ({
  open,
  onClose,
  boardComments,
  visitorMessage,
  setVisitorMessage,
}) => {
  // URI에서 방 주인의 Google ID param으로 추출
  const params = useParams();
  const hostGoogleId = params.id as string;

  // 1) 비밀 여부 체크박스 상태
  const [isSecret, setIsSecret] = useState<boolean>(false);

  // 2) useGuestBookPost 훅 사용
  const { postGuestBook, postLoading, postError, postData } =
    useGuestBookPost(hostGoogleId);

  // 3) 작성하기 버튼 클릭 시 호출되는 함수
  const handleAddComment = async () => {
    // 방명록 작성 API 호출
    await postGuestBook(visitorMessage, isSecret);
    // 작성 후, 인풋 내용 비우기 등 추가 처리
    setVisitorMessage("");
    setIsSecret(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className={Style.dialogContent}>
        <DialogHeader>
          <DialogTitle>방명록</DialogTitle>
        </DialogHeader>

        {/* 방명록 목록 */}
        <div className={Style.commentListContainer}>
          {/* 기존 boardComments 부분 or guestBooks를 활용 가능 */}
          {boardComments.map((comment) => (
            <div key={comment.id} className={Style.singleCommentContainer}>
              <div className={Style.commentName}>{comment.name}</div>
              <div className={Style.commentMessage}>{comment.message}</div>
            </div>
          ))}
        </div>

        {/* 방명록 작성 폼 */}
        <div className={Style.formContainer}>
          <Label htmlFor="message" className="text-black">
            방명록 남기기
          </Label>

          <div className={Style.isSecret}>
            {/* 체크박스: isSecret 상태와 연결 */}
            <input
              type="checkbox"
              checked={isSecret}
              onChange={(e) => setIsSecret(e.target.checked)}
            />
            <span>방 주인에게만 보이기</span>
          </div>

          {/* 메시지 입력 필드 */}
          <Input
            id="message"
            placeholder="글 내용을 입력하세요"
            value={visitorMessage}
            onChange={(e) => setVisitorMessage(e.target.value)}
          />

          <Button
            className={Style.submitButton}
            onClick={handleAddComment}
            disabled={postLoading}
          >
            {postLoading ? "작성 중..." : "작성하기"}
          </Button>

          {/* 에러/결과 표시 예시 */}
          {postError && <p style={{ color: "red" }}>{postError}</p>}
          {postData && <p style={{ color: "green" }}>{postData.message}</p>}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BoardModal;
