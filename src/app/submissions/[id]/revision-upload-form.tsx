"use client";

import { useTransition } from "react";
import { uploadRevision } from "@/lib/actions/submissions";

export function RevisionUploadForm({ submissionId }: { submissionId: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <form
      action={(formData) => {
        startTransition(async () => {
          await uploadRevision(submissionId, formData);
        });
      }}
      className="flex items-center gap-2"
    >
      <input name="file" type="file" accept="application/pdf" required className="text-sm" />
      <button
        type="submit"
        disabled={pending}
        className="rounded bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
      >
        {pending ? "업로드 중..." : "수정본 업로드"}
      </button>
    </form>
  );
}
