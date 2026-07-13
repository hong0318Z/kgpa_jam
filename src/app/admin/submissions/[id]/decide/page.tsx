import { prisma } from "@/lib/prisma";
import { requireRole, ADMIN_ROLES } from "@/lib/rbac";
import { notFound } from "next/navigation";
import Link from "next/link";
import { DecisionForm } from "./decision-form";
import { formatDate, formatDateTime } from "@/lib/date";
import { SUBMISSION_STATUS_LABELS, RECOMMENDATION_LABELS } from "@/lib/labels";

export default async function DecideSubmissionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole(ADMIN_ROLES);
  const { id } = await params;

  const submission = await prisma.submission.findUnique({
    where: { id },
    include: {
      volume: true,
      assignments: { include: { reviewer: true, review: true }, orderBy: { assignedAt: "asc" } },
      decisions: { include: { editor: true }, orderBy: { decidedAt: "desc" } },
    },
  });
  if (!submission) notFound();

  const OUTCOME_BY_RECOMMENDATION: Record<string, "ACCEPTED" | "REVISION_REQUESTED" | "REJECTED"> = {
    ACCEPT: "ACCEPTED",
    MINOR_REVISION: "REVISION_REQUESTED",
    MAJOR_REVISION: "REVISION_REQUESTED",
    REJECT: "REJECTED",
  };

  const currentRoundAssignments = submission.assignments.filter((a) => a.round === submission.round);

  const submittedReviews = currentRoundAssignments
    .map((a) => a.review)
    .filter((r): r is NonNullable<typeof r> => !!r);

  const recommendationTally = new Map<string, number>();
  const outcomeTally: Record<"ACCEPTED" | "REVISION_REQUESTED" | "REJECTED", number> = {
    ACCEPTED: 0,
    REVISION_REQUESTED: 0,
    REJECTED: 0,
  };
  for (const r of submittedReviews) {
    recommendationTally.set(r.recommendation, (recommendationTally.get(r.recommendation) ?? 0) + 1);
    outcomeTally[OUTCOME_BY_RECOMMENDATION[r.recommendation]] += 1;
  }
  const suggestedOutcome =
    submittedReviews.length > 0
      ? (Object.entries(outcomeTally).sort((a, b) => b[1] - a[1])[0][0] as
          | "ACCEPTED"
          | "REVISION_REQUESTED"
          | "REJECTED")
      : null;

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded border border-gray-200 bg-white p-6">
        <p className="text-sm text-gray-500">
          {submission.volume.label} · 공식 모집기간:{" "}
          {formatDate(submission.volume.callStartDate)} ~{" "}
          {formatDate(submission.volume.callEndDate)} · 발간예정일:{" "}
          {formatDate(submission.volume.plannedPublishDate)}
        </p>
        <h1 className="text-xl font-bold text-gray-900">{submission.title}</h1>
        <p className="mt-1 text-sm font-medium text-gray-700">
          현재 상태: {SUBMISSION_STATUS_LABELS[submission.status] ?? submission.status} · {submission.round}차 심사
        </p>
        <Link
          href={`/admin/submissions/${submission.id}/assign`}
          className="mt-2 inline-block text-xs text-gray-500 underline hover:text-gray-800"
        >
          심사위원 배정 현황 관리
        </Link>
      </div>

      <div className="rounded border border-gray-200 bg-white p-6">
        <h2 className="mb-3 text-sm font-semibold text-gray-900">심사 결과 종합 ({submission.round}차)</h2>
        <ul className="space-y-3 text-sm">
          {currentRoundAssignments.map((a, i) => (
            <li key={a.id} className="border-b border-gray-100 pb-2 last:border-0">
              <p className="font-medium text-gray-900">심사위원 {i + 1}</p>
              {a.review ? (
                <>
                  <p className="text-gray-700">
                    심사의견: {RECOMMENDATION_LABELS[a.review.recommendation] ?? a.review.recommendation}{" "}
                    (점수: {a.review.score ?? "-"})
                  </p>
                  <p className="mt-1 whitespace-pre-wrap text-gray-700">
                    {a.review.commentsToAuthor}
                  </p>
                  {a.review.commentsToEditor && (
                    <p className="mt-1 italic text-gray-500">
                      (편집자 전용) {a.review.commentsToEditor}
                    </p>
                  )}
                </>
              ) : (
                <p className="text-gray-500">아직 심사가 제출되지 않았습니다.</p>
              )}
            </li>
          ))}
          {currentRoundAssignments.length === 0 && (
            <li className="text-gray-500">배정된 심사위원이 없습니다.</li>
          )}
        </ul>
      </div>

      <div className="rounded border border-gray-200 bg-white p-6">
        <h2 className="mb-3 text-sm font-semibold text-gray-900">최종 결정</h2>
        {submittedReviews.length > 0 && (
          <p className="mb-3 text-sm text-gray-600">
            제출된 심사 {submittedReviews.length}건 —{" "}
            {[...recommendationTally.entries()]
              .map(([rec, count]) => `${RECOMMENDATION_LABELS[rec] ?? rec} ${count}`)
              .join(" · ")}
            {suggestedOutcome && (
              <>
                {" "}→ 다수의견:{" "}
                <span className="font-semibold text-gray-900">
                  {SUBMISSION_STATUS_LABELS[suggestedOutcome]}
                </span>
              </>
            )}
          </p>
        )}
        <DecisionForm submissionId={submission.id} defaultOutcome={suggestedOutcome ?? undefined} />
      </div>

      <div className="rounded border border-gray-200 bg-white p-6">
        <h2 className="mb-3 text-sm font-semibold text-gray-900">결정 이력</h2>
        <ul className="space-y-1 text-xs text-gray-500">
          {submission.decisions.map((d) => (
            <li key={d.id}>
              {formatDateTime(d.decidedAt)} - {d.editor.name}:{" "}
              {SUBMISSION_STATUS_LABELS[d.outcome] ?? d.outcome}
              {d.note ? ` (${d.note})` : ""}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
