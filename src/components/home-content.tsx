import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDate, formatDateTime } from "@/lib/date";
import { auth } from "@/lib/auth";
import { getTodoItems } from "@/lib/todo";
import { getOgSettings, getConferenceSettings } from "@/lib/settings";

export async function HomeContent() {
  const session = await auth();
  const notices = await prisma.notice.findMany({
    orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
    take: 5,
  });
  const openVolumes = await prisma.volume.findMany({
    where: { status: "OPEN", type: "JOURNAL" },
    orderBy: { callStartDate: "desc" },
  });
  const conferenceVolumes = await prisma.volume.findMany({
    where: { status: "OPEN", type: "CONFERENCE" },
    orderBy: { callStartDate: "desc" },
  });
  const todoItems = session?.user ? await getTodoItems(session.user) : [];
  const { ogImageStoredPath } = await getOgSettings();
  const conference = await getConferenceSettings();

  return (
    <div className="flex flex-col gap-10">
      {session?.user && todoItems.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-semibold text-gray-900">해야 할 일</h2>
          <ul className="divide-y divide-gray-200 rounded border border-gray-200 bg-white">
            {todoItems.map((item, i) => (
              <li key={i} className="px-4 py-3">
                <Link
                  href={item.href}
                  className={`text-sm font-medium hover:underline ${
                    item.urgent ? "text-red-600" : "text-gray-900"
                  }`}
                >
                  {item.urgent ? "⚠ " : ""}
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
      {ogImageStoredPath && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src="/api/site/og-image"
          alt=""
          className="w-full rounded-lg border border-gray-200 object-cover"
        />
      )}
      {conference.enabled && (
        <section className="rounded-lg border border-indigo-200 bg-indigo-50 p-6">
          <h2 className="text-lg font-bold text-indigo-900">학술대회</h2>
          {conferenceVolumes.length > 0 ? (
            <ul className="mt-2 space-y-1 text-sm text-indigo-900">
              {conferenceVolumes.map((v) => (
                <li key={v.id}>
                  <span className="font-medium">{v.label}</span>
                  <span className="ml-2 text-indigo-700">
                    모집기간: {formatDate(v.callStartDate)} ~ {formatDate(v.callEndDate)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-indigo-700">현재 투고를 받고 있지 않습니다.</p>
          )}
          <div className="mt-4 flex gap-3">
            {conferenceVolumes.length > 0 && (
              <Link
                href="/conference/new"
                className="rounded bg-indigo-700 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-800"
              >
                학술대회 투고하기
              </Link>
            )}
            <Link
              href="/conference"
              className="rounded border border-indigo-300 bg-white px-4 py-2 text-sm font-medium text-indigo-800 hover:bg-indigo-100"
            >
              안내 · 포스터 논문 보기
            </Link>
          </div>
        </section>
      )}
      <section className="rounded-lg border border-gray-200 bg-white p-6">
        <p className="text-sm text-gray-500">한국게임정책학회</p>
        <h1 className="text-2xl font-bold text-gray-900">
          「인터랙티브미디어저널」 온라인 투고 시스템입니다.
        </h1>
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
