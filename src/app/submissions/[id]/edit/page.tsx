import { prisma } from "@/lib/prisma";
import { requireSession, ADMIN_ROLES } from "@/lib/rbac";
import { notFound, redirect } from "next/navigation";
import { MetadataForm } from "./metadata-form";
import { CoauthorEditor } from "../coauthor-editor";
import { RevisionUploadForm } from "../revision-upload-form";
import { CopyrightUploadForm } from "@/components/copyright-upload-form";
import { formatDateTime } from "@/lib/date";
import { SUBMISSION_STATUS_LABELS } from "@/lib/labels";

export default async function EditSubmissionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await requireSession();

  const submission = await prisma.submission.findUnique({
    where: { id },
    include: {
      files: { orderBy: [{ kind: "asc" }, { version: "desc" }] },
      coauthors: { orderBy: { order: "asc" } },
      decisions: { orderBy: { decidedAt: "desc" }, take: 1 },
    },
  });
  if (!submission) notFound();

  const isEditor = ADMIN_ROLES.includes(session.user.role);
  const isOwner = submission.authorId === session.user.id;
  if (!isOwner && !isEditor) {
    redirect("/forbidden");
  }
  if (submission.status !== "REVISION_REQUESTED") {
    redirect(`/submissions/${submission.id}`);
  }

  const latestDecision = submission.decisions[0];

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded border border-gray-200 bg-white p-6">
        <p className="text-sm text-gray-500">
          상태: {SUBMISSION_STATUS_LABELS[submission.status] ?? submission.status} · {submission.round}차
        </p>
        <h1 className="mt-1 text-xl font-bold text-gray-900">투고 내용 수정</h1>
        {latestDecision?.note && (
          <div className="mt-3 rounded border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            <p className="font-medium">편집위원회 의견</p>
            <p className="mt-1 whitespace-pre-wrap">{latestDecision.note}</p>
          </div>
        )}
      </div>

      <div className="rounded border border-gray-200 bg-white p-6">
        <h2 className="mb-3 text-sm font-semibold text-gray-900">제목/초록/키워드/분야</h2>
        <MetadataForm
          submissionId={submission.id}
          title={submission.title}
          abstract={submission.abstract}
          keywords={submission.keywords}
          fields={submission.fields}
        />
      </div>

      <div className="rounded border border-gray-200 bg-white p-6">
        <h2 className="mb-3 text-sm font-semibold text-gray-900">공저자</h2>
        <CoauthorEditor
          submissionId={submission.id}
          initialAuthors={submission.coauthors.map((a) => ({
            userId: a.userId,
            name: a.name,
            email: a.email,
            affiliation: a.affiliation,
            isCorresponding: a.isCorresponding,
          }))}
        />
      </div>

      <div className="rounded border border-gray-200 bg-white p-6">
        <h2 className="mb-3 text-sm font-semibold text-gray-900">기존 첨부 파일</h2>
        <ul className="space-y-1 text-sm">
          {submission.files
            .filter((f) => f.kind !== "COPYRIGHT_ASSIGNMENT" && f.kind !== "FINAL_MANUSCRIPT")
            .map((f) => (
              <li key={f.id}>
                <a href={`/api/files/${f.id}`} className="text-gray-700 hover:underline">
                  v{f.version} - {f.originalName}
                </a>{" "}
                <span className="text-xs text-gray-500">({formatDateTime(f.uploadedAt)})</span>
              </li>
            ))}
        </ul>
        <p className="mt-3 mb-1 text-sm font-medium text-gray-700">
          수정본 제출 (제출 시 재심사가 시작됩니다)
        </p>
        <RevisionUploadForm submissionId={submission.id} />
      </div>

      <div className="rounded border border-gray-200 bg-white p-6">
        <h2 className="mb-1 text-sm font-semibold text-gray-900">저작권 위임서</h2>
        <a
          href="/templates/copyright-transfer-agreement.docx"
          className="mb-3 inline-block text-sm text-gray-700 underline"
        >
          양식 다운로드
        </a>
        <ul className="mb-3 space-y-1 text-sm">
          {submission.files
            .filter((f) => f.kind === "COPYRIGHT_ASSIGNMENT")
            .map((f) => (
              <li key={f.id}>
                <a href={`/api/files/${f.id}`} className="text-gray-700 hover:underline">
                  {f.originalName}
                </a>{" "}
                <span className="text-xs text-gray-500">({formatDateTime(f.uploadedAt)})</span>
              </li>
            ))}
          {submission.files.filter((f) => f.kind === "COPYRIGHT_ASSIGNMENT").length === 0 && (
            <li className="text-gray-500">아직 등록된 저작권 위임서가 없습니다.</li>
          )}
        </ul>
        <CopyrightUploadForm submissionId={submission.id} />
      </div>
    </div>
  );
}
