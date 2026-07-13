export const DEFAULT_REVIEWER_ASSIGNED_SUBJECT =
  "[한국게임정책학회] 「인터랙티브미디어저널」 심사위원 배정 안내";

export const DEFAULT_REVIEWER_ASSIGNED_BODY_HTML = `
<p style="font-size: 15px; line-height: 1.6;">
  안녕하세요, <strong>{{name}}</strong>님.
</p>
<p style="font-size: 15px; line-height: 1.6;">
  아래 논문의 심사위원으로 배정되셨습니다. 심사 시스템에 로그인하여 논문 내용을 확인하고
  기한 내에 심사 의견을 제출해 주시기 바랍니다.
</p>

<div style="margin: 24px 0; padding: 16px; background: #f9fafb; border-radius: 6px; font-size: 14px; line-height: 1.7;">
  <p style="margin: 0 0 8px;">· 심사번호: {{caseNumber}}</p>
  <p style="margin: 0 0 8px;">· 심사 마감일: {{dueDate}}</p>
</div>

<div style="text-align: center; margin: 32px 0;">
  <a href="{{reviewUrl}}" style="display: inline-block; padding: 12px 28px; background: #111827; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 14px; font-weight: 600;">
    심사 화면 바로가기
  </a>
</div>

<p style="font-size: 13px; line-height: 1.6; color: #6b7280;">
  문의사항이 있으시면 학회 이메일(paper@k-gpa.or.kr)로 연락해 주시기 바랍니다.
</p>
`.trim();
