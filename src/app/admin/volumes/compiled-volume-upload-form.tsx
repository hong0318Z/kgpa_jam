"use client";

import { useActionState } from "react";
import { uploadCompiledVolumeFile } from "@/lib/actions/volumes";

export function CompiledVolumeUploadForm({ volumeId }: { volumeId: string }) {
  const action = uploadCompiledVolumeFile.bind(null, volumeId);
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="flex items-center gap-2">
      <input type="file" name="file" accept=".pdf" required className="text-xs" />
      <button
        type="submit"
        disabled={pending}
        className="rounded border border-gray-300 px-2 py-1 text-xs text-gray-700 hover:bg-gray-50 disabled:opacity-50"
      >
        {pending ? "업로드 중..." : "업로드"}
      </button>
      {state?.error && <span className="text-xs text-red-600">{state.error}</span>}
      {state?.success && <span className="text-xs text-green-600">{state.success}</span>}
    </form>
  );
}
