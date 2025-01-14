import {
  FaConfluence,
  FaDocker,
  FaGitAlt,
  FaJava,
  FaJira,
  FaPhp,
  FaPython,
  FaReact,
  FaSwift,
  FaVuejs,
} from "react-icons/fa";
import { FaGolang } from "react-icons/fa6";
import { PiFileCpp } from "react-icons/pi";
import {
  SiCypress,
  SiDjango,
  SiFastapi,
  SiFlutter,
  SiIos,
  SiJavascript,
  SiJest,
  SiKotlin,
  SiKubernetes,
  SiMongodb,
  SiMysql,
  SiNestjs,
  SiNextdotjs,
  SiPostgresql,
  SiRuby,
  SiSpring,
  SiTailwindcss,
  SiTypescript,
} from "react-icons/si";

import { CollisionZone } from "@/model/CollisionZone";
import { Funiture } from "@/model/Funiture";
export const techStackList = [
  { name: "Java", icon: FaJava },
  { name: "React", icon: FaReact },
  { name: "TypeScript", icon: SiTypescript },
  { name: "Python", icon: FaPython },
  { name: "Spring", icon: SiSpring },
  { name: "JavaScript", icon: SiJavascript },
  { name: "Next.js", icon: SiNextdotjs },
  { name: "JIRA", icon: FaJira },
  { name: "Confluence", icon: FaConfluence },
  { name: "Git", icon: FaGitAlt },
  { name: "Flutter", icon: SiFlutter },
  { name: "ReactNative", icon: FaReact },
  { name: "C++", icon: PiFileCpp },
  { name: "Swift", icon: FaSwift },
  { name: "iOS", icon: SiIos },
  { name: "MySQL", icon: SiMysql },
  { name: "Postgresql", icon: SiPostgresql },
  { name: "Kubernetes", icon: SiKubernetes },
  { name: "Docker", icon: FaDocker },
  { name: "Kotlin", icon: SiKotlin },
  { name: "Jest", icon: SiJest },
  { name: "FastAPI", icon: SiFastapi },
  { name: "Nest.js", icon: SiNestjs },
  { name: "Django", icon: SiDjango },
  { name: "PHP", icon: FaPhp },
  { name: "Ruby", icon: SiRuby },
  { name: "TailwindCSS", icon: SiTailwindcss },
  { name: "Vue.js", icon: FaVuejs },
  { name: "Go", icon: FaGolang },
  { name: "MongoDB", icon: SiMongodb },
  { name: "Cypress", icon: SiCypress },
];

export const MAP_CONSTANTS = {
  SPEED: 30, // 이동 속도
};

export const CHARACTER_SCALE = 2;

export const defaultResume: Funiture[] = [
  {
    id: "resume-1",
    x: 820,
    y: 70,
    width: 470,
    height: 140,
    funitureType: "none",
    funiturename: "이력서(PDF)",
  },
];

export const defaultPortfolio: Funiture[] = [
  {
    id: "portfolio-1",
    x: 1170,
    y: 370,
    width: 200,
    height: 80,
    funitureType: "none",
    funiturename: "포트폴리오 링크1",
  },
  {
    id: "portfolio-2",
    x: 1160,
    y: 480,
    width: 220,
    height: 90,
    funitureType: "none",
    funiturename: "포트폴리오 링크2",
  },
  {
    id: "portfolio-3",
    x: 1130,
    y: 590,
    width: 280,
    height: 100,
    funitureType: "none",
    funiturename: "포트폴리오 링크3",
  },
];

export const defaultTechnologyStack: Funiture[] = [
  {
    id: "technologyStack-1",
    x: 180,
    y: 130,
    width: 70,
    height: 70,
    funitureType: "none",
    funiturename: "기술스택1",
  },
  {
    id: "technologyStack-2",
    x: 300,
    y: 130,
    width: 70,
    height: 70,
    funitureType: "none",
    funiturename: "기술스택2",
  },
  {
    id: "technologyStack-3",
    x: 420,
    y: 130,
    width: 70,
    height: 70,
    funitureType: "none",
    funiturename: "기술스택3",
  },
  {
    id: "technologyStack-4",
    x: 540,
    y: 130,
    width: 70,
    height: 70,
    funitureType: "none",
    funiturename: "기술스택4",
  },
  {
    id: "technologyStack-5",
    x: 180,
    y: 260,
    width: 70,
    height: 70,
    funitureType: "none",
    funiturename: "기술스택5",
  },
  {
    id: "technologyStack-6",
    x: 300,
    y: 260,
    width: 70,
    height: 70,
    funitureType: "none",
    funiturename: "기술스택6",
  },
  {
    id: "technologyStack-7",
    x: 420,
    y: 260,
    width: 70,
    height: 70,
    funitureType: "none",
    funiturename: "기술스택7",
  },
  {
    id: "technologyStack-8",
    x: 540,
    y: 260,
    width: 70,
    height: 70,
    funitureType: "none",
    funiturename: "기술스택8",
  },
];

export const defaultBoard: Funiture[] = [
  {
    id: "board1",
    x: 1500,
    y: 70,
    width: 300,
    height: 100,
    funitureType: "board",
    funiturename: "방명록",
  },
];

export const MYROOM_COLLISION_ZONES: CollisionZone[] = [
  // 상단 벽
  { x: 0, y: 0, width: 2000, height: 450 },
];

export const interiorImages: Record<string, string> = {
  none: "/interior/none.gif",
  "resume/resume1": "/interior/resume/resume1.png",
  "portfolio/portfolio1": "/interior/portfolio/portfolio1.png",
  "portfolio/portfolio2": "/interior/portfolio/portfolio2.png",
  "portfolio/portfolio3": "/interior/portfolio/portfolio3.png",
  "technologyStack/technologyStack1":
    "/interior/technologyStack/technologyStack1.gif",
  "technologyStack/technologyStack2":
    "/interior/technologyStack/technologyStack2.gif",
  "technologyStack/technologyStack3":
    "/interior/technologyStack/technologyStack3.gif",
  "technologyStack/technologyStack4":
    "/interior/technologyStack/technologyStack4.gif",
  "technologyStack/technologyStack5":
    "/interior/technologyStack/technologyStack5.gif",
  "technologyStack/technologyStack6":
    "/interior/technologyStack/technologyStack6.gif",
  "technologyStack/technologyStack7":
    "/interior/technologyStack/technologyStack7.gif",
  "technologyStack/technologyStack8":
    "/interior/technologyStack/technologyStack8.gif",
  board: "/furniture/board.png",
  portal: "/furniture/portal.png",
};
