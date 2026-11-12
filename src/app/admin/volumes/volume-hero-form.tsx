"use client";

import { useActionState } from "react";
import { updateVolumeHero } from "@/lib/actions/conference-content";

export function VolumeHeroForm({
  volumeId,
  location,
  host,
}: {
  volumeId: string;
  location: string | null;
  host: string | null;
}) {
  const action = updateVolumeHero.bind(null, volumeId);
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-2">
      <label className="flex flex-col gap-1 text-xs text-gray-600">
        장소
        <input
          name="location"
          defaultValue={location ?? ""}
          placeholder="예: PLAY X4 B2B Hall"
          className="w-48 rounded border border-gray-300 px-2 py-1 text-xs"
        />
      </label>
      <label className="flex flex-col gap-1 text-xs text-gray-600">
        주최
        <input
          name="host"
          defaultValue={host ?? ""}
          placeholder="예: 한국게임정책학회"
          className="w-48 rounded border border-gray-300 px-2 py-1 text-xs"
        />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="rounded border border-gray-300 px-2 py-1 text-xs text-gray-700 hover:bg-gray-50 disabled:opacity-50"
      >
        {pending ? "저장 중..." : "저장"}
      </button>
      {state?.error && <span className="text-xs text-red-600">{state.error}</span>}
    </form>
  );
}
