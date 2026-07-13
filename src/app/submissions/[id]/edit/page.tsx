import { prisma } from "@/lib/prisma";
import { requireSession, ADMIN_ROLES } from "@/lib/rbac";
import { notFound, redirect } from "next/navigation";
import { SubmissionForm } from "@/app/submissions/new/submission-form";
import { formatDateTime } from "@/lib/date";
import { SUBMISSION_FIELD_LABELS } from "@/lib/labels";

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
      coauthors: { orderBy: { order: "asc" } },
      revisionSnapshots: { orderBy: { round: "asc" } },
      files: { orderBy: { version: "asc" } },
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

  const latestDecisionNote = submission.decisions[0]?.note;

  return (
    <div className="w-full">
      <div className="mb-4 rounded border border-gray-200 bg-white p-6">
        <p className="text-sm text-gray-500">심사번호 {String(submission.caseNumber).padStart(4, "0")}</p>
        <h1 className="mt-1 text-xl font-bold text-gray-900">투고 내용 수정</h1>
        {latestDecisionNote && (
          <div className="mt-3 rounded border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            <p className="font-medium">편집위원회 의견</p>
            <p className="mt-1 whitespace-pre-wrap">{latestDecisionNote}</p>
          </div>
        )}
      </div>

      {submission.revisionSnapshots.length > 0 && (
        <div className="mb-4 flex flex-col gap-2">
          {submission.revisionSnapshots.map((s) => (
            <details key={s.id} className="rounded border border-gray-200 bg-gray-50 p-4">
              <summary className="cursor-pointer text-sm font-semibold text-gray-900">
                {s.round}차 투고 내역 (열어서 보기)
              </summary>
              <div className="mt-3 space-y-2 text-sm">
                <p>
                  <span className="font-medium text-gray-700">제목: </span>
                  {s.title}
                </p>
                <p>
                  <span className="font-medium text-gray-700">초록: </span>
                  <span className="whitespace-pre-wrap">{s.abstract}</span>
                </p>
                <p>
                  <span className="font-medium text-gray-700">키워드: </span>
                  {s.keywords.join(", ")}
                </p>
                {s.fields.length > 0 && (
                  <p>
                    <span className="font-medium text-gray-700">분야: </span>
                    {s.fields.map((f) => SUBMISSION_FIELD_LABELS[f] ?? f).join(", ")}
                  </p>
                )}
                {s.decisionNote && (
                  <p className="rounded border border-amber-200 bg-amber-50 p-2 text-amber-800">
                    편집위원회 의견: {s.decisionNote}
                  </p>
                )}
                <p className="text-xs text-gray-500">저장 시각: {formatDateTime(s.createdAt)}</p>
              </div>
            </details>
          ))}
        </div>
      )}

      <div className="rounded border border-gray-200 bg-white p-6">
        <h2 className="mb-3 text-sm font-semibold text-gray-900">
          {submission.round}차 투고 내용 (재투고 시 {submission.round + 1}차로 심사가 진행됩니다)
        </h2>
        <SubmissionForm
          mode="resubmit"
          submissionId={submission.id}
          initial={{
            title: submission.title,
            abstract: submission.abstract,
            keywords: submission.keywords,
            fields: submission.fields,
            coauthors: submission.coauthors.map((a) => ({
              userId: a.userId,
              name: a.name,
              email: a.email,
              affiliation: a.affiliation,
              isCorresponding: a.isCorresponding,
            })),
          }}
          existingFiles={submission.files.map((f) => ({
            id: f.id,
            kind: f.kind,
            originalName: f.originalName,
            version: f.version,
            uploadedAt: f.uploadedAt,
          }))}
        />
      </div>
    </div>
  );
}
