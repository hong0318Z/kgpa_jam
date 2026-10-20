"use client";

import { useEffect, useState } from "react";
import { useActionState } from "react";
import { updateVolumeDates } from "@/lib/actions/volumes";
import { CONFERENCE_FORMATS, CONFERENCE_FORMAT_LABELS } from "@/lib/labels";

function toDateInputValue(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function VolumeDatesForm({
  volumeId,
  label,
  type,
  conferenceFormats,
  callStartDate,
  callEndDate,
  plannedPublishDate,
}: {
  volumeId: string;
  label: string;
  type: string;
  conferenceFormats: string[];
  callStartDate: Date;
  callEndDate: Date;
  plannedPublishDate: Date;
}) {
  const [editing, setEditing] = useState(false);
  const action = updateVolumeDates.bind(null, volumeId);
  const [state, formAction, pending] = useActionState(action, {});

  useEffect(() => {
    if (state?.success) setEditing(false);
  }, [state]);

  if (!editing) {
    return (
      <div>
        <p>
          모집: {callStartDate.toLocaleDateString("ko-KR", { timeZone: "Asia/Seoul" })} ~{" "}
          {callEndDate.toLocaleDateString("ko-KR", { timeZone: "Asia/Seoul" })}
        </p>
        <p>발간예정: {plannedPublishDate.toLocaleDateString("ko-KR", { timeZone: "Asia/Seoul" })}</p>
        {type === "CONFERENCE" && (
          <p>
            접수:{" "}
            {conferenceFormats.map((f) => CONFERENCE_FORMAT_LABELS[f] ?? f).join(", ") || "-"}
          </p>
        )}
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="mt-1 text-xs text-gray-500 hover:underline"
        >
          수정
        </button>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-1.5">
      <label className="flex items-center gap-1 text-xs text-gray-600">
        호 이름
        <input
          name="label"
          defaultValue={label}
          className="w-56 rounded border border-gray-300 px-1.5 py-0.5 text-xs"
        />
      </label>
      <label className="flex items-center gap-1 text-xs text-gray-600">
        모집시작
        <input
          type="date"
          name="callStartDate"
          defaultValue={toDateInputValue(callStartDate)}
          className="rounded border border-gray-300 px-1.5 py-0.5 text-xs"
        />
      </label>
      <label className="flex items-center gap-1 text-xs text-gray-600">
        모집종료
        <input
          type="date"
          name="callEndDate"
          defaultValue={toDateInputValue(callEndDate)}
          className="rounded border border-gray-300 px-1.5 py-0.5 text-xs"
        />
      </label>
      <label className="flex items-center gap-1 text-xs text-gray-600">
        발간예정
        <input
          type="date"
          name="plannedPublishDate"
          defaultValue={toDateInputValue(plannedPublishDate)}
          className="rounded border border-gray-300 px-1.5 py-0.5 text-xs"
        />
      </label>
      {type === "CONFERENCE" && (
        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600">
          <span>접수 형식</span>
          {CONFERENCE_FORMATS.map((f) => (
            <label key={f} className="flex items-center gap-1">
              <input
                type="checkbox"
                name="conferenceFormats"
                value={f}
                defaultChecked={conferenceFormats.includes(f)}
              />
              {CONFERENCE_FORMAT_LABELS[f]}
            </label>
          ))}
        </div>
      )}
      {state?.error && <p className="text-xs text-red-600">{state.error}</p>}
      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded bg-gray-900 px-2 py-1 text-xs font-medium text-white hover:bg-gray-700 disabled:opacity-50"
        >
          {pending ? "저장 중..." : "저장"}
        </button>
        <button
          type="button"
          onClick={() => setEditing(false)}
          className="text-xs text-gray-500 hover:underline"
        >
          취소
        </button>
      </div>
    </form>
  );
}
