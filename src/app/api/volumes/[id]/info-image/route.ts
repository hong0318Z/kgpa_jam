import { prisma } from "@/lib/prisma";
import { readStoredFile } from "@/lib/storage";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const volume = await prisma.volume.findUnique({
    where: { id },
    select: { infoImageStoredPath: true, infoImageMimeType: true, updatedAt: true },
  });
  if (!volume?.infoImageStoredPath) {
    return new Response("Not found", { status: 404 });
  }

  try {
    const buffer = await readStoredFile(volume.infoImageStoredPath);
    return new Response(buffer, {
      headers: {
        "Content-Type": volume.infoImageMimeType ?? "image/webp",
        "Cache-Control": "public, max-age=300",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
