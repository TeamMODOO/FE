"use client";

import NextImage from "next/image";

import { NpcListProps } from "../../_model/Npc";
import Style from "./NpcList.style";

function NpcList({ npcs }: NpcListProps) {
  return (
    <div className={Style.container}>
      {npcs.map((npc, idx) => (
        <div
          key={`npc-${idx}`}
          style={{
            position: "absolute",
            left: npc.x,
            top: npc.y,
            width: npc.width,
            height: npc.height,
          }}
          className={Style.npcItem}
        >
          <NextImage
            src={npc.image}
            alt={`NPC-${idx}`}
            width={npc.width}
            height={npc.height}
            priority
          />
          <div className={Style.npcLabel}>NPC {idx + 1}</div>
        </div>
      ))}
    </div>
  );
}

export default NpcList;
