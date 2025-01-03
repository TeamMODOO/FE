// components/QuestMapCanvas/hooks/useQuestMapNpcPortal.ts
"use client";

import { Dispatch, SetStateAction, useEffect } from "react";

import { NpcInfo } from "@/model/Npc";
import { PortalInfo } from "@/model/Portal";

interface UseQuestMapNpcPortalProps {
  canvasSize: { w: number; h: number };
  questNpcs: NpcInfo[];
  setQuestNpcs: Dispatch<SetStateAction<NpcInfo[]>>;
  portals: PortalInfo[];
  setPortals: Dispatch<SetStateAction<PortalInfo[]>>;
}

export function useQuestMapNpcPortal({
  canvasSize,
  questNpcs,
  setQuestNpcs,
  portals,
  setPortals,
}: UseQuestMapNpcPortalProps) {
  useEffect(() => {
    // (A) NPC 위치 조정
    setQuestNpcs((prev) => {
      const newNpcs = [...prev];
      // NPC1
      if (newNpcs[0]) {
        newNpcs[0].x = (canvasSize.w - newNpcs[0].width) / 2;
        newNpcs[0].y = (canvasSize.h - newNpcs[0].height) / 2;
      }
      // NPC2
      if (newNpcs[1]) {
        newNpcs[1].x = (canvasSize.w - newNpcs[1].width) / 4;
        newNpcs[1].y = (canvasSize.h - newNpcs[1].height) / 2;
      }
      return newNpcs;
    });

    // (B) 포탈 위치 조정
    setPortals((prev) => {
      const newPortals = [...prev];
      if (newPortals[0]) {
        newPortals[0].x = (canvasSize.w - newPortals[0].width) / 2;
        newPortals[0].y = 50;
      }
      return newPortals;
    });
  }, [canvasSize, setQuestNpcs, setPortals]);
}
