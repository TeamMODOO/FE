// NoticeList.tsx
"use client";

import { Button } from "@/components/ui/button";

import styles from "./NoticeList.module.css";

interface Notice {
  id: number;
  title: string;
  author_name: string;
  created_at: string; // ← ISO8601 형태의 문자열
}

interface NoticeListProps {
  isError?: boolean;
  error?: unknown;
  noticesList?: Notice[];
  onSelectNotice: (id: number) => void;
  onClickWrite: () => void;
}

/** 날짜/시간 포매팅 함수 */
function formatDateTime(isoString: string): string {
  const date = new Date(isoString);
  // 날짜가 유효하지 않다면 반환하지 않도록
  if (isNaN(date.getTime())) {
    return "";
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  let hour = date.getHours(); // 0~23
  const minute = String(date.getMinutes()).padStart(2, "0");
  let ampm = "오전";
  // 오후 12시(12) ~ 오후 11시(23)인 경우
  if (hour >= 12) {
    ampm = "오후";
    // 12시부터는 12를 빼서 0~11로 바꿔줌
    if (hour > 12) {
      hour -= 12;
    }
  }
  if (hour === 0) {
    // 오전 0시 → 오전 12시
    hour = 12;
  }

  return `${year}.${month}.${day}. ${ampm} ${hour}시 ${minute}분`;
}

export default function NoticeList({
  isError,
  error,
  noticesList,
  onSelectNotice,
  onClickWrite,
}: NoticeListProps) {
  if (isError) {
    return (
      <div className="text-red-500">
        오류가 발생했습니다: {(error as Error)?.message}
      </div>
    );
  }

  if (!noticesList || noticesList.length === 0) {
    return (
      <div>
        아직 등록된 공지사항이 없습니다.
        <button onClick={onClickWrite} className="ml-2 text-blue-500 underline">
          글 작성
        </button>
      </div>
    );
  }

  return (
    <div className={styles.listContainer}>
      <div className={styles.itemsContainer}>
        <ul className="space-y-3">
          {noticesList.map((notice) => (
            <li key={notice.id} className={styles.listItem}>
              <button type="button" onClick={() => onSelectNotice(notice.id)}>
                <div className={styles.noticeTitle}>{notice.title}</div>
                <div className={styles.noticeSub}>
                  {notice.author_name} / {formatDateTime(notice.created_at)}
                </div>
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div className={styles.buttonSection}>
        <Button onClick={onClickWrite}>글 작성하기</Button>
      </div>
    </div>
  );
}
