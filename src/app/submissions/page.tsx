import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/rbac";
import { formatDateTime } from "@/lib/date";
import { SUBMISSION_STATUS_LABELS } from "@/lib/labels";
import { WithdrawSubmissionButton } from "./withdraw-submission-button";

const WITHDRAWABLE_STATUSES = ["SUBMITTED", "UNDER_REVIEW", "REVISION_REQUESTED"];

export default async function SubmissionsPage() {
  const session = await requireSession();
  const submissions = await prisma.submission.findMany({
    where: { authorId: session.user.id },
    include: { volume: true },
    orderBy: { createdAt: "desc" },
  });

  const published = submissions.filter(
    (s) => s.status === "ACCEPTED" && s.finalManuscriptApprovedAt,
  );
  const inProgress = submissions.filter(
    (s) => !(s.status === "ACCEPTED" && s.finalManuscriptApprovedAt),
  );

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">내 투고 목록</h1>
        <Link
          href="/submissions/new"
          className="rounded bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-700"
        >
          새 논문 투고
        </Link>
      </div>

      <ul className="mb-6 divide-y divide-gray-200 rounded border border-gray-200 bg-white">
        {inProgress.map((s) => (
          <li key={s.id} className="flex items-center justify-between gap-2 px-4 py-3">
            <Link href={`/submissions/${s.id}`} className="min-w-0 flex-1">
              <p className="truncate font-medium text-gray-900 hover:underline">{s.title}</p>
              <p className="mt-1 text-xs text-gray-500">
                {s.volume.label} · {SUBMISSION_STATUS_LABELS[s.status] ?? s.status} ·{" "}
                {formatDateTime(s.createdAt)}
              </p>
            </Link>
            {WITHDRAWABLE_STATUSES.includes(s.status) && (
              <WithdrawSubmissionButton submissionId={s.id} title={s.title} />
            )}
          </li>
        ))}
        {inProgress.length === 0 && (
          <li className="px-4 py-3 text-sm text-gray-500">투고한 논문이 없습니다.</li>
        )}
      </ul>

      <h2 className="mb-2 text-sm font-semibold text-gray-900">게재완료</h2>
      <ul className="divide-y divide-gray-200 rounded border border-gray-200 bg-white">
        {published.map((s) => (
          <li key={s.id} className="px-4 py-3">
            <Link href={`/submissions/${s.id}`} className="font-medium text-gray-900 hover:underline">
              {s.title}
            </Link>
            <p className="mt-1 text-xs text-gray-500">
              {s.volume.label} · 게재완료 ·{" "}
              {s.finalManuscriptApprovedAt ? formatDateTime(s.finalManuscriptApprovedAt) : ""}
            </p>
          </li>
        ))}
        {published.length === 0 && (
          <li className="px-4 py-3 text-sm text-gray-500">게재완료된 논문이 없습니다.</li>
        )}
      </ul>
    </div>
  );
}
