"use client";

import { useActionState } from "react";
import { createVolume } from "@/lib/actions/volumes";

export default function NewVolumePage() {
  const [state, formAction, pending] = useActionState(createVolume, {});

  return (
    <div className="w-full">
      <h1 className="mb-6 text-xl font-bold text-gray-900">새 발행 호(Volume) 등록</h1>
      <form action={formAction} className="flex flex-col gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">호 (예: Vol.1 No.1)</label>
          <input name="label" required className="w-full rounded border border-gray-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">투고 모집 시작일</label>
          <input name="callStartDate" type="date" required className="w-full rounded border border-gray-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">투고 모집 종료일</label>
          <input name="callEndDate" type="date" required className="w-full rounded border border-gray-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">발간예정일</label>
          <input name="plannedPublishDate" type="date" required className="w-full rounded border border-gray-300 px-3 py-2 text-sm" />
        </div>
        {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
        <button
          type="submit"
          disabled={pending}
          className="w-fit rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
        >
          {pending ? "등록 중..." : "등록"}
        </button>
      </form>
    </div>
  );
}
