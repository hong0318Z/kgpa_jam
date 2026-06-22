import { prisma } from "@/lib/prisma";
import { requireRole, ForbiddenError } from "@/lib/rbac";
import { notFound } from "next/navigation";
import { ReviewForm } from "./review-form";

export default async function ReviewDetailPage({
  params,
}: {
  params: Promise<{ assignmentId: string }>;
}) {
  const { assignmentId } = await params;
  const session = await requireRole(["REVIEWER"]);

  const assignment = await prisma.reviewAssignment.findUnique({
    where: { id: assignmentId },
    include: {
      submission: { include: { volume: true, files: { orderBy: { version: "desc" }, take: 1 } } },
      review: true,
    },
  });
  if (!assignment) notFound();
  if (assignment.reviewerId !== session.user.id) {
    throw new ForbiddenError("배정된 심사위원만 조회할 수 있습니다.");
  }

  const latestFile = assignment.submission.files[0];

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded border border-gray-200 bg-white p-6">
        <p className="text-sm text-gray-500">
          {assignment.submission.volume.label} · 공식 모집기간:{" "}
          {assignment.submission.volume.callStartDate.toLocaleDateString("ko-KR")} ~{" "}
          {assignment.submission.volume.callEndDate.toLocaleDateString("ko-KR")} · 발간예정일:{" "}
          {assignment.submission.volume.plannedPublishDate.toLocaleDateString("ko-KR")}
        </p>
        <h1 className="mt-1 text-xl font-bold text-gray-900">{assignment.submission.title}</h1>
        <p className="mt-2 whitespace-pre-wrap text-sm text-gray-800">
          {assignment.submission.abstract}
        </p>
        {latestFile && (
          <a
            href={`/api/files/${latestFile.id}`}
            className="mt-3 inline-block text-sm text-gray-700 underline"
          >
            논문 파일 다운로드 (v{latestFile.version})
          </a>
        )}
      </div>

      <div className="rounded border border-gray-200 bg-white p-6">
        <h2 className="mb-3 text-sm font-semibold text-gray-900">심사 평가</h2>
        <ReviewForm
          assignmentId={assignment.id}
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
