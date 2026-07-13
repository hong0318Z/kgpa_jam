"use server";

import path from "path";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";
import { requireRole, requireSession, ForbiddenError, ADMIN_ROLES } from "@/lib/rbac";
import { saveUploadedFile, deleteStoredFile } from "@/lib/storage";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/lib/actions/auth";
import type { CoauthorInput } from "@/lib/actions/submission-authors";

const ALLOWED_EXT = [".pdf", ".hwp", ".docx"];

export async function createSubmission(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const session = await requireSession();

  const title = String(formData.get("title") ?? "").trim();
  const abstract = String(formData.get("abstract") ?? "").trim();
  const keywords = String(formData.get("keywords") ?? "")
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);
  const volumeId = String(formData.get("volumeId") ?? "");
  const pledgeAuthorNames = String(formData.get("pledgeAuthorNames") ?? "").trim();
  const fields = formData.getAll("fields").map((f) => String(f)).filter(Boolean);
  const files = formData.getAll("file").filter((f): f is File => f instanceof File && f.size > 0);
  const appendixFiles = formData
    .getAll("appendixFile")
    .filter((f): f is File => f instanceof File && f.size > 0);
  const similarityCheckFiles = formData
    .getAll("similarityCheckFile")
    .filter((f): f is File => f instanceof File && f.size > 0);
  const copyrightFiles = formData
    .getAll("copyrightFile")
    .filter((f): f is File => f instanceof File && f.size > 0);
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
  if (/[0-9]/.test(pledgeAuthorNames)) {
    return { error: "서약 저자명에는 숫자를 입력할 수 없습니다." };
  }
  if (files.length === 0) {
    return { error: "논문 파일을 첨부해 주세요." };
  }
  for (const file of [...files, ...appendixFiles, ...copyrightFiles]) {
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
      fields,
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
        kind: "MAIN",
        ...saved,
      },
    });
    savedFiles.push(saved);
  }

  for (const file of similarityCheckFiles) {
    const saved = await saveUploadedFile(submission.id, file);
    await prisma.submissionFile.create({
      data: {
        submissionId: submission.id,
        version: 1,
        kind: "SIMILARITY_REPORT",
        ...saved,
      },
    });
  }

  for (const file of copyrightFiles) {
    const saved = await saveUploadedFile(submission.id, file);
    await prisma.submissionFile.create({
      data: {
        submissionId: submission.id,
        version: 1,
        kind: "COPYRIGHT_ASSIGNMENT",
        ...saved,
      },
    });
  }

  let appendixIndex = 0;
  for (const file of appendixFiles) {
    appendixIndex += 1;
    const saved = await saveUploadedFile(submission.id, file);
    await prisma.submissionFile.create({
      data: {
        submissionId: submission.id,
        version: appendixIndex,
        kind: "APPENDIX",
        ...saved,
      },
    });
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

const DEFAULT_REVIEW_PERIOD_DAYS = 14;
const URGENT_REVIEW_PERIOD_DAYS = 7;

export async function assignReviewer(submissionId: string, reviewerId: string, dueDate?: string) {
  const session = await requireRole(ADMIN_ROLES);

  const submission = await prisma.submission.findUniqueOrThrow({
    where: { id: submissionId },
  });

  const defaultPeriodDays = submission.isUrgent ? URGENT_REVIEW_PERIOD_DAYS : DEFAULT_REVIEW_PERIOD_DAYS;
  const effectiveDueDate = dueDate
    ? new Date(dueDate)
    : new Date(Date.now() + defaultPeriodDays * 24 * 60 * 60 * 1000);

  await prisma.reviewAssignment.create({
    data: { submissionId, reviewerId, round: submission.round, dueDate: effectiveDueDate },
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

export async function setSubmissionUrgent(submissionId: string, isUrgent: boolean) {
  const session = await requireRole(ADMIN_ROLES);

  await prisma.submission.update({
    where: { id: submissionId },
    data: { isUrgent },
  });

  await logAudit({
    actorId: session.user.id,
    action: "SUBMISSION_URGENT_CHANGED",
    targetType: "Submission",
    targetId: submissionId,
    metadata: { isUrgent },
  });

  revalidatePath(`/admin/submissions/${submissionId}/assign`);
}

export async function updateReviewDueDate(assignmentId: string, dueDate: string) {
  const session = await requireRole(ADMIN_ROLES);

  const assignment = await prisma.reviewAssignment.update({
    where: { id: assignmentId },
    data: { dueDate: dueDate ? new Date(dueDate) : null },
  });

  await logAudit({
    actorId: session.user.id,
    action: "REVIEW_DUE_DATE_SET",
    targetType: "Submission",
    targetId: assignment.submissionId,
    metadata: { assignmentId, dueDate: dueDate || null },
  });

  revalidatePath(`/admin/submissions/${assignment.submissionId}/assign`);
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

export async function deleteSubmission(submissionId: string): Promise<{ error?: string }> {
  const session = await requireRole(["ADMIN", "CHIEF_EDITOR"]);

  const submission = await prisma.submission.findUnique({ where: { id: submissionId } });
  if (!submission) {
    return { error: "이미 삭제된 투고입니다." };
  }

  await prisma.submission.delete({ where: { id: submissionId } });

  await logAudit({
    actorId: session.user.id,
    action: "SUBMISSION_DELETED",
    targetType: "Submission",
    targetId: submissionId,
    metadata: { title: submission.title },
  });

  revalidatePath("/admin/submissions");
  return {};
}

export async function submitFinalManuscript(
  submissionId: string,
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const session = await requireSession();

  const submission = await prisma.submission.findUniqueOrThrow({
    where: { id: submissionId },
  });
  if (submission.authorId !== session.user.id && !ADMIN_ROLES.includes(session.user.role)) {
    throw new ForbiddenError("본인의 투고만 제출할 수 있습니다.");
  }
  if (submission.status !== "ACCEPTED") {
    return { error: "게재가 확정된 투고만 최종 원고를 제출할 수 있습니다." };
  }

  const files = formData
    .getAll("file")
    .filter((f): f is File => f instanceof File && f.size > 0);
  if (files.length === 0) {
    return { error: "최종 원고 파일을 첨부해 주세요." };
  }
  for (const file of files) {
    if (!ALLOWED_EXT.includes(path.extname(file.name).toLowerCase())) {
      return { error: "PDF, HWP, DOCX 파일만 업로드할 수 있습니다." };
    }
    if (file.size > 20 * 1024 * 1024) {
      return { error: "파일 크기는 파일당 20MB를 초과할 수 없습니다." };
    }
  }

  for (const file of files) {
    const saved = await saveUploadedFile(submissionId, file);
    await prisma.submissionFile.create({
      data: { submissionId, version: 1, round: submission.round, kind: "FINAL_MANUSCRIPT", ...saved },
    });
    await logAudit({
      actorId: session.user.id,
      action: "FILE_UPLOADED",
      targetType: "Submission",
      targetId: submissionId,
      metadata: { originalName: saved.originalName, kind: "FINAL_MANUSCRIPT" },
    });
  }

  await prisma.submission.update({
    where: { id: submissionId },
    data: { finalManuscriptSubmittedAt: new Date() },
  });

  await logAudit({
    actorId: session.user.id,
    action: "FINAL_MANUSCRIPT_SUBMITTED",
    targetType: "Submission",
    targetId: submissionId,
  });

  revalidatePath(`/submissions/${submissionId}`);
  return { success: "최종 원고가 제출되었습니다." };
}

export async function uploadCopyrightAssignment(
  submissionId: string,
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const session = await requireSession();
  const submission = await prisma.submission.findUniqueOrThrow({
    where: { id: submissionId },
  });
  if (submission.authorId !== session.user.id && !ADMIN_ROLES.includes(session.user.role)) {
    throw new ForbiddenError("본인의 투고만 업로드할 수 있습니다.");
  }

  const files = formData
    .getAll("file")
    .filter((f): f is File => f instanceof File && f.size > 0);
  if (files.length === 0) {
    return { error: "파일을 첨부해 주세요." };
  }
  for (const file of files) {
    if (![".pdf", ".hwp", ".docx"].includes(path.extname(file.name).toLowerCase())) {
      return { error: "PDF, HWP, DOCX 파일만 업로드할 수 있습니다." };
    }
    if (file.size > 20 * 1024 * 1024) {
      return { error: "파일 크기는 파일당 20MB를 초과할 수 없습니다." };
    }
  }

  for (const file of files) {
    const saved = await saveUploadedFile(submissionId, file);
    await prisma.submissionFile.create({
      data: { submissionId, version: 1, round: submission.round, kind: "COPYRIGHT_ASSIGNMENT", ...saved },
    });
    await logAudit({
      actorId: session.user.id,
      action: "FILE_UPLOADED",
      targetType: "Submission",
      targetId: submissionId,
      metadata: { originalName: saved.originalName, kind: "COPYRIGHT_ASSIGNMENT" },
    });
  }

  revalidatePath(`/admin/submissions/${submissionId}/assign`);
  revalidatePath(`/submissions/${submissionId}`);
  return { success: "저작권 위임서가 등록되었습니다." };
}

export async function resubmitSubmission(
  submissionId: string,
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const session = await requireSession();
  const submission = await prisma.submission.findUniqueOrThrow({
    where: { id: submissionId },
  });
  if (submission.authorId !== session.user.id && !ADMIN_ROLES.includes(session.user.role)) {
    throw new ForbiddenError("본인의 투고만 수정할 수 있습니다.");
  }
  if (submission.status !== "REVISION_REQUESTED") {
    return { error: "수정요청 상태의 투고만 재제출할 수 있습니다." };
  }

  const title = String(formData.get("title") ?? "").trim();
  const abstract = String(formData.get("abstract") ?? "").trim();
  const keywords = String(formData.get("keywords") ?? "")
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);
  const fields = formData.getAll("fields").map((f) => String(f)).filter(Boolean);
  const response = String(formData.get("response") ?? "").trim();
  const files = formData.getAll("file").filter((f): f is File => f instanceof File && f.size > 0);
  const appendixFiles = formData
    .getAll("appendixFile")
    .filter((f): f is File => f instanceof File && f.size > 0);
  const similarityCheckFiles = formData
    .getAll("similarityCheckFile")
    .filter((f): f is File => f instanceof File && f.size > 0);
  const copyrightFiles = formData
    .getAll("copyrightFile")
    .filter((f): f is File => f instanceof File && f.size > 0);
  const coauthorsRaw = String(formData.get("coauthors") ?? "[]");
  let coauthors: CoauthorInput[] = [];
  try {
    coauthors = JSON.parse(coauthorsRaw);
  } catch {
    coauthors = [];
  }

  if (!title || !abstract) {
    return { error: "제목과 초록을 입력해 주세요." };
  }
  const remainingMainCount = await prisma.submissionFile.count({
    where: { submissionId, kind: "MAIN" },
  });
  if (remainingMainCount === 0 && files.length === 0) {
    return { error: "논문 파일을 최소 1개 이상 첨부해 주세요." };
  }
  for (const file of [...files, ...appendixFiles, ...copyrightFiles, ...similarityCheckFiles]) {
    if (!ALLOWED_EXT.includes(path.extname(file.name).toLowerCase())) {
      return { error: "PDF, HWP, DOCX 파일만 업로드할 수 있습니다." };
    }
    if (file.size > 20 * 1024 * 1024) {
      return { error: "파일 크기는 파일당 20MB를 초과할 수 없습니다." };
    }
  }

  const latestDecision = await prisma.decision.findFirst({
    where: { submissionId },
    orderBy: { decidedAt: "desc" },
  });

  await prisma.submissionRevisionSnapshot.create({
    data: {
      submissionId,
      round: submission.round,
      title: submission.title,
      abstract: submission.abstract,
      keywords: submission.keywords,
      fields: submission.fields,
      decisionNote: latestDecision?.note ?? null,
    },
  });

  const nextRound = submission.round + 1;
  await prisma.submission.update({
    where: { id: submissionId },
    data: { title, abstract, keywords, fields, status: "UNDER_REVIEW", round: nextRound },
  });

  await prisma.statusLog.create({
    data: {
      submissionId,
      fromStatus: "REVISION_REQUESTED",
      toStatus: "UNDER_REVIEW",
      note: `재투고 (${nextRound}차)`,
    },
  });

  const latestMain = await prisma.submissionFile.findFirst({
    where: { submissionId, kind: "MAIN" },
    orderBy: { version: "desc" },
  });
  let mainVersion = (latestMain?.version ?? 0) + 1;
  for (const file of files) {
    const saved = await saveUploadedFile(submissionId, file);
    await prisma.submissionFile.create({
      data: { submissionId, version: mainVersion, round: nextRound, kind: "MAIN", ...saved },
    });
    mainVersion += 1;
    await logAudit({
      actorId: session.user.id,
      action: "FILE_UPLOADED",
      targetType: "Submission",
      targetId: submissionId,
      metadata: { originalName: saved.originalName },
    });
  }
  for (const file of appendixFiles) {
    const saved = await saveUploadedFile(submissionId, file);
    await prisma.submissionFile.create({
      data: { submissionId, version: nextRound, round: nextRound, kind: "APPENDIX", ...saved },
    });
  }
  for (const file of similarityCheckFiles) {
    const saved = await saveUploadedFile(submissionId, file);
    await prisma.submissionFile.create({
      data: { submissionId, version: nextRound, round: nextRound, kind: "SIMILARITY_REPORT", ...saved },
    });
  }
  for (const file of copyrightFiles) {
    const saved = await saveUploadedFile(submissionId, file);
    await prisma.submissionFile.create({
      data: { submissionId, version: nextRound, round: nextRound, kind: "COPYRIGHT_ASSIGNMENT", ...saved },
    });
  }

  if (response) {
    await prisma.authorResponse.create({
      data: { submissionId, authorId: session.user.id, content: response },
    });
    await logAudit({
      actorId: session.user.id,
      action: "AUTHOR_RESPONSE_SUBMITTED",
      targetType: "Submission",
      targetId: submissionId,
    });
  }

  if (coauthors.length > 0) {
    await prisma.$transaction([
      prisma.submissionAuthor.deleteMany({ where: { submissionId } }),
      prisma.submissionAuthor.createMany({
        data: coauthors.map((a, i) => ({
          submissionId,
          userId: a.userId ?? null,
          name: a.name,
          email: a.email,
          affiliation: a.affiliation,
          isCorresponding: a.isCorresponding,
          order: i,
        })),
      }),
    ]);
  }

  await logAudit({
    actorId: session.user.id,
    action: "SUBMISSION_RESUBMITTED",
    targetType: "Submission",
    targetId: submissionId,
    metadata: { round: nextRound },
  });

  revalidatePath(`/submissions/${submissionId}`);
  revalidatePath(`/submissions/${submissionId}/edit`);
  revalidatePath("/reviews");
  revalidatePath("/");
  redirect(`/submissions/${submissionId}`);
}

export async function deleteSubmissionFile(fileId: string): Promise<{ error?: string }> {
  const session = await requireSession();

  const file = await prisma.submissionFile.findUnique({
    where: { id: fileId },
    include: { submission: true },
  });
  if (!file) {
    return { error: "이미 삭제된 파일입니다." };
  }
  if (
    file.submission.authorId !== session.user.id &&
    !ADMIN_ROLES.includes(session.user.role)
  ) {
    return { error: "본인의 투고만 수정할 수 있습니다." };
  }
  if (file.submission.status !== "REVISION_REQUESTED" && !ADMIN_ROLES.includes(session.user.role)) {
    return { error: "수정요청 상태의 투고만 파일을 삭제할 수 있습니다." };
  }

  await prisma.submissionFile.delete({ where: { id: fileId } });
  await deleteStoredFile(file.storedPath);

  await logAudit({
    actorId: session.user.id,
    action: "SUBMISSION_UPDATED",
    targetType: "Submission",
    targetId: file.submissionId,
    metadata: { title: file.submission.title, deletedFile: file.originalName },
  });

  revalidatePath(`/submissions/${file.submissionId}`);
  revalidatePath(`/submissions/${file.submissionId}/edit`);
  return {};
}
