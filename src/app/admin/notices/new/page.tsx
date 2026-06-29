"use client";

import { useActionState } from "react";
import { createNotice } from "@/lib/actions/notices";
import { MarkdownImageTextarea } from "@/components/markdown-image-textarea";

export default function NewNoticePage() {
  const [state, formAction, pending] = useActionState(createNotice, {});

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="mb-6 text-xl font-bold text-gray-900">새 공지사항 작성</h1>
      <form action={formAction} className="flex flex-col gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">제목</label>
          <input name="title" required className="w-full rounded border border-gray-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">내용</label>
          <MarkdownImageTextarea name="content" rows={12} />
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" name="isPinned" />
          상단 고정
        </label>
        {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
        <button
          type="submit"
          disabled={pending}
          className="w-fit rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
        >
          {pending ? "등록 중..." : "등록"}
        </button>
      </form>
    </div>
  );
}
