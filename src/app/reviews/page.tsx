import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireRole, REVIEW_ROLES } from "@/lib/rbac";
import { formatDate } from "@/lib/date";
import { REVIEW_STATUS_LABELS } from "@/lib/labels";
import { BankAccountForm } from "./bank-account-form";

export default async function ReviewsPage() {
  const session = await requireRole(REVIEW_ROLES);
  const [assignments, user] = await Promise.all([
    prisma.reviewAssignment.findMany({
      where: { reviewerId: session.user.id },
      include: { submission: { include: { volume: true } }, review: true },
      orderBy: { assignedAt: "desc" },
    }),
    prisma.user.findUniqueOrThrow({ where: { id: session.user.id } }),
  ]);

  const now = new Date();
  const DUE_SOON_THRESHOLD_DAYS = 5;

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold text-gray-900">내 심사 목록</h1>

      <div className="mb-6 rounded border border-gray-200 bg-gray-50 p-4">
        <h2 className="mb-2 text-sm font-semibold text-gray-900">심사비 지급 계좌</h2>
        <p className="mb-3 text-xs text-gray-500">
          추후 심사비 지급 시 사용됩니다. 아직 지급이 시작되지 않았어도 미리 등록해 두실 수
          있습니다.
        </p>
        <BankAccountForm
          bankName={user.reviewerBankName}
          bankAccountNumber={user.reviewerBankAccountNumber}
          bankAccountHolder={user.reviewerBankAccountHolder}
        />
      </div>

      <ul className="divide-y divide-gray-200 rounded border border-gray-200 bg-white">
        {assignments.map((a) => {
          const overdue = a.dueDate && a.status !== "SUBMITTED" && a.dueDate < now;
          const dueSoon =
            a.dueDate &&
            !overdue &&
            a.status !== "SUBMITTED" &&
            a.dueDate.getTime() - now.getTime() < DUE_SOON_THRESHOLD_DAYS * 24 * 60 * 60 * 1000;
          return (
            <li key={a.id} className="px-4 py-3">
              <Link href={`/reviews/${a.id}`} className="font-medium text-gray-900 hover:underline">
                {a.submission.title}
              </Link>
              <p className="mt-1 text-xs text-gray-500">
                {a.submission.volume.label} · {a.round}차 · 모집기간:{" "}
                {formatDate(a.submission.volume.callStartDate)} ~{" "}
                {formatDate(a.submission.volume.callEndDate)} · 상태:{" "}
                {REVIEW_STATUS_LABELS[a.status] ?? a.status}
                {a.dueDate && (
                  <>
                    {" · "}
                    <span
                      className={
                        overdue
                          ? "font-medium text-red-600"
                          : dueSoon
                            ? "font-medium text-amber-600"
                            : ""
                      }
                    >
                      마감일: {formatDate(a.dueDate)}
                      {overdue ? " (마감 초과)" : dueSoon ? " (마감 임박)" : ""}
                    </span>
                  </>
                )}
              </p>
            </li>
          );
        })}
        {assignments.length === 0 && (
          <li className="px-4 py-3 text-sm text-gray-500">배정된 심사가 없습니다.</li>
        )}
      </ul>
    </div>
  );
}
