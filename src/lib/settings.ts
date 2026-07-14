import { prisma } from "@/lib/prisma";

const SETTINGS_ID = "singleton";

export async function getMaintenanceMode(): Promise<boolean> {
  const settings = await prisma.siteSettings.findUnique({ where: { id: SETTINGS_ID } });
  return settings?.maintenanceMode ?? true;
}

export async function getOgSettings() {
  const settings = await prisma.siteSettings.findUnique({ where: { id: SETTINGS_ID } });
  return {
    ogTitle: settings?.ogTitle ?? null,
    ogDescription: settings?.ogDescription ?? null,
    ogImageStoredPath: settings?.ogImageStoredPath ?? null,
    ogImageMimeType: settings?.ogImageMimeType ?? null,
  };
}

export { SETTINGS_ID };
