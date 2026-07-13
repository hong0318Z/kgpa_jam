import { sendMail } from "@/lib/mail";
import { getEmailTemplate } from "@/lib/actions/email-templates";
import { wrapEmailShell } from "@/lib/email-templates/welcome";

function fillTemplate(str: string, vars: Record<string, string>) {
  return Object.entries(vars).reduce(
    (acc, [key, value]) => acc.replaceAll(`{{${key}}}`, value),
    str,
  );
}

async function sendTemplateMail(
  key: string,
  to: string,
  vars: Record<string, string>,
) {
  try {
    const template = await getEmailTemplate(key);
    await sendMail({
      to,
      subject: fillTemplate(template.subject, vars),
      html: wrapEmailShell(fillTemplate(template.bodyHtml, vars)),
    });
  } catch (e) {
    console.error(`[mail] ${key} send failed:`, e);
  }
}

export async function sendWelcomeEmailTo(user: { email: string; name: string }) {
  const loginUrl = `${process.env.NEXTAUTH_URL ?? ""}/login`;
  await sendTemplateMail("welcome", user.email, { name: user.name, loginUrl });
}

export async function sendReviewerAssignedEmail(params: {
  reviewer: { email: string; name: string };
  submissionTitle: string;
  caseNumber: number;
  dueDate: Date | null;
  assignmentId: string;
}) {
  const reviewUrl = `${process.env.NEXTAUTH_URL ?? ""}/reviews/${params.assignmentId}`;
  await sendTemplateMail("reviewer_assigned", params.reviewer.email, {
    name: params.reviewer.name,
    submissionTitle: params.submissionTitle,
    caseNumber: String(params.caseNumber).padStart(4, "0"),
    dueDate: params.dueDate ? params.dueDate.toLocaleDateString("ko-KR") : "미정",
    reviewUrl,
  });
}

const DECISION_TEMPLATE_KEY: Record<string, string> = {
  ACCEPTED: "decision_accepted",
  REVISION_REQUESTED: "decision_revision_requested",
  REJECTED: "decision_rejected",
};

export async function sendDecisionEmail(params: {
  author: { email: string; name: string };
  submissionId: string;
  submissionTitle: string;
  outcome: "ACCEPTED" | "REVISION_REQUESTED" | "REJECTED";
  note: string | null;
}) {
  const templateKey = DECISION_TEMPLATE_KEY[params.outcome];
  if (!templateKey) return;
  const submissionUrl = `${process.env.NEXTAUTH_URL ?? ""}/submissions/${params.submissionId}`;
  const noteBlock = params.note
    ? `<div style="margin: 16px 0; padding: 16px; background: #f9fafb; border-radius: 6px; font-size: 14px; line-height: 1.7; white-space: pre-wrap;">${params.note}</div>`
    : "";
  await sendTemplateMail(templateKey, params.author.email, {
    name: params.author.name,
    submissionTitle: params.submissionTitle,
    submissionUrl,
    noteBlock,
  });
}
