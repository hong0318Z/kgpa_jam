import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { notFound } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { ADMIN_ROLES } from "@/lib/rbac";

const POLICY_TITLES: Record<string, string> = {
  "research-ethics": "연구윤리규정",
  "review-regulation": "심사규정",
  "privacy-policy": "개인정보처리방침",
};

function formatKoreanDate(d: Date) {
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
}

export default async function PolicyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!POLICY_TITLES[slug]) notFound();

  const session = await auth();
  const policy = await prisma.policy.findUnique({ where: { slug } });
  if (!policy) notFound();

  const isEditor = session?.user && ADMIN_ROLES.includes(session.user.role);

  return (
    <article className="rounded border border-gray-200 bg-white p-6">
      <div className="flex items-start justify-between gap-4">
        <h1 className="text-xl font-bold text-gray-900">{policy.title}</h1>
        {isEditor && (
          <Link
            href={`/admin/policies/${slug}/edit`}
            className="shrink-0 rounded border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
          >
            수정
          </Link>
        )}
      </div>
      {policy.effectiveDate && (
        <p className="mt-1 text-xs text-gray-500">
          시행: {formatKoreanDate(policy.effectiveDate)}
        </p>
      )}
      <div className="mt-4 text-sm leading-relaxed text-gray-800 [&_img]:my-2 [&_img]:max-w-full [&_img]:rounded [&_p]:mb-3 [&_h2]:mt-6 [&_h2]:mb-2 [&_h2]:text-base [&_h2]:font-bold [&_h3]:mt-4 [&_h3]:mb-1 [&_h3]:text-sm [&_h3]:font-semibold [&_blockquote]:border-l-2 [&_blockquote]:border-gray-300 [&_blockquote]:pl-3 [&_blockquote]:text-gray-500">
        <ReactMarkdown>{policy.content}</ReactMarkdown>
      </div>
      {policy.revisionDates.length > 0 && (
        <div className="mt-8 border-t border-gray-200 pt-4 text-xs text-gray-500">
          {policy.revisionDates
            .slice()
            .sort((a, b) => a.getTime() - b.getTime())
            .map((d, i) => (
              <p key={i}>{formatKoreanDate(d)} 개정</p>
            ))}
        </div>
      )}
    </article>
  );
}
