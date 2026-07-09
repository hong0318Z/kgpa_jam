import { prisma } from "@/lib/prisma";
import { requireRole, ADMIN_ROLES } from "@/lib/rbac";
import { notFound } from "next/navigation";
import { assignReviewer, unassignReviewer } from "@/lib/actions/submissions";

export default async function AssignReviewerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole(ADMIN_ROLES);
  const { id } = await params;

  const submission = await prisma.submission.findUnique({
    where: { id },
    include: { assignments: { include: { reviewer: true, review: true } }, volume: true },
  });
  if (!submission) notFound();

  const assignedIds = new Set(submission.assignments.map((a) => a.reviewerId));
  const reviewers = await prisma.user.findMany({
    where: { role: "REVIEWER", isActive: true, id: { notIn: [...assignedIds] } },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded border border-gray-200 bg-white p-6">
        <p className="text-sm text-gray-500">{submission.volume.label}</p>
        <h1 className="text-xl font-bold text-gray-900">{submission.title}</h1>
      </div>

      <div className="rounded border border-gray-200 bg-white p-6">
        <h2 className="mb-3 text-sm font-semibold text-gray-900">배정된 심사위원</h2>
        <ul className="space-y-2 text-sm">
          {submission.assignments.map((a) => (
            <li key={a.id} className="flex items-center justify-between">
              <span>
                {a.reviewer.name} ({a.reviewer.affiliation ?? "-"}) - {a.status}
              </span>
              <form
                action={async () => {
                  "use server";
                  await unassignReviewer(a.id);
                }}
              >
                <button type="submit" className="text-xs text-red-600 hover:underline">
                  배정 해제
                </button>
              </form>
            </li>
          ))}
          {submission.assignments.length === 0 && (
            <li className="text-gray-500">아직 배정된 심사위원이 없습니다.</li>
          )}
        </ul>
      </div>

      <div className="rounded border border-gray-200 bg-white p-6">
        <h2 className="mb-3 text-sm font-semibold text-gray-900">심사위원 추가 배정</h2>
        <ul className="space-y-2 text-sm">
          {reviewers.map((r) => (
            <li key={r.id} className="flex items-center justify-between">
              <span>
                {r.name} ({r.affiliation ?? "-"})
              </span>
              <form
                action={async () => {
                  "use server";
                  await assignReviewer(submission.id, r.id);
                }}
              >
                <button type="submit" className="text-xs text-gray-700 hover:underline">
                  배정
                </button>
              </form>
            </li>
          ))}
          {reviewers.length === 0 && (
            <li className="text-gray-500">배정 가능한 심사위원이 없습니다.</li>
          )}
        </ul>
      </div>
    </div>
  );
}
