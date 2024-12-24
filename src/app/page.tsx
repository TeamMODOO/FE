"use client";

import { EnterMeetingRoom } from "@/components";
import useMainSocketConnect from "@/hooks/useMainSocketConnect";

export default function Home() {
  useMainSocketConnect();
  return (
    <div className="mx-auto grid min-h-screen grid-rows-[20px_1fr_20px] items-center justify-items-center gap-16 p-8 pb-20 font-[family-name:var(--font-geist-sans)] sm:p-20">
      메인 페이지
      <EnterMeetingRoom />
    </div>
  );
}
