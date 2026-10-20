"use client";

import { useActionState } from "react";
import { updateConferenceSettings } from "@/lib/actions/settings";

export function ConferenceSettingsForm({
  enabled,
  infoText,
}: {
  enabled: boolean;
  infoText: string;
}) {
  const [state, formAction, pending] = useActionState(updateConferenceSettings, {});

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <label className="flex items-center gap-2 text-sm font-medium text-gray-900">
        <input type="checkbox" name="conferenceEnabled" defaultChecked={enabled} />
        학술대회 페이지 공개 (메인 및 상단 메뉴에 노출)
      </label>
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          투고 안내 문구 (학술대회 페이지와 투고 화면에 표시)
        </label>
        <textarea
          name="conferenceInfoText"
          defaultValue={infoText}
          rows={6}
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
        />
      </div>
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="w-fit rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
        >
          {pending ? "저장 중..." : "저장"}
        </button>
        {state?.success && <p className="text-sm text-green-600">{state.success}</p>}
        {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      </div>
    </form>
  );
}
