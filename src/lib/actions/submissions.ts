"use server";

import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";
import { requireRole, requireSession, ForbiddenError } from "@/lib/rbac";
import { saveUploadedFile } from "@/lib/storage";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/lib/actions/auth";

export async function createSubmission(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const session = await requireRole(["AUTHOR", "EDITOR"]);

  const title = String(formData.get("title") ?? "").trim();
  const abstract = String(formData.get("abstract") ?? "").trim();
  const keywords = String(formData.get("keywords") ?? "")
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);
  const volumeId = String(formData.get("volumeId") ?? "");
  const file = formData.get("file") as File | null;

  if (!title || !abstract || !volumeId) {
    return { error: "제목, 초록, 투고 호(Volume)를 모두 입력해 주세요." };
  }
  if (!file || file.size === 0) {
    return { error: "논문 파일(PDF)을 첨부해 주세요." };
  }
  if (file.type !== "application/pdf") {
    return { error: "PDF 파일만 업로드할 수 있습니다." };
  }
  if (file.size > 20 * 1024 * 1024) {
    return { error: "파일 크기는 20MB를 초과할 수 없습니다." };
  }

  const submission = await prisma.submission.create({
    data: {
      title,
      abstract,
      keywords,
      volumeId,
      authorId: session.user.id,
    },
  });

  const saved = await saveUploadedFile(submission.id, file);
  await prisma.submissionFile.create({
    data: {
      submissionId: submission.id,
      version: 1,
      ...saved,
    },
  });

  await prisma.statusLog.create({
    data: { submissionId: submission.id, toStatus: "SUBMITTED" },
  });

  await logAudit({
    actorId: session.user.id,
    action: "SUBMISSION_CREATED",
    targetType: "Submission",
    targetId: submission.id,
    metadata: { title, volumeId },
  });
  await logAudit({
    actorId: session.user.id,
    action: "FILE_UPLOADED",
    targetType: "Submission",
    targetId: submission.id,
    metadata: { originalName: saved.originalName },
  });

  redirect(`/submissions/${submission.id}`);
}

export async function uploadRevision(submissionId: string, formData: FormData) {
  const session = await requireSession();
  const submission = await prisma.submission.findUniqueOrThrow({
    where: { id: submissionId },
  });
  if (
    session.user.role !== "EDITOR" &&
    submission.authorId !== session.user.id
  ) {
    throw new ForbiddenError("본인의 투고만 수정할 수 있습니다.");
  }

  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) return;
  if (file.type !== "application/pdf") return;

  const latest = await prisma.submissionFile.findFirst({
    where: { submissionId },
    orderBy: { version: "desc" },
  });
  const nextVersion = (latest?.version ?? 0) + 1;

  const saved = await saveUploadedFile(submissionId, file);
  await prisma.submissionFile.create({
    data: { submissionId, version: nextVersion, ...saved },
  });

  await logAudit({
    actorId: session.user.id,
    action: "FILE_UPLOADED",
    targetType: "Submission",
    targetId: submissionId,
    metadata: { originalName: saved.originalName, version: nextVersion },
  });

  revalidatePath(`/submissions/${submissionId}`);
}

export async function assignReviewer(submissionId: string, reviewerId: string) {
  const session = await requireRole(["EDITOR"]);

  await prisma.reviewAssignment.create({
    data: { submissionId, reviewerId },
  });

  const submission = await prisma.submission.findUniqueOrThrow({
    where: { id: submissionId },
  });
  if (submission.status === "SUBMITTED") {
    await prisma.submission.update({
      where: { id: submissionId },
      data: { status: "UNDER_REVIEW" },
    });
    await prisma.statusLog.create({
      data: {
        submissionId,
        fromStatus: "SUBMITTED",
        toStatus: "UNDER_REVIEW",
      },
    });
  }

  await logAudit({
    actorId: session.user.id,
    action: "REVIEWER_ASSIGNED",
    targetType: "Submission",
    targetId: submissionId,
    metadata: { reviewerId },
  });

  revalidatePath(`/admin/submissions/${submissionId}/assign`);
}

export async function unassignReviewer(assignmentId: string) {
  const session = await requireRole(["EDITOR"]);
  const assignment = await prisma.reviewAssignment.delete({
    where: { id: assignmentId },
  });

  await logAudit({
    actorId: session.user.id,
    action: "REVIEWER_UNASSIGNED",
    targetType: "Submission",
    targetId: assignment.submissionId,
    metadata: { reviewerId: assignment.reviewerId },
  });

  revalidatePath(`/admin/submissions/${assignment.submissionId}/assign`);
}

export async function makeDecision(
  submissionId: string,
  outcome: "ACCEPTED" | "REVISION_REQUESTED" | "REJECTED",
  note: string,
) {
  const session = await requireRole(["EDITOR"]);

  const submission = await prisma.submission.findUniqueOrThrow({
    where: { id: submissionId },
  });

  await prisma.decision.create({
    data: { submissionId, editorId: session.user.id, outcome, note },
  });

  await prisma.submission.update({
    where: { id: submissionId },
    data: { status: outcome },
  });

  await prisma.statusLog.create({
    data: { submissionId, fromStatus: submission.status, toStatus: outcome, note },
  });

  await logAudit({
    actorId: session.user.id,
    action: "DECISION_MADE",
    targetType: "Submission",
    targetId: submissionId,
    metadata: { outcome, note },
  });

  revalidatePath(`/submissions/${submissionId}`);
  revalidatePath(`/admin/submissions/${submissionId}/decide`);
}
