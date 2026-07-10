"use client";

import { useTransition } from "react";
import { startImpersonation } from "@/lib/actions/impersonation";

export function TestAccountSwitcher({ userId, label }: { userId: string; label: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => startTransition(() => startImpersonation(userId))}
      className="rounded border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50"
    >
      {pending ? "전환 중..." : `${label}로 전환`}
    </button>
  );
}
