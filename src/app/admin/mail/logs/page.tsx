import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireRole, ADMIN_ROLES } from "@/lib/rbac";
import { formatDateTime } from "@/lib/date";
import { EMAIL_TEMPLATE_DEFAULTS } from "@/lib/email-templates/registry";

export default async function MailLogsPage() {
  await requireRole(ADMIN_ROLES);

  const [logs, failedCount, totalCount] = await Promise.all([
    prisma.mailLog.findMany({ orderBy: { createdAt: "desc" }, take: 200 }),
    prisma.mailLog.count({ where: { status: "FAILED" } }),
    prisma.mailLog.count(),
  ]);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">메일 발송 내역</h1>
          <p className="mt-1 text-sm text-gray-500">
            전체 {totalCount}건 중 실패 {failedCount}건 (최근 200건 표시)
          </p>
        </div>
        <Link href="/admin/mail" className="text-sm text-gray-700 underline">
          메일 문구 관리로
        </Link>
      </div>

      <table className="w-full rounded border border-gray-200 bg-white text-sm">
        <thead className="bg-gray-50 text-left text-gray-600">
          <tr>
            <th className="px-4 py-2">발송 시각</th>
            <th className="px-4 py-2">템플릿</th>
            <th className="px-4 py-2">수신자</th>
            <th className="px-4 py-2">제목</th>
            <th className="px-4 py-2">상태</th>
            <th className="px-4 py-2">오류</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log.id} className="border-t border-gray-200">
              <td className="whitespace-nowrap px-4 py-2 text-gray-600">
                {formatDateTime(log.createdAt)}
              </td>
              <td className="px-4 py-2 text-gray-600">
                {log.templateKey
                  ? (EMAIL_TEMPLATE_DEFAULTS[log.templateKey]?.label ?? log.templateKey)
                  : "-"}
              </td>
              <td className="px-4 py-2 text-gray-600">{log.to}</td>
              <td className="max-w-xs truncate px-4 py-2 text-gray-900">{log.subject}</td>
              <td className="px-4 py-2">
                {log.status === "SUCCESS" ? (
                  <span className="rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                    성공
                  </span>
                ) : (
                  <span className="rounded bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                    실패
                  </span>
                )}
              </td>
              <td className="max-w-xs truncate px-4 py-2 text-xs text-red-600">
                {log.error ?? ""}
              </td>
            </tr>
          ))}
          {logs.length === 0 && (
            <tr>
              <td colSpan={6} className="px-4 py-6 text-center text-sm text-gray-500">
                발송된 메일 내역이 없습니다.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
