import { requireRole, ADMIN_ROLES } from "@/lib/rbac";
import { getFeeSettings } from "@/lib/actions/fees";
import { FeeSettingsForm } from "./fee-settings-form";

export default async function FeesAdminPage() {
  await requireRole(ADMIN_ROLES);
  const settings = await getFeeSettings();

  return (
    <div className="w-full max-w-2xl">
      <h1 className="mb-1 text-xl font-bold text-gray-900">심사비 관리</h1>
      <p className="mb-6 text-sm text-gray-500">
        현재는 등재후보지 준비 기간으로 저자에게는 아직 비용이 청구되지 않습니다. 이 화면은 관리자
        설정용이며, 저자·심사위원 화면에는 노출되지 않습니다.
      </p>
      <div className="rounded border border-gray-200 bg-white p-6">
        <FeeSettingsForm settings={settings} />
      </div>
    </div>
  );
}
