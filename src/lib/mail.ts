import nodemailer from "nodemailer";

function getTransport() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT ?? "587");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;

  if (!host || !user || !pass) {
    throw new Error("SMTP 설정(SMTP_HOST/SMTP_USER/SMTP_PASSWORD)이 누락되었습니다.");
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
}: {
  to: string;
  subject: string;
  html: string;
}) {
  const transport = getTransport();
  const fromAddress = process.env.SMTP_USER;
  await transport.sendMail({
    from: `"한국게임정책학회 인터랙티브미디어저널" <${fromAddress}>`,
    to,
    subject,
    html,
  });
}
