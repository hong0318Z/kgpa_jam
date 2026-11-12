"use client";

import { useActionState } from "react";
import { addGreeting, deleteGreeting } from "@/lib/actions/conference-content";

type Greeting = { id: string; name: string; org: string | null; hasPhoto: boolean };

export function VolumeGreetingsManager({
  volumeId,
  greetings,
}: {
  volumeId: string;
  greetings: Greeting[];
}) {
  const action = addGreeting.bind(null, volumeId);
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <div className="flex flex-col gap-3">
      {greetings.length === 0 ? (
        <p className="rounded border border-dashed border-gray-300 px-3 py-2 text-xs text-gray-400">
          등록된 축사가 없습니다. 등록하지 않으면 공개 페이지에 축사 영역이 보이지 않습니다.
        </p>
      ) : (
        <ul className="flex flex-col gap-1">
          {greetings.map((g) => (
            <li
              key={g.id}
              className="flex items-center justify-between gap-2 rounded border border-gray-200 bg-gray-50 px-2 py-1.5 text-xs"
            >
              <span>
                {g.name}
                {g.org && <span className="text-gray-500"> · {g.org}</span>}
                {g.hasPhoto && <span className="ml-1 text-gray-400">(사진)</span>}
              </span>
              <form
                action={async () => {
                  await deleteGreeting(g.id);
                }}
              >
                <button type="submit" className="text-gray-400 hover:text-red-600">
                  삭제
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}
      <form action={formAction} className="flex flex-col gap-1.5 border-t border-gray-100 pt-2">
        <div className="flex gap-1.5">
          <input
            name="name"
            placeholder="성명"
            className="w-24 rounded border border-gray-300 px-2 py-1 text-xs"
          />
          <input
            name="org"
            placeholder="소속·직함 (선택)"
            className="flex-1 rounded border border-gray-300 px-2 py-1 text-xs"
          />
        </div>
        <textarea
          name="body"
          placeholder="축사 내용"
          rows={3}
          className="rounded border border-gray-300 px-2 py-1 text-xs"
        />
        <div className="flex items-center gap-2">
          <input type="file" name="photo" accept="image/jpeg,image/png,image/webp" className="min-w-0 flex-1 text-xs" />
          <button
            type="submit"
            disabled={pending}
            className="shrink-0 rounded bg-gray-900 px-2 py-1 text-xs font-medium text-white hover:bg-gray-700 disabled:opacity-50"
          >
            {pending ? "등록 중..." : "축사 추가"}
          </button>
        </div>
        {state?.error && <span className="text-xs text-red-600">{state.error}</span>}
        {state?.success && <span className="text-xs text-green-600">{state.success}</span>}
      </form>
    </div>
  );
}
