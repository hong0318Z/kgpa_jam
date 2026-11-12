"use client";

import { useState, useTransition } from "react";
import { markInquiryRead } from "@/lib/actions/inquiries";

type Inquiry = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  status: "NEW" | "READ";
  createdAt: string;
};

export function InquiryRow({ inquiry }: { inquiry: Inquiry }) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState(inquiry.status);
  const [pending, startTransition] = useTransition();

  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (next && status === "NEW") {
      startTransition(async () => {
        await markInquiryRead(inquiry.id);
        setStatus("READ");
      });
    }
  };

  return (
    <li className="rounded border border-gray-200 bg-white">
      <button
        type="button"
        onClick={toggle}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <span className="flex min-w-0 items-center gap-2">
          {status === "NEW" && (
            <span className="shrink-0 rounded bg-red-100 px-1.5 py-0.5 text-xs font-medium text-red-700">
              NEW
            </span>
          )}
          <span className="truncate text-sm font-medium text-gray-900">{inquiry.subject}</span>
          <span className="shrink-0 text-xs text-gray-400">· {inquiry.name}</span>
        </span>
        <span className="shrink-0 text-xs text-gray-400">{inquiry.createdAt}</span>
      </button>
      {open && (
        <div className="border-t border-gray-100 px-4 py-3 text-sm">
          <p className="mb-2 text-xs text-gray-500">
            {inquiry.name} · {inquiry.email}
            {inquiry.phone && ` · ${inquiry.phone}`}
            {pending && " · 읽음 처리 중..."}
          </p>
          <p className="whitespace-pre-wrap text-gray-800">{inquiry.message}</p>
          <a
            href={`mailto:${inquiry.email}?subject=${encodeURIComponent("Re: " + inquiry.subject)}`}
            className="mt-3 inline-block text-xs text-blue-600 underline"
          >
            이메일로 답장하기
          </a>
        </div>
      )}
    </li>
  );
}
