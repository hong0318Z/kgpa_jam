import { prisma } from "@/lib/prisma";
import { requireRole, ADMIN_ROLES } from "@/lib/rbac";
import { formatDateTime } from "@/lib/date";
import { InquiryRow } from "./inquiry-row";

export default async function AdminInquiriesPage() {
  await requireRole(ADMIN_ROLES);

  const [inquiries, newCount] = await Promise.all([
    prisma.inquiry.findMany({ orderBy: { createdAt: "desc" }, take: 200 }),
    prisma.inquiry.count({ where: { status: "NEW" } }),
  ]);

  return (
    <div>
      <h1 className="mb-1 text-xl font-bold text-gray-900">문의 내역</h1>
      <p className="mb-4 text-sm text-gray-500">
        전체 {inquiries.length}건 중 새 문의 {newCount}건
      </p>
      <ul className="flex flex-col gap-2">
        {inquiries.map((inq) => (
          <InquiryRow
            key={inq.id}
            inquiry={{
              id: inq.id,
              name: inq.name,
              email: inq.email,
              phone: inq.phone,
              subject: inq.subject,
              message: inq.message,
              status: inq.status,
              createdAt: formatDateTime(inq.createdAt),
            }}
          />
        ))}
        {inquiries.length === 0 && (
          <li className="rounded border border-gray-200 bg-white px-4 py-6 text-center text-sm text-gray-500">
            접수된 문의가 없습니다.
          </li>
        )}
      </ul>
    </div>
  );
}
