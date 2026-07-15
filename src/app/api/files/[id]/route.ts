import path from "node:path";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { readStoredFile } from "@/lib/storage";
import { ADMIN_ROLES } from "@/lib/rbac";
import { logAudit } from "@/lib/audit";

export const runtime = "nodejs";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const wantsInlineView = new URL(request.url).searchParams.get("view") === "1";
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

  // 브라우저 내장 뷰어로 보여줄 수 있는 건 PDF뿐이라, 그 외 형식(hwp/docx 등)은
  // ?view=1이 와도 다운로드로 처리한다. 임의 파일을 inline으로 내려주면 브라우저가
  // 내용을 해석해버릴 수 있는(XSS 등) 위험도 있어 PDF로만 제한한다.
  const canInlineView = wantsInlineView && file.mimeType === "application/pdf";
  const disposition = canInlineView ? "inline" : "attachment";

  const buffer = await readStoredFile(file.storedPath);
  return new Response(buffer, {
    headers: {
      "Content-Type": file.mimeType,
      "Content-Disposition": `${disposition}; filename="${encodeURIComponent(downloadName)}"`,
    },
  });
}
