import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";

export type AuditAction =
  | "USER_REGISTERED"
  | "LOGIN"
  | "SUBMISSION_CREATED"
  | "SUBMISSION_UPDATED"
  | "FILE_UPLOADED"
  | "REVIEWER_ASSIGNED"
  | "REVIEWER_UNASSIGNED"
  | "REVIEW_SUBMITTED"
  | "DECISION_MADE"
  | "VOLUME_CREATED"
  | "VOLUME_UPDATED"
  | "NOTICE_CREATED"
  | "NOTICE_UPDATED"
  | "NOTICE_DELETED"
  | "RESOURCE_UPLOADED"
  | "RESOURCE_DELETED"
  | "USER_ROLE_CHANGED"
  | "PASSWORD_CHANGED"
  | "PASSWORD_RESET"
  | "SUBMISSION_AUTHORS_UPDATED"
  | "POLICY_UPDATED"
  | "AUTHOR_RESPONSE_SUBMITTED"
  | "MAINTENANCE_MODE_CHANGED";

export async function logAudit(params: {
  actorId?: string | null;
  action: AuditAction;
  targetType?: string;
  targetId?: string;
  metadata?: Prisma.InputJsonValue;
}) {
  await prisma.auditLog.create({
    data: {
      actorId: params.actorId ?? null,
      action: params.action,
      targetType: params.targetType,
      targetId: params.targetId,
      metadata: params.metadata,
    },
  });
}

export const AUDIT_ACTION_LABELS: Record<AuditAction, string> = {
  USER_REGISTERED: "회원가입",
  LOGIN: "로그인",
  SUBMISSION_CREATED: "투고 생성",
  SUBMISSION_UPDATED: "투고 수정",
  FILE_UPLOADED: "파일 업로드",
  REVIEWER_ASSIGNED: "심사위원 배정",
  REVIEWER_UNASSIGNED: "심사위원 배정 해제",
  REVIEW_SUBMITTED: "심사 제출",
  DECISION_MADE: "심사 결정",
  VOLUME_CREATED: "발행 호 등록",
  VOLUME_UPDATED: "발행 호 수정",
  NOTICE_CREATED: "공지사항 작성",
  NOTICE_UPDATED: "공지사항 수정",
  NOTICE_DELETED: "공지사항 삭제",
  RESOURCE_UPLOADED: "자료 업로드",
  RESOURCE_DELETED: "자료 삭제",
  USER_ROLE_CHANGED: "사용자 역할 변경",
  PASSWORD_CHANGED: "비밀번호 변경",
  PASSWORD_RESET: "비밀번호 초기화",
  SUBMISSION_AUTHORS_UPDATED: "공저자 정보 수정",
  POLICY_UPDATED: "규정 개정",
  AUTHOR_RESPONSE_SUBMITTED: "저자 답변 제출",
  MAINTENANCE_MODE_CHANGED: "사이트 운영 상태 변경",
};

type TargetLookup = Map<string, Map<string, string>>;

const TARGET_LABELS: Record<string, string> = {
  Submission: "투고",
  User: "사용자",
  Volume: "발행 호",
  Notice: "공지사항",
  Resource: "자료",
  Policy: "규정",
};

export async function buildTargetLookup(
  logs: {
    targetType: string | null;
    targetId: string | null;
    metadata: Prisma.JsonValue | null;
  }[],
): Promise<TargetLookup> {
  const idsByType = new Map<string, Set<string>>();
  for (const log of logs) {
    if (log.targetType && log.targetId) {
      if (!idsByType.has(log.targetType)) idsByType.set(log.targetType, new Set());
      idsByType.get(log.targetType)!.add(log.targetId);
    }
    if (log.metadata && typeof log.metadata === "object" && !Array.isArray(log.metadata)) {
      const reviewerId = (log.metadata as Record<string, unknown>).reviewerId;
      if (typeof reviewerId === "string") {
        if (!idsByType.has("User")) idsByType.set("User", new Set());
        idsByType.get("User")!.add(reviewerId);
      }
    }
  }

  const lookup: TargetLookup = new Map();
  await Promise.all(
    Array.from(idsByType.entries()).map(async ([targetType, ids]) => {
      const idList = Array.from(ids);
      let rows: { id: string; label: string }[] = [];
      switch (targetType) {
        case "Submission": {
          const found = await prisma.submission.findMany({
            where: { id: { in: idList } },
            select: { id: true, title: true },
          });
          rows = found.map((r) => ({ id: r.id, label: r.title }));
          break;
        }
        case "User": {
          const found = await prisma.user.findMany({
            where: { id: { in: idList } },
            select: { id: true, name: true },
          });
          rows = found.map((r) => ({ id: r.id, label: r.name }));
          break;
        }
        case "Volume": {
          const found = await prisma.volume.findMany({
            where: { id: { in: idList } },
            select: { id: true, label: true },
          });
          rows = found.map((r) => ({ id: r.id, label: r.label }));
          break;
        }
        case "Notice": {
          const found = await prisma.notice.findMany({
            where: { id: { in: idList } },
            select: { id: true, title: true },
          });
          rows = found.map((r) => ({ id: r.id, label: r.title }));
          break;
        }
        case "Resource": {
          const found = await prisma.resource.findMany({
            where: { id: { in: idList } },
            select: { id: true, title: true },
          });
          rows = found.map((r) => ({ id: r.id, label: r.title }));
          break;
        }
      }
      lookup.set(targetType, new Map(rows.map((r) => [r.id, r.label])));
    }),
  );

  return lookup;
}

export function formatAuditTarget(
  log: { targetType: string | null; targetId: string | null },
  lookup: TargetLookup,
): string {
  if (!log.targetType || !log.targetId) return "-";
  const label = lookup.get(log.targetType)?.get(log.targetId);
  const typeLabel = TARGET_LABELS[log.targetType] ?? log.targetType;
  return label ? `${typeLabel}: ${label}` : `${typeLabel} (삭제됨)`;
}

const ROLE_LABELS: Record<string, string> = {
  AUTHOR: "저자",
  REVIEWER: "심사위원",
  EDITOR: "편집위원",
  CHIEF_EDITOR: "편집위원장",
  ADMIN: "관리자",
};

export function formatAuditMetadata(
  action: AuditAction,
  metadata: Prisma.JsonValue | null,
  lookup?: TargetLookup,
): string {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    return metadata ? JSON.stringify(metadata) : "-";
  }
  const m = metadata as Record<string, unknown>;
  const reviewerName =
    typeof m.reviewerId === "string"
      ? lookup?.get("User")?.get(m.reviewerId) ?? m.reviewerId
      : undefined;

  switch (action) {
    case "USER_ROLE_CHANGED": {
      if (m.bulk) {
        if (typeof m.to === "string") {
          return `${m.count ?? "-"}명 역할을 ${ROLE_LABELS[m.to] ?? m.to}(으)로 일괄 변경`;
        }
        return `${m.count ?? "-"}명 ${m.isActive ? "활성화" : "비활성화"} 일괄 처리`;
      }
      if ("isActive" in m) {
        return m.isActive ? "계정 활성화" : "계정 비활성화";
      }
      const from = String(m.from ?? "?");
      const to = String(m.to ?? "?");
      return `${ROLE_LABELS[from] ?? from} → ${ROLE_LABELS[to] ?? to}`;
    }
    case "USER_REGISTERED":
      return `${m.name ?? ""} (${m.email ?? ""}, ${m.affiliation ?? ""})`;
    case "FILE_UPLOADED":
      return `${m.originalName ?? "-"}${m.version ? ` (v${m.version})` : ""}`;
    case "DECISION_MADE":
      return `결과: ${m.outcome ?? "-"}${m.note ? ` / 의견: ${m.note}` : ""}`;
    case "SUBMISSION_CREATED":
      return `제목: ${m.title ?? "-"}`;
    case "RESOURCE_UPLOADED":
      return `${m.title ?? "-"} (${m.originalName ?? "-"})`;
    case "SUBMISSION_AUTHORS_UPDATED":
      return `공저자 ${m.count ?? "-"}명으로 갱신`;
    case "POLICY_UPDATED":
      return `${m.title ?? "-"} 개정`;
    case "MAINTENANCE_MODE_CHANGED":
      return m.maintenanceMode ? "점검중(비공개)으로 전환" : "운영(공개)으로 전환";
    case "REVIEWER_ASSIGNED":
    case "REVIEWER_UNASSIGNED":
      return `심사위원: ${reviewerName ?? "-"}`;
    default:
      return JSON.stringify(metadata);
  }
}
