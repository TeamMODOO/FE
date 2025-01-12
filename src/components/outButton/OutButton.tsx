// src/components/outButton/outButton.tsx
"use client";

import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function OutButton() {
  const router = useRouter();

  // 버튼 클릭 시 로비로 이동 예시
  const handleClick = () => {
    router.push("/lobby");
  };

  return (
    <Button
      onClick={handleClick}
      title="로비로 돌아가기"
      className={`
        fixed top-6 right-32 z-50
        size-20 rounded-full border-2
        border-[rgba(111,99,98,1)]
        bg-gradient-to-b from-black/70 to-black/90
        text-[rgba(171,159,158,1)]
        hover:bg-[rgba(255,255,255,0.9)]
      `}
    >
      <LogOut className="min-h-8 min-w-8" />
    </Button>
  );
}
