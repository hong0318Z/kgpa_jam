import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getConferenceSettings } from "@/lib/settings";
import { formatDate } from "@/lib/date";
import { CONFERENCE_FORMAT_LABELS } from "@/lib/labels";
import { ADMIN_ROLES } from "@/lib/rbac";
import { rotatePosterFile } from "@/lib/actions/conference";

export default async function ConferencePage() {
  const { enabled, infoText } = await getConferenceSettings();
  if (!enabled) notFound();

  const session = await auth();
  const isAdmin = !!session?.user && ADMIN_ROLES.includes(session.user.role);
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
                <li key={v.id} className="mb-3">
                  {v.infoImageStoredPath && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={`/api/volumes/${v.id}/info-image`}
                      alt={`${v.label} 안내`}
                      className="mb-2 max-h-[600px] w-auto max-w-full rounded border border-gray-200"
                    />
                  )}
                  {v.label} · 모집기간: {formatDate(v.callStartDate)} ~ {formatDate(v.callEndDate)} · 접수:{" "}
                  {v.conferenceFormats.map((f) => CONFERENCE_FORMAT_LABELS[f] ?? f).join(", ")}
                {v.infoText && (
                    <p className="mt-1 whitespace-pre-wrap text-gray-700">{v.infoText}</p>
                  )}
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
        {posters.length === 0 ? (
          <p className="rounded border border-gray-200 bg-white px-4 py-3 text-sm text-gray-500">
            게재된 포스터 논문이 없습니다.
          </p>
        ) : (
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {posters.map((p) => {
              const file = p.files[0];
              const isVisual =
                (p.conferenceFormat === "POSTER" || p.conferenceFormat === "ARTWORK") && !!file;
              return (
                <li
                  key={p.id}
                  className="flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white"
                >
                  {isVisual ? (
                    <a
                      href={`/api/conference/posters/${file.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block bg-gray-50"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`/api/conference/posters/${file.id}/thumb`}
                        alt={p.title}
                        loading="lazy"
                        className="aspect-[3/4] w-full object-contain"
                      />
                    </a>
                  ) : (
                    <div className="aspect-[3/4] w-full overflow-hidden bg-gray-50 p-4 text-sm text-gray-600">
                      <p className="line-clamp-[12] whitespace-pre-wrap">{p.abstract}</p>
                    </div>
                  )}
                  <div className="flex flex-1 flex-col gap-1 p-4">
                    <p className="font-medium text-gray-900">
                      {p.award && (
                        <span className="mr-2 rounded bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">
                          🏆 {p.award}
                        </span>
                      )}
                      {p.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      {p.coauthors.length > 0
                        ? p.coauthors
                            .map((a) => (a.affiliation ? `${a.name}(${a.affiliation})` : a.name))
                            .join(", ")
                        : (p.pledgeAuthorNames ?? "")}
                    </p>
                    <p className="mt-auto pt-1 text-xs text-gray-400">
                      {p.conferenceFormat ? `${CONFERENCE_FORMAT_LABELS[p.conferenceFormat]} · ` : ""}
                      {p.volume.label}
                    </p>
                    {isAdmin && isVisual && (
                      <div className="flex gap-2 pt-1">
                        <form
                          action={async () => {
                            "use server";
                            await rotatePosterFile(file.id, 270);
                          }}
                        >
                          <button type="submit" className="rounded border border-gray-300 px-2 py-0.5 text-xs text-gray-600 hover:bg-gray-50">
                            ↺ 왼쪽 회전
                          </button>
                        </form>
                        <form
                          action={async () => {
                            "use server";
                            await rotatePosterFile(file.id, 90);
                          }}
                        >
                          <button type="submit" className="rounded border border-gray-300 px-2 py-0.5 text-xs text-gray-600 hover:bg-gray-50">
                            ↻ 오른쪽 회전
                          </button>
                        </form>
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
