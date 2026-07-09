import { prisma } from "@/lib/prisma";
import { requireRole, ADMIN_ROLES } from "@/lib/rbac";
import {
  AUDIT_ACTION_LABELS,
  buildTargetLookup,
  formatAuditMetadata,
  formatAuditTarget,
  type AuditAction,
} from "@/lib/audit";

export const runtime = "nodejs";

function csvEscape(value: string) {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export async function GET() {
  await requireRole(ADMIN_ROLES);

  const logs = await prisma.auditLog.findMany({
    include: { actor: true },
    orderBy: { createdAt: "desc" },
  });
  const lookup = await buildTargetLookup(logs);

  const header = ["시각", "행위자", "행위자 이메일", "행위", "대상", "상세"];
  const rows = logs.map((log) => [
    log.createdAt.toISOString(),
    log.actor?.name ?? "-",
    log.actor?.email ?? "-",
    AUDIT_ACTION_LABELS[log.action as AuditAction] ?? log.action,
    formatAuditTarget(log, lookup),
    formatAuditMetadata(log.action as AuditAction, log.metadata, lookup),
  ]);

  const csv = [header, ...rows]
    .map((row) => row.map((cell) => csvEscape(String(cell))).join(","))
    .join("\n");
  const bom = "﻿"; // Excel에서 한글 깨짐 방지

  const filename = `audit-logs-${new Date().toISOString().slice(0, 10)}.csv`;

  return new Response(bom + csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
