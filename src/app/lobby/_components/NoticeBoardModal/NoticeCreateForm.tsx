"use client";

import React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import styles from "./NoticeCreateForm.module.css";

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
    <div className={styles.formContainer}>
      <div>
        <Label htmlFor="writerName">작성자</Label>
        <Input
          id="writerName"
          placeholder="작성자 이름"
          value={writerName}
          onChange={(e) => setWriterName(e.target.value)}
          className={styles.writerArea}
        />
      </div>
      <div className={styles.textSection}>
        <Label htmlFor="writerMessage">글 내용</Label>
        {/* <Input
          id="writerMessage"
          placeholder="작성할 내용을 입력하세요"
          value={writerMessage}
          onChange={(e) => setWriterMessage(e.target.value)}
        /> */}
        <textarea
          id="writerMessage"
          placeholder="작성할 내용을 입력하세요"
          value={writerMessage}
          className={styles.textArea}
          onChange={(e) => setWriterMessage(e.target.value)}
        ></textarea>
      </div>
      <div className={styles.buttonSection}>
        <Button variant="secondary" onClick={onCancel}>
          취소
        </Button>
        <Button onClick={onCreate} disabled={isPosting}>
          {isPosting ? "작성 중..." : "작성하기"}
        </Button>
      </div>
    </div>
  );
}
