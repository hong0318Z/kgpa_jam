"use client";

import { useActionState } from "react";
import { submitFinalManuscript } from "@/lib/actions/submissions";

export function FinalManuscriptForm({ submissionId }: { submissionId: string }) {
  const action = submitFinalManuscript.bind(null, submissionId);
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          최종 원고 파일 (저자명·소속 등 개인정보 포함, PDF/HWP/DOCX)
        </label>
        <input
          type="file"
          name="file"
          accept=".pdf,.hwp,.docx"
          required
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
        />
      </div>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state?.success && <p className="text-sm text-green-600">{state.success}</p>}
      <button
        type="submit"
        disabled={pending}
        className="w-fit rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
      >
        {pending ? "제출 중..." : "최종 원고 제출"}
      </button>
    </form>
  );
}
