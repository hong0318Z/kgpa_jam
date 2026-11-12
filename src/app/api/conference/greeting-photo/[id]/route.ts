import { prisma } from "@/lib/prisma";
import { readStoredFile } from "@/lib/storage";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const greeting = await prisma.conferenceGreeting.findUnique({ where: { id } });
  if (!greeting?.photoStoredPath) return new Response("Not found", { status: 404 });

  const buffer = await readStoredFile(greeting.photoStoredPath);
  return new Response(buffer, {
    headers: {
      "Content-Type": greeting.photoMimeType ?? "image/webp",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
