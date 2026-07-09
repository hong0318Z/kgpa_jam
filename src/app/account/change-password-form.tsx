"use client";

import { useState } from "react";
import { useActionState } from "react";
import { changePassword } from "@/lib/actions/account";
import { PasswordInput } from "@/components/password-input";

export function ChangePasswordForm() {
  const [state, formAction, pending] = useActionState(changePassword, {});
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");

  const mismatch = newPasswordConfirm.length > 0 && newPassword !== newPasswordConfirm;

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <PasswordInput name="currentPassword" required label="현재 비밀번호" />
      <PasswordInput
        name="newPassword"
        required
        minLength={8}
        label="새 비밀번호 (8자 이상)"
        value={newPassword}
        onChange={setNewPassword}
      />
      <div>
        <PasswordInput
          name="newPasswordConfirm"
          required
          minLength={8}
          label="새 비밀번호 확인"
          value={newPasswordConfirm}
          onChange={setNewPasswordConfirm}
        />
        {mismatch && <p className="mt-1 text-xs text-red-600">비밀번호가 일치하지 않습니다.</p>}
      </div>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button
        type="submit"
        disabled={pending || mismatch}
        className="rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
      >
        {pending ? "변경 중..." : "비밀번호 변경"}
      </button>
    </form>
  );
}
