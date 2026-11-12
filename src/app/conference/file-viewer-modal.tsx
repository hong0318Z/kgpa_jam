"use client";

import { useState, type ReactNode } from "react";

export function FileViewerModal({
  src,
  title,
  isImage,
  trigger,
}: {
  src: string;
  title: string;
  isImage: boolean;
  trigger: ReactNode;
}) {
  const [open, setOpen] = useState(false);

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
              {isImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={src} alt={title} className="mx-auto max-h-[75vh] w-auto object-contain" />
              ) : (
                <iframe src={src} title={title} className="h-[75vh] w-full border-0" />
              )}
            </div>
            <div className="border-t border-gray-200 px-4 py-2 text-right">
              <a href={src} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 underline">
                새 창에서 열기
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
