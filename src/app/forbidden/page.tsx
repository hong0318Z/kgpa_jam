import Link from "next/link";

export default function ForbiddenPage() {
  return (
    <div className="mx-auto max-w-md rounded border border-gray-200 bg-white p-6 text-center">
      <p className="font-medium text-gray-900">이 화면에 접근할 권한이 없는 계정입니다.</p>
      <p className="mt-1 text-sm text-gray-500">
        권한이 필요하다고 생각되시면 관리자에게 문의해 주세요.
      </p>
      <Link href="/" className="mt-4 inline-block text-sm text-gray-700 underline">
        홈으로 돌아가기
      </Link>
    </div>
  );
}
