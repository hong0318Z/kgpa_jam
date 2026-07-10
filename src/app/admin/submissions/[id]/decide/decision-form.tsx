"use client";

import { useTransition } from "react";
import { makeDecision } from "@/lib/actions/submissions";

export function DecisionForm({
  submissionId,
  defaultOutcome,
}: {
  submissionId: string;
  defaultOutcome?: "ACCEPTED" | "REVISION_REQUESTED" | "REJECTED";
}) {
  const [pending, startTransition] = useTransition();

  return (
    <form
      action={(formData) => {
        const outcome = formData.get("outcome") as
          | "ACCEPTED"
          | "REVISION_REQUESTED"
          | "REJECTED";
        const note = String(formData.get("note") ?? "");
        startTransition(async () => {
          await makeDecision(submissionId, outcome, note);
        });
      }}
      className="flex flex-col gap-4"
    >
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">결정</label>
        <select
          name="outcome"
          required
          defaultValue={defaultOutcome ?? ""}
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="" disabled>
            선택
          </option>
          <option value="ACCEPTED">게재승인</option>
          <option value="REVISION_REQUESTED">수정요청</option>
          <option value="REJECTED">반려</option>
        </select>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">비고</label>
        <textarea name="note" rows={3} className="w-full rounded border border-gray-300 px-3 py-2 text-sm" />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="w-fit rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
      >
        {pending ? "처리 중..." : "결정 등록"}
      </button>
    </form>
  );
}
