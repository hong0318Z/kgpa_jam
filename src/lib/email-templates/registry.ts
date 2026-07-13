import { DEFAULT_WELCOME_SUBJECT, DEFAULT_WELCOME_BODY_HTML } from "@/lib/email-templates/welcome";

export const EMAIL_TEMPLATE_DEFAULTS: Record<string, { subject: string; bodyHtml: string; label: string }> = {
  welcome: {
    label: "가입환영 메일",
    subject: DEFAULT_WELCOME_SUBJECT,
    bodyHtml: DEFAULT_WELCOME_BODY_HTML,
  },
};
