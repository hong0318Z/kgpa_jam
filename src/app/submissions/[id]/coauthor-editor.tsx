"use client";

import { useState, useTransition } from "react";
import { CoauthorPicker } from "@/components/coauthor-picker";
import { setSubmissionAuthors, type CoauthorInput } from "@/lib/actions/submission-authors";

export function CoauthorEditor({
  submissionId,
  initialAuthors,
}: {
  submissionId: string;
  initialAuthors: CoauthorInput[];
}) {
  const [editing, setEditing] = useState(false);
  const [pending, startTransition] = useTransition();

  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="text-sm text-gray-700 hover:underline"
      >
        공저자 관리
      </button>
    );
  }

  return (
    <form
      action={(formData) => {
        const raw = String(formData.get("coauthors") ?? "[]");
        const authors: CoauthorInput[] = JSON.parse(raw);
        startTransition(async () => {
          await setSubmissionAuthors(submissionId, authors);
          setEditing(false);
        });
      }}
      className="flex flex-col gap-3"
    >
      <CoauthorPicker name="coauthors" initialAuthors={initialAuthors} />
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="w-fit rounded bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
        >
          {pending ? "저장 중..." : "저장"}
        </button>
        <button
          type="button"
          onClick={() => setEditing(false)}
          className="w-fit rounded border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
        >
          취소
        </button>
      </div>
    </form>
  );
}
