import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireRole, REVIEW_ROLES } from "@/lib/rbac";
import { formatDate } from "@/lib/date";
import { REVIEW_STATUS_LABELS } from "@/lib/labels";

export default async function ReviewsPage() {
  const session = await requireRole(REVIEW_ROLES);
  const assignments = await prisma.reviewAssignment.findMany({
    where: { reviewerId: session.user.id },
    include: { submission: { include: { volume: true } }, review: true },
    orderBy: { assignedAt: "desc" },
  });

  const now = new Date();

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold text-gray-900">내 심사 목록</h1>
      <ul className="divide-y divide-gray-200 rounded border border-gray-200 bg-white">
        {assignments.map((a) => {
          const overdue = a.dueDate && a.status !== "SUBMITTED" && a.dueDate < now;
          const dueSoon =
            a.dueDate &&
            !overdue &&
            a.status !== "SUBMITTED" &&
            a.dueDate.getTime() - now.getTime() < 3 * 24 * 60 * 60 * 1000;
          return (
            <li key={a.id} className="px-4 py-3">
              <Link href={`/reviews/${a.id}`} className="font-medium text-gray-900 hover:underline">
                {a.submission.title}
              </Link>
              <p className="mt-1 text-xs text-gray-500">
                {a.submission.volume.label} · 모집기간:{" "}
                {formatDate(a.submission.volume.callStartDate)} ~{" "}
                {formatDate(a.submission.volume.callEndDate)} · 상태:{" "}
                {REVIEW_STATUS_LABELS[a.status] ?? a.status}
                {a.dueDate && (
                  <>
                    {" · "}
                    <span
                      className={
                        overdue
                          ? "font-medium text-red-600"
                          : dueSoon
                            ? "font-medium text-amber-600"
                            : ""
                      }
                    >
                      마감일: {formatDate(a.dueDate)}
                      {overdue ? " (마감 초과)" : dueSoon ? " (마감 임박)" : ""}
                    </span>
                  </>
                )}
              </p>
            </li>
          );
        })}
        {assignments.length === 0 && (
          <li className="px-4 py-3 text-sm text-gray-500">배정된 심사가 없습니다.</li>
        )}
      </ul>
    </div>
  );
}
