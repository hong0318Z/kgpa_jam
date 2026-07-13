import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireRole, ADMIN_ROLES } from "@/lib/rbac";
import { formatDateTime } from "@/lib/date";

export default async function AdminPublicationsPage() {
  await requireRole(ADMIN_ROLES);

  const submissions = await prisma.submission.findMany({
    where: { finalManuscriptApprovedAt: { not: null } },
    include: { volume: true, author: true },
    orderBy: [{ volume: { callStartDate: "desc" } }, { finalManuscriptApprovedAt: "desc" }],
  });

  const byVolume = new Map<string, { label: string; items: typeof submissions }>();
  for (const s of submissions) {
    const entry = byVolume.get(s.volumeId) ?? { label: s.volume.label, items: [] };
    entry.items.push(s);
    byVolume.set(s.volumeId, entry);
  }

  return (
    <div>
      <h1 className="mb-1 text-xl font-bold text-gray-900">확정논문</h1>
      <p className="mb-4 text-sm text-gray-500">
        최종 원고가 승인되어 게재가 확정된 논문 목록입니다.
      </p>
      <div className="flex flex-col gap-6">
        {Array.from(byVolume.values()).map((v) => (
          <div key={v.label} className="rounded border border-gray-200 bg-white p-6">
            <h2 className="mb-3 text-base font-semibold text-gray-900">{v.label}</h2>
            <ul className="space-y-2 text-sm">
              {v.items.map((s) => (
                <li key={s.id} className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-gray-800">
                    {s.title}{" "}
                    <span className="text-xs text-gray-500">
                      ({s.author.name} · 승인일:{" "}
                      {s.finalManuscriptApprovedAt ? formatDateTime(s.finalManuscriptApprovedAt) : "-"})
                    </span>
                  </span>
                  <Link
                    href={`/submissions/${s.id}`}
                    className="rounded bg-gray-900 px-2.5 py-1 text-xs font-medium text-white hover:bg-gray-700"
                  >
                    상세
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
        {submissions.length === 0 && (
          <p className="text-sm text-gray-500">아직 확정된 논문이 없습니다.</p>
        )}
      </div>
    </div>
  );
}
