import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/rbac";
import { getConferenceSettings } from "@/lib/settings";
import { ConferenceGate } from "./conference-gate";
import { ConferenceSubmitFlow } from "./conference-submit-flow";

export default async function NewConferenceSubmissionPage() {
  await requireSession();
  const { enabled, infoText } = await getConferenceSettings();
  if (!enabled) notFound();

  const volumes = await prisma.volume.findMany({
    where: { type: "CONFERENCE", status: "OPEN" },
    orderBy: { callStartDate: "desc" },
  });

  return (
    <div className="w-full">
      <h1 className="mb-2 text-xl font-bold text-gray-900">학술대회 투고</h1>
      <ConferenceGate infoText={infoText}>
        <ConferenceSubmitFlow volumes={volumes} />
      </ConferenceGate>
    </div>
  );
}
