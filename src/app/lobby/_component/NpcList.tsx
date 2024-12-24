"use client";

import NextImage from "next/image";
import { NpcListProps } from "../_model/Npc";

function NpcList({ npcs }: NpcListProps) {
  return (
    // zIndex를 높게 (예: 9)
    <div style={{ position: "absolute", top: 0, left: 0, zIndex: 9 }}>
      {npcs.map((npc, idx) => (
        <div
          key={`npc-${idx}`}
          style={{
            position: "absolute",
            left: npc.x,
            top: npc.y,
            width: npc.width,
            height: npc.height,
            textAlign: "center",
          }}
        >
          <NextImage
            src={npc.image}
            alt={`NPC-${idx}`}
            width={npc.width}
            height={npc.height}
            priority
          />
          <div
            style={{
              color: "yellow",
              fontWeight: "bold",
              fontSize: 14,
              textAlign: "center",
            }}
          >
            NPC {idx + 1}
          </div>
        </div>
      ))}
    </div>
  );
}

export default NpcList;
