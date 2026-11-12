import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireRole, ADMIN_ROLES } from "@/lib/rbac";
import { updateVolumeStatus } from "@/lib/actions/volumes";
import { CompiledVolumeUploadForm } from "./compiled-volume-upload-form";
import { DeleteVolumeButton } from "./delete-volume-button";
import { VolumeDatesForm } from "./volume-dates-form";
import { VolumeMaterialsManager } from "./volume-materials-manager";
import { AdminPosterForm } from "./admin-poster-form";

const STATUS_LABELS = { OPEN: "모집중", CLOSED: "모집마감", PUBLISHED: "발간완료" } as const;

export default async function AdminVolumesPage() {
  await requireRole(ADMIN_ROLES);
  const volumes = await prisma.volume.findMany({
    orderBy: { callStartDate: "desc" },
    include: { materials: { orderBy: { createdAt: "asc" } } },
  });
  const journalVolumes = volumes.filter((v) => v.type === "JOURNAL");
  const conferenceVolumes = volumes.filter((v) => v.type === "CONFERENCE");

  const statusForm = (v: (typeof volumes)[number]) => (
    <form
      action={async (formData) => {
        "use server";
        await updateVolumeStatus(v.id, formData.get("status") as "OPEN" | "CLOSED" | "PUBLISHED");
      }}
      className="flex items-center gap-2"
    >
      <select
        name="status"
        defaultValue={v.status}
        className="rounded border border-gray-300 px-2 py-1 text-sm"
      >
        {Object.entries(STATUS_LABELS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
      <button type="submit" className="text-xs text-gray-500 hover:underline">
        변경
      </button>
    </form>
  );

  return (
    <div className="flex flex-col gap-10">
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">발행 호(Volume) 관리</h1>
          <Link
            href="/admin/volumes/new"
            className="rounded bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-700"
          >
            새 호 등록
          </Link>
        </div>

        <h2 className="mb-2 text-sm font-semibold text-gray-900">학술지</h2>
        <table className="w-full rounded border border-gray-200 bg-white text-sm">
          <thead className="bg-gray-50 text-left text-gray-600">
            <tr>
              <th className="px-4 py-2">호</th>
              <th className="px-4 py-2">모집기간 · 발간예정일</th>
              <th className="px-4 py-2">상태</th>
              <th className="px-4 py-2">학술지 합본 파일</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {journalVolumes.map((v) => (
              <tr key={v.id} className="border-t border-gray-200">
                <td className="px-4 py-2 font-medium text-gray-900">{v.label}</td>
                <td className="px-4 py-2 text-gray-600">
                  <VolumeDatesForm
                    volumeId={v.id}
                    label={v.label}
                    infoText={v.infoText}
                    hasInfoImage={!!v.infoImageStoredPath}
                    type={v.type}
                    conferenceFormats={v.conferenceFormats}
                    callStartDate={v.callStartDate}
                    callEndDate={v.callEndDate}
                    plannedPublishDate={v.plannedPublishDate}
                  />
                </td>
                <td className="px-4 py-2">{statusForm(v)}</td>
                <td className="px-4 py-2">
                  {v.compiledFileOriginalName && (
                    <a
                      href={`/api/volumes/${v.id}/compiled`}
                      className="mb-1 block text-xs text-gray-700 underline"
                    >
                      {v.compiledFileOriginalName}
                    </a>
                  )}
                  <CompiledVolumeUploadForm volumeId={v.id} />
                </td>
                <td className="px-4 py-2">
                  <DeleteVolumeButton volumeId={v.id} label={v.label} />
                </td>
              </tr>
            ))}
            {journalVolumes.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-sm text-gray-500">
                  등록된 학술지 호가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div>
        <h2 className="mb-2 text-sm font-semibold text-gray-900">학술대회</h2>
        {conferenceVolumes.length === 0 ? (
          <p className="rounded border border-gray-200 bg-white px-4 py-6 text-center text-sm text-gray-500">
            등록된 학술대회가 없습니다. &quot;새 호 등록&quot;에서 구분을 학술대회로 선택해 추가해
            주세요.
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {conferenceVolumes.map((v) => (
              <div
                key={v.id}
                className="overflow-hidden rounded-lg border border-indigo-200 bg-white"
              >
                <div className="flex items-center justify-between gap-2 bg-indigo-50 px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-indigo-900">{v.label}</span>
                    <span className="rounded bg-indigo-200 px-1.5 py-0.5 text-xs font-medium text-indigo-800">
                      {STATUS_LABELS[v.status]}
                    </span>
                  </div>
                  <DeleteVolumeButton volumeId={v.id} label={v.label} />
                </div>

                <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2">
                  <div>
                    <p className="mb-1.5 text-xs font-semibold text-gray-700">
                      기본정보 · 기간 · 안내 포스터
                    </p>
                    <VolumeDatesForm
                      volumeId={v.id}
                      label={v.label}
                      infoText={v.infoText}
                      hasInfoImage={!!v.infoImageStoredPath}
                      type={v.type}
                      conferenceFormats={v.conferenceFormats}
                      callStartDate={v.callStartDate}
                      callEndDate={v.callEndDate}
                      plannedPublishDate={v.plannedPublishDate}
                    />
                    <div className="mt-2">{statusForm(v)}</div>
                  </div>

                  <div>
                    <p className="mb-1.5 text-xs font-semibold text-gray-700">발표자료</p>
                    <VolumeMaterialsManager volumeId={v.id} materials={v.materials} />
                  </div>

                  <div className="md:col-span-2">
                    <p className="mb-1.5 text-xs font-semibold text-gray-700">
                      포스터 · 작품 직접 등록 (제출 절차 없이 바로 게재됩니다)
                    </p>
                    <AdminPosterForm
                      volumeId={v.id}
                      formats={v.conferenceFormats.filter(
                        (f): f is "POSTER" | "ARTWORK" => f === "POSTER" || f === "ARTWORK",
                      )}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
