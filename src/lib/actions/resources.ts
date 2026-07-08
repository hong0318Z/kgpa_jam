"use server";

import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";
import { requireRole, ADMIN_ROLES } from "@/lib/rbac";
import { saveUploadedFile } from "@/lib/storage";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/lib/actions/auth";

export async function createResource(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const session = await requireRole(ADMIN_ROLES);

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const files = formData.getAll("file").filter((f): f is File => f instanceof File && f.size > 0);

  if (!title) return { error: "제목을 입력해 주세요." };
  if (files.length === 0) return { error: "파일을 첨부해 주세요." };

  for (const file of files) {
    const saved = await saveUploadedFile("resources", file);
    const resourceTitle = files.length > 1 ? file.name.replace(/\.[^.]+$/, "") : title;
    const resource = await prisma.resource.create({
      data: {
        title: resourceTitle,
        description: description || null,
        uploadedById: session.user.id,
        ...saved,
      },
    });

    await logAudit({
      actorId: session.user.id,
      action: "RESOURCE_UPLOADED",
      targetType: "Resource",
      targetId: resource.id,
      metadata: { title: resourceTitle, originalName: saved.originalName },
    });
  }

  redirect("/resources");
}

export async function deleteResource(resourceId: string) {
  const session = await requireRole(ADMIN_ROLES);

  await prisma.resource.delete({ where: { id: resourceId } });

  await logAudit({
    actorId: session.user.id,
    action: "RESOURCE_DELETED",
    targetType: "Resource",
    targetId: resourceId,
  });

  revalidatePath("/resources");
}
