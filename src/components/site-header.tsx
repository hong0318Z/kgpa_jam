import Link from "next/link";
import { auth, signOut } from "@/lib/auth";
import { ADMIN_ROLES, REVIEW_ROLES } from "@/lib/rbac";
import { MobileNav } from "@/components/mobile-nav";

const NAV_LINKS = [
  { href: "/notices", label: "공지사항" },
  { href: "/resources", label: "자료실(투고양식)" },
  { href: "/policies/research-ethics", label: "연구윤리규정" },
  { href: "/policies/review-regulation", label: "심사규정" },
];

export async function SiteHeader() {
  const session = await auth();

  return (
    <header className="border-b border-gray-200 bg-white">
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
