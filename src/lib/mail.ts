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
    // 일부 구형 호스팅 메일 서버는 최신 OpenSSL이 기본 차단하는 낮은 TLS 버전만
    // 지원한다 (SSL routines:ssl_choose_client_version:unsupported protocol).
    // 이 SMTP 연결에 한해서만 낮은 버전을 허용한다.
    tls: { minVersion: "TLSv1" },
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
