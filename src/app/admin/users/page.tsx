import { prisma } from "@/lib/prisma";
import { requireRole, ADMIN_ROLES } from "@/lib/rbac";
import { UsersTable } from "./users-table";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const session = await requireRole(ADMIN_ROLES);
  const isAdmin = session.user.role === "ADMIN";
  const { q } = await searchParams;
  const query = (q ?? "").trim();

  const users = await prisma.user.findMany({
    where: query
      ? {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { email: { contains: query, mode: "insensitive" } },
            { affiliation: { contains: query, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
  });

  const rows = users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    affiliation: u.affiliation,
    phone: u.phone,
    role: u.role,
    isActive: u.isActive,
    createdAt: u.createdAt,
    hasPassword: !!u.passwordHash,
  }));

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold text-gray-900">사용자 관리</h1>
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
