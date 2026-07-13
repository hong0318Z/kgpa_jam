import Link from "next/link";
import { requireRole, ADMIN_ROLES } from "@/lib/rbac";

const ADMIN_LINKS = [
  { href: "/admin/submissions", label: "투고 관리" },
  { href: "/admin/publications", label: "확정논문" },
  { href: "/admin/volumes", label: "발행 호 관리" },
  { href: "/admin/users", label: "사용자 관리" },
  { href: "/admin/audit-logs", label: "감사 로그" },
  { href: "/admin/notices/new", label: "공지 작성" },
  { href: "/admin/resources/new", label: "자료 업로드" },
  { href: "/admin/policies/research-ethics/edit", label: "연구윤리규정 수정" },
  { href: "/admin/policies/review-regulation/edit", label: "심사규정 수정" },
  { href: "/admin/fees", label: "심사비 관리" },
  { href: "/admin/mail", label: "메일 관리" },
  { href: "/admin/mail/logs", label: "메일 발송 내역" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireRole(ADMIN_ROLES);

  return (
    <div className="flex flex-col gap-6">
      <nav className="flex flex-wrap gap-3 rounded border border-gray-200 bg-white px-4 py-3 text-sm">
        {ADMIN_LINKS.map((l) => (
          <Link key={l.href} href={l.href} className="text-gray-700 hover:underline">
            {l.label}
          </Link>
        ))}
        {session.user.role === "ADMIN" && (
          <Link href="/admin/settings" className="text-gray-700 hover:underline">
            사이트 설정
          </Link>
        )}
      </nav>
      {children}
    </div>
  );
}
