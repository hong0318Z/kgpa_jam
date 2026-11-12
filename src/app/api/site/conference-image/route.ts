import { prisma } from "@/lib/prisma";
import { readStoredFile } from "@/lib/storage";
import { SETTINGS_ID } from "@/lib/settings";

export const runtime = "nodejs";

export async function GET() {
  const settings = await prisma.siteSettings.findUnique({ where: { id: SETTINGS_ID } });
  if (!settings?.conferenceImageStoredPath) {
    return new Response("Not found", { status: 404 });
  }

  try {
    const buffer = await readStoredFile(settings.conferenceImageStoredPath);
    return new Response(buffer, {
      headers: {
        "Content-Type": settings.conferenceImageMimeType ?? "image/webp",
        "Cache-Control": "public, max-age=300",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
