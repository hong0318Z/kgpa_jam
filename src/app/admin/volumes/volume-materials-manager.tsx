"use client";

import { useActionState } from "react";
import { addVolumeMaterial, deleteVolumeMaterial } from "@/lib/actions/volumes";

type Material = { id: string; title: string; originalName: string };

function extLabel(originalName: string) {
  const ext = originalName.split(".").pop()?.toUpperCase() ?? "";
  return ext.length <= 5 ? ext : "";
}

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
    <div className="flex flex-col gap-3">
      <div>
        <p className="mb-1 text-xs font-medium text-gray-600">
          등록된 자료 ({materials.length}개) — 아래 목록에 올린 순서대로 공개 페이지에 표시됩니다.
        </p>
        {materials.length === 0 ? (
          <p className="rounded border border-dashed border-gray-300 px-3 py-2 text-xs text-gray-400">
            아직 올린 자료가 없습니다. 기조강연·세션 발표 등 자료를 아래에서 추가해 주세요.
          </p>
        ) : (
          <ol className="flex flex-col gap-1">
            {materials.map((m, i) => (
              <li
                key={m.id}
                className="flex items-center justify-between gap-2 rounded border border-gray-200 bg-gray-50 px-2 py-1.5 text-xs"
              >
                <span className="flex min-w-0 items-center gap-2">
                  <span className="shrink-0 text-gray-400">{i + 1}.</span>
                  {extLabel(m.originalName) && (
                    <span className="shrink-0 rounded bg-gray-200 px-1.5 py-0.5 font-medium text-gray-600">
                      {extLabel(m.originalName)}
                    </span>
                  )}
                  <a
                    href={`/api/volumes/materials/${m.id}`}
                    className="truncate text-blue-700 underline"
                    title={m.originalName}
                  >
                    {m.title}
                  </a>
                </span>
                <form
                  action={async () => {
                    await deleteVolumeMaterial(m.id);
                  }}
                >
                  <button type="submit" className="shrink-0 text-gray-400 hover:text-red-600">
                    삭제
                  </button>
                </form>
              </li>
            ))}
          </ol>
        )}
      </div>

      <form action={formAction} className="flex flex-col gap-1.5 border-t border-gray-100 pt-2">
        <p className="text-xs font-medium text-gray-600">자료 추가</p>
        <input
          name="title"
          placeholder="자료 제목 (예: 기조강연 - 홍길동 교수)"
          className="rounded border border-gray-300 px-2 py-1 text-xs"
        />
        <div className="flex items-center gap-2">
          <input type="file" name="file" accept=".pdf,.ppt,.pptx" className="min-w-0 flex-1 text-xs" />
          <button
            type="submit"
            disabled={pending}
            className="shrink-0 rounded bg-gray-900 px-2 py-1 text-xs font-medium text-white hover:bg-gray-700 disabled:opacity-50"
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
