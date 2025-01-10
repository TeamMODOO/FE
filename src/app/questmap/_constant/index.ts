import { NpcInfo } from "@/model/Npc";
import { PortalInfo } from "@/model/Portal";

export const QUEST_MAP_SPEED = 20;
export const CHAR_SCALE = 2; // 2배
export const MAP_DEFAULT_WIDTH = 1400;
export const MAP_DEFAULT_HEIGHT = 700;

/** 초기 NPC 데이터 */
export const initialNpcs: NpcInfo[] = [
  {
    x: 580,
    y: 250,
    width: 200,
    height: 200,
    name: "퀘스트NPC1",
    image: "/character/npc4.webp",
    modalTitle: "퀘스트 NPC #1",
  },
  {
    x: 200,
    y: 300,
    width: 60,
    height: 90,
    name: "퀘스트NPC2",
    image: "/character/character2.png",
    modalTitle: "퀘스트 NPC #2",
  },
];

/** 초기 포탈 데이터 */
export const initialPortals: PortalInfo[] = [
  {
    x: 620,
    y: 50,
    width: 120,
    height: 120,
    name: "포탈1",
    image: "/furniture/portal.png",
    route: "/lobby",
  },
];
