import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/date";

export default async function JournalPage() {
  const volumes = await prisma.volume.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: {
          submissions: {
            where: { status: "ACCEPTED", finalManuscriptApprovedAt: { not: null } },
          },
        },
      },
    },
  });

  return (
    <div>
      <h1 className="mb-1 text-xl font-bold text-gray-900">학술지</h1>
      <p className="mb-6 text-sm text-gray-500">
        한국게임정책학회 「인터랙티브미디어저널」 발행 호별 게재논문을 확인하실 수 있습니다.
      </p>
      <ul className="divide-y divide-gray-200 rounded border border-gray-200 bg-white">
        {volumes.map((v) => (
          <li key={v.id} className="px-4 py-3">
            <Link href={`/journal/${v.id}`} className="font-medium text-gray-900 hover:underline">
              {v.label}
            </Link>
            <p className="mt-1 text-xs text-gray-500">
              발간예정일: {formatDate(v.plannedPublishDate)} · 게재논문 {v._count.submissions}편
            </p>
          </li>
        ))}
        {volumes.length === 0 && (
          <li className="px-4 py-3 text-sm text-gray-500">등록된 발행 호가 없습니다.</li>
        )}
      </ul>
    </div>
  );
}
