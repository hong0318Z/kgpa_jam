"use client";

import { useEffect, useState } from "react";
import { useActionState } from "react";
import { updateVolumeDates } from "@/lib/actions/volumes";

function toDateInputValue(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function VolumeDatesForm({
  volumeId,
  callStartDate,
  callEndDate,
  plannedPublishDate,
}: {
  volumeId: string;
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
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="mt-1 text-xs text-gray-500 hover:underline"
        >
          기간 수정
        </button>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-1.5">
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
