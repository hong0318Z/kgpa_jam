import Link from "next/link";

export default function ConferenceThanksPage() {
  return (
    <div className="mx-auto max-w-xl rounded-lg border border-gray-200 bg-white p-8 text-center">
      <h1 className="text-xl font-bold text-gray-900">제출해주셔서 감사합니다.</h1>
      <p className="mt-3 text-sm text-gray-700">
        추가적인 사항은 가입에 기재하신 연락처로 연락드릴 예정입니다.
      </p>
      <Link
        href="/"
        className="mt-6 inline-block rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
      >
        홈페이지로 다시 가기
      </Link>
    </div>
  );
}
