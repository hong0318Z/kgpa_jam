import { requireSession } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { ChangePasswordForm } from "./change-password-form";
import { ProfileForm } from "./profile-form";

export default async function AccountPage() {
  const session = await requireSession();
  const user = await prisma.user.findUniqueOrThrow({ where: { id: session.user.id } });

  return (
    <div className="mx-auto max-w-sm">
      <h1 className="mb-1 text-xl font-bold text-gray-900">계정 설정</h1>
      <p className="mb-6 text-sm text-gray-500">{session.user.name} ({session.user.email})</p>

      <h2 className="mb-3 text-sm font-semibold text-gray-900">내 정보</h2>
      <ProfileForm affiliation={user.affiliation ?? ""} position={user.position} phone={user.phone ?? ""} />

      <div className="my-6 h-px bg-gray-200" />

      {user.passwordHash ? (
        <>
          <h2 className="mb-3 text-sm font-semibold text-gray-900">비밀번호 변경</h2>
          <ChangePasswordForm />
        </>
      ) : (
        <p className="text-sm text-gray-500">
          Google 계정으로 로그인 중입니다. 비밀번호는 Google 계정에서 관리됩니다.
        </p>
      )}
    </div>
  );
}
