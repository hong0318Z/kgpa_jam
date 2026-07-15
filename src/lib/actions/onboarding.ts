"use server";

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/rbac";
import { updateSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import type { ActionResult } from "@/lib/actions/auth";

export async function completeProfile(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const session = await requireSession();

  const name = String(formData.get("name") ?? "").trim();
  const affiliation = String(formData.get("affiliation") ?? "").trim();
  const position = String(formData.get("position") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const privacyConsent = formData.get("privacyConsent") === "on";

  if (!name || !affiliation || !phone) {
    return { error: "모든 항목을 입력해 주세요." };
  }
  if (!privacyConsent) {
    return { error: "개인정보 수집 · 이용에 동의해 주세요." };
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name,
      affiliation,
      position: position || null,
      phone,
      profileComplete: true,
      privacyConsentAt: new Date(),
    },
  });

  await updateSession({ user: { id: session.user.id } });
  redirect("/");
}
