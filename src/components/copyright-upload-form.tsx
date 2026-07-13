"use client";

import { useActionState } from "react";
import { uploadCopyrightAssignment } from "@/lib/actions/submissions";

export function CopyrightUploadForm({ submissionId }: { submissionId: string }) {
  const action = uploadCopyrightAssignment.bind(null, submissionId);
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="flex flex-wrap items-center gap-2">
      <input
        type="file"
        name="file"
        accept=".pdf,.hwp,.docx"
        required
        className="text-sm"
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded bg-gray-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-700 disabled:opacity-50"
      >
        {pending ? "업로드 중..." : "저작권 위임서 업로드"}
      </button>
      {state?.error && <span className="text-xs text-red-600">{state.error}</span>}
      {state?.success && <span className="text-xs text-green-600">{state.success}</span>}
    </form>
  );
}
