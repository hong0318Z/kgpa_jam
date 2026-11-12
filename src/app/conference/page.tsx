import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getConferenceSettings } from "@/lib/settings";
import { formatDate } from "@/lib/date";
import { CONFERENCE_FORMAT_LABELS } from "@/lib/labels";
import { ADMIN_ROLES } from "@/lib/rbac";
import { rotatePosterFile } from "@/lib/actions/conference";
import { FileViewerModal } from "./file-viewer-modal";
import { PhotoGallery } from "./photo-gallery";

const DEFAULT_HOST = "한국게임정책학회";

function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default async function ConferencePage() {
  const { enabled, infoText, imageStoredPath } = await getConferenceSettings();
  if (!enabled) notFound();

  const session = await auth();
  const isAdmin = !!session?.user && ADMIN_ROLES.includes(session.user.role);

  const volumes = await prisma.volume.findMany({
    where: { type: "CONFERENCE" },
    orderBy: { callStartDate: "desc" },
    include: {
      materials: { orderBy: { createdAt: "asc" } },
      greetings: { orderBy: { createdAt: "asc" } },
      keynotes: { orderBy: { createdAt: "asc" } },
      photos: { orderBy: { createdAt: "asc" } },
      submissions: {
        where: { status: "ACCEPTED" },
        include: {
          coauthors: { orderBy: { order: "asc" } },
          files: { where: { kind: "MAIN" }, orderBy: { version: "asc" }, take: 1 },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  return (
    <div className="flex flex-col gap-10">
      <section className="rounded-lg border border-gray-200 border-l-4 border-l-indigo-500 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">📣 학술대회</h1>
        {imageStoredPath && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src="/api/site/conference-image"
            alt="학술대회 메인 포스터"
            className="mt-3 max-h-[600px] w-auto max-w-full rounded border border-gray-200"
          />
        )}
        {infoText && <p className="mt-3 whitespace-pre-wrap text-sm text-gray-700">{infoText}</p>}
        {volumes.length === 0 && (
          <p className="mt-3 text-sm text-gray-500">등록된 학술대회가 없습니다.</p>
        )}
      </section>

      {volumes.map((v) => {
        const isOpen = v.status === "OPEN";
        const numbered = v.submissions.map((s, i) => ({
          ...s,
          number: `P-${String(i + 1).padStart(2, "0")}`,
        }));
        const isTopAward = (award: string | null) => !!award && award.includes("최우수");
        const topPosters = numbered.filter((p) => isTopAward(p.award));
        const otherPosters = shuffle(numbered.filter((p) => !isTopAward(p.award)));
        const displayPosters = [...topPosters, ...otherPosters];

        const navItems = [
          v.greetings.length > 0 && { id: `greeting-${v.id}`, label: "축사" },
          v.keynotes.length > 0 && { id: `keynote-${v.id}`, label: "특강" },
          v.materials.length > 0 && { id: `materials-${v.id}`, label: "발표자료" },
          v.submissions.length > 0 && { id: `poster-${v.id}`, label: "포스터" },
          v.photos.length > 0 && { id: `sketch-${v.id}`, label: "현장 스케치" },
        ].filter((x): x is { id: string; label: string } => !!x);

        return (
          <div
            key={v.id}
            className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
          >
            {/* 히어로 */}
            <div className="border-b border-gray-200 bg-gradient-to-b from-indigo-50 to-white px-6 py-10 text-center">
              <span className="inline-block rounded-full bg-indigo-100 px-4 py-1 text-xs font-bold tracking-wide text-indigo-700">
                {isOpen ? "투고 모집중" : "학술대회"}
              </span>
              <h2 className="mt-3 text-2xl font-bold text-gray-900 sm:text-3xl">{v.label}</h2>
              <div className="mt-4 flex flex-wrap justify-center gap-x-6 gap-y-1.5 text-sm text-gray-600">
                <span>📅 {formatDate(v.callStartDate)} ~ {formatDate(v.callEndDate)}</span>
                {v.location && <span>📍 {v.location}</span>}
                <span>👥 주최: {v.host || DEFAULT_HOST}</span>
              </div>
              {v.infoImageStoredPath && (
                <div className="mx-auto mt-6 max-w-3xl">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/api/volumes/${v.id}/info-image`}
                    alt={`${v.label} 안내`}
                    className="w-full rounded-lg border border-gray-200"
                  />
                </div>
              )}
              {v.infoText && (
                <p className="mx-auto mt-4 max-w-2xl whitespace-pre-wrap text-sm text-gray-700">
                  {v.infoText}
                </p>
              )}
              {isOpen && (
                <div className="mt-6">
                  <Link
                    href={session?.user ? "/conference/new" : "/login"}
                    className="inline-block rounded bg-gray-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-700"
                  >
                    학술대회 투고하기
                  </Link>
                  {!session?.user && (
                    <p className="mt-2 text-xs text-gray-500">
                      투고하려면 로그인이 필요합니다. 로그인 후 이 페이지에서 다시 눌러 주세요.
                    </p>
                  )}
                </div>
              )}
            </div>

            {navItems.length > 0 && (
              <nav className="flex flex-wrap gap-1 border-b border-gray-200 bg-white px-4 py-2">
                {navItems.map((n) => (
                  <a
                    key={n.id}
                    href={`#${n.id}`}
                    className="rounded px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  >
                    {n.label}
                  </a>
                ))}
              </nav>
            )}

            <div className="flex flex-col gap-10 p-6">
              {/* 축사 */}
              {v.greetings.length > 0 && (
                <section id={`greeting-${v.id}`} className="scroll-mt-16">
                  <p className="text-xs font-bold uppercase tracking-wide text-indigo-600">Greetings</p>
                  <h3 className="mb-4 text-lg font-semibold text-gray-900">축사</h3>
                  <div className="flex flex-col gap-4">
                    {v.greetings.map((g) => (
                      <div
                        key={g.id}
                        className="grid grid-cols-1 gap-4 rounded-lg border border-gray-200 p-6 sm:grid-cols-[1fr_140px]"
                      >
                        <p className="whitespace-pre-wrap text-sm leading-7 text-gray-700">{g.body}</p>
                        <div className="flex flex-col items-center text-center">
                          {g.photoStoredPath ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={`/api/conference/greeting-photo/${g.id}`}
                              alt={g.name}
                              className="mb-2 h-20 w-20 rounded-full border border-gray-200 object-cover"
                            />
                          ) : (
                            <div className="mb-2 flex h-20 w-20 items-center justify-center rounded-full border border-indigo-200 bg-indigo-50 text-lg font-bold text-indigo-700">
                              {g.name.slice(0, 1)}
                            </div>
                          )}
                          <p className="text-sm font-bold text-gray-900">{g.name}</p>
                          {g.org && <p className="text-xs text-gray-500">{g.org}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* 특강 */}
              {v.keynotes.length > 0 && (
                <section id={`keynote-${v.id}`} className="scroll-mt-16">
                  <p className="text-xs font-bold uppercase tracking-wide text-indigo-600">Keynote</p>
                  <h3 className="mb-4 text-lg font-semibold text-gray-900">특강</h3>
                  <div className="flex flex-col gap-2">
                    {v.keynotes.map((k) => (
                      <div
                        key={k.id}
                        className="flex items-start justify-between gap-4 rounded-lg border border-gray-200 p-4"
                      >
                        <div>
                          <p className="text-sm font-medium text-gray-900">{k.title}</p>
                          <p className="text-xs text-gray-500">{k.speaker}</p>
                        </div>
                        <div className="flex shrink-0 flex-col items-end gap-1">
                          {k.timeLabel && <span className="text-xs text-gray-400">{k.timeLabel}</span>}
                          {k.storedPath && (
                            <FileViewerModal
                              src={`/api/conference/keynote-file/${k.id}`}
                              title={k.title}
                              isImage={false}
                              trigger={
                                <span className="inline-flex items-center gap-1 rounded bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700 hover:bg-indigo-100">
                                  🔗 보기
                                </span>
                              }
                            />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* 발표자료 */}
              {v.materials.length > 0 && (
                <section id={`materials-${v.id}`} className="scroll-mt-16">
                  <p className="text-xs font-bold uppercase tracking-wide text-sky-600">Materials</p>
                  <h3 className="mb-1 text-lg font-semibold text-gray-900">발표자료</h3>
                  <p className="mb-3 text-xs text-gray-500">
                    행사 전에 미리 공개된 발표·발제 자료입니다. 로그인 없이 내려받을 수 있습니다.
                  </p>
                  <ol className="flex flex-col gap-1">
                    {v.materials.map((m, i) => (
                      <li key={m.id} className="flex items-center gap-2 text-sm">
                        <span className="text-gray-400">{i + 1}.</span>
                        <a href={`/api/volumes/materials/${m.id}`} className="text-blue-700 underline">
                          {m.title}
                        </a>
                      </li>
                    ))}
                  </ol>
                </section>
              )}

              {/* 포스터 */}
              {v.submissions.length > 0 && (
                <section id={`poster-${v.id}`} className="scroll-mt-16">
                  <p className="text-xs font-bold uppercase tracking-wide text-amber-600">
                    Poster Session
                  </p>
                  <h3 className="mb-4 text-lg font-semibold text-gray-900">포스터 · 논문 발표</h3>
                  <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {displayPosters.map((p) => {
                      const file = p.files[0];
                      const isVisual =
                        (p.conferenceFormat === "POSTER" || p.conferenceFormat === "ARTWORK") &&
                        !!file;
                      const authorLine =
                        p.coauthors.length > 0
                          ? p.coauthors
                              .map((a) => (a.affiliation ? `${a.name}(${a.affiliation})` : a.name))
                              .join(", ")
                          : (p.pledgeAuthorNames ?? "");

                      return (
                        <li
                          key={p.id}
                          className="flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white"
                        >
                          {isVisual ? (
                            <FileViewerModal
                              src={`/api/conference/posters/${file.id}?v=${file.sizeBytes}`}
                              title={p.title}
                              isImage={file.mimeType.startsWith("image/")}
                              trigger={
                                <div className="block bg-gray-50">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    src={`/api/conference/posters/${file.id}/thumb?v=${file.sizeBytes}`}
                                    alt={p.title}
                                    loading="lazy"
                                    className="aspect-[3/4] w-full object-contain"
                                  />
                                </div>
                              }
                            />
                          ) : (
                            <div className="aspect-[3/4] w-full overflow-hidden bg-gray-50 p-4 text-sm text-gray-600">
                              <p className="line-clamp-[12] whitespace-pre-wrap">{p.abstract}</p>
                            </div>
                          )}
                          <div className="flex flex-1 flex-col gap-1 p-4">
                            <p className="text-[11px] font-bold tracking-wide text-emerald-700">
                              {p.number}
                            </p>
                            <p className="font-medium text-gray-900">
                              {p.award && (
                                <span className="mr-2 rounded bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">
                                  🏆 {p.award}
                                </span>
                              )}
                              {p.title}
                            </p>
                            <p className="text-xs text-gray-500">{authorLine}</p>
                            <p className="mt-auto pt-1 text-xs text-gray-400">
                              {p.conferenceFormat ? CONFERENCE_FORMAT_LABELS[p.conferenceFormat] : ""}
                            </p>
                            {isAdmin && isVisual && (
                              <div className="flex gap-2 pt-1">
                                <form
                                  action={async () => {
                                    "use server";
                                    await rotatePosterFile(file.id, 270);
                                  }}
                                >
                                  <button
                                    type="submit"
                                    className="rounded border border-gray-300 px-2 py-0.5 text-xs text-gray-600 hover:bg-gray-50"
                                  >
                                    ↺ 왼쪽 회전
                                  </button>
                                </form>
                                <form
                                  action={async () => {
                                    "use server";
                                    await rotatePosterFile(file.id, 90);
                                  }}
                                >
                                  <button
                                    type="submit"
                                    className="rounded border border-gray-300 px-2 py-0.5 text-xs text-gray-600 hover:bg-gray-50"
                                  >
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
                </section>
              )}

              {/* 현장 스케치 */}
              {v.photos.length > 0 && (
                <section id={`sketch-${v.id}`} className="scroll-mt-16">
                  <p className="text-xs font-bold uppercase tracking-wide text-rose-600">
                    Field Sketch
                  </p>
                  <h3 className="mb-4 text-lg font-semibold text-gray-900">현장 스케치</h3>
                  <PhotoGallery
                    photos={v.photos.map((p) => ({ id: p.id, caption: p.caption }))}
                  />
                </section>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
