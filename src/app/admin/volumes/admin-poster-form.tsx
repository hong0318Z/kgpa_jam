"use client";

import { useActionState, useState } from "react";
import { addPosterByAdmin } from "@/lib/actions/conference";
import { CONFERENCE_FORMAT_LABELS } from "@/lib/labels";

type Author = { name: string; affiliation: string };

export function AdminPosterForm({
  volumeId,
  formats,
}: {
  volumeId: string;
  formats: ("POSTER" | "ARTWORK")[];
}) {
  const action = addPosterByAdmin.bind(null, volumeId);
  const [state, formAction, pending] = useActionState(action, {});
  const [authors, setAuthors] = useState<Author[]>([{ name: "", affiliation: "" }]);

  if (formats.length === 0) {
    return (
      <p className="text-xs text-gray-400">
        이 호는 포스터·작품을 접수하지 않습니다. 발행 호 수정에서 접수 형식을 먼저 켜 주세요.
      </p>
    );
  }

  const update = (i: number, patch: Partial<Author>) =>
    setAuthors((prev) => prev.map((a, idx) => (idx === i ? { ...a, ...patch } : a)));

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <input type="hidden" name="authors" value={JSON.stringify(authors)} />
      <div className="flex flex-wrap items-center gap-2">
        {formats.length > 1 && (
          <select name="format" className="rounded border border-gray-300 px-2 py-1 text-xs">
            {formats.map((f) => (
              <option key={f} value={f}>
                {CONFERENCE_FORMAT_LABELS[f]}
              </option>
            ))}
          </select>
        )}
        {formats.length === 1 && <input type="hidden" name="format" value={formats[0]} />}
        <input
          name="title"
          placeholder="제목"
          className="min-w-[10rem] flex-1 rounded border border-gray-300 px-2 py-1 text-xs"
        />
        <input
          name="award"
          placeholder="수상명 (선택)"
          className="w-28 rounded border border-gray-300 px-2 py-1 text-xs"
        />
      </div>
      <div className="flex flex-col gap-1">
        {authors.map((a, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <input
              value={a.name}
              onChange={(e) => update(i, { name: e.target.value })}
              placeholder="저자"
              className="w-24 rounded border border-gray-300 px-2 py-1 text-xs"
            />
            <span className="text-gray-400">-</span>
            <input
              value={a.affiliation}
              onChange={(e) => update(i, { affiliation: e.target.value })}
              placeholder="소속"
              className="flex-1 rounded border border-gray-300 px-2 py-1 text-xs"
            />
            {authors.length > 1 && (
              <button
                type="button"
                onClick={() => setAuthors((prev) => prev.filter((_, idx) => idx !== i))}
                className="text-xs text-gray-400 hover:text-red-600"
              >
                삭제
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={() => setAuthors((prev) => [...prev, { name: "", affiliation: "" }])}
          className="w-fit text-xs text-gray-600 underline"
        >
          + 저자 추가
        </button>
      </div>
      <div className="flex items-center gap-2">
        <input type="file" name="posterFile" accept=".pdf,.png,.jpg,.jpeg" className="text-xs" />
        <button
          type="submit"
          disabled={pending}
          className="shrink-0 rounded bg-gray-900 px-2 py-1 text-xs font-medium text-white hover:bg-gray-700 disabled:opacity-50"
        >
          {pending ? "등록 중..." : "등록 (바로 게재)"}
        </button>
      </div>
      {state?.error && <p className="text-xs text-red-600">{state.error}</p>}
      {state?.success && <p className="text-xs text-green-600">{state.success}</p>}
    </form>
  );
}
