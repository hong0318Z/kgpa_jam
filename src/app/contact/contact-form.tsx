"use client";

import { useActionState } from "react";
import { submitInquiry } from "@/lib/actions/inquiries";

export function ContactForm() {
  const [state, formAction, pending] = useActionState(submitInquiry, {});

  if (state?.success) {
    return (
      <div className="rounded border border-green-200 bg-green-50 p-6 text-sm text-green-800">
        {state.success}
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">이름</label>
        <input name="name" required className="w-full rounded border border-gray-300 px-3 py-2 text-sm" />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">이메일</label>
        <input
          name="email"
          type="email"
          required
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">연락처 (선택)</label>
        <input
          name="phone"
          placeholder="010-0000-0000"
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">제목</label>
        <input name="subject" required className="w-full rounded border border-gray-300 px-3 py-2 text-sm" />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">문의 내용</label>
        <textarea
          name="message"
          required
          rows={6}
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
        />
      </div>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="w-fit rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
      >
        {pending ? "전송 중..." : "문의 보내기"}
      </button>
    </form>
  );
}
