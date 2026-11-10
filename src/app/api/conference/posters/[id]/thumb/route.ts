import { prisma } from "@/lib/prisma";
import { getPosterThumbnail } from "@/lib/poster-thumb";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const file = await prisma.submissionFile.findFirst({
    where: {
      id,
      kind: "MAIN",
      submission: {
        status: "ACCEPTED",
        conferenceFormat: { in: ["POSTER", "ARTWORK"] },
        volume: { type: "CONFERENCE" },
      },
    },
  });
  if (!file) return new Response("Not found", { status: 404 });

  try {
    const thumb = await getPosterThumbnail(file);
    return new Response(new Uint8Array(thumb), {
      headers: {
        "Content-Type": "image/webp",
        "Cache-Control": "public, max-age=60",
      },
    });
  } catch (e) {
    console.error("[poster-thumb] failed", id, e);
    return new Response("Thumbnail unavailable", { status: 500 });
  }
}
