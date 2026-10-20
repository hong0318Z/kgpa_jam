"use client";

import { useActionState, useState } from "react";
import { createPosterSubmission } from "@/lib/actions/conference";
import { FileDropzone } from "@/components/file-dropzone";
import { formatDate } from "@/lib/date";

type Volume = {
  id: string;
  label: string;
  callStartDate: Date;
  callEndDate: Date;
  conferenceFormats?: string[];
};

type Author = { name: string; affiliation: string };

export function PosterForm({
  volumes,
  pledgeAuthorNames,
  format = "POSTER",
}: {
  volumes: Volume[];
  pledgeAuthorNames?: string;
  format?: "POSTER" | "ARTWORK";
}) {
  const noun = format === "ARTWORK" ? "작품" : "포스터";
  const authorNoun = format === "ARTWORK" ? "작가" : "저자";
  const [state, formAction, pending] = useActionState(createPosterSubmission, {});
  const [authors, setAuthors] = useState<Author[]>([{ name: "", affiliation: "" }]);

  const update = (i: number, patch: Partial<Author>) =>
    setAuthors((prev) => prev.map((a, idx) => (idx === i ? { ...a, ...patch } : a)));

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    const fd = new FormData(e.currentTarget);
    const missing: string[] = [];
    if (!String(fd.get("title") ?? "").trim()) missing.push("제목을 입력해 주세요.");
    if (authors.some((a) => !a.name.trim() || !a.affiliation.trim())) {
      missing.push(`${authorNoun}와(과) 소속을 모두 입력해 주세요.`);
    }
    const hasFile = fd.getAll("posterFile").some((f) => f instanceof File && f.size > 0);
    if (!hasFile) missing.push(`${noun} 파일을 첨부해 주세요.`);
    if (missing.length > 0) {
      e.preventDefault();
      alert(missing.join("\n"));
    }
  };

  return (
    <form action={formAction} onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <input type="hidden" name="format" value={format} />
      <input type="hidden" name="pledgeAuthorNames" value={pledgeAuthorNames ?? ""} />
      <input type="hidden" name="authors" value={JSON.stringify(authors)} />
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">투고 학술대회</label>
        <select name="volumeId" className="w-full rounded border border-gray-300 px-3 py-2 text-sm">
          {volumes.map((v) => (
            <option key={v.id} value={v.id}>
              {v.label} (모집기간: {formatDate(new Date(v.callStartDate))} ~{" "}
              {formatDate(new Date(v.callEndDate))})
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">제목</label>
        <input name="title" className="w-full rounded border border-gray-300 px-3 py-2 text-sm" />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">{authorNoun} - 소속</label>
        <div className="flex flex-col gap-2">
          {authors.map((a, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                value={a.name}
                onChange={(e) => update(i, { name: e.target.value })}
                placeholder={authorNoun}
                className="w-40 rounded border border-gray-300 px-3 py-2 text-sm"
              />
              <span className="text-gray-400">-</span>
              <input
                value={a.affiliation}
                onChange={(e) => update(i, { affiliation: e.target.value })}
                placeholder="소속"
                className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm"
              />
              {authors.length > 1 && (
                <button
                  type="button"
                  onClick={() => setAuthors((prev) => prev.filter((_, idx) => idx !== i))}
                  className="text-xs text-gray-500 hover:text-red-600"
                >
                  삭제
                </button>
              )}
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setAuthors((prev) => [...prev, { name: "", affiliation: "" }])}
          className="mt-2 rounded border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
        >
          + 추가하기
        </button>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">{noun} 파일</label>
        <FileDropzone
          name="posterFile"
          accept=".pdf,.png,.jpg,.jpeg"
          hint="PDF, PNG, JPG 파일만 업로드할 수 있습니다. (최대 20MB)"
        />
      </div>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button
        type="submit"
        disabled={pending || volumes.length === 0}
        className="w-fit rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
      >
        {pending ? "제출 중..." : `${noun} 제출하기`}
      </button>
    </form>
  );
}
