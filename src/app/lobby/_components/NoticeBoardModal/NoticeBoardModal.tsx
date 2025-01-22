"use client";

import { useEffect, useState } from "react";

import { useSession } from "next-auth/react";

import AlertModal from "@/components/alertModal/AlertModal";
import NeedSignInModal from "@/components/modal/NeedSignIn/NeedSignInModal";
import {
  CreateNoticePayload,
  useCreateNoticeQuery,
} from "@/queries/lobby/useCreateNoticeQuery";
import { useNoticeDetailQuery } from "@/queries/lobby/useNoticeDetailQuery";
import { useNoticesListQuery } from "@/queries/lobby/useNoticesQuery";

import NoticeCreateForm from "./NoticeCreateForm";
import NoticeDetail from "./NoticeDetail";
import NoticeList from "./NoticeList";

import styles from "./NoticeBoardModal.module.css";

export interface NoticeItem {
  id: number;
  name: string;
  message: string;
}

export interface NoticeBoardModalProps {
  open: boolean;
  onClose: () => void;

  noticeList: NoticeItem[];
  writerName: string;
  writerMessage: string;
  setWriterName: React.Dispatch<React.SetStateAction<string>>;
  setWriterMessage: React.Dispatch<React.SetStateAction<string>>;
  handleAddNotice: () => void;
}

export default function NoticeBoardModal({
  open,
  onClose,
  noticeList,
  writerName,
  writerMessage,
  setWriterName,
  setWriterMessage,
  handleAddNotice,
}: NoticeBoardModalProps) {
  const { data: session } = useSession();

  // (1) 목록 조회 쿼리
  const {
    data: serverNoticesList,
    isError: isListError,
    error: listError,
  } = useNoticesListQuery();

  // (2) 상세 조회 쿼리
  const [selectedNoticeId, setSelectedNoticeId] = useState<number | null>(null);
  const {
    data: selectedNotice,
    isError: isDetailError,
    error: detailError,
    isLoading: isDetailLoading,
  } = useNoticeDetailQuery(selectedNoticeId);

  // (3) 글 작성 모드
  const [isWriting, setIsWriting] = useState(false);

  // (4) AlertModal 제어용 State
  const [alertModalOpen, setAlertModalOpen] = useState(false);
  const [alertModalTitle, setAlertModalTitle] = useState("");
  const [alertModalMessage, setAlertModalMessage] = useState("");

  /** AlertModal 열기 도우미 함수 */
  function showAlertModal(title: string, message: string) {
    setAlertModalTitle(title);
    setAlertModalMessage(message);
    setAlertModalOpen(true);
  }

  // (5) 게시글 작성 훅
  const { mutate: createNotice, status } = useCreateNoticeQuery();
  const isPosting = status === "pending";

  // (A) "작성하기" 버튼 로직
  const handleCreate = () => {
    if (!writerName.trim() || !writerMessage.trim()) {
      showAlertModal("알림", "제목과 메세지를 입력하세요.");
      return;
    }

    // 서버로 보낼 payload
    const payload: CreateNoticePayload = {
      title: writerName,
      content: writerMessage,
    };

    createNotice(payload, {
      onSuccess: (res) => {
        showAlertModal("안내", res.message); // 예) "게시글 작성 성공"
        // 폼 리셋
        setWriterName("");
        setWriterMessage("");
        setIsWriting(false);
      },
      onError: (err: unknown) => {
        showAlertModal("오류 발생", "게시글 작성 중 오류가 발생했습니다.");
      },
    });
  };

  // (6) 비회원/게스트 모달
  const [signInModalOpen, setSignInModalOpen] = useState(false);
  const handleClickWrite = () => {
    if (!session?.user || session.user.role === "guest") {
      setSignInModalOpen(true);
    } else {
      setIsWriting(true);
    }
  };

  // (7) 화면 모드별 렌더링
  function renderContent() {
    // 상세 보기
    if (selectedNoticeId) {
      return (
        <NoticeDetail
          isError={isDetailError}
          error={detailError}
          isLoading={isDetailLoading}
          notice={selectedNotice}
          onBack={() => setSelectedNoticeId(null)}
        />
      );
    }

    // 글 작성
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

    // 목록
    return (
      <NoticeList
        isError={isListError}
        error={listError}
        noticesList={serverNoticesList}
        onSelectNotice={(id) => setSelectedNoticeId(id)}
        onClickWrite={handleClickWrite}
      />
    );
  }

  /**
   * (8) Esc 키를 누르면 모달 닫기
   */
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (open && e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [open, onClose]);

  // (9) 모달 렌더링
  return (
    <>
      {open && (
        <div className={styles.overlay}>
          <div className={styles.modalContainer}>
            <div className={styles.rightSection}>
              <button className={styles.closeBtn} onClick={onClose}>
                X
              </button>
              <div className={styles.modalHeader}>
                <p className={styles.modalTitle}>자유 게시판</p>
              </div>
              <div className={styles.modalContent}>{renderContent()}</div>
            </div>
          </div>
        </div>
      )}

      {/* 1) AlertModal (기존 alert 치환) */}
      {alertModalOpen && (
        <AlertModal
          title={alertModalTitle}
          onClose={() => setAlertModalOpen(false)}
        >
          <p>{alertModalMessage}</p>
        </AlertModal>
      )}

      {/* 2) 비회원 → NeedSignInModal */}
      {signInModalOpen && (
        <NeedSignInModal onClose={() => setSignInModalOpen(false)} />
      )}
    </>
  );
}
