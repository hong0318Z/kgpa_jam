"use server";

import path from "path";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";
import { requireRole, requireSession, ForbiddenError, ADMIN_ROLES } from "@/lib/rbac";
import { saveUploadedFile } from "@/lib/storage";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/lib/actions/auth";
import type { CoauthorInput } from "@/lib/actions/submission-authors";

const ALLOWED_EXT = [".pdf", ".hwp", ".docx"];

export async function createSubmission(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const session = await requireRole(["AUTHOR", ...ADMIN_ROLES]);

  const title = String(formData.get("title") ?? "").trim();
  const abstract = String(formData.get("abstract") ?? "").trim();
  const keywords = String(formData.get("keywords") ?? "")
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);
  const volumeId = String(formData.get("volumeId") ?? "");
  const pledgeAuthorNames = String(formData.get("pledgeAuthorNames") ?? "").trim();
  const files = formData.getAll("file").filter((f): f is File => f instanceof File && f.size > 0);
  const coauthorsRaw = String(formData.get("coauthors") ?? "[]");
  let coauthors: CoauthorInput[] = [];
  try {
    coauthors = JSON.parse(coauthorsRaw);
  } catch {
    coauthors = [];
  }

  if (!title || !abstract || !volumeId) {
    return { error: "제목, 초록, 투고 호(Volume)를 모두 입력해 주세요." };
  }
  if (!pledgeAuthorNames) {
    return { error: "연구윤리서약서 동의 및 저자명 입력이 필요합니다." };
  }
  if (files.length === 0) {
    return { error: "논문 파일을 첨부해 주세요." };
  }
  for (const file of files) {
    if (!ALLOWED_EXT.includes(path.extname(file.name).toLowerCase())) {
      return { error: "PDF, HWP, DOCX 파일만 업로드할 수 있습니다." };
    }
    if (file.size > 20 * 1024 * 1024) {
      return { error: "파일 크기는 파일당 20MB를 초과할 수 없습니다." };
    }
  }

  const submission = await prisma.submission.create({
    data: {
      title,
      abstract,
      keywords,
      volumeId,
      pledgeAuthorNames,
      authorId: session.user.id,
    },
  });

  const savedFiles = [];
  for (const file of files) {
    const saved = await saveUploadedFile(submission.id, file);
    await prisma.submissionFile.create({
      data: {
        submissionId: submission.id,
        version: 1,
        ...saved,
      },
    });
    savedFiles.push(saved);
  }

  await prisma.statusLog.create({
    data: { submissionId: submission.id, toStatus: "SUBMITTED" },
  });

  if (coauthors.length > 0) {
    await prisma.submissionAuthor.createMany({
      data: coauthors.map((a, i) => ({
        submissionId: submission.id,
        userId: a.userId ?? null,
        name: a.name,
        email: a.email,
        affiliation: a.affiliation,
        isCorresponding: a.isCorresponding,
        order: i,
      })),
    });
  }

  await logAudit({
    actorId: session.user.id,
    action: "SUBMISSION_CREATED",
    targetType: "Submission",
    targetId: submission.id,
    metadata: { title, volumeId },
  });
  for (const saved of savedFiles) {
    await logAudit({
      actorId: session.user.id,
      action: "FILE_UPLOADED",
      targetType: "Submission",
      targetId: submission.id,
      metadata: { originalName: saved.originalName },
    });
  }

  redirect(`/submissions/${submission.id}`);
}

export async function uploadRevision(submissionId: string, formData: FormData) {
  const session = await requireSession();
  const submission = await prisma.submission.findUniqueOrThrow({
    where: { id: submissionId },
  });
  if (
    !ADMIN_ROLES.includes(session.user.role) &&
    submission.authorId !== session.user.id
  ) {
    throw new ForbiddenError("본인의 투고만 수정할 수 있습니다.");
  }

  const files = formData
    .getAll("file")
    .filter((f): f is File => f instanceof File && f.size > 0)
    .filter((f) => ALLOWED_EXT.includes(path.extname(f.name).toLowerCase()));
  if (files.length === 0) return;

  const latest = await prisma.submissionFile.findFirst({
    where: { submissionId },
    orderBy: { version: "desc" },
  });
  const nextVersion = (latest?.version ?? 0) + 1;

  for (const file of files) {
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
  }

  revalidatePath(`/submissions/${submissionId}`);
}

export async function assignReviewer(submissionId: string, reviewerId: string) {
  const session = await requireRole(ADMIN_ROLES);

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
  const session = await requireRole(ADMIN_ROLES);
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
  const session = await requireRole(ADMIN_ROLES);

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
