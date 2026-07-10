import { prisma } from "@/lib/prisma";
import { requireRole, ADMIN_ROLES, REVIEW_ROLES } from "@/lib/rbac";
import { notFound } from "next/navigation";
import {
  assignReviewer,
  unassignReviewer,
  updateReviewDueDate,
  setSubmissionUrgent,
} from "@/lib/actions/submissions";
import { formatDate } from "@/lib/date";
import { REVIEW_STATUS_LABELS, RECOMMENDATION_LABELS } from "@/lib/labels";

const DUE_SOON_THRESHOLD_DAYS = 5;

export default async function AssignReviewerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole(ADMIN_ROLES);
  const { id } = await params;

  const submission = await prisma.submission.findUnique({
    where: { id },
    include: {
      assignments: { include: { reviewer: true, review: true }, orderBy: { assignedAt: "asc" } },
      volume: true,
    },
  });
  if (!submission) notFound();

  const now = new Date();
  const defaultPeriodDays = submission.isUrgent ? 7 : 14;
  const defaultDueDate = new Date(now.getTime() + defaultPeriodDays * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
  const currentRoundAssignments = submission.assignments.filter((a) => a.round === submission.round);
  const pastRoundAssignments = submission.assignments.filter((a) => a.round !== submission.round);
  const assignedIds = new Set(currentRoundAssignments.map((a) => a.reviewerId));
  const reviewers = await prisma.user.findMany({
    where: { role: { in: REVIEW_ROLES }, isActive: true, id: { notIn: [...assignedIds] } },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded border border-gray-200 bg-white p-6">
        <p className="text-sm text-gray-500">
          {submission.volume.label} · {submission.round}차 심사
        </p>
        <h1 className="text-xl font-bold text-gray-900">{submission.title}</h1>
        <form
          action={async (formData) => {
            "use server";
            await setSubmissionUrgent(submission.id, formData.get("isUrgent") === "on");
          }}
          className="mt-2 flex items-center gap-2"
        >
          <label className="flex items-center gap-1 text-sm text-gray-700">
            <input type="checkbox" name="isUrgent" defaultChecked={submission.isUrgent} />
            긴급 처리 (심사 기본 마감을 7일로 단축)
          </label>
          <button type="submit" className="text-xs text-gray-700 underline hover:no-underline">
            저장
          </button>
        </form>
      </div>

      {pastRoundAssignments.length > 0 && (
        <div className="rounded border border-gray-200 bg-gray-50 p-6">
          <h2 className="mb-3 text-sm font-semibold text-gray-900">이전 회차 심사 이력</h2>
          <ul className="space-y-2 text-sm text-gray-600">
            {pastRoundAssignments.map((a) => (
              <li key={a.id}>
                {a.round}차 · {a.reviewer.name} -{" "}
                {REVIEW_STATUS_LABELS[a.status] ?? a.status}
                {a.review &&
                  ` (추천의견: ${RECOMMENDATION_LABELS[a.review.recommendation] ?? a.review.recommendation})`}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="rounded border border-gray-200 bg-white p-6">
        <h2 className="mb-3 text-sm font-semibold text-gray-900">배정된 심사위원 ({submission.round}차)</h2>
        <ul className="space-y-3 text-sm">
          {currentRoundAssignments.map((a) => {
            const overdue = a.dueDate && a.status !== "SUBMITTED" && a.dueDate < now;
            const dueSoon =
              a.dueDate &&
              !overdue &&
              a.status !== "SUBMITTED" &&
              a.dueDate.getTime() - now.getTime() < DUE_SOON_THRESHOLD_DAYS * 24 * 60 * 60 * 1000;
            return (
              <li key={a.id} className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-3 last:border-0">
                <span>
                  {a.reviewer.name} ({a.reviewer.affiliation ?? "-"}) -{" "}
                  {REVIEW_STATUS_LABELS[a.status] ?? a.status}
                </span>
                <div className="flex items-center gap-3">
                  <form
                    action={async (formData) => {
                      "use server";
                      await updateReviewDueDate(a.id, String(formData.get("dueDate") ?? ""));
                    }}
                    className="flex items-center gap-1"
                  >
                    <input
                      type="date"
                      name="dueDate"
                      defaultValue={a.dueDate ? a.dueDate.toISOString().slice(0, 10) : ""}
                      className="rounded border border-gray-300 px-2 py-1 text-xs"
                    />
                    <button type="submit" className="text-xs text-gray-700 hover:underline">
                      마감일 저장
                    </button>
                  </form>
                  {a.dueDate && (
                    <span
                      className={`text-xs ${
                        overdue
                          ? "font-medium text-red-600"
                          : dueSoon
                            ? "font-medium text-amber-600"
                            : "text-gray-500"
                      }`}
                    >
                      {overdue ? "마감 초과" : dueSoon ? "마감 임박" : "마감"}: {formatDate(a.dueDate)}
                    </span>
                  )}
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
                </div>
              </li>
            );
          })}
          {currentRoundAssignments.length === 0 && (
            <li className="text-gray-500">아직 배정된 심사위원이 없습니다.</li>
          )}
        </ul>
      </div>

      <div className="rounded border border-gray-200 bg-white p-6">
        <h2 className="mb-3 text-sm font-semibold text-gray-900">심사위원 추가 배정</h2>
        <ul className="space-y-2 text-sm">
          {reviewers.map((r) => (
            <li key={r.id} className="flex items-center justify-between gap-2">
              <span>
                {r.name} ({r.affiliation ?? "-"})
              </span>
              <form
                action={async (formData) => {
                  "use server";
                  const dueDate = String(formData.get("dueDate") ?? "");
                  await assignReviewer(submission.id, r.id, dueDate || undefined);
                }}
                className="flex items-center gap-1"
              >
                <input
                  type="date"
                  name="dueDate"
                  defaultValue={defaultDueDate}
                  className="rounded border border-gray-300 px-2 py-1 text-xs"
                />
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
