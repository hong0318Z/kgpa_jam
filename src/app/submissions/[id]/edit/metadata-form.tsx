"use client";

import { useActionState } from "react";
import { updateSubmissionMetadata } from "@/lib/actions/submissions";
import { SUBMISSION_FIELDS } from "@/lib/labels";

export function MetadataForm({
  submissionId,
  title,
  abstract,
  keywords,
  fields,
}: {
  submissionId: string;
  title: string;
  abstract: string;
  keywords: string[];
  fields: string[];
}) {
  const action = updateSubmissionMetadata.bind(null, submissionId);
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">제목</label>
        <input
          name="title"
          required
          defaultValue={title}
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">초록</label>
        <textarea
          name="abstract"
          required
          rows={6}
          defaultValue={abstract}
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">키워드 (쉼표로 구분)</label>
        <input
          name="keywords"
          defaultValue={keywords.join(", ")}
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">분야 (해당하는 항목 모두 선택)</label>
        <div className="flex flex-col gap-2">
          {SUBMISSION_FIELDS.map((f) => (
            <label key={f.value} className="flex items-start gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                name="fields"
                value={f.value}
                defaultChecked={fields.includes(f.value)}
                className="mt-1"
              />
              <span>
                <span className="font-medium text-gray-900">{f.label}</span>
                <span className="block text-xs text-gray-500">{f.description}</span>
              </span>
            </label>
          ))}
        </div>
      </div>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state?.success && <p className="text-sm text-green-600">{state.success}</p>}
      <button
        type="submit"
        disabled={pending}
        className="w-fit rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
      >
        {pending ? "저장 중..." : "제목/초록/분야 저장"}
      </button>
    </form>
  );
}
