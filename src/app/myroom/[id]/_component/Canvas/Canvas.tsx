"use client";

import NextImage from "next/image";
import { useParams } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";

// (1) UI & Hooks
import { Button } from "@/components/ui/button";
import { useMyRoomOwnerProfile } from "@/hooks/myroom/useMyRoomOwnerProfile";
import useMyRoomSocketEvents from "@/hooks/myroom/useMyRoomSocketEvents";
// (2) 스프라이트 로딩 훅 & 상수
import useLoadSprites, {
  FRAME_HEIGHT,
  FRAME_WIDTH,
  LAYER_ORDER,
} from "@/hooks/performance/useLoadSprites";
import useThrottle from "@/hooks/performance/useThrottle";

// (3) 모델/타입
import { Funiture } from "../../_model/Funiture"; // 수정: Funiture에 FurnitureData 확장
import { Direction, User } from "../../_model/User";
// (4) 모달들
import BoardModal from "../BoardModal/BoardModal";
import FurnitureInfoModal from "../FurnitureInfoModal/FurnitureInfoModal";
// [추가] 포트폴리오 링크만 보여주는 모달
import PortfolioLinkViewModal from "../PortfolioLinkViewModal/PortfolioLinkViewModal";
import PdfViewerModal from "../PortfolioModal/PdfViewerModal";
import PortfolioModal from "../PortfolioModal/PortfolioModal"; // 링크용
import ResumeModal from "../ResumeModal/ResumeModal"; // PDF용
import TechStackModal from "../TechStackModal/TechStackModal";
import Style from "./Canvas.style";
import interiorImages from "./Interior";

/** 예시: 기술 스택 목록 */
const techStackList = [
  "Figma",
  "React",
  "TypeScript",
  "Python",
  "Slack",
  "JavaScript",
  "Next.js",
  "서비스 기획",
  "JIRA",
  "Confluence",
  "Git",
  "Flutter",
  "GitHub",
  "React Native",
  "Excel",
  "ppt",
  "HTML/CSS",
  "Redux",
  "인공지능(AI)",
  "Photoshop",
  "C++",
  "Swift",
  "SwiftUI",
  "iOS",
];

// --------------------------------------------------
// (A) 맵 상수 (속도만 남김)
// --------------------------------------------------
const MAP_CONSTANTS = {
  SPEED: 30, // 캐릭터 이동 속도
};

// ★ 캐릭터 크기 배율
const CHAR_SCALE = 3;

const MyRoomCanvas: React.FC = () => {
  // ------------------ (A) 소켓 연결 ------------------
  const myUserId = "1";
  const { emitMovement } = useMyRoomSocketEvents({
    roomId: "myRoom-123",
    userId: myUserId,
  });

  // ------------------ (B) 화면 사이즈 & 캔버스 ------------------
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [canvasSize, setCanvasSize] = useState({ w: 1500, h: 830 });

  useEffect(() => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    setCanvasSize({ w, h });
  }, []);

  // ------------------ (C) 배경 이미지 ------------------
  const [backgroundImage, setBackgroundImage] =
    useState<HTMLImageElement | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    canvasRef.current.width = canvasSize.w;
    canvasRef.current.height = canvasSize.h;

    const bg = new Image();
    bg.src = "/background/myroom.webp";
    bg.onload = () => setBackgroundImage(bg);
  }, [canvasSize]);

  // ------------------ (D) 사용자 목록 ------------------
  const [users, setUsers] = useState<User[]>([
    {
      id: "1",
      x: 500,
      y: 500,
      nickname: "정글러1",
      characterType: "sprite1",
      direction: 0,
      isMoving: false,
    },
    {
      id: "2",
      x: 500,
      y: 450,
      nickname: "정글러2",
      characterType: "sprite2",
      direction: 0,
      isMoving: false,
    },
  ]);

  // ------------------ (E) 이력서/포트폴리오/기술스택 ------------------
  // 이력서(PDF): 1개
  const [resume, setResume] = useState<Funiture[]>([
    {
      id: "resume-1",
      x: 100,
      y: 100,
      funitureType: "none",
      funiturename: "이력서(PDF)",
    },
  ]);

  // 포트폴리오(링크): 최대 3개
  const [portfolio, setPortfolio] = useState<Funiture[]>([
    {
      id: "portfolio-1",
      x: 600,
      y: 100,
      funitureType: "none",
      funiturename: "포트폴리오 링크1",
    },
    {
      id: "portfolio-2",
      x: 780,
      y: 180,
      funitureType: "none",
      funiturename: "포트폴리오 링크2",
    },
    {
      id: "portfolio-3",
      x: 900,
      y: 90,
      funitureType: "none",
      funiturename: "포트폴리오 링크3",
    },
  ]);

  // 기술스택: 최대 9개
  const [technologyStack, setTechnologyStack] = useState<Funiture[]>([
    {
      id: "technologyStack-1",
      x: 230,
      y: 470,
      funitureType: "none",
      funiturename: "기술스택1",
    },
    {
      id: "technologyStack-2",
      x: 370,
      y: 550,
      funitureType: "none",
      funiturename: "기술스택2",
    },
    // ...
    {
      id: "technologyStack-9",
      x: 750,
      y: 400,
      funitureType: "none",
      funiturename: "기술스택9",
    },
  ]);

  // ------------------ (F) 게시판(방명록) ------------------
  const [board] = useState<Funiture[]>([
    {
      id: "board1",
      x: 190,
      y: 60,
      funitureType: "board",
      funiturename: "게시판",
    },
  ]);
  const [isBoardOpen, setIsBoardOpen] = useState(false);

  interface BoardComment {
    id: number;
    name: string;
    message: string;
  }
  const [boardComments, setBoardComments] = useState<BoardComment[]>([
    { id: 1, name: "WellBeingGuru", message: "방명록 첫 댓글!" },
    { id: 2, name: "John", message: "안녕하세요 :)" },
  ]);
  const [visitorName, setVisitorName] = useState("");
  const [visitorMessage, setVisitorMessage] = useState("");

  // ------------------ (G) 모달들 ------------------
  // 이력서(PDF)
  const [resumeModalOpen, setResumeModalOpen] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  // 포트폴리오(링크)
  const [portfolioModalOpen, setPortfolioModalOpen] = useState(false);
  const [portfolioLink, setPortfolioLink] = useState("");

  // 기술스택(체크박스)
  const [techStackModalOpen, setTechStackModalOpen] = useState(false);
  const [selectedTechList, setSelectedTechList] = useState<string[]>([]);

  // 상세 모달
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedFurnitureData, setSelectedFurnitureData] =
    useState<Funiture | null>(null);

  // PDF 뷰어 모달
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState("");

  // [추가] 포트폴리오 링크 표시 모달
  const [portfolioLinkViewModalOpen, setPortfolioLinkViewModalOpen] =
    useState(false);
  const [clickedPortfolioLink, setClickedPortfolioLink] = useState("");

  // ------------------ (I) 스프라이트 로딩 훅 ------------------
  const spriteImages = useLoadSprites();

  // ------------------ (J) 키 입력 ------------------
  const [pressedKeys, setPressedKeys] = useState<Record<string, boolean>>({});

  // ------------------ (K) 포탈 ------------------
  const [portal, setPortal] = useState({
    id: "portal-to-lobby",
    x: 1300,
    y: 600,
    route: "/lobby",
    name: "로비 포탈",
  });

  useEffect(() => {
    setPortal((prev) => ({
      ...prev,
      x: 50,
      y: Math.max((canvasSize.h - 200) / 2, 0),
    }));
  }, [canvasSize]);

  // ------------------ (L) 모달 열림 여부 ------------------
  const isAnyModalOpen =
    resumeModalOpen ||
    portfolioModalOpen ||
    techStackModalOpen ||
    viewModalOpen ||
    isBoardOpen ||
    pdfModalOpen ||
    portfolioLinkViewModalOpen;

  useEffect(() => {
    if (!isAnyModalOpen) {
      setPressedKeys({});
    }
  }, [isAnyModalOpen]);

  // ------------------ 포탈 overlap ------------------
  function checkPortalOverlap() {
    const me = users.find((u) => u.id === myUserId);
    if (!me) return false;
    const [cl, cr, ct, cb] = [me.x, me.x + 64, me.y, me.y + 64];

    const portalWidth = 200;
    const portalHeight = 200;
    const [pl, pr, pt, pb] = [
      portal.x,
      portal.x + portalWidth,
      portal.y,
      portal.y + portalHeight,
    ];
    return cr > pl && cl < pr && cb > pt && ct < pb;
  }

  // ------------------ 키 이벤트 ------------------
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isAnyModalOpen) return;

      if (
        [
          "w",
          "W",
          "ㅈ",
          "s",
          "S",
          "ㄴ",
          "a",
          "A",
          "ㅁ",
          "d",
          "D",
          "ㅇ",
          "ArrowUp",
          "ArrowDown",
          "ArrowLeft",
          "ArrowRight",
          " ",
        ].includes(e.key)
      ) {
        e.preventDefault();
      }

      if (e.key === " ") {
        e.preventDefault();
        if (checkPortalOverlap()) {
          // 포탈로 이동
          window.location.href = portal.route;
        }
      }
      setPressedKeys((prev) => ({ ...prev, [e.key]: true }));
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (isAnyModalOpen) return;
      setPressedKeys((prev) => ({ ...prev, [e.key]: false }));
    };

    const handleBlur = () => {
      setPressedKeys({});
    };

    window.addEventListener("keydown", handleKeyDown, { passive: false });
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", handleBlur);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", handleBlur);
    };
  }, [isAnyModalOpen, portal, users]);

  // ------------------ 방향 계산 ------------------
  function getNewDirection(userList: User[]): Direction | null {
    const me = userList.find((u) => u.id === myUserId);
    if (!me) return null;

    if (
      pressedKeys["w"] ||
      pressedKeys["W"] ||
      pressedKeys["ㅈ"] ||
      pressedKeys["ArrowUp"]
    ) {
      return 1; // Up
    }
    if (
      pressedKeys["s"] ||
      pressedKeys["S"] ||
      pressedKeys["ㄴ"] ||
      pressedKeys["ArrowDown"]
    ) {
      return 0; // Down
    }
    if (
      pressedKeys["d"] ||
      pressedKeys["D"] ||
      pressedKeys["ㅇ"] ||
      pressedKeys["ArrowRight"]
    ) {
      return 2; // Right
    }
    if (
      pressedKeys["a"] ||
      pressedKeys["A"] ||
      pressedKeys["ㅁ"] ||
      pressedKeys["ArrowLeft"]
    ) {
      return 3; // Left
    }
    return null;
  }

  // ------------------ 캐릭터 애니메이션 프레임 ------------------
  const userFrameRef = useRef<
    Record<string, { frame: number; lastFrameTime: number }>
  >({});

  useEffect(() => {
    users.forEach((u) => {
      userFrameRef.current[u.id] = {
        frame: 0,
        lastFrameTime: performance.now(),
      };
    });
  }, [users]);

  // ------------------ 키 입력 -> 쓰로틀 ------------------
  const throttledPressedKeys = useThrottle(pressedKeys, 100);

  // ------------------ 이동 로직 ------------------
  useEffect(() => {
    setUsers((prev) => {
      const newArr = [...prev];
      const meIndex = newArr.findIndex((u) => u.id === myUserId);
      if (meIndex < 0) return prev;

      const me = newArr[meIndex];
      let { x, y } = me;
      const newDir = getNewDirection(newArr);

      if (newDir === null) {
        newArr[meIndex] = { ...me, isMoving: false };
        return newArr;
      }

      let moved = false;
      if (newDir === 1 && y > 0) {
        y -= MAP_CONSTANTS.SPEED;
        moved = true;
      } else if (newDir === 0 && y < canvasSize.h - FRAME_HEIGHT * CHAR_SCALE) {
        y += MAP_CONSTANTS.SPEED;
        moved = true;
      } else if (newDir === 2 && x < canvasSize.w - FRAME_WIDTH * CHAR_SCALE) {
        x += MAP_CONSTANTS.SPEED;
        moved = true;
      } else if (newDir === 3 && x > 0) {
        x -= MAP_CONSTANTS.SPEED;
        moved = true;
      }

      newArr[meIndex] = {
        ...me,
        x,
        y,
        direction: newDir,
        isMoving: moved,
      };
      if (moved) {
        emitMovement(x, y, newDir);
      }
      return newArr;
    });
  }, [throttledPressedKeys, emitMovement, canvasSize]);

  // ------------------ rAF 렌더 ------------------
  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    let animationId = 0;
    let lastTime = 0;
    const fps = 30;
    const frameDuration = 1000 / fps;
    const frameInterval = 200;
    const maxMovingFrame = 3;

    const loop = (time: number) => {
      const delta = time - lastTime;
      if (delta >= frameDuration) {
        lastTime = time - (delta % frameDuration);

        // Clear
        ctx.clearRect(0, 0, canvasSize.w, canvasSize.h);

        // 배경
        if (backgroundImage) {
          ctx.drawImage(backgroundImage, 0, 0, canvasSize.w, canvasSize.h);
        }

        // 캐릭터
        const now = performance.now();
        users.forEach((user) => {
          const uf = userFrameRef.current[user.id];
          if (!uf) {
            userFrameRef.current[user.id] = {
              frame: 0,
              lastFrameTime: now,
            };
            return;
          }

          if (user.isMoving) {
            if (now - uf.lastFrameTime > frameInterval) {
              uf.frame++;
              if (uf.frame > maxMovingFrame) uf.frame = 1;
              uf.lastFrameTime = now;
            }
          } else {
            uf.frame = 0;
            uf.lastFrameTime = now;
          }

          const sx = uf.frame * FRAME_WIDTH;
          const sy = (user.direction ?? 0) * FRAME_HEIGHT;

          // 스프라이트
          if (Object.keys(spriteImages).length === LAYER_ORDER.length) {
            ctx.save();
            LAYER_ORDER.forEach((layer) => {
              const img = spriteImages[layer];
              if (!img) return;
              ctx.drawImage(
                img,
                sx,
                sy,
                FRAME_WIDTH,
                FRAME_HEIGHT,
                user.x,
                user.y,
                FRAME_WIDTH * CHAR_SCALE,
                FRAME_HEIGHT * CHAR_SCALE,
              );
            });
            ctx.restore();

            // 닉네임
            ctx.font = "bold 14px Arial";
            ctx.fillStyle = "white";
            ctx.textAlign = "center";
            ctx.fillText(
              user.nickname,
              user.x + (FRAME_WIDTH * CHAR_SCALE) / 2,
              user.y + FRAME_HEIGHT * CHAR_SCALE + 15,
            );
          }
        });
      }
      animationId = requestAnimationFrame(loop);
    };
    animationId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [backgroundImage, spriteImages, users, canvasSize]);

  // ------------------ 게시판 글 작성 ------------------
  const handleAddComment = () => {
    if (!visitorName.trim() || !visitorMessage.trim()) return;
    setBoardComments((prev) => [
      ...prev,
      { id: prev.length + 1, name: visitorName, message: visitorMessage },
    ]);
    setVisitorName("");
    setVisitorMessage("");
  };

  // ------------------ 모달 열기(이력서/포트폴리오/기술스택) ------------------
  const handleOpenResumeModal = () => {
    const used = resume.some((r) => r.funitureType !== "none");
    if (used) {
      alert("이력서는 이미 등록됨(1개만).");
      return;
    }
    setResumeModalOpen(true);
  };

  const handleOpenPortfolioModal = () => {
    const usedCount = portfolio.filter((p) => p.funitureType !== "none").length;
    if (usedCount >= 3) {
      alert("포트폴리오는 최대 3개까지.");
      return;
    }
    setPortfolioModalOpen(true);
  };

  const handleOpenTechStackModal = () => {
    setTechStackModalOpen(true);
  };

  // ------------------ 저장 로직 ------------------
  // (1) 이력서 - PDF
  const handleSaveResume = async () => {
    if (!resumeFile) {
      setResumeModalOpen(false);
      return;
    }
    try {
      const formData = new FormData();
      formData.append("file", resumeFile);

      const res = await fetch("/api/resume", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Upload failed");
      }
      const s3Url = data.url;

      // resume[0] 업데이트
      setResume((prev) =>
        prev.map((item, idx) =>
          idx === 0
            ? {
                ...item,
                funitureType: `resume/resume${idx + 1}`,
                data: { url: s3Url, fileName: resumeFile.name },
              }
            : item,
        ),
      );
      setResumeModalOpen(false);
      setResumeFile(null);
    } catch (error) {
      // console.error(error);
    }
  };

  // (2) 포트폴리오 - 링크
  const handleSavePortfolio = () => {
    if (!portfolioLink.trim()) {
      setPortfolioModalOpen(false);
      return;
    }
    // 'none'인 첫 slot에 link 등록
    const idx = portfolio.findIndex((p) => p.funitureType === "none");
    if (idx !== -1) {
      setPortfolio((prev) =>
        prev.map((item, i) =>
          i === idx
            ? {
                ...item,
                funitureType: `portfolio/portfolio${idx + 1}`,
                data: { link: portfolioLink },
              }
            : item,
        ),
      );
    }
    setPortfolioModalOpen(false);
    setPortfolioLink("");
  };

  // (3) 기술스택 (체크박스)
  const handleSaveTechStack = () => {
    if (selectedTechList.length === 0) {
      setTechStackModalOpen(false);
      return;
    }

    const noneSlots = technologyStack.filter((t) => t.funitureType === "none");
    if (noneSlots.length === 0) {
      alert("더 이상 기술스택 추가 불가.");
      setTechStackModalOpen(false);
      return;
    }

    const usedCount = technologyStack.filter(
      (t) => t.funitureType !== "none",
    ).length;
    const newCount = selectedTechList.length;
    const totalCount = usedCount + newCount;
    if (totalCount > 9) {
      alert(
        `최대 9개까지. (현재 ${usedCount} + 새 ${newCount} = ${totalCount})`,
      );
      return;
    }

    setTechnologyStack((prev) => {
      const newArr = [...prev];
      let idxSlot = 0;
      for (let i = 0; i < newArr.length; i++) {
        if (newArr[i].funitureType === "none" && idxSlot < newCount) {
          newArr[i] = {
            ...newArr[i],
            funitureType: `technologyStack/technologyStack${i + 1}`,
            data: { stack: selectedTechList[idxSlot] },
          };
          idxSlot++;
        }
        if (idxSlot >= newCount) break;
      }
      return newArr;
    });

    setSelectedTechList([]);
    setTechStackModalOpen(false);
  };

  // ------------------ (T) 가구 클릭 ------------------
  const handleFurnitureClick = (f: Funiture) => {
    // 아직 아무것도 없음
    if (f.funitureType === "none") {
      if (f.funiturename.includes("이력서")) {
        alert("이력서(PDF) 없음. 버튼으로 추가하세요!");
      } else if (f.funiturename.includes("포트폴리오")) {
        alert("포트폴리오 링크 없음. 버튼으로 추가하세요!");
      } else if (f.funiturename.includes("기술스택")) {
        alert("기술스택 없음. 버튼으로 추가하세요!");
      } else {
        alert("정보가 없습니다. 추가해주세요!");
      }
      return;
    }

    // (1) 게시판(방명록)
    if (f.funitureType === "board") {
      setIsBoardOpen(true);
      return;
    }

    // (2) 이력서(=PDF)
    if (f.funitureType.startsWith("resume/")) {
      const pdfLink = f.data?.url || "";
      if (pdfLink) {
        setPdfUrl(pdfLink);
        setPdfModalOpen(true);
      } else {
        alert("이력서 PDF가 없습니다!");
      }
      return;
    }

    // (3) 포트폴리오(=링크)
    if (f.funitureType.startsWith("portfolio")) {
      const link = f.data?.link || "";
      if (link) {
        setClickedPortfolioLink(link);
        setPortfolioLinkViewModalOpen(true);
      } else {
        alert("포트폴리오 링크가 없습니다!");
      }
      return;
    }

    // (4) 기술스택 등 → 상세 모달
    setSelectedFurnitureData(f);
    setViewModalOpen(true);
  };

  // ------------------ 버튼 비활성화 ------------------
  const isResumeButtonDisabled = resume.some((r) => r.funitureType !== "none");
  const portfolioUsedCount = portfolio.filter(
    (p) => p.funitureType !== "none",
  ).length;
  const isPortfolioButtonDisabled = portfolioUsedCount >= 3;
  const isTechStackButtonDisabled =
    technologyStack.filter((t) => t.funitureType !== "none").length >= 9;

  // ------------------ API에서 ownerProfile 가져오기 → state 반영 ------------------
  const params = useParams() as { google_id?: string };
  const googleId = params.google_id || null;
  const {
    data: ownerProfile,
    isLoading: isProfileLoading,
    isError: isProfileError,
  } = useMyRoomOwnerProfile(googleId);

  useEffect(() => {
    if (ownerProfile) {
      // (1) 이력서
      if (ownerProfile.resume_url) {
        setResume((prev) =>
          prev.map((item, idx) => {
            if (idx === 0) {
              return {
                ...item,
                funitureType: `resume/resume${idx + 1}`,
                data: {
                  url: ownerProfile.resume_url,
                  fileName: "resume.pdf",
                },
              };
            }
            return item;
          }),
        );
      }

      // (2) 포트폴리오 링크들
      if (
        ownerProfile.portfolio_url &&
        Array.isArray(ownerProfile.portfolio_url)
      ) {
        setPortfolio((prev) => {
          const newArr = [...prev];
          ownerProfile.portfolio_url.forEach((link: string, i: number) => {
            if (i < newArr.length) {
              newArr[i] = {
                ...newArr[i],
                funitureType: `portfolio/portfolio${i + 1}`,
                data: { link },
              };
            }
          });
          return newArr;
        });
      }

      // (3) 기술스택
      if (ownerProfile.tech_stack && Array.isArray(ownerProfile.tech_stack)) {
        setTechnologyStack((prev) => {
          const newArr = [...prev];
          ownerProfile.tech_stack.forEach((stackItem: string, i: number) => {
            if (i < newArr.length) {
              newArr[i] = {
                ...newArr[i],
                funitureType: `technologyStack/technologyStack${i + 1}`,
                data: { stack: stackItem },
              };
            }
          });
          return newArr;
        });
      }
    }
  }, [ownerProfile]);

  return (
    <div
      className={Style.canvasContainerClass}
      style={{
        width: `${canvasSize.w}px`,
        height: `${canvasSize.h}px`,
        overflow: "auto",
        position: "relative",
      }}
    >
      {/* -- 절대위치 캔버스 -- */}
      <canvas ref={canvasRef} className={Style.absoluteCanvasClass} />

      {/* -- 이력서/포트폴리오/기술스택 가구 -- */}
      {[...resume, ...portfolio, ...technologyStack].map((item) => (
        <div
          key={item.id}
          className={Style.furnitureContainerClass}
          style={{ left: item.x, top: item.y }}
          onClick={() => handleFurnitureClick(item)}
        >
          <NextImage
            src={interiorImages[item.funitureType] || interiorImages["none"]}
            alt={item.funiturename}
            width={120}
            height={120}
            priority
          />
          <div className={Style.furnitureTextClass}>{item.funiturename}</div>
        </div>
      ))}

      {/* -- 게시판(방명록) -- */}
      {board.map((item) => (
        <div
          key={item.id}
          className={Style.boardContainerClass}
          style={{ left: item.x, top: item.y }}
          onClick={() => setIsBoardOpen(true)}
        >
          <NextImage
            src="/furniture/board.png"
            alt={item.funiturename}
            width={300}
            height={200}
            priority
          />
          <div className="mt-[-10px] text-[14px] font-bold text-white">
            {item.funiturename}
          </div>
        </div>
      ))}

      {/* -- 포탈 -- */}
      <div
        className={Style.furnitureContainerClass}
        style={{ left: portal.x, top: portal.y, width: 200, height: 200 }}
        onClick={() => {
          window.location.href = portal.route;
        }}
      >
        <NextImage
          src="/furniture/portal.gif"
          alt={portal.name}
          width={200}
          height={200}
          priority
        />
        <div className={Style.furnitureTextClass}>{portal.name}</div>
      </div>

      {/* -- 우측 하단 버튼들 -- */}
      <div className={Style.bottomButtonsClass}>
        <Button
          onClick={handleOpenResumeModal}
          disabled={isResumeButtonDisabled}
        >
          이력서(PDF) 추가
        </Button>
        <Button
          onClick={handleOpenPortfolioModal}
          disabled={isPortfolioButtonDisabled}
        >
          포트폴리오(링크) 추가
        </Button>
        <Button
          onClick={handleOpenTechStackModal}
          disabled={isTechStackButtonDisabled}
        >
          기술 스택 추가
        </Button>
      </div>

      {/* -- 이력서(PDF) 모달 -- */}
      <ResumeModal
        open={resumeModalOpen}
        onClose={setResumeModalOpen}
        resumeFile={resumeFile}
        setResumeFile={setResumeFile}
        onSave={handleSaveResume}
      />

      {/* -- 포트폴리오(링크) 모달 -- */}
      <PortfolioModal
        open={portfolioModalOpen}
        onClose={setPortfolioModalOpen}
        portfolioLink={portfolioLink}
        setPortfolioLink={setPortfolioLink}
        onSave={handleSavePortfolio}
      />

      {/* -- 기술 스택 모달 -- */}
      <TechStackModal
        open={techStackModalOpen}
        onClose={setTechStackModalOpen}
        techStackList={techStackList}
        selectedTechList={selectedTechList}
        setSelectedTechList={setSelectedTechList}
        onSave={handleSaveTechStack}
      />

      {/* -- 상세 모달 (기술스택 등) -- */}
      <FurnitureInfoModal
        open={viewModalOpen}
        onClose={setViewModalOpen}
        furniture={selectedFurnitureData}
      />

      {/* -- 게시판(방명록) 모달 -- */}
      <BoardModal
        open={isBoardOpen}
        onClose={setIsBoardOpen}
        boardComments={boardComments}
        visitorName={visitorName}
        visitorMessage={visitorMessage}
        setVisitorName={setVisitorName}
        setVisitorMessage={setVisitorMessage}
        handleAddComment={handleAddComment}
      />

      {/* -- PDF 보기 모달(이력서) -- */}
      <PdfViewerModal
        open={pdfModalOpen}
        onClose={setPdfModalOpen}
        pdfUrl={pdfUrl}
      />

      {/* -- 새로 추가: 포트폴리오 링크 표시용 모달 -- */}
      <PortfolioLinkViewModal
        open={portfolioLinkViewModalOpen}
        onClose={setPortfolioLinkViewModalOpen}
        link={clickedPortfolioLink}
      />
    </div>
  );
};

export default MyRoomCanvas;
