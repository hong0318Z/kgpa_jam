import { DEFAULT_WELCOME_SUBJECT, DEFAULT_WELCOME_BODY_HTML } from "@/lib/email-templates/welcome";
import {
  DEFAULT_REVIEWER_ASSIGNED_SUBJECT,
  DEFAULT_REVIEWER_ASSIGNED_BODY_HTML,
} from "@/lib/email-templates/reviewer-assigned";
import {
  DEFAULT_DECISION_ACCEPTED_SUBJECT,
  DEFAULT_DECISION_ACCEPTED_BODY_HTML,
  DEFAULT_DECISION_REVISION_REQUESTED_SUBJECT,
  DEFAULT_DECISION_REVISION_REQUESTED_BODY_HTML,
  DEFAULT_DECISION_REJECTED_SUBJECT,
  DEFAULT_DECISION_REJECTED_BODY_HTML,
} from "@/lib/email-templates/decision";
import {
  DEFAULT_PASSWORD_RESET_CODE_SUBJECT,
  DEFAULT_PASSWORD_RESET_CODE_BODY_HTML,
} from "@/lib/email-templates/password-reset";

export const EMAIL_TEMPLATE_DEFAULTS: Record<string, { subject: string; bodyHtml: string; label: string }> = {
  welcome: {
    label: "가입환영 메일",
    subject: DEFAULT_WELCOME_SUBJECT,
    bodyHtml: DEFAULT_WELCOME_BODY_HTML,
  },
  reviewer_assigned: {
    label: "심사위원 배정 안내 메일",
    subject: DEFAULT_REVIEWER_ASSIGNED_SUBJECT,
    bodyHtml: DEFAULT_REVIEWER_ASSIGNED_BODY_HTML,
  },
  decision_accepted: {
    label: "심사결과 안내 메일 (게재승인)",
    subject: DEFAULT_DECISION_ACCEPTED_SUBJECT,
    bodyHtml: DEFAULT_DECISION_ACCEPTED_BODY_HTML,
  },
  decision_revision_requested: {
    label: "심사결과 안내 메일 (수정요청)",
    subject: DEFAULT_DECISION_REVISION_REQUESTED_SUBJECT,
    bodyHtml: DEFAULT_DECISION_REVISION_REQUESTED_BODY_HTML,
  },
  decision_rejected: {
    label: "심사결과 안내 메일 (게재불가)",
    subject: DEFAULT_DECISION_REJECTED_SUBJECT,
    bodyHtml: DEFAULT_DECISION_REJECTED_BODY_HTML,
  },
  password_reset_code: {
    label: "비밀번호 재설정 인증번호 메일",
    subject: DEFAULT_PASSWORD_RESET_CODE_SUBJECT,
    bodyHtml: DEFAULT_PASSWORD_RESET_CODE_BODY_HTML,
  },
};
