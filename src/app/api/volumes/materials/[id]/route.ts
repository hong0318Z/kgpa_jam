import { prisma } from "@/lib/prisma";
import { readStoredFile } from "@/lib/storage";

export const runtime = "nodejs";

// 행사 전에 참가자가 미리 볼 수 있도록 공개한 발표자료라 로그인 없이도 내려받을 수 있다.
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const download = new URL(request.url).searchParams.get("download") === "1";

  const material = await prisma.volumeMaterial.findUnique({ where: { id } });
  if (!material) return new Response("Not found", { status: 404 });

  const buffer = await readStoredFile(material.storedPath);
  const disposition = download ? "attachment" : "inline";
  return new Response(buffer, {
    headers: {
      "Content-Type": material.mimeType,
      "Content-Disposition": `${disposition}; filename="${encodeURIComponent(material.originalName)}"`,
    },
  });
}
