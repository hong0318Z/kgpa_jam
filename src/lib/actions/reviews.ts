"use server";

import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";
import { requireRole, ForbiddenError } from "@/lib/rbac";
import { revalidatePath } from "next/cache";
import type { ReviewRecommendation } from "@/generated/prisma/client";
import type { ActionResult } from "@/lib/actions/auth";

export async function submitReview(
  assignmentId: string,
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const session = await requireRole(["REVIEWER"]);

  const assignment = await prisma.reviewAssignment.findUniqueOrThrow({
    where: { id: assignmentId },
  });
  if (assignment.reviewerId !== session.user.id) {
    throw new ForbiddenError("배정된 심사위원만 평가를 제출할 수 있습니다.");
  }

  const scoreRaw = formData.get("score");
  const score = scoreRaw ? Number(scoreRaw) : null;
  const commentsToAuthor = String(formData.get("commentsToAuthor") ?? "").trim();
  const commentsToEditor = String(formData.get("commentsToEditor") ?? "").trim();
  const recommendation = String(
    formData.get("recommendation") ?? "",
  ) as ReviewRecommendation;

  if (!commentsToAuthor || !recommendation) {
    return { error: "저자에게 전달할 코멘트와 추천의견을 입력해 주세요." };
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

  await logAudit({
    actorId: session.user.id,
    action: "REVIEW_SUBMITTED",
    targetType: "Submission",
    targetId: assignment.submissionId,
    metadata: { assignmentId, recommendation, score },
  });

  revalidatePath(`/reviews/${assignmentId}`);
  revalidatePath("/reviews");
  return {};
}
