// Canvas.style.ts

/**
 * Tailwind 클래스를 모아두는 스타일 객체
 * - canvasContainerClass: 캔버스 컨테이너
 * - absoluteCanvasClass : 캔버스 절대 배치
 */

const Style = {
  canvasContainerClass: `
      relative
      w-[1150px]
      h-[830px]
      bg-overlay       /* 커스텀 bg-overlay 유틸리티가 있다고 가정 */
      bg-blend-overlay /* 커스텀 bg-blend-overlay 유틸리티가 있다고 가정 */
      overflow-hidden
      mx-auto          /* 수평 중앙 정렬 */
    `,

  absoluteCanvasClass: `
      absolute
      top-0
      left-0
    `,
};

export default Style;
