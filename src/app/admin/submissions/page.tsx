import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireRole, ADMIN_ROLES } from "@/lib/rbac";
import { SUBMISSION_STATUS_LABELS } from "@/lib/labels";
import { DeleteSubmissionButton } from "./delete-submission-button";

export default async function AdminSubmissionsPage() {
  const session = await requireRole(ADMIN_ROLES);
  const canDelete = session.user.role === "ADMIN" || session.user.role === "CHIEF_EDITOR";
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
              <td className="px-4 py-2 text-gray-600">{SUBMISSION_STATUS_LABELS[s.status] ?? s.status}</td>
              <td className="px-4 py-2 text-gray-600">{s.assignments.length}명</td>
              <td className="px-4 py-2">
                <div className="flex flex-wrap gap-1.5">
                  <Link
                    href={`/admin/submissions/${s.id}/assign`}
                    className="rounded border border-gray-300 px-2.5 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
                  >
                    배정
                  </Link>
                  <Link
                    href={`/admin/submissions/${s.id}/decide`}
                    className="rounded border border-gray-300 px-2.5 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
                  >
                    결정
                  </Link>
                  <Link
                    href={`/submissions/${s.id}`}
                    className="rounded bg-gray-900 px-2.5 py-1 text-xs font-medium text-white hover:bg-gray-700"
                  >
                    상세
                  </Link>
                  {canDelete && <DeleteSubmissionButton submissionId={s.id} title={s.title} />}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
