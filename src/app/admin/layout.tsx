import Link from "next/link";
import { requireRole, ADMIN_ROLES } from "@/lib/rbac";
import { NavGroup } from "@/components/nav-group";

const ADMIN_GROUPS: { label: string; links: { href: string; label: string }[] }[] = [
  {
    label: "투고/발행",
    links: [
      { href: "/admin/publications", label: "확정논문" },
      { href: "/admin/volumes", label: "발행 호 관리" },
    ],
  },
  {
    label: "회원/로그",
    links: [
      { href: "/admin/users", label: "사용자 관리" },
      { href: "/admin/audit-logs", label: "감사 로그" },
    ],
  },
  {
    label: "게시물 관리",
    links: [
      { href: "/admin/notices/new", label: "공지 작성" },
      { href: "/admin/resources/new", label: "자료 업로드" },
    ],
  },
  {
    label: "규정 관리",
    links: [
      { href: "/admin/policies/research-ethics/edit", label: "연구윤리규정 수정" },
      { href: "/admin/policies/review-regulation/edit", label: "심사규정 수정" },
      { href: "/admin/policies/privacy-policy/edit", label: "개인정보처리방침 수정" },
    ],
  },
  {
    label: "운영 설정",
    links: [
      { href: "/admin/fees", label: "심사비 관리" },
      { href: "/admin/mail", label: "메일 관리" },
      { href: "/admin/mail/logs", label: "메일 발송 내역" },
    ],
  },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireRole(ADMIN_ROLES);

  return (
    <div className="flex flex-col gap-6">
      <nav className="flex flex-wrap items-center gap-4 rounded border border-gray-200 bg-white px-4 py-3 text-sm">
        <Link href="/admin/submissions" className="text-gray-700 hover:underline">
          투고 관리
        </Link>
        {ADMIN_GROUPS.map((g) => (
          <NavGroup key={g.label} label={g.label} links={g.links} />
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
