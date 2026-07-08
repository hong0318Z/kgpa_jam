"use client";

import { useActionState } from "react";
import { createSubmission } from "@/lib/actions/submissions";
import { FileDropzone } from "@/components/file-dropzone";
import { CoauthorPicker } from "@/components/coauthor-picker";

type Volume = {
  id: string;
  label: string;
  callStartDate: Date;
  callEndDate: Date;
  plannedPublishDate: Date;
};

export function SubmissionForm({
  volumes,
  pledgeAuthorNames,
}: {
  volumes: Volume[];
  pledgeAuthorNames?: string;
}) {
  const [state, formAction, pending] = useActionState(createSubmission, {});

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="pledgeAuthorNames" value={pledgeAuthorNames ?? ""} />
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">투고 호(Volume)</label>
        <select name="volumeId" required className="w-full rounded border border-gray-300 px-3 py-2 text-sm">
          {volumes.map((v) => (
            <option key={v.id} value={v.id}>
              {v.label} (모집기간: {new Date(v.callStartDate).toLocaleDateString("ko-KR")} ~{" "}
              {new Date(v.callEndDate).toLocaleDateString("ko-KR")}, 발간예정:{" "}
              {new Date(v.plannedPublishDate).toLocaleDateString("ko-KR")})
            </option>
          ))}
        </select>
        {volumes.length === 0 && (
          <p className="mt-1 text-xs text-red-600">현재 투고 모집중인 호가 없습니다.</p>
        )}
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">제목</label>
        <input name="title" required className="w-full rounded border border-gray-300 px-3 py-2 text-sm" />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">초록</label>
        <textarea name="abstract" required rows={6} className="w-full rounded border border-gray-300 px-3 py-2 text-sm" />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">키워드 (쉼표로 구분)</label>
        <input name="keywords" className="w-full rounded border border-gray-300 px-3 py-2 text-sm" />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">공저자</label>
        <CoauthorPicker name="coauthors" />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">논문 파일</label>
        <FileDropzone
          name="file"
          accept=".pdf,.hwp,.docx"
          required
          hint="PDF, HWP, DOCX 파일만 업로드할 수 있습니다. (최대 20MB)"
        />
      </div>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button
        type="submit"
        disabled={pending || volumes.length === 0}
        className="w-fit rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
      >
        {pending ? "투고 중..." : "투고하기"}
      </button>
    </form>
  );
}
