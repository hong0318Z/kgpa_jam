"use client";

import { useActionState } from "react";
import { registerUser } from "@/lib/actions/auth";
import { PasswordInput } from "@/components/password-input";

export default function RegisterPage() {
  const [state, formAction, pending] = useActionState(registerUser, {});

  return (
    <div className="mx-auto max-w-sm">
      <h1 className="mb-6 text-xl font-bold text-gray-900">회원가입</h1>
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
          <label className="mb-1 block text-sm font-medium text-gray-700">이메일</label>
          <input name="email" type="email" required className="w-full rounded border border-gray-300 px-3 py-2 text-sm" />
        </div>
        <PasswordInput name="password" required minLength={8} label="비밀번호 (8자 이상)" />
        {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
        <button
          type="submit"
          disabled={pending}
          className="rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
        >
          {pending ? "처리 중..." : "가입하기"}
        </button>
      </form>
    </div>
  );
}
