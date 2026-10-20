import { prisma } from "@/lib/prisma";
import { readStoredFile } from "@/lib/storage";

export const runtime = "nodejs";

const INLINE_MIME = ["application/pdf", "image/png", "image/jpeg"];

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
        conferenceFormat: "POSTER",
        volume: { type: "CONFERENCE" },
      },
    },
  });
  if (!file || !INLINE_MIME.includes(file.mimeType)) {
    return new Response("Not found", { status: 404 });
  }

  const buffer = await readStoredFile(file.storedPath);
  return new Response(buffer, {
    headers: {
      "Content-Type": file.mimeType,
      "Content-Disposition": "inline",
      "Cache-Control": "public, max-age=300",
    },
  });
}
