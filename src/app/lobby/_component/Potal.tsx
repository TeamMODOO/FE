"use client";

import NextImage from "next/image";
import { PortalProps } from "../_model/Portal";

function Portal({ x, y, width, height, name }: PortalProps) {
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width,
        height,
        textAlign: "center",
        zIndex: 9, // 여기서도 높게
      }}
    >
      <NextImage
        src="/furniture/portal.gif"
        alt="Portal"
        width={width}
        height={height}
        priority
      />
      <div style={{ color: "white", fontWeight: "bold", fontSize: 16 }}>
        {name}
      </div>
    </div>
  );
}

export default Portal;
