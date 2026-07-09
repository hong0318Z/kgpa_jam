import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDate, formatDateTime } from "@/lib/date";

export async function HomeContent() {
  const notices = await prisma.notice.findMany({
    orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
    take: 5,
  });
  const openVolumes = await prisma.volume.findMany({
    where: { status: "OPEN" },
    orderBy: { callStartDate: "desc" },
  });

  return (
    <div className="flex flex-col gap-10">
      <section className="rounded-lg border border-gray-200 bg-white p-6">
        <p className="text-sm text-gray-500">한국게임정책학회</p>
        <h1 className="text-2xl font-bold text-gray-900">
          「인터랙티브미디어저널」 투고 · 심사 관리 시스템
        </h1>
        <p className="mt-2 text-gray-600">
          논문 투고, 심사위원 배정, 심사 평가 및 게재 결정을 한 곳에서 관리합니다.
        </p>
        <div className="mt-4 flex gap-3">
          <Link
            href="/submissions/new"
            className="rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
          >
            논문 투고하기
          </Link>
          <Link
            href="/resources"
            className="rounded border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            투고양식 다운로드
          </Link>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-gray-900">현재 투고 모집중인 호</h2>
        {openVolumes.length === 0 ? (
          <p className="text-sm text-gray-500">현재 모집중인 호가 없습니다.</p>
        ) : (
          <ul className="space-y-2">
            {openVolumes.map((v) => (
              <li key={v.id} className="rounded border border-gray-200 bg-white p-4 text-sm">
                <span className="font-medium text-gray-900">{v.label}</span>
                <span className="ml-3 text-gray-500">
                  모집기간: {formatDate(v.callStartDate)} ~{" "}
                  {formatDate(v.callEndDate)} / 발간예정일:{" "}
                  {formatDate(v.plannedPublishDate)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">공지사항</h2>
          <Link href="/notices" className="text-sm text-gray-500 hover:underline">
            전체보기
          </Link>
        </div>
        <ul className="divide-y divide-gray-200 rounded border border-gray-200 bg-white">
          {notices.map((n) => (
            <li key={n.id} className="px-4 py-3">
              <Link href={`/notices/${n.id}`} className="text-sm font-medium text-gray-900 hover:underline">
                {n.isPinned ? "📌 " : ""}
                {n.title}
              </Link>
              <p className="mt-1 text-xs text-gray-500">
                {formatDateTime(n.createdAt)}
              </p>
            </li>
          ))}
          {notices.length === 0 && (
            <li className="px-4 py-3 text-sm text-gray-500">등록된 공지사항이 없습니다.</li>
          )}
        </ul>
      </section>
    </div>
  );
}
