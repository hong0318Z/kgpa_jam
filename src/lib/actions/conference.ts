"use server";

import path from "path";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";
import { requireSession, requireRole, ADMIN_ROLES } from "@/lib/rbac";
import { saveUploadedFile, readStoredFile, writeStoredFile } from "@/lib/storage";
import { rotatePosterBuffer } from "@/lib/poster-rotate";
import { invalidatePosterThumbnail } from "@/lib/poster-thumb";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { ActionResult } from "@/lib/actions/auth";

const POSTER_MIME_BY_EXT: Record<string, string> = {
  ".pdf": "application/pdf",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
};

type PosterAuthor = { name: string; affiliation: string };

export async function createPosterSubmission(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const session = await requireSession();

  const title = String(formData.get("title") ?? "").trim();
  const volumeId = String(formData.get("volumeId") ?? "");
  const pledgeAuthorNames = String(formData.get("pledgeAuthorNames") ?? "").trim();
  const file = formData.get("posterFile");
  const format = formData.get("format") === "ARTWORK" ? "ARTWORK" : "POSTER";
  const formatLabel = format === "ARTWORK" ? "작품" : "포스터";

  let authors: PosterAuthor[] = [];
  try {
    authors = JSON.parse(String(formData.get("authors") ?? "[]"));
  } catch {
    authors = [];
  }
  authors = authors
    .map((a) => ({ name: String(a.name ?? "").trim(), affiliation: String(a.affiliation ?? "").trim() }))
    .filter((a) => a.name || a.affiliation);

  if (!title || !volumeId) return { error: "제목과 투고 호를 입력해 주세요." };
  if (!pledgeAuthorNames) return { error: "제출자 이름과 저작권 동의가 필요합니다." };
  if (authors.length === 0 || authors.some((a) => !a.name || !a.affiliation)) {
    return { error: "저자와 소속을 모두 입력해 주세요." };
  }
  if (!(file instanceof File) || file.size === 0) {
    return { error: `${formatLabel} 파일을 첨부해 주세요.` };
  }
  const ext = path.extname(file.name).toLowerCase();
  const mimeType = POSTER_MIME_BY_EXT[ext];
  if (!mimeType) return { error: `${formatLabel}은(는) PDF, PNG, JPG 파일만 업로드할 수 있습니다.` };
  if (file.size > 20 * 1024 * 1024) return { error: "파일 크기는 20MB를 초과할 수 없습니다." };

  const volume = await prisma.volume.findUnique({ where: { id: volumeId } });
  if (!volume || volume.type !== "CONFERENCE" || volume.status !== "OPEN") {
    return { error: "현재 투고를 받고 있는 학술대회가 아닙니다." };
  }
  if (!volume.conferenceFormats.includes(format)) {
    return { error: `이 학술대회는 ${formatLabel} 투고를 받지 않습니다.` };
  }

  const submission = await prisma.submission.create({
    data: {
      title,
      abstract: "",
      keywords: [],
      volumeId,
      pledgeAuthorNames,
      fields: [],
      authorId: session.user.id,
      conferenceFormat: format,
    },
  });

  const saved = await saveUploadedFile(submission.id, file);
  await prisma.submissionFile.create({
    data: { submissionId: submission.id, version: 1, kind: "MAIN", ...saved, mimeType },
  });

  await prisma.submissionAuthor.createMany({
    data: authors.map((a, i) => ({
      submissionId: submission.id,
      userId: null,
      name: a.name,
      email: "",
      affiliation: a.affiliation,
      isCorresponding: false,
      order: i,
    })),
  });

  await prisma.statusLog.create({
    data: { submissionId: submission.id, toStatus: "SUBMITTED" },
  });

  await logAudit({
    actorId: session.user.id,
    action: "SUBMISSION_CREATED",
    targetType: "Submission",
    targetId: submission.id,
    metadata: { title, volumeId, format },
  });
  await logAudit({
    actorId: session.user.id,
    action: "FILE_UPLOADED",
    targetType: "Submission",
    targetId: submission.id,
    metadata: { originalName: saved.originalName },
  });

  redirect("/conference/thanks");
}

export async function rotatePosterFile(fileId: string, angle: 90 | 270) {
  const session = await requireRole(ADMIN_ROLES);

  const file = await prisma.submissionFile.findFirst({
    where: {
      id: fileId,
      kind: "MAIN",
      submission: { conferenceFormat: { in: ["POSTER", "ARTWORK"] } },
    },
  });
  if (!file) return;

  const rotated = await rotatePosterBuffer(await readStoredFile(file.storedPath), file.mimeType, angle);
  await writeStoredFile(file.storedPath, rotated);
  await prisma.submissionFile.update({
    where: { id: file.id },
    data: { sizeBytes: rotated.length },
  });
  await invalidatePosterThumbnail(file.id);

  await logAudit({
    actorId: session.user.id,
    action: "POSTER_ROTATED",
    targetType: "Submission",
    targetId: file.submissionId,
    metadata: { originalName: file.originalName, angle },
  });

  revalidatePath("/conference");
  revalidatePath(`/admin/submissions/${file.submissionId}/assign`);
}

export async function addPosterByAdmin(
  volumeId: string,
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const session = await requireRole(ADMIN_ROLES);

  const title = String(formData.get("title") ?? "").trim();
  const format = formData.get("format") === "ARTWORK" ? "ARTWORK" : "POSTER";
  const formatLabel = format === "ARTWORK" ? "작품" : "포스터";
  const award = String(formData.get("award") ?? "").trim();
  const file = formData.get("posterFile");

  let authors: PosterAuthor[] = [];
  try {
    authors = JSON.parse(String(formData.get("authors") ?? "[]"));
  } catch {
    authors = [];
  }
  authors = authors
    .map((a) => ({ name: String(a.name ?? "").trim(), affiliation: String(a.affiliation ?? "").trim() }))
    .filter((a) => a.name || a.affiliation);

  if (!title) return { error: "제목을 입력해 주세요." };
  if (authors.length === 0 || authors.some((a) => !a.name || !a.affiliation)) {
    return { error: "저자와 소속을 모두 입력해 주세요." };
  }
  if (!(file instanceof File) || file.size === 0) {
    return { error: `${formatLabel} 파일을 첨부해 주세요.` };
  }
  const ext = path.extname(file.name).toLowerCase();
  const mimeType = POSTER_MIME_BY_EXT[ext];
  if (!mimeType) return { error: `${formatLabel}은(는) PDF, PNG, JPG 파일만 업로드할 수 있습니다.` };
  if (file.size > 20 * 1024 * 1024) return { error: "파일 크기는 20MB를 초과할 수 없습니다." };

  const volume = await prisma.volume.findUnique({ where: { id: volumeId } });
  if (!volume || volume.type !== "CONFERENCE") {
    return { error: "학술대회 호가 아닙니다." };
  }
  if (!volume.conferenceFormats.includes(format)) {
    return { error: `이 학술대회는 ${formatLabel}을(를) 접수하지 않습니다.` };
  }

  const submission = await prisma.submission.create({
    data: {
      title,
      abstract: "",
      keywords: [],
      volumeId,
      pledgeAuthorNames: authors.map((a) => a.name).join(", "),
      fields: [],
      authorId: session.user.id,
      conferenceFormat: format,
      status: "ACCEPTED",
      award: award || null,
    },
  });

  const saved = await saveUploadedFile(submission.id, file);
  await prisma.submissionFile.create({
    data: { submissionId: submission.id, version: 1, kind: "MAIN", ...saved, mimeType },
  });

  await prisma.submissionAuthor.createMany({
    data: authors.map((a, i) => ({
      submissionId: submission.id,
      userId: null,
      name: a.name,
      email: "",
      affiliation: a.affiliation,
      isCorresponding: false,
      order: i,
    })),
  });

  await prisma.statusLog.create({
    data: { submissionId: submission.id, toStatus: "ACCEPTED", note: "관리자 직접 등록" },
  });

  await logAudit({
    actorId: session.user.id,
    action: "SUBMISSION_CREATED",
    targetType: "Submission",
    targetId: submission.id,
    metadata: { title, volumeId, format, adminAdded: true },
  });

  revalidatePath("/conference");
  revalidatePath("/admin/volumes");
  return { success: `${formatLabel}이(가) 등록되어 바로 게재되었습니다.` };
}
