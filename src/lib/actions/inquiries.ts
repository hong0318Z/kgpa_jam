"use server";

import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";
import { auth } from "@/lib/auth";
import { requireRole, ADMIN_ROLES } from "@/lib/rbac";
import { sendMail } from "@/lib/mail";
import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/lib/actions/auth";

export async function submitInquiry(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const session = await auth();

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const subject = String(formData.get("subject") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  if (!name || !email || !subject || !message) {
    return { error: "이름, 이메일, 제목, 문의 내용을 모두 입력해 주세요." };
  }

  const inquiry = await prisma.inquiry.create({
    data: {
      name,
      email,
      phone: phone || null,
      subject,
      message,
      userId: session?.user?.id ?? null,
    },
  });

  // 접수 시점에는 메일을 보내지 않는다. 사이트(관리자 문의 내역/해야 할 일)에서
  // 확인하고, 답장을 보낼 때만 문의자에게 메일로 안내한다.
  await logAudit({
    actorId: session?.user?.id ?? null,
    action: "INQUIRY_SUBMITTED",
    targetType: "Inquiry",
    targetId: inquiry.id,
    metadata: { name, email, subject },
  });

  revalidatePath("/admin/inquiries");
  return { success: "문의가 접수되었습니다. 빠른 시일 내에 답변드리겠습니다." };
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export async function markInquiryRead(id: string) {
  const session = await requireRole(ADMIN_ROLES);

  const inquiry = await prisma.inquiry.findUnique({ where: { id }, select: { status: true } });
  if (inquiry?.status !== "NEW") return;

  await prisma.inquiry.update({
    where: { id },
    data: { status: "READ", readAt: new Date(), readById: session.user.id },
  });

  await logAudit({
    actorId: session.user.id,
    action: "INQUIRY_READ",
    targetType: "Inquiry",
    targetId: id,
  });

  revalidatePath("/admin/inquiries");
}

export async function replyToInquiry(
  id: string,
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const session = await requireRole(ADMIN_ROLES);

  const replyMessage = String(formData.get("replyMessage") ?? "").trim();
  if (!replyMessage) return { error: "답장 내용을 입력해 주세요." };

  const inquiry = await prisma.inquiry.findUnique({ where: { id } });
  if (!inquiry) return { error: "존재하지 않는 문의입니다." };

  await prisma.inquiry.update({
    where: { id },
    data: {
      replyMessage,
      repliedAt: new Date(),
      repliedById: session.user.id,
      status: "REPLIED",
      readAt: inquiry.readAt ?? new Date(),
      readById: inquiry.readById ?? session.user.id,
    },
  });

  await logAudit({
    actorId: session.user.id,
    action: "INQUIRY_REPLIED",
    targetType: "Inquiry",
    targetId: id,
    metadata: { email: inquiry.email, subject: inquiry.subject },
  });

  const html = `
    <p>${escapeHtml(inquiry.name)}님, 문의하신 내용에 답변드립니다.</p>
    <p><b>문의 제목:</b> ${escapeHtml(inquiry.subject)}</p>
    <p style="white-space:pre-wrap;color:#555">${escapeHtml(inquiry.message)}</p>
    <hr style="border:none;border-top:1px solid #e5e5e5;margin:16px 0" />
    <p style="white-space:pre-wrap">${escapeHtml(replyMessage)}</p>
  `;

  try {
    await sendMail({
      to: inquiry.email,
      subject: `[답변] ${inquiry.subject}`,
      html,
      templateKey: "inquiry_reply",
    });
  } catch (e) {
    console.error("[inquiries] reply notification failed:", inquiry.email, e);
    revalidatePath("/admin/inquiries");
    return { error: "답장은 저장됐지만 메일 발송에 실패했습니다. 메일 발송 내역을 확인해 주세요." };
  }

  revalidatePath("/admin/inquiries");
  return { success: "답장을 저장하고 문의자에게 메일을 보냈습니다." };
}
