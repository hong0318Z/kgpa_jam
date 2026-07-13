export const DEFAULT_DECISION_ACCEPTED_SUBJECT =
  "[한국게임정책학회] 「인터랙티브미디어저널」 게재승인 안내";

export const DEFAULT_DECISION_ACCEPTED_BODY_HTML = `
<p style="font-size: 15px; line-height: 1.6;">
  안녕하세요, <strong>{{name}}</strong>님.
</p>
<p style="font-size: 15px; line-height: 1.6;">
  투고하신 논문 「{{submissionTitle}}」에 대한 심사 결과, <strong>게재가 승인</strong>되었습니다.
  축하드립니다. 게재를 위해 최종 원고 제출이 필요하니 시스템에서 확인해 주시기 바랍니다.
</p>
{{noteBlock}}
<div style="text-align: center; margin: 32px 0;">
  <a href="{{submissionUrl}}" style="display: inline-block; padding: 12px 28px; background: #111827; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 14px; font-weight: 600;">
    투고 상세 확인하기
  </a>
</div>

<p style="font-size: 13px; line-height: 1.6; color: #6b7280;">
  문의사항이 있으시면 학회 이메일(paper@k-gpa.or.kr)로 연락해 주시기 바랍니다.
</p>
`.trim();

export const DEFAULT_DECISION_REVISION_REQUESTED_SUBJECT =
  "[한국게임정책학회] 「인터랙티브미디어저널」 수정요청 안내";

export const DEFAULT_DECISION_REVISION_REQUESTED_BODY_HTML = `
<p style="font-size: 15px; line-height: 1.6;">
  안녕하세요, <strong>{{name}}</strong>님.
</p>
<p style="font-size: 15px; line-height: 1.6;">
  투고하신 논문 「{{submissionTitle}}」에 대한 심사 결과, <strong>수정요청</strong>으로 결정되었습니다.
  심사 의견을 확인하신 후 수정하여 재투고해 주시기 바랍니다.
</p>
{{noteBlock}}
<div style="text-align: center; margin: 32px 0;">
  <a href="{{submissionUrl}}" style="display: inline-block; padding: 12px 28px; background: #111827; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 14px; font-weight: 600;">
    투고 상세 확인하기
  </a>
</div>

<p style="font-size: 13px; line-height: 1.6; color: #6b7280;">
  문의사항이 있으시면 학회 이메일(paper@k-gpa.or.kr)로 연락해 주시기 바랍니다.
</p>
`.trim();

export const DEFAULT_DECISION_REJECTED_SUBJECT =
  "[한국게임정책학회] 「인터랙티브미디어저널」 심사 결과 안내";

export const DEFAULT_DECISION_REJECTED_BODY_HTML = `
<p style="font-size: 15px; line-height: 1.6;">
  안녕하세요, <strong>{{name}}</strong>님.
</p>
<p style="font-size: 15px; line-height: 1.6;">
  투고하신 논문 「{{submissionTitle}}」에 대한 심사 결과를 안내드립니다. 아쉽게도 이번 심사에서는
  <strong>게재불가</strong>로 결정되었습니다. 자세한 사유는 시스템에서 확인하실 수 있습니다.
</p>
{{noteBlock}}
<div style="text-align: center; margin: 32px 0;">
  <a href="{{submissionUrl}}" style="display: inline-block; padding: 12px 28px; background: #111827; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 14px; font-weight: 600;">
    투고 상세 확인하기
  </a>
</div>

<p style="font-size: 13px; line-height: 1.6; color: #6b7280;">
  문의사항이 있으시면 학회 이메일(paper@k-gpa.or.kr)로 연락해 주시기 바랍니다.
</p>
`.trim();
