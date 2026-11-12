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

  await logAudit({
    actorId: session?.user?.id ?? null,
    action: "INQUIRY_SUBMITTED",
    targetType: "Inquiry",
    targetId: inquiry.id,
    metadata: { name, email, subject },
  });

  void notifyAdmins(inquiry);

  revalidatePath("/admin/inquiries");
  return { success: "문의가 접수되었습니다. 빠른 시일 내에 답변드리겠습니다." };
}

async function notifyAdmins(inquiry: {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
}) {
  const admins = await prisma.user.findMany({
    where: { role: "ADMIN", isActive: true },
    select: { email: true },
  });

  const html = `
    <p>새 문의가 접수되었습니다.</p>
    <p><b>이름:</b> ${escapeHtml(inquiry.name)}<br/>
    <b>이메일:</b> ${escapeHtml(inquiry.email)}<br/>
    ${inquiry.phone ? `<b>연락처:</b> ${escapeHtml(inquiry.phone)}<br/>` : ""}
    <b>제목:</b> ${escapeHtml(inquiry.subject)}</p>
    <p style="white-space:pre-wrap">${escapeHtml(inquiry.message)}</p>
    <p><a href="${process.env.NEXTAUTH_URL ?? ""}/admin/inquiries">관리자 페이지에서 확인하기</a></p>
  `;

  for (const admin of admins) {
    try {
      await sendMail({
        to: admin.email,
        subject: `[문의 접수] ${inquiry.subject}`,
        html,
        templateKey: "inquiry_notification",
      });
    } catch (e) {
      console.error("[inquiries] admin notification failed:", admin.email, e);
    }
  }
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export async function markInquiryRead(id: string) {
  const session = await requireRole(ADMIN_ROLES);

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
