import { prisma } from "@/lib/prisma";
import { ADMIN_ROLES, REVIEW_ROLES } from "@/lib/rbac";
import { formatDate } from "@/lib/date";
import type { Role } from "@/generated/prisma/client";

export type TodoItem = {
  label: string;
  href: string;
  urgent: boolean;
};

export async function getTodoItems(user: { id: string; role: Role }): Promise<TodoItem[]> {
  const items: TodoItem[] = [];

  const myRevisions = await prisma.submission.findMany({
    where: { authorId: user.id, status: "REVISION_REQUESTED" },
    select: { id: true, title: true },
  });
  for (const s of myRevisions) {
    items.push({
      label: `『${s.title}』 수정 요청을 확인하고 재투고해 주세요`,
      href: `/submissions/${s.id}`,
      urgent: true,
    });
  }

  const DUE_SOON_THRESHOLD_DAYS = 5;

  if (REVIEW_ROLES.includes(user.role)) {
    const pendingReviews = await prisma.reviewAssignment.findMany({
      where: { reviewerId: user.id, status: { not: "SUBMITTED" } },
      include: { submission: { select: { title: true } } },
      orderBy: { dueDate: "asc" },
    });
    const now = new Date();
    for (const a of pendingReviews) {
      const overdue = !!a.dueDate && a.dueDate < now;
      const dueSoon =
        !!a.dueDate &&
        !overdue &&
        a.dueDate.getTime() - now.getTime() < DUE_SOON_THRESHOLD_DAYS * 24 * 60 * 60 * 1000;
      const dueText = a.dueDate
        ? overdue
          ? ` (마감 초과: ${formatDate(a.dueDate)})`
          : dueSoon
            ? ` (마감 임박: ${formatDate(a.dueDate)})`
            : ` (마감: ${formatDate(a.dueDate)})`
        : "";
      items.push({
        label: `『${a.submission.title}』 심사를 제출해 주세요${dueText}`,
        href: `/reviews/${a.id}`,
        urgent: overdue || dueSoon,
      });
    }
  }

  if (ADMIN_ROLES.includes(user.role)) {
    const candidates = await prisma.submission.findMany({
      where: { status: { in: ["SUBMITTED", "UNDER_REVIEW"] } },
      select: {
        id: true,
        title: true,
        round: true,
        assignments: { select: { round: true, status: true } },
      },
    });

    for (const s of candidates) {
      const currentRoundAssignments = s.assignments.filter((a) => a.round === s.round);
      if (currentRoundAssignments.length === 0) {
        items.push({
          label: `『${s.title}』 심사위원 배정이 필요합니다${s.round > 1 ? ` (${s.round}차)` : ""}`,
          href: `/admin/submissions/${s.id}/assign`,
          urgent: true,
        });
      } else if (currentRoundAssignments.every((a) => a.status === "SUBMITTED")) {
        items.push({
          label: `『${s.title}』 심사가 모두 완료되어 최종 결정이 필요합니다`,
          href: `/admin/submissions/${s.id}/decide`,
          urgent: false,
        });
      }
    }
  }

  items.sort((a, b) => Number(b.urgent) - Number(a.urgent));
  return items;
}
