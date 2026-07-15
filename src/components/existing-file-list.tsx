"use client";

import { useState, useTransition } from "react";
import { deleteSubmissionFile } from "@/lib/actions/submissions";
import { formatDateTime } from "@/lib/date";
import { FileActions } from "@/components/file-actions";

type ExistingFile = {
  id: string;
  originalName: string;
  version: number;
  uploadedAt: Date;
  mimeType: string;
};

export function ExistingFileList({
  files,
  onDeleted,
}: {
  files: ExistingFile[];
  onDeleted?: () => void;
}) {
  const [items, setItems] = useState(files);
  const [pending, startTransition] = useTransition();

  if (items.length === 0) {
    return <p className="mb-2 text-xs text-gray-500">등록된 파일이 없습니다.</p>;
  }

  return (
    <ul className="mb-2 flex flex-col gap-1">
      {items.map((f) => (
        <li
          key={f.id}
          className="flex items-center gap-2 rounded border border-gray-200 px-3 py-1.5 text-sm"
        >
          <span className="flex-1 truncate">
            <FileActions fileId={f.id} mimeType={f.mimeType} label={`v${f.version} - ${f.originalName}`} />
          </span>
          <span className="shrink-0 text-xs text-gray-500">({formatDateTime(f.uploadedAt)})</span>
          <button
            type="button"
            disabled={pending}
            onClick={() => {
              if (!confirm("이 파일을 삭제하시겠습니까?")) return;
              startTransition(async () => {
                const result = await deleteSubmissionFile(f.id);
                if (result?.error) {
                  alert(result.error);
                  return;
                }
                setItems((prev) => prev.filter((x) => x.id !== f.id));
                onDeleted?.();
              });
            }}
            className="shrink-0 text-gray-500 hover:text-red-600 disabled:opacity-50"
          >
            삭제
          </button>
        </li>
      ))}
    </ul>
  );
}
