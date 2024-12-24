"use client";

import NextImage from "next/image";
import { PortalListProps } from "../_model/Portal";

function PortalList({ portals }: PortalListProps) {
  return (
    // zIndex를 높게 (예: 9)
    <div style={{ position: "absolute", top: 0, left: 0, zIndex: 9 }}>
      {portals.map((portal, i) => {
        const isFlipped = i === 1; // 예시: 두 번째 포탈만 뒤집기
        return (
          <div
            key={`portal-${i}`}
            style={{
              position: "absolute",
              left: portal.x,
              top: portal.y,
              width: portal.width,
              height: portal.height,
              textAlign: "center",
            }}
          >
            <div style={{ transform: isFlipped ? "scaleX(-1)" : "none" }}>
              <NextImage
                src="/furniture/portal.gif"
                alt="Portal"
                width={portal.width}
                height={portal.height}
                priority
              />
            </div>
            <div
              style={{
                color: "white",
                fontWeight: "bold",
                fontSize: 16,
                textAlign: "center",
              }}
            >
              {portal.name}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default PortalList;
