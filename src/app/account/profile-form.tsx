"use client";

import { useActionState } from "react";
import { updateProfile } from "@/lib/actions/account";

export function ProfileForm({
  affiliation,
  position,
  phone,
}: {
  affiliation: string;
  position: string | null;
  phone: string;
}) {
  const [state, formAction, pending] = useActionState(updateProfile, {});

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">소속</label>
        <input
          name="affiliation"
          required
          defaultValue={affiliation}
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">직책</label>
        <input
          name="position"
          defaultValue={position ?? ""}
          placeholder="예: 교수, 박사과정, 석사과정, 대표 등"
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">연락처</label>
        <input
          name="phone"
          required
          defaultValue={phone}
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
        {pending ? "저장 중..." : "정보 저장"}
      </button>
    </form>
  );
}
