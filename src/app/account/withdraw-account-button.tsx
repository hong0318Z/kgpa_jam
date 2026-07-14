"use client";

import { useState, useTransition } from "react";
import { withdrawAccount } from "@/lib/actions/account";

export function WithdrawAccountButton() {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function confirmWithdraw() {
    startTransition(async () => {
      const result = await withdrawAccount();
      if (result?.error) {
        setError(result.error);
      }
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setError(null);
          setOpen(true);
        }}
        className="text-xs text-red-600 hover:underline"
      >
        회원 탈퇴
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
            <h3 className="text-lg font-bold text-gray-900">정말 탈퇴하시겠습니까?</h3>
            <p className="mt-2 text-xs text-gray-500">
              탈퇴 시 로그인 정보와 개인정보(이름, 소속, 연락처 등)가 삭제되며 더 이상 로그인할
              수 없습니다. 이 작업은 되돌릴 수 없습니다. 진행 중인 투고 · 심사가 있으면 탈퇴할 수
              없습니다.
            </p>
            {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                취소
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={confirmWithdraw}
                className="rounded bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {pending ? "처리 중..." : "탈퇴 확인"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
