import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-gray-200 bg-white py-6 text-center text-xs text-gray-500">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-2 px-6">
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
          <Link href="/policies/privacy-policy" className="font-medium text-gray-700 hover:underline">
            개인정보처리방침
          </Link>
          <Link href="/policies/research-ethics" className="hover:underline">
            연구윤리규정
          </Link>
          <Link href="/policies/review-regulation" className="hover:underline">
            심사규정
          </Link>
          <Link href="/resources" className="hover:underline">
            자료실
          </Link>
        </div>
        <div className="leading-relaxed">
          <p>
            회사명: 사단법인 한국게임정책학회 · 회장: 이재홍 · 사업자등록번호: 841-82-00479
          </p>
          <p>
            주소: 서울특별시 관악구 미성길 122, 101동 507호(신림동) · TEL: 02-820-0343 ·
            E-mail: k-gpa@k-gpa.or.kr
          </p>
        </div>
        <p>© 한국게임정책학회(KGPA) 「인터랙티브미디어저널」</p>
      </div>
    </footer>
  );
}
