import { prisma } from "@/lib/prisma";
import { getDocumentThumbnail, ThumbnailUnsupportedError } from "@/lib/poster-thumb";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const keynote = await prisma.conferenceKeynote.findUnique({ where: { id } });
  if (!keynote?.storedPath || !keynote.mimeType) {
    return new Response("Not found", { status: 404 });
  }

  try {
    const thumb = await getDocumentThumbnail({
      id: keynote.id,
      storedPath: keynote.storedPath,
      mimeType: keynote.mimeType,
    });
    return new Response(new Uint8Array(thumb), {
      headers: {
        "Content-Type": "image/webp",
        "Cache-Control": "public, max-age=300",
      },
    });
  } catch (e) {
    if (e instanceof ThumbnailUnsupportedError) {
      return new Response("No thumbnail", { status: 404 });
    }
    console.error("[keynote-thumb] failed", id, e);
    return new Response("Thumbnail unavailable", { status: 500 });
  }
}
