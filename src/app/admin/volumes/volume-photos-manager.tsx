"use client";

import { useActionState } from "react";
import { addPhoto, deletePhoto } from "@/lib/actions/conference-content";

type Photo = { id: string; caption: string | null };

export function VolumePhotosManager({
  volumeId,
  photos,
}: {
  volumeId: string;
  photos: Photo[];
}) {
  const action = addPhoto.bind(null, volumeId);
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <div className="flex flex-col gap-3">
      {photos.length === 0 ? (
        <p className="rounded border border-dashed border-gray-300 px-3 py-2 text-xs text-gray-400">
          등록된 현장 사진이 없습니다. 등록하지 않으면 공개 페이지에 스케치 영역이 보이지
          않습니다.
        </p>
      ) : (
        <div className="grid grid-cols-4 gap-2">
          {photos.map((p) => (
            <div key={p.id} className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/api/conference/photos/${p.id}`}
                alt={p.caption ?? ""}
                className="aspect-square w-full rounded border border-gray-200 object-cover"
              />
              <form
                action={async () => {
                  await deletePhoto(p.id);
                }}
                className="absolute right-1 top-1"
              >
                <button
                  type="submit"
                  className="rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white hover:bg-red-600"
                >
                  삭제
                </button>
              </form>
            </div>
          ))}
        </div>
      )}
      <form action={formAction} className="flex items-center gap-2 border-t border-gray-100 pt-2">
        <input type="file" name="photo" accept="image/jpeg,image/png,image/webp" className="min-w-0 flex-1 text-xs" />
        <input
          name="caption"
          placeholder="설명 (선택)"
          className="w-28 rounded border border-gray-300 px-2 py-1 text-xs"
        />
        <button
          type="submit"
          disabled={pending}
          className="shrink-0 rounded bg-gray-900 px-2 py-1 text-xs font-medium text-white hover:bg-gray-700 disabled:opacity-50"
        >
          {pending ? "업로드 중..." : "사진 추가"}
        </button>
      </form>
      {state?.error && <span className="text-xs text-red-600">{state.error}</span>}
    </div>
  );
}
