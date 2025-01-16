"use client";
import { useEffect } from "react";

import Head from "next/head";
import { usePathname } from "next/navigation";

// 각 페이지별 중요한 프리페치할 이미지 목록
const HIGH_PRIORITY_IMAGES = {
  lobby: ["/background/lobby_image.webp"],
  myroom: ["/background/myroom.png"],
};

// 각 페이지별 프리페치할 이미지 목록
const PREFETCH_PATHS = {
  lobby: [
    "/npc_event/npc1.png",
    "/npc_event/npc2.png",
    "/npc_event/npc3.png",
    "/furniture/portal.png",
    "/furniture/board.png",
  ],
  myroom: [
    "/interior/none.webp",
    "/interior/resume/resume.png",
    "/interior/portfolio/portfolio1.png",
    "/interior/portfolio/portfolio2.png",
    "/interior/portfolio/portfolio3.png",
  ],
  quest: ["/portrait/dragon_flying.webp"],
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
      prefetchImages(HIGH_PRIORITY_IMAGES.lobby);
    } else if (pathname === "/lobby") {
      // 로비에서는 마이룸 이미지를 프리페치
      prefetchImages(HIGH_PRIORITY_IMAGES.myroom);
    }
  }, [pathname]);

  return (
    <Head>
      {pathname === "/signin" &&
        PREFETCH_PATHS.lobby.map((path, index) => (
          <link
            key={`preload-lobby-${index}`}
            rel="prefetch"
            as="image"
            href={path}
          />
        ))}
      {pathname === "/lobby" &&
        PREFETCH_PATHS.myroom.map((path, index) => (
          <link
            key={`preload-myroom-${index}`}
            rel="prefetch"
            as="image"
            href={path}
          />
        ))}
    </Head>
  );
};

export default PrefetchManager;
