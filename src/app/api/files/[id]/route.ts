import path from "node:path";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { readStoredFile } from "@/lib/storage";
import { ADMIN_ROLES } from "@/lib/rbac";
import { logAudit } from "@/lib/audit";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const file = await prisma.submissionFile.findUnique({
    where: { id },
    include: {
      submission: {
        include: { assignments: true },
      },
    },
  });
  if (!file) {
    return new Response("Not found", { status: 404 });
  }

  const { submission } = file;
  const isOwner = submission.authorId === session.user.id;
  const isEditor = ADMIN_ROLES.includes(session.user.role);
  const isAssignedReviewer = submission.assignments.some(
    (a) => a.reviewerId === session.user.id,
  );

  if (!isOwner && !isEditor && !isAssignedReviewer) {
    return new Response("Forbidden", { status: 403 });
  }

  if (isEditor || isAssignedReviewer) {
    await logAudit({
      actorId: session.user.id,
      action: "FILE_DOWNLOADED",
      targetType: "Submission",
      targetId: submission.id,
      metadata: { originalName: file.originalName, version: file.version },
    });
  }

  // 심사위원(편집자가 아닌 순수 심사위원)에게는 저자 식별이 가능한 원본
  // 파일명을 노출하지 않는다(익명심사). 편집진/저자 다운로드는 원본명 유지.
  const isBlindReviewer = isAssignedReviewer && !isEditor && !isOwner;
  const downloadName = isBlindReviewer
    ? `논문_v${file.version}${path.extname(file.originalName)}`
    : file.originalName;

  const buffer = await readStoredFile(file.storedPath);
  return new Response(buffer, {
    headers: {
      "Content-Type": file.mimeType,
      "Content-Disposition": `attachment; filename="${encodeURIComponent(downloadName)}"`,
    },
  });
}
