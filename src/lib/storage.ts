import { randomUUID } from "crypto";
import path from "path";
import fs from "fs/promises";
import sharp from "sharp";

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

export async function saveUploadedImage(
  subDir: string,
  file: File,
): Promise<{ storedPath: string; sizeBytes: number; mimeType: string }> {
  const dir = path.join(UPLOAD_DIR, subDir);
  await fs.mkdir(dir, { recursive: true });

  const fileName = `${randomUUID()}.webp`;
  const storedPath = path.join(subDir, fileName);
  const absolutePath = path.join(UPLOAD_DIR, storedPath);

  const inputBuffer = Buffer.from(await file.arrayBuffer());
  const outputBuffer = await sharp(inputBuffer)
    .resize({ width: 1600, withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer();

  await fs.writeFile(absolutePath, outputBuffer);

  return {
    storedPath,
    sizeBytes: outputBuffer.length,
    mimeType: "image/webp",
  };
}

export function resolveStoredPath(storedPath: string) {
  return path.join(UPLOAD_DIR, storedPath);
}

export async function readStoredFile(storedPath: string) {
  return fs.readFile(resolveStoredPath(storedPath));
}

export async function deleteStoredFile(storedPath: string) {
  try {
    await fs.unlink(resolveStoredPath(storedPath));
  } catch {
    // 이미 없으면 무시
  }
}
