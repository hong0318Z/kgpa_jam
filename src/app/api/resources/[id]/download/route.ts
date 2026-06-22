import { prisma } from "@/lib/prisma";
import { readStoredFile } from "@/lib/storage";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const resource = await prisma.resource.findUnique({ where: { id } });
  if (!resource) {
    return new Response("Not found", { status: 404 });
  }

  const buffer = await readStoredFile(resource.storedPath);
  return new Response(buffer, {
    headers: {
      "Content-Type": resource.mimeType,
      "Content-Disposition": `attachment; filename="${encodeURIComponent(resource.originalName)}"`,
    },
  });
}
