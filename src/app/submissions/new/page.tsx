import { prisma } from "@/lib/prisma";
import { requireRole, ADMIN_ROLES } from "@/lib/rbac";
import { SubmissionForm } from "./submission-form";
import { PledgeGate } from "@/components/pledge-gate";

export default async function NewSubmissionPage() {
  await requireRole(["AUTHOR", ...ADMIN_ROLES]);
  const volumes = await prisma.volume.findMany({
    where: { status: "OPEN" },
    orderBy: { callStartDate: "desc" },
  });

  return (
    <div className="w-full">
      <h1 className="mb-2 text-xl font-bold text-gray-900">논문 투고</h1>
      <p className="mb-6 text-sm text-gray-500">「인터랙티브미디어저널」 투고 양식은 자료실에서 확인하실 수 있습니다.</p>
      <PledgeGate>
        <SubmissionForm volumes={volumes} />
      </PledgeGate>
    </div>
  );
}
