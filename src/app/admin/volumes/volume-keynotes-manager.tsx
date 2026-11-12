"use client";

import { useActionState } from "react";
import { addKeynote, deleteKeynote } from "@/lib/actions/conference-content";

type Keynote = {
  id: string;
  title: string;
  speaker: string;
  timeLabel: string | null;
  hasFile: boolean;
  mimeType: string | null;
};

const THUMBNAILABLE_MIME = ["application/pdf", "image/jpeg", "image/png", "image/webp"];

export function VolumeKeynotesManager({
  volumeId,
  keynotes,
}: {
  volumeId: string;
  keynotes: Keynote[];
}) {
  const action = addKeynote.bind(null, volumeId);
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <div className="flex flex-col gap-3">
      {keynotes.length === 0 ? (
        <p className="rounded border border-dashed border-gray-300 px-3 py-2 text-xs text-gray-400">
          등록된 특강이 없습니다. 등록하지 않으면 공개 페이지에 특강 영역이 보이지 않습니다.
        </p>
      ) : (
        <ul className="flex flex-col gap-1.5">
          {keynotes.map((k) => (
            <li
              key={k.id}
              className="flex items-center justify-between gap-2 rounded border border-gray-200 bg-gray-50 px-2 py-1.5 text-xs"
            >
              <span className="flex min-w-0 items-center gap-2">
                {k.hasFile && k.mimeType && THUMBNAILABLE_MIME.includes(k.mimeType) && (
                  <a href={`/api/conference/keynote-file/${k.id}`} target="_blank" rel="noopener noreferrer">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`/api/conference/keynote-file/${k.id}/thumb`}
                      alt=""
                      className="h-10 w-8 shrink-0 rounded border border-gray-200 object-cover"
                    />
                  </a>
                )}
                <span className="truncate">
                  {k.timeLabel && <span className="text-gray-400">{k.timeLabel} · </span>}
                  {k.title} <span className="text-gray-500">({k.speaker})</span>
                  {k.hasFile && (
                    <a
                      href={`/api/conference/keynote-file/${k.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-1 text-blue-700 underline"
                    >
                      자료
                    </a>
                  )}
                </span>
              </span>
              <form
                action={async () => {
                  await deleteKeynote(k.id);
                }}
              >
                <button type="submit" className="shrink-0 text-gray-400 hover:text-red-600">
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
            name="timeLabel"
            placeholder="시간 (선택, 예: 10:30–11:00)"
            className="w-36 rounded border border-gray-300 px-2 py-1 text-xs"
          />
          <input
            name="speaker"
            placeholder="발표자"
            className="flex-1 rounded border border-gray-300 px-2 py-1 text-xs"
          />
        </div>
        <input
          name="title"
          placeholder="발표 제목"
          className="rounded border border-gray-300 px-2 py-1 text-xs"
        />
        <div className="flex items-center gap-2">
          <input type="file" name="file" accept=".pdf,.ppt,.pptx" className="min-w-0 flex-1 text-xs" />
          <button
            type="submit"
            disabled={pending}
            className="shrink-0 rounded bg-gray-900 px-2 py-1 text-xs font-medium text-white hover:bg-gray-700 disabled:opacity-50"
          >
            {pending ? "등록 중..." : "특강 추가"}
          </button>
        </div>
        {state?.error && <span className="text-xs text-red-600">{state.error}</span>}
        {state?.success && <span className="text-xs text-green-600">{state.success}</span>}
      </form>
    </div>
  );
}
