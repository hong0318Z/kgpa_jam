"use client";

import { cloneElement, isValidElement, useState } from "react";

export function ConferenceGate({
  infoText,
  children,
}: {
  infoText: string;
  children: React.ReactNode;
}) {
  const [confirmed, setConfirmed] = useState(false);
  const [name, setName] = useState("");

  if (confirmed) {
    return isValidElement(children)
      ? cloneElement(children as React.ReactElement<{ pledgeAuthorNames?: string }>, {
          pledgeAuthorNames: name.trim(),
        })
      : children;
  }

  return (
    <div className="rounded border border-gray-200 bg-white p-6">
      {infoText && (
        <p className="mb-4 whitespace-pre-wrap text-sm text-gray-700">{infoText}</p>
      )}
      <label className="mb-1 block text-sm font-medium text-gray-700">제출자 이름</label>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full max-w-sm rounded border border-gray-300 px-3 py-2 text-sm"
      />
      <div className="mt-4">
        <button
          type="button"
          disabled={!name.trim() || /[0-9]/.test(name)}
          onClick={() => setConfirmed(true)}
          className="rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
        >
          다음
        </button>
      </div>
    </div>
  );
}
