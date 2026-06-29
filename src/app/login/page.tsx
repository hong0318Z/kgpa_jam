"use client";

import { useActionState } from "react";
import Link from "next/link";
import { login } from "@/lib/actions/login";
import { PasswordInput } from "@/components/password-input";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(login, {});

  return (
    <div className="mx-auto max-w-sm">
      <h1 className="mb-6 text-xl font-bold text-gray-900">로그인</h1>
      <form action={formAction} className="flex flex-col gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">이메일</label>
          <input
            name="email"
            type="email"
            required
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <PasswordInput name="password" required label="비밀번호" />
        {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
        <button
          type="submit"
          disabled={pending}
          className="rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
        >
          {pending ? "로그인 중..." : "로그인"}
        </button>
      </form>
      <p className="mt-4 text-sm text-gray-500">
        계정이 없으신가요? <Link href="/register" className="text-gray-900 underline">회원가입</Link>
      </p>
    </div>
  );
}
