import { prisma } from "@/lib/prisma";
import { readStoredFile } from "@/lib/storage";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const volume = await prisma.volume.findUnique({ where: { id } });
  if (!volume || !volume.compiledFileStoredPath || !volume.compiledFileOriginalName) {
    return new Response("Not found", { status: 404 });
  }

  const buffer = await readStoredFile(volume.compiledFileStoredPath);
  return new Response(buffer, {
    headers: {
      "Content-Type": volume.compiledFileMimeType ?? "application/pdf",
      "Content-Disposition": `attachment; filename="${encodeURIComponent(volume.compiledFileOriginalName)}"`,
    },
  });
}
