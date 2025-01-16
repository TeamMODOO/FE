"use client";

import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { IconType } from "react-icons";
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

/** (B) 아이콘 → data:image/svg+xml;base64 변환 함수 */
function generateIconDataUrl(Icon: IconType, size = 40, color = "#000") {
  // 1) React Element 생성
  const svgElement = createElement(Icon, { size, color });

  // 2) svg 문자열 변환
  const svgString = renderToStaticMarkup(svgElement);

  // 3) base64 인코딩
  const base64 = btoa(svgString);

  // 4) data URL
  return `data:image/svg+xml;base64,${base64}`;
}

/** (C) techStackList를 순회하며, stackName → dataURL 매핑 생성 */
export const techStackDataUrls: Record<string, string> = {};
techStackList.forEach((item) => {
  const { name, icon } = item;
  techStackDataUrls[name] = generateIconDataUrl(icon, 40, "white");
});

export const MAP_CONSTANTS = {
  SPEED: 50, // 이동 속도
};

export const CHARACTER_SCALE = 2;

export const defaultResume: Funiture[] = [
  {
    id: "resume-1",
    x: 820,
    y: 50,
    width: 200,
    height: 200,
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
    x: 1400,
    y: 20,
    width: 500,
    height: 300,
    funitureType: "board",
    funiturename: "방명록",
  },
];

export const MYROOM_COLLISION_ZONES: CollisionZone[] = [
  // 상단 벽
  { x: 0, y: 0, width: 2000, height: 450 },

  { x: 640, y: 450, width: 240, height: 50 },
  { x: 1120, y: 450, width: 280, height: 50 },
];

export const interiorImages: Record<string, string> = {
  none: "/interior/none.webp",
  "resume/resume1": "/interior/resume/resume.png",
  "portfolio/portfolio1": "/interior/portfolio/portfolio1.png",
  "portfolio/portfolio2": "/interior/portfolio/portfolio2.png",
  "portfolio/portfolio3": "/interior/portfolio/portfolio3.png",
  "technologyStack/technologyStack1": "/interior/none.webp",
  "technologyStack/technologyStack2": "/interior/none.webp",
  "technologyStack/technologyStack3": "/interior/none.webp",
  "technologyStack/technologyStack4": "/interior/none.webp",
  "technologyStack/technologyStack5": "/interior/none.webp",
  "technologyStack/technologyStack6": "/interior/none.webp",
  "technologyStack/technologyStack7": "/interior/none.webp",
  "technologyStack/technologyStack8": "/interior/none.webp",
  board: "/furniture/profile.png",
  portal: "/furniture/portal.png",
};
