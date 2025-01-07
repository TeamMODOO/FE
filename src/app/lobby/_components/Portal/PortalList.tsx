"use client";

import NextImage from "next/image";

import { PortalListProps } from "@/model/Portal";

// 스타일 임포트
import Style from "./PortalList.style";

function PortalList({ portals }: PortalListProps) {
  return (
    <div className={Style.portalListContainer}>
      {portals.map((portal, i) => {
        const isFlipped = i === 1; // 예시: 두 번째 포탈만 뒤집기
        return (
          <div
            key={`portal-${i}`}
            className={Style.portalItemContainer}
            style={{
              left: portal.x,
              top: portal.y,
              width: portal.width,
              height: portal.height,
            }}
          >
            {/* 좌우 반전은 transform에 동적 반영 필요하므로 인라인 스타일로 */}
            <div style={{ transform: isFlipped ? "scaleX(-1)" : "none" }}>
              <NextImage
                src="/furniture/portal.gif"
                alt="Portal"
                width={portal.width}
                height={portal.height}
                priority
              />
            </div>
            <div className={Style.portalName}>{portal.name}</div>
          </div>
        );
      })}
    </div>
  );
}

export default PortalList;
