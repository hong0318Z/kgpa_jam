"use server";

import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";
import { requireRole, ADMIN_ROLES } from "@/lib/rbac";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/lib/actions/auth";

export async function updatePolicy(
  slug: string,
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const session = await requireRole(ADMIN_ROLES);

  const title = String(formData.get("title") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();

  if (!title || !content) {
    return { error: "제목과 내용을 입력해 주세요." };
  }

  const now = new Date();
  const policy = await prisma.policy.upsert({
    where: { slug },
    create: {
      slug,
      title,
      content,
      effectiveDate: now,
      updatedById: session.user.id,
    },
    update: {
      title,
      content,
      updatedById: session.user.id,
      revisionDates: { push: now },
    },
  });

  await logAudit({
    actorId: session.user.id,
    action: "POLICY_UPDATED",
    targetType: "Policy",
    targetId: policy.id,
    metadata: { title },
  });

  revalidatePath(`/policies/${slug}`);
  redirect(`/policies/${slug}`);
}
