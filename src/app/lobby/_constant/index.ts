import { CollisionZone } from "@/model/CollisionZone";
import { NpcInfo } from "@/model/Npc";
import { PortalInfo } from "@/model/Portal";
import { QA } from "@/model/Qna";
import { TU } from "@/model/Tutorial";

export const LOBBY_MAP_CONSTANTS = {
  CANVAS_WIDTH: 1400,
  CANVAS_HEIGHT: 800,
  MAP_WIDTH: 1200,
  MAP_HEIGHT: 700,

  IMG_WIDTH: 60,
  IMG_HEIGHT: 120,
  SPEED: 2,

  CHARACTER_SCALE: 0.4,
};

export const LOBBY_PORTALS: PortalInfo[] = [
  {
    x: 950,
    y: 90,
    width: 100,
    height: 80,
    route: "/myroom",
    name: "마이룸",
    image: "/furniture/portal.png",
  },
  {
    x: 840,
    y: 440,
    width: 100,
    height: 80,
    route: "/meetingroom",
    name: "회의실",
    image: "/furniture/portal.png",
  },
];

export const LOBBY_NPCS: NpcInfo[] = [
  {
    x: 300,
    y: 450,
    width: 20,
    height: 35,
    image: "/character/npc1.png",
    modalTitle: "정글 김코치",
    name: "정글 김코치\r\n[일일 코테 미션]",
  },
  {
    x: 750,
    y: 150,
    width: 20,
    height: 35,
    image: "/character/npc2.png",
    modalTitle: "정글 백코치",
    name: "정글 백코치\r\n[정글 QnA]",
  },
  {
    x: 560,
    y: 0,
    width: 80,
    height: 40,
    image: "/furniture/board.png",
    modalTitle: "게시판 NPC",
    name: "자유 게시판",
  },
  {
    x: 420,
    y: 170,
    width: 40,
    height: 40,
    image: "/character/npc3.png",
    modalTitle: "정글 김원장",
    name: "정글 김원장\r\n[튜토리얼]",
  },
  {
    x: 135,
    y: 350,
    width: 120,
    height: 120,
    image: "/character/npc6.png",
    modalTitle: "---",
    name: "오늘의 랭킹",
  },
  {
    x: 90,
    y: 50,
    width: 150,
    height: 100,
    image: "/character/npc5.png",
    modalTitle: "---",
    name: "미니 게임기",
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
    question: "정글 수료 후, 어떤 개발자가 되나요?",
    answers: [
      "중장기적으로 고연봉 개발자가 되려면, 꾸준히 성장할 수 있어야 합니다. 결국 전산의 아주 기초적인 것을 할 줄 알아야 하고, OS라는 전산학의 꽃을 다뤄 봐야 하죠.",
      "OS와 관련된 요소들을 이해하면, 컴퓨터와 관련된 많은 문제들을 이해하는 밑바탕이 될 것입니다.",
    ],
  },
  {
    category: "커리큘럼",
    question:
      "알고리즘 과정이 코딩 테스트를 준비하기에는 범위가 좁은 것 같아요.",
    answers: [
      "우선, '컴퓨팅 사고로의 전환'이라는 제목 그대로 컴퓨터가 어떻게 움직이는지를 체득하는 과정이지, 코딩 테스트만을 준비하는 과정은 아닙니다.",
      "첫 알고리즘 문제 풀이 4주 과정을 거치며 시동을 걸어보시라는 의미이며, 그 후에도 습관적으로 계속 풀어보는 것이 좋습니다.",
      "첫 4주에 여러분들이 익혀 주셔야 하는 것은 현실의 문제를 컴퓨터에게 효율적으로 빠르게 떠넘기는 능력입니다. 컴퓨터에게 일을 시키기 위해서 자료구조와 알고리즘의 공부는 필수이죠.",
    ],
  },
  {
    category: "커리큘럼",
    question: "탐험 준비 단계 과정에서 왜 C언어를 공부하나요?",
    answers: [
      "C언어는 인간이 이해할 수 있으면서도 성능 부분에서 타협을 거의 하지 않은 언어입니다.",
      "최근에는 C언어보다 더 낮은 수준의 언어를 이용하는 경우는 드물죠. 게임도 성능이 중요한 곳은 대부분 C++을 사용합니다.",
      "요즘 화두가 되고 있는 딥러닝도 파이썬이 선행된 뒤에는 C++이 이용됩니다.",
      "고수준으로 갈수록, 인간과 친화적인 언어보다 기계와 친화적인 언어를 통해 성능을 고려하게 됩니다.",
    ],
  },
  {
    category: "커리큘럼",
    question: "정말 교수 수업이 없나요?",
    answers: [
      "정글의 핵심은 학습하는 능력 자체의 향상에 있습니다. 기본 동작 원리와 구글링 키워드만 제공한 뒤, 여러분께서 동료들과 함께 문제를 해결하는 과정에서 이러한 능력이 향상되는 경험을 하실 것입니다.",
      "앞으로 개발자 생활을 하시게 된다면 밖에서도 새로운 문제를 계속 풀어야 할 겁니다. 정글 안에서 이러한 근본적인 능력의 함양을 기대합니다. ",
    ],
  },
  {
    category: "커리큘럼",
    question:
      "책부터 읽으며 공부해야할지, 어떻게 검색을 해야할지 잘 모르겠습니다.",
    answers: [
      "책을 처음 펴면 당연히 쉽게 읽히지 않으실 겁니다. 실제로 필드에서 경험해야, 그 때서 이해되는 경우도 많죠.",
      "지식을 체화한 사람은 이유가 있습니다. 읽는다고 바로 체화되지는 않습니다.",
      "학습과 경험을 통한 체화가 함께 진행되어야 합니다. 본인만의 공부하는 습관을 들여서 조금씩 성장하십시오.",
    ],
  },
];
export const TUTORIAL_LIST: TU[] = [
  {
    category: "기본 조작법",
    question: "기본적인 조작법을 알려주세요.",
    answers: [
      "방향키 또는 W/A/S/D 키로 캐릭터를 이동할 수 있습니다.",
      "NPC, 또는 포탈 근처에서 Space 키로 상호작용 할 수 있어요.",
      "ESC 키로 대화창이나 메뉴를 닫을 수도 있지요.",
      "화면 우측 상단의 토글 버튼들을 통해 친구목록을 확인할 수도, 채팅을 할 수도, 또 배경음악을 켜고 끌 수도 있어요.",
    ],
  },
  {
    category: "메인페이지",
    question: "정글타워에서는 무엇을 할 수 있나요?",
    answers: [
      "정글 타워에서는 여러분의 정글 생활의 편의를 위해 여러가지 기능들을 제공합니다.",
      "메인 페이지의 위쪽으로 올라가보면, 자유롭게 글을 남길 수 있는 게시판이 있어요.",
      "곳곳에 있는 NPC들과 대화를 나누거나, 포탈을 타고 정글타워 이곳저곳을 돌아다닐 수도 있죠.",
      "각 코치님들은 여러분의 알고리즘 문제 풀이나 정글 생활에 대한 질문에 답변해주기도 합니다.",
      "마이룸에서는 여러분의 이력서와 포트폴리오를 올려 여러분을 표현할 수도 있지요.",
      "친구 목록을 통해 다른 사람의 마이룸에 들어가면서, 여러 정글러들의 개발자로서의 삶을 엿볼 수도 있어요.",
      "여러분의 휴식을 위해 간단한 미니게임장도 준비했으니, 한번 들려보세요.",
    ],
  },
];
