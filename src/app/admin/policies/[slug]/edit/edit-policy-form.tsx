"use client";

import { useActionState } from "react";
import { updatePolicy } from "@/lib/actions/policies";

export function EditPolicyForm({
  slug,
  title,
  content,
}: {
  slug: string;
  title: string;
  content: string;
}) {
  const [state, formAction, pending] = useActionState(
    updatePolicy.bind(null, slug),
    {},
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">제목</label>
        <input
          name="title"
          required
          defaultValue={title}
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          내용 (마크다운: ## 장, ### 조 로 제목 구분)
        </label>
        <textarea
          name="content"
          required
          rows={28}
          defaultValue={content}
          className="w-full rounded border border-gray-300 px-3 py-2 font-mono text-sm"
        />
      </div>
      <p className="text-xs text-gray-500">
        저장하면 오늘 날짜로 &quot;개정&quot; 이력이 페이지 하단에 자동으로 추가됩니다.
      </p>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="w-fit rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
      >
        {pending ? "저장 중..." : "저장"}
      </button>
    </form>
  );
}
