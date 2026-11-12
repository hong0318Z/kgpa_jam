"use client";

import { useState, type ReactNode } from "react";

export function FileViewerModal({
  src,
  downloadSrc,
  title,
  kind,
  trigger,
}: {
  src: string;
  downloadSrc?: string;
  title: string;
  kind: "image" | "pdf" | "office";
  trigger: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const officeViewerSrc =
    kind === "office"
      ? `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(src)}`
      : null;

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="contents text-left">
        {trigger}
      </button>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-lg bg-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-200 px-4 py-2.5">
              <p className="truncate text-sm font-medium text-gray-900">{title}</p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="shrink-0 rounded px-2 py-1 text-gray-500 hover:bg-gray-100"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-auto bg-gray-50">
              {kind === "image" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={src} alt={title} className="mx-auto max-h-[75vh] w-auto object-contain" />
              ) : kind === "office" ? (
                officeViewerSrc && (
                  <iframe src={officeViewerSrc} title={title} className="h-[75vh] w-full border-0" />
                )
              ) : (
                <iframe src={src} title={title} className="h-[75vh] w-full border-0" />
              )}
            </div>
            <div className="flex items-center justify-between border-t border-gray-200 px-4 py-2">
              {kind === "office" && (
                <p className="text-xs text-gray-400">
                  미리보기가 안 보이면 아래 다운로드로 직접 열어 주세요.
                </p>
              )}
              <div className="ml-auto flex items-center gap-3">
                <a
                  href={src}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 underline"
                >
                  새 창에서 열기
                </a>
                <a
                  href={downloadSrc ?? src}
                  className="rounded bg-gray-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-700"
                >
                  다운로드
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
