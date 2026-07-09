import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireRole, ADMIN_ROLES } from "@/lib/rbac";
import { formatDateTime } from "@/lib/date";

const STATUS_LABEL: Record<string, string> = {
  SUBMITTED: "투고완료",
  UNDER_REVIEW: "심사중",
  REVISION_REQUESTED: "수정요청",
  ACCEPTED: "게재승인",
  REJECTED: "반려",
  WITHDRAWN: "철회",
};

export default async function SubmissionsPage() {
  const session = await requireRole(["AUTHOR", ...ADMIN_ROLES]);
  const submissions = await prisma.submission.findMany({
    where: { authorId: session.user.id },
    include: { volume: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">내 투고 목록</h1>
        <Link
          href="/submissions/new"
          className="rounded bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-700"
        >
          새 논문 투고
        </Link>
      </div>
      <ul className="divide-y divide-gray-200 rounded border border-gray-200 bg-white">
        {submissions.map((s) => (
          <li key={s.id} className="px-4 py-3">
            <Link href={`/submissions/${s.id}`} className="font-medium text-gray-900 hover:underline">
              {s.title}
            </Link>
            <p className="mt-1 text-xs text-gray-500">
              {s.volume.label} · {STATUS_LABEL[s.status]} · {formatDateTime(s.createdAt)}
            </p>
          </li>
        ))}
        {submissions.length === 0 && (
          <li className="px-4 py-3 text-sm text-gray-500">투고한 논문이 없습니다.</li>
        )}
      </ul>
    </div>
  );
}
