export function PrivacyConsentNotice() {
  return (
    <div className="max-h-40 overflow-y-auto rounded border border-gray-200 bg-gray-50 p-3 text-xs leading-relaxed text-gray-600">
      <p>
        한국게임정책학회(이하 &apos;본 학회&apos;)는 「인터랙티브미디어저널」 투고 · 심사 시스템
        회원 가입 및 운영을 위해 아래와 같이 개인정보를 수집 · 이용합니다.
      </p>
      <p className="mt-2">
        ■ 수집 항목: 이름, 소속, 연락처, 이메일, 비밀번호(암호화 저장, 구글 계정 가입 시 제외)
        <br />
        ■ 수집 목적: 회원 식별 및 계정 관리, 논문 투고 · 심사 절차 진행, 학회 공지사항 전달
        <br />
        ■ 보유 및 이용 기간: 회원 탈퇴 시까지 (단, 관계 법령에 따라 별도 보관이 필요한 경우 해당
        기간 동안 보관)
      </p>
      <p className="mt-2">
        귀하는 개인정보 수집 · 이용에 대한 동의를 거부할 권리가 있으며, 동의를 거부하는 경우
        회원가입 및 투고 · 심사 시스템 이용이 제한됩니다.
      </p>
    </div>
  );
}
