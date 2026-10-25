/* ==========================================================
   🌱 앱 목록 — 이 파일만 고치면 대문 페이지가 바뀝니다.
   ----------------------------------------------------------
   name    : 앱 이름
   emoji   : 카드에 보일 이모지 하나
   desc    : 한 줄 소개 (학생 눈높이로 짧게)
   url     : 앱 주소 (클릭하면 새 탭으로 열림)
   heart   : 연결되는 마음 역량 (아래 HEARTS의 key, 여러 개 가능)
   grade   : 대상 학년 (예: "5-6학년")
   scene   : 언제 쓰는지 (수업 장면)
   maker   : 만든 선생님 (선택)
   ========================================================== */

const HEARTS = {
  self:     { label: "나를 알아요",   full: "자기인식",           emoji: "🌱", color: "#F4A261" },
  manage:   { label: "나를 다독여요", full: "자기관리",           emoji: "🌿", color: "#E9C46A" },
  social:   { label: "너를 느껴요",   full: "사회적 인식",        emoji: "🌼", color: "#E76F51" },
  relation: { label: "함께 지내요",   full: "관계 기술",          emoji: "🌷", color: "#D88C9A" },
  decide:   { label: "바르게 골라요", full: "책임 있는 의사결정", emoji: "🌳", color: "#8AB17D" },
};

/* 아래는 예시입니다. 실제 앱으로 바꿔 주세요. */
const APPS = [
  {
    name: "오늘의 마음 날씨",
    emoji: "☀️",
    desc: "아침마다 내 마음을 날씨로 표현하고, AI가 다정한 한마디를 건네요.",
    url: "https://example.com/weather",
    heart: ["self"],
    grade: "3-6학년",
    scene: "아침 활동",
    maker: "",
  },
  {
    name: "감정 단어 사전",
    emoji: "📖",
    desc: "'짜증나' 말고 더 정확한 감정 단어를 AI와 함께 찾아봐요.",
    url: "https://example.com/emotion-words",
    heart: ["self", "manage"],
    grade: "4-6학년",
    scene: "국어·창체",
    maker: "",
  },
  {
    name: "숨 고르기 타이머",
    emoji: "🫧",
    desc: "화가 날 때 풍선을 따라 천천히 숨 쉬며 마음을 가라앉혀요.",
    url: "https://example.com/breathe",
    heart: ["manage"],
    grade: "1-6학년",
    scene: "쉬는 시간·갈등 직후",
    maker: "",
  },
  {
    name: "친구 마음 읽기",
    emoji: "🔍",
    desc: "상황 카드를 보고 친구의 마음을 추측한 뒤 AI와 이야기 나눠요.",
    url: "https://example.com/perspective",
    heart: ["social"],
    grade: "5-6학년",
    scene: "도덕",
    maker: "",
  },
  {
    name: "고운 말 바꾸기",
    emoji: "💬",
    desc: "하고 싶은 말을 입력하면 상대를 배려하는 말로 바꾸는 연습을 해요.",
    url: "https://example.com/kind-words",
    heart: ["relation"],
    grade: "3-6학년",
    scene: "학급 회의·갈등 해결",
    maker: "",
  },
  {
    name: "고민 상담 우체통",
    emoji: "📮",
    desc: "고민을 적으면 여러 선택지와 그 결과를 함께 생각해 볼 수 있어요.",
    url: "https://example.com/dilemma",
    heart: ["decide", "social"],
    grade: "5-6학년",
    scene: "창체·상담",
    maker: "",
  },
];
