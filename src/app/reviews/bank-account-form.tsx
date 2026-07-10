"use client";

import { useActionState } from "react";
import { updateReviewerBankAccount } from "@/lib/actions/account";

export function BankAccountForm({
  bankName,
  bankAccountNumber,
  bankAccountHolder,
}: {
  bankName: string | null;
  bankAccountNumber: string | null;
  bankAccountHolder: string | null;
}) {
  const [state, formAction, pending] = useActionState(updateReviewerBankAccount, {});

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3">
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-700">은행명</label>
        <input
          name="bankName"
          defaultValue={bankName ?? ""}
          className="w-32 rounded border border-gray-300 px-2 py-1.5 text-sm"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-700">계좌번호</label>
        <input
          name="bankAccountNumber"
          defaultValue={bankAccountNumber ?? ""}
          className="w-44 rounded border border-gray-300 px-2 py-1.5 text-sm"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-700">예금주</label>
        <input
          name="bankAccountHolder"
          defaultValue={bankAccountHolder ?? ""}
          className="w-28 rounded border border-gray-300 px-2 py-1.5 text-sm"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
      >
        {pending ? "저장 중..." : "저장"}
      </button>
      {state?.success && <p className="text-xs text-green-600">{state.success}</p>}
      {state?.error && <p className="text-xs text-red-600">{state.error}</p>}
    </form>
  );
}
