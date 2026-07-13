import { prisma } from "@/lib/prisma";
import { requireRole, REVIEW_ROLES } from "@/lib/rbac";
import { notFound, redirect } from "next/navigation";
import { ReviewForm } from "./review-form";
import { formatDate, formatDateTime } from "@/lib/date";
import { RECOMMENDATION_LABELS } from "@/lib/labels";

const DUE_SOON_THRESHOLD_DAYS = 5;

export default async function ReviewDetailPage({
  params,
}: {
  params: Promise<{ assignmentId: string }>;
}) {
  const { assignmentId } = await params;
  const session = await requireRole(REVIEW_ROLES);

  const assignment = await prisma.reviewAssignment.findUnique({
    where: { id: assignmentId },
    include: {
      submission: {
        include: {
          volume: true,
          files: { orderBy: { version: "desc" } },
          authorResponses: { orderBy: { createdAt: "asc" } },
        },
      },
      review: true,
    },
  });
  if (!assignment) notFound();
  if (assignment.reviewerId !== session.user.id) {
    redirect("/forbidden");
  }

  const latestVersion = assignment.submission.files[0]?.version;
  const latestFiles = assignment.submission.files.filter((f) => f.version === latestVersion);

  const pastAssignments = await prisma.reviewAssignment.findMany({
    where: {
      submissionId: assignment.submissionId,
      reviewerId: session.user.id,
      id: { not: assignment.id },
    },
    include: { review: true },
    orderBy: { round: "asc" },
  });

  const now = new Date();
  const overdue = !!assignment.dueDate && assignment.status !== "SUBMITTED" && assignment.dueDate < now;
  const dueSoon =
    !!assignment.dueDate &&
    !overdue &&
    assignment.status !== "SUBMITTED" &&
    assignment.dueDate.getTime() - now.getTime() < DUE_SOON_THRESHOLD_DAYS * 24 * 60 * 60 * 1000;

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded border border-gray-200 bg-white p-6">
        <p className="text-sm text-gray-500">
          {assignment.submission.volume.label} · 공식 모집기간:{" "}
          {formatDate(assignment.submission.volume.callStartDate)} ~{" "}
          {formatDate(assignment.submission.volume.callEndDate)} · 발간예정일:{" "}
          {formatDate(assignment.submission.volume.plannedPublishDate)}
        </p>
        <h1 className="mt-1 text-xl font-bold text-gray-900">
          {assignment.submission.title} ({assignment.round}차 심사)
        </h1>
        {assignment.dueDate && (
          <p
            className={`mt-1 text-sm font-medium ${
              overdue ? "text-red-600" : dueSoon ? "text-amber-600" : "text-gray-700"
            }`}
          >
            심사 마감일: {formatDate(assignment.dueDate)}
            {overdue ? " (마감 초과)" : dueSoon ? " (마감 임박)" : ""}
          </p>
        )}
        <p className="mt-2 whitespace-pre-wrap text-sm text-gray-800">
          {assignment.submission.abstract}
        </p>
        {latestFiles.length > 0 && (
          <div className="mt-3 flex flex-col gap-1">
            {latestFiles.map((f, i) => (
              <a
                key={f.id}
                href={`/api/files/${f.id}`}
                className="inline-block text-sm text-gray-700 underline"
              >
                논문 파일 {latestFiles.length > 1 ? `${i + 1} ` : ""}다운로드 (v{f.version})
              </a>
            ))}
          </div>
        )}
      </div>

      {pastAssignments.length > 0 && (
        <div className="rounded border border-gray-200 bg-gray-50 p-6">
          <h2 className="mb-3 text-sm font-semibold text-gray-900">이전 심사 내역</h2>
          <ul className="space-y-3 text-sm">
            {pastAssignments.map((a) => (
              <li key={a.id} className="border-b border-gray-100 pb-2 last:border-0">
                <p className="font-medium text-gray-900">{a.round}차</p>
                {a.review ? (
                  <>
                    <p className="text-gray-700">
                      심사의견: {RECOMMENDATION_LABELS[a.review.recommendation] ?? a.review.recommendation}
                      {a.review.score != null && ` (점수: ${a.review.score})`}
                    </p>
                    <p className="mt-1 whitespace-pre-wrap text-gray-700">{a.review.commentsToAuthor}</p>
                  </>
                ) : (
                  <p className="text-gray-500">심사를 제출하지 않았습니다.</p>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {assignment.submission.authorResponses.length > 0 && (
        <div className="rounded border border-gray-200 bg-white p-6">
          <h2 className="mb-3 text-sm font-semibold text-gray-900">저자 답변</h2>
          <ul className="space-y-3 text-sm">
            {assignment.submission.authorResponses.map((r) => (
              <li key={r.id} className="border-b border-gray-100 pb-2 last:border-0">
                <p className="text-xs text-gray-500">{formatDateTime(r.createdAt)}</p>
                <p className="mt-1 whitespace-pre-wrap text-gray-800">{r.content}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="rounded border border-gray-200 bg-white p-6">
        <h2 className="mb-3 text-sm font-semibold text-gray-900">심사 평가</h2>
        <ReviewForm
          assignmentId={assignment.id}
          submitted={assignment.status === "SUBMITTED"}
          initial={
            assignment.review
              ? {
                  score: assignment.review.score,
                  commentsToAuthor: assignment.review.commentsToAuthor,
                  commentsToEditor: assignment.review.commentsToEditor,
                  recommendation: assignment.review.recommendation,
                }
              : null
          }
        />
      </div>
    </div>
  );
}
