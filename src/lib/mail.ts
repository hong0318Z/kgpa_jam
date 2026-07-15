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
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT ?? "587");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;

  if (!host || !user || !pass) {
    throw new Error("SMTP 설정(SMTP_HOST/SMTP_USER/SMTP_PASSWORD)이 누락되었습니다.");
  }

  const secureOverride = process.env.SMTP_SECURE;
  const secure = secureOverride ? secureOverride === "true" : port === 465;

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });
}

function getBrevoTransport() {
  const host = process.env.BREVO_SMTP_HOST;
  const port = Number(process.env.BREVO_SMTP_PORT ?? "587");
  const user = process.env.BREVO_SMTP_USER;
  const pass = process.env.BREVO_SMTP_PASSWORD;

  if (!host || !user || !pass) return null;

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

function isGmailAddress(to: string) {
  const domain = to.split("@")[1]?.toLowerCase();
  return domain === "gmail.com" || domain === "googlemail.com";
}

async function deliver(
  transport: nodemailer.Transporter,
  { to, subject, html }: { to: string; subject: string; html: string },
) {
  const fromAddress = process.env.SMTP_USER;
  await transport.sendMail({
    from: `"한국게임정책학회 인터랙티브미디어저널" <${fromAddress}>`,
    to,
    subject,
    html,
    text: htmlToPlainText(html),
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
  // Gmail 수신자는 배송률이 더 좋은 Brevo로 우선 발송하고,
  // Brevo 발송이 실패하면 기존 SMTP로 재시도한다. 그 외 수신자는 기존 SMTP만 사용한다.
  const brevoTransport = isGmailAddress(to) ? getBrevoTransport() : null;

  if (brevoTransport) {
    try {
      await deliver(brevoTransport, { to, subject, html });
      await prisma.mailLog.create({
        data: { templateKey, to, subject, status: "SUCCESS" },
      });
      return;
    } catch (e) {
      const err = e as { message?: string; code?: string; command?: string; responseCode?: number };
      console.error("[mail] Brevo sendMail failed, falling back to primary SMTP:", {
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
          error: `[Brevo 실패, 기존 SMTP로 재시도] ${err.message ?? String(e)}`,
        },
      });
      // fall through to primary SMTP below
    }
  }

  try {
    const transport = getTransport();
    await deliver(transport, { to, subject, html });
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
