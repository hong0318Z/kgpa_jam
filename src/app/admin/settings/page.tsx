import { requireRole } from "@/lib/rbac";
import { getMaintenanceMode, getOgSettings } from "@/lib/settings";
import { MaintenanceToggle } from "./maintenance-toggle";
import { OgSettingsForm } from "./og-settings-form";

export default async function AdminSettingsPage() {
  await requireRole(["ADMIN"]);
  const maintenanceMode = await getMaintenanceMode();
  const og = await getOgSettings();

  return (
    <div className="w-full max-w-2xl">
      <h1 className="mb-6 text-xl font-bold text-gray-900">사이트 설정</h1>
      <div className="mb-6 rounded border border-gray-200 bg-white p-6">
        <h2 className="mb-1 text-sm font-semibold text-gray-900">메인 페이지 운영 상태</h2>
        <p className="mb-4 text-sm text-gray-500">
          점검중으로 설정하면 메인 페이지(/)에 &quot;오픈 준비중입니다&quot; 안내만 표시되고 다른
          링크가 노출되지 않습니다. 실제 메인 페이지 내용은 관리자만 아는 <code>/dev</code>{" "}
          경로에서 항상 확인할 수 있습니다.
        </p>
        <MaintenanceToggle maintenanceMode={maintenanceMode} />
      </div>

      <div className="rounded border border-gray-200 bg-white p-6">
        <h2 className="mb-1 text-sm font-semibold text-gray-900">
          링크 공유 미리보기 설정 (카카오톡 · 메신저 등)
        </h2>
        <p className="mb-4 text-sm text-gray-500">
          카카오톡, 문자, SNS 등에 사이트 링크를 붙여넣었을 때 보이는 제목 · 설명 · 이미지를
          설정합니다. 예를 들어 창간호 논문 모집 기간에는 모집 안내 이미지와 문구로 바꿔두시면
          됩니다. 비워두면 기본 제목 · 설명이 사용됩니다.
        </p>
        <OgSettingsForm
          ogTitle={og.ogTitle}
          ogDescription={og.ogDescription}
          hasImage={!!og.ogImageStoredPath}
        />
      </div>
    </div>
  );
}
