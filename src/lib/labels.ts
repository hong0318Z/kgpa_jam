export const SUBMISSION_STATUS_LABELS: Record<string, string> = {
  SUBMITTED: "투고완료",
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
  ACCEPT: "게재가",
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
