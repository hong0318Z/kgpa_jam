"use client";

import { useState } from "react";

type Photo = { id: string; caption: string | null };

export function PhotoGallery({ photos }: { photos: Photo[] }) {
  const [index, setIndex] = useState<number | null>(null);

  if (photos.length === 0) return null;

  const go = (delta: number) => {
    if (index === null) return;
    setIndex((index + delta + photos.length) % photos.length);
  };

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {photos.map((p, i) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setIndex(i)}
            className="group aspect-[4/3] overflow-hidden rounded-lg bg-gray-100"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/api/conference/photos/${p.id}`}
              alt={p.caption ?? ""}
              loading="lazy"
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
            />
          </button>
        ))}
      </div>

      {index !== null && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-3 bg-black/95 p-4"
          onClick={() => setIndex(null)}
        >
          <button
            type="button"
            onClick={() => setIndex(null)}
            className="fixed right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
          >
            ✕
          </button>
          <div className="relative flex max-h-[80vh] max-w-[90vw] items-center justify-center" onClick={(e) => e.stopPropagation()}>
            {photos.length > 1 && (
              <button
                type="button"
                onClick={() => go(-1)}
                className="absolute -left-14 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 sm:flex"
              >
                ‹
              </button>
            )}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/api/conference/photos/${photos[index].id}`}
              alt={photos[index].caption ?? ""}
              className="max-h-[80vh] max-w-[90vw] rounded object-contain"
            />
            {photos.length > 1 && (
              <button
                type="button"
                onClick={() => go(1)}
                className="absolute -right-14 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 sm:flex"
              >
                ›
              </button>
            )}
          </div>
          {photos[index].caption && (
            <p className="text-center text-sm text-white/70">{photos[index].caption}</p>
          )}
          <p className="text-xs text-white/40">
            {index + 1} / {photos.length}
          </p>
        </div>
      )}
    </>
  );
}
