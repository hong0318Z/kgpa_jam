"use client";

import { useActionState, useTransition } from "react";
import { updateOgSettings, resetOgSettings } from "@/lib/actions/settings";

export function OgSettingsForm({
  ogTitle,
  ogDescription,
  hasImage,
}: {
  ogTitle: string | null;
  ogDescription: string | null;
  hasImage: boolean;
}) {
  const [state, formAction, pending] = useActionState(updateOgSettings, {});
  const [resetPending, startReset] = useTransition();

  return (
    <div className="flex flex-col gap-4">
      <form action={formAction} className="flex flex-col gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            미리보기 제목 (비워두면 기본 제목 사용)
          </label>
          <input
            name="ogTitle"
            defaultValue={ogTitle ?? ""}
            placeholder="예: 「인터랙티브미디어저널」 창간호 논문 투고 모집중"
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            미리보기 설명 (비워두면 기본 설명 사용)
          </label>
          <textarea
            name="ogDescription"
            rows={3}
            defaultValue={ogDescription ?? ""}
            placeholder="예: 2026년 창간호 논문을 모집합니다. 지금 투고해 주세요."
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            미리보기 이미지 (JPG/PNG/WEBP, 권장 비율 1.91:1, 최대 10MB)
          </label>
          {hasImage && (
            <div className="mb-2">
              <img
                src={`/api/site/og-image?t=${Date.now()}`}
                alt="현재 미리보기 이미지"
                className="h-32 w-auto rounded border border-gray-200 object-cover"
              />
            </div>
          )}
          <input type="file" name="ogImage" accept="image/jpeg,image/png,image/webp" className="text-sm" />
        </div>
        {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
        {state?.success && <p className="text-sm text-green-600">{state.success}</p>}
        <div className="flex items-center gap-2">
          <button
            type="submit"
            disabled={pending}
            className="w-fit rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
          >
            {pending ? "저장 중..." : "저장"}
          </button>
          <button
            type="button"
            disabled={resetPending}
            onClick={() =>
              startReset(async () => {
                await resetOgSettings();
              })
            }
            className="w-fit rounded border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            {resetPending ? "초기화 중..." : "기본값으로 초기화"}
          </button>
        </div>
      </form>
    </div>
  );
}
