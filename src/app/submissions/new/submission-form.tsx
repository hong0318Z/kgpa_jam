"use client";

import { useActionState, useRef, useState } from "react";
import { createSubmission, resubmitSubmission } from "@/lib/actions/submissions";
import { FileDropzone } from "@/components/file-dropzone";
import { CoauthorPicker } from "@/components/coauthor-picker";
import { ExistingFileList } from "@/components/existing-file-list";
import { formatDate } from "@/lib/date";
import { SUBMISSION_FIELDS } from "@/lib/labels";
import type { CoauthorInput } from "@/lib/actions/submission-authors";

type Volume = {
  id: string;
  label: string;
  callStartDate: Date;
  callEndDate: Date;
  plannedPublishDate: Date;
};

type InitialValues = {
  title: string;
  abstract: string;
  keywords: string[];
  fields: string[];
  coauthors: CoauthorInput[];
};

type ExistingFile = {
  id: string;
  kind: string;
  originalName: string;
  version: number;
  uploadedAt: Date;
  mimeType: string;
};

export function SubmissionForm({
  volumes,
  pledgeAuthorNames,
  mode = "create",
  submissionId,
  initial,
  existingFiles,
}: {
  volumes?: Volume[];
  pledgeAuthorNames?: string;
  mode?: "create" | "resubmit";
  submissionId?: string;
  initial?: InitialValues;
  existingFiles?: ExistingFile[];
}) {
  const action =
    mode === "resubmit" && submissionId
      ? resubmitSubmission.bind(null, submissionId)
      : createSubmission;
  const [state, formAction, pending] = useActionState(action, {});
  const [filesChanged, setFilesChanged] = useState(false);

  const mainFiles = (existingFiles ?? []).filter((f) => f.kind === "MAIN");
  const appendixFiles = (existingFiles ?? []).filter((f) => f.kind === "APPENDIX");
  const similarityFiles = (existingFiles ?? []).filter((f) => f.kind === "SIMILARITY_REPORT");
  const copyrightFiles = (existingFiles ?? []).filter((f) => f.kind === "COPYRIGHT_ASSIGNMENT");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    const fd = new FormData(e.currentTarget);
    const title = String(fd.get("title") ?? "").trim();
    const abstract = String(fd.get("abstract") ?? "").trim();
    const mainFileSelected = fd.getAll("file").some((f) => f instanceof File && f.size > 0);
    const hasExistingMainFile = mainFiles.length > 0;

    const missing: string[] = [];
    if (!title) missing.push("제목을 입력해 주세요.");
    if (!abstract) missing.push("초록을 입력해 주세요.");
    if (!mainFileSelected && !hasExistingMainFile) missing.push("논문 파일을 첨부해 주세요.");

    if (missing.length > 0) {
      e.preventDefault();
      alert(missing.join("\n"));
      return;
    }

    if (mode !== "resubmit") return;
    const keywords = String(fd.get("keywords") ?? "").trim();
    const fields = fd
      .getAll("fields")
      .map((f) => String(f))
      .sort()
      .join(",");
    const response = String(fd.get("response") ?? "").trim();
    const hasNewFiles = ["file", "appendixFile", "similarityCheckFile", "copyrightFile"].some(
      (name) => fd.getAll(name).some((f) => f instanceof File && f.size > 0),
    );

    const initialFields = (initial?.fields ?? []).slice().sort().join(",");
    const changed =
      title !== (initial?.title ?? "") ||
      abstract !== (initial?.abstract ?? "") ||
      keywords !== (initial?.keywords.join(", ") ?? "") ||
      fields !== initialFields ||
      response.length > 0 ||
      hasNewFiles ||
      filesChanged;

    if (!changed) {
      e.preventDefault();
      alert("내용을 수정하세요.");
    }
  };

  return (
    <form action={formAction} onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      {mode === "create" && (
        <>
          <input type="hidden" name="pledgeAuthorNames" value={pledgeAuthorNames ?? ""} />
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">투고 호(Volume)</label>
            <select name="volumeId" required className="w-full rounded border border-gray-300 px-3 py-2 text-sm">
              {(volumes ?? []).map((v) => (
                <option key={v.id} value={v.id}>
                  {v.label} (모집기간: {formatDate(new Date(v.callStartDate))} ~{" "}
                  {formatDate(new Date(v.callEndDate))}, 발간예정:{" "}
                  {formatDate(new Date(v.plannedPublishDate))})
                </option>
              ))}
            </select>
            {(volumes ?? []).length === 0 && (
              <p className="mt-1 text-xs text-red-600">현재 투고 모집중인 호가 없습니다.</p>
            )}
          </div>
        </>
      )}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">제목</label>
        <input
          name="title"
          required
          defaultValue={initial?.title}
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">초록</label>
        <textarea
          name="abstract"
          required
          rows={6}
          defaultValue={initial?.abstract}
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">키워드 (쉼표로 구분)</label>
        <input
          name="keywords"
          defaultValue={initial?.keywords.join(", ")}
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">공저자</label>
        <CoauthorPicker name="coauthors" initialAuthors={initial?.coauthors} />
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
                defaultChecked={initial?.fields.includes(f.value)}
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
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          논문 파일 (본문{mode === "resubmit" ? ", 수정본을 새로 첨부해 주세요" : ""})
        </label>
        {mode === "resubmit" && (
          <ExistingFileList files={mainFiles} onDeleted={() => setFilesChanged(true)} />
        )}
        <FileDropzone
          name="file"
          accept=".pdf,.hwp,.docx"
          required={mode === "create"}
          multiple
          hint="PDF, HWP, DOCX 파일만 업로드할 수 있습니다. (파일당 최대 20MB)"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          부록 파일 (선택, 표/그림/데이터 등 본문과 별도로 첨부)
        </label>
        {mode === "resubmit" && (
          <ExistingFileList files={appendixFiles} onDeleted={() => setFilesChanged(true)} />
        )}
        <FileDropzone
          name="appendixFile"
          accept=".pdf,.hwp,.docx"
          multiple
          hint="PDF, HWP, DOCX 파일만 업로드할 수 있습니다. (파일당 최대 20MB)"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          논문유사도검사결과 (선택, KCI 등에서 발급받은 결과서)
        </label>
        {mode === "resubmit" && (
          <ExistingFileList files={similarityFiles} onDeleted={() => setFilesChanged(true)} />
        )}
        <FileDropzone
          name="similarityCheckFile"
          accept=".pdf,.hwp,.docx"
          hint="PDF, HWP, DOCX 파일만 업로드할 수 있습니다. (최대 20MB)"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">저작권 위임서 (선택)</label>
        <p className="mb-2 text-xs text-gray-500">
          게재 확정 전까지 제출하시면 되며, 지금 바로 첨부하셔도 됩니다.
        </p>
        <a
          href="/templates/copyright-transfer-agreement.docx"
          className="mb-3 inline-flex items-center gap-2 rounded border-2 border-gray-900 bg-white px-4 py-2.5 text-sm font-semibold text-gray-900 hover:bg-gray-900 hover:text-white"
        >
          저작권 이양 및 연구윤리 준수 동의서 양식 다운로드
        </a>
        {mode === "resubmit" && (
          <ExistingFileList files={copyrightFiles} onDeleted={() => setFilesChanged(true)} />
        )}
        <FileDropzone
          name="copyrightFile"
          accept=".pdf,.hwp,.docx"
          hint="PDF, HWP, DOCX 파일만 업로드할 수 있습니다. (최대 20MB)"
        />
      </div>
      {mode === "resubmit" && (
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            심사위원께 드리는 답변 (수정 사항 요약)
          </label>
          <textarea
            name="response"
            rows={5}
            placeholder="심사 의견에 대한 수정 사항을 요약해 주세요."
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
      )}
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button
        type="submit"
        disabled={pending || (mode === "create" && (volumes ?? []).length === 0)}
        className="w-fit rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
      >
        {pending ? "제출 중..." : mode === "resubmit" ? "재투고하기" : "투고하기"}
      </button>
    </form>
  );
}
