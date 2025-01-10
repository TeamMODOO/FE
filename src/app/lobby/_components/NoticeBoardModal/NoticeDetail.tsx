"use client";

import { Button } from "@/components/ui/button";

import styles from "./NoticeDetail.module.css";

// 예시 NoticeDetail 데이터
interface NoticeDetailData {
  id: number;
  title: string;
  content: string;
  author_name: string;
  created_at: string;
}

interface NoticeDetailProps {
  isError?: boolean;
  error?: unknown;
  isLoading?: boolean;
  notice?: NoticeDetailData | null;
  onBack: () => void;
}

/** 날짜/시간 포매팅 함수 */
function formatDateTime(isoString: string): string {
  const date = new Date(isoString);
  if (isNaN(date.getTime())) {
    return "";
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  let hour = date.getHours(); // 0~23
  const minute = String(date.getMinutes()).padStart(2, "0");
  let ampm = "오전";

  // 오후 구분
  if (hour >= 12) {
    ampm = "오후";
    if (hour > 12) {
      hour -= 12;
    }
  }
  // 오전 0시 처리
  if (hour === 0) {
    hour = 12;
  }

  return `${year}.${month}.${day}. ${ampm} ${hour}시 ${minute}분`;
}

export default function NoticeDetail({
  isError,
  error,
  isLoading, // ← 추가
  notice,
  onBack,
}: NoticeDetailProps) {
  if (isLoading) {
    // 로딩 상태일 때
    return <div>로딩중...</div>;
  }

  if (isError) {
    return (
      <div className="text-red-500">
        상세정보 오류: {(error as Error)?.message}
      </div>
    );
  }

  if (!notice) {
    // 로딩도 아니고 에러도 아닌데 데이터가 없다면 → "없음" 처리
    return <div>해당 공지사항을 찾을 수 없습니다.</div>;
  }

  return (
    <div>
      <div>
        <h2 className={styles.detailTitle}>{notice.title}</h2>
        <p className={styles.detailSub}>
          작성자: {notice.author_name} / {formatDateTime(notice.created_at)}
        </p>
      </div>
      <div className={styles.detailContainer}>{notice.content}</div>
      <div className={styles.buttonSection}>
        <Button className="mt-4" onClick={onBack}>
          목록으로
        </Button>
      </div>
    </div>
  );
}
