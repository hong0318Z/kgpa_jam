import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireRole, ADMIN_ROLES } from "@/lib/rbac";
import { updateVolumeStatus } from "@/lib/actions/volumes";

export default async function AdminVolumesPage() {
  await requireRole(ADMIN_ROLES);
  const volumes = await prisma.volume.findMany({ orderBy: { callStartDate: "desc" } });

  return (
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
      <table className="w-full rounded border border-gray-200 bg-white text-sm">
        <thead className="bg-gray-50 text-left text-gray-600">
          <tr>
            <th className="px-4 py-2">호</th>
            <th className="px-4 py-2">모집기간</th>
            <th className="px-4 py-2">발간예정일</th>
            <th className="px-4 py-2">상태</th>
          </tr>
        </thead>
        <tbody>
          {volumes.map((v) => (
            <tr key={v.id} className="border-t border-gray-200">
              <td className="px-4 py-2 font-medium text-gray-900">{v.label}</td>
              <td className="px-4 py-2 text-gray-600">
                {v.callStartDate.toLocaleDateString("ko-KR")} ~{" "}
                {v.callEndDate.toLocaleDateString("ko-KR")}
              </td>
              <td className="px-4 py-2 text-gray-600">
                {v.plannedPublishDate.toLocaleDateString("ko-KR")}
              </td>
              <td className="px-4 py-2">
                <form
                  action={async (formData) => {
                    "use server";
                    await updateVolumeStatus(
                      v.id,
                      formData.get("status") as "OPEN" | "CLOSED" | "PUBLISHED",
                    );
                  }}
                  className="flex items-center gap-2"
                >
                  <select
                    name="status"
                    defaultValue={v.status}
                    className="rounded border border-gray-300 px-2 py-1 text-sm"
                  >
                    <option value="OPEN">모집중</option>
                    <option value="CLOSED">모집마감</option>
                    <option value="PUBLISHED">발간완료</option>
                  </select>
                  <button type="submit" className="text-xs text-gray-500 hover:underline">
                    변경
                  </button>
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
