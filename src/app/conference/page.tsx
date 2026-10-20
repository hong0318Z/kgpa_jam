import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getConferenceSettings } from "@/lib/settings";
import { formatDate } from "@/lib/date";

export default async function ConferencePage() {
  const { enabled, infoText } = await getConferenceSettings();
  if (!enabled) notFound();

  const session = await auth();
  const openVolumes = await prisma.volume.findMany({
    where: { type: "CONFERENCE", status: "OPEN" },
    orderBy: { callStartDate: "desc" },
  });
  const posters = await prisma.submission.findMany({
    where: { status: "ACCEPTED", volume: { type: "CONFERENCE" } },
    include: {
      volume: true,
      coauthors: { orderBy: { order: "asc" } },
      files: { where: { kind: "MAIN" }, orderBy: { version: "asc" }, take: 1 },
    },
    orderBy: [{ award: { sort: "asc", nulls: "last" } }, { createdAt: "asc" }],
  });

  return (
    <div className="flex flex-col gap-8">
      <section className="rounded-lg border border-gray-200 bg-white p-6">
        <h1 className="text-2xl font-bold text-gray-900">학술대회</h1>
        {infoText && (
          <p className="mt-3 whitespace-pre-wrap text-sm text-gray-700">{infoText}</p>
        )}
        {openVolumes.length > 0 ? (
          <>
            <ul className="mt-3 text-sm text-gray-600">
              {openVolumes.map((v) => (
                <li key={v.id}>
                  {v.label} · 모집기간: {formatDate(v.callStartDate)} ~ {formatDate(v.callEndDate)}
                </li>
              ))}
            </ul>
            <Link
              href={session?.user ? "/conference/new" : "/login"}
              className="mt-4 inline-block rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
            >
              학술대회 투고하기
            </Link>
            {!session?.user && (
              <p className="mt-2 text-xs text-gray-500">
                투고하려면 로그인이 필요합니다. 로그인 후 이 페이지에서 다시 눌러 주세요.
              </p>
            )}
          </>
        ) : (
          <p className="mt-3 text-sm text-gray-500">현재 투고를 받고 있지 않습니다.</p>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-gray-900">게재된 포스터 · 논문</h2>
        <ul className="divide-y divide-gray-200 rounded border border-gray-200 bg-white">
          {posters.map((p) => (
            <li key={p.id} className="px-4 py-3">
              <p className="font-medium text-gray-900">
                {p.award && (
                  <span className="mr-2 rounded bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">
                    🏆 {p.award}
                  </span>
                )}
                {p.title}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                {p.coauthors.length > 0
                  ? p.coauthors
                      .map((a) => (a.affiliation ? `${a.name}(${a.affiliation})` : a.name))
                      .join(", ")
                  : (p.pledgeAuthorNames ?? "")}{" "}
                · {p.volume.label}
              </p>
              {p.conferenceFormat === "POSTER" && p.files[0] ? (
                p.files[0].mimeType.startsWith("image/") ? (
                  <a href={`/api/conference/posters/${p.files[0].id}`} target="_blank" rel="noopener noreferrer">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`/api/conference/posters/${p.files[0].id}`}
                      alt={p.title}
                      className="mt-3 max-h-[600px] w-auto max-w-full rounded border border-gray-200"
                    />
                  </a>
                ) : (
                  <a
                    href={`/api/conference/posters/${p.files[0].id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-block text-sm text-blue-600 underline"
                  >
                    포스터 보기 (PDF)
                  </a>
                )
              ) : (
                p.abstract && (
                  <p className="mt-2 whitespace-pre-wrap text-sm text-gray-700">{p.abstract}</p>
                )
              )}
            </li>
          ))}
          {posters.length === 0 && (
            <li className="px-4 py-3 text-sm text-gray-500">게재된 포스터 논문이 없습니다.</li>
          )}
        </ul>
      </section>
    </div>
  );
}
