export const SUBMISSION_STATUS_LABELS: Record<string, string> = {
  SUBMITTED: "심사위원 배정전",
  UNDER_REVIEW: "심사중",
  REVISION_REQUESTED: "수정요청",
  ACCEPTED: "게재승인",
  REJECTED: "반려",
  WITHDRAWN: "철회",
};

export const REVIEW_STATUS_LABELS: Record<string, string> = {
  ASSIGNED: "배정됨",
  IN_PROGRESS: "심사중",
  SUBMITTED: "제출완료",
  DECLINED: "거절함",
};

export const RECOMMENDATION_LABELS: Record<string, string> = {
  ACCEPT: "게재 가능",
  MINOR_REVISION: "소폭수정",
  MAJOR_REVISION: "대폭수정",
  REJECT: "게재불가",
};

export const ROLE_LABELS: Record<string, string> = {
  AUTHOR: "저자",
  REVIEWER: "심사위원",
  EDITOR: "편집위원",
  CHIEF_EDITOR: "편집위원장",
  ADMIN: "관리자",
};

export const SUBMISSION_FIELDS: { value: string; label: string; description: string }[] = [
  {
    value: "GAME_STUDIES_DESIGN",
    label: "Game Studies & Design",
    description: "게임 메커닉스, 밸런싱, 레벨 디자인, 게임 AI, 게임 서사 및 스토리텔링, 인터랙티브 내러티브, 캐릭터 디자인 등",
  },
  {
    value: "INTERACTIVE_TECHNOLOGY",
    label: "Interactive Technology",
    description: "XR 기술(VR/AR/MR), 메타버스, 인공지능 응용, 게임 엔진(Unreal, Unity), 실시간 렌더링, 네트워크 아키텍처 등",
  },
  {
    value: "INTERACTIVE_MEDIA_CULTURE",
    label: "Interactive Media & Culture",
    description: "게임 문화 및 커뮤니티, e스포츠, 인터랙티브/미디어 아트, 디지털 문화콘텐츠, 게임 리터러시 및 교육 등",
  },
  {
    value: "CONTENT_BUSINESS_MANAGEMENT",
    label: "Content Business & Management",
    description: "게임 산업 및 비즈니스 모델, 마케팅, 데이터 분석, 프로젝트 매니지먼트, 퍼블리싱 및 글로벌 전략 등",
  },
  {
    value: "POLICY_ETHICS",
    label: "Policy & Ethics",
    description: "게임 정책 및 규제, 등급분류, 게임 윤리 및 사회적 책임, 지적재산권, 게임 저작권 및 법령",
  },
];

export const SUBMISSION_FIELD_LABELS: Record<string, string> = Object.fromEntries(
  SUBMISSION_FIELDS.map((f) => [f.value, f.label]),
);
