"use client";

import { useTransition } from "react";
import { setMailEnabled } from "@/lib/actions/settings";

export function MailToggle({ mailEnabled }: { mailEnabled: boolean }) {
  const [pending, startTransition] = useTransition();

  const choose = (value: boolean) => {
    startTransition(async () => {
      await setMailEnabled(value);
    });
  };

  return (
    <div className="flex gap-2">
      <button
        type="button"
        disabled={pending}
        onClick={() => choose(true)}
        className={`rounded px-4 py-2 text-sm font-medium disabled:opacity-50 ${
          mailEnabled
            ? "bg-green-700 text-white"
            : "border border-gray-300 text-gray-700 hover:bg-gray-50"
        }`}
      >
        메일 발송 켜짐
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={() => choose(false)}
        className={`rounded px-4 py-2 text-sm font-medium disabled:opacity-50 ${
          !mailEnabled
            ? "bg-amber-600 text-white"
            : "border border-gray-300 text-gray-700 hover:bg-gray-50"
        }`}
      >
        메일 발송 끄기
      </button>
      <span className="ml-2 self-center text-xs text-gray-500">
        현재: {mailEnabled ? "켜짐" : "꺼짐 (전부 건너뜀)"}
      </span>
    </div>
  );
}
