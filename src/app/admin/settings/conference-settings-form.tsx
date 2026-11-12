"use client";

import { useActionState } from "react";
import { updateConferenceSettings } from "@/lib/actions/settings";

export function ConferenceSettingsForm({
  infoText,
  hasImage,
}: {
  infoText: string;
  hasImage: boolean;
}) {
  const [state, formAction, pending] = useActionState(updateConferenceSettings, {});

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          안내 문구 (학술대회 페이지와 투고 화면에 표시)
        </label>
        <textarea
          name="conferenceInfoText"
          defaultValue={infoText}
          rows={6}
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          학술대회 메인 포스터 (JPG/PNG/WEBP, 10MB 이하)
        </label>
        {hasImage && (
          <div className="mb-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/api/site/conference-image"
              alt="학술대회 메인 포스터"
              className="max-h-64 w-auto rounded border border-gray-200"
            />
          </div>
        )}
        <input type="file" name="conferenceImage" accept="image/jpeg,image/png,image/webp" />
        <p className="mt-1 text-xs text-gray-500">
          새로 올리면 기존 이미지를 대체합니다. 호별 포스터는 발행 호 관리에서 각각 올릴 수
          있습니다.
        </p>
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
