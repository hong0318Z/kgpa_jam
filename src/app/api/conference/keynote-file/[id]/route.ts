import { prisma } from "@/lib/prisma";
import { readStoredFile } from "@/lib/storage";

export const runtime = "nodejs";

// 행사 전에 참가자가 미리 볼 수 있도록 공개된 특강 자료라 로그인 없이 열람할 수 있다.
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const download = new URL(request.url).searchParams.get("download") === "1";

  const keynote = await prisma.conferenceKeynote.findUnique({ where: { id } });
  if (!keynote?.storedPath) return new Response("Not found", { status: 404 });

  const buffer = await readStoredFile(keynote.storedPath);
  const disposition = download
    ? `attachment; filename="${encodeURIComponent(keynote.originalName ?? "file")}"`
    : "inline";
  return new Response(buffer, {
    headers: {
      "Content-Type": keynote.mimeType ?? "application/pdf",
      "Content-Disposition": disposition,
      "Cache-Control": "public, max-age=300",
    },
  });
}
