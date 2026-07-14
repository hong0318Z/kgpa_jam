import Link from "next/link";
import { auth, signOut } from "@/lib/auth";
import { ADMIN_ROLES, REVIEW_ROLES } from "@/lib/rbac";
import { MobileNav } from "@/components/mobile-nav";
import { NavGroup } from "@/components/nav-group";
import { stopImpersonation } from "@/lib/actions/impersonation";

const NAV_LINKS = [
  { href: "/journal", label: "학술지" },
  { href: "/notices", label: "공지사항" },
];

const INFO_LINKS = [
  { href: "/resources", label: "자료실(투고양식)" },
  { href: "/policies/research-ethics", label: "연구윤리규정" },
  { href: "/policies/review-regulation", label: "심사규정" },
  { href: "/policies/privacy-policy", label: "개인정보처리방침" },
];

export async function SiteHeader() {
  const session = await auth();

  return (
    <header className="border-b border-gray-200 bg-white">
      {session?.user?.impersonatedByAdminId && (
        <div className="flex items-center justify-center gap-3 bg-amber-100 px-4 py-1.5 text-xs font-medium text-amber-900">
          <span>
            테스트 계정 &quot;{session.user.name}&quot;({session.user.impersonatedByAdminName}
            님이 전환함)으로 보고 있습니다.
          </span>
          <form action={stopImpersonation}>
            <button type="submit" className="underline hover:no-underline">
              관리자로 복귀
            </button>
          </form>
        </div>
      )}
      <div className="mx-auto flex max-w-7xl flex-col gap-1 px-6 py-3">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex flex-col">
            <span className="text-xs font-medium text-gray-500">
              한국게임정책학회
            </span>
            <span className="text-lg font-bold text-gray-900">
              인터랙티브미디어저널 투고시스템
            </span>
          </Link>
          <MobileNav>
            {NAV_LINKS.map((l) => (
              <Link key={l.href} href={l.href} className="text-gray-700 hover:underline">
                {l.label}
              </Link>
            ))}
            <NavGroup label="이용안내" links={INFO_LINKS} />
            {session?.user ? (
              <>
                <Link href="/submissions" className="text-gray-700 hover:underline">
                  내 투고
                </Link>
                {REVIEW_ROLES.includes(session.user.role) && (
                  <Link href="/reviews" className="text-gray-700 hover:underline">
                    내 심사
                  </Link>
                )}
                {ADMIN_ROLES.includes(session.user.role) && (
                  <Link href="/admin/submissions" className="text-gray-700 hover:underline">
                    관리메뉴
                  </Link>
                )}
                <Link href="/account" className="text-gray-700 hover:underline">
                  계정 설정
                </Link>
                <span className="text-gray-500">{session.user.name}님</span>
                <form
                  action={async () => {
                    "use server";
                    await signOut({ redirectTo: "/" });
                  }}
                >
                  <button className="text-gray-700 hover:underline" type="submit">
                    로그아웃
                  </button>
                </form>
              </>
            ) : (
              <>
                <Link href="/login" className="text-gray-700 hover:underline">
                  로그인
                </Link>
                <Link href="/register" className="text-gray-700 hover:underline">
                  회원가입
                </Link>
              </>
            )}
          </MobileNav>
        </div>
      </div>
    </header>
  );
}
