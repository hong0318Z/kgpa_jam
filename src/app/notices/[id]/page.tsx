import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { deleteNotice } from "@/lib/actions/notices";
import { notFound, redirect } from "next/navigation";

export default async function NoticeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const notice = await prisma.notice.findUnique({
    where: { id },
    include: { author: true },
  });
  if (!notice) notFound();

  return (
    <article className="rounded border border-gray-200 bg-white p-6">
      <h1 className="text-xl font-bold text-gray-900">{notice.title}</h1>
      <p className="mt-1 text-xs text-gray-500">
        {notice.author.name} · {notice.createdAt.toLocaleString("ko-KR")}
      </p>
      <div className="mt-4 whitespace-pre-wrap text-sm text-gray-800">{notice.content}</div>
      {session?.user.role === "EDITOR" && (
        <form
          action={async () => {
            "use server";
            await deleteNotice(notice.id);
            redirect("/notices");
          }}
          className="mt-6"
        >
          <button type="submit" className="text-sm text-red-600 hover:underline">
            삭제
          </button>
        </form>
      )}
    </article>
  );
}
