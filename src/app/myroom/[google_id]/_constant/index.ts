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
import { User } from "@/model/User";

export const techStackList = [
  "Java",
  "React",
  "TypeScript",
  "Python",
  "Spring",
  "JavaScript",
  "Next.js",
  "JIRA",
  "Confluence",
  "Git",
  "Flutter",
  "ReactNative",
  "C++",
  "Swift",
  "iOS",
  "MySQL",
  "Postgresql",
  "Kubernetes",
  "Docker",
  "Kotlin",
  "Jest",
  "FastAPI",
  "Nest.js",
  "Django",
  "PHP",
  "Ruby",
  "TailwindCSS",
  "Vue.js",
  "Go",
  "MongoDB",
  "Cypress",
];

export const MAP_CONSTANTS = {
  SPEED: 30, // 이동 속도
};

export const CHAR_SCALE = 3;

export const defaultResume: Funiture[] = [
  {
    id: "resume-1",
    x: 500,
    y: 300,
    width: 100,
    height: 100,
    funitureType: "none",
    funiturename: "이력서(PDF)",
  },
];

export const defaultPortfolio: Funiture[] = [
  {
    id: "portfolio-1",
    x: 1450,
    y: 100,
    width: 100,
    height: 100,
    funitureType: "none",
    funiturename: "포트폴리오 링크1",
  },
  {
    id: "portfolio-2",
    x: 1550,
    y: 420,
    width: 100,
    height: 100,
    funitureType: "none",
    funiturename: "포트폴리오 링크2",
  },
  {
    id: "portfolio-3",
    x: 1800,
    y: 90,
    width: 100,
    height: 100,
    funitureType: "none",
    funiturename: "포트폴리오 링크3",
  },
];

export const defaultTechnologyStack: Funiture[] = [
  {
    id: "technologyStack-1",
    x: 780,
    y: 250,
    width: 70,
    height: 70,
    funitureType: "none",
    funiturename: "기술스택1",
  },
  {
    id: "technologyStack-2",
    x: 930,
    y: 250,
    width: 70,
    height: 70,
    funitureType: "none",
    funiturename: "기술스택2",
  },
  {
    id: "technologyStack-3",
    x: 1080,
    y: 250,
    width: 70,
    height: 70,
    funitureType: "none",
    funiturename: "기술스택3",
  },
  {
    id: "technologyStack-4",
    x: 1230,
    y: 250,
    width: 70,
    height: 70,
    funitureType: "none",
    funiturename: "기술스택4",
  },
  {
    id: "technologyStack-5",
    x: 780,
    y: 370,
    width: 70,
    height: 70,
    funitureType: "none",
    funiturename: "기술스택5",
  },
  {
    id: "technologyStack-6",
    x: 930,
    y: 370,
    width: 70,
    height: 70,
    funitureType: "none",
    funiturename: "기술스택6",
  },
  {
    id: "technologyStack-7",
    x: 1080,
    y: 370,
    width: 70,
    height: 70,
    funitureType: "none",
    funiturename: "기술스택7",
  },
  {
    id: "technologyStack-8",
    x: 1230,
    y: 370,
    width: 70,
    height: 70,
    funitureType: "none",
    funiturename: "기술스택8",
  },
];

export const defaultBoard: Funiture[] = [
  {
    id: "board1",
    x: 190,
    y: 60,
    width: 300,
    height: 100,
    funitureType: "board",
    funiturename: "방명록",
  },
];

export const MYROOM_COLLISION_ZONES: CollisionZone[] = [
  // 상단 벽
  { x: 0, y: 0, width: 2000, height: 580 },
];
export const interiorImages: Record<string, string> = {
  none: "/interior/none.gif",
  "resume/resume1": "/interior/resume/resume1.gif",
  "portfolio/portfolio1": "/interior/portfolio/portfolio1.gif",
  "portfolio/portfolio2": "/interior/portfolio/portfolio2.gif",
  "portfolio/portfolio3": "/interior/portfolio/portfolio3.gif",
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
