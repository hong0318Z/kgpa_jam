"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { requestPasswordResetCode, resetPasswordWithCode } from "@/lib/actions/password-reset";
import { PasswordInput } from "@/components/password-input";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [requestState, requestAction, requestPending] = useActionState(requestPasswordResetCode, {});
  const [resetState, resetAction, resetPending] = useActionState(resetPasswordWithCode, {});

  const codeRequested = !!requestState?.success;

  return (
    <div className="mx-auto max-w-sm">
      <h1 className="mb-6 text-xl font-bold text-gray-900">비밀번호 재설정</h1>

      <form action={requestAction} className="flex flex-col gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">가입한 이메일</label>
          <input
            name="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        {requestState?.error && <p className="text-sm text-red-600">{requestState.error}</p>}
        {requestState?.success && <p className="text-sm text-green-600">{requestState.success}</p>}
        <button
          type="submit"
          disabled={requestPending}
          className="rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
        >
          {requestPending ? "발송 중..." : "인증번호 받기"}
        </button>
      </form>

      {codeRequested && (
        <form action={resetAction} className="mt-6 flex flex-col gap-4 border-t border-gray-200 pt-6">
          <input type="hidden" name="email" value={email} />
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">인증번호 (6자리)</label>
            <input
              name="code"
              required
              inputMode="numeric"
              maxLength={6}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm tracking-widest"
            />
          </div>
          <PasswordInput name="newPassword" required minLength={8} label="새 비밀번호 (8자 이상)" />
          <PasswordInput name="newPasswordConfirm" required minLength={8} label="새 비밀번호 확인" />
          {resetState?.error && <p className="text-sm text-red-600">{resetState.error}</p>}
          {resetState?.success && (
            <p className="text-sm text-green-600">
              {resetState.success}{" "}
              <button type="button" onClick={() => router.push("/login")} className="underline">
                로그인하러 가기
              </button>
            </p>
          )}
          <button
            type="submit"
            disabled={resetPending}
            className="rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
          >
            {resetPending ? "변경 중..." : "비밀번호 변경"}
          </button>
        </form>
      )}

      <p className="mt-4 text-sm text-gray-500">
        <Link href="/login" className="text-gray-900 underline">
          로그인으로 돌아가기
        </Link>
      </p>
    </div>
  );
}
