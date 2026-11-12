import { prisma } from "@/lib/prisma";
import { readStoredFile } from "@/lib/storage";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const photo = await prisma.conferencePhoto.findUnique({ where: { id } });
  if (!photo) return new Response("Not found", { status: 404 });

  const buffer = await readStoredFile(photo.storedPath);
  return new Response(buffer, {
    headers: {
      "Content-Type": photo.mimeType,
      "Cache-Control": "public, max-age=3600",
    },
  });
}
