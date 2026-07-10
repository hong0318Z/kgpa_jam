import { prisma } from "@/lib/prisma";
import { requireRole, ADMIN_ROLES } from "@/lib/rbac";
import { UsersTable } from "./users-table";
import { TestAccountSwitcher } from "./test-account-switcher";
import { ROLE_LABELS } from "@/lib/labels";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const session = await requireRole(ADMIN_ROLES);
  const isAdmin = session.user.role === "ADMIN";
  const { q } = await searchParams;
  const query = (q ?? "").trim();

  const testAccounts = isAdmin
    ? await prisma.user.findMany({
        where: { isTestAccount: true },
        orderBy: { createdAt: "asc" },
      })
    : [];

  const users = await prisma.user.findMany({
    where: {
      isTestAccount: false,
      ...(query
        ? {
            OR: [
              { name: { contains: query, mode: "insensitive" } },
              { email: { contains: query, mode: "insensitive" } },
              { affiliation: { contains: query, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
  });

  const rows = users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    affiliation: u.affiliation,
    position: u.position,
    phone: u.phone,
    role: u.role,
    isActive: u.isActive,
    createdAt: u.createdAt,
    hasPassword: !!u.passwordHash,
  }));

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold text-gray-900">사용자 관리</h1>
      {isAdmin && testAccounts.length > 0 && (
        <div className="mb-6 rounded border border-gray-200 bg-gray-50 p-4">
          <h2 className="mb-2 text-sm font-semibold text-gray-900">테스트 계정으로 전환</h2>
          <p className="mb-3 text-xs text-gray-500">
            기능 테스트용 계정입니다. 전환하면 해당 계정으로 화면을 바로 확인할 수 있고, 언제든 관리자 계정으로 복귀할 수 있습니다.
          </p>
          <ul className="flex flex-wrap gap-2">
            {testAccounts.map((t) => (
              <li key={t.id}>
                <TestAccountSwitcher
                  userId={t.id}
                  label={`${t.name} (${ROLE_LABELS[t.role] ?? t.role})`}
                />
              </li>
            ))}
          </ul>
        </div>
      )}
      <form className="mb-4 flex gap-2">
        <input
          type="text"
          name="q"
          defaultValue={query}
          placeholder="이름, 이메일, 소속으로 검색"
          className="w-full max-w-sm rounded border border-gray-300 px-3 py-2 text-sm"
        />
        <button
          type="submit"
          className="rounded border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
        >
          검색
        </button>
        {query && (
          <a
            href="/admin/users"
            className="rounded border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            초기화
          </a>
        )}
      </form>
      <UsersTable users={rows} isAdmin={isAdmin} />
    </div>
  );
}
