export const DEFAULT_PASSWORD_RESET_CODE_SUBJECT =
  "[한국게임정책학회] 「인터랙티브미디어저널」 비밀번호 재설정 인증번호";

export const DEFAULT_PASSWORD_RESET_CODE_BODY_HTML = `
<p style="font-size: 15px; line-height: 1.6;">
  안녕하세요.
</p>
<p style="font-size: 15px; line-height: 1.6;">
  비밀번호 재설정을 요청하셨습니다. 아래 인증번호를 비밀번호 재설정 화면에 입력해 주세요.
  인증번호는 <strong>10분간</strong> 유효합니다.
</p>

<div style="text-align: center; margin: 32px 0;">
  <span style="display: inline-block; padding: 16px 32px; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 28px; font-weight: 700; letter-spacing: 6px; color: #111827;">
    {{code}}
  </span>
</div>

<p style="font-size: 13px; line-height: 1.6; color: #6b7280;">
  본인이 요청하지 않으셨다면 이 메일을 무시하셔도 됩니다. 비밀번호는 변경되지 않습니다.
</p>
`.trim();
