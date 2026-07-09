"use client";

import { useState, useTransition } from "react";
import type { Role } from "@/generated/prisma/client";
import {
  changeUserRole,
  toggleUserActive,
  resetPassword,
  bulkChangeRole,
  bulkSetActive,
} from "@/lib/actions/users";
// 가입환영 메일 기능은 학회 메일서버의 TLS 호환 문제로 임시 비활성화.
// src/lib/actions/users.ts의 sendWelcomeEmail, src/lib/mail.ts는 그대로 남겨둠.
import { formatDateTime } from "@/lib/date";
import { GoogleIcon } from "@/components/google-signin-button";

const ROLE_LABELS: Record<string, string> = {
  AUTHOR: "저자",
  REVIEWER: "심사위원",
  EDITOR: "편집위원",
  CHIEF_EDITOR: "편집위원장",
  ADMIN: "관리자",
};

export type UserRow = {
  id: string;
  name: string;
  email: string;
  affiliation: string | null;
  phone: string | null;
  role: Role;
  isActive: boolean;
  createdAt: Date;
  hasPassword: boolean;
};

function UserRoleCell({ user, isAdmin }: { user: UserRow; isAdmin: boolean }) {
  const [role, setRole] = useState<Role>(user.role);
  const [pending, startTransition] = useTransition();

  if (!isAdmin) {
    return <span className="text-xs text-gray-500">{ROLE_LABELS[user.role]}</span>;
  }

  return (
    <div className="flex items-center gap-2">
      <select
        value={role}
        onChange={(e) => setRole(e.target.value as Role)}
        className="rounded border border-gray-300 px-2 py-1 text-xs"
      >
        <option value="AUTHOR">저자</option>
        <option value="REVIEWER">심사위원</option>
        <option value="EDITOR">편집위원</option>
        <option value="CHIEF_EDITOR">편집위원장</option>
        <option value="ADMIN">관리자</option>
      </select>
      <button
        type="button"
        disabled={pending || role === user.role}
        onClick={() => startTransition(() => changeUserRole(user.id, role))}
        className="text-xs text-gray-500 hover:underline disabled:opacity-40"
      >
        변경
      </button>
    </div>
  );
}

export function UsersTable({ users, isAdmin }: { users: UserRow[]; isAdmin: boolean }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkRole, setBulkRole] = useState<Role>("AUTHOR");
  const [pending, startTransition] = useTransition();

  const allSelected = users.length > 0 && selected.size === users.length;

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(users.map((u) => u.id)));
  }
  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function applyBulkRole() {
    if (selected.size === 0) return;
    const ids = [...selected];
    startTransition(async () => {
      await bulkChangeRole(ids, bulkRole);
      setSelected(new Set());
    });
  }
  function applyBulkActive(isActiveValue: boolean) {
    if (selected.size === 0) return;
    const ids = [...selected];
    startTransition(async () => {
      await bulkSetActive(ids, isActiveValue);
      setSelected(new Set());
    });
  }

  return (
    <div>
      {isAdmin && selected.size > 0 && (
        <div className="mb-3 flex flex-wrap items-center gap-2 rounded border border-gray-300 bg-gray-50 px-3 py-2 text-sm">
          <span className="font-medium text-gray-700">{selected.size}명 선택됨</span>
          <select
            value={bulkRole}
            onChange={(e) => setBulkRole(e.target.value as Role)}
            className="rounded border border-gray-300 px-2 py-1 text-xs"
          >
            <option value="AUTHOR">저자</option>
            <option value="REVIEWER">심사위원</option>
            <option value="EDITOR">편집위원</option>
            <option value="CHIEF_EDITOR">편집위원장</option>
            <option value="ADMIN">관리자</option>
          </select>
          <button
            type="button"
            disabled={pending}
            onClick={applyBulkRole}
            className="rounded bg-gray-900 px-2.5 py-1 text-xs font-medium text-white hover:bg-gray-700 disabled:opacity-50"
          >
            역할 일괄 변경
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => applyBulkActive(true)}
            className="rounded border border-gray-300 px-2.5 py-1 text-xs text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            일괄 활성화
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => applyBulkActive(false)}
            className="rounded border border-gray-300 px-2.5 py-1 text-xs text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            일괄 비활성화
          </button>
        </div>
      )}
      <table className="w-full rounded border border-gray-200 bg-white text-sm">
        <thead className="bg-gray-50 text-left text-gray-600">
          <tr>
            {isAdmin && (
              <th className="px-2 py-2">
                <input type="checkbox" checked={allSelected} onChange={toggleAll} />
              </th>
            )}
            <th className="px-4 py-2">이름</th>
            <th className="px-4 py-2">소속</th>
            <th className="px-4 py-2">연락처</th>
            <th className="px-4 py-2">이메일</th>
            <th className="px-4 py-2">가입방식</th>
            <th className="px-4 py-2">역할</th>
            <th className="px-4 py-2">상태</th>
            <th className="px-4 py-2">가입일</th>
            <th className="px-4 py-2">계정 관리</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-t border-gray-200">
              {isAdmin && (
                <td className="px-2 py-2">
                  <input
                    type="checkbox"
                    checked={selected.has(u.id)}
                    onChange={() => toggleOne(u.id)}
                  />
                </td>
              )}
              <td className="px-4 py-2 font-medium text-gray-900">{u.name}</td>
              <td className="px-4 py-2 text-gray-600">{u.affiliation ?? "-"}</td>
              <td className="px-4 py-2 text-gray-600">{u.phone ?? "-"}</td>
              <td className="px-4 py-2 text-gray-600">{u.email}</td>
              <td className="px-4 py-2 text-gray-600">
                {u.hasPassword ? (
                  "이메일"
                ) : (
                  <span className="inline-flex items-center gap-1">
                    <GoogleIcon className="h-3.5 w-3.5" /> Google
                  </span>
                )}
              </td>
              <td className="px-4 py-2">
                <UserRoleCell user={u} isAdmin={isAdmin} />
              </td>
              <td className="px-4 py-2">
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => startTransition(() => toggleUserActive(u.id, !u.isActive))}
                  className="text-xs text-gray-700 hover:underline disabled:opacity-40"
                >
                  {u.isActive ? "활성" : "비활성"}
                </button>
              </td>
              <td className="px-4 py-2 text-xs text-gray-500">{formatDateTime(u.createdAt)}</td>
              <td className="px-4 py-2">
                {isAdmin && u.hasPassword && (
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => startTransition(() => resetPassword(u.id))}
                    className="text-xs text-gray-500 hover:underline disabled:opacity-40"
                  >
                    비밀번호 초기화
                  </button>
                )}
              </td>
            </tr>
          ))}
          {users.length === 0 && (
            <tr>
              <td colSpan={isAdmin ? 10 : 9} className="px-4 py-6 text-center text-gray-500">
                검색 결과가 없습니다.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
