"use client";

import React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/** 작성 화면 Props */
interface NoticeCreateFormProps {
  writerName: string;
  writerMessage: string;
  setWriterName: React.Dispatch<React.SetStateAction<string>>;
  setWriterMessage: React.Dispatch<React.SetStateAction<string>>;
  onCreate: () => void; // "작성하기" 버튼 클릭 시
  onCancel: () => void; // "취소" 버튼 클릭 시
  isPosting: boolean; // 작성 중 여부
}

export default function NoticeCreateForm({
  writerName,
  writerMessage,
  setWriterName,
  setWriterMessage,
  onCreate,
  onCancel,
  isPosting,
}: NoticeCreateFormProps) {
  return (
    <div className="space-y-3">
      <div>
        <Label htmlFor="writerName">작성자</Label>
        <Input
          id="writerName"
          placeholder="작성자 이름"
          value={writerName}
          onChange={(e) => setWriterName(e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="writerMessage">글 내용</Label>
        <Input
          id="writerMessage"
          placeholder="작성할 내용을 입력하세요"
          value={writerMessage}
          onChange={(e) => setWriterMessage(e.target.value)}
        />
      </div>
      <div className="flex gap-2">
        <Button onClick={onCreate} disabled={isPosting}>
          {isPosting ? "작성 중..." : "작성하기"}
        </Button>
        <Button variant="secondary" onClick={onCancel}>
          취소
        </Button>
      </div>
    </div>
  );
}
