"use server";

import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";
import { requireSession, ForbiddenError, ADMIN_ROLES } from "@/lib/rbac";
import { revalidatePath } from "next/cache";

export async function searchUsers(query: string) {
  await requireSession();
  const trimmed = query.trim();
  if (!trimmed) return [];

  const users = await prisma.user.findMany({
    where: { name: { contains: trimmed, mode: "insensitive" } },
    select: { id: true, name: true, email: true, affiliation: true },
    take: 10,
  });
  return users;
}

export type CoauthorInput = {
  userId?: string | null;
  name: string;
  email: string;
  affiliation: string;
  isCorresponding: boolean;
};

export async function setSubmissionAuthors(
  submissionId: string,
  authors: CoauthorInput[],
) {
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

  await prisma.$transaction([
    prisma.submissionAuthor.deleteMany({ where: { submissionId } }),
    prisma.submissionAuthor.createMany({
      data: authors.map((a, i) => ({
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

  await logAudit({
    actorId: session.user.id,
    action: "SUBMISSION_AUTHORS_UPDATED",
    targetType: "Submission",
    targetId: submissionId,
    metadata: { count: authors.length },
  });

  revalidatePath(`/submissions/${submissionId}`);
}
