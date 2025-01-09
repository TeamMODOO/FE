import { Funiture } from "@/model/Funiture";
import { User } from "@/model/User";

export const techStackList = [
  "Figma",
  "React",
  "TypeScript",
  "Python",
  "Slack",
  "JavaScript",
  "Next.js",
  "서비스 기획",
  "JIRA",
  "Confluence",
  "Git",
  "Flutter",
  "GitHub",
  "React Native",
  "Excel",
  "ppt",
  "HTML/CSS",
  "Redux",
  "인공지능(AI)",
  "Photoshop",
  "C++",
  "Swift",
  "SwiftUI",
  "iOS",
];

export const MAP_CONSTANTS = {
  SPEED: 30, // 이동 속도
};

export const CHAR_SCALE = 3;

export const defaultResume: Funiture[] = [
  {
    id: "resume-1",
    x: 100,
    y: 100,
    width: 100,
    height: 100,
    funitureType: "none",
    funiturename: "이력서(PDF)",
  },
];

export const defaultPortfolio: Funiture[] = [
  {
    id: "portfolio-1",
    x: 600,
    y: 100,
    width: 100,
    height: 100,
    funitureType: "none",
    funiturename: "포트폴리오 링크1",
  },
  {
    id: "portfolio-2",
    x: 780,
    y: 180,
    width: 100,
    height: 100,
    funitureType: "none",
    funiturename: "포트폴리오 링크2",
  },
  {
    id: "portfolio-3",
    x: 900,
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
    x: 230,
    y: 470,
    width: 100,
    height: 100,
    funitureType: "none",
    funiturename: "기술스택1",
  },
  {
    id: "technologyStack-2",
    x: 370,
    y: 550,
    width: 100,
    height: 100,
    funitureType: "none",
    funiturename: "기술스택2",
  },
  {
    id: "technologyStack-3",
    x: 600,
    y: 300,
    width: 100,
    height: 100,
    funitureType: "none",
    funiturename: "기술스택3",
  },
  {
    id: "technologyStack-4",
    x: 650,
    y: 550,
    width: 100,
    height: 100,
    funitureType: "none",
    funiturename: "기술스택4",
  },
  {
    id: "technologyStack-5",
    x: 1150,
    y: 600,
    width: 100,
    height: 100,
    funitureType: "none",
    funiturename: "기술스택5",
  },
  {
    id: "technologyStack-6",
    x: 1000,
    y: 450,
    width: 100,
    height: 100,
    funitureType: "none",
    funiturename: "기술스택6",
  },
  {
    id: "technologyStack-7",
    x: 1160,
    y: 400,
    width: 100,
    height: 100,
    funitureType: "none",
    funiturename: "기술스택7",
  },
  {
    id: "technologyStack-8",
    x: 1250,
    y: 200,
    width: 100,
    height: 100,
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
  portal: "/furniture/portal.gif",
};
