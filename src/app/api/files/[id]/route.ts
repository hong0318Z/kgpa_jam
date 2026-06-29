import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { readStoredFile } from "@/lib/storage";
import { ADMIN_ROLES } from "@/lib/rbac";

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

  const buffer = await readStoredFile(file.storedPath);
  return new Response(buffer, {
    headers: {
      "Content-Type": file.mimeType,
      "Content-Disposition": `attachment; filename="${encodeURIComponent(file.originalName)}"`,
    },
  });
}
