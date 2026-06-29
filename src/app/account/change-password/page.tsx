import { requireSession } from "@/lib/rbac";
import { ChangePasswordForm } from "../change-password-form";

export default async function ForcedChangePasswordPage() {
  await requireSession();

  return (
    <div className="mx-auto max-w-sm">
      <h1 className="mb-1 text-xl font-bold text-gray-900">비밀번호 변경 필요</h1>
      <p className="mb-6 text-sm text-gray-500">
        비밀번호가 초기화되었습니다. 계속 진행하려면 새 비밀번호로 변경해 주세요.
      </p>
      <ChangePasswordForm />
    </div>
  );
}
