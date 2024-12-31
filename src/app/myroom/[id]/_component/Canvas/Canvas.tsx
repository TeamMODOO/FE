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
import useMainSocketConnect from "@/hooks/socket/useMainSocketConnect";

// (4) 모델/타입
import { Funiture } from "../../_model/Funiture";
import { Direction, User } from "../../_model/User";
// (5) 모달들
import BoardModal from "../BoardModal/BoardModal";
import FurnitureInfoModal from "../FurnitureInfoModal/FurnitureInfoModal";
import PdfViewerModal from "../PortfolioModal/PdfViewerModal";
import PortfolioModal from "../PortfolioModal/PortfolioModal";
import ResumeModal from "../ResumeModal/ResumeModal";
// ★ 변경된 TechStackModal
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

// ★ 캐릭터를 2배로 크게 표시
const CHAR_SCALE = 3; // 2배

const MyRoomCanvas: React.FC = () => {
  // --------------------------------------------------
  // (A) 공통 소켓 연결 + 마이룸 소켓 이벤트
  // --------------------------------------------------
  useMainSocketConnect();
  const myUserId = "1";
  const { emitMovement } = useMyRoomSocketEvents({
    roomId: "myRoom-123",
    userId: myUserId,
  });

  // --------------------------------------------------
  // (B) 화면 사이즈 & 캔버스
  // --------------------------------------------------
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [canvasSize, setCanvasSize] = useState({ w: 1500, h: 830 });

  useEffect(() => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    setCanvasSize({ w, h });
  }, []);

  // --------------------------------------------------
  // (C) 배경 이미지
  // --------------------------------------------------
  const [backgroundImage, setBackgroundImage] =
    useState<HTMLImageElement | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    canvas.width = canvasSize.w;
    canvas.height = canvasSize.h;

    const bg = new Image();
    bg.src = "/background/myroom.webp";
    bg.onload = () => {
      setBackgroundImage(bg);
    };
  }, [canvasSize]);

  // --------------------------------------------------
  // (D) 사용자 목록
  // --------------------------------------------------
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

  // --------------------------------------------------
  // (E) 이력서 / 포트폴리오 / 기술스택
  // --------------------------------------------------
  const [resume, setResume] = useState<Funiture[]>([
    {
      id: "resume-1",
      x: 100,
      y: 100,
      funitureType: "none",
      funiturename: "이력서",
    },
  ]);
  const [portfolio, setPortfolio] = useState<Funiture[]>([
    {
      id: "portfolio-1",
      x: 600,
      y: 100,
      funitureType: "none",
      funiturename: "포트폴리오1",
    },
    {
      id: "portfolio-2",
      x: 780,
      y: 180,
      funitureType: "none",
      funiturename: "포트폴리오2",
    },
    {
      id: "portfolio-3",
      x: 900,
      y: 90,
      funitureType: "none",
      funiturename: "포트폴리오3",
    },
  ]);
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
    {
      id: "technologyStack-3",
      x: 600,
      y: 300,
      funitureType: "none",
      funiturename: "기술스택3",
    },
    {
      id: "technologyStack-4",
      x: 650,
      y: 550,
      funitureType: "none",
      funiturename: "기술스택4",
    },
    {
      id: "technologyStack-5",
      x: 1150,
      y: 600,
      funitureType: "none",
      funiturename: "기술스택5",
    },
    {
      id: "technologyStack-6",
      x: 1000,
      y: 450,
      funitureType: "none",
      funiturename: "기술스택6",
    },
    {
      id: "technologyStack-7",
      x: 1160,
      y: 400,
      funitureType: "none",
      funiturename: "기술스택7",
    },
    {
      id: "technologyStack-8",
      x: 1250,
      y: 200,
      funitureType: "none",
      funiturename: "기술스택8",
    },
    {
      id: "technologyStack-9",
      x: 750,
      y: 400,
      funitureType: "none",
      funiturename: "기술스택9",
    },
  ]);

  // --------------------------------------------------
  // (F) 게시판(방명록)
  // --------------------------------------------------
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

  // --------------------------------------------------
  // (G) 모달들
  // --------------------------------------------------
  const [resumeModalOpen, setResumeModalOpen] = useState(false);
  const [portfolioModalOpen, setPortfolioModalOpen] = useState(false);

  // ★ 바뀐 부분: 다중 선택으로 변경
  const [techStackModalOpen, setTechStackModalOpen] = useState(false);
  const [selectedTechList, setSelectedTechList] = useState<string[]>([]);

  // 이력서 링크
  const [resumeLink, setResumeLink] = useState("");
  // 포트폴리오 파일
  const [portfolioFile, setPortfolioFile] = useState<File | null>(null);

  // --------------------------------------------------
  // (H) 가구 상세 모달
  // --------------------------------------------------
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedFurnitureData, setSelectedFurnitureData] =
    useState<Funiture | null>(null);

  // --------------------------------------------------
  // (H-2) PDF 뷰어 모달
  // --------------------------------------------------
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string>("");

  // --------------------------------------------------
  // (I) 스프라이트 로딩 훅
  // --------------------------------------------------
  const spriteImages = useLoadSprites();

  // --------------------------------------------------
  // (J) 키 입력 상태
  // --------------------------------------------------
  const [pressedKeys, setPressedKeys] = useState<Record<string, boolean>>({});

  // --------------------------------------------------
  // (K) 포탈
  // --------------------------------------------------
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

  // --------------------------------------------------
  // 포탈 overlap
  // --------------------------------------------------
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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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
        ].includes(e.key)
      ) {
        e.preventDefault();
      }
      if (e.key === " ") {
        e.preventDefault();
        if (checkPortalOverlap()) {
          window.location.href = portal.route;
        }
      }
      setPressedKeys((prev) => ({ ...prev, [e.key]: true }));
    };
    const handleKeyUp = (e: KeyboardEvent) => {
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
  }, [users, portal]);

  // --------------------------------------------------
  // 방향 계산
  // --------------------------------------------------
  function getNewDirection(usersList: User[]): Direction | null {
    const me = usersList.find((u) => u.id === myUserId);
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

  // --------------------------------------------------
  // 애니메이션 프레임
  // --------------------------------------------------
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
  }, []);

  // --------------------------------------------------
  // 키 입력 -> 쓰로틀
  // --------------------------------------------------
  const throttledPressedKeys = useThrottle(pressedKeys, 100);

  // --------------------------------------------------
  // 이동
  // --------------------------------------------------
  useEffect(() => {
    setUsers((prev) => {
      const newArr = [...prev];
      const meIdx = newArr.findIndex((u) => u.id === myUserId);
      if (meIdx < 0) return newArr;

      const me = newArr[meIdx];
      let { x, y } = me;
      const newDir = getNewDirection(newArr);

      if (newDir === null) {
        newArr[meIdx] = { ...me, isMoving: false };
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

      newArr[meIdx] = {
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

  // --------------------------------------------------
  // rAF 렌더
  // --------------------------------------------------
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

  // --------------------------------------------------
  // 게시판 글 작성
  // --------------------------------------------------
  const handleAddComment = () => {
    if (!visitorName.trim() || !visitorMessage.trim()) return;
    setBoardComments((prev) => [
      ...prev,
      { id: prev.length + 1, name: visitorName, message: visitorMessage },
    ]);
    setVisitorName("");
    setVisitorMessage("");
  };

  // --------------------------------------------------
  // 모달 열기
  // --------------------------------------------------
  const handleOpenResumeModal = () => {
    if (resume.filter((r) => r.funitureType !== "none").length >= 1) return;
    setResumeModalOpen(true);
  };
  const handleOpenPortfolioModal = () => {
    if (portfolio.filter((p) => p.funitureType !== "none").length >= 3) return;
    setPortfolioModalOpen(true);
  };

  // ★ 열기 (체크박스 버전)
  const handleOpenTechStackModal = () => {
    // 열기 전, selectedTechList를 초기화하거나 유지
    setTechStackModalOpen(true);
  };

  // --------------------------------------------------
  // (S) 이력서 / 포트폴리오 / 기술스택 저장
  // --------------------------------------------------
  const handleSaveResume = () => {
    const idx = resume.findIndex((r) => r.funitureType === "none");
    if (idx !== -1) {
      setResume((prev) =>
        prev.map((item, i) =>
          i === idx
            ? {
                ...item,
                funitureType: `resume/resume${idx + 1}`,
                data: { resumeLink },
              }
            : item,
        ),
      );
    }
    setResumeModalOpen(false);
    setResumeLink("");
  };

  const handleSavePortfolio = async () => {
    if (!portfolioFile) {
      setPortfolioModalOpen(false);
      return;
    }
    try {
      const formData = new FormData();
      formData.append("file", portfolioFile);

      const res = await fetch("/api/portfolio", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Upload failed");
      }
      const s3Url = data.url;
      const idx = portfolio.findIndex((p) => p.funitureType === "none");
      if (idx !== -1) {
        setPortfolio((prev) =>
          prev.map((item, i) =>
            i === idx
              ? {
                  ...item,
                  funitureType: `portfolio/portfolio${idx + 1}`,
                  data: { fileName: portfolioFile.name, url: s3Url },
                }
              : item,
          ),
        );
      }
      setPortfolioModalOpen(false);
      setPortfolioFile(null);
    } catch (error) {
      // 실패 처리
    }
  };

  // ★ (다중) 기술 스택 저장
  const handleSaveTechStack = () => {
    if (selectedTechList.length === 0) {
      // 아무것도 선택 안 했다면 그냥 닫기
      setTechStackModalOpen(false);
      return;
    }

    // 1) 현재 technologyStack 중 "none"인 게 몇 개인지
    const noneSlots = technologyStack.filter((t) => t.funitureType === "none");
    if (noneSlots.length === 0) {
      alert("더 이상 기술 스택을 추가할 수 없습니다.");
      setTechStackModalOpen(false);
      return;
    }

    // 2) 현재까지 이미 선택(추가)된 스택 개수
    const usedCount = technologyStack.filter(
      (t) => t.funitureType !== "none",
    ).length;

    // 3) 새로 추가할 스택 개수
    const newCount = selectedTechList.length;
    const totalCount = usedCount + newCount;

    if (totalCount > 9) {
      alert(
        `최대 9개까지만 추가 가능합니다. 현재 ${usedCount}개 + 새로운 ${newCount}개 = ${totalCount}개 (초과)`,
      );
      return;
    }

    // 4) "none"인 슬롯 순서대로 채워넣기
    //    selectedTechList 개수만큼
    setTechnologyStack((prev) => {
      const newState = [...prev];
      let idxSlot = 0;
      for (let i = 0; i < newState.length; i++) {
        if (newState[i].funitureType === "none" && idxSlot < newCount) {
          newState[i] = {
            ...newState[i],
            funitureType: `technologyStack/technologyStack${i + 1}`,
            data: { stack: selectedTechList[idxSlot] },
          };
          idxSlot++;
        }
        if (idxSlot >= newCount) break;
      }
      return newState;
    });

    // 5) 선택 목록 초기화 + 모달 닫기
    setSelectedTechList([]);
    setTechStackModalOpen(false);
  };

  // --------------------------------------------------
  // (T) 가구 클릭 → 상세 or PDF or alert
  // --------------------------------------------------
  const handleFurnitureClick = (f: Funiture) => {
    // "none" 분기
    if (f.funitureType === "none") {
      if (f.funiturename.includes("이력서")) {
        alert("정보가 없습니다. 버튼을 통해 이력서를 추가 해주세요!");
      } else if (f.funiturename.includes("포트폴리오")) {
        alert("정보가 없습니다. 버튼을 통해 포트폴리오를 추가 해주세요!");
      } else if (f.funiturename.includes("기술스택")) {
        alert("정보가 없습니다. 버튼을 통해 기술스택을 추가 해주세요!");
      } else {
        alert("정보가 없습니다. 추가해주세요!");
      }
      return;
    }

    // "board" → 게시판
    if (f.funitureType === "board") {
      return setIsBoardOpen(true);
    }

    // "portfolio" → PDF
    if (f.funitureType?.startsWith("portfolio")) {
      const pdfLink = f.data?.url || "";
      if (pdfLink) {
        setPdfUrl(pdfLink);
        setPdfModalOpen(true);
        return;
      }
      alert("포트폴리오 정보가 없습니다!");
      return;
    }

    // 그 외(이력서, 기술스택 등) → 상세 모달
    setSelectedFurnitureData(f);
    setViewModalOpen(true);
  };

  // --------------------------------------------------
  // 버튼 비활성화
  // --------------------------------------------------
  const isResumeButtonDisabled =
    resume.filter((r) => r.funitureType !== "none").length >= 1;
  const isPortfolioButtonDisabled =
    portfolio.filter((p) => p.funitureType !== "none").length >= 3;
  const isTechStackButtonDisabled =
    technologyStack.filter((t) => t.funitureType !== "none").length >= 9;

  // ----------------------- [추가] 주인의 구글ID를 받아서 API 요청 -----------------------
  const params = useParams() as { google_id?: string };
  const googleId = params.google_id || null;

  // API 훅 호출
  const {
    data: ownerProfile,
    isLoading: isProfileLoading,
    isError: isProfileError,
  } = useMyRoomOwnerProfile(googleId);

  // 가져온 데이터 → state 반영
  useEffect(() => {
    if (ownerProfile) {
      // resume_url
      if (ownerProfile.resume_url) {
        setResume((prev) =>
          prev.map((item, idx) => {
            if (idx === 0) {
              return {
                ...item,
                funitureType: "resume/resume1",
                data: { resumeLink: ownerProfile.resume_url },
              };
            }
            return item;
          }),
        );
      }

      // portfolio_url
      if (
        ownerProfile.portfolio_url &&
        Array.isArray(ownerProfile.portfolio_url)
      ) {
        setPortfolio((prev) => {
          const newState = [...prev];
          ownerProfile.portfolio_url.forEach((url: string, i: number) => {
            if (i < newState.length) {
              newState[i] = {
                ...newState[i],
                funitureType: `portfolio/portfolio${i + 1}`,
                data: { url, fileName: `portfolio${i + 1}.pdf` },
              };
            }
          });
          return newState;
        });
      }

      // tech_stack
      if (ownerProfile.tech_stack && Array.isArray(ownerProfile.tech_stack)) {
        setTechnologyStack((prev) => {
          const newState = [...prev];
          ownerProfile.tech_stack.forEach((stackItem: string, i: number) => {
            if (i < newState.length) {
              newState[i] = {
                ...newState[i],
                funitureType: `technologyStack/technologyStack${i + 1}`,
                data: { stack: stackItem },
              };
            }
          });
          return newState;
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
      {/* 절대위치 캔버스 */}
      <canvas ref={canvasRef} className={Style.absoluteCanvasClass} />

      {/* 가구 표시 */}
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

      {/* 게시판(방명록) */}
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

      {/* 포탈 */}
      <div
        className={Style.furnitureContainerClass}
        style={{
          left: portal.x,
          top: portal.y,
          width: 200,
          height: 200,
        }}
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

      {/* 우측 하단 버튼들 */}
      <div className={Style.bottomButtonsClass}>
        <Button
          onClick={handleOpenResumeModal}
          disabled={isResumeButtonDisabled}
        >
          이력서 추가
        </Button>
        <Button
          onClick={handleOpenPortfolioModal}
          disabled={isPortfolioButtonDisabled}
        >
          포트폴리오 추가
        </Button>
        <Button
          onClick={handleOpenTechStackModal}
          disabled={isTechStackButtonDisabled}
        >
          기술 스택 추가
        </Button>
      </div>

      {/* 모달들 */}
      <ResumeModal
        open={resumeModalOpen}
        onClose={setResumeModalOpen}
        resumeLink={resumeLink}
        setResumeLink={setResumeLink}
        onSave={handleSaveResume}
      />

      <PortfolioModal
        open={portfolioModalOpen}
        onClose={setPortfolioModalOpen}
        portfolioFile={portfolioFile}
        setPortfolioFile={setPortfolioFile}
        onSave={handleSavePortfolio}
      />

      {/* ★ 여러 개 선택할 수 있는 TechStackModal */}
      <TechStackModal
        open={techStackModalOpen}
        onClose={setTechStackModalOpen}
        techStackList={techStackList}
        selectedTechList={selectedTechList}
        setSelectedTechList={setSelectedTechList}
        onSave={handleSaveTechStack}
      />

      <FurnitureInfoModal
        open={viewModalOpen}
        onClose={setViewModalOpen}
        furniture={selectedFurnitureData}
      />

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

      <PdfViewerModal
        open={pdfModalOpen}
        onClose={setPdfModalOpen}
        pdfUrl={pdfUrl}
      />
    </div>
  );
};

export default MyRoomCanvas;
