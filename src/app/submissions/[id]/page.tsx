import { prisma } from "@/lib/prisma";
import { requireSession, ADMIN_ROLES } from "@/lib/rbac";
import { notFound, redirect } from "next/navigation";
import { CoauthorEditor } from "./coauthor-editor";
import { ReviewResultsModal } from "./review-results-modal";
import { FinalManuscriptForm } from "./final-manuscript-form";
import { formatDate, formatDateTime } from "@/lib/date";
import {
  SUBMISSION_STATUS_LABELS,
  REVIEW_STATUS_LABELS,
  RECOMMENDATION_LABELS,
  SUBMISSION_FIELD_LABELS,
} from "@/lib/labels";

export default async function SubmissionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await requireSession();

  const submission = await prisma.submission.findUnique({
    where: { id },
    include: {
      volume: true,
      files: { orderBy: { version: "desc" } },
      decisions: { orderBy: { decidedAt: "desc" } },
      statusLogs: { orderBy: { changedAt: "desc" } },
      assignments: {
        include: { review: true, reviewer: true },
        orderBy: { assignedAt: "asc" },
      },
      coauthors: { orderBy: { order: "asc" } },
      authorResponses: { orderBy: { createdAt: "asc" } },
    },
  });
  if (!submission) notFound();

  const isEditor = ADMIN_ROLES.includes(session.user.role);
  const isOwner = submission.authorId === session.user.id;
  const isAssignedReviewer = submission.assignments.some(
    (a) => a.reviewerId === session.user.id,
  );

  if (!isEditor && !isOwner && !isAssignedReviewer) {
    redirect("/forbidden");
  }

  const roundCounts: Record<number, number> = {};
  const numberedAssignments = submission.assignments.map((a) => {
    roundCounts[a.round] = (roundCounts[a.round] ?? 0) + 1;
    return { ...a, roundIndex: roundCounts[a.round] };
  });

  // 저자/심사위원에게는 해당 회차의 최종 결정이 나오기 전까지 심사 의견을 숨긴다.
  // 이미 지나간 회차(재투고로 다음 회차가 시작된 경우)는 이미 결정이 난 것이므로 공개한다.
  const visibleReviewAssignments = numberedAssignments.filter(
    (a) => a.round < submission.round || submission.status !== "UNDER_REVIEW",
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded border border-gray-200 bg-white p-6">
        <p className="text-sm text-gray-500">
          {submission.volume.label} · 모집기간:{" "}
          {formatDate(submission.volume.callStartDate)} ~{" "}
          {formatDate(submission.volume.callEndDate)} · 발간예정일:{" "}
          {formatDate(submission.volume.plannedPublishDate)}
        </p>
        <h1 className="mt-1 text-xl font-bold text-gray-900">{submission.title}</h1>
        <p className="mt-1 text-sm font-medium text-gray-700">
          상태: {SUBMISSION_STATUS_LABELS[submission.status] ?? submission.status}
          {submission.round > 1 && ` · ${submission.round}차 심사`}
        </p>
        <p className="mt-4 whitespace-pre-wrap text-sm text-gray-800">{submission.abstract}</p>
        <p className="mt-2 text-xs text-gray-500">키워드: {submission.keywords.join(", ")}</p>
        {submission.fields.length > 0 && (
          <p className="mt-1 text-xs text-gray-500">
            분야: {submission.fields.map((f) => SUBMISSION_FIELD_LABELS[f] ?? f).join(", ")}
          </p>
        )}
        {submission.coauthors.length > 0 && (
          <p className="mt-2 text-xs text-gray-500">
            공저자:{" "}
            {submission.coauthors
              .map((a) => `${a.name}${a.isCorresponding ? " (교신저자)" : ""}`)
              .join(", ")}
          </p>
        )}
        {isEditor && submission.pledgeAuthorNames && (
          <p className="mt-2 text-xs text-gray-500">
            연구윤리서약 저자명: {submission.pledgeAuthorNames}
          </p>
        )}
        {(isOwner || isEditor) && (
          <div className="mt-3">
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
        )}
      </div>

      {(isOwner || isEditor) && submission.status === "ACCEPTED" && (
        <div className="rounded border border-gray-200 bg-white p-6">
          <h2 className="mb-1 text-sm font-semibold text-gray-900">최종 원고 제출</h2>
          <p className="mb-3 text-xs text-gray-500">
            게재가 확정되었습니다. 저자명·소속 등 개인정보가 포함된 최종 원고 파일을 제출해 주세요.
          </p>
          <ul className="mb-3 space-y-1 text-sm">
            {submission.files
              .filter((f) => f.kind === "FINAL_MANUSCRIPT")
              .map((f) => (
                <li key={f.id}>
                  <a href={`/api/files/${f.id}`} className="text-gray-700 hover:underline">
                    {f.originalName}
                  </a>{" "}
                  <span className="text-xs text-gray-500">({formatDateTime(f.uploadedAt)})</span>
                </li>
              ))}
          </ul>
          {isOwner && <FinalManuscriptForm submissionId={submission.id} />}
        </div>
      )}

      {isEditor && (
        <div className="rounded border border-gray-200 bg-white p-6">
          <h2 className="mb-3 text-sm font-semibold text-gray-900">심사 현황</h2>
          <ul className="space-y-3 text-sm">
            {numberedAssignments.map((a) => (
              <li key={a.id} className="border-b border-gray-100 pb-2 last:border-0">
                <p className="font-medium text-gray-900">{a.round}차 심사위원 {a.roundIndex}</p>
                <p className="text-xs text-gray-500">
                  상태: {REVIEW_STATUS_LABELS[a.status] ?? a.status}
                </p>
                {a.review && (
                  <div className="mt-1 text-gray-700">
                    <p>
                      심사의견: {RECOMMENDATION_LABELS[a.review.recommendation] ?? a.review.recommendation}{" "}
                      (점수: {a.review.score ?? "-"})
                    </p>
                    <p className="mt-1 whitespace-pre-wrap">{a.review.commentsToAuthor}</p>
                    {a.review.commentsToEditor && (
                      <p className="mt-1 italic text-gray-500">
                        (편집자 전용) {a.review.commentsToEditor}
                      </p>
                    )}
                  </div>
                )}
              </li>
            ))}
            {submission.assignments.length === 0 && (
              <li className="text-gray-500">배정된 심사위원이 없습니다.</li>
            )}
          </ul>
        </div>
      )}

      {!isEditor && (
        <div className="rounded border border-gray-200 bg-white p-6">
          <h2 className="mb-3 text-sm font-semibold text-gray-900">심사 의견</h2>
          {submission.status === "UNDER_REVIEW" ? (
            <p className="text-sm text-gray-500">
              심사가 진행 중입니다. 최종 결과가 나오면 심사 의견을 확인하실 수 있습니다.
            </p>
          ) : (
            <>
              <ReviewResultsModal
                results={visibleReviewAssignments
                  .filter((a) => a.review)
                  .map((a) => ({
                    id: a.id,
                    round: a.round,
                    roundIndex: a.roundIndex,
                    recommendationLabel:
                      RECOMMENDATION_LABELS[a.review!.recommendation] ?? a.review!.recommendation,
                    commentsToAuthor: a.review!.commentsToAuthor,
                  }))}
                editHref={
                  isOwner && submission.status === "REVISION_REQUESTED"
                    ? `/submissions/${submission.id}/edit`
                    : undefined
                }
              />
              {isOwner && submission.status === "REVISION_REQUESTED" && (
                <p className="mt-2 text-xs text-gray-500">
                  심사 결과 및 의견을 확인하시면 투고 내용 수정하기 버튼이 활성화됩니다.
                </p>
              )}
            </>
          )}
        </div>
      )}

      {(isOwner || isEditor) && submission.authorResponses.length > 0 && (
        <div className="rounded border border-gray-200 bg-white p-6">
          <h2 className="mb-3 text-sm font-semibold text-gray-900">저자 답변</h2>
          <ul className="space-y-3 text-sm">
            {submission.authorResponses.map((r) => (
              <li key={r.id} className="border-b border-gray-100 pb-2 last:border-0">
                <p className="text-xs text-gray-500">{formatDateTime(r.createdAt)}</p>
                <p className="mt-1 whitespace-pre-wrap text-gray-800">{r.content}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="rounded border border-gray-200 bg-white p-6">
        <h2 className="mb-3 text-sm font-semibold text-gray-900">첨부 파일</h2>
        <ul className="space-y-1 text-sm">
          {submission.files
            .filter((f) => f.kind === "MAIN")
            .map((f) => (
              <li key={f.id}>
                <a href={`/api/files/${f.id}`} className="text-gray-700 hover:underline">
                  v{f.version} - {f.originalName}
                </a>{" "}
                <span className="text-xs text-gray-500">
                  ({formatDateTime(f.uploadedAt)})
                </span>
              </li>
            ))}
        </ul>
      </div>

      {submission.files.some((f) => f.kind === "APPENDIX") && (
        <div className="rounded border border-gray-200 bg-white p-6">
          <h2 className="mb-3 text-sm font-semibold text-gray-900">부록 파일</h2>
          <ul className="space-y-1 text-sm">
            {submission.files
              .filter((f) => f.kind === "APPENDIX")
              .sort((a, b) => a.version - b.version)
              .map((f, i) => (
                <li key={f.id}>
                  <a href={`/api/files/${f.id}`} className="text-gray-700 hover:underline">
                    부록 ({i + 1}) - {f.originalName}
                  </a>{" "}
                  <span className="text-xs text-gray-500">({formatDateTime(f.uploadedAt)})</span>
                </li>
              ))}
          </ul>
        </div>
      )}

      {submission.files.some((f) => f.kind === "SIMILARITY_REPORT") && (
        <div className="rounded border border-gray-200 bg-white p-6">
          <h2 className="mb-3 text-sm font-semibold text-gray-900">논문유사도검사결과</h2>
          <ul className="space-y-1 text-sm">
            {submission.files
              .filter((f) => f.kind === "SIMILARITY_REPORT")
              .map((f) => (
                <li key={f.id}>
                  <a href={`/api/files/${f.id}`} className="text-gray-700 hover:underline">
                    {f.originalName}
                  </a>{" "}
                  <span className="text-xs text-gray-500">({formatDateTime(f.uploadedAt)})</span>
                </li>
              ))}
          </ul>
        </div>
      )}

      <div className="rounded border border-gray-200 bg-white p-6">
        <h2 className="mb-3 text-sm font-semibold text-gray-900">처리 이력</h2>
        <ul className="space-y-1 text-xs text-gray-500">
          {submission.statusLogs.map((log) => (
            <li key={log.id}>
              {formatDateTime(log.changedAt)} —{" "}
              {log.fromStatus ? SUBMISSION_STATUS_LABELS[log.fromStatus] ?? log.fromStatus : "(신규)"}{" "}
              → {SUBMISSION_STATUS_LABELS[log.toStatus] ?? log.toStatus}
              {log.note ? ` (${log.note})` : ""}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
