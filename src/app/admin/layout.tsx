import Link from "next/link";
import { requireRole, ADMIN_ROLES } from "@/lib/rbac";

const ADMIN_LINKS = [
  { href: "/admin/submissions", label: "투고 관리" },
  { href: "/admin/volumes", label: "발행 호 관리" },
  { href: "/admin/users", label: "사용자 관리" },
  { href: "/admin/audit-logs", label: "감사 로그" },
  { href: "/admin/notices/new", label: "공지 작성" },
  { href: "/admin/resources/new", label: "자료 업로드" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireRole(ADMIN_ROLES);

  return (
    <div className="flex flex-col gap-6">
      <nav className="flex flex-wrap gap-3 rounded border border-gray-200 bg-white px-4 py-3 text-sm">
        {ADMIN_LINKS.map((l) => (
          <Link key={l.href} href={l.href} className="text-gray-700 hover:underline">
            {l.label}
          </Link>
        ))}
      </nav>
      {children}
    </div>
  );
}
