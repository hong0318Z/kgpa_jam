import nodemailer from "nodemailer";
import { prisma } from "@/lib/prisma";

function htmlToPlainText(html: string) {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function getTransport() {
  const host = process.env.BREVO_SMTP_HOST;
  const port = Number(process.env.BREVO_SMTP_PORT ?? "587");
  const user = process.env.BREVO_SMTP_USER;
  const pass = process.env.BREVO_SMTP_PASSWORD;

  if (!host || !user || !pass) {
    throw new Error(
      "Brevo SMTP 설정(BREVO_SMTP_HOST/BREVO_SMTP_USER/BREVO_SMTP_PASSWORD)이 누락되었습니다.",
    );
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

export async function sendMail({
  to,
  subject,
  html,
  templateKey,
}: {
  to: string;
  subject: string;
  html: string;
  templateKey?: string;
}) {
  const recipient = await prisma.user.findUnique({
    where: { email: to },
    select: { isTestAccount: true },
  });
  if (recipient?.isTestAccount) {
    await prisma.mailLog.create({
      data: {
        templateKey,
        to,
        subject,
        status: "SKIPPED",
        error: "테스트 계정이라 실제 메일 발송을 건너뛰었습니다.",
      },
    });
    return;
  }

  const fromAddress = process.env.MAIL_FROM_ADDRESS ?? "paper@k-gpa.or.kr";
  try {
    const transport = getTransport();
    await transport.sendMail({
      from: `"한국게임정책학회 인터랙티브미디어저널" <${fromAddress}>`,
      to,
      subject,
      html,
      text: htmlToPlainText(html),
    });
    await prisma.mailLog.create({
      data: { templateKey, to, subject, status: "SUCCESS" },
    });
  } catch (e) {
    const err = e as { message?: string; code?: string; command?: string; responseCode?: number };
    console.error("[mail] sendMail failed:", {
      message: err.message,
      code: err.code,
      command: err.command,
      responseCode: err.responseCode,
    });
    await prisma.mailLog.create({
      data: {
        templateKey,
        to,
        subject,
        status: "FAILED",
        error: err.message ?? String(e),
      },
    });
    throw e;
  }
}
