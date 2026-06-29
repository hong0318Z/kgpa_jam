import { requireSession } from "@/lib/rbac";
import { ChangePasswordForm } from "./change-password-form";

export default async function AccountPage() {
  const session = await requireSession();

  return (
    <div className="mx-auto max-w-sm">
      <h1 className="mb-1 text-xl font-bold text-gray-900">계정 설정</h1>
      <p className="mb-6 text-sm text-gray-500">{session.user.name} ({session.user.email})</p>
      <h2 className="mb-3 text-sm font-semibold text-gray-900">비밀번호 변경</h2>
      <ChangePasswordForm />
    </div>
  );
}
