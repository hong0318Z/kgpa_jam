import { prisma } from "@/lib/prisma";
import { requireRole, REVIEW_ROLES } from "@/lib/rbac";
import { notFound, redirect } from "next/navigation";
import { ReviewForm } from "./review-form";
import { formatDate, formatDateTime } from "@/lib/date";
import { RECOMMENDATION_LABELS } from "@/lib/labels";
import { FileActions } from "@/components/file-actions";

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

  const caseNumber = String(assignment.submission.caseNumber).padStart(4, "0");
  const currentRoundFiles = assignment.submission.files.filter((f) => f.round === assignment.round);
  const latestMainFiles = currentRoundFiles
    .filter((f) => f.kind === "MAIN")
    .sort((a, b) => a.version - b.version);
  const appendixFiles = currentRoundFiles
    .filter((f) => f.kind === "APPENDIX")
    .sort((a, b) => a.version - b.version);
  const similarityFiles = currentRoundFiles.filter((f) => f.kind === "SIMILARITY_REPORT");

  const allRoundCounts: Record<number, number> = {};
  const allAssignments = await prisma.reviewAssignment.findMany({
    where: {
      submissionId: assignment.submissionId,
      round: { lte: assignment.round },
      id: { not: assignment.id },
    },
    include: { review: true },
    orderBy: [{ round: "asc" }, { assignedAt: "asc" }],
  });
  const numberedAllAssignments = allAssignments.map((a) => {
    allRoundCounts[a.round] = (allRoundCounts[a.round] ?? 0) + 1;
    return { ...a, roundIndex: allRoundCounts[a.round] };
  });
  const pastAssignments = numberedAllAssignments.filter((a) => a.round < assignment.round);

  // 이전 회차는 실제로 파일이 새로 올라오지 않은 회차(기존 파일을 그대로 유지한 재투고)도
  // 있을 수 있으므로, 파일이 아니라 심사 배정 기록을 기준으로 이전 회차 목록을 구성한다.
  const pastRounds = Array.from(
    new Set([
      ...assignment.submission.files.filter((f) => f.round < assignment.round).map((f) => f.round),
      ...pastAssignments.map((a) => a.round),
    ]),
  ).sort((a, b) => a - b);

  const pastRoundFiles = new Map(
    pastRounds.map((round) => [
      round,
      {
        main: assignment.submission.files
          .filter((f) => f.round === round && f.kind === "MAIN")
          .sort((a, b) => a.version - b.version),
        appendix: assignment.submission.files
          .filter((f) => f.round === round && f.kind === "APPENDIX")
          .sort((a, b) => a.version - b.version),
        similarity: assignment.submission.files.filter(
          (f) => f.round === round && f.kind === "SIMILARITY_REPORT",
        ),
      },
    ]),
  );

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
        <p className="mt-3 text-xs font-medium text-gray-500">{assignment.round}차심사 파일</p>
        <div className="mt-1 flex flex-col gap-1">
          {latestMainFiles.map((f, i) => (
            <FileActions
              key={f.id}
              fileId={f.id}
              mimeType={f.mimeType}
              label={`심사번호 ${caseNumber} 논문${latestMainFiles.length > 1 ? ` (${i + 1})` : ""}`}
            />
          ))}
          {similarityFiles.map((f) => (
            <FileActions
              key={f.id}
              fileId={f.id}
              mimeType={f.mimeType}
              label={`심사번호 ${caseNumber} 논문유사도 검사내역`}
            />
          ))}
          {appendixFiles.map((f, i) => (
            <FileActions
              key={f.id}
              fileId={f.id}
              mimeType={f.mimeType}
              label={`심사번호 ${caseNumber} 부록 (${i + 1})`}
            />
          ))}
          {latestMainFiles.length === 0 && similarityFiles.length === 0 && appendixFiles.length === 0 && (
            <p className="text-sm text-gray-500">이번 회차에 새로 등록된 파일이 없습니다.</p>
          )}
        </div>
      </div>

      {pastRounds.length > 0 && (
        <div className="flex flex-col gap-3">
          {pastRounds.map((round) => {
            const files = pastRoundFiles.get(round)!;
            const reviewsForRound = pastAssignments.filter((a) => a.round === round);
            return (
              <details key={round} className="rounded border border-gray-200 bg-gray-50 p-6">
                <summary className="cursor-pointer text-sm font-semibold text-gray-900">
                  {round}차심사 내역 (열어서 보기)
                </summary>
                <div className="mt-3 flex flex-col gap-1">
                  {files.main.map((f, i) => (
                    <FileActions
                      key={f.id}
                      fileId={f.id}
                      mimeType={f.mimeType}
                      label={`심사번호 ${caseNumber} 논문${files.main.length > 1 ? ` (${i + 1})` : ""} (${round}차심사)`}
                    />
                  ))}
                  {files.similarity.map((f) => (
                    <FileActions
                      key={f.id}
                      fileId={f.id}
                      mimeType={f.mimeType}
                      label={`심사번호 ${caseNumber} 논문유사도 검사내역 (${round}차심사)`}
                    />
                  ))}
                  {files.appendix.map((f, i) => (
                    <FileActions
                      key={f.id}
                      fileId={f.id}
                      mimeType={f.mimeType}
                      label={`심사번호 ${caseNumber} 부록 (${i + 1}) (${round}차심사)`}
                    />
                  ))}
                  {files.main.length === 0 && files.similarity.length === 0 && files.appendix.length === 0 && (
                    <p className="text-sm text-gray-500">
                      이 회차에 새로 등록된 파일이 없습니다 (이전 회차 파일과 동일).
                    </p>
                  )}
                </div>
                {reviewsForRound.length > 0 && (
                  <ul className="mt-3 space-y-3 border-t border-gray-200 pt-3 text-sm">
                    {reviewsForRound.map((a) => (
                      <li key={a.id} className="border-b border-gray-100 pb-2 last:border-0">
                        <p className="font-medium text-gray-900">
                          {a.round}차 심사위원 {a.roundIndex}
                        </p>
                        {a.review ? (
                          <>
                            <p className="text-gray-700">
                              심사의견:{" "}
                              {RECOMMENDATION_LABELS[a.review.recommendation] ?? a.review.recommendation}
                              {a.review.score != null && ` (점수: ${a.review.score})`}
                            </p>
                            <p className="mt-1 whitespace-pre-wrap text-gray-700">
                              (저자 공개 의견) {a.review.commentsToAuthor}
                            </p>
                            {a.review.commentsToEditor && (
                              <p className="mt-1 whitespace-pre-wrap italic text-gray-500">
                                (편집자 전용 의견) {a.review.commentsToEditor}
                              </p>
                            )}
                          </>
                        ) : (
                          <p className="text-gray-500">심사를 제출하지 않았습니다.</p>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </details>
            );
          })}
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
