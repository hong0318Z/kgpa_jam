import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { formatDate } from "@/lib/date";
import { SUBMISSION_FIELD_LABELS } from "@/lib/labels";

export default async function JournalVolumePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const volume = await prisma.volume.findUnique({
    where: { id },
    include: {
      submissions: {
        where: { status: "ACCEPTED", finalManuscriptApprovedAt: { not: null } },
        include: { coauthors: { orderBy: { order: "asc" } }, author: true },
        orderBy: { finalManuscriptApprovedAt: "asc" },
      },
    },
  });
  if (!volume || volume.status !== "PUBLISHED") notFound();

  return (
    <div>
      <p className="text-sm text-gray-500">발간예정일: {formatDate(volume.plannedPublishDate)}</p>
      <h1 className="mt-1 mb-4 text-xl font-bold text-gray-900">{volume.label}</h1>

      {volume.compiledFileOriginalName && (
        <a
          href={`/api/volumes/${volume.id}/compiled`}
          className="mb-6 inline-flex items-center gap-2 rounded border-2 border-gray-900 bg-white px-4 py-2.5 text-sm font-semibold text-gray-900 hover:bg-gray-900 hover:text-white"
        >
          전체 학술지 다운로드 ({volume.compiledFileOriginalName})
        </a>
      )}

      <div className="flex flex-col gap-4">
        {volume.submissions.map((s) => {
          const authorNames = [
            s.author.name,
            ...s.coauthors.map((c) => c.name),
          ];
          return (
            <details key={s.id} className="rounded border border-gray-200 bg-white p-6">
              <summary className="cursor-pointer text-base font-semibold text-gray-900">
                {s.title}
              </summary>
              <p className="mt-2 text-sm text-gray-600">저자: {authorNames.join(", ")}</p>
              {s.fields.length > 0 && (
                <p className="mt-1 text-xs text-gray-500">
                  분야: {s.fields.map((f) => SUBMISSION_FIELD_LABELS[f] ?? f).join(", ")}
                </p>
              )}
              <p className="mt-3 whitespace-pre-wrap text-sm text-gray-800">{s.abstract}</p>
              {s.keywords.length > 0 && (
                <p className="mt-2 text-xs text-gray-500">키워드: {s.keywords.join(", ")}</p>
              )}
            </details>
          );
        })}
        {volume.submissions.length === 0 && (
          <p className="text-sm text-gray-500">아직 게재된 논문이 없습니다.</p>
        )}
      </div>
    </div>
  );
}
