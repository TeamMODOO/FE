import { CollisionZone } from "@/model/CollisionZone";
import { NpcInfo } from "@/model/Npc";
import { PortalInfo } from "@/model/Portal";
import { QA } from "@/model/Qna";

export const LOBBY_MAP_CONSTANTS = {
  CANVAS_WIDTH: 1400,
  CANVAS_HEIGHT: 800,
  MAP_WIDTH: 1200,
  MAP_HEIGHT: 700,

  IMG_WIDTH: 32,
  IMG_HEIGHT: 32,
  SPEED: 10,
};

export const LOBBY_PORTALS: PortalInfo[] = [
  {
    x: 950,
    y: 70,
    width: 100,
    height: 100,
    route: "/myroom",
    name: "마이룸",
    image: "/furniture/portal.gif",
  },
  {
    x: 830,
    y: 420,
    width: 100,
    height: 100,
    route: "/meetingroom",
    name: "회의실",
    image: "/furniture/portal.gif",
  },
];

export const LOBBY_NPCS: NpcInfo[] = [
  {
    x: 420,
    y: 150,
    width: 20,
    height: 35,
    image: "/character/npc1.png",
    modalTitle: "NPC1 대화",
    name: "NPC1",
  },
  {
    x: 750,
    y: 150,
    width: 20,
    height: 35,
    image: "/character/npc2.png",
    modalTitle: "NPC2 대화",
    name: "NPC2",
  },
  {
    x: 560,
    y: 0,
    width: 100,
    height: 50,
    image: "/furniture/board.png",
    modalTitle: "게시판 NPC",
    name: "게시판",
  },
];

export const LOBBY_COLLISION_ZONES: CollisionZone[] = [
  // 맵 테두리
  {
    x: 0,
    y: 0,
    width: 1200,
    height: 20,
  },
  {
    x: 0,
    y: 0,
    width: 15,
    height: 700,
  },
  {
    x: 1185,
    y: 0,
    width: 15,
    height: 700,
  },
  {
    x: 0,
    y: 685,
    width: 500,
    height: 15,
  },

  {
    x: 500,
    y: 695,
    width: 200,
    height: 5,
  },

  {
    x: 700,
    y: 685,
    width: 500,
    height: 15,
  },

  // 오락실
  {
    x: 0,
    y: 208,
    width: 320,
    height: 15,
  },
  {
    x: 315,
    y: 0,
    width: 5,
    height: 80,
  },
  {
    x: 315,
    y: 172,
    width: 5,
    height: 40,
  },

  // 마이룸
  {
    x: 885,
    y: 208,
    width: 315,
    height: 15,
  },
  {
    x: 885,
    y: 0,
    width: 5,
    height: 80,
  },
  {
    x: 885,
    y: 172,
    width: 5,
    height: 40,
  },

  // 퀘스트 - 위쪽
  {
    x: 190,
    y: 370,
    width: 250,
    height: 15,
  },
  {
    x: 185,
    y: 370,
    width: 10,
    height: 50,
  },
  {
    x: 430,
    y: 370,
    width: 10,
    height: 50,
  },
  // 퀘스트 - 아래쪽
  {
    x: 190,
    y: 570,
    width: 250,
    height: 15,
  },
  {
    x: 185,
    y: 530,
    width: 10,
    height: 50,
  },
  {
    x: 430,
    y: 530,
    width: 10,
    height: 50,
  },

  // 미팅룸 - 위쪽
  {
    x: 765,
    y: 370,
    width: 250,
    height: 15,
  },
  {
    x: 1005,
    y: 370,
    width: 10,
    height: 50,
  },
  {
    x: 765,
    y: 370,
    width: 10,
    height: 50,
  },

  // 미팅룸 - 아래쪽
  {
    x: 765,
    y: 545,
    width: 250,
    height: 15,
  },
  {
    x: 1005,
    y: 505,
    width: 10,
    height: 50,
  },
  {
    x: 765,
    y: 505,
    width: 10,
    height: 50,
  },
];

export const QNA_LIST: QA[] = [
  {
    category: "커리큘럼",
    question: "정글 수료 후, 어떤 개발자가 되는가?",
    answer:
      "정글 설계할 때, 유사한 듯한 2가지 목표. 1) 네카라에 갈 수 있는 개발자. 2) 단기적으로는 취업, 중장기적으로는 억대 연봉 개발자.\n\n" +
      "중장기적으로 억대 연봉 개발자가 되려면, 꾸준히 성장할 수 있어야 함. 결국 전산의 아주 기초적인 것을 할 줄 알아야 하고, OS라는 전산학의 꽃을 다뤄 봐야 함. OS 관련된 모든 것을 이해하면 컴퓨터 관련 많은 문제들을 이해하는 바탕이 됨. 전산학은 기계(하드웨어)도 결국 OS가 돌리는 것이라고 생각.",
  },
  {
    category: "커리큘럼",
    question: "알고리즘 과정이 코딩 테스트를 준비하기에는 범위가 좁은 것 같다.",
    answer:
      "일단, '컴퓨팅 사고로의 전환'이라는 제목 그대로 컴퓨터가 어떻게 움직이는지를 체득하는 과정이지, 코딩 테스트만을 준비하는 과정은 아님. 그리고, 알고리즘 문제 풀기는 4주만 하는 것이 아님. 그 후에도 습관적으로 계속 풀어보는 것이 좋음. 첫 4주는 시동을 걸기 위한 작업일 뿐.\n\n" +
      "첫 4주에 여러분들이 익혀 주셔야 하는 것은 현실의 문제를 컴퓨터에게 효율적으로 빠르게 떠넘기는 능력임. 컴퓨터에게 일을 시키기 위해서 자료구조와 알고리즘의 공부는 필수임.",
  },
  {
    category: "커리큘럼",
    question: "탐험 준비 단계에서 왜 C/C++언어로 구현하는가?",
    answer:
      "C언어가 인간이 이해하면서도 성능 타협을 별로 안 한 언어. 최근에는 C언어보다 더 낮은 수준의 언어를 이용하는 경우는 드묾. 게임도 성능이 중요한 곳은 대부분 C++. 기계(성능)와 대화를 해야하기 때문. 딥러닝도 앞은 파이썬 뒤는 C++. 인간친화 < 기계친화.",
  },
  {
    category: "커리큘럼",
    question: "OS 과정에만 조교가 있는 게 사실인가?",
    answer:
      "맞다. 이외에는 없다. 대부분 팀스터디, 팀프로젝트 하면 될텐데, OS는 조금 힘들 수도 있을 것 같다고 생각은 함. 그래서 조교가 있을 예정.\n\n" +
      "정글을 기획할 때, 에꼴42 영향을 많이 받았는데 에꼴42 경우에는 개인의 의지에 너무 많이 의존. 에꼴 42처럼 교수 및 조교 없다는 건 같지만, 우리는 (합숙을 통한 몰입과 함께) 동료와 협업 하는 게 훨씬 중요. 주변 사람들에게 자극을 받는 peer pressure 또한 중요. 결국 큰 세상에서 보면 30명은 모두 친구. 동료가 있을 때, 혼자보다 더 몰입하고 진도 나가는데 도움 됨.",
  },
  {
    category: "커리큘럼",
    question: "정말 교수 수업이 없는가?",
    answer:
      "정글의 핵심은 기본 동작 원리 + 구글링 키워드만 던져주기. 팀스터디 하면 됨. 사회생활 할 때도 새로운 문제를 계속 풀어야 함. 15년 전 개발자, 스마트폰이 나올 거라 상상도 못함. 이게 고연봉자가 되는 길. 이 과정이 너무 안 맞으면 중간에라도 말해달라. 본인의 습관에 안 맞을 수도 있음. 방법을 함께 찾아나갈 것.",
  },
  {
    category: "커리큘럼",
    question: "매 커리큘럼마다 결과 평가 요소",
    answer:
      "평가 보다는 피드백이 적절. 구성원이 어떤지를 알아야 운영진도 맞출 수 있다. 피어 피드백(peer feedback)이 진행될 예정. 공유되지 않고 운영진이 쌓아둘 것. 운영진이 개개인을 evaluation 하진 않을 것. 비학위과정이 학점이 나오는 게 아니라 Pass or Fail일 뿐. 모두 다 좋은 곳에 취업하는 것이 중요.",
  },
  {
    category: "커리큘럼",
    question: "책부터 읽어야할지 어떻게 검색을 해야할지 잘 모르겠다.",
    answer:
      "책 처음 읽었을 때, 원래 쉽게 안 읽힘. 실제로 필드에서 경험하니까 그때서야 이해됨. 지식을 체화한 사람은 이유가 있음. 읽는다고 체화하지 않음. 지식+체화가 같이 가야 함. 공부하는 습관을 들여서 매년 조금씩 성장. 일주일만에 개발해야하는데 책부터 읽는 사람은 아무래도 늦음.",
  },
  {
    category: "커리큘럼",
    question: "커리큘럼을 받았지만 막막하고 압박감이 든다.",
    answer:
      "전체를 다 알고 하는 것도 좋겠지만 지금은 주마다 나오는 가이드에 따라 전력을 다하는 것이 좋다. 그러면 시간이 지나면서 자연스럽게 틀이 그려질 것.",
  },
  {
    category: "커리큘럼",
    question: "네트워크&OS 책 추천",
    answer:
      '교재로 지정했던 "컴퓨터 시스템"에도 필요한 내용이 있으나 필요한 경우 아래 책을 추천 Remzi H. Arpaci-Dusseau, Andrea C. Arpaci-Dusseau, "Operating Systems: Three Easy Pieces", 무료 Textbook (영문), 한글 번역판.',
  },
  {
    category: "개발자 커리어",
    question: "전산학 전공하지 않은 개발자 중 특이한 이력을 가진 사람",
    answer:
      "공통점은 시간 투자를 많이 함. 시간을 많이 쓰려면 본인의 삶이 되어야 함. 단순히 커리어 정도가 아님.\n\n" +
      "첫눈 함께 했던 제로보드를 만든 고영수. 전산 전문가 아님. 고등학교부터 웹 프로그래밍만 쭉. 한국어 타이핑 보다 프로그래밍 타이핑이 빠를 정도.\n\n" +
      "배달의민족 2014년, 마케팅 쿠폰을 써도 서버가 죽음. 인문계 비전공자 개발자가 많았음. 개발팀 전반의 문화는 '우리 잘 못하니까 공부해야돼'. 사무실이 항상 따뜻했음. 밤새서 공부. 지금은 어딜가도 top 개발자.\n\n" +
      "45세 삼성 개발자 코딩테스트가 취미. 하다보니 순위가 매우 높아짐. 구글 호주에서 스카우트. 10대 때 공부 억지로 많이해서 질림. 이제는 하고 싶은 공부를 하면 너무 재밌음.",
  },
];
