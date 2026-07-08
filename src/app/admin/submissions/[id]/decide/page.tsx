import { prisma } from "@/lib/prisma";
import { requireRole, ADMIN_ROLES } from "@/lib/rbac";
import { notFound } from "next/navigation";
import { DecisionForm } from "./decision-form";

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

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded border border-gray-200 bg-white p-6">
        <p className="text-sm text-gray-500">
          {submission.volume.label} · 공식 모집기간:{" "}
          {submission.volume.callStartDate.toLocaleDateString("ko-KR")} ~{" "}
          {submission.volume.callEndDate.toLocaleDateString("ko-KR")} · 발간예정일:{" "}
          {submission.volume.plannedPublishDate.toLocaleDateString("ko-KR")}
        </p>
        <h1 className="text-xl font-bold text-gray-900">{submission.title}</h1>
        <p className="mt-1 text-sm font-medium text-gray-700">현재 상태: {submission.status}</p>
      </div>

      <div className="rounded border border-gray-200 bg-white p-6">
        <h2 className="mb-3 text-sm font-semibold text-gray-900">심사 결과 종합</h2>
        <ul className="space-y-3 text-sm">
          {submission.assignments.map((a, i) => (
            <li key={a.id} className="border-b border-gray-100 pb-2 last:border-0">
              <p className="font-medium text-gray-900">심사위원 {i + 1}</p>
              {a.review ? (
                <>
                  <p className="text-gray-700">
                    추천의견: {a.review.recommendation} (점수: {a.review.score ?? "-"})
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
          {submission.assignments.length === 0 && (
            <li className="text-gray-500">배정된 심사위원이 없습니다.</li>
          )}
        </ul>
      </div>

      <div className="rounded border border-gray-200 bg-white p-6">
        <h2 className="mb-3 text-sm font-semibold text-gray-900">최종 결정</h2>
        <DecisionForm submissionId={submission.id} />
      </div>

      <div className="rounded border border-gray-200 bg-white p-6">
        <h2 className="mb-3 text-sm font-semibold text-gray-900">결정 이력</h2>
        <ul className="space-y-1 text-xs text-gray-500">
          {submission.decisions.map((d) => (
            <li key={d.id}>
              {d.decidedAt.toLocaleString("ko-KR")} - {d.editor.name}: {d.outcome}
              {d.note ? ` (${d.note})` : ""}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
