"use client";

import { Button } from "@/components/ui/button";

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
  notice?: NoticeDetailData | null;
  onBack: () => void;
}

export default function NoticeDetail({
  isError,
  error,
  notice,
  onBack,
}: NoticeDetailProps) {
  // 로딩(isLoading) 로직 제거

  if (isError) {
    return (
      <div className="text-red-500">
        상세정보 오류: {(error as Error)?.message}
      </div>
    );
  }
  if (!notice) {
    return <div>해당 공지사항을 찾을 수 없습니다.</div>;
  }

  return (
    <div className="rounded border p-3">
      <h2 className="mb-2 font-semibold text-gray-800">{notice.title}</h2>
      <p className="text-sm text-gray-500">
        작성자: {notice.author_name} / {notice.created_at}
      </p>
      <div className="mt-3 text-gray-700">{notice.content}</div>

      <Button className="mt-4" onClick={onBack}>
        목록으로
      </Button>
    </div>
  );
}
