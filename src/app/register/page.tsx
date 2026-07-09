"use client";

import { useState, useTransition } from "react";
import { useActionState } from "react";
import { registerUser, checkEmailAvailability } from "@/lib/actions/auth";
import { PasswordInput } from "@/components/password-input";
import { PrivacyConsentBox } from "@/components/privacy-consent-box";
import { GoogleSignInButton } from "@/components/google-signin-button";

type EmailStatus = "idle" | "checking" | "available" | "taken";

export default function RegisterPage() {
  const [state, formAction, pending] = useActionState(registerUser, {});
  const [emailStatus, setEmailStatus] = useState<EmailStatus>("idle");
  const [, startEmailCheck] = useTransition();
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  const passwordsMismatch = passwordConfirm.length > 0 && password !== passwordConfirm;

  function handleEmailBlur(e: React.FocusEvent<HTMLInputElement>) {
    const email = e.target.value.trim().toLowerCase();
    if (!email) {
      setEmailStatus("idle");
      return;
    }
    setEmailStatus("checking");
    startEmailCheck(async () => {
      const result = await checkEmailAvailability(email);
      setEmailStatus(result.available ? "available" : "taken");
    });
  }

  return (
    <div className="mx-auto max-w-sm">
      <h1 className="mb-6 text-xl font-bold text-gray-900">회원가입</h1>
      <GoogleSignInButton />
      <div className="my-4 flex items-center gap-3 text-xs text-gray-400">
        <div className="h-px flex-1 bg-gray-200" />
        또는 이메일로 가입
        <div className="h-px flex-1 bg-gray-200" />
      </div>
      <form action={formAction} className="flex flex-col gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">이름</label>
          <input name="name" required className="w-full rounded border border-gray-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">소속</label>
          <input name="affiliation" required className="w-full rounded border border-gray-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">연락처</label>
          <input name="phone" required placeholder="010-0000-0000" className="w-full rounded border border-gray-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">이메일 (아이디)</label>
          <input
            name="email"
            type="email"
            required
            onBlur={handleEmailBlur}
            onChange={() => setEmailStatus("idle")}
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
          />
          {emailStatus === "checking" && (
            <p className="mt-1 text-xs text-gray-500">중복 확인 중...</p>
          )}
          {emailStatus === "available" && (
            <p className="mt-1 text-xs text-green-600">사용 가능한 이메일입니다.</p>
          )}
          {emailStatus === "taken" && (
            <p className="mt-1 text-xs text-red-600">이미 가입된 이메일입니다.</p>
          )}
        </div>
        <PasswordInput
          name="password"
          required
          minLength={8}
          label="비밀번호 (8자 이상)"
          value={password}
          onChange={setPassword}
        />
        <div>
          <PasswordInput
            name="passwordConfirm"
            required
            minLength={8}
            label="비밀번호 확인"
            value={passwordConfirm}
            onChange={setPasswordConfirm}
          />
          {passwordsMismatch && (
            <p className="mt-1 text-xs text-red-600">비밀번호가 일치하지 않습니다.</p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            개인정보 수집 · 이용 동의 (필수)
          </label>
          <PrivacyConsentBox />
          <label className="mt-2 flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" name="privacyConsent" required />
            위 개인정보 수집 · 이용에 동의합니다. (필수)
          </label>
        </div>

        {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
        <button
          type="submit"
          disabled={pending || emailStatus === "taken" || passwordsMismatch}
          className="rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
        >
          {pending ? "처리 중..." : "가입하기"}
        </button>
      </form>
    </div>
  );
}
