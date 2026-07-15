import { prisma } from "@/lib/prisma";
import { requireRole, ADMIN_ROLES } from "@/lib/rbac";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { approveFinalManuscript, rejectFinalManuscript } from "@/lib/actions/submissions";
import { formatDateTime } from "@/lib/date";
import { FileActions } from "@/components/file-actions";

export default async function FinalManuscriptReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole(ADMIN_ROLES);
  const { id } = await params;

  const submission = await prisma.submission.findUnique({
    where: { id },
    include: {
      volume: true,
      author: true,
      files: { where: { kind: "FINAL_MANUSCRIPT" }, orderBy: { uploadedAt: "desc" } },
    },
  });
  if (!submission) notFound();
  if (!submission.finalManuscriptSubmittedAt) {
    redirect(`/admin/submissions`);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded border border-gray-200 bg-white p-6">
        <p className="text-sm text-gray-500">
          심사번호 {String(submission.caseNumber).padStart(4, "0")} · {submission.volume.label} ·{" "}
          저자: {submission.author.name}
        </p>
        <h1 className="text-xl font-bold text-gray-900">{submission.title}</h1>
        <p className="mt-1 text-sm text-gray-600">
          최종 원고 제출일: {formatDateTime(submission.finalManuscriptSubmittedAt)}
        </p>
        {submission.finalManuscriptApprovedAt && (
          <p className="mt-1 text-sm font-medium text-green-700">
            승인일: {formatDateTime(submission.finalManuscriptApprovedAt)}
          </p>
        )}
      </div>

      <div className="rounded border border-gray-200 bg-white p-6">
        <h2 className="mb-3 text-sm font-semibold text-gray-900">최종 원고 파일</h2>
        <ul className="space-y-1 text-sm">
          {submission.files.map((f) => (
            <li key={f.id}>
              <FileActions fileId={f.id} mimeType={f.mimeType} label={f.originalName} />{" "}
              <span className="text-xs text-gray-500">({formatDateTime(f.uploadedAt)})</span>
            </li>
          ))}
          {submission.files.length === 0 && (
            <li className="text-gray-500">제출된 최종 원고 파일이 없습니다.</li>
          )}
        </ul>
      </div>

      <div className="rounded border border-gray-200 bg-white p-6">
        <h2 className="mb-3 text-sm font-semibold text-gray-900">최종 확인</h2>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/admin/submissions"
            className="rounded border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            목록으로
          </Link>
          {!submission.finalManuscriptApprovedAt && (
            <form
              action={async () => {
                "use server";
                await approveFinalManuscript(submission.id);
              }}
            >
              <button
                type="submit"
                className="rounded bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
              >
                확인 · 승인
              </button>
            </form>
          )}
          <details className="inline-block">
            <summary className="cursor-pointer rounded border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50">
              반려 (잘못 제출된 경우)
            </summary>
            <form
              action={async (formData) => {
                "use server";
                const note = String(formData.get("note") ?? "").trim();
                await rejectFinalManuscript(submission.id, note);
              }}
              className="mt-2 flex max-w-md flex-col gap-2 rounded border border-gray-200 bg-gray-50 p-3"
            >
              <label className="text-xs font-medium text-gray-700">
                반려 사유 (저자에게 전달됩니다)
              </label>
              <textarea
                name="note"
                required
                rows={3}
                placeholder="예: 잘못된 파일이 첨부되어 다시 제출 바랍니다."
                className="rounded border border-gray-300 px-2 py-1.5 text-sm"
              />
              <button
                type="submit"
                className="w-fit rounded bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700"
              >
                반려 확정 (재제출 요청)
              </button>
            </form>
          </details>
        </div>
      </div>
    </div>
  );
}
