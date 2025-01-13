"use client";

import React, { useEffect, useRef, useState } from "react";

import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";

import { useSession } from "next-auth/react";

// (추가) AlertModal import
import AlertModal from "@/components/alertModal/AlertModal";
import { BgMusicButton } from "@/components/bgMusic/BgMusicButton";
import { BgMusicGlobal } from "@/components/bgMusic/BgMusicGlobal";
import { Button } from "@/components/ui/button";
// ---- Hooks
import { useMyRoomKeyboard } from "@/hooks/myroom/useMyRoomKeyboard";
import { useMyRoomRenderer } from "@/hooks/myroom/useMyRoomRenderer";
import { useLoadSprites } from "@/hooks/performance/useLoadSprites";
// ---- Models & Types
import { Funiture } from "@/model/Funiture";
import { Direction, User } from "@/model/User";
// ---- API
import { useMyRoomOwnerProfile } from "@/queries/myroom/useMyRoomOwnerProfile";
import { usePatchMyRoomOwnerProfile } from "@/queries/myroom/usePatchMyRoomOwnerProfile";

// ---- 상수/데이터
import {
  CHAR_SCALE,
  defaultBoard,
  defaultPortfolio,
  defaultResume,
  defaultTechnologyStack,
  interiorImages,
  MAP_CONSTANTS,
  MYROOM_COLLISION_ZONES,
  techStackList,
} from "../../_constant";
// ---- 모달
import BoardModal from "../BoardModal/BoardModal";
import FurnitureInfoModal from "../FurnitureInfoModal/FurnitureInfoModal";
import PortfolioLinkViewModal from "../PortfolioLinkViewModal/PortfolioLinkViewModal";
import PdfViewerModal from "../PortfolioModal/PdfViewerModal";
import PortfolioModal from "../PortfolioModal/PortfolioModal";
import ResumeModal from "../ResumeModal/ResumeModal";
import TechStackModal from "../TechStackModal/TechStackModal";
// ---- 스타일
import Style from "./Canvas.style";

const MyRoomCanvas: React.FC = () => {
  const router = useRouter();
  // 걷기 효과음 재생 위해 추가
  const walkAudioRef = useRef<HTMLAudioElement | null>(null);

  const footstepSounds = ["/sounds/walk01.wav", "/sounds/walk02.wav"];

  const stepIndexRef = useRef(0);

  function getNextFootstepSound() {
    const idx = stepIndexRef.current;
    const src = footstepSounds[idx];
    stepIndexRef.current = (idx + 1) % footstepSounds.length;
    return src;
  }
  // 모달 이벤트 효과음
  const modalEventAudioRef = useRef<HTMLAudioElement | null>(null);
  // 포탈 이동 음향 처리
  // 1) 오디오 ref
  const portalAudioRef = useRef<HTMLAudioElement | null>(null);

  function playModalEventSound() {
    if (!modalEventAudioRef.current) return;
    modalEventAudioRef.current.currentTime = 0;
    modalEventAudioRef.current.play().catch(() => {});
  }

  // 2) 사운드 재생 함수
  function playPortalSound() {
    if (!portalAudioRef.current) return;
    portalAudioRef.current.currentTime = 0;
    portalAudioRef.current.play().catch(() => {
      // 브라우저 정책으로 막힐 수 있음
    });
  }

  // 3) 페이드 아웃 상태
  const [isFadingOut, setIsFadingOut] = useState(false);

  // 4) 실제 "/lobby" 이동 함수
  function goLobby() {
    // 사운드 재생
    playPortalSound();
    // 페이드 아웃 시작
    setIsFadingOut(true);
    // 0.7초 후 이동
    setTimeout(() => {
      router.push("/lobby");
    }, 700);
  }
  //////////////////////////////////////////

  // 발소리 관련
  // 최소 발소리 간격 (ms)
  const FOOTSTEP_INTERVAL = 250;
  // 마지막 발소리 시점 기록 (렌더링 간 보존 위해 useRef)
  const lastFootstepTime = useRef(0);

  /** 한 걸음(이동)마다 발소리를 재생하는 함수 */
  function playFootstepSound() {
    if (!walkAudioRef.current) return;

    // 1) 쿨다운 체크
    const now = Date.now();
    if (now - lastFootstepTime.current < FOOTSTEP_INTERVAL) {
      // 아직 (예: 400ms) 안 지났으면 재생 안 함
      return;
    }
    // 쿨다운 갱신
    lastFootstepTime.current = now;

    // 2) 다음 음원 결정
    const nextSrc = getNextFootstepSound();

    // 3) <audio>에 src 할당하고 재생
    walkAudioRef.current.src = nextSrc;
    walkAudioRef.current.currentTime = 0;

    walkAudioRef.current.play();
    // .catch((err) => console.log("Footstep sound blocked:", err));
  }

  /////////////////////////////////////////

  /** 1) session 훅 */
  const { data: session, status } = useSession();
  const isLoadingSession = status === "loading";

  /** 2) 화면 크기 / 캔버스 설정 */
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [canvasSize, setCanvasSize] = useState({ w: 1400, h: 800 });
  useEffect(() => {
    function handleResize() {
      setCanvasSize({ w: window.innerWidth, h: window.innerHeight });
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  /** 3) 배경 이미지 로딩 */
  const [backgroundImage, setBackgroundImage] =
    useState<HTMLImageElement | null>(null);
  useEffect(() => {
    const bg = new Image();
    bg.src = "/background/myroom.png";
    bg.onload = () => setBackgroundImage(bg);
  }, []);

  /**
   * 4) myUser(내 캐릭터) 초기값은 nickname이 비어있게 두고,
   *    session 상태가 바뀔 때 useEffect로 nickname을 업데이트
   */
  const [myUser, setMyUser] = useState<User>({
    id: "me",
    x: 300,
    y: 700,
    nickname: "", // 초기값 비우기
    characterType: "sprite1",
    direction: 0,
    isMoving: false,
  });

  /**
   * 5) session 상태(status)가 'loading'이 끝나면,
   *    session?.user?.name이 있으면 그대로 사용,
   *    없으면 GuestUser로 대체
   */
  useEffect(() => {
    if (status === "loading") return; // 아직 로딩 중이면 패스

    setMyUser((prev) => ({
      ...prev,
      nickname: session?.user?.name || "GuestUser",
    }));
  }, [session, status]);

  /** 6) 가구/포탈/방명록 */
  const [resume, setResume] = useState<Funiture[]>(defaultResume);
  const [portfolio, setPortfolio] = useState<Funiture[]>(defaultPortfolio);
  const [technologyStack, setTechnologyStack] = useState<Funiture[]>(
    defaultTechnologyStack,
  );
  const [board] = useState<Funiture[]>(defaultBoard);
  const [isBoardOpen, setIsBoardOpen] = useState(false);

  // 방명록 상태
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

  // 포탈
  const [portal, setPortal] = useState({
    x: 20,
    y: 680,
    width: 200,
    height: 150,
    route: "/lobby",
    name: "로비 포탈",
  });

  // 모달 관련
  const [resumeModalOpen, setResumeModalOpen] = useState(false);
  const [portfolioModalOpen, setPortfolioModalOpen] = useState(false);
  const [techStackModalOpen, setTechStackModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [portfolioLinkViewModalOpen, setPortfolioLinkViewModalOpen] =
    useState(false);

  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [portfolioLink, setPortfolioLink] = useState("");
  const [selectedTechList, setSelectedTechList] = useState<string[]>([]);

  const [selectedFurnitureData, setSelectedFurnitureData] =
    useState<Funiture | null>(null);
  const [pdfUrl, setPdfUrl] = useState("");
  const [clickedPortfolioLink, setClickedPortfolioLink] = useState("");

  /** 7) 모달 열림 여부 통합 */
  const isAnyModalOpen =
    resumeModalOpen ||
    portfolioModalOpen ||
    techStackModalOpen ||
    viewModalOpen ||
    isBoardOpen ||
    pdfModalOpen ||
    portfolioLinkViewModalOpen;

  /** 8) 키 입력 훅 → 캐릭터 이동 */
  const { pressedKeys } = useMyRoomKeyboard({
    users: [{ ...myUser }],
    setUsers: (action) => {
      setMyUser((prev) => {
        const arr = [prev];
        if (typeof action === "function") {
          const newArr = action(arr);
          return newArr[0];
        } else {
          return action[0] ? action[0] : prev;
        }
      });
    },
    myUserId: "me",
    isAnyModalOpen,
    portal,
    onPortalEnter: goLobby,
  });

  /** 9) 캐릭터 스프라이트 로딩 */
  const spriteImages = useLoadSprites();

  /** 9-1) 가구/포탈/방명록 이미지 로딩 */
  const [furnitureImages, setFurnitureImages] = useState<
    Record<string, HTMLImageElement>
  >({});
  useEffect(() => {
    const entries = Object.entries(interiorImages);
    if (entries.length === 0) return;

    const loaded: Record<string, HTMLImageElement> = {};
    let loadedCount = 0;
    entries.forEach(([key, src]) => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        loaded[key] = img;
        loadedCount++;
        if (loadedCount === entries.length) {
          setFurnitureImages(loaded);
        }
      };
    });
  }, []);

  /** 10) useMyRoomRenderer로 캔버스 렌더링 */
  useMyRoomRenderer({
    canvasRef,
    canvasSize,
    backgroundImage,
    spriteImages,
    myUser,
    charScale: CHAR_SCALE,
    furnitureImages,
    resume,
    portfolio,
    technologyStack,
    board,
    portal,
  });

  /** (충돌 판정) */
  function doRectsOverlap(
    rect1: { x: number; y: number; width: number; height: number },
    rect2: { x: number; y: number; width: number; height: number },
  ): boolean {
    return !(
      rect1.x + rect1.width <= rect2.x ||
      rect1.x >= rect2.x + rect2.width ||
      rect1.y + rect1.height <= rect2.y ||
      rect1.y >= rect2.y + rect2.height
    );
  }

  /** 11) 이동 로직 */
  useEffect(() => {
    // 모달 열려있으면 캐릭터 이동 막음
    if (isAnyModalOpen) return;

    setMyUser((prev) => {
      let { x, y } = prev;
      let newDir: Direction | null = null;

      if (pressedKeys["w"] || pressedKeys["W"] || pressedKeys["ArrowUp"]) {
        newDir = 1;
      } else if (
        pressedKeys["s"] ||
        pressedKeys["S"] ||
        pressedKeys["ArrowDown"]
      ) {
        newDir = 0;
      } else if (
        pressedKeys["d"] ||
        pressedKeys["D"] ||
        pressedKeys["ArrowRight"]
      ) {
        newDir = 2;
      } else if (
        pressedKeys["a"] ||
        pressedKeys["A"] ||
        pressedKeys["ArrowLeft"]
      ) {
        newDir = 3;
      }

      if (newDir === null) {
        return { ...prev, isMoving: false };
      }

      const SPEED = MAP_CONSTANTS.SPEED;
      const SPRITE_SIZE = 64 * CHAR_SCALE;
      let moved = false;
      const prevX = x;
      const prevY = y;

      // 맵 경계 처리 + 이동
      switch (newDir) {
        case 1: // up
          if (y > 0) {
            y = Math.max(0, y - SPEED);
            moved = true;
          }
          break;
        case 0: // down
          {
            const maxY = 900 - 128;
            if (y < maxY) {
              y = Math.min(maxY, y + SPEED);
              moved = true;
            }
          }
          break;
        case 2: // right
          {
            const maxX = 2000 - 82;
            if (x < maxX) {
              x = Math.min(maxX, x + SPEED);
              moved = true;
            }
          }
          break;
        case 3: // left
          if (x > 0) {
            x = Math.max(0, x - SPEED);
            moved = true;
          }
          break;
      }

      // 충돌 체크
      if (moved) {
        const newBox = { x, y, width: SPRITE_SIZE, height: SPRITE_SIZE };
        let collision = false;
        for (const zone of MYROOM_COLLISION_ZONES) {
          if (doRectsOverlap(newBox, zone)) {
            collision = true;
            break;
          }
        }
        if (collision) {
          x = prevX;
          y = prevY;
          moved = false;
        } else {
          playFootstepSound();
        }
      }

      return {
        ...prev,
        x,
        y,
        direction: newDir,
        isMoving: moved,
      };
    });
  }, [pressedKeys, isAnyModalOpen]);

  /** 12) 방명록 작성 */
  const handleAddComment = () => {
    if (!visitorName.trim() || !visitorMessage.trim()) return;
    setBoardComments((prev) => [
      ...prev,
      { id: prev.length + 1, name: visitorName, message: visitorMessage },
    ]);
    setVisitorName("");
    setVisitorMessage("");
  };

  /** 13) API 쿼리 & PATCH */
  const params = useParams() as { google_id?: string };
  const googleId = params.google_id || undefined;
  const { data: ownerProfile } = useMyRoomOwnerProfile(googleId);

  // ownerProfile → 로컬 state
  useEffect(() => {
    if (!ownerProfile) return;

    // 이력서
    const resumeVal = ownerProfile.resume_url;
    // (resume_url이 string[] 인지 string 인지에 따라 처리 방식 조정)
    setResume((prev) => {
      if (!resumeVal || resumeVal.length === 0) {
        return prev.map((item) => ({
          ...item,
          funitureType: "none",
          data: {},
        }));
      }
      // 단일 PDF만 받는다고 가정하면, 혹은 첫 번째 인덱스 사용
      return prev.map((item, idx) => {
        if (idx === 0) {
          return {
            ...item,
            funitureType: "resume/resume1",
            data: {
              resumeLink: Array.isArray(resumeVal) ? resumeVal[0] : resumeVal,
            },
          };
        }
        return item;
      });
    });

    // 포트폴리오
    const pArr = ownerProfile.portfolio_url ?? [];
    setPortfolio((prev) => {
      if (pArr.length === 0) {
        return prev.map((item) => ({
          ...item,
          funitureType: "none",
          data: {},
        }));
      }
      return prev.map((item, idx) => {
        if (idx < pArr.length) {
          return {
            ...item,
            funitureType: `portfolio/portfolio${idx + 1}`,
            data: { fileName: pArr[idx] },
          };
        }
        return { ...item, funitureType: "none", data: {} };
      });
    });

    // 기술 스택
    const tArr = ownerProfile.tech_stack ?? [];
    setTechnologyStack((prev) => {
      if (tArr.length === 0) {
        return prev.map((item) => ({
          ...item,
          funitureType: "none",
          data: {},
        }));
      }
      return prev.map((item, idx) => {
        if (idx < tArr.length && idx < 8) {
          return {
            ...item,
            funitureType: `technologyStack/technologyStack${idx + 1}`,
            data: { stack: tArr[idx] },
          };
        }
        return { ...item, funitureType: "none", data: {} };
      });
    });
  }, [ownerProfile]);

  /** 14) canvas 클릭 */
  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;

    const handleClick = (e: MouseEvent) => {
      if (isAnyModalOpen) return;

      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      const scale = canvasSize.h / 900;
      const viewWidth = canvasSize.w / scale;
      let cameraX = 0;

      const centerX = myUser.x + 64 * CHAR_SCALE * 0.5;
      cameraX = centerX - viewWidth / 2;

      const maxCamX = 2000 - viewWidth;
      if (cameraX < 0) cameraX = 0;
      if (cameraX > maxCamX) cameraX = maxCamX;

      const worldX = cameraX + clickX / scale;
      const worldY = clickY / scale;

      // 방명록
      for (const b of board) {
        if (
          worldX >= b.x &&
          worldX <= b.x + b.width &&
          worldY >= b.y &&
          worldY <= b.y + b.height
        ) {
          playModalEventSound();
          setIsBoardOpen(true);
          return;
        }
      }

      // 포탈
      if (
        worldX >= portal.x &&
        worldX <= portal.x + portal.width &&
        worldY >= portal.y &&
        worldY <= portal.y + portal.height
      ) {
        goLobby();
        return;
      }

      // 가구
      const allFurniture = [...resume, ...portfolio, ...technologyStack];
      for (const f of allFurniture) {
        if (
          worldX >= f.x &&
          worldX <= f.x + f.width &&
          worldY >= f.y &&
          worldY <= f.y + f.height
        ) {
          playModalEventSound();
          handleFurnitureClickCustom(f);
          return;
        }
      }
    };

    canvas.addEventListener("click", handleClick);
    return () => {
      canvas.removeEventListener("click", handleClick);
    };
  }, [
    canvasRef,
    isAnyModalOpen,
    myUser,
    resume,
    portfolio,
    technologyStack,
    board,
    portal,
    canvasSize,
  ]);

  // (추가) AlertModal 관련 상태
  const [alertModalOpen, setAlertModalOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const openAlertModal = (message: string) => {
    setAlertMessage(message);
    setAlertModalOpen(true);
  };

  /** (C) 가구 클릭 로직 */
  const handleFurnitureClickCustom = (item: Funiture) => {
    if (item.funitureType === "none") {
      // alert → AlertModal
      openAlertModal("아직 등록되지 않은 항목입니다.");
      return;
    }
    if (item.funitureType.startsWith("resume/")) {
      const pdf = item.data?.resumeLink;
      if (!pdf) {
        openAlertModal("PDF 링크가 없습니다.");
        return;
      }
      setPdfUrl(pdf);
      setPdfModalOpen(true);
      return;
    }
    setSelectedFurnitureData(item);
    setViewModalOpen(true);
  };

  /** (D) 이력서/포트폴리오/기술스택 PATCH */
  const { mutate: patchProfile } = usePatchMyRoomOwnerProfile();

  const handleSaveResume = async () => {
    if (!resumeFile) {
      setResumeModalOpen(false);
      return;
    }
    try {
      // 1) S3 업로드 (예시)
      const formData = new FormData();
      formData.append("file", resumeFile);
      const res = await fetch("/api/resume", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Upload failed");
      const s3Url = data.url;

      // 2) PATCH 호출
      if (!googleId) {
        openAlertModal("Google 로그인 상태가 아닙니다. 수정이 불가합니다.");
        return;
      }
      patchProfile(
        {
          googleId,
          resume_url: s3Url,
        },
        {
          onSuccess: () => {
            openAlertModal("이력서(PDF) 저장 완료");
            setResumeModalOpen(false);
            setResumeFile(null);
          },
          onError: (err: Error) => {
            openAlertModal("프로필 수정 실패: " + err.message);
          },
        },
      );
    } catch (error: unknown) {
      openAlertModal("파일 업로드 실패: " + String(error));
    }
  };

  const handleSavePortfolio = () => {
    if (!portfolioLink.trim()) {
      setPortfolioModalOpen(false);
      return;
    }
    if (!googleId) {
      openAlertModal("googleId가 없음, 수정 불가");
      return;
    }
    patchProfile(
      {
        googleId,
        // 마찬가지로, 배열 구조라면 이렇게
        // 단일 문자열이라면 portfolio_url: portfolioLink
        portfolio_url: [portfolioLink],
      },
      {
        onSuccess: () => {
          openAlertModal("포트폴리오(링크) 저장 완료");
          setPortfolioModalOpen(false);
          setPortfolioLink("");
        },
        onError: (err: Error) => {
          openAlertModal("프로필 수정 실패: " + err.message);
        },
      },
    );
  };

  const handleSaveTechStack = () => {
    if (selectedTechList.length === 0) {
      setTechStackModalOpen(false);
      return;
    }
    if (!googleId) {
      openAlertModal("googleId가 없음, 수정 불가");
      return;
    }
    patchProfile(
      {
        googleId,
        tech_stack: [...selectedTechList],
      },
      {
        onSuccess: () => {
          openAlertModal("기술 스택 저장 완료");
          setTechStackModalOpen(false);
          setSelectedTechList([]);
        },
        onError: (err: Error) => {
          openAlertModal("프로필 수정 실패: " + err.message);
        },
      },
    );
  };

  /** (E) 이력서/포트폴리오/기술스택 모달 열기 버튼 */
  const handleOpenResumeModal = () => {
    playModalEventSound();
    setResumeModalOpen(true);
  };
  const handleOpenPortfolioModal = () => {
    playModalEventSound();
    setPortfolioModalOpen(true);
  };
  const handleOpenTechStackModal = () => {
    playModalEventSound();
    setTechStackModalOpen(true);
  };

  /**
   * 최종 JSX
   */
  return (
    <>
      <BgMusicGlobal src="/sounds/myroomBGM.wav" />
      <BgMusicButton />
      {isLoadingSession ? (
        /**
         * session이 아직 로딩중이라면 "Loading..." 만 표시
         */
        <div>Loading...</div>
      ) : (
        <div
          className={Style.canvasContainerClass}
          style={{
            width: `${canvasSize.w}px`,
            height: `${canvasSize.h}px`,
            overflow: "hidden",
            position: "relative",
          }}
        >
          {/* 발소리 재생 위한 오디오 태그 */}
          <audio ref={walkAudioRef} src="" />
          {/* 모달 이벤트 사운드용 <audio> */}
          <audio
            ref={modalEventAudioRef}
            src="/sounds/modalEvent.wav"
            style={{ display: "none" }}
          />
          {/* 포탈 사운드 재생을 위한 태그 */}
          <audio
            ref={portalAudioRef}
            src="/sounds/portalEvent.wav"
            style={{ display: "none" }}
          />

          {/* (1) Canvas */}
          <canvas ref={canvasRef} className={Style.absoluteCanvasClass} />

          {/* (2) 하단 버튼들 */}
          <div className={Style.bottomButtonsClass}>
            <p className={Style.bottomTitle}>마이룸 꾸미기</p>
            <Button
              onClick={handleOpenResumeModal}
              disabled={false}
              className={Style.bottomButton}
            >
              이력서(PDF) 추가
            </Button>
            <Button
              onClick={handleOpenPortfolioModal}
              disabled={false}
              className={Style.bottomButton}
            >
              포트폴리오(링크) 추가
            </Button>
            <Button
              onClick={handleOpenTechStackModal}
              disabled={false}
              className={Style.bottomButton}
            >
              기술 스택 추가
            </Button>
          </div>

          {/* (모달) 이력서 */}
          <ResumeModal
            open={resumeModalOpen}
            onClose={setResumeModalOpen}
            resumeFile={resumeFile}
            setResumeFile={setResumeFile}
            onSave={handleSaveResume}
          />

          {/* (모달) 포트폴리오 */}
          <PortfolioModal
            open={portfolioModalOpen}
            onClose={setPortfolioModalOpen}
            portfolioLink={portfolioLink}
            setPortfolioLink={setPortfolioLink}
            onSave={handleSavePortfolio}
          />

          {/* (모달) 기술스택 */}
          <TechStackModal
            open={techStackModalOpen}
            onClose={setTechStackModalOpen}
            techStackList={techStackList}
            selectedTechList={selectedTechList}
            setSelectedTechList={setSelectedTechList}
            onSave={handleSaveTechStack}
          />

          {/* (모달) 가구 정보 */}
          <FurnitureInfoModal
            open={viewModalOpen}
            onClose={setViewModalOpen}
            furniture={selectedFurnitureData ?? null}
          />

          {/* (모달) 방명록 */}
          {isBoardOpen && (
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
          )}

          {/* (모달) PDF 뷰어 */}
          <PdfViewerModal
            open={pdfModalOpen}
            onClose={setPdfModalOpen}
            pdfUrl={pdfUrl}
          />

          {/* (모달) 포트폴리오 링크 뷰어 */}
          <PortfolioLinkViewModal
            open={portfolioLinkViewModalOpen}
            onClose={setPortfolioLinkViewModalOpen}
            link={clickedPortfolioLink}
          />

          {/* (추가) AlertModal (대체된 alert) */}
          {alertModalOpen && (
            <AlertModal title="알림" onClose={() => setAlertModalOpen(false)}>
              {alertMessage}
            </AlertModal>
          )}
        </div>
      )}
      <div
        className={`
          duration-[2000ms] 
          pointer-events-none 
          fixed 
          inset-0 
          z-[9999]
          bg-black
          transition-opacity
          ${isFadingOut ? "opacity-100" : "opacity-0"}
        `}
      />
    </>
  );
};

export default MyRoomCanvas;
