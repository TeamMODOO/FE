"use client";

import { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  CreateNoticePayload,
  useCreateNoticeQuery,
} from "@/queries/lobby/useCreateNoticeQuery";
import { useNoticeDetailQuery } from "@/queries/lobby/useNoticeDetailQuery";
import { useNoticesListQuery } from "@/queries/lobby/useNoticesQuery";

// ─────────────────────────────────────────────────────────────────────────────
// 추가) NoticeItem 타입
export interface NoticeItem {
  id: number;
  name: string;
  message: string;
}

// 컴포넌트
import NoticeCreateForm from "./NoticeCreateForm";
import NoticeDetail from "./NoticeDetail";
import NoticeList from "./NoticeList";

// ─────────────────────────────────────────────────────────────────────────────
// (A) 모달에서 받는 props 인터페이스 수정
export interface NoticeBoardModalProps {
  open: boolean; // 모달 열림/닫힘
  onClose: (open: boolean) => void; // 모달 닫기 함수

  // 새로 추가한 props들
  noticeList: NoticeItem[];
  writerName: string;
  writerMessage: string;
  setWriterName: React.Dispatch<React.SetStateAction<string>>;
  setWriterMessage: React.Dispatch<React.SetStateAction<string>>;
  handleAddNotice: () => void;
}

/**
 * 공지사항 모달 컴포넌트
 *  - 목록 조회 (useNoticesListQuery)
 *  - 공지사항 클릭 시 상세 조회 (useNoticeDetailQuery)
 *  - 글 작성 (useCreateNoticeQuery)
 *  - 부모에서 관리하는 noticeList 등을 함께 전달받아 사용할 수도 있음
 */
export default function NoticeBoardModal({
  open,
  onClose,
  // 새로 추가한 props
  noticeList,
  writerName,
  writerMessage,
  setWriterName,
  setWriterMessage,
  handleAddNotice,
}: NoticeBoardModalProps) {
  // 1) 목록 조회 쿼리 (서버 데이터)
  const {
    data: serverNoticesList, // ← 기존 noticesList → serverNoticesList 로 변경
    isError: isListError,
    error: listError,
  } = useNoticesListQuery();

  // 2) 상세 보기 위한 noticeId
  const [selectedNoticeId, setSelectedNoticeId] = useState<number | null>(null);
  const {
    data: selectedNotice,
    isError: isDetailError,
    error: detailError,
  } = useNoticeDetailQuery(selectedNoticeId);

  // 3) 글 작성 모드 on/off
  const [isWriting, setIsWriting] = useState(false);

  // 5) 게시글 작성 훅
  const { mutate: createNotice, status } = useCreateNoticeQuery();
  const isPosting = status === "pending";

  // (A) "작성하기" 버튼 로직
  const handleCreate = () => {
    if (!writerName.trim() || !writerMessage.trim()) {
      alert("이름과 메세지를 입력하세요.");
      return;
    }

    // 서버로 보낼 payload (title → writerName, content → writerMessage)
    const payload: CreateNoticePayload = {
      title: writerName,
      content: writerMessage,
    };

    createNotice(payload, {
      onSuccess: (res) => {
        // 폼 리셋
        setWriterName("");
        setWriterMessage("");
        setIsWriting(false);
        alert(res.message); // "게시글 작성 성공"
      },
      // ↓↓↓ 이 부분에서 any → unknown
      onError: (err: unknown) => {
        // err가 AxiosError인지 확인 후 처리 (예시)
        // const axiosError = err as AxiosError;
        // alert(axiosError?.response?.data?.detail || "게시글 작성 중 오류가 발생했습니다.");
        console.error(err);
        alert("게시글 작성 중 오류가 발생했습니다.");
      },
    });
  };

  // (B) 화면 모드별 렌더링
  function renderContent() {
    // 상세 보기 모드
    if (selectedNoticeId) {
      return (
        <NoticeDetail
          isError={isDetailError}
          error={detailError}
          notice={selectedNotice}
          onBack={() => setSelectedNoticeId(null)} // 목록으로
        />
      );
    }

    // 글 작성 모드
    if (isWriting) {
      return (
        <NoticeCreateForm
          writerName={writerName}
          writerMessage={writerMessage}
          setWriterName={setWriterName}
          setWriterMessage={setWriterMessage}
          onCreate={handleCreate}
          onCancel={() => setIsWriting(false)}
          isPosting={isPosting}
        />
      );
    }

    // 기본(목록) 모드
    return (
      <NoticeList
        isError={isListError}
        error={listError}
        noticesList={serverNoticesList}
        onSelectNotice={(id) => setSelectedNoticeId(id)}
        onClickWrite={() => setIsWriting(true)}
      />
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-lg">
        <DialogHeader>
          <DialogTitle>공지사항</DialogTitle>
        </DialogHeader>
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
}
