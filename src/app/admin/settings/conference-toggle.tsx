"use client";

import { useTransition } from "react";
import { setConferenceEnabled } from "@/lib/actions/settings";

export function ConferenceToggle({ enabled }: { enabled: boolean }) {
  const [pending, startTransition] = useTransition();

  const choose = (value: boolean) => {
    startTransition(async () => {
      await setConferenceEnabled(value);
    });
  };

  return (
    <div className="flex gap-2">
      <button
        type="button"
        disabled={pending}
        onClick={() => choose(true)}
        className={`rounded px-4 py-2 text-sm font-medium disabled:opacity-50 ${
          enabled
            ? "bg-green-700 text-white"
            : "border border-gray-300 text-gray-700 hover:bg-gray-50"
        }`}
      >
        학술대회 활성화 (공개)
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={() => choose(false)}
        className={`rounded px-4 py-2 text-sm font-medium disabled:opacity-50 ${
          !enabled
            ? "bg-gray-700 text-white"
            : "border border-gray-300 text-gray-700 hover:bg-gray-50"
        }`}
      >
        비활성화 (숨김)
      </button>
      <span className="ml-2 self-center text-xs text-gray-500">
        현재: {enabled ? "활성" : "비활성"}
      </span>
    </div>
  );
}
