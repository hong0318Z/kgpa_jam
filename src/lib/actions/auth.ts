"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";
import { signIn } from "@/lib/auth";
import { AuthError } from "next-auth";
import { sendWelcomeEmailTo } from "@/lib/notifications";

export type ActionResult = { error?: string; success?: string };

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
  const position = String(formData.get("position") ?? "").trim();
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
        position: position || null,
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

  await sendWelcomeEmailTo({ email: user.email, name: user.name });

  try {
    await signIn("credentials", { email, password, redirectTo: "/" });
  } catch (e) {
    if (e instanceof AuthError) {
      return { error: "가입은 완료되었습니다. 로그인 페이지에서 다시 로그인해 주세요." };
    }
    throw e;
  }
  return {};
}
