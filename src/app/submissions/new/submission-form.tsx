"use client";

import { useActionState } from "react";
import { createSubmission } from "@/lib/actions/submissions";
import { FileDropzone } from "@/components/file-dropzone";
import { CoauthorPicker } from "@/components/coauthor-picker";
import { formatDate } from "@/lib/date";
import { SUBMISSION_FIELDS } from "@/lib/labels";

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
              {v.label} (모집기간: {formatDate(new Date(v.callStartDate))} ~{" "}
              {formatDate(new Date(v.callEndDate))}, 발간예정:{" "}
              {formatDate(new Date(v.plannedPublishDate))})
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
        <label className="mb-2 block text-sm font-medium text-gray-700">분야 (해당하는 항목 모두 선택)</label>
        <div className="flex flex-col gap-2">
          {SUBMISSION_FIELDS.map((f) => (
            <label key={f.value} className="flex items-start gap-2 text-sm text-gray-700">
              <input type="checkbox" name="fields" value={f.value} className="mt-1" />
              <span>
                <span className="font-medium text-gray-900">{f.label}</span>
                <span className="block text-xs text-gray-500">{f.description}</span>
              </span>
            </label>
          ))}
        </div>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          논문 파일 (본문, 부록자료 등 여러 개 첨부 가능)
        </label>
        <FileDropzone
          name="file"
          accept=".pdf,.hwp,.docx"
          required
          multiple
          hint="PDF, HWP, DOCX 파일만 업로드할 수 있습니다. (파일당 최대 20MB)"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          논문유사도검사결과 (선택, KCI 등에서 발급받은 결과서)
        </label>
        <FileDropzone
          name="similarityCheckFile"
          accept=".pdf,.hwp,.docx"
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
