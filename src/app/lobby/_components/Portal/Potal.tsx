"use client";

import NextImage from "next/image";

import { PortalProps } from "@/model/Portal";

import Style from "./Portal.style";

function Portal({ x, y, width, height, name }: PortalProps) {
  return (
    <div
      className={Style.portalContainer}
      style={{
        left: x,
        top: y,
        width,
        height,
      }}
    >
      <NextImage
        src="/furniture/portal.gif"
        alt="Portal"
        width={width}
        height={height}
        priority
      />
      <div className={Style.portalName}>{name}</div>
    </div>
  );
}

export default Portal;
