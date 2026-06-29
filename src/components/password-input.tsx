"use client";

import { useId, useState } from "react";

export function PasswordInput({
  name,
  required,
  minLength,
  defaultValue,
  label,
}: {
  name: string;
  required?: boolean;
  minLength?: number;
  defaultValue?: string;
  label?: string;
}) {
  const [visible, setVisible] = useState(false);
  const id = useId();

  return (
    <div>
      {label && (
        <label htmlFor={id} className="mb-1 block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={id}
          name={name}
          type={visible ? "text" : "password"}
          required={required}
          minLength={minLength}
          defaultValue={defaultValue}
          className="w-full rounded border border-gray-300 px-3 py-2 pr-16 text-sm"
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute inset-y-0 right-0 px-3 text-xs text-gray-500 hover:text-gray-800"
        >
          {visible ? "숨기기" : "보이기"}
        </button>
      </div>
    </div>
  );
}
