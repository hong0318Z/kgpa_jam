import { prisma } from "@/lib/prisma";
import { requireRole, ADMIN_ROLES } from "@/lib/rbac";
import { changeUserRole, toggleUserActive, resetPassword } from "@/lib/actions/users";

const ROLE_LABELS: Record<string, string> = {
  AUTHOR: "저자",
  REVIEWER: "심사위원",
  EDITOR: "편집위원",
  CHIEF_EDITOR: "편집위원장",
  ADMIN: "관리자",
};

export default async function AdminUsersPage() {
  const session = await requireRole(ADMIN_ROLES);
  const isAdmin = session.user.role === "ADMIN";
  const users = await prisma.user.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold text-gray-900">사용자 관리</h1>
      <table className="w-full rounded border border-gray-200 bg-white text-sm">
        <thead className="bg-gray-50 text-left text-gray-600">
          <tr>
            <th className="px-4 py-2">이름</th>
            <th className="px-4 py-2">소속</th>
            <th className="px-4 py-2">연락처</th>
            <th className="px-4 py-2">이메일</th>
            <th className="px-4 py-2">역할</th>
            <th className="px-4 py-2">상태</th>
            <th className="px-4 py-2">가입일</th>
            <th className="px-4 py-2">계정 관리</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-t border-gray-200">
              <td className="px-4 py-2 font-medium text-gray-900">{u.name}</td>
              <td className="px-4 py-2 text-gray-600">{u.affiliation}</td>
              <td className="px-4 py-2 text-gray-600">{u.phone}</td>
              <td className="px-4 py-2 text-gray-600">{u.email}</td>
              <td className="px-4 py-2">
                {isAdmin ? (
                  <form
                    action={async (formData) => {
                      "use server";
                      await changeUserRole(
                        u.id,
                        formData.get("role") as
                          | "AUTHOR"
                          | "REVIEWER"
                          | "EDITOR"
                          | "CHIEF_EDITOR"
                          | "ADMIN",
                      );
                    }}
                    className="flex items-center gap-2"
                  >
                    <select name="role" defaultValue={u.role} className="rounded border border-gray-300 px-2 py-1 text-xs">
                      <option value="AUTHOR">저자</option>
                      <option value="REVIEWER">심사위원</option>
                      <option value="EDITOR">편집위원</option>
                      <option value="CHIEF_EDITOR">편집위원장</option>
                      <option value="ADMIN">관리자</option>
                    </select>
                    <button type="submit" className="text-xs text-gray-500 hover:underline">
                      변경
                    </button>
                  </form>
                ) : (
                  <span className="text-xs text-gray-500">
                    {ROLE_LABELS[u.role]}
                  </span>
                )}
              </td>
              <td className="px-4 py-2">
                <form
                  action={async () => {
                    "use server";
                    await toggleUserActive(u.id, !u.isActive);
                  }}
                >
                  <button type="submit" className="text-xs text-gray-700 hover:underline">
                    {u.isActive ? "활성" : "비활성"}
                  </button>
                </form>
              </td>
              <td className="px-4 py-2 text-xs text-gray-500">
                {u.createdAt.toLocaleString("ko-KR")}
              </td>
              <td className="px-4 py-2">
                {isAdmin && (
                  <form
                    action={async () => {
                      "use server";
                      await resetPassword(u.id);
                    }}
                  >
                    <button type="submit" className="text-xs text-gray-500 hover:underline">
                      비밀번호 초기화
                    </button>
                  </form>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
