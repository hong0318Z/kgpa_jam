import { requireSession } from "@/lib/rbac";
import { OnboardingForm } from "./onboarding-form";

export default async function OnboardingPage() {
  const session = await requireSession();

  return (
    <div className="mx-auto max-w-sm">
      <h1 className="mb-1 text-xl font-bold text-gray-900">추가 정보 입력</h1>
      <p className="mb-6 text-sm text-gray-500">
        {session.user.email} 계정으로 계속하려면 아래 정보를 입력해 주세요.
      </p>
      <OnboardingForm defaultName={session.user.name} />
    </div>
  );
}
