"use client";

import { useTransition } from "react";
import { uploadRevision } from "@/lib/actions/submissions";
import { FileDropzone } from "@/components/file-dropzone";

export function RevisionUploadForm({ submissionId }: { submissionId: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <form
      action={(formData) => {
        startTransition(async () => {
          await uploadRevision(submissionId, formData);
        });
      }}
      className="flex flex-col gap-2"
    >
      <FileDropzone
        name="file"
        accept=".pdf,.hwp,.docx"
        required
        multiple
        hint="PDF, HWP, DOCX 파일만 업로드할 수 있습니다. 여러 개 첨부 가능합니다."
      />
      <button
        type="submit"
        disabled={pending}
        className="w-fit rounded bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
      >
        {pending ? "업로드 중..." : "수정본 업로드"}
      </button>
    </form>
  );
}
