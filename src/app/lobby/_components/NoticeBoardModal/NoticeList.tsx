"use client";

import { Button } from "@/components/ui/button";

interface Notice {
  id: number;
  title: string;
  author_name: string;
  created_at: string;
}

interface NoticeListProps {
  isError?: boolean;
  error?: unknown;
  noticesList?: Notice[];
  onSelectNotice: (id: number) => void;
  onClickWrite: () => void;
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
    <div>
      <ul className="space-y-3">
        {noticesList.map((notice) => (
          <li key={notice.id} className="rounded border p-2 hover:bg-gray-50">
            {/* <button>을 넣어주는 방법 */}
            <button
              type="button"
              className="w-full text-left"
              onClick={() => onSelectNotice(notice.id)}
            >
              <div className="font-semibold text-gray-800">{notice.title}</div>
              <div className="text-sm text-gray-500">
                {notice.author_name} / {notice.created_at}
              </div>
            </button>
          </li>
        ))}
      </ul>
      <Button onClick={onClickWrite} className="mt-4">
        글 작성
      </Button>
    </div>
  );
}
