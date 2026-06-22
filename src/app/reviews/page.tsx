import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";

export default async function ReviewsPage() {
  const session = await requireRole(["REVIEWER"]);
  const assignments = await prisma.reviewAssignment.findMany({
    where: { reviewerId: session.user.id },
    include: { submission: { include: { volume: true } }, review: true },
    orderBy: { assignedAt: "desc" },
  });

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold text-gray-900">내 심사 목록</h1>
      <ul className="divide-y divide-gray-200 rounded border border-gray-200 bg-white">
        {assignments.map((a) => (
          <li key={a.id} className="px-4 py-3">
            <Link href={`/reviews/${a.id}`} className="font-medium text-gray-900 hover:underline">
              {a.submission.title}
            </Link>
            <p className="mt-1 text-xs text-gray-500">
              {a.submission.volume.label} · 모집기간:{" "}
              {a.submission.volume.callStartDate.toLocaleDateString("ko-KR")} ~{" "}
              {a.submission.volume.callEndDate.toLocaleDateString("ko-KR")} · 상태: {a.status}
            </p>
          </li>
        ))}
        {assignments.length === 0 && (
          <li className="px-4 py-3 text-sm text-gray-500">배정된 심사가 없습니다.</li>
        )}
      </ul>
    </div>
  );
}
