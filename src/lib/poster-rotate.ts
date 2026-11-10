import { PDFDocument, degrees } from "pdf-lib";
import sharp from "sharp";

export async function rotatePosterBuffer(
  data: Buffer,
  mimeType: string,
  angle: 90 | 270,
): Promise<Buffer> {
  if (mimeType === "application/pdf") {
    const doc = await PDFDocument.load(data, { ignoreEncryption: true });
    for (const page of doc.getPages()) {
      page.setRotation(degrees((page.getRotation().angle + angle) % 360));
    }
    return Buffer.from(await doc.save());
  }

  // 휴대폰 사진의 EXIF 방향을 먼저 반영한 뒤 회전한다.
  const oriented = await sharp(data).rotate().toBuffer();
  return sharp(oriented).rotate(angle).toBuffer();
}
