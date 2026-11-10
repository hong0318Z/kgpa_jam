import { execFile } from "child_process";
import { promisify } from "util";
import os from "os";
import path from "path";
import fs from "fs/promises";
import sharp from "sharp";
import { readStoredFile, resolveStoredPath, writeStoredFile, deleteStoredFile } from "@/lib/storage";

const execFileAsync = promisify(execFile);
const THUMB_WIDTH = 700;

function thumbPath(fileId: string) {
  return `thumbs/${fileId}.webp`;
}

async function renderPdfFirstPage(storedPath: string): Promise<Buffer> {
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "poster-"));
  try {
    const outRoot = path.join(tmpDir, "page");
    await execFileAsync(
      "pdftoppm",
      [
        "-png",
        "-f",
        "1",
        "-l",
        "1",
        "-singlefile",
        "-scale-to-x",
        String(THUMB_WIDTH),
        "-scale-to-y",
        "-1",
        resolveStoredPath(storedPath),
        outRoot,
      ],
      { timeout: 60_000 },
    );
    return await fs.readFile(`${outRoot}.png`);
  } finally {
    await fs.rm(tmpDir, { recursive: true, force: true });
  }
}

export async function getPosterThumbnail(file: {
  id: string;
  storedPath: string;
  mimeType: string;
}): Promise<Buffer> {
  try {
    return await readStoredFile(thumbPath(file.id));
  } catch {
    // 캐시가 없으면 새로 만든다
  }

  const source =
    file.mimeType === "application/pdf"
      ? await renderPdfFirstPage(file.storedPath)
      : await readStoredFile(file.storedPath);

  const thumb = await sharp(source)
    .rotate()
    .resize({ width: THUMB_WIDTH, withoutEnlargement: true })
    .webp({ quality: 80 })
    .toBuffer();

  await writeStoredFile(thumbPath(file.id), thumb);
  return thumb;
}

export async function invalidatePosterThumbnail(fileId: string) {
  await deleteStoredFile(thumbPath(fileId));
}
