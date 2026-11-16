"use server";

import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";
import { requireSession, ForbiddenError, ADMIN_ROLES } from "@/lib/rbac";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { ReviewRecommendation } from "@/generated/prisma/client";
import type { ActionResult } from "@/lib/actions/auth";

export async function submitReview(
  assignmentId: string,
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const session = await requireSession();

  const assignment = await prisma.reviewAssignment.findUniqueOrThrow({
    where: { id: assignmentId },
  });
  const isOwner = assignment.reviewerId === session.user.id;
  const isAdminOnBehalf = !isOwner && ADMIN_ROLES.includes(session.user.role);
  if (!isOwner && !isAdminOnBehalf) {
    throw new ForbiddenError("배정된 심사위원만 평가를 제출할 수 있습니다.");
  }
  if (assignment.status === "SUBMITTED") {
    return { error: "이미 제출된 심사는 수정할 수 없습니다." };
  }

  const scoreRaw = formData.get("score");
  const score = scoreRaw ? Number(scoreRaw) : null;
  const commentsToAuthor = String(formData.get("commentsToAuthor") ?? "").trim();
  const commentsToEditor = String(formData.get("commentsToEditor") ?? "").trim();
  const recommendation = String(
    formData.get("recommendation") ?? "",
  ) as ReviewRecommendation;

  if (!commentsToAuthor || !recommendation) {
    return { error: "저자에게 전달할 코멘트와 심사의견을 입력해 주세요." };
  }

  await prisma.review.upsert({
    where: { assignmentId },
    update: {
      score,
      commentsToAuthor,
      commentsToEditor: commentsToEditor || null,
      recommendation,
    },
    create: {
      assignmentId,
      score,
      commentsToAuthor,
      commentsToEditor: commentsToEditor || null,
      recommendation,
    },
  });

  await prisma.reviewAssignment.update({
    where: { id: assignmentId },
    data: { status: "SUBMITTED" },
  });

  // 관리자가 심사위원을 대신해 작성하는 경우에도, 감사 로그에는 실제 배정된
  // 심사위원 본인이 제출한 것으로 남긴다(관리자 개입 흔적을 남기지 않는다).
  await logAudit({
    actorId: assignment.reviewerId,
    action: "REVIEW_SUBMITTED",
    targetType: "Submission",
    targetId: assignment.submissionId,
    metadata: { assignmentId, recommendation, score },
  });

  revalidatePath(`/reviews/${assignmentId}`);
  revalidatePath("/reviews");
  revalidatePath(`/admin/submissions/${assignment.submissionId}/assign`);

  if (isAdminOnBehalf) {
    redirect(`/admin/submissions/${assignment.submissionId}/assign`);
  }
  redirect("/reviews");
}
