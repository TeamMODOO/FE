"use client";
import Image from "next/image";
import React, { useState } from "react";

import { Button } from "@/components/ui/button";

import styles from "./RegisterAvatar.module.css";

async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result) resolve(reader.result.toString());
      else reject("Failed to convert file to base64.");
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

export default function AvatarGenerator() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [finalImage, setFinalImage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    setSelectedFile(e.target.files[0]);
  };

  const handleGenerateAvatar = async () => {
    if (!selectedFile) {
      alert("파일을 먼저 선택하세요!");
      return;
    }
    setIsLoading(true);
    setFinalImage("");

    try {
      const base64Image = await fileToDataUrl(selectedFile);
      const res = await fetch("/api/generate-avatar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ base64Image }),
      });
      const data: {
        success: boolean;
        error?: string;
        finalImageUrl?: string;
      } = await res.json();

      if (!data.success) {
        // 에러 상세 메시지 표시
        alert(`아바타 생성 실패: ${data.error ?? ""}`);
        return;
      }

      if (data.finalImageUrl) setFinalImage(data.finalImageUrl);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container} style={{ padding: "2rem" }}>
      <h1>Generate Avatar</h1>
      <input type="file" accept="image/*" onChange={handleFileChange} />
      <Button
        onClick={handleGenerateAvatar}
        disabled={!selectedFile || isLoading}
      >
        {isLoading ? "생성 중..." : "아바타 생성"}
      </Button>
      {finalImage && (
        <div style={{ marginTop: "1rem" }}>
          <Image src={finalImage} alt="avatar" width={256} height={256} />
        </div>
      )}
    </div>
  );
}
