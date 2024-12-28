"use client";
import { useEffect, useRef, useState } from "react";

// 예시: 애니메이션 정보
// 여기서는 간단히 walk / jump만 예로 들고, 각각 4프레임, 5프레임이라 가정
// 실제로는 질문에 나온 "WALK(256×128)", "JUMP(160×128)" 등의 정보를 활용하세요.
const ANIMATION_INFO = {
  walk: {
    frameWidth: 32, // 1프레임 가로 너비
    frameHeight: 32, // 1프레임 세로 높이
    frames: 4, // 총 4프레임
    startY: 0, // 이 애니메이션이 시트에서 시작하는 y좌표
  },
  jump: {
    frameWidth: 32,
    frameHeight: 32,
    frames: 5,
    // 예: walk 아래쪽에 jump가 이어붙어 있다고 가정 -> y=32 * (어느 행)
    // 실제 이미지 구조에 맞춰 수정 필요
    startY: 32 * 1, // 예) 두 번째 행이라면 y=32 정도로 가정
  },
  // pickUp, sword, etc... 필요에 따라 계속 추가
} as const;

// 레이어별 PNG 경로
// 실제 프로젝트의 public 폴더 구조에 맞춰 수정하세요.
const SPRITE_PATHS = {
  body: "/sprites/body.png",
  eyes: "/sprites/eyes.png",
  clothes: "/sprites/clothes.png",
  hair: "/sprites/hair.png",
};

// 레이어 순서 (body → eyes → clothes → hair).
// 원한다면 accessory, beard 등 더 추가 가능
const LAYER_ORDER = ["body", "eyes", "clothes", "hair"] as const;

export default function TestLayersPage() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // 로드된 이미지 객체들 (key=layer, value=HTMLImageElement)
  const [spriteImages, setSpriteImages] = useState<
    Record<string, HTMLImageElement>
  >({});

  // 현재 애니메이션(액션) 이름
  const [action, setAction] = useState<keyof typeof ANIMATION_INFO>("walk");

  // 현재 재생 중인 프레임 index
  const [frameIndex, setFrameIndex] = useState(0);

  // 방향(direction) 예시: 0=down, 1=left, 2=right, 3=up 등
  // 혹은 “행이 다른 애니메이션”이라면 0 고정이어도 됨
  const [direction, setDirection] = useState(0);

  // 1) 이미지 로드
  useEffect(() => {
    const loaded: Record<string, HTMLImageElement> = {};
    const entries = Object.entries(SPRITE_PATHS);
    let count = 0;

    entries.forEach(([layer, path]) => {
      const img = new Image();
      img.src = path;
      img.onload = () => {
        loaded[layer] = img;
        count++;
        if (count === entries.length) {
          setSpriteImages(loaded);
        }
      };
      // onerror 추가 시, 에러 원인 디버깅 가능
      img.onerror = (e) => {
        // console.error(`Fail to load image [${path}]`, e);
      };
    });
  }, []);

  // 2) 애니메이션 자동재생 예시 (매 300ms마다 frameIndex 증가)
  useEffect(() => {
    const timer = setInterval(() => {
      setFrameIndex((prev) => {
        const maxFrames = ANIMATION_INFO[action].frames;
        return (prev + 1) % maxFrames; // 순환
      });
    }, 300);

    return () => clearInterval(timer);
  }, [action]);

  // 3) 캔버스 그리기
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 간단히 200×200 캔버스를 준비
    canvas.width = 200;
    canvas.height = 200;

    // 배경을 흰색으로
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 현재 액션(애니메이션) 정보 가져오기
    const info = ANIMATION_INFO[action];
    const fW = info.frameWidth;
    const fH = info.frameHeight;

    // 만약 direction마다 행이 다르다면, startY + direction*fH
    // 여기서는 예시로 direction=0행만 사용 중이라 단순 계산
    const sy = info.startY + direction * fH;
    const sx = frameIndex * fW;

    // 캔버스에 그릴 위치
    const dx = 50;
    const dy = 50;

    // 각 레이어 순서대로 겹쳐 그리기
    LAYER_ORDER.forEach((layer) => {
      const img = spriteImages[layer];
      if (!img) return; // 아직 로드가 안 됐다면 패스

      ctx.drawImage(img, sx, sy, fW, fH, dx, dy, fW, fH);
    });
  }, [spriteImages, action, frameIndex, direction]);

  return (
    <div style={{ textAlign: "center", marginTop: 30 }}>
      <h1>Test Layers Page</h1>
      <p>
        아래 캔버스에서 body + eyes + clothes + hair가 겹쳐 표시되는지 확인.
      </p>

      {/* zIndex를 100으로, position을 relative로 설정 */}
      <canvas
        ref={canvasRef}
        style={{
          border: "1px solid gray",
          position: "relative",
          zIndex: 100,
        }}
      />

      <div style={{ marginTop: 10 }}>
        <button onClick={() => setAction("walk")}>Walk</button>
        <button onClick={() => setAction("jump")}>Jump</button>
        {/* 방향 전환 테스트용 버튼 (원하면 사용) */}
        <button onClick={() => setDirection((d) => (d + 1) % 4)}>
          Change Direction
        </button>
      </div>
    </div>
  );
}
