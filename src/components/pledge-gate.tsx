"use client";

import { cloneElement, isValidElement, useState } from "react";
import ReactMarkdown from "react-markdown";
import { PLEDGE_MD } from "@/lib/pledge-content";

export function PledgeGate({ children }: { children: React.ReactNode }) {
  const [agreed, setAgreed] = useState(false);
  const [checked, setChecked] = useState(false);
  const [names, setNames] = useState("");

  if (agreed) {
    return isValidElement(children)
      ? cloneElement(children as React.ReactElement<{ pledgeAuthorNames?: string }>, {
          pledgeAuthorNames: names,
        })
      : children;
  }

  return (
    <div className="rounded border border-gray-200 bg-white p-6">
      <h1 className="mb-1 text-xl font-bold text-gray-900">연구윤리서약서</h1>
      <p className="mb-4 text-sm text-gray-500">
        논문 투고를 계속하려면 아래 서약 내용에 동의해 주세요.
      </p>
      <div className="max-h-96 overflow-y-auto rounded border border-gray-200 p-4 text-sm leading-relaxed text-gray-800 [&_p]:mb-3">
        <ReactMarkdown>{PLEDGE_MD}</ReactMarkdown>
      </div>
      <label className="mt-4 flex items-center gap-2 text-sm font-medium text-gray-900">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => setChecked(e.target.checked)}
        />
        위 사항에 모두 동의합니다.
      </label>
      <div className="mt-4">
        <label className="mb-1 block text-sm font-medium text-gray-700">
          서약 저자명 (공저자 포함 전체 저자, 쉼표로 구분)
        </label>
        <input
          value={names}
          onChange={(e) => setNames(e.target.value)}
          placeholder="예: 홍길동, 김공동, 이공동"
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
        />
      </div>
      <button
        type="button"
        disabled={!checked || !names.trim()}
        onClick={() => setAgreed(true)}
        className="mt-4 w-fit rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
      >
        동의하고 투고 계속하기
      </button>
    </div>
  );
}
