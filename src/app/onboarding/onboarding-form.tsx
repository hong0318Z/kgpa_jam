"use client";

import { useActionState } from "react";
import { completeProfile } from "@/lib/actions/onboarding";
import { PrivacyConsentBox } from "@/components/privacy-consent-box";

export function OnboardingForm({ defaultName }: { defaultName: string }) {
  const [state, formAction, pending] = useActionState(completeProfile, {});

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">이름</label>
        <input
          name="name"
          required
          defaultValue={defaultName}
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">소속</label>
        <input name="affiliation" required className="w-full rounded border border-gray-300 px-3 py-2 text-sm" />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">연락처</label>
        <input
          name="phone"
          required
          placeholder="010-0000-0000"
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          개인정보 수집 · 이용 동의 (필수)
        </label>
        <PrivacyConsentBox />
        <label className="mt-2 flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" name="privacyConsent" required />
          위 개인정보 수집 · 이용에 동의합니다. (필수)
        </label>
      </div>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
      >
        {pending ? "저장 중..." : "완료하고 계속하기"}
      </button>
    </form>
  );
}
