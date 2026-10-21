"use client";

import { useActionState } from "react";
import { useState } from "react";
import { createVolume } from "@/lib/actions/volumes";
import { CONFERENCE_FORMATS, CONFERENCE_FORMAT_LABELS } from "@/lib/labels";

export default function NewVolumePage() {
  const [state, formAction, pending] = useActionState(createVolume, {});
  const [type, setType] = useState("JOURNAL");

  return (
    <div className="w-full">
      <h1 className="mb-6 text-xl font-bold text-gray-900">새 발행 호(Volume) 등록</h1>
      <form action={formAction} className="flex flex-col gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">호 (예: Vol.1 No.1)</label>
          <input name="label" required className="w-full rounded border border-gray-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">구분</label>
          <select
            name="type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="JOURNAL">학술지</option>
            <option value="CONFERENCE">학술대회</option>
          </select>
        </div>
        {type === "CONFERENCE" && (
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              접수 형식 (해당하는 항목 모두 선택)
            </label>
            <div className="flex gap-4 text-sm text-gray-700">
              {CONFERENCE_FORMATS.map((f) => (
                <label key={f} className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    name="conferenceFormats"
                    value={f}
                    defaultChecked={f !== "ARTWORK"}
                  />
                  {CONFERENCE_FORMAT_LABELS[f]}
                </label>
              ))}
            </div>
          </div>
        )}
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
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">안내 내용 (선택)</label>
          <textarea
            name="infoText"
            rows={4}
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            안내 포스터 이미지 (선택, JPG/PNG/WEBP)
          </label>
          <input type="file" name="infoImage" accept="image/jpeg,image/png,image/webp" />
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
