"use client";
import { useEffect } from "react";

import { usePathname } from "next/navigation";

// 각 페이지별 프리페치할 이미지 목록
const PREFETCH_PATHS = {
  lobby: [
    "/background/lobby_image.webp",
    "/npc_event/npc1.png",
    "/npc_event/npc2.png",
    "/npc_event/npc3.png",
    "/furniture/portal.png",
    "/furniture/board.png",
  ],
  myroom: [
    "/background/myroom.png",
    "/interior/none.webp",
    "/interior/resume/resume.png",
    "/interior/portfolio/portfolio1.png",
    "/interior/portfolio/portfolio2.png",
    "/interior/portfolio/portfolio3.png",
  ],
  quest: ["/background/quest_prev.webp", "/portrait/dragon_flying.webp"],
};

const PrefetchManager = () => {
  const pathname = usePathname();

  // 이미지 프리페치 함수
  const prefetchImages = (paths: string[]) => {
    paths.forEach((path) => {
      const img = new Image();
      img.src = path;
    });
  };

  useEffect(() => {
    // 현재 경로에 따라 다음 페이지의 이미지를 프리페치
    if (pathname === "/signin") {
      // 홈에서는 로비 이미지를 프리페치
      prefetchImages(PREFETCH_PATHS.lobby);
    } else if (pathname === "/lobby") {
      // 로비에서는 마이룸, 퀘스트ss이미지를 프리페치
      prefetchImages(PREFETCH_PATHS.myroom);
      prefetchImages(PREFETCH_PATHS.quest);
    }
  }, [pathname]);

  return <></>;
};

export default PrefetchManager;
