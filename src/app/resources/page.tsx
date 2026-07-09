import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { deleteResource } from "@/lib/actions/resources";
import { ADMIN_ROLES } from "@/lib/rbac";
import { formatDateTime } from "@/lib/date";

export default async function ResourcesPage() {
  const session = await auth();
  const resources = await prisma.resource.findMany({
    orderBy: { createdAt: "desc" },
    include: { uploadedBy: true },
  });

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">자료실 (투고양식 다운로드)</h1>
        {session?.user && ADMIN_ROLES.includes(session.user.role) && (
          <Link
            href="/admin/resources/new"
            className="rounded bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-700"
          >
            자료 업로드
          </Link>
        )}
      </div>
      <ul className="divide-y divide-gray-200 rounded border border-gray-200 bg-white">
        {resources.map((r) => (
          <li key={r.id} className="flex items-center justify-between px-4 py-3">
            <div>
              <a
                href={`/api/resources/${r.id}/download`}
                className="font-medium text-gray-900 hover:underline"
              >
                {r.title}
              </a>
              {r.description && <p className="mt-1 text-sm text-gray-600">{r.description}</p>}
              <p className="mt-1 text-xs text-gray-500">
                {r.uploadedBy.name} · {formatDateTime(r.createdAt)}
              </p>
            </div>
            {session?.user && ADMIN_ROLES.includes(session.user.role) && (
              <form
                action={async () => {
                  "use server";
                  await deleteResource(r.id);
                }}
              >
                <button type="submit" className="text-sm text-red-600 hover:underline">
                  삭제
                </button>
              </form>
            )}
          </li>
        ))}
        {resources.length === 0 && (
          <li className="px-4 py-3 text-sm text-gray-500">등록된 자료가 없습니다.</li>
        )}
      </ul>
    </div>
  );
}
