import { prisma } from "@/lib/prisma";

const SETTINGS_ID = "singleton";

export async function getMaintenanceMode(): Promise<boolean> {
  const settings = await prisma.siteSettings.findUnique({ where: { id: SETTINGS_ID } });
  return settings?.maintenanceMode ?? true;
}

export { SETTINGS_ID };
