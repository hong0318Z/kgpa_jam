import { prisma } from "@/lib/prisma";
import { requireRole, ADMIN_ROLES } from "@/lib/rbac";
import {
  AUDIT_ACTION_LABELS,
  buildTargetLookup,
  formatAuditMetadata,
  formatAuditTarget,
  type AuditAction,
} from "@/lib/audit";

export default async function AuditLogsPage() {
  await requireRole(ADMIN_ROLES);
  const logs = await prisma.auditLog.findMany({
    include: { actor: true },
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  const lookup = await buildTargetLookup(logs);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">감사 로그 (Audit Log)</h1>
        <a
          href="/api/admin/audit-logs/export"
          className="rounded border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
        >
          CSV로 내보내기
        </a>
      </div>
      <p className="mb-4 text-sm text-gray-500">
        회원가입, 로그인, 투고, 심사배정, 심사제출, 결정 등 모든 계정의 주요 행위가 실시간으로
        기록됩니다. 최근 200건만 화면에 표시되며, 전체 기록은 CSV 내보내기로 확인할 수 있습니다.
      </p>
      <table className="w-full rounded border border-gray-200 bg-white text-sm">
        <thead className="bg-gray-50 text-left text-gray-600">
          <tr>
            <th className="px-4 py-2">시각</th>
            <th className="px-4 py-2">행위자</th>
            <th className="px-4 py-2">행위</th>
            <th className="px-4 py-2">대상</th>
            <th className="px-4 py-2">상세</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log.id} className="border-t border-gray-200">
              <td className="px-4 py-2 text-xs text-gray-500">
                {log.createdAt.toLocaleString("ko-KR")}
              </td>
              <td className="px-4 py-2 text-gray-700">{log.actor?.name ?? "-"}</td>
              <td className="px-4 py-2 font-medium text-gray-900">
                {AUDIT_ACTION_LABELS[log.action as AuditAction] ?? log.action}
              </td>
              <td className="px-4 py-2 text-gray-600">{formatAuditTarget(log, lookup)}</td>
              <td className="px-4 py-2 text-xs text-gray-500">
                {formatAuditMetadata(log.action as AuditAction, log.metadata, lookup)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
