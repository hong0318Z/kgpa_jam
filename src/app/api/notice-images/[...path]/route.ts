import { readStoredFile } from "@/lib/storage";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path: segments } = await params;
  if (segments.some((s) => s.includes("..") || s.includes("/") || s.includes("\\"))) {
    return new Response("Not found", { status: 404 });
  }

  try {
    const buffer = await readStoredFile(["notice-images", ...segments].join("/"));
    return new Response(buffer, {
      headers: {
        "Content-Type": "image/webp",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
