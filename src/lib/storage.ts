import { randomUUID } from "crypto";
import path from "path";
import fs from "fs/promises";

const UPLOAD_DIR = process.env.UPLOAD_DIR ?? "./uploads";

function sanitizeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-150);
}

export async function saveUploadedFile(
  subDir: string,
  file: File,
): Promise<{ storedPath: string; originalName: string; sizeBytes: number; mimeType: string }> {
  const dir = path.join(UPLOAD_DIR, subDir);
  await fs.mkdir(dir, { recursive: true });

  const safeName = sanitizeFileName(file.name);
  const fileName = `${randomUUID()}-${safeName}`;
  const storedPath = path.join(subDir, fileName);
  const absolutePath = path.join(UPLOAD_DIR, storedPath);

  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(absolutePath, buffer);

  return {
    storedPath,
    originalName: file.name,
    sizeBytes: buffer.length,
    mimeType: file.type || "application/octet-stream",
  };
}

export function resolveStoredPath(storedPath: string) {
  return path.join(UPLOAD_DIR, storedPath);
}

export async function readStoredFile(storedPath: string) {
  return fs.readFile(resolveStoredPath(storedPath));
}
