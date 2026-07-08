import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { EditPolicyForm } from "./edit-policy-form";

const POLICY_TITLES: Record<string, string> = {
  "research-ethics": "연구윤리규정",
  "review-regulation": "심사규정",
};

export default async function EditPolicyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!POLICY_TITLES[slug]) notFound();

  const policy = await prisma.policy.findUnique({ where: { slug } });
  if (!policy) notFound();

  return (
    <div className="w-full">
      <h1 className="mb-6 text-xl font-bold text-gray-900">{policy.title} 수정</h1>
      <EditPolicyForm slug={slug} title={policy.title} content={policy.content} />
    </div>
  );
}
