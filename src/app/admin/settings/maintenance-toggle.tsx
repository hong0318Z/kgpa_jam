"use client";

import { useTransition } from "react";
import { setMaintenanceMode } from "@/lib/actions/settings";

export function MaintenanceToggle({ maintenanceMode }: { maintenanceMode: boolean }) {
  const [pending, startTransition] = useTransition();

  const choose = (value: boolean) => {
    startTransition(async () => {
      await setMaintenanceMode(value);
    });
  };

  return (
    <div className="flex gap-2">
      <button
        type="button"
        disabled={pending}
        onClick={() => choose(true)}
        className={`rounded px-4 py-2 text-sm font-medium disabled:opacity-50 ${
          maintenanceMode
            ? "bg-amber-600 text-white"
            : "border border-gray-300 text-gray-700 hover:bg-gray-50"
        }`}
      >
        서비스 점검중 (비공개)
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={() => choose(false)}
        className={`rounded px-4 py-2 text-sm font-medium disabled:opacity-50 ${
          !maintenanceMode
            ? "bg-green-700 text-white"
            : "border border-gray-300 text-gray-700 hover:bg-gray-50"
        }`}
      >
        운영중 (공개)
      </button>
      <span className="ml-2 self-center text-xs text-gray-500">
        현재: {maintenanceMode ? "점검중" : "운영중"}
      </span>
    </div>
  );
}
