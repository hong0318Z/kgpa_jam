"use client";

import { useActionState } from "react";
import { updateReviewerCareerNote } from "@/lib/actions/account";

export function CareerNoteForm({ careerNote }: { careerNote: string | null }) {
  const [state, formAction, pending] = useActionState(updateReviewerCareerNote, {});

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <textarea
        name="careerNote"
        defaultValue={careerNote ?? ""}
        rows={8}
        placeholder="이력, 연구실적 등을 자유롭게 기록해 두실 수 있습니다."
        className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
      />
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="w-fit rounded bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
        >
          {pending ? "저장 중..." : "저장"}
        </button>
        {state?.success && <p className="text-xs text-green-600">{state.success}</p>}
        {state?.error && <p className="text-xs text-red-600">{state.error}</p>}
      </div>
    </form>
  );
}
