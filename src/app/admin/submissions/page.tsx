import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireRole, ADMIN_ROLES } from "@/lib/rbac";

const STATUS_LABEL: Record<string, string> = {
  SUBMITTED: "투고완료",
  UNDER_REVIEW: "심사중",
  REVISION_REQUESTED: "수정요청",
  ACCEPTED: "게재승인",
  REJECTED: "반려",
  WITHDRAWN: "철회",
};

export default async function AdminSubmissionsPage() {
  await requireRole(ADMIN_ROLES);
  const submissions = await prisma.submission.findMany({
    include: { author: true, volume: true, assignments: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold text-gray-900">전체 투고 관리</h1>
      <table className="w-full rounded border border-gray-200 bg-white text-sm">
        <thead className="bg-gray-50 text-left text-gray-600">
          <tr>
            <th className="px-4 py-2">제목</th>
            <th className="px-4 py-2">저자</th>
            <th className="px-4 py-2">호</th>
            <th className="px-4 py-2">상태</th>
            <th className="px-4 py-2">심사위원</th>
            <th className="px-4 py-2"></th>
          </tr>
        </thead>
        <tbody>
          {submissions.map((s) => (
            <tr key={s.id} className="border-t border-gray-200">
              <td className="px-4 py-2 font-medium text-gray-900">{s.title}</td>
              <td className="px-4 py-2 text-gray-600">{s.author.name}</td>
              <td className="px-4 py-2 text-gray-600">{s.volume.label}</td>
              <td className="px-4 py-2 text-gray-600">{STATUS_LABEL[s.status]}</td>
              <td className="px-4 py-2 text-gray-600">{s.assignments.length}명</td>
              <td className="px-4 py-2">
                <Link href={`/admin/submissions/${s.id}/assign`} className="text-gray-700 hover:underline">
                  배정
                </Link>
                {" · "}
                <Link href={`/admin/submissions/${s.id}/decide`} className="text-gray-700 hover:underline">
                  결정
                </Link>
                {" · "}
                <Link href={`/submissions/${s.id}`} className="text-gray-700 hover:underline">
                  상세
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
