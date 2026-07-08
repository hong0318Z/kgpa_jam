"use client";

import { useActionState } from "react";
import { uploadRevision } from "@/lib/actions/submissions";
import { FileDropzone } from "@/components/file-dropzone";

export function RevisionUploadForm({ submissionId }: { submissionId: string }) {
  const [state, formAction, pending] = useActionState(
    uploadRevision.bind(null, submissionId),
    {},
  );

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          심사위원께 드리는 답변 (선택)
        </label>
        <textarea
          name="response"
          rows={4}
          placeholder="심사 의견에 대한 수정 사항 및 답변을 작성해 주세요."
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          수정본 파일 (선택, 여러 개 첨부 가능)
        </label>
        <FileDropzone
          name="file"
          accept=".pdf,.hwp,.docx"
          multiple
          hint="PDF, HWP, DOCX 파일만 업로드할 수 있습니다."
        />
      </div>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="w-fit rounded bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
      >
        {pending ? "제출 중..." : "답변/수정본 제출"}
      </button>
    </form>
  );
}
