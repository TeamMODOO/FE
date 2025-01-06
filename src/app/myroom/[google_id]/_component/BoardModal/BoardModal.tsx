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
import { useGuestBookGet } from "@/hooks/myroom/useGuestBookGet";
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
  const hostGoogleId = params.google_id as string;

  // 1) 비밀 여부 체크박스 상태
  const [isSecret, setIsSecret] = useState<boolean>(false);

  // 2) useGuestBookPost 훅 사용
  const { postGuestBook, postLoading, postError, postData } =
    useGuestBookPost(hostGoogleId);

  // 3) 방명록 목록 조회 훅
  const {
    guestBooks,
    loading: getLoading,
    error: getError,
    fetchGuestBookList,
  } = useGuestBookGet(hostGoogleId);

  // 4) 작성하기 버튼 클릭 시 호출되는 함수
  const handleAddComment = async () => {
    try {
      // 방명록 작성 API 호출
      await postGuestBook(visitorMessage, isSecret);
      // 작성 후, 비우기 & 방명록 새로고침
      setVisitorMessage("");
      setIsSecret(false);

      // 작성 완료 후 방명록 목록 다시 불러오기
      await fetchGuestBookList();
    } catch (err) {
      // console.error("방명록 작성 중 에러:", err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className={Style.dialogContent}>
        <DialogHeader>
          <DialogTitle>방명록</DialogTitle>
        </DialogHeader>

        {/* 방명록 목록 */}
        <div className={Style.commentListContainer}>
          {/* 로딩 상태 표시 */}
          {getLoading && <p>방명록을 불러오는 중입니다...</p>}
          {/* 에러 메시지 표시 */}
          {getError && <p style={{ color: "red" }}>{getError}</p>}

          {/* 방명록 목록 표시 */}
          {!getLoading && guestBooks && guestBooks.length === 0 && (
            <p>아직 작성된 방명록이 없습니다.</p>
          )}
          {guestBooks &&
            guestBooks.map((entry) => (
              <div key={entry.id} className={Style.singleCommentContainer}>
                <div className={Style.commentName}>
                  {entry.author_name}
                  {entry.is_secret && " (비밀)"}
                </div>
                <div className={Style.commentMessage}>
                  {entry.is_secret
                    ? "비밀 방명록입니다." // 실제로 방 주인만 보려면 서버 로직에서 처리
                    : entry.content}
                </div>
              </div>
            ))}
        </div>

        {/* 방명록 작성 폼 */}
        <div className={Style.formContainer}>
          <Label htmlFor="message" className="text-black">
            방명록 남기기
          </Label>

          {/* <div className={Style.isSecret}>
            <input
              type="checkbox"
              checked={isSecret}
              onChange={(e) => setIsSecret(e.target.checked)}
            />
            <span>방 주인에게만 보이기</span>
          </div> */}

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
