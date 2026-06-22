"use client";

import { useActionState } from "react";
import { createResource } from "@/lib/actions/resources";

export default function NewResourcePage() {
  const [state, formAction, pending] = useActionState(createResource, {});

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-xl font-bold text-gray-900">자료 업로드</h1>
      <form action={formAction} className="flex flex-col gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">제목</label>
          <input name="title" required className="w-full rounded border border-gray-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">설명</label>
          <textarea name="description" rows={3} className="w-full rounded border border-gray-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">파일</label>
          <input name="file" type="file" required className="w-full text-sm" />
        </div>
        {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
        <button
          type="submit"
          disabled={pending}
          className="w-fit rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
        >
          {pending ? "업로드 중..." : "업로드"}
        </button>
      </form>
    </div>
  );
}
