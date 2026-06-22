"use server";

import { signIn } from "@/lib/auth";
import { AuthError } from "next-auth";
import type { ActionResult } from "@/lib/actions/auth";

export async function login(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/",
    });
    return {};
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "이메일 또는 비밀번호가 올바르지 않습니다." };
    }
    throw error;
  }
}
