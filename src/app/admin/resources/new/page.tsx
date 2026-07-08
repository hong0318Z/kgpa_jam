"use client";

import { useActionState } from "react";
import { createResource } from "@/lib/actions/resources";
import { FileDropzone } from "@/components/file-dropzone";

export default function NewResourcePage() {
  const [state, formAction, pending] = useActionState(createResource, {});

  return (
    <div className="w-full">
      <h1 className="mb-6 text-xl font-bold text-gray-900">자료 업로드</h1>
      <form action={formAction} className="flex flex-col gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">제목</label>
          <input name="title" required className="w-full rounded border border-gray-300 px-3 py-2 text-sm" />
          <p className="mt-1 text-xs text-gray-500">
            파일을 여러 개 선택하면 각 파일의 원본 이름이 자료 제목으로 사용됩니다.
          </p>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">설명</label>
          <textarea name="description" rows={3} className="w-full rounded border border-gray-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">파일 (여러 개 선택 가능)</label>
          <FileDropzone name="file" accept="*" required multiple hint="첨부할 파일을 선택해 주세요." />
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
