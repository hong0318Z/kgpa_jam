"use client";

import { useState, useTransition } from "react";
import { withdrawSubmission } from "@/lib/actions/submissions";

export function WithdrawSubmissionButton({
  submissionId,
  title,
}: {
  submissionId: string;
  title: string;
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function confirmWithdraw() {
    startTransition(async () => {
      const result = await withdrawSubmission(submissionId);
      if (result.error) {
        setError(result.error);
      } else {
        setOpen(false);
      }
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setError(null);
          setOpen(true);
        }}
        className="rounded border border-red-300 px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
      >
        투고 취소하기
      </button>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-gray-900">투고를 취소하시겠습니까?</h3>
            <p className="mt-2 text-sm text-gray-700">{title}</p>
            <p className="mt-2 text-xs text-gray-500">
              투고를 취소하면 더 이상 심사가 진행되지 않습니다. 이 작업은 되돌릴 수 없습니다.
            </p>
            {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                닫기
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={confirmWithdraw}
                className="rounded bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {pending ? "취소 처리 중..." : "투고 취소 확인"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
