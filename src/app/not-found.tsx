"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-blue-400 to-purple-500 text-white">
      <div className="z-10 text-center">
        <h1 className="mb-4 text-6xl font-bold">404</h1>
        <h2 className="mb-6 text-3xl font-semibold">
          가상 공간에서 길을 잃으셨나요?
        </h2>
        <p className="mb-8 text-xl">
          이런, 찾으시는 페이지가 이 메타버스에 존재하지 않는 것 같아요. <br />
          아래 버튼을 클릭하여 홈으로 돌아가세요.
        </p>

        <Button asChild>
          <Link href="/signin">메타버스로 텔레포트</Link>
        </Button>
      </div>
    </div>
  );
}
