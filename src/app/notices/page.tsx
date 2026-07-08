import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { ADMIN_ROLES } from "@/lib/rbac";
import { extractFirstImageUrl } from "@/lib/markdown";

export default async function NoticesPage() {
  const session = await auth();
  const notices = await prisma.notice.findMany({
    orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
    include: { author: true },
  });

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">공지사항</h1>
        {session?.user && ADMIN_ROLES.includes(session.user.role) && (
          <Link
            href="/admin/notices/new"
            className="rounded bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-700"
          >
            새 공지 작성
          </Link>
        )}
      </div>
      <ul className="divide-y divide-gray-200 rounded border border-gray-200 bg-white">
        {notices.map((n) => {
          const thumbUrl = extractFirstImageUrl(n.content);
          return (
            <li key={n.id} className="flex items-center gap-3 px-4 py-3">
              {thumbUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={thumbUrl}
                  alt=""
                  className="h-12 w-12 shrink-0 rounded object-cover"
                />
              )}
              <div className="min-w-0 flex-1">
                <Link href={`/notices/${n.id}`} className="font-medium text-gray-900 hover:underline">
                  {n.isPinned ? "📌 " : ""}
                  {n.title}
                </Link>
                <p className="mt-1 text-xs text-gray-500">
                  {n.author.name} · {n.createdAt.toLocaleString("ko-KR")}
                </p>
              </div>
            </li>
          );
        })}
        {notices.length === 0 && (
          <li className="px-4 py-3 text-sm text-gray-500">등록된 공지사항이 없습니다.</li>
        )}
      </ul>
    </div>
  );
}
