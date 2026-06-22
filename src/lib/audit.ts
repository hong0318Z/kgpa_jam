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
  | "USER_ROLE_CHANGED";

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
