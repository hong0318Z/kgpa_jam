"use client";

import { useActionState } from "react";
import { updateFeeSettings } from "@/lib/actions/fees";

type FeeSettings = {
  bankName: string | null;
  bankAccountNumber: string | null;
  bankAccountHolder: string | null;
  reviewPayoutPerReview: number | null;
  authorReviewFeePerSubmission: number | null;
  publicationFeePerPage: number | null;
  publicationFeeFlat: number | null;
  urgentPublicationFeeExtra: number | null;
} | null;

export function FeeSettingsForm({ settings }: { settings: FeeSettings }) {
  const [state, formAction, pending] = useActionState(updateFeeSettings, {});

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <div>
        <h2 className="mb-3 text-sm font-semibold text-gray-900">대표 계좌</h2>
        <div className="flex flex-col gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">은행명</label>
            <input
              name="bankName"
              defaultValue={settings?.bankName ?? ""}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">계좌번호</label>
            <input
              name="bankAccountNumber"
              defaultValue={settings?.bankAccountNumber ?? ""}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">예금주</label>
            <input
              name="bankAccountHolder"
              defaultValue={settings?.bankAccountHolder ?? ""}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-gray-900">심사비</h2>
        <div className="flex flex-col gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">
              심사위원 지급액 (건당, 원)
            </label>
            <input
              type="number"
              name="reviewPayoutPerReview"
              min={0}
              defaultValue={settings?.reviewPayoutPerReview ?? ""}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">
              저자 심사비 (투고당 1회, 원)
            </label>
            <input
              type="number"
              name="authorReviewFeePerSubmission"
              min={0}
              defaultValue={settings?.authorReviewFeePerSubmission ?? ""}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-gray-900">게재료</h2>
        <div className="flex flex-col gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">고정 게재료 (원)</label>
            <input
              type="number"
              name="publicationFeeFlat"
              min={0}
              defaultValue={settings?.publicationFeeFlat ?? ""}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">페이지당 게재료 (원)</label>
            <input
              type="number"
              name="publicationFeePerPage"
              min={0}
              defaultValue={settings?.publicationFeePerPage ?? ""}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">
              긴급 게재 추가 비용 (원)
            </label>
            <input
              type="number"
              name="urgentPublicationFeeExtra"
              min={0}
              defaultValue={settings?.urgentPublicationFeeExtra ?? ""}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
        </div>
      </div>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state?.success && <p className="text-sm text-green-600">{state.success}</p>}
      <button
        type="submit"
        disabled={pending}
        className="w-fit rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
      >
        {pending ? "저장 중..." : "저장"}
      </button>
    </form>
  );
}
