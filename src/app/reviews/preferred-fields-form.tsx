"use client";

import { useState, useTransition } from "react";
import { updatePreferredFields } from "@/lib/actions/account";
import { SUBMISSION_FIELDS } from "@/lib/labels";

export function PreferredFieldsForm({ initialFields }: { initialFields: string[] }) {
  const [fields, setFields] = useState<Set<string>>(new Set(initialFields));
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  function toggle(value: string) {
    setFields((prev) => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
    setSaved(false);
  }

  function save() {
    startTransition(async () => {
      await updatePreferredFields([...fields]);
      setSaved(true);
    });
  }

  return (
    <div>
      <div className="flex flex-col gap-1">
        {SUBMISSION_FIELDS.map((f) => (
          <label key={f.value} className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" checked={fields.has(f.value)} onChange={() => toggle(f.value)} />
            {f.label}
          </label>
        ))}
      </div>
      <button
        type="button"
        disabled={pending}
        onClick={save}
        className="mt-2 rounded bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
      >
        {pending ? "저장 중..." : "저장"}
      </button>
      {saved && <span className="ml-2 text-xs text-green-600">저장되었습니다</span>}
    </div>
  );
}
