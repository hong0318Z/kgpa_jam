import { prisma } from "@/lib/prisma";
import { readStoredFile } from "@/lib/storage";

export const runtime = "nodejs";

// 행사 전에 참가자가 미리 볼 수 있도록 공개된 특강 자료라 로그인 없이 열람할 수 있다.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const keynote = await prisma.conferenceKeynote.findUnique({ where: { id } });
  if (!keynote?.storedPath) return new Response("Not found", { status: 404 });

  const buffer = await readStoredFile(keynote.storedPath);
  return new Response(buffer, {
    headers: {
      "Content-Type": keynote.mimeType ?? "application/pdf",
      "Content-Disposition": "inline",
      "Cache-Control": "public, max-age=300",
    },
  });
}
