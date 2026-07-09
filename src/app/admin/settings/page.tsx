import { requireRole } from "@/lib/rbac";
import { getMaintenanceMode } from "@/lib/settings";
import { MaintenanceToggle } from "./maintenance-toggle";

export default async function AdminSettingsPage() {
  await requireRole(["ADMIN"]);
  const maintenanceMode = await getMaintenanceMode();

  return (
    <div className="w-full">
      <h1 className="mb-6 text-xl font-bold text-gray-900">사이트 설정</h1>
      <div className="rounded border border-gray-200 bg-white p-6">
        <h2 className="mb-1 text-sm font-semibold text-gray-900">메인 페이지 운영 상태</h2>
        <p className="mb-4 text-sm text-gray-500">
          점검중으로 설정하면 메인 페이지(/)에 &quot;오픈 준비중입니다&quot; 안내만 표시되고 다른
          링크가 노출되지 않습니다. 실제 메인 페이지 내용은 관리자만 아는 <code>/dev</code>{" "}
          경로에서 항상 확인할 수 있습니다.
        </p>
        <MaintenanceToggle maintenanceMode={maintenanceMode} />
      </div>
    </div>
  );
}
