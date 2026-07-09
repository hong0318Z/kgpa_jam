"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";
import { redirect } from "next/navigation";

export type ActionResult = { error?: string };

export async function checkEmailAvailability(email: string): Promise<{ available: boolean }> {
  const normalized = email.trim().toLowerCase();
  if (!normalized) return { available: false };
  const existing = await prisma.user.findUnique({ where: { email: normalized } });
  return { available: !existing };
}

export async function registerUser(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const passwordConfirm = String(formData.get("passwordConfirm") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const affiliation = String(formData.get("affiliation") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const privacyConsent = formData.get("privacyConsent") === "on";

  if (!email || !password || !name || !affiliation || !phone) {
    return { error: "모든 항목을 입력해 주세요." };
  }
  if (password.length < 8) {
    return { error: "비밀번호는 8자 이상이어야 합니다." };
  }
  if (password !== passwordConfirm) {
    return { error: "비밀번호가 일치하지 않습니다." };
  }
  if (!privacyConsent) {
    return { error: "개인정보 수집 · 이용에 동의해 주세요." };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "이미 가입된 이메일입니다." };
  }

  const passwordHash = await bcrypt.hash(password, 10);
  let user;
  try {
    user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        affiliation,
        phone,
        role: "AUTHOR",
        privacyConsentAt: new Date(),
      },
    });
  } catch (e) {
    if (e instanceof Error && "code" in e && e.code === "P2002") {
      return { error: "이미 가입된 이메일입니다." };
    }
    throw e;
  }

  await logAudit({
    actorId: user.id,
    action: "USER_REGISTERED",
    targetType: "User",
    targetId: user.id,
    metadata: { email, name, affiliation },
  });

  redirect("/login?registered=1");
}
