"use client";

import { useActionState } from "react";
import { addVolumeMaterial, deleteVolumeMaterial } from "@/lib/actions/volumes";

type Material = { id: string; title: string; originalName: string };

export function VolumeMaterialsManager({
  volumeId,
  materials,
}: {
  volumeId: string;
  materials: Material[];
}) {
  const action = addVolumeMaterial.bind(null, volumeId);
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <div className="flex flex-col gap-1.5">
      {materials.length > 0 && (
        <ul className="flex flex-col gap-1">
          {materials.map((m) => (
            <li key={m.id} className="flex items-center justify-between gap-2 text-xs">
              <a
                href={`/api/volumes/materials/${m.id}`}
                className="truncate text-gray-700 underline"
              >
                {m.title}
              </a>
              <form
                action={async () => {
                  await deleteVolumeMaterial(m.id);
                }}
              >
                <button
                  type="submit"
                  className="shrink-0 text-gray-400 hover:text-red-600"
                >
                  삭제
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}
      <form action={formAction} className="flex flex-col gap-1">
        <input
          name="title"
          placeholder="자료 제목 (예: 기조강연 - 홍길동)"
          className="w-40 rounded border border-gray-300 px-1.5 py-1 text-xs"
        />
        <div className="flex items-center gap-2">
          <input type="file" name="file" accept=".pdf,.ppt,.pptx" className="text-xs" />
          <button
            type="submit"
            disabled={pending}
            className="shrink-0 rounded border border-gray-300 px-2 py-1 text-xs text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            {pending ? "업로드 중..." : "업로드"}
          </button>
        </div>
        {state?.error && <span className="text-xs text-red-600">{state.error}</span>}
        {state?.success && <span className="text-xs text-green-600">{state.success}</span>}
      </form>
    </div>
  );
}
