export function welcomeEmailHtml({
  name,
  loginUrl,
}: {
  name: string;
  loginUrl: string;
}) {
  return `
<div style="font-family: -apple-system, 'Malgun Gothic', sans-serif; max-width: 560px; margin: 0 auto; color: #1f2937;">
  <div style="padding: 24px 0; border-bottom: 2px solid #111827;">
    <p style="margin: 0; font-size: 13px; color: #6b7280;">한국게임정책학회</p>
    <h1 style="margin: 4px 0 0; font-size: 20px; color: #111827;">「인터랙티브미디어저널」 투고 · 심사 시스템</h1>
  </div>

  <div style="padding: 24px 0;">
    <p style="font-size: 15px; line-height: 1.6;">
      안녕하세요, <strong>${name}</strong>님.
    </p>
    <p style="font-size: 15px; line-height: 1.6;">
      한국게임정책학회 「인터랙티브미디어저널」 투고 · 심사 시스템 회원가입을 진심으로 환영합니다.
      이제 논문 투고, 심사 현황 확인, 공지사항 확인 등을 온라인으로 편리하게 이용하실 수 있습니다.
    </p>

    <div style="margin: 24px 0; padding: 16px; background: #f9fafb; border-radius: 6px; font-size: 14px; line-height: 1.7;">
      <p style="margin: 0 0 8px; font-weight: 600;">이용 안내</p>
      <p style="margin: 0;">· 논문 투고: 로그인 후 상단 메뉴에서 &quot;논문 투고하기&quot;</p>
      <p style="margin: 0;">· 투고 양식 다운로드: 자료실 메뉴</p>
      <p style="margin: 0;">· 심사 진행 상황: &quot;내 투고&quot; 메뉴에서 실시간 확인 가능</p>
    </div>

    <div style="text-align: center; margin: 32px 0;">
      <a href="${loginUrl}" style="display: inline-block; padding: 12px 28px; background: #111827; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 14px; font-weight: 600;">
        시스템 바로가기
      </a>
    </div>

    <p style="font-size: 13px; line-height: 1.6; color: #6b7280;">
      문의사항이 있으시면 학회 이메일(paper@k-gpa.or.kr)로 연락해 주시기 바랍니다.
    </p>
  </div>

  <div style="padding: 16px 0; border-top: 1px solid #e5e7eb; font-size: 12px; color: #9ca3af;">
    <p style="margin: 0;">이 메일은 발신전용입니다. 회신하셔도 확인이 어려울 수 있습니다.</p>
    <p style="margin: 4px 0 0;">© 한국게임정책학회(KGPA) 「인터랙티브미디어저널」</p>
  </div>
</div>
`.trim();
}
