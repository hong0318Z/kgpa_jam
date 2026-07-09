import { getMaintenanceMode } from "@/lib/settings";
import { HomeContent } from "@/components/home-content";

export default async function Home() {
  const maintenanceMode = await getMaintenanceMode();

  if (maintenanceMode) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center py-24 text-center">
        <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">오픈 준비중입니다</h1>
        <p className="mt-4 text-gray-500">서비스 오픈까지 조금만 기다려 주세요.</p>
      </div>
    );
  }

  return <HomeContent />;
}
